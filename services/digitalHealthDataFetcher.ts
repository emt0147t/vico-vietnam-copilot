/**
 * Digital Health Data Fetcher
 * 
 * Fetches digital footprint and technical infrastructure data
 * 
 * For tech/e-commerce companies, this is the health indicator.
 * A company's digital presence reflects market share and technical capability.
 * 
 * Data includes:
 * - Monthly website visits (Lượng truy cập web)
 * - Traffic sources (Nguồn truy cập)
 * - Tech stack (Công nghệ sử dụng)
 * - Platform infrastructure (AWS/Azure/GCP)
 * - Core technologies (React, Node.js, etc.)
 * 
 * Sources:
 * - SimilarWeb (Bản miễn phí): Public website traffic data
 * - BuiltWith API: Technology detection
 * - Wappalyzer: Tech stack identification
 * - DNS records: Infrastructure validation
 * - SSL certificates: Security posture
 * 
 * Signals:
 * - High traffic + AWS → Scaling infrastructure
 * - Low traffic on e-commerce site → Weak market presence
 * - Modern tech stack → Technical competency
 * - Legacy tech → Potential technical debt
 */

export interface TrafficData {
  monthlyVisits: number | null;
  visitsTrend: {
    month1: number;
    month2: number;
    month3: number;
  } | null; // Last 3 months for trend
  bounce_rate: number | null; // Percentage
  avgSessionDuration: number | null; // Seconds
  devices: {
    desktop: number; // Percentage
    mobile: number;
    tablet: number;
  } | null;
}

export interface TrafficSource {
  direct: number; // Percentage
  search: number; // Organic search
  social: number;
  referral: number;
  paid: number; // Ads, PPC
  other: number;
}

export interface TechStackItem {
  category: string; // e.g., "Framework", "Language", "Database", "Hosting"
  name: string; // e.g., "React", "Node.js", "PostgreSQL"
  version?: string;
  confidence: number; // 0-100 confidence of detection
}

export interface TechInfrastructure {
  hosting: string | null; // AWS, Azure, GCP, etc.
  cdn: string | null; // CloudFlare, Akamai, etc.
  ssl: {
    provider: string | null;
    expiryDate: string | null;
    valid: boolean;
  };
  mailProvider: string | null; // SendGrid, Mailgun, etc.
  analytics: string[] | null; // Google Analytics, Mixpanel, etc.
}

export interface DigitalHealthData {
  companyName: string;
  website: string | null;
  isOnline: boolean;
  trafficData: TrafficData;
  trafficSources: TrafficSource | null;
  techStack: TechStackItem[]; // Detected technologies
  infrastructure: TechInfrastructure;
  digitalMaturity: {
    score: number; // 0-100
    indicators: string[];
  };
  ecommercePotential?: {
    hasEcommerce: boolean;
    platform: string | null; // Shopify, WooCommerce, Magento, etc.
    estimatedGMV: string | null; // Estimated Gross Merchandise Value
  };
  competitors: {
    name: string;
    trafficRatio: number; // This company traffic / competitor traffic
  }[] | null;
  sourceData: {
    source: string;
    lastUpdated: string;
    dataPoints: number;
  };
  dataQuality: 'High' | 'Medium' | 'Low';
}

class DigitalHealthDataFetcher {
  private readonly TECH_CATEGORIES = {
    'Programming Language': [
      'JavaScript',
      'TypeScript',
      'Python',
      'Go',
      'Rust',
      'Java',
      'C#',
      'PHP',
    ],
    Framework: [
      'React',
      'Vue.js',
      'Angular',
      'Next.js',
      'Nuxt',
      'Express',
      'Django',
      'ASP.NET',
    ],
    'Database': [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'DynamoDB',
      'Elasticsearch',
    ],
    'Hosting': ['AWS', 'Azure', 'Google Cloud', 'DigitalOcean', 'Heroku', 'Vercel'],
    'CDN': ['CloudFlare', 'Akamai', 'Fastly', 'CloudFront'],
    'Analytics': ['Google Analytics', 'Mixpanel', 'Amplitude', 'Heap'],
    'Monitoring': ['New Relic', 'Datadog', 'Sentry', 'CloudWatch'],
    'Payment': ['Stripe', 'PayPal', '2Checkout', 'Adyen'],
  };

  /**
   * Fetch digital health data for a company
   */
  async getDigitalHealthData(
    companyName: string,
    websiteUrl?: string
  ): Promise<DigitalHealthData> {
    try {
      const website = websiteUrl || this.inferWebsiteUrl(companyName);

      if (!website) {
        return this.createTemplateResponse(companyName, null);
      }

      // In production, would call:
      // - SimilarWeb API for traffic data
      // - Wappalyzer for tech stack
      // - DNS/SSL data
      // For now, return template

      return this.createTemplateResponse(companyName, website);
    } catch (error) {
      console.error(`Error fetching digital health data for ${companyName}:`, error);
      return this.createTemplateResponse(companyName, websiteUrl || null);
    }
  }

