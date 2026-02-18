/**
 * 🔄 Real Data First Strategy Service
 * 
 * Aggregates data from multiple sources with strict prioritization:
 * 1. Official Government Sources (GSO, SEC) - Trust: 1.0
 * 2. Verified Databases (Crunchbase) - Trust: 0.85-0.95
 * 3. News & Media APIs - Trust: 0.70-0.80
 * ❌ NEVER: Generated/Synthetic Data
 */

import {
  DataQualityScorer,
  QualityTrackedData,
  VerificationStatus,
  createQualityData,
  DataSource,
  DataValidator
} from './dataQualityScore';

export interface DataAggregationResult {
  primary: QualityTrackedData;      // Best available data
  alternatives?: QualityTrackedData[]; // Other sources (for comparison)
  conflictDetected: boolean;        // Multiple sources disagree
  totalSourcesChecked: number;
}

/**
 * Real Data Fetcher from multiple sources
 */
export class RealDataFirstAggregator {
  private cache: Map<string, { data: QualityTrackedData; expiresAt: Date }> = new Map();

  /**
   * Get company revenue with real-data-first approach
   */
  async getCompanyRevenue(
    companyName: string,
    website?: string
  ): Promise<DataAggregationResult> {
    const sources: QualityTrackedData[] = [];

    // Tier 1: SEC EDGAR for US companies (OFFICIAL)
    try {
      const secRevenue = await this.fetchSECRevenue(companyName);
      if (secRevenue) sources.push(secRevenue);
    } catch (e) {
      console.warn(`SEC fetch failed for ${companyName}:`, e);
    }

    // Tier 2: Crunchbase (Verified startup data)
    try {
      const cbRevenue = await this.fetchCrunchbaseRevenue(companyName);
      if (cbRevenue) sources.push(cbRevenue);
    } catch (e) {
      console.warn(`Crunchbase fetch failed for ${companyName}:`, e);
    }

    // Tier 3: News mentions + patterns (Inference only, not generation)
    try {
      const newsRevenue = await this.inferRevenueFromNews(companyName);
      if (newsRevenue) sources.push(newsRevenue);
    } catch (e) {
      console.warn(`News inference failed for ${companyName}:`, e);
    }

    // ❌ DO NOT ADD: Generated/AI-synthesized revenue

    // Rank sources by trust score
    const rankedSources = DataQualityScorer.rankByTrustScore(sources);

    if (rankedSources.length === 0) {
      throw new Error(
        `No real data found for ${companyName}. ` +
        `Returning no data instead of generated alternative.`
      );
    }

    // Detect conflicts
    const conflictDetected = this.detectConflicts(rankedSources);

    return {
      primary: rankedSources[0],
      alternatives: rankedSources.slice(1),
      conflictDetected,
      totalSourcesChecked: sources.length
    };
  }

  /**
   * Get company headcount from real sources
   */
  async getCompanyHeadcount(
    companyName: string,
    website?: string
  ): Promise<DataAggregationResult> {
    const sources: QualityTrackedData[] = [];

    // Tier 1: LinkedIn official (if API available)
    try {
      const lnHeadcount = await this.fetchLinkedInHeadcount(companyName);
      if (lnHeadcount) sources.push(lnHeadcount);
    } catch (e) {
      console.warn(`LinkedIn fetch failed for ${companyName}:`, e);
    }

    // Tier 2: Crunchbase employee data
    try {
      const cbHeadcount = await this.fetchCrunchbaseHeadcount(companyName);
      if (cbHeadcount) sources.push(cbHeadcount);
    } catch (e) {
      console.warn(`Crunchbase headcount failed for ${companyName}:`, e);
    }

    // Tier 3: News mentions (Google "company hiring" news)
    try {
      const newsHeadcount = await this.inferHeadcountFromNews(companyName);
      if (newsHeadcount) sources.push(newsHeadcount);
    } catch (e) {
      console.warn(`News headcount inference failed for ${companyName}:`, e);
    }

    if (sources.length === 0) {
      throw new Error(
        `No real headcount data for ${companyName}. ` +
        `Cannot estimate - requires manual entry.`
      );
    }

    const rankedSources = DataQualityScorer.rankByTrustScore(sources);
    const conflictDetected = this.detectConflicts(rankedSources);

    return {
      primary: rankedSources[0],
      alternatives: rankedSources.slice(1),
      conflictDetected,
      totalSourcesChecked: sources.length
    };
  }

