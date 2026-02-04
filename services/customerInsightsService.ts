/**
 * 🎯 Customer Insights Service - Enterprise Edition
 * 
 * 4 Tầng Thấu Hiểu Khách Hàng:
 * 1. Chân Dung & Định Danh (Who are they?) - ICP, Decision Makers, User Personas
 * 2. Nỗi Đau & Động Lực (Why they buy?) - Pain Points, Desired Outcomes, Triggers
 * 3. Hành Trình Mua Hàng (How they buy?) - Buying Process, Purchase Barriers
 * 4. Tiếng Nói Khách Hàng (Voice of Customer) - Objections, Sentiment, Feature Requests
 */

import { loadAllCompanies, findTopCompetitors } from './competitorEngine';

// ==================== INTERFACES ====================
export interface IdealCustomerProfile {
    firmographics: {
        companySize: string[];
        industries: string[];
        regions: string[];
        annualRevenue: string;
        employeeCount: string;
        techMaturity: 'Early Adopter' | 'Mainstream' | 'Laggard';
    };
    decisionMakers: Array<{
        title: string;
        role: 'Economic Buyer' | 'Technical Buyer' | 'User Buyer' | 'Champion';
        concerns: string[];
        successMetrics: string[];
    }>;
    keyInfluencers: Array<{
        title: string;
        influence: 'High' | 'Medium' | 'Low';
        focus: string;
    }>;
}

export interface UserPersona {
    name: string;
    title: string;
    avatar: string;
    age: string;
    background: string;
    goals: string[];
    frustrations: string[];
    preferredChannels: string[];
    quote: string;
    dayInLife: string[];
    techStack: string[];
}

export interface PainPoint {
    category: string;
    pain: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    frequency: string;
    currentSolution: string;
    costOfInaction: string;
}

export interface TriggerEvent {
    event: string;
    urgency: 'Immediate' | 'Short-term' | 'Long-term';
    likelihood: number;
    signals: string[];
    approach: string;
}

export interface BuyingStage {
    stage: string;
    description: string;
    duration: string;
    activities: string[];
    contentNeeded: string[];
    objections: string[];
    successCriteria: string;
}

export interface PurchaseBarrier {
    barrier: string;
    category: 'Price' | 'Trust' | 'Complexity' | 'Timing' | 'Politics' | 'Competition';
    severity: 'High' | 'Medium' | 'Low';
    overcomingStrategy: string;
    proofPoints: string[];
}

export interface CustomerObjection {
    objection: string;
    frequency: number;
    category: string;
    response: string;
    proofPoints: string[];
}

export interface FeatureRequest {
    feature: string;
    votes: number;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    segment: string;
    status: 'Planned' | 'In Progress' | 'Considering' | 'Declined';
}

export interface CustomerInsightsReport {
    generatedAt: string;
    companyName: string;
    industry: string;
    
    // Tier 1: Who are they?
    idealCustomerProfile: IdealCustomerProfile;
    userPersonas: UserPersona[];
    
    // Tier 2: Why they buy?
    painPoints: PainPoint[];
    desiredOutcomes: Array<{ outcome: string; metric: string; timeframe: string }>;
    triggerEvents: TriggerEvent[];
    
    // Tier 3: How they buy?
    buyingProcess: BuyingStage[];
    purchaseBarriers: PurchaseBarrier[];
    buyingCommittee: {
        avgSize: number;
        typicalCycle: string;
        budgetHolder: string;
    };
    
    // Tier 4: Voice of Customer
    commonObjections: CustomerObjection[];
    sentimentAnalysis: {
        overall: number;
        positive: number;
        neutral: number;
        negative: number;
        trend: 'Improving' | 'Stable' | 'Declining';
        topPositiveThemes: string[];
        topNegativeThemes: string[];
    };
    featureRequests: FeatureRequest[];
    npsScore: number;
    
    // Summary
    executiveSummary: {
        overview: string;
        keyInsights: string[];
        recommendations: string[];
    };
}

