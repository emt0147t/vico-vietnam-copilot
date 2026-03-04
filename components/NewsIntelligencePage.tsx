/**
 *  News Intelligence Page â€” Phase 20 (Professional Overhaul)
 *
 * Inspired by Bloomberg, Reuters & TechCrunch layouts:
 *   - Hero featured article with large visual thumbnail
 *   - Grid news cards with generated thumbnails
 *   - Sentiment stat bar
 *   - Category/sentiment filter pills
 *   - Trending topics sidebar
 *   - Data Sources & Methodology footer
 *
 * Data: Live RSS via getCompanyNews() â€” no images in feed,
 *       so we generate visually rich CSS thumbnails per source.
 *
 * Design: Executive Crimson â€” config/designSystem.ts
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { tw, iconSize } from '@/config/designSystem';
import { FadeIn } from './AnimationUtils';
import { getCompanyNews } from '../services/newsService';
import {
  Newspaper,
  MagnifyingGlass,
  TrendUp,
  TrendDown,
  Minus,
  Clock,
  ArrowSquareOut,
  Lightning,
  Buildings,
  ChartLineUp,
  Funnel,
  CaretRight,
  Globe,
  Database,
  CheckCircle,
  Tag,
  Fire,
  Star,
  X,
  BookmarkSimple,
  BookOpen,
  TextAa,
  ShareNetwork,
  ListBullets,
  Quotes,
  Link as LinkIcon,
  ArrowUpRight,
  ClockCountdown,
  TextAlignLeft,
} from '@phosphor-icons/react';

// ============================================================================
// CONTENT-BASED SENTIMENT ANALYSIS
// ============================================================================

const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  if (!text) return 'neutral';
  const t = text.toLowerCase();

  const negationRe =
    /(phá»§ nháº­n|khÃ´ng|chÆ°a|cháº³ng|khÃ´ng há»|bÃ¡c bá»|pháº£n bÃ¡c|báº¥t cháº¥p|vÆ°á»£t qua|kháº¯c phá»¥c|\bnot\b|\bno\b|\bdon'?t\b|\bdespite\b|\bdeny\b|\bdenies\b|\bdenied\b|\bnever\b|\bovercome\b)/i;
  const clauseBoundary =
    /[,;.!?]|\bnhÆ°ng\b|\btuy nhiÃªn\b|\bsong\b|\bbut\b|\bhowever\b/;

  const negativeRe =
    /(\bfall\b|\bdrop\b|\bdecline\b|\bloss\b|\blayoff\b|\blawsuit\b|\bscandal\b|\bcrisis\b|\bcrash\b|\bbankruptcy\b|giáº£m|sá»¥t giáº£m|thua lá»—|phÃ¡ sáº£n|khá»§ng hoáº£ng|cáº¯t giáº£m|sa tháº£i|vi pháº¡m|thu há»“i|cáº£nh bÃ¡o|tháº¥t báº¡i|ná»£ xáº¥u|suy thoÃ¡i|Ä‘Ã³ng cá»­a|bÃª bá»‘i|lao dá»‘c|thiá»‡t háº¡i)/gi;
  const positiveRe =
    /(\bsurge\b|\bjump\b|\bsoar\b|\bgrowth\b|\bsuccess\b|\brecord\b|\binnovation\b|\bprofit\b|\bgain\b|\brecover\b|tÄƒng trÆ°á»Ÿng|tÄƒng|Ä‘á»™t phÃ¡|thÃ nh cÃ´ng|ká»· lá»¥c|dáº«n Ä‘áº§u|má»Ÿ rá»™ng|lá»£i nhuáº­n|phÃ¡t triá»ƒn|giáº£i thÆ°á»Ÿng|khá»Ÿi sáº¯c|Ä‘áº§u tÆ°|ra máº¯t|bá»©t phÃ¡|phá»¥c há»“i)/gi;

  const isNegatedAt = (idx: number): boolean => {
    const windowStart = Math.max(0, idx - 40);
    let preceding = t.substring(windowStart, idx);
    const bm = preceding.match(clauseBoundary);
    if (bm && bm.index !== undefined)
      preceding = preceding.substring(bm.index + bm[0].length);
    return negationRe.test(preceding);
  };

  let netPos = 0,
    netNeg = 0;
  let match: RegExpExecArray | null;

  negativeRe.lastIndex = 0;
  while ((match = negativeRe.exec(t)) !== null) {
    if (isNegatedAt(match.index)) netPos++;
    else netNeg++;
  }

  positiveRe.lastIndex = 0;
  while ((match = positiveRe.exec(t)) !== null) {
    if (isNegatedAt(match.index)) netNeg++;
    else netPos++;
  }

  if (netPos === 0 && netNeg === 0) return 'neutral';
  if (netNeg > netPos) return 'negative';
  if (netPos > netNeg) return 'positive';
  return 'neutral';
};

const hashScore = (str: string, min: number, range: number): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash << 5) - hash + str.charCodeAt(i);
  return min + (Math.abs(hash) % range);
};

// ============================================================================
// TYPES
// ============================================================================

interface NewsIntelligencePageProps {
  userData: any;
  competitors?: any[];
}

interface NewsArticle {
  guid: string;
  title: string;
  content: string;
  pubDate: string;
  link: string;
  source: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  relevanceScore?: number;
  keywords?: string[];
}

// ============================================================================
// THUMBNAIL GENERATION â€” deterministic gradient per source
// ============================================================================

const SOURCE_PALETTES: Record<string, [string, string]> = {
  'VnExpress':     ['#E11D48', '#BE123C'],
  'Tuá»•i Tráº»':     ['#0284C7', '#0369A1'],
  'Thanh NiÃªn':    ['#059669', '#047857'],
  'VietnamNet':    ['#7C3AED', '#6D28D9'],
  'DÃ¢n TrÃ­':       ['#D97706', '#B45309'],
  'CafeF':         ['#DC2626', '#B91C1C'],
  'VnEconomy':     ['#0891B2', '#0E7490'],
  'Zing News':     ['#EA580C', '#C2410C'],
  'BÃ¡o Má»›i':       ['#4F46E5', '#4338CA'],
  'Nhá»‹p Sá»‘ng':     ['#DB2777', '#BE185D'],
  'Lao Äá»™ng':      ['#16A34A', '#15803D'],
  'NgÆ°á»i Lao Äá»™ng':['#CA8A04', '#A16207'],
  'Reuters':       ['#F97316', '#EA580C'],
  'Bloomberg':     ['#18181B', '#3F3F46'],
  'TechCrunch':    ['#22C55E', '#16A34A'],
  'default':       ['#E11D48', '#991B1B'],
};

function getSourceGradient(source: string): [string, string] {
  if (SOURCE_PALETTES[source]) return SOURCE_PALETTES[source];
  // Deterministic fallback from source name hash
  const palettes = Object.values(SOURCE_PALETTES);
  let h = 0;
  for (let i = 0; i < source.length; i++) h = (h << 5) - h + source.charCodeAt(i);
  const idx = Math.abs(h) % palettes.length;
  const result = palettes[idx];
  return result !== undefined ? result : ['#E11D48', '#991B1B'];
}

function getSourceInitial(source: string): string {
  return source.charAt(0).toUpperCase();
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// ============================================================================
// SENTIMENT CONFIG
// ============================================================================

function sentimentConfig(s?: string) {
  if (s === 'positive') return { bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', label: 'Positive', icon: TrendUp, dot: 'bg-[#059669]' };
  if (s === 'negative') return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', label: 'Negative', icon: TrendDown, dot: 'bg-[#991B1B]' };
  return { bg: 'bg-[#F4F4F5]', text: 'text-[#71717A]', label: 'Neutral', icon: Minus, dot: 'bg-[#A1A1AA]' };
}

// ============================================================================
// READING AID HELPERS
// ============================================================================

/** Estimate reading time in minutes (Vietnamese ~180 wpm, English ~230 wpm) */
function estimateReadingTime(text: string): number {
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Count words in text */
function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/** Extract a concise summary â€” first N meaningful sentences */
function extractSummary(content: string, maxSentences = 3): string {
  if (!content) return '';
  const cleaned = content.replace(/\s+/g, ' ').trim();
  // Split by sentence-ending punctuation
  const sentences = cleaned
    .split(/(?<=[.!?ã€‚])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);
  if (sentences.length === 0) return cleaned.slice(0, 200) + (cleaned.length > 200 ? '...' : '');
  return sentences.slice(0, maxSentences).join(' ');
}

/** Extract key points â€” sentences scored by keyword overlap with title + data signals */
function extractKeyPoints(content: string, title: string): string[] {
  if (!content) return [];
  const sentences = content
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?ã€‚])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 30);

  if (sentences.length === 0) return [];

  const titleWords = new Set(
    title.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  );

  const scored = sentences.map(s => {
    const words = s.toLowerCase().split(/\s+/);
    const overlapScore = words.filter(w => titleWords.has(w)).length;
    const hasNumber = /\d+/.test(s) ? 2 : 0;
    const hasKeyData =
      /tÄƒng|giáº£m|growth|revenue|lá»£i nhuáº­n|doanh thu|market|thá»‹ trÆ°á»ng|Ä‘áº§u tÆ°|invest|ká»· lá»¥c|record|triá»‡u|tá»·|billion|million|percent|%/i.test(s)
        ? 3
        : 0;
    return { sentence: s, score: overlapScore + hasNumber + hasKeyData };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.sentence);
}

