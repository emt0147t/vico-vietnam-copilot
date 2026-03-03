/**
 * 📘 GTM Phased Playbook Service — Phase 12
 *
 * Generates structured, phased Go-To-Market playbooks for companies
 * entering or expanding within a specific Vietnamese industry.
 *
 * Unlike gtmPlaybookService.ts (Living Playbook for a named company),
 * this service produces a step-by-step execution plan with:
 *   - 4 sequential phases (Assessment → Compliance → Partnering → Launch)
 *   - Concrete actionable tasks per phase
 *   - Vietnam-specific regulatory & cultural guidance
 *   - Estimated timelines, owners, and KPIs
 *
 * Uses Gemini 2.0 Flash (same pattern as other VICO AI services).
 * Fallback templates are returned when AI is unavailable.
 *
 * Data provenance:
 *   "ai_generated" — Gemini analysis tailored to industry + company
 *   "template"     — Curated fallback when AI unavailable
 */

import { GoogleGenAI } from '@google/genai';
import CompaniesDataService from './companiesDataService';
import MarketIndustryAnalytics from './marketIndustryAnalytics';

// ============================================================================
// TYPES
// ============================================================================

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'done' | 'blocked';

export interface PlaybookTask {
  id: string;
  title: string;
  description: string;
  owner: string;               // Suggested role (e.g. "Legal Counsel", "BD Lead")
  priority: TaskPriority;
  status: TaskStatus;
  estimatedDays: number;
  kpiMetric: string;           // How to measure completion
  vietnamNote?: string;        // Vietnam-specific tip
}

export interface PlaybookPhase {
  id: string;
  phaseNumber: number;
  name: string;
  objective: string;
  durationWeeks: number;
  tasks: PlaybookTask[];
  keyDeliverables: string[];
  risks: string[];
  gateCondition: string;       // What must be true to advance
}

export interface Playbook {
  id: string;
  title: string;
  industry: string;
  companyName: string;
  companyContext: {
    size: string;
    products: string;
    location: string;
    industry: string;
  };
  generatedAt: string;
  dataSource: 'ai_generated' | 'template';
  totalWeeks: number;
  phases: PlaybookPhase[];
  executiveSummary: string;
  industrySnapshot: {
    totalCompanies: number;
    concentrationLevel: string;
    hiringTrend: string;
    dynamicScore: number;
    topPlayers: string[];
  };
  vietnamContext: {
    keyRegulations: string[];
    culturalTips: string[];
    usefulContacts: string[];
  };
}

// ============================================================================
// GEMINI CLIENT (singleton, same pattern as other services)
// ============================================================================

let _gemini: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (_gemini) return _gemini;
  const key = process.env['GEMINI_API_KEY'];
  if (!key) {
    console.warn('⚠️ GEMINI_API_KEY not set — playbook will use template fallback');
    return null;
  }
  _gemini = new GoogleGenAI({ apiKey: key });
  return _gemini;
}

// ============================================================================
// CACHE (20-min TTL, keyed by industry+company)
// ============================================================================

const cache = new Map<string, { data: Playbook; ts: number }>();
const CACHE_TTL = 20 * 60 * 1000;

function getCached(key: string): Playbook | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

// ============================================================================
// INDUSTRY SNAPSHOT (from Phase 11 analytics)
// ============================================================================

async function getIndustrySnapshot(industry: string) {
  try {
    const analytics = new MarketIndustryAnalytics();
    const metrics = await analytics.getMarketIndexByIndustry(industry);
    return {
      totalCompanies: metrics.totalCompanies,
      concentrationLevel: metrics.concentrationRatio.marketConcentration,
      hiringTrend: metrics.hiringTrend.trend,
      dynamicScore: metrics.industryHealth.dynamicScore,
      topPlayers: metrics.concentrationRatio.top5Companies.slice(0, 3).map(c => c.name),
    };
  } catch {
    return {
      totalCompanies: 0,
      concentrationLevel: 'Unknown',
      hiringTrend: 'Stable',
      dynamicScore: 50,
      topPlayers: [] as string[],
    };
  }
}

// ============================================================================
// AI GENERATION
// ============================================================================

