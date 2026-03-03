/**
 * Companies Data Service — Refactored for 500+ companies
 *
 * Changes from original:
 * - Merges COMPANIES + EXPANSION_COMPANIES on load
 * - Deduplicates by name (expansion overrides original if same name)
 * - Builds index maps for O(1) lookups by name, ticker, industry
 * - Auto-scores all companies via companyFilter.scoreAllCompanies()
 * - Adds pagination, multi-field filtering, tier-based queries
 *
 * Data sources:
 *   - data/companies.ts (original 243 curated profiles)
 *   - data/companiesExpansion.ts (100+ additional verified companies)
 */

import { CompanyProfile, COMPANIES } from '../data/companies';
import { EXPANSION_COMPANIES } from '../data/companiesExpansion';
import { scoreAllCompanies, TierStats } from './companyFilter';

// ============================================================================
// FILTER INTERFACE
// ============================================================================

export interface CompanyFilter {
  industry?: string;
  minScore?: number;
  tier?: 'premium' | 'standard' | 'basic';
  exchange?: 'HOSE' | 'HNX' | 'UPCoM' | 'private' | 'foreign';
  hasRevenue?: boolean;
  hasVerifiedRevenue?: boolean;
  hasTicker?: boolean;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  query?: string;          // free-text search across name, intro, products
  minGrowth?: number;
  maxGrowth?: number;
  minYear?: number;
  maxYear?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// SERVICE
// ============================================================================

class CompaniesDataService {
  private static instance: CompaniesDataService;
  private companies: CompanyProfile[] = [];
  private loaded = false;

  // Index maps for O(1) lookups
  private nameIndex = new Map<string, CompanyProfile>();
  private tickerIndex = new Map<string, CompanyProfile>();
  private industryIndex = new Map<string, CompanyProfile[]>();

  // Tier stats computed at load time
  private _tierStats: TierStats | null = null;

  private constructor() { }

  static getInstance(): CompaniesDataService {
    if (!CompaniesDataService.instance) {
      CompaniesDataService.instance = new CompaniesDataService();
    }
    return CompaniesDataService.instance;
  }

  // ==========================================================================
  // DATABASE LOADING
  // ==========================================================================

  /**
   * Load, merge, deduplicate, score, and index all companies
   */
  private loadDatabase(): CompanyProfile[] {
    if (this.loaded) return this.companies;

    // 1. Merge original + expansion
    const allRaw = [...COMPANIES, ...EXPANSION_COMPANIES];

    // 2. Deduplicate by normalized name (expansion wins on conflict)
    const seen = new Map<string, CompanyProfile>();
    for (const company of allRaw) {
      const key = company.name.toLowerCase().trim();
      seen.set(key, company); // Later entries (expansion) override earlier ones
    }
    this.companies = Array.from(seen.values());

    // 3. Score and assign tiers
    this._tierStats = scoreAllCompanies(this.companies);

    // 4. Build index maps
    this.buildIndexes();

    this.loaded = true;
    console.log(`✓ Loaded ${this.companies.length} companies (${COMPANIES.length} original + ${EXPANSION_COMPANIES.length} expansion, ${this.companies.length} unique after dedup)`);
    console.log(`  Tiers: ${this._tierStats.premium} premium, ${this._tierStats.standard} standard, ${this._tierStats.basic} basic (avg score: ${this._tierStats.averageScore})`);
    return this.companies;
  }

  /**
   * Build index maps for fast lookups
   */
  private buildIndexes(): void {
    this.nameIndex.clear();
    this.tickerIndex.clear();
    this.industryIndex.clear();

    for (const company of this.companies) {
      // Name index (case-insensitive)
      this.nameIndex.set(company.name.toLowerCase().trim(), company);

      // Ticker index
      if (company.ticker) {
        this.tickerIndex.set(company.ticker.toUpperCase(), company);
      }

      // Industry index
      const industry = company.industry;
      if (!this.industryIndex.has(industry)) {
        this.industryIndex.set(industry, []);
      }
      this.industryIndex.get(industry)!.push(company);
    }
  }

