/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🏆 VERIFIED DATA SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Bridges the verified-first dataset with:
 *   1. Static curated data (verifiedCompanies.ts)
 *   2. Live CafeF financial data (cafefLiveFetcher.ts)
 *   3. Live Google News RSS (existing rss-parser in server.ts)
 *
 * Provides a unified API for the server to serve verified company data
 * with full provenance metadata to the frontend.
 */

import {
  VERIFIED_COMPANIES,
  toCompanyProfile,
  getVerifiedDataStats,
  getConfidenceBadge,
  getSourceLabel,
  type VerifiedCompany,
  type DataProvenance,
  type DataSourceType,
} from '../data/verifiedCompanies';

import {
  fetchCafeFStock,
  fetchCafeFFinancials,
  fetchAllListedCompanyData,
  type CafeFStockData,
  type CafeFFinancials,
} from './cafefLiveFetcher';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface VerifiedCompanyResponse {
  company: VerifiedCompany;
  legacyProfile: any; // CompanyProfile-compatible for backward compat
  liveData?: {
    stock?: CafeFStockData | null;
    financials?: CafeFFinancials | null;
  };
  provenanceSummary: ProvenanceSummary;
}

export interface ProvenanceSummary {
  totalFields: number;
  verifiedFields: number;
  estimatedFields: number;
  aiGeneratedFields: number;
  verificationRate: number;    // 0-100%
  overallConfidence: number;   // 0-1
  topSources: { source: DataSourceType; count: number; label: string }[];
  badge: { label: string; color: string; bg: string };
}

export interface VerifiedDashboardData {
  companies: VerifiedCompanyResponse[];
  stats: ReturnType<typeof getVerifiedDataStats>;
  refreshedAt: string;
}

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE (live data refreshed every 30 minutes)
// ════════════════════════════════════════════════════════════════════════════

