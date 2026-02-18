/**
 * 📊 Data Quality Score System
 * 
 * Calculates trust score/confidence for any data point based on:
 * - Source reliability
 * - Data freshness
 * - Cross-validation status
 * - Historical consistency
 */

export type DataSource = 
  | 'sec' | 'gso' | 'crunchbase' | 'linkedin' | 'newsapi' | 'gnews'
  | 'wikipedia' | 'manual' | 'generated' | 'user_contribution'
  | 'builtwith' | 'g2' | 'trustpilot' | 'unknown';

export enum VerificationStatus {
  VERIFIED = 'verified',           // Cross-verified from 2+ sources
  UNVERIFIED = 'unverified',       // From valid source, not cross-checked
  DISPUTED = 'disputed',           // Conflicting data from multiple sources
  GENERATED = 'generated',         // AI-generated (LOW TRUST)
  CACHED = 'cached',               // From cache as fallback
  USER_VERIFIED = 'user_verified'  // Verified by community
}

/**
 * Data point with quality metadata
 */
export interface QualityTrackedData<T = any> {
  value: T;
  source: DataSource;
  trustScore: number;              // 0.0 - 1.0 (1.0 = highly trustworthy)
  confidence: number;              // 0.0 - 1.0 (data consistency across sources)
  lastUpdated: Date;
  verificationStatus: VerificationStatus;
  citations: Citation[];           // Links to source documents
  isFresh: boolean;                // Within TTL threshold
  validationIssues?: string[];     // Sanity check failures
}

export interface Citation {
  url: string;
  title: string;
  date: Date;
  excerpt?: string;
  accessedDate: Date;
  documentType?: 'filing' | 'news' | 'api' | 'webpage' | 'other';
}

/**
 * Source reliability scores (0-1)
 * Based on: officiality, accuracy track record, update frequency
 */
const SOURCE_TRUST_SCORES: Record<DataSource, number> = {
  'sec': 1.00,                 // US SEC filings (official government)
  'gso': 1.00,                 // Vietnam GSO (official government)
  'crunchbase': 0.85,          // Verified startup database
  'linkedin': 0.80,            // User-reported but well-structured
  'newsapi': 0.75,             // News aggregated from multiple outlets
  'gnews': 0.75,               // Google News aggregation
  'wikipedia': 0.70,           // Community maintained, well-sourced
  'builtwith': 0.75,           // Website technology scanner
  'g2': 0.80,                  // Verified review platform
  'trustpilot': 0.80,          // Verified review platform
  'manual': 0.60,              // User manual entry (less reliable)
  'user_contribution': 0.65,   // Community contributed (needs verification)
  'generated': 0.00,           // AI-generated (NO TRUST)
  'cached': 0.70,              // Cached from valid source
  'unknown': 0.30               // Unknown source (very low trust)
};

/**
 * Main class for calculating data quality scores
 */
export class DataQualityScorer {
  /**
   * Calculate overall trust score for a data point
   * Weights:
   * - Source reliability: 50%
   * - Data freshness: 25%
   * - Cross-validation: 15%
   * - Consistency: 10%
   */
  static calculateTrustScore(data: Omit<QualityTrackedData, 'trustScore'>): number {
    let score = 0;
    
    // 50% weight: Source reliability
    const sourceScore = SOURCE_TRUST_SCORES[data.source] || 0.3;
    score += sourceScore * 0.5;
    
    // 25% weight: Data freshness
    const freshnessScore = this.calculateFreshnessScore(data.lastUpdated);
    score += freshnessScore * 0.25;
    
    // 15% weight: Cross-validation/verification status
    const verificationScore = this.calculateVerificationScore(data.verificationStatus);
    score += verificationScore * 0.15;
    
    // 10% weight: Consistency (if available)
    score += (data.confidence || 0.5) * 0.10;
    
    // Penalty for generated data (never trust)
    if (data.source === 'generated') {
      score = 0;
    }
    
    return Math.min(1.0, Math.max(0, score));
  }

