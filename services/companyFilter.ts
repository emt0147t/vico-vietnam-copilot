/**
 * 🎯 Company Data Quality Filter — Scores and tiers companies by data richness
 *
 * Scoring algorithm (0-100, 12 signals):
 * +20: Has website with a working domain
 * +15: Revenue field is populated and credible (> $0)
 * +10: Size > 500 employees
 * +10: Revenue verified (audited financial data)
 * +8:  Has stock ticker (listed company)
 * +8:  Has detailed intro (> 100 chars)
 * +5:  Has logo URL (public visibility)
 * +5:  Revenue > $100M (large company signal)
 * +5:  Has enriched intro (intro_new populated)
 * +5:  Has enriched products (products_new populated)
 * +4:  Has enriched customers (customers_new populated)
 * +5:  Founded > 5 years ago
 *
 * Tiers:
 * - Premium (80+): Rich public data — featured in intelligence reports
 * - Standard (50-79): Moderate data — included with caveats
 * - Basic (<50): Sparse data — shown with limited-data badge
 */

import { CompanyProfile } from '../data/companies';

// ============================================================================
// SCORING
// ============================================================================

/**
 * Parse employee size string to a numeric estimate
 * Handles: "> 5.000 người", "200 - 400 người", "> 80.000 người", etc.
 */
function parseSizeToNumber(size: string): number {
    if (!size) return 0;
    // Handle "> X.XXX" format
    const gtMatch = size.match(/>\s*([\d.,]+)/);
    if (gtMatch && gtMatch[1]) {
        return parseInt(gtMatch[1].replace(/[.,]/g, ''), 10);
    }
    // Handle "X - Y" range format 
    const rangeMatch = size.match(/([\d.,]+)\s*[-–]\s*([\d.,]+)/);
    if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
        const low = parseInt(rangeMatch[1].replace(/[.,]/g, ''), 10);
        const high = parseInt(rangeMatch[2].replace(/[.,]/g, ''), 10);
        return Math.round((low + high) / 2);
    }
    // Direct number
    const numMatch = size.match(/([\d.,]+)/);
    if (numMatch && numMatch[1]) return parseInt(numMatch[1].replace(/[.,]/g, ''), 10);
    return 0;
}

/**
 * Parse revenue string to numeric millions USD
 * Handles: "$500M", "$1.2B", "$65B", "$15M"
 */
function parseRevenueToMillions(revenue: string): number {
    if (!revenue) return 0;
    const match = revenue.match(/\$?([\d.]+)\s*(B|M|K)?/i);
    if (!match || !match[1]) return 0;
    const value = parseFloat(match[1]);
    const unit = (match[2] || 'M').toUpperCase();
    if (unit === 'B') return value * 1000;
    if (unit === 'K') return value / 1000;
    return value; // M
}

/**
 * Calculate data quality score for a company (0–100)
 */
export function scoreCompany(company: CompanyProfile): number {
    let score = 0;

    // +20: Has website
    if (company.website && company.website.trim().length > 0) {
        score += 20;
    }

    // +15: Revenue populated and > $0
    const revenueMM = parseRevenueToMillions(company.revenue);
    if (revenueMM > 0) {
        score += 15;
    }

    // +10: Size > 500 employees
    const headcount = parseSizeToNumber(company.size);
    if (headcount >= 500) {
        score += 10;
    }

    // +10: Revenue verified (audited financial data)
    if (company.revenueVerified) {
        score += 10;
    }

    // +8: Has stock ticker (listed company)
    if (company.ticker && company.ticker.length > 0) {
        score += 8;
    }

    // +8: Detailed intro (> 100 characters)
    const introLen = (company.intro || '').length + (company.intro_new || '').length;
    if (introLen > 100) {
        score += 8;
    }

    // +5: Has logo URL (public visibility)
    if (company.logoUrl && company.logoUrl.length > 0) {
        score += 5;
    }

    // +5: Revenue > $100M (large company signal)
    if (revenueMM >= 100) {
        score += 5;
    }

    // +5: Has enriched intro (intro_new populated)
    if (company.intro_new && company.intro_new.length > 50) {
        score += 5;
    }

    // +5: Has enriched products (products_new populated)
    if (company.products_new && company.products_new.length > 30) {
        score += 5;
    }

    // +4: Has enriched customers (customers_new populated)
    if (company.customers_new && company.customers_new.length > 30) {
        score += 4;
    }

    // +5: Founded > 5 years ago
    const currentYear = new Date().getFullYear();
    if (company.year > 0 && (currentYear - company.year) >= 5) {
        score += 5;
    }

    return Math.min(100, score);
}

/**
 * Determine tier from score
 */
export function getTier(score: number): 'premium' | 'standard' | 'basic' {
    if (score >= 80) return 'premium';
    if (score >= 50) return 'standard';
    return 'basic';
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export interface TierStats {
    total: number;
    premium: number;
    standard: number;
    basic: number;
    averageScore: number;
}

/**
 * Score and assign tiers to all companies (mutates in-place for performance)
 * Returns statistics about the tier distribution
 */
export function scoreAllCompanies(companies: CompanyProfile[]): TierStats {
    let totalScore = 0;
    const stats: TierStats = { total: 0, premium: 0, standard: 0, basic: 0, averageScore: 0 };

    for (const company of companies) {
        const score = scoreCompany(company);
        const tier = getTier(score);

        company.dataScore = score;
        company.dataTier = tier;

        totalScore += score;
        stats.total++;
        stats[tier]++;
    }

    stats.averageScore = stats.total > 0 ? Math.round(totalScore / stats.total) : 0;
    return stats;
}

/**
 * Filter companies by minimum tier
 */
export function filterByTier(
    companies: CompanyProfile[],
    minTier: 'premium' | 'standard' | 'basic' = 'standard'
): CompanyProfile[] {
    const minScore = minTier === 'premium' ? 80 : minTier === 'standard' ? 50 : 0;
    return companies.filter(c => (c.dataScore ?? 0) >= minScore);
}

/**
 * Get companies sorted by data quality score (highest first)
 */
export function getTopCompanies(companies: CompanyProfile[], limit: number = 50): CompanyProfile[] {
    return [...companies]
        .sort((a, b) => (b.dataScore ?? 0) - (a.dataScore ?? 0))
        .slice(0, limit);
}

export default {
    scoreCompany,
    getTier,
    scoreAllCompanies,
    filterByTier,
    getTopCompanies,
    parseSizeToNumber,
    parseRevenueToMillions,
};
