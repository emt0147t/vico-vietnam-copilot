import { Router, Request, Response } from 'express';
import {
    enrichAllCsvCompanies,
    loadEnrichedCompanies,
    getSimilarCompanies,
    searchEnrichedCompanies,
} from '../../../utils/enrichCsvCompanies';

const router = Router();

/**
 * POST /api/enrich - Trigger CSV companies enrichment
 * This will:
 * 1. Load all 10,000+ companies from CSV
 * 2. Generate Vietnamese embeddings for each company
 * 3. Calculate similar competitors based on semantic similarity
 * 4. Cache results for fast retrieval
 */
router.post('/enrich', async (req: Request, res: Response) => {
    try {
        console.log('🚀 Enrichment request received');
        res.json({
            status: 'processing',
            message: 'CSV companies enrichment started. Check backend logs for progress.',
            info: 'This process may take 10-20 minutes for 10,000+ companies.'
        });

        // Run enrichment in background
        enrichAllCsvCompanies()
            .then(() => {
                console.log('✅ CSV enrichment completed successfully!');
            })
            .catch((error) => {
                console.error('❌ CSV enrichment failed:', error);
            });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to start enrichment' });
    }
});

/**
 * GET /api/enrich/status - Check enrichment status
 */
router.get('/enrich/status', async (req: Request, res: Response) => {
    try {
        const enrichedCompanies = loadEnrichedCompanies();
        res.json({
            status: 'complete',
            totalEnriched: enrichedCompanies.length,
            message: `${enrichedCompanies.length} companies enriched with embeddings and competitors`,
        });
    } catch (error) {
        res.json({
            status: 'not_started',
            totalEnriched: 0,
            message: 'Enrichment has not been completed yet. POST to /api/enrich to start.',
        });
    }
});

/**
 * GET /api/enrich/search?q=query - Search enriched companies semantically
 */
router.get('/enrich/search', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        const limit = parseInt(req.query.limit as string) || 20;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query parameter required' });
        }

        console.log(`🔍 Searching enriched companies for: "${query}"`);
        const results = await searchEnrichedCompanies(query, limit);

        res.json({
            query,
            count: results.length,
            results: results.map(r => ({
                name: r.name,
                industry: r.industry,
                intro: r.intro?.substring(0, 100) + '...',
                strategicContext: r.strategicContext?.substring(0, 150) + '...',
                similarity: (r.similarity * 100).toFixed(1) + '%',
                competitorCount: r.similarCompetitors?.length || 0,
            })),
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * GET /api/enrich/company/:name - Get enriched company with competitors
 */
router.get('/enrich/company/:name', async (req: Request, res: Response) => {
    try {
        const companyName = req.params.name;
        const enrichedCompanies = loadEnrichedCompanies();
        const company = enrichedCompanies.find(c =>
            c.name.toLowerCase().includes(companyName.toLowerCase())
        );

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json({
            company: {
                name: company.name,
                industry: company.industry,
                intro: company.intro,
                products: company.products,
                strategicContext: company.strategicContext,
            },
            competitors: company.similarCompetitors?.map(comp => {
                const fullComp = enrichedCompanies.find(c => c.name === comp.name);
                return {
                    name: comp.name,
                    industry: comp.industry,
                    similarity: (comp.similarity * 100).toFixed(1) + '%',
                    products: fullComp?.products?.substring(0, 100) + '...',
                };
            }) || [],
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get company' });
    }
});

export default router;