// ==================== INDUSTRY CONFIGS ====================
const INDUSTRY_CUSTOMER_CONFIGS: Record<string, {
    targetIndustries: string[];
    decisionMakers: Array<{ title: string; role: 'Economic Buyer' | 'Technical Buyer' | 'User Buyer' | 'Champion' }>;
    painCategories: string[];
    triggers: string[];
    buyingCycleDays: number;
}> = {
    'Technology': {
        targetIndustries: ['E-commerce', 'Fintech', 'Healthcare', 'Education', 'Manufacturing', 'Retail'],
        decisionMakers: [
            { title: 'CTO / VP Engineering', role: 'Technical Buyer' },
            { title: 'CEO / Founder', role: 'Economic Buyer' },
            { title: 'Product Manager', role: 'User Buyer' },
            { title: 'IT Director', role: 'Champion' }
        ],
        painCategories: ['Scalability', 'Integration', 'Technical Debt', 'Time-to-Market', 'Talent'],
        triggers: ['Series Funding', 'Digital Transformation', 'System Failure', 'Rapid Growth', 'New CTO Hire'],
        buyingCycleDays: 45
    },
    'Fintech': {
        targetIndustries: ['Banking', 'Insurance', 'Investment', 'Lending', 'Payment'],
        decisionMakers: [
            { title: 'CFO', role: 'Economic Buyer' },
            { title: 'CTO', role: 'Technical Buyer' },
            { title: 'Compliance Officer', role: 'User Buyer' },
            { title: 'Digital Banking Head', role: 'Champion' }
        ],
        painCategories: ['Compliance', 'Security', 'Customer Experience', 'Legacy Systems', 'Fraud Prevention'],
        triggers: ['Regulatory Change', 'Security Breach', 'Merger/Acquisition', 'New Banking License', 'Competition Launch'],
        buyingCycleDays: 90
    },
    'E-commerce': {
        targetIndustries: ['Retail', 'Consumer Goods', 'Fashion', 'Electronics', 'FMCG'],
        decisionMakers: [
            { title: 'E-commerce Director', role: 'Champion' },
            { title: 'CMO', role: 'Economic Buyer' },
            { title: 'Operations Manager', role: 'User Buyer' },
            { title: 'Digital Product Lead', role: 'Technical Buyer' }
        ],
        painCategories: ['Conversion Rate', 'Cart Abandonment', 'Fulfillment', 'Customer Retention', 'Omnichannel'],
        triggers: ['Peak Season', 'Competitor Launch', 'Platform Change', 'International Expansion', 'VC Investment'],
        buyingCycleDays: 30
    },
    'Healthcare': {
        targetIndustries: ['Hospitals', 'Clinics', 'Pharma', 'Medical Devices', 'Telehealth'],
        decisionMakers: [
            { title: 'Hospital Director', role: 'Economic Buyer' },
            { title: 'Chief Medical Officer', role: 'Technical Buyer' },
            { title: 'Head Nurse', role: 'User Buyer' },
            { title: 'IT Manager', role: 'Champion' }
        ],
        painCategories: ['Patient Data', 'Operational Efficiency', 'Compliance (HIPAA)', 'Staff Shortage', 'Cost Control'],
        triggers: ['Accreditation Review', 'System Upgrade', 'New Facility', 'Government Initiative', 'Pandemic Response'],
        buyingCycleDays: 120
    },
    'Default': {
        targetIndustries: ['SME', 'Enterprise', 'Startup', 'Government', 'NGO'],
        decisionMakers: [
            { title: 'CEO', role: 'Economic Buyer' },
            { title: 'Department Head', role: 'Technical Buyer' },
            { title: 'Operations Manager', role: 'User Buyer' },
            { title: 'Project Manager', role: 'Champion' }
        ],
        painCategories: ['Efficiency', 'Cost', 'Growth', 'Talent', 'Technology'],
        triggers: ['Budget Cycle', 'Leadership Change', 'Market Shift', 'Competitor Move', 'Crisis Event'],
        buyingCycleDays: 60
    }
};

