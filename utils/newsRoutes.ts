/**
 * News Routes Integration Guide
 * Add these routes to your Express server.ts
 */

import { Request, Response } from 'express';
import { NewsDB, initializeNewsDB, importNewsToDatabase } from './utils/newsDatabase';
import { NewsEnrichmentService } from './services/newsEnrichmentService';
import { loadNewsFromCSV } from './utils/newsLoader';
import { COMPANIES } from './data/companies';

/**
 * Initialize news database on server startup
 * Add to server.ts: initializeNewsDB().catch(console.error);
 */
export async function initializeNewsRoutes() {
    try {
        await initializeNewsDB();
        console.log('✅ News database initialized');
    } catch (error) {
        console.error('⚠️ News database initialization warning:', error);
        // Continue even if news DB fails
    }
}

/**
 * NEWS API ROUTES
 * Add these to your Express app in server.ts
 */

/**
 * POST /api/news/search
 * Search news by company, signal, sentiment, or embedding
 */
export const searchNewsRoute = async (req: Request, res: Response) => {
    try {
        const { type, query, limit = 10, minSimilarity = 0.5 } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'Missing search type' });
        }

        let results: any[] = [];

        switch (type) {
            case 'company':
                if (!query) throw new Error('Company name required');
                results = await NewsDB.searchNewsByCompany(query);
                break;

            case 'signal':
                if (!query) throw new Error('Signal type required');
                results = await NewsDB.searchNewsBySignal(query);
                break;

            case 'sentiment':
                if (!query) throw new Error('Sentiment type required');
                results = await NewsDB.searchBySentiment(query);
                break;

            case 'embedding':
                const embedding = query;
                if (!Array.isArray(embedding)) {
                    throw new Error('Embedding array required');
                }
                const searchResults = await NewsDB.searchByEmbedding(
                    embedding,
                    limit,
                    minSimilarity
                );
                results = searchResults.map((sr) => ({
                    ...sr.newsItem,
                    similarity: sr.similarity,
                }));
                break;

            case 'all':
                results = await NewsDB.getAllNews(limit);
                break;

            default:
                throw new Error(`Unknown search type: ${type}`);
        }

        res.json({
            success: true,
            count: results.length,
            results: results.slice(0, limit),
        });
    } catch (error: any) {
        console.error('News search error:', error);
        res.status(500).json({ error: error.message || 'Search failed' });
    }
};

/**
 * POST /api/news/import
 * Import news from CSV and enrich with AI
 */
export const importNewsRoute = async (req: Request, res: Response) => {
    try {
        const { maxRows = 5000, startRow = 0 } = req.body;

        console.log(`📰 Starting news import: max=${maxRows}, start=${startRow}`);

        const existingCount = await NewsDB.getNewsCount();
        console.log(`   Existing articles: ${existingCount}`);

        // Load news from CSV
        const newsItems = await loadNewsFromCSV({
            maxRows,
            startRow,
        });

        console.log(`✅ Loaded ${newsItems.length} articles`);

        // Get company names for entity linking
        const knownCompanies = COMPANIES.map((c) => c.name);

        // Enrich with AI features
        const enrichedNews = await NewsEnrichmentService.enrichNewsBatch(
            newsItems,
            knownCompanies,
            3,
            (current, total) => {
                console.log(
                    `🤖 Enriching: ${current}/${total} (${Math.round((current / total) * 100)}%)`
                );
            }
        );

        console.log(`✅ Enriched ${enrichedNews.length} articles`);

        // Save to database
        const imported = await importNewsToDatabase(enrichedNews);
        const newTotal = await NewsDB.getNewsCount();

        console.log(`✅ Imported ${imported} articles (Total: ${newTotal})`);

        res.json({
            success: true,
            imported,
            newTotal,
            message: `Imported ${imported} articles (Total: ${newTotal})`,
        });
    } catch (error: any) {
        console.error('News import error:', error);
        res.status(500).json({ error: error.message || 'Import failed' });
    }
};

/**
 * GET /api/news/stats
 * Get news statistics and signal distribution
 */
export const newsStatsRoute = async (req: Request, res: Response) => {
    try {
        const count = await NewsDB.getNewsCount();
        const signalDist = await NewsDB.getSignalDistribution();

        // Get sentiment distribution
        const sentimentDist: Record<string, number> = {};
        const sentiments = ['positive', 'negative', 'neutral'];

        for (const sentiment of sentiments) {
            const results = await NewsDB.searchBySentiment(sentiment as any);
            sentimentDist[sentiment] = results.length;
        }

        res.set('Cache-Control', 'public, max-age=300'); // 5min cache
        res.json({
            success: true,
            stats: {
                totalNews: count,
                signals: signalDist,
                sentiments: sentimentDist,
                lastUpdated: new Date(),
            },
        });
    } catch (error: any) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message || 'Stats retrieval failed' });
    }
};

/**
 * GET /api/news/company/:name
 * Get news for a specific company
 */
export const getCompanyNewsRoute = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { limit = 20 } = req.query;

        const news = await NewsDB.searchNewsByCompany(name);

        res.set('Cache-Control', 'public, max-age=300');
        res.json({
            success: true,
            company: name,
            count: news.length,
            news: news.slice(0, parseInt(limit as string)),
        });
    } catch (error: any) {
        console.error('Company news error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch company news' });
    }
};

/**
 * GET /api/news/signal/:type
 * Get all news with a specific signal type
 */
export const getSignalNewsRoute = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const { limit = 50 } = req.query;

        const news = await NewsDB.searchNewsBySignal(type as any);

        res.set('Cache-Control', 'public, max-age=600');
        res.json({
            success: true,
            signal: type,
            count: news.length,
            news: news.slice(0, parseInt(limit as string)),
        });
    } catch (error: any) {
        console.error('Signal news error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch signal news' });
    }
};

/**
 * INTEGRATION EXAMPLE for server.ts
 * Add this code to your Express server setup:
 */

export function setupNewsRoutes(app: any) {
    // Initialize news DB
    initializeNewsRoutes();

    // Routes
    app.post('/api/news/search', searchNewsRoute);
    app.post('/api/news/import', importNewsRoute);
    app.get('/api/news/stats', newsStatsRoute);
    app.get('/api/news/company/:name', getCompanyNewsRoute);
    app.get('/api/news/signal/:type', getSignalNewsRoute);

    console.log('✅ News routes registered');
}

/**
 * USAGE IN server.ts:
 *
 * import { setupNewsRoutes } from './utils/newsRoutes';
 * 
 * // After creating Express app
 * const app = express();
 * 
 * // ... existing setup ...
 * 
 * // Add news routes
 * setupNewsRoutes(app);
 * 
 * // Start server
 * app.listen(3001, () => {
 *   console.log('Server running on port 3001');
 * });
 */
