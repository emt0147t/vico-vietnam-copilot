/**
 * 📰 News Data Fetcher
 * 
 * Aggregates news từ multiple sources:
 * - NewsAPI (newsapi.org) - 100 requests/day free
 * - GNews (gnews.io) - 100 requests/day free
 * - Mediastack - Multi-language support
 */

import fetch from 'node-fetch';

export interface NewsArticle {
    title: string;
    description: string;
    url: string;
    image: string;
    source: string;
    publishedAt: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

export class NewsDataFetcher {
    private newsapiKey = process.env.NEWSAPI_KEY || '';
    private gnewsKey = process.env.GNEWS_KEY || '';
    private mediastackKey = process.env.MEDIASTACK_KEY || '';

    /**
     * Get company news từ NewsAPI
     * Free tier: 100 requests/day
     */
    async getCompanyNews(companyName: string, limit: number = 10): Promise<NewsArticle[]> {
        if (!this.newsapiKey) {
            console.warn('NEWSAPI_KEY not set');
            return [];
        }

        try {
            const response = await fetch(
                `https://newsapi.org/v2/everything?q=${encodeURIComponent(companyName)}&sortBy=publishedAt&language=en&pageSize=${limit}`,
                {
                    headers: { 'X-API-Key': this.newsapiKey }
                }
            );

            const data: any = await response.json();

            if (!data.articles) {
                return [];
            }

            return data.articles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                image: article.urlToImage,
                source: 'newsapi',
                publishedAt: article.publishedAt,
                sentiment: this.analyzeSentiment(article.title + ' ' + (article.description || ''))
            }));
        } catch (error) {
            console.error('NewsAPI fetch error:', error);
            return [];
        }
    }

    /**
     * Get news từ GNews (multi-language support)
     * Free tier: 100 requests/day
     */
    async getCompanyNewsTrend(
        companyName: string,
        country: string = 'us',
        limit: number = 10
    ): Promise<NewsArticle[]> {
        if (!this.gnewsKey) {
            console.warn('GNEWS_KEY not set');
            return [];
        }

        try {
            const response = await fetch(
                `https://gnews.io/api/v4/search?q=${encodeURIComponent(companyName)}&lang=en&country=${country}&limit=${limit}&token=${this.gnewsKey}`
            );

            const data: any = await response.json();

            if (!data.articles) {
                return [];
            }

            return data.articles.map((article: any) => ({
                title: article.title,
                description: article.description,
                url: article.url,
                image: article.image,
                source: 'gnews',
                publishedAt: article.publishedAt
            }));
        } catch (error) {
            console.error('GNews fetch error:', error);
            return [];
        }
    }

    /**
     * Get industry trends news
     */
    async getIndustryNews(
        industry: string,
        market: string,
        limit: number = 5
    ): Promise<NewsArticle[]> {
        const searchQuery = `${industry} ${market} market trends`;
        
        // Try multiple sources
        const newsapi = await this.getCompanyNews(searchQuery, limit);
        const gnews = await this.getCompanyNewsTrend(searchQuery, 'us', limit);

        // Deduplicate and return
        const allNews = [...newsapi, ...gnews];
        const uniqueNews = Array.from(
            new Map(allNews.map(n => [n.url, n])).values()
        );

        return uniqueNews.slice(0, limit);
    }

    /**
     * Simple sentiment analysis (can be replaced with NLP service)
     */
    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const positiveWords = [
            'growth', 'profit', 'success', 'innovation', 'expansion',
            'partnership', 'award', 'great', 'excellent', 'strong'
        ];
        const negativeWords = [
            'loss', 'decline', 'fall', 'failure', 'layoff', 'bankruptcy',
            'scandal', 'poor', 'weak', 'struggle'
        ];

        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
        const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }
}

export default NewsDataFetcher;
