/**
 * GTM Strategy Models — Global Copilot Edition
 * Living Playbook: Dynamic AI-generated Go-To-Market intelligence
 * 4 Feature Modules: Customer Segmentation | Competitive Tracker | Market Reports | Scenario Modeling
 */

// ============ ENUMS ============
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

export enum ScenarioType {
  MARKET_ENTRY = "market_entry",
  EXPANSION = "expansion",
  DIVERSIFICATION = "diversification",
  MERGER_ACQUISITION = "merger_acquisition",
  DIGITAL_TRANSFORMATION = "digital_transformation",
  PRICING_STRATEGY = "pricing_strategy",
}

// ============ LIVING PLAYBOOK (TOP-LEVEL) ============
export interface LivingPlaybook {
  id: string;
  companyName: string;
  industry: string;
  createdAt: string;
  lastUpdated: string;
  version: number;
  status: "draft" | "active" | "archived";

  // Company Context
  company: PlaybookCompany;

  // 4 Core Modules
  customerSegmentation: SmartSegmentation;
  competitiveTracker: CompetitiveTracker;
  marketReports: MarketReport[];
  scenarioModels: ScenarioModel[];

  // GTM Strategy (legacy compat)
  gtmRecommendation: GTMRecommendation;
  swotAnalysis: SWOTAnalysis;

  // Validation & Trust
  validationSources: ValidationSource[];
  expertCallLogs: ExpertCallLog[];

  // Strategic Value
  strategicMetrics: StrategicValueMetrics;

  // Timeline & Next Steps
  nextSteps: string[];
  timeline: PlaybookTimeline;
}

export interface PlaybookCompany {
  name: string;
  industry: string;
  size: string;
  founded: string | number;
  headquarters?: string;
  revenue?: string;
  employees?: string;
}

export interface PlaybookTimeline {
  phase1: string;
  phase2: string;
  phase3: string;
}

// ============ MODULE 1: SMART CUSTOMER SEGMENTATION ============
export interface SmartSegmentation {
  personas: CustomerPersona[];
  totalAddressableMarket: string;
  serviceableMarket: string;
  targetMarketShare: number;
  segmentBreakdown: SegmentBreakdown[];
  icpSummary: string;
}

export interface CustomerPersona {
  id: string;
  name: string;
  role: string;
  industry: string;
  companySize: string;
  painPoints: string[];
  goals: string[];
  buyingBehavior: string;
  budget: string;
  matchScore: number; // 0-100
  channels: string[];
  decisionCriteria: string[];
}

export interface SegmentBreakdown {
  segment: MarketSegment;
  percentage: number;
  revenue: string;
  count: number;
  avgDealSize: string;
  growthRate: number;
}

// ============ MODULE 2: COMPETITIVE LANDSCAPE TRACKER ============
export interface CompetitiveTracker {
  competitors: CompetitorEntry[];
  marketPosition: CompetitivePosition;
  differentiators: string[];
  competitiveAdvantages: string[];
  marketShareChart: MarketShareEntry[];
  lastUpdated: string;
  competitiveMatrix: CompetitiveMatrix;
}

export interface CompetitorEntry {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  recentMoves: string[];
  threatLevel: "high" | "medium" | "low";
  positioning: string;
  fundingStage?: string;
}

export interface MarketShareEntry {
  company: string;
  share: number;
  trend: "up" | "down" | "stable";
}

export interface CompetitiveMatrix {
  dimensions: string[];
  scores: Record<string, Record<string, number>>; // company -> dimension -> score
}

// ============ MODULE 3: INSTANT MARKET REPORTS ============
export interface MarketReport {
  id: string;
  topic: string;
  summary: string;
  keyFindings: string[];
  dataSources: DataSource[];
  generatedAt: string;
  confidence: number;
  marketSize: string;
  growthRate: string;
  trends: MarketTrend[];
  regulatoryNotes: string[];
}

