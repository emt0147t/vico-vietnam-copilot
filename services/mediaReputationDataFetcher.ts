/**
 * Media & Reputation Data Fetcher
 * 
 * Fetches media mentions, awards, and reputation signals
 * 
 * Reputation is critical for assessing business health and trustworthiness.
 * 
 * Data includes:
 * - Awards and recognitions (Giải thưởng: Sao Khuê, Top 10 ICT)
 * - Scandals and controversies (Bê bối: Nợ lương, kiện tụng)
 * - News mentions and sentiment (Tin tức đại chúng)
 * - Press releases (Bản tin chính thức)
 * - Social sentiment (Rating, reviews, social media)
 * 
 * Sources:
 * - Google News (Tin tức công khai)
 * - Industry awards databases (Sao Khuê, Top ICT, Best Place to Work)
 * - Government records (Phán quyết tòa án, nợ xã hội)
 * - Company press releases
 * - Social media (Glassdoor, Facebook reviews, Google Reviews)
 * - News aggregators (VnExpress, Thanh Niên, etc.)
 * 
 * Risk Assessment Keywords:
 * - Lừa đảo (Fraud)
 * - Nợ lương (Wage theft)
 * - Phốt (Scandal)
 * - Cảnh cáo (Warning)
 * - Kiện tụng (Lawsuit)
 * - Phá sản (Bankruptcy)
 * - Bị phạt (Penalized)
 */

export interface NewsArticle {
  title: string;
  source: string; // News agency
  url: string;
  publishDate: string; // ISO format
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  category:
    | 'Business Growth'
    | 'Product Launch'
    | 'Controversy'
    | 'Leadership'
    | 'Award'
    | 'Legal Issue'
    | 'Other';
  summary: string;
}

export interface Award {
  title: string;
  issuer: string; // Organizing body
  year: number;
  category: string;
  significance: 'International' | 'National' | 'Regional' | 'Industry';
}

export interface RiskFactor {
  type:
    | 'Legal'
    | 'Financial'
    | 'Reputation'
    | 'Operational'
    | 'Regulatory';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  source: string; // Where we found this info
  date: string | null; // When it occurred
}

export interface CompanyRating {
  platform: string; // Glassdoor, Google, Facebook, etc.
  rating: number; // 0-5
  reviewCount: number;
  topicsSentiment: {
    [topic: string]: number; // -100 to +100 sentiment score
  };
}

export interface MediaReputationData {
  companyName: string;
  reliabilityScore: {
    overall: number; // 0-100
    components: {
      newsPositivity: number; // Positive news %
      awardPrestige: number; // Quality of awards
      riskSeverity: number; // Inversion: 100 = no risk, 0 = critical risk
      publicRating: number; // From platforms like Glassdoor
    };
  };
  news: {
    recentMentions: NewsArticle[]; // Last 12 months
    totalMentions: number;
    sentimentBreakdown: {
      positive: number; // Percentage
      neutral: number;
      negative: number;
    };
    topTopics: string[];
  };
  awards: {
    total: number;
    recent: Award[]; // Last 5 years
    mostPrestigious: Award | null;
  };
  riskFactors: {
    critical: RiskFactor[];
    high: RiskFactor[];
    medium: RiskFactor[];
  };
  publicRatings: {
    averageRating: number | null; // 0-5
    platforms: CompanyRating[];
    employeeSentiment: 'Positive' | 'Neutral' | 'Negative' | 'Unknown';
  };
  trustIndicators: {
    isVerified: boolean; // Has legitimate business registration
    hasAwards: boolean;
    hasNegativeNews: boolean;
    hasCriticalRisk: boolean;
    recommendationLevel: 'Highly Recommended' | 'Recommended' | 'Caution' | 'High Risk';
  };
  sourceData: {
    newsSourcesScanned: number;
    lastUpdated: string;
    dateRange: {
      from: string;
      to: string;
    };
  };
  dataQuality: 'High' | 'Medium' | 'Low';
}

