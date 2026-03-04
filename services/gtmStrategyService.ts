/**
 * GTM Strategy Service
 * Generates Go-To-Market strategies using market intelligence
 */

import {
  GTMStrategy,
  GTMRecommendation,
  CompetitivePosition,
  EntryStrategy,
  MarketSegment,
  ICP,
  GTMPlan,
  FinancialProjection,
  StrategyRisk,
} from "../data/gtmModels";
import { SignalType } from "../data/newsModels";

// Model fallback is handled by geminiHelper

interface CompanyContext {
  name: string;
  industry: string;
  marketPosition: CompetitivePosition;
  signals: SignalType[];
  newsCount: number;
  competitors: string[];
  targetMarkets: string[];
}

export const GTMStrategyService = {
  /**
   * Generate GTM recommendations based on company context
   */
  generateGTMRecommendation: async (
    context: CompanyContext
  ): Promise<GTMRecommendation> => {
    const prompt = `You are a strategic business consultant. Based on this company context, generate a Go-To-Market strategy.

Company: ${context.name}
Industry: ${context.industry}
Market Position: ${context.marketPosition}
Recent Market Signals: ${context.signals.join(", ")}
Related News Articles: ${context.newsCount}
Competitors: ${context.competitors.join(", ")}
Target Markets: ${context.targetMarkets.join(", ")}

Provide:
1. Recommended GTM Strategy (direct_sales, channel_partner, online_marketplace, licensing, joint_venture, or acquisition)
2. Rationale (2-3 sentences)
3. Top 3 Strengths (bullet points)
4. Top 3 Weaknesses (bullet points)
5. Top 3 Opportunities (bullet points)
6. Top 3 Threats (bullet points)
7. Next 3 Steps (numbered)
8. Estimated ROI (percentage)
9. Time to Market (months)
10. Required Investment (USD millions)

Format as structured JSON.`;

    try {
      const { generateWithFallback } = await import('./geminiHelper');
      const result = await generateWithFallback({
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      });

      const text = result.text || '';
      const parsed = JSON.parse(text);

      return {
        companyName: context.name,
        targetMarket: context.targetMarkets[0] || "Vietnam",
        recommendedStrategy: parsed.strategy || EntryStrategy.DIRECT_SALES,
        rationale: parsed.rationale || "",
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        opportunities: parsed.opportunities || [],
        threats: parsed.threats || [],
        nextSteps: parsed.nextSteps || [],
        estimatedROI: parsed.roi || 150,
        timeToMarket: parsed.timeToMarket || 6,
        requiredInvestment: parsed.investment || 5,
      };
    } catch (error) {
      console.error("GTM recommendation error:", error);
      // Return default recommendation
      return {
        companyName: context.name,
        targetMarket: context.targetMarkets[0] || "Vietnam",
        recommendedStrategy: EntryStrategy.DIRECT_SALES,
        rationale: "Direct sales model recommended for B2B market entry",
        strengths: ["Strong product-market fit", "Experienced team"],
        weaknesses: ["Limited brand awareness", "Competitive market"],
        opportunities: ["Market growth", "Strategic partnerships"],
        threats: ["Established competitors", "Regulatory changes"],
        nextSteps: [
          "Analyze target customer profiles",
          "Develop sales playbook",
          "Build partner ecosystem",
        ],
        estimatedROI: 150,
        timeToMarket: 6,
        requiredInvestment: 5,
      };
    }
  },

  /**
   * Build detailed GTM strategy with financial projections
   */
  buildFullGTMStrategy: async (
    recommendation: GTMRecommendation,
    budget: number
  ): Promise<GTMStrategy> => {
    const strategy: GTMStrategy = {
      id: `gtm_${Date.now()}`,
      companyId: "",
      companyName: recommendation.companyName,
      targetMarket: recommendation.targetMarket,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,

      marketSize: {
        value: 5000, // $5B market estimate
        growth: 15, // 15% annual growth
        forecast: 8000, // Projected $8B in 3 years
      },

      competitivePosition: CompetitivePosition.EMERGING,
      marketSegments: [MarketSegment.MID_MARKET, MarketSegment.SMB],
      targetCustomerProfile: generateICP(),

      primaryStrategy: recommendation.recommendedStrategy,
      secondaryStrategies: [
        EntryStrategy.CHANNEL_PARTNER,
        EntryStrategy.ONLINE_MARKETPLACE,
      ],

      go_to_market: generateGTMPlan(budget),
      projections: generateFinancialProjections(),
      risks: generateRisks(recommendation),
      timeline: generateTimeline(),

      createdBy: "system",
      sharedWith: [],
      status: "draft",
    };

    return strategy;
  },

  /**
   * Calculate market entry feasibility
   */
  calculateFeasibility: (
    strategy: GTMRecommendation
  ): {
    score: number; // 0-100
    verdict: string;
    recommendation: string;
  } => {
    const factors = {
      roi: (strategy.estimatedROI / 200) * 30, // Max 30 points
      timeToMarket: Math.max(0, 30 - strategy.timeToMarket * 2), // Max 30 points (prefer shorter)
      investment: Math.max(0, 40 - strategy.requiredInvestment * 5), // Max 40 points (prefer lower)
    };

    const score = Math.round(
      Math.min(100, factors.roi + factors.timeToMarket + factors.investment)
    );

    let verdict = "";
    let recommendation = "";

    if (score >= 80) {
      verdict = "Highly Feasible";
      recommendation = "Proceed with strategy immediately";
    } else if (score >= 60) {
      verdict = "Moderately Feasible";
      recommendation = "Address key risks before execution";
    } else if (score >= 40) {
      verdict = "Challenging";
      recommendation = "Consider alternative strategies";
    } else {
      verdict = "High Risk";
      recommendation = "Not recommended at this time";
    }

    return { score, verdict, recommendation };
  },
};

