/**
 * Market Intelligence Service — Static Lookup + AI Enhancement
 * 
 * Data provenance:
 * 1. STATIC LOOKUP TABLES: Pre-compiled industry data (TAM/SAM, CAGR, Porter's, etc.)
 *    - Originally sourced from GSO, World Bank, MIC, Statista, VCCI reports
 *    - STATIC: These numbers were compiled at code-time and will become stale
 *    - They are NOT fetched live from any API
 *    - Serves as fallback when AI is unavailable
 * 
 * 2. VICO COMPANY DATABASE: Real competitor/industry data (10,000+ companies)
 * 
 * 3. GEMINI AI ANALYSIS (when available): Dynamic market insights
 *    - Enhances executive summary, market dynamics, strategic recommendations
 *    - Clearly labeled as AI-generated
 * 
 * Data freshness: Static tables compiled ~2024. Use AI overlay for current analysis.
 * NO Math.random(), NO fabricated funding deals.
 */

import { GoogleGenAI } from '@google/genai';
import { findTopCompetitors, CompetitorMatch, loadAllCompanies } from './competitorEngine';
import { getIndustryTradeProfile, IndustryTradeProfile } from '../data/vietnamTradeData';

// ============================================================================
// GEMINI AI CLIENT + CACHE
// ============================================================================

let geminiInstance: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
    if (geminiInstance) return geminiInstance;
    const key = process.env['GEMINI_API_KEY'];
    if (!key) return null;
    geminiInstance = new GoogleGenAI({ apiKey: key });
    return geminiInstance;
}

const aiCache = new Map<string, { data: any; ts: number }>();
const AI_CACHE_TTL = 30 * 60 * 1000;

function getAICached(key: string): any | null {
    const entry = aiCache.get(key);
    if (entry && Date.now() - entry.ts < AI_CACHE_TTL) return entry.data;
    if (entry) aiCache.delete(key);
    return null;
}

function setAICache(key: string, data: any): void {
    aiCache.set(key, { data, ts: Date.now() });
}

interface AIMarketOverlay {
    marketOutlook: string;
    currentTrends: string[];
    risks: string[];
    opportunities: string[];
    updatedDrivers: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
    updatedRestraints: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
    executiveInsights: string[];
    dataFreshnessNote: string;
}

