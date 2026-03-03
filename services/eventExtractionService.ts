/**
 * 🔍 Structured Event Extraction Service
 *
 * Extracts typed business events from news articles using Gemini AI.
 * Event types: funding, acquisition, IPO, leadership changes, product launches,
 * partnerships, expansions, layoffs, regulations, earnings.
 *
 * Used by: News Intelligence, Company Profiles, Market Intelligence
 */

import { GoogleGenAI } from '@google/genai';

// ============================================================================
// TYPES
// ============================================================================

export type BusinessEventType =
    | 'funding'
    | 'acquisition'
    | 'ipo'
    | 'leadership_change'
    | 'product_launch'
    | 'partnership'
    | 'expansion'
    | 'layoff'
    | 'regulation'
    | 'earnings'
    | 'legal_action'
    | 'market_entry'
    | 'restructuring';

export interface BusinessEvent {
    type: BusinessEventType;
    company: string;
    date: string;               // ISO date or "unknown"
    amount?: string;             // For funding/acquisition (e.g., "$50M")
    amountUsd?: number;          // Parsed numeric value in USD
    parties?: string[];          // Involved entities (investors, acquirer, partner)
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;          // 0-1 confidence score
    summary: string;             // One-line summary
    details?: string;            // Extended details
    sourceTitle: string;         // Article title
    sourceUrl?: string;          // Article link
    sourceDate?: string;         // Article date
    extractedAt: string;         // ISO timestamp of extraction
}

export interface EventExtractionResult {
    events: BusinessEvent[];
    articlesProcessed: number;
    extractionTime: number;      // ms
    aiModel: string;
}

export interface NewsArticleInput {
    title: string;
    content?: string;
    url?: string;
    date?: string;
    source?: string;
}

// ============================================================================
// EVENT TYPE METADATA
// ============================================================================

export const EVENT_TYPE_META: Record<BusinessEventType, {
    label: string;
    labelVi: string;
    icon: string;
    color: string;
    defaultImpact: BusinessEvent['impact'];
}> = {
    funding: { label: 'Funding Round', labelVi: 'Gọi vốn', icon: '💰', color: '#22c55e', defaultImpact: 'positive' },
    acquisition: { label: 'Acquisition', labelVi: 'Mua lại', icon: '🤝', color: '#3b82f6', defaultImpact: 'neutral' },
    ipo: { label: 'IPO / Listing', labelVi: 'IPO / Niêm yết', icon: '📈', color: '#8b5cf6', defaultImpact: 'positive' },
    leadership_change: { label: 'Leadership Change', labelVi: 'Thay đổi lãnh đạo', icon: '👤', color: '#f59e0b', defaultImpact: 'neutral' },
    product_launch: { label: 'Product Launch', labelVi: 'Ra mắt sản phẩm', icon: '🚀', color: '#06b6d4', defaultImpact: 'positive' },
    partnership: { label: 'Partnership', labelVi: 'Hợp tác', icon: '🔗', color: '#14b8a6', defaultImpact: 'positive' },
    expansion: { label: 'Expansion', labelVi: 'Mở rộng', icon: '🌍', color: '#10b981', defaultImpact: 'positive' },
    layoff: { label: 'Layoff / Restructuring', labelVi: 'Sa thải / Tái cơ cấu', icon: '📉', color: '#ef4444', defaultImpact: 'negative' },
    regulation: { label: 'Regulation Change', labelVi: 'Thay đổi quy định', icon: '⚖️', color: '#6366f1', defaultImpact: 'neutral' },
    earnings: { label: 'Earnings Report', labelVi: 'Kết quả kinh doanh', icon: '📊', color: '#f97316', defaultImpact: 'neutral' },
    legal_action: { label: 'Legal Action', labelVi: 'Vấn đề pháp lý', icon: '⚠️', color: '#dc2626', defaultImpact: 'negative' },
    market_entry: { label: 'Market Entry', labelVi: 'Gia nhập thị trường', icon: '🏁', color: '#0ea5e9', defaultImpact: 'positive' },
    restructuring: { label: 'Restructuring', labelVi: 'Tái cấu trúc', icon: '🔄', color: '#a855f7', defaultImpact: 'neutral' },
};