  /**
   * Calculate freshness score based on age
   */
  private static calculateFreshnessScore(lastUpdated: Date): number {
    const ageMs = Date.now() - lastUpdated.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    
    // Decay over time
    if (ageDays <= 7) return 1.0;        // Perfect score < 1 week
    if (ageDays <= 30) return 0.9;       // 90% score < 1 month
    if (ageDays <= 90) return 0.7;       // 70% score < 3 months
    if (ageDays <= 365) return 0.4;      // 40% score < 1 year
    return 0.1;                           // 10% score > 1 year (very stale)
  }

  /**
   * Get verification score based on status
   */
  private static calculateVerificationScore(status: VerificationStatus): number {
    const scores: Record<VerificationStatus, number> = {
      'verified': 1.0,           // Cross-verified from multiple sources
      'user_verified': 0.95,     // Community verified
      'unverified': 0.7,         // From valid source, not cross-checked
      'cached': 0.65,            // From cache (degraded)
      'disputed': 0.3,           // Conflicting data exists
      'generated': 0.0            // AI-generated, no trust
    };
    return scores[status] || 0.5;
  }

  /**
   * Get trust level labels for UI
   */
  static getTrustLevel(score: number): {
    level: 'highly_trusted' | 'trusted' | 'moderate' | 'low_trust' | 'unreliable';
    color: 'green' | 'blue' | 'yellow' | 'orange' | 'red';
    icon: 'check' | 'info' | 'alert' | 'warning' | 'error';
  } {
    if (score >= 0.85) return { level: 'highly_trusted', color: 'green', icon: 'check' };
    if (score >= 0.70) return { level: 'trusted', color: 'blue', icon: 'check' };
    if (score >= 0.50) return { level: 'moderate', color: 'yellow', icon: 'info' };
    if (score >= 0.30) return { level: 'low_trust', color: 'orange', icon: 'alert' };
    return { level: 'unreliable', color: 'red', icon: 'error' };
  }

  /**
   * Is this data point acceptable for display?
   */
  static isAcceptable(score: number, threshold: number = 0.50): boolean {
    // Never accept generated data
    if (score === 0) return false;
    return score >= threshold;
  }

  /**
   * Should this data be shown to user?
   * Returns: true = show, false = filter out
   */
  static shouldDisplay(data: QualityTrackedData, minimumTrust: number = 0.50): boolean {
    // Always hide generated data
    if (data.source === 'generated') return false;
    
    // Check trust score threshold
    return data.trustScore >= minimumTrust;
  }

  /**
   * Sort data by trust/freshness
   */
  static rankByTrustScore(dataPoints: QualityTrackedData[]): QualityTrackedData[] {
    return [...dataPoints]
      .filter(d => d.trustScore > 0)  // Remove generated
      .sort((a, b) => {
        // Primary sort: trust score (descending)
        if (b.trustScore !== a.trustScore) {
          return b.trustScore - a.trustScore;
        }
        // Secondary sort: freshness (newer first)
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      });
  }
}

/**
 * Data quality validator
 * Checks for impossible/unreasonable values
 */
