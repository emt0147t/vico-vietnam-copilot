/**
 * News Ingest Service - Batch operations for news persistence
 * 
 * Features:
 * - Batch insert with createMany + skipDuplicates
 * - Transaction support for atomic operations
 * - Deduplication by URL
 * - Company denormalized field updates
 * - Ingest run logging
 */

import { z } from 'zod';
import { safeExternalCall, batchProcess, ExternalApiError } from '../utils/external';
import { getCompanyNews, NewsItem } from './newsService';

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

const newsItemSchema = z.object({
  companyId: z.string(),
  title: z.string().min(1).max(500),
  url: z.string().url(),
  source: z.string().optional(),
  publishedAt: z.coerce.date(),
  content: z.string().optional(),
  summary: z.string().optional(),
  sentiment: z.number().min(-1).max(1).optional(),
  category: z.enum(['finance', 'm&a', 'product', 'legal', 'leadership', 'partnership', 'general']).optional(),
  isBreaking: z.boolean().default(false),
  type: z.enum(['live', 'mock', 'enriched']).default('live'),
  language: z.string().max(8).optional(),
  imageUrl: z.string().url().optional(),
  author: z.string().optional(),
});

export type IngestNewsItem = z.infer<typeof newsItemSchema>;

export interface IngestResult {
  inserted: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export interface IngestRunRecord {
  id: string;
  provider: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  companyId?: string;
  companyName?: string;
  itemsFound: number;
  itemsInserted: number;
  itemsSkipped: number;
  itemsFailed: number;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}

// ============================================================================
// MOCK PRISMA CLIENT (Replace with real Prisma import in production)
// ============================================================================

// In production, import from '../lib/db':
// import { prisma } from '../lib/db';

// For now, we'll create a mock that simulates Prisma operations
const mockPrisma = {
  news: {
    createMany: async (args: { data: IngestNewsItem[]; skipDuplicates?: boolean }) => {
      console.log(`[Mock] Creating ${args.data.length} news items (skipDuplicates: ${args.skipDuplicates})`);
      // Simulate some duplicates being skipped
      const inserted = Math.floor(args.data.length * 0.8);
      return { count: inserted };
    },
    findMany: async (args: { where: { companyId: string }; orderBy: { publishedAt: 'desc' }; take: number }) => {
      console.log(`[Mock] Finding news for company ${args.where.companyId}`);
      return [];
    },
  },
  company: {
    update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
      console.log(`[Mock] Updating company ${args.where.id}:`, args.data);
      return { id: args.where.id, ...args.data };
    },
  },
  ingestRun: {
    create: async (args: { data: Partial<IngestRunRecord> }) => {
      console.log(`[Mock] Creating ingest run:`, args.data);
      return { id: 'mock-run-id', ...args.data };
    },
    update: async (args: { where: { id: string }; data: Partial<IngestRunRecord> }) => {
      console.log(`[Mock] Updating ingest run ${args.where.id}:`, args.data);
      return { id: args.where.id, ...args.data };
    },
  },
  $transaction: async <T>(fn: (tx: typeof mockPrisma) => Promise<T>): Promise<T> => {
    console.log('[Mock] Starting transaction');
    const result = await fn(mockPrisma);
    console.log('[Mock] Committing transaction');
    return result;
  },
};

// Use mock for now - replace with real prisma in production
const prisma = mockPrisma;

// ============================================================================
// BATCH INSERT
// ============================================================================

/**
 * Insert news items in batch with deduplication
 * Uses createMany + skipDuplicates for efficiency
 * 
 * @param items - Array of news items to insert
 * @returns Insert result with counts
 */