  /**
   * Get recent news with source attribution
   */
  async getRecentNews(
    companyName: string,
    limit: number = 10
  ): Promise<QualityTrackedData[]> {
    const newsItems: QualityTrackedData[] = [];

    // Multi-source aggregation (NO generation)
    try {
      // NewsAPI
      const newsApiNews = await this.fetchNewsAPI(companyName, limit);
      newsItems.push(...newsApiNews);
    } catch (e) {
      console.warn(`NewsAPI failed for ${companyName}:`, e);
    }

    try {
      // GNews (multi-language)
      const gNews = await this.fetchGNews(companyName, limit);
      newsItems.push(...gNews);
    } catch (e) {
      console.warn(`GNews failed for ${companyName}:`, e);
    }

    // Deduplicate by URL
    const uniqueNews = Array.from(
      new Map(newsItems.map(n => [n.value?.url || n.value?.title, n])).values()
    );

    // Sort by freshness
    return uniqueNews
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, limit);
  }

  /**
   * Detect conflicts between data sources
   */
  private detectConflicts(sources: QualityTrackedData[]): boolean {
    if (sources.length < 2) return false;

    const values = sources.map(s => s.value);
    
    // For numeric values, check if variance is too high
    if (typeof values[0] === 'number') {
      const min = Math.min(...values as number[]);
      const max = Math.max(...values as number[]);
      const difference = max - min;
      const avgValue = (max + min) / 2;
      const variationPercent = (difference / avgValue) * 100;

      // Flag as conflict if variation > 30%
      return variationPercent > 30;
    }

    // For strings, check if they're different
    return values.some(v => v !== values[0]);
  }

  // ============================================================================
  // TIER 1: OFFICIAL SOURCES
  // ============================================================================

  private async fetchSECRevenue(companyName: string): Promise<QualityTrackedData | null> {
    // Placeholder: Would call SEC EDGAR API
    // https://www.sec.gov/cgi-bin/browse-edgar

    console.log(`[TODO] Implement: Fetch ${companyName} revenue from SEC EDGAR`);
    return null;
  }

  private async fetchLinkedInHeadcount(companyName: string): Promise<QualityTrackedData | null> {
    // Placeholder: Would query LinkedIn company page
    console.log(`[TODO] Implement: Fetch ${companyName} headcount from LinkedIn`);
    return null;
  }

  // ============================================================================
  // TIER 2: VERIFIED DATABASES
  // ============================================================================

  private async fetchCrunchbaseRevenue(companyName: string): Promise<QualityTrackedData | null> {
    // Placeholder: Would call Crunchbase API
    // Requires: CRUNCHBASE_API_KEY

    console.log(`[TODO] Implement: Fetch ${companyName} revenue from Crunchbase`);
    return null;
  }

  private async fetchCrunchbaseHeadcount(companyName: string): Promise<QualityTrackedData | null> {
    console.log(`[TODO] Implement: Fetch ${companyName} headcount from Crunchbase`);
    return null;
  }

  // ============================================================================
  // TIER 3: NEWS & INFERENCE
  // ============================================================================

  private async inferRevenueFromNews(companyName: string): Promise<QualityTrackedData | null> {
    // Fetch recent news about company financials
    const news = await this.fetchNewsAPI(companyName, 5);
    
    if (news.length === 0) return null;

    // Look for mentions of revenue in headlines/content
    const relevantNews = news.filter(n => 
      (n.value as any)?.content?.match(/\$[\d.]+[BM]|revenue|earnings/i)
    );

    if (relevantNews.length === 0) return null;

    // This is INFERENCE from news, not generation
    return createQualityData(
      '~Estimated from news mentions',
      'newsapi',
      {
        verificationStatus: VerificationStatus.UNVERIFIED,
        confidence: 0.3, // Low confidence - just inference
        citations: relevantNews.map(n => ({
          url: (n.value as any)?.url || '#',
          title: (n.value as any)?.title || 'News mention',
          date: n.lastUpdated,
          accessedDate: new Date()
        }))
      }
    );
  }

  private async inferHeadcountFromNews(companyName: string): Promise<QualityTrackedData | null> {
    // Look for hiring announcements in news
    const news = await this.fetchNewsAPI(`${companyName} hiring employees`, 5);

    if (news.length === 0) return null;

    // Inference from hiring news frequency - NOT generation
    return createQualityData(
      `~Active hiring detected (${news.length} recent mentions)`,
      'newsapi',
      {
        verificationStatus: VerificationStatus.UNVERIFIED,
        confidence: 0.2,
        citations: news.map(n => ({
          url: (n.value as any)?.url || '#',
          title: (n.value as any)?.title || 'Hiring mention',
          date: n.lastUpdated,
          accessedDate: new Date()
        }))
      }
    );
  }

  private async fetchNewsAPI(query: string, limit: number): Promise<QualityTrackedData[]> {
    // Placeholder: Call NewsAPI
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) return [];

    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&` +
        `sortBy=publishedAt&language=en&pageSize=${limit}&apiKey=${apiKey}`
      );

      if (!response.ok) return [];

      const data = (await response.json()) as any;
      return (data.articles || []).map((article: any) =>
        createQualityData(
          {
            title: article.title,
            description: article.description,
            url: article.url,
            content: article.content,
            source: article.source?.name,
            image: article.urlToImage
          },
          'newsapi',
          {
            lastUpdated: new Date(article.publishedAt),
            verificationStatus: VerificationStatus.UNVERIFIED,
            citations: [
              {
                url: article.url,
                title: article.title,
                date: new Date(article.publishedAt),
                excerpt: article.description,
                accessedDate: new Date(),
                documentType: 'news'
              }
            ]
          }
        )
      );
    } catch (e) {
      console.error('NewsAPI fetch error:', e);
      return [];
    }
  }

  private async fetchGNews(query: string, limit: number): Promise<QualityTrackedData[]> {
    // Placeholder: Call GNews API for multi-language support
    const apiKey = process.env.GNEWS_KEY;
    if (!apiKey) return [];

    try {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&` +
        `lang=en&country=us&limit=${limit}&token=${apiKey}`
      );

      if (!response.ok) return [];

      const data = (await response.json()) as any;
      return (data.articles || []).map((article: any) =>
        createQualityData(
          {
            title: article.title,
            description: article.description,
            url: article.url,
            content: article.content,
            source: article.source?.name,
            image: article.image
          },
          'gnews',
          {
            lastUpdated: new Date(article.publishedAt),
            verificationStatus: VerificationStatus.UNVERIFIED,
            citations: [
              {
                url: article.url,
                title: article.title,
                date: new Date(article.publishedAt),
                excerpt: article.description,
                accessedDate: new Date(),
                documentType: 'news'
              }
            ]
          }
        )
      );
    } catch (e) {
      console.error('GNews fetch error:', e);
      return [];
    }
  }

  /**
   * Example usage:
   * 
   * const aggregator = new RealDataFirstAggregator();
   * 
   * try {
   *   const revenue = await aggregator.getCompanyRevenue('Apple Inc.');
   *   console.log(revenue.primary.value);    // Actual revenue
   *   console.log(revenue.primary.source);   // 'sec' or 'crunchbase'
   *   console.log(revenue.primary.trustScore); // 0.95 (high trust)
   * } catch (e) {
   *   console.log('No real data available - do not generate fallback');
   * }
   */
}

