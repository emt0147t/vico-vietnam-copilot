/**
 * 🇻🇳 Vietnamese Data Sources — Central Registry
 * 
 * All data sources used by VICO with trust scores, types, and metadata.
 * Every piece of data in the platform should be traceable to one of these sources.
 */

// ============================================================================
// DATA SOURCE DEFINITIONS
// ============================================================================

export interface DataSourceDefinition {
    id: string;
    name: string;
    nameVi: string;
    trust: number;          // 0.0 - 1.0 trust score
    type: 'government' | 'association' | 'financial_media' | 'news' | 'international_org' | 'financial_data' | 'web_analytics';
    url: string;
    apiAvailable: boolean;
    updateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
    dataTypes: string[];
    license: string;
}

export const VIETNAM_DATA_SOURCES: Record<string, DataSourceDefinition> = {
    // ── Government Sources (Trust: 0.95-1.0) ──────────────────────────────
    GSO: {
        id: 'gso',
        name: 'General Statistics Office',
        nameVi: 'Tổng cục Thống kê',
        trust: 1.0,
        type: 'government',
        url: 'https://www.gso.gov.vn',
        apiAvailable: false,
        updateFrequency: 'monthly',
        dataTypes: ['GDP', 'CPI', 'trade_balance', 'population', 'employment', 'industrial_output'],
        license: 'Public domain (Government of Vietnam)',
    },
    CUSTOMS: {
        id: 'customs',
        name: 'Vietnam Customs',
        nameVi: 'Tổng cục Hải quan',
        trust: 1.0,
        type: 'government',
        url: 'https://www.customs.gov.vn',
        apiAvailable: false,
        updateFrequency: 'monthly',
        dataTypes: ['export_value', 'import_value', 'trade_partners', 'commodity_data'],
        license: 'Public domain (Government of Vietnam)',
    },
    MPI: {
        id: 'mpi',
        name: 'Ministry of Planning and Investment',
        nameVi: 'Bộ Kế hoạch và Đầu tư',
        trust: 1.0,
        type: 'government',
        url: 'https://www.mpi.gov.vn',
        apiAvailable: false,
        updateFrequency: 'monthly',
        dataTypes: ['FDI', 'business_registration', 'investment_data'],
        license: 'Public domain (Government of Vietnam)',
    },
    SBV: {
        id: 'sbv',
        name: 'State Bank of Vietnam',
        nameVi: 'Ngân hàng Nhà nước Việt Nam',
        trust: 1.0,
        type: 'government',
        url: 'https://www.sbv.gov.vn',
        apiAvailable: false,
        updateFrequency: 'daily',
        dataTypes: ['interest_rates', 'exchange_rates', 'monetary_policy', 'banking_statistics'],
        license: 'Public domain (Government of Vietnam)',
    },

    // ── Industry Associations (Trust: 0.90-0.95) ──────────────────────────
    VCCI: {
        id: 'vcci',
        name: 'Vietnam Chamber of Commerce and Industry',
        nameVi: 'Phòng Thương mại và Công nghiệp Việt Nam',
        trust: 0.95,
        type: 'association',
        url: 'https://www.vcci.com.vn',
        apiAvailable: false,
        updateFrequency: 'monthly',
        dataTypes: ['business_climate', 'industry_reports', 'PCI_index', 'trade_promotion'],
        license: 'Public reference',
    },
    VINASA: {
        id: 'vinasa',
        name: 'Vietnam Software Association',
        nameVi: 'Hiệp hội Phần mềm và Dịch vụ CNTT Việt Nam',
        trust: 0.90,
        type: 'association',
        url: 'https://www.vinasa.com.vn',
        apiAvailable: false,
        updateFrequency: 'quarterly',
        dataTypes: ['IT_industry_report', 'software_export', 'tech_company_ranking'],
        license: 'Public reference',
    },

    // ── International Organizations (Trust: 1.0) ──────────────────────────
    WORLD_BANK: {
        id: 'world_bank',
        name: 'World Bank',
        nameVi: 'Ngân hàng Thế giới',
        trust: 1.0,
        type: 'international_org',
        url: 'https://data.worldbank.org/country/vietnam',
        apiAvailable: true,
        updateFrequency: 'annual',
        dataTypes: ['GDP_growth', 'inflation', 'FDI', 'poverty_rate', 'ease_of_business'],
        license: 'CC BY-4.0',
    },
    IMF: {
        id: 'imf',
        name: 'International Monetary Fund',
        nameVi: 'Quỹ Tiền tệ Quốc tế',
        trust: 1.0,
        type: 'international_org',
        url: 'https://www.imf.org/en/Countries/VNM',
        apiAvailable: true,
        updateFrequency: 'quarterly',
        dataTypes: ['GDP_forecast', 'inflation_forecast', 'current_account', 'fiscal_balance'],
        license: 'Public reference',
    },

    // ── Financial Data (Trust: 0.85-0.90) ─────────────────────────────────
    CAFEF: {
        id: 'cafef',
        name: 'CafeF Financial',
        nameVi: 'CafeF Tài chính',
        trust: 0.85,
        type: 'financial_data',
        url: 'https://cafef.vn',
        apiAvailable: false,
        updateFrequency: 'realtime',
        dataTypes: ['stock_price', 'financial_statements', 'company_revenue', 'market_cap'],
        license: 'Web scraping (terms apply)',
    },
    VIETSTOCK: {
        id: 'vietstock',
        name: 'VietStock',
        nameVi: 'VietStock',
        trust: 0.90,
        type: 'financial_data',
        url: 'https://vietstock.vn',
        apiAvailable: false,
        updateFrequency: 'realtime',
        dataTypes: ['stock_data', 'financial_reports', 'company_profiles', 'market_analysis'],
        license: 'Web scraping (terms apply)',
    },

    // ── News Sources (Trust: 0.75-0.85) ───────────────────────────────────
    VNEXPRESS: {
        id: 'vnexpress',
        name: 'VnExpress',
        nameVi: 'VnExpress',
        trust: 0.85,
        type: 'news',
        url: 'https://vnexpress.net',
        apiAvailable: false,
        updateFrequency: 'realtime',
        dataTypes: ['news', 'business_news', 'tech_news', 'analysis'],
        license: 'RSS feed (public)',
    },
    TUOITRE: {
        id: 'tuoitre',
        name: 'Tuổi Trẻ',
        nameVi: 'Tuổi Trẻ',
        trust: 0.80,
        type: 'news',
        url: 'https://tuoitre.vn',
        apiAvailable: false,
        updateFrequency: 'realtime',
        dataTypes: ['news', 'business_news'],
        license: 'RSS feed (public)',
    },
    THELEADER: {
        id: 'theleader',
        name: 'TheLEADER',
        nameVi: 'TheLEADER',
        trust: 0.80,
        type: 'news',
        url: 'https://theleader.vn',
        apiAvailable: false,
        updateFrequency: 'daily',
        dataTypes: ['business_news', 'startup_news', 'real_estate', 'market_analysis'],
        license: 'RSS feed (public)',
    },
    DEALSTREETASIA: {
        id: 'dealstreetasia',
        name: 'DealStreetAsia',
        nameVi: 'DealStreetAsia',
        trust: 0.85,
        type: 'news',
        url: 'https://www.dealstreetasia.com',
        apiAvailable: false,
        updateFrequency: 'daily',
        dataTypes: ['funding_deals', 'M&A', 'startup_news', 'PE/VC_activity'],
        license: 'Subscription required',
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a data source definition by ID
 */
export function getDataSource(id: string): DataSourceDefinition | undefined {
    return Object.values(VIETNAM_DATA_SOURCES).find(s => s.id === id);
}

/**
 * Get all sources above a minimum trust threshold
 */
export function getTrustedSources(minTrust: number = 0.80): DataSourceDefinition[] {
    return Object.values(VIETNAM_DATA_SOURCES).filter(s => s.trust >= minTrust);
}

/**
 * Get sources by type
 */
export function getSourcesByType(type: DataSourceDefinition['type']): DataSourceDefinition[] {
    return Object.values(VIETNAM_DATA_SOURCES).filter(s => s.type === type);
}

/**
 * Create a provenance label for data display
 */
export function createProvenanceLabel(sourceId: string, year?: number, additionalNote?: string): string {
    const source = getDataSource(sourceId);
    if (!source) return 'Unknown source';

    let label = source.nameVi || source.name;
    if (year) label += ` (${year})`;
    if (additionalNote) label += ` — ${additionalNote}`;
    return label;
}

/**
 * Get trust badge emoji based on trust score
 */
export function getTrustBadge(trust: number): string {
    if (trust >= 0.95) return '🏛️'; // Government/Official
    if (trust >= 0.85) return '📊'; // Verified financial
    if (trust >= 0.75) return '📰'; // News/media
    return '⚠️'; // Low trust
}
