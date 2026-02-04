/**
 * 🎯 Competitor Intelligence Service - GlobalCopilot Style Analysis
 * Tích hợp:
 * - Tìm kiếm công ty đối thủ từ BOTH sources (CSV + TS)
 * - Lấy tin tức cho tất cả đối thủ
 * - So sánh chiến lược GTM
 * - Phân tích thị trường
 */

import { getCompanyNews, NewsItem } from './newsService';
import { CopilotService, GlobalCopilotReport } from './CopilotService';
import { GTMStrategyService } from './gtmStrategyService';
import { findTopCompetitors, NormalizedCompany, CompetitorMatch, searchCompaniesByName } from './competitorEngine';

export interface CompetitorProfile {
    name: string;
    industry: string;
    location?: string;
    website?: string;
    about?: string;
    fundingStage?: string;
    employeeCount?: number;
    similarity?: number;           // NEW: similarity score (0-100)
    matchReasons?: string[];       // NEW: why this is a match
    source?: 'ts' | 'csv';         // NEW: data source
}

export interface CompetitorIntelligence {
    competitor: CompetitorProfile;
    news: NewsItem[];
    newsSummary: string;
    gtmStrategy?: string;
    marketPosition: {
        marketShare?: number;
        growthRate?: number;
        visibility?: number;
    };
}

export interface CompetitorComparison {
    primaryCompany: string;
    competitors: CompetitorIntelligence[];
    overallAnalysis: string;
    strategicInsights: string[];
    opportunities: string[];
    threats: string[];
    recommendations: string[];
    timestamp: string;
}

/**
 * Fetch competitors from UNIFIED ENGINE (CSV + TS sources)
 * 🆕 Uses the new competitorEngine.ts with Jaccard similarity
 */
export const getCompetitors = async (companyName: string): Promise<CompetitorProfile[]> => {
    try {
        console.log(`🔍 Finding competitors for: "${companyName}" (using Unified Engine)`);
        
        if (!companyName || !companyName.trim()) {
            console.warn('⚠️ Empty company name, using mock data');
            return generateMockCompetitors('Vingroup');
        }
        
        // 🆕 Use the new unified competitor engine
        const result = await findTopCompetitors(companyName.trim(), 10, 20);
        
        console.log(`📊 Engine stats: ${result.totalCandidates} total companies, ${result.competitors.length} matches in ${result.searchTime}ms`);
        
        if (result.competitors.length === 0) {
            console.warn('⚠️ No competitors found from engine, using mock data');
            return generateMockCompetitors(companyName);
        }
        
        // Convert to CompetitorProfile format
        const competitors: CompetitorProfile[] = result.competitors.map(match => ({
            name: match.company.name,
            industry: match.company.industry,
            location: match.company.location || undefined,
            website: match.company.website || undefined,
            about: match.company.description?.substring(0, 300) || undefined,
            employeeCount: parseEmployeeCount(match.company.employeeSize),
            similarity: match.similarity,
            matchReasons: match.matchReasons,
            source: match.company.source
        }));
        
        console.log(`✅ Returning ${competitors.length} competitors with similarity scores`);
        return competitors;

    } catch (error) {
        console.error(`❌ Competitor fetch error:`, error);
        console.warn(`Using mock data for: ${companyName}`);
        return generateMockCompetitors(companyName);
    }
};

/**
 * Parse employee count from string like "Từ 11 - 50 người" or "> 6.000 người"
 */
function parseEmployeeCount(sizeStr?: string): number | undefined {
    if (!sizeStr) return undefined;
    
    const match = sizeStr.match(/(\d+(?:[.,]\d+)?)/);
    if (match) {
        return parseInt(match[1].replace(/[.,]/g, ''));
    }
    return undefined;
}

/**
 * Generate mock competitors for demonstration (when API not available)
 */
