/**
 * 🏢 Vietnamese Firmographic Data Sources
 *
 * Connector skeletons for 6 Vietnamese data sources.
 * Each source defines fetch logic, parsing, and trust scores.
 * Ready to plug into real APIs when access is obtained.
 *
 * Sources:
 * 1. DangKyKinhDoanh.gov.vn — Business registration, tax code
 * 2. CafeF.vn — Financial statements, ticker data
 * 3. GSO (gso.gov.vn) — Industry workforce, sector stats
 * 4. VCCI — Business rankings, climate data
 * 5. HOSE/HNX/UPCoM — Listed company fundamentals
 * 6. Wikidata — Structured company metadata
 */

import { CompanyProfile } from '../../data/companies';

// ============================================================================
// TYPES
// ============================================================================

export interface FirmographicResult {
    source: string;
    sourceUrl: string;
    trustScore: number;          // 0-1 (1 = government/audited)
    data: Partial<CompanyProfile>;
    rawFields: Record<string, string | number | boolean | string[]>;
    fetchedAt: string;
    cacheKey?: string;
}

export interface FirmographicSource {
    id: string;
    name: string;
    nameVi: string;
    baseUrl: string;
    trustScore: number;
    dataFields: string[];        // What fields this source provides
    rateLimit: number;           // Requests per minute
    requiresAuth: boolean;
    fetch(companyName: string, taxCode?: string): Promise<FirmographicResult | null>;
}

// ============================================================================
// SOURCE REGISTRY
// ============================================================================

