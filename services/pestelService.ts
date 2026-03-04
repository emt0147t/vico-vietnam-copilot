/**
 * 🧠 PESTEL Analysis Service
 *
 * Generates PESTEL reports for Vietnam market environment.
 * Two-layer approach:
 *   1. Static baseline from pestelData.ts (always available, grounded facts)
 *   2. Gemini AI overlay for industry/company-specific insights (when available)
 *
 * Used by: Market Intelligence page, GTM Strategy, Company Reports
 */

import { GoogleGenAI } from '@google/genai';
import {
    PESTELDimension,
    PESTELDimensionSummary,
    PESTELReport,
    PESTELFactor,
    VIETNAM_PESTEL_FACTORS,
    PESTEL_DIMENSION_META,
    getFactorsByDimension,
    getIndustryRelevantFactors,
    getDimensionScore,
    getOverallPESTELScore,
    TrendDirection,
} from '../data/pestelData';

// ============================================================================
// GEMINI AI CLIENT
// ============================================================================

let geminiInstance: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
    if (geminiInstance) return geminiInstance;
    const apiKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_AI_API_KEY'];
    if (!apiKey) return null;
    geminiInstance = new GoogleGenAI({ apiKey });
    return geminiInstance;
}

// AI response cache
const pestelCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key: string): any | null {
    const entry = pestelCache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
}

function setCache(key: string, data: any): void {
    pestelCache.set(key, { data, ts: Date.now() });
}

// ============================================================================
// TYPES
// ============================================================================

interface AIEnhancedFactor {
    factorId: string;
    additionalInsights: string[];
    adjustedScore?: number;
    companySpecificImpact?: string;
}

interface AIPESTELOverlay {
    enhancedFactors: AIEnhancedFactor[];
    industrySpecificInsights: string[];
    companySpecificInsights: string[];
    overallAssessment: string;
}

// ============================================================================
// CORE SERVICE
// ============================================================================