/** Find related articles by keyword overlap + same source/sentiment */
function findRelatedArticles(
  current: NewsArticle,
  all: NewsArticle[],
  limit = 5,
): NewsArticle[] {
  const titleWords = new Set(
    current.title.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  );
  return all
    .filter(a => a.guid !== current.guid)
    .map(a => {
      const words = a.title.toLowerCase().split(/\s+/);
      const overlap = words.filter(w => titleWords.has(w)).length;
      const sameSentiment = a.sentiment === current.sentiment ? 1 : 0;
      const sameSource = a.source === current.source ? 1 : 0;
      return { article: a, score: overlap * 2 + sameSentiment + sameSource };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.article);
}

/** Format full date in Vietnamese */
function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// DATA SOURCES
// ============================================================================

const DATA_SOURCES = [
  'Google News RSS â€” Vietnamese Language Feed',
  'VnExpress, Tuá»•i Tráº» & Thanh NiÃªn',
  'CafeF & VnEconomy Financial Data',
  'Reuters & Bloomberg Wire Services',
  'VICO Enterprise Database â€” 10,000+ Companies',
  'Real-time Sentiment Analysis Engine',
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Generated thumbnail â€” gradient + source initial + icon */
function NewsThumbnail({
  source,
  size = 'md',
  className = '',
}: {
  source: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}) {
  const [c1, c2] = getSourceGradient(source);
  const initial = getSourceInitial(source);

  const sizeClasses = {
    sm: 'w-16 h-16 rounded-lg',
    md: 'w-full h-36 rounded-t-[12px]',
    lg: 'w-full h-44 rounded-t-[12px]',
    hero: 'w-full h-56 sm:h-64 rounded-t-[12px]',
  };

  const iconSizes = { sm: 20, md: 28, lg: 32, hero: 40 };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl', hero: 'text-4xl' };

  return (
    <div
      className={`${sizeClasses[size]} relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 w-20 h-20 border border-white/30 rounded-full" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full" />
      </div>

      {/* Source icon */}
      <div className="relative flex flex-col items-center gap-1">
        <Newspaper size={iconSizes[size]} weight="duotone" className="text-white/80" />
        <span className={`${textSizes[size]} font-extrabold text-white/90 tracking-tight`}>
          {initial}
        </span>
      </div>

      {/* Source name watermark (md+ sizes) */}
      {size !== 'sm' && (
        <div className="absolute bottom-2 left-3 right-3">
          <span className="text-[10px] font-semibold text-white/60 truncate block">{source}</span>
        </div>
      )}
    </div>
  );
}

/** Hero featured article */
function HeroArticle({ article, onClick }: { article: NewsArticle; onClick: () => void }) {
  const sc = sentimentConfig(article.sentiment);
  const SIcon = sc.icon;

  return (
    <div
      onClick={onClick}
      className={`${tw.card} overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Thumbnail */}
        <div className="lg:col-span-2 relative">
          <NewsThumbnail source={article.source} size="hero" className="lg:!rounded-none lg:!rounded-l-[12px] !rounded-b-none lg:!rounded-bl-[12px] !h-full min-h-[200px]" />
          <div className="absolute top-3 left-3">
            <span className={tw.badge('brand')}>
              <Star size={iconSize.xs} weight="fill" /> Tin ná»•i báº­t
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 p-5 lg:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                <SIcon size={12} weight="bold" />
                {sc.label}
              </span>
              <span className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                <Clock size={12} weight="duotone" />
                {timeAgo(article.pubDate)}
              </span>
            </div>

            <h2 className="text-lg lg:text-xl font-bold text-[#18181B] leading-snug mb-3 group-hover:text-[#E11D48] transition-colors line-clamp-3">
              {article.title}
            </h2>

            <p className={`${tw.body} line-clamp-3 mb-4`}>
              {article.content}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#E4E4E7]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#18181B]">{article.source}</span>
              {article.keywords && article.keywords.slice(0, 2).map((kw, i) => (
                <span key={i} className={tw.badge('neutral')}>
                  <Tag size={10} weight="duotone" /> {kw}
                </span>
              ))}
            </div>
            <span className="text-xs text-[#E11D48] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Read more <CaretRight size={14} weight="bold" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Standard news card with thumbnail */
function ArticleCard({ article, onClick }: { article: NewsArticle; onClick: () => void }) {
  const sc = sentimentConfig(article.sentiment);
  const SIcon = sc.icon;

  return (
    <div
      onClick={onClick}
      className={`${tw.card} overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-200`}
    >
      {/* Thumbnail */}
      <NewsThumbnail source={article.source} size="md" />

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
              <SIcon size={10} weight="bold" />
              {sc.label}
            </span>
          </div>
          <span className="text-[10px] text-[#A1A1AA] flex items-center gap-0.5">
            <Clock size={10} weight="duotone" />
            {timeAgo(article.pubDate)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-[#18181B] line-clamp-2 leading-snug group-hover:text-[#E11D48] transition-colors">
          {article.title}
        </h3>

        {/* Preview */}
        <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
          {article.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E4E4E7]/50">
          <span className="text-[10px] font-semibold text-[#71717A]">{article.source}</span>
          <ArrowSquareOut size={14} className="text-[#A1A1AA]" weight="duotone" />
        </div>
      </div>
    </div>
  );
}

/** Compact list article */
function CompactArticle({ article, onClick }: { article: NewsArticle; onClick: () => void }) {
  const sc = sentimentConfig(article.sentiment);
  const [c1] = getSourceGradient(article.source);

  return (
    <div
      onClick={onClick}
      className={`${tw.card} ${tw.cardPadding} flex items-start gap-3 cursor-pointer group hover:shadow-sm transition-all`}
    >
      <div
        className="w-1 h-12 rounded-full shrink-0 mt-0.5"
        style={{ backgroundColor: c1 }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-[#18181B] line-clamp-2 group-hover:text-[#E11D48] transition-colors leading-snug">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-medium text-[#71717A]">{article.source}</span>
          <span className="text-[10px] text-[#A1A1AA]">Â·</span>
          <span className="text-[10px] text-[#A1A1AA]">{timeAgo(article.pubDate)}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ml-auto shrink-0`} />
        </div>
      </div>
    </div>
  );
}

/** Trending topics bar */
function TrendingTopics({ articles }: { articles: NewsArticle[] }) {
  const topics = useMemo(() => {
    const topicMap = new Map<string, number>();
    articles.forEach((a) => {
      a.keywords?.forEach((kw) => {
        topicMap.set(kw, (topicMap.get(kw) || 0) + 1);
      });
    });
    return Array.from(topicMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [articles]);

  if (topics.length === 0) return null;

  return (
    <div className={`${tw.card} ${tw.cardPadding}`}>
      <div className="flex items-center gap-2 mb-3">
        <Fire size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
        <h3 className={tw.h3}>Trending Topics</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map(([topic, count], idx) => (
          <div
            key={topic}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors cursor-default ${
              idx === 0
                ? 'bg-[#FFF1F2] border-[#E11D48]/20 text-[#E11D48]'
                : 'bg-[#FAFAFA] border-[#E4E4E7] text-[#3F3F46]'
            }`}
          >
            {idx === 0 && <Fire size={12} weight="fill" />}
            <span className="text-xs font-semibold">{topic}</span>
            <span className="text-[9px] text-[#A1A1AA] font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ARTICLE DETAIL SLIDE-OVER PANEL (Reading Aid)
// ============================================================================

type FontSize = 'sm' | 'md' | 'lg';

const FONT_SIZES: Record<FontSize, { body: string; heading: string; label: string }> = {
  sm: { body: 'text-xs leading-relaxed', heading: 'text-base lg:text-lg', label: 'S' },
  md: { body: 'text-sm leading-relaxed', heading: 'text-lg lg:text-xl', label: 'M' },
  lg: { body: 'text-base leading-loose', heading: 'text-xl lg:text-2xl', label: 'L' },
};

function ArticleDetailPanel({
  article,
  allArticles,
  onClose,
  onOpenArticle,
  bookmarks,
  onToggleBookmark,
}: {
  article: NewsArticle;
  allArticles: NewsArticle[];
  onClose: () => void;
  onOpenArticle: (a: NewsArticle) => void;
  bookmarks: Set<string>;
  onToggleBookmark: (guid: string) => void;
}) {
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'summary' | 'keypoints' | 'full'>('summary');
  const panelRef = useRef<HTMLDivElement>(null);

  const sc = sentimentConfig(article.sentiment);
  const SIcon = sc.icon;
  const readTime = estimateReadingTime(article.content);
  const wordCount = countWords(article.content);
  const summary = useMemo(() => extractSummary(article.content, 3), [article.content]);
  const keyPoints = useMemo(() => extractKeyPoints(article.content, article.title), [article.content, article.title]);
  const related = useMemo(() => findRelatedArticles(article, allArticles), [article, allArticles]);
  const isBookmarked = bookmarks.has(article.guid);
  const fs = FONT_SIZES[fontSize];

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(article.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = article.link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: article.link });
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const [c1] = getSourceGradient(article.source);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 w-full sm:w-[520px] lg:w-[600px] bg-white z-50 shadow-2xl overflow-y-auto transition-transform duration-300 animate-slide-in-right"
        style={{ animationDuration: '300ms' }}
      >
        {/* â”€â”€â”€ Panel Header â”€â”€â”€ */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#E4E4E7]">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-2 h-8 rounded-full shrink-0"
                style={{ backgroundColor: c1 }}
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#18181B] block truncate">
                  {article.source}
                </span>
                <span className="text-[10px] text-[#A1A1AA]">{timeAgo(article.pubDate)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Bookmark */}
              <button
                onClick={() => onToggleBookmark(article.guid)}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'bg-[#FFF7ED] text-amber-500'
                    : 'hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA]'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                <BookmarkSimple size={18} weight={isBookmarked ? 'fill' : 'regular'} />
              </button>
              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-[#F4F4F5]:bg-gray-800 text-[#A1A1AA] transition-colors"
                title="Share"
              >
                <ShareNetwork size={18} />
              </button>
              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#FEE2E2]:bg-red-500/10 text-[#A1A1AA] hover:text-[#991B1B] transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
          </div>

          {/* Toolbar: Font size + Copy link */}
          <div className="flex items-center justify-between px-5 pb-3 gap-2">
            {/* Font Size */}
            <div className="flex items-center gap-1.5">
              <TextAa size={14} className="text-[#A1A1AA]" />
              {(['sm', 'md', 'lg'] as FontSize[]).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                    fontSize === size
                      ? 'bg-[#18181B] text-white'
                      : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]:bg-gray-700'
                  }`}
                >
                  {FONT_SIZES[size].label}
                </button>
              ))}
            </div>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]:bg-gray-700 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle size={12} weight="fill" className="text-[#059669]" />
                  Copied
                </>
              ) : (
                <>
                  <LinkIcon size={12} />
                  Copy link
                </>
              )}
            </button>
          </div>
        </div>

        {/* â”€â”€â”€ Article Title & Meta â”€â”€â”€ */}
        <div className="px-5 pt-5 pb-4 border-b border-[#E4E4E7]/50">
          <h2 className={`${fs.heading} font-bold text-[#18181B] leading-snug mb-3`}>
            {article.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Sentiment badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
              <SIcon size={12} weight="bold" />
              {sc.label}
            </span>
            {/* Reading time */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB]">
              <ClockCountdown size={12} weight="duotone" />
              {readTime} min read
            </span>
            {/* Word count */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4F4F5] text-[#71717A]">
              <TextAlignLeft size={12} weight="duotone" />
              {wordCount.toLocaleString('en-US')} words
            </span>
            {/* Publish date */}
            <span className="text-[10px] text-[#A1A1AA] ml-auto">
              {formatFullDate(article.pubDate)}
            </span>
          </div>
        </div>

        {/* â”€â”€â”€ Reading Aid Tabs â”€â”€â”€ */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center gap-1 border-b border-[#E4E4E7]">
            {[
              { key: 'summary' as const, label: 'Summary', icon: Quotes },
              { key: 'keypoints' as const, label: 'Key Points', icon: ListBullets },
              { key: 'full' as const, label: 'Full Content', icon: BookOpen },
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                    activeSection === tab.key
                      ? 'border-[#E11D48] text-[#E11D48]'
                      : 'border-transparent text-[#71717A] hover:text-[#18181B]:text-white'
                  }`}
                >
                  <TabIcon size={14} weight={activeSection === tab.key ? 'fill' : 'duotone'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* â”€â”€â”€ Tab Content â”€â”€â”€ */}
        <div className="px-5 py-4 space-y-4">
          {/* SUMMARY TAB */}
          {activeSection === 'summary' && (
            <div className="space-y-4">
              <div className={`${tw.card} ${tw.cardPadding} border-l-4 border-l-[#E11D48]`}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Quotes size={iconSize.sm} weight="duotone" className="text-[#E11D48]" />
                  <span className="text-xs font-bold text-[#18181B]">Quick Summary</span>
                </div>
                <p className={`${fs.body} text-[#3F3F46]`}>
                  {summary || 'Not enough content to generate a summary.'}
                </p>
              </div>

              {/* Sentiment Explanation */}
              <div className={`${tw.card} ${tw.cardPadding}`}>
                <div className="flex items-center gap-2 mb-2.5">
                  <SIcon size={iconSize.sm} weight="duotone" className={sc.text} />
                  <span className="text-xs font-bold text-[#18181B]">Sentiment Analysis</span>
                </div>
                <p className={`text-xs text-[#71717A] leading-relaxed`}>
                  {article.sentiment === 'positive' && 'This article has a positive tone â€” it contains signals of growth, success, or development. This could be good news for the business or industry.'}
                  {article.sentiment === 'negative' && 'This article has a negative tone â€” it contains signals of decline, risk, or difficulty. Potential impact should be closely monitored.'}
                  {article.sentiment === 'neutral' && 'This article has a neutral tone â€” reporting is objective, without a clear positive or negative bias.'}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        article.sentiment === 'positive' ? 'bg-[#059669]' :
                        article.sentiment === 'negative' ? 'bg-[#991B1B]' : 'bg-[#A1A1AA]'
                      }`}
                      style={{
                        width: article.sentiment === 'positive' ? '78%' :
                               article.sentiment === 'negative' ? '72%' : '50%'
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${sc.text}`}>
                    {article.sentiment === 'positive' ? '78%' :
                     article.sentiment === 'negative' ? '72%' : '50%'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Read Time', value: `${readTime} min`, icon: Clock },
                  { label: 'Length', value: `${wordCount} words`, icon: TextAlignLeft },
                  { label: 'Source', value: article.source, icon: Globe },
                ].map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={i} className={`${tw.card} p-3 text-center`}>
                      <ItemIcon size={18} weight="duotone" className="text-[#E11D48] mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#18181B]">{item.value}</p>
                      <p className="text-[9px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* KEY POINTS TAB */}
          {activeSection === 'keypoints' && (
            <div className="space-y-3">
              {keyPoints.length > 0 ? (
                <>
                  <p className="text-[11px] text-[#A1A1AA] font-medium">
                    {keyPoints.length} key points extracted from content
                  </p>
                  {keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className={`${tw.card} ${tw.cardPadding} flex items-start gap-3`}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#FFF1F2] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-[#E11D48]">{idx + 1}</span>
                      </div>
                      <p className={`${fs.body} text-[#3F3F46] flex-1`}>
                        {point}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <ListBullets size={32} weight="duotone" className="text-[#A1A1AA] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA]">Not enough content to extract key points</p>
                </div>
              )}

              {/* Keywords */}
              {article.keywords && article.keywords.length > 0 && (
                <div className={`${tw.card} ${tw.cardPadding}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag size={14} weight="duotone" className="text-[#E11D48]" />
                    <span className="text-xs font-bold text-[#18181B]">Keywords</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {article.keywords.map((kw, i) => (
                      <span key={i} className={tw.badge('neutral')}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FULL CONTENT TAB */}
          {activeSection === 'full' && (
            <div className="space-y-4">
              {/* Full content */}
              <div className={`${tw.card} ${tw.cardPadding}`}>
                <p className={`${fs.body} text-[#3F3F46] whitespace-pre-line`}>
                  {article.content || 'No detailed content available. Please read the original article.'}
                </p>
              </div>

              {/* Source info */}
              <div className="flex items-center gap-2 text-[10px] text-[#A1A1AA]">
                <Database size={12} weight="duotone" />
                <span>Content from RSS source â€” may be truncated. Read the original article for full content.</span>
              </div>
            </div>
          )}

          {/* â”€â”€â”€ Related Articles â”€â”€â”€ */}
          {related.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <Newspaper size={iconSize.sm} weight="duotone" className="text-[#E11D48]" />
                <span className="text-xs font-bold text-[#18181B]">Related Articles</span>
                <span className={tw.badge('neutral')}>{related.length}</span>
              </div>
              <div className="space-y-2">
                {related.map(rel => {
                  const relSc = sentimentConfig(rel.sentiment);
                  const [relC1] = getSourceGradient(rel.source);
                  return (
                    <div
                      key={rel.guid}
                      onClick={() => onOpenArticle(rel)}
                      className={`${tw.card} p-3 flex items-start gap-2.5 cursor-pointer group hover:shadow-sm transition-all`}
                    >
                      <div
                        className="w-1 h-10 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: relC1 }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-[#18181B] line-clamp-2 group-hover:text-[#E11D48] transition-colors leading-snug">
                          {rel.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-[#A1A1AA]">{rel.source}</span>
                          <span className="text-[9px] text-[#A1A1AA]">Â·</span>
                          <span className="text-[9px] text-[#A1A1AA]">{timeAgo(rel.pubDate)}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${relSc.dot} ml-auto shrink-0`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* â”€â”€â”€ Panel Footer: Open Original â”€â”€â”€ */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#E4E4E7] px-5 py-3.5">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#E11D48] hover:bg-[#BE123C] text-white text-sm font-semibold transition-colors"
          >
            <ArrowUpRight size={16} weight="bold" />
            Read Original â€” {article.source}
          </a>
          <p className="text-[9px] text-center text-[#A1A1AA] mt-2">
            Press Esc to close Â· Auto-summary & analysis from RSS content
          </p>
        </div>
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export const NewsIntelligencePage: React.FC<NewsIntelligencePageProps> = ({
  userData,
  competitors,
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'company' | 'competitors' | 'industry'>('all');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('vico_news_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  // Stable refs to prevent re-fetch loops
  const hasFetchedRef = useRef(false);
  const orgNameRef = useRef(userData.orgName);
  const competitorNamesRef = useRef(competitors?.map((c) => c.name).join(',') || '');

  useEffect(() => {
    const currentCompNames = competitors?.map((c) => c.name).join(',') || '';
    if (
      hasFetchedRef.current &&
      orgNameRef.current === userData.orgName &&
      competitorNamesRef.current === currentCompNames
    ) {
      return;
    }
    orgNameRef.current = userData.orgName;
    competitorNamesRef.current = currentCompNames;
    hasFetchedRef.current = true;

    const loadNews = async () => {
      setIsLoading(true);
      try {
        let allNews: NewsArticle[] = [];

        // Company news
        const companyNews = await getCompanyNews(userData.orgName);
        allNews = allNews.concat(
          companyNews.map((item: any) => ({
            ...item,
            sentiment: analyzeSentiment(`${item.title || ''} ${item.content || ''}`),
            relevanceScore: hashScore(item.guid || item.title || '', 60, 40),
            keywords: ['company', 'business', 'market'],
          }))
        );

        // Competitor news (parallel)
        if (competitors && competitors.length > 0) {
          const competitorPromises = competitors.slice(0, 3).map(async (comp) => {
            try {
              const compNews = await getCompanyNews(comp.name);
              return compNews.map((item: any) => ({
                ...item,
                sentiment: analyzeSentiment(`${item.title || ''} ${item.content || ''}`),
                relevanceScore: hashScore(item.guid || item.title || '', 50, 40),
                keywords: ['competition', 'technology', 'development'],
              }));
            } catch {
              return [];
            }
          });
          const results = await Promise.all(competitorPromises);
          allNews = allNews.concat(results.flat());
        }

        // Industry news
        const industryNews = await getCompanyNews('technology');
        allNews = allNews.concat(
          industryNews.map((item: any) => ({
            ...item,
            sentiment: analyzeSentiment(`${item.title || ''} ${item.content || ''}`),
            relevanceScore: hashScore(item.guid || item.title || '', 40, 40),
            keywords: ['industry', 'market', 'trends'],
          }))
        );

        // Deduplicate & sort
        const unique = Array.from(
          new Map(allNews.map((item) => [item.guid, item])).values()
        ).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

        setNews(unique);
        setFilteredNews(unique);
      } catch (e) {
        console.error('Failed to load news:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.orgName]);

  // Filtering
  useEffect(() => {
    let filtered = news;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.content || '').toLowerCase().includes(q)
      );
    }

    if (sentimentFilter !== 'all') {
      filtered = filtered.filter((a) => a.sentiment === sentimentFilter);
    }

    if (activeTab === 'company') {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(userData.orgName.toLowerCase())
      );
    } else if (activeTab === 'competitors' && competitors) {
      const cNames = competitors.map((c) => c.name.toLowerCase());
      filtered = filtered.filter((a) =>
        cNames.some((n) => a.title.toLowerCase().includes(n))
      );
    } else if (activeTab === 'industry') {
      filtered = filtered.filter((a) => (a.relevanceScore ?? 0) < 50);
    }

    setFilteredNews(filtered);
  }, [searchQuery, sentimentFilter, activeTab, news, userData.orgName, competitors]);

  // Computed stats
  const stats = useMemo(() => {
    const pos = news.filter((a) => a.sentiment === 'positive').length;
    const neg = news.filter((a) => a.sentiment === 'negative').length;
    const neu = news.length - pos - neg;
    const sources = new Set(news.map((a) => a.source)).size;
    return { total: news.length, positive: pos, negative: neg, neutral: neu, sources };
  }, [news]);

  // Split hero article + rest
  const heroArticle = filteredNews[0] || null;
  const gridArticles = filteredNews.slice(1, 7);
  const listArticles = filteredNews.slice(7);

  const openArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const toggleBookmark = useCallback((guid: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      try { localStorage.setItem('vico_news_bookmarks', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const handleOpenRelatedArticle = useCallback((article: NewsArticle) => {
    setSelectedArticle(article);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  return (
    <div className="space-y-6 pb-10">
      {/* â”€â”€â”€ Page Header â”€â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className={tw.h1}>News Intelligence</h1>
            <span className={tw.badge('brand')}>
              <Lightning size={iconSize.xs} weight="fill" /> Live Feed
            </span>
          </div>
          <p className={`${tw.body} max-w-xl`}>
            Track, analyze & discover news about your business, competitors, and industry â€” real-time data updates
          </p>
        </div>
      </div>

      {/* â”€â”€â”€ Stat Cards â”€â”€â”€ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Articles', value: stats.total, icon: Newspaper, color: 'text-[#E11D48]' },
          { label: 'Positive', value: stats.positive, icon: TrendUp, color: 'text-[#059669]' },
          { label: 'Neutral', value: stats.neutral, icon: Minus, color: 'text-[#71717A]' },
          { label: 'Negative', value: stats.negative, icon: TrendDown, color: 'text-[#991B1B]' },
          { label: 'Sources', value: stats.sources, icon: Globe, color: 'text-[#0284C7]' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`${tw.card} ${tw.cardPadding} flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-lg bg-[#FFF1F2] flex items-center justify-center ${s.color} shrink-0`}>
                <Icon size={iconSize.sm} weight="duotone" />
              </div>
              <div>
                <p className={tw.metric + ' text-lg lg:text-xl text-[#18181B]'}>{isLoading ? 'â€”' : s.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#A1A1AA]">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* â”€â”€â”€ Search & Filters â”€â”€â”€ */}
      <div className={`${tw.card} ${tw.cardPadding} space-y-3`}>
        {/* Search */}
        <div className="relative">
          <MagnifyingGlass size={iconSize.sm} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search articles, keywords, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${tw.input} !pl-10`}
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source filter tabs */}
          <div className="flex items-center gap-1.5 mr-2">
            <Funnel size={iconSize.sm} className="text-[#A1A1AA]" weight="duotone" />
            {[
              { key: 'all' as const, label: 'All', icon: Newspaper },
              { key: 'company' as const, label: 'Company', icon: Buildings },
              { key: 'competitors' as const, label: 'Competitors', icon: ChartLineUp },
              { key: 'industry' as const, label: 'Industry', icon: Globe },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'bg-[#E11D48] text-white'
                      : 'bg-[#FAFAFA] text-[#3F3F46] hover:bg-[#F4F4F5]:bg-gray-700 border border-[#E4E4E7]'
                  }`}
                >
                  <TabIcon size={12} weight={activeTab === tab.key ? 'fill' : 'duotone'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-[#E4E4E7] hidden sm:block" />

          {/* Sentiment pills */}
          <div className="flex items-center gap-1.5">
            {[
              { key: 'all' as const, label: 'All', dot: 'bg-[#A1A1AA]' },
              { key: 'positive' as const, label: 'Positive', dot: 'bg-[#059669]' },
              { key: 'neutral' as const, label: 'Neutral', dot: 'bg-[#71717A]' },
              { key: 'negative' as const, label: 'Negative', dot: 'bg-[#991B1B]' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSentimentFilter(s.key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  sentimentFilter === s.key
                    ? 'bg-[#18181B] text-white'
                    : 'bg-[#FAFAFA] text-[#3F3F46] hover:bg-[#F4F4F5]:bg-gray-700 border border-[#E4E4E7]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€â”€ Loading State â”€â”€â”€ */}
      {isLoading && (
        <div className="space-y-6">
          {/* Hero skeleton */}
          <div className={`${tw.card} overflow-hidden`}>
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-2 h-56 bg-[#E4E4E7] animate-pulse" />
              <div className="lg:col-span-3 p-6 space-y-4">
                <div className="h-5 bg-[#E4E4E7] rounded-lg w-20 animate-pulse" />
                <div className="h-6 bg-[#E4E4E7] rounded-lg w-3/4 animate-pulse" />
                <div className="h-4 bg-[#E4E4E7] rounded-lg w-full animate-pulse" />
                <div className="h-4 bg-[#E4E4E7] rounded-lg w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${tw.card} overflow-hidden`}>
                <div className="h-36 bg-[#E4E4E7] animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#E4E4E7] rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-[#E4E4E7] rounded w-full animate-pulse" />
                  <div className="h-3 bg-[#E4E4E7] rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€â”€ Content â”€â”€â”€ */}
      {!isLoading && filteredNews.length === 0 && (
        <div className={`${tw.card} ${tw.cardPadding} text-center py-16`}>
          <Newspaper size={48} weight="duotone" className="text-[#A1A1AA] mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#18181B] mb-1">No articles found</p>
          <p className="text-xs text-[#A1A1AA]">Try changing your filters or search keywords</p>
        </div>
      )}

      {!isLoading && filteredNews.length > 0 && (
        <FadeIn duration={400}>
          <div className="space-y-6">
            {/* â”€â”€â”€ Hero Article â”€â”€â”€ */}
            {heroArticle && (
              <HeroArticle article={heroArticle} onClick={() => openArticle(heroArticle)} />
            )}

            {/* â”€â”€â”€ Trending Topics â”€â”€â”€ */}
            <TrendingTopics articles={filteredNews} />

            {/* â”€â”€â”€ Grid News Cards â”€â”€â”€ */}
            {gridArticles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                  <h2 className={tw.h2}>Latest News</h2>
                  <span className={tw.badge('neutral')}>{filteredNews.length} articles</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gridArticles.map((article) => (
                    <ArticleCard
                      key={article.guid}
                      article={article}
                      onClick={() => openArticle(article)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* â”€â”€â”€ List Articles (remaining) â”€â”€â”€ */}
            {listArticles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ChartLineUp size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                  <h3 className={tw.h3}>More News</h3>
                  <span className={tw.badge('neutral')}>{listArticles.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {listArticles.map((article) => (
                    <CompactArticle
                      key={article.guid}
                      article={article}
                      onClick={() => openArticle(article)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* â”€â”€â”€ Data Sources & Methodology Footer â”€â”€â”€ */}
            <div className={`${tw.card} ${tw.cardPadding}`}>
              <div className="flex items-center gap-2 mb-3">
                <Database size={iconSize.md} weight="duotone" className="text-[#E11D48]" />
                <h3 className={tw.h3}>Data Sources & Methodology</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {DATA_SOURCES.map((source, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#71717A]">
                    <CheckCircle size={14} weight="fill" className="text-[#059669] shrink-0" />
                    <span>{source}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#E4E4E7] flex items-center justify-between">
                <span className="text-[10px] text-[#A1A1AA]">Real-time updates</span>
                <span className="text-[10px] font-semibold text-[#A1A1AA]">VICO Intelligence</span>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* â”€â”€â”€ Article Detail Slide-Over Panel â”€â”€â”€ */}
      {selectedArticle && (
        <ArticleDetailPanel
          article={selectedArticle}
          allArticles={news}
          onClose={handleClosePanel}
          onOpenArticle={handleOpenRelatedArticle}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
        />
      )}
    </div>
  );
};