interface LiveDataCache {
  data: Map<string, { stock: CafeFStockData | null; financials: CafeFFinancials | null }>;
  lastRefresh: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let liveDataCache: LiveDataCache = {
  data: new Map(),
  lastRefresh: 0,
};

/**
 * Refresh CafeF live data for all listed companies (FPT, VNZ, CMG).
 * Uses the cache if data is less than 30 minutes old.
 */
async function refreshLiveData(forceRefresh = false): Promise<Map<string, { stock: CafeFStockData | null; financials: CafeFFinancials | null }>> {
  const now = Date.now();

  if (!forceRefresh && liveDataCache.data.size > 0 && (now - liveDataCache.lastRefresh) < CACHE_TTL_MS) {
    return liveDataCache.data;
  }

  try {
    console.log('📈 Refreshing CafeF live data for listed companies...');
    const data = await fetchAllListedCompanyData();
    liveDataCache = { data, lastRefresh: now };
    console.log(`✅ CafeF live data refreshed: ${data.size} companies`);
    return data;
  } catch (error) {
    console.warn('⚠️ CafeF live data refresh failed, using cache:', error);
    return liveDataCache.data;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PROVENANCE ANALYSIS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Analyze the provenance of all fields in a VerifiedCompany and produce a summary.
 */
function analyzeProvenance(vc: VerifiedCompany): ProvenanceSummary {
  // Collect all VerifiedField provenance records
  const fields: DataProvenance[] = [
    vc.name.provenance,
    vc.legalName.provenance,
    vc.taxCode.provenance,
    vc.address.provenance,
    vc.foundedYear.provenance,
    vc.website.provenance,
    vc.revenue.provenance,
    vc.revenueNumericUSD.provenance,
    vc.headcount.provenance,
    vc.totalFunding.provenance,
    vc.techStack.provenance,
    vc.description.provenance,
    vc.products.provenance,
    vc.customers.provenance,
    vc.growth.provenance,
    vc.keyPainPoints.provenance,
    vc.targetAudience.provenance,
    ...vc.recentEvents.map(e => e.provenance),
  ];
  if (vc.ticker.provenance) fields.push(vc.ticker.provenance);
  if (vc.exchange.provenance) fields.push(vc.exchange.provenance);

  const totalFields = fields.length;
  const verifiedFields = fields.filter(f => f.isVerified && f.confidence >= 0.80).length;
  const estimatedFields = fields.filter(f => !f.isVerified && f.source !== 'ai_generated').length;
  const aiGeneratedFields = fields.filter(f => f.source === 'ai_generated').length;

  const verificationRate = totalFields > 0 ? Math.round((verifiedFields / totalFields) * 100) : 0;
  const overallConfidence = totalFields > 0
    ? parseFloat((fields.reduce((sum, f) => sum + f.confidence, 0) / totalFields).toFixed(2))
    : 0;

  // Count sources
  const sourceCounts = new Map<DataSourceType, number>();
  for (const f of fields) {
    sourceCounts.set(f.source, (sourceCounts.get(f.source) || 0) + 1);
  }
  const topSources = [...sourceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count, label: getSourceLabel(source) }));

  const badge = getConfidenceBadge(overallConfidence);

  return {
    totalFields,
    verifiedFields,
    estimatedFields,
    aiGeneratedFields,
    verificationRate,
    overallConfidence,
    topSources,
    badge,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get all 15 verified companies with provenance summary (no live data).
 * Fast — pure static data, no HTTP calls.
 */
export function getAllVerifiedCompanies(): VerifiedCompanyResponse[] {
  return VERIFIED_COMPANIES.map(vc => ({
    company: vc,
    legacyProfile: toCompanyProfile(vc),
    provenanceSummary: analyzeProvenance(vc),
  }));
}

/**
 * Get a single verified company by ID.
 */
export function getVerifiedCompanyById(id: string): VerifiedCompanyResponse | null {
  const vc = VERIFIED_COMPANIES.find(c => c.id === id);
  if (!vc) return null;
  return {
    company: vc,
    legacyProfile: toCompanyProfile(vc),
    provenanceSummary: analyzeProvenance(vc),
  };
}

/**
 * Get a single verified company by name (case-insensitive partial match).
 */
export function getVerifiedCompanyByName(name: string): VerifiedCompanyResponse | null {
  const lower = name.toLowerCase();
  const vc = VERIFIED_COMPANIES.find(c =>
    c.name.value.toLowerCase().includes(lower) ||
    c.legalName.value.toLowerCase().includes(lower)
  );
  if (!vc) return null;
  return {
    company: vc,
    legacyProfile: toCompanyProfile(vc),
    provenanceSummary: analyzeProvenance(vc),
  };
}

/**
 * Get all verified companies WITH live CafeF data attached (for listed companies).
 * This makes HTTP calls to CafeF — use caching via refreshLiveData().
 */
export async function getAllVerifiedCompaniesWithLiveData(): Promise<VerifiedDashboardData> {
  const liveData = await refreshLiveData();

  const companies: VerifiedCompanyResponse[] = VERIFIED_COMPANIES.map(vc => {
    const ticker = vc.ticker.value;
    const live = ticker ? liveData.get(ticker) : undefined;

    return {
      company: vc,
      legacyProfile: toCompanyProfile(vc),
      liveData: live ? { stock: live.stock, financials: live.financials } : undefined,
      provenanceSummary: analyzeProvenance(vc),
    };
  });

  return {
    companies,
    stats: getVerifiedDataStats(),
    refreshedAt: new Date().toISOString(),
  };
}

/**
 * Get a single verified company with live CafeF data (if listed).
 */
export async function getVerifiedCompanyWithLiveData(id: string): Promise<VerifiedCompanyResponse | null> {
  const vc = VERIFIED_COMPANIES.find(c => c.id === id);
  if (!vc) return null;

  let liveStock: CafeFStockData | null = null;
  let liveFinancials: CafeFFinancials | null = null;

  if (vc.isListed && vc.ticker.value) {
    try {
      [liveStock, liveFinancials] = await Promise.all([
        fetchCafeFStock(vc.ticker.value),
        fetchCafeFFinancials(vc.ticker.value),
      ]);
    } catch (error) {
      console.warn(`⚠️ Live data fetch failed for ${vc.ticker.value}:`, error);
    }
  }

  return {
    company: vc,
    legacyProfile: toCompanyProfile(vc),
    liveData: {
      stock: liveStock,
      financials: liveFinancials,
    },
    provenanceSummary: analyzeProvenance(vc),
  };
}

/**
 * Force-refresh the CafeF live data cache.
 */
export async function forceRefreshLiveData(): Promise<{ success: boolean; tickers: string[]; timestamp: string }> {
  try {
    const data = await refreshLiveData(true);
    return {
      success: true,
      tickers: [...data.keys()],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      tickers: [],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get the verified companies as legacy CompanyProfile[] for backward compatibility.
 * This is used by companyLoader to merge verified companies into the main list.
 */
export function getVerifiedCompanyProfilesForMerge(): any[] {
  return VERIFIED_COMPANIES.map(toCompanyProfile);
}

/**
 * Get overall verified data statistics.
 */
export function getStats() {
  return getVerifiedDataStats();
}

/**
 * Search verified companies by query string.
 */
export function searchVerifiedCompanies(query: string): VerifiedCompanyResponse[] {
  const lower = query.toLowerCase();
  return VERIFIED_COMPANIES
    .filter(vc =>
      vc.name.value.toLowerCase().includes(lower) ||
      vc.legalName.value.toLowerCase().includes(lower) ||
      vc.industry.toLowerCase().includes(lower) ||
      vc.subIndustry.toLowerCase().includes(lower) ||
      vc.products.value.toLowerCase().includes(lower) ||
      vc.description.value.toLowerCase().includes(lower)
    )
    .map(vc => ({
      company: vc,
      legacyProfile: toCompanyProfile(vc),
      provenanceSummary: analyzeProvenance(vc),
    }));
}

/**
 * Get list of verified company IDs for quick lookup.
 */
export function getVerifiedCompanyIds(): string[] {
  return VERIFIED_COMPANIES.map(c => c.id);
}

/**
 * Check if a company name is in the verified dataset.
 */
export function isVerifiedCompany(name: string): boolean {
  const lower = name.toLowerCase();
  return VERIFIED_COMPANIES.some(c =>
    c.name.value.toLowerCase() === lower ||
    c.legalName.value.toLowerCase() === lower
  );
}