// ============ HELPER FUNCTIONS ============

function generateICP(): ICP {
  return {
    industry: ["Technology", "Finance", "Healthcare"],
    companySize: {
      employees: [100, 10000],
      revenue: [10, 500],
    },
    painPoints: [
      "Digital transformation",
      "Cost reduction",
      "Customer experience",
    ],
    buyingCriteria: [
      "ROI within 12 months",
      "Scalability",
      "Integration capabilities",
    ],
    decisionMakers: ["CTO", "VP Engineering", "CFO"],
    purchaseBudget: 500000,
    salesCycle: 90,
  };
}

function generateGTMPlan(budget: number): GTMPlan {
  return {
    marketingStrategy: {
      channels: [
        "Digital Marketing",
        "Industry Events",
        "Content Marketing",
        "PR",
      ],
      budget: (budget * 0.25) / 1000000, // 25% of budget
      campaigns: [
        {
          name: "Market Awareness",
          channel: "Digital",
          budget: (budget * 0.1) / 1000000,
          targetAudience: "Enterprise CTO/CIO",
          expectedROI: 300,
          duration: 90,
        },
        {
          name: "Lead Generation",
          channel: "Content",
          budget: (budget * 0.15) / 1000000,
          targetAudience: "Mid-market IT leaders",
          expectedROI: 250,
          duration: 180,
        },
      ],
      messaging: {
        headline: "Transform Your Business",
        keyBenefits: [
          "60% faster deployment",
          "40% cost reduction",
          "10x scalability",
        ],
        differentiation: "AI-powered market intelligence platform",
      },
    },

    salesStrategy: {
      salesModel: "Hybrid (Direct + Channel)",
      teamSize: 15,
      targetAccounts: ["Vingroup", "Techcombank", "FPT Software"],
      averageContractValue: 250000,
      salesCycleLength: 90,
      quota: 5000000,
    },

    partnerStrategy: {
      partnerTypes: ["System Integrators", "Resellers", "Technology Partners"],
      targetPartners: ["Accenture", "Deloitte", "KPMG"],
      incentiveStructure: "20-25% margin, tiered discounts",
      supportRequired: "Training, marketing support, technical enablement",
    },

    productStrategy: {
      positioning: "Enterprise-grade AI market intelligence",
      features: [
        "Market signals detection",
        "Competitor monitoring",
        "GTM strategy builder",
      ],
      pricing: {
        model: "SaaS subscription",
        basePrice: 50000,
        variants: [
          {
            name: "Starter",
            price: 50000,
            features: ["Basic signals", "10 companies"],
            targetSegment: "SMB",
          },
          {
            name: "Professional",
            price: 150000,
            features: ["Advanced signals", "100 companies", "API access"],
            targetSegment: "Mid-market",
          },
          {
            name: "Enterprise",
            price: 500000,
            features: [
              "All features",
              "Unlimited companies",
              "Custom integration",
            ],
            targetSegment: "Enterprise",
          },
        ],
      },
      localizationNeeds: ["Vietnamese language", "Local payment methods"],
    },
  };
}