export interface DataSource {
  name: string;
  type: "government" | "research" | "industry" | "news" | "database";
  reliability: number; // 0-100
  url?: string;
  lastUpdated?: string;
  country?: string;
}

export interface MarketTrend {
  trend: string;
  impact: "positive" | "negative" | "neutral";
  timeframe: string;
  confidence: number;
}

// ============ MODULE 4: SCENARIO MODELING ============
export interface ScenarioModel {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  assumptions: string[];
  projections: ScenarioProjection[];
  probability: number; // 0-100
  impact: "high" | "medium" | "low";
  timeHorizon: string;
  recommendedActions: string[];
  risks: string[];
}

export interface ScenarioProjection {
  metric: string;
  baseline: number;
  optimistic: number;
  pessimistic: number;
  unit: string;
}

// ============ VALIDATION & TRUST ============
export interface ValidationSource {
  source: string;
  type: "government" | "academic" | "industry" | "expert" | "database";
  lastVerified: string;
  confidence: number;
  dataPoints: number;
  country: string;
}

export interface ExpertCallLog {
  id: string;
  expert: string;
  title: string;
  organization: string;
  topic: string;
  date: string;
  duration: string;
  keyInsights: string[];
  actionItems: string[];
  confidence: number;
}

// ============ STRATEGIC VALUE METRICS ============
export interface StrategicValueMetrics {
  timeToInsight: string; // e.g., "5x faster"
  dataAccuracy: number; // e.g., 95
  costSavings: number; // e.g., 87
  decisionsImproved: number;
  sourcesAnalyzed: number;
  reportsCached: number;
}

// ============ SWOT ANALYSIS ============
export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// ============ GTM STRATEGY CORE (LEGACY COMPAT) ============
export interface GTMStrategy {
  id: string;
  companyId: string;
  companyName: string;
  targetMarket: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;

  marketSize: {
    value: number;
    growth: number;
    forecast: number;
  };

  competitivePosition: CompetitivePosition;
  marketSegments: MarketSegment[];
  targetCustomerProfile: ICP;
  primaryStrategy: EntryStrategy;
  secondaryStrategies: EntryStrategy[];
  go_to_market: GTMPlan;
  projections: FinancialProjection[];
  risks: StrategyRisk[];
  timeline: StrategyMilestone[];
  createdBy: string;
  sharedWith: string[];
  status: "draft" | "review" | "approved" | "executing";
}

export interface ICP {
  industry: string[];
  companySize: {
    employees: [number, number];
    revenue: [number, number];
  };
  painPoints: string[];
  buyingCriteria: string[];
  decisionMakers: string[];
  purchaseBudget: number;
  salesCycle: number;
}

export interface GTMPlan {
  marketingStrategy: MarketingPlan;
  salesStrategy: SalesPlan;
  partnerStrategy: PartnerPlan;
  productStrategy: ProductStrategy;
}

export interface MarketingPlan {
  channels: string[];
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
  duration: number;
}

export interface SalesPlan {
  salesModel: string;
  teamSize: number;
  targetAccounts: string[];
  averageContractValue: number;
  salesCycleLength: number;
  quota: number;
}

export interface PartnerPlan {
  partnerTypes: string[];
  targetPartners: string[];
  incentiveStructure: string;
  supportRequired: string;
}

export interface ProductStrategy {
  positioning: string;
  features: string[];
  pricing: {
    model: string;
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

export interface FinancialProjection {
  year: number;
  revenue: number;
  marketShare: number;
  customers: number;
  costs: {
    sales: number;
    marketing: number;
    operations: number;
  };
  profitMargin: number;
}

export interface StrategyRisk {
  name: string;
  severity: "high" | "medium" | "low";
  probability: number;
  impact: string;
  mitigation: string;
}

export interface StrategyMilestone {
  phase: number;
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
  unit: string;
  frequency: "monthly" | "quarterly" | "annual";
}

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
  estimatedROI: number;
  timeToMarket: number;
  requiredInvestment: number;
}