export async function ingestNewsBatch(items: IngestNewsItem[]): Promise<IngestResult> {
  if (!items.length) {
    return { inserted: 0, skipped: 0, failed: 0, errors: [] };
  }

  const errors: string[] = [];
  const validated: IngestNewsItem[] = [];

  // Validate each item
  for (const item of items) {
    try {
      validated.push(newsItemSchema.parse(item));
    } catch (err) {
      errors.push(`Validation failed for "${item.title?.substring(0, 50)}...": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Deduplicate in-memory by URL before hitting DB
  const uniqueByUrl = Array.from(
    new Map(validated.map(item => [item.url, item])).values()
  );

  // Insert in chunks to avoid parameter limits (Postgres max ~32k params)
  const chunkSize = 100;
  let totalInserted = 0;
  let totalSkipped = 0;

  for (let i = 0; i < uniqueByUrl.length; i += chunkSize) {
    const chunk = uniqueByUrl.slice(i, i + chunkSize);
    
    try {
      const result = await prisma.news.createMany({
        data: chunk,
        skipDuplicates: true, // Relies on unique(url) constraint
      });
      
      totalInserted += result.count;
      totalSkipped += chunk.length - result.count;
    } catch (err) {
      errors.push(`Batch insert failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    inserted: totalInserted,
    skipped: totalSkipped + (items.length - validated.length),
    failed: items.length - validated.length,
    errors,
  };
}

// ============================================================================
// TRANSACTION: INSERT + UPDATE COMPANY
// ============================================================================

/**
 * Insert news and update company denormalized fields atomically
 * Ensures data consistency using a transaction
 * 
 * @param companyId - Company to update
 * @param items - News items to insert
 * @returns Insert result
 */
export async function ingestNewsWithCompanyUpdate(
  companyId: string,
  items: IngestNewsItem[]
): Promise<IngestResult> {
  if (!items.length) {
    return { inserted: 0, skipped: 0, failed: 0, errors: [] };
  }

  // Prepare items with companyId
  const preparedItems = items.map(item => ({
    ...item,
    companyId,
  }));

  return await prisma.$transaction(async (tx) => {
    // 1. Insert news
    const result = await ingestNewsBatch(preparedItems);

    // 2. Calculate aggregates for company update
    const recentNews = await tx.news.findMany({
      where: { companyId },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });

    if (recentNews.length > 0) {
      // Calculate average sentiment
      const sentiments = recentNews
        .map((n: { sentiment?: number | null }) => n.sentiment)
        .filter((s): s is number => s !== null && s !== undefined);
      
      const avgSentiment = sentiments.length > 0
        ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
        : null;

      // Get latest news info
      const latest = recentNews[0] as { publishedAt: Date; title: string };

      // 3. Update company denormalized fields
      await tx.company.update({
        where: { id: companyId },
        data: {
          latestNewsSentiment: avgSentiment,
          latestNewsAt: latest.publishedAt,
          headlineSnapshot: latest.title?.substring(0, 280),
          newsCount: { increment: result.inserted },
        },
      });
    }

    return result;
  });
}

// ============================================================================
// FULL INGEST PIPELINE
// ============================================================================

export interface IngestOptions {
  provider?: string;
  maxRetries?: number;
  concurrency?: number;
  onProgress?: (completed: number, total: number, companyName: string) => void;
}

/**
 * Full news ingestion pipeline for a single company
 * Fetches from external source, validates, inserts, and updates company
 * 
 * @param companyId - Company ID in database
 * @param companyName - Company name for search query
 * @param options - Ingest options
 * @returns Ingest run record
 */
export async function runNewsIngest(
  companyId: string,
  companyName: string,
  options: IngestOptions = {}
): Promise<IngestRunRecord> {
  const { provider = 'google_news', maxRetries = 3 } = options;
  const startedAt = new Date();

  // Create ingest run record
  const run = await prisma.ingestRun.create({
    data: {
      provider,
      status: 'running',
      companyId,
      companyName,
      startedAt,
      itemsFound: 0,
      itemsInserted: 0,
      itemsSkipped: 0,
      itemsFailed: 0,
    },
  }) as IngestRunRecord;

  try {
    // 1. Fetch news from external source with retry logic
    const rawNews = await safeExternalCall<NewsItem[]>(
      provider,
      () => getCompanyNews(companyName),
      { retries: maxRetries }
    );

    // 2. Transform to ingest format
    const ingestItems: IngestNewsItem[] = rawNews.map(news => ({
      companyId,
      title: news.title,
      url: news.link,
      source: news.source || provider,
      publishedAt: new Date(news.pubDate),
      content: news.content,
      summary: news.content?.substring(0, 500),
      type: 'live' as const,
    }));

    // 3. Ingest with company update
    const result = await ingestNewsWithCompanyUpdate(companyId, ingestItems);

    // 4. Update run record with success
    const completedAt = new Date();
    const updatedRun = await prisma.ingestRun.update({
      where: { id: run.id },
      data: {
        status: 'completed',
        itemsFound: rawNews.length,
        itemsInserted: result.inserted,
        itemsSkipped: result.skipped,
        itemsFailed: result.failed,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : undefined,
      },
    }) as IngestRunRecord;

    console.log(`✅ Ingest completed for ${companyName}: ${result.inserted} inserted, ${result.skipped} skipped`);
    return updatedRun;

  } catch (error) {
    // Update run record with failure
    const completedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : String(error);

    const failedRun = await prisma.ingestRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
      },
    }) as IngestRunRecord;

    console.error(`❌ Ingest failed for ${companyName}:`, errorMessage);
    return failedRun;
  }
}

