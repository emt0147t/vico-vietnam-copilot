import { PrismaClient } from '@prisma/client';

// Lazy-init Prisma to prevent crash if DB is unreachable at startup
let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
    if (!_prisma) _prisma = new PrismaClient();
    return _prisma;
}

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename_esm = fileURLToPath(import.meta.url);
const __dirname_esm = path.dirname(__filename_esm);
import { clerkMiddleware } from '@clerk/express';
import { initializeCompanies, getAllCompanies, searchCompanies, getCompaniesByIndustry } from './utils/companyLoader';
import { seedVectorDatabase, loadVectorsFromCache } from './utils/vectorSeeder';
// REMOVED: import { COMPANIES } from './data/companies'; — was only used by old fake GTM endpoint
import Parser from 'rss-parser';
import { findTopCompetitors } from './services/competitorEngine';
import { generateMarketIntelligence } from './services/marketIntelligenceService';
import { generateCompetitorIntelligence } from './services/competitorIntelligenceService';
import MarketIndustryAnalytics from './services/marketIndustryAnalytics';
import { generateCustomerInsights } from './services/customerInsightsService';
import { getUserStrategies, getStrategy, saveStrategy, deleteStrategy, getStrategyVersions, restoreVersion } from './services/strategyStore';
// import enrichRouter from './app/api/enrich/route';

dotenv.config();

// Extend Express Request with Clerk auth
declare global {
    namespace Express {
        interface Request {
            auth?: { userId: string | null };
        }
    }
}

const app = express();
const PORT = parseInt(process.env['PORT'] || '3001', 10);

// ðŸ›¡ï¸ Basic in-memory rate limiter (per IP, 100 req/min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
app.use((req, _res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    } else {
        entry.count++;
        if (entry.count > 100) {
            _res.status(429).json({ error: 'Too many requests' });
            return;
        }
    }
    next();
});

// Clean up rate limit map every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
        if (now > val.resetAt) rateLimitMap.delete(key);
    }
}, 300_000);

// Helper: sanitize and limit string input length
function sanitizeQuery(input: unknown, maxLen = 200): string | null {
    if (typeof input !== 'string') return null;
    return input.trim().slice(0, maxLen);
}

// ðŸ†• Initialize RSS Parser for Live News
const rssParser = new Parser();

// ðŸ” CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env['VITE_APP_URL'],
    process.env['CUSTOM_DOMAIN'] ? `https://${process.env['CUSTOM_DOMAIN']}` : undefined,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(allowed => origin === allowed) || origin?.endsWith('.up.railway.app')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ðŸ†• Cache middleware for GET requests
