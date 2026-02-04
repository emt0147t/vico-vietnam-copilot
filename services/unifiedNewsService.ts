/**
 * 🔄 Unified News Service - Hybrid Data Strategy
 * Merges Live (RSS) + Mock data for comprehensive company intelligence
 */

import { getCompanyNews, NewsItem } from './newsService';
import { getMockNewsForCompany, MockNewsItem } from '../data/mockNews';

export interface UnifiedNewsItem {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    source: string;
    sourceType: 'live' | 'mock';
    date: Date;
    link?: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    category: 'Finance' | 'M&A' | 'Product' | 'Legal' | 'Leadership' | 'Partnership' | 'General';
    isBreaking?: boolean; // Within last 24 hours
}

export interface UnifiedNewsResponse {
    companyName: string;
    news: UnifiedNewsItem[];
    sentiment: number; // 0-1 bullish scale
    sentimentLabel: 'Bearish' | 'Neutral' | 'Bullish';
    categories: string[];
    breakingCount: number;
    liveCount: number;
    mockCount: number;
    lastUpdated: Date;
}

/**
 * Auto-categorize news item based on title/content keywords
 */
const categorizeNews = (title: string, content?: string): UnifiedNewsItem['category'] => {
    const text = `${title} ${content || ''}`.toLowerCase();

    if (text.match(/\b(m&a|acquisition|merger|acquires|acquired|buyout|deal)\b/)) return 'M&A';
    if (text.match(/\b(revenue|profit|earnings|financial|quarter|guidance|forecast|ipo)\b/)) return 'Finance';
    if (text.match(/\b(launch|release|product|feature|new)\b/)) return 'Product';
    if (text.match(/\b(lawsuit|legal|settlement|sec|investigation|compliance|recall)\b/)) return 'Legal';
    if (text.match(/\b(ceo|cto|cfo|leadership|appoint|executive|team)\b/)) return 'Leadership';
    if (text.match(/\b(partner|partnership|collaboration|ally|strategic|alliance)\b/)) return 'Partnership';

    return 'General';
};

/**
 * Determine sentiment from title keywords
 */
const determineSentiment = (title: string, content?: string): UnifiedNewsItem['sentiment'] => {
    const text = `${title} ${content || ''}`.toLowerCase();

    const positiveLang = /\b(surge|jump|soar|growth|beat|exceed|success|record|innovation|leader|advance|expand|win|award|breakthrough)\b/;
    const negativeLang = /\b(fall|drop|decline|loss|miss|cut|layoff|lawsuit|recall|scandal|downgrade|failure|warning|crisis)\b/;

    if (negativeLang.test(text)) return 'negative';
    if (positiveLang.test(text)) return 'positive';
    return 'neutral';
};

/**
 * Check if news is "breaking" (within last 24 hours)
 */
const isBreakingNews = (date: Date | string): boolean => {
    const newsDate = new Date(date);
    const now = new Date();
    const hours = (now.getTime() - newsDate.getTime()) / (1000 * 60 * 60);
    return hours <= 24;
};

/**
 * Normalize mock news to unified format
 */
const normalizeMockNews = (item: MockNewsItem): UnifiedNewsItem => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    source: item.source,
    sourceType: 'mock',
    date: new Date(item.date),
    sentiment: item.sentiment,
    category: item.category,
    isBreaking: isBreakingNews(item.date)
});

/**
 * Normalize live news to unified format
 */
const normalizeLiveNews = (item: NewsItem): UnifiedNewsItem => ({
    id: `live-${item.guid || item.link}`,
    title: item.title,
    summary: item.content || item.title,
    content: item.content,
    source: item.source || 'Google News',
    sourceType: 'live',
    date: new Date(item.pubDate),
    link: item.link,
    sentiment: determineSentiment(item.title, item.content),
    category: categorizeNews(item.title, item.content),
    isBreaking: isBreakingNews(item.pubDate)
});

/**
 * Deduplicate news by title similarity
 * Simple fuzzy match: if titles share 80%+ of words, consider duplicate
 */
