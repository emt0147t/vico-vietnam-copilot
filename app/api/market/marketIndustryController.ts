/**
 * Market & Industry API Controller
 * 
 * Endpoint: GET /api/market/industry/:industry
 * 
 * Combines all 4 data pillars:
 * 1. Macro-Economic Indicators (World Bank)
 * 2. Industry-Specific Data (Trade, Associations)
 * 3. Financial Pulse (Market data)
 * 4. VICO Exclusive Insights (Database analytics)
 */

import MarketIndustryAnalytics, { MarketIndexMetrics } from '@/services/marketIndustryAnalytics';
import MacroEconomicFetcher from '@/services/macroEconomicFetcher';
import IndustryDataFetcher from '@/services/industryDataFetcher';
import CompaniesDataService from '@/services/companiesDataService';

export interface ComprehensiveMarketReport {
  industry: string;
  timestamp: string;

  // Pillar 1: Macro-Economic Indicators
  macroEconomic: {
    gdpGrowth: number | null;
    inflation: number | null;
    fdiInflows: number | null;
    interestRate: number | null;
    economicTrend: string;
    businessClimate: string;
  };

  // Pillar 2: Industry-Specific Data
  industryData: {
    exportValue: number | null;
    importValue: number | null;
    tradeBalance: number | null;
    keyExports: string[];
    keyImports: string[];
    majorPartners: string[];
    recentTrends: string[];
    association: {
      name: string;
      website: string;
      email: string;
    } | null;
  };

  // Pillar 3: Financial Pulse
  financialPulse: {
    topCompaniesIndustry: Array<{
      name: string;
      employees: string;
      sentiment: string;
      growth: number;
    }>;
    industryMetrics: {
      avgGrowth: number;
      sentimentScore: number;
      dynamicScore: number;
    };
  };

  // Pillar 4: Exclusive VICO Insights
  vicoInsights: {
    marketIndex: MarketIndexMetrics;
    competitiveAnalysis: {
      totalCompanies: number;
      marketConcentration: string;
      top5PlayersShare: number;
      marketFragmentation: 'Highly Fragmented' | 'Moderate' | 'Concentrated';
    };
    growthLeaders: Array<{
      name: string;
      growth: number;
      sentiment: string;
      employees: string;
    }>;
    hiringSignals: {
      trend: 'Growing' | 'Stable' | 'Declining';
      averageCompanyAge: number;
      avgGrowthRate: number;
    };
  };

  // Executive Summary
  execSummary: {
    overallMarketHealth: 'Strong' | 'Moderate' | 'Weak';
    keyInsights: string[];
    opportunities: string[];
    risks: string[];
    recommendations: string[];
  };

  // Data Quality
  dataQuality: {
    completeness: number; // 0-100%
    sources: string[];
    lastUpdated: string;
  };
}

class MarketIndustryController {
  private marketAnalytics = new MarketIndustryAnalytics();
  private macroEconomic = new MacroEconomicFetcher();
  private industryData = new IndustryDataFetcher();
  private companiesService = CompaniesDataService.getInstance();

