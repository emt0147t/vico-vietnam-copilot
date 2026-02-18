/**
 * Recruitment & HR Data Fetcher
 * 
 * Fetches hiring activity and HR signals from Vietnamese job boards
 * 
 * Data includes:
 * - Total open job positions (Số lượng job đang mở)
 * - Job titles and positions (Vị trí tuyển dụng)
 * - Hiring trends (Xu hướng tuyển dụng)
 * - Salary ranges (Mức lương)
 * - Department expansion signals (Tín hiệu mở rộng bộ phận)
 * 
 * Sources:
 * - LinkedIn (Khó crawl nhưng dữ liệu xịn nhất)
 * - VietnamWorks (topdev.vn, itviec.com, vietnamworks.com) - Dễ crawl
 * - Company career pages
 * 
 * Signals:
 * - Many Sales positions → Pushing revenue hard
 * - AI/ML Engineers → New product launch coming
 * - Regional managers → Opening new branch
 * - Bulk hiring → Expansion phase
 */

export interface JobPosition {
  title: string;
  count: number; // How many open positions with this title
  salaryRange?: {
    min: number; // USD or local
    max: number;
    currency: string;
  };
  level?: 'intern' | 'junior' | 'senior' | 'lead' | 'manager' | 'executive';
}

export interface HiringSignal {
  category:
    | 'Revenue Expansion'
    | 'Product Launch'
    | 'Geographic Expansion'
    | 'Technical Upgrade'
    | 'Support Growth'
    | 'Restructuring';
  strength: 'Weak' | 'Medium' | 'Strong'; // Based on hiring volume
  description: string;
  evidence: string[]; // List of job titles supporting this
}

export interface RecruitmentHRData {
  companyName: string;
  totalOpenPositions: number;
  topPositions: JobPosition[]; // Top 10 most frequently opened
  hiringRate: {
    current: number; // Positions open now
    change: number; // Percentage change from 30 days ago
    trend: 'Increasing' | 'Stable' | 'Decreasing';
  };
  departmentFocus: {
    [department: string]: number; // % of open positions
  }; // e.g., { "Sales": 35, "Engineering": 25, "Marketing": 20 }
  hiringSignals: HiringSignal[];
  averageSalary: {
    junior: number | null;
    senior: number | null;
    currency: string;
  };
  sourceData: {
    source: string; // e.g., "VietnamWorks", "TopDev", "LinkedIn"
    totalJobsScanned: number;
    lastUpdated: string; // ISO format
  };
  dataQuality: 'High' | 'Medium' | 'Low';
}

class RecruitmentHRDataFetcher {
  private readonly JOB_BOARD_URLS = {
    vietnamworks: 'https://www.vietnamworks.com',
    topdev: 'https://topdev.vn',
    itviec: 'https://itviec.com',
    linkedin: 'https://linkedin.com/jobs',
  };

  private readonly HIRING_SIGNAL_PATTERNS = {
    'Revenue Expansion': {
      keywords: [
        'Sales Engineer',
        'Account Executive',
        'Business Development',
        'Sales Manager',
        'Commercial',
        'Kinh doanh',
        'Bán hàng',
      ],
      minCount: 3,
    },
    'Product Launch': {
      keywords: [
        'AI Engineer',
        'ML Engineer',
        'Data Scientist',
        'Full Stack',
        'Product Manager',
        'Trưởng sản phẩm',
        'AI',
        'Machine Learning',
      ],
      minCount: 2,
    },
    'Geographic Expansion': {
      keywords: [
        'Regional Manager',
        'Branch Manager',
        'District Manager',
        'Đại diện khu vực',
        'Trưởng chi nhánh',
      ],
      minCount: 1,
    },
    'Technical Upgrade': {
      keywords: [
        'DevOps',
        'Cloud Engineer',
        'Infrastructure',
        'System Architect',
        'AWS',
        'Azure',
        'Cloud',
      ],
      minCount: 2,
    },
    'Support Growth': {
      keywords: [
        'Customer Support',
        'Customer Service',
        'Help Desk',
        'Hỗ trợ khách hàng',
        'Chăm sóc khách hàng',
      ],
      minCount: 3,
    },
    'Restructuring': {
      keywords: ['Compliance', 'Risk', 'Internal Audit', 'Legal', 'HR Manager'],
      minCount: 2,
    },
  };

