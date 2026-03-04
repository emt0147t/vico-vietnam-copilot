/**
 * 🔄 Unified News Service - REAL DATA ONLY
 * Uses Live Google News RSS — NO fabricated/mock news
 * 
 * Sentiment analysis: Gemini AI (primary) → Negation-aware regex (fallback)
 * Sources: Google News RSS (real-time)
 */

import { getCompanyNews, NewsItem } from './newsService';

export interface UnifiedNewsItem {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    source: string;
    sourceType: 'live';
    date: Date;
    link?: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    sentimentMethod?: 'gemini_ai' | 'negation_aware_regex';
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
    lastUpdated: Date;
}

/**
 * Auto-categorize news item based on title/content keywords
 * Supports both Vietnamese and English
 */
const categorizeNews = (title: string, content?: string): UnifiedNewsItem['category'] => {
    const text = `${title} ${content || ''}`.toLowerCase();

    // M&A — Vietnamese + English
    if (text.match(/\b(m&a|acquisition|merger|acquires|acquired|buyout|deal)\b/) ||
        text.match(/(mua lại|sáp nhập|thâu tóm|hợp nhất|chuyển nhượng)/)) return 'M&A';

    // Finance — Vietnamese + English
    if (text.match(/\b(revenue|profit|earnings|financial|quarter|guidance|forecast|ipo|stock|dividend)\b/) ||
        text.match(/(doanh thu|lợi nhuận|cổ phiếu|tài chính|quý [1-4]|niêm yết|cổ tức|chứng khoán|vốn hóa|lãi|lỗ|ngân hàng)/)) return 'Finance';

    // Product — Vietnamese + English
    if (text.match(/\b(launch|release|product|feature|new|innovation|technology)\b/) ||
        text.match(/(ra mắt|sản phẩm|tính năng|công nghệ|đổi mới|phát triển|ứng dụng|nền tảng)/)) return 'Product';

    // Legal — Vietnamese + English
    if (text.match(/\b(lawsuit|legal|settlement|sec|investigation|compliance|recall|fine|penalty)\b/) ||
        text.match(/(pháp lý|kiện|phạt|vi phạm|thanh tra|điều tra|thu hồi|xử phạt|quy định|luật)/)) return 'Legal';

    // Leadership — Vietnamese + English
    if (text.match(/\b(ceo|cto|cfo|leadership|appoint|executive|team|resign|hire)\b/) ||
        text.match(/(giám đốc|tổng giám đốc|bổ nhiệm|từ chức|lãnh đạo|ban điều hành|chủ tịch|nhân sự cấp cao)/)) return 'Leadership';

    // Partnership — Vietnamese + English
    if (text.match(/\b(partner|partnership|collaboration|ally|strategic|alliance|joint venture)\b/) ||
        text.match(/(hợp tác|đối tác|liên doanh|liên kết|ký kết|thỏa thuận|chiến lược)/)) return 'Partnership';

    return 'General';
};

/**
 * Negation-aware sentiment analysis (fallback when AI unavailable)
 * Handles Vietnamese negation patterns: "phủ nhận sụt giảm" → NOT negative
 * 
 * Negation words flip the sentiment of the keyword they precede:
 * - Vietnamese: phủ nhận, không, chưa, chẳng, không hề, chưa từng, bác bỏ, chối, phản bác
 * - English: not, no, don't, doesn't, didn't, won't, never, deny, denies, denied, despite
 */
const NEGATION_PATTERNS_VN = /(phủ nhận|không|chưa|chẳng|không hề|chưa từng|bác bỏ|chối bỏ|phản bác|bất chấp|mặc dù|dù cho|tránh|ngăn chặn|vượt qua|khắc phục)/gi;
const NEGATION_PATTERNS_EN = /\b(not|no|don'?t|doesn'?t|didn'?t|won'?t|never|deny|denies|denied|despite|although|overcome|avoid|prevent)\b/gi;

const NEGATIVE_EN = /\b(fall|drop|decline|loss|miss|cut|layoff|lawsuit|recall|scandal|downgrade|failure|warning|crisis|crash|bankruptcy|debt|default|fraud|collapse|plummet|slump|sink|tumble)\b/gi;
const NEGATIVE_VN = /(giảm|sụt giảm|thua lỗ|phá sản|khủng hoảng|cắt giảm|sa thải|vi phạm|kiện|thu hồi|cảnh báo|thất bại|nợ xấu|tụt|suy thoái|đóng cửa|bê bối|gian lận|sụp đổ|lao dốc|thua|thiệt hại)/gi;

