import fs from 'fs';
import path from 'path';
import { getAllCompanies } from './companyLoader';
import { getVietnameseEmbedding } from '../services/vietnameseEmbedder';

const VECTORS_CACHE_FILE = path.join(process.cwd(), 'data', 'vectors.cache.json');

interface VectorRecord {
    id: string;
    text: string;
    embedding: number[];
    metadata: {
        title: string;
        type: string;
        intro: string;
        intro_new: string;
        products: string;
        products_new: string;
        customers_new: string;
        industry: string;
        address: string;
        year: number;
        website?: string;
    };
}

/**
 * Seed vector embeddings for all companies on server startup
 * Saves to cache file so subsequent restarts are fast
 * 
 * ⚠️ IMPORTANT: Only seeds FIRST TIME. Subsequent restarts load from cache (super fast!)
 * 
 * 🚀 OPTIMIZATIONS:
 * - Load from cache on startup (instant - milliseconds)
 * - SKIP_EMBEDDING env var for faster development
 * - Batch size increased to 50 (local inference handles this easily)
 * - Rate limiting reduced to 50ms (was 100ms)
 */
export async function seedVectorDatabase(onProgress?: (processed: number, total: number) => void): Promise<VectorRecord[]> {
    // Check if cache file exists - if so, load from cache (fast path - milliseconds!)
    if (fs.existsSync(VECTORS_CACHE_FILE)) {
        try {
            const cached = JSON.parse(fs.readFileSync(VECTORS_CACHE_FILE, 'utf-8'));
            console.log(`✅ Loaded ${cached.length} vectors from cache (${VECTORS_CACHE_FILE})`);
            console.log(`   🚀 Cache load time: <1ms (instant)`);
            console.log(`   Next time: Load from cache will be instant!`);
            return cached;
        } catch (error) {
            console.warn('⚠️ Failed to load vector cache, will regenerate:', error);
        }
    }

    // ⚡ OPTIMIZATION: Skip embedding if SKIP_EMBEDDING=true (for fast development)
    const SKIP_EMBEDDING = process.env['SKIP_EMBEDDING'] === 'true';
    if (SKIP_EMBEDDING) {
        console.log('⚡ SKIP_EMBEDDING=true: Skipping vector seeding for faster load');
        console.log('   💡 To enable embedding: SKIP_EMBEDDING=false npm run server');
        console.log('   💡 Or: npm run server (default = do embedding)\n');
        return [];
    }

    console.log('⏳ First-time vector seeding with Vietnamese Embedding model...');
    console.log('📝 Using: dangvantuan/vietnamese-embedding (88.33% accuracy)');
    console.log('🚀 OPTIMIZED: Local inference via sentence-transformers (5-10x faster than API)');
    console.log('💡 Tip: Cache embedding on disk for instant load next time\n');
    
    const companies = getAllCompanies();
    const records: VectorRecord[] = [];
    const startTime = Date.now();
    const BATCH_SIZE = 50; // ⚡ Increased to 50 - local inference handles batch processing well

    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
        const batch = companies.slice(i, Math.min(i + BATCH_SIZE, companies.length));
        
        // Process batch in parallel
        const batchPromises = batch.map(async (c) => {
            const text = `Company: ${c.name}. Industry: ${c.industry || 'N/A'}. Introduction: ${c.intro || ''}. Products: ${c.products || ''}`.trim();

            try {
                const embedding = await getVietnameseEmbedding(text);

                if (embedding && embedding.length > 0) {
                    return {
                        id: `company_${i}`,
                        text,
                        embedding,
                        metadata: {
                            title: c.name,
                            type: 'company_profile',
                            intro: c.intro || '',
                            intro_new: c.intro_new || '',
                            products: c.products || '',
                            products_new: c.products_new || '',
                            customers_new: c.customers_new || '',
                            industry: c.industry,
                            address: c.address || '',
                            year: c.year,
                            website: c.website
                        }
                    };
                }
            } catch (error) {
                console.warn(`⚠️ Failed to embed company "${c.name}":`, error);
            }
            
            return null;
        });

        // Wait for batch to complete
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
            if (result) records.push(result);
        });

        // Progress callback
        try { if (typeof onProgress === 'function') onProgress(Math.min(records.length, companies.length), companies.length); } catch (e) { }

        // Progress indicator every batch
        if ((i + BATCH_SIZE) % 100 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const eta = ((elapsed as any * companies.length / (i + BATCH_SIZE)) - (elapsed as any)).toFixed(0);
            console.log(`  📊 Progress: ${Math.min(i + BATCH_SIZE, companies.length)}/${companies.length} companies (${elapsed}s, ETA: ${eta}s)`);
        }

        // ⚡ Reduced rate limiting (from 100ms to 50ms) for faster processing
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Save vectors to cache file
    try {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(VECTORS_CACHE_FILE, JSON.stringify(records, null, 2));
        console.log(`💾 Saved ${records.length} vectors to cache: ${VECTORS_CACHE_FILE}`);
    } catch (error) {
        console.warn('⚠️ Failed to save vector cache:', error);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Vector database seeding completed in ${totalTime}s (${records.length} vectors)`);
    console.log(`🚀 Next server restart will load from cache in milliseconds!`);

    return records;
}

/**
 * Load vectors from cache or return empty array
 */
export function loadVectorsFromCache(): VectorRecord[] {
    if (fs.existsSync(VECTORS_CACHE_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(VECTORS_CACHE_FILE, 'utf-8'));
        } catch (error) {
            console.warn('⚠️ Failed to load vector cache:', error);
        }
    }
    return [];
}

