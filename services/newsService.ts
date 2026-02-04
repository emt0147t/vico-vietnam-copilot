/**
 * News Service - Fetches live news from backend RSS feeds
 * Backend: http://localhost:3001/api/news
 * Data Source: Google News RSS (Vietnamese, Vietnam-focused)
 */

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    content: string;
    source: string;
    guid?: string;
}

export interface NewsResponse {
    query: string;
    count: number;
    news: NewsItem[];
    timestamp: string;
    error?: string;
}

/**
 * Fetch live news for a company/query from backend
 * Uses Google News RSS feeds with Vietnamese language filter
 * 
 * @param query - Company name or search term
 * @returns Array of news items (max 8 results)
 */
export const getCompanyNews = async (query: string): Promise<NewsItem[]> => {
    try {
        if (!query || !query.trim()) {
            console.warn('⚠️ News Service: Empty query');
            return [];
        }

        console.log(`📰 Fetching news for: "${query}"`);

        const response = await fetch('/api/news', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ query: query.trim() }),
        });

        if (!response.ok) {
            console.error(`❌ News API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: NewsResponse = await response.json();
        
        if (data.error) {
            console.warn(`⚠️ News Service Warning: ${data.error}`);
        }

        console.log(`✅ Fetched ${data.count} news items for "${query}"`);
        return data.news || [];

    } catch (error) {
        console.error('❌ News Service Error:', error instanceof Error ? error.message : error);
        // Graceful fallback - return empty array instead of crashing
        return [];
    }
};

/**
 * Fetch news with retry logic (useful for slow connections)
 * 
 * @param query - Company name or search term
 * @param maxRetries - Number of retry attempts (default: 2)
 * @returns Array of news items
 */
export const getCompanyNewsWithRetry = async (
    query: string, 
    maxRetries: number = 2
): Promise<NewsItem[]> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const news = await getCompanyNews(query);
            if (news.length > 0) {
                return news; // Success on this attempt
            }
            console.warn(`⚠️ Attempt ${attempt}/${maxRetries}: No news found`);
        } catch (error) {
            console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error);
            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    return [];
};

/**
 * Format news items for display (clean up HTML, truncate, etc.)
 * 
 * @param news - Array of news items
 * @param maxLength - Max characters for title/content
 * @returns Formatted news items
 */
export const formatNewsForDisplay = (
    news: NewsItem[], 
    maxLength: number = 150
): NewsItem[] => {
    return news.map(item => ({
        ...item,
        title: item.title.substring(0, maxLength).trim(),
        content: item.content.substring(0, maxLength).trim(),
    }));
};

/**
 * Batch fetch news for multiple companies
 * 
 * @param queries - Array of company names
 * @returns Object with query -> news items mapping
 */
export const getMultipleCompanyNews = async (
    queries: string[]
): Promise<Record<string, NewsItem[]>> => {
    const results: Record<string, NewsItem[]> = {};

    for (const query of queries) {
        results[query] = await getCompanyNews(query);
        // Add small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    return results;
};