  // ==========================================================================
  // BASIC QUERIES (backwards-compatible)
  // ==========================================================================

  getAllCompanies(limit?: number): CompanyProfile[] {
    const companies = this.loadDatabase();
    return limit ? companies.slice(0, limit) : companies;
  }

  getCompaniesByIndustry(industry: string): CompanyProfile[] {
    this.loadDatabase();
    return this.industryIndex.get(industry) || [];
  }

  getCompaniesBySize(size: string): CompanyProfile[] {
    const companies = this.loadDatabase();
    return companies.filter((c) => c.size === size);
  }

  searchCompanies(query: string, limit: number = 50): CompanyProfile[] {
    const companies = this.loadDatabase();
    const q = query.toLowerCase();

    return companies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.intro.toLowerCase().includes(q) ||
          c.products.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          (c.ticker && c.ticker.toLowerCase().includes(q))
      )
      .slice(0, limit);
  }

  getCompaniesBySentiment(sentiment: 'Positive' | 'Neutral' | 'Negative', limit?: number): CompanyProfile[] {
    const companies = this.loadDatabase();
    const filtered = companies.filter((c) => c.sentiment === sentiment);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  getTopCompaniesByGrowth(limit: number = 20): CompanyProfile[] {
    const companies = this.loadDatabase();
    return companies
      .filter((c) => c.growth !== undefined)
      .sort((a, b) => (b.growth || 0) - (a.growth || 0))
      .slice(0, limit);
  }

  getListedCompanies(): CompanyProfile[] {
    const companies = this.loadDatabase();
    return companies.filter((c) => c.ticker);
  }

  getVerifiedCompanies(): CompanyProfile[] {
    const companies = this.loadDatabase();
    return companies.filter((c) => c.revenueVerified);
  }

  getCompanyByName(name: string): CompanyProfile | undefined {
    this.loadDatabase();
    return this.nameIndex.get(name.toLowerCase().trim());
  }

  getCompanyByTicker(ticker: string): CompanyProfile | undefined {
    this.loadDatabase();
    return this.tickerIndex.get(ticker.toUpperCase());
  }

  // ==========================================================================
  // NEW: ADVANCED QUERIES
  // ==========================================================================

  /**
   * Multi-field filtering with pagination
   */
  getCompaniesPaginated(
    page: number = 1,
    pageSize: number = 50,
    filter?: CompanyFilter
  ): PaginatedResult<CompanyProfile> {
    const all = this.filterCompanies(filter);
    const total = all.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return { items, total, page, pageSize, totalPages };
  }

  /**
   * Apply multi-field filter (no pagination)
   */
  filterCompanies(filter?: CompanyFilter): CompanyProfile[] {
    if (!filter) return this.loadDatabase();

    let results: CompanyProfile[];

    // Start with industry index if specified (fast path)
    if (filter.industry) {
      this.loadDatabase();
      results = [...(this.industryIndex.get(filter.industry) || [])];
    } else {
      results = [...this.loadDatabase()];
    }

    // Apply remaining filters
    if (filter.minScore !== undefined) {
      results = results.filter(c => (c.dataScore ?? 0) >= filter.minScore!);
    }
    if (filter.tier) {
      results = results.filter(c => c.dataTier === filter.tier);
    }
    if (filter.exchange) {
      results = results.filter(c => c.exchange === filter.exchange);
    }
    if (filter.hasRevenue) {
      results = results.filter(c => c.revenue && c.revenue !== '$0');
    }
    if (filter.hasVerifiedRevenue) {
      results = results.filter(c => c.revenueVerified === true);
    }
    if (filter.hasTicker) {
      results = results.filter(c => !!c.ticker);
    }
    if (filter.sentiment) {
      results = results.filter(c => c.sentiment === filter.sentiment);
    }
    if (filter.minGrowth !== undefined) {
      results = results.filter(c => (c.growth || 0) >= filter.minGrowth!);
    }
    if (filter.maxGrowth !== undefined) {
      results = results.filter(c => (c.growth || 0) <= filter.maxGrowth!);
    }
    if (filter.minYear !== undefined) {
      results = results.filter(c => c.year >= filter.minYear!);
    }
    if (filter.maxYear !== undefined) {
      results = results.filter(c => c.year <= filter.maxYear!);
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.intro.toLowerCase().includes(q) ||
        c.products.toLowerCase().includes(q) ||
        (c.ticker && c.ticker.toLowerCase().includes(q))
      );
    }

    return results;
  }