const cacheMiddleware = (_duration: number) => (_req: Request, res: Response, next: Function) => {
    if (_req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${_duration}`);
    }
    next();
};

// Apply cache: 5min for search, 1h for company list
app.use('/api/companies', cacheMiddleware(300));
app.use('/api/vectors', cacheMiddleware(3600));

// ðŸ” Clerk auth middleware
// clerkMiddleware() parses JWT when present (sets req.auth) but does NOT block unauthenticated requests.
// Each strategy endpoint handler checks req.auth?.userId and returns 401 JSON if missing.
app.use(clerkMiddleware());

// Initialize companies from CSV on startup
let companiesLoaded = false;
let allCompaniesData: any[] = [];
let vectorsReady = false;

// ðŸ”§ Option to skip vector seeding for faster startup (dev mode)
// Set SKIP_VECTOR_SEEDING=true to skip (for testing without 15min wait)
const SKIP_VECTOR_SEEDING = process.env['SKIP_VECTOR_SEEDING'] === 'true';

initializeCompanies().then((companies) => {
    companiesLoaded = true;
    allCompaniesData = companies;
    console.log('âœ… Companies initialized successfully');

    // ðŸ†• Seed vector database after companies are loaded (optional)
    if (SKIP_VECTOR_SEEDING) {
        console.log('â­ï¸  Vector seeding SKIPPED (SKIP_VECTOR_SEEDING=true)');
        console.log('   To enable: remove SKIP_VECTOR_SEEDING or set to false');
        vectorsReady = false; // Vectors not available
        return Promise.resolve();
    }

    return seedVectorDatabase().then(() => {
        vectorsReady = true;
        console.log('âœ… Vector database seeding completed');
    });
}).catch((error) => {
    console.error('âŒ Failed to initialize companies:', error);
});

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'active',
        identity: 'VICO Backend Service',
        timestamp: new Date().toISOString(),
        companiesLoaded,
        totalCompanies: allCompaniesData.length,
        vectorsReady
    });
});

// ============================================================================
// ï¿½ DEMO REQUEST API - Captures "Book a Demo" leads
// Data stored in data/db/demo-requests.json
// ============================================================================
app.post('/api/demo-request', async (req: Request, res: Response): Promise<void> => {
    try {
        const { lastName, firstName, email, jobTitle, phone } = req.body;

        if (!email || !firstName || !lastName) {
            res.status(400).json({ error: 'Missing required fields: firstName, lastName, email' });
            return;
        }

        // Simple email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ error: 'Invalid email address' });
            return;
        }

        const lead = {
            id: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            lastName,
            firstName,
            email,
            jobTitle: jobTitle || '',
            phone: phone || '',
            submittedAt: new Date().toISOString(),
            status: 'new',
        };

        // Persist to JSON file
        const dbDir = path.join(__dirname_esm, 'data', 'db');
        const filePath = path.join(dbDir, 'demo-requests.json');
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

        let leads: any[] = [];
        if (fs.existsSync(filePath)) {
            try { leads = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch { leads = []; }
        }
        leads.push(lead);
        fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf-8');

        console.log(`ðŸ“© New demo request: ${firstName} ${lastName} <${email}> â€” ${jobTitle}`);
        res.json({ success: true, message: 'Demo request received', id: lead.id });
    } catch (error) {
        console.error('âŒ Error saving demo request:', error);
        res.status(500).json({ error: 'Failed to submit demo request' });
    }
});

// ============================================================================
// ï¿½ðŸ” STRATEGIES API - Real persistence (file-based JSON store)
// Data stored in data/db/strategies/{userId}/*.json
// ============================================================================

// Get all user strategies
app.get('/api/strategies/my', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const strategies = getUserStrategies(userId);
        res.json({ success: true, strategies, count: strategies.length });
    } catch (error) {
        console.error('âŒ Error fetching strategies:', error);
        res.status(500).json({ error: 'Failed to fetch strategies' });
    }
});

// Get single strategy with version history
app.get('/api/strategies/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const strategyId = req.params['id'] ?? '';
        const strategy = getStrategy(userId, strategyId);
        if (!strategy) {
            res.status(404).json({ error: 'Strategy not found' });
            return;
        }

        const versions = getStrategyVersions(userId, strategyId);
        res.json({ success: true, strategy, versions });
    } catch (error) {
        console.error('âŒ Error fetching strategy:', error);
        res.status(500).json({ error: 'Failed to fetch strategy' });
    }
});

// Save/update strategy (auto-save from frontend)
app.post('/api/strategies/save', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { companyName, strategyData, type, title, description, companyId } = req.body;

        if (!companyName || !strategyData) {
            res.status(400).json({ error: 'Missing required fields: companyName, strategyData' });
            return;
        }

        const result = saveStrategy(userId, companyName, type || 'gtm', strategyData, {
            title,
            description,
            companyId,
        });

        console.log(`ðŸ’¾ Strategy ${result.isNew ? 'created' : 'updated'}: ${companyName} (${type || 'gtm'}) for user ${userId}`);

        res.json({
            success: true,
            strategy: result.strategy,
            isNew: result.isNew,
            message: result.isNew ? 'Strategy created' : `Strategy updated (v${result.strategy.version})`,
        });
    } catch (error) {
        console.error('âŒ Error saving strategy:', error);
        res.status(500).json({ error: 'Failed to save strategy' });
    }
});

// Delete strategy
app.delete('/api/strategies/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const deleted = deleteStrategy(userId, req.params['id'] ?? '');
        if (!deleted) {
            res.status(404).json({ error: 'Strategy not found' });
            return;
        }

        console.log(`ðŸ—‘ï¸ Strategy deleted:  for user ${userId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('âŒ Error deleting strategy:', error);
        res.status(500).json({ error: 'Failed to delete strategy' });
    }
});

// Restore to previous version
app.post('/api/strategies/:id/restore', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { version } = req.body;

        if (!version || typeof version !== 'number') {
            res.status(400).json({ error: 'Version number required' });
            return;
        }

        const restoreId = req.params['id'] ?? '';
        const restored = restoreVersion(userId, restoreId, version);
        if (!restored) {
            res.status(404).json({ error: 'Strategy or version not found' });
            return;
        }

        console.log(`ðŸ”„ Strategy restored:  to v${version} for user ${userId}`);
        res.json({ success: true, strategy: restored });
    } catch (error) {
        console.error('âŒ Error restoring strategy:', error);
        res.status(500).json({ error: 'Failed to restore strategy' });
    }
});