const POSITIVE_EN = /\b(surge|jump|soar|growth|beat|exceed|success|record|innovation|leader|advance|expand|win|award|breakthrough|profit|gain|recover|improve|upgrade|boost|thrive|flourish)\b/gi;
const POSITIVE_VN = /(tăng trưởng|tăng|đột phá|thắng lợi|thành công|kỷ lục|dẫn đầu|mở rộng|lợi nhuận|phát triển|vinh danh|giải thưởng|khởi sắc|đầu tư|huy động vốn|ra mắt|bứt phá|phục hồi|cải thiện|nâng cấp|vượt trội)/gi;

/**
 * Check if a sentiment keyword is negated by a preceding negation word
 * Respects clause boundaries: commas, periods, semicolons, and conjunctions reset scope
 */
const CLAUSE_BOUNDARY = /[,;.!?]|\bnhưng\b|\btuy nhiên\b|\bsong\b|\bbut\b|\bhowever\b|\byet\b|\band\b/;

const isNegated = (text: string, keywordIndex: number, _keywordLength: number): boolean => {
    // Look at the 40 characters before the keyword
    const windowStart = Math.max(0, keywordIndex - 40);
    let preceding = text.substring(windowStart, keywordIndex).toLowerCase();
    
    // Only look within the current clause (after last boundary)
    const boundaryMatch = preceding.match(CLAUSE_BOUNDARY);
    if (boundaryMatch && boundaryMatch.index !== undefined) {
        preceding = preceding.substring(boundaryMatch.index + boundaryMatch[0].length);
    }
    
    // Reset global regex lastIndex before testing
    NEGATION_PATTERNS_VN.lastIndex = 0;
    NEGATION_PATTERNS_EN.lastIndex = 0;
    return NEGATION_PATTERNS_VN.test(preceding) || NEGATION_PATTERNS_EN.test(preceding);
};

/**
 * Count sentiment matches with negation awareness
 * Returns net score: each non-negated match = +1, each negated match = -1 (flipped)
 */
const countWithNegation = (text: string, patterns: RegExp[]): { raw: number; negated: number } => {
    let raw = 0;
    let negated = 0;
    
    for (const pattern of patterns) {
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(text)) !== null) {
            if (isNegated(text, match.index, match[0].length)) {
                negated++;
            } else {
                raw++;
            }
        }
    }
    
    return { raw, negated };
};

const determineSentiment = (title: string, content?: string): UnifiedNewsItem['sentiment'] => {
    const text = `${title} ${content || ''}`.toLowerCase();

    // Reset all regex lastIndex
    [NEGATION_PATTERNS_VN, NEGATION_PATTERNS_EN].forEach(r => r.lastIndex = 0);

    const negative = countWithNegation(text, [NEGATIVE_EN, NEGATIVE_VN]);
    const positive = countWithNegation(text, [POSITIVE_EN, POSITIVE_VN]);

    // Net score: non-negated matches count normally, negated matches count for the opposite
    const netNegative = negative.raw + positive.negated; // actual-negative + negated-positive
    const netPositive = positive.raw + negative.negated; // actual-positive + negated-negative
    
    // "VinFast phủ nhận sụt giảm" → "sụt giảm" is negated → netNegative=0, netPositive=0+1=1
    
    if (netNegative === 0 && netPositive === 0) return 'neutral';
    if (netNegative > netPositive) return 'negative';
    if (netPositive > netNegative) return 'positive';
    return 'neutral'; // tie = neutral
};

/**
 * 🤖 Batch AI Sentiment Analysis via Gemini
 * Sends all article titles in one API call for efficiency
 * Returns a Map of article index → AI-determined sentiment
 */
