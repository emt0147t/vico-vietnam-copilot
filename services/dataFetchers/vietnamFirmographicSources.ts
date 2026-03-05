/**
 * 🏢 Vietnamese Firmographic Data Sources
 *
 * Connector implementations for Vietnamese data sources.
 * Each source defines fetch logic, parsing, and trust scores.
 *
 * Sources:
 * 1. DangKyKinhDoanh.gov.vn — Business registration, tax code  [skeleton — no public API]
 * 2. CafeF.vn — Financial statements, ticker data              [LIVE ✅]
 * 3. GSO (gso.gov.vn) — Industry workforce, sector stats       [skeleton — sector level only]
 * 4. VCCI — Business rankings, climate data                    [skeleton — no public API]
 * 5. HOSE/HNX/UPCoM — Listed company fundamentals             [LIVE via CafeF ✅]
 * 6. Wikidata — Structured company metadata                    [LIVE ✅ via SPARQL]
 */

import { CompanyProfile } from '../../data/companies';
import { fetchCafeFFinancials, fetchCafeFStock } from '../cafefLiveFetcher';

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
    dataFields: string[];
    rateLimit: number;           // Requests per minute
    requiresAuth: boolean;
    fetch(companyName: string, taxCode?: string, ticker?: string): Promise<FirmographicResult | null>;
}

// ============================================================================
// SOURCE REGISTRY
// ============================================================================

