/**
 * 🇻🇳 PESTEL Baseline Data for Vietnam
 *
 * Curated macro-environment factors for Vietnam across 6 PESTEL dimensions.
 * Each factor includes score (1-5), trend, evidence, and data source.
 *
 * Sources: GSO, World Bank, MPI, MIC, MONRE, MOLISA, legal databases
 * Data period: 2024-2025
 */

// ============================================================================
// TYPES
// ============================================================================

export type PESTELDimension = 'political' | 'economic' | 'social' | 'technological' | 'environmental' | 'legal';

export type TrendDirection = 'improving' | 'stable' | 'declining';

export interface PESTELFactor {
    id: string;
    dimension: PESTELDimension;
    title: string;
    titleVi: string;
    score: number;              // 1-5 (1=very unfavorable, 5=very favorable for business)
    trend: TrendDirection;
    evidence: string[];         // Specific data points / facts
    impact: 'High' | 'Medium' | 'Low';
    industryRelevance: string[];  // Which industries this particularly affects
    dataSource: string;
    lastVerified: string;
}

export interface PESTELDimensionSummary {
    dimension: PESTELDimension;
    label: string;
    labelVi: string;
    icon: string;
    overallScore: number;       // 1-5 average across factors
    overallTrend: TrendDirection;
    factors: PESTELFactor[];
    summary: string;            // One-line summary
}

export interface PESTELReport {
    country: string;
    generatedAt: string;
    industry?: string;
    company?: string;
    dimensions: PESTELDimensionSummary[];
    overallScore: number;       // 1-5 weighted average
    overallAssessment: string;
    dataProvenance: string[];
}

// ============================================================================
// STATIC PESTEL DATA FOR VIETNAM (2024-2025)
// ============================================================================