export const PESTELService = {

    /**
     * Generate a full PESTEL report for a given industry/company
     */
    async generateReport(
        industry?: string,
        companyName?: string
    ): Promise<PESTELReport> {
        const dimensions: PESTELDimension[] = [
            'political', 'economic', 'social', 'technological', 'environmental', 'legal'
        ];

        // Get AI overlay if available
        const aiOverlay = await this.getAIOverlay(industry, companyName);

        // Build dimension summaries
        const dimensionSummaries: PESTELDimensionSummary[] = dimensions.map(dim => {
            const meta = PESTEL_DIMENSION_META[dim];
            let factors = getFactorsByDimension(dim);

            // If industry specified, highlight relevant factors
            if (industry) {
                const relevantIds = getIndustryRelevantFactors(industry).map(f => f.id);
                factors = factors.map(f => ({
                    ...f,
                    // Boost impact for industry-relevant factors
                    impact: relevantIds.includes(f.id) ? f.impact :
                        (f.impact === 'High' ? 'Medium' : f.impact) as PESTELFactor['impact'],
                }));
            }

            // Apply AI enhancements if available
            if (aiOverlay) {
                factors = factors.map(f => {
                    const enhanced = aiOverlay.enhancedFactors.find(e => e.factorId === f.id);
                    if (enhanced) {
                        return {
                            ...f,
                            score: enhanced.adjustedScore || f.score,
                            evidence: [...f.evidence, ...enhanced.additionalInsights],
                        };
                    }
                    return f;
                });
            }

            const score = getDimensionScore(dim);
            const trends = factors.map(f => f.trend);
            const overallTrend: TrendDirection = trends.filter(t => t === 'improving').length > trends.length / 2
                ? 'improving'
                : trends.filter(t => t === 'declining').length > trends.length / 2
                    ? 'declining'
                    : 'stable';

            return {
                dimension: dim,
                label: meta.label,
                labelVi: meta.labelVi,
                icon: meta.icon,
                overallScore: Math.round(score * 10) / 10,
                overallTrend: overallTrend,
                factors,
                summary: this.generateDimensionSummary(dim, factors, score),
            };
        });

        // Calculate overall score
        const overallScore = getOverallPESTELScore(industry);

        // Overall assessment
        const overallAssessment = aiOverlay?.overallAssessment ||
            this.generateOverallAssessment(overallScore, dimensionSummaries, industry, companyName);

        // Data provenance
        const allSources = [...new Set(
            VIETNAM_PESTEL_FACTORS.flatMap(f => f.dataSource.split(', '))
        )];

        return {
            country: 'Vietnam',
            generatedAt: new Date().toISOString(),
            industry,
            company: companyName,
            dimensions: dimensionSummaries,
            overallScore,
            overallAssessment,
            dataProvenance: allSources,
        };
    },

    /**
     * Get AI-enhanced insights (optional Gemini overlay)
     */
    async getAIOverlay(
        industry?: string,
        companyName?: string
    ): Promise<AIPESTELOverlay | null> {
        const gemini = getGemini();
        if (!gemini) return null;

        const cacheKey = `pestel_${industry || 'general'}_${companyName || 'none'}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            const baselineData = this.getBaselineSummary(industry);
            const prompt = `You are a Vietnam market intelligence analyst. Generate PESTEL analysis insights.

Context:
- Country: Vietnam
${industry ? `- Industry: ${industry}` : ''}
${companyName ? `- Company: ${companyName}` : ''}

Baseline data (static, verified):
${baselineData}

Provide a JSON response with:
1. "enhancedFactors": Array of { "factorId": string, "additionalInsights": string[] (2-3 current insights per factor), "adjustedScore": number (1-5, only if significantly different from baseline) }
2. "industrySpecificInsights": string[] (3-5 insights specific to ${industry || 'the Vietnamese market'})
${companyName ? `3. "companySpecificInsights": string[] (3-4 insights specific to ${companyName})` : '3. "companySpecificInsights": []'}
4. "overallAssessment": string (2-3 sentence assessment)

Focus on 2024-2025 developments. Be specific and factual. Respond in English.
Return ONLY valid JSON, no markdown.`;

            const { generateWithFallback } = await import('./geminiHelper');
            const result = await generateWithFallback({
                contents: prompt,
            });

            const text = result.text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            if (!text) return null;

            const parsed = JSON.parse(text) as AIPESTELOverlay;
            setCache(cacheKey, parsed);
            return parsed;

        } catch (error) {
            console.error('PESTEL AI overlay error:', error);
            return null;
        }
    },

    /**
     * Get a quick PESTEL score summary (no AI, fast)
     */
    getQuickScores(_industry?: string): Record<PESTELDimension, { score: number; trend: TrendDirection }> {
        const dimensions: PESTELDimension[] = [
            'political', 'economic', 'social', 'technological', 'environmental', 'legal'
        ];

        const result = {} as Record<PESTELDimension, { score: number; trend: TrendDirection }>;

        for (const dim of dimensions) {
            const factors = getFactorsByDimension(dim);
            const score = getDimensionScore(dim);
            const trends = factors.map(f => f.trend);
            const trend: TrendDirection = trends.filter(t => t === 'improving').length > trends.length / 2
                ? 'improving'
                : trends.filter(t => t === 'declining').length > trends.length / 2
                    ? 'declining'
                    : 'stable';

            result[dim] = { score: Math.round(score * 10) / 10, trend };
        }

        return result;
    },

    /**
     * Generate a baseline summary string (for AI prompt context)
     */
    getBaselineSummary(industry?: string): string {
        const factors = industry ? getIndustryRelevantFactors(industry) : VIETNAM_PESTEL_FACTORS;
        return factors.map(f =>
            `[${f.dimension.toUpperCase()}] ${f.title}: Score ${f.score}/5, Trend: ${f.trend}. ${f.evidence[0]}`
        ).join('\n');
    },

    /**
     * Generate dimension summary text
     */
    generateDimensionSummary(dim: PESTELDimension, factors: PESTELFactor[], score: number): string {
        const meta = PESTEL_DIMENSION_META[dim];
        const trendLabel = factors.filter(f => f.trend === 'improving').length > factors.length / 2
            ? 'positive trajectory' : 'stable conditions';

        const topFactor = factors.sort((a, b) => b.score - a.score)[0];
        if (!topFactor) return `${meta.label} environment scores ${score.toFixed(1)}/5 with ${trendLabel}.`;
        return `${meta.label} environment scores ${score.toFixed(1)}/5 with ${trendLabel}. Key strength: ${topFactor.title} (${topFactor.score}/5).`;
    },

    /**
     * Generate overall assessment text
     */
    generateOverallAssessment(
        score: number,
        dimensions: PESTELDimensionSummary[],
        industry?: string,
        companyName?: string
    ): string {
        const strongest = dimensions.sort((a, b) => b.overallScore - a.overallScore)[0];
        const weakest = [...dimensions].sort((a, b) => a.overallScore - b.overallScore)[0];

        if (!strongest || !weakest) return `Vietnam's macro-environment scores ${score.toFixed(1)}/5 overall.`;

        let assessment = `Vietnam's macro-environment scores ${score.toFixed(1)}/5 overall`;
        if (industry) assessment += ` for the ${industry} sector`;
        assessment += `. Strongest dimension: ${strongest.label} (${strongest.overallScore}/5).`;
        assessment += ` Area requiring attention: ${weakest.label} (${weakest.overallScore}/5).`;

        if (companyName) {
            assessment += ` Companies like ${companyName} should monitor ${weakest.label.toLowerCase()} factors closely.`;
        }

        return assessment;
    },
};

export default PESTELService;
