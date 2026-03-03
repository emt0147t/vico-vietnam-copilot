/**
 * 📊 Data Quality Monitor — Background service for data freshness tracking
 * 
 * Responsibilities:
 * - Re-scores company data quality periodically
 * - Flags stale profiles (>30 days since last enrichment)
 * - Reports overall platform data coverage metrics
 * - Provides API endpoint data for admin dashboard
 */

import { CompanyProfile } from '../data/companies';
import { scoreAllCompanies, TierStats } from './companyFilter';

// ============================================================================
// TYPES
// ============================================================================

export interface DataQualityReport {
    generatedAt: string;
    tierStats: TierStats;
    coverageMetrics: {
        withWebsite: number;
        withRevenue: number;
        withLogo: number;
        withDetailedIntro: number;
    };
    staleProfiles: number;
    dataIntegrityScore: number; // 0-100 overall platform score
}

export interface DataProvenanceLabel {
    source: 'verified' | 'ai_analyzed' | 'estimated' | 'unavailable';
    label: string;
    emoji: string;
    color: string;
    description: string;
}

// ============================================================================
// DATA PROVENANCE STANDARDS
// ============================================================================

/**
 * Standardized provenance labels used across the platform
 * Every data point displayed to users should carry one of these labels
 */
export const DATA_PROVENANCE: Record<string, DataProvenanceLabel> = {
    verified: {
        source: 'verified',
        label: 'Verified',
        emoji: '🟢',
        color: 'text-green-600',
        description: 'From official sources (HOSE filings, company website, annual reports)',
    },
    ai_analyzed: {
        source: 'ai_analyzed',
        label: 'AI Analyzed',
        emoji: '🔵',
        color: 'text-blue-600',
        description: 'Gemini AI with Google Search grounding (web-verified)',
    },
    estimated: {
        source: 'estimated',
        label: 'Estimated',
        emoji: '🟡',
        color: 'text-yellow-600',
        description: 'AI analysis without web verification, or industry benchmarks',
    },
    unavailable: {
        source: 'unavailable',
        label: 'Unavailable',
        emoji: '⚪',
        color: 'text-gray-400',
        description: 'No data available — not fabricated',
    },
};

// ============================================================================
// QUALITY SCORING
// ============================================================================

/**
 * Generate a comprehensive data quality report for all companies
 */
export function generateQualityReport(companies: CompanyProfile[]): DataQualityReport {
    // Re-score all companies
    const tierStats = scoreAllCompanies(companies);

    // Coverage metrics
    const coverageMetrics = {
        withWebsite: companies.filter(c => c.website && c.website.trim().length > 0).length,
        withRevenue: companies.filter(c => c.revenue && c.revenue !== '$0').length,
        withLogo: companies.filter(c => c.logoUrl && c.logoUrl.length > 0).length,
        withDetailedIntro: companies.filter(c => (c.intro || '').length > 100).length,
    };

    // Stale profiles (no enrichment in 30 days, or never enriched)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const staleProfiles = companies.filter(c => {
        if (!c.lastEnriched) return true; // Never enriched = stale
        return new Date(c.lastEnriched) < thirtyDaysAgo;
    }).length;

    // Overall data integrity score (weighted average of coverage)
    const total = companies.length || 1;
    const websiteCoverage = coverageMetrics.withWebsite / total;
    const revenueCoverage = coverageMetrics.withRevenue / total;
    const logoCoverage = coverageMetrics.withLogo / total;
    const introCoverage = coverageMetrics.withDetailedIntro / total;
    const freshnessScore = 1 - (staleProfiles / total);

    const dataIntegrityScore = Math.round(
        (websiteCoverage * 0.3 +
            revenueCoverage * 0.25 +
            logoCoverage * 0.15 +
            introCoverage * 0.15 +
            freshnessScore * 0.15) * 100
    );

    return {
        generatedAt: new Date().toISOString(),
        tierStats,
        coverageMetrics,
        staleProfiles,
        dataIntegrityScore,
    };
}

/**
 * Check if a company profile needs re-enrichment
 */
export function needsEnrichment(company: CompanyProfile, maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): boolean {
    if (!company.lastEnriched) return true;
    return Date.now() - new Date(company.lastEnriched).getTime() > maxAgeMs;
}

/**
 * Get the appropriate provenance label for a data point
 */
export function getProvenanceLabel(
    source: 'verified' | 'ai_analyzed' | 'estimated' | 'unavailable'
): DataProvenanceLabel {
    return DATA_PROVENANCE[source] ?? DATA_PROVENANCE['unavailable']!;
}

/**
 * Mark a company as freshly enriched
 */
export function markEnriched(
    company: CompanyProfile,
    sources: string[] = ['companyFilter']
): void {
    company.lastEnriched = new Date().toISOString();
    company.enrichmentSources = sources;
    company.dataScore = undefined; // Force re-scoring
    company.dataTier = undefined;
}

export default {
    generateQualityReport,
    needsEnrichment,
    getProvenanceLabel,
    markEnriched,
    DATA_PROVENANCE,
};
