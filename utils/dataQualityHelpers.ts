/**
 * 🔐 Server-Side Data Quality Utilities
 * 
 * Helper functions for server.ts to add data quality metadata
 * to all API responses
 */

import {
  QualityTrackedData,
  DataQualityScorer,
  VerificationStatus
} from '../services/dataQualityScore';

/**
 * Response wrapper - adds metadata about data quality
 */
export interface EnhancedAPIResponse<T> {
  success: boolean;
  data: T;
  metadata: {
    dataQuality: {
      averageTrustScore?: number;
      percentRealData?: number;
      percentGeneratedData?: number;
      totalDataPoints?: number;
      hasConflicts?: boolean;
      sourcesUsed?: string[];
    };
    lastUpdated: Date;
    cacheExpiry?: Date;
    warning?: string;
  };
}

/**
 * Enhance any API response with data quality metadata
 */
export function enhanceResponseWithQuality<T>(
  data: T,
  options?: {
    trustScores?: number[];
    sources?: string[];
    hasConflicts?: boolean;
    warning?: string;
    cacheExpiry?: Date;
  }
): EnhancedAPIResponse<T> {
  const trustScores = options?.trustScores || [];
  const sources = options?.sources || [];

  const averageTrust =
    trustScores.length > 0
      ? trustScores.reduce((a, b) => a + b, 0) / trustScores.length
      : undefined;

  const generatedCount = trustScores.filter(s => s === 0).length;
  const percentGenerated =
    trustScores.length > 0
      ? (generatedCount / trustScores.length) * 100
      : undefined;

  return {
    success: true,
    data,
    metadata: {
      dataQuality: {
        averageTrustScore: averageTrust,
        percentRealData: averageTrust ? (averageTrust * 100).toFixed(1) : undefined,
        percentGeneratedData: percentGenerated?.toFixed(1),
        totalDataPoints: trustScores.length,
        hasConflicts: options?.hasConflicts,
        sourcesUsed: Array.from(new Set(sources))
      },
      lastUpdated: new Date(),
      cacheExpiry: options?.cacheExpiry,
      warning: options?.warning
    }
  };
}

/**
 * Check if response has too much generated data
 */
export function validateDataQuality(
  trustScores: number[],
  options?: {
    maxGeneratedPercent?: number;
    minTrustScore?: number;
  }
): { valid: boolean; warning?: string; error?: string } {
  const maxGenerated = options?.maxGeneratedPercent ?? 5; // Default: reject if > 5% generated
  const minTrust = options?.minTrustScore ?? 0.50;

  const generatedCount = trustScores.filter(s => s === 0).length;
  const generatedPercent = (generatedCount / trustScores.length) * 100;

  // Check 1: Too much generated data
  if (generatedPercent > maxGenerated) {
    return {
      valid: false,
      error: `Too much generated data (${generatedPercent.toFixed(1)}%) - minimum trust required: ${minTrust * 100}%`
    };
  }

  // Check 2: Average trust too low
  const avgTrust = trustScores.reduce((a, b) => a + b, 0) / trustScores.length;
  if (avgTrust < minTrust) {
    return {
      valid: false,
      error: `Average trust score (${(avgTrust * 100).toFixed(0)}%) below minimum (${minTrust * 100}%)`
    };
  }

  // Check 3: Warning if many low-trust items
  const lowTrustCount = trustScores.filter(s => s < 0.6).length;
  if (lowTrustCount > trustScores.length * 0.3) {
    return {
      valid: true,
      warning: `${lowTrustCount} data points have moderate trust scores (< 60%)`
    };
  }

  return { valid: true };
}

/**
 * Extract trust scores from QualityTrackedData array
 */
export function extractTrustScores(
  dataPoints: QualityTrackedData[]
): number[] {
  return dataPoints.map(d => d.trustScore);
}

/**
 * Extract sources from QualityTrackedData array
 */
export function extractSources(
  dataPoints: QualityTrackedData[]
): string[] {
  return dataPoints.map(d => d.source);
}

/**
 * Check if there are conflicts (significantly different values)
 */
