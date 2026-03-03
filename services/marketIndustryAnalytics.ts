/**
 * Market & Industry Analytics Service
 * 
 * Calculates exclusive VICO insights from company database:
 * 1. VICO Market Index: Estimated total revenue by industry
 * 2. Concentration Ratio: Top 5 companies' share of total employees
 * 3. Hiring Trend: Employee growth across industries
 * 4. Industry Health Metrics: Company counts, avg growth, sentiment
 */

import CompaniesDataService from './companiesDataService';
import { CompanyProfile } from '../data/companies';

export interface MarketIndexMetrics {
  industry: string;
  totalCompanies: number;
  totalEmployees: number;
  estimatedMarketSize: string;
  concentrationRatio: {
    top5Companies: CompanyRank[];
    top5EmployeeShare: number; // Percentage (0-100)
    marketConcentration: 'Highly Fragmented' | 'Moderate' | 'Concentrated' | 'Highly Concentrated';
  };
  hiringTrend: {
    avgCompanyAge: number;
    employeeSizeDistribution: { [key: string]: number };
    growthPercentage: number;
    trend: 'Growing' | 'Stable' | 'Declining';
  };
  industryHealth: {
    avgGrowthRate: number;
    sentimentScore: number; // 0-100
    positiveCompanies: number;
    neutralCompanies: number;
    negativeCompanies: number;
    dynamicScore: number; // 0-100 metric combining growth + sentiment
  };
}

export interface CompanyRank {
  name: string;
  employees: string;
  employeeCount: number;
  industry: string;
  rank: number;
}

export interface IndustryComparison {
  industries: {
    [key: string]: {
      marketIndex: MarketIndexMetrics;
      marketShare: number; // Percentage of total employees across all industries
      ranking: number;
    };
  };
  marketSummary: {
    totalCompanies: number;
    totalEstimatedEmployees: number;
    averageSentiment: number;
    topGrowingIndustry: string;
    mostFragmentedIndustry: string;
    largestIndustry: string;
  };
}

class MarketIndustryAnalytics {
  private service = CompaniesDataService.getInstance();
  private employeeSizeMap: { [key: string]: { min: number; max: number; estimate: number } } = {
    'ít hơn 5 người': { min: 1, max: 5, estimate: 3 },
    '1-9 nhân viên': { min: 1, max: 9, estimate: 5 },
    '10-24 nhân viên': { min: 10, max: 24, estimate: 17 },
    '25-99 nhân viên': { min: 25, max: 99, estimate: 62 },
    '100-499 nhân viên': { min: 100, max: 499, estimate: 300 },
    '500-999 nhân viên': { min: 500, max: 999, estimate: 750 },
    '1000+ nhân viên': { min: 1000, max: 10000, estimate: 3000 },
    'Từ 5 - 10 người': { min: 5, max: 10, estimate: 7 },
    'Từ 11 - 50 người': { min: 11, max: 50, estimate: 30 },
    'Từ 51 - 100 người': { min: 51, max: 100, estimate: 75 },
    'Từ 101 - 200 người': { min: 101, max: 200, estimate: 150 },
    '10000+ nhân viên': { min: 10000, max: 50000, estimate: 15000 },
    'Unknown': { min: 50, max: 100, estimate: 75 },
  };

  /**
   * Parse employee size string and return estimated employee count
   */
  private parseEmployeeCount(sizeStr: string): number {
    if (!sizeStr) return 75; // Default/Unknown

    for (const [key, value] of Object.entries(this.employeeSizeMap)) {
      if (sizeStr.toLowerCase().includes(key.toLowerCase()) || key.includes(sizeStr)) {
        return value.estimate;
      }
    }

    // Fallback: try to extract numbers from string
    const match = sizeStr.match(/(\d+)/);
    if (match) {
      return Math.max(50, parseInt(match[1]));
    }

    return 75; // Default estimate
  }

