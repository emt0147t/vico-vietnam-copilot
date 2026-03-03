
import { Type, FunctionDeclaration } from '@google/genai';
import { RagService } from './ragLayer';
import { getCompanyNews } from './newsService';

// Proxy Gemini requests through the backend to keep API key secure.
// Includes exponential backoff on 429 (rate-limit) to prevent cascading failures.
async function proxyGenerateContent(config: {
    contents: any[];
    systemInstruction?: string;
    tools?: any[];
    temperature?: number;
    maxOutputTokens?: number;
}): Promise<{ text: string; functionCalls: any[] }> {
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        // Abort after 30 s so the UI never hangs forever
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);

        let res: Response;
        try {
            res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
                signal: controller.signal,
            });
        } catch (err: any) {
            clearTimeout(timer);
            if (err.name === 'AbortError') throw new Error('⏳ Yêu cầu quá lâu. Vui lòng thử lại.');
            throw err;
        } finally {
            clearTimeout(timer);
        }

        // Retry on 429 with exponential backoff (2 s, 4 s, 8 s)
        if (res.status === 429 && attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt + 1) * 1000;
            console.warn(`⏳ Chat rate-limited (429), retry ${attempt + 1}/${MAX_RETRIES} in ${delay / 1000}s…`);
            await new Promise(r => setTimeout(r, delay));
            continue;
        }

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.text || data.error || `HTTP ${res.status}`);
        }
        return res.json();
    }
    throw new Error('⚠️ Quá nhiều yêu cầu. Vui lòng đợi vài giây và thử lại.');
}