  /**
   * Fetch recruitment and HR data for a company
   */
  async getRecruitmentHRData(
    companyName: string
  ): Promise<RecruitmentHRData> {
    try {
      // This is a template implementation
      // In production, would integrate with job board APIs/scrapers
      return this.createTemplateResponse(companyName);
    } catch (error) {
      console.error(
        `Error fetching recruitment data for ${companyName}:`,
        error
      );
      return this.createTemplateResponse(companyName);
    }
  }

  /**
   * Simulate job board data based on company name
   * In production, would fetch real data from VietnamWorks API, etc.
   */
  private simulateJobBoardData(companyName: string): JobPosition[] {
    // Simulated data - would be replaced with real crawler
    const simulated: { [key: string]: JobPosition[] } = {
      'FPT Software': [
        { title: 'Senior Software Engineer', count: 8 },
        { title: 'Full Stack Developer', count: 6 },
        { title: 'DevOps Engineer', count: 4 },
        { title: 'Product Manager', count: 2 },
      ],
      'Vingroup': [
        { title: 'Sales Executive', count: 12 },
        { title: 'Commercial Manager', count: 5 },
        { title: 'Regional Manager', count: 3 },
        { title: 'Customer Service', count: 6 },
      ],
      'VNG Corporation': [
        { title: 'AI Engineer', count: 5 },
        { title: 'Full Stack Developer', count: 7 },
        { title: 'Product Manager', count: 3 },
        { title: 'Data Scientist', count: 2 },
      ],
    };

    return simulated[companyName] || [];
  }

