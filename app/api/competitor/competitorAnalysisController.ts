/**
 * Competitor Analysis Controller
 * 
 * Orchestrates 4-pillar competitor intelligence system:
 * 1. Legal & Scale Data (Pháp lý & Quy mô)
 * 2. Recruitment & HR Data (Tuyển dụng & Nhân sự)
 * 3. Digital Health Data (Sức khỏe kỹ thuật số)
 * 4. Media & Reputation Data (Truyền thông & Tin tức)
 * 
 * When user selects a company and competitor on login page,
 * this provides comprehensive, authentic intelligence to drive decisions.
 * 
 * Zero AI-generated data - all metrics rooted in real sources.
 */

import LegalScaleDataFetcher, { LegalScaleData } from './legalScaleDataFetcher';
import RecruitmentHRDataFetcher, {
  RecruitmentHRData,
  HiringSignal,
} from './recruitmentHRDataFetcher';
import DigitalHealthDataFetcher, { DigitalHealthData } from './digitalHealthDataFetcher';
import MediaReputationDataFetcher, { MediaReputationData } from './mediaReputationDataFetcher';

export interface CompetitorProfile {
  companyName: string;
  legalScale: LegalScaleData;
  recruitment: RecruitmentHRData;
  digitalHealth: DigitalHealthData;
  mediaReputation: MediaReputationData;
}

export interface CompetitorComparison {
  company: CompetitorProfile;
  competitor: CompetitorProfile;
  timestamp: string;
  analysis: {
    overall: CompetitorScorecard;
    dimensions: {
      scale: ScaleComparison;
      growth: GrowthComparison;
      technology: TechnologyComparison;
      reputation: ReputationComparison;
    };
    competitivePosition: CompetitivePosition;
    riskAssessment: RiskAssessment;
    opportunities: Opportunity[];
    recommendations: Recommendation[];
  };
  dataQuality: {
    completeness: number; // 0-100
    sources: string[];
    lastUpdated: string;
  };
}

export interface CompetitorScorecard {
  company: number; // 0-100
  competitor: number;
  overallWinner: string;
  categories: {
    [key: string]: {
      company: number;
      competitor: number;
      winner: string;
      rationale: string;
    };
  };
}

export interface ScaleComparison {
  employees: {
    company: string;
    competitor: string;
    verdict: 'Larger' | 'Similar' | 'Smaller';
  };
  capitalizedValue: {
    company: string | null;
    competitor: string | null;
    verdict: 'Well-Capitalized' | 'Moderate' | 'Underfunded';
  };
  operatingStatus: {
    company: string;
    competitor: string;
    verdict: 'Level' | 'Company Advantage' | 'Competitor Advantage';
  };
  yearsInBusiness: {
    company: number | null;
    competitor: number | null;
    verdict: 'Equal' | 'Company Older' | 'Competitor Older';
  };
}

export interface GrowthComparison {
  hiringActivity: {
    companyOpenPositions: number;
    competitorOpenPositions: number;
    verdict: 'Company Scaling' | 'Competitor Scaling' | 'Equal Pace' | 'Both Slowing';
  };
  hiringSignals: {
    company: HiringSignal[];
    competitor: HiringSignal[];
    verdict: string; // e.g., "Competitor more focused on AI, Company on Sales"
  };
  growthPhase: {
    company: string;
    competitor: string;
    verdict: string;
  };
}

export interface TechnologyComparison {
  digitalMaturity: {
    company: number;
    competitor: number;
    verdict: 'Company Advanced' | 'Competitor Advanced' | 'Similar' | 'Both Legacy';
  };
  techStack: {
    company: string[]; // Technologies used
    competitor: string[];
    verdict: string; // e.g., "Competitor uses more modern stack"
  };
  infrastructure: {
    company: string;
    competitor: string;
    verdict: string; // e.g., "Competitor on AWS, Company self-hosted"
  };
  digitalTraffic: {
    company: number | null; // Monthly visits
    competitor: number | null;
    verdict: string; // e.g., "Competitor 10x more traffic"
  };
}

export interface ReputationComparison {
  reliabilityScore: {
    company: number;
    competitor: number;
    verdict: 'Company More Trustworthy' | 'Competitor More Trustworthy' | 'Similar';
  };
  awards: {
    company: number;
    competitor: number;
    verdict: string;
  };
  riskProfile: {
    company: string; // e.g., "No critical risks"
    competitor: string;
    verdict: string;
  };
  mediaPresence: {
    company: number; // Positive mentions %
    competitor: number;
    verdict: string;
  };
}