  /**
   * Get comprehensive market report for an industry
   */
  async getMarketReport(industry: string): Promise<ComprehensiveMarketReport> {
    try {
      // Fetch data from all sources in parallel
      const [marketIndex, economicData, industryInfo] = await Promise.all([
        this.marketAnalytics.getMarketIndexByIndustry(industry),
        this.macroEconomic.fetchMacroEconomicData(),
        this.industryData.getIndustryData(industry),
      ]);

      // Get top companies in industry
      const topCompanies = this.marketAnalytics
        .getGrowthLeadersInIndustry(industry, 10)
        .slice(0, 5);

      const companiesByIndustry = this.companiesService.getCompaniesByIndustry(industry);
      const industryStats = this.calculateIndustryMetrics(companiesByIndustry);

      // Generate executive summary
      const execSummary = this.generateExecutiveSummary(
        marketIndex,
        economicData,
        industryInfo,
        industryStats
      );

      const report: ComprehensiveMarketReport = {
        industry,
        timestamp: new Date().toISOString(),

        // Pillar 1: Macro-Economic
        macroEconomic: {
          gdpGrowth: economicData.gdpGrowth,
          inflation: economicData.inflation,
          fdiInflows: economicData.fdiInflows,
          interestRate: economicData.interestRate,
          economicTrend:
            economicData.gdpGrowth !== null
              ? economicData.gdpGrowth > 6
                ? 'Strong Growth'
                : economicData.gdpGrowth > 4
                  ? 'Moderate Growth'
                  : 'Weak Growth'
              : 'Unknown',
          businessClimate: this.assessBusinessClimate(economicData),
        },

        // Pillar 2: Industry-Specific
        industryData: {
          exportValue: industryInfo.exportValue,
          importValue: industryInfo.importValue,
          tradeBalance: industryInfo.tradeBalance,
          keyExports: industryInfo.keyExports,
          keyImports: industryInfo.keyImports,
          majorPartners: industryInfo.majorPartners,
          recentTrends: industryInfo.recentTrends,
          association: industryInfo.industryAssociation
            ? {
              name: industryInfo.industryAssociation.name,
              website: industryInfo.industryAssociation.website,
              email: industryInfo.industryAssociation.contactEmail,
            }
            : null,
        },

        // Pillar 3: Financial Pulse
        financialPulse: {
          topCompaniesIndustry: topCompanies.map((c) => ({
            name: c.name,
            employees: String(c.size || ''),
            sentiment: c.sentiment || 'Neutral',
            growth: c.growth || 0,
          })),
          industryMetrics: {
            avgGrowth: industryStats.avgGrowth,
            sentimentScore: industryStats.sentimentScore,
            dynamicScore: marketIndex.industryHealth.dynamicScore,
          },
        },

        // Pillar 4: VICO Insights
        vicoInsights: {
          marketIndex,
          competitiveAnalysis: {
            totalCompanies: companiesByIndustry.length,
            marketConcentration: marketIndex.concentrationRatio.marketConcentration,
            top5PlayersShare: marketIndex.concentrationRatio.top5EmployeeShare,
            marketFragmentation: this.getFragmentationLevel(
              marketIndex.concentrationRatio.top5EmployeeShare
            ),
          },
          growthLeaders: topCompanies.map((c) => ({
            name: c.name,
            growth: c.growth || 0,
            sentiment: c.sentiment || 'Neutral',
            employees: String(c.size || ''),
          })),
          hiringSignals: {
            trend: marketIndex.hiringTrend.trend,
            averageCompanyAge: marketIndex.hiringTrend.avgCompanyAge,
            avgGrowthRate: marketIndex.industryHealth.avgGrowthRate,
          },
        },

        // Executive Summary
        execSummary,

        // Data Quality
        dataQuality: {
          completeness: this.calculateCompletenessScore(
            economicData,
            industryInfo,
            marketIndex
          ),
          sources: [
            'VICO Company Database (3,802 companies)',
            'World Bank Open Data',
            'Tổng cục Hải quan (Customs)',
            'Industry Associations',
          ],
          lastUpdated: new Date().toISOString(),
        },
      };

      return report;
    } catch (error) {
      console.error(`Error generating market report for ${industry}:`, error);
      throw error;
    }
  }

  /**
   * Get comparative analysis across all industries
   */
  async getIndustryComparison() {
    return this.marketAnalytics.getIndustryComparison();
  }

  /**
   * Calculate industry-specific metrics from companies
   */
  private calculateIndustryMetrics(companies: any[]) {
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

    const avgGrowth =
      companies.reduce((sum, c) => sum + (c.growth || 0), 0) / companies.length;

    return {
      sentimentScore,
      avgGrowth,
      totalCompanies: companies.length,
    };
  }

