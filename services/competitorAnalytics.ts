/**
 * Competitor Analytics Service
 * Tracks and analyzes competitor data, insights, and trends
 */

export interface CompetitorStats {
    total: number;
    byIndustry: Record<string, number>;
    avgSimilarity: number;
    topIndustries: Array<{ industry: string; count: number }>;
    similarityDistribution: {
        high: number;      // > 70%
        medium: number;    // 50-70%
        low: number;       // 30-50%
    };
}

export class CompetitorAnalytics {
    /**
     * Analyze competitor list and generate stats
     */
    static analyzeCompetitors(competitors: any[]): CompetitorStats {
        const byIndustry: Record<string, number> = {};
        let totalSimilarity = 0;

        competitors.forEach(comp => {
            // Count by industry
            const industry = comp.industry || 'Unknown';
            byIndustry[industry] = (byIndustry[industry] || 0) + 1;
            
            // Accumulate similarity
            totalSimilarity += comp.similarity || 0;
        });

        // Compute similarity distribution
        const distribution = {
            high: competitors.filter(c => (c.similarity || 0) > 70).length,
            medium: competitors.filter(c => (c.similarity || 0) >= 50 && (c.similarity || 0) <= 70).length,
            low: competitors.filter(c => (c.similarity || 0) >= 30 && (c.similarity || 0) < 50).length,
        };

        // Top industries
        const topIndustries = Object.entries(byIndustry)
            .map(([industry, count]) => ({ industry, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            total: competitors.length,
            byIndustry,
            avgSimilarity: competitors.length > 0 ? Math.round(totalSimilarity / competitors.length) : 0,
            topIndustries,
            similarityDistribution: distribution,
        };
    }

    /**
     * Get competitor insights summary
     */
    static generateInsights(competitors: any[], stats: CompetitorStats): string[] {
        const insights: string[] = [];

        // Insight 1: Competitor density
        if (stats.total > 15) {
            insights.push(`🎯 Thị trường bão hoà: Tìm thấy ${stats.total} đối thủ trực tiếp`);
        } else if (stats.total > 5) {
            insights.push(`📊 Thị trường cạnh tranh: ${stats.total} đối thủ chính đáng lưu ý`);
        } else {
            insights.push(`🌟 Niche chuyên sâu: Chỉ ${stats.total} đối thủ cùng ngành`);
        }

        // Insight 2: Similarity quality
        if (stats.avgSimilarity > 70) {
            insights.push(`⚠️ Độ tương đồng cao (${stats.avgSimilarity}%): Cần chiến lược khác biệt mạnh`);
        } else if (stats.avgSimilarity > 50) {
            insights.push(`✅ Độ tương đồng trung bình (${stats.avgSimilarity}%): Có cơ hội phân biệt`);
        }

        // Insight 3: Industry diversity
        if (Object.keys(stats.byIndustry).length > 1) {
            insights.push(`🌐 Đối thủ đa ngành: Cạnh tranh qua liên ngành`);
        }

        // Insight 4: Distribution
        if (stats.similarityDistribution.high > stats.similarityDistribution.low) {
            insights.push(`🔴 Cảnh báo: Nhiều đối thủ có độ tương đồng cao`);
        }

        return insights;
    }
}