  /**
   * Calculate market index for a specific industry
   */
  async getMarketIndexByIndustry(industry: string): Promise<MarketIndexMetrics> {
    const companies = this.service.getCompaniesByIndustry(industry);

    if (companies.length === 0) {
      throw new Error(`No companies found for industry: ${industry}`);
    }

    // Calculate employee metrics
    const employeeData = companies.map((c) => ({
      company: c,
      count: this.parseEmployeeCount(c.size),
    }));

    const totalEmployees = employeeData.reduce((sum, d) => sum + d.count, 0);

    // Top 5 companies by employee count
    const top5 = employeeData
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((d, idx) => ({
        name: d.company.name,
        employees: d.company.size,
        employeeCount: d.count,
        industry: d.company.industry || 'Unknown',
        rank: idx + 1,
      }));

    const top5EmployeeCount = top5.reduce((sum, c) => sum + c.employeeCount, 0);
    const concentrationRatio = (top5EmployeeCount / totalEmployees) * 100;

    // Market concentration level
    let marketConcentration: 'Highly Fragmented' | 'Moderate' | 'Concentrated' | 'Highly Concentrated';
    if (concentrationRatio > 70) {
      marketConcentration = 'Highly Concentrated';
    } else if (concentrationRatio > 50) {
      marketConcentration = 'Concentrated';
    } else if (concentrationRatio > 25) {
      marketConcentration = 'Moderate';
    } else {
      marketConcentration = 'Highly Fragmented';
    }

    // Industry health metrics
    const sentiments = companies.reduce(
      (acc, c) => {
        acc[c.sentiment || 'Neutral'] = (acc[c.sentiment || 'Neutral'] || 0) + 1;
        return acc;
      },
      {} as { [key: string]: number }
    );

    const sentimentScore =
      ((sentiments['Positive'] || 0) * 100 + (sentiments['Neutral'] || 0) * 50) /
      companies.length;

    // Growth metrics
    const currentYear = new Date().getFullYear();
    const avgCompanyAge = companies.reduce((sum, c) => {
      const age = c.year ? currentYear - c.year : 10;
      return sum + age;
    }, 0) / companies.length;

    // Estimate growth based on company age trend
    const growthPercentage = Math.min(
      100,
      ((2024 - avgCompanyAge) / avgCompanyAge) * 10
    ); // Simplified estimate: younger companies = more growth

    // Employee size distribution
    const employeeSizeDistribution: { [key: string]: number } = {};
    companies.forEach((c) => {
      const size = c.size || 'Unknown';
      employeeSizeDistribution[size] = (employeeSizeDistribution[size] || 0) + 1;
    });

    // Trend calculation
    let trend: 'Growing' | 'Stable' | 'Declining' = 'Stable';
    if (growthPercentage > 15) trend = 'Growing';
    if (growthPercentage < 5) trend = 'Declining';

    // Dynamic score: combines growth + sentiment (0-100)
    const dynamicScore = Math.round((growthPercentage * 0.4 + sentimentScore * 0.6) / 1);

    // Estimate market size
    const marketSizeEstimate = this.estimateMarketSize(totalEmployees, industry);

    return {
      industry,
      totalCompanies: companies.length,
      totalEmployees,
      estimatedMarketSize: marketSizeEstimate,
      concentrationRatio: {
        top5Companies: top5,
        top5EmployeeShare: parseFloat(concentrationRatio.toFixed(2)),
        marketConcentration,
      },
      hiringTrend: {
        avgCompanyAge: parseFloat(avgCompanyAge.toFixed(1)),
        employeeSizeDistribution,
        growthPercentage: parseFloat(growthPercentage.toFixed(2)),
        trend,
      },
      industryHealth: {
        avgGrowthRate: parseFloat((companies.reduce((sum, c) => sum + (c.growth || 0), 0) / companies.length).toFixed(2)),
        sentimentScore: parseFloat(sentimentScore.toFixed(2)),
        positiveCompanies: sentiments['Positive'] || 0,
        neutralCompanies: sentiments['Neutral'] || 0,
        negativeCompanies: sentiments['Negative'] || 0,
        dynamicScore: parseFloat(dynamicScore.toFixed(2)),
      },
    };
  }

