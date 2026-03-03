/**
 * 🇻🇳 Vietnamese News Feeds — Centralized Registry
 * 
 * Verified RSS/API feeds for Vietnamese business news.
 * All feeds tested and confirmed working.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NewsFeedSource {
    id: string;
    name: string;
    nameVi: string;
    category: 'business' | 'tech' | 'finance' | 'general' | 'industry' | 'startup';
    language: 'vi' | 'en' | 'both';
    rssUrl: string;
    websiteUrl: string;
    trustScore: number;       // 0-1
    updateFrequency: string;  // e.g. "~50 articles/day"
    description: string;
}

// ============================================================================
// VERIFIED VIETNAMESE NEWS FEEDS
// ============================================================================

export const VIETNAMESE_NEWS_FEEDS: NewsFeedSource[] = [
    // ── Business & Economy ─────────────────────────────────────────────────
    {
        id: 'vnexpress_kinhdoanh',
        name: 'VnExpress Business',
        nameVi: 'VnExpress Kinh doanh',
        category: 'business',
        language: 'vi',
        rssUrl: 'https://vnexpress.net/rss/kinh-doanh.rss',
        websiteUrl: 'https://vnexpress.net/kinh-doanh',
        trustScore: 0.85,
        updateFrequency: '~80 articles/day',
        description: 'Vietnam\'s largest online newspaper — business section',
    },
    {
        id: 'vnexpress_startup',
        name: 'VnExpress Startup',
        nameVi: 'VnExpress Khởi nghiệp',
        category: 'startup',
        language: 'vi',
        rssUrl: 'https://vnexpress.net/rss/startup.rss',
        websiteUrl: 'https://vnexpress.net/startup',
        trustScore: 0.85,
        updateFrequency: '~15 articles/day',
        description: 'Startup and innovation news from VnExpress',
    },
    {
        id: 'cafef',
        name: 'CafeF Financial News',
        nameVi: 'CafeF Tài chính',
        category: 'finance',
        language: 'vi',
        rssUrl: 'https://cafef.vn/rss/trang-chu.rss',
        websiteUrl: 'https://cafef.vn',
        trustScore: 0.85,
        updateFrequency: '~100 articles/day',
        description: 'Leading Vietnamese financial news — markets, stocks, economy',
    },
    {
        id: 'cafef_doanhnghiep',
        name: 'CafeF Enterprise',
        nameVi: 'CafeF Doanh nghiệp',
        category: 'business',
        language: 'vi',
        rssUrl: 'https://cafef.vn/rss/doanh-nghiep.rss',
        websiteUrl: 'https://cafef.vn/doanh-nghiep.chn',
        trustScore: 0.85,
        updateFrequency: '~40 articles/day',
        description: 'Vietnamese enterprise and company news from CafeF',
    },
    {
        id: 'theleader',
        name: 'TheLEADER',
        nameVi: 'TheLEADER',
        category: 'business',
        language: 'vi',
        rssUrl: 'https://theleader.vn/rss/home.rss',
        websiteUrl: 'https://theleader.vn',
        trustScore: 0.80,
        updateFrequency: '~25 articles/day',
        description: 'Vietnamese business leadership and strategy news',
    },

    // ── Technology ─────────────────────────────────────────────────────────
    {
        id: 'vnexpress_sohoatech',
        name: 'VnExpress Digital',
        nameVi: 'VnExpress Số hóa',
        category: 'tech',
        language: 'vi',
        rssUrl: 'https://vnexpress.net/rss/so-hoa.rss',
        websiteUrl: 'https://vnexpress.net/so-hoa',
        trustScore: 0.85,
        updateFrequency: '~30 articles/day',
        description: 'Technology and digital transformation news from VnExpress',
    },
    {
        id: 'genk',
        name: 'GenK',
        nameVi: 'GenK',
        category: 'tech',
        language: 'vi',
        rssUrl: 'https://genk.vn/rss/trang-chu.rss',
        websiteUrl: 'https://genk.vn',
        trustScore: 0.75,
        updateFrequency: '~50 articles/day',
        description: 'Vietnamese technology life and gadget news',
    },

    // ── Finance & Stock Market ─────────────────────────────────────────────
    {
        id: 'vietstock',
        name: 'VietStock News',
        nameVi: 'VietStock',
        category: 'finance',
        language: 'vi',
        rssUrl: 'https://vietstock.vn/rss/tin-tuc.rss',
        websiteUrl: 'https://vietstock.vn',
        trustScore: 0.90,
        updateFrequency: '~60 articles/day',
        description: 'Vietnamese stock market and financial data news',
    },

    // ── General News ───────────────────────────────────────────────────────
    {
        id: 'tuoitre_kinhtethitruong',
        name: 'Tuổi Trẻ Economy',
        nameVi: 'Tuổi Trẻ Kinh tế',
        category: 'business',
        language: 'vi',
        rssUrl: 'https://tuoitre.vn/rss/kinh-doanh.rss',
        websiteUrl: 'https://tuoitre.vn/kinh-doanh.htm',
        trustScore: 0.80,
        updateFrequency: '~40 articles/day',
        description: 'Economy and market news from Tuổi Trẻ newspaper',
    },
    {
        id: 'thanhnien_kinhdoanh',
        name: 'Thanh Niên Business',
        nameVi: 'Thanh Niên Kinh doanh',
        category: 'business',
        language: 'vi',
        rssUrl: 'https://thanhnien.vn/rss/kinh-te.rss',
        websiteUrl: 'https://thanhnien.vn/kinh-te/',
        trustScore: 0.80,
        updateFrequency: '~35 articles/day',
        description: 'Business and economic news from Thanh Niên newspaper',
    },

    // ── English-language Vietnam News ──────────────────────────────────────
    {
        id: 'vnexpress_international',
        name: 'VnExpress International',
        nameVi: 'VnExpress Quốc tế',
        category: 'general',
        language: 'en',
        rssUrl: 'https://e.vnexpress.net/rss/news/business.rss',
        websiteUrl: 'https://e.vnexpress.net/news/business',
        trustScore: 0.85,
        updateFrequency: '~20 articles/day',
        description: 'English-language Vietnamese business news from VnExpress International',
    },
    {
        id: 'vietnamnews',
        name: 'Viet Nam News',
        nameVi: 'Viet Nam News',
        category: 'general',
        language: 'en',
        rssUrl: 'https://vietnamnews.vn/rss/economy.rss',
        websiteUrl: 'https://vietnamnews.vn/economy',
        trustScore: 0.80,
        updateFrequency: '~15 articles/day',
        description: 'Official English-language daily of Vietnam — economy section',
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all feeds for a specific category
 */
export function getFeedsByCategory(category: NewsFeedSource['category']): NewsFeedSource[] {
    return VIETNAMESE_NEWS_FEEDS.filter(f => f.category === category);
}

/**
 * Get all RSS URLs (for bulk ingestion)
 */
export function getAllRssUrls(): string[] {
    return VIETNAMESE_NEWS_FEEDS.map(f => f.rssUrl);
}

/**
 * Get feeds above a minimum trust threshold
 */
export function getTrustedFeeds(minTrust: number = 0.80): NewsFeedSource[] {
    return VIETNAMESE_NEWS_FEEDS.filter(f => f.trustScore >= minTrust);
}

/**
 * Get feeds by language
 */
export function getFeedsByLanguage(language: 'vi' | 'en'): NewsFeedSource[] {
    return VIETNAMESE_NEWS_FEEDS.filter(f => f.language === language || f.language === 'both');
}

/**
 * Get business + finance feeds (most relevant for market intelligence)
 */
export function getMarketIntelligenceFeeds(): NewsFeedSource[] {
    return VIETNAMESE_NEWS_FEEDS.filter(
        f => ['business', 'finance', 'startup'].includes(f.category) && f.trustScore >= 0.80
    );
}
