/**
 * Entity Resolution Service - Merge duplicate company records
 * 
 * Handles:
 * - Fuzzy name matching using trigram similarity
 * - Domain-based matching (strongest signal)
 * - Ticker-based matching
 * - Alias management
 * - Merge conflict resolution
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CompanyCandidate {
  id: string;
  name: string;
  legalName?: string;
  ticker?: string;
  domain?: string;
  hqCountry?: string;
  hqCity?: string;
  source?: string;
}

export interface MatchResult {
  candidate: CompanyCandidate;
  existing: CompanyCandidate;
  confidence: number; // 0-1
  matchType: 'domain' | 'ticker' | 'name_exact' | 'name_fuzzy' | 'composite';
  shouldMerge: boolean;
}

export interface MergeResult {
  canonicalId: string;
  mergedIds: string[];
  aliasesCreated: string[];
}

// ============================================================================
// SIMILARITY FUNCTIONS
// ============================================================================

/**
 * Calculate trigram similarity between two strings
 * Mimics PostgreSQL's pg_trgm similarity() function
 */
export function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  
  const normalize = (s: string) => s.toLowerCase().trim();
  const getTrigrams = (s: string): Set<string> => {
    const padded = `  ${normalize(s)} `;
    const trigrams = new Set<string>();
    for (let i = 0; i < padded.length - 2; i++) {
      trigrams.add(padded.substring(i, i + 3));
    }
    return trigrams;
  };

  const trigramsA = getTrigrams(a);
  const trigramsB = getTrigrams(b);
  
  let intersection = 0;
  for (const t of trigramsA) {
    if (trigramsB.has(t)) intersection++;
  }

  const union = trigramsA.size + trigramsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Normalize company name for comparison
 * Removes common suffixes, punctuation, etc.
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/\s+(corporation|corp|inc|ltd|llc|co\.|company|group|việt nam|vietnam|vn)\.?$/gi, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove punctuation, keep Unicode letters/numbers
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract domain from URL or email
 */
export function normalizeDomain(domain: string | undefined): string | undefined {
  if (!domain) return undefined;
  
  try {
    // Handle full URLs
    if (domain.includes('://')) {
      const url = new URL(domain);
      domain = url.hostname;
    }
    
    // Remove www. prefix
    return domain.replace(/^www\./i, '').toLowerCase();
  } catch {
    return domain.toLowerCase();
  }
}

// ============================================================================
// MATCHING LOGIC
// ============================================================================

/**
 * Find potential matches for a company candidate
 * 
 * Priority order:
 * 1. Domain match (highest confidence)
 * 2. Ticker match (high confidence)
 * 3. Exact name match (high confidence)
 * 4. Fuzzy name match + same location (medium confidence)
 */
export function findPotentialMatches(
  candidate: CompanyCandidate,
  existingCompanies: CompanyCandidate[],
  options: { minSimilarity?: number } = {}
): MatchResult[] {
  const { minSimilarity = 0.65 } = options;
  const matches: MatchResult[] = [];

  const candidateDomain = normalizeDomain(candidate.domain);
  const candidateNameNorm = normalizeCompanyName(candidate.name);

  for (const existing of existingCompanies) {
    if (existing.id === candidate.id) continue;

    let confidence = 0;
    let matchType: MatchResult['matchType'] = 'composite';

    // 1. Domain match - strongest signal
    const existingDomain = normalizeDomain(existing.domain);
    if (candidateDomain && existingDomain && candidateDomain === existingDomain) {
      confidence = 0.95;
      matchType = 'domain';
    }
    // 2. Ticker match
    else if (candidate.ticker && existing.ticker && 
             candidate.ticker.toUpperCase() === existing.ticker.toUpperCase()) {
      confidence = 0.9;
      matchType = 'ticker';
    }
    // 3. Name matching
    else {
      const existingNameNorm = normalizeCompanyName(existing.name);
      
      // Exact normalized name match
      if (candidateNameNorm === existingNameNorm) {
        confidence = 0.85;
        matchType = 'name_exact';
      }
      // Fuzzy name match
      else {
        const similarity = trigramSimilarity(candidateNameNorm, existingNameNorm);
        
        if (similarity >= minSimilarity) {
          confidence = similarity * 0.8; // Scale down fuzzy matches
          matchType = 'name_fuzzy';

          // Boost confidence if location matches
          if (candidate.hqCountry && existing.hqCountry &&
              candidate.hqCountry.toLowerCase() === existing.hqCountry.toLowerCase()) {
            confidence = Math.min(0.9, confidence + 0.1);
          }
          if (candidate.hqCity && existing.hqCity &&
              candidate.hqCity.toLowerCase() === existing.hqCity.toLowerCase()) {
            confidence = Math.min(0.9, confidence + 0.1);
          }
        }
      }
    }

    if (confidence >= minSimilarity) {
      matches.push({
        candidate,
        existing,
        confidence,
        matchType,
        shouldMerge: confidence >= 0.75, // Auto-merge threshold
      });
    }
  }

  // Sort by confidence descending
  return matches.sort((a, b) => b.confidence - a.confidence);
}

