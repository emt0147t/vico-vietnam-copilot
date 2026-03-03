/**
 * 🎯 ICP Engine Service — Phase 13: Smart Customer Segmentation
 *
 * Generates Ideal Customer Profiles, Buyer Personas, and Pain-Point
 * analysis for companies operating within the Vietnamese market.
 *
 * Uses Gemini 2.0 Flash (same singleton pattern as playbookService).
 * Responses are deeply localized for Vietnam — references to local
 * corporate structures, regulatory pain points, and VN-specific
 * buying behaviours are enforced at the prompt level.
 *
 * Data provenance:
 *   "ai_generated" — Gemini analysis tailored to company/industry
 *   "template"     — Curated fallback when AI unavailable
 */

import { GoogleGenAI } from '@google/genai';

// ============================================================================
// TYPES
// ============================================================================

/** Firmographic target — the *type* of organisation the product is built for */
export interface Firmographics {
  companySizeRange: string;            // e.g. "50–200 employees"
  revenueRange: string;                // e.g. "$1M–$10M / 25–250 tỷ VND"
  industries: string[];                // Target verticals
  geographicFocus: string[];           // Regions inside VN (HCM, Hanoi, Danang…)
  companyMaturity: string;             // Startup / SME / Mid-market / Enterprise
  ownershipStructure: string;          // Family-owned, FDI, State-owned, JV
  typicalTechStack: string[];          // ERP, manual Excel, custom, etc.
  regulatoryPressure: string;          // Level of gov compliance burden
}

/** One Buyer Persona inside the target organisation */
export interface BuyerPersona {
  id: string;
  title: string;                       // Job title (Vietnamese-localised naming)
  department: string;
  seniority: 'C-Level' | 'VP/Director' | 'Manager' | 'Individual Contributor';
  ageRange: string;
  keyKPIs: string[];
  goals: string[];
  frustrations: string[];
  preferredChannels: string[];         // Zalo, LinkedIn, email, etc.
  vietnamBehavior: string;             // VN-specific purchasing behaviour note
  decisionRole: 'Decision Maker' | 'Influencer' | 'Champion' | 'Gatekeeper' | 'End User';
  quoteSnippet: string;               // A representative micro-quote
}

/** A Buying Trigger — events / situations that create urgency */
export interface BuyingTrigger {
  id: string;
  trigger: string;                     // e.g. "New Nghị định requiring data localisation"
  category: 'regulatory' | 'competitive' | 'growth' | 'operational' | 'technological' | 'seasonal';
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  vietnamContext: string;              // Why this trigger is especially relevant in VN
}

/** Key Pain Point shared across the target segment */
export interface PainPoint {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  currentWorkaround: string;
  costOfInaction: string;              // What happens if they don't solve it
  vietnamSpecific: boolean;
}

/** Full ICP Report — the top-level output */
export interface ICPReport {
  id: string;
  companyName: string;
  industry: string;
  productDescription: string;
  generatedAt: string;
  dataSource: 'ai_generated' | 'template';

  executiveSummary: string;

  firmographics: Firmographics;
  buyerPersonas: BuyerPersona[];
  buyingTriggers: BuyingTrigger[];
  painPoints: PainPoint[];

  /** Positioning recommendation for the VN market */
  positioningStatement: string;
  /** Suggested outreach channels ranked by effectiveness in VN */
  recommendedChannels: string[];
  /** Vietnam-specific context that should inform all GTM efforts */
  vietnamMarketNotes: string[];
}

// ============================================================================
// GEMINI CLIENT (singleton — reuse across calls)
// ============================================================================

let _gemini: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (_gemini) return _gemini;
  const key = process.env['GEMINI_API_KEY'];
  if (!key) {
    console.warn('⚠️ GEMINI_API_KEY not set — ICP engine will use template fallback');
    return null;
  }
  _gemini = new GoogleGenAI({ apiKey: key });
  return _gemini;
}

// ============================================================================
// CACHE (15-min TTL, keyed by company+industry+product hash)
// ============================================================================