const generateMockCompetitors = (companyName: string): CompetitorProfile[] => {
    console.log(`📊 Generating mock competitors for: "${companyName}"`);
    
    const competitors: { [key: string]: CompetitorProfile[] } = {
        'Vingroup': [
            { name: 'Samsung Vietnam', industry: 'Technology', location: 'Ho Chi Minh City', fundingStage: 'Multinational', employeeCount: 5000 },
            { name: 'LG Electronics Vietnam', industry: 'Technology', location: 'Ho Chi Minh City', fundingStage: 'Multinational', employeeCount: 3000 },
            { name: 'FPT Corporation', industry: 'Technology', location: 'Hanoi', fundingStage: 'Public', employeeCount: 8000 },
            { name: 'Viettel Group', industry: 'Telecommunications', location: 'Hanoi', fundingStage: 'State-Owned', employeeCount: 20000 },
        ],
        'FPT': [
            { name: 'Viettel Group', industry: 'Telecommunications', location: 'Hanoi', fundingStage: 'State-Owned', employeeCount: 20000 },
            { name: 'Vingroup', industry: 'Technology', location: 'Ho Chi Minh City', fundingStage: 'Private', employeeCount: 10000 },
            { name: 'VNPT', industry: 'Telecommunications', location: 'Hanoi', fundingStage: 'State-Owned', employeeCount: 15000 },
            { name: 'Techcombank', industry: 'Finance', location: 'Ho Chi Minh City', fundingStage: 'Public', employeeCount: 2000 },
        ],
        'Samsung Vietnam': [
            { name: 'LG Electronics Vietnam', industry: 'Technology', location: 'Ho Chi Minh City', fundingStage: 'Multinational', employeeCount: 3000 },
            { name: 'Intel Vietnam', industry: 'Technology', location: 'Ho Chi Minh City', fundingStage: 'Multinational', employeeCount: 2000 },
            { name: 'Apple Vietnam', industry: 'Technology', location: 'Ho Chi Minh City', fundingStage: 'Multinational', employeeCount: 1500 },
            { name: 'Vingroup', industry: 'Technology', location: 'Ho Chi Minh City', fundingStage: 'Private', employeeCount: 10000 },
        ],
    };

    const result = competitors[companyName] || competitors['Vingroup'];
    console.log(`✅ Using ${result.length} mock competitors`);
    return result;
};

/**
 * Lấy tin tức cho một công ty đối thủ
 */
export const fetchCompetitorNews = async (competitor: CompetitorProfile): Promise<NewsItem[]> => {
    try {
        console.log(`📰 Fetching news for competitor: ${competitor.name}`);
        const news = await getCompanyNews(competitor.name);
        return news;
    } catch (error) {
        console.error(`❌ Error fetching news for ${competitor.name}:`, error);
        return [];
    }
};

/**
 * Tóm tắt tin tức của một công ty đối thủ bằng AI
 */
export const summarizeCompetitorNews = async (
    competitorName: string,
    news: NewsItem[]
): Promise<string> => {
    if (news.length === 0) {
        return `No recent news found for ${competitorName}.`;
    }

    try {
        const newsText = news
            .map(n => `- ${n.title}: ${n.content}`)
            .join('\n');

        // Use the report generation and extract text
        const report = await CopilotService.generateFullReport(competitorName, 'Technology', [], newsText);
        
        if (report && report.market && report.market.environment) {
            // Extract summary from the report
            const summary = report.market.environment.substring(0, 300) + '...';
            return summary;
        }
        
        return `News summary for ${competitorName}: ${newsText.substring(0, 200)}...`;

    } catch (error) {
        console.error(`❌ Error summarizing news for ${competitorName}:`, error);
        return `Unable to summarize news for ${competitorName} at this moment.`;
    }
};

/**
 * Lấy thông tin chi tiết về một công ty đối thủ (bao gồm tin tức + GTM)
 */
export const getCompetitorIntelligence = async (
    competitor: CompetitorProfile
): Promise<CompetitorIntelligence> => {
    try {
        const [news, newsSummary] = await Promise.all([
            fetchCompetitorNews(competitor),
            summarizeCompetitorNews(competitor.name, await fetchCompetitorNews(competitor)),
        ]);

        // Mô phỏng market position (trong thực tế sẽ từ database)
        const marketPosition = {
            marketShare: Math.random() * 30 + 10,
            growthRate: Math.random() * 25 + 5,
            visibility: Math.random() * 100,
        };

        return {
            competitor,
            news: news.slice(0, 5),
            newsSummary,
            marketPosition,
        };

    } catch (error) {
        console.error(`❌ Error getting intelligence for ${competitor.name}:`, error);
        return {
            competitor,
            news: [],
            newsSummary: 'Unable to fetch intelligence at this moment.',
            marketPosition: {},
        };
    }
};

/**
 * 🎯 GlobalCopilot-style Competitor Comparison
 * Lấy tất cả đối thủ, phân tích, và tạo báo cáo so sánh
 */
