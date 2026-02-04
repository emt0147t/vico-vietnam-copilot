/**
 * CSV Companies Enrichment Service
 * Enriches all 10,000+ companies from CSV with:
 * - Strategic context (tính toán từ description)
 * - Vector embeddings (sử dụng Vietnamese embedder)
 * - Similar competitors (tính toán semantic similarity)
 */

import fs from 'fs';
import path from 'path';
import { getVietnameseEmbedding } from '../services/vietnameseEmbedder';
import { getAllCompanies } from './companyLoader';

interface Company {
    name: string;
    industry?: string;
    intro?: string;
    products?: string;
}

interface EnrichedCompany extends Company {
    embedding?: number[];
    strategicContext?: string;
    similarCompetitors?: Array<{
        id: string;
        name: string;
        similarity: number;
        industry?: string;
    }>;
}

interface CompanyEmbeddingRecord {
    id: string;
    name: string;
    industry?: string;
    embedding: number[];
    strategicContext: string;
}

const ENRICHED_DATA_CACHE = path.join(process.cwd(), 'public', 'companies.enriched.json');
const EMBEDDINGS_INDEX_FILE = path.join(process.cwd(), 'public', 'companies.embeddings.json');

/**
 * Generate strategic context from company data
 */
function generateStrategicContext(company: Company): string {
    const intro = company.intro || '';
    const products = company.products || '';
    const industry = company.industry || 'Unknown';

    // Tạo bối cảnh chiến lược dựa trên dữ liệu hiện có
    const lines = [
        `Công ty hoạt động trong lĩnh vực: ${industry}.`,
        intro ? `Định vị thị trường: ${intro.substring(0, 150)}...` : '',
        products ? `Chuyên cung cấp: ${products.substring(0, 150)}...` : '',
    ].filter(Boolean);

    return lines.join(' ');
}

/**
 * Calculate cosine similarity between two embeddings
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Enrich all companies from CSV with embeddings and similar competitors
 */