// ==================== PERSONA TEMPLATES ====================
const PERSONA_TEMPLATES: Record<string, UserPersona[]> = {
    'Technology': [
        {
            name: 'Techie Tùng',
            title: 'CTO / VP Engineering',
            avatar: '👨‍💻',
            age: '35-45',
            background: 'Từng làm việc tại FPT/Viettel, có 10+ năm kinh nghiệm tech. Đam mê công nghệ mới.',
            goals: ['Scale hệ thống lên 10x users', 'Giảm technical debt', 'Build team A-players'],
            frustrations: ['Vendor lock-in', 'Documentation kém', 'Support chậm', 'Legacy code'],
            preferredChannels: ['GitHub', 'Stack Overflow', 'Tech meetups', 'LinkedIn'],
            quote: '"Tôi cần giải pháp production-ready, không phải MVP demo."',
            dayInLife: ['Code review buổi sáng', 'Họp kiến trúc hệ thống', 'Phỏng vấn ứng viên', 'Research công nghệ mới'],
            techStack: ['AWS', 'Kubernetes', 'React', 'Python', 'PostgreSQL']
        },
        {
            name: 'Manager Mai',
            title: 'Product Manager',
            avatar: '👩‍💼',
            age: '28-35',
            background: 'MBA, từng làm PM tại startup unicorn. Giỏi data-driven decision.',
            goals: ['Ship features đúng deadline', 'Tăng user engagement', 'Giảm churn rate'],
            frustrations: ['Stakeholder conflict', 'Thiếu data insights', 'Sprint bị delay', 'Feature creep'],
            preferredChannels: ['Product Hunt', 'Medium', 'LinkedIn', 'Slack communities'],
            quote: '"Show me the data, then we talk about feelings."',
            dayInLife: ['Sprint planning', 'User research', 'Stakeholder alignment', 'Roadmap prioritization'],
            techStack: ['Jira', 'Figma', 'Amplitude', 'Notion', 'Miro']
        }
    ],
    'Fintech': [
        {
            name: 'Banker Bình',
            title: 'Digital Banking Head',
            avatar: '🏦',
            age: '40-50',
            background: '20+ năm trong ngành ngân hàng, đang lead digital transformation.',
            goals: ['Modernize core banking', 'Tăng digital adoption', 'Giảm chi phí vận hành'],
            frustrations: ['Legacy systems', 'Regulatory complexity', 'Slow approval process', 'Security concerns'],
            preferredChannels: ['Industry conferences', 'Analyst reports', 'Peer referrals', 'Banking associations'],
            quote: '"Compliance first, innovation second. Nhưng cần cả hai."',
            dayInLife: ['Regulatory meetings', 'Vendor evaluation', 'Board presentations', 'Risk assessment'],
            techStack: ['Core Banking', 'SAP', 'Oracle', 'Temenos', 'API Gateway']
        }
    ],
    'Default': [
        {
            name: 'Director Dũng',
            title: 'Operations Director',
            avatar: '👔',
            age: '40-50',
            background: 'MBA, 15+ năm kinh nghiệm quản lý. Focused on efficiency.',
            goals: ['Optimize operations', 'Reduce costs 20%', 'Improve team productivity'],
            frustrations: ['Manual processes', 'Data silos', 'Slow reporting', 'Staff turnover'],
            preferredChannels: ['Industry events', 'LinkedIn', 'Peer recommendations', 'Trade publications'],
            quote: '"If you can\'t measure it, you can\'t improve it."',
            dayInLife: ['KPI review', 'Team meetings', 'Process optimization', 'Vendor management'],
            techStack: ['ERP', 'Excel', 'Power BI', 'Slack', 'Monday.com']
        }
    ]
};