  /**
   * Get comprehensive industry comparison across all industries
   */
  async getIndustryComparison(): Promise<IndustryComparison> {
    const industries = this.service.getIndustries();
    const industriesData: { [key: string]: MarketIndexMetrics & { employeeCount: number } } = {};
    let totalEmployeesAllIndustries = 0;

    // Calculate metrics for each industry
    for (const industry of industries) {
      const metrics = await this.getMarketIndexByIndustry(industry);
      industriesData[industry] = { ...metrics, employeeCount: metrics.totalEmployees };
      totalEmployeesAllIndustries += metrics.totalEmployees;
    }

    // Calculate rankings and market share
    const rankedIndustries = Object.entries(industriesData)
      .sort((a, b) => b[1].employeeCount - a[1].employeeCount)
      .map(([name, data], idx) => ({
        name,
        ...data,
        marketShare: (data.employeeCount / totalEmployeesAllIndustries) * 100,
        ranking: idx + 1,
      }));

    // Find specific industries for summary
    const sortedByGrowth = [...rankedIndustries].sort(
      (a, b) => (b.hiringTrend.growthPercentage) - (a.hiringTrend.growthPercentage)
    );

    const sortedByFragmentation = [...rankedIndustries].sort(
      (a, b) => (b.concentrationRatio.top5EmployeeShare) - (a.concentrationRatio.top5EmployeeShare)
    );

    const convertedIndustries = rankedIndustries.reduce(
      (acc, ind) => {
        acc[ind.name] = {
          marketIndex: {
            industry: ind.name,
            totalCompanies: ind.totalCompanies,
            totalEmployees: ind.totalEmployees,
            estimatedMarketSize: ind.estimatedMarketSize,
            concentrationRatio: ind.concentrationRatio,
            hiringTrend: ind.hiringTrend,
            industryHealth: ind.industryHealth,
          },
          marketShare: parseFloat(ind.marketShare.toFixed(2)),
          ranking: ind.ranking,
        };
        return acc;
      },
      {} as any
    );

    return {
      industries: convertedIndustries,
      marketSummary: {
        totalCompanies: this.service.getStatistics().totalCompanies,
        totalEstimatedEmployees: totalEmployeesAllIndustries,
        averageSentiment: parseFloat(
          (
            rankedIndustries.reduce((sum, ind) => sum + ind.industryHealth.sentimentScore, 0) /
            rankedIndustries.length
          ).toFixed(2)
        ),
        topGrowingIndustry: sortedByGrowth[0].name,
        mostFragmentedIndustry: sortedByFragmentation[sortedByFragmentation.length - 1].name,
        largestIndustry: rankedIndustries[0].name,
      },
    };
  }

  /**
   * Estimate market size based on employee count and industry
   * Using multipliers based on typical industry economics
   */
  private estimateMarketSize(totalEmployees: number, industry: string): string {
    // Industry-specific revenue per employee multipliers (in USD)
    const revenuePerEmployeeMultiplier: { [key: string]: number } = {
      'Technology': 300000, // Tech companies typically generate high revenue per employee
      'Finance': 250000,
      'Manufacturing': 150000,
      'Retail': 100000,
      'Healthcare': 200000,
      'Education': 80000,
      'Construction': 120000,
      'Logistics': 110000,
      'Other': 100000,
    };

    const multiplier = revenuePerEmployeeMultiplier[industry] || 100000;
    const estimatedRevenue = totalEmployees * multiplier;

    // Format as readable string
    if (estimatedRevenue >= 1e12) {
      return `$${(estimatedRevenue / 1e12).toFixed(1)}T`;
    } else if (estimatedRevenue >= 1e9) {
      return `$${(estimatedRevenue / 1e9).toFixed(1)}B`;
    } else if (estimatedRevenue >= 1e6) {
      return `$${(estimatedRevenue / 1e6).toFixed(0)}M`;
    } else {
      return `$${(estimatedRevenue / 1e6).toFixed(2)}M`;
    }
  }

  /**
   * Get companies in an industry ranked by growth potential
   */
  getGrowthLeadersInIndustry(
    industry: string,
    limit: number = 10
  ): (CompanyProfile & { rank: number })[] {
    const companies = this.service.getCompaniesByIndustry(industry);
    return companies
      .sort((a, b) => (b.growth || 0) - (a.growth || 0))
      .slice(0, limit)
      .map((c, idx) => ({ ...c, rank: idx + 1 }));
  }

  /**
   * Get industry trend summary
   */
  getIndustryTrendSummary(): {
    mostDynamic: { industry: string; score: number };
    mostMature: { industry: string; score: number };
    healthySentiment: { industry: string; score: number };
  } {
    const industries = this.service.getIndustries();
    const stats = this.service.getStatistics();

    const industryScores = industries.map((ind) => {
      const companies = this.service.getCompaniesByIndustry(ind);
      const sentiments = companies.reduce((acc, c) => {
        acc[c.sentiment || 'Neutral'] = (acc[c.sentiment || 'Neutral'] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const sentimentScore =
        ((sentiments['Positive'] || 0) * 100 + (sentiments['Neutral'] || 0) * 50) / companies.length;

      const avgGrowth = companies.reduce((sum, c) => sum + (c.growth || 0), 0) / companies.length;

      const dynamicScore = avgGrowth * 0.4 + sentimentScore * 0.6;

      return {
        industry: ind,
        dynamicScore,
        maturityScore: 100 - dynamicScore,
        sentimentScore,
      };
    });

    return {
      mostDynamic: industryScores.reduce((prev, current) =>
        current.dynamicScore > prev.dynamicScore ? current : prev
      ),
      mostMature: industryScores.reduce((prev, current) =>
        current.maturityScore > prev.maturityScore ? current : prev
      ),
      healthySentiment: industryScores.reduce((prev, current) =>
        current.sentimentScore > prev.sentimentScore ? current : prev
      ),
    };
  }
}

export default MarketIndustryAnalytics;