class MediaReputationDataFetcher {
  private readonly RISK_KEYWORDS = {
    Critical: [
      'lừa đảo',
      'fraud',
      'phá sản',
      'bankruptcy',
      'nợ lương',
      'wage theft',
      'chiếm đoạt',
      'embezzlement',
    ],
    High: [
      'kiện tụng',
      'lawsuit',
      'bị phạt',
      'penalized',
      'phốt',
      'scandal',
      'cảnh cáo',
      'warning',
    ],
    Medium: [
      'tranh chấp',
      'dispute',
      'khiếu nại',
      'complaint',
      'tạm ngưng',
      'suspended',
    ],
  };

  private readonly AWARD_KEYWORDS = {
    International: ['Best of Asia', 'Asia Pacific', 'Global', 'International'],
    National: ['Sao Khuê', 'Top 10 ICT', 'Best Place to Work Vietnam', 'Vietnam Top'],
    Industry: ['Industry Award', 'Tech Award', 'Innovation Award'],
  };

  /**
   * Fetch media and reputation data for a company
   */
  async getMediaReputationData(
    companyName: string
  ): Promise<MediaReputationData> {
    try {
      // In production would call:
      // - Google News API for recent mentions
      // - Glassdoor API for employee ratings
      // - Custom scrapers for news aggregators
      // For now, return template

      return this.createTemplateResponse(companyName);
    } catch (error) {
      console.error(`Error fetching media reputation data for ${companyName}:`, error);
      return this.createTemplateResponse(companyName);
    }
  }

  /**
   * Simulate news data for known companies
   */
  private getSimulatedNews(companyName: string): NewsArticle[] {
    const simulated: { [key: string]: NewsArticle[] } = {
      'FPT Software': [
        {
          title: 'FPT Software wins international software development award',
          source: 'VnExpress',
          url: 'https://vnexpress.net',
          publishDate: '2024-01-15',
          sentiment: 'Positive',
          category: 'Award',
          summary: 'FPT Software received recognition for software excellence',
        },
        {
          title: 'FPT Software expands to Southeast Asia',
          source: 'Thanh Niên',
          url: 'https://thanhnien.vn',
          publishDate: '2024-01-10',
          sentiment: 'Positive',
          category: 'Business Growth',
          summary: 'Company announced new offices in Thailand and Malaysia',
        },
      ],
      'Shopee': [
        {
          title: 'Shopee reaches 100M users milestone',
          source: 'VnExpress',
          url: 'https://vnexpress.net',
          publishDate: '2024-01-20',
          sentiment: 'Positive',
          category: 'Business Growth',
          summary: 'Southeast Asia e-commerce platform hits 100 million users',
        },
      ],
    };

    return simulated[companyName] || [
      {
        title: `${companyName} - No recent news found`,
        source: 'Database',
        url: '#',
        publishDate: new Date().toISOString().split('T')[0],
        sentiment: 'Neutral',
        category: 'Other',
        summary: 'No recent media mentions available',
      },
    ];
  }

  /**
   * Simulate awards for companies
   */
  private getSimulatedAwards(companyName: string): Award[] {
    const simulated: { [key: string]: Award[] } = {
      'FPT Software': [
        {
          title: 'Best Software Development Company',
          issuer: 'Vietnam IT Association',
          year: 2023,
          category: 'Technology',
          significance: 'National',
        },
        {
          title: 'Top 10 ICT Companies',
          issuer: 'Ministry of Information & Communications',
          year: 2023,
          category: 'Information Technology',
          significance: 'National',
        },
      ],
      'Shopee': [
        {
          title: 'Best E-commerce Platform',
          issuer: 'Vietnam E-commerce Association',
          year: 2023,
          category: 'E-commerce',
          significance: 'National',
        },
      ],
    };

    return simulated[companyName] || [];
  }