// ============================================================================
// MERGE LOGIC
// ============================================================================

/**
 * Merge two company records into one canonical record
 * Keeps the older record as canonical, moves references
 */
export function mergeCompanyData(
  canonical: CompanyCandidate,
  toMerge: CompanyCandidate
): CompanyCandidate {
  // Fill in missing fields from toMerge
  return {
    ...canonical,
    legalName: canonical.legalName || toMerge.legalName,
    ticker: canonical.ticker || toMerge.ticker,
    domain: canonical.domain || toMerge.domain,
    hqCountry: canonical.hqCountry || toMerge.hqCountry,
    hqCity: canonical.hqCity || toMerge.hqCity,
  };
}

/**
 * Generate aliases from merged company names
 */
export function generateAliases(
  canonicalName: string,
  mergedNames: string[]
): string[] {
  const aliases = new Set<string>();
  const canonicalNorm = normalizeCompanyName(canonicalName);

  for (const name of mergedNames) {
    if (name !== canonicalName) {
      aliases.add(name);
    }
    
    const norm = normalizeCompanyName(name);
    if (norm !== canonicalNorm && norm.length > 2) {
      aliases.add(norm);
    }
  }

  return Array.from(aliases);
}

// ============================================================================
// DATABASE OPERATIONS (Mock - replace with Prisma in production)
// ============================================================================

// Mock database storage
const mockCompanies: Map<string, CompanyCandidate> = new Map();
const mockAliases: Map<string, { companyId: string; alias: string; source: string }[]> = new Map();

/**
 * Find or create a company, handling duplicates
 * 
 * @param candidate - Company data from external source
 * @returns Canonical company ID
 */
export async function findOrCreateCompany(
  candidate: CompanyCandidate
): Promise<{ id: string; isNew: boolean; merged: boolean }> {
  // Get all existing companies for matching
  const existingCompanies = Array.from(mockCompanies.values());
  
  // Find potential matches
  const matches = findPotentialMatches(candidate, existingCompanies);
  
  if (matches.length > 0 && matches[0].shouldMerge) {
    const bestMatch = matches[0];
    console.log(
      `🔗 Matched "${candidate.name}" to "${bestMatch.existing.name}" ` +
      `(${bestMatch.matchType}, confidence: ${(bestMatch.confidence * 100).toFixed(1)}%)`
    );

    // Merge data into canonical
    const merged = mergeCompanyData(bestMatch.existing, candidate);
    mockCompanies.set(bestMatch.existing.id, merged);

    // Create alias if names differ
    if (candidate.name !== bestMatch.existing.name) {
      const aliases = mockAliases.get(bestMatch.existing.id) || [];
      aliases.push({
        companyId: bestMatch.existing.id,
        alias: candidate.name,
        source: candidate.source || 'unknown',
      });
      mockAliases.set(bestMatch.existing.id, aliases);
    }

    return { id: bestMatch.existing.id, isNew: false, merged: true };
  }

  // No match found - create new company
  const newId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  mockCompanies.set(newId, { ...candidate, id: newId });
  
  console.log(`➕ Created new company: "${candidate.name}" (id: ${newId})`);
  
  return { id: newId, isNew: true, merged: false };
}

/**
 * Resolve company name to ID, checking aliases
 */
export async function resolveCompanyByName(
  name: string
): Promise<CompanyCandidate | null> {
  const normalizedName = normalizeCompanyName(name);

  // Check direct match
  for (const company of mockCompanies.values()) {
    if (normalizeCompanyName(company.name) === normalizedName) {
      return company;
    }
  }

  // Check aliases
  for (const [companyId, aliases] of mockAliases.entries()) {
    for (const alias of aliases) {
      if (normalizeCompanyName(alias.alias) === normalizedName) {
        return mockCompanies.get(companyId) || null;
      }
    }
  }

  return null;
}

/**
 * Bulk resolve companies with entity resolution
 * 
 * @param candidates - Array of company candidates from external source
 * @returns Array of resolved company IDs
 */
export async function bulkResolveCompanies(
  candidates: CompanyCandidate[]
): Promise<Array<{ id: string; isNew: boolean; merged: boolean }>> {
  const results: Array<{ id: string; isNew: boolean; merged: boolean }> = [];

  for (const candidate of candidates) {
    const result = await findOrCreateCompany(candidate);
    results.push(result);
  }

  const summary = {
    total: results.length,
    new: results.filter(r => r.isNew).length,
    merged: results.filter(r => r.merged).length,
    existing: results.filter(r => !r.isNew && !r.merged).length,
  };

  console.log(`📊 Entity resolution complete:`, summary);

  return results;
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export const __test__ = {
  mockCompanies,
  mockAliases,
  clearMockData: () => {
    mockCompanies.clear();
    mockAliases.clear();
  },
};