  /**
   * Analyze hiring signals from job positions
   */
  private analyzeHiringSignals(positions: JobPosition[]): HiringSignal[] {
    const signals: HiringSignal[] = [];
    const positionTitles = positions.map((p) => p.title.toLowerCase());
    const totalPositions = positions.reduce((sum, p) => sum + p.count, 0);

    for (const [category, pattern] of Object.entries(
      this.HIRING_SIGNAL_PATTERNS
    )) {
      const matchingPositions = positions.filter((pos) =>
        pattern.keywords.some((keyword) =>
          pos.title.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      const totalMatching = matchingPositions.reduce((sum, p) => sum + p.count, 0);

      if (totalMatching >= pattern.minCount) {
        let strength: 'Weak' | 'Medium' | 'Strong' = 'Weak';
        const percentage = (totalMatching / totalPositions) * 100;

        if (percentage >= 30) strength = 'Strong';
        else if (percentage >= 15) strength = 'Medium';

        signals.push({
          category: category as any,
          strength,
          description: `Hiring ${totalMatching} positions in ${category.toLowerCase()}`,
          evidence: matchingPositions.map((p) => `${p.title} (${p.count})`),
        });
      }
    }

    return signals;
  }

  /**
   * Calculate department focus distribution
   */
  private calculateDepartmentFocus(positions: JobPosition[]): {
    [key: string]: number;
  } {
    const departments: { [key: string]: number } = {};
    const totalPositions = positions.reduce((sum, p) => sum + p.count, 0);

    const departmentMap: { [key: string]: string[] } = {
      Engineering: ['engineer', 'developer', 'architect', 'devops'],
      Sales: ['sales', 'business development', 'bán hàng', 'kinh doanh'],
      Marketing: ['marketing', 'content', 'social media', 'seo', 'marketing'],
      Support: [
        'support',
        'service',
        'customer',
        'hỗ trợ',
        'chăm sóc khách hàng',
      ],
      Management: ['manager', 'director', 'head', 'lead', 'supervisor'],
      'Data & AI': ['data', 'ai', 'ml', 'scientist', 'analytics'],
      'Product & Design': ['product', 'designer', 'ux', 'ui', 'design'],
    };

    for (const position of positions) {
      const title = position.title.toLowerCase();
      let assigned = false;

      for (const [dept, keywords] of Object.entries(departmentMap)) {
        if (keywords.some((kw) => title.includes(kw))) {
          departments[dept] = (departments[dept] || 0) + position.count;
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        departments['Other'] = (departments['Other'] || 0) + position.count;
      }
    }

    // Convert to percentages
    const percentages: { [key: string]: number } = {};
    for (const [dept, count] of Object.entries(departments)) {
      percentages[dept] = Math.round((count / totalPositions) * 100);
    }

    return percentages;
  }

  /**
   * Create template response
   */
  private createTemplateResponse(companyName: string): RecruitmentHRData {
    const positions = this.simulateJobBoardData(companyName);
    const signals = this.analyzeHiringSignals(positions);
    const totalPositions = positions.reduce((sum, p) => sum + p.count, 0);

    return {
      companyName,
      totalOpenPositions: totalPositions,
      topPositions: positions.slice(0, 10),
      hiringRate: {
        current: totalPositions,
        change: 0, // Would need historical data
        trend: totalPositions > 5 ? 'Increasing' : 'Stable',
      },
      departmentFocus: this.calculateDepartmentFocus(positions),
      hiringSignals: signals,
      averageSalary: {
        junior: 800, // USD/month estimates
        senior: 2500,
        currency: 'USD',
      },
      sourceData: {
        source: 'Simulated (VietnamWorks, TopDev)',
        totalJobsScanned: totalPositions,
        lastUpdated: new Date().toISOString(),
      },
      dataQuality: totalPositions > 0 ? 'Medium' : 'Low',
    };
  }

  /**
   * Identify growth phase based on hiring signals
   */
  identifyGrowthPhase(data: RecruitmentHRData): {
    phase:
      | 'Scaling'
      | 'Optimizing'
      | 'Contracting'
      | 'Stable'
      | 'Unknown';
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let scaling = 0;
    let optimizing = 0;
    let contracting = 0;

    // Analyze hiring signals
    for (const signal of data.hiringSignals) {
      if (signal.strength === 'Strong') {
        if (
          signal.category === 'Revenue Expansion' ||
          signal.category === 'Geographic Expansion' ||
          signal.category === 'Product Launch'
        ) {
          scaling += 2;
          indicators.push(`📈 ${signal.category}: ${signal.strength}`);
        } else if (signal.category === 'Technical Upgrade') {
          optimizing += 1;
          indicators.push(`🔧 ${signal.category}: ${signal.strength}`);
        } else if (signal.category === 'Restructuring') {
          contracting += 1;
          indicators.push(`🔄 ${signal.category}: Restructuring underway`);
        }
      }
    }

    // Analyze hiring trend
    if (data.hiringRate.trend === 'Increasing') {
      scaling += 1;
    } else if (data.hiringRate.trend === 'Decreasing') {
      contracting += 1;
    } else {
      optimizing += 1;
    }

    // Determine phase
    let phase: 'Scaling' | 'Optimizing' | 'Contracting' | 'Stable' | 'Unknown' =
      'Unknown';
    let confidence = 0;

    if (scaling > optimizing && scaling > contracting) {
      phase = 'Scaling';
      confidence = 75;
    } else if (contracting > scaling && contracting > optimizing) {
      phase = 'Contracting';
      confidence = 70;
    } else if (data.totalOpenPositions > 20) {
      phase = 'Scaling';
      confidence = 60;
    } else if (data.totalOpenPositions > 5) {
      phase = 'Optimizing';
      confidence = 55;
    } else if (data.totalOpenPositions === 0) {
      phase = 'Contracting';
      confidence = 50;
    } else {
      phase = 'Stable';
      confidence = 40;
    }

    return { phase, confidence, indicators };
  }

  /**
   * Batch fetch for multiple companies
   */
  async getRecruitmentHRDataBatch(
    companyNames: string[]
  ): Promise<RecruitmentHRData[]> {
    return Promise.all(
      companyNames.map((name) => this.getRecruitmentHRData(name))
    );
  }
}

export default RecruitmentHRDataFetcher;