  /**
   * Get companies by data tier
   */
  getByDataTier(tier: 'premium' | 'standard' | 'basic'): CompanyProfile[] {
    return this.filterCompanies({ tier });
  }

  /**
   * Get companies by stock exchange
   */
  getByExchange(exchange: 'HOSE' | 'HNX' | 'UPCoM'): CompanyProfile[] {
    return this.filterCompanies({ exchange });
  }

  /**
   * Get enrichment candidates — basic-tier companies that would benefit from data sourcing
   */
  getEnrichmentCandidates(limit: number = 50): CompanyProfile[] {
    const companies = this.loadDatabase();
    return companies
      .filter(c => (c.dataScore ?? 0) < 50) // basic tier
      .sort((a, b) => (a.dataScore ?? 0) - (b.dataScore ?? 0)) // worst first
      .slice(0, limit);
  }

  /**
   * Get tier distribution statistics
   */
  getTierStats(): TierStats {
    this.loadDatabase();
    return this._tierStats!;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStatistics(): {
    totalCompanies: number;
    byIndustry: { [key: string]: number };
    bySize: { [key: string]: number };
    bySentiment: { [key: string]: number };
    listedCompanies: number;
    verifiedRevenue: number;
    averageGrowth: number;
    averageFoundingYear: number;
    tierStats: TierStats;
    byExchange: { [key: string]: number };
  } {
    const companies = this.loadDatabase();

    const byIndustry: { [key: string]: number } = {};
    const bySize: { [key: string]: number } = {};
    const bySentiment: { [key: string]: number } = {};
    const byExchange: { [key: string]: number } = {};
    let totalGrowth = 0;
    let growthCount = 0;
    let totalYear = 0;
    let yearCount = 0;
    let listedCount = 0;
    let verifiedCount = 0;

    companies.forEach((c) => {
      byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1;
      bySize[c.size] = (bySize[c.size] || 0) + 1;
      bySentiment[c.sentiment || 'Neutral'] = (bySentiment[c.sentiment || 'Neutral'] || 0) + 1;

      if (c.exchange) {
        byExchange[c.exchange] = (byExchange[c.exchange] || 0) + 1;
      }

      if (c.growth !== undefined) {
        totalGrowth += c.growth;
        growthCount++;
      }

      if (c.year) {
        totalYear += c.year;
        yearCount++;
      }

      if (c.ticker) listedCount++;
      if (c.revenueVerified) verifiedCount++;
    });

    return {
      totalCompanies: companies.length,
      byIndustry,
      bySize,
      bySentiment,
      byExchange,
      listedCompanies: listedCount,
      verifiedRevenue: verifiedCount,
      averageGrowth: growthCount > 0 ? Math.round(totalGrowth / growthCount * 10) / 10 : 0,
      averageFoundingYear: yearCount > 0 ? Math.round(totalYear / yearCount) : 0,
      tierStats: this._tierStats!,
    };
  }

  getIndustries(): string[] {
    this.loadDatabase();
    return Array.from(this.industryIndex.keys()).sort();
  }

  getEmployeeSizes(): string[] {
    const companies = this.loadDatabase();
    const sizes = new Set(companies.map((c) => c.size));
    return Array.from(sizes).sort();
  }

  getSampleCompanies(count: number = 10): CompanyProfile[] {
    const companies = this.loadDatabase();
    return companies.slice(0, count);
  }
}

export default CompaniesDataService;
