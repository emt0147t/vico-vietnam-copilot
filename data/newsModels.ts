/**
 * Advanced News Models for VICO Market Intelligence
 * Features:
 * - Market Pulse (Signal Classification)
 * - Sentiment Analysis
 * - AI Summarization
 * - Entity Linking (Company Mentions)
 */

// ============ SIGNAL TYPES (Market Pulse) - EXPANDED ============
export enum SignalType {
  // Original signals
  FUNDING = "funding",
  MERGER_ACQUISITION = "merger_acquisition",
  PRODUCT_LAUNCH = "product_launch",
  LEGAL_REGULATION = "legal_regulation",
  PERSONNEL = "personnel",
  PARTNERSHIP = "partnership",
  EARNINGS = "earnings",
  EXPANSION = "expansion",
  
  // NEW: Enhanced signals
  ACQUISITION = "acquisition",
  IPO = "ipo",
  EXECUTIVE_CHANGE = "executive_change",
  FACILITY_EXPANSION = "facility_expansion",
  STRATEGIC_ALLIANCE = "strategic_alliance",
  TECHNOLOGY_INNOVATION = "technology_innovation",
  MARKET_ENTRY = "market_entry",
  INVESTMENT = "investment",
  
  OTHER = "other",
}

// ============ SENTIMENT TYPES ============
export enum SentimentType {
  POSITIVE = "positive",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
}

// ============ CORE NEWS ITEM WITH ENRICHED METADATA ============
export interface NewsItem {
  id: string; // Unique identifier (hash of title + link)
  title: string;
  link: string;
  content: string;
  
  // Publishing metadata
  sourceUrl?: string;
  sourceName?: string;
  publishedDate?: Date;
  fetchedDate: Date;
  
  // AI-Generated enrichment
  summary?: string; // 3-bullet point summary
  sentiment?: SentimentType;
  sentimentScore?: number; // -1 to 1
  signals?: SignalType[]; // Multiple signals possible (e.g., "funding" + "partnership")
  signalConfidence?: number; // 0 to 1
  
  // Entity linking
  mentionedCompanies?: CompanyMention[];
  mentionedPeople?: string[]; // Names of people mentioned
  keywords?: string[];
  
  // Vector/embedding
  embedding?: number[];
  embeddingModel?: string;
  
  // Tracking
  processedAt?: Date;
  version?: number; // For versioning enrichment
}

// ============ COMPANY MENTION (SMART LINKING) ============
export interface CompanyMention {
  companyId: string; // Link to Company in database
  companyName: string;
  mentionContext?: string; // Snippet of text mentioning company
  mentionPosition?: number; // Character position in content
  confidence?: number; // 0 to 1 - how confident we are about this mention
}

// ============ NEWS SIGNAL METADATA ============
export interface SignalMetadata {
  type: SignalType;
  confidence: number; // 0 to 1
  keywords: string[]; // Keywords that triggered this signal
  description: string; // Human-readable description
}

// ============ SENTIMENT ANALYSIS RESULT ============
export interface SentimentResult {
  type: SentimentType;
  score: number; // -1 (very negative) to 1 (very positive)
  keywords: string[]; // Keywords that drove the sentiment
  rationale?: string; // Why this sentiment was assigned
}

// ============ NEWS SUMMARY (3-BULLET POINTS) ============
export interface NewsSummary {
  bullets: string[]; // 3 bullet points max
  keyTakeaways: string[]; // Main conclusions
  impactLevel: "high" | "medium" | "low"; // Business impact
}