// ==================== PAIN POINT TEMPLATES ====================
const PAIN_POINT_TEMPLATES: Record<string, PainPoint[]> = {
    'Technology': [
        { category: 'Scalability', pain: 'Hệ thống không scale được khi traffic tăng đột biến', severity: 'Critical', frequency: 'Monthly (peak times)', currentSolution: 'Manual scaling, overtime', costOfInaction: 'Lost revenue, customer churn' },
        { category: 'Integration', pain: 'Mất 2-3 tháng để integrate với một partner mới', severity: 'High', frequency: 'Quarterly', currentSolution: 'Custom development', costOfInaction: 'Missed partnerships, slow GTM' },
        { category: 'Technical Debt', pain: 'Code legacy khiến mỗi feature mới mất gấp đôi thời gian', severity: 'High', frequency: 'Every sprint', currentSolution: 'Workarounds', costOfInaction: 'Developer burnout, quality issues' },
        { category: 'Talent', pain: 'Khó tuyển developer senior có kinh nghiệm', severity: 'Medium', frequency: 'Ongoing', currentSolution: 'Higher salaries, remote work', costOfInaction: 'Slow delivery, knowledge gaps' }
    ],
    'Fintech': [
        { category: 'Compliance', pain: 'Regulatory audit mất 3 tháng chuẩn bị', severity: 'Critical', frequency: 'Annually', currentSolution: 'Manual documentation', costOfInaction: 'License risk, fines' },
        { category: 'Security', pain: 'Phát hiện fraud chậm, mất tiền mỗi tháng', severity: 'Critical', frequency: 'Daily incidents', currentSolution: 'Rule-based system', costOfInaction: '~$50K/month losses' },
        { category: 'Customer Experience', pain: 'Onboarding KYC mất 3-5 ngày làm việc', severity: 'High', frequency: 'Per customer', currentSolution: 'Manual verification', costOfInaction: '40% drop-off rate' }
    ],
    'E-commerce': [
        { category: 'Conversion', pain: 'Cart abandonment rate 70%+', severity: 'Critical', frequency: 'Daily', currentSolution: 'Email reminders', costOfInaction: 'Millions in lost revenue' },
        { category: 'Fulfillment', pain: 'Sai hàng, giao chậm chiếm 15% đơn', severity: 'High', frequency: 'Daily', currentSolution: 'Manual QC', costOfInaction: 'Returns, bad reviews' },
        { category: 'Personalization', pain: 'Không biết recommend sản phẩm nào cho ai', severity: 'Medium', frequency: 'Every visit', currentSolution: 'Best sellers list', costOfInaction: 'Lower AOV, engagement' }
    ],
    'Default': [
        { category: 'Efficiency', pain: 'Nhân viên mất 30% thời gian làm việc lặp đi lặp lại', severity: 'High', frequency: 'Daily', currentSolution: 'More headcount', costOfInaction: 'High labor costs' },
        { category: 'Data', pain: 'Không có single source of truth cho data', severity: 'High', frequency: 'Weekly meetings', currentSolution: 'Excel consolidation', costOfInaction: 'Wrong decisions' },
        { category: 'Communication', pain: 'Thông tin bị lost giữa các department', severity: 'Medium', frequency: 'Daily', currentSolution: 'More meetings', costOfInaction: 'Delays, rework' }
    ]
};

// ==================== BUYING PROCESS TEMPLATES ====================
const BUYING_PROCESS_TEMPLATES: BuyingStage[] = [
    {
        stage: '1. Nhận Thức Vấn Đề',
        description: 'Khách hàng nhận ra họ có vấn đề cần giải quyết',
        duration: '2-4 tuần',
        activities: ['Đọc bài viết về vấn đề', 'Thảo luận nội bộ', 'Benchmark với peers'],
        contentNeeded: ['Blog posts', 'Industry reports', 'Webinars', 'Case studies'],
        objections: ['Chưa phải ưu tiên', 'Đang có cách xử lý tạm'],
        successCriteria: 'Khách hàng đồng ý đây là vấn đề cần giải quyết'
    },
    {
        stage: '2. Tìm Kiếm Giải Pháp',
        description: 'Khách hàng active tìm các option có thể giải quyết vấn đề',
        duration: '2-6 tuần',
        activities: ['Google search', 'Hỏi peer recommendations', 'Đọc review sites', 'Request demos'],
        contentNeeded: ['Solution comparisons', 'ROI calculators', 'Product demos', 'Free trials'],
        objections: ['Có quá nhiều option', 'Không biết đánh giá thế nào'],
        successCriteria: 'Shortlist 2-3 vendors'
    },
    {
        stage: '3. Đánh Giá & So Sánh',
        description: 'So sánh chi tiết các giải pháp trong shortlist',
        duration: '2-4 tuần',
        activities: ['Technical evaluation', 'Proof of Concept', 'Reference calls', 'Pricing negotiation'],
        contentNeeded: ['Technical documentation', 'Security certifications', 'Customer references', 'Implementation guides'],
        objections: ['Tính năng X bên kia có mà bên này không', 'Giá đắt hơn', 'Integration phức tạp'],
        successCriteria: 'Chọn được preferred vendor'
    },
    {
        stage: '4. Quyết Định & Mua',
        description: 'Final approval và ký hợp đồng',
        duration: '1-4 tuần',
        activities: ['Final negotiation', 'Legal review', 'Budget approval', 'Contract signing'],
        contentNeeded: ['Proposal/Quote', 'Contract terms', 'SLA details', 'Implementation plan'],
        objections: ['Budget freeze', 'Need more approvals', 'Contract terms concerns'],
        successCriteria: 'Signed contract'
    },
    {
        stage: '5. Onboarding & Adoption',
        description: 'Triển khai và bắt đầu sử dụng',
        duration: '4-12 tuần',
        activities: ['Implementation', 'Training', 'Data migration', 'Go-live'],
        contentNeeded: ['Onboarding guides', 'Training videos', 'Support documentation', 'Best practices'],
        objections: ['Khó dùng quá', 'Nhân viên không muốn đổi', 'Kết quả chưa thấy'],
        successCriteria: 'Active usage & initial value realization'
    }
];

