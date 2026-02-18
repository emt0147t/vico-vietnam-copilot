/**
 * Legal & Scale Data Fetcher
 * 
 * Fetches official company information from Vietnamese business registries
 * 
 * Data includes:
 * - Tax ID (Mã số thuế)
 * - Charter Capital (Vốn điều lệ)
 * - Legal Representative (Người đại diện pháp luật)
 * - Founded Date (Ngày thành lập)
 * - Operating Status (Trạng thái hoạt động)
 * 
 * Sources:
 * - dangkykinhdoanh.gov.vn (Official)
 * - masothue.com (Aggregated public data)
 * - thongtincongty.com (Aggregated public data)
 */

export interface LegalScaleData {
  companyName: string;
  taxId: string | null;
  charterCapital: string | null; // VND or USD
  legalRepresentative: {
    name: string;
    position: string;
  } | null;
  foundedDate: string | null; // ISO format
  operatingStatus: 'Active' | 'Inactive' | 'Dissolved' | 'Unknown';
  businessAddress: string | null;
  businessScope: string[] | null; // Main business lines
  registeredCapital: string | null;
  source: string;
  lastUpdated: string;
  dataQuality: 'High' | 'Medium' | 'Low';
}

class LegalScaleDataFetcher {
  /**
   * Fetch legal and scale data for a company
   * This is a template - can be enhanced with actual crawlers
   */
  async getLegalScaleData(companyName: string): Promise<LegalScaleData> {
    try {
      // Try to find from VICO database first
      const vicoData = this.getFromVicoDatabase(companyName);
      if (vicoData) {
        return vicoData;
      }

      // Fallback: Create template response
      return this.createTemplateResponse(companyName);
    } catch (error) {
      console.error(`Error fetching legal data for ${companyName}:`, error);
      return this.createTemplateResponse(companyName);
    }
  }

  /**
   * Get legal data from VICO company database
   */
  private getFromVicoDatabase(companyName: string): LegalScaleData | null {
    // This would query the existing companies-enriched.json
    // or directly from companiesDataService
    // For now, return null - will be used from main service

    return null; // Placeholder
  }

  /**
   * Extract legal info from company description
   */
  private extractLegalInfo(description: string | null): {
    charterCapital: string | null;
    businessScope: string[];
  } {
    if (!description) {
      return { charterCapital: null, businessScope: [] };
    }

    const desc = description.toLowerCase();

    // Extract business scope from description
    const businessScope: string[] = [];
    const scopeKeywords = {
      'Software & IT': ['software', 'it', 'công nghệ thông tin', 'phần mềm'],
      'Hardware': ['hardware', 'máy tính', 'thiết bị'],
      'E-commerce': ['thương mại điện tử', 'bán hàng online', 'e-commerce'],
      'Manufacturing': ['sản xuất', 'manufacturing', 'chế tạo'],
      'Retail': ['bán lẻ', 'retail', 'cửa hàng'],
      'Logistics': ['vận chuyển', 'logistics', 'kho'],
      'Services': ['dịch vụ', 'services', 'tư vấn'],
      'Consulting': ['tư vấn', 'consulting'],
      'Education': ['đào tạo', 'giáo dục', 'education'],
      'Healthcare': ['y tế', 'healthcare', 'sức khỏe'],
    };

    for (const [scope, keywords] of Object.entries(scopeKeywords)) {
      if (keywords.some((k) => desc.includes(k))) {
        businessScope.push(scope);
      }
    }

    return {
      charterCapital: null, // Would require actual crawling
      businessScope: businessScope.length > 0 ? businessScope : ['General Business'],
    };
  }

  /**
   * Calculate company age from founding date
   */
  calculateCompanyAge(foundedDate: string | null): number | null {
    if (!foundedDate) return null;
    const founded = new Date(foundedDate);
    const today = new Date();
    const ageYears = (today.getTime() - founded.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(ageYears);
  }

  /**
   * Determine operating status from context
   */
  private determineOperatingStatus(
    description: string | null
  ): 'Active' | 'Inactive' | 'Dissolved' | 'Unknown' {
    if (!description) return 'Unknown';

    const desc = description.toLowerCase();

    // Check for negative indicators
    if (
      desc.includes('đóng cửa') ||
      desc.includes('phá sản') ||
      desc.includes('giải thể') ||
      desc.includes('ngừng hoạt động')
    ) {
      return 'Dissolved';
    }

    // Check for indicators of inactivity
    if (
      desc.includes('tạm ngưng') ||
      desc.includes('tạm dừng') ||
      desc.includes('inactive')
    ) {
      return 'Inactive';
    }

    // Default to active
    return 'Active';
  }

  /**
   * Create template response with available data
   */
  private createTemplateResponse(companyName: string): LegalScaleData {
    return {
      companyName,
      taxId: null,
      charterCapital: null,
      legalRepresentative: null,
      foundedDate: null,
      operatingStatus: 'Unknown',
      businessAddress: null,
      businessScope: null,
      registeredCapital: null,
      source: 'Template (Data not available)',
      lastUpdated: new Date().toISOString(),
      dataQuality: 'Low',
    };
  }

  /**
   * Batch fetch legal data for multiple companies
   */
  async getLegalScaleDataBatch(
    companyNames: string[]
  ): Promise<LegalScaleData[]> {
    return Promise.all(
      companyNames.map((name) => this.getLegalScaleData(name))
    );
  }

  /**
   * Verify company authenticity based on legal data
   */
  verifyCompanyAuthenticity(data: LegalScaleData): {
    isVerified: boolean;
    confidence: number; // 0-100
    reasons: string[];
  } {
    const reasons: string[] = [];
    let confidence = 0;

    // Tax ID verification
    if (data.taxId) {
      confidence += 30;
      reasons.push('✓ Tax ID registered');
    } else {
      reasons.push('✗ No Tax ID found');
    }

    // Legal representative
    if (data.legalRepresentative) {
      confidence += 20;
      reasons.push('✓ Legal representative identified');
    } else {
      reasons.push('✗ No legal representative found');
    }

    // Founded date
    if (data.foundedDate) {
      confidence += 20;
      reasons.push('✓ Founding date confirmed');
    } else {
      reasons.push('✗ No founding date found');
    }

    // Operating status
    if (data.operatingStatus === 'Active') {
      confidence += 20;
      reasons.push('✓ Currently operating');
    } else if (data.operatingStatus === 'Dissolved') {
      confidence = 0;
      reasons.push('✗ Company dissolved/ceased operations');
    } else {
      reasons.push('? Operating status unknown');
    }

    // Business address
    if (data.businessAddress) {
      confidence += 10;
      reasons.push('✓ Business address registered');
    }

    return {
      isVerified: confidence >= 50,
      confidence: Math.min(100, confidence),
      reasons,
    };
  }
}

export default LegalScaleDataFetcher;
