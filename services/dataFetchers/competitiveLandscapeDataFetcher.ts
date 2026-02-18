/**
 * 📊 Competitive Landscape Data Fetcher
 * 
 * Gathers competitive landscape data from:
 * - S&P Capital IQ
 * - Company filings (10-K, annual reports)
 * - Market reports
 * - News aggregation
 */

export interface CompetitivePosition {
    companyName: string;
    marketShare: number;
    revenue: number;
    revenueGrowth: number;
    profitMargin: number;
    marketPosition: 'Leader' | 'Challenger' | 'Follower' | 'Niche';
    streng: string[];
    strategies: Array<{
        type: string;
        description: string;
        timeline?: string;
    }>;
    source: string;
}

export interface CompetitiveLandscapeData {
    industry: string;
    period: string;
    totalMarket: number;
    leaders: CompetitivePosition[];
    challengers: CompetitivePosition[];
    followers: CompetitivePosition[];
    concentration: {
        hhi: number;
        cr3: number;
        cr5: number;
        description: string;
    };
    trends: Array<{
        title: string;
        impact: 'High' | 'Medium' | 'Low';
        beneficiaries: string[];
        source: string;
    }>;
}

export class CompetitiveLandscapeDataFetcher {
    private spCapitalIqKey = process.env.SP_CAPITAL_IQ_KEY || '';

    /**
     * Calculate market concentration (HHI - Herfindahl-Hirschman Index)
     */
    calculateHHI(marketShares: number[]): number {
        const hhi = marketShares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
        return Math.round(hhi);
    }

    /**
     * Calculate CR3 (market share of top 3 companies)
     */
    calculateCR(marketShares: number[], n: number): number {
        const sorted = [...marketShares].sort((a, b) => b - a);
        const topN = sorted.slice(0, n);
        return topN.reduce((sum, share) => sum + share, 0);
    }

    /**
     * Get competitive landscape from S&P Capital IQ
     */
    async getFromSPCapitalIQ(industry: string): Promise<CompetitiveLandscapeData | null> {
        if (!this.spCapitalIqKey) {
            console.warn('SP_CAPITAL_IQ_KEY not configured');
            return null;
        }

        try {
            const response = await fetch(
                `https://api.capitaliq.com/api/v1/industry/${industry}/companies`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.spCapitalIqKey}`
                    }
                }
            );

            const companies: any[] = await response.json();
            
            // Sort by revenue to determine market positions
            const sorted = companies.sort((a, b) => b.revenue - a.revenue);
            const totalMarket = sorted.reduce((sum, c) => sum + c.revenue, 0);
            
            const marketShares = sorted.map(c => (c.revenue / totalMarket) * 100);
            
            return {
                industry,
                period: new Date().getFullYear().toString(),
                totalMarket,
                leaders: sorted.slice(0, 3).map(c => ({
                    companyName: c.name,
                    marketShare: (c.revenue / totalMarket) * 100,
                    revenue: c.revenue,
                    revenueGrowth: c.revenueGrowth || 0,
                    profitMargin: c.profitMargin || 0,
                    marketPosition: 'Leader',
                    strategies: [],
                    source: 'S&P Capital IQ'
                })),
                challengers: sorted.slice(3, 10).map(c => ({
                    companyName: c.name,
                    marketShare: (c.revenue / totalMarket) * 100,
                    revenue: c.revenue,
                    revenueGrowth: c.revenueGrowth || 0,
                    profitMargin: c.profitMargin || 0,
                    marketPosition: 'Challenger',
                    strategies: [],
                    source: 'S&P Capital IQ'
                })),
                followers: sorted.slice(10, 50).map(c => ({
                    companyName: c.name,
                    marketShare: (c.revenue / totalMarket) * 100,
                    revenue: c.revenue,
                    revenueGrowth: c.revenueGrowth || 0,
                    profitMargin: c.profitMargin || 0,
                    marketPosition: 'Follower',
                    strategies: [],
                    source: 'S&P Capital IQ'
                })),
                concentration: {
                    hhi: this.calculateHHI(marketShares),
                    cr3: this.calculateCR(marketShares, 3),
                    cr5: this.calculateCR(marketShares, 5),
                    description: this.describeConcentration(this.calculateHHI(marketShares))
                },
                trends: []
            };
        } catch (error) {
            console.error('S&P Capital IQ API error:', error);
            return null;
        }
    }

    private describeConcentration(hhi: number): string {
        if (hhi > 2500) return 'Highly concentrated - dominated by few players';
        if (hhi > 1500) return 'Moderately concentrated - clear market leaders';
        if (hhi > 1000) return 'Moderately competitive - mixed competition';
        return 'Highly competitive - fragmented market';
    }
}

export default CompetitiveLandscapeDataFetcher;