// ==================== OBJECTION TEMPLATES ====================
const OBJECTION_TEMPLATES: CustomerObjection[] = [
    {
        objection: 'Giá bên em đắt hơn bên kia',
        frequency: 85,
        category: 'Price',
        response: 'Đúng là giá gốc cao hơn 15-20%, nhưng Total Cost of Ownership thấp hơn 40% vì không cần thuê thêm người, không có hidden costs, và ROI đạt sau 3 tháng.',
        proofPoints: ['ROI calculator', 'TCO comparison sheet', 'Customer case: saved $X']
    },
    {
        objection: 'Giao diện hơi khó dùng / phức tạp',
        frequency: 72,
        category: 'Usability',
        response: 'Chúng tôi có đội Customer Success hỗ trợ 1-1 trong 30 ngày đầu. 95% users thành thạo sau 1 tuần. Và bạn có thể customize dashboard theo ý muốn.',
        proofPoints: ['Onboarding video', 'User satisfaction survey 4.8/5', 'In-app tour feature']
    },
    {
        objection: 'Chúng tôi đang dùng solution khác rồi',
        frequency: 68,
        category: 'Competition',
        response: 'Hoàn toàn hiểu! 60% khách hàng của chúng tôi cũng migrate từ solution khác. Chúng tôi hỗ trợ migration miễn phí và đảm bảo không downtime.',
        proofPoints: ['Migration guide', 'Competitor comparison', 'Switch case studies']
    },
    {
        objection: 'Cần phải hỏi ý kiến thêm người khác',
        frequency: 65,
        category: 'Decision Process',
        response: 'Tất nhiên! Tôi có thể chuẩn bị tài liệu cho từng stakeholder: CFO quan tâm ROI, CTO quan tâm security, Users quan tâm UX. Hoặc tôi có thể join meeting explain trực tiếp.',
        proofPoints: ['Stakeholder-specific decks', 'Executive summary', 'Technical deep-dive doc']
    },
    {
        objection: 'Bây giờ chưa phải thời điểm',
        frequency: 58,
        category: 'Timing',
        response: 'Hiểu rồi! Có thể share lý do không? Nếu là budget, chúng tôi có flexible payment. Nếu là internal priority, tôi suggest book lại sau 2 tháng để review.',
        proofPoints: ['Flexible pricing options', 'Quick start pilot program', 'Cost of delay calculator']
    },
    {
        objection: 'Sợ triển khai phức tạp / mất thời gian',
        frequency: 55,
        category: 'Implementation',
        response: 'Implementation trung bình chỉ 2 tuần, không 2 tháng. Chúng tôi có pre-built templates và đội Solutions Engineer hỗ trợ từ A-Z.',
        proofPoints: ['Implementation timeline', 'Pre-built templates', 'SE support commitment']
    }
];

