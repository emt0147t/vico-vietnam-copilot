
import { loadFromDB, saveToDB } from '../utils/db';
import { cosineSimilarity } from '../utils/vectorUtils';
import { getVietnameseEmbedding } from './vietnameseEmbedder';
import { COMPANIES } from '../data/companies';
import { RAW_NEWS } from '../data/news';

// [VICO OLD CODE] - Dòng này gây lỗi crash khi build
// import { loadCompanies } from '../utils/loadCompanies';

// Declare Google Generative AI (loaded from CDN in HTML)
declare const google: any;
const ai = typeof google !== 'undefined' ? google.generativeAI : null;
const EMBEDDING_MODEL = 'text-embedding-004';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SearchResult {
    id: string;
    text: string;
    metadata: any;
    score: number;
}

export const RagService = {
    testConnection: async (): Promise<{ success: boolean; message?: string }> => {
        try {
            await RagService.embedText("test");
            return { success: true };
        } catch (e: any) { return { success: false, message: e.message }; }
    },

    embedText: async (text: string, retries = 3): Promise<number[]> => {
        if (!text || !text.trim()) return [];
        
        // Try Vietnamese embedding first (better for Vietnamese text)
        try {
            const vietnameseEmbedding = await getVietnameseEmbedding(text);
            if (vietnameseEmbedding.length > 0) {
                return vietnameseEmbedding;
            }
        } catch (error) {
            console.warn('Vietnamese embedding failed, returning empty vector');
        }

        // Return empty array as fallback (no external API call)
        return [];
    },

    // Tự động nạp dữ liệu từ Server/File tĩnh vào Vector DB nếu trống
    autoSeed: async (onProgress?: (p: number, msg: string) => void) => {
        const existing = await loadFromDB("vectors");
        if (existing.length > 0) {
            console.log(`✅ Vector DB already has ${existing.length} records`);
            return;
        }

        if (onProgress) onProgress(0, "Khởi tạo trí tuệ VICO...");

        const records: any[] = [];

        // [VICO NEW ARCHITECTURE v2] - Load pre-computed vectors from backend cache (SUPER FAST!)
        try {
            if (onProgress) onProgress(5, "Tải vectors từ backend...");
            
            const response = await fetch('http://localhost:3001/api/vectors/cache', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                const cachedVectors = data.vectors || [];
                
                if (cachedVectors.length > 0) {
                    console.log(`✅ Loaded ${cachedVectors.length} pre-computed vectors from backend cache`);
                    
                    // Save to local IndexedDB
                    await saveToDB('vectors', cachedVectors);
                    if (onProgress) onProgress(100, "Hoàn tất nạp tri thức từ cache.");
                    return;
                }
            }
        } catch (e) {
            console.warn("⚠️ Backend vectors not ready, will generate on-demand:", e);
        }

        // Fallback: Generate vectors on-demand (slow path)
        if (onProgress) onProgress(10, "Tạo vectors từ dữ liệu công ty...");

        let companiesFromDB: any[] = [];
        try {
            const response = await fetch('http://localhost:3001/api/companies/raw/all', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                companiesFromDB = data.companies || [];
                console.log(`✅ Loaded ${companiesFromDB.length} companies from CSV via API.`);
            } else {
                throw new Error(`Server API error: ${response.status}`);
            }
        } catch (e) {
            console.warn("⚠️ Không thể kết nối Server, sử dụng dữ liệu mẫu (Fallback).", e);
            companiesFromDB = COMPANIES; 
        }

        const totalToProcess = companiesFromDB.length + RAW_NEWS.length;

        // 1. Xử lý Companies
        for (let i = 0; i < companiesFromDB.length; i++) {
            const c: any = companiesFromDB[i];
            const text = `Công ty: ${c.name}. Ngành: ${c.industry || 'N/A'}. Giới thiệu: ${c.intro || ''}. Sản phẩm: ${c.products || ''}`.trim();

            const embedding = await RagService.embedText(text);

            if (embedding.length > 0) {
                records.push({
                    id: `seed_co_${c._id ? c._id.toString() : i}`,
                    text,
                    embedding,
                    metadata: {
                        title: c.name,
                        type: "company_profile",
                        intro: c.intro || '',
                        intro_new: c.intro_new || '',
                        products: c.products || '',
                        products_new: c.products_new || '',
                        customers_new: c.customers_new || '',
                        industry: c.industry,
                        address: c.address,
                        year: c.year,
                        website: c.website
                    }
                });
            }

            if (onProgress) {
                onProgress(Math.round((i / totalToProcess) * 100), `Nạp dữ liệu: ${c.name}`);
            }
            await sleep(50); // Giảm delay để nhanh hơn
        }

        // 2. Xử lý News
        for (let i = 0; i < RAW_NEWS.length; i++) {
            const n = RAW_NEWS[i];
            const text = `Tin tức: ${n.title}. Nội dung: ${n.content}`;
            const embedding = await RagService.embedText(text);
            if (embedding.length > 0) {
                records.push({
                    id: `seed_news_${i}`,
                    text,
                    embedding,
                    metadata: { title: n.title, type: 'news_article', content: n.content, link: n.link, date: 'Mới nhất' }
                });
            }
            if (onProgress) {
                onProgress(Math.round(((i + companiesFromDB.length) / totalToProcess) * 100), `Nạp tin tức: ${n.title.substring(0, 20)}...`);
            }
            await sleep(150);
        }

        if (records.length > 0) {
            await saveToDB('vectors', records);
            if (onProgress) onProgress(100, "Hoàn tất nạp tri thức.");
        }
    },

    insertVectorBatch: async (records: any[]) => { 
        const enrichedRecords = [];
        for (const record of records) {
             const embedding = await RagService.embedText(record.text);
             if (embedding.length > 0) {
                 enrichedRecords.push({ ...record, embedding });
             }
             await sleep(100);
        }
        return await saveToDB('vectors', enrichedRecords); 
    },

    search: async (query: string, topK: number = 10, type?: string): Promise<SearchResult[]> => {
        const allDocs = await loadFromDB('vectors');
        if (!allDocs || allDocs.length === 0) return [];
        
        const filteredDocs = type ? allDocs.filter(d => d.metadata.type === type) : allDocs;
        const queryVector = await RagService.embedText(query);
        
        if (queryVector.length === 0) return [];
        
        // 🆕 Enhanced ranking: Combine cosine similarity with metadata relevance
        return filteredDocs.map(doc => {
            const cosineSim = cosineSimilarity(queryVector, doc.embedding);
            
            // Boost score for company profiles with high metadata quality
            let boostScore = cosineSim;
            if (doc.metadata.type === 'company_profile') {
                // Boost if has product info (90%+ of companies have it)
                if (doc.metadata.products && doc.metadata.products !== 'N/A') {
                    boostScore += 0.05;
                }
                // Boost if has enriched data from CSV
                if (doc.metadata.products_new && doc.metadata.products_new !== '') {
                    boostScore += 0.08;
                }
            }
            
            return {
                ...doc,
                score: Math.min(boostScore, 1.0) // Cap at 1.0
            };
        })
        .filter(d => d.score > 0.25) // Lowered threshold from 0.3 to catch more results
        .sort((a, b) => b.score - a.score)
        .slice(0, topK) as SearchResult[];
    },

    searchNews: async (companyName: string, topK: number = 5): Promise<any[]> => {
        const results = await RagService.search(companyName, topK, 'news_article');
        return results.map(r => ({
            title: r.metadata.title,
            content: r.metadata.content || r.text,
            link: r.metadata.link,
            date: r.metadata.date || 'N/A',
            score: r.score
        }));
    },

    findCompetitors: async (description: string, products: string, excludeName: string, industry?: string): Promise<any[]> => {
        // Tối ưu: Tạo query text phong phú hơn cho Vietnamese semantic search
        const queryTexts = [
            `${description} ${products}`,
            `Sản phẩm: ${products}. Ngành: ${description}`,
            products, // Tìm theo sản phẩm
            description // Tìm theo giới thiệu
        ];

        let allResults: any[] = [];

        // Chạy multiple queries để bao quát hơn
        for (const queryText of queryTexts) {
            if (queryText && queryText.trim()) {
                // Tăng từ 20 lên 50 để tìm nhiều competitors hơn
                const results = await RagService.search(queryText, 50, 'company_profile');
                allResults = allResults.concat(results);
            }
        }

        const excludeClean = excludeName.toLowerCase().trim();

        // Deduplicate + filter + sort
        const deduped = new Map<string, any>();
        
        allResults.forEach(r => {
            const title = r.metadata.title?.toLowerCase().trim();
            // Filter by industry if specified
            const sameIndustry = !industry || r.metadata.industry === industry;
            
            if (title && title !== excludeClean && sameIndustry) {
                const existing = deduped.get(title);
                // Keep highest score if duplicate
                if (!existing || r.score > existing.score) {
                    deduped.set(title, {
                        name: r.metadata.title,
                        intro: r.metadata.intro_new || r.metadata.intro || "N/A",
                        products: r.metadata.products_new || r.metadata.products || "N/A",
                        industry: r.metadata.industry,
                        similarity: Math.round(r.score * 100),
                        score: r.score
                    });
                }
            }
        });

        // Filter by minimum similarity + sort by score
        return Array.from(deduped.values())
            .filter(r => r.similarity >= 30) // Giảm từ 50 xuống 30 để bao quát nhiều hơn
            .sort((a, b) => b.score - a.score)
            .slice(0, 30); // Return top 30 competitors
    }
};