  /**
   * Detect risk factors from news
   */
  private detectRiskFactors(news: NewsArticle[]): {
    critical: RiskFactor[];
    high: RiskFactor[];
    medium: RiskFactor[];
  } {
    const risks: {
      critical: RiskFactor[];
      high: RiskFactor[];
      medium: RiskFactor[];
    } = { critical: [], high: [], medium: [] };

    for (const article of news) {
      const text = (article.title + ' ' + article.summary).toLowerCase();

      // Check critical risk keywords
      for (const keyword of this.RISK_KEYWORDS.Critical) {
        if (text.includes(keyword.toLowerCase())) {
          risks.critical.push({
            type: 'Legal',
            severity: 'Critical',
            title: article.title,
            description: article.summary,
            source: article.source,
            date: article.publishDate,
          });
        }
      }

      // Check high risk keywords
      for (const keyword of this.RISK_KEYWORDS.High) {
        if (text.includes(keyword.toLowerCase())) {
          risks.high.push({
            type: 'Legal',
            severity: 'High',
            title: article.title,
            description: article.summary,
            source: article.source,
            date: article.publishDate,
          });
        }
      }

      // Check medium risk keywords
      for (const keyword of this.RISK_KEYWORDS.Medium) {
        if (text.includes(keyword.toLowerCase())) {
          risks.medium.push({
            type: 'Operational',
            severity: 'Medium',
            title: article.title,
            description: article.summary,
            source: article.source,
            date: article.publishDate,
          });
        }
      }
    }

    return risks;
  }

  /**
   * Calculate reliability score based on multiple factors
   */
  private calculateReliabilityScore(
    news: NewsArticle[],
    awards: Award[],
    risks: { critical: any[]; high: any[]; medium: any[] }
  ): {
    overall: number;
    components: {
      newsPositivity: number;
      awardPrestige: number;
      riskSeverity: number;
      publicRating: number;
    };
  } {
    let newsPositivity = 50; // Neutral baseline
    let awardPrestige = 0;
    let riskSeverity = 100; // Start at 100 (no risk)
    let publicRating = 50; // Default neutral

    // Calculate news positivity
    if (news.length > 0) {
      const positiveMentions = news.filter((n) => n.sentiment === 'Positive').length;
      const negativeMentions = news.filter((n) => n.sentiment === 'Negative').length;

      newsPositivity = Math.round((positiveMentions / news.length) * 100);
    }

    // Calculate award prestige
    if (awards.length > 0) {
      const internationalAwards = awards.filter(
        (a) => a.significance === 'International'
      ).length;
      const nationalAwards = awards.filter(
        (a) => a.significance === 'National'
      ).length;

      awardPrestige = Math.round(internationalAwards * 20 + nationalAwards * 10);
      awardPrestige = Math.min(100, awardPrestige);
    }

    // Calculate risk severity (inversion)
    if (risks.critical.length > 0) {
      riskSeverity = 10; // Critical risk = very low score
    } else if (risks.high.length > 0) {
      riskSeverity = 40;
    } else if (risks.medium.length > 0) {
      riskSeverity = 70;
    }

    // Overall reliability score (weighted average)
    const overall = Math.round(
      newsPositivity * 0.25 + awardPrestige * 0.25 + riskSeverity * 0.35 + publicRating * 0.15
    );

    return {
      overall: Math.min(100, overall),
      components: {
        newsPositivity,
        awardPrestige,
        riskSeverity,
        publicRating,
      },
    };
  }

  /**
   * Determine recommendation level based on reliability score
   */
  private getRecommendationLevel(score: number): 'Highly Recommended' | 'Recommended' | 'Caution' | 'High Risk' {
    if (score >= 80) return 'Highly Recommended';
    if (score >= 60) return 'Recommended';
    if (score >= 40) return 'Caution';
    return 'High Risk';
  }