  /**
   * Infer website URL from company name
   */
  private inferWebsiteUrl(companyName: string): string | null {
    // Simple heuristic - in production would look up DNS or database
    const normalized = companyName
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');

    if (normalized.length === 0) return null;

    return `https://www.${normalized}.com.vn`;
  }

  /**
   * Simulate tech stack detection for known companies
   */
  private getSimulatedTechStack(companyName: string): TechStackItem[] {
    const simulated: { [key: string]: TechStackItem[] } = {
      'FPT Software': [
        { category: 'Framework', name: 'React', version: '18.x', confidence: 95 },
        { category: 'Language', name: 'TypeScript', confidence: 90 },
        { category: 'Backend', name: 'Node.js', version: '18.x', confidence: 85 },
        { category: 'Database', name: 'PostgreSQL', confidence: 80 },
        { category: 'Hosting', name: 'AWS', confidence: 90 },
        { category: 'CDN', name: 'CloudFlare', confidence: 85 },
      ],
      'Shopee': [
        { category: 'Framework', name: 'React', version: '17.x', confidence: 95 },
        { category: 'Language', name: 'Java', confidence: 85 },
        { category: 'Database', name: 'MySQL', confidence: 80 },
        { category: 'Hosting', name: 'AWS', confidence: 95 },
        { category: 'CDN', name: 'CloudFlare', confidence: 90 },
      ],
      'Tiki': [
        { category: 'Framework', name: 'React', confidence: 90 },
        { category: 'Language', name: 'JavaScript', confidence: 85 },
        { category: 'Backend', name: 'Node.js', confidence: 80 },
        { category: 'Database', name: 'MongoDB', confidence: 75 },
        { category: 'Hosting', name: 'Google Cloud', confidence: 85 },
      ],
      'VNG Corporation': [
        { category: 'Framework', name: 'Vue.js', confidence: 85 },
        { category: 'Language', name: 'TypeScript', confidence: 85 },
        { category: 'Backend', name: 'Go', confidence: 80 },
        { category: 'Database', name: 'NoSQL', confidence: 75 },
        { category: 'Hosting', name: 'AWS', confidence: 90 },
      ],
    };

    return simulated[companyName] || [];
  }

  /**
   * Simulate website traffic data
   */
  private getSimulatedTrafficData(companyName: string): TrafficData {
    // Simulated based on company size
    const simulated: { [key: string]: TrafficData } = {
      'Shopee': {
        monthlyVisits: 150000000,
        visitsTrend: { month1: 140000000, month2: 145000000, month3: 150000000 },
        bounce_rate: 35,
        avgSessionDuration: 450,
        devices: { desktop: 30, mobile: 65, tablet: 5 },
      },
      'Tiki': {
        monthlyVisits: 80000000,
        visitsTrend: { month1: 75000000, month2: 78000000, month3: 80000000 },
        bounce_rate: 40,
        avgSessionDuration: 420,
        devices: { desktop: 35, mobile: 60, tablet: 5 },
      },
      'FPT Software': {
        monthlyVisits: 500000,
        visitsTrend: { month1: 480000, month2: 490000, month3: 500000 },
        bounce_rate: 45,
        avgSessionDuration: 300,
        devices: { desktop: 70, mobile: 25, tablet: 5 },
      },
    };

    return (
      simulated[companyName] || {
        monthlyVisits: null,
        visitsTrend: null,
        bounce_rate: null,
        avgSessionDuration: null,
        devices: null,
      }
    );
  }

  /**
   * Calculate digital maturity score
   */
  private calculateDigitalMaturity(
    data: DigitalHealthData
  ): { score: number; indicators: string[] } {
    const indicators: string[] = [];
    let score = 0;

    // Website traffic
    if (data.trafficData.monthlyVisits) {
      if (data.trafficData.monthlyVisits > 10000000) {
        score += 30;
        indicators.push('✓ High traffic (10M+ monthly)');
      } else if (data.trafficData.monthlyVisits > 1000000) {
        score += 20;
        indicators.push('✓ Moderate traffic (1M-10M monthly)');
      } else {
        score += 10;
        indicators.push('⚠ Low traffic (<1M monthly)');
      }
    }

    // Tech stack modernity
    const modernTechs = [
      'React',
      'Vue.js',
      'Next.js',
      'TypeScript',
      'Go',
      'Rust',
      'PostgreSQL',
      'MongoDB',
    ];
    const hasModernTech = data.techStack.some((t) => modernTechs.includes(t.name));

    if (hasModernTech) {
      score += 20;
      indicators.push('✓ Modern tech stack detected');
    } else if (data.techStack.length > 0) {
      score += 10;
      indicators.push('⚠ Legacy tech stack');
    }

    // Cloud infrastructure
    const cloudProviders = ['AWS', 'Azure', 'Google Cloud'];
    const usesCloud = data.infrastructure.hosting &&
      cloudProviders.includes(data.infrastructure.hosting);

    if (usesCloud) {
      score += 20;
      indicators.push(`✓ Cloud infrastructure (${data.infrastructure.hosting})`);
    }

    // SSL/Security
    if (data.infrastructure.ssl.valid) {
      score += 10;
      indicators.push('✓ SSL certificate valid');
    }

    // Mobile optimization
    if (
      data.trafficData.devices &&
      data.trafficData.devices.mobile > 50
    ) {
      score += 10;
      indicators.push('✓ Mobile-optimized (>50% traffic)');
    }

    // CDN usage
    if (data.infrastructure.cdn) {
      score += 10;
      indicators.push(`✓ CDN enabled (${data.infrastructure.cdn})`);
    }

    return { score: Math.min(100, score), indicators };
  }

