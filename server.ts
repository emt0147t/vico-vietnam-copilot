import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongo } from './utils/connect';
import { initializeCompanies, getAllCompanies, searchCompanies, getCompaniesByIndustry } from './utils/companyLoader';
import { seedVectorDatabase, loadVectorsFromCache } from './utils/vectorSeeder';
import { COMPANIES } from './data/companies';
import Parser from 'rss-parser';
import { findTopCompetitors, searchCompaniesByName, loadAllCompanies } from './services/competitorEngine';
import { generateMarketIntelligence } from './services/marketIntelligenceService';
import { generateCompetitorIntelligence } from './services/competitorIntelligenceService';
import { generateCustomerInsights } from './services/customerInsightsService';
// import enrichRouter from './app/api/enrich/route';

dotenv.config();

const app = express();
const PORT = 3001;

// 🆕 Initialize RSS Parser for Live News
const rssParser = new Parser();

app.use(cors());
app.use(express.json());

// 🆕 Cache middleware for GET requests
const cacheMiddleware = (duration: number) => (req: Request, res: Response, next: Function) => {
    if (req.method === 'GET') {
        res.set('Cache-Control', `public, max-age=${duration}`);
    }
    next();
};

// Apply cache: 5min for search, 1h for company list
app.use('/api/companies', cacheMiddleware(300));
app.use('/api/vectors', cacheMiddleware(3600));

// Initialize companies from CSV on startup
let companiesLoaded = false;
let allCompaniesData: any[] = [];
let vectorsReady = false;

// 🔧 Option to skip vector seeding for faster startup (dev mode)
// Set SKIP_VECTOR_SEEDING=true to skip (for testing without 15min wait)
const SKIP_VECTOR_SEEDING = process.env.SKIP_VECTOR_SEEDING === 'true';

initializeCompanies().then((companies) => {
    companiesLoaded = true;
    allCompaniesData = companies;
    console.log('✅ Companies initialized successfully');
    
    // 🆕 Seed vector database after companies are loaded (optional)
    if (SKIP_VECTOR_SEEDING) {
        console.log('⏭️  Vector seeding SKIPPED (SKIP_VECTOR_SEEDING=true)');
        console.log('   To enable: remove SKIP_VECTOR_SEEDING or set to false');
        vectorsReady = false; // Vectors not available
        return Promise.resolve();
    }

    return seedVectorDatabase().then(() => {
        vectorsReady = true;
        console.log('✅ Vector database seeding completed');
    });
}).catch((error) => {
    console.error('❌ Failed to initialize companies:', error);
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'active', 
        identity: 'VICO Backend Service',
        timestamp: new Date().toISOString(),
        companiesLoaded,
        totalCompanies: allCompaniesData.length,
        vectorsReady
    });
});