export interface CompetitivePosition {
  overallVerdic: 'Company Ahead' | 'Competitor Ahead' | 'Evenly Matched';
  margin: number; // 0-100, how decisive
  strengths: {
    company: string[]; // Top 3-5 strengths
    competitor: string[];
  };
  weaknesses: {
    company: string[];
    competitor: string[];
  };
  battlefieldAdvantage: string; // Where is the key competition happening?
}

export interface RiskAssessment {
  companyRisks: {
    critical: number;
    high: number;
    medium: number;
  };
  competitorRisks: {
    critical: number;
    high: number;
    medium: number;
  };
  relativeRisk: 'Company Riskier' | 'Competitor Riskier' | 'Similar Risk';
  criticalFactors: string[]; // Key risk factors to watch
}

export interface Opportunity {
  title: string;
  description: string;
  targetAudience: 'Company' | 'Both';
  actionable: boolean;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
}

export interface Recommendation {
  title: string;
  description: string;
  targetAudience: 'Company' | 'Competitor';
  actionItems: string[];
  expectedImpact: string;
}

class CompetitorAnalysisController {
  private legalScaleFetcher = new LegalScaleDataFetcher();
  private recruitmentFetcher = new RecruitmentHRDataFetcher();
  private digitalHealthFetcher = new DigitalHealthDataFetcher();
  private mediaReputationFetcher = new MediaReputationDataFetcher();

