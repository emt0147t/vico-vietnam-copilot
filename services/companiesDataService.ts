/**
 * Companies Data Service
 * Provides real company data from CSV enriched database
 * Used by: Market & Industry, Competitor Analysis, Customer Insights pages
 * 
 * Data source: 100% real (companies.csv) - zero AI-generated data
 */

import * as fs from 'fs';
import * as path from 'path';

export interface EnrichedCompany {
  name: string;
  website?: string;
  address: string;
  intro: string;
  employees: string;
  taxId?: string;
  products: string;
  representative?: string;
  yearFounded?: number;
  intro_new?: string;
  products_new?: string;
  customers_new?: string;
  revenue?: string;
  growth?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  industry?: string;
  source: 'CSV';
  lastUpdated: string;
}

interface CompaniesDatabase {
  totalCompanies: number;
  lastUpdated: string;
  industries: { [key: string]: number };
  companies: EnrichedCompany[];
}

class CompaniesDataService {
  private static instance: CompaniesDataService;
  private database: CompaniesDatabase | null = null;
  private dbPath = path.join(process.cwd(), 'data', 'companies-enriched.json');

  private constructor() {}

  static getInstance(): CompaniesDataService {
    if (!CompaniesDataService.instance) {
      CompaniesDataService.instance = new CompaniesDataService();
    }
    return CompaniesDataService.instance;
  }

  /**
   * Load companies database from JSON file
   */
  private loadDatabase(): CompaniesDatabase {
    if (this.database) return this.database;

    try {
      const data = fs.readFileSync(this.dbPath, 'utf-8');
      this.database = JSON.parse(data);
      console.log(`✓ Loaded ${this.database!.totalCompanies} companies from ${this.dbPath}`);
      return this.database!;
    } catch (error) {
      console.error(`❌ Error loading companies database: ${error}`);
      throw new Error('Companies database not found. Run: npm run crawl:csv');
    }
  }

  /**
   * Get all companies
   */
  getAllCompanies(limit?: number): EnrichedCompany[] {
    const db = this.loadDatabase();
    return limit ? db.companies.slice(0, limit) : db.companies;
  }

  /**
   * Get companies by industry
   */
  getCompaniesByIndustry(industry: string): EnrichedCompany[] {
    const db = this.loadDatabase();
    return db.companies.filter((c) => c.industry === industry);
  }

  /**
   * Get companies by size
   */
  getCompaniesBySize(size: string): EnrichedCompany[] {
    const db = this.loadDatabase();
    return db.companies.filter((c) => c.employees === size);
  }

  /**
   * Search companies by name or keyword
   */
  searchCompanies(query: string, limit: number = 50): EnrichedCompany[] {
    const db = this.loadDatabase();
    const q = query.toLowerCase();

    return db.companies
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.intro.toLowerCase().includes(q) ||
          c.products.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      )
      .slice(0, limit);
  }

  /**
   * Get companies by sentiment
   */
  getCompaniesBySentiment(sentiment: 'Positive' | 'Neutral' | 'Negative', limit?: number): EnrichedCompany[] {
    const db = this.loadDatabase();
    const filtered = db.companies.filter((c) => c.sentiment === sentiment);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  /**
   * Get top companies by growth rate
   */
  getTopCompaniesByGrowth(limit: number = 20): EnrichedCompany[] {
    const db = this.loadDatabase();
    return db.companies
      .filter((c) => c.growth !== undefined)
      .sort((a, b) => (b.growth || 0) - (a.growth || 0))
      .slice(0, limit);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalCompanies: number;
    byIndustry: { [key: string]: number };
    bySize: { [key: string]: number };
    bySentiment: { [key: string]: number };
    averageGrowth: number;
    averageFoundingYear: number;
  } {
    const db = this.loadDatabase();

    const bySize: { [key: string]: number } = {};
    const bySentiment: { [key: string]: number } = {};
    let totalGrowth = 0;
    let growthCount = 0;
    let totalYear = 0;
    let yearCount = 0;

    db.companies.forEach((c) => {
      bySize[c.employees] = (bySize[c.employees] || 0) + 1;
      bySentiment[c.sentiment || 'Neutral'] = (bySentiment[c.sentiment || 'Neutral'] || 0) + 1;

      if (c.growth !== undefined) {
        totalGrowth += c.growth;
        growthCount++;
      }

      if (c.yearFounded) {
        totalYear += c.yearFounded;
        yearCount++;
      }
    });

    return {
      totalCompanies: db.totalCompanies,
      byIndustry: db.industries,
      bySize,
      bySentiment,
      averageGrowth: growthCount > 0 ? Math.round(totalGrowth / growthCount * 10) / 10 : 0,
      averageFoundingYear: yearCount > 0 ? Math.round(totalYear / yearCount) : 0,
    };
  }

  /**
   * Get unique industries
   */
  getIndustries(): string[] {
    const db = this.loadDatabase();
    return Object.keys(db.industries).sort();
  }

  /**
   * Get unique employee sizes
   */
  getEmployeeSizes(): string[] {
    const db = this.loadDatabase();
    const sizes = new Set(db.companies.map((c) => c.employees));
    return Array.from(sizes).sort();
  }

  /**
   * Get random companies (for sampling/demo)
   */
  getRandomCompanies(count: number = 10): EnrichedCompany[] {
    const db = this.loadDatabase();
    const shuffled = [...db.companies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get company by name
   */
  getCompanyByName(name: string): EnrichedCompany | undefined {
    const db = this.loadDatabase();
    return db.companies.find((c) => c.name === name);
  }
}

export default CompaniesDataService;
