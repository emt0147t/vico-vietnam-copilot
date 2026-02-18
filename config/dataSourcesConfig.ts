/**
 * 🔐 Real Data Sources Configuration
 * 
 * Configures all data sources with priorities and fallback strategies
 * Real Data > Generated Data > Synthetic Data
 */

export const DATA_SOURCES_CONFIG = {
    // ================================================================
    // MARKET & INDUSTRY PAGE
    // ================================================================
    market: {
        marketSize: {
            priority: 'real',
            sources: ['statista', 'trading_economics', 'world_bank'],
            fallback: 'generated',
            cacheTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
            timeout: 10000
        },
        trends: {
            priority: 'real',
            sources: ['newsapi', 'gnews', 'twitter'],
            fallback: 'generated',
            cacheTTL: 24 * 60 * 60 * 1000, // 1 day
            timeout: 10000
        },
        competitiveLandscape: {
            priority: 'real',
            sources: ['crunchbase', 'g2', 'capterra'],
            fallback: 'generated',
            cacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
            timeout: 15000
        }
    },

    // ================================================================
    // COMPETITOR ANALYSIS PAGE
    // ================================================================
    competitor: {
        firmographics: {
            revenue: {
                priority: 'real',
                sources: ['crunchbase', 'sec_edgar', 'alpha_vantage'],
                fallback: 'generated',
                cacheTTL: 30 * 24 * 60 * 60 * 1000
            },
            headcount: {
                priority: 'real',
                sources: ['linkedin', 'apollo', 'rocketreach'],
                fallback: 'generated',
                cacheTTL: 7 * 24 * 60 * 60 * 1000
            },
            funding: {
                priority: 'real',
                sources: ['crunchbase', 'pitchbook'],
                fallback: 'generated',
                cacheTTL: 30 * 24 * 60 * 60 * 1000
            }
        },
        techStack: {
            priority: 'real',
            sources: ['builtwith', 'wappalyzer', 'stackshare'],
            fallback: 'generated',
            cacheTTL: 30 * 24 * 60 * 60 * 1000
        },
        news: {
            priority: 'real',
            sources: ['newsapi', 'gnews', 'mediastack'],
            fallback: 'generated',
            cacheTTL: 24 * 60 * 60 * 1000
        },
        signals: {
            hiringTrends: {
                priority: 'real',
                sources: ['linkedin', 'lever', 'workable'],
                fallback: 'generated',
                cacheTTL: 7 * 24 * 60 * 60 * 1000
            },
            websiteChanges: {
                priority: 'real',
                sources: ['wayback_machine', 'semrush'],
                fallback: 'generated',
                cacheTTL: 7 * 24 * 60 * 60 * 1000
            }
        }
    },

    // ================================================================
    // CUSTOMER INSIGHTS PAGE
    // ================================================================
    customer: {
        customerReviews: {
            priority: 'real',
            sources: ['g2', 'capterra', 'trustpilot'],
            fallback: 'generated',
            cacheTTL: 7 * 24 * 60 * 60 * 1000
        },
        painPoints: {
            priority: 'real',
            sources: ['g2_reviews', 'reddit', 'social_listening', 'support_forums'],
            fallback: 'generated',
            cacheTTL: 30 * 24 * 60 * 60 * 1000
        },
        personas: {
            priority: 'mixed', // Some real (surveys) + generated (synthesis)
            sources: ['surveys', 'interviews', 'analytics'],
            fallback: 'generated',
            cacheTTL: 90 * 24 * 60 * 60 * 1000
        }
    },

    // ================================================================
    // GO-TO-MARKET PAGE
    // ================================================================
    gtm: {
        pricing: {
            priority: 'real',
            sources: ['competitor_websites', 'pricingpages', 'stackshare'],
            fallback: 'generated',
            cacheTTL: 7 * 24 * 60 * 60 * 1000
        },
        marketBenchmarks: {
            priority: 'real',
            sources: ['sec_filings', 'industry_reports', 'gartner'],
            fallback: 'generated',
            cacheTTL: 30 * 24 * 60 * 60 * 1000
        }
    }
};