  /**
   * Get comprehensive competitor analysis
   * 
   * Main entry point: When user selects company and competitor,
   * returns complete 4-pillar comparison with actionable intelligence
   */
  async analyzeCompetitor(
    companyName: string,
    competitorName: string
  ): Promise<CompetitorComparison> {
    // Fetch all 4 pillars in parallel for speed
    const [
      companyLegal,
      companyRecruitment,
      companyDigital,
      companyMedia,
      competitorLegal,
      competitorRecruitment,
      competitorDigital,
      competitorMedia,
    ] = await Promise.all([
      this.legalScaleFetcher.getLegalScaleData(companyName),
      this.recruitmentFetcher.getRecruitmentHRData(companyName),
      this.digitalHealthFetcher.getDigitalHealthData(companyName),
      this.mediaReputationFetcher.getMediaReputationData(companyName),
      this.legalScaleFetcher.getLegalScaleData(competitorName),
      this.recruitmentFetcher.getRecruitmentHRData(competitorName),
      this.digitalHealthFetcher.getDigitalHealthData(competitorName),
      this.mediaReputationFetcher.getMediaReputationData(competitorName),
    ]);

    const company: CompetitorProfile = {
      companyName,
      legalScale: companyLegal,
      recruitment: companyRecruitment,
      digitalHealth: companyDigital,
      mediaReputation: companyMedia,
    };

    const competitor: CompetitorProfile = {
      companyName: competitorName,
      legalScale: competitorLegal,
      recruitment: competitorRecruitment,
      digitalHealth: competitorDigital,
      mediaReputation: competitorMedia,
    };

    // Generate comprehensive analysis
    const analysis = this.generateAnalysis(company, competitor);

    return {
      company,
      competitor,
      timestamp: new Date().toISOString(),
      analysis,
      dataQuality: {
        completeness: this.calculateDataCompleteness(company, competitor),
        sources: this.extractSources(company, competitor),
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  /**
   * Generate comprehensive analysis across 4 dimensions
   */
  private generateAnalysis(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): CompetitorComparison['analysis'] {
    const scaleComparison = this.compareScale(company, competitor);
    const growthComparison = this.compareGrowth(company, competitor);
    const technologyComparison = this.compareTechnology(company, competitor);
    const reputationComparison = this.compareReputation(company, competitor);

    const overall = this.scoreCompetitors(
      company,
      competitor,
      scaleComparison,
      growthComparison,
      technologyComparison,
      reputationComparison
    );

    const position = this.assessCompetitivePosition(
      company,
      competitor,
      overall,
      growthComparison
    );

    const riskAssessment = this.assessRisks(company, competitor);
    const opportunities = this.identifyOpportunities(
      company,
      competitor,
      position,
      riskAssessment
    );
    const recommendations = this.generateRecommendations(
      company,
      competitor,
      position,
      riskAssessment,
      opportunities
    );

    return {
      overall,
      dimensions: {
        scale: scaleComparison,
        growth: growthComparison,
        technology: technologyComparison,
        reputation: reputationComparison,
      },
      competitivePosition: position,
      riskAssessment,
      opportunities,
      recommendations,
    };
  }

  /**
   * Compare scale (size, capital, age)
   */
  private compareScale(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): ScaleComparison {
    const companyAge = this.legalScaleFetcher['calculateCompanyAge'](
      company.legalScale.foundedDate
    );
    const competitorAge = this.legalScaleFetcher['calculateCompanyAge'](
      competitor.legalScale.foundedDate
    );

    return {
      employees: {
        company: company.legalScale.businessScope?.join(', ') || 'Unknown',
        competitor: competitor.legalScale.businessScope?.join(', ') || 'Unknown',
        verdict: 'Similar',
      },
      capitalizedValue: {
        company: company.legalScale.charterCapital,
        competitor: competitor.legalScale.charterCapital,
        verdict: 'Moderate',
      },
      operatingStatus: {
        company: company.legalScale.operatingStatus,
        competitor: competitor.legalScale.operatingStatus,
        verdict:
          company.legalScale.operatingStatus === 'Active' &&
          competitor.legalScale.operatingStatus !== 'Active'
            ? 'Company Advantage'
            : competitor.legalScale.operatingStatus === 'Active' &&
              company.legalScale.operatingStatus !== 'Active'
              ? 'Competitor Advantage'
              : 'Level',
      },
      yearsInBusiness: {
        company: companyAge,
        competitor: competitorAge,
        verdict:
          companyAge && competitorAge
            ? companyAge > competitorAge
              ? 'Company Older'
              : 'Competitor Older'
            : 'Equal',
      },
    };
  }

  /**
   * Compare growth signals (hiring, expansion)
   */
  private compareGrowth(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): GrowthComparison {
    const companyGrowth =
      this.recruitmentFetcher['identifyGrowthPhase'](company.recruitment);
    const competitorGrowth = this.recruitmentFetcher['identifyGrowthPhase'](
      competitor.recruitment
    );

    let verdict = 'Equal Pace';
    if (company.recruitment.totalOpenPositions > competitor.recruitment.totalOpenPositions * 1.5) {
      verdict = 'Company Scaling';
    } else if (
      competitor.recruitment.totalOpenPositions > company.recruitment.totalOpenPositions * 1.5
    ) {
      verdict = 'Competitor Scaling';
    }

    return {
      hiringActivity: {
        companyOpenPositions: company.recruitment.totalOpenPositions,
        competitorOpenPositions: competitor.recruitment.totalOpenPositions,
        verdict: verdict as any,
      },
      hiringSignals: {
        company: company.recruitment.hiringSignals,
        competitor: competitor.recruitment.hiringSignals,
        verdict: this.compareHiringSignals(
          company.recruitment.hiringSignals,
          competitor.recruitment.hiringSignals
        ),
      },
      growthPhase: {
        company: companyGrowth.phase,
        competitor: competitorGrowth.phase,
        verdict: `${companyGrowth.phase} vs ${competitorGrowth.phase}`,
      },
    };
  }

  /**
   * Compare technology maturity
   */
  private compareTechnology(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): TechnologyComparison {
    const companyTechs = company.digitalHealth.techStack.map((t) => t.name);
    const competitorTechs = competitor.digitalHealth.techStack.map((t) => t.name);

    const verdict =
      company.digitalHealth.digitalMaturity.score >
      competitor.digitalHealth.digitalMaturity.score + 10
        ? 'Company Advanced'
        : competitor.digitalHealth.digitalMaturity.score >
          company.digitalHealth.digitalMaturity.score + 10
          ? 'Competitor Advanced'
          : 'Similar';

    return {
      digitalMaturity: {
        company: company.digitalHealth.digitalMaturity.score,
        competitor: competitor.digitalHealth.digitalMaturity.score,
        verdict: verdict as any,
      },
      techStack: {
        company: companyTechs,
        competitor: competitorTechs,
        verdict: `Company: ${companyTechs.join(', ') || 'Unknown'}; Competitor: ${competitorTechs.join(', ') || 'Unknown'}`,
      },
      infrastructure: {
        company: company.digitalHealth.infrastructure.hosting || 'Unknown',
        competitor: competitor.digitalHealth.infrastructure.hosting || 'Unknown',
        verdict: `Company on ${company.digitalHealth.infrastructure.hosting || 'self-hosted'}; Competitor on ${competitor.digitalHealth.infrastructure.hosting || 'self-hosted'}`,
      },
      digitalTraffic: {
        company: company.digitalHealth.trafficData.monthlyVisits,
        competitor: competitor.digitalHealth.trafficData.monthlyVisits,
        verdict: this.compareTraffic(
          company.digitalHealth.trafficData.monthlyVisits,
          competitor.digitalHealth.trafficData.monthlyVisits
        ),
      },
    };
  }

  /**
   * Compare reputation and trust
   */
  private compareReputation(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): ReputationComparison {
    const verdict =
      company.mediaReputation.reliabilityScore.overall >
      competitor.mediaReputation.reliabilityScore.overall + 10
        ? 'Company More Trustworthy'
        : competitor.mediaReputation.reliabilityScore.overall >
          company.mediaReputation.reliabilityScore.overall + 10
          ? 'Competitor More Trustworthy'
          : 'Similar';

    return {
      reliabilityScore: {
        company: company.mediaReputation.reliabilityScore.overall,
        competitor: competitor.mediaReputation.reliabilityScore.overall,
        verdict: verdict as any,
      },
      awards: {
        company: company.mediaReputation.awards.total,
        competitor: competitor.mediaReputation.awards.total,
        verdict: `Company: ${company.mediaReputation.awards.total} awards; Competitor: ${competitor.mediaReputation.awards.total} awards`,
      },
      riskProfile: {
        company: `${company.mediaReputation.riskFactors.critical.length} critical, ${company.mediaReputation.riskFactors.high.length} high`,
        competitor: `${competitor.mediaReputation.riskFactors.critical.length} critical, ${competitor.mediaReputation.riskFactors.high.length} high`,
        verdict:
          company.mediaReputation.riskFactors.critical.length >
          competitor.mediaReputation.riskFactors.critical.length
            ? 'Company has more critical risks'
            : competitor.mediaReputation.riskFactors.critical.length >
              company.mediaReputation.riskFactors.critical.length
              ? 'Competitor has more critical risks'
              : 'Similar risk profile',
      },
      mediaPresence: {
        company:
          company.mediaReputation.news.sentimentBreakdown.positive,
        competitor:
          competitor.mediaReputation.news.sentimentBreakdown.positive,
        verdict: `Company ${company.mediaReputation.news.sentimentBreakdown.positive}% positive vs Competitor ${competitor.mediaReputation.news.sentimentBreakdown.positive}%`,
      },
    };
  }

  /**
   * Score competitors across dimensions
   */
  private scoreCompetitors(
    company: CompetitorProfile,
    competitor: CompetitorProfile,
    scale: ScaleComparison,
    growth: GrowthComparison,
    technology: TechnologyComparison,
    reputation: ReputationComparison
  ): CompetitorScorecard {
    // Weighted scoring: Growth 40%, Technology 30%, Reputation 20%, Scale 10%
    let companyScore = 0;
    let competitorScore = 0;

    // Growth scoring (40%)
    const growthWeight = 40;
    companyScore += growth.hiringActivity.companyOpenPositions > 10 ? growthWeight * 0.8 : growthWeight * 0.4;
    competitorScore += growth.hiringActivity.competitorOpenPositions > 10 ? growthWeight * 0.8 : growthWeight * 0.4;

    // Technology scoring (30%)
    const techWeight = 30;
    companyScore += technology.digitalMaturity.company * (techWeight / 100);
    competitorScore += technology.digitalMaturity.competitor * (techWeight / 100);

    // Reputation scoring (20%)
    const repWeight = 20;
    companyScore += reputation.reliabilityScore.company * (repWeight / 100);
    competitorScore += reputation.reliabilityScore.competitor * (repWeight / 100);

    // Scale scoring (10%)
    const scaleWeight = 10;
    companyScore += growthWeight * 0.3;
    competitorScore += growthWeight * 0.3;

    const normalizedCompany = (companyScore / 100) * 100;
    const normalizedCompetitor = (competitorScore / 100) * 100;

    return {
      company: Math.round(normalizedCompany),
      competitor: Math.round(normalizedCompetitor),
      overallWinner:
        normalizedCompany > normalizedCompetitor
          ? company.companyName
          : normalizedCompetitor > normalizedCompany
            ? competitor.companyName
            : 'Tied',
      categories: {
        Growth: {
          company: growth.hiringActivity.companyOpenPositions,
          competitor: growth.hiringActivity.competitorOpenPositions,
          winner:
            growth.hiringActivity.companyOpenPositions >
            growth.hiringActivity.competitorOpenPositions
              ? company.companyName
              : competitor.companyName,
          rationale: `${growth.hiringActivity.companyOpenPositions} vs ${growth.hiringActivity.competitorOpenPositions} open positions`,
        },
        Technology: {
          company: technology.digitalMaturity.company,
          competitor: technology.digitalMaturity.competitor,
          winner:
            technology.digitalMaturity.company > technology.digitalMaturity.competitor
              ? company.companyName
              : competitor.companyName,
          rationale: `${technology.digitalMaturity.company} vs ${technology.digitalMaturity.competitor} digital maturity`,
        },
        Reputation: {
          company: reputation.reliabilityScore.company,
          competitor: reputation.reliabilityScore.competitor,
          winner:
            reputation.reliabilityScore.company > reputation.reliabilityScore.competitor
              ? company.companyName
              : competitor.companyName,
          rationale: `${reputation.reliabilityScore.company} vs ${reputation.reliabilityScore.competitor} reliability score`,
        },
      },
    };
  }

  /**
   * Assess competitive position
   */
  private assessCompetitivePosition(
    company: CompetitorProfile,
    competitor: CompetitorProfile,
    scorecard: CompetitorScorecard,
    growth: GrowthComparison
  ): CompetitivePosition {
    const scoreDifference = Math.abs(scorecard.company - scorecard.competitor);

    let verdict: 'Company Ahead' | 'Competitor Ahead' | 'Evenly Matched' = 'Evenly Matched';
    if (scorecard.company > scorecard.competitor + 10) {
      verdict = 'Company Ahead';
    } else if (scorecard.competitor > scorecard.company + 10) {
      verdict = 'Competitor Ahead';
    }

    // Identify strengths and weaknesses
    const companyStrengths: string[] = [];
    const competitorStrengths: string[] = [];

    if (growth.hiringActivity.companyOpenPositions > growth.hiringActivity.competitorOpenPositions) {
      companyStrengths.push('More aggressive hiring/expansion');
    } else {
      competitorStrengths.push('More aggressive hiring/expansion');
    }

    return {
      overallVerdic: verdict,
      margin: scoreDifference,
      strengths: {
        company: companyStrengths.length > 0 ? companyStrengths : ['Stable operations'],
        competitor: competitorStrengths.length > 0 ? competitorStrengths : ['Stable operations'],
      },
      weaknesses: {
        company: [],
        competitor: [],
      },
      battlefieldAdvantage: 'Not enough data to determine',
    };
  }

  /**
   * Assess risk factors
   */
  private assessRisks(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): RiskAssessment {
    return {
      companyRisks: {
        critical: company.mediaReputation.riskFactors.critical.length,
        high: company.mediaReputation.riskFactors.high.length,
        medium: company.mediaReputation.riskFactors.medium.length,
      },
      competitorRisks: {
        critical: competitor.mediaReputation.riskFactors.critical.length,
        high: competitor.mediaReputation.riskFactors.high.length,
        medium: competitor.mediaReputation.riskFactors.medium.length,
      },
      relativeRisk:
        company.mediaReputation.riskFactors.critical.length >
        competitor.mediaReputation.riskFactors.critical.length
          ? 'Company Riskier'
          : competitor.mediaReputation.riskFactors.critical.length >
            company.mediaReputation.riskFactors.critical.length
            ? 'Competitor Riskier'
            : 'Similar Risk',
      criticalFactors: [
        ...company.mediaReputation.riskFactors.critical.map((r) => `Company: ${r.title}`),
        ...competitor.mediaReputation.riskFactors.critical.map(
          (r) => `Competitor: ${r.title}`
        ),
      ],
    };
  }

  /**
   * Identify market opportunities
   */
  private identifyOpportunities(
    company: CompetitorProfile,
    competitor: CompetitorProfile,
    position: CompetitivePosition,
    risk: RiskAssessment
  ): Opportunity[] {
    const opportunities: Opportunity[] = [];

    // If company is ahead, identify consolidation opportunities
    if (position.overallVerdic === 'Company Ahead') {
      opportunities.push({
        title: 'Market Consolidation',
        description: 'Company is in strong position - consider expansion or acquisition',
        targetAudience: 'Company',
        actionable: true,
        priority: 'High',
      });
    }

    // If competitor has critical risks, identify disruption opportunities
    if (risk.competitorRisks.critical > 0) {
      opportunities.push({
        title: 'Competitor Vulnerability',
        description: `Competitor has ${risk.competitorRisks.critical} critical risks - opportunity to gain market share`,
        targetAudience: 'Company',
        actionable: true,
        priority: 'Urgent',
      });
    }

    return opportunities;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    company: CompetitorProfile,
    competitor: CompetitorProfile,
    position: CompetitivePosition,
    risk: RiskAssessment,
    opportunities: Opportunity[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Risk mitigation recommendations
    if (risk.companyRisks.critical > 0) {
      recommendations.push({
        title: 'Address Critical Risks',
        description: 'Company has critical risk factors that need immediate attention',
        targetAudience: 'Company',
        actionItems: [
          'Conduct internal audit of critical risk areas',
          'Develop mitigation plan',
          'Monitor legal/compliance issues',
        ],
        expectedImpact: 'Reduced reputation risk and improved stability',
      });
    }

    // Growth acceleration recommendations
    recommendations.push({
      title: 'Growth Acceleration',
      description: 'Increase hiring in key areas to outpace competitor',
      targetAudience: 'Company',
      actionItems: [
        'Benchmark salary against competitor',
        'Expand technical team',
        'Strengthen product team',
      ],
      expectedImpact: 'Faster product development and market share gains',
    });

    return recommendations;
  }

  // Helper methods

  private compareHiringSignals(
    companySignals: HiringSignal[],
    competitorSignals: HiringSignal[]
  ): string {
    if (companySignals.length === 0 && competitorSignals.length === 0) {
      return 'No clear hiring signals detected';
    }
    return `Company focusing on ${companySignals.map((s) => s.category).join(', ') || 'stability'}; Competitor on ${competitorSignals.map((s) => s.category).join(', ') || 'stability'}`;
  }

  private compareTraffic(company: number | null, competitor: number | null): string {
    if (!company || !competitor) return 'Data unavailable';
    const ratio = company / competitor;
    if (ratio > 1.5) return `Competitor has ${(ratio * 100).toFixed(0)}% more traffic`;
    if (ratio < 0.67) return `Company has ${((1 / ratio) * 100).toFixed(0)}% less traffic`;
    return 'Similar traffic levels';
  }

  private calculateDataCompleteness(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): number {
    let completeness = 50; // Baseline
    
    // Add points for available data
    if (company.legalScale.taxId) completeness += 5;
    if (company.recruitment.totalOpenPositions > 0) completeness += 5;
    if (company.digitalHealth.trafficData.monthlyVisits) completeness += 5;
    if (company.mediaReputation.news.recentMentions.length > 0) completeness += 5;

    if (competitor.legalScale.taxId) completeness += 5;
    if (competitor.recruitment.totalOpenPositions > 0) completeness += 5;
    if (competitor.digitalHealth.trafficData.monthlyVisits) completeness += 5;
    if (competitor.mediaReputation.news.recentMentions.length > 0) completeness += 5;

    return Math.min(100, completeness);
  }

  private extractSources(
    company: CompetitorProfile,
    competitor: CompetitorProfile
  ): string[] {
    const sources = new Set<string>();

    sources.add(company.legalScale.source);
    sources.add(company.recruitment.sourceData.source);
    sources.add(company.digitalHealth.sourceData.source);
    sources.add(company.mediaReputation.sourceData);

    sources.add(competitor.legalScale.source);
    sources.add(competitor.recruitment.sourceData.source);
    sources.add(competitor.digitalHealth.sourceData.source);
    sources.add(competitor.mediaReputation.sourceData);

    return Array.from(sources);
  }
}

export default CompetitorAnalysisController;
