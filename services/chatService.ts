
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { RagService } from './ragLayer';
import { getCompanyNews } from './newsService';

const MODEL_NAME = 'gemini-2.0-flash';

// Initialize the AI client with the API key injected by Vite
function getAI(): GoogleGenAI | null {
    try {
        const apiKey = (process.env as any).API_KEY;
        if (!apiKey) return null;
        return new GoogleGenAI({ apiKey });
    } catch {
        return null;
    }
}

const SYSTEM_PROMPT = `Bạn là **VICO AI** — trợ lý trí tuệ nhân tạo của nền tảng VICO (Vietnam Copilot), chuyên về phân tích thị trường Việt Nam.

**Về VICO:**
VICO là nền tảng Market Intelligence hàng đầu cho thị trường Việt Nam, phục vụ doanh nghiệp, nhà đầu tư, và nhà phân tích chiến lược. Hệ thống bao gồm:
- Cơ sở dữ liệu 10,000+ công ty Việt Nam (30+ ngành nghề)
- Phân tích đối thủ cạnh tranh đa chiều (similarity scoring, SWOT, battlecards)
- Tin tức thị trường thời gian thực từ Google News RSS
- Market Intelligence: TAM/SAM/SOM, Porter's 5 Forces, xu hướng ngành
- Chiến lược Go-To-Market & Living Playbook
- Customer Insights: ICP, personas, pain points, VOC
- RAG Engine với vector search trên toàn bộ dữ liệu

**Khả năng của bạn:**
1. 🔍 Tra cứu thông tin bất kỳ công ty Việt Nam (tên, ngành, sản phẩm, quy mô, trụ sở...)
2. 📰 Tìm kiếm tin tức mới nhất về bất kỳ chủ đề thị trường nào
3. ⚔️ Phân tích đối thủ cạnh tranh cho một công ty
4. 🧠 Tìm kiếm deep trong kho tri thức VICO (vector search)
5. 💡 Cung cấp tư vấn chiến lược, insight thị trường Việt Nam

**Quy tắc trả lời:**
- Ưu tiên tiếng Việt. Nếu user viết tiếng Anh, trả lời tiếng Anh.
- Ngắn gọn, chuyên nghiệp, dễ hiểu. Không dài dòng.
- Dùng markdown: **bold**, bullet list, heading khi phù hợp.
- Đưa ra số liệu cụ thể khi có dữ liệu từ tools.
- Gợi ý hành động tiếp theo cho user khi phù hợp.
- Khi dùng dữ liệu từ tool, hãy trích dẫn nguồn (ví dụ: "Theo dữ liệu VICO...").
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

        const ai = getAI();
        if (!ai) {
            return this.addAssistantMessage(
                '⚠️ **AI Engine chưa sẵn sàng.** Vui lòng kiểm tra kết nối mạng và đảm bảo API key đã được cấu hình trong file `.env`.',
            );
        }

        try {
            // Build conversation contents for Gemini multi-turn
            const contents = this.history
                .filter(m => !m.isLoading)
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                }));

            // Call Gemini with function calling tools
            let response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents,
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            });

            // Function calling loop (max 3 rounds)
            const toolsUsed: string[] = [];
            let rounds = 0;

            while (response.functionCalls && response.functionCalls.length > 0 && rounds < 3) {
                rounds++;
                const fc = response.functionCalls[0];
                if (!fc || !fc.name) break;
                toolsUsed.push(fc.name);

                const toolResult = await executeTool(fc.name, fc.args || {});

                // Send function result back to Gemini
                const updatedContents = [
                    ...contents,
                    { role: 'model' as const, parts: [{ functionCall: { name: fc.name, args: fc.args } }] },
                    { role: 'function' as const, parts: [{ functionResponse: { name: fc.name, response: toolResult } }] },
                ];

                response = await ai.models.generateContent({
                    model: MODEL_NAME,
                    contents: updatedContents,
                    config: {
                        systemInstruction: SYSTEM_PROMPT,
                        tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    },
                });
            }

            const text = response.text || 'Xin lỗi, tôi không thể xử lý yêu cầu này lúc này.';
            return this.addAssistantMessage(text, toolsUsed.length > 0 ? toolsUsed : undefined);
        } catch (error) {
            console.error('[VicoChatService] Error:', error);

            // Graceful fallback: try without function calling
            try {
                const ai2 = getAI();
                if (ai2) {
                    const simpleContents = this.history
                        .filter(m => !m.isLoading)
                        .map(m => ({
                            role: m.role === 'assistant' ? 'model' : 'user',
                            parts: [{ text: m.content }],
                        }));

                    const fallbackResponse = await ai2.models.generateContent({
                        model: MODEL_NAME,
                        contents: simpleContents,
                        config: {
                            systemInstruction: SYSTEM_PROMPT,
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        },
                    });

                    if (fallbackResponse.text) {
                        return this.addAssistantMessage(fallbackResponse.text);
                    }
                }
            } catch {
                // Both approaches failed
            }

            return this.addAssistantMessage(
                '⚠️ Đã xảy ra lỗi khi xử lý. Vui lòng thử lại hoặc đặt câu hỏi khác.',
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
