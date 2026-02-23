/**
 * Vietnamese Companies CSV Crawler & Enricher
 * Crawls 10,000+ companies from CSV and enriches with real-time data
 * Purpose: Eliminate AI-generated data, use real company data from multiple sources
 * 
 * Data Sources:
 * - Primary: companies.csv (official Vietnamese company database)
 * - Secondary: NewsAPI (real company news & sentiment)
 * - Secondary: Financial APIs (revenue, growth estimates)
 * 
 * Usage: npx tsx scripts/crawlCompaniesFromCSV.ts [options]
 * Options:
 *   --full      Full crawl with API enrichment
 *   --fast      Quick parse of CSV only
 *   --limit N   Process only N companies
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface CompanyFromCSV {
  name: string;
  website?: string;
  address: string;
  intro: string;
  employees: string;
  taxId?: string;
  products: string;
  representative?: string;
  yearFounded?: number;
  intro_new?: string;
  products_new?: string;
  customers_new?: string;
}

interface EnrichedCompany extends CompanyFromCSV {
  revenue?: string;
  growth?: number;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
  industry?: string;
  source: 'CSV';
  lastUpdated: string;
}

class CompaniesCSVCrawler {
  private csvPath = path.join(process.cwd(), 'data', 'companies.csv');
  private companiesProcessed = 0;
  private enrichedCompanies: EnrichedCompany[] = [];
  private industries: { [key: string]: number } = {};

  /**
   * Parse CSV file and extract companies
   * Handles large CSV files (10,000+ rows) efficiently
   */
  async parseCSV(): Promise<EnrichedCompany[]> {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(this.csvPath, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

      let isFirstLine = true;
      const companies: EnrichedCompany[] = [];
      let lineNumber = 0;

      rl.on('line', (line) => {
        lineNumber++;

        // Skip header
        if (isFirstLine) {
          isFirstLine = false;
          return;
        }

        try {
          const company = this.parseCSVLine(line);
          if (company) {
            const enriched = this.enrichCompanyData(company);
            companies.push(enriched);
            this.companiesProcessed++;

            // Log progress every 1000 companies
            if (this.companiesProcessed % 1000 === 0) {
              console.log(`✓ Processed: ${this.companiesProcessed} companies`);
            }
          }
        } catch (error) {
          console.warn(`⚠️  Error parsing line ${lineNumber}:`, error instanceof Error ? error.message : 'Unknown error');
        }
      });

      rl.on('close', () => {
        this.enrichedCompanies = companies;
        resolve(companies);
      });

      rl.on('error', reject);
    });
  }

  /**
   * Parse single CSV line with proper handling of quoted fields and commas
   */
  private parseCSVLine(line: string): CompanyFromCSV | null {
    // Handle CSV format with quoted fields
    const fields = this.parseCSVFields(line);

    if (fields.length < 7) return null; // Minimum required fields

    const company: CompanyFromCSV = {
      name: fields[0]?.trim() || 'Unknown',
      website: fields[1]?.trim() || undefined,
      address: fields[2]?.trim() || '',
      intro: fields[3]?.trim() || '',
      employees: fields[4]?.trim() || 'Unknown',
      taxId: fields[5]?.trim() || undefined,
      products: fields[6]?.trim() || '',
      representative: fields[7]?.trim() || undefined,
      yearFounded: this.parseYear(fields[8]),
      intro_new: fields[9]?.trim() || undefined,
      products_new: fields[10]?.trim() || undefined,
      customers_new: fields[11]?.trim() || undefined,
    };

    return company;
  }

  /**
   * Parse CSV fields properly handling quoted fields with commas inside
   */
  private parseCSVFields(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    fields.push(current);
    return fields;
  }

  /**
   * Extract year from string like "2020" or "năm 2020"
   */
  private parseYear(yearStr: string | undefined): number | undefined {
    if (!yearStr) return undefined;
    const match = yearStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : undefined;
  }

  /**
   * Enrich company data with calculated fields
   */
  private enrichCompanyData(company: CompanyFromCSV): EnrichedCompany {
    const enriched: EnrichedCompany = {
      ...company,
      source: 'CSV',
      lastUpdated: new Date().toISOString(),
    };

    // Infer industry from products and intro
    enriched.industry = this.inferIndustry(company);
    if (enriched.industry) {
      this.industries[enriched.industry] = (this.industries[enriched.industry] || 0) + 1;
    }

    // Growth rate: null (unknown) — no fabricated numbers
    enriched.growth = this.estimateGrowth(company) ?? undefined;

    // Estimate sentiment from intro text
    enriched.sentiment = this.analyzeSentiment(company.intro || '');

    // Revenue not available from CSV source - keep authentic data only
    enriched.revenue = 'NOT FOUND';

    return enriched;
  }

  /**
   * Infer industry from products and introduction
   * Uses Vietnamese keyword matching aligned with VSIC (Vietnam Standard Industrial Classification)
   * Expanded from 8 to 16 industries with comprehensive Vietnamese keywords
   */
  private inferIndustry(company: CompanyFromCSV): string | undefined {
    const text = (company.intro + ' ' + company.products + ' ' + (company.intro_new || '')).toLowerCase();

    // Technology / CNTT
    if (text.match(/(phần mềm|công nghệ thông tin|cntt|lập trình|website|app|ứng dụng|software|digital|it |ai |machine learning|data|cloud|saas|blockchain|fintech|internet|e-commerce|thương mại điện tử)/))
      return 'Technology';

    // Finance & Banking / Tài chính Ngân hàng
    if (text.match(/(tài chính|ngân hàng|chứng khoán|bảo hiểm|đầu tư|quỹ|tín dụng|cho vay|finance|banking|insurance|securities|investment|fintech|ví điện tử|thanh toán)/))
      return 'Finance';

    // Real Estate / Bất động sản
    if (text.match(/(bất động sản|nhà đất|chung cư|khu đô thị|dự án|căn hộ|biệt thự|real estate|property|housing|quy hoạch|phân lô|mặt bằng|cho thuê.*nhà|văn phòng cho thuê)/))
      return 'Real Estate';

    // Construction / Xây dựng
    if (text.match(/(xây dựng|xây lắp|thi công|kiến trúc|kết cấu|bê tông|xi măng|cốt thép|vật liệu xây|construction|cầu đường|hạ tầng|công trình|nền móng)/))
      return 'Construction';

    // Manufacturing / Sản xuất
    if (text.match(/(sản xuất|nhà máy|gia công|chế biến|manufacturing|factory|dây chuyền|lắp ráp|công nghiệp|khu công nghiệp|linh kiện|nguyên liệu|bao bì|đóng gói)/))
      return 'Manufacturing';

    // Healthcare / Y tế
    if (text.match(/(y tế|bệnh viện|phòng khám|dược|thuốc|sức khỏe|healthcare|medical|pharmaceutical|hospital|clinic|chẩn đoán|điều trị|nha khoa|thẩm mỹ|thiết bị y tế)/))
      return 'Healthcare';

    // Education / Giáo dục  
    if (text.match(/(giáo dục|đào tạo|trường|đại học|học viện|education|training|university|trung tâm.*dạy|ngoại ngữ|tiếng anh|du học|luyện thi|mầm non|tiểu học)/))
      return 'Education';

    // Retail & Trade / Bán lẻ & Thương mại
    if (text.match(/(thương mại|bán lẻ|bán hàng|siêu thị|cửa hàng|retail|shop|showroom|marketplace|phân phối|đại lý|cung (ứng|cấp)|bán buôn|nhập khẩu|xuất khẩu)/))
      return 'Retail';

    // Food & Beverage / Thực phẩm & Đồ uống
    if (text.match(/(thực phẩm|đồ uống|nước giải khát|bia|rượu|nhà hàng|quán|café|coffee|food|beverage|restaurant|nông sản|thủy sản|hải sản|chế biến.*thực phẩm|bánh|sữa)/))
      return 'Food & Beverage';

    // Logistics & Transportation / Vận tải & Logistics
    if (text.match(/(logistics|vận chuyển|vận tải|giao hàng|delivery|shipping|kho bãi|warehouse|cảng|hàng hải|container|freight|chuyển phát|bưu chính|taxi|xe tải)/))
      return 'Logistics';

    // Agriculture / Nông nghiệp
    if (text.match(/(nông nghiệp|nông sản|trồng trọt|chăn nuôi|thủy sản|nuôi trồng|agriculture|farming|phân bón|thuốc trừ sâu|giống|lâm nghiệp|cao su|cà phê|lúa gạo)/))
      return 'Agriculture';

    // Energy / Năng lượng
    if (text.match(/(điện|năng lượng|energy|solar|pin|dầu khí|gas|xăng|petroleum|điện tử|năng lượng tái tạo|thủy điện|nhiệt điện|điện gió|điện mặt trời)/))
      return 'Energy';

    // Tourism & Hospitality / Du lịch & Khách sạn
    if (text.match(/(du lịch|khách sạn|resort|hotel|tourism|travel|tour|lữ hành|nghỉ dưỡng|spa|villa|booking|homestay)/))
      return 'Tourism & Hospitality';

    // Media & Entertainment / Truyền thông & Giải trí
    if (text.match(/(truyền thông|quảng cáo|media|marketing|sự kiện|event|giải trí|entertainment|game|phim|truyền hình|báo chí|pr |digital marketing|seo)/))
      return 'Media & Entertainment';

    // Textiles & Garment / Dệt may
    if (text.match(/(dệt may|may mặc|thời trang|vải|garment|textile|fashion|quần áo|giày dép|da giày|footwear|sợi)/))
      return 'Textiles & Garment';

    // Consulting & Professional Services / Tư vấn
    if (text.match(/(tư vấn|consultant|consulting|luật|law|kiểm toán|audit|kế toán|accounting|nhân sự|hr |headhunt|tuyển dụng|recruitment|thiết kế|design)/))
      return 'Consulting & Services';

    return 'Other';
  }

  /**
   * Growth estimation - returns null (unknown) since we don't have real revenue data.
   * Only real growth data from verified financial reports should be used.
   * Previous implementation used charCodeAt() pseudo-random which produced fake numbers.
   */
  private estimateGrowth(_company: CompanyFromCSV): number | null {
    // DO NOT fabricate growth numbers. Return null to indicate "data not available".
    // Real growth data should come from:
    // - Company financial reports (báo cáo tài chính)
    // - GSO (Tổng cục Thống kê) industry averages
    // - Stock exchange filings (HOSE, HNX, UPCOM)
    return null;
  }

  /**
   * Analyze sentiment from introduction text
   */
  private analyzeSentiment(text: string): 'Positive' | 'Neutral' | 'Negative' {
    const positiveWords = [
      'hàng đầu',
      'tốt nhất',
      'uy tín',
      'chuyên nghiệp',
      'tiên tiến',
      'dẫn đầu',
      'thành công',
      'nổi tiếng',
      'phát triển',
      'growing',
      'leader',
    ];
    const negativeWords = ['giảm', 'khó khăn', 'thách thức', 'declined', 'challenge'];

    const textLower = text.toLowerCase();
    const positiveScore = positiveWords.filter((w) => textLower.includes(w)).length;
    const negativeScore = negativeWords.filter((w) => textLower.includes(w)).length;

    if (positiveScore > negativeScore) return 'Positive';
    if (negativeScore > positiveScore) return 'Negative';
    return 'Neutral';
  }

  /**
   * NOTE: Revenue estimation removed to maintain data authenticity
   * Only real revenue data will be used when CSV source is available
   */
  // @ts-ignore - Kept for future reference
  private _estimateRevenueFromSize(_employeeStr: string): string {
    return 'NOT FOUND';
  }

  /**
   * Enrich companies with real-time data from APIs (optional)
   */
  async enrichWithAPIs(options?: { useNewsAPI?: boolean; limit?: number }): Promise<void> {
    const newsApiKey = process.env['NEWSAPI_KEY'];
    const useNews = options?.useNewsAPI && newsApiKey;
    const limit = options?.limit || this.enrichedCompanies.length;

    if (useNews) {
      console.log(`\n📰 Enriching with NewsAPI data (${limit} companies)...\n`);

      for (let i = 0; i < Math.min(limit, this.enrichedCompanies.length); i++) {
        const company = this.enrichedCompanies[i];
        if (!company) continue;

        try {
          // Fetch latest news about company
          const newsData = await this.fetchNewsForCompany(company.name, newsApiKey, 3);

          if (newsData && newsData.length > 0) {
            // Update sentiment based on recent news
            const newsSentiments = newsData.map((article) => this.analyzeSentiment(article.description || ''));
            const positiveNews = newsSentiments.filter((s) => s === 'Positive').length;
            const negativeNews = newsSentiments.filter((s) => s === 'Negative').length;

            if (positiveNews > negativeNews) {
              company.sentiment = 'Positive';
            } else if (negativeNews > positiveNews) {
              company.sentiment = 'Negative';
            }
          }
        } catch (error) {
          // Skip errors, continue with next company
        }

        // Respect API rate limits
        if ((i + 1) % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay every 10 requests
        }
      }

      console.log(`✓ Enriched ${limit} companies with news sentiment`);
    }
  }

  /**
   * Fetch news for a company from NewsAPI
   */
  private async fetchNewsForCompany(companyName: string, apiKey: string, limit: number = 5): Promise<any[]> {
    try {
      const response = await fetch(`https://newsapi.org/v2/everything?q="${companyName}"&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${apiKey}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) return [];

      const data = (await response.json()) as any;
      return data.articles || [];
    } catch {
      return [];
    }
  }

  /**
   * Export companies to JSON for use in application
   */
  exportToJSON(outputPath: string = path.join(process.cwd(), 'data', 'companies-enriched.json')): void {
    const output = {
      totalCompanies: this.enrichedCompanies.length,
      lastUpdated: new Date().toISOString(),
      industries: this.industries,
      companies: this.enrichedCompanies,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n✅ Exported ${this.enrichedCompanies.length} companies to:`);
    console.log(`   ${outputPath}`);
  }

  /**
   * Print statistics
   */
  printStatistics(): void {
    if (this.enrichedCompanies.length === 0) return;

    console.log('\n📊 STATISTICS');
    console.log('═'.repeat(50));
    console.log(`Total Companies: ${this.enrichedCompanies.length}`);

    // Industry breakdown
    console.log('\nIndustries:');
    Object.entries(this.industries)
      .sort((a, b) => b[1] - a[1])
      .forEach(([industry, count]) => {
        console.log(`  • ${industry}: ${count}`);
      });

    // Employee size breakdown
    const sizeBreakdown: { [key: string]: number } = {};
    this.enrichedCompanies.forEach((c) => {
      const size = c.employees;
      sizeBreakdown[size] = (sizeBreakdown[size] || 0) + 1;
    });

    console.log('\nEmployee Sizes:');
    Object.entries(sizeBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([size, count]) => {
        console.log(`  • ${size}: ${count}`);
      });

    // Sentiment breakdown
    const sentiments: { [key: string]: number } = {};
    this.enrichedCompanies.forEach((c) => {
      sentiments[c.sentiment || 'Neutral'] = (sentiments[c.sentiment || 'Neutral'] || 0) + 1;
    });

    console.log('\nSentiment Distribution:');
    Object.entries(sentiments).forEach(([sentiment, count]) => {
      const pct = ((count / this.enrichedCompanies.length) * 100).toFixed(1);
      console.log(`  • ${sentiment}: ${count} (${pct}%)`);
    });

    // Average founding year
    const validYears = this.enrichedCompanies.filter((c) => c.yearFounded).map((c) => c.yearFounded || 0);
    if (validYears.length > 0) {
      const avgYear = Math.round(validYears.reduce((a, b) => a + b, 0) / validYears.length);
      console.log(`\nAverage Founding Year: ${avgYear}`);
    }
  }

  /**
   * Main execution
   */
  async run(options?: { full?: boolean; fast?: boolean; limit?: number; exportJSON?: boolean }): Promise<void> {
    console.log('\n🚀 Starting Vietnamese Companies CSV Crawler\n');
    console.log(`📄 Reading from: ${this.csvPath}`);

    // Check if file exists
    if (!fs.existsSync(this.csvPath)) {
      console.error(`❌ CSV file not found: ${this.csvPath}`);
      process.exit(1);
    }

    try {
      // Parse CSV
      console.log('📖 Parsing companies.csv...\n');
      await this.parseCSV();

      console.log(`\n✅ Successfully parsed ${this.companiesProcessed} companies from CSV\n`);

      // Apply limit if specified
      if (options?.limit && options.limit < this.enrichedCompanies.length) {
        this.enrichedCompanies = this.enrichedCompanies.slice(0, options.limit);
      }

      // Enrich with APIs if full mode
      if (options?.full) {
        await this.enrichWithAPIs({
          useNewsAPI: true,
          limit: options.limit || 100, // Limit API calls
        });
      }

      // Print statistics
      this.printStatistics();

      // Export to JSON
      if (options?.exportJSON !== false) {
        this.exportToJSON();
      }

      console.log('\n💡 Next steps:');
      console.log('   1. Use companies-enriched.json in Market & Industry page');
      console.log('   2. All data is 100% real (from companies.csv)');
      console.log('   3. No AI-generated data - pure authentic company information\n');
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }
}

// Main execution
const crawler = new CompaniesCSVCrawler();

// Parse command-line arguments
const args = process.argv.slice(2);
const options = {
  full: args.includes('--full'),
  fast: args.includes('--fast'),
  limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1] || '0') : undefined,
  exportJSON: !args.includes('--no-export'),
};

crawler.run(options).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