// ============ SIGNAL KEYWORDS (For classification) ============
export const SIGNAL_KEYWORDS: Record<SignalType, string[]> = {
  [SignalType.FUNDING]: [
    "gọi vốn",
    "tài trợ",
    "đầu tư",
    "funding",
    "seed round",
    "series",
    "triệu usd",
    "tỷ usd",
    "vốn đầu tư",
    "nhà đầu tư",
    "quỹ đầu tư",
    "huy động",
    "bốc hơi",
  ],
  [SignalType.MERGER_ACQUISITION]: [
    "mua lại",
    "sáp nhập",
    "m&a",
    "acquisition",
    "merger",
    "được mua",
    "thâu tóm",
    "kết hợp",
    "hợp nhất",
    "công ty con",
  ],
  [SignalType.PRODUCT_LAUNCH]: [
    "ra mắt",
    "giới thiệu",
    "phát hành",
    "launch",
    "release",
    "unveil",
    "sản phẩm mới",
    "dòng sản phẩm",
    "bản mới",
    "version",
  ],
  [SignalType.LEGAL_REGULATION]: [
    "kiện tụng",
    "tranh tụng",
    "pháp luật",
    "quy định",
    "luật",
    "quy chuẩn",
    "phạt",
    "vi phạm",
    "tòa án",
    "lawsuit",
    "regulation",
    "compliance",
  ],
  [SignalType.PERSONNEL]: [
    "ceo mới",
    "tổng giám đốc",
    "cto",
    "nhân sự",
    "tuyển dụng",
    "bổ nhiệm",
    "từ chức",
    "rời khỏi",
    "recruit",
    "hire",
    "appoint",
    "resign",
    "step down",
  ],
  [SignalType.PARTNERSHIP]: [
    "hợp tác",
    "đối tác",
    "partnership",
    "collaboration",
    "strategic alliance",
    "kết hợp",
    "liên minh",
    "thỏa thuận",
    "hợp đồng",
  ],
  [SignalType.EARNINGS]: [
    "doanh thu",
    "lợi nhuận",
    "báo cáo tài chính",
    "quý",
    "năm",
    "revenue",
    "earnings",
    "profit",
    "financial report",
    "q1",
    "q2",
    "q3",
    "q4",
  ],
  [SignalType.EXPANSION]: [
    "mở rộng",
    "đầu tư mới",
    "cơ sở mới",
    "chi nhánh mới",
    "thị trường mới",
    "expansion",
    "expand",
    "new office",
    "new market",
  ],
  // NEW SIGNAL KEYWORDS
  [SignalType.ACQUISITION]: [
    "thâu tóm",
    "mua lại",
    "acquisition",
    "acquired",
    "acquired by",
    "được thâu tóm",
    "hoàn tất thâu tóm",
  ],
  [SignalType.IPO]: [
    "ipo",
    "phát hành công khai",
    "chào bán công khai",
    "công bố lên sàn",
    "niêm yết",
    "gia nhập sàn",
    "listed",
    "public offering",
    "went public",
  ],
  [SignalType.EXECUTIVE_CHANGE]: [
    "ceo mới",
    "tổng giám đốc mới",
    "bổ nhiệm ceo",
    "bổ nhiệm tổng giám đốc",
    "cfo mới",
    "cto mới",
    "giám đốc điều hành",
    "executive appointment",
    "new leadership",
  ],
  [SignalType.FACILITY_EXPANSION]: [
    "nhà máy mới",
    "xây dựng nhà máy",
    "mở nhà máy",
    "mở chi nhánh",
    "trụ sở mới",
    "xây dựng trụ sở",
    "facility expansion",
    "new facility",
    "capacity expansion",
  ],
  [SignalType.STRATEGIC_ALLIANCE]: [
    "liên minh chiến lược",
    "liên kết chiến lược",
    "strategic alliance",
    "strategic partnership",
    "joint venture",
    "công ty liên doanh",
    "hợp tác chiến lược",
  ],
  [SignalType.TECHNOLOGY_INNOVATION]: [
    "công nghệ mới",
    "đột phá công nghệ",
    "innovation",
    "bằng sáng chế",
    "patent",
    "ai",
    "machine learning",
    "blockchain",
    "5g",
    "kỹ thuật mới",
  ],
  [SignalType.MARKET_ENTRY]: [
    "vào thị trường",
    "bước vào thị trường",
    "market entry",
    "enter market",
    "khởi sắc ở",
    "mở rộng sang",
    "mở rộng vào",
  ],
  [SignalType.INVESTMENT]: [
    "đầu tư",
    "bầu cử quỹ",
    "investment round",
    "vòng đầu tư",
    "cấp vốn",
    "huy động vốn",
    "nhà đầu tư mới",
  ],
  [SignalType.OTHER]: [],
};

// ============ SENTIMENT KEYWORDS ============
export const POSITIVE_KEYWORDS = [
  "tăng",
  "lợi nhuận",
  "tăng trưởng",
  "thành công",
  "đạt",
  "phát triển",
  "cải thiện",
  "tốt",
  "xuất sắc",
  "kỷ lục",
  "record",
  "growth",
  "success",
  "achieved",
  "profitable",
  "improvement",
  "excellent",
  "strong",
  "leading",
  "innovation",
];

export const NEGATIVE_KEYWORDS = [
  "giảm",
  "lỗ",
  "khủng hoảng",
  "thất bại",
  "rủi ro",
  "nguy hiểm",
  "xấu",
  "tồi tệ",
  "sụt giảm",
  "mất",
  "chậm",
  "decline",
  "loss",
  "crisis",
  "failed",
  "risk",
  "danger",
  "negative",
  "weak",
  "struggling",
  "layoff",
  "bankruptcy",
];

// ============ STORAGE/DATABASE INTERFACES ============
export interface NewsDatabase {
  // Direct lookups
  getNewsById(id: string): Promise<NewsItem | null>;
  getNewsByLink(link: string): Promise<NewsItem | null>;
  
  // Searching
  searchNewsByCompany(companyName: string): Promise<NewsItem[]>;
  searchNewsBySignal(signal: SignalType): Promise<NewsItem[]>;
  searchBySentiment(sentiment: SentimentType): Promise<NewsItem[]>;
  
  // Vector search
  searchByEmbedding(
    embedding: number[],
    limit: number,
    minSimilarity: number
  ): Promise<SearchResult[]>;
  
  // Bulk operations
  saveNews(news: NewsItem): Promise<void>;
  saveMultipleNews(news: NewsItem[]): Promise<void>;
  getAllNews(limit?: number, offset?: number): Promise<NewsItem[]>;
  
  // Statistics
  getNewsCount(): Promise<number>;
  getSignalDistribution(): Promise<Record<SignalType, number>>;
}

export interface SearchResult {
  newsItem: NewsItem;
  similarity: number; // 0 to 1
  rank: number;
}

// ============ ENRICHMENT PIPELINE INTERFACES ============
export interface EnrichmentPipeline {
  classifySignals(content: string): Promise<SignalMetadata[]>;
  analyzeSentiment(content: string): Promise<SentimentResult>;
  summarize(content: string): Promise<NewsSummary>;
  extractCompanyMentions(
    content: string,
    knownCompanies: string[]
  ): Promise<CompanyMention[]>;
  generateEmbedding(text: string): Promise<number[]>;
}
