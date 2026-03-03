import { CompanyProfile, COMPANIES } from '../data/companies';
import { scoreAllCompanies } from '../services/companyFilter';
import { getVerifiedCompanyProfilesForMerge } from '../services/verifiedDataService';

let MERGED_COMPANIES: CompanyProfile[] | null = null;


export async function initializeCompanies(): Promise<CompanyProfile[]> {
  if (MERGED_COMPANIES) {
    return MERGED_COMPANIES;
  }

  try {
    console.log(`📥 Loading ${COMPANIES.length} companies from companies.ts`);
    MERGED_COMPANIES = [...COMPANIES];

    // 🏆 Merge verified-first companies: replace legacy duplicates with verified versions
    try {
      const verifiedProfiles = getVerifiedCompanyProfilesForMerge();
      const verifiedNames = new Set(verifiedProfiles.map((vp: any) => vp.name.toLowerCase()));

      // Remove legacy duplicates
      const beforeCount = MERGED_COMPANIES.length;
      MERGED_COMPANIES = MERGED_COMPANIES.filter(c => !verifiedNames.has(c.name.toLowerCase()));
      const removedCount = beforeCount - MERGED_COMPANIES.length;

      // Add verified companies at the front (they appear first in search / browse)
      MERGED_COMPANIES = [...verifiedProfiles, ...MERGED_COMPANIES];

      console.log(`🏆 Verified-first merge: ${verifiedProfiles.length} verified companies loaded, ${removedCount} legacy duplicates replaced`);
    } catch (verifiedError) {
      console.warn('⚠️ Could not load verified companies, continuing with legacy data:', verifiedError instanceof Error ? verifiedError.message : verifiedError);
    }

    // Log industry distribution
    const industryCount = MERGED_COMPANIES.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📈 Industry distribution:');
    Object.entries(industryCount).forEach(([industry, count]) => {
      console.log(`   - ${industry}: ${count} companies`);
    });

    // 🎯 Score all companies for data quality tiers
    const tierStats = scoreAllCompanies(MERGED_COMPANIES);
    console.log(`🎯 Data quality tiers: Premium=${tierStats.premium}, Standard=${tierStats.standard}, Basic=${tierStats.basic} (avg score: ${tierStats.averageScore})`);

    return MERGED_COMPANIES;
  } catch (error) {
    console.error('❌ Error initializing companies:', error instanceof Error ? error.message : error);
    MERGED_COMPANIES = COMPANIES;
    return COMPANIES;
  }
}

export function getAllCompanies(): CompanyProfile[] {
  return MERGED_COMPANIES || COMPANIES;
}

export function getCompaniesByIndustry(industry: string): CompanyProfile[] {
  return getAllCompanies().filter(c => c.industry === industry);
}

export function searchCompanies(query: string): CompanyProfile[] {
  const lowerQuery = query.toLowerCase();
  return getAllCompanies().filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.products.toLowerCase().includes(lowerQuery) ||
    c.address.toLowerCase().includes(lowerQuery) ||
    c.intro.toLowerCase().includes(lowerQuery)
  );
}
