import { CompanyProfile, COMPANIES } from '../data/companies';
import { scoreAllCompanies } from '../services/companyFilter';

let MERGED_COMPANIES: CompanyProfile[] | null = null;


export async function initializeCompanies(): Promise<CompanyProfile[]> {
  if (MERGED_COMPANIES) {
    return MERGED_COMPANIES;
  }

  try {
    console.log(`📥 Loading ${COMPANIES.length} companies from companies.ts`);
    MERGED_COMPANIES = [...COMPANIES];

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