export const VIETNAM_PESTEL_FACTORS: PESTELFactor[] = [
    // ── POLITICAL ──────────────────────────────────────────────────────────
    {
        id: 'pol_stability',
        dimension: 'political',
        title: 'Political Stability',
        titleVi: 'Ổn định chính trị',
        score: 4,
        trend: 'stable',
        evidence: [
            'Single-party system ensures policy continuity',
            'Vietnam ranked 41st in Global Peace Index 2024',
            'Strong diplomatic relations with both US and China',
            'Active participant in ASEAN, APEC, UN',
        ],
        impact: 'High',
        industryRelevance: ['all'],
        dataSource: 'Global Peace Index 2024, DIHK AHK Business Survey',
        lastVerified: '2025-01',
    },
    {
        id: 'pol_trade_agreements',
        dimension: 'political',
        title: 'Free Trade Agreements',
        titleVi: 'Hiệp định thương mại tự do',
        score: 5,
        trend: 'improving',
        evidence: [
            'EVFTA (EU-Vietnam): in effect since Aug 2020, tariff elimination ongoing',
            'CPTPP: member since 2019, 11-nation Pacific trade bloc',
            'RCEP: largest trade bloc globally, effective Jan 2022',
            'Bilateral FTAs with Korea, Japan, UK, Israel',
            '16 FTAs total covering 60+ economies',
        ],
        impact: 'High',
        industryRelevance: ['Manufacturing', 'Retail', 'Agriculture', 'Technology', 'Logistics'],
        dataSource: 'Ministry of Industry and Trade (MoIT), WTO Vietnam Trade Profile',
        lastVerified: '2025-01',
    },
    {
        id: 'pol_fdi_policy',
        dimension: 'political',
        title: 'FDI Policy & Incentives',
        titleVi: 'Chính sách FDI & ưu đãi',
        score: 4,
        trend: 'improving',
        evidence: [
            'Tax holidays: 4-year CIT exemption + 50% reduction for 9 years in priority sectors',
            'Special economic zones with preferential rates',
            'Registered FDI reached $23.8B in 2024 (+7.2% YoY)',
            'Global minimum tax (15%) implementation from 2024',
            'Investment Law 2020 simplified procedures for foreign investors',
        ],
        impact: 'High',
        industryRelevance: ['Manufacturing', 'Technology', 'Healthcare', 'Energy'],
        dataSource: 'MPI (Ministry of Planning & Investment), FIA Vietnam FDI Report 2024',
        lastVerified: '2025-01',
    },
    {
        id: 'pol_corruption',
        dimension: 'political',
        title: 'Corruption & Governance',
        titleVi: 'Tham nhũng & quản trị',
        score: 3,
        trend: 'improving',
        evidence: [
            'CPI score: 41/100 (rank 83/180) — improving from 33 in 2018',
            'Anti-corruption campaign ("blazing furnace") intensified since 2022',
            'Several high-profile prosecutions of senior officials',
            'E-government initiatives reducing in-person bureaucratic interactions',
        ],
        impact: 'Medium',
        industryRelevance: ['all'],
        dataSource: 'Transparency International CPI 2024',
        lastVerified: '2025-01',
    },

    // ── ECONOMIC ───────────────────────────────────────────────────────────
    {
        id: 'eco_gdp_growth',
        dimension: 'economic',
        title: 'GDP Growth',
        titleVi: 'Tăng trưởng GDP',
        score: 5,
        trend: 'improving',
        evidence: [
            'GDP growth 7.09% in 2024 — highest in ASEAN',
            'GDP nominal: ~$465B (2024)',
            'IMF forecast: 6.5% growth for 2025',
            'Manufacturing PMI consistently above 50 (expansion)',
            'Target to become upper-middle income by 2030',
        ],
        impact: 'High',
        industryRelevance: ['all'],
        dataSource: 'GSO, IMF World Economic Outlook, World Bank',
        lastVerified: '2025-01',
    },
    {
        id: 'eco_inflation',
        dimension: 'economic',
        title: 'Inflation & Price Stability',
        titleVi: 'Lạm phát & ổn định giá',
        score: 4,
        trend: 'stable',
        evidence: [
            'CPI inflation: 3.63% in 2024 (within SBV target of <4.5%)',
            'SBV maintained accommodative monetary policy',
            'VND depreciation kept moderate (~3% vs USD in 2024)',
            'Food prices stable, energy prices managed',
        ],
        impact: 'High',
        industryRelevance: ['Finance', 'Retail', 'FoodBeverage', 'Manufacturing'],
        dataSource: 'GSO, SBV Monetary Policy Report 2024',
        lastVerified: '2025-01',
    },
    {
        id: 'eco_labor_cost',
        dimension: 'economic',
        title: 'Labor Cost Competitiveness',
        titleVi: 'Chi phí lao động cạnh tranh',
        score: 4,
        trend: 'declining',
        evidence: [
            'Minimum wage: VND 4.96M/month (Region I) — increased 6% in July 2024',
            'Average manufacturing wage: ~$350/month — still competitive vs China ($700+)',
            'Wage growth averaging 6-8% annually, eroding cost advantage',
            'High worker productivity relative to wage level',
        ],
        impact: 'High',
        industryRelevance: ['Manufacturing', 'Technology', 'Logistics', 'Retail'],
        dataSource: 'MOLISA, ILO Vietnam Labor Market Report 2024',
        lastVerified: '2025-01',
    },
    {
        id: 'eco_consumer_market',
        dimension: 'economic',
        title: 'Consumer Market Growth',
        titleVi: 'Tăng trưởng thị trường tiêu dùng',
        score: 5,
        trend: 'improving',
        evidence: [
            'Middle class: 35M+ people (growing 10%+ annually)',
            'Retail sales growth: 8.2% YoY in 2024',
            'E-commerce GMV: $22B (penetration 14%, growing rapidly)',
            'Per capita income: ~$4,650 (2024) — approaching upper-middle',
        ],
        impact: 'High',
        industryRelevance: ['Retail', 'FoodBeverage', 'Technology', 'Healthcare', 'Education'],
        dataSource: 'GSO, World Bank, VECOM E-commerce Report 2024',
        lastVerified: '2025-01',
    },

    // ── SOCIAL ─────────────────────────────────────────────────────────────
    {
        id: 'soc_demographics',
        dimension: 'social',
        title: 'Demographics & Young Population',
        titleVi: 'Nhân khẩu học & dân số trẻ',
        score: 4,
        trend: 'stable',
        evidence: [
            'Population: 100.3M (2024) — 3rd largest in Southeast Asia',
            'Median age: 32.5 years — younger than China (38.4) and Thailand (40.1)',
            '70% of population under 40',
            'Golden population structure (working age 66%)',
            'Fertility rate: 1.96 — near replacement level',
        ],
        impact: 'High',
        industryRelevance: ['all'],
        dataSource: 'GSO Population Census 2024, UN Population Division',
        lastVerified: '2025-01',
    },
    {
        id: 'soc_urbanization',
        dimension: 'social',
        title: 'Urbanization',
        titleVi: 'Đô thị hóa',
        score: 3,
        trend: 'improving',
        evidence: [
            'Urban population: 39.2% (2024) — lower than regional peers',
            'Urbanization rate accelerating: +1.5% per year',
            'HCMC metro area: 13M+, Hanoi metro: 8.5M+',
            'Tier-2 cities (Da Nang, Can Tho, Hai Phong) emerging as economic hubs',
        ],
        impact: 'Medium',
        industryRelevance: ['RealEstate', 'Construction', 'Retail', 'Logistics', 'Education'],
        dataSource: 'GSO, World Bank Urbanization Review Vietnam',
        lastVerified: '2025-01',
    },
    {
        id: 'soc_education_workforce',
        dimension: 'social',
        title: 'Education & Workforce Quality',
        titleVi: 'Chất lượng giáo dục & lao động',
        score: 3,
        trend: 'improving',
        evidence: [
            'Literacy rate: 97.5% — among highest in developing Asia',
            'PISA scores above OECD average in math/science',
            'STEM graduates: 200,000+/year',
            'Skills gap: shortage of mid-to-senior engineers and managers',
            'English proficiency: EF EPI rank 58/113 (moderate)',
        ],
        impact: 'High',
        industryRelevance: ['Technology', 'Manufacturing', 'Education', 'Healthcare'],
        dataSource: 'Ministry of Education & Training (MoET), OECD PISA 2022, EF EPI 2024',
        lastVerified: '2025-01',
    },
    {
        id: 'soc_digital_adoption',
        dimension: 'social',
        title: 'Digital & Mobile Adoption',
        titleVi: 'Ứng dụng số & di động',
        score: 5,
        trend: 'improving',
        evidence: [
            'Internet penetration: 79.1% (78M users)',
            'Smartphone penetration: 73.5%',
            'Social media users: 72M (Facebook #7 globally, TikTok top 10)',
            'Mobile payment users: 45M+ (MoMo, ZaloPay, VNPay)',
            'Average screen time: 6.5 hours/day',
        ],
        impact: 'High',
        industryRelevance: ['Technology', 'Retail', 'Finance', 'Media', 'Education'],
        dataSource: 'MIC Vietnam ICT White Book 2024, We Are Social Digital Report',
        lastVerified: '2025-01',
    },

    // ── TECHNOLOGICAL ──────────────────────────────────────────────────────
    {
        id: 'tech_infrastructure',
        dimension: 'technological',
        title: 'Digital Infrastructure',
        titleVi: 'Hạ tầng số',
        score: 4,
        trend: 'improving',
        evidence: [
            '5G deployment: commercial service launched 2024 (Viettel, VNPT, Mobifone)',
            'Fiber optic coverage: 75%+ of households',
            'Cloud adoption growing 25%+ YoY',
            '3 submarine cable systems; new AAE-1 and APG cables',
            '17 tech parks/IT zones nationwide',
        ],
        impact: 'High',
        industryRelevance: ['Technology', 'Telecommunications', 'Finance', 'Education'],
        dataSource: 'MIC, ITU ICT Development Index, Speedtest Global Index',
        lastVerified: '2025-01',
    },
    {
        id: 'tech_innovation',
        dimension: 'technological',
        title: 'Innovation & R&D',
        titleVi: 'Đổi mới sáng tạo & R&D',
        score: 3,
        trend: 'improving',
        evidence: [
            'GII ranking: 44th globally (2024) — top innovation economy at income level',
            'R&D spending: 0.53% of GDP (below 2% target)',
            'Patent filings growing 12% YoY',
            'National Innovation Center (NIC) established',
            'Samsung, Intel, Qualcomm expanding R&D centers in Vietnam',
        ],
        impact: 'High',
        industryRelevance: ['Technology', 'Manufacturing', 'Healthcare', 'Education'],
        dataSource: 'WIPO GII 2024, MoST Vietnam R&D Report',
        lastVerified: '2025-01',
    },
    {
        id: 'tech_ai_semiconductor',
        dimension: 'technological',
        title: 'AI & Semiconductor Strategy',
        titleVi: 'Chiến lược AI & bán dẫn',
        score: 3,
        trend: 'improving',
        evidence: [
            'National AI Strategy approved (Decision 127/QD-TTg)',
            'Semiconductor workforce target: 50,000 engineers by 2030',
            'Amkor, Intel, Samsung investing in chip packaging/testing',
            'NVIDIA partnership for AI infrastructure',
            'FPT, Viettel, VinAI developing domestic AI capabilities',
        ],
        impact: 'High',
        industryRelevance: ['Technology', 'Manufacturing', 'Education'],
        dataSource: 'MIC AI Strategy, MPI Semiconductor Plan',
        lastVerified: '2025-01',
    },

    // ── ENVIRONMENTAL ──────────────────────────────────────────────────────
    {
        id: 'env_climate_risk',
        dimension: 'environmental',
        title: 'Climate Change & Natural Hazards',
        titleVi: 'Biến đổi khí hậu & thiên tai',
        score: 2,
        trend: 'declining',
        evidence: [
            'Vietnam among top 10 most climate-vulnerable countries (Germanwatch CRI)',
            'Mekong Delta: 40% could be submerged by 2100',
            'Typhoon season: 6-8 major storms annually',
            'Annual flood damage: $1-2B estimated',
            'Temperature increase: +0.5°C in last 50 years',
        ],
        impact: 'High',
        industryRelevance: ['Agriculture', 'Construction', 'RealEstate', 'Insurance', 'Tourism'],
        dataSource: 'MONRE Climate Report, Germanwatch CRI 2024, World Bank CCDR',
        lastVerified: '2025-01',
    },
    {
        id: 'env_green_transition',
        dimension: 'environmental',
        title: 'Green Energy & Net Zero Commitment',
        titleVi: 'Năng lượng xanh & cam kết Net Zero',
        score: 3,
        trend: 'improving',
        evidence: [
            'Net zero by 2050 commitment (COP26)',
            'Power Development Plan VIII: renewables target 30-39% by 2030',
            'Solar capacity: 16.5 GW (among highest in ASEAN)',
            'JETP: $15.5B committed for energy transition',
            'Green bond market emerging ($1B+ issued)',
        ],
        impact: 'Medium',
        industryRelevance: ['Energy', 'Manufacturing', 'Construction', 'Finance'],
        dataSource: 'MOIT PDP VIII, UNDP Vietnam, COP26 pledges',
        lastVerified: '2025-01',
    },
    {
        id: 'env_esg_regulations',
        dimension: 'environmental',
        title: 'ESG & Sustainability Requirements',
        titleVi: 'Yêu cầu ESG & phát triển bền vững',
        score: 3,
        trend: 'improving',
        evidence: [
            'Circular 96/2020: mandatory ESG reporting for listed companies',
            'Extended Producer Responsibility (EPR) effective 2024',
            'Carbon market pilot: 2025, full market by 2028',
            'EU CBAM affecting Vietnamese steel, cement, aluminum exports',
            'Green taxonomy for banking sector under development',
        ],
        impact: 'Medium',
        industryRelevance: ['Manufacturing', 'Finance', 'Energy', 'Construction'],
        dataSource: 'SSC, SBV Green Banking Report, EU CBAM Regulation',
        lastVerified: '2025-01',
    },

    // ── LEGAL ──────────────────────────────────────────────────────────────
    {
        id: 'leg_business_environment',
        dimension: 'legal',
        title: 'Business Registration & Ease of Doing Business',
        titleVi: 'Đăng ký kinh doanh & môi trường kinh doanh',
        score: 3,
        trend: 'improving',
        evidence: [
            'Enterprise Law 2020: simplified registration (3 days online)',
            'Investment Law 2020: negative list approach for restricted sectors',
            'One-stop-shop administrative reform ongoing',
            'PCI Index improving year-over-year',
            'Still requires multiple licenses for many sectors',
        ],
        impact: 'High',
        industryRelevance: ['all'],
        dataSource: 'VCCI PCI Report 2024, World Bank B-READY',
        lastVerified: '2025-01',
    },
    {
        id: 'leg_data_protection',
        dimension: 'legal',
        title: 'Data Protection & Cybersecurity Law',
        titleVi: 'Bảo vệ dữ liệu & Luật An ninh mạng',
        score: 3,
        trend: 'stable',
        evidence: [
            'Decree 13/2023/ND-CP: Personal Data Protection (effective July 2023)',
            'Cybersecurity Law 2018: data localization requirements',
            'Cross-border data transfer: requires impact assessment',
            'No independent DPA yet — enforcement shared across MPS/MIC',
            'GDPR-like consent requirements introduced',
        ],
        impact: 'High',
        industryRelevance: ['Technology', 'Finance', 'Healthcare', 'Telecommunications'],
        dataSource: 'MPS, MIC, Decree 13/2023/ND-CP full text',
        lastVerified: '2025-01',
    },
    {
        id: 'leg_ip_protection',
        dimension: 'legal',
        title: 'Intellectual Property Protection',
        titleVi: 'Bảo vệ sở hữu trí tuệ',
        score: 3,
        trend: 'improving',
        evidence: [
            'IP Law amended 2022 (aligned with EVFTA, CPTPP requirements)',
            'USTR Priority Watch List (ongoing concern)',
            'Online IP enforcement improving but still weak',
            'Pharmaceutical patent linkage system introduced',
            'Vietnam joined Hague Agreement for design registration',
        ],
        impact: 'Medium',
        industryRelevance: ['Technology', 'Pharmaceutical', 'Manufacturing', 'Media'],
        dataSource: 'NOIP, USTR Special 301 Report 2024',
        lastVerified: '2025-01',
    },
    {
        id: 'leg_labor_law',
        dimension: 'legal',
        title: 'Labor Law & Employment Regulations',
        titleVi: 'Luật Lao động & quy định tuyển dụng',
        score: 3,
        trend: 'stable',
        evidence: [
            'Labor Code 2019: progressive provisions (reduced OT, expanded leave)',
            'Social insurance: mandatory 32% of salary (employer + employee)',
            'Foreign worker permit required (max 2-year term)',
            'Trade union membership encouraged but not mandatory',
            'New decree on flexible working arrangements post-COVID',
        ],
        impact: 'High',
        industryRelevance: ['all'],
        dataSource: 'MOLISA, Labor Code 2019 full text',
        lastVerified: '2025-01',
    },
];

