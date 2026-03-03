/**
 * 🌐 Web Scraper — Lightweight company data enrichment from public websites
 * 
 * Features:
 * - Fetches page title, meta description, Open Graph data
 * - Extracts JSON-LD structured data if available
 * - Respectful crawling: 2s delay, proper User-Agent, timeout
 * - Caching: 24h TTL to avoid re-scraping
 * 
 * Used by competitorIntelligenceService to enrich profiles before Gemini analysis.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ScrapedCompanyData {
    url: string;
    title: string;
    description: string;
    ogData: {
        siteName?: string;
        title?: string;
        description?: string;
        image?: string;
        type?: string;
    };
    jsonLd: Record<string, any> | null;
    headings: string[];
    aboutText: string;
    scrapedAt: string;
    success: boolean;
    error?: string;
}

// ============================================================================
// CACHE
// ============================================================================

const scrapeCache = new Map<string, { data: ScrapedCompanyData; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(url: string): ScrapedCompanyData | null {
    const entry = scrapeCache.get(url);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    if (entry) scrapeCache.delete(url);
    return null;
}

function setCache(url: string, data: ScrapedCompanyData): void {
    scrapeCache.set(url, { data, ts: Date.now() });
}

// ============================================================================
// SCRAPING
// ============================================================================

/**
 * Normalize a website field to a full URL
 * Handles: "fpt.com.vn", "https://fpt.com.vn", "grab.com/vn"
 */
function normalizeUrl(website: string): string {
    if (!website) return '';
    let url = website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    return url;
}

/**
 * Extract text content between HTML tags (basic regex-based, no heavy deps)
 */
function extractBetweenTags(html: string, tag: string): string[] {
    const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'gi');
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
        if (match[1]) {
            const text = match[1].trim();
            if (text.length > 2) matches.push(text);
        }
    }
    return matches;
}

/**
 * Extract meta tag content by name or property
 */
function extractMeta(html: string, attr: string, value: string): string {
    // Match both name="..." and property="..." attributes
    const regex = new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    if (match && match[1]) return match[1];

    // Try reversed attribute order (content before name/property)
    const regex2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["']`, 'i');
    const match2 = html.match(regex2);
    if (match2 && match2[1]) return match2[1];

    return '';
}

/**
 * Extract JSON-LD structured data from HTML
 */
function extractJsonLd(html: string): Record<string, any> | null {
    const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
    const match = html.match(regex);
    if (!match || !match[1]) return null;
    try {
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}

/**
 * Scrape a company website for enrichment data
 * Lightweight: single page fetch, regex-based parsing, no headless browser
 */
export async function scrapeCompanyWebsite(website: string): Promise<ScrapedCompanyData> {
    const url = normalizeUrl(website);
    if (!url) {
        return {
            url: '',
            title: '',
            description: '',
            ogData: {},
            jsonLd: null,
            headings: [],
            aboutText: '',
            scrapedAt: new Date().toISOString(),
            success: false,
            error: 'No website URL provided',
        };
    }

    // Check cache first
    const cached = getCached(url);
    if (cached) return cached;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'VICO-Bot/1.0 (Market Intelligence; +https://vico.vn)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
            },
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : '';

        // Extract meta description
        const description = extractMeta(html, 'name', 'description');

        // Extract Open Graph data
        const ogData = {
            siteName: extractMeta(html, 'property', 'og:site_name'),
            title: extractMeta(html, 'property', 'og:title'),
            description: extractMeta(html, 'property', 'og:description'),
            image: extractMeta(html, 'property', 'og:image'),
            type: extractMeta(html, 'property', 'og:type'),
        };

        // Extract JSON-LD
        const jsonLd = extractJsonLd(html);

        // Extract headings (h1, h2)
        const h1s = extractBetweenTags(html, 'h1');
        const h2s = extractBetweenTags(html, 'h2');
        const headings = [...h1s.slice(0, 3), ...h2s.slice(0, 5)];

        // Try to find about/intro text from meta or first paragraph
        let aboutText = description || ogData.description || '';
        if (!aboutText) {
            const paragraphs = extractBetweenTags(html, 'p');
            aboutText = paragraphs
                .filter(p => p.length > 50)
                .slice(0, 3)
                .join(' ');
        }

        const result: ScrapedCompanyData = {
            url,
            title,
            description,
            ogData,
            jsonLd,
            headings,
            aboutText: aboutText.substring(0, 500),
            scrapedAt: new Date().toISOString(),
            success: true,
        };

        setCache(url, result);
        console.log(`   🌐 Scraped: ${url} (title: "${title.substring(0, 40)}...")`);
        return result;
    } catch (err: any) {
        const result: ScrapedCompanyData = {
            url,
            title: '',
            description: '',
            ogData: {},
            jsonLd: null,
            headings: [],
            aboutText: '',
            scrapedAt: new Date().toISOString(),
            success: false,
            error: err?.message || 'Unknown scrape error',
        };
        console.warn(`   ⚠️ Scrape failed for ${url}: ${err?.message || err}`);
        return result;
    }
}

/**
 * Batch scrape multiple company websites with rate limiting
 * @param websites - Array of website URLs
 * @param delayMs - Delay between requests (default 2000ms)
 */
export async function batchScrape(
    websites: string[],
    delayMs: number = 2000
): Promise<ScrapedCompanyData[]> {
    const results: ScrapedCompanyData[] = [];

    for (const website of websites) {
        // Skip if already cached (no delay needed)
        const cached = getCached(normalizeUrl(website));
        if (cached) {
            results.push(cached);
            continue;
        }

        const result = await scrapeCompanyWebsite(website);
        results.push(result);

        // Rate limit: wait between requests
        if (website !== websites[websites.length - 1]) {
            await new Promise(r => setTimeout(r, delayMs));
        }
    }

    return results;
}

export default {
    scrapeCompanyWebsite,
    batchScrape,
    normalizeUrl,
};