/** Run a tool with a 15-second timeout so a broken endpoint never blocks AI */
async function executeToolWithTimeout(name: string, args: any, timeoutMs = 15_000): Promise<any> {
    return Promise.race([
        executeTool(name, args),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Tool "${name}" timed out after ${timeoutMs / 1000}s`)), timeoutMs)),
    ]).catch(err => ({ error: err instanceof Error ? err.message : 'Tool failed' }));
}

const SYSTEM_PROMPT = `Bạn là **VICO AI** — trợ lý trí tuệ nhân tạo của nền tảng VICO (Vietnam Copilot), chuyên về phân tích thị trường Việt Nam.

**Về VICO:**
VICO là nền tảng Market Intelligence hàng đầu cho thị trường Việt Nam, phục vụ doanh nghiệp, nhà đầu tư, và nhà phân tích chiến lược. Hệ thống bao gồm:
- Cơ sở dữ liệu 10,000+ công ty Việt Nam (30+ ngành nghề)
- Phân tích đối thủ cạnh tranh đa chiều (similarity scoring, SWOT, battlecards)
- Tin tức thị trường thời gian thực từ Google News RSS
- Market Intelligence: TAM/SAM/SOM, Porter's 5 Forces, xu hướng ngành
- **PESTEL Analysis**: 22 yếu tố vĩ mô Việt Nam (Chính trị, Kinh tế, Xã hội, Công nghệ, Môi trường, Pháp lý)
- **Structured Event Extraction**: Tự động phát hiện sự kiện kinh doanh (gọi vốn, M&A, IPO, bổ nhiệm, ra mắt sản phẩm...)
- Chiến lược Go-To-Market & Living Playbook
- Customer Insights: ICP, personas, pain points, VOC
- RAG Engine với vector search trên toàn bộ dữ liệu

**Dữ liệu vĩ mô Việt Nam bạn nắm rõ:**
- GDP tăng trưởng 7.09% (2024), lạm phát 3.63%, FDI $23.8B
- 16 hiệp định thương mại tự do (EVFTA, CPTPP, RCEP...)
- Dân số 100.3M, tuổi trung vị 32.5, smartphone 73.5%
- 5G triển khai thương mại 2024, GII rank 44 toàn cầu
- Net Zero 2050, carbon market pilot 2025
- Nghị định 13/2023 về bảo vệ dữ liệu cá nhân

**Khả năng của bạn:**
1. 🔍 Tra cứu thông tin bất kỳ công ty Việt Nam (tên, ngành, sản phẩm, quy mô, trụ sở...)
2. 📰 Tìm kiếm tin tức mới nhất về bất kỳ chủ đề thị trường nào
3. ⚔️ Phân tích đối thủ cạnh tranh cho một công ty
4. 🧠 Tìm kiếm deep trong kho tri thức VICO (vector search)
5. 💡 Cung cấp tư vấn chiến lược, insight thị trường Việt Nam
6. 🏛️ Phân tích PESTEL cho bất kỳ ngành nghề nào tại Việt Nam
7. 📊 Tra cứu dữ liệu vĩ mô Việt Nam (GDP, lạm phát, FDI, dân số, công nghệ...)

**Quy tắc trả lời:**
- Ưu tiên tiếng Việt. Nếu user viết tiếng Anh, trả lời tiếng Anh.
- Ngắn gọn, chuyên nghiệp, dễ hiểu. Không dài dòng.
- Dùng markdown: **bold**, bullet list, heading khi phù hợp.
- Đưa ra số liệu cụ thể khi có dữ liệu từ tools.
- Gợi ý hành động tiếp theo cho user khi phù hợp.
- Khi dùng dữ liệu từ tool, hãy trích dẫn nguồn (ví dụ: "Theo dữ liệu VICO...", "Theo GSO...").
- Không bịa thông tin. Nếu không có dữ liệu, nói rõ.`;

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    isLoading?: boolean;
    toolsUsed?: string[];
}

// Tool declarations for Gemini function calling
const TOOL_DECLARATIONS: FunctionDeclaration[] = [
    {
        name: 'search_companies',
        description: 'Tìm kiếm công ty Việt Nam theo tên, ngành nghề, hoặc từ khóa. Dùng khi user hỏi về một công ty cụ thể, tìm công ty theo ngành, hoặc muốn biết thông tin doanh nghiệp.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'Tên công ty hoặc từ khóa (ví dụ: "VinFast", "công nghệ", "fintech")' }
            },
            required: ['query']
        }
    },
    {
        name: 'get_latest_news',
        description: 'Lấy tin tức mới nhất từ Google News về một chủ đề, công ty, hoặc ngành nghề tại Việt Nam. Dùng khi user hỏi về tin tức, sự kiện gần đây.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'Chủ đề tin tức (ví dụ: "VinFast IPO", "thị trường bất động sản", "AI Việt Nam")' }
            },
            required: ['query']
        }
    },
    {
        name: 'find_competitors',
        description: 'Tìm đối thủ cạnh tranh của một công ty dựa trên similarity scoring đa chiều (ngành, sản phẩm, quy mô, vị trí). Dùng khi user hỏi về đối thủ hoặc cạnh tranh.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                company: { type: Type.STRING, description: 'Tên công ty cần tìm đối thủ' },
                limit: { type: Type.NUMBER, description: 'Số lượng đối thủ (mặc định 8)' }
            },
            required: ['company']
        }
    },
    {
        name: 'search_knowledge_base',
        description: 'Tìm kiếm deep trong kho tri thức VICO bằng vector search. Dùng cho câu hỏi tổng quát về thị trường, xu hướng, chiến lược, hoặc khi cần insight sâu.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'Câu hỏi hoặc chủ đề cần tìm kiếm' }
            },
            required: ['query']
        }
    },
    {
        name: 'get_pestel_analysis',
        description: 'Phân tích PESTEL (Chính trị, Kinh tế, Xã hội, Công nghệ, Môi trường, Pháp lý) cho một ngành nghề tại Việt Nam. Dùng khi user hỏi về môi trường vĩ mô, yếu tố ảnh hưởng ngành, rủi ro chính sách, hoặc phân tích PESTEL.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                industry: { type: Type.STRING, description: 'Ngành nghề cần phân tích (ví dụ: "Technology", "Finance", "Manufacturing")' },
                company: { type: Type.STRING, description: 'Tên công ty cụ thể (tùy chọn, để phân tích sâu hơn)' },
            },
            required: ['industry']
        }
    },
    {
        name: 'get_vietnam_macro',
        description: 'Lấy dữ liệu vĩ mô Việt Nam: GDP, lạm phát, FDI, dân số, công nghệ, FTA, và các chỉ số kinh tế khác. Dùng khi user hỏi về kinh tế Việt Nam, số liệu quốc gia, hoặc so sánh quốc tế.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING, description: 'Chủ đề vĩ mô (ví dụ: "GDP", "FDI", "demographics", "trade", "technology", "all")' }
            },
            required: ['topic']
        }
    },
    {
        name: 'generate_customer_insights',
        description: 'Phân tích khách hàng mục tiêu của một công ty: ICP (Ideal Customer Profile), personas, pain points, buying journey. Sử dụng AI để tạo báo cáo chi tiết.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                company_name: { type: Type.STRING, description: 'Tên công ty cần phân tích (ví dụ: "FPT", "Vingroup")' },
                industry: { type: Type.STRING, description: 'Ngành nghề của công ty (để tối ưu kết quả)' }
            },
            required: ['company_name']
        }
    },
    {
        name: 'get_trade_data',
        description: 'Tra cứu dữ liệu thương mại Việt Nam: xuất nhập khẩu theo mặt hàng hoặc ngành nghề, cán cân thương mại, đối tác chính. Nguồn: Tổng cục Hải quan, GSO.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'Mặt hàng hoặc ngành (ví dụ: "cà phê", "gạo", "Technology", "phone")' }
            },
            required: ['query']
        }
    },
    {
        name: 'get_industry_analytics',
        description: 'Phân tích chi số ngành (VICO Market Index): mật độ tập trung, top công ty, sức khỏe ngành, xu hướng tuyển dụng. Dữ liệu từ VICO database.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                industry: { type: Type.STRING, description: 'Ngành cần phân tích (ví dụ: "Technology", "Finance", "Healthcare")' }
            },
            required: ['industry']
        }
    }
];

// Execute a tool and return results
async function executeTool(name: string, args: any): Promise<any> {
    try {
        switch (name) {
            case 'search_companies': {
                const res = await fetch(`/api/companies/search?q=${encodeURIComponent(args.query)}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                // Trim data to avoid sending too much to Gemini
                const companies = (data.companies || []).slice(0, 8).map((c: any) => ({
                    name: c.name,
                    industry: c.industry,
                    products: c.products?.substring(0, 200),
                    intro: c.intro?.substring(0, 200) || c.intro_new?.substring(0, 200),
                    size: c.size,
                    year: c.year,
                    website: c.website,
                    address: c.address,
                }));
                return { total: data.total, companies, query: args.query };
            }

            case 'get_latest_news': {
                const news = await getCompanyNews(args.query);
                return {
                    articles: news.slice(0, 6).map((n: any) => ({
                        title: n.title,
                        source: n.source || 'Google News',
                        pubDate: n.pubDate,
                        content: n.content?.substring(0, 150),
                        link: n.link,
                    })),
                    query: args.query,
                };
            }

            case 'find_competitors': {
                const limit = args.limit || 8;
                const res = await fetch(`/api/companies/competitors?company=${encodeURIComponent(args.company)}&limit=${limit}&minSimilarity=25&source=all`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                return {
                    targetCompany: data.company,
                    industry: data.industry,
                    competitors: (data.competitors || []).slice(0, limit).map((c: any) => ({
                        name: c.name,
                        industry: c.industry,
                        similarity: c.similarity,
                        matchReasons: c.matchReasons,
                        about: c.about?.substring(0, 150),
                    })),
                    searchTimeMs: data.searchTimeMs,
                };
            }

            case 'search_knowledge_base': {
                const results = await RagService.search(args.query, 5);
                return {
                    results: results.map((r: any) => ({
                        text: r.text?.substring(0, 300),
                        score: Math.round(r.score * 100) / 100,
                        metadata: r.metadata,
                    })),
                    query: args.query,
                };
            }

            case 'get_pestel_analysis': {
                const res = await fetch(`/api/pestel?industry=${encodeURIComponent(args.industry)}${args.company ? `&company=${encodeURIComponent(args.company)}` : ''}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                // Trim to essential data for Gemini context
                const report = data.data;
                return {
                    industry: report.industry || args.industry,
                    overallScore: report.overallScore,
                    assessment: report.overallAssessment,
                    dimensions: report.dimensions?.map((d: any) => ({
                        name: d.label,
                        score: d.overallScore,
                        trend: d.overallTrend,
                        summary: d.summary,
                        topFactors: d.factors?.slice(0, 2).map((f: any) => ({
                            title: f.title,
                            score: f.score,
                            trend: f.trend,
                            evidence: f.evidence?.slice(0, 2),
                        })),
                    })),
                };
            }

            case 'get_vietnam_macro': {
                // Import macro data from Phase 1-2 data files
                const { getVietnamMacroSummary } = await import('../data/vietnamMarketData');
                const { getOverallPESTELScore, VIETNAM_PESTEL_FACTORS } = await import('../data/pestelData');

                const macro = getVietnamMacroSummary();
                const topic = (args.topic || 'all').toLowerCase();

                const result: any = { topic, country: 'Vietnam' };

                if (topic === 'all' || topic === 'gdp' || topic === 'economic') {
                    result.economy = {
                        gdpUsdBillion: macro.gdpUsd,
                        gdpGrowthPct: macro.gdpGrowthPct,
                        inflationPct: macro.inflationPct,
                        year: macro.year,
                    };
                }

                if (topic === 'all' || topic === 'demographics' || topic === 'population') {
                    result.demographics = {
                        populationMillion: macro.populationMillion,
                        medianAge: macro.medianAge,
                        urbanizationPct: macro.urbanizationPct,
                        laborForceMillion: macro.laborForceMillion,
                    };
                }

                if (topic === 'all' || topic === 'fdi' || topic === 'investment') {
                    result.fdi = {
                        fdiUsdBillion: macro.fdiUsdBillion,
                    };
                }

                if (topic === 'all' || topic === 'trade' || topic === 'fta') {
                    result.trade = {
                        majorFTAs: ['EVFTA', 'CPTPP', 'RCEP', 'AKFTA', 'AJCEP', 'VKFTA'],
                    };
                }

                if (topic === 'all' || topic === 'technology' || topic === 'digital') {
                    result.technology = {
                        internetPenetrationPct: macro.internetPenetrationPct,
                        smartphonePenetrationPct: macro.smartphonePenetrationPct,
                    };
                }

                result.pestelOverallScore = getOverallPESTELScore();
                result.totalPestelFactors = VIETNAM_PESTEL_FACTORS.length;
                result.dataSources = ['GSO', 'World Bank', 'IMF', 'MIC', 'SBV', 'MPI'];

                return result;
            }

            case 'generate_customer_insights': {
                const res = await fetch('/api/customer-insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        companyName: args.company_name,
                        industry: args.industry || 'Technology',
                    }),
                });
                if (!res.ok) {
                    return { error: `Customer insights API returned ${res.status}` };
                }
                const report = await res.json();
                // Return a summary (not full report) to keep Gemini context small
                return {
                    companyName: report.companyName || args.company_name,
                    industry: report.industry || args.industry,
                    dataSource: report.dataSource || 'estimated',
                    icpSummary: report.idealCustomerProfile?.firmographics || null,
                    topPersonas: (report.personas || []).slice(0, 2).map((p: any) => ({
                        name: p.name,
                        title: p.title,
                        goals: p.goals?.slice(0, 3),
                        frustrations: p.frustrations?.slice(0, 3),
                    })),
                    topPainPoints: (report.painPoints || []).slice(0, 3).map((pp: any) => ({
                        pain: pp.pain,
                        severity: pp.severity,
                        category: pp.category,
                    })),
                    npsScore: report.npsScore,
                    executiveSummary: report.executiveSummary?.overview || null,
                };
            }

            case 'get_trade_data': {
                const query = args.query || '';
                // Try commodity first
                let res = await fetch(`/api/trade?commodity=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        return {
                            type: 'commodity',
                            commodity: data.commodity,
                            commodityVi: data.commodityVi,
                            exportValue2024: data.exportValue2024,
                            importValue2024: data.importValue2024,
                            tradeBalance: data.computed?.tradeBalance2024,
                            exportGrowthPct: data.computed?.exportGrowthPct,
                            topExportDestinations: data.topExportDestinations?.slice(0, 3),
                            topImportSources: data.topImportSources?.slice(0, 3),
                            dataSource: data.dataSource,
                        };
                    }
                }
                // Try industry
                res = await fetch(`/api/trade?industry=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        return {
                            type: 'industry',
                            industry: data.industry,
                            totalExport2024: data.totalExport2024,
                            totalImport2024: data.totalImport2024,
                            tradeBalance2024: data.tradeBalance2024,
                            yoyExportGrowth: data.yoyExportGrowth,
                            majorTradingPartners: data.majorTradingPartners,
                            keyExportCommodities: data.keyExportCommodities,
                            dataSource: data.dataSource,
                        };
                    }
                }
                // Fallback: return summary
                const summaryRes = await fetch('/api/trade?summary=true');
                const summaryData = summaryRes.ok ? await summaryRes.json() : null;
                return {
                    type: 'summary',
                    message: `Không tìm thấy dữ liệu cụ thể cho "${query}". Đây là tổng quan thương mại Việt Nam 2024:`,
                    ...(summaryData || {}),
                };
            }

            case 'get_industry_analytics': {
                const industry = args.industry || 'Technology';
                const res = await fetch(`/api/analytics?industry=${encodeURIComponent(industry)}`);
                if (!res.ok) {
                    return { error: `Analytics API returned ${res.status} for "${industry}"` };
                }
                const data = await res.json();
                if (!data.success) {
                    return { error: data.error || `No analytics for "${industry}"` };
                }
                return {
                    industry: data.industry,
                    totalCompanies: data.totalCompanies,
                    totalEmployees: data.totalEmployees,
                    estimatedMarketSize: data.estimatedMarketSize,
                    concentration: {
                        level: data.concentrationRatio?.marketConcentration,
                        top5Share: data.concentrationRatio?.top5EmployeeShare,
                        top5: data.concentrationRatio?.top5Companies?.map((c: any) => c.name),
                    },
                    health: {
                        dynamicScore: data.industryHealth?.dynamicScore,
                        sentimentScore: data.industryHealth?.sentimentScore,
                        trend: data.hiringTrend?.trend,
                        growthPct: data.hiringTrend?.growthPercentage,
                    },
                };
            }

            default:
                return { error: `Unknown tool: ${name}` };
        }
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Tool execution failed' };
    }
}

let messageIdCounter = 0;
function generateId(): string {
    return `msg_${Date.now()}_${++messageIdCounter}`;
}

class VicoChatService {
    private history: ChatMessage[] = [];

    async sendMessage(userText: string): Promise<ChatMessage> {
        // Add user message
        const userMsg: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: userText.trim(),
            timestamp: Date.now(),
        };
        this.history.push(userMsg);

        try {
            // Limit context to last 24 messages to prevent token overflow
            const recentHistory = this.history.filter(m => !m.isLoading).slice(-24);

            // Build conversation contents for Gemini multi-turn
            const contents = recentHistory.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

            // Call Gemini via server proxy with function calling tools
            let response = await proxyGenerateContent({
                contents,
                systemInstruction: SYSTEM_PROMPT,
                tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
                temperature: 0.7,
                maxOutputTokens: 2048,
            });

            // Function calling loop (max 5 rounds) — accumulate contents
            const toolsUsed: string[] = [];
            let rounds = 0;
            let runningContents: any[] = [...contents];

            while (response.functionCalls && response.functionCalls.length > 0 && rounds < 5) {
                rounds++;

                // Process ALL function calls in this response (parallel execution)
                const calls = response.functionCalls.filter((fc: any) => fc?.name);
                if (calls.length === 0) break;

                const results = await Promise.all(
                    calls.map((fc: any) => {
                        toolsUsed.push(fc.name);
                        return executeToolWithTimeout(fc.name, fc.args || {});
                    }),
                );

                // Append model function-call parts then function-response parts
                runningContents = [
                    ...runningContents,
                    {
                        role: 'model' as const,
                        parts: calls.map((fc: any) => ({ functionCall: { name: fc.name, args: fc.args } })),
                    },
                    ...calls.map((fc: any, i: number) => ({
                        role: 'function' as const,
                        parts: [{ functionResponse: { name: fc.name, response: results[i] } }],
                    })),
                ];

                response = await proxyGenerateContent({
                    contents: runningContents,
                    systemInstruction: SYSTEM_PROMPT,
                    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                });
            }

            const text = response.text || 'Xin lỗi, tôi không thể xử lý yêu cầu này lúc này.';
            return this.addAssistantMessage(text, toolsUsed.length > 0 ? [...new Set(toolsUsed)] : undefined);
        } catch (error) {
            console.error('[VicoChatService] Error:', error);

            // Graceful fallback: try simple chat without function calling
            try {
                const simpleContents = this.history
                    .filter(m => !m.isLoading)
                    .slice(-12)
                    .map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }],
                    }));

                const fallbackResponse = await proxyGenerateContent({
                    contents: simpleContents,
                    systemInstruction: SYSTEM_PROMPT,
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                });

                if (fallbackResponse.text) {
                    return this.addAssistantMessage(fallbackResponse.text);
                }
            } catch (fallbackErr) {
                console.warn('[VicoChatService] Fallback also failed:', fallbackErr);
            }

            // Specific error messages
            const msg = error instanceof Error ? error.message : '';
            if (msg.includes('429') || msg.includes('rate') || msg.includes('RESOURCE_EXHAUSTED')) {
                return this.addAssistantMessage('⚠️ Hệ thống đang bận. Vui lòng đợi 5–10 giây rồi thử lại.');
            }
            if (msg.includes('timeout') || msg.includes('quá lâu') || msg.includes('AbortError')) {
                return this.addAssistantMessage('⏳ Yêu cầu mất quá lâu. Vui lòng thử câu hỏi ngắn hơn hoặc thử lại.');
            }
            if (msg.includes('503') || msg.includes('not configured')) {
                return this.addAssistantMessage('⚠️ AI engine chưa sẵn sàng. Vui lòng thử lại sau.');
            }
            return this.addAssistantMessage(
                '⚠️ Đã xảy ra lỗi khi xử lý. Vui lòng thử lại hoặc đặt câu hỏi khác.\n\n💡 **Thử:** Đặt câu hỏi ngắn gọn hơn hoặc nhấn nút 🗑️ để xóa lịch sử rồi hỏi lại.',
            );
        }
    }

    private addAssistantMessage(content: string, toolsUsed?: string[]): ChatMessage {
        const msg: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content,
            timestamp: Date.now(),
            toolsUsed,
        };
        this.history.push(msg);
        return msg;
    }

    getHistory(): ChatMessage[] {
        return [...this.history];
    }

    clearHistory(): void {
        this.history = [];
    }
}

export const chatService = new VicoChatService();