const cache = new Map<string, { data: ICPReport; ts: number }>();
const CACHE_TTL = 15 * 60 * 1000;

function cacheKey(company: string, industry: string, product: string): string {
  return `${company.toLowerCase().trim()}::${industry.toLowerCase().trim()}::${product.slice(0, 60).toLowerCase().trim()}`;
}

function getCached(key: string): ICPReport | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

// ============================================================================
// AI GENERATION — Gemini 2.0 Flash prompt
// ============================================================================

/** Subset returned by Gemini (before we add metadata) */
interface AIICPResult {
  executiveSummary: string;
  firmographics: Firmographics;
  buyerPersonas: Array<Omit<BuyerPersona, 'id'>>;
  buyingTriggers: Array<Omit<BuyingTrigger, 'id'>>;
  painPoints: Array<Omit<PainPoint, 'id'>>;
  positioningStatement: string;
  recommendedChannels: string[];
  vietnamMarketNotes: string[];
}

async function generateWithAI(
  companyName: string,
  industry: string,
  productDescription: string,
): Promise<AIICPResult | null> {
  const ai = getGemini();
  if (!ai) return null;

  const prompt = `You are a senior B2B market strategist who specialises EXCLUSIVELY in the Vietnamese market.

Your task: Generate a comprehensive Ideal Customer Profile (ICP) report for the following company/product.

──────────────────────────────────────
COMPANY:    ${companyName}
INDUSTRY:   ${industry}
PRODUCT:    ${productDescription}
──────────────────────────────────────

CRITICAL LOCALISATION REQUIREMENTS — every section MUST reflect these Vietnam realities:
• Vietnamese corporate hierarchies: many companies are family-owned (doanh nghiệp gia đình), decisions often require "sếp lớn" (big boss) approval regardless of org chart title.
• State-owned enterprises (SOEs / doanh nghiệp nhà nước) follow rigid procurement processes (đấu thầu) and require relationship building with government liaisons.
• FDI companies in Vietnam often have dual reporting: local GM + regional HQ in Singapore / Tokyo / Seoul.
• Zalo is the dominant business messaging tool, far more than Slack or Teams. LinkedIn is used mainly for FDI / tech companies.
• Payment terms in VN: 30-60-90 day NET is standard, many SMBs still prefer bank transfer (chuyển khoản) over international payment gateways.
• Key enterprise hubs: Hồ Chí Minh City (HCMC), Hà Nội, Đà Nẵng, Hải Phòng, Bình Dương, Đồng Nai.
• Common tech pain points: legacy Excel-based processes, manual reporting to GSO (Tổng cục Thống kê), fragmented internal systems.
• Regulatory pressure: PDPA (Nghị định 13/2023/NĐ-CP on personal data protection), Luật An ninh mạng (Cybersecurity Law), tax e-invoicing (hoá đơn điện tử) mandates.
• Seasonal triggers: Tết (Lunar New Year) budget cycles, Q1 planning post-Tết, mid-year government budget reviews.
• Local competitors and SaaS alternatives (e.g. 1Office, Base.vn, Misa, Bravo) should be acknowledged.

Return ONLY valid JSON matching this schema (no markdown fences, no commentary):
{
  "executiveSummary": "3-4 sentence Vietnamese market-aware summary of who the ideal customer is",
  "firmographics": {
    "companySizeRange": "e.g. 50–500 nhân viên",
    "revenueRange": "e.g. 50–500 tỷ VND ($2M–$20M)",
    "industries": ["target vertical 1", "target vertical 2"],
    "geographicFocus": ["HCMC", "Hà Nội"],
    "companyMaturity": "SME|Mid-market|Enterprise",
    "ownershipStructure": "Family-owned / FDI / SOE / JV / Private",
    "typicalTechStack": ["Excel", "legacy ERP", "manual processes"],
    "regulatoryPressure": "Description of compliance burden"
  },
  "buyerPersonas": [
    {
      "title": "Vietnamese-appropriate job title (e.g. Giám đốc IT, Trưởng phòng Kinh doanh)",
      "department": "Department name",
      "seniority": "C-Level|VP/Director|Manager|Individual Contributor",
      "ageRange": "35–50",
      "keyKPIs": ["KPI 1", "KPI 2"],
      "goals": ["Goal 1", "Goal 2"],
      "frustrations": ["Frustration 1", "Frustration 2"],
      "preferredChannels": ["Zalo", "Email", "In-person meetings"],
      "vietnamBehavior": "VN-specific note about how this persona makes purchasing decisions",
      "decisionRole": "Decision Maker|Influencer|Champion|Gatekeeper|End User",
      "quoteSnippet": "A short representative quote this persona might say"
    }
  ],
  "buyingTriggers": [
    {
      "trigger": "Event name",
      "category": "regulatory|competitive|growth|operational|technological|seasonal",
      "urgencyLevel": "critical|high|medium|low",
      "description": "What happens and why it creates buying urgency",
      "vietnamContext": "Why this is especially relevant in the Vietnamese market"
    }
  ],
  "painPoints": [
    {
      "title": "Pain point title",
      "severity": "critical|high|medium|low",
      "description": "What the pain is",
      "currentWorkaround": "How they cope today (often manual/Excel in VN)",
      "costOfInaction": "Consequence of not solving",
      "vietnamSpecific": true
    }
  ],
  "positioningStatement": "For [target] in Vietnam who [need], our [product] provides [benefit] unlike [alternatives]",
  "recommendedChannels": ["Ranked channel 1 (e.g. Zalo OA)", "Channel 2", "Channel 3"],
  "vietnamMarketNotes": [
    "Important market context note 1",
    "Important market context note 2"
  ]
}

RULES:
- Generate exactly 3–4 buyer personas (mix of decision maker, influencer, champion, end user)
- Generate 4–6 buying triggers across different categories
- Generate 4–6 pain points with a mix of severities
- All firmographic data MUST be realistic for ${industry} companies in Vietnam
- Do NOT invent revenue/market-size numbers — use ranges or "ước tính" where uncertain
- Pain points must include at least 2 that are vietnamSpecific: true
- Buying triggers must include at least 1 regulatory and 1 seasonal trigger relevant to VN
- Preferred channels MUST include Zalo for B2B in VN (it outranks email for most segments)
- quoteSnippet can be in Vietnamese or English depending on the persona's likely language
- recommendedChannels should be ranked by effectiveness for the ${industry} sector in Vietnam
- All text should blend Vietnamese terms naturally where appropriate (job titles, business terms)`;

  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { temperature: 0.45, maxOutputTokens: 5000 },
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ Gemini returned non-JSON for ICP report');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIICPResult;

      // Basic structural validation
      if (
        !parsed.firmographics ||
        !parsed.buyerPersonas?.length ||
        !parsed.buyingTriggers?.length ||
        !parsed.painPoints?.length
      ) {
        console.warn('⚠️ Gemini ICP result missing required sections');
        return null;
      }

      console.log(
        `   🎯 AI ICP generated: ${parsed.buyerPersonas.length} personas, ` +
        `${parsed.buyingTriggers.length} triggers, ${parsed.painPoints.length} pain points`,
      );
      return parsed;
    } catch (err: any) {
      const is429 =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.includes('quota');
      if (is429 && attempt < MAX_RETRIES) {
        const delay = (attempt + 1) * 5000;
        console.warn(`   ⏳ Rate-limited, retry ${attempt + 1}/${MAX_RETRIES} in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.error('   ❌ Gemini ICP error:', err?.message || err);
      return null;
    }
  }
  return null;
}

// ============================================================================
// TEMPLATE FALLBACK — used when Gemini is unavailable
// ============================================================================

function buildTemplateFallback(
  companyName: string,
  industry: string,
  productDescription: string,
): AIICPResult {
  return {
    executiveSummary:
      `Hồ sơ khách hàng lý tưởng (ICP) cho ${companyName} trong ngành ${industry} tại Việt Nam. ` +
      `Sản phẩm "${productDescription.slice(0, 80)}" nhắm tới các doanh nghiệp vừa và lớn đang ` +
      `chuyển đổi số. Lưu ý: Đây là template cơ bản — cần bổ sung phân tích AI khi Gemini khả dụng.`,

    firmographics: {
      companySizeRange: '50–500 nhân viên',
      revenueRange: '20–200 tỷ VND ($800K–$8M)',
      industries: [industry, 'Manufacturing', 'Retail / Distribution'],
      geographicFocus: ['Hồ Chí Minh City', 'Hà Nội', 'Bình Dương', 'Đà Nẵng'],
      companyMaturity: 'SME to Mid-market',
      ownershipStructure: 'Mix of family-owned, private, and FDI subsidiaries',
      typicalTechStack: ['Excel / Google Sheets', 'Legacy on-prem ERP', 'Manual reporting'],
      regulatoryPressure:
        'Moderate — tax e-invoicing (hoá đơn điện tử) mandate, PDPA (Nghị định 13/2023), annual GSO statistical submissions',
    },

    buyerPersonas: [
      {
        title: 'Giám đốc Điều hành (CEO / Tổng Giám đốc)',
        department: 'Executive / Ban Giám đốc',
        seniority: 'C-Level',
        ageRange: '40–55',
        keyKPIs: ['Revenue growth YoY', 'Market share', 'Net profit margin'],
        goals: [
          'Mở rộng thị phần trong nước và ASEAN',
          'Giảm chi phí vận hành thông qua chuyển đổi số',
        ],
        frustrations: [
          'Khó tìm giải pháp phù hợp thị trường Việt Nam',
          'Nhân sự IT nội bộ thiếu chuyên môn triển khai ERP / SaaS',
          'Quy trình mua sắm kéo dài, cần sếp lớn duyệt',
        ],
        preferredChannels: ['Zalo', 'Direct referral', 'In-person meetings / café'],
        vietnamBehavior:
          'Ra quyết định dựa trên mối quan hệ tin cậy (uy tín). Thường yêu cầu demo trực tiếp và case study từ công ty cùng ngành.',
        decisionRole: 'Decision Maker',
        quoteSnippet: '"Tôi cần thấy ROI cụ thể trong 6 tháng, không phải slide đẹp."',
      },
      {
        title: 'Trưởng phòng IT / Giám đốc Công nghệ (CTO)',
        department: 'IT / Technology',
        seniority: 'VP/Director',
        ageRange: '30–45',
        keyKPIs: ['System uptime', 'Integration success rate', 'Security compliance'],
        goals: [
          'Hiện đại hoá hạ tầng kỹ thuật',
          'Tuân thủ Luật An ninh mạng & PDPA',
        ],
        frustrations: [
          'Budget bị cắt giảm hàng năm',
          'Vendor nước ngoài không hỗ trợ tiếng Việt / múi giờ VN',
          'Dữ liệu phân tán khắp bộ phận, mỗi team dùng 1 tool riêng',
        ],
        preferredChannels: ['Email', 'LinkedIn', 'Tech community events (TechFest, BarCamp)'],
        vietnamBehavior:
          'Technical evaluator — sẽ kiểm tra API docs, security certifications. Có tiếng nói lớn nhưng budget cuối cùng do CEO duyệt.',
        decisionRole: 'Influencer',
        quoteSnippet: '"Có API mở không? Data hosting ở đâu — phải trong nước thì mới comply được."',
      },
      {
        title: 'Trưởng phòng Kinh doanh / Sales Manager',
        department: 'Sales / Business Development',
        seniority: 'Manager',
        ageRange: '28–40',
        keyKPIs: ['Monthly revenue target', 'Lead conversion rate', 'Customer retention'],
        goals: [
          'Tăng pipeline và rút ngắn chu kỳ bán hàng',
          'Có công cụ báo cáo real-time cho ban giám đốc',
        ],
        frustrations: [
          'CRM hiện tại quá phức tạp (hoặc dùng Excel quản lý khách)',
          'Không có dữ liệu thị trường đáng tin cậy',
          'Khó phối hợp marketing – sales vì thiếu hệ thống chung',
        ],
        preferredChannels: ['Zalo', 'Facebook Messenger', 'Cold call'],
        vietnamBehavior:
          'Champion nội bộ — nếu thấy tool giúp đạt KPI sẽ chủ động đề xuất lên sếp. Hay chia sẻ qua group Zalo nội bộ.',
        decisionRole: 'Champion',
        quoteSnippet: '"Cho em thử miễn phí 2 tuần, em báo cáo kết quả cho sếp luôn."',
      },
    ],

    buyingTriggers: [
      {
        trigger: 'Nghị định 13/2023 — PDPA Compliance Deadline',
        category: 'regulatory',
        urgencyLevel: 'critical',
        description: 'New personal data protection decree requires all companies to audit and secure customer data',
        vietnamContext:
          'Nhiều doanh nghiệp VN chưa đáp ứng quy định bảo vệ dữ liệu cá nhân — deadline gây sức ép lớn',
      },
      {
        trigger: 'Post-Tết Budget Allocation (Q1)',
        category: 'seasonal',
        urgencyLevel: 'high',
        description: 'Companies allocate new annual budgets after Tết holiday, Q1 is the best window for new vendor pitches',
        vietnamContext:
          'Chu kỳ ngân sách Việt Nam thường reset sau Tết Nguyên Đán — cơ hội tốt nhất đề xuất dự án mới',
      },
      {
        trigger: 'Competitor launches local alternative',
        category: 'competitive',
        urgencyLevel: 'high',
        description: 'A local SaaS provider (e.g. Base.vn, Misa) releases competing feature set',
        vietnamContext:
          'Thị trường VN ưu tiên vendor nội địa vì ngôn ngữ, hỗ trợ kỹ thuật nhanh, và giá cả phù hợp',
      },
      {
        trigger: 'Hoá đơn điện tử (e-invoice) mandate expansion',
        category: 'regulatory',
        urgencyLevel: 'medium',
        description: 'Government expands mandatory e-invoicing to more business categories',
        vietnamContext:
          'Tổng cục Thuế tiếp tục mở rộng quy định về hoá đơn điện tử — doanh nghiệp cần tích hợp hệ thống',
      },
      {
        trigger: 'Rapid headcount growth (>30% in 6 months)',
        category: 'growth',
        urgencyLevel: 'medium',
        description: 'Company expands workforce significantly, outgrowing manual processes',
        vietnamContext:
          'Các KCN (Khu công nghiệp) ở Bình Dương, Đồng Nai đang tuyển dụng ồ ạt — tạo nhu cầu quản trị HR/payroll',
      },
    ],

    painPoints: [
      {
        title: 'Excel-based operations at scale',
        severity: 'critical',
        description: 'Most departments still use spreadsheets for core workflows — inventory, HR, customer tracking',
        currentWorkaround: 'Multiple Excel files shared via Zalo/email, versioning chaos',
        costOfInaction: 'Data errors → wrong business decisions, 2-3 hours/day spent reconciling sheets',
        vietnamSpecific: true,
      },
      {
        title: 'Fragmented customer data',
        severity: 'high',
        description: 'Customer information scattered across Zalo chat, email, paper notebooks, and ad-hoc databases',
        currentWorkaround: 'Sales reps maintain personal contact lists, knowledge lost on turnover',
        costOfInaction: 'Customer churn, inability to upsell, no single source of truth for management reporting',
        vietnamSpecific: true,
      },
      {
        title: 'Compliance & reporting burden',
        severity: 'high',
        description: 'Manual preparation of reports for GSO, tax authorities, and internal stakeholders',
        currentWorkaround: 'Accounting team manually compiles monthly/quarterly reports from multiple sources',
        costOfInaction: 'Fines for late submissions, audit risk, management flying blind on real-time metrics',
        vietnamSpecific: true,
      },
      {
        title: 'Vendor lock-in with no Vietnamese language support',
        severity: 'medium',
        description: 'Foreign SaaS tools lack Vietnamese UI, local payment integration, and VN-timezone support',
        currentWorkaround: 'Staff use English UI with internal translation docs, or avoid advanced features entirely',
        costOfInaction: 'Low adoption rates, shadow IT, wasted license costs',
        vietnamSpecific: true,
      },
    ],

    positioningStatement:
      `For ${industry} companies in Vietnam with 50–500 employees who struggle with fragmented data ` +
      `and manual processes, ${companyName} provides ${productDescription.slice(0, 60)} — ` +
      `a solution localised for Vietnamese business workflows, unlike generic international SaaS alternatives.`,

    recommendedChannels: [
      'Zalo Official Account + Zalo Ads',
      'LinkedIn (for FDI / tech-savvy segment)',
      'Direct intro via business associations (VCCI, AmCham, EuroCham)',
      'Industry events & conferences (Vietnam ICT Summit, TechFest)',
      'Facebook Business Groups (ngành-specific groups)',
      'Google Ads (Vietnamese long-tail keywords)',
    ],

    vietnamMarketNotes: [
      'Relationship (quan hệ) drives B2B sales — warm intros close 3x faster than cold outreach',
      'Payment: expect 30-60 day NET terms; many SMBs prefer bank transfer (chuyển khoản Vietcombank/ACB)',
      'Decision timelines stretch 2-3x around Tết (Jan-Feb) and summer holidays',
      'Data localisation requirements under Nghị định 13/2023 — hosting in VN is a strong selling point',
      'Vietnamese businesses respond better to case studies from same-industry peers than to generic demos',
    ],
  };
}

// ============================================================================
// PUBLIC API — generateCustomerInsights()
// ============================================================================

/**
 * Generate a full ICP report for a company/product targeting the Vietnamese market.
 *
 * @param companyName        Company or product name
 * @param industry           Target industry vertical
 * @param productDescription Brief description of the product / value proposition
 * @returns Complete {@link ICPReport} (AI-generated or template fallback)
 */
export async function generateCustomerInsights(
  companyName: string,
  industry: string,
  productDescription: string,
): Promise<ICPReport> {
  console.log(`\n🎯 ICP Engine — generating for "${companyName}" in ${industry}`);

  // 1. Check cache
  const key = cacheKey(companyName, industry, productDescription);
  const cached = getCached(key);
  if (cached) {
    console.log('   ✅ Returning cached ICP report');
    return cached;
  }

  // 2. Try AI generation
  const aiResult = await generateWithAI(companyName, industry, productDescription);

  // 3. Fall back to template if AI unavailable
  const raw = aiResult ?? buildTemplateFallback(companyName, industry, productDescription);
  const dataSource: ICPReport['dataSource'] = aiResult ? 'ai_generated' : 'template';

  if (!aiResult) {
    console.log('   📄 Using template fallback (Gemini unavailable)');
  }

  // 4. Hydrate IDs and build final report
  const report: ICPReport = {
    id: `icp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    companyName,
    industry,
    productDescription,
    generatedAt: new Date().toISOString(),
    dataSource,

    executiveSummary: raw.executiveSummary,
    firmographics: raw.firmographics,

    buyerPersonas: raw.buyerPersonas.map((p, i) => ({
      ...p,
      id: `persona-${i + 1}`,
    })),

    buyingTriggers: raw.buyingTriggers.map((t, i) => ({
      ...t,
      id: `trigger-${i + 1}`,
    })),

    painPoints: raw.painPoints.map((pp, i) => ({
      ...pp,
      id: `pain-${i + 1}`,
    })),

    positioningStatement: raw.positioningStatement,
    recommendedChannels: raw.recommendedChannels,
    vietnamMarketNotes: raw.vietnamMarketNotes,
  };

  // 5. Cache for future requests
  cache.set(key, { data: report, ts: Date.now() });
  console.log(`   ✅ ICP report ready (${dataSource}) — ${report.buyerPersonas.length} personas, ${report.buyingTriggers.length} triggers, ${report.painPoints.length} pains`);

  return report;
}