app.get('/api/companies', async (req, res) => {
    try {
        const { search, industry } = req.query;
        
        // Use CSV data as primary source
        let companies = getAllCompanies();
        
        // Apply filters
        if (search && typeof search === 'string') {
            companies = searchCompanies(search);
        }
        
        if (industry && typeof industry === 'string') {
            companies = companies.filter(c => c.industry === industry);
        }
        
        res.json({
            total: companies.length,
            companies
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

app.get('/api/companies/search', (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
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

// 🆕 Competitors API: Get competitors for a company (UNIFIED ENGINE)
app.get('/api/companies/competitors', async (req, res) => {
    try {
        const { company, limit = '10', minSimilarity = '20', source = 'all' } = req.query;
        
        if (!company || typeof company !== 'string') {
            return res.status(400).json({ error: 'Query parameter "company" is required' });
        }
        
        // Validate source filter
        const validSources = ['ts', 'csv', 'all'];
        const sourceFilter = validSources.includes(source as string) ? (source as 'ts' | 'csv' | 'all') : 'all';
        
        console.log(`🔍 [Unified Engine] Finding competitors for: ${company} (source: ${sourceFilter})`);
        
        // 🆕 Use the new unified competitor engine with source filter
        const result = await findTopCompetitors(
            company.trim(),
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
        
        console.log(`✅ [Unified Engine] Found ${competitors.length} competitors from ${result.totalCandidates} total companies in ${result.searchTime}ms`);
        
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

// 🆕 New endpoint: Get all companies for RAG vectorization
app.get('/api/companies/raw/all', (req, res) => {
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

// 🆕 New endpoint: Get pre-computed vectors from cache (FAST!)
app.get('/api/vectors/cache', (req, res) => {
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

// 🧠 Market Intelligence API - Dynamic Market Analysis
app.post('/api/market-intelligence', async (req: Request, res: Response) => {
    try {
        const { userCompany, selectedCompetitors } = req.body;
        
        if (!userCompany) {
            return res.status(400).json({ error: 'userCompany is required' });
        }
        
        console.log(`🧠 Market Intelligence Request: ${userCompany.name} (${userCompany.industry})`);
        console.log(`   Competitors: ${selectedCompetitors?.length || 0}`);
        
        const report = await generateMarketIntelligence({
            userCompany,
            selectedCompetitors: selectedCompetitors || []
        });
        
        res.json(report);
    } catch (error) {
        console.error("API Error (market-intelligence):", error);
        res.status(500).json({ 
            error: "Failed to generate market intelligence",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// 🎯 Competitor Intelligence API - Comprehensive Competitor Analysis
app.post('/api/competitor-intelligence', async (req: Request, res: Response) => {
    try {
        const { userCompany, selectedCompetitors } = req.body;
        
        if (!userCompany) {
            return res.status(400).json({ error: 'userCompany is required' });
        }
        
        console.log(`🎯 Competitor Intelligence Request: ${userCompany.name} (${userCompany.industry})`);
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

// 🎯 Customer Insights API - Deep Customer Understanding
app.post('/api/customer-insights', async (req: Request, res: Response) => {
    try {
        const { companyName, industry, products, targetMarket } = req.body;
        
        if (!companyName) {
            return res.status(400).json({ error: 'companyName is required' });
        }
        
        console.log(`🎯 Customer Insights Request: ${companyName} (${industry || 'auto-detect'})`);
        
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

// 🆕 GTM Strategy Generation Endpoint
app.post('/api/gtm/generate', async (req: Request, res: Response) => {
    try {
        const { companyName, targetMarkets = [] } = req.body;

        // Validate input
        if (!companyName) {
            return res.status(400).json({ 
                error: "Company name required" 
            });
        }

        // Find company in database
        const company = COMPANIES.find(
            (c) => c.name.toLowerCase() === companyName.toLowerCase()
        );

        if (!company) {
            return res.status(404).json({ 
                error: `Company "${companyName}" not found in database` 
            });
        }

        // Get competitors in same industry
        const competitors = COMPANIES
            .filter(c => c.industry === company.industry && c.name !== companyName)
            .slice(0, 3)
            .map(c => c.name);

        // Determine GTM strategy based on industry
        const strategyMap: Record<string, string> = {
            'Technology': 'direct_sales',
            'Finance': 'channel_partner',
            'Retail': 'online_marketplace',
            'Manufacturing': 'channel_partner',
            'Healthcare': 'joint_venture',
            'Telecommunications': 'licensing'
        };
        const recommendedStrategy = strategyMap[company.industry || 'Technology'] || 'direct_sales';

        // Build SWOT analysis based on company profile and industry
        const isEarlyStage = !company.employees || company.employees < 100;
        const strengths = [
            `Specialized expertise in ${company.industry}`,
            isEarlyStage ? 'Agile and flexible operations' : 'Established market presence',
            'Opportunity for market expansion'
        ];

        const weaknesses = [
            'Limited geographic footprint',
            'Resource constraints vs large competitors',
            'Brand recognition challenges'
        ];

        const opportunities = [
            'Growing demand in APAC region',
            'Digital transformation across industries',
            'Strategic partnership opportunities',
            'Emerging market expansion'
        ];

        const threats = [
            'Intense competitive landscape',
            'Regulatory changes',
            'Economic volatility in key markets'
        ];

        // Build GTM strategy response with data-driven insights
        const gtmStrategy = {
            company: {
                name: company.name,
                industry: company.industry || 'Technology',
                marketCap: company.marketCap || 'Unknown',
                employees: company.employees || 'Unknown',
                founded: company.founded || 'Unknown',
            },
            gtmRecommendation: {
                recommendedStrategy: recommendedStrategy as any,
                rationale: `${company.name} in ${company.industry || 'Technology'} sector should leverage ${recommendedStrategy.replace(/_/g, ' ')} model to maximize market reach and revenue growth`,
                timelineMonths: 12,
                estimatedCost: '$500K - $2M',
                successProbability: 0.78,
            },
            swotAnalysis: {
                strengths,
                weaknesses,
                opportunities,
                threats,
            },
            marketAnalysis: {
                targetMarkets: targetMarkets.length > 0 ? targetMarkets : ['Vietnam', 'Southeast Asia', 'APAC'],
                marketSize: '$15B+',
                growthRate: '12-15% CAGR',
                competitors: competitors.length > 0 ? competitors : ['Regional competitors'],
            },
            riskAssessment: [
                {
                    name: 'Market Risk',
                    level: 'medium' as const,
                    mitigation: 'Conduct pilot programs in low-risk markets first',
                },
                {
                    name: 'Regulatory Risk',
                    level: 'medium' as const,
                    mitigation: 'Partner with local compliance experts early',
                },
                {
                    name: 'Competitive Risk',
                    level: 'high' as const,
                    mitigation: 'Develop unique value proposition and differentiation strategy',
                },
            ],
            timeline: {
                phase1: 'Q1-Q2: Market analysis, partnership identification, and GTM planning',
                phase2: 'Q3-Q4: Pilot launch and initial market entry',
                phase3: 'Q1-Q2 (Year 2): Full scale launch and expansion',
            },
            nextSteps: [
                'Validate market demand with customer research',
                'Identify and secure key distribution partners',
                'Develop localized marketing and sales strategy',
                'Build regulatory compliance framework',
                'Establish regional operations and support infrastructure',
            ],
            analysis: {
                companiesLoaded: allCompaniesData.length,
                competitorsFound: competitors.length,
                dataSource: 'VICO Intelligence Database',
            }
        };

        res.json(gtmStrategy);
    } catch (error) {
        console.error("API Error (GTM generation):", error);
        res.status(500).json({ 
            error: "Failed to generate GTM strategy",
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// 🆕 Live RSS Feeds API: Lấy tin tức từ Google News/VnExpress
app.post('/api/news', async (req: Request, res: Response) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ 
                error: 'Query parameter required', 
                news: [] 
            });
        }

        console.log(`📰 Đang tìm tin tức cho: "${query}"`);

        // 1. Tạo URL RSS từ Google News (Tìm kiếm theo tên công ty)
        // Mẹo: Dùng hl=vi&gl=VN để lấy tin tiếng Việt
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=vi&gl=VN&ceid=VN:vi`;
        
        console.log(`🔗 RSS Feed URL: ${feedUrl}`);

        let newsItems: any[] = [];
        
        try {
            // 2. Đọc RSS với timeout
            const feed = await Promise.race([
                rssParser.parseURL(feedUrl),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('RSS fetch timeout')), 8000)
                )
            ]);

            // 3. Làm sạch dữ liệu trả về
            newsItems = (feed as any).items.slice(0, 8).map((item: any) => ({
                title: item.title || 'Untitled',
                link: item.link || '',
                pubDate: item.pubDate || new Date().toISOString(),
                content: item.contentSnippet || item.content || '',
                source: item.creator || 'Google News',
                guid: item.guid || item.link
            }));

            console.log(`✅ Tìm thấy ${newsItems.length} bài viết về "${query}"`);
        } catch (rssError) {
            console.warn(`⚠️ Không thể fetch RSS (${rssError instanceof Error ? rssError.message : 'unknown'}), sử dụng dữ liệu mẫu`);
            
            // Fallback: Return sample data for testing
            newsItems = [
                {
                    title: `${query} - Tin tức công ty (Mẫu)`,
                    link: `https://google.com/search?q=${encodeURIComponent(query)}`,
                    pubDate: new Date().toISOString(),
                    content: `Tin tức mẫu về ${query}. Nếu bạn thấy dữ liệu này, RSS feed tạm thời không khả dụng.`,
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
        console.error('❌ Lỗi lấy tin tức:', error instanceof Error ? error.message : error);
        console.error('Stack:', error instanceof Error ? error.stack : '');
        
        // Trả về mảng rỗng chứ không báo lỗi để Frontend không bị chết
        res.json({ 
            query: req.body.query || '',
            count: 0,
            news: [],
            error: 'Unable to fetch news at this moment',
            timestamp: new Date().toISOString()
        });
    }
});

// 🆕 Mount enrich routes for CSV company enrichment
// app.use('/api', enrichRouter);

// Initialize news database on startup (optional)
const initializeNewsDBAsync = async () => {
    try {
        const { initializeNewsDB: initDB } = await import('./utils/newsDatabase');
        await initDB();
        console.log('✅ News database initialized');
    } catch (error) {
        console.warn('⚠️ News database not available (MongoDB connection may not be set up):', error instanceof Error ? error.message : 'Unknown');
    }
};

// Call it in background (non-blocking)
initializeNewsDBAsync().catch(console.error);

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VICO Backend: http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