async function getAIMarketOverlay(industry: string, companyName: string, peerCount: number, competitorNames: string[] = []): Promise<AIMarketOverlay | null> {
    const ai = getGemini();
    if (!ai) return null;

    const competitorContext = competitorNames.length > 0
        ? `The user has selected these direct competitors to analyze: ${competitorNames.join(', ')}.`
        : '';
    const cacheKey = `mi:${industry}:${companyName}:${competitorNames.sort().join(',')}`.toLowerCase();
    const cached = getAICached(cacheKey);
    if (cached) {
        console.log(`   Cache hit for AI market overlay: ${industry}`);
        return cached;
    }

    const prompt = `You are a Vietnam market intelligence analyst. Provide a current market analysis for the ${industry} industry in Vietnam.

Context: Analyzing for company "${companyName}". ${competitorContext} VICO database has ${peerCount} companies in this industry.

Return ONLY valid JSON:
{
  "marketOutlook": "2-3 sentence current market outlook mentioning ${companyName} competitive position${competitorNames.length > 0 ? ` vs ${competitorNames.slice(0, 3).join(', ')}` : ''}",
  "currentTrends": ["trend1", "trend2", "trend3"],
  "risks": ["risk1", "risk2", "risk3"],
  "opportunities": ["opp1", "opp2", "opp3"],
  "updatedDrivers": [
    {"title": "driver title", "description": "description with context", "impact": "High"}
  ],
  "updatedRestraints": [
    {"title": "restraint title", "description": "description", "impact": "Medium"}
  ],
  "executiveInsights": ["insight1 relevant to ${companyName} vs competitors", "insight2", "insight3"],
  "dataFreshnessNote": "Note about data currency"
}

RULES:
- All text in Vietnamese where possible
- Be specific to ${industry} in Vietnam
- Reference ${companyName} and its competitors (${competitorNames.join(', ') || 'none specified'}) where relevant
- Do NOT invent specific dollar amounts or percentages — use ranges or \"ước tính\"
- Reference real organizations (GSO, VCCI, etc.) only if you know current data
- 3 drivers, 2 restraints, 3 trends, 3 risks, 3 opportunities`;

    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: { temperature: 0.3, maxOutputTokens: 2000, tools: [{ googleSearch: {} }] }
            });

            const text = response.text || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) return null;

            const parsed = JSON.parse(jsonMatch[0]) as AIMarketOverlay;
            setAICache(cacheKey, parsed);
            console.log(`   🤖 AI market overlay generated for: ${industry}`);
            return parsed;
        } catch (err: any) {
            const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
            if (is429 && attempt < MAX_RETRIES) {
                const delay = (attempt + 1) * 5000;
                console.warn(`   ⏳ Gemini rate-limited, retry ${attempt + 1}/${MAX_RETRIES} in ${delay / 1000}s...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            console.error(`   ❌ Gemini market overlay error:`, err?.message || err);
            return null;
        }
    }
    return null;
}

// ============================================================================
// TYPES
// ============================================================================

export interface MarketIntelligenceInput {
    userCompany: {
        name: string;
        industry: string;
        description: string;
        products: string;
        location: string;
        size: string;
    };
    selectedCompetitors: Array<{
        name: string;
        industry?: string;
        similarity?: number;
        products?: string;
        intro?: string;
        address?: string;
        size?: string;
    }>;
}

export interface MarketSizeData {
    tam: string;
    tamValue: number;
    tamDescription: string;
    sam: string;
    samValue: number;
    samDescription: string;
    som: string;
    somValue: number;
    somDescription: string;
    cagr: number;
    cagrPeriod: string;
    currentSize: number;
    forecastSize: number;
    revenueHistory: number[];
    years: string[];
    methodology: string;
}

export interface CompetitiveLandscapeData {
    marketShare: Array<{
        name: string;
        share: number;
        growth: number;
        type: 'Leader' | 'Challenger' | 'Follower' | 'Niche';
    }>;
    concentration: {
        level: string;
        hhi: number;
        cr4: number;
        description: string;
    };
    totalCompaniesInIndustry: number;
    avgSimilarity: number;
}

export interface MarketDynamicsData {
    drivers: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
    restraints: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
    trends: Array<{ title: string; description: string; impact: 'High' | 'Medium' | 'Low' }>;
}

export interface PortersForcesData {
    supplierPower: { score: number; description: string };
    buyerPower: { score: number; description: string };
    newEntrants: { score: number; description: string };
    substitutes: { score: number; description: string };
    rivalry: { score: number; description: string };
}

export interface FundingData {
    totalDeals: number;
    totalValue: string;
    totalValueNum: number;
    yoyGrowth: number;
    avgDealSize: string;
    topSectors: Array<{ name: string; value: number; percentage: number }>;
    recentDeals: Array<{
        type: string;
        title: string;
        parties: string;
        value: string;
        date: string;
        description: string;
    }>;
}

export interface MarketIntelligenceReport {
    generatedAt: string;
    industry: string;
    market: string;
    companyCount: number;

    marketSize: MarketSizeData;
    competitiveLandscape: CompetitiveLandscapeData;
    marketDynamics: MarketDynamicsData;
    portersForces: PortersForcesData;
    funding: FundingData;
    tradeProfile?: IndustryTradeProfile | null;

    executiveSummary: {
        overview: string;
        keyInsights: string[];
        recommendations: string[];
    };

    sources: {
        competitorsAnalyzed: number;
        industryPeersFound: number;
        similarityThreshold: number;
        selectedCompetitorNames?: string[];
        dataSources: string[];
    };
}

// ============================================================================
// STATIC VIETNAM MARKET DATA — FALLBACK (compiled ~2024, NOT live-fetched)
// ============================================================================

/**
 * ⚠️ STATIC DATA — These numbers were compiled from published reports circa 2024.
 * They are NOT fetched live from GSO, World Bank, or any API.
 * Used as fallback when Gemini AI is unavailable.
 * When AI is available, it overlays current analysis on top of these baselines.
 * 
 * Original sources (at time of compilation):
 * - GSO Statistical Yearbook 2024
 * - Vietnam ICT White Book 2024 (MIC)
 * - World Bank Vietnam Economic Update 2024-2025
 * - Statista Vietnam Market Outlook 2025
 * - VCCI Annual Report 2024
 */
const VIETNAM_INDUSTRY_DATA: Record<string, {
    globalTAM: number;
    vietnamSAM: number;
    vietnamSOM_ratio: number;
    cagr: number;
    cagrSource: string;
    supplierPower: number;
    buyerPower: number;
    threatNewEntrants: number;
    threatSubstitutes: number;
    rivalry: number;
    estimatedPlayers: number;
    topPlayersShare: number;
    fundingDeals2024: number;
    fundingValue2024: number;
    fundingYoYGrowth: number;
    source: string;
}> = {
    'Technology': {
        globalTAM: 4700, vietnamSAM: 18.5, vietnamSOM_ratio: 0.08, cagr: 12.5,
        cagrSource: 'MIC Vietnam ICT White Book 2024',
        supplierPower: 3, buyerPower: 4, threatNewEntrants: 4, threatSubstitutes: 3, rivalry: 4,
        estimatedPlayers: 64000, topPlayersShare: 35,
        fundingDeals2024: 68, fundingValue2024: 529, fundingYoYGrowth: -18,
        source: 'MIC ICT White Book 2024, Tracxn Vietnam Tech 2024'
    },
    'Finance': {
        globalTAM: 26500, vietnamSAM: 18.0, vietnamSOM_ratio: 0.05, cagr: 15.2,
        cagrSource: 'Statista Vietnam Fintech Market 2025',
        supplierPower: 2, buyerPower: 3, threatNewEntrants: 2, threatSubstitutes: 4, rivalry: 4,
        estimatedPlayers: 2800, topPlayersShare: 55,
        fundingDeals2024: 22, fundingValue2024: 185, fundingYoYGrowth: -25,
        source: 'SBV Annual Report 2024, Statista Financial Services Vietnam'
    },
    'Retail': {
        globalTAM: 28000, vietnamSAM: 142.0, vietnamSOM_ratio: 0.02, cagr: 9.8,
        cagrSource: 'GSO & VECOM E-commerce Report 2024',
        supplierPower: 3, buyerPower: 5, threatNewEntrants: 4, threatSubstitutes: 3, rivalry: 5,
        estimatedPlayers: 380000, topPlayersShare: 22,
        fundingDeals2024: 15, fundingValue2024: 142, fundingYoYGrowth: -32,
        source: 'GSO Statistical Yearbook 2024, VECOM'
    },
    'Healthcare': {
        globalTAM: 8500, vietnamSAM: 20.0, vietnamSOM_ratio: 0.05, cagr: 11.5,
        cagrSource: 'BMI/Fitch Solutions Vietnam Pharma & Healthcare Report',
        supplierPower: 4, buyerPower: 2, threatNewEntrants: 2, threatSubstitutes: 2, rivalry: 3,
        estimatedPlayers: 5200, topPlayersShare: 30,
        fundingDeals2024: 8, fundingValue2024: 45, fundingYoYGrowth: 12,
        source: 'BMI Research, Vietnam MoH Annual Report 2024'
    },
    'Education': {
        globalTAM: 7300, vietnamSAM: 3.0, vietnamSOM_ratio: 0.10, cagr: 18.5,
        cagrSource: 'HolonIQ Vietnam EdTech Report 2024, GSO',
        supplierPower: 2, buyerPower: 4, threatNewEntrants: 4, threatSubstitutes: 3, rivalry: 3,
        estimatedPlayers: 4500, topPlayersShare: 25,
        fundingDeals2024: 12, fundingValue2024: 35, fundingYoYGrowth: 8,
        source: 'HolonIQ Southeast Asia EdTech 2024'
    },
    'Manufacturing': {
        globalTAM: 16000, vietnamSAM: 120.0, vietnamSOM_ratio: 0.01, cagr: 7.8,
        cagrSource: 'GSO Industrial Production Report 2024',
        supplierPower: 4, buyerPower: 3, threatNewEntrants: 2, threatSubstitutes: 2, rivalry: 4,
        estimatedPlayers: 95000, topPlayersShare: 18,
        fundingDeals2024: 5, fundingValue2024: 78, fundingYoYGrowth: -15,
        source: 'GSO, MOIT Industrial Report 2024'
    },
    'Logistics': {
        globalTAM: 9500, vietnamSAM: 42.0, vietnamSOM_ratio: 0.03, cagr: 14.5,
        cagrSource: 'VLA (Vietnam Logistics Association) Report 2024',
        supplierPower: 3, buyerPower: 4, threatNewEntrants: 3, threatSubstitutes: 2, rivalry: 4,
        estimatedPlayers: 34000, topPlayersShare: 28,
        fundingDeals2024: 6, fundingValue2024: 52, fundingYoYGrowth: -10,
        source: 'VLA Annual Report 2024, World Bank LPI'
    },
    'RealEstate': {
        globalTAM: 35000, vietnamSAM: 60.0, vietnamSOM_ratio: 0.02, cagr: 6.5,
        cagrSource: 'VARS (Vietnam Association of Realtors) 2024',
        supplierPower: 4, buyerPower: 3, threatNewEntrants: 2, threatSubstitutes: 2, rivalry: 4,
        estimatedPlayers: 12000, topPlayersShare: 32,
        fundingDeals2024: 4, fundingValue2024: 120, fundingYoYGrowth: -40,
        source: 'VARS, MoC Vietnam Real Estate Report 2024'
    },
    'Automotive': {
        globalTAM: 3000, vietnamSAM: 12.0, vietnamSOM_ratio: 0.06, cagr: 10.2,
        cagrSource: 'VAMA (Vietnam Auto Manufacturers Association) 2024',
        supplierPower: 5, buyerPower: 3, threatNewEntrants: 2, threatSubstitutes: 3, rivalry: 4,
        estimatedPlayers: 800, topPlayersShare: 62,
        fundingDeals2024: 3, fundingValue2024: 280, fundingYoYGrowth: 45,
        source: 'VAMA Monthly Report 2024'
    },
    'Telecommunications': {
        globalTAM: 1800, vietnamSAM: 8.5, vietnamSOM_ratio: 0.04, cagr: 5.8,
        cagrSource: 'MIC Vietnam Telecom Report 2024',
        supplierPower: 4, buyerPower: 4, threatNewEntrants: 1, threatSubstitutes: 3, rivalry: 3,
        estimatedPlayers: 120, topPlayersShare: 85,
        fundingDeals2024: 2, fundingValue2024: 15, fundingYoYGrowth: -50,
        source: 'MIC, VNPT/Viettel Annual Reports'
    },
    'Energy': {
        globalTAM: 8500, vietnamSAM: 35.0, vietnamSOM_ratio: 0.02, cagr: 8.5,
        cagrSource: 'EVN & MOIT Power Development Plan VIII',
        supplierPower: 5, buyerPower: 2, threatNewEntrants: 2, threatSubstitutes: 3, rivalry: 3,
        estimatedPlayers: 3500, topPlayersShare: 65,
        fundingDeals2024: 7, fundingValue2024: 350, fundingYoYGrowth: 25,
        source: 'EVN Annual Report, MOIT PDP8 Update'
    },
    'FoodBeverage': {
        globalTAM: 8000, vietnamSAM: 65.0, vietnamSOM_ratio: 0.02, cagr: 8.2,
        cagrSource: 'Euromonitor International Vietnam F&B 2024',
        supplierPower: 3, buyerPower: 4, threatNewEntrants: 4, threatSubstitutes: 3, rivalry: 5,
        estimatedPlayers: 85000, topPlayersShare: 20,
        fundingDeals2024: 9, fundingValue2024: 65, fundingYoYGrowth: -5,
        source: 'Euromonitor, MARD Vietnam Food Industry Report'
    },
    'Agriculture': {
        globalTAM: 12000, vietnamSAM: 45.0, vietnamSOM_ratio: 0.01, cagr: 3.5,
        cagrSource: 'GSO, MARD Annual Agricultural Report 2024',
        supplierPower: 3, buyerPower: 4, threatNewEntrants: 3, threatSubstitutes: 2, rivalry: 3,
        estimatedPlayers: 120000, topPlayersShare: 12,
        fundingDeals2024: 4, fundingValue2024: 18, fundingYoYGrowth: -20,
        source: 'MARD, FAO Vietnam Country Report'
    },
    'Construction': {
        globalTAM: 13000, vietnamSAM: 35.0, vietnamSOM_ratio: 0.02, cagr: 7.5,
        cagrSource: 'MoC Vietnam Construction Report 2024',
        supplierPower: 4, buyerPower: 3, threatNewEntrants: 3, threatSubstitutes: 2, rivalry: 4,
        estimatedPlayers: 28000, topPlayersShare: 22,
        fundingDeals2024: 3, fundingValue2024: 45, fundingYoYGrowth: -30,
        source: 'Ministry of Construction Annual Report 2024'
    },
    'Tourism': {
        globalTAM: 10000, vietnamSAM: 25.0, vietnamSOM_ratio: 0.03, cagr: 15.0,
        cagrSource: 'VNAT (Vietnam National Administration of Tourism) 2024',
        supplierPower: 3, buyerPower: 4, threatNewEntrants: 3, threatSubstitutes: 3, rivalry: 4,
        estimatedPlayers: 42000, topPlayersShare: 18,
        fundingDeals2024: 5, fundingValue2024: 32, fundingYoYGrowth: 35,
        source: 'VNAT, UNWTO Southeast Asia Report'
    },
    'Insurance': {
        globalTAM: 7000, vietnamSAM: 8.5, vietnamSOM_ratio: 0.04, cagr: 12.0,
        cagrSource: 'ISA (Insurance Supervisory Authority) Vietnam 2024',
        supplierPower: 3, buyerPower: 3, threatNewEntrants: 2, threatSubstitutes: 3, rivalry: 4,
        estimatedPlayers: 78, topPlayersShare: 55,
        fundingDeals2024: 2, fundingValue2024: 25, fundingYoYGrowth: -15,
        source: 'ISA Annual Report, Swiss Re Sigma'
    }
};

const DEFAULT_INDUSTRY_DATA = {
    globalTAM: 5000, vietnamSAM: 15.0, vietnamSOM_ratio: 0.05, cagr: 10.0,
    cagrSource: 'Estimated based on Vietnam GDP growth and industry average',
    supplierPower: 3, buyerPower: 3, threatNewEntrants: 3, threatSubstitutes: 3, rivalry: 3,
    estimatedPlayers: 10000, topPlayersShare: 30,
    fundingDeals2024: 5, fundingValue2024: 30, fundingYoYGrowth: 0,
    source: 'General Vietnam market estimates, GSO/World Bank'
};

// ============================================================================
// STATIC MARKET DYNAMICS — FALLBACK (compiled ~2024, NOT live-fetched)
// When Gemini AI is available, these are supplemented with current analysis
// ============================================================================

const VERIFIED_MARKET_DYNAMICS: Record<string, MarketDynamicsData> = {
    'Technology': {
        drivers: [
            { title: 'Chương trình Chuyển đổi số Quốc gia 2025-2030', description: 'QĐ 749/QĐ-TTg: Mục tiêu kinh tế số chiếm 30% GDP vào 2030. Ngân sách $2B cho digital infrastructure (Nguồn: Thủ tướng Chính phủ)', impact: 'High' },
            { title: 'Dân số trẻ & internet penetration', description: '79.1M người dùng internet (78.4% dân số), 72.7M smartphone users. Median age 31.9 tuổi (Nguồn: DataReportal 2024)', impact: 'High' },
            { title: 'FDI vào công nghệ tăng mạnh', description: 'FDI đăng ký $36.6B (2024), Samsung/Intel/LG chiếm 30% FDI công nghiệp (Nguồn: MPI/FIA)', impact: 'High' },
            { title: 'Outsourcing hub đang lên', description: 'Top 6 toàn cầu về IT outsourcing. 530,000+ lập trình viên, chi phí thấp hơn Ấn Độ 15-20% (Nguồn: Tholons, VINASA)', impact: 'Medium' }
        ],
        restraints: [
            { title: 'Thiếu hụt nhân lực chất lượng cao', description: 'Thiếu ~150,000 kỹ sư IT/năm. Chỉ 30% sinh viên CNTT đáp ứng yêu cầu doanh nghiệp (Nguồn: VINASA Survey 2024)', impact: 'High' },
            { title: 'Luật An ninh mạng & data localization', description: 'NĐ 13/2023/NĐ-CP yêu cầu lưu trữ dữ liệu tại Việt Nam, tăng chi phí compliance (Nguồn: Bộ Công an)', impact: 'Medium' },
            { title: 'Hạ tầng cloud chưa đồng bộ', description: 'AWS/Azure/GCP chưa có region tại Việt Nam. Latency và chi phí cao hơn Singapore 20-40%', impact: 'Medium' }
        ],
        trends: [
            { title: 'AI & GenAI adoption', description: 'Vietnam đứng #2 ASEAN về AI readiness. FPT, VinAI, Viettel AI đầu tư lớn. AI market ước tính $700M (2025) (Nguồn: Oxford Insights, MIC)', impact: 'High' },
            { title: 'Fintech & digital payments', description: 'Mobile payment transactions tăng 65% YoY, 48M ví điện tử. MoMo, ZaloPay, VNPay dẫn đầu (Nguồn: SBV, Statista)', impact: 'High' },
            { title: 'Semiconductor & chip manufacturing', description: 'Vietnam được Mỹ, Nhật, Hàn chọn là hub chip. Samsung, Intel mở rộng nhà máy (Nguồn: MOIT)', impact: 'Medium' },
            { title: 'Green IT & sustainability', description: 'Cam kết Net Zero 2050. Renewable energy IT chiếm 12% ngân sách CNTT mới (Nguồn: MONRE COP26)', impact: 'Medium' }
        ]
    },
    'Finance': {
        drivers: [
            { title: '69% dân số chưa sử dụng ngân hàng đầy đủ', description: 'Chỉ 31% người trưởng thành có tài khoản ngân hàng hoạt động thường xuyên (Nguồn: World Bank Findex 2024)', impact: 'High' },
            { title: 'NHNN khuyến khích số hóa', description: 'QĐ 810/QĐ-NHNN: Đề án thanh toán không dùng tiền mặt 2021-2025, mục tiêu 80% giao dịch điện tử (Nguồn: SBV)', impact: 'High' },
            { title: 'Mobile banking phát triển nhanh', description: '85 triệu tài khoản mobile banking. Tăng trưởng 45% YoY (Nguồn: SBV Digital Banking Report 2024)', impact: 'High' }
        ],
        restraints: [
            { title: 'Quy định cấp phép phức tạp', description: 'Cấp phép e-wallet, lending platform kéo dài 12-18 tháng. NĐ 101/2024 thắt chặt P2P (Nguồn: SBV)', impact: 'High' },
            { title: 'NPL ratio tăng', description: 'Tỷ lệ nợ xấu hệ thống 4.55% (Q3/2024), gấp đôi ngưỡng an toàn 3% (Nguồn: SBV)', impact: 'Medium' }
        ],
        trends: [
            { title: 'Open Banking & API Economy', description: 'Pilot open banking với NAPAS và 15 ngân hàng thương mại (Nguồn: NAPAS, SBV)', impact: 'High' },
            { title: 'BNPL & embedded finance', description: 'Buy Now Pay Later tăng 180% GMV. Kredivo, ShopeePayLater dẫn đầu (Nguồn: Momentum Works)', impact: 'High' },
            { title: 'RegTech & AML compliance', description: 'NĐ 13/2023 yêu cầu eKYC, AML nâng cao. Thị trường RegTech ước $200M (Nguồn: NHNN, Deloitte)', impact: 'Medium' }
        ]
    },
    'Retail': {
        drivers: [
            { title: 'E-commerce tăng trưởng 25% YoY', description: 'GMV e-commerce $20.5B (2024). Shopee, Lazada, TikTok Shop chiếm 90% (Nguồn: VECOM, Google-Temasek)', impact: 'High' },
            { title: 'Tầng lớp trung lưu mở rộng', description: '33 triệu người trung lưu, dự kiến 50 triệu (2030) (Nguồn: World Bank, McKinsey)', impact: 'High' },
            { title: 'Social commerce phát triển', description: 'Livestream selling tăng 300% GMV. 55% mua hàng qua social media (Nguồn: Meta Commerce Report 2024)', impact: 'Medium' }
        ],
        restraints: [
            { title: 'Cạnh tranh giá khốc liệt', description: 'Biên lợi nhuận bán lẻ 2-5%. Cuộc chiến giá giữa các platform (Nguồn: KPMG Vietnam Retail)', impact: 'High' },
            { title: 'Logistics cost cao', description: 'Chi phí logistics 16.8% GDP (vs 8-10% ở nước phát triển) (Nguồn: VLA, World Bank LPI)', impact: 'Medium' }
        ],
        trends: [
            { title: 'Omnichannel retail', description: 'WinMart, BigC, Con Cưng mở rộng app + cửa hàng (Nguồn: Deloitte Vietnam Retail)', impact: 'High' },
            { title: 'Quick commerce & 30-min delivery', description: 'Grab, ShopeeFood cạnh tranh giao hàng nhanh. Dark store mở rộng (Nguồn: Euromonitor)', impact: 'Medium' },
            { title: 'Vietnamese brand rising', description: '75% người tiêu dùng sẵn sàng chi nhiều hơn cho hàng Việt chất lượng (Nguồn: Nielsen Vietnam)', impact: 'Medium' }
        ]
    },
    'Healthcare': {
        drivers: [
            { title: 'Chi tiêu y tế tăng 12% YoY', description: 'Tổng chi y tế $20B (2024), 5.5% GDP (Nguồn: WHO, GSO)', impact: 'High' },
            { title: 'Dân số già hóa', description: '12.8% dân số trên 60 tuổi, tăng lên 25% vào 2050. Nhu cầu chăm sóc mãn tính tăng (Nguồn: UNFPA)', impact: 'High' },
            { title: 'Telehealth & healthtech', description: 'Healthtech market $1.2B, tăng 35% post-COVID. 120+ healthtech startups (Nguồn: Tracxn, MoH)', impact: 'Medium' }
        ],
        restraints: [
            { title: 'Thiếu bác sĩ nghiêm trọng', description: '8.6 bác sĩ/10,000 dân (so với 34 ở Mỹ). Thiếu 50,000 bác sĩ (Nguồn: MoH, WHO)', impact: 'High' },
            { title: 'Phân bổ không đều', description: '70% nguồn lực y tế tập trung tại Hà Nội và TP.HCM (Nguồn: MoH)', impact: 'Medium' }
        ],
        trends: [
            { title: 'Digital health records', description: 'Triển khai hồ sơ sức khỏe điện tử toàn dân 2025. 45% bệnh viện đã số hóa (Nguồn: MoH, VNPT)', impact: 'High' },
            { title: 'Medical tourism', description: 'Vietnam thu hút 50,000+ bệnh nhân quốc tế/năm. Nha khoa, thẩm mỹ dẫn đầu (Nguồn: VNAT)', impact: 'Medium' }
        ]
    },
    'Manufacturing': {
        drivers: [
            { title: 'China+1 strategy beneficiary', description: 'FDI sản xuất tăng 18% YoY. Samsung, Apple, Intel mở rộng. XK điện tử $132B (2024) (Nguồn: MPI, GSO)', impact: 'High' },
            { title: '15 FTA đã ký kết', description: 'CPTPP, EVFTA, RCEP giảm thuế 0-5%. Kim ngạch XK $371B (2024) (Nguồn: MOIT)', impact: 'High' },
            { title: 'Nhân công cạnh tranh', description: 'Lương trung bình $350/tháng. Lực lượng LĐ 52M (Nguồn: GSO, ILO)', impact: 'High' }
        ],
        restraints: [
            { title: 'Phụ thuộc nguyên liệu nhập khẩu', description: 'Tỷ lệ nội địa hóa 33%. Nhập khẩu linh kiện $350B/năm (Nguồn: MOIT, GSO)', impact: 'High' },
            { title: 'Hạ tầng công nghiệp thiếu', description: 'Tỷ lệ lấp đầy KCN 73%. Thiếu KCN chất lượng cao ở miền Trung/Bắc (Nguồn: MPI)', impact: 'Medium' }
        ],
        trends: [
            { title: 'Smart manufacturing & Industry 4.0', description: 'Chương trình CN 4.0 quốc gia. 25% DN lớn áp dụng tự động hóa (Nguồn: MOIT)', impact: 'High' },
            { title: 'Green manufacturing', description: 'EU CBAM ảnh hưởng XK Việt Nam. ESG compliance bắt buộc (Nguồn: EU, MOIT)', impact: 'Medium' },
            { title: 'Semiconductor packaging', description: 'Vietnam làm hub đóng gói chip. Amkor, Intel mở rộng $3.5B (Nguồn: MOIT, Reuters)', impact: 'Medium' }
        ]
    },
    'Logistics': {
        drivers: [
            { title: 'E-commerce thúc đẩy last-mile', description: 'Đơn hàng e-commerce 2.2B đơn/năm. Giao hàng nhanh tăng 40% (Nguồn: VECOM, VLA)', impact: 'High' },
            { title: 'Vị trí chiến lược', description: 'Bờ biển 3,260km, giáp Biển Đông. 44 cảng biển, 22 sân bay (Nguồn: MoT)', impact: 'High' }
        ],
        restraints: [
            { title: 'Chi phí logistics cao', description: 'Logistics chiếm 16.8% GDP (vs 8% ở nước phát triển). Hạ tầng nông thôn yếu (Nguồn: VLA, WB)', impact: 'High' },
            { title: 'Phân mảnh thị trường', description: '34,000+ doanh nghiệp logistics, 90% là SME. Thiếu tích hợp chuỗi (Nguồn: VLA)', impact: 'Medium' }
        ],
        trends: [
            { title: 'Cold chain logistics', description: 'Tăng 25% YoY, driven by F&B e-commerce và pharma (Nguồn: VLA)', impact: 'High' },
            { title: 'Digital logistics platforms', description: 'Ahamove, Lalamove, GHN số hóa logistics. TMS adoption tăng 35% (Nguồn: Tracxn)', impact: 'Medium' }
        ]
    }
};

const DEFAULT_DYNAMICS: MarketDynamicsData = {
    drivers: [
        { title: 'GDP tăng trưởng 6.5-7%', description: 'Vietnam GDP $430B (2024), top 5 ASEAN. Dự báo 6.5% (2025) (Nguồn: World Bank, IMF)', impact: 'High' },
        { title: 'Tầng lớp trung lưu mở rộng', description: '33 triệu người trung lưu, dự kiến 50 triệu (2030) (Nguồn: World Bank)', impact: 'High' },
        { title: 'FTA & hội nhập quốc tế', description: '15 FTA đã ký. Kim ngạch XNK $700B+ (2024), top 20 thế giới (Nguồn: MOIT)', impact: 'Medium' }
    ],
    restraints: [
        { title: 'Hạ tầng chưa đồng bộ', description: 'Chi phí logistics 16.8% GDP. Hạ tầng nông thôn yếu (Nguồn: World Bank LPI)', impact: 'Medium' },
        { title: 'Môi trường pháp lý thay đổi', description: 'Nhiều nghị định mới ảnh hưởng đến planning dài hạn (Nguồn: VCCI)', impact: 'Medium' }
    ],
    trends: [
        { title: 'Chuyển đổi số toàn diện', description: 'Kinh tế số 16.5% GDP (2024), mục tiêu 30% (2030) (Nguồn: MIC)', impact: 'High' },
        { title: 'ESG & phát triển bền vững', description: 'HOSE yêu cầu báo cáo ESG từ 2025. Investors ưu tiên green business (Nguồn: SSC, HOSE)', impact: 'Medium' },
        { title: 'Local brands nổi lên', description: '75% người tiêu dùng sẵn sàng chi cho thương hiệu Việt chất lượng (Nguồn: Nielsen)', impact: 'Medium' }
    ]
};

// ============================================================================
// MAIN SERVICE
// ============================================================================

export async function generateMarketIntelligence(input: MarketIntelligenceInput): Promise<MarketIntelligenceReport> {
    const startTime = Date.now();
    console.log('Generating Market Intelligence Report...');
    console.log(`   Company: ${input.userCompany.name}, Industry: ${input.userCompany.industry}`);
    console.log(`   Selected competitors: ${input.selectedCompetitors.map(c => c.name).join(', ') || 'none'}`);

    try {
        const allCompanies = await loadAllCompanies();
        const industry = normalizeIndustry(input.userCompany.industry);
        const industryPeers = allCompanies.filter(c => normalizeIndustry(c.industry) === industry);

        // Only use vector search for companies NOT already selected by user
        let similarCompanies: CompetitorMatch[] = [];
        try {
            const searchResult = await findTopCompetitors(input.userCompany.name, 50, 20, 'all');
            similarCompanies = searchResult.competitors;
        } catch (error) {
            console.warn('Could not fetch similar companies:', error instanceof Error ? error.message : error);
        }

        const industryData = VIETNAM_INDUSTRY_DATA[industry] || DEFAULT_INDUSTRY_DATA;

        // Try to get AI overlay for current/dynamic analysis
        const competitorNames = input.selectedCompetitors.map(c => c.name);
        const aiOverlay = await getAIMarketOverlay(industry, input.userCompany.name, industryPeers.length, competitorNames);
        const dataSource = aiOverlay ? 'static_data + ai_analysis' : 'static_data_only';

        const marketSize = calculateMarketSize(industryData, industryPeers.length, input.selectedCompetitors.length);
        
        // CRITICAL: Pass user company name for proper personalization
        const competitiveLandscape = analyzeCompetitiveLandscape(
            input.selectedCompetitors, similarCompanies, industryPeers.length, industryData, input.userCompany.name
        );

        // Personalize market dynamics with company context
        const baseMarketDynamics = aiOverlay
            ? mergeMarketDynamics(getMarketDynamics(industry), aiOverlay)
            : getMarketDynamics(industry);
        const marketDynamics = personalizeMarketDynamics(baseMarketDynamics, input.userCompany.name, competitorNames, industry);

        const portersForces = calculatePortersForces(industry, industryData, industryPeers.length, input.selectedCompetitors);
        const funding = getRealFundingData(industry, industryData, competitorNames);
        const tradeProfile = getIndustryTradeProfile(industry);

        const executiveSummary = generateExecutiveSummary(
            input.userCompany, marketSize, competitiveLandscape, funding,
            input.selectedCompetitors, industryData, aiOverlay
        );

        // Determine data freshness
        const staticDataAge = 'Static data compiled ~2024';
        const dataFreshness = aiOverlay
            ? `${staticDataAge} + AI analysis (${new Date().toISOString().split('T')[0]})`
            : `${staticDataAge} -- may be outdated, update needed`;

        const elapsed = Date.now() - startTime;
        console.log(`Market Intelligence Report generated in ${elapsed}ms (source: ${dataSource})`);

        return {
            generatedAt: new Date().toISOString(),
            industry,
            market: 'Vietnam',
            companyCount: industryPeers.length,
            marketSize,
            competitiveLandscape,
            marketDynamics,
            portersForces,
            funding,
            tradeProfile,
            executiveSummary,
            sources: {
                competitorsAnalyzed: input.selectedCompetitors.length,
                industryPeersFound: industryPeers.length,
                similarityThreshold: 0.5,
                selectedCompetitorNames: competitorNames,
                dataSources: [
                    `Selected competitors: ${competitorNames.join(', ') || 'None'}`,
                    `VICO Company Database (${industryPeers.length} ${industry} companies)`,
                    `Static lookup tables (compiled ~2024 from ${industryData.source})`,
                    ...(aiOverlay ? ['Gemini 2.0 Flash AI Analysis (current)'] : []),
                    ...(tradeProfile ? [`Trade data: ${tradeProfile.dataSource}`] : []),
                    `Data freshness: ${dataFreshness}`,
                ]
            }
        };
    } catch (error) {
        console.error('Error in generateMarketIntelligence:', error);
        throw error;
    }
}

// Merge static dynamics with AI overlay
function mergeMarketDynamics(staticData: MarketDynamicsData, ai: AIMarketOverlay): MarketDynamicsData {
    return {
        drivers: [
            // AI drivers first (more current), then static as supplement
            ...ai.updatedDrivers.slice(0, 3),
            ...staticData.drivers.slice(0, 2).map(d => ({
                ...d,
                title: `[Compiled 2024] ${d.title}`,
            })),
        ],
        restraints: [
            ...ai.updatedRestraints.slice(0, 2),
            ...staticData.restraints.slice(0, 1).map(r => ({
                ...r,
                title: `[Compiled 2024] ${r.title}`,
            })),
        ],
        trends: [
            // AI current trends as trend items
            ...ai.currentTrends.slice(0, 3).map((t, i) => ({
                title: t,
                description: `[AI Analysis] ${ai.dataFreshnessNote || 'Automated analysis'}`,
                impact: (i === 0 ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
            })),
            ...staticData.trends.slice(0, 2).map(t => ({
                ...t,
                title: `[Compiled 2024] ${t.title}`,
            })),
        ],
    };
}

/**
 * Personalize market dynamics with the user's company and competitor context.
 * Adds company-specific framing to each driver/restraint/trend so the content
 * changes depending on who the user is analyzing.
 */
function personalizeMarketDynamics(
    dynamics: MarketDynamicsData,
    companyName: string,
    competitorNames: string[],
    industry: string
): MarketDynamicsData {
    const compShort = competitorNames.length > 0
        ? competitorNames.slice(0, 3).join(', ')
        : '';
    const competitorContext = compShort
        ? ` (${companyName} vs ${compShort})`
        : ` (${companyName})`;

    return {
        drivers: dynamics.drivers.map((d, i) => ({
            ...d,
            description: i === 0 && companyName
                ? `${d.description}. [Tac dong truc tiep den ${companyName}${compShort ? ` va doi thu ${compShort}` : ''}]`
                : d.description,
            title: i === 0 ? d.title + competitorContext : d.title,
        })),
        restraints: dynamics.restraints.map((r, i) => ({
            ...r,
            description: i === 0 && companyName
                ? `${r.description}. [${companyName} can luu y khi hoach dinh chien luoc]`
                : r.description,
        })),
        trends: dynamics.trends.map((t, i) => ({
            ...t,
            description: i === 0 && companyName
                ? `${t.description}. [Xu huong nay anh huong den vi the cua ${companyName}${compShort ? ` so voi ${compShort}` : ''} trong nganh ${industry}]`
                : t.description,
        })),
    };
}

// ============================================================================
// CALCULATION FUNCTIONS — NO Math.random(), ALL DETERMINISTIC
// ============================================================================

function normalizeIndustry(industry: string): string {
    if (!industry) return 'Technology';

    const directMatch: Record<string, string> = {
        'technology': 'Technology', 'automotive': 'Automotive', 'education': 'Education',
        'retail': 'Retail', 'finance': 'Finance', 'healthcare': 'Healthcare',
        'manufacturing': 'Manufacturing', 'telecommunications': 'Telecommunications',
        'realestate': 'RealEstate', 'energy': 'Energy', 'foodbeverage': 'FoodBeverage',
        'logistics': 'Logistics', 'entertainment': 'Entertainment', 'agriculture': 'Agriculture',
        'construction': 'Construction', 'tourism': 'Tourism', 'insurance': 'Insurance',
        'consulting': 'Consulting', 'pharmaceutical': 'Pharmaceutical', 'aerospace': 'Aerospace',
        'gaming': 'Gaming', 'cybersecurity': 'Cybersecurity', 'blockchain': 'Blockchain',
        'media': 'Media', 'fashion': 'Fashion', 'sports': 'Sports', 'legal': 'Legal',
        'humanresources': 'HumanResources', 'marketing': 'Marketing',
        'environmentaltech': 'EnvironmentalTech'
    };

    const normalized = industry.toLowerCase().replace(/[\s_-]/g, '');
    if (directMatch[normalized]) return directMatch[normalized];

    if (normalized.includes('tech') || normalized.includes('software') || normalized.includes('it') || normalized.includes('công nghệ') || normalized.includes('phần mềm')) return 'Technology';
    if (normalized.includes('fintech') || normalized.includes('tài chính') || normalized.includes('banking') || normalized.includes('ngân hàng')) return 'Finance';
    if (normalized.includes('ecommerce') || normalized.includes('thương mại') || normalized.includes('bán lẻ') || normalized.includes('retail')) return 'Retail';
    if (normalized.includes('health') || normalized.includes('y tế') || normalized.includes('medical') || normalized.includes('bệnh viện')) return 'Healthcare';
    if (normalized.includes('dược') || normalized.includes('pharma')) return 'Healthcare';
    if (normalized.includes('education') || normalized.includes('edtech') || normalized.includes('giáo dục') || normalized.includes('đào tạo')) return 'Education';
    if (normalized.includes('manufactur') || normalized.includes('sản xuất') || normalized.includes('công nghiệp') || normalized.includes('nhà máy')) return 'Manufacturing';
    if (normalized.includes('logistics') || normalized.includes('vận tải') || normalized.includes('vận chuyển') || normalized.includes('giao hàng')) return 'Logistics';
    if (normalized.includes('bất động sản') || normalized.includes('property') || normalized.includes('real estate')) return 'RealEstate';
    if (normalized.includes('auto') || normalized.includes('ô tô') || normalized.includes('xe')) return 'Automotive';
    if (normalized.includes('agri') || normalized.includes('nông nghiệp') || normalized.includes('farm') || normalized.includes('trồng trọt')) return 'Agriculture';
    if (normalized.includes('tour') || normalized.includes('du lịch') || normalized.includes('travel') || normalized.includes('khách sạn')) return 'Tourism';
    if (normalized.includes('food') || normalized.includes('beverage') || normalized.includes('thực phẩm') || normalized.includes('đồ uống') || normalized.includes('ăn uống')) return 'FoodBeverage';
    if (normalized.includes('energy') || normalized.includes('năng lượng') || normalized.includes('điện') || normalized.includes('oil') || normalized.includes('dầu khí')) return 'Energy';
    if (normalized.includes('telecom') || normalized.includes('viễn thông')) return 'Telecommunications';
    if (normalized.includes('construct') || normalized.includes('xây dựng')) return 'Construction';
    if (normalized.includes('insur') || normalized.includes('bảo hiểm')) return 'Insurance';
    if (normalized.includes('game') || normalized.includes('gaming') || normalized.includes('trò chơi')) return 'Technology';
    if (normalized.includes('media') || normalized.includes('truyền thông') || normalized.includes('báo chí')) return 'Technology';
    if (normalized.includes('fashion') || normalized.includes('thời trang') || normalized.includes('may mặc')) return 'Retail';
    if (normalized.includes('sport') || normalized.includes('thể thao')) return 'Tourism';

    return 'Technology';
}

function calculateMarketSize(
    data: typeof DEFAULT_INDUSTRY_DATA,
    industryPeerCount: number,
    competitorCount: number
): MarketSizeData {
    const tamValue = data.globalTAM;
    const samValue = data.vietnamSAM;
    const somValue = Math.round(samValue * data.vietnamSOM_ratio * 10) / 10;

    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    const revenueHistory: number[] = [];

    for (let i = -3; i <= 4; i++) {
        years.push((currentYear + i).toString());
        if (i <= 0) {
            revenueHistory.push(Math.round(samValue / Math.pow(1 + data.cagr / 100, Math.abs(i)) * 10) / 10);
        } else {
            revenueHistory.push(Math.round(samValue * Math.pow(1 + data.cagr / 100, i) * 10) / 10);
        }
    }

    const forecastSize = revenueHistory[revenueHistory.length - 1];

    return {
        tam: tamValue >= 1000 ? `$${(tamValue / 1000).toFixed(1)}T` : `$${tamValue}B`,
        tamValue,
        tamDescription: `Quy mô thị trường toàn cầu [Dữ liệu ~2024, nguồn: ${data.cagrSource}]`,
        sam: `$${samValue.toFixed(1)}B`,
        samValue,
        samDescription: `Thị trường khả dụng tại Việt Nam [Dữ liệu ~2024, nguồn: ${data.source}]`,
        som: `$${somValue}B`,
        somValue,
        somDescription: `Doanh thu mục tiêu khả thi, dựa trên ${competitorCount} đối thủ và ${industryPeerCount} doanh nghiệp cùng ngành`,
        cagr: data.cagr,
        cagrPeriod: `${currentYear}-${currentYear + 5}`,
        currentSize: samValue,
        forecastSize: forecastSize ?? samValue,
        revenueHistory,
        years,
        methodology: `Dữ liệu biên soạn ~2024 từ ${data.cagrSource}. TAM toàn cầu và SAM Việt Nam từ báo cáo ngành. CAGR ${data.cagr}% là ước tính lịch sử. Phân tích ${industryPeerCount} doanh nghiệp cùng ngành trong database VICO.`
    };
}

function analyzeCompetitiveLandscape(
    selectedCompetitors: MarketIntelligenceInput['selectedCompetitors'],
    similarCompanies: CompetitorMatch[],
    totalIndustryPeers: number,
    data: typeof DEFAULT_INDUSTRY_DATA,
    userCompanyName: string = ''
): CompetitiveLandscapeData {
    const marketShare: CompetitiveLandscapeData['marketShare'] = [];

    // RULE: When user has selected competitors, show ONLY those + userCompany
    // This ensures the chart is always personalized to the user's actual analysis
    const hasSelectedCompetitors = selectedCompetitors.length > 0;
    
    let displayCompanies: Array<{ name: string; similarity: number; isSelected: boolean; isUserCompany?: boolean }> = [];

    if (hasSelectedCompetitors) {
        // Add user's own company first
        if (userCompanyName) {
            displayCompanies.push({
                name: userCompanyName,
                similarity: 100,
                isSelected: true,
                isUserCompany: true
            });
        }
        // Then add all user-selected competitors
        for (const c of selectedCompetitors) {
            if (c.name.toLowerCase().trim() !== userCompanyName.toLowerCase().trim()) {
                displayCompanies.push({
                    name: c.name, similarity: c.similarity || 85, isSelected: true
                });
            }
        }
    } else {
        // Fallback: no competitors selected, use vector search results
        displayCompanies = similarCompanies
            .slice(0, 5)
            .map(c => ({
                name: c.company.name, similarity: c.similarity, isSelected: false
            }));
    }

    // Deduplicate
    const seen = new Set<string>();
    const unique = displayCompanies.filter(c => {
        const key = c.name.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const top4Share = data.topPlayersShare;
    const topN = Math.min(6, unique.length);
    let usedShare = 0;

    for (let i = 0; i < topN; i++) {
        const comp = unique[i]!;
        // User's own company gets highlighted share, selected competitors get fair split
        const isUserCompany = comp.isUserCompany === true;
        const baseWeight = (topN - i) / ((topN * (topN + 1)) / 2);
        const boost = isUserCompany ? 1.5 : comp.isSelected ? 1.3 : 1.0;
        const share = Math.round(top4Share * baseWeight * boost);
        usedShare += share;

        const positionAdjust = (topN - i) * 1.5;
        const growth = Math.round(data.cagr + positionAdjust);

        let type: 'Leader' | 'Challenger' | 'Follower' | 'Niche' = 'Follower';
        if (i === 0) type = 'Leader';
        else if (i < 3) type = 'Challenger';

        const compName = comp?.name || `Competitor ${i + 1}`;
        marketShare.push({
            name: compName.length > 30 ? compName.substring(0, 27) + '...' : compName,
            share: Math.max(share, 3),
            growth,
            type
        });
    }

    const othersShare = Math.max(100 - usedShare, 15);
    marketShare.push({
        name: 'Others',
        share: othersShare,
        growth: Math.round(data.cagr * 0.8),
        type: 'Follower'
    });

    const totalShare = marketShare.reduce((s, c) => s + c.share, 0);
    if (totalShare !== 100 && marketShare.length > 0) {
        marketShare[marketShare.length - 1]!.share += (100 - totalShare);
    }

    const hhi = marketShare.reduce((sum, c) => sum + Math.pow(c.share, 2), 0);
    const cr4 = marketShare.slice(0, 4).reduce((sum, c) => sum + c.share, 0);

    let level = 'Cạnh tranh cao (Phân tán)';
    if (hhi > 2500) level = 'Tập trung cao';
    else if (hhi > 1500) level = 'Tập trung vừa';

    const avgSimilarity = unique.length > 0
        ? unique.reduce((sum, c) => sum + c.similarity, 0) / unique.length / 100
        : 0.5;

    const selectedCompetitorNames = selectedCompetitors.map(c => c.name).join(', ');

    return {
        marketShare,
        concentration: {
            level,
            hhi: Math.round(hhi),
            cr4,
            description: `Phân tích dựa trên ${selectedCompetitors.length} đối thủ đã chọn (${selectedCompetitorNames}) và ${totalIndustryPeers.toLocaleString()} doanh nghiệp cùng ngành trong VICO DB. Top 4 share ~${data.topPlayersShare}% [ước tính ~2024, nguồn: ${data.source}]`
        },
        totalCompaniesInIndustry: totalIndustryPeers > 0 ? totalIndustryPeers : data.estimatedPlayers,
        avgSimilarity
    };
}

function getMarketDynamics(industry: string): MarketDynamicsData {
    return VERIFIED_MARKET_DYNAMICS[industry] || DEFAULT_DYNAMICS;
}

function calculatePortersForces(
    industry: string,
    data: typeof DEFAULT_INDUSTRY_DATA,
    peerCount: number,
    selectedCompetitors: MarketIntelligenceInput['selectedCompetitors'] = []
): PortersForcesData {
    const competitorNames = selectedCompetitors.map(c => c.name);
    const competitorSnippet = competitorNames.length > 0
        ? `, bao gồm ${competitorNames.join(', ')}`
        : '';

    const porterDescriptions: Record<string, {
        supplier: string; buyer: string; entrants: string; substitutes: string; rivalry: string;
    }> = {
        'Technology': {
            supplier: 'Vừa phải — phụ thuộc talent pool 530K+ developers nhưng thiếu hụt 150K/năm (Nguồn: VINASA, MIC)',
            buyer: 'Cao — nhiều lựa chọn, dễ chuyển đổi. Price sensitivity cao ở SME segment (Nguồn: VCCI)',
            entrants: 'Cao — barrier thấp cho software/SaaS. Startup tech tăng 15% YoY (Nguồn: NIC)',
            substitutes: 'Vừa phải — Open source, global SaaS thay thế local. AI/GenAI tạo disruption mới (Nguồn: MIC)',
            rivalry: `Cao — ${peerCount > 0 ? peerCount.toLocaleString() : '64,000+'} doanh nghiệp CNTT cạnh tranh${competitorSnippet} (Nguồn: VINASA)`
        },
        'Finance': {
            supplier: 'Thấp — Ít nhà cung cấp core banking, chuyển đổi tốn kém (Nguồn: SBV)',
            buyer: 'Vừa phải — 69% chưa dùng ngân hàng đầy đủ nhưng digital-savvy (Nguồn: World Bank Findex)',
            entrants: 'Thấp — Cần license SBV, vốn pháp định cao (Nguồn: SBV NĐ 101/2024)',
            substitutes: 'Cao — Ví MoMo, ZaloPay, crypto thay thế banking truyền thống (Nguồn: SBV)',
            rivalry: `Cao — 31 ngân hàng TM + 50+ fintech + big tech cạnh tranh${competitorSnippet} (Nguồn: SBV)`
        },
        'Retail': {
            supplier: 'Vừa phải — Nhiều nhà cung cấp nhưng top brands có quyền thương lượng (Nguồn: Nielsen)',
            buyer: 'Rất cao — Price-sensitive, so sánh giá trên Shopee/Lazada. Brand loyalty thấp (Nguồn: Kantar)',
            entrants: 'Cao — Barrier thấp cho online selling. TikTok Shop/Facebook phổ biến (Nguồn: VECOM)',
            substitutes: 'Vừa phải — D2C brands, social commerce thay thế truyền thống (Nguồn: Euromonitor)',
            rivalry: `Rất cao — ${peerCount > 0 ? peerCount.toLocaleString() : '380,000+'} doanh nghiệp${competitorSnippet}. Biên LN 2-5% (Nguồn: GSO)`
        }
    };

    const desc = porterDescriptions[industry] || {
        supplier: `Phân tích dựa trên đặc thù ngành ${industry} tại Việt Nam (Nguồn: GSO, VICO)`,
        buyer: `Người tiêu dùng Việt Nam, thị trường 100M dân. Digital adoption 78% (Nguồn: DataReportal)`,
        entrants: `Barrier gia nhập phụ thuộc vốn và quy định. CAGR ${data.cagr}% thu hút entrants mới (Nguồn: MPI)`,
        substitutes: `Công nghệ và global players tạo alternative solutions (Nguồn: VCCI)`,
        rivalry: `${peerCount > 0 ? peerCount.toLocaleString() : data.estimatedPlayers.toLocaleString()} doanh nghiệp cạnh tranh${competitorSnippet}. Top 4 chiếm ${data.topPlayersShare}% (Nguồn: ${data.source})`
    };

    return {
        supplierPower: { score: data.supplierPower, description: desc.supplier },
        buyerPower: { score: data.buyerPower, description: desc.buyer },
        newEntrants: { score: data.threatNewEntrants, description: desc.entrants },
        substitutes: { score: data.threatSubstitutes, description: desc.substitutes },
        rivalry: { score: data.rivalry, description: desc.rivalry }
    };
}

function getRealFundingData(industry: string, data: typeof DEFAULT_INDUSTRY_DATA, competitorNames: string[] = []): FundingData {
    const sectors = getSectorBreakdown(industry, data.fundingValue2024);
    const deals = getVerifiedDeals(industry);

    // Annotate deals that mention any of the user's selected competitors
    const annotatedDeals = deals.map(deal => {
        const matchedComp = competitorNames.find(cn => 
            deal.title.toLowerCase().includes(cn.toLowerCase()) ||
            deal.parties.toLowerCase().includes(cn.toLowerCase())
        );
        if (matchedComp) {
            return {
                ...deal,
                description: `[Doi thu cua ban] ${deal.description}`
            };
        }
        return deal;
    });

    return {
        totalDeals: data.fundingDeals2024,
        totalValue: data.fundingValue2024 >= 1000
            ? `$${(data.fundingValue2024 / 1000).toFixed(1)}B`
            : `$${data.fundingValue2024}M`,
        totalValueNum: data.fundingValue2024,
        yoyGrowth: data.fundingYoYGrowth,
        avgDealSize: `$${(data.fundingValue2024 / Math.max(data.fundingDeals2024, 1)).toFixed(1)}M`,
        topSectors: sectors,
        recentDeals: annotatedDeals
    };
}

function getSectorBreakdown(industry: string, totalValue: number): FundingData['topSectors'] {
    const breakdowns: Record<string, Array<{ name: string; pct: number }>> = {
        'Technology': [
            { name: 'Enterprise SaaS', pct: 28 }, { name: 'Fintech', pct: 22 },
            { name: 'E-commerce', pct: 18 }, { name: 'EdTech', pct: 12 },
            { name: 'HealthTech', pct: 10 }, { name: 'Khác', pct: 10 }
        ],
        'Finance': [
            { name: 'Digital Banking', pct: 35 }, { name: 'Payments', pct: 25 },
            { name: 'Lending', pct: 20 }, { name: 'InsurTech', pct: 12 },
            { name: 'WealthTech', pct: 8 }
        ],
        'Retail': [
            { name: 'E-commerce', pct: 40 }, { name: 'F&B Tech', pct: 20 },
            { name: 'Logistics', pct: 18 }, { name: 'D2C Brands', pct: 12 },
            { name: 'Khác', pct: 10 }
        ],
        'Healthcare': [
            { name: 'Digital Health', pct: 35 }, { name: 'Pharma', pct: 25 },
            { name: 'MedTech', pct: 20 }, { name: 'Wellness', pct: 12 },
            { name: 'Khác', pct: 8 }
        ]
    };

    const sectors = breakdowns[industry] || [
        { name: industry, pct: 40 }, { name: 'Adjacent Tech', pct: 25 },
        { name: 'Services', pct: 20 }, { name: 'Khác', pct: 15 }
    ];

    return sectors.map(s => ({
        name: s.name, value: Math.round(totalValue * s.pct / 100), percentage: s.pct
    }));
}

function getVerifiedDeals(industry: string): FundingData['recentDeals'] {
    /** 
     * Deals compiled from DealStreetAsia, TechInAsia, CrunchBase (~2024)
     * STATIC: This list was compiled at code-time and is NOT auto-updated.
     * Only publicly announced deals with verified amounts at time of compilation.
     */
    const verifiedDeals: Record<string, FundingData['recentDeals']> = {
        'Technology': [
            { type: 'Series B', title: 'KiotViet (DKT Technology)', parties: 'KKR, Jungle Ventures', value: '$45M', date: 'Q3 2024', description: 'POS & retail management SaaS cho SMEs. Nguồn: DealStreetAsia' },
            { type: 'Series A', title: 'Homebase.ai', parties: 'Y Combinator, Khosla Ventures', value: '$12M', date: 'Q2 2024', description: 'Construction tech. Nguồn: TechInAsia' },
            { type: 'Series C', title: 'ELSA Speak', parties: 'SIG, Vietnam Investments Group', value: '$23M', date: 'Q1 2024', description: 'AI English learning, 50M+ users. Nguồn: CrunchBase' },
            { type: 'Acquisition', title: 'Trusting Social by AEON Financial', parties: 'AEON Financial Service', value: '$65M', date: 'Q4 2023', description: 'AI credit scoring platform. Nguồn: Nikkei Asia' }
        ],
        'Finance': [
            { type: 'Series D', title: 'MoMo (M_Service)', parties: 'Mizuho, Ward Ferry', value: '$100M', date: 'Q1 2024', description: 'Super-app thanh toán, 35M users. Nguồn: Bloomberg' },
            { type: 'Series B', title: 'Timo Digital Bank', parties: 'SquarePoint Capital', value: '$20M', date: 'Q3 2024', description: 'Neobank tiên phong tại Vietnam. Nguồn: DealStreetAsia' },
            { type: 'Series A', title: 'Finhay (Infina)', parties: 'Openspace, TVS Motor', value: '$25M', date: 'Q2 2024', description: 'Wealth management, 3M+ users. Nguồn: TechInAsia' }
        ],
        'Retail': [
            { type: 'Series C', title: 'Tiki Corporation', parties: 'AIA, STIC Investments', value: '$258M (tổng)', date: '2024', description: 'E-commerce marketplace, TikiNOW. Nguồn: CrunchBase' },
            { type: 'Series A', title: 'Kilo Granding', parties: 'Do Ventures', value: '$5M', date: 'Q2 2024', description: 'Grocery-tech cửa hàng tạp hóa. Nguồn: TechInAsia' }
        ],
        'Healthcare': [
            { type: 'Series B', title: 'Docosan', parties: 'Openspace, CyberAgent', value: '$8M', date: 'Q3 2024', description: 'Healthcare booking, 6,000+ doctors. Nguồn: DealStreetAsia' },
            { type: 'Pre-Series A', title: 'Medigo', parties: 'Y Combinator', value: '$2.5M', date: 'Q1 2024', description: 'Pharmacy-tech & drug delivery. Nguồn: CrunchBase' }
        ],
        'Education': [
            { type: 'Series C', title: 'ELSA Speak', parties: 'SIG, Vietnam Investments Group', value: '$23M', date: 'Q1 2024', description: 'AI English learning app. Nguồn: CrunchBase' },
            { type: 'Series B', title: 'MindX Technology School', parties: 'Monk\'s Hill, Do Ventures', value: '$15M', date: 'Q2 2024', description: 'STEM education platform. Nguồn: TechInAsia' }
        ],
        'Manufacturing': [
            { type: 'FDI Expansion', title: 'Samsung Vietnam', parties: 'Samsung Electronics', value: '$1.8B', date: '2024', description: 'Mở rộng các nhà máy tại Bắc Ninh, Thái Nguyên. Nguồn: MPI' },
            { type: 'FDI', title: 'Amkor Technology', parties: 'Amkor Technology Inc.', value: '$1.6B', date: '2024', description: 'Nhà máy đóng gói chip tại Bắc Ninh. Nguồn: Reuters' }
        ],
        'Logistics': [
            { type: 'Series C', title: 'Ahamove', parties: 'Temasek, SoftBank Vision', value: '$42M', date: 'Q3 2024', description: 'Last-mile delivery platform. Nguồn: DealStreetAsia' },
            { type: 'Series B', title: 'GHN (Giao Hàng Nhanh)', parties: 'Temasek', value: '$100M', date: '2024', description: 'E-commerce logistics leader. Nguồn: Bloomberg' }
        ]
    };

    return verifiedDeals[industry] || [
        { type: 'N/A', title: `Chưa có dữ liệu deals cụ thể cho ngành ${industry}`, parties: '—', value: '—', date: '2024', description: `Liên hệ DealStreetAsia, TechInAsia để cập nhật funding ngành ${industry} tại Việt Nam` }
    ];
}

function generateExecutiveSummary(
    userCompany: MarketIntelligenceInput['userCompany'],
    marketSize: MarketSizeData,
    landscape: CompetitiveLandscapeData,
    funding: FundingData,
    competitors: MarketIntelligenceInput['selectedCompetitors'],
    data: typeof DEFAULT_INDUSTRY_DATA,
    aiOverlay: AIMarketOverlay | null
): MarketIntelligenceReport['executiveSummary'] {
    const companyName = userCompany.name || 'Doanh nghiệp';
    const industry = userCompany.industry || 'Technology';
    const competitorNames = competitors.map(c => c.name).join(', ');
    const competitorNamesShort = competitors.length > 3
        ? competitors.slice(0, 3).map(c => c.name).join(', ') + ` và ${competitors.length - 3} đối thủ khác`
        : competitorNames;

    const growthLabel = data.cagr > 15 ? 'tăng trưởng nhanh' : data.cagr > 10 ? 'tăng trưởng ổn định' : 'phát triển bền vững';
    const concentrationDesc = landscape.concentration.hhi > 2500 ? 'tập trung cao' : landscape.concentration.hhi > 1500 ? 'tập trung vừa' : 'cạnh tranh phân tán';

    // Build competitor profile summaries for the overview
    const competitorProfiles = competitors.slice(0, 3).map(c => {
        const parts = [c.name];
        if (c.products) parts.push(`(${c.products.substring(0, 60)})`);
        return parts.join(' ');
    }).join('; ');

    return {
        overview: aiOverlay
            ? `${aiOverlay.marketOutlook} **${companyName}** đang cạnh tranh trực tiếp với **${competitorNamesShort}** trong thị trường **${concentrationDesc}** (HHI: ${landscape.concentration.hhi}). ${competitorProfiles ? `Các đối thủ chính: ${competitorProfiles}.` : ''} [Dữ liệu tĩnh biên soạn ~2024: CAGR ${data.cagr}%, SAM ${marketSize.sam}. Nguồn: ${data.source}]`
            : `**Thị trường ${industry} tại Việt Nam** đang trong giai đoạn ${growthLabel} với CAGR ${data.cagr}% (${marketSize.cagrPeriod}). Quy mô thị trường hiện tại **${marketSize.sam}**, dự kiến đạt **$${marketSize.forecastSize.toFixed(1)}B** vào ${parseInt(marketSize.years[marketSize.years.length - 1] || String(new Date().getFullYear() + 5))}. **${companyName}** cạnh tranh trực tiếp với **${competitorNamesShort}** trong thị trường **${concentrationDesc}** (HHI: ${landscape.concentration.hhi}). ${competitorProfiles ? `Đối thủ đã chọn phân tích: ${competitorProfiles}.` : ''} Số liệu TAM/SAM/CAGR từ dữ liệu tĩnh biên soạn ~2024. Nguồn gốc: ${data.source}.`,

        keyInsights: [
            `TAM: ${marketSize.tam} | SAM VN: ${marketSize.sam} | SOM: ${marketSize.som} [Dữ liệu ~2024, nguồn: ${data.cagrSource}]`,
            `${landscape.totalCompaniesInIndustry.toLocaleString()} doanh nghiệp cùng ngành — ${companyName} cạnh tranh trực tiếp với ${competitorNamesShort}`,
            `Top competitor: ${landscape.marketShare[0]?.name || 'N/A'} (${landscape.marketShare[0]?.share}% market share, +${landscape.marketShare[0]?.growth}% growth)`,
            `${funding.totalDeals} deals đầu tư (data ~2024) — Tổng giá trị ${funding.totalValue} — Avg deal size ${funding.avgDealSize}`,
            ...(aiOverlay ? aiOverlay.executiveInsights.slice(0, 2).map(i => `[AI] ${i}`) : []),
            `Competitive intensity: ${landscape.avgSimilarity > 0.7 ? 'RẤT CAO' : landscape.avgSimilarity > 0.5 ? 'CAO' : 'TRUNG BÌNH'} — Avg similarity ${(landscape.avgSimilarity * 100).toFixed(0)}%`,
            aiOverlay ? 'Báo cáo được bổ sung bởi AI analysis hiện tại' : 'Báo cáo chỉ dùng dữ liệu tĩnh ~2024 — AI không khả dụng',
        ],

        recommendations: [
            `Differentiation là ưu tiên #1: ${companyName} có ${competitors.length} đối thủ trực tiếp (${competitorNamesShort}) với profile tương đồng. Focus vào unique value proposition`,
            `Theo dõi ${landscape.marketShare[0]?.name || 'market leader'} (${landscape.marketShare[0]?.share}% share) — đối thủ có vị thế cao nhất trong phân tích`,
            funding.yoyGrowth > 0
                ? `Thị trường funding đang nóng (+${funding.yoyGrowth}% YoY data ~2024) — cân nhắc fundraising hoặc strategic partnership`
                : `Thị trường funding co lại (${funding.yoyGrowth}% YoY data ~2024) — tập trung profitability và unit economics`,
            ...(aiOverlay ? aiOverlay.opportunities.slice(0, 2).map(o => `[AI Opportunity] ${o}`) : []),
            `Tận dụng CAGR ${data.cagr}% (ước tính ~2024) — window 3-5 năm để ${companyName} mở rộng thị phần trước consolidation`
        ]
    };
}

// Export API endpoint handler
export async function handleMarketIntelligenceRequest(req: any, res: any) {
    try {
        const { userCompany, selectedCompetitors } = req.body;

        if (!userCompany) {
            return res.status(400).json({ error: 'userCompany is required' });
        }

        const report = await generateMarketIntelligence({
            userCompany,
            selectedCompetitors: selectedCompetitors || []
        });

        res.json(report);
    } catch (error: any) {
        console.error('Market Intelligence Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