// ============================================================================
// DIMENSION METADATA
// ============================================================================

export const PESTEL_DIMENSION_META: Record<PESTELDimension, { label: string; labelVi: string; icon: string; color: string }> = {
    political: { label: 'Political', labelVi: 'Chính trị', icon: '🏛️', color: '#6366f1' },
    economic: { label: 'Economic', labelVi: 'Kinh tế', icon: '💰', color: '#22c55e' },
    social: { label: 'Social', labelVi: 'Xã hội', icon: '👥', color: '#f59e0b' },
    technological: { label: 'Technological', labelVi: 'Công nghệ', icon: '🔬', color: '#3b82f6' },
    environmental: { label: 'Environmental', labelVi: 'Môi trường', icon: '🌿', color: '#10b981' },
    legal: { label: 'Legal', labelVi: 'Pháp lý', icon: '⚖️', color: '#8b5cf6' },
};

// ============================================================================
// INDUSTRY-SPECIFIC PESTEL WEIGHT ADJUSTMENTS
// ============================================================================

/**
 * Industry-specific weights for PESTEL dimensions.
 * Higher weight = more important for that industry.
 * Default weight is 1.0 for all dimensions.
 */
export const INDUSTRY_PESTEL_WEIGHTS: Record<string, Partial<Record<PESTELDimension, number>>> = {
    Technology: { technological: 1.5, legal: 1.3, political: 0.8 },
    Finance: { economic: 1.5, legal: 1.4, political: 1.2 },
    Manufacturing: { economic: 1.3, environmental: 1.4, political: 1.2 },
    Healthcare: { legal: 1.5, social: 1.3, technological: 1.2 },
    Retail: { economic: 1.4, social: 1.3 },
    RealEstate: { legal: 1.4, economic: 1.3, environmental: 1.2 },
    Agriculture: { environmental: 1.5, economic: 1.3, social: 1.2 },
    Education: { social: 1.5, technological: 1.3, legal: 1.1 },
    Logistics: { political: 1.3, technological: 1.2, environmental: 1.1 },
    Energy: { environmental: 1.5, political: 1.4, technological: 1.3 },
    Construction: { environmental: 1.3, legal: 1.3, economic: 1.2 },
    Tourism: { social: 1.3, environmental: 1.3, political: 1.1 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all factors for a specific dimension
 */
export function getFactorsByDimension(dimension: PESTELDimension): PESTELFactor[] {
    return VIETNAM_PESTEL_FACTORS.filter(f => f.dimension === dimension);
}

/**
 * Get factors relevant to a specific industry
 */
export function getIndustryRelevantFactors(industry: string): PESTELFactor[] {
    return VIETNAM_PESTEL_FACTORS.filter(
        f => f.industryRelevance.includes('all') || f.industryRelevance.includes(industry)
    );
}

/**
 * Calculate dimension average score
 */
export function getDimensionScore(dimension: PESTELDimension): number {
    const factors = getFactorsByDimension(dimension);
    if (factors.length === 0) return 0;
    return factors.reduce((sum, f) => sum + f.score, 0) / factors.length;
}

/**
 * Get overall PESTEL score for Vietnam (weighted by industry if provided)
 */
export function getOverallPESTELScore(industry?: string): number {
    const weights = industry ? INDUSTRY_PESTEL_WEIGHTS[industry] || {} : {};
    const dimensions: PESTELDimension[] = ['political', 'economic', 'social', 'technological', 'environmental', 'legal'];

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const dim of dimensions) {
        const weight = weights[dim] || 1.0;
        const score = getDimensionScore(dim);
        totalWeightedScore += score * weight;
        totalWeight += weight;
    }

    return Math.round((totalWeightedScore / totalWeight) * 10) / 10;
}