export function detectConflicts(
  dataPoints: QualityTrackedData[]
): boolean {
  if (dataPoints.length < 2) return false;

  // For numeric values
  if (typeof dataPoints[0].value === 'number') {
    const values = dataPoints.map(d => d.value as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const diff = max - min;
    const avg = (max + min) / 2;
    const variationPercent = (diff / avg) * 100;

    // Flag as conflict if > 30% variation
    return variationPercent > 30;
  }

  // For string values, check if different
  return !dataPoints.every(d => d.value === dataPoints[0].value);
}

/**
 * Format trust level for logging/debugging
 */
export function formatTrustLevel(score: number): string {
  if (score >= 0.85) return '🟢 Highly Trusted (85%+)';
  if (score >= 0.70) return '🟢 Trusted (70-84%)';
  if (score >= 0.50) return '🟡 Moderate (50-69%)';
  if (score >= 0.30) return '🟠 Low Trust (30-49%)';
  if (score > 0) return '🔴 Very Low (1-29%)';
  return '⚫ No Trust (Generated)';
}

/**
 * Create data quality report
 */
export function createDataQualityReport(
  dataPoints: QualityTrackedData[]
): {
  summary: string;
  averageTrust: number;
  distribution: Record<string, number>;
  sources: string[];
  warnings: string[];
} {
  const trustScores = extractTrustScores(dataPoints);
  const sources = extractSources(dataPoints);
  const avgTrust = trustScores.reduce((a, b) => a + b, 0) / trustScores.length;

  // Distribution
  const distribution = {
    'highly_trusted': trustScores.filter(s => s >= 0.85).length,
    'trusted': trustScores.filter(s => s >= 0.70 && s < 0.85).length,
    'moderate': trustScores.filter(s => s >= 0.50 && s < 0.70).length,
    'low_trust': trustScores.filter(s => s >= 0.30 && s < 0.50).length,
    'generated': trustScores.filter(s => s === 0).length
  };

  const warnings: string[] = [];

  // Check for issues
  if (distribution.generated > 0) {
    warnings.push(`⚠️ ${distribution.generated} generated data point(s) - should not be displayed`);
  }

  if (avgTrust < 0.60) {
    warnings.push(`⚠️ Low average trust score (${(avgTrust * 100).toFixed(0)}%) - consider finding better sources`);
  }

  if (detectConflicts(dataPoints)) {
    warnings.push(`⚠️ Conflicting values from multiple sources - user should choose`);
  }

  // Stale data check
  const now = Date.now();
  const staleCount = dataPoints.filter(d => {
    const age = now - d.lastUpdated.getTime();
    const daysOld = age / (1000 * 60 * 60 * 24);
    return daysOld > 30;
  }).length;

  if (staleCount > 0) {
    warnings.push(`⚠️ ${staleCount} data point(s) older than 30 days - consider refreshing`);
  }

  const summary = `Data Quality Report: Avg Trust ${(avgTrust * 100).toFixed(0)}% | ${distribution.generated === 0 ? 'No' : distribution.generated} generated | ${Array.from(new Set(sources)).length} sources`;

  return {
    summary,
    averageTrust: avgTrust,
    distribution,
    sources: Array.from(new Set(sources)),
    warnings
  };
}

/**
 * Log data quality metrics for debugging
 */
export function logDataQuality(
  context: string,
  dataPoints: QualityTrackedData[]
): void {
  if (dataPoints.length === 0) {
    console.warn(`[${context}] No data points to analyze`);
    return;
  }

  const report = createDataQualityReport(dataPoints);

  console.log(`\n📊 ${context}`);
  console.log(`   ${report.summary}`);
  console.log(`   Distribution:`, report.distribution);
  console.log(`   Sources: ${report.sources.join(', ')}`);

  if (report.warnings.length > 0) {
    report.warnings.forEach(w => console.warn(`   ${w}`));
  }
}

/**
 * Example usage in server endpoints:
 *
 * // In API endpoint
 * app.get('/api/competitors/:id', async (req, res) => {
 *   const competitor = await getCompetitor(req.params.id);
 *
 *   // Add trust scores to each field
 *   const trustScores = [
 *     competitor.revenue.trustScore,
 *     competitor.headcount.trustScore,
 *     competitor.funding.trustScore
 *   ];
 *
 *   // Validate data quality
 *   const validation = validateDataQuality(trustScores);
 *   if (!validation.valid) {
 *     return res.status(400).json({ error: validation.error });
 *   }
 *
 *   // Enhance response with metadata
 *   const response = enhanceResponseWithQuality(competitor, {
 *     trustScores,
 *     sources: ['sec', 'crunchbase', 'linkedin'],
 *     warning: validation.warning,
 *     cacheExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
 *   });
 *
 *   // Log for monitoring
 *   logDataQuality(`GET /api/competitors/${req.params.id}`, trustScores.map((s, i) => ({
 *     value: Object.values(competitor)[i],
 *     trustScore: s
 *   })));
 *
 *   res.json(response);
 * });
 */
