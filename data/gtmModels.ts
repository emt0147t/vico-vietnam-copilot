/**
 * GTM Strategy Models
 * Go-To-Market strategy builder for companies
 */

// ============ GTM STRATEGY TYPES ============
export enum MarketSegment {
  ENTERPRISE = "enterprise",
  MID_MARKET = "mid_market",
  SMB = "smb",
  STARTUP = "startup",
}

export enum CompetitivePosition {
  MARKET_LEADER = "market_leader",
  STRONG_PLAYER = "strong_player",
  EMERGING = "emerging",
  NEW_ENTRANT = "new_entrant",
}

export enum EntryStrategy {
  DIRECT_SALES = "direct_sales",
  CHANNEL_PARTNER = "channel_partner",
  ONLINE_MARKETPLACE = "online_marketplace",
  LICENSING = "licensing",
  JOINT_VENTURE = "joint_venture",
  ACQUISITION = "acquisition",
}

// ============ GTM STRATEGY CORE ============
export interface GTMStrategy {
  id: string;
  companyId: string;
  companyName: string;
  targetMarket: string; // Vietnam, Southeast Asia, etc.
  createdAt: Date;
  updatedAt: Date;
  version: number;

  // Market Analysis
  marketSize: {
    value: number; // USD millions
    growth: number; // % annual growth
    forecast: number; // Value 3 years from now
  };

  competitivePosition: CompetitivePosition;
  marketSegments: MarketSegment[];
  targetCustomerProfile: ICP;

  // Go-To-Market Strategy
  primaryStrategy: EntryStrategy;
  secondaryStrategies: EntryStrategy[];
  
  // Tactical Plan
  go_to_market: GTMPlan;
  
  // Financial Projections
  projections: FinancialProjection[];
  
  // Risk Assessment
  risks: StrategyRisk[];
  
  // Timeline
  timeline: StrategyMilestone[];
  
  // Collaboration
  createdBy: string;
  sharedWith: string[];
  status: "draft" | "review" | "approved" | "executing";
}

// ============ ICP (IDEAL CUSTOMER PROFILE) ============
export interface ICP {
  industry: string[];
  companySize: {
    employees: [number, number]; // min-max
    revenue: [number, number]; // USD millions
  };
  painPoints: string[];
  buyingCriteria: string[];
  decisionMakers: string[]; // C-suite titles
  purchaseBudget: number; // USD
  salesCycle: number; // Days
}

// ============ GTM PLAN ============
export interface GTMPlan {
  marketingStrategy: MarketingPlan;
  salesStrategy: SalesPlan;
  partnerStrategy: PartnerPlan;
  productStrategy: ProductStrategy;
}

export interface MarketingPlan {
  channels: string[]; // Digital, events, PR, etc.
  budget: number;
  campaigns: Campaign[];
  messaging: {
    headline: string;
    keyBenefits: string[];
    differentiation: string;
  };
}

export interface Campaign {
  name: string;
  channel: string;
  budget: number;
  targetAudience: string;
  expectedROI: number;
  duration: number; // Days
}

export interface SalesPlan {
  salesModel: string; // Direct, channel, hybrid
  teamSize: number;
  targetAccounts: string[];
  averageContractValue: number;
  salesCycleLength: number;
  quota: number; // Annual revenue target
}

export interface PartnerPlan {
  partnerTypes: string[]; // Distributors, resellers, integrators
  targetPartners: string[];
  incentiveStructure: string;
  supportRequired: string;
}

export interface ProductStrategy {
  positioning: string;
  features: string[];
  pricing: {
    model: string; // Freemium, subscription, one-time
    basePrice: number;
    variants: PricingVariant[];
  };
  localizationNeeds: string[];
}

export interface PricingVariant {
  name: string;
  price: number;
  features: string[];
  targetSegment: string;
}

// ============ FINANCIAL PROJECTIONS ============
export interface FinancialProjection {
  year: number;
  revenue: number; // USD
  marketShare: number; // %
  customers: number;
  costs: {
    sales: number;
    marketing: number;
    operations: number;
  };
  profitMargin: number; // %
}

// ============ RISK ASSESSMENT ============
export interface StrategyRisk {
  name: string;
  severity: "high" | "medium" | "low";
  probability: number; // 0-1
  impact: string;
  mitigation: string;
}

// ============ TIMELINE/MILESTONES ============
export interface StrategyMilestone {
  phase: number; // 1, 2, 3
  name: string;
  startMonth: number;
  endMonth: number;
  objectives: string[];
  kpis: KPI[];
  budget: number;
}

export interface KPI {
  metric: string;
  target: number;
  unit: string; // %,$ customers, etc.
  frequency: "monthly" | "quarterly" | "annual";
}

// ============ RECOMMENDATION ============
export interface GTMRecommendation {
  companyName: string;
  targetMarket: string;
  recommendedStrategy: EntryStrategy;
  rationale: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  nextSteps: string[];
  estimatedROI: number; // %
  timeToMarket: number; // Months
  requiredInvestment: number; // USD
}