  /**
   * Estimate e-commerce GMV if applicable
   */
  private estimateEcommerceGMV(trafficData: TrafficData): string | null {
    if (
      !trafficData.monthlyVisits ||
      trafficData.monthlyVisits < 100000
    ) {
      return null;
    }

    // Rough estimate: visits * conversion rate * average order value
    const monthlyVisits = trafficData.monthlyVisits;
    const estimatedConversionRate = 0.02; // 2%
    const estimatedAOV = 50; // $50 USD

    const estimatedMonthlyGMV = monthlyVisits * estimatedConversionRate * estimatedAOV;
    const estimatedAnnualGMV = estimatedMonthlyGMV * 12;

    if (estimatedAnnualGMV > 1000000000) {
      return `$${(estimatedAnnualGMV / 1000000000).toFixed(1)}B`;
    } else if (estimatedAnnualGMV > 1000000) {
      return `$${(estimatedAnnualGMV / 1000000).toFixed(0)}M`;
    } else {
      return `$${estimatedAnnualGMV.toFixed(0)}`;
    }
  }

  /**
   * Create template response
   */
  private createTemplateResponse(
    companyName: string,
    website: string | null
  ): DigitalHealthData {
    const trafficData = this.getSimulatedTrafficData(companyName);
    const techStack = this.getSimulatedTechStack(companyName);

    const response: DigitalHealthData = {
      companyName,
      website,
      isOnline: website !== null,
      trafficData,
      trafficSources: website
        ? {
            direct: 25,
            search: 40,
            social: 15,
            referral: 10,
            paid: 8,
            other: 2,
          }
        : null,
      techStack,
      infrastructure: {
        hosting: techStack.find((t) => t.category === 'Hosting')?.name || null,
        cdn: techStack.find((t) => t.category === 'CDN')?.name || null,
        ssl: {
          provider: 'Sectigo',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          valid: true,
        },
        mailProvider: 'SendGrid',
        analytics: ['Google Analytics'],
      },
      digitalMaturity: { score: 0, indicators: [] }, // Will be calculated below
      ecommercePotential: {
        hasEcommerce: website?.includes('shop') || website?.includes('store') || false,
        platform: null,
        estimatedGMV: this.estimateEcommerceGMV(trafficData),
      },
      competitors: null,
      sourceData: {
        source: 'Simulated (SimilarWeb, Wappalyzer)',
        lastUpdated: new Date().toISOString(),
        dataPoints: techStack.length + (trafficData.monthlyVisits ? 1 : 0),
      },
      dataQuality: techStack.length > 0 ? 'Medium' : 'Low',
    };

    // Calculate digital maturity
    response.digitalMaturity = this.calculateDigitalMaturity(response);

    return response;
  }

  /**
   * Compare company's digital health vs competitors
   */
  compareWithCompetitors(
    companyData: DigitalHealthData,
    competitorData: DigitalHealthData[]
  ): DigitalHealthData {
    const competitors = competitorData.map((comp) => {
      const ratio =
        comp.trafficData.monthlyVisits && companyData.trafficData.monthlyVisits
          ? comp.trafficData.monthlyVisits / companyData.trafficData.monthlyVisits
          : null;

      return {
        name: comp.companyName,
        trafficRatio: ratio || 0,
      };
    });

    return {
      ...companyData,
      competitors,
    };
  }

  /**
   * Batch fetch digital health data
   */
  async getDigitalHealthDataBatch(
    companies: { name: string; website?: string }[]
  ): Promise<DigitalHealthData[]> {
    return Promise.all(
      companies.map((company) =>
        this.getDigitalHealthData(company.name, company.website)
      )
    );
  }
}

export default DigitalHealthDataFetcher;