export const generateCompetitorComparison = async (
    primaryCompanyName: string
): Promise<CompetitorComparison> => {
    try {
        console.log(`🎯 Starting Competitor Comparison for: "${primaryCompanyName}"`);
        
        if (!primaryCompanyName || primaryCompanyName.trim() === '') {
            console.warn('⚠️ Empty company name provided, using Vingroup');
            return generateCompetitorComparison('Vingroup');
        }

        // 1. Lấy danh sách đối thủ
        const competitors = await getCompetitors(primaryCompanyName);
        console.log(`✅ Found ${competitors.length} competitors`);
        
        if (competitors.length === 0) {
            console.warn('⚠️ No competitors found!');
            throw new Error('No competitors found for analysis');
        }

        // 2. Lấy thông tin chi tiết cho từng đối thủ
        const competitorIntelligence = await Promise.all(
            competitors.slice(0, 5).map(c => getCompetitorIntelligence(c))
        );
        console.log(`✅ Gathered intelligence on ${competitorIntelligence.length} competitors`);

        // 3. Tạo báo cáo tổng hợp bằng AI
        const newsContext = competitorIntelligence
            .map(ci => `${ci.competitor.name}: ${ci.newsSummary}`)
            .join('\n\n');

        const comparisonPrompt = `
Phân tích so sánh cạnh tranh giữa ${primaryCompanyName} và các đối thủ:

${newsContext}

Hãy cung cấp:
1. Phân tích tổng quát về thị trường
2. 3-4 insights chiến lược chính
3. 2-3 cơ hội tăng trưởng
4. 2-3 mối đe dọa cạnh tranh
5. 2-3 khuyến nghị hành động

Format: JSON với các keys: overallAnalysis, strategicInsights[], opportunities[], threats[], recommendations[]
`;

        const aiAnalysis = await CopilotService.generateFullReport(primaryCompanyName, 'Technology', competitors.map(c => c.name), newsContext);
        
        let parsedAnalysis = {
            overallAnalysis: aiAnalysis?.market?.environment || 'Market analysis in progress',
            strategicInsights: aiAnalysis?.market?.trends || ['Market consolidation accelerating', 'Digital transformation critical', 'Regional expansion opportunities'],
            opportunities: [],
            threats: [],
            recommendations: aiAnalysis?.advisory?.recommendations?.map((r: any) => r.title) || ['Focus on differentiation', 'Build ecosystem partnerships', 'Invest in innovation'],
        };

        try {
            if (aiAnalysis && aiAnalysis.market) {
                // Try to parse insights from the report
                parsedAnalysis.overallAnalysis = aiAnalysis.market.environment?.substring(0, 500) || parsedAnalysis.overallAnalysis;
            }
        } catch (e) {
            console.warn('Could not parse AI response, using defaults');
        }

        return {
            primaryCompany: primaryCompanyName,
            competitors: competitorIntelligence,
            overallAnalysis: parsedAnalysis.overallAnalysis,
            strategicInsights: parsedAnalysis.strategicInsights || [],
            opportunities: parsedAnalysis.opportunities || [],
            threats: parsedAnalysis.threats || [],
            recommendations: parsedAnalysis.recommendations || [],
            timestamp: new Date().toISOString(),
        };

    } catch (error) {
        console.error('❌ Error generating competitor comparison:', error);
        console.log('📊 Returning default comparison as fallback...');
        
        // Return default comparison if something goes wrong
        return createDefaultComparison(primaryCompanyName, []);
    }
};

/**
 * Create default comparison when analysis fails
 */
const createDefaultComparison = (companyName: string, competitors: CompetitorIntelligence[]): CompetitorComparison => {
    return {
        primaryCompany: companyName,
        competitors: competitors.length > 0 ? competitors : [],
        overallAnalysis: `Competitive landscape analysis for ${companyName}. The market shows dynamic growth with multiple players competing across different segments.`,
        strategicInsights: [
            'Market consolidation is accelerating in the technology sector',
            'Digital transformation capabilities becoming critical differentiator',
            'Regional expansion strategies intensifying competition',
            'Customer experience and innovation central to competitive advantage'
        ],
        opportunities: [
            'Southeast Asia market expansion with growing demand',
            'AI and ML integration creating new value propositions',
            'B2B partnership and ecosystem building opportunities'
        ],
        threats: [
            'Intense price competition eroding margins',
            'New market entrants with disruptive models',
            'Supply chain disruptions affecting operations'
        ],
        recommendations: [
            'Focus on differentiation through innovation and quality',
            'Build strategic partnerships and ecosystem alliances',
            'Invest in digital capabilities and talent development'
        ],
        timestamp: new Date().toISOString(),
    };
};

/**
 * Lấy danh sách công ty để so sánh (batch processing)
 */
export const getMultipleCompetitorIntelligence = async (
    competitorNames: string[]
): Promise<CompetitorIntelligence[]> => {
    return Promise.all(
        competitorNames.map(async (name) => {
            const profile: CompetitorProfile = { name, industry: 'Technology' };
            return getCompetitorIntelligence(profile);
        })
    );
};