interface AIPlaybookResult {
  executiveSummary: string;
  phases: Array<{
    name: string;
    objective: string;
    durationWeeks: number;
    tasks: Array<{
      title: string;
      description: string;
      owner: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      estimatedDays: number;
      kpiMetric: string;
      vietnamNote?: string;
    }>;
    keyDeliverables: string[];
    risks: string[];
    gateCondition: string;
  }>;
  vietnamContext: {
    keyRegulations: string[];
    culturalTips: string[];
    usefulContacts: string[];
  };
}

async function generateWithAI(
  industry: string,
  companyContext: { name: string; size: string; products: string; location: string },
  snapshot: Awaited<ReturnType<typeof getIndustrySnapshot>>,
): Promise<AIPlaybookResult | null> {
  const ai = getGemini();
  if (!ai) return null;

  const topPlayersStr = snapshot.topPlayers.length > 0
    ? snapshot.topPlayers.join(', ')
    : 'unknown';

  const prompt = `You are a Go-To-Market strategy expert specialising in Vietnam.

Generate a phased GTM Playbook for a company entering the "${industry}" industry in Vietnam.

Company context:
  Name: ${companyContext.name}
  Size: ${companyContext.size || 'Unknown'}
  Products: ${companyContext.products || 'N/A'}
  Location: ${companyContext.location || 'Vietnam'}

Industry snapshot (from VICO database):
  Total companies: ${snapshot.totalCompanies}
  Concentration: ${snapshot.concentrationLevel}
  Hiring trend: ${snapshot.hiringTrend}
  Health score: ${snapshot.dynamicScore}/100
  Top players: ${topPlayersStr}

Return ONLY valid JSON matching this schema:
{
  "executiveSummary": "3-4 sentence executive summary of the GTM strategy",
  "phases": [
    {
      "name": "Phase name",
      "objective": "Clear objective",
      "durationWeeks": 6,
      "tasks": [
        {
          "title": "Task title",
          "description": "2-3 sentence description with specific actions",
          "owner": "Suggested role (e.g. CEO, Legal Counsel, BD Lead, Marketing Manager)",
          "priority": "critical|high|medium|low",
          "estimatedDays": 14,
          "kpiMetric": "Measurable success metric",
          "vietnamNote": "Optional Vietnam-specific tip"
        }
      ],
      "keyDeliverables": ["deliverable1", "deliverable2"],
      "risks": ["risk1", "risk2"],
      "gateCondition": "Condition to move to next phase"
    }
  ],
  "vietnamContext": {
    "keyRegulations": ["Regulation 1 (e.g. Nghị định 13/2023 PDPA)", "Regulation 2"],
    "culturalTips": ["Tip 1 about Vietnamese business culture", "Tip 2"],
    "usefulContacts": ["Organization 1 (e.g. VCCI, MPI)", "Organization 2"]
  }
}

RULES:
- Generate exactly 4 phases:
  Phase 1: Market Assessment & Validation
  Phase 2: Legal, Compliance & Setup
  Phase 3: Partnership & Distribution
  Phase 4: Launch & Scale
- Each phase must have 3-5 tasks
- All text in English where appropriate
- Be specific to ${industry} industry in Vietnam (reference ${topPlayersStr} as competitors)
- Vietnam regulatory notes MUST reference real Vietnamese laws/agencies (NOT fabricated)
- Do NOT invent market size numbers — use "estimated" or note "needs further research"
- Priorities should be realistic: only 1-2 "critical" tasks per phase
- estimatedDays should be realistic (7-30 range for most tasks)
- gateCondition must be concrete and verifiable`;

  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { temperature: 0.4, maxOutputTokens: 4000 },
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ Gemini returned non-JSON for playbook');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIPlaybookResult;

      // Validate minimum structure
      if (!parsed.phases || parsed.phases.length === 0) {
        console.warn('⚠️ Gemini returned empty phases');
        return null;
      }

      console.log(`   🤖 AI playbook generated: ${parsed.phases.length} phases, ${parsed.phases.reduce((s, p) => s + p.tasks.length, 0)} tasks`);
      return parsed;
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
      if (is429 && attempt < MAX_RETRIES) {
        const delay = (attempt + 1) * 5000;
        console.warn(`   ⏳ Rate-limited, retry ${attempt + 1}/${MAX_RETRIES} in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      console.error('   ❌ Gemini playbook error:', err?.message || err);
      return null;
    }
  }
  return null;
}

// ============================================================================
// TEMPLATE FALLBACK (used when Gemini is unavailable)
// ============================================================================

function buildTemplateFallback(
  industry: string,
  companyName: string,
): AIPlaybookResult {
  return {
    executiveSummary:
      `Go-To-Market strategy for ${companyName} in the ${industry} industry in Vietnam. ` +
      `Playbook covers 4 phases: market assessment, legal compliance, partnership building, and product launch. ` +
      `Note: This is a basic template — AI analysis enhancement needed when Gemini is available.`,
    phases: [
      {
        name: 'Market Research & Assessment',
        objective: `Understand the ${industry} industry landscape in Vietnam, identify opportunities and risks`,
        durationWeeks: 4,
        tasks: [
          {
            title: 'Competitor analysis',
            description: `Use VICO Competitor Engine to identify top competitors in the ${industry} industry. Evaluate products, pricing, and marketing strategies of each competitor.`,
            owner: 'Strategy Lead',
            priority: 'critical',
            estimatedDays: 10,
            kpiMetric: 'Complete competitive battlecard for top 5 competitors',
            vietnamNote: 'Reference data from VCCI and industry associations',
          },
          {
            title: 'Prospect customer survey',
            description: 'Interview 15-20 prospective customers to validate personas and pain points. Collect feedback on unmet needs.',
            owner: 'Product Manager',
            priority: 'high',
            estimatedDays: 14,
            kpiMetric: 'Complete 15+ customer interviews',
          },
          {
            title: 'Market sizing assessment (TAM/SAM/SOM)',
            description: 'Estimate TAM, SAM, SOM for the product in the Vietnam market. Use GSO data and industry reports.',
            owner: 'Strategy Lead',
            priority: 'high',
            estimatedDays: 7,
            kpiMetric: 'Complete TAM/SAM/SOM report',
            vietnamNote: 'Sources: General Statistics Office (GSO), Statista, VCCI reports',
          },
        ],
        keyDeliverables: ['Competitive Analysis Report', 'Customer Interview Summary', 'TAM/SAM/SOM Report'],
        risks: ['Difficulty accessing enterprise customers', 'Incomplete market data'],
        gateCondition: 'Identified at least 3 potential customer segments and clear understanding of competitive landscape',
      },
      {
        name: 'Legal & Compliance',
        objective: 'Complete all legal requirements to operate lawfully in Vietnam',
        durationWeeks: 6,
        tasks: [
          {
            title: 'Business registration / Business license',
            description: 'Apply for business registration certificate at the Dept. of Planning & Investment. Determine the appropriate business entity type (LLC, JSC, Representative Office).',
            owner: 'Legal Counsel',
            priority: 'critical',
            estimatedDays: 21,
            kpiMetric: 'Business registration certificate issued',
            vietnamNote: 'Enterprise Law 2020 (Law No. 59/2020/QH14); processing time 3-5 business days but may take longer in practice',
          },
          {
            title: 'Personal data protection compliance (PDPA)',
            description: 'Review and ensure compliance with Decree 13/2023/ND-CP on personal data protection. Update privacy policy and consent flows.',
            owner: 'Legal Counsel',
            priority: 'high',
            estimatedDays: 14,
            kpiMetric: 'Privacy policy & DPA compliant with Decree 13/2023',
            vietnamNote: 'Decree 13/2023/ND-CP effective from 01/07/2023 — fines up to 100 million VND',
          },
          {
            title: 'Tax registration & accounting',
            description: 'Register tax identification number, set up e-invoice system, hire local accounting service.',
            owner: 'CFO / Finance Lead',
            priority: 'high',
            estimatedDays: 10,
            kpiMetric: 'Tax ID issued, e-invoice system operational',
            vietnamNote: 'Decree 123/2020/ND-CP mandates e-invoicing from 01/07/2022',
          },
        ],
        keyDeliverables: ['Business Registration Certificate', 'PDPA Compliance Report', 'Tax Registration'],
        risks: ['Extended licensing timeline', 'Sudden regulatory changes'],
        gateCondition: 'All required licenses issued and business can operate legally',
      },
      {
        name: 'Partners & Distribution Channels',
        objective: 'Build partner ecosystem and sales channels in Vietnam',
        durationWeeks: 6,
        tasks: [
          {
            title: 'Identify & approach strategic partners',
            description: `Contact top 10 potential partners in the ${industry} industry. Propose partnership model (reseller, referral, co-sell).`,
            owner: 'BD Lead',
            priority: 'critical',
            estimatedDays: 21,
            kpiMetric: 'Sign MOU with at least 2 partners',
            vietnamNote: 'Personal relationships are very important — face-to-face meetings recommended',
          },
          {
            title: 'Set up online channels (website, marketplace)',
            description: 'Localize website to Vietnamese. Register on relevant marketplaces (if applicable). Set up local payment integration.',
            owner: 'Marketing Manager',
            priority: 'high',
            estimatedDays: 14,
            kpiMetric: 'Vietnamese website live, marketplace channels operational',
            vietnamNote: 'Integrate local payment gateways: VNPay, MoMo, ZaloPay',
          },
          {
            title: 'Recruit local staff',
            description: 'Hire 2-3 initial staff (sales, CS). Prioritize candidates with industry network and understanding of local business culture.',
            owner: 'HR / Country Manager',
            priority: 'medium',
            estimatedDays: 21,
            kpiMetric: 'Hire at least 2 staff, complete onboarding',
            vietnamNote: 'Popular recruitment platforms: TopCV, VietnamWorks, LinkedIn Vietnam',
          },
        ],
        keyDeliverables: ['Partner MOUs', 'Localized Website', 'Local Team Hired'],
        risks: ['Partners not committing', 'Difficulty hiring suitable staff', 'High localization costs'],
        gateCondition: 'At least 1 partner MOU signed and local team ready to operate',
      },
      {
        name: 'Launch & Scale',
        objective: 'Launch product, acquire first customers, and optimize go-to-market engine',
        durationWeeks: 8,
        tasks: [
          {
            title: 'Pilot launch with early adopters',
            description: 'Run pilot with 5-10 initial customers. Collect feedback, measure metrics (activation, retention, NPS).',
            owner: 'Product Manager',
            priority: 'critical',
            estimatedDays: 21,
            kpiMetric: '5+ active pilot customers, NPS > 30',
          },
          {
            title: 'Launch marketing campaign',
            description: 'Run launch campaign on digital channels (Facebook, Google, LinkedIn VN). PR event or webinar to introduce the product.',
            owner: 'Marketing Manager',
            priority: 'high',
            estimatedDays: 14,
            kpiMetric: '100+ qualified leads, 10+ demo requests',
            vietnamNote: 'Facebook & Zalo are the most popular channels in VN (Facebook 70M+ users)',
          },
          {
            title: 'Set up sales pipeline & CRM',
            description: 'Deploy CRM (HubSpot/Salesforce), define sales stages, setup lead scoring. Train team on consultative selling.',
            owner: 'Sales Lead',
            priority: 'high',
            estimatedDays: 10,
            kpiMetric: 'CRM live, pipeline > 20 opportunities',
          },
          {
            title: 'Review & expansion planning',
            description: 'Review Q1 results, identify best-performing segments. Plan for scaling (additional staff, channels, regions).',
            owner: 'CEO / Country Manager',
            priority: 'medium',
            estimatedDays: 7,
            kpiMetric: 'Complete expansion plan with targets for next 12 months',
          },
        ],
        keyDeliverables: ['Pilot Results Report', 'Launch Campaign Report', 'CRM Pipeline', '12-Month Scale Plan'],
        risks: ['Product-market fit not achieved', 'CAC too high', 'High churn rate during pilot'],
        gateCondition: 'Achieved ≥5 paying customers and confirmed product-market fit via NPS/retention data',
      },
    ],
    vietnamContext: {
      keyRegulations: [
        'Enterprise Law 2020 (59/2020/QH14)',
        'Decree 13/2023/ND-CP — Personal Data Protection (PDPA)',
        'Decree 123/2020/ND-CP — E-invoicing',
        'Investment Law 2020 (61/2020/QH14) — FDI regulations',
        'Cybersecurity Law 2018 (24/2018/QH14)',
      ],
      culturalTips: [
        'Personal relationships (guanxi) are key — invest time building trust before discussing deals',
        'Decisions often go through many layers (hierarchy) — be patient with long sales cycles',
        'Market is very price-sensitive — pricing strategy must match local purchasing power',
        'Vietnamese is mandatory for materials & support — English-only will limit 90%+ of the market',
      ],
      usefulContacts: [
        'VCCI — Vietnam Chamber of Commerce and Industry',
        'MPI — Ministry of Planning and Investment (FDI licensing)',
        'MOST — Ministry of Science and Technology (for R&D/tech-related)',
        'Economic Court — commercial dispute resolution',
      ],
    },
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function generateGTMPlaybook(
  industry: string,
  companyProfile: {
    name?: string;
    size?: string;
    products?: string;
    location?: string;
  },
): Promise<Playbook> {
  const companyName = companyProfile.name || 'New Entrant';
  const cacheKey = `playbook:${industry}:${companyName}`.toLowerCase();

  // Check cache
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`📦 Playbook cache hit: ${cacheKey}`);
    return cached;
  }

  console.log(`📘 Generating GTM Playbook: ${companyName} → ${industry}`);

  // 1. Get industry snapshot from analytics engine
  const snapshot = await getIndustrySnapshot(industry);
  console.log(`   📊 Industry snapshot: ${snapshot.totalCompanies} companies, health=${snapshot.dynamicScore}`);

  // 2. Resolve company from database (optional enrichment)
  const companyContext = {
    name: companyName,
    size: companyProfile.size || 'Unknown',
    products: companyProfile.products || 'N/A',
    location: companyProfile.location || 'Vietnam',
  };

  // Try to enrich from VICO database
  try {
    const db = CompaniesDataService.getInstance();
    const match = db.getCompanyByName(companyName);
    if (match) {
      companyContext.size = match.size || companyContext.size;
      companyContext.products = match.products || companyContext.products;
      companyContext.location = match.address || companyContext.location;
      console.log(`   ✅ Enriched from VICO DB: ${match.name}`);
    }
  } catch {
    // DB not available — proceed with provided profile
  }

  // 3. Generate via AI or fallback
  const aiResult = await generateWithAI(industry, companyContext, snapshot);
  const result = aiResult || buildTemplateFallback(industry, companyName);
  const dataSource: 'ai_generated' | 'template' = aiResult ? 'ai_generated' : 'template';

  // 4. Assemble Playbook
  const now = new Date().toISOString();
  let taskCounter = 0;

  const phases: PlaybookPhase[] = result.phases.map((p, idx) => ({
    id: `phase_${idx + 1}`,
    phaseNumber: idx + 1,
    name: p.name,
    objective: p.objective,
    durationWeeks: p.durationWeeks || 4,
    tasks: (p.tasks || []).map((t) => ({
      id: `task_${++taskCounter}`,
      title: t.title,
      description: t.description,
      owner: t.owner || 'TBD',
      priority: (['critical', 'high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium') as TaskPriority,
      status: 'not_started' as TaskStatus,
      estimatedDays: t.estimatedDays || 14,
      kpiMetric: t.kpiMetric || 'TBD',
      vietnamNote: t.vietnamNote,
    })),
    keyDeliverables: p.keyDeliverables || [],
    risks: p.risks || [],
    gateCondition: p.gateCondition || 'Phase objectives met',
  }));

  const totalWeeks = phases.reduce((s, p) => s + p.durationWeeks, 0);

  const playbook: Playbook = {
    id: `pb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: `GTM Playbook: ${companyName} → ${industry} Vietnam`,
    industry,
    companyName,
    companyContext: {
      size: companyContext.size,
      products: companyContext.products,
      location: companyContext.location,
      industry,
    },
    generatedAt: now,
    dataSource,
    totalWeeks,
    phases,
    executiveSummary: result.executiveSummary,
    industrySnapshot: snapshot,
    vietnamContext: result.vietnamContext || {
      keyRegulations: [],
      culturalTips: [],
      usefulContacts: [],
    },
  };

  // Cache it
  cache.set(cacheKey, { data: playbook, ts: Date.now() });
  console.log(`✅ Playbook generated (${dataSource}): ${phases.length} phases, ${taskCounter} tasks, ~${totalWeeks} weeks`);

  return playbook;
}