// ==================== HELPER FUNCTIONS ====================
function getIndustryConfig(industry: string) {
    return INDUSTRY_CUSTOMER_CONFIGS[industry] || INDUSTRY_CUSTOMER_CONFIGS['Default'];
}

function getPersonas(industry: string): UserPersona[] {
    const industryPersonas = PERSONA_TEMPLATES[industry] || [];
    const defaultPersonas = PERSONA_TEMPLATES['Default'] || [];
    return [...industryPersonas, ...defaultPersonas].slice(0, 3);
}

function getPainPoints(industry: string): PainPoint[] {
    const industryPains = PAIN_POINT_TEMPLATES[industry] || [];
    const defaultPains = PAIN_POINT_TEMPLATES['Default'] || [];
    return [...industryPains, ...defaultPains].slice(0, 6);
}

function generateICP(config: typeof INDUSTRY_CUSTOMER_CONFIGS['Default'], companyData: any): IdealCustomerProfile {
    const sizes = ['SME (50-200)', 'Mid-Market (200-1000)', 'Enterprise (1000+)'];
    
    return {
        firmographics: {
            companySize: sizes.slice(0, 2 + Math.floor(Math.random())),
            industries: config.targetIndustries.slice(0, 4),
            regions: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Southeast Asia'],
            annualRevenue: '$1M - $50M',
            employeeCount: '50 - 500',
            techMaturity: 'Mainstream'
        },
        decisionMakers: config.decisionMakers.map(dm => ({
            ...dm,
            concerns: dm.role === 'Economic Buyer' 
                ? ['ROI', 'Total Cost', 'Risk Mitigation', 'Strategic Fit']
                : dm.role === 'Technical Buyer'
                ? ['Integration', 'Security', 'Scalability', 'Support Quality']
                : dm.role === 'User Buyer'
                ? ['Ease of Use', 'Training Time', 'Daily Workflow', 'Mobile Access']
                : ['Time to Value', 'Implementation Support', 'Change Management', 'Success Metrics'],
            successMetrics: dm.role === 'Economic Buyer'
                ? ['Revenue impact', 'Cost reduction', 'Payback period']
                : dm.role === 'Technical Buyer'
                ? ['Uptime SLA', 'API performance', 'Security certifications']
                : ['User adoption rate', 'Time saved per task', 'NPS score']
        })),
        keyInfluencers: [
            { title: 'End Users / Staff', influence: 'High', focus: 'Usability & daily workflow' },
            { title: 'IT Team', influence: 'Medium', focus: 'Integration & maintenance' },
            { title: 'Finance Team', influence: 'Medium', focus: 'Budget & ROI tracking' }
        ]
    };
}

function generateTriggerEvents(config: typeof INDUSTRY_CUSTOMER_CONFIGS['Default']): TriggerEvent[] {
    const approaches = [
        'Outbound với messaging "timing is now"',
        'Content marketing với case study relevant',
        'Partner referral từ ecosystem',
        'Event sponsorship / speaking',
        'LinkedIn ABM campaign'
    ];
    
    return config.triggers.map((trigger, idx) => ({
        event: trigger,
        urgency: idx < 2 ? 'Immediate' : idx < 4 ? 'Short-term' : 'Long-term',
        likelihood: 90 - (idx * 10),
        signals: [
            `News mention về ${trigger.toLowerCase()}`,
            'Job postings related',
            'Leadership changes',
            'Financial announcements'
        ],
        approach: approaches[idx % approaches.length]
    }));
}