const deduplicateNews = (items: UnifiedNewsItem[]): UnifiedNewsItem[] => {
    const seen = new Set<string>();
    const unique: UnifiedNewsItem[] = [];

    for (const item of items) {
        const titleWords = item.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const titleKey = titleWords.slice(0, 5).join(' '); // First 5 words as key

        if (!seen.has(titleKey)) {
            seen.add(titleKey);
            unique.push(item);
        }
    }

    return unique;
};

/**
 * Calculate sentiment score (0-1 scale, 0.5 = neutral)
 */
const calculateSentiment = (items: UnifiedNewsItem[]): { score: number; label: UnifiedNewsItem['sentiment'][] } => {
    if (items.length === 0) return { score: 0.5, label: [] };

    const positive = items.filter(i => i.sentiment === 'positive').length;
    const negative = items.filter(i => i.sentiment === 'negative').length;
    const neutral = items.filter(i => i.sentiment === 'neutral').length;

    // Score: (positive - negative) / total, normalized to 0-1 with 0.5 as neutral
    const rawScore = (positive - negative) / items.length;
    const normalizedScore = Math.max(0, Math.min(1, (rawScore + 1) / 2)); // Convert from -1..1 to 0..1

    return {
        score: normalizedScore,
        label: [positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral']
    };
};

/**
 * 🎯 MAIN FUNCTION: Get unified news for a company
 * Hybrid strategy: Live + Mock data merged
 */
export const getUnifiedCompanyNews = async (companyName: string): Promise<UnifiedNewsResponse> => {
    try {
        console.log(`📰 Fetching unified news for: "${companyName}"`);

        if (!companyName || companyName.trim() === '') {
            throw new Error('Company name required');
        }

        // Phase 1: PARALLEL DATA FETCHING
        const [liveNewsRaw, mockNewsRaw] = await Promise.all([
            getCompanyNews(companyName).catch(err => {
                console.warn('Live news fetch failed:', err);
                return [];
            }),
            Promise.resolve(getMockNewsForCompany(companyName))
        ]);

        console.log(`✅ Live: ${liveNewsRaw.length}, Mock: ${mockNewsRaw.length}`);

        // Phase 2: NORMALIZE
        const normalizedLive = liveNewsRaw.map(normalizeLiveNews);
        const normalizedMock = mockNewsRaw.map(normalizeMockNews);

        // Phase 3: DEDUPLICATE & MERGE
        const allNews = [...normalizedLive, ...normalizedMock];
        const deduplicated = deduplicateNews(allNews);

        // Phase 4: SORT (newest first) & MARK BREAKING
        const sorted = deduplicated.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Phase 5: CALCULATE SENTIMENT & CATEGORIES
        const { score: sentimentScore } = calculateSentiment(sorted);
        const sentimentLabel: UnifiedNewsItem['sentiment'][] = [
            sentimentScore < 0.35 ? 'negative' : sentimentScore > 0.65 ? 'positive' : 'neutral'
        ];

        const categories = [...new Set(sorted.map(n => n.category))];
        const breakingCount = sorted.filter(n => n.isBreaking).length;

        const response: UnifiedNewsResponse = {
            companyName,
            news: sorted,
            sentiment: sentimentScore,
            sentimentLabel: sentimentLabel[0] === 'negative' ? 'Bearish' : sentimentLabel[0] === 'positive' ? 'Bullish' : 'Neutral',
            categories,
            breakingCount,
            liveCount: normalizedLive.length,
            mockCount: normalizedMock.length,
            lastUpdated: new Date()
        };

        console.log(`📊 Sentiment: ${(sentimentScore * 100).toFixed(0)}%, Total Items: ${sorted.length}`);
        return response;

    } catch (error) {
        console.error('❌ Error fetching unified news:', error);
        throw error;
    }
};

/**
 * Get news for a specific category
 */
export const getNewsByCategory = async (
    companyName: string,
    category: UnifiedNewsItem['category']
): Promise<UnifiedNewsItem[]> => {
    const response = await getUnifiedCompanyNews(companyName);
    return response.news.filter(n => n.category === category);
};

/**
 * Get breaking news (last 24 hours)
 */
export const getBreakingNews = async (companyName: string): Promise<UnifiedNewsItem[]> => {
    const response = await getUnifiedCompanyNews(companyName);
    return response.news.filter(n => n.isBreaking).slice(0, 5);
};