const batchAISentiment = async (
    items: { title: string; content?: string }[]
): Promise<Map<number, 'positive' | 'negative' | 'neutral'> | null> => {
    if (items.length === 0) return null;

    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
        console.log('⚠️ No GEMINI_API_KEY — using negation-aware regex for sentiment');
        return null;
    }

    try {
        // ai instance managed by generateWithFallback

        // Build a numbered list of titles for batch analysis
        const titlesBlock = items
            .map((item, i) => `${i + 1}. ${item.title}`)
            .join('\n');

        const prompt = `Bạn là chuyên gia phân tích tin tức Việt Nam. Phân tích sentiment (cảm xúc) của từng tiêu đề tin tức dưới đây.

QUY TẮC QUAN TRỌNG:
- Hiểu NGỮ CẢNH: "phủ nhận sụt giảm" = KHÔNG sụt giảm → neutral/positive
- Hiểu PHỦ ĐỊNH: "không thua lỗ", "bác bỏ cáo buộc", "vượt qua khủng hoảng" → positive
- Hiểu CHÂM BIẾM/MỈA MAI nếu có
- Phân tích TOÀN BỘ câu, không chỉ từ khóa đơn lẻ

Danh sách tiêu đề:
${titlesBlock}

Trả lời CHÍNH XÁC theo format JSON array (không markdown, không giải thích):
[{"id":1,"sentiment":"positive|negative|neutral"},{"id":2,"sentiment":"..."},...]`;

        const { generateWithFallback } = await import('./geminiHelper');
        const result = await generateWithFallback({
            contents: prompt,
            config: {
                temperature: 0.1,
                maxOutputTokens: items.length * 50 + 100,
            }
        });

        const responseText = result.text?.trim();
        if (!responseText) return null;

        // Parse JSON from response (strip markdown fences if present)
        const jsonStr = responseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        const results: { id: number; sentiment: string }[] = JSON.parse(jsonStr);

        const sentimentMap = new Map<number, 'positive' | 'negative' | 'neutral'>();
        for (const result of results) {
            const s = result.sentiment?.toLowerCase();
            if (s === 'positive' || s === 'negative' || s === 'neutral') {
                sentimentMap.set(result.id - 1, s); // Convert 1-indexed to 0-indexed
            }
        }

        console.log(`🤖 AI sentiment analysis: ${sentimentMap.size}/${items.length} articles classified`);
        return sentimentMap;

    } catch (error: any) {
        if (error?.status === 429) {
            console.log('⚠️ Gemini quota exhausted — using negation-aware regex for sentiment');
        } else {
            console.warn('⚠️ AI sentiment failed:', error?.message || error);
        }
        return null;
    }
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
 * Normalize live news to unified format
 * Initial pass uses negation-aware regex; AI override applied in getUnifiedCompanyNews
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
    sentimentMethod: 'negation_aware_regex',
    category: categorizeNews(item.title, item.content),
    isBreaking: isBreakingNews(item.pubDate)
});

/**
 * Deduplicate news by title similarity
 * Simple fuzzy match: if titles share first 5 significant words, consider duplicate
 */
const deduplicateNews = (items: UnifiedNewsItem[]): UnifiedNewsItem[] => {
    const seen = new Set<string>();
    const unique: UnifiedNewsItem[] = [];

    for (const item of items) {
        const titleWords = item.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const titleKey = titleWords.slice(0, 5).join(' ');

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

    const rawScore = (positive - negative) / items.length;
    const normalizedScore = Math.max(0, Math.min(1, (rawScore + 1) / 2));

    return {
        score: normalizedScore,
        label: [positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral']
    };
};

/**
 * 🎯 MAIN FUNCTION: Get real news for a company
 * Uses ONLY live Google News RSS — no fabricated data
 */
export const getUnifiedCompanyNews = async (companyName: string): Promise<UnifiedNewsResponse> => {
    try {
        console.log(`📰 Fetching real news for: "${companyName}"`);

        if (!companyName || companyName.trim() === '') {
            throw new Error('Company name required');
        }

        // Fetch ONLY real news from Google News RSS
        const liveNewsRaw = await getCompanyNews(companyName).catch(err => {
            console.warn('Live news fetch failed:', err);
            return [];
        });

        console.log(`✅ Live news: ${liveNewsRaw.length} articles`);

        // Normalize (initial pass: negation-aware regex sentiment)
        const normalizedLive = liveNewsRaw.map(normalizeLiveNews);

        // 🤖 AI sentiment override: batch all titles to Gemini for accurate NLP
        const aiSentiments = await batchAISentiment(
            normalizedLive.map(n => ({ title: n.title, content: n.content }))
        );
        if (aiSentiments) {
            for (const [index, sentiment] of aiSentiments) {
                if (normalizedLive[index]) {
                    normalizedLive[index].sentiment = sentiment;
                    normalizedLive[index].sentimentMethod = 'gemini_ai';
                }
            }
            const aiCount = [...aiSentiments.values()].length;
            console.log(`🤖 AI overrode ${aiCount}/${normalizedLive.length} sentiment labels`);
        } else {
            console.log(`📝 Using negation-aware regex sentiment (AI unavailable)`);
        }

        // Deduplicate
        const deduplicated = deduplicateNews(normalizedLive);

        // Sort (newest first)
        const sorted = deduplicated.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Calculate sentiment & categories
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
            liveCount: sorted.length,
            lastUpdated: new Date()
        };

        console.log(`📊 Sentiment: ${(sentimentScore * 100).toFixed(0)}%, Total: ${sorted.length} real articles`);
        return response;

    } catch (error) {
        console.error('❌ Error fetching news:', error);
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