app.get('/api/companies', async (req, res) => {
    try {
        const { search, industry, page: pageParam, limit: limitParam, tier, sortBy } = req.query;

        // Use CSV data as primary source
        let companies = getAllCompanies();

        // Apply filters
        if (search && typeof search === 'string') {
            companies = searchCompanies(search);
        }

        if (industry && typeof industry === 'string') {
            companies = companies.filter(c => c.industry === industry);
        }

        // 🎯 Tier filter — only return companies above minimum data quality
        if (tier && typeof tier === 'string' && ['premium', 'standard', 'basic'].includes(tier)) {
            const minScore = tier === 'premium' ? 80 : tier === 'standard' ? 50 : 0;
            companies = companies.filter(c => (c.dataScore ?? 0) >= minScore);
        }

        // Sort by data quality score if requested
        if (sortBy === 'dataScore') {
            companies = [...companies].sort((a, b) => (b.dataScore ?? 0) - (a.dataScore ?? 0));
        }

        // Pagination (#30) — default 50 per page
        const total = companies.length;
        const page = Math.max(1, parseInt(String(pageParam || '1'), 10) || 1);
        const limit = Math.min(200, Math.max(1, parseInt(String(limitParam || '50'), 10) || 50));
        const start = (page - 1) * limit;
        const paginatedCompanies = companies.slice(start, start + limit);

        // Tier stats for this result set
        const tierStats = {
            premium: companies.filter(c => c.dataTier === 'premium').length,
            standard: companies.filter(c => c.dataTier === 'standard').length,
            basic: companies.filter(c => c.dataTier === 'basic').length,
        };

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasMore: start + limit < total,
            tierStats,
            companies: paginatedCompanies
        });
    } catch (error) {
        console.error("API Error (companies):", error);
        res.status(500).json({
            error: "Failed to fetch companies",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/api/companies/industry/:industry', (req, res) => {
    try {
        const { industry } = req.params;
        const companies = getCompaniesByIndustry(industry);

        res.json({
            industry,
            total: companies.length,
            companies
        });
    } catch (error) {
        console.error("API Error (industry filter):", error);
        res.status(500).json({
            error: "Failed to filter companies by industry"
        });
    }
});

app.get('/api/companies/search', (req, res): void => {
    try {
        const q = sanitizeQuery(req.query['q']);

        if (!q) {
            res.status(400).json({ error: 'Query parameter "q" is required' });
            return;
        }

        const results = searchCompanies(q);

        res.json({
            query: q,
            total: results.length,
            companies: results
        });
    } catch (error) {
        console.error("API Error (search):", error);
        res.status(500).json({
            error: "Search failed"
        });
    }
});

// ðŸ†• Competitors API: Get competitors for a company (UNIFIED ENGINE)
app.get('/api/companies/competitors', async (req, res): Promise<void> => {
    try {
        const { company, limit = '10', minSimilarity = '20', source = 'all' } = req.query;

        const companyName = sanitizeQuery(company);
        if (!companyName) {
            res.status(400).json({ error: 'Query parameter "company" is required' });
            return;
        }

        // Validate source filter
        const validSources = ['ts', 'csv', 'all'];
        const sourceFilter = validSources.includes(source as string) ? (source as 'ts' | 'csv' | 'all') : 'all';

        console.log(`ðŸ” [Unified Engine] Finding competitors for: ${companyName} (source: ${sourceFilter})`);

        const result = await findTopCompetitors(
            companyName,
            parseInt(limit as string) || 10,
            parseInt(minSimilarity as string) || 20,
            sourceFilter
        );

        // Transform to API response format
        const competitors = result.competitors.map(match => ({
            name: match.company.name,
            industry: match.company.industry,
            location: match.company.location || 'Vietnam',
            website: match.company.website || '',
            about: match.company.description?.substring(0, 300) || `${match.company.name} operates in ${match.company.industry} sector`,
            similarity: match.similarity,
            matchReasons: match.matchReasons,
            breakdown: match.breakdown,
            source: match.company.source
        }));

        console.log(`âœ… [Unified Engine] Found ${competitors.length} competitors from ${result.totalCandidates} total companies in ${result.searchTime}ms`);

        res.json({
            company: result.targetCompany.name,
            industry: result.targetCompany.industry,
            competitorCount: competitors.length,
            totalCandidates: result.totalCandidates,
            searchTimeMs: result.searchTime,
            competitors
        });
    } catch (error) {
        console.error("API Error (competitors):", error);
        res.status(500).json({
            error: "Failed to find competitors",
            message: error instanceof Error ? error.message : 'Unknown error',
            competitors: []
        });
    }
});

// ðŸ†• New endpoint: Get all companies for RAG vectorization
app.get('/api/companies/raw/all', (_req, res) => {
    try {
        res.json({
            total: allCompaniesData.length,
            companies: allCompaniesData
        });
    } catch (error) {
        console.error("API Error (raw companies):", error);
        res.status(500).json({
            error: "Failed to fetch raw companies data"
        });
    }
});

// 📊 Data quality report endpoint
app.get('/api/data-quality', (_req, res) => {
    try {
        const companies = getAllCompanies();
        const { generateQualityReport } = require('./services/dataQualityMonitor');
        const report = generateQualityReport(companies);
        res.json(report);
    } catch (error) {
        console.error("API Error (data-quality):", error);
        res.status(500).json({ error: "Failed to generate data quality report" });
    }
});
// ðŸ†• New endpoint: Get pre-computed vectors from cache (FAST!)
app.get('/api/vectors/cache', (_req, res) => {
    try {
        const vectors = loadVectorsFromCache();
        res.json({
            total: vectors.length,
            vectors,
            cached: true,
            message: `Loaded ${vectors.length} pre-computed vectors`
        });
    } catch (error) {
        console.error("API Error (vectors):", error);
        res.status(500).json({
            error: "Failed to fetch vectors"
        });
    }
});

// ðŸ§  Market Intelligence API - Dynamic Market Analysis
app.post('/api/market-intelligence', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userCompany, selectedCompetitors } = req.body;

        if (!userCompany) {
            res.status(400).json({ error: 'userCompany is required' });
            return;
        }

        console.log(`ðŸ§  Market Intelligence Request: ${userCompany.name} (${userCompany.industry})`);
        console.log(`   Competitors: ${selectedCompetitors?.length || 0}`);
        console.log(`   userCompany data:`, userCompany);

        const report = await generateMarketIntelligence({
            userCompany,
            selectedCompetitors: selectedCompetitors || []
        });

        console.log(`âœ… Market Intelligence Report generated successfully`);
        res.json(report);
    } catch (error) {
        console.error("âŒ API Error (market-intelligence):", error);
        console.error("   Stack:", error instanceof Error ? error.stack : 'no stack');
        res.status(500).json({
            error: "Failed to generate market intelligence",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// ðŸŽ¯ Competitor Intelligence API - Comprehensive Competitor Analysis
app.post('/api/competitor-intelligence', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userCompany, selectedCompetitors } = req.body;

        if (!userCompany) {
            res.status(400).json({ error: 'userCompany is required' });
            return;
        }

        console.log(`ðŸŽ¯ Competitor Intelligence Request: ${userCompany.name} (${userCompany.industry})`);
        console.log(`   Competitors: ${selectedCompetitors?.length || 0}`);

        const report = await generateCompetitorIntelligence({
            userCompany,
            selectedCompetitors: selectedCompetitors || []
        });

        res.json(report);
    } catch (error) {
        console.error("API Error (competitor-intelligence):", error);
        res.status(500).json({
            error: "Failed to generate competitor intelligence",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// ðŸŽ¯ Customer Insights API - Deep Customer Understanding
app.post('/api/customer-insights', async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, industry, products, targetMarket } = req.body;

        if (!companyName) {
            res.status(400).json({ error: 'companyName is required' });
            return;
        }

        console.log(`ðŸŽ¯ Customer Insights Request: ${companyName} (${industry || 'auto-detect'})`);

        const report = await generateCustomerInsights({
            companyName,
            industry,
            products,
            targetMarket
        });

        res.json(report);
    } catch (error) {
        console.error("API Error (customer-insights):", error);
        res.status(500).json({
            error: "Failed to generate customer insights",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// ðŸ†• GTM Strategy Generation Endpoint â€” AI-Powered Living Playbook (No Fake Data)
app.post('/api/gtm/generate', async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, targetMarkets = [] } = req.body;

        // Validate input
        if (!companyName) {
            res.status(400).json({ error: "Company name required" });
            return;
        }

        // Generate playbook using AI-powered service (loads its own company data)
        const { generateLivingPlaybook } = await import('./services/gtmPlaybookService');
        const livingPlaybook = await generateLivingPlaybook(companyName, targetMarkets);
        res.json(livingPlaybook);
    } catch (error) {
        console.error("API Error (GTM generation):", error);
        res.status(500).json({
            error: "Failed to generate GTM strategy",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// REPLACED: ~520 lines of hardcoded/fabricated GTM data removed
// Old code had fake "Dr. Nguyá»…n VÄƒn Minh", "Tráº§n Thá»‹ HÆ°Æ¡ng at McKinsey"
// expert interviews and fabricated GSO/World Bank citations
// Now uses services/gtmPlaybookService.ts with AI + real database

// DEAD CODE REMOVED â€” was: company lookup, competitive tracker with Math.max(),
// fabricated market reports ($15.2B, CAGR 14.5%), fake expert call logs,
// fake validation sources (GSO 95%, VCCI 88%), fake strategic metrics (95% accuracy)

// Phased GTM Playbook Generation – Industry-scoped, step-by-step playbook
app.post('/api/playbooks/generate', async (req: Request, res: Response): Promise<void> => {
    try {
        const { industry, companyProfile } = req.body;

        if (!industry || typeof industry !== 'string') {
            res.status(400).json({ error: 'industry (string) is required in the request body' });
            return;
        }

        const { generateGTMPlaybook } = await import('./services/playbookService');
        const playbook = await generateGTMPlaybook(industry, companyProfile ?? null);
        res.json(playbook);
    } catch (error) {
        console.error('API Error (playbook generation):', error);
        res.status(500).json({
            error: 'Failed to generate GTM playbook',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// 🎯 ICP Engine — Smart Customer Segmentation & Ideal Customer Profile (Phase 13)
app.post('/api/icp/generate', async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, industry, productDescription } = req.body;

        if (!industry || typeof industry !== 'string') {
            res.status(400).json({ error: 'industry (string) is required in the request body' });
            return;
        }
        if (!productDescription || typeof productDescription !== 'string') {
            res.status(400).json({ error: 'productDescription (string) is required in the request body' });
            return;
        }

        const resolvedName = (companyName && typeof companyName === 'string')
            ? companyName.trim()
            : 'Your Company';

        const { generateCustomerInsights } = await import('./services/icpEngineService');
        const report = await generateCustomerInsights(resolvedName, industry.trim(), productDescription.trim());
        res.json({ success: true, report });
    } catch (error) {
        console.error('API Error (ICP generation):', error);
        res.status(500).json({
            error: 'Failed to generate ICP report',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// ============================================================================
// 📂 Executive Workspace — Phase 14: Saved Intelligence CRUD
// ============================================================================

// POST /api/workspace/save — persist a new document (ICP, Playbook, etc.)
app.post('/api/workspace/save', async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, title, industry, companyName, content, dataSource, tags } = req.body;

        // Validate required fields
        if (!type || typeof type !== 'string') {
            res.status(400).json({ error: 'type (string) is required — e.g. ICP, PLAYBOOK, MARKET_REPORT' });
            return;
        }
        if (!title || typeof title !== 'string') {
            res.status(400).json({ error: 'title (string) is required' });
            return;
        }
        if (!content || typeof content !== 'object') {
            res.status(400).json({ error: 'content (object) is required — the raw JSON report payload' });
            return;
        }

        const { getWorkspaceService, isValidDocumentType } = await import('./services/workspaceService');

        if (!isValidDocumentType(type)) {
            res.status(400).json({ error: `Invalid document type "${type}". Accepted: ICP, PLAYBOOK, PESTEL, MARKET_REPORT, COMPETITOR_ANALYSIS, GTM_STRATEGY` });
            return;
        }

        const ws = getWorkspaceService();
        const doc = await ws.saveDocument({ type, title, industry, companyName, content, dataSource, tags });
        res.json({ success: true, document: doc });
    } catch (error) {
        console.error('API Error (workspace save):', error);
        res.status(500).json({
            error: 'Failed to save document',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// GET /api/workspace/documents — list all saved documents (newest first)
app.get('/api/workspace/documents', async (req: Request, res: Response): Promise<void> => {
    try {
        const { getWorkspaceService, isValidDocumentType } = await import('./services/workspaceService');
        const ws = getWorkspaceService();

        const typeParam = req.query['type'] as string | undefined;
        const typeFilter = typeParam && isValidDocumentType(typeParam) ? typeParam : undefined;

        const documents = await ws.getDocuments(typeFilter);
        res.json({ success: true, documents, total: documents.length });
    } catch (error) {
        console.error('API Error (workspace list):', error);
        res.status(500).json({
            error: 'Failed to retrieve documents',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// GET /api/workspace/documents/:id — get a single document with full content
app.get('/api/workspace/documents/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const docId = req.params['id'];
        if (!docId) {
            res.status(400).json({ error: 'Document ID is required' });
            return;
        }

        const { getWorkspaceService } = await import('./services/workspaceService');
        const ws = getWorkspaceService();
        const doc = await ws.getDocumentById(docId);

        if (!doc) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        res.json({ success: true, document: doc });
    } catch (error) {
        console.error('API Error (workspace get):', error);
        res.status(500).json({
            error: 'Failed to retrieve document',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// DELETE /api/workspace/documents/:id — permanently delete a document
app.delete('/api/workspace/documents/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const docId = req.params['id'];
        if (!docId) {
            res.status(400).json({ error: 'Document ID is required' });
            return;
        }

        const { getWorkspaceService } = await import('./services/workspaceService');
        const ws = getWorkspaceService();
        const deleted = await ws.deleteDocument(docId);

        if (!deleted) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        res.json({ success: true, message: `Document ${docId} deleted` });
    } catch (error) {
        console.error('API Error (workspace delete):', error);
        res.status(500).json({
            error: 'Failed to delete document',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// PATCH /api/workspace/documents/:id — update a document
app.patch('/api/workspace/documents/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const docId = req.params['id'];
        if (!docId) {
            res.status(400).json({ error: 'Document ID is required' });
            return;
        }

        const { title, content, tags, industry, companyName } = req.body;

        const { getWorkspaceService } = await import('./services/workspaceService');
        const ws = getWorkspaceService();
        const updated = await ws.updateDocument(docId, { title, content, tags, industry, companyName });

        if (!updated) {
            res.status(404).json({ error: 'Document not found' });
            return;
        }

        res.json({ success: true, document: updated });
    } catch (error) {
        console.error('API Error (workspace update):', error);
        res.status(500).json({
            error: 'Failed to update document',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// GET /api/workspace/stats — aggregate counts by document type
app.get('/api/workspace/stats', async (_req: Request, res: Response): Promise<void> => {
    try {
        const { getWorkspaceService } = await import('./services/workspaceService');
        const ws = getWorkspaceService();
        const stats = await ws.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('API Error (workspace stats):', error);
        res.status(500).json({
            error: 'Failed to retrieve workspace stats',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// ðŸ†• Live RSS Feeds API: Láº¥y tin tá»©c tá»« Google News/VnExpress
app.post('/api/news', async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            res.status(400).json({
                error: 'Query parameter required',
                news: []
            });
            return;
        }

        console.log(`ðŸ“° Äang tÃ¬m tin tá»©c cho: "${query}"`);

        // 1. Táº¡o URL RSS tá»« Google News (TÃ¬m kiáº¿m theo tÃªn cÃ´ng ty)
        // Máº¹o: DÃ¹ng hl=vi&gl=VN Ä‘á»ƒ láº¥y tin tiáº¿ng Viá»‡t
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=vi&gl=VN&ceid=VN:vi`;

        console.log(`ðŸ”— RSS Feed URL: ${feedUrl}`);

        let newsItems: any[] = [];

        try {
            // 2. Äá»c RSS vá»›i timeout
            const feed = await Promise.race([
                rssParser.parseURL(feedUrl),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('RSS fetch timeout')), 8000)
                )
            ]);

            // 3. LÃ m sáº¡ch dá»¯ liá»‡u tráº£ vá»
            newsItems = (feed as any).items.slice(0, 8).map((item: any) => ({
                title: item.title || 'Untitled',
                link: item.link || '',
                pubDate: item.pubDate || new Date().toISOString(),
                content: item.contentSnippet || item.content || '',
                source: item.creator || 'Google News',
                guid: item.guid || item.link
            }));

            console.log(`âœ… TÃ¬m tháº¥y ${newsItems.length} bÃ i viáº¿t vá» "${query}"`);
        } catch (rssError) {
            console.warn(`âš ï¸ KhÃ´ng thá»ƒ fetch RSS (${rssError instanceof Error ? rssError.message : 'unknown'}), sá»­ dá»¥ng dá»¯ liá»‡u máº«u`);

            // Fallback: Return sample data for testing
            newsItems = [
                {
                    title: `${query} - Tin tá»©c cÃ´ng ty (Máº«u)`,
                    link: `https://google.com/search?q=${encodeURIComponent(query)}`,
                    pubDate: new Date().toISOString(),
                    content: `Tin tá»©c máº«u vá» ${query}. Náº¿u báº¡n tháº¥y dá»¯ liá»‡u nÃ y, RSS feed táº¡m thá»i khÃ´ng kháº£ dá»¥ng.`,
                    source: 'Demo Data',
                    guid: `demo-${query}`
                }
            ];
        }

        res.json({
            query,
            count: newsItems.length,
            news: newsItems,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('âŒ Lá»—i láº¥y tin tá»©c:', error instanceof Error ? error.message : error);
        console.error('Stack:', error instanceof Error ? error.stack : '');

        // Tráº£ vá» máº£ng rá»—ng chá»© khÃ´ng bÃ¡o lá»—i Ä‘á»ƒ Frontend khÃ´ng bá»‹ cháº¿t
        res.json({
            query: req.body.query || '',
            count: 0,
            news: [],
            error: 'Unable to fetch news at this moment',
            timestamp: new Date().toISOString()
        });
    }
});

// 🤖 AI News Analysis Endpoint — Gemini-powered article analysis
app.post('/api/news/analyze', async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content, source } = req.body;

        if (!title && !content) {
            res.status(400).json({ error: 'title or content required' });
            return;
        }

        const articleText = `${title || ''}\n\n${(content || '').substring(0, 2000)}`;

        // Try Gemini AI analysis
        const { GoogleGenAI } = await import('@google/genai');
        const apiKey = process.env['GEMINI_API_KEY'];

        if (!apiKey) {
            res.json(buildFallbackAnalysis(title, content));
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Phân tích bài báo/tin tức sau và trả về JSON:

Tiêu đề: ${title || 'N/A'}
Nguồn: ${source || 'N/A'}
Nội dung: ${articleText.substring(0, 1500)}

Trả về ONLY valid JSON:
{
  "summary": "Tóm tắt ngắn gọn 2-3 câu bằng tiếng Việt",
  "keyPoints": ["Điểm chính 1", "Điểm chính 2", "Điểm chính 3"],
  "sentiment": "positive hoặc neutral hoặc negative",
  "relevance": số từ 0-100 (mức độ liên quan đến kinh doanh/thị trường VN),
  "suggestedReading": true hoặc false (có nên đọc không)
}

RULES:
- Tóm tắt ngắn gọn, tiếng Việt
- Key points phải CỤ THỂ từ nội dung bài, KHÔNG dùng generic placeholders
- Sentiment dựa trên tone của bài viết
- Relevance dựa trên mức liên quan đến kinh doanh tại Việt Nam`;

        let result = null;
        const MAX_RETRIES = 2;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: prompt,
                    config: { temperature: 0.3, maxOutputTokens: 800, tools: [{ googleSearch: {} }] }
                });

                const text = response.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    result = JSON.parse(jsonMatch[0]);
                    result.dataSource = 'gemini_ai';
                }
                break;
            } catch (err: any) {
                const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
                if (is429 && attempt < MAX_RETRIES) {
                    const delay = (attempt + 1) * 5000;
                    console.warn(`   ⏳ News analyze rate-limited, retry ${attempt + 1}/${MAX_RETRIES} in ${delay / 1000}s...`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                console.error('   ❌ Gemini news analysis error:', err?.message || err);
                break;
            }
        }

        if (result) {
            console.log(`   🤖 AI news analysis complete: "${(title || '').substring(0, 50)}..."`);
            res.json(result);
        } else {
            // Fallback without AI
            res.json(buildFallbackAnalysis(title, content));
        }
    } catch (error) {
        console.error('❌ API Error (news/analyze):', error);
        res.status(500).json({ error: 'Failed to analyze article' });
    }
});

function buildFallbackAnalysis(title: string, content: string) {
    // Extract first sentences as summary (not just substring)
    const text = content || title || '';
    const sentences = text.split(/[.!?。]\s+/).filter((s: string) => s.length > 10);
    const summary = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '') || text.substring(0, 200);

    // Extract key phrases from title/content (basic NLP without AI)
    const words = (title + ' ' + text).split(/\s+/);
    const wordFreq = new Map<string, number>();
    for (const w of words) {
        const clean = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
        if (clean.length > 3) wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1);
    }
    const topWords = [...wordFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);

    return {
        summary: summary.length > 300 ? summary.substring(0, 297) + '...' : summary,
        keyPoints: topWords.length >= 3
            ? [`Từ khóa chính: ${topWords.slice(0, 3).join(', ')}`, `Bài viết đề cập: ${sentences[0]?.substring(0, 80) || 'N/A'}`, 'Cần AI analysis để phân tích chi tiết hơn']
            : ['Nội dung quá ngắn để phân tích', 'Cần Gemini AI để phân tích chi tiết', 'Thử lại khi AI khả dụng'],
        sentiment: 'neutral' as const,
        relevance: 50,
        suggestedReading: false,
        dataSource: 'fallback_text_extraction',
    };
}

// 🤖 Chat Proxy — keeps Gemini API key server-side (Issue #23)
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
    try {
        const { contents, systemInstruction, tools, temperature, maxOutputTokens } = req.body;

        if (!contents || !Array.isArray(contents)) {
            res.status(400).json({ error: 'contents array required' });
            return;
        }

        const { GoogleGenAI } = await import('@google/genai');
        const apiKey = process.env['GEMINI_API_KEY'];

        if (!apiKey) {
            res.status(503).json({ error: 'AI engine not configured', text: '⚠️ GEMINI_API_KEY chưa được cấu hình trên server.' });
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents,
            config: {
                systemInstruction: systemInstruction || undefined,
                tools: tools || undefined,
                temperature: temperature ?? 0.7,
                maxOutputTokens: maxOutputTokens ?? 2048,
            },
        });

        res.json({
            text: response.text || '',
            functionCalls: response.functionCalls || [],
        });
    } catch (error: any) {
        const is429 = error?.status === 429 || error?.message?.includes('429');
        if (is429) {
            res.status(429).json({ error: 'Rate limited', text: '⚠️ Quá nhiều yêu cầu. Vui lòng đợi vài giây.' });
            return;
        }
        console.error('❌ Chat proxy error:', error?.message || error);
        res.status(500).json({ error: 'Chat request failed', text: '⚠️ Đã xảy ra lỗi. Vui lòng thử lại.' });
    }
});

// 🆕 Mount enrich routes for CSV company enrichment
// app.use('/api', enrichRouter);

// ============================================================================
// 📊 ANALYTICS API — Industry analytics from MarketIndustryAnalytics
// GET /api/analytics?industry=Technology → Market index for a specific industry
// GET /api/analytics?trending=true      → Industry trend summary
// ============================================================================
const analyticsEngine = new MarketIndustryAnalytics();

app.get('/api/analytics', async (req: Request, res: Response): Promise<void> => {
    try {
        const industry = sanitizeQuery(req.query['industry']);
        const trending = req.query['trending'];

        // Industry trend summary
        if (trending === 'true' || trending === '1') {
            const summary = analyticsEngine.getIndustryTrendSummary();
            res.json({ success: true, ...summary });
            return;
        }

        // Specific industry market index
        if (industry) {
            try {
                const metrics = await analyticsEngine.getMarketIndexByIndustry(industry);
                res.json({ success: true, ...metrics });
            } catch (err) {
                res.status(404).json({
                    success: false,
                    error: err instanceof Error ? err.message : `No data for "${industry}"`,
                });
            }
            return;
        }

        // No params — return usage
        res.json({
            success: true,
            message: 'VICO Analytics API',
            usage: {
                industry: '/api/analytics?industry=Technology',
                trending: '/api/analytics?trending=true',
                compare: '/api/analytics/compare',
            },
        });
    } catch (error) {
        console.error('❌ Analytics API error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Analytics failed',
        });
    }
});

// GET /api/analytics/compare — All industries ranked and compared
app.get('/api/analytics/compare', async (_req: Request, res: Response): Promise<void> => {
    try {
        const comparison = await analyticsEngine.getIndustryComparison();
        res.json({ success: true, ...comparison });
    } catch (error) {
        console.error('❌ Industry comparison error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Comparison failed',
        });
    }
});

// --- API Lấy dữ liệu Thị trường (Market Pulse) ---
app.get("/api/market-pulse", async (_req, res) => {
    try {
        // 1. Láº¥y chá»‰ sá»‘ VÄ© mÃ´ (GDP, CPI, FDI)
        const macro = await getPrisma().marketData.findMany({
            where: { type: 'MACRO' },
            orderBy: { key: 'asc' }
        });

        // 2. Láº¥y chá»‰ sá»‘ TÃ i chÃ­nh ngÃ nh (P/E)
        const finance = await getPrisma().marketData.findMany({
            where: { type: 'FINANCE' },
            orderBy: { value: 'desc' } // NgÃ nh nÃ o P/E cao xáº¿p trÃªn
        });

        res.json({
            success: true,
            data: { macro, finance },
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error("âŒ Lá»—i láº¥y Market Pulse:", error);
        res.status(500).json({ error: "Lá»—i Server khi láº¥y dá»¯ liá»‡u thá»‹ trÆ°á»ng" });
    }
});
// Initialize news database on startup (optional)
const initializeNewsDBAsync = async () => {
    try {
        const { initializeNewsDB: initDB } = await import('./utils/newsDatabase');
        await initDB();
        console.log('âœ… News database initialized');
    } catch (error) {
        console.warn('âš ï¸ News database not available (MongoDB connection may not be set up):', error instanceof Error ? error.message : 'Unknown');
    }
};

// Call it in background (non-blocking)
initializeNewsDBAsync().catch(console.error);

// ðŸŒ PRODUCTION: Phá»¥c vá»¥ frontend Ä‘Ã£ build (dist/)
const distPath = path.join(__dirname_esm, 'dist');
if (fs.existsSync(distPath)) {
    console.log('ðŸ“¦ Production mode: Serving frontend from ./dist');
    app.use(express.static(distPath));

    // SPA fallback: má»i route khÃ´ng pháº£i /api â†’ tráº£ vá» index.html
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
} else {
    console.log('âš™ï¸ Development mode: Frontend served by Vite dev server');
}

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`ðŸš€ VICO Backend: http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`âŒ Port ${PORT} is already in use`);
    } else {
        console.error('âŒ Server error:', err);
    }
    process.exit(1);
});