  /**
   * Create template response
   */
  private createTemplateResponse(companyName: string): MediaReputationData {
    const news = this.getSimulatedNews(companyName);
    const awards = this.getSimulatedAwards(companyName);
    const risks = this.detectRiskFactors(news);
    const reliabilityScore = this.calculateReliabilityScore(news, awards, risks);

    const sentimentCounts = {
      positive: news.filter((n) => n.sentiment === 'Positive').length,
      neutral: news.filter((n) => n.sentiment === 'Neutral').length,
      negative: news.filter((n) => n.sentiment === 'Negative').length,
    };

    const totalMentions = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;

    return {
      companyName,
      reliabilityScore: {
        overall: reliabilityScore.overall,
        components: reliabilityScore.components,
      },
      news: {
        recentMentions: news,
        totalMentions,
        sentimentBreakdown: {
          positive: Math.round((sentimentCounts.positive / totalMentions) * 100),
          neutral: Math.round((sentimentCounts.neutral / totalMentions) * 100),
          negative: Math.round((sentimentCounts.negative / totalMentions) * 100),
        },
        topTopics: Array.from(new Set(news.map((n) => n.category))).slice(0, 5),
      },
      awards: {
        total: awards.length,
        recent: awards.slice(0, 5),
        mostPrestigious:
          awards.filter((a) => a.significance === 'International')[0] ||
          awards.filter((a) => a.significance === 'National')[0] ||
          null,
      },
      riskFactors: risks,
      publicRatings: {
        averageRating: 4.2, // Example
        platforms: [
          { platform: 'Google', rating: 4.3, reviewCount: 245, topicsSentiment: {} },
          { platform: 'Glassdoor', rating: 4.1, reviewCount: 156, topicsSentiment: {} },
        ],
        employeeSentiment: risks.critical.length === 0 ? 'Positive' : 'Negative',
      },
      trustIndicators: {
        isVerified: true,
        hasAwards: awards.length > 0,
        hasNegativeNews: sentimentCounts.negative > 0,
        hasCriticalRisk: risks.critical.length > 0,
        recommendationLevel: this.getRecommendationLevel(reliabilityScore.overall),
      },
      sourceData: {
        newsSourcesScanned: news.length,
        lastUpdated: new Date().toISOString(),
        dateRange: {
          from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          to: new Date().toISOString().split('T')[0],
        },
      },
      dataQuality: news.length > 0 ? 'Medium' : 'Low',
    };
  }

  /**
   * Batch fetch reputation data
   */
  async getMediaReputationDataBatch(
    companyNames: string[]
  ): Promise<MediaReputationData[]> {
    return Promise.all(
      companyNames.map((name) => this.getMediaReputationData(name))
    );
  }

  /**
   * Generate reputation summary
   */
  generateReputationSummary(data: MediaReputationData): {
    headline: string;
    risks: string[];
    strengths: string[];
    overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  } {
    const risks: string[] = [];
    const strengths: string[] = [];

    // Analyze risks
    if (data.riskFactors.critical.length > 0) {
      risks.push(`🚨 CRITICAL: ${data.riskFactors.critical[0].title}`);
    }
    if (data.riskFactors.high.length > 0) {
      risks.push(
        `⚠️ HIGH RISK: ${data.riskFactors.high.slice(0, 2).map((r) => r.title).join('; ')}`
      );
    }
    if (data.news.sentimentBreakdown.negative > 30) {
      risks.push('📉 High proportion of negative news');
    }

    // Analyze strengths
    if (data.awards.total > 0) {
      strengths.push(`🏆 ${data.awards.total} awards received`);
    }
    if (data.news.sentimentBreakdown.positive > 50) {
      strengths.push('📈 Predominantly positive media coverage');
    }
    if (data.publicRatings.averageRating && data.publicRatings.averageRating >= 4) {
      strengths.push(
        `⭐ Strong public rating (${data.publicRatings.averageRating}/5)`
      );
    }

    // Overall risk determination
    let overallRisk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
    if (data.trustIndicators.hasCriticalRisk) {
      overallRisk = 'Critical';
    } else if (data.riskFactors.high.length > 0) {
      overallRisk = 'High';
    } else if (data.riskFactors.medium.length > 0) {
      overallRisk = 'Medium';
    }

    const headline =
      data.trustIndicators.recommendationLevel === 'Highly Recommended'
        ? 'Trusted and well-regarded company'
        : data.trustIndicators.recommendationLevel === 'Recommended'
          ? 'Generally positive reputation with minor concerns'
          : data.trustIndicators.recommendationLevel === 'Caution'
            ? 'Mixed signals - requires further due diligence'
            : 'Significant concerns - exercise caution';

    return {
      headline,
      risks,
      strengths,
      overallRisk,
    };
  }
}

export default MediaReputationDataFetcher;