// ================================================================
// API CREDENTIALS - Load from .env
// ================================================================
export const API_CREDENTIALS = {
    newsApi: {
        key: process.env.NEWSAPI_KEY,
        endpoint: 'https://newsapi.org/v2',
        rateLimit: { requests: 100, period: 24 * 60 * 60 * 1000 },
        docs: 'https://newsapi.org'
    },
    gnews: {
        key: process.env.GNEWS_KEY,
        endpoint: 'https://gnews.io/api/v4',
        rateLimit: { requests: 100, period: 24 * 60 * 60 * 1000 },
        docs: 'https://gnews.io'
    },
    crunchbase: {
        key: process.env.CRUNCHBASE_API_KEY,
        endpoint: 'https://api.crunchbase.com/api/v4',
        rateLimit: { requests: 1000, period: 24 * 60 * 60 * 1000 },
        docs: 'https://www.crunchbase.com/'
    },
    builtwith: {
        key: process.env.BUILTWITH_API_KEY,
        endpoint: 'https://api.builtwith.com/v20',
        rateLimit: { requests: 1000, period: 24 * 60 * 60 * 1000 },
        docs: 'https://builtwith.com/api'
    },
    apolloIo: {
        key: process.env.APOLLO_IO_KEY,
        endpoint: 'https://api.apollo.io/v1',
        rateLimit: { requests: 10000, period: 24 * 60 * 60 * 1000 },
        docs: 'https://www.apollo.io/api'
    },
    rocketreach: {
        key: process.env.ROCKETREACH_KEY,
        endpoint: 'https://api.rocketreach.co/rest/v2',
        rateLimit: { requests: 5000, period: 24 * 60 * 60 * 1000 },
        docs: 'https://app.rocketreach.com/api'
    },
    alphaVantage: {
        key: process.env.ALPHA_VANTAGE_KEY,
        endpoint: 'https://www.alphavantage.co/query',
        rateLimit: { requests: 500, period: 24 * 60 * 60 * 1000 },
        docs: 'https://www.alphavantage.co/'
    },
    iexcloud: {
        key: process.env.IEX_CLOUD_KEY,
        endpoint: 'https://cloud.iexapis.com/stable',
        rateLimit: { requests: 100, period: 60 * 1000 },
        docs: 'https://iexcloud.io/'
    }
};

// ================================================================
// FALLBACK STRATEGIES
// ================================================================
export const FALLBACK_STRATEGY = {
    // 🔴 NEW: Real Data First Strategy (UPDATED)
    useGenerated: false, // ❌ NEVER use AI-generated data as fallback
    requireRealDataOnly: true, // ✅ Only real data from official sources
    fallbackBehavior: 'return_empty', // 'return_empty' | 'use_cached' | 'throw_error'
    
    // Nếu data quá cũ
    maxDataAge: {
        financial: 90 * 24 * 60 * 60 * 1000, // 90 days
        trends: 7 * 24 * 60 * 60 * 1000,    // 7 days
        news: 24 * 60 * 60 * 1000,           // 1 day
        techStack: 30 * 24 * 60 * 60 * 1000  // 30 days
    },

    // Data quality thresholds
    minimumTrustScoreForDisplay: 0.50, // Don't show data with trust < 50%
    requireCitations: true, // Every data point must have source URLs
    detectConflicts: true, // Flag when multiple sources disagree

    // Label generated vs real data
    labelDataSource: true, // Always show which data came from which source
    
    // Retry logic
    maxRetries: 3,
    retryDelay: 2000, // ms
    
    // NEW: Warn if data is from cache/fallback
    warnWhenCached: true,
    warnWhenInferred: true
};

// ================================================================
// DATA QUALITY RULES
// ================================================================
export const DATA_QUALITY_RULES = {
    // Revenue/Financial data phải co source or thay đổi < 500%
    financialReality: {
        maxVariationPercent: 500,
        requireVerification: true
    },

    // Headcounts phải logical (không 0 cho companies lớn)
    headcountReality: {
        minEmployees: 1,
        maxEmployees: 1000000
    },

    // Dates phải valid
    dateReality: {
        notInFuture: true,
        notOlderThan: 50 * 365 * 24 * 60 * 60 * 1000 // 50 years
    }
};

export default DATA_SOURCES_CONFIG;