export const FIRMOGRAPHIC_SOURCES: FirmographicSource[] = [

    // ─────────────────────────────────────────────────────────
    // 1. DangKyKinhDoanh.gov.vn — Business Registration Portal
    // Status: skeleton — portal has no public REST API
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
            // No public API available. The portal requires browser-based access.
            // TODO: Integrate if official API or partner access is obtained.
            const searchUrl = `https://dangkykinhdoanh.gov.vn/vn/Pages/Trangchu.aspx?s=${encodeURIComponent(companyName)}`;
            return {
                source: 'dkkd',
                sourceUrl: searchUrl,
                trustScore: 0.0,   // Returns 0 because no data fetched
                data: {},
                rawFields: {
                    status: 'no_public_api',
                    note: 'dangkykinhdoanh.gov.vn has no public REST API. Manual lookup required at: ' + searchUrl,
                },
                fetchedAt: new Date().toISOString(),
                cacheKey: `dkkd_${companyName.toLowerCase().replace(/\s+/g, '_')}`,
            };
        },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CafeF.vn — Financial Data & Stock Market  [LIVE ✅]
    // Uses cafefLiveFetcher to get real audited financial statements
    // Works for companies with a Vietnamese stock ticker (HOSE/HNX/UPCoM)
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'cafef',
        name: 'CafeF Financial Portal',
        nameVi: 'CafeF - Cổng thông tin tài chính',
        baseUrl: 'https://s.cafef.vn',
        trustScore: 0.85,
        dataFields: ['revenue', 'growth', 'ticker', 'exchange', 'revenueVerified'],
        rateLimit: 20,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string, ticker?: string): Promise<FirmographicResult | null> {
            if (!ticker) {
                // CafeF financial data requires a ticker — skip for private companies
                return {
                    source: 'cafef',
                    sourceUrl: `https://cafef.vn/search/?keywords=${encodeURIComponent(companyName)}`,
                    trustScore: 0.0,
                    data: {},
                    rawFields: {
                        status: 'no_ticker',
                        note: `CafeF financial data requires a stock ticker. ${companyName} may be a private company.`,
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `cafef_noticker_${companyName.toLowerCase()}`,
                };
            }

            try {
                const currentYear = new Date().getFullYear();
                const [financials, stock] = await Promise.all([
                    fetchCafeFFinancials(ticker, currentYear),
                    fetchCafeFStock(ticker),
                ]);

                if (!financials && !stock) return null;

                const financialsUrl = `https://s.cafef.vn/bao-cao-tai-chinh/${ticker}/IncSta/${currentYear}/0/0/0/bao-cao-ket-qua-kinh-doanh-.chn`;

                const data: Partial<CompanyProfile> = {};

                if (financials) {
                    if (financials.revenueUSD > 0) {
                        (data as any).revenue = `~$${financials.revenueUSD}M (FY${financials.year}, CafeF)`;
                        (data as any).revenueVerified = true;
                        (data as any).revenueYear = financials.year;
                        (data as any).dataProvenanceNote = `Revenue from FY${financials.year} financial statement via CafeF`;
                    }
                    if (financials.revenueGrowthYoY !== 0) {
                        (data as any).growth = financials.revenueGrowthYoY;
                    }
                }

                if (stock) {
                    (data as any).ticker = stock.ticker;
                    (data as any).exchange = stock.exchange;
                }

                return {
                    source: 'cafef',
                    sourceUrl: financialsUrl,
                    trustScore: 0.85,
                    data,
                    rawFields: {
                        ticker,
                        status: 'live',
                        revenueVNDbillions: financials?.revenue ?? 0,
                        revenueUSDmillions: financials?.revenueUSD ?? 0,
                        netProfitVNDbillions: financials?.netProfit ?? 0,
                        lastPrice: stock?.lastPrice ?? 0,
                        exchange: stock?.exchange ?? '',
                        fetchYear: currentYear,
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `cafef_${ticker.toLowerCase()}_${currentYear}`,
                };
            } catch (e) {
                console.warn(`[CafeF firmographic] fetch failed for ${ticker}:`, e);
                return null;
            }
        },
    },

    // ─────────────────────────────────────────────────────────
    // 3. GSO (gso.gov.vn) — General Statistics Office
    // Status: sector-level data only, no company-level API
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

        async fetch(_companyName: string, _taxCode?: string): Promise<FirmographicResult | null> {
            // GSO provides sector-level statistics, not individual company data.
            // API (PX-Web) is available for aggregate queries but not per-company lookup.
            return {
                source: 'gso',
                sourceUrl: 'https://www.gso.gov.vn/px-web-2/',
                trustScore: 0.0,
                data: {},
                rawFields: {
                    status: 'sector_level_only',
                    note: 'GSO provides sector benchmarks, not individual company data. Use for industry size/growth context.',
                    apiDocs: 'https://www.gso.gov.vn/px-web-2/?pxid=V0211',
                },
                fetchedAt: new Date().toISOString(),
            };
        },
    },

    // ─────────────────────────────────────────────────────────
    // 4. VCCI — Vietnam Chamber of Commerce
    // Status: skeleton — no public API for VNR500 data
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
            // VCCI VNR500 rankings are published as PDF/Excel reports, not through a public API.
            return {
                source: 'vcci',
                sourceUrl: `https://vcci.com.vn/search?q=${encodeURIComponent(companyName)}`,
                trustScore: 0.0,
                data: {},
                rawFields: {
                    status: 'no_public_api',
                    note: 'VCCI VNR500 rankings are PDF-only. Integrate manually or via PDF parsing when annual report is published.',
                    reportUrl: 'https://vcci.com.vn/bao-cao',
                },
                fetchedAt: new Date().toISOString(),
                cacheKey: `vcci_${companyName.toLowerCase()}`,
            };
        },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 5. HOSE / HNX / UPCoM — Stock Exchange Data  [LIVE via CafeF ✅]
    // Uses cafefLiveFetcher.fetchCafeFStock() for real-time stock data
    // ─────────────────────────────────────────────────────────────────────────
    {
        id: 'stock_exchange',
        name: 'Vietnam Stock Exchanges (via CafeF)',
        nameVi: 'Sở Giao dịch Chứng khoán Việt Nam',
        baseUrl: 'https://www.hsx.vn',
        trustScore: 0.95,
        dataFields: ['ticker', 'exchange', 'revenue', 'revenueVerified', 'size'],
        rateLimit: 15,
        requiresAuth: false,

        async fetch(companyName: string, _taxCode?: string, ticker?: string): Promise<FirmographicResult | null> {
            if (!ticker) {
                return {
                    source: 'stock_exchange',
                    sourceUrl: 'https://www.hsx.vn/Modules/Listed/Web/SymbolList',
                    trustScore: 0.0,
                    data: {},
                    rawFields: {
                        status: 'no_ticker',
                        note: `No ticker provided for ${companyName}. This source only supports listed companies.`,
                    },
                    fetchedAt: new Date().toISOString(),
                };
            }

            try {
                const stock = await fetchCafeFStock(ticker);
                if (!stock) return null;

                return {
                    source: 'stock_exchange',
                    sourceUrl: `https://www.hsx.vn/Modules/Listed/Web/StockDetail/${ticker}`,
                    trustScore: 0.95,
                    data: {
                        ticker: stock.ticker,
                        exchange: stock.exchange,
                        revenueVerified: true,
                    } as any,
                    rawFields: {
                        status: 'live',
                        ticker,
                        exchange: stock.exchange,
                        lastPrice: stock.lastPrice,
                        changePercent: stock.change,
                        peRatio: stock.peRatio,
                        marketCap: stock.marketCap,
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `exchange_${ticker.toLowerCase()}`,
                };
            } catch (e) {
                console.warn(`[Stock Exchange firmographic] fetch failed for ${ticker}:`, e);
                return null;
            }
        },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Wikidata — Structured Metadata  [LIVE ✅ via public SPARQL endpoint]
    // ─────────────────────────────────────────────────────────────────────────
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
            try {
                const sparql = `
                    SELECT ?company ?companyLabel ?inception ?website WHERE {
                        ?company wdt:P17 wd:Q881; wdt:P31/wdt:P279* wd:Q4830453.
                        ?company rdfs:label ?label.
                        FILTER(CONTAINS(LCASE(?label), LCASE("${companyName.replace(/"/g, '')}")))
                        OPTIONAL { ?company wdt:P571 ?inception }
                        OPTIONAL { ?company wdt:P856 ?website }
                        SERVICE wikibase:label { bd:serviceParam wikibase:language "vi,en". }
                    } LIMIT 3`;

                const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;

                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/sparql-results+json',
                        'User-Agent': 'VICO-MarketIntelligence/1.0 (https://vico.ai; contact@vico.ai)',
                    },
                    signal: AbortSignal.timeout(10_000),
                });

                if (!response.ok) return null;

                const json = await response.json() as any;
                const bindings = json?.results?.bindings ?? [];

                if (bindings.length === 0) return null;

                const top = bindings[0];
                const foundedYear = top.inception?.value
                    ? new Date(top.inception.value).getFullYear()
                    : undefined;
                const website = top.website?.value ?? undefined;
                const label = top.companyLabel?.value ?? undefined;

                return {
                    source: 'wikidata',
                    sourceUrl: url,
                    trustScore: 0.75,
                    data: {
                        ...(label && { name: label }),
                        ...(foundedYear && { year: foundedYear }),
                        ...(website && { website }),
                    } as Partial<CompanyProfile>,
                    rawFields: {
                        status: 'live',
                        resultCount: bindings.length,
                        foundedYear: foundedYear ?? 'unknown',
                        website: website ?? 'unknown',
                    },
                    fetchedAt: new Date().toISOString(),
                    cacheKey: `wikidata_${companyName.toLowerCase().replace(/\s+/g, '_')}`,
                };
            } catch (e) {
                console.warn(`[Wikidata firmographic] fetch failed for ${companyName}:`, e);
                return null;
            }
        },
    },
];

// ============================================================================
// AGGREGATION LOGIC
// ============================================================================

/**
 * Fetch firmographic data from all available sources for a company.
 * Higher-trust sources override lower-trust ones field-by-field.
 *
 * @param ticker  Optional stock ticker — enables CafeF and stock-exchange sources
 */
export async function fetchAllFirmographicData(
    companyName: string,
    taxCode?: string,
    ticker?: string,
): Promise<{
    mergedData: Partial<CompanyProfile>;
    sources: FirmographicResult[];
    enrichmentSources: string[];
}> {
    // Fetch from all sources in parallel
    const promises = FIRMOGRAPHIC_SOURCES.map(source =>
        source.fetch(companyName, taxCode, ticker).catch(() => null)
    );

    const settled = await Promise.all(promises);
    const results: FirmographicResult[] = settled.filter((r): r is FirmographicResult => r !== null);

    // Sort by trust score (highest first) and merge, skipping empty results
    results.sort((a, b) => b.trustScore - a.trustScore);

    const mergedData: Partial<CompanyProfile> = {};
    const enrichmentSources: string[] = [];

    for (const result of results) {
        if (result.trustScore === 0) continue; // Skip sources that returned no data
        enrichmentSources.push(result.source);
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
