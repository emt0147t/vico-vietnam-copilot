/**
 * 🇻🇳 Vietnam Market Data — Curated Industry Intelligence
 *
 * Real market size, growth rates, and structure data for major Vietnamese industries.
 * Sources: VCCI, GSO, World Bank, industry reports
 *
 * All monetary values in USD billions unless otherwise noted.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface IndustryMarketProfile {
    industry: string;
    industryVi: string;
    marketSizeUsd: number;        // USD billions (2024 estimate)
    growthRateYoY: number;        // % YoY
    cagr5Year: number;            // % 5-year CAGR
    majorPlayers: { name: string; marketSharePct?: number; ticker?: string }[];
    keyMetrics: Record<string, string | number>;
    outlook: 'very_positive' | 'positive' | 'stable' | 'cautious' | 'negative';
    outlookNote: string;
    dataSource: string;
    lastVerified: string;
}

export interface VietnamMacroSummary {
    gdpUsd: number;              // USD billions
    gdpGrowthPct: number;        // %
    populationMillion: number;
    inflationPct: number;
    fdiUsdBillion: number;
    internetPenetrationPct: number;
    smartphonePenetrationPct: number;
    medianAge: number;
    urbanizationPct: number;
    laborForceMillion: number;
    dataSource: string;
    year: number;
}

// ============================================================================
// VIETNAM MACRO SUMMARY (2024)
// ============================================================================

export const VIETNAM_MACRO_2024: VietnamMacroSummary = {
    gdpUsd: 465,
    gdpGrowthPct: 7.09,
    populationMillion: 100.3,
    inflationPct: 3.63,
    fdiUsdBillion: 23.8,        // Registered FDI
    internetPenetrationPct: 79.1,
    smartphonePenetrationPct: 73.5,
    medianAge: 32.5,
    urbanizationPct: 39.2,
    laborForceMillion: 52.4,
    dataSource: 'GSO, World Bank, IMF (2024)',
    year: 2024,
};

// ============================================================================
// INDUSTRY MARKET PROFILES
// ============================================================================

export const VIETNAM_INDUSTRY_MARKETS: Record<string, IndustryMarketProfile> = {
    Technology: {
        industry: 'Technology',
        industryVi: 'Công nghệ thông tin',
        marketSizeUsd: 22.5,
        growthRateYoY: 12.8,
        cagr5Year: 14.2,
        majorPlayers: [
            { name: 'FPT Corporation', marketSharePct: 15, ticker: 'FPT' },
            { name: 'VNG Corporation', marketSharePct: 8, ticker: 'VNZ' },
            { name: 'CMC Corporation', marketSharePct: 5, ticker: 'CMG' },
            { name: 'MISA JSC', marketSharePct: 3 },
            { name: 'Viettel Solutions' },
        ],
        keyMetrics: {
            'IT workforce': '530,000+',
            'Software export revenue': '$8.5B',
            'Number of IT companies': '67,000+',
            'Tech parks/zones': 17,
            'VINASA Top 10 growth': '20%+',
        },
        outlook: 'very_positive',
        outlookNote: 'AI/Cloud adoption accelerating, global chip supply chain diversification benefiting Vietnam',
        dataSource: 'VINASA, Bộ TT&TT, GSO (2024)',
        lastVerified: '2025-01',
    },

    Finance: {
        industry: 'Finance',
        industryVi: 'Tài chính - Ngân hàng',
        marketSizeUsd: 85.2,
        growthRateYoY: 9.5,
        cagr5Year: 11.8,
        majorPlayers: [
            { name: 'Vietcombank', marketSharePct: 12, ticker: 'VCB' },
            { name: 'Techcombank', marketSharePct: 8, ticker: 'TCB' },
            { name: 'MB Bank', marketSharePct: 7, ticker: 'MBB' },
            { name: 'VPBank', marketSharePct: 6, ticker: 'VPB' },
            { name: 'ACB', marketSharePct: 5, ticker: 'ACB' },
        ],
        keyMetrics: {
            'Total banking assets': '$850B',
            'Credit growth 2024': '14.5%',
            'Mobile banking users': '75M+',
            'Fintech startups': '200+',
            'Digital payment growth': '35% YoY',
        },
        outlook: 'positive',
        outlookNote: 'Digital banking adoption surging, fintech regulation improving, Basel III compliance progressing',
        dataSource: 'SBV, Vietnam Banking Association (2024)',
        lastVerified: '2025-01',
    },

    Retail: {
        industry: 'Retail',
        industryVi: 'Bán lẻ',
        marketSizeUsd: 180.5,
        growthRateYoY: 8.2,
        cagr5Year: 9.5,
        majorPlayers: [
            { name: 'Thế Giới Di Động (MWG)', marketSharePct: 8, ticker: 'MWG' },
            { name: 'Central Retail Vietnam', marketSharePct: 5 },
            { name: 'Masan/WinCommerce', marketSharePct: 4, ticker: 'MSN' },
            { name: 'Shopee Vietnam', marketSharePct: 12 },
            { name: 'Tiki', marketSharePct: 3 },
        ],
        keyMetrics: {
            'E-commerce penetration': '14%',
            'E-commerce GMV': '$22B',
            'Online shoppers': '58M',
            'Modern trade share': '28%',
            'Convenience stores': '7,500+',
        },
        outlook: 'positive',
        outlookNote: 'E-commerce growth above 25%, omnichannel convergence, rural market expansion',
        dataSource: 'GSO, VCCI, Euromonitor (2024)',
        lastVerified: '2025-01',
    },

    Manufacturing: {
        industry: 'Manufacturing',
        industryVi: 'Sản xuất - Công nghiệp',
        marketSizeUsd: 120.8,
        growthRateYoY: 7.5,
        cagr5Year: 8.2,
        majorPlayers: [
            { name: 'Samsung Vietnam', marketSharePct: 18 },
            { name: 'LG Electronics Vietnam' },
            { name: 'Intel Vietnam' },
            { name: 'Foxconn Vietnam' },
            { name: 'Hoa Phat Group', ticker: 'HPG' },
        ],
        keyMetrics: {
            'Industrial zones': '418',
            'Occupancy rate': '72%',
            'FDI in manufacturing': '$14.2B',
            'Manufacturing GDP share': '24.8%',
            'Export share': '85%+',
        },
        outlook: 'positive',
        outlookNote: 'China+1 strategy accelerating FDI, semiconductor supply chain relocation underway',
        dataSource: 'GSO, MPI, VAMI (2024)',
        lastVerified: '2025-01',
    },

    Healthcare: {
        industry: 'Healthcare',
        industryVi: 'Y tế - Dược phẩm',
        marketSizeUsd: 22.1,
        growthRateYoY: 10.5,
        cagr5Year: 12.8,
        majorPlayers: [
            { name: 'Vinmec Hospitals' },
            { name: 'FPT Long Châu', ticker: 'FRT' },
            { name: 'Pharmacity' },
            { name: 'DHG Pharma', ticker: 'DHG' },
            { name: 'Hau Giang Pharma', ticker: 'DHG' },
        ],
        keyMetrics: {
            'Healthcare spend per capita': '$220',
            'Hospital beds per 1000': '2.9',
            'Pharmacy chains': '5,000+',
            'Health insurance coverage': '93%',
            'Telemedicine growth': '40% YoY',
        },
        outlook: 'very_positive',
        outlookNote: 'Aging population, rising middle class driving healthcare spend, telemedicine adoption post-COVID',
        dataSource: 'Bộ Y tế, WHO, BMI Research (2024)',
        lastVerified: '2025-01',
    },

    RealEstate: {
        industry: 'RealEstate',
        industryVi: 'Bất động sản',
        marketSizeUsd: 65.2,
        growthRateYoY: -3.5,
        cagr5Year: 5.8,
        majorPlayers: [
            { name: 'Vinhomes', marketSharePct: 15, ticker: 'VHM' },
            { name: 'Novaland', marketSharePct: 5, ticker: 'NVL' },
            { name: 'Khang Điền', ticker: 'KDH' },
            { name: 'Nam Long', ticker: 'NLG' },
            { name: 'Phát Đạt', ticker: 'PDR' },
        ],
        keyMetrics: {
            'Residential supply (HCMC)': '15,000 units/year',
            'Industrial land price growth': '8% YoY',
            'Average apartment price (HCMC)': '$2,500/sqm',
            'Urbanization rate': '39.2%',
            'Land law reform': '2025 effective',
        },
        outlook: 'cautious',
        outlookNote: 'Market recovering from 2022-2023 downturn, new Land Law 2024 expected to unlock supply, credit tightening easing',
        dataSource: 'Bộ Xây dựng, CBRE, JLL (2024)',
        lastVerified: '2025-01',
    },

    FoodBeverage: {
        industry: 'FoodBeverage',
        industryVi: 'Thực phẩm - Đồ uống',
        marketSizeUsd: 58.5,
        growthRateYoY: 6.8,
        cagr5Year: 7.5,
        majorPlayers: [
            { name: 'Masan Consumer', marketSharePct: 12, ticker: 'MSN' },
            { name: 'Vinamilk', marketSharePct: 10, ticker: 'VNM' },
            { name: 'Sabeco (ThaiBev)', marketSharePct: 8, ticker: 'SAB' },
            { name: 'Habeco', ticker: 'BHN' },
            { name: 'Acecook Vietnam' },
        ],
        keyMetrics: {
            'F&B spend per capita': '$580',
            'Processed food growth': '8.5% YoY',
            'Dairy market size': '$6.2B',
            'Beer consumption': '4.6B liters/year',
            'Health food segment growth': '15% YoY',
        },
        outlook: 'positive',
        outlookNote: 'Rising middle class, health-conscious consumers driving premiumization, cold chain improving',
        dataSource: 'GSO, Euromonitor, VCCI (2024)',
        lastVerified: '2025-01',
    },

    Logistics: {
        industry: 'Logistics',
        industryVi: 'Logistics - Vận tải',
        marketSizeUsd: 42.5,
        growthRateYoY: 12.2,
        cagr5Year: 14.5,
        majorPlayers: [
            { name: 'GHN (Giao Hàng Nhanh)' },
            { name: 'Viettel Post', ticker: 'VTP' },
            { name: 'Vietnam Post' },
            { name: 'Gemadept', ticker: 'GMD' },
            { name: 'Ninjavan Vietnam' },
        ],
        keyMetrics: {
            'Logistics cost / GDP': '16.8%',
            'E-commerce parcels/day': '8M+',
            'Seaport throughput': '850M tons',
            'LPI ranking': '43rd (World Bank)',
            'Cold chain market': '$2.1B',
        },
        outlook: 'very_positive',
        outlookNote: 'E-commerce boom driving last-mile innovation, Long Thanh airport under construction, deep-sea port expansion',
        dataSource: 'VLA, Bộ GTVT, GSO (2024)',
        lastVerified: '2025-01',
    },

    Education: {
        industry: 'Education',
        industryVi: 'Giáo dục - Đào tạo',
        marketSizeUsd: 18.5,
        growthRateYoY: 8.5,
        cagr5Year: 10.2,
        majorPlayers: [
            { name: 'FPT Education' },
            { name: 'ELSA Speak' },
            { name: 'Topica Edtech' },
            { name: 'VUS (Vietnam USA Society English Centers)' },
            { name: 'YOLA' },
        ],
        keyMetrics: {
            'Education spend / GDP': '4.9%',
            'University enrollment': '2.1M',
            'EdTech market size': '$2.8B',
            'Students abroad': '190,000+',
            'Online learning penetration': '42%',
        },
        outlook: 'positive',
        outlookNote: 'Digital learning normalization, STEM focus, international partnerships expanding',
        dataSource: 'Bộ GD&ĐT, GSO, HolonIQ (2024)',
        lastVerified: '2025-01',
    },
};

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Get market profile for an industry
 */
export function getIndustryMarketProfile(industry: string): IndustryMarketProfile | null {
    return VIETNAM_INDUSTRY_MARKETS[industry] || null;
}

/**
 * Get Vietnam macro summary
 */
export function getVietnamMacroSummary(): VietnamMacroSummary {
    return VIETNAM_MACRO_2024;
}

/**
 * Get all industry profiles sorted by market size
 */
export function getAllIndustryProfiles(): IndustryMarketProfile[] {
    return Object.values(VIETNAM_INDUSTRY_MARKETS)
        .sort((a, b) => b.marketSizeUsd - a.marketSizeUsd);
}

/**
 * Get industries by outlook
 */
export function getIndustriesByOutlook(
    outlook: IndustryMarketProfile['outlook']
): IndustryMarketProfile[] {
    return Object.values(VIETNAM_INDUSTRY_MARKETS).filter(i => i.outlook === outlook);
}