function generatePurchaseBarriers(): PurchaseBarrier[] {
    return [
        {
            barrier: 'Budget constraints / Giá cao',
            category: 'Price',
            severity: 'High',
            overcomingStrategy: 'Offer flexible payment terms, ROI calculator, pilot program with success-based pricing',
            proofPoints: ['3-month payback case study', 'TCO comparison', 'Financing options']
        },
        {
            barrier: 'Fear of implementation complexity',
            category: 'Complexity',
            severity: 'High',
            overcomingStrategy: 'Provide implementation timeline, dedicated CSM, pre-built templates, training included',
            proofPoints: ['2-week avg implementation', 'Customer success stories', 'White-glove onboarding']
        },
        {
            barrier: 'Switching costs from current solution',
            category: 'Competition',
            severity: 'Medium',
            overcomingStrategy: 'Free migration service, parallel running period, data export guarantee',
            proofPoints: ['Migration checklist', 'Zero-downtime guarantee', 'Competitor migration guides']
        },
        {
            barrier: 'Internal politics / Multiple stakeholders',
            category: 'Politics',
            severity: 'Medium',
            overcomingStrategy: 'Provide stakeholder-specific materials, executive sponsor program, champion enablement',
            proofPoints: ['Role-based value props', 'Internal pitch deck', 'Champion toolkit']
        },
        {
            barrier: 'Not the right timing',
            category: 'Timing',
            severity: 'Low',
            overcomingStrategy: 'Stay in touch nurture program, trigger-based re-engagement, cost of delay analysis',
            proofPoints: ['Cost of delay calculator', 'Quick-start options', 'Flexible start dates']
        }
    ];
}

function generateSentimentAnalysis(): CustomerInsightsReport['sentimentAnalysis'] {
    const positive = 45 + Math.floor(Math.random() * 25);
    const negative = 10 + Math.floor(Math.random() * 15);
    const neutral = 100 - positive - negative;
    
    return {
        overall: (positive - negative) / 10 + 5,
        positive,
        neutral,
        negative,
        trend: positive > 55 ? 'Improving' : positive < 40 ? 'Declining' : 'Stable',
        topPositiveThemes: [
            'Excellent customer support',
            'Easy to use interface',
            'Good value for money',
            'Fast implementation',
            'Reliable performance'
        ].slice(0, 3 + Math.floor(Math.random() * 2)),
        topNegativeThemes: [
            'Limited customization',
            'Mobile app needs improvement',
            'Reporting could be better',
            'Occasional performance issues'
        ].slice(0, 2 + Math.floor(Math.random() * 2))
    };
}

function generateFeatureRequests(industry: string): FeatureRequest[] {
    const requests: Record<string, FeatureRequest[]> = {
        'Technology': [
            { feature: 'API rate limit increase', votes: 156, priority: 'High', segment: 'Enterprise', status: 'In Progress' },
            { feature: 'Custom webhook support', votes: 134, priority: 'High', segment: 'All', status: 'Planned' },
            { feature: 'GraphQL API support', votes: 98, priority: 'Medium', segment: 'Tech-savvy', status: 'Considering' },
            { feature: 'SSO integration (SAML/OAuth)', votes: 87, priority: 'Critical', segment: 'Enterprise', status: 'In Progress' },
            { feature: 'Audit log export', votes: 76, priority: 'Medium', segment: 'Enterprise', status: 'Planned' }
        ],
        'Fintech': [
            { feature: 'PCI-DSS compliance dashboard', votes: 189, priority: 'Critical', segment: 'All', status: 'In Progress' },
            { feature: 'Real-time fraud alerts', votes: 167, priority: 'Critical', segment: 'All', status: 'Planned' },
            { feature: 'Multi-currency support', votes: 145, priority: 'High', segment: 'International', status: 'Planned' },
            { feature: 'Regulatory report automation', votes: 123, priority: 'High', segment: 'Enterprise', status: 'Considering' }
        ],
        'Default': [
            { feature: 'Mobile app improvements', votes: 234, priority: 'High', segment: 'All', status: 'In Progress' },
            { feature: 'Advanced reporting/analytics', votes: 198, priority: 'High', segment: 'All', status: 'Planned' },
            { feature: 'Bulk import/export', votes: 156, priority: 'Medium', segment: 'SMB', status: 'Planned' },
            { feature: 'Slack/Teams integration', votes: 143, priority: 'Medium', segment: 'All', status: 'In Progress' },
            { feature: 'Custom fields', votes: 132, priority: 'Medium', segment: 'All', status: 'Considering' }
        ]
    };
    
    return requests[industry] || requests['Default'];
}