// ============================================================================
// KEYWORD-BASED PRE-FILTER (fast, no AI needed)
// ============================================================================

const EVENT_KEYWORDS: Record<BusinessEventType, RegExp[]> = {
    funding: [
        /gọi vốn|huy động vốn|vòng (Series|seed|pre-seed)/i,
        /raise[ds]?\s+\$?\d/i, /funding\s+round/i, /venture\s+capital/i, /investment\s+of/i,
    ],
    acquisition: [
        /mua lại|thâu tóm|sáp nhập|M&A/i,
        /acquir|acquisition|merge|takeover/i,
    ],
    ipo: [
        /IPO|niêm yết|lên sàn|chào bán cổ phiếu/i,
        /initial public offering|list(?:ing|ed) on/i,
    ],
    leadership_change: [
        /bổ nhiệm|từ chức|CEO mới|tổng giám đốc/i,
        /appoint|resign|new CEO|chief executive/i,
    ],
    product_launch: [
        /ra mắt|trình làng|sản phẩm mới|phiên bản mới/i,
        /launch|unveil|new product|release/i,
    ],
    partnership: [
        /hợp tác|liên doanh|đối tác|ký kết/i,
        /partner|collaborat|joint venture|alliance|MoU/i,
    ],
    expansion: [
        /mở rộng|khai trương|chi nhánh mới/i,
        /expand|open(?:ing|ed) new|enter(?:ing|ed) market/i,
    ],
    layoff: [
        /sa thải|cắt giảm nhân sự|giảm biên chế/i,
        /layoff|lay off|cut\s+\d+\s+jobs|downsiz/i,
    ],
    regulation: [
        /nghị định|thông tư|quy định mới|luật/i,
        /regulat|decree|circular|new law|policy change/i,
    ],
    earnings: [
        /kết quả kinh doanh|doanh thu|lợi nhuận|báo cáo tài chính/i,
        /earnings|revenue|profit|financial result|quarterly report/i,
    ],
    legal_action: [
        /kiện|vi phạm|xử phạt|điều tra/i,
        /lawsuit|fine[ds]?|investigat|legal action|penalty/i,
    ],
    market_entry: [
        /gia nhập thị trường|thâm nhập|lần đầu tại/i,
        /enter(?:ing|ed).*market|debut|first.*in Vietnam/i,
    ],
    restructuring: [
        /tái cấu trúc|tái cơ cấu|chuyển đổi/i,
        /restructur|reorganiz|transform/i,
    ],
};

/**
 * Quick keyword-based event type detection (no AI)
 */
export function detectEventTypes(title: string, content?: string): BusinessEventType[] {
    const text = `${title} ${content || ''}`;
    const detected: BusinessEventType[] = [];

    for (const [type, patterns] of Object.entries(EVENT_KEYWORDS)) {
        if (patterns.some(p => p.test(text))) {
            detected.push(type as BusinessEventType);
        }
    }

    return detected;
}

// ============================================================================
// AI-POWERED EVENT EXTRACTION
// ============================================================================

let geminiInstance: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
    if (geminiInstance) return geminiInstance;
    const apiKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_AI_API_KEY'];
    if (!apiKey) return null;
    geminiInstance = new GoogleGenAI({ apiKey });
    return geminiInstance;
}