function generateFinancialProjections(): FinancialProjection[] {
  return [
    {
      year: 1,
      revenue: 2000000,
      marketShare: 0.5,
      customers: 10,
      costs: { sales: 500000, marketing: 400000, operations: 300000 },
      profitMargin: -12,
    },
    {
      year: 2,
      revenue: 7500000,
      marketShare: 1.2,
      customers: 35,
      costs: { sales: 1200000, marketing: 800000, operations: 600000 },
      profitMargin: 15,
    },
    {
      year: 3,
      revenue: 18000000,
      marketShare: 2.5,
      customers: 72,
      costs: { sales: 2500000, marketing: 1200000, operations: 1000000 },
      profitMargin: 32,
    },
  ];
}

function generateRisks(recommendation: GTMRecommendation): StrategyRisk[] {
  return [
    {
      name: "Competitive Response",
      severity: "high",
      probability: 0.8,
      impact: "Reduced market share and pricing pressure",
      mitigation: "Build strong brand and customer relationships",
    },
    {
      name: "Market Adoption",
      severity: "high",
      probability: 0.6,
      impact: "Slower than expected customer acquisition",
      mitigation: "Invest in product education and customer success",
    },
    {
      name: "Talent Acquisition",
      severity: "medium",
      probability: 0.5,
      impact: "Inability to hire skilled team members",
      mitigation: "Competitive compensation, remote work options",
    },
    {
      name: "Regulatory Changes",
      severity: "medium",
      probability: 0.3,
      impact: "Compliance costs, market access limitations",
      mitigation: "Monitor regulations, maintain compliance team",
    },
  ];
}

function generateTimeline(): any[] {
  return [
    {
      phase: 1,
      name: "Foundation & Planning",
      startMonth: 0,
      endMonth: 2,
      objectives: [
        "Finalize GTM strategy",
        "Build sales team",
        "Develop marketing plan",
      ],
      kpis: [
        { metric: "Team onboarding", target: 100, unit: "%" },
        { metric: "Sales collateral", target: 100, unit: "%" },
      ],
      budget: 500000,
    },
    {
      phase: 2,
      name: "Market Launch",
      startMonth: 3,
      endMonth: 6,
      objectives: ["Generate awareness", "Land first 5 customers", "Build partnerships"],
      kpis: [
        { metric: "Marketing reach", target: 100000, unit: "impressions" },
        { metric: "Sales pipeline", target: 2500000, unit: "$" },
      ],
      budget: 800000,
    },
    {
      phase: 3,
      name: "Scale & Optimize",
      startMonth: 7,
      endMonth: 12,
      objectives: [
        "Expand to 20+ customers",
        "Launch channel program",
        "Optimize CAC",
      ],
      kpis: [
        { metric: "Revenue", target: 1500000, unit: "$" },
        { metric: "Customer NPS", target: 50, unit: "score" },
      ],
      budget: 1200000,
    },
  ];
}