export async function enrichAllCsvCompanies(): Promise<void> {
    console.log('🚀 Starting CSV companies enrichment...');
    const startTime = Date.now();

    try {
        // Load all companies from CSV
        const companies = getAllCompanies();
        console.log(`📊 Loaded ${companies.length} companies from CSV`);

        const enrichedRecords: CompanyEmbeddingRecord[] = [];
        const embeddingIndex: Map<string, number[]> = new Map();
        const companyIndex: Map<string, Company> = new Map();

        // Step 1: Generate embeddings for all companies (batch processing)
        console.log(`\n📌 Step 1: Generating embeddings for ${companies.length} companies...`);
        const BATCH_SIZE = 5;

        for (let i = 0; i < companies.length; i += BATCH_SIZE) {
            const batch = companies.slice(i, Math.min(i + BATCH_SIZE, companies.length));

            // Process batch in parallel
            const batchPromises = batch.map(async (company) => {
                const strategicContext = generateStrategicContext(company);
                const text = `${company.name}. ${strategicContext}`;

                try {
                    const embedding = await getVietnameseEmbedding(text);

                    if (embedding && embedding.length > 0) {
                        return {
                            id: company.name,
                            name: company.name,
                            industry: company.industry,
                            embedding,
                            strategicContext,
                        };
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to embed "${company.name}"`);
                }

                return null;
            });

            const batchResults = await Promise.all(batchPromises);

            // Store results
            batchResults.forEach((result) => {
                if (result) {
                    enrichedRecords.push(result);
                    embeddingIndex.set(result.id, result.embedding);
                    companyIndex.set(result.id, companies.find(c => c.name === result.name)!);
                }
            });

            // Progress indicator
            if ((i + BATCH_SIZE) % 500 === 0) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                const eta = ((elapsed as any * companies.length / (i + BATCH_SIZE)) - (elapsed as any)).toFixed(0);
                console.log(`  ✅ ${Math.min(i + BATCH_SIZE, companies.length)}/${companies.length} companies embedded (${elapsed}s, ETA: ${eta}s)`);
            }

            // Rate limiting between batches
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`✅ Generated ${enrichedRecords.length} embeddings successfully`);

        // Step 2: Calculate similar competitors for each company
        console.log(`\n📌 Step 2: Calculating similar competitors...`);
        const enrichedCompanies: EnrichedCompany[] = [];

        for (let i = 0; i < enrichedRecords.length; i++) {
            const record = enrichedRecords[i];
            const similarities: Array<{
                id: string;
                name: string;
                similarity: number;
                industry?: string;
            }> = [];

            // Compare with all other companies
            for (let j = 0; j < enrichedRecords.length; j++) {
                if (i === j) continue; // Skip self

                const otherRecord = enrichedRecords[j];
                const similarity = cosineSimilarity(record.embedding, otherRecord.embedding);

                // Only include if similarity > 0.3
                if (similarity > 0.3) {
                    similarities.push({
                        id: otherRecord.id,
                        name: otherRecord.name,
                        similarity,
                        industry: otherRecord.industry,
                    });
                }
            }

            // Sort by similarity and take top 10
            const topCompetitors = similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 10);

            const company = companyIndex.get(record.id)!;
            enrichedCompanies.push({
                ...company,
                embedding: record.embedding,
                strategicContext: record.strategicContext,
                similarCompetitors: topCompetitors,
            });

            // Progress indicator
            if ((i + 1) % 1000 === 0) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`  ✅ Processed ${i + 1}/${enrichedRecords.length} companies (${elapsed}s)`);
            }
        }

        // Step 3: Save enriched data
        console.log(`\n📌 Step 3: Saving enriched data...`);

        // Save embedding index (minimal data for quick lookup)
        const embeddingIndexData: Record<string, number[]> = {};
        enrichedRecords.forEach(record => {
            embeddingIndexData[record.id] = record.embedding;
        });

        fs.writeFileSync(
            EMBEDDINGS_INDEX_FILE,
            JSON.stringify(embeddingIndexData, null, 2)
        );
        console.log(`✅ Saved embeddings index to ${EMBEDDINGS_INDEX_FILE}`);

        // Save enriched companies with competitors
        fs.writeFileSync(
            ENRICHED_DATA_CACHE,
            JSON.stringify(
                enrichedCompanies.map(c => ({
                    name: c.name,
                    industry: c.industry,
                    intro: c.intro,
                    products: c.products,
                    strategicContext: c.strategicContext,
                    similarCompetitors: c.similarCompetitors,
                })),
                null,
                2
            )
        );
        console.log(`✅ Saved enriched companies to ${ENRICHED_DATA_CACHE}`);

        // Print summary
        const avgCompetitors = enrichedCompanies.reduce(
            (sum, c) => sum + (c.similarCompetitors?.length || 0),
            0
        ) / enrichedCompanies.length;

        console.log(`\n🎉 Enrichment Complete!`);
        console.log(`  📊 Total companies enriched: ${enrichedCompanies.length}`);
        console.log(`  🔗 Average competitors per company: ${avgCompetitors.toFixed(2)}`);
        console.log(`  ⏱️ Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    } catch (error) {
        console.error('❌ Error enriching companies:', error);
        throw error;
    }
}

/**
 * Load enriched companies from cache
 */
export function loadEnrichedCompanies(): EnrichedCompany[] {
    try {
        if (fs.existsSync(ENRICHED_DATA_CACHE)) {
            const data = JSON.parse(fs.readFileSync(ENRICHED_DATA_CACHE, 'utf-8'));
            console.log(`✅ Loaded ${data.length} enriched companies from cache`);
            return data;
        }
    } catch (error) {
        console.warn('⚠️ Failed to load enriched companies cache:', error);
    }

    return [];
}

/**
 * Get similar companies from enriched data
 */
export function getSimilarCompanies(
    companyName: string,
    limit: number = 10
): EnrichedCompany[] {
    const enrichedCompanies = loadEnrichedCompanies();
    const company = enrichedCompanies.find(c => c.name === companyName);

    if (!company || !company.similarCompetitors) {
        return [];
    }

    // Find the actual company objects for similar competitors
    const similar = company.similarCompetitors
        .slice(0, limit)
        .map(comp => enrichedCompanies.find(c => c.name === comp.name))
        .filter(Boolean) as EnrichedCompany[];

    return similar;
}

/**
 * Search enriched companies by semantic similarity
 */
export async function searchEnrichedCompanies(
    query: string,
    limit: number = 20
): Promise<Array<EnrichedCompany & { similarity: number }>> {
    try {
        // Get embedding for query
        const queryEmbedding = await getVietnameseEmbedding(query);
        if (!queryEmbedding || queryEmbedding.length === 0) {
            console.warn('⚠️ Failed to embed query');
            return [];
        }

        // Load embeddings index
        if (!fs.existsSync(EMBEDDINGS_INDEX_FILE)) {
            console.warn('⚠️ Embeddings index not found');
            return [];
        }

        const embeddingsData = JSON.parse(
            fs.readFileSync(EMBEDDINGS_INDEX_FILE, 'utf-8')
        );
        const enrichedCompanies = loadEnrichedCompanies();

        // Calculate similarities
        const results = enrichedCompanies.map(company => ({
            ...company,
            similarity: cosineSimilarity(
                queryEmbedding,
                embeddingsData[company.name] || []
            ),
        }));

        // Filter and sort
        return results
            .filter(r => r.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
    } catch (error) {
        console.error('❌ Error searching enriched companies:', error);
        return [];
    }
}

export default {
    enrichAllCsvCompanies,
    loadEnrichedCompanies,
    getSimilarCompanies,
    searchEnrichedCompanies,
};
