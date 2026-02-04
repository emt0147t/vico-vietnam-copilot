/**
 * MongoDB News Database Service
 * Handles storage, retrieval, and vector search for news
 */

import { MongoClient, Db, Collection, Filter } from "mongodb";
import {
  NewsItem,
  NewsDatabase,
  SignalType,
  SentimentType,
  SearchResult,
} from "../data/newsModels";
import { cosineSimilarity } from "./vectorUtils";

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let newsCollection: Collection<NewsItem> | null = null;

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "vico_intelligence";
const COLLECTION_NAME = "news";

/**
 * Initialize MongoDB connection
 */
export async function initializeNewsDB(): Promise<void> {
  if (db) return; // Already initialized

  try {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    newsCollection = db.collection<NewsItem>(COLLECTION_NAME);

    // Create indexes for faster queries
    await newsCollection.createIndex({ id: 1 }, { unique: true });
    await newsCollection.createIndex({ link: 1 }, { unique: true });
    await newsCollection.createIndex({ title: "text", content: "text" });
    await newsCollection.createIndex({ signals: 1 });
    await newsCollection.createIndex({ sentiment: 1 });
    await newsCollection.createIndex({ "mentionedCompanies.companyId": 1 });
    await newsCollection.createIndex({ fetchedDate: -1 });
    await newsCollection.createIndex({ processedAt: -1 });

    console.log("✅ MongoDB news database initialized");
  } catch (error) {
    console.error("❌ Failed to initialize MongoDB:", error);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeNewsDB(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    db = null;
    newsCollection = null;
  }
}

/**
 * Ensure collection is initialized
 */
function ensureCollection(): Collection<NewsItem> {
  if (!newsCollection) {
    throw new Error(
      "News database not initialized. Call initializeNewsDB() first."
    );
  }
  return newsCollection;
}

/**
 * MongoDB News Database implementation
 */
export const NewsDB: NewsDatabase = {
  // ===== DIRECT LOOKUPS =====

  async getNewsById(id: string): Promise<NewsItem | null> {
    const collection = ensureCollection();
    return collection.findOne({ id } as Filter<NewsItem>);
  },

  async getNewsByLink(link: string): Promise<NewsItem | null> {
    const collection = ensureCollection();
    return collection.findOne({ link } as Filter<NewsItem>);
  },

  // ===== SEARCHING =====

  async searchNewsByCompany(companyName: string): Promise<NewsItem[]> {
    const collection = ensureCollection();
    return collection
      .find({
        "mentionedCompanies.companyName": {
          $regex: companyName,
          $options: "i",
        },
      } as Filter<NewsItem>)
      .sort({ fetchedDate: -1 })
      .limit(100)
      .toArray();
  },

  async searchNewsBySignal(signal: SignalType): Promise<NewsItem[]> {
    const collection = ensureCollection();
    return collection
      .find({ signals: signal } as Filter<NewsItem>)
      .sort({ fetchedDate: -1 })
      .limit(100)
      .toArray();
  },

  async searchBySentiment(sentiment: SentimentType): Promise<NewsItem[]> {
    const collection = ensureCollection();
    return collection
      .find({ sentiment } as Filter<NewsItem>)
      .sort({ fetchedDate: -1 })
      .limit(100)
      .toArray();
  },

  // ===== VECTOR SEARCH =====

  async searchByEmbedding(
    embedding: number[],
    limit: number = 10,
    minSimilarity: number = 0.5
  ): Promise<SearchResult[]> {
    const collection = ensureCollection();

    // Get all news with embeddings
    const newsWithEmbeddings = await collection
      .find({ embedding: { $exists: true } } as Filter<NewsItem>)
      .toArray();

    if (newsWithEmbeddings.length === 0) {
      return [];
    }

    // Calculate similarities
    const results: SearchResult[] = newsWithEmbeddings
      .map((news, index) => ({
        newsItem: news,
        similarity: news.embedding
          ? cosineSimilarity(embedding, news.embedding)
          : 0,
        rank: index,
      }))
      .filter((r) => r.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  },

  // ===== BULK OPERATIONS =====

  async saveNews(news: NewsItem): Promise<void> {
    const collection = ensureCollection();

    // Check if already exists
    const existing = await collection.findOne({ id: news.id } as Filter<NewsItem>);

    if (existing) {
      // Update existing
      await collection.updateOne(
        { id: news.id } as Filter<NewsItem>,
        { $set: news }
      );
    } else {
      // Insert new
      await collection.insertOne(news as any);
    }
  },

  async saveMultipleNews(news: NewsItem[]): Promise<void> {
    const collection = ensureCollection();

    const operations = news.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: { $set: item },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await (collection as any).bulkWrite(operations);
    }
  },

  async getAllNews(limit: number = 1000, offset: number = 0): Promise<NewsItem[]> {
    const collection = ensureCollection();
    return collection
      .find({} as Filter<NewsItem>)
      .sort({ fetchedDate: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  },

  // ===== STATISTICS =====

  async getNewsCount(): Promise<number> {
    const collection = ensureCollection();
    return collection.countDocuments();
  },

  async getSignalDistribution(): Promise<Record<SignalType, number>> {
    const collection = ensureCollection();

    const pipeline = [
      { $unwind: "$signals" },
      { $group: { _id: "$signals", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const distribution: Record<SignalType, number> = {} as any;
    for (const signal of Object.values(SignalType)) {
      distribution[signal] = 0;
    }

    results.forEach((r: any) => {
      if (r._id in distribution) {
        distribution[r._id as SignalType] = r.count;
      }
    });

    return distribution;
  },
};

/**
 * Utility: Import news from array to database
 */
export async function importNewsToDatabase(
  newsItems: NewsItem[]
): Promise<number> {
  await initializeNewsDB();

  const collection = ensureCollection();
  
  // Drop collection to avoid duplicate key errors
  try {
    await collection.deleteMany({});
    console.log("📝 Cleared existing news data");
  } catch (err) {
    console.log("📝 Starting fresh import");
  }

  const batchSize = 1000;
  let imported = 0;

  for (let i = 0; i < newsItems.length; i += batchSize) {
    const batch = newsItems.slice(i, i + batchSize);

    // Use insertMany instead of bulkWrite to avoid upsert issues
    try {
      await collection.insertMany(batch, { ordered: false });
      imported += batch.length;
      console.log(`📝 Imported ${imported}/${newsItems.length} news items`);
    } catch (error: any) {
      // Handle duplicate key errors by inserting individually
      if (error.code === 11000) {
        for (const item of batch) {
          try {
            await collection.insertOne(item);
            imported++;
          } catch (e) {
            // Skip duplicates
          }
        }
        console.log(`📝 Imported ${imported}/${newsItems.length} news items (with duplicate handling)`);
      } else {
        throw error;
      }
    }
  }

  return imported;
}

/**
 * Utility: Export news from database
 */
export async function exportNewsFromDatabase(
  limit?: number
): Promise<NewsItem[]> {
  await initializeNewsDB();
  return NewsDB.getAllNews(limit || 10000);
}
