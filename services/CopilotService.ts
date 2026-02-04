
import { RagService } from "./ragLayer";

// Using Google's SDK through browser environment
declare const google: any;
const ai = typeof google !== 'undefined' ? google.generativeAI : null;

// Use gemini-2.0-flash for complex strategic reasoning tasks (most capable model)
const MODEL_NAME = 'gemini-2.0-flash'; 

export interface GlobalCopilotReport {
    meta: {
        confidenceScore: number; // 0-100
        timeSaved: string; // e.g. "120 hours"
        costSavings: string; // e.g. "$15,000"
    };
    market: {
        environment: string;
        trends: string[];
    };
    competitors: {
        landscape: string;
        events: { date: string; company: string; event: string; impact: 'High' | 'Med' | 'Low' }[];
        positioning: { name: string; x: number; y: number; label: string }[];
        battlecards: Record<string, { strengths: string; weaknesses: string; strategy: string }>;
    };
    gtm: {
        segmentation: { segment: string; value: string; approach: string }[];
        strategy: string;
    };
    playbook: {
        phases: { name: string; steps: string[]; timeline: string }[];
    };
    risks: {
        risk: string;
        probability: 'High' | 'Med' | 'Low';
        impact: 'Critical' | 'Severe' | 'Moderate';
        mitigation: string;
    }[];
    advisory: {
        recommendations: { title: string; desc: string; type: 'opportunity' | 'threat' }[];
    };
}

export const CopilotService = {
    
    /**
     * Main "Backend" Function: Generates the full strategic report.
     * Integrates Feature 1-9 of Global Copilot.
     */
    generateFullReport: async (
        companyName: string, 
        industry: string, 
        competitors: string[],
        contextData: string = "" 
    ): Promise<GlobalCopilotReport | null> => {
        try {
            // 1. Construct Context from Proprietary Data (Feature 5: Integration)
            // If no context passed, try to fetch some from RAG
            let proprietaryContext = contextData;
            if (!proprietaryContext) {
                const searchResults = await RagService.search(`${companyName} ${industry} strategy`, 5);
                proprietaryContext = searchResults.map(r => r.text).join('\n');
            }

            // 2. Build the "Mega Prompt" for comprehensive analysis
            const prompt = `
                Act as VICO, a World-Class Strategic Copilot.
                
                TARGET: ${companyName} (Industry: ${industry})
                COMPETITORS: ${competitors.join(', ')}
                INTERNAL_CONTEXT: "${proprietaryContext.substring(0, 2000)}..." (Use this to tailor insights)

                Generate a comprehensive 'Global Copilot' Market Report in strictly valid JSON format.
                
                REQUIREMENTS:
                1. Market Research (Feature 1): Summarize environment and key trends.
                2. Competitive Landscape (Feature 2): Generate specific timeline events (launches, M&A) and positioning coordinates (0-100 scale).
                3. GTM Strategy (Feature 3): Create customer segmentation and a GTM approach.
                4. Playbook (Feature 6): Create a 'Living Playbook' with execution phases.
                5. Risks (Feature 7): Identify risks and probability.
                6. Metrics (Feature 9): Estimate strategic confidence, time saved by this AI report, and cost savings vs traditional consulting.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    meta: {
                        type: Type.OBJECT,
                        properties: {
                            confidenceScore: { type: Type.NUMBER },
                            timeSaved: { type: Type.STRING },
                            costSavings: { type: Type.STRING },
                        }
                    },
                    market: {
                        type: Type.OBJECT,
                        properties: {
                            environment: { type: Type.STRING },
                            trends: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    competitors: {
                        type: Type.OBJECT,
                        properties: {
                            landscape: { type: Type.STRING },
                            events: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        date: { type: Type.STRING },
                                        company: { type: Type.STRING },
                                        event: { type: Type.STRING },
                                        impact: { type: Type.STRING, enum: ['High', 'Med', 'Low'] }
                                    }
                                }
                            },
                            positioning: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        x: { type: Type.NUMBER },
                                        y: { type: Type.NUMBER },
                                        label: { type: Type.STRING },
                                    }
                                }
                            },
                            battlecardsList: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        companyName: { type: Type.STRING },
                                        strengths: { type: Type.STRING },
                                        weaknesses: { type: Type.STRING },
                                        strategy: { type: Type.STRING },
                                    }
                                }
                            }
                        }
                    },
                    gtm: {
                        type: Type.OBJECT,
                        properties: {
                            segmentation: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        segment: { type: Type.STRING },
                                        value: { type: Type.STRING },
                                        approach: { type: Type.STRING },
                                    }
                                }
                            },
                            strategy: { type: Type.STRING }
                        }
                    },
                    playbook: {
                        type: Type.OBJECT,
                        properties: {
                            phases: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        timeline: { type: Type.STRING },
                                    }
                                }
                            }
                        }
                    },
                    risks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                risk: { type: Type.STRING },
                                probability: { type: Type.STRING, enum: ['High', 'Med', 'Low'] },
                                impact: { type: Type.STRING, enum: ['Critical', 'Severe', 'Moderate'] },
                                mitigation: { type: Type.STRING },
                            }
                        }
                    },
                    advisory: {
                        type: Type.OBJECT,
                        properties: {
                            recommendations: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        desc: { type: Type.STRING },
                                        type: { type: Type.STRING, enum: ['opportunity', 'threat'] }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });

            // Correctly access text property (not method) to get response string
            if (response.text) {
                const rawJson = JSON.parse(response.text);
                // Transform battlecardsList to battlecards map
                const battlecards: Record<string, any> = {};
                if (rawJson.competitors && rawJson.competitors.battlecardsList) {
                    for (const card of rawJson.competitors.battlecardsList) {
                        battlecards[card.companyName] = {
                            strengths: card.strengths,
                            weaknesses: card.weaknesses,
                            strategy: card.strategy
                        };
                    }
                }
                rawJson.competitors.battlecards = battlecards;
                delete rawJson.competitors.battlecardsList;
                
                return rawJson as GlobalCopilotReport;
            }
            throw new Error("Empty response from AI");

        } catch (error) {
            console.error("CopilotService Error:", error);
            return null;
        }
    }
};
