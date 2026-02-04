/**
 * 🎯 Unified Competitor Recommendation Engine
 * 
 * Finds similar companies from BOTH sources:
 * - data/companies.ts (hardcoded profiles)
 * - data/companies.csv (10,000+ companies)
 * 
 * Similarity Algorithm:
 * - Industry Match: 40% weight
 * - Text Similarity (Jaccard/Keyword): 35% weight
 * - Location Proximity: 15% weight
 * - Company Size Similarity: 10% weight
 */

import { CompanyProfile, COMPANIES } from '../data/companies';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface NormalizedCompany {
    id: string;
    name: string;
    normalizedName: string;
    industry: string;
    description: string;      // Combined from intro, products, customers
    location: string;
    employeeSize: string;
    yearFounded?: number;
    website?: string;
    products?: string;
    customers?: string;
    source: 'ts' | 'csv';
    raw?: Record<string, string>;
}

export interface CompetitorMatch {
    company: NormalizedCompany;
    similarity: number;
    breakdown: {
        industryScore: number;
        textScore: number;
        locationScore: number;
        sizeScore: number;
    };
    matchReasons: string[];
}

export interface CompetitorSearchResult {
    targetCompany: NormalizedCompany;
    competitors: CompetitorMatch[];
    totalCandidates: number;
    searchTime: number;
}

// ============================================================================
// CSV PARSER (Simple - no external deps)
// ============================================================================

function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

function parseCSV(content: string): Record<string, string>[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = parseCSVLine(lines[0]);
    const records: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const record: Record<string, string> = {};
        
        headers.forEach((header, index) => {
            record[header] = values[index] || '';
        });
        
        records.push(record);
    }
    
    return records;
}

// ============================================================================
// DATA LOADING & NORMALIZATION
// ============================================================================

let cachedCompanies: NormalizedCompany[] | null = null;

/**
 * Load and normalize companies from both sources
 */
export async function loadAllCompanies(): Promise<NormalizedCompany[]> {
    if (cachedCompanies) return cachedCompanies;
    
    const startTime = Date.now();
    console.log('🔄 Loading companies from all sources...');
    
    const normalized: NormalizedCompany[] = [];
    
    // 1. Load from hardcoded TS file
    console.log(`   📦 Loading ${COMPANIES.length} companies from companies.ts`);
    for (const company of COMPANIES) {
        normalized.push(normalizeFromTS(company));
    }
    
    // 2. Load from CSV
    try {
        const csvPath = path.join(process.cwd(), 'data', 'companies.csv');
        
        if (fs.existsSync(csvPath)) {
            const csvContent = fs.readFileSync(csvPath, 'utf-8');
            const csvRecords = parseCSV(csvContent);
            
            console.log(`   📄 Loading ${csvRecords.length} companies from companies.csv`);
            
            for (const record of csvRecords) {
                const norm = normalizeFromCSV(record);
                if (norm) {
                    // Check for duplicates by normalized name
                    const exists = normalized.some(
                        c => c.normalizedName === norm.normalizedName
                    );
                    if (!exists) {
                        normalized.push(norm);
                    }
                }
            }
        } else {
            console.warn('   ⚠️ companies.csv not found');
        }
    } catch (error) {
        console.error('   ❌ Error loading CSV:', error);
    }
    
    cachedCompanies = normalized;
    const elapsed = Date.now() - startTime;
    console.log(`✅ Loaded ${normalized.length} total companies in ${elapsed}ms`);
    
    return normalized;
}

/**
 * Normalize company name for comparison
 */