export const FIRMOGRAPHIC_SOURCES: FirmographicSource[] = [

    // ─────────────────────────────────────────────────────────
    // 1. DangKyKinhDoanh.gov.vn — Business Registration Portal
    // ─────────────────────────────────────────────────────────
    {
        id: 'dkkd',
        name: 'National Business Registration Portal',
        nameVi: 'Cổng thông tin đăng ký doanh nghiệp',
        baseUrl: 'https://dangkykinhdoanh.gov.vn',
        trustScore: 0.95,
        dataFields: ['name', 'address', 'year', 'size', 'industry'],
        rateLimit: 10,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string): Promise<FirmographicResult | null> {
            // API contract: GET /api/company/search?name={companyName}
            // Response: { maSoThue, tenCongTy, diaChiTruSo, ngayThanhLap, nguoiDaiDien, nganhNgheKinhDoanh }
            try {
                const searchUrl = `https://dangkykinhdoanh.gov.vn/api/company/search?name=${encodeURIComponent(companyName)}`;

                // When live API available, uncomment:
                // const res = await fetch(searchUrl);
                // const data = await res.json();

                // Skeleton return — demonstrates parsing logic
                return {
                    source: 'dkkd',
                    sourceUrl: searchUrl,
                    trustScore: 0.95,
                    data: {
                        // Parsed fields would map:
                        // name: data.tenCongTy,
                        // address: data.diaChiTruSo,
                        // year: new Date(data.ngayThanhLap).getFullYear(),
                    },
                    rawFields: {
                        endpoint: searchUrl,
                        status: 'skeleton',
                        note: 'Requires live API access to dangkykinhdoanh.gov.vn',
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `dkkd_${companyName.toLowerCase().replace(/\s+/g, '_')}`,
                };
            } catch {
                return null;
            }
        },
    },

    // ─────────────────────────────────────────────────────────
    // 2. CafeF.vn — Financial Data & Stock Market
    // ─────────────────────────────────────────────────────────
    {
        id: 'cafef',
        name: 'CafeF Financial Portal',
        nameVi: 'CafeF - Cổng thông tin tài chính',
        baseUrl: 'https://s.cafef.vn',
        trustScore: 0.85,
        dataFields: ['revenue', 'growth', 'ticker', 'exchange', 'revenueVerified'],
        rateLimit: 20,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string): Promise<FirmographicResult | null> {
            // CafeF API: GET https://s.cafef.vn/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol={TICKER}
            // Financial data: https://s.cafef.vn/bao-cao-tai-chinh/{TICKER}/IncSta/2024/0/0/0/bao-cao-ket-qua-kinh-doanh-.chn
            try {
                // For listed companies, CafeF provides:
                // - Revenue (Doanh thu thuần)
                // - Net profit (Lợi nhuận sau thuế)
                // - EPS, P/E, Market Cap
                // - Historical price data

                // Parse logic for CafeF financial statements:
                // 1. Fetch income statement page
                // 2. Parse table rows for "Doanh thu thuần" → revenue
                // 3. Parse "Lợi nhuận sau thuế" → net profit
                // 4. Calculate YoY growth

                return {
                    source: 'cafef',
                    sourceUrl: `https://s.cafef.vn/bao-cao-tai-chinh/${companyName}`,
                    trustScore: 0.85,
                    data: {
                        // ticker: parsed from page,
                        // exchange: 'HOSE' | 'HNX' | 'UPCoM',
                        // revenue: formatted string,
                        // revenueVerified: true, // CafeF pulls from audited reports
                        // revenueYear: 2024,
                        // dataProvenanceNote: `Revenue from ${year} audited financial statement via CafeF`,
                    },
                    rawFields: {
                        endpoint: 'cafef_financial_statement',
                        status: 'skeleton',
                        note: 'CafeF provides audited financial data for all listed companies',
                        parseLogic: 'HTML table → extract "Doanh thu thuần" and "Lợi nhuận sau thuế"',
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `cafef_${companyName.toLowerCase()}`,
                };
            } catch {
                return null;
            }
        },
    },

    // ─────────────────────────────────────────────────────────
    // 3. GSO (gso.gov.vn) — General Statistics Office
    // ─────────────────────────────────────────────────────────
    {
        id: 'gso',
        name: 'General Statistics Office of Vietnam',
        nameVi: 'Tổng cục Thống kê',
        baseUrl: 'https://www.gso.gov.vn',
        trustScore: 0.98,
        dataFields: ['industry', 'size'],
        rateLimit: 5,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string): Promise<FirmographicResult | null> {
            // GSO provides sector-level data, not individual company data
            // Use for: industry classification, workforce benchmarks, sector growth rates
            // API: https://www.gso.gov.vn/px-web-2/?pxid=V0211
            try {
                return {
                    source: 'gso',
                    sourceUrl: 'https://www.gso.gov.vn/px-web-2/',
                    trustScore: 0.98,
                    data: {
                        // GSO enriches at industry level:
                        // - Number of enterprises in sector
                        // - Average employees per enterprise in sector
                        // - Sector contribution to GDP
                    },
                    rawFields: {
                        endpoint: 'gso_enterprise_statistics',
                        status: 'skeleton',
                        note: `GSO provides sector-level stats, not individual company. Query: ${companyName}`,
                        dataType: 'sector_benchmarks',
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `gso_sector_${companyName.toLowerCase()}`,
                };
            } catch {
                return null;
            }
        },
    },

    // ─────────────────────────────────────────────────────────
    // 4. VCCI — Vietnam Chamber of Commerce
    // ─────────────────────────────────────────────────────────
    {
        id: 'vcci',
        name: 'Vietnam Chamber of Commerce and Industry',
        nameVi: 'Phòng Thương mại và Công nghiệp Việt Nam',
        baseUrl: 'https://vcci.com.vn',
        trustScore: 0.88,
        dataFields: ['industry', 'sentiment', 'growth'],
        rateLimit: 5,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string): Promise<FirmographicResult | null> {
            // VCCI publishes: Vietnam Business 500 (VNR500), PCI rankings, business climate surveys
            // Use for: company rankings, industry sentiment, growth trajectory signals
            try {
                return {
                    source: 'vcci',
                    sourceUrl: `https://vcci.com.vn/search?q=${encodeURIComponent(companyName)}`,
                    trustScore: 0.88,
                    data: {
                        // From VNR500 rankings:
                        // - Revenue ranking position
                        // - Industry classification
                        // - Growth trajectory (if multi-year ranking available)
                    },
                    rawFields: {
                        endpoint: 'vcci_vnr500',
                        status: 'skeleton',
                        note: 'VCCI VNR500 provides top company rankings with verified revenue',
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `vcci_${companyName.toLowerCase()}`,
                };
            } catch {
                return null;
            }
        },
    },

    // ─────────────────────────────────────────────────────────
    // 5. HOSE / HNX / UPCoM — Stock Exchange Data
    // ─────────────────────────────────────────────────────────
    {
        id: 'stock_exchange',
        name: 'Vietnam Stock Exchanges',
        nameVi: 'Sở Giao dịch Chứng khoán Việt Nam',
        baseUrl: 'https://www.hsx.vn',
        trustScore: 0.95,
        dataFields: ['ticker', 'exchange', 'revenue', 'revenueVerified', 'size'],
        rateLimit: 15,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string): Promise<FirmographicResult | null> {
            // HOSE API: https://www.hsx.vn/Modules/Listed/Web/SymbolList
            // HNX API: https://www.hnx.vn/vi-vn/cophieu-etfs/chung-khoan-ny.html
            // Provides: ticker, listing date, share count, market cap, sector
            try {
                return {
                    source: 'stock_exchange',
                    sourceUrl: 'https://www.hsx.vn/Modules/Listed/Web/SymbolList',
                    trustScore: 0.95,
                    data: {
                        // ticker: 'FPT',
                        // exchange: 'HOSE',
                        // revenueVerified: true,
                    },
                    rawFields: {
                        endpoint: 'hose_listed_companies',
                        status: 'skeleton',
                        note: `Exchange lookup for: ${companyName}`,
                        exchanges: ['HOSE', 'HNX', 'UPCoM'],
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `exchange_${companyName.toLowerCase()}`,
                };
            } catch {
                return null;
            }
        },
    },

    // ─────────────────────────────────────────────────────────
    // 6. Wikidata — Structured Metadata
    // ─────────────────────────────────────────────────────────
    {
        id: 'wikidata',
        name: 'Wikidata SPARQL',
        nameVi: 'Wikidata',
        baseUrl: 'https://query.wikidata.org',
        trustScore: 0.75,
        dataFields: ['name', 'year', 'address', 'website', 'industry'],
        rateLimit: 30,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string): Promise<FirmographicResult | null> {
            // Wikidata SPARQL query for Vietnamese companies:
            // SELECT ?company ?companyLabel ?inception ?hq ?website WHERE {
            //   ?company wdt:P17 wd:Q881;        # country: Vietnam
            //            wdt:P31/wdt:P279* wd:Q4830453.  # instance of: business
            //   ?company rdfs:label ?label.
            //   FILTER(CONTAINS(LCASE(?label), LCASE("companyName")))
            //   OPTIONAL { ?company wdt:P571 ?inception }
            //   OPTIONAL { ?company wdt:P159 ?hq }
            //   OPTIONAL { ?company wdt:P856 ?website }
            // }
            try {
                const sparqlQuery = encodeURIComponent(
                    `SELECT ?company ?companyLabel ?inception ?website WHERE {
                        ?company wdt:P17 wd:Q881; wdt:P31/wdt:P279* wd:Q4830453.
                        ?company rdfs:label ?label. FILTER(CONTAINS(LCASE(?label), LCASE("${companyName}")))
                        OPTIONAL { ?company wdt:P571 ?inception }
                        OPTIONAL { ?company wdt:P856 ?website }
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "vi,en". }
                    } LIMIT 5`
                );

                return {
                    source: 'wikidata',
                    sourceUrl: `https://query.wikidata.org/sparql?query=${sparqlQuery}`,
                    trustScore: 0.75,
                    data: {
                        // name: from ?companyLabel
                        // year: from ?inception
                        // website: from ?website
                    },
                    rawFields: {
                        endpoint: 'wikidata_sparql',
                        status: 'skeleton',
                        note: `Wikidata SPARQL query for: ${companyName}`,
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `wikidata_${companyName.toLowerCase()}`,
                };
            } catch {
                return null;
            }
        },
    },
];

