import { parseCompaniesCSV, validateCompanyData, mergeCompanies } from './parseCompaniesCSV';
import { CompanyProfile, COMPANIES } from '../data/companies';
import * as path from 'path';
import * as fs from 'fs';

let MERGED_COMPANIES: CompanyProfile[] | null = null;

export async function initializeCompanies(): Promise<CompanyProfile[]> {
  if (MERGED_COMPANIES) {
    return MERGED_COMPANIES;
  }

  try {
    const csvPath = path.join(process.cwd(), 'data', 'companies.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.warn('⚠️  CSV file not found at:', csvPath);
      MERGED_COMPANIES = COMPANIES;
      return COMPANIES;
    }

    console.log('📥 Loading companies from CSV...');
    const csvCompanies = await parseCompaniesCSV(csvPath);
    const { valid, invalid } = validateCompanyData(csvCompanies);

    console.log(`✅ Loaded ${csvCompanies.length} total companies from CSV`);
    console.log(`✓ Valid: ${valid.length} companies`);
    if (invalid.length > 0) {
      console.warn(`⚠️  Invalid: ${invalid.length} rows (skipped)`);
    }

    // Merge with existing data
    MERGED_COMPANIES = await mergeCompanies(csvPath, COMPANIES);
    
    console.log(`📊 Final total: ${MERGED_COMPANIES.length} companies in database`);
    
    // Log industry distribution
    const industryCount = MERGED_COMPANIES.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Industry distribution:');
    Object.entries(industryCount).forEach(([industry, count]) => {
      console.log(`   - ${industry}: ${count} companies`);
    });

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
