import * as fs from 'fs';
import * as path from 'path';
import { CompanyProfile } from '../data/companies';

export interface CSVRow {
  'Tên công ty'?: string;
  'Website/Link'?: string;
  'Địa chỉ'?: string;
  'Giới thiệu'?: string;
  'Quy mô nhân sự'?: string;
  'Mã số thuế'?: string;
  'Sản phẩm/Dịch vụ'?: string;
  'Người đại diện'?: string;
  'Năm thành lập'?: string;
  'Giới thiệu mới'?: string;
  'Sản phẩm dịch vụ mới'?: string;
  'Khách hàng tiềm năng mới'?: string;
}

const INDUSTRY_MAPPING: Record<string, CompanyProfile['industry']> = {
  'technology': 'Technology',
  'công nghệ': 'Technology',
  'phần mềm': 'Technology',
  'điện tử': 'Technology',
  'it': 'Technology',
  'automotive': 'Automotive',
  'ô tô': 'Automotive',
  'xe': 'Automotive',
  'education': 'Education',
  'giáo dục': 'Education',
  'retail': 'Retail',
  'bán lẻ': 'Retail',
  'thương mại': 'Retail',
  'cửa hàng': 'Retail',
  'finance': 'Finance',
  'tài chính': 'Finance',
  'ngân hàng': 'Finance',
  'bảo hiểm': 'Finance',
};

function inferIndustry(text: string, name: string): CompanyProfile['industry'] {
  const combined = `${text} ${name}`.toLowerCase();
  
  for (const [key, value] of Object.entries(INDUSTRY_MAPPING)) {
    if (combined.includes(key)) {
      return value;
    }
  }
  
  return 'Technology';
}

function parseCSVLine(line: string): Record<string, string> {
  const result: Record<string, string> = {};
  let current = '';
  let inQuotes = false;
  const headers = [
    'Tên công ty',
    'Website/Link',
    'Địa chỉ',
    'Giới thiệu',
    'Quy mô nhân sự',
    'Mã số thuế',
    'Sản phẩm/Dịch vụ',
    'Người đại diện',
    'Năm thành lập',
    'Giới thiệu mới',
    'Sản phẩm dịch vụ mới',
    'Khách hàng tiềm năng mới'
  ];
  let fieldIndex = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result[headers[fieldIndex]] = current.trim();
      current = '';
      fieldIndex++;
    } else {
      current += char;
    }
  }

  if (fieldIndex < headers.length) {
    result[headers[fieldIndex]] = current.trim();
  }

  return result;
}

function parseSize(sizeStr: string): string {
  if (!sizeStr) return 'Unknown';
  
  const normalized = sizeStr.toLowerCase().trim();
  
  const sizeMap: Record<string, string> = {
    'từ 1 - 5 người': '1-5',
    'từ 5 - 10 người': '5-10',
    'từ 11 - 50 người': '11-50',
    'từ 51 - 100 người': '51-100',
    'từ 101 - 200 người': '101-200',
    'từ 201 - 300 người': '201-300',
    'từ 301 - 500 người': '301-500',
    'từ 501 - 1.000 người': '501-1000',
    'từ 1.001 - 5.000 người': '1001-5000',
    '> 5.000 người': '>5000',
    '> 6.000 người': '>6000',
  };

  return sizeMap[normalized] || sizeStr;
}

export async function parseCompaniesCSV(filePath: string): Promise<CompanyProfile[]> {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const lines = fileContent.split('\n');
      const companies: CompanyProfile[] = [];

      // Skip header line (line 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;

        try {
          const row = parseCSVLine(line);
          
          const name = row['Tên công ty']?.trim();
          if (!name) continue;

          const year = parseInt(row['Năm thành lập']?.trim() || new Date().getFullYear().toString());
          
          // Ưu tiên dữ liệu "mới" từ CSV
          const introNew = row['Giới thiệu mới']?.trim();
          const introOld = row['Giới thiệu']?.trim();
          const productsNew = row['Sản phẩm dịch vụ mới']?.trim();
          const productsOld = row['Sản phẩm/Dịch vụ']?.trim();
          const customersNew = row['Khách hàng tiềm năng mới']?.trim();
          
          const company: CompanyProfile = {
            name,
            intro: introNew || introOld || '',
            address: row['Địa chỉ']?.trim() || '',
            year: isNaN(year) ? new Date().getFullYear() : year,
            size: parseSize(row['Quy mô nhân sự']?.trim() || ''),
            products: productsNew || productsOld || '',
            customers: customersNew || '',
            industry: inferIndustry(
              `${introOld} ${productsOld}`,
              name
            ),
            website: row['Website/Link']?.trim(),
            revenue: 'N/A',
            growth: 0,
            sentiment: 'Neutral',
            // Lưu giữ cả dữ liệu "mới" để frontend có thể dùng
            intro_new: introNew,
            products_new: productsNew,
            customers_new: customersNew
          };

          companies.push(company);
        } catch (error) {
          console.warn(`Warning: Error parsing row ${i}:`, error instanceof Error ? error.message : error);
          continue;
        }
      }

      resolve(companies);
    } catch (error) {
      reject(error);
    }
  });
}

export function validateCompanyData(companies: CompanyProfile[]): {
  valid: CompanyProfile[];
  invalid: { row: any; errors: string[] }[];
} {
  const valid: CompanyProfile[] = [];
  const invalid: { row: any; errors: string[] }[] = [];

  companies.forEach((company) => {
    const errors: string[] = [];

    if (!company.name || company.name.trim() === '') {
      errors.push('Missing company name');
    }
    if (company.year < 1900 || company.year > new Date().getFullYear()) {
      errors.push('Invalid founding year');
    }
    if (!company.industry) {
      errors.push('Missing industry classification');
    }
    if (!['Positive', 'Neutral', 'Negative'].includes(company.sentiment)) {
      errors.push('Invalid sentiment value');
    }

    if (errors.length > 0) {
      invalid.push({ row: company, errors });
    } else {
      valid.push(company);
    }
  });

  return { valid, invalid };
}

export async function mergeCompanies(
  csvPath: string,
  existingCompanies: CompanyProfile[]
): Promise<CompanyProfile[]> {
  const csvCompanies = await parseCompaniesCSV(csvPath);
  const { valid: validCSVCompanies } = validateCompanyData(csvCompanies);

  // Remove duplicates by name (CSV entries override existing)
  const existingNames = new Set(validCSVCompanies.map(c => c.name.toLowerCase()));
  const filtered = existingCompanies.filter(c => !existingNames.has(c.name.toLowerCase()));

  // Merge and return
  return [...filtered, ...validCSVCompanies];
}
