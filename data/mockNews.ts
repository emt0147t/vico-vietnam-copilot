/**
 * 📰 Mock News Database
 * Realistic, professionally written tech company news
 * Used as fallback + demo data in Hybrid News Strategy
 */

export interface MockNewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    date: Date;
    sentiment: 'positive' | 'negative' | 'neutral';
    category: 'Finance' | 'M&A' | 'Product' | 'Legal' | 'Leadership' | 'Partnership';
    type: 'mock';
    link?: string;
}

export const mockNewsDatabase: MockNewsItem[] = [
    // ===== VINGROUP / VINFAST =====
    {
        id: 'mock-vg-001',
        title: 'Vingroup Q4 2025 Revenue Exceeds Targets by 18%, Driven by VinFast EV Sales',
        summary: 'Vingroup announced record-breaking Q4 earnings with electric vehicle division contributing 35% of total revenue. Expansion into European markets accelerated.',
        source: 'Bloomberg',
        date: new Date('2026-02-02'),
        sentiment: 'positive',
        category: 'Finance',
        type: 'mock'
    },
    {
        id: 'mock-vg-002',
        title: 'VinFast Partners with Major US Retailer for Vehicle Distribution',
        summary: 'Vingroup subsidiary VinFast announced strategic partnership to establish 500 service centers across North America by 2027.',
        source: 'Reuters',
        date: new Date('2026-01-28'),
        sentiment: 'positive',
        category: 'Partnership',
        type: 'mock'
    },
    {
        id: 'mock-vg-003',
        title: 'Vingroup Leadership Reshuffle: New CTO Appointed',
        summary: 'Vingroup announces appointment of former Tesla engineer as Chief Technology Officer, signaling stronger focus on autonomous driving tech.',
        source: 'VnExpress',
        date: new Date('2026-01-20'),
        sentiment: 'positive',
        category: 'Leadership',
        type: 'mock'
    },
    {
        id: 'mock-vg-004',
        title: 'VinFast Recalls 50,000 Units Over Battery Issues',
        summary: 'Voluntary recall announced for VinFast VF8 models. Company estimates $2.3B impact but maintains delivery targets.',
        source: 'Reuters',
        date: new Date('2026-01-15'),
        sentiment: 'negative',
        category: 'Legal',
        type: 'mock'
    },
    {
        id: 'mock-vg-005',
        title: 'Vingroup Invests $800M in AI Research Center',
        summary: 'Vingroup establishes new AI research center in Singapore focused on autonomous driving and battery management systems.',
        source: 'TechCrunch',
        date: new Date('2026-01-10'),
        sentiment: 'positive',
        category: 'Product',
        type: 'mock'
    },
    {
        id: 'mock-vg-006',
        title: 'VinFast VF9 Named "Best EV of 2025" by Automotive Digest',
        summary: 'Vingroup flagship electric SUV wins prestigious international award for design, performance, and sustainability features.',
        source: 'Automotive Digest',
        date: new Date('2025-12-28'),
        sentiment: 'positive',
        category: 'Product',
        type: 'mock'
    },
    {
        id: 'mock-vg-007',
        title: 'Vingroup Stock Gains 22% Following Strong Earnings Report',
        summary: 'Vingroup shares surge on Ho Chi Minh Stock Exchange after company raises FY2026 guidance to $45B revenue target.',
        source: 'Bloomberg',
        date: new Date('2025-12-20'),
        sentiment: 'positive',
        category: 'Finance',
        type: 'mock'
    },
    {
        id: 'mock-vg-008',
        title: 'EU Investigates VinFast Over Environmental Compliance Claims',
        summary: 'European Commission opens inquiry into VinFast emissions testing procedures following whistleblower allegations.',
        source: 'Reuters',
        date: new Date('2025-12-10'),
        sentiment: 'negative',
        category: 'Legal',
        type: 'mock'
    },

    // ===== FPT CORPORATION =====
    {
        id: 'mock-fpt-001',
        title: 'FPT Software Secures $200M Cloud Infrastructure Contract',
        summary: 'FPT Corporation wins major contract to provide enterprise cloud solutions for APAC multinational. Revenue impact: $50M/year.',
        source: 'VnExpress IT',
        date: new Date('2026-02-01'),
        sentiment: 'positive',
        category: 'Finance',
        type: 'mock'
    },
    {
        id: 'mock-fpt-002',
        title: 'FPT Launches New AI-Powered Cybersecurity Suite',
        summary: 'FPT Technology announces next-gen threat detection platform with real-time behavioral analysis. Beta available March 2026.',
        source: 'TechCrunch',
        date: new Date('2026-01-25'),
        sentiment: 'positive',
        category: 'Product',
        type: 'mock'
    },
    {
        id: 'mock-fpt-003',
        title: 'FPT CEO Tran Duc Thach Steps Down, Deputy Assumes Leadership',
        summary: 'FPT Corporation announces CEO transition. Outgoing CEO cited personal reasons; transition planned for June 2026.',
        source: 'VnExpress',
        date: new Date('2026-01-18'),
        sentiment: 'neutral',
        category: 'Leadership',
        type: 'mock'
    },
    {
        id: 'mock-fpt-004',
        title: 'FPT Acquires Japanese IoT Startup for $85M',
        summary: 'FPT Corporation completes acquisition of TokyoTech Solutions to expand IoT capabilities in Asia-Pacific.',
        source: 'M&A Wire',
        date: new Date('2026-01-12'),
        sentiment: 'positive',
        category: 'M&A',
        type: 'mock'
    },
    {
        id: 'mock-fpt-005',
        title: 'FPT Q3 2025 Profit Jumps 35% YoY',
        summary: 'FPT Corporation reports net profit of $180M for Q3 2025, driven by software services and digital transformation projects.',
        source: 'Bloomberg',
        date: new Date('2025-11-28'),
        sentiment: 'positive',
        category: 'Finance',
        type: 'mock'
    },

    // ===== SAMSUNG VIETNAM =====
    {
        id: 'mock-samsung-001',
        title: 'Samsung Vietnam Invests $1.2B in Semiconductor Fab Expansion',
        summary: 'Samsung announces major capital investment in Ho Chi Minh City facility to support growing demand for advanced chips.',
        source: 'Reuters',
        date: new Date('2026-01-30'),
        sentiment: 'positive',
        category: 'Finance',
        type: 'mock'
    },
    {
        id: 'mock-samsung-001b',
        title: 'Samsung Vietnam Becomes Country\'s Top Exporter',
        summary: 'Samsung Vietnam surpasses Vingroup as Vietnam\'s largest exporter with $65B annual exports. Electronics dominate shipments.',
        source: 'VnExpress',
        date: new Date('2026-01-22'),
        sentiment: 'positive',
        category: 'Finance',
        type: 'mock'
    },
    {
        id: 'mock-samsung-002',
        title: 'Samsung Announces 10,000 New Tech Jobs in Vietnam',
        summary: 'Samsung Vietnam launches major hiring campaign for engineers, technicians, and operations staff. Salaries increased 15%.',
        source: 'VnExpress Jobs',
        date: new Date('2026-01-16'),
        sentiment: 'positive',
        category: 'Leadership',
        type: 'mock'
    },
    {
        id: 'mock-samsung-003',
        title: 'Samsung Galaxy S26 Launch Event Held in Hanoi',
        summary: 'Samsung Vietnam hosts flagship smartphone launch with supply chain partnerships emphasized. Production to begin Feb 2026.',
        source: 'Tech Vietnam',
        date: new Date('2025-12-15'),
        sentiment: 'positive',
        category: 'Product',
        type: 'mock'
    },

    // ===== VIETTEL =====
    {
        id: 'mock-viettel-001',
        title: 'Viettel Completes 5G Network Rollout Across 50 Major Cities',
        summary: 'State-owned Viettel announced completion of Phase 1 5G infrastructure. Coverage expansion accelerates to rural areas.',
        source: 'VTC',
        date: new Date('2026-01-28'),
        sentiment: 'positive',
        category: 'Product',
        type: 'mock'
    },
    {
        id: 'mock-viettel-002',
        title: 'Viettel Subscriber Base Reaches 100M Users',
        summary: 'Viettel milestones 100 million total subscribers across telecom and digital services. ARPU growth accelerates.',
        source: 'VnExpress',
        date: new Date('2026-01-20'),
        sentiment: 'positive',
        category: 'Finance',
        type: 'mock'
    },
    {
        id: 'mock-viettel-003',
        title: 'Viettel Partners with Google Cloud for Data Center Operations',
        summary: 'Viettel and Google Cloud announce strategic partnership for enterprise data services. 3-year, $120M agreement.',
        source: 'Google',
        date: new Date('2026-01-10'),
        sentiment: 'positive',
        category: 'Partnership',
        type: 'mock'
    },
];

/**
 * Get mock news for a specific company
 * Fuzzy matching on company name
 */
export const getMockNewsForCompany = (companyName: string): MockNewsItem[] => {
    if (!companyName) return [];

    const lowerName = companyName.toLowerCase();
    const keywords: { [key: string]: string[] } = {
        'vingroup': ['vingroup', 'vinfast', 'vf'],
        'fpt': ['fpt', 'fpt software', 'fpt corp'],
        'samsung': ['samsung', 'samsung vietnam'],
        'viettel': ['viettel', 'vietnamtelecom'],
    };

    // Find matching keyword set
    let matchKey = '';
    for (const [key, terms] of Object.entries(keywords)) {
        if (terms.some(term => lowerName.includes(term))) {
            matchKey = key;
            break;
        }
    }

    if (!matchKey) return [];

    // Filter mock news by keyword
    const keywordToFind = matchKey;
    return mockNewsDatabase.filter(item => {
        const combined = `${item.title} ${item.summary}`.toLowerCase();
        return keywords[keywordToFind].some(term => combined.includes(term));
    });
};

/**
 * Get all mock news (for search/browse)
 */
export const getAllMockNews = (): MockNewsItem[] => {
    return mockNewsDatabase;
};