  /**
   * Generate executive summary with insights and recommendations
   */
  private generateExecutiveSummary(
    marketIndex: any,
    economicData: any,
    industryInfo: any,
    industryStats: any
  ) {
    const insights: string[] = [];
    const opportunities: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    // Health assessment
    let overallHealth: 'Strong' | 'Moderate' | 'Weak' = 'Moderate';

    if (
      marketIndex.industryHealth.sentimentScore > 70 &&
      marketIndex.hiringTrend.trend === 'Growing'
    ) {
      overallHealth = 'Strong';
    } else if (
      marketIndex.industryHealth.sentimentScore < 40 ||
      marketIndex.hiringTrend.trend === 'Declining'
    ) {
      overallHealth = 'Weak';
    }

    // Generate insights
    insights.push(
      `${marketIndex.totalCompanies} companies in ${marketIndex.industry} database`
    );
    insights.push(
      `Estimated market size: ${marketIndex.estimatedMarketSize}`
    );
    insights.push(
      `Market concentration: ${marketIndex.concentrationRatio.marketConcentration} (Top 5 control ${marketIndex.concentrationRatio.top5EmployeeShare.toFixed(1)}%)`
    );
    insights.push(
      `Industry sentiment: ${marketIndex.industryHealth.sentimentScore.toFixed(1)}/100 (${industryStats.totalCompanies > 0 ? 'Positive signal' : 'Data limited'})`
    );

    // Generate opportunities
    if (marketIndex.hiringTrend.trend === 'Growing') {
      opportunities.push('✓ Growing industry with expanding employment');
      opportunities.push('✓ Strong talent demand - recruitment opportunities');
    }

    if (economicData.gdpGrowth && economicData.gdpGrowth > 6) {
      opportunities.push('✓ Strong macroeconomic tailwinds supporting growth');
    }

    if (marketIndex.concentrationRatio.marketConcentration === 'Highly Fragmented') {
      opportunities.push('✓ Fragmented market - consolidation opportunities');
    }

    if (industryInfo.exportValue && industryInfo.exportValue > industryInfo.importValue) {
      opportunities.push(
        `✓ Net exporting industry - international market potential`
      );
    }

    // Generate risks
    if (economicData.inflation && economicData.inflation > 5) {
      risks.push('⚠ High inflation - cost pressures expected');
    }

    if (economicData.interestRate && economicData.interestRate > 8) {
      risks.push('⚠ High interest rates - debt servicing challenges');
    }

    if (marketIndex.industryHealth.sentimentScore < 50) {
      risks.push('⚠ Negative company sentiment - market headwinds detected');
    }

    if (marketIndex.concentrationRatio.marketConcentration === 'Highly Concentrated') {
      risks.push('⚠ Concentrated market - limited new entrant opportunities');
    }

    // Generate recommendations
    if (overallHealth === 'Strong') {
      recommendations.push('→ Consider expansion and capital investment');
      recommendations.push('→ Acquire talent while market is growing');
    } else if (overallHealth === 'Weak') {
      recommendations.push('→ Focus on efficiency and cost optimization');
      recommendations.push('→ Consider market exit or consolidation');
    } else {
      recommendations.push('→ Monitor market developments closely');
      recommendations.push('→ Selective growth strategy recommended');
    }

    recommendations.push(
      `→ Contact ${industryInfo.industryAssociation?.name || 'industry association'} for latest reports`
    );

    return {
      overallMarketHealth: overallHealth,
      keyInsights: insights,
      opportunities,
      risks,
      recommendations,
    };
  }

  /**
   * Assess business climate based on economic indicators
   */
  private assessBusinessClimate(economicData: any): string {
    const scores: number[] = [];

    if (economicData.gdpGrowth !== null) {
      scores.push(economicData.gdpGrowth > 5 ? 3 : economicData.gdpGrowth > 3 ? 2 : 1);
    }

    if (economicData.inflation !== null) {
      const inf = economicData.inflation;
      scores.push(inf >= 2 && inf <= 4 ? 3 : inf >= 1 && inf <= 6 ? 2 : 1);
    }

    if (economicData.fdiInflows !== null) {
      scores.push(economicData.fdiInflows > 10000 ? 3 : economicData.fdiInflows > 5000 ? 2 : 1);
    }

    const avgScore = scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);

    if (avgScore >= 2.5) return 'Favorable';
    if (avgScore >= 1.8) return 'Moderate';
    return 'Challenging';
  }

  /**
   * Get fragmentation level description
   */
  private getFragmentationLevel(
    top5Share: number
  ): 'Highly Fragmented' | 'Moderate' | 'Concentrated' {
    if (top5Share < 25) return 'Highly Fragmented';
    if (top5Share < 50) return 'Moderate';
    return 'Concentrated';
  }

  /**
   * Calculate data completeness score
   */
  private calculateCompletenessScore(
    economicData: any,
    industryInfo: any,
    marketIndex: any
  ): number {
    let score = 60; // Base score

    // Check macro-economic data
    if (economicData.gdpGrowth !== null) score += 5;
    if (economicData.inflation !== null) score += 5;
    if (economicData.fdiInflows !== null) score += 5;
    if (economicData.interestRate !== null) score += 5;

    // Check industry data
    if (industryInfo.exportValue !== null) score += 5;
    if (industryInfo.importValue !== null) score += 5;
    if (industryInfo.industryAssociation !== null) score += 5;

    // Check VICO data
    if (marketIndex.totalCompanies > 10) score += 5;

    return Math.min(100, score);
  }
}

export default MarketIndustryController;