// ==================== MAIN FUNCTION ====================
export async function generateCustomerInsights(params: {
    companyName: string;
    industry?: string;
    products?: string;
    targetMarket?: string;
}): Promise<CustomerInsightsReport> {
    const { companyName, industry = 'Technology', products = '', targetMarket = 'Vietnam' } = params;
    
    // Load company data if available
    let companyData: any = null;
    try {
        const allCompanies = await loadAllCompanies();
        companyData = allCompanies.find(c => 
            c.name.toLowerCase().includes(companyName.toLowerCase()) ||
            companyName.toLowerCase().includes(c.name.toLowerCase())
        );
    } catch (err) {
        console.log('Could not load company data:', err);
    }
    
    const detectedIndustry = companyData?.industry || industry;
    const config = getIndustryConfig(detectedIndustry);
    
    // Generate all tiers
    const icp = generateICP(config, companyData);
    const personas = getPersonas(detectedIndustry);
    const painPoints = getPainPoints(detectedIndustry);
    const triggers = generateTriggerEvents(config);
    const barriers = generatePurchaseBarriers();
    const sentiment = generateSentimentAnalysis();
    const featureRequests = generateFeatureRequests(detectedIndustry);
    
    const report: CustomerInsightsReport = {
        generatedAt: new Date().toISOString(),
        companyName,
        industry: detectedIndustry,
        
        // Tier 1: Who are they?
        idealCustomerProfile: icp,
        userPersonas: personas,
        
        // Tier 2: Why they buy?
        painPoints,
        desiredOutcomes: [
            { outcome: 'Giảm chi phí vận hành', metric: '20-30% cost reduction', timeframe: '6 months' },
            { outcome: 'Tăng hiệu suất nhân viên', metric: '40% productivity increase', timeframe: '3 months' },
            { outcome: 'Cải thiện customer experience', metric: 'NPS +20 points', timeframe: '12 months' },
            { outcome: 'Accelerate time-to-market', metric: '50% faster delivery', timeframe: '6 months' },
            { outcome: 'Giảm rủi ro compliance', metric: 'Zero audit findings', timeframe: 'Ongoing' }
        ],
        triggerEvents: triggers,
        
        // Tier 3: How they buy?
        buyingProcess: BUYING_PROCESS_TEMPLATES,
        purchaseBarriers: barriers,
        buyingCommittee: {
            avgSize: 3 + Math.floor(Math.random() * 3),
            typicalCycle: `${config.buyingCycleDays} days`,
            budgetHolder: config.decisionMakers.find(d => d.role === 'Economic Buyer')?.title || 'CEO'
        },
        
        // Tier 4: Voice of Customer
        commonObjections: OBJECTION_TEMPLATES,
        sentimentAnalysis: sentiment,
        featureRequests,
        npsScore: 35 + Math.floor(Math.random() * 35),
        
        // Summary
        executiveSummary: {
            overview: `Customer insights analysis for ${companyName} in the ${detectedIndustry} industry. Target customers are primarily ${config.targetIndustries.slice(0, 3).join(', ')} companies in ${targetMarket}. The typical buying cycle is ${config.buyingCycleDays} days with ${3 + Math.floor(Math.random() * 3)} stakeholders involved.`,
            keyInsights: [
                `ICP: ${icp.firmographics.companySize.join(' or ')} companies in ${icp.firmographics.industries.slice(0, 3).join(', ')}`,
                `Top Pain Point: ${painPoints[0]?.pain || 'Efficiency challenges'}`,
                `Primary Decision Maker: ${icp.decisionMakers.find(d => d.role === 'Economic Buyer')?.title || 'CEO'}`,
                `Most Common Objection: "${OBJECTION_TEMPLATES[0].objection}"`,
                `Sentiment: ${sentiment.positive}% positive, trending ${sentiment.trend.toLowerCase()}`
            ],
            recommendations: [
                `Focus sales efforts on ${triggers[0]?.event || 'growth'} trigger events`,
                `Create content addressing "${painPoints[0]?.pain || 'efficiency'}" pain point`,
                `Develop objection handling playbook for top 5 objections`,
                `Build champion enablement kit for ${icp.decisionMakers.find(d => d.role === 'Champion')?.title || 'internal champions'}`,
                `Prioritize ${featureRequests[0]?.feature || 'top requested features'} in product roadmap`
            ]
        }
    };
    
    return report;
}

export default generateCustomerInsights;
