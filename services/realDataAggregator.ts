/**
 * 🔄 Real Data Aggregator
 * 
 * Coordinator cho việc fetch dữ liệu thực từ nhiều nguồn
 * Ưu tiên: Real Data > Fallback to Generated
 */

import { NormalizedCompany } from './competitorEngine';
import { 
    CrunchbaseDataFetcher, 
    LinkedInDataFetcher, 
    NewsDataFetcher, 
    BuiltWithFetcher,
    G2ReviewsFetcher
} from './dataFetchers';

export interface RealDataCache {
    companyName: string;
    dataType: 'funding' | 'headcount' | 'techstack' | 'news' | 'reviews';
    data: any;
    source: string;
    fetchedAt: Date;
    expiresAt: Date;
}

export class RealDataAggregator {
    private cache: Map<string, RealDataCache> = new Map();
    private crunchbase = new CrunchbaseDataFetcher();
    private linkedin = new LinkedInDataFetcher();
    private news = new NewsDataFetcher();
    private builtwith = new BuiltWithFetcher();
    private g2 = new G2ReviewsFetcher();

    /**
     * Get competitor data with real-data-first approach
     */
    async getCompetitorProfile(
        companyName: string,
        website?: string
    ) {
        const profile: any = {};

        // 1. Funding Data (Real)
        try {
            const fundingData = await this.crunchbase.getFundingData(companyName);
            if (fundingData) {
                profile.funding = {
                    ...fundingData,
                    source: 'crunchbase',
                    isRealData: true
                };
            }
        } catch (e) {
            console.warn(`Crunchbase fetch failed for ${companyName}:`, e);
        }

        // 2. Headcount Data (Real)
        try {
            const headcountData = await this.linkedin.getCompanyHeadcount(companyName);
            if (headcountData) {
                profile.headcount = {
                    ...headcountData,
                    source: 'linkedin',
                    isRealData: true
                };
            }
        } catch (e) {
            console.warn(`LinkedIn fetch failed for ${companyName}:`, e);
        }

        // 3. Tech Stack (Real)
        if (website) {
            try {
                const techStack = await this.builtwith.getTechStack(website);
                if (techStack) {
                    profile.techStack = {
                        ...techStack,
                        source: 'builtwith',
                        isRealData: true
                    };
                }
            } catch (e) {
                console.warn(`BuiltWith fetch failed for ${website}:`, e);
            }
        }

        // 4. Recent News (Real)
        try {
            const news = await this.news.getCompanyNews(companyName, 10);
            if (news && news.length > 0) {
                profile.recentNews = {
                    items: news,
                    source: 'newsapi',
                    isRealData: true,
                    count: news.length
                };
            }
        } catch (e) {
            console.warn(`News fetch failed for ${companyName}:`, e);
        }

        // 5. Customer Reviews (Real)
        try {
            const reviews = await this.g2.getCompanyReviews(companyName);
            if (reviews && reviews.length > 0) {
                profile.customerReviews = {
                    items: reviews,
                    source: 'g2',
                    isRealData: true,
                    avgRating: this.calculateAvgRating(reviews),
                    reviewCount: reviews.length
                };
            }
        } catch (e) {
            console.warn(`G2 fetch failed for ${companyName}:`, e);
        }

        return profile;
    }

    /**
     * Get market data with real-data-first approach
     */
    async getMarketData(industry: string, market: string) {
        const marketData: any = {
            industry,
            market,
            sources: []
        };

        // Fetch from multiple sources
        // TODO: Implement market size fetchers
        // - Statista
        // - Trading Economics
        // - Industry reports

        return marketData;
    }

    /**
     * Get customer insights from real sources
     */
    async getCustomerInsights(productCategory: string) {
        const insights: any = {
            reviews: [],
            painPoints: [],
            sentiments: []
        };

        // Fetch from:
        // - G2 / Capterra reviews
        // - Twitter / Reddit discussions
        // - Support forum discussions

        return insights;
    }

    /**
     * Cache management
     */
    private getCacheKey(companyName: string, dataType: string): string {
        return `${companyName}__${dataType}`;
    }

    private isExpired(cache: RealDataCache): boolean {
        return new Date() > cache.expiresAt;
    }

    private calculateAvgRating(reviews: any[]): number {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
        return Math.round((sum / reviews.length) * 10) / 10;
    }

    /**
     * Clear old cache
     */
    clearExpiredCache() {
        for (const [key, cache] of this.cache.entries()) {
            if (this.isExpired(cache)) {
                this.cache.delete(key);
            }
        }
    }
}

export const realDataAggregator = new RealDataAggregator();