function normalizeCompanyName(name: string): string {
    return name
        .toLowerCase()
        .replace(/công ty|cổ phần|tnhh|cp|limited|ltd|corp|corporation|inc|llc|vietnam|việt nam|vn/gi, '')
        .replace(/[^a-z0-9\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Normalize from hardcoded TS file
 */
function normalizeFromTS(company: CompanyProfile): NormalizedCompany {
    const description = [
        company.intro || '',
        company.intro_new || '',
        company.products || '',
        company.products_new || '',
        company.customers || '',
        company.customers_new || ''
    ].filter(Boolean).join(' ');
    
    return {
        id: `ts_${normalizeCompanyName(company.name)}`,
        name: company.name,
        normalizedName: normalizeCompanyName(company.name),
        industry: company.industry,
        description,
        location: company.address || '',
        employeeSize: company.size || '',
        yearFounded: company.year,
        website: company.website,
        products: company.products,
        customers: company.customers,
        source: 'ts'
    };
}

/**
 * Normalize from CSV record
 * CSV columns: Tên công ty, Website/Link, Địa chỉ, Giới thiệu, Quy mô nhân sự, 
 * Mã số thuế, Sản phẩm/Dịch vụ, Người đại diện, Năm thành lập, 
 * Giới thiệu mới, Sản phẩm dịch vụ mới, Khách hàng tiềm năng mới
 */
function normalizeFromCSV(record: Record<string, string>): NormalizedCompany | null {
    const name = record['Tên công ty'];
    if (!name || name.trim().length < 2) return null;
    
    // 🆕 Filter out invalid company names
    const cleanName = name.trim();
    
    // Basic length checks
    if (cleanName.length < 10) return null; // Too short for a real company name
    if (cleanName.length > 120) return null; // Too long (likely parsing error)
    
    // Check for parsing errors / gibberish
    if ((cleanName.match(/,/g) || []).length > 2) return null; // Too many commas
    if (/^(Trí:|Với |Chúng tôi|Thu gọn|No\.\d|Số \d|\d{10})/i.test(cleanName)) return null; // Starts with non-company patterns
    if (!/[a-zA-ZÀ-ỹ]{3,}/i.test(cleanName)) return null; // Must have at least 3 consecutive letters
    
    // Must contain Vietnamese/English company keywords OR look like a proper name
    const companyKeywords = /công ty|cty|tnhh|cổ phần|cp|company|corp|ltd|limited|jsc|inc|việt|viet|tech|soft|digital|group|tập đoàn|viện|institute|trung tâm|center/i;
    if (!companyKeywords.test(cleanName)) {
        // If no company keywords, must be reasonably formatted
        if (cleanName.split(' ').length < 3) return null; // Too few words
    }
    
    const description = [
        record['Giới thiệu'] || '',
        record['Giới thiệu mới'] || '',
        record['Sản phẩm/Dịch vụ'] || '',
        record['Sản phẩm dịch vụ mới'] || '',
        record['Khách hàng tiềm năng mới'] || ''
    ].filter(Boolean).join(' ');
    
    // Infer industry from description
    const industry = inferIndustry(description, name);
    
    return {
        id: `csv_${normalizeCompanyName(name)}`,
        name,
        normalizedName: normalizeCompanyName(name),
        industry,
        description,
        location: record['Địa chỉ'] || '',
        employeeSize: record['Quy mô nhân sự'] || '',
        yearFounded: parseInt(record['Năm thành lập']) || undefined,
        website: record['Website/Link'] || '',
        products: record['Sản phẩm/Dịch vụ'] || record['Sản phẩm dịch vụ mới'] || '',
        customers: record['Khách hàng tiềm năng mới'] || '',
        source: 'csv',
        raw: record
    };
}

/**
 * Infer industry from text content
 */
function inferIndustry(description: string, name: string): string {
    const text = `${name} ${description}`.toLowerCase();
    
    const industryKeywords: Record<string, string[]> = {
        'Technology': ['phần mềm', 'software', 'công nghệ', 'technology', 'it', 'ai', 'data', 'cloud', 'digital', 'app', 'web', 'camera', 'smart home', 'nhà thông minh', 'iot', 'automation', 'tự động hóa'],
        'Finance': ['ngân hàng', 'bank', 'tài chính', 'finance', 'bảo hiểm', 'insurance', 'chứng khoán', 'securities', 'fintech', 'payment', 'thanh toán'],
        'Retail': ['bán lẻ', 'retail', 'thương mại', 'commerce', 'cửa hàng', 'store', 'shop', 'e-commerce', 'ecommerce', 'thương mại điện tử'],
        'Automotive': ['ô tô', 'auto', 'xe', 'vehicle', 'car', 'motor', 'automotive', 'vận tải', 'logistics'],
        'Education': ['giáo dục', 'education', 'đào tạo', 'training', 'trường', 'school', 'university', 'học', 'learning'],
        'Healthcare': ['y tế', 'healthcare', 'sức khỏe', 'health', 'bệnh viện', 'hospital', 'dược', 'pharmaceutical', 'medical'],
        'Manufacturing': ['sản xuất', 'manufacturing', 'nhà máy', 'factory', 'công nghiệp', 'industrial', 'chế biến', 'processing'],
        'Real Estate': ['bất động sản', 'real estate', 'xây dựng', 'construction', 'nhà đất', 'property', 'kiến trúc', 'architecture'],
        'Telecommunications': ['viễn thông', 'telecom', 'truyền thông', 'media', 'communication', 'broadcast'],
        'Agriculture': ['nông nghiệp', 'agriculture', 'thực phẩm', 'food', 'nông sản', 'farm', 'nuôi trồng'],
    };
    
    let maxScore = 0;
    let bestIndustry = 'Technology'; // default
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
        const score = keywords.filter(kw => text.includes(kw)).length;
        if (score > maxScore) {
            maxScore = score;
            bestIndustry = industry;
        }
    }
    
    return bestIndustry;
}

// ============================================================================
// SIMILARITY ALGORITHMS
// ============================================================================

/**
 * Extract keywords from text (Vietnamese + English)
 */
function extractKeywords(text: string): Set<string> {
    const normalized = text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    // Remove common stop words
    const stopWords = new Set([
        'và', 'của', 'các', 'cho', 'với', 'trong', 'được', 'là', 'có', 'để', 'từ',
        'the', 'and', 'for', 'with', 'are', 'this', 'that', 'from', 'được'
    ]);
    
    return new Set(normalized.filter(w => !stopWords.has(w)));
}

/**
 * Calculate Jaccard similarity between two keyword sets
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 && setB.size === 0) return 0;
    
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    return intersection.size / union.size;
}

/**
 * Calculate location similarity (same city = high score)
 */
function locationSimilarity(loc1: string, loc2: string): number {
    if (!loc1 || !loc2) return 0;
    
    const cities = ['hà nội', 'hanoi', 'hồ chí minh', 'ho chi minh', 'saigon', 'sài gòn', 
                   'đà nẵng', 'da nang', 'hải phòng', 'hai phong', 'cần thơ', 'can tho',
                   'bình dương', 'binh duong', 'đồng nai', 'dong nai'];
    
    const norm1 = loc1.toLowerCase();
    const norm2 = loc2.toLowerCase();
    
    // Check if same city
    for (const city of cities) {
        if (norm1.includes(city) && norm2.includes(city)) {
            return 1.0;
        }
    }
    
    // Check if same region (North/South/Central)
    const northCities = ['hà nội', 'hanoi', 'hải phòng', 'hai phong', 'bắc', 'ninh bình', 'quảng ninh'];
    const southCities = ['hồ chí minh', 'ho chi minh', 'saigon', 'bình dương', 'đồng nai', 'long an', 'bình phước'];
    const centralCities = ['đà nẵng', 'da nang', 'huế', 'hue', 'quảng nam', 'nha trang'];
    
    const isNorth1 = northCities.some(c => norm1.includes(c));
    const isNorth2 = northCities.some(c => norm2.includes(c));
    const isSouth1 = southCities.some(c => norm1.includes(c));
    const isSouth2 = southCities.some(c => norm2.includes(c));
    const isCentral1 = centralCities.some(c => norm1.includes(c));
    const isCentral2 = centralCities.some(c => norm2.includes(c));
    
    if ((isNorth1 && isNorth2) || (isSouth1 && isSouth2) || (isCentral1 && isCentral2)) {
        return 0.5;
    }
    
    return 0;
}

/**
 * Calculate employee size similarity
 */
function sizeSimilarity(size1: string, size2: string): number {
    if (!size1 || !size2) return 0;
    
    const sizeCategories = [
        ['1', '5', '10', 'micro'],
        ['11', '50', 'small'],
        ['51', '100', 'medium'],
        ['101', '200', '300', '500', 'large'],
        ['501', '1000', '1.000', 'enterprise'],
        ['1001', '5000', '10000', '20000', 'very large']
    ];
    
    const getCategory = (size: string): number => {
        const norm = size.toLowerCase();
        for (let i = 0; i < sizeCategories.length; i++) {
            if (sizeCategories[i].some(s => norm.includes(s))) {
                return i;
            }
        }
        return -1;
    };
    
    const cat1 = getCategory(size1);
    const cat2 = getCategory(size2);
    
    if (cat1 === -1 || cat2 === -1) return 0;
    
    const diff = Math.abs(cat1 - cat2);
    if (diff === 0) return 1.0;
    if (diff === 1) return 0.6;
    if (diff === 2) return 0.3;
    return 0;
}

// ============================================================================
// MAIN COMPETITOR FINDER
// ============================================================================

/**
 * Find top competitors for a target company
 * 
 * @param targetCompanyName - Name or partial name of the company
 * @param limit - Maximum number of competitors to return
 * @param minSimilarity - Minimum similarity threshold (0-100)
 * @param sourceFilter - Filter by source: 'ts' (hardcoded), 'csv', or 'all' (default)
 */
export async function findTopCompetitors(
    targetCompanyName: string,
    limit: number = 10,
    minSimilarity: number = 20,
    sourceFilter: 'ts' | 'csv' | 'all' = 'all'
): Promise<CompetitorSearchResult> {
    const startTime = Date.now();
    
    // Load all companies
    const allCompanies = await loadAllCompanies();
    
    // Find the target company
    const normalizedTarget = normalizeCompanyName(targetCompanyName);
    let targetCompany = allCompanies.find(
        c => c.normalizedName === normalizedTarget || 
             c.name.toLowerCase().includes(targetCompanyName.toLowerCase())
    );
    
    // If not found, create a placeholder
    if (!targetCompany) {
        console.warn(`⚠️ Company "${targetCompanyName}" not found in database, using placeholder`);
        targetCompany = {
            id: `search_${normalizedTarget}`,
            name: targetCompanyName,
            normalizedName: normalizedTarget,
            industry: 'Technology',
            description: targetCompanyName,
            location: '',
            employeeSize: '',
            source: 'ts' as const
        };
    }
    
    console.log(`🔍 Finding competitors for: ${targetCompany.name} (${targetCompany.industry}) [source: ${sourceFilter}]`);
    
    // Filter by source if specified
    const candidatePool = sourceFilter === 'all' 
        ? allCompanies 
        : allCompanies.filter(c => c.source === sourceFilter);
    
    console.log(`   📊 Candidate pool: ${candidatePool.length} companies (filter: ${sourceFilter})`);
    
    // Calculate similarity for filtered companies
    const targetKeywords = extractKeywords(targetCompany.description);
    const matches: CompetitorMatch[] = [];
    
    for (const candidate of candidatePool) {
        // Skip self
        if (candidate.id === targetCompany.id || 
            candidate.normalizedName === targetCompany.normalizedName) {
            continue;
        }
        
        // Calculate component scores
        const industryScore = candidate.industry === targetCompany.industry ? 100 : 
                             (candidate.industry && targetCompany.industry ? 30 : 0);
        
        const candidateKeywords = extractKeywords(candidate.description);
        const textScore = jaccardSimilarity(targetKeywords, candidateKeywords) * 100;
        
        const locationScore = locationSimilarity(targetCompany.location, candidate.location) * 100;
        
        const sizeScore = sizeSimilarity(targetCompany.employeeSize, candidate.employeeSize) * 100;
        
        // Weighted total (Industry: 40%, Text: 35%, Location: 15%, Size: 10%)
        const similarity = (
            industryScore * 0.40 +
            textScore * 0.35 +
            locationScore * 0.15 +
            sizeScore * 0.10
        );
        
        // 🆕 Boost score for companies.ts (quality curated data) - add 5% bonus
        const sourceBonus = candidate.source === 'ts' ? 5 : 0;
        const finalSimilarity = Math.min(100, similarity + sourceBonus);
        
        if (finalSimilarity >= minSimilarity) {
            // Generate match reasons
            const matchReasons: string[] = [];
            if (industryScore >= 80) matchReasons.push(`Same industry: ${candidate.industry}`);
            if (textScore >= 20) matchReasons.push(`Similar products/services (${Math.round(textScore)}% match)`);
            if (locationScore >= 50) matchReasons.push(`Same region`);
            if (sizeScore >= 60) matchReasons.push(`Similar company size`);
            if (candidate.source === 'ts') matchReasons.push(`✨ Featured company`);
            
            matches.push({
                company: candidate,
                similarity: Math.round(finalSimilarity * 10) / 10,
                breakdown: {
                    industryScore: Math.round(industryScore),
                    textScore: Math.round(textScore),
                    locationScore: Math.round(locationScore),
                    sizeScore: Math.round(sizeScore)
                },
                matchReasons
            });
        }
    }
    
    // Sort by similarity descending, then by source (ts first)
    matches.sort((a, b) => {
        if (b.similarity !== a.similarity) return b.similarity - a.similarity;
        // If same similarity, prioritize companies.ts
        if (a.company.source === 'ts' && b.company.source !== 'ts') return -1;
        if (b.company.source === 'ts' && a.company.source !== 'ts') return 1;
        return 0;
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Found ${matches.length} competitors (showing top ${limit}) in ${elapsed}ms`);
    
    return {
        targetCompany,
        competitors: matches.slice(0, limit),
        totalCandidates: candidatePool.length,
        searchTime: elapsed
    };
}

/**
 * Search companies by name (for autocomplete/typeahead)
 */
export async function searchCompaniesByName(query: string, limit: number = 10): Promise<NormalizedCompany[]> {
    const allCompanies = await loadAllCompanies();
    const normalizedQuery = query.toLowerCase();
    
    return allCompanies
        .filter(c => 
            c.name.toLowerCase().includes(normalizedQuery) ||
            c.normalizedName.includes(normalizedQuery)
        )
        .slice(0, limit);
}

/**
 * Get company by exact name
 */
export async function getCompanyByName(name: string): Promise<NormalizedCompany | undefined> {
    const allCompanies = await loadAllCompanies();
    const normalized = normalizeCompanyName(name);
    
    return allCompanies.find(
        c => c.normalizedName === normalized || 
             c.name.toLowerCase() === name.toLowerCase()
    );
}

/**
 * Clear cache (useful for testing or after CSV update)
 */
export function clearCompanyCache(): void {
    cachedCompanies = null;
    console.log('🗑️ Company cache cleared');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    loadAllCompanies,
    findTopCompetitors,
    searchCompaniesByName,
    getCompanyByName,
    clearCompanyCache
};