/**
 * Helper to check if data is acceptable quality
 */
export function isDataAcceptable(
  result: DataAggregationResult,
  minimumTrust: number = 0.70
): boolean {
  // Never accept if source is 'generated'
  if (result.primary.source === 'generated') return false;

  // Check min trust threshold
  if (result.primary.trustScore < minimumTrust) return false;

  // Check for conflicts (optional: may want to allow with warning)
  if (result.conflictDetected) {
    console.warn('⚠️ Data conflict detected - multiple sources disagree');
  }

  return true;
}

/**
 * Helper to get user-friendly data summary
 */
export function formatDataSummary(result: DataAggregationResult): string {
  const { primary, alternatives, conflictDetected, totalSourcesChecked } = result;
  const trustLevel = DataQualityScorer.getTrustLevel(primary.trustScore);

  let summary = `Data: ${primary.value} (${trustLevel.level})\\n`;
  summary += `Source: ${primary.source}\\n`;
  summary += `Last Updated: ${primary.lastUpdated.toLocaleDateString()}\\n`;
  summary += `Sources Checked: ${totalSourcesChecked}\\n`;

  if (alternatives && alternatives.length > 0) {
    summary += `\\nAlternative Sources:\\n`;
    alternatives.forEach(alt => {
      summary += `  - ${alt.value} (${alt.source}, trust: ${(alt.trustScore * 100).toFixed(0)}%)\\n`;
    });
  }

  if (conflictDetected) {
    summary += `\\n⚠️ WARNING: Conflicting data from multiple sources!\\n`;
  }

  return summary;
}