export const EventExtractionService = {

    /**
     * Extract structured business events from a batch of news articles
     */
    async extractEvents(articles: NewsArticleInput[]): Promise<EventExtractionResult> {
        const startTime = Date.now();
        const events: BusinessEvent[] = [];

        // Phase 1: Keyword pre-filter to identify articles likely containing events
        const articlesWithSignals = articles.map(article => ({
            article,
            detectedTypes: detectEventTypes(article.title, article.content),
        })).filter(a => a.detectedTypes.length > 0);

        if (articlesWithSignals.length === 0) {
            return {
                events: [],
                articlesProcessed: articles.length,
                extractionTime: Date.now() - startTime,
                aiModel: 'keyword-only',
            };
        }

        // Phase 2: AI extraction for articles with keyword signals
        const gemini = getGemini();
        if (gemini) {
            try {
                const aiEvents = await this.extractWithAI(gemini, articlesWithSignals.map(a => a.article));
                events.push(...aiEvents);
            } catch (error) {
                console.error('AI event extraction error, falling back to keywords:', error);
                // Fallback: create basic events from keyword detection
                events.push(...this.createKeywordEvents(articlesWithSignals));
            }
        } else {
            // No AI: create basic events from keyword detection
            events.push(...this.createKeywordEvents(articlesWithSignals));
        }

        return {
            events: this.deduplicateEvents(events),
            articlesProcessed: articles.length,
            extractionTime: Date.now() - startTime,
            aiModel: gemini ? 'gemini-2.0-flash' : 'keyword-fallback',
        };
    },

    /**
     * Extract events using Gemini AI
     */
    async extractWithAI(gemini: GoogleGenAI, articles: NewsArticleInput[]): Promise<BusinessEvent[]> {
        // Batch articles into a single prompt (max 10 at a time)
        const batch = articles.slice(0, 10);

        const articleTexts = batch.map((a, i) =>
            `[Article ${i + 1}] Title: ${a.title}\nContent: ${(a.content || '').substring(0, 500)}\nURL: ${a.url || 'N/A'}\nDate: ${a.date || 'N/A'}`
        ).join('\n\n');

        const prompt = `Extract structured business events from these Vietnamese/English news articles.

${articleTexts}

For each event found, return a JSON array of objects with:
- "type": one of: funding, acquisition, ipo, leadership_change, product_launch, partnership, expansion, layoff, regulation, earnings, legal_action, market_entry, restructuring
- "company": main company name
- "date": ISO date (YYYY-MM-DD) or "unknown"
- "amount": monetary amount if applicable (e.g., "$50M", "1.2 tỷ USD")
- "parties": array of other involved entities (investors, partners, etc.)
- "impact": "positive", "negative", or "neutral"
- "confidence": 0-1 confidence in extraction accuracy
- "summary": one-line summary in English
- "articleIndex": which article (1-indexed) this event came from

Rules:
- Only extract events you are confident about (confidence > 0.5)
- One article can contain multiple events
- Parse Vietnamese monetary amounts (tỷ, triệu) to USD equivalent in "amount"
- Return ONLY valid JSON array, no markdown

Return [] if no events found.`;

        const response = await gemini.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const text = response.text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        if (!text || text === '[]') return [];

        const parsed = JSON.parse(text) as Array<{
            type: BusinessEventType;
            company: string;
            date: string;
            amount?: string;
            parties?: string[];
            impact: 'positive' | 'negative' | 'neutral';
            confidence: number;
            summary: string;
            articleIndex: number;
        }>;

        return parsed
            .filter(e => e.confidence >= 0.5)
            .map(e => {
                const article = batch[e.articleIndex - 1] ?? batch[0];
                return {
                    type: e.type,
                    company: e.company,
                    date: e.date,
                    amount: e.amount,
                    amountUsd: this.parseAmount(e.amount),
                    parties: e.parties,
                    impact: e.impact,
                    confidence: e.confidence,
                    summary: e.summary,
                    sourceTitle: article?.title || '',
                    sourceUrl: article?.url,
                    sourceDate: article?.date,
                    extractedAt: new Date().toISOString(),
                } as BusinessEvent;
            });
    },

    /**
     * Create basic events from keyword detection (no AI fallback)
     */
    createKeywordEvents(
        articlesWithSignals: { article: NewsArticleInput; detectedTypes: BusinessEventType[] }[]
    ): BusinessEvent[] {
        return articlesWithSignals.flatMap(({ article, detectedTypes }) =>
            detectedTypes.map(type => ({
                type,
                company: this.extractCompanyName(article.title) || 'Unknown',
                date: article.date || 'unknown',
                impact: EVENT_TYPE_META[type].defaultImpact,
                confidence: 0.6, // Lower confidence for keyword-only
                summary: `${EVENT_TYPE_META[type].label}: ${article.title.substring(0, 100)}`,
                sourceTitle: article.title,
                sourceUrl: article.url,
                sourceDate: article.date,
                extractedAt: new Date().toISOString(),
            }))
        );
    },

    /**
     * Extract company name from title (simple heuristic)
     */
    extractCompanyName(title: string): string | null {
        // Look for known patterns: "Company X does something"
        const patterns = [
            /^([A-Z][A-Za-z0-9\s]{2,20}?)[\s:,]/,  // English company name at start
            /^((?:Công ty|Tập đoàn|CTCP)\s+[^\s,]{2,30})/i,  // Vietnamese company patterns
        ];

        for (const pattern of patterns) {
            const match: RegExpMatchArray | null = title.match(pattern);
            if (match && match[1]) return match[1].trim();
        }

        return null;
    },

    /**
     * Parse monetary amount to USD number
     */
    parseAmount(amount?: string): number | undefined {
        if (!amount) return undefined;

        // Parse USD amounts
        const usdMatch = amount.match(/\$\s*([\d.]+)\s*(B|M|K|billion|million|thousand)?/i);
        if (usdMatch && usdMatch[1]) {
            const value = parseFloat(usdMatch[1]);
            const multiplier = usdMatch[2]?.toUpperCase();
            if (multiplier === 'B' || multiplier === 'BILLION') return value * 1_000_000_000;
            if (multiplier === 'M' || multiplier === 'MILLION') return value * 1_000_000;
            if (multiplier === 'K' || multiplier === 'THOUSAND') return value * 1_000;
            return value;
        }

        // Parse Vietnamese amounts (tỷ, triệu USD)
        const vnMatch = amount.match(/([\d.,]+)\s*(tỷ|triệu)\s*(USD|đồng|VND)?/i);
        if (vnMatch && vnMatch[1] && vnMatch[2]) {
            const value = parseFloat(vnMatch[1].replace(/,/g, '.'));
            const unit = vnMatch[2].toLowerCase();
            const currency = vnMatch[3]?.toUpperCase() || 'VND';

            let amountVnd = unit === 'tỷ' ? value * 1_000_000_000 : value * 1_000_000;
            if (currency === 'USD') return amountVnd; // Already tagged as USD
            return amountVnd / 25_000; // Rough VND → USD conversion
        }

        return undefined;
    },

    /**
     * Deduplicate events by company + type + date similarity
     */
    deduplicateEvents(events: BusinessEvent[]): BusinessEvent[] {
        const seen = new Set<string>();
        return events.filter(e => {
            const key = `${e.company.toLowerCase()}_${e.type}_${e.date}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },

    /**
     * Get events for a specific company from recent articles
     */
    async getCompanyEvents(
        companyName: string,
        articles: NewsArticleInput[]
    ): Promise<BusinessEvent[]> {
        const result = await this.extractEvents(articles);
        return result.events.filter(
            e => e.company.toLowerCase().includes(companyName.toLowerCase()) ||
                companyName.toLowerCase().includes(e.company.toLowerCase())
        );
    },

    /**
     * Get event statistics for a batch of events
     */
    getEventStats(events: BusinessEvent[]): {
        totalEvents: number;
        byType: Record<string, number>;
        byImpact: Record<string, number>;
        avgConfidence: number;
        topCompanies: { name: string; count: number }[];
    } {
        const byType: Record<string, number> = {};
        const byImpact: Record<string, number> = {};
        const companyCount: Record<string, number> = {};

        events.forEach(e => {
            byType[e.type] = (byType[e.type] || 0) + 1;
            byImpact[e.impact] = (byImpact[e.impact] || 0) + 1;
            companyCount[e.company] = (companyCount[e.company] || 0) + 1;
        });

        const topCompanies = Object.entries(companyCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        return {
            totalEvents: events.length,
            byType,
            byImpact,
            avgConfidence: events.length > 0
                ? events.reduce((sum, e) => sum + e.confidence, 0) / events.length
                : 0,
            topCompanies,
        };
    },
};

export default EventExtractionService;