/**
 * Batch ingest for multiple companies with concurrency control
 * 
 * @param companies - Array of { id, name } to ingest
 * @param options - Ingest options including concurrency
 * @returns Array of ingest run records
 */
export async function runBatchNewsIngest(
  companies: Array<{ id: string; name: string }>,
  options: IngestOptions = {}
): Promise<IngestRunRecord[]> {
  const { concurrency = 4, onProgress } = options;

  console.log(`📰 Starting batch ingest for ${companies.length} companies (concurrency: ${concurrency})`);

  const results = await batchProcess(
    companies,
    async (company, index) => {
      const result = await runNewsIngest(company.id, company.name, options);
      
      if (onProgress) {
        onProgress(index + 1, companies.length, company.name);
      }

      // Add small delay between companies to be respectful to APIs
      await new Promise(r => setTimeout(r, 200));
      
      return result;
    },
    { concurrency }
  );

  const summary = {
    total: results.length,
    completed: results.filter(r => r.status === 'completed').length,
    failed: results.filter(r => r.status === 'failed').length,
    totalInserted: results.reduce((sum, r) => sum + r.itemsInserted, 0),
  };

  console.log(`📊 Batch ingest complete:`, summary);

  return results;
}

// ============================================================================
// SENTIMENT ANALYSIS HELPERS
// ============================================================================

/**
 * Analyze sentiment from news text using keyword matching
 * In production, replace with AI-based sentiment analysis
 */
export function analyzeSentiment(text: string): number {
  const positiveKeywords = [
    'tăng trưởng', 'lợi nhuận', 'thành công', 'đột phá', 'hợp tác',
    'growth', 'profit', 'success', 'breakthrough', 'partnership',
    'kỷ lục', 'mở rộng', 'đầu tư', 'record', 'expansion', 'investment',
  ];

  const negativeKeywords = [
    'giảm', 'thua lỗ', 'thất bại', 'khủng hoảng', 'cắt giảm',
    'decline', 'loss', 'failure', 'crisis', 'layoff',
    'điều tra', 'phạt', 'scandal', 'investigation', 'penalty',
  ];

  const lowerText = text.toLowerCase();
  
  let score = 0;
  for (const keyword of positiveKeywords) {
    if (lowerText.includes(keyword)) score += 0.15;
  }
  for (const keyword of negativeKeywords) {
    if (lowerText.includes(keyword)) score -= 0.15;
  }

  // Clamp to [-1, 1]
  return Math.max(-1, Math.min(1, score));
}

/**
 * Categorize news based on content keywords
 */
export function categorizeNews(title: string, content?: string): string {
  const text = `${title} ${content || ''}`.toLowerCase();

  const categories: Record<string, string[]> = {
    finance: ['revenue', 'profit', 'earnings', 'stock', 'doanh thu', 'lợi nhuận', 'cổ phiếu', 'IPO'],
    'm&a': ['acquisition', 'merger', 'buyout', 'mua lại', 'sáp nhập', 'thâu tóm'],
    product: ['launch', 'release', 'product', 'feature', 'ra mắt', 'sản phẩm', 'tính năng'],
    legal: ['lawsuit', 'court', 'regulation', 'compliance', 'kiện', 'tòa án', 'quy định'],
    leadership: ['CEO', 'executive', 'appoint', 'resign', 'bổ nhiệm', 'từ chức', 'giám đốc'],
    partnership: ['partner', 'collaboration', 'alliance', 'hợp tác', 'liên minh', 'đối tác'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'general';
}