// ============================================================================
// AGGREGATION LOGIC
// ============================================================================

/**
 * Fetch firmographic data from all available sources for a company
 * Prioritizes by trust score — higher trust sources override lower ones
 */
export async function fetchAllFirmographicData(
    companyName: string,
    taxCode?: string
): Promise<{
    mergedData: Partial<CompanyProfile>;
    sources: FirmographicResult[];
    enrichmentSources: string[];
}> {
    const results: FirmographicResult[] = [];

    // Fetch from all sources in parallel
    const promises = FIRMOGRAPHIC_SOURCES.map(source =>
        source.fetch(companyName, taxCode).catch(() => null)
    );

    const settled = await Promise.all(promises);

    for (const result of settled) {
        if (result) results.push(result);
    }

    // Sort by trust score (highest first) and merge
    results.sort((a, b) => b.trustScore - a.trustScore);

    const mergedData: Partial<CompanyProfile> = {};
    const enrichmentSources: string[] = [];

    for (const result of results) {
        enrichmentSources.push(result.source);
        // Only overwrite if the higher-trust source has the field
        for (const [key, value] of Object.entries(result.data)) {
            if (value !== undefined && value !== null && value !== '') {
                if (!(key in mergedData)) {
                    (mergedData as any)[key] = value;
                }
            }
        }
    }

    return { mergedData, sources: results, enrichmentSources };
}

/**
 * Get the recommended sources for a given data field
 */
export function getSourcesForField(field: keyof CompanyProfile): FirmographicSource[] {
    return FIRMOGRAPHIC_SOURCES.filter(s => s.dataFields.includes(field));
}

export default FIRMOGRAPHIC_SOURCES;
