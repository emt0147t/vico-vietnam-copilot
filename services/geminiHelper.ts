/**
 * Shared Gemini AI helper with model fallback chain.
 * When a model's quota is exhausted (429), automatically tries the next model.
 *
 * This prevents service-wide failures when one model's free-tier quota runs out.
 */

import { GoogleGenAI } from '@google/genai';

// Model fallback chain: each model has its own per-model quota
const MODEL_CHAIN = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-lite',
];

let _geminiInstance: GoogleGenAI | null = null;

/** Get or create a singleton GoogleGenAI instance */
export function getGeminiInstance(): GoogleGenAI | null {
    if (_geminiInstance) return _geminiInstance;
    const key = process.env['GEMINI_API_KEY'];
    if (!key) return null;
    _geminiInstance = new GoogleGenAI({ apiKey: key });
    return _geminiInstance;
}

/**
 * Generate content with automatic model fallback on quota exhaustion.
 * Tries each model in the chain until one succeeds or all fail.
 *
 * @param config - Same as ai.models.generateContent config, but WITHOUT `model`
 * @param preferredModel - Optional model to try first (default: gemini-2.0-flash)
 * @returns The response from whichever model succeeded
 */
export async function generateWithFallback(
    config: {
        contents: any;
        config?: any;
    },
    preferredModel?: string,
): Promise<{ text: string; functionCalls?: any[]; model: string }> {
    const ai = getGeminiInstance();
    if (!ai) throw new Error('GEMINI_API_KEY not configured');

    const modelsToTry = preferredModel
        ? [preferredModel, ...MODEL_CHAIN.filter(m => m !== preferredModel)]
        : [...MODEL_CHAIN];

    let lastError: any = null;

    for (const modelId of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelId,
                ...config,
            });

            let text = '';
            let functionCalls: any[] = [];
            try { text = response.text ?? ''; } catch { /* function-call-only */ }
            try { functionCalls = response.functionCalls ?? []; } catch { /* text-only */ }

            return { text, functionCalls, model: modelId };
        } catch (err: any) {
            const errMsg = err?.message || String(err);
            const is429 = err?.status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED');

            if (is429) {
                console.warn(`⏳ [geminiHelper] ${modelId} quota exhausted, trying next...`);
                lastError = err;
                continue;
            }

            // Non-quota errors: fail immediately
            throw err;
        }
    }

    throw lastError || new Error('All Gemini models quota exhausted');
}

/** Default model name for display/logging purposes */
export const DEFAULT_MODEL = MODEL_CHAIN[0];