export class DataValidator {
  /**
   * Validate company data for logical consistency
   */
  static validateCompanyData(company: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Revenue validation
    if (company.revenue !== undefined && company.revenue !== null) {
      if (company.revenue < 0) {
        issues.push({
          field: 'revenue',
          severity: 'error',
          message: 'Revenue cannot be negative',
          value: company.revenue
        });
      }
      if (company.revenue > 1_000_000_000_000) {
        issues.push({
          field: 'revenue',
          severity: 'warning',
          message: 'Revenue > $1 trillion - verify this is not a data entry error',
          value: company.revenue
        });
      }
    }

    // Headcount validation
    if (company.headcount !== undefined && company.headcount !== null) {
      if (company.headcount < 0) {
        issues.push({
          field: 'headcount',
          severity: 'error',
          message: 'Employee count cannot be negative',
          value: company.headcount
        });
      }
      
      // Check headcount vs revenue consistency
      if (company.revenue && company.headcount > 0) {
        const revenuePerEmployee = company.revenue / company.headcount;
        if (revenuePerEmployee < 100000) {
          // Average is ~$500k per employee
          issues.push({
            field: 'headcount',
            severity: 'warning',
            message: 'Headcount seems too high relative to revenue',
            value: company.headcount
          });
        }
        if (revenuePerEmployee > 10_000_000) {
          issues.push({
            field: 'headcount',
            severity: 'warning',
            message: 'Headcount seems too low relative to revenue',
            value: company.headcount
          });
        }
      }
    }

    // Founding date validation
    if (company.foundingYear) {
      const currentYear = new Date().getFullYear();
      if (company.foundingYear > currentYear) {
        issues.push({
          field: 'foundingYear',
          severity: 'error',
          message: 'Founding year is in the future',
          value: company.foundingYear
        });
      }
      if (company.foundingYear < 1800) {
        issues.push({
          field: 'foundingYear',
          severity: 'warning',
          message: 'Founding year seems too old',
          value: company.foundingYear
        });
      }
    }

    // Growth rate validation
    if (company.revenueGrowth !== undefined) {
      if (Math.abs(company.revenueGrowth) > 500) {
        issues.push({
          field: 'revenueGrowth',
          severity: 'warning',
          message: `Revenue growth of ${company.revenueGrowth}% seems extreme - verify`,
          value: company.revenueGrowth
        });
      }
    }

    return issues;
  }

  /**
   * Check if news is recent/relevant
   */
  static validateNews(news: { publishedAt?: string | Date; content?: string }): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (news.publishedAt) {
      const date = new Date(news.publishedAt);
      const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (ageDays > 365) {
        issues.push({
          field: 'publishedAt',
          severity: 'info',
          message: `News is ${Math.floor(ageDays)} days old`,
          value: news.publishedAt
        });
      }
    }

    if (!news.content || news.content.length < 10) {
      issues.push({
        field: 'content',
        severity: 'warning',
        message: 'News content is very short or empty',
        value: news.content
      });
    }

    return issues;
  }
}

export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  value?: any;
}

/**
 * Helper to create quality-tracked data
 */
export function createQualityData<T>(
  value: T,
  source: DataSource,
  options?: {
    citations?: Citation[];
    confidence?: number;
    verificationStatus?: VerificationStatus;
    lastUpdated?: Date;
  }
): QualityTrackedData<T> {
  const lastUpdated = options?.lastUpdated || new Date();
  const verificationStatus = options?.verificationStatus || VerificationStatus.UNVERIFIED;

  const data: Omit<QualityTrackedData<T>, 'trustScore'> = {
    value,
    source,
    confidence: options?.confidence ?? 0.5,
    lastUpdated,
    verificationStatus,
    citations: options?.citations || [],
    isFresh: lastUpdated.getTime() > (Date.now() - 7 * 24 * 60 * 60 * 1000),
  };

  const trustScore = DataQualityScorer.calculateTrustScore(data);
  return { ...data, trustScore };
}

/**
 * Example usage:
 * 
 * // Create quality-tracked data from SEC filing
 * const revenue = createQualityData(
 *   500_000_000,
 *   'sec',
 *   {
 *     citations: [{
 *       url: 'https://www.sec.gov/...',
 *       title: '10-K Filing for 2023',
 *       date: new Date('2024-01-15'),
 *       accessedDate: new Date(),
 *       documentType: 'filing'
 *     }],
 *     verificationStatus: VerificationStatus.VERIFIED,
 *     confidence: 1.0  // SEC data is highly consistent
 *   }
 * );
 * 
 * console.log(revenue.trustScore);  // ~0.95 (highly trusted)
 */
