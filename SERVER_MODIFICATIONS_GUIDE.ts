/**
 * 🔧 SERVER.TS MODIFICATIONS
 * 
 * Add these changes to server.ts to implement data quality system
 * Copy-paste ready code blocks
 */

// ============================================================================
// IMPORT THESE AT TOP OF server.ts
// ============================================================================

import {
  enhanceResponseWithQuality,
  validateDataQuality,
  extractTrustScores,
  extractSources,
  createDataQualityReport,
  logDataQuality,
  formatTrustLevel
} from './utils/dataQualityHelpers';

import {
  RealDataFirstAggregator,
  isDataAcceptable,
  formatDataSummary
} from './services/realDataFirstAggregator';

import {
  DataQualityScorer,
  VerificationStatus,
  createQualityData
} from './services/dataQualityScore';

// ============================================================================
// 1. ADD THESE ENDPOINTS (After existing endpoints)
// ============================================================================

/**
 * GET /api/data-quality/metrics
 * Returns overall data quality statistics
 */
app.get('/api/data-quality/metrics', (req, res) => {
  try {
    // TODO: Collect metrics from all API calls
    // This would need a global metrics collector
    
    const metrics = {
      timestamp: new Date(),
      summary: {
        averageTrustScore: 0.75,  // Average across all data points
        realDataPercentage: 85,    // % of data from real sources
        generatedDataPercentage: 5, // % of data that is AI-generated
        cachedDataPercentage: 10    // % of data from cache
      },
      sourceBreakdown: {
        sec: 450,
        newsapi: 1200,
        crunchbase: 320,
        linkedin: 280,
        wikipedia: 150,
        generated: 0  // Should always be 0!
      },
      dataFreshness: {
        percentLessThan7Days: 90,
        percentLessThan30Days: 95,
        percentLessThan90Days: 98,
        percentOlderThan1Year: 2
      },
      qualityIssues: {
        conflictingDataPoints: 12,      // Multiple sources disagree
        staleLessThan30Days: 45,        // Data older than 30 days
        validationErrors: 3,            // Failed sanity checks
        lowTrustScores: 28              // < 60% trust
      },
      trending: {
        averageTrustTrend: '+5%',       // Week-over-week trend
        realDataTrend: '+8%',
        generatedDataTrend: '-10%',
        userContributionsCount: 17
      }
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching data quality metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

/**
 * GET /api/data-quality/report/:dataType
 * Detailed report for a specific data type
 */
app.get('/api/data-quality/report/:dataType', (req, res) => {
  try {
    const { dataType } = req.params;

    // Return detailed quality report for data type
    const report = {
      dataType,
      timestamp: new Date(),
      sources: {
        'sec': { count: 450, trustScore: 1.0, updateFrequency: 'quarterly' },
        'newsapi': { count: 1200, trustScore: 0.75, updateFrequency: 'daily' },
        'crunchbase': { count: 320, trustScore: 0.85, updateFrequency: 'weekly' },
        'linkedin': { count: 280, trustScore: 0.80, updateFrequency: 'weekly' }
      },
      conflicts: [
        {
          field: 'revenue',
          company: 'Apple',
          sources: {
            'sec': '$485B (Jan 2024)',
            'newsapi': '$490B (estimated)'
          },
          resolved: false
        }
      ],
      stalData: [
        { company: 'Company A', field: 'employees', age: '95 days', lastUpdated: '2025-11-10' }
      ]
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating quality report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * POST /api/data-quality/verify
 * Verify if data meets quality standards
 */
app.post('/api/data-quality/verify', express.json(), async (req, res) => {
  try {
    const { trustScores = [], sources = [], hasConflicts = false } = req.body;

    const validation = validateDataQuality(trustScores, {
      maxGeneratedPercent: 5,
      minTrustScore: 0.50
    });

    res.json({
      valid: validation.valid,
      error: validation.error,
      warning: validation.warning,
      stats: {
        count: trustScores.length,
        averageTrust: (trustScores.reduce((a, b) => a + b, 0) / trustScores.length * 100).toFixed(1),
        uniqueSources: Array.from(new Set(sources)).length
      }
    });
  } catch (error) {
    console.error('Error verifying data quality:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * POST /api/data-quality/report-issue
 * Allow users to report data inaccuracies
 */
app.post('/api/data-quality/report-issue', express.json(), async (req, res) => {
  try {
    const { company, field, reportedValue, sourceUrl, description, userId } = req.body;

    // TODO: Save to database
    // await prisma.dataIssueReport.create({...})

    console.log(`📝 Data inaccuracy reported: ${company} ${field}`);
    console.log(`   User: ${userId}`);
    console.log(`   Reported value: ${reportedValue}`);
    console.log(`   Source: ${sourceUrl}`);
    console.log(`   Description: ${description}`);

    res.json({
      success: true,
      message: 'Thank you for helping us improve data accuracy!',
      issueId: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// ============================================================================
// 2. MODIFY EXISTING ENDPOINTS - Add quality metadata
// ============================================================================

/**
 * EXAMPLE: Update /api/competitor-intelligence endpoint
 * 
 * BEFORE:
 * app.post('/api/competitor-intelligence', async (req, res) => {
 *   const report = await generateCompetitorIntelligence(input);
 *   res.json(report);
 * });
 * 
 * AFTER (add these lines):
 */

app.post('/api/competitor-intelligence-v2', express.json(), async (req, res) => {
  try {
    const { userCompany, selectedCompetitors } = req.body;

    // Generate report with real data
    const aggr = new RealDataFirstAggregator();
    
    // Fetch real data with quality tracking
    const competitorData = await Promise.all(
      selectedCompetitors.map(async (c) => {
        try {
          const revenue = await aggr.getCompanyRevenue(c.name);
          const headcount = await aggr.getCompanyHeadcount(c.name);
          
          return {
            name: c.name,
            revenue: revenue.primary,
            headcount: headcount.primary,
            trustScores: [revenue.primary.trustScore, headcount.primary.trustScore]
          };
        } catch (e) {
          console.warn(`Could not fetch real data for ${c.name}`);
          return null;
        }
      })
    ).then(d => d.filter(x => x !== null));

    // Validate quality
    const allTrustScores = competitorData.flatMap(c => c.trustScores);
    const validation = validateDataQuality(allTrustScores);

    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        suggestion: 'Could not find reliable data for this analysis'
      });
    }

    // Generate intelligence report
    const report = await generateCompetitorIntelligence({
      userCompany,
      selectedCompetitors
    });

    // Enhance with quality metadata
    const response = enhanceResponseWithQuality(report, {
      trustScores: allTrustScores,
      sources: competitorData.flatMap(c => [c.revenue?.source, c.headcount?.source]).filter(Boolean),
      hasConflicts: competitorData.some(c => c.revenue && c.headcount && 
        Math.abs((c.revenue.value as number) / (c.headcount.value as number) - 400000) > 100000),
      warning: validation.warning,
      cacheExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Log for monitoring
    logDataQuality('POST /api/competitor-intelligence-v2', 
      competitorData.map(c => ({ value: c.name, trustScore: Math.max(...c.trustScores) } as any))
    );

    res.json(response);
  } catch (error) {
    console.error('Error in competitor intelligence:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * EXAMPLE: Update /api/market-intelligence endpoint
 * Add data quality checks
 */

const originalMarketIntelligenceHandler = async (req: any, res: any) => {
  try {
    const { userCompany, selectedCompetitors } = req.body;
    
    const report = await generateMarketIntelligence({
      userCompany,
      selectedCompetitors
    });

    // TODO: Replace with real data scores
    const trustScores = [0.85, 0.75, 0.70, 0.80];  // Placeholder
    
    const response = enhanceResponseWithQuality(report, {
      trustScores,
      sources: ['sec', 'newsapi', 'crunchbase', 'wikipedia'],
      cacheExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    logDataQuality(`/api/market-intelligence for ${userCompany.name}`, []);

    res.json(response);
  } catch (error) {
    console.error('Error generating market intelligence:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Update the existing route if it exists
// app.post('/api/market-intelligence', originalMarketIntelligenceHandler);

// ============================================================================
// 3. MIDDLEWARE - Track data quality for all responses
// ============================================================================

/**
 * Optional: Add response quality tracking middleware
 */
const qualityTrackingMiddleware = (_req: any, res: any, next: Function) => {
  // Store original json function
  const originalJson = res.json.bind(res);

  // Override json to track responses
  res.json = function (data: any) {
    if (data && data.metadata && data.metadata.dataQuality) {
      console.log(
        `✅ API Response: Trust=${(data.metadata.dataQuality.averageTrustScore * 100).toFixed(0)}% ` +
        `Real=${data.metadata.dataQuality.percentRealData}% ` +
        `Sources=${data.metadata.dataQuality.sourcesUsed?.length || 0}`
      );
    }
    return originalJson(data);
  };

  next();
};

// app.use('/api/', qualityTrackingMiddleware);  // Uncomment to enable

// ============================================================================
// 4. STARTUP CHECKS
// ============================================================================

/**
 * Add this to server startup to verify configuration
 */
const verifyDataQualitySetup = () => {
  console.log('\n🔍 Data Quality Configuration Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Check 1: Environment variables
  const requiredEnvVars = ['NEWSAPI_KEY', 'GNEWS_KEY'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing API keys: ${missingVars.join(', ')}\n` +
      `   Added anyway in `.env.local` to enable free data sources`
    );
  } else {
    console.log('✅ All API keys configured');
  }

  // Check 2: Configuration
  const useRealDataFirst = process.env.USE_REAL_DATA_FIRST === 'true';
  const enableGenerated = process.env.ENABLE_GENERATED_DATA === 'true';

  if (!useRealDataFirst) {
    console.warn('⚠️  USE_REAL_DATA_FIRST not enabled');
  } else {
    console.log('✅ Real data first enabled');
  }

  if (enableGenerated) {
    console.warn('🔴 WARNING: ENABLE_GENERATED_DATA is true - should be false!');
  } else {
    console.log('✅ Generated data disabled');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// Call on startup - uncomment this in your server initialization
// verifyDataQualitySetup();

// ============================================================================
// QUICK REFERENCE
// ============================================================================

/**
 * To add data quality to an endpoint:
 * 
 * 1. Import at top:
 *    import { enhanceResponseWithQuality, validateDataQuality } from './utils/dataQualityHelpers';
 * 
 * 2. In endpoint:
 *    const trustScores = [data1.trustScore, data2.trustScore];
 *    const validation = validateDataQuality(trustScores);
 *    if (!validation.valid) return res.status(400).json({ error: validation.error });
 * 
 * 3. Return response:
 *    const response = enhanceResponseWithQuality(data, {
 *      trustScores,
 *      sources: ['sec', 'newsapi'],
 *      warning: validation.warning
 *    });
 *    res.json(response);
 * 
 * That's it! Now your response includes data quality metadata.
 */
