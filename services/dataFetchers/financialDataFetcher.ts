/**
 * 📈 Financial Data Fetcher
 * 
 * Fetches real financial data from public sources:
 * - SEC Edgar (US public companies)
 * - Alpha Vantage
 * - IEX Cloud
 */

export interface FinancialData {
    company: string;
    revenue: number;
    revenueGrowth: number;
    netIncome: number;
    grossMargin: number;
    operatingMargin: number;
    ticker?: string;
    currency: string;
    fiscalYear: number;
    source: string;
}

export class FinancialDataFetcher {
    private alphaVantageKey = process.env.ALPHA_VANTAGE_KEY || '';
    private iexKey = process.env.IEX_CLOUD_KEY || '';
    private edgarSource = 'https://www.sec.gov/cgi-bin/browse-edgar';

    /**
     * Get company financials từ SEC Edgar
     */
    async getSecFilings(companyName: string): Promise<FinancialData[]> {
        try {
            // Search SEC for company CIK
            const cik = await this.searchSecCIK(companyName);
            if (!cik) return [];

            // Fetch 10-K filings
            const filings = await this.fetch10KFiling(cik);
            return filings;
        } catch (error) {
            console.error('SEC Edgar error:', error);
            return [];
        }
    }

    private async searchSecCIK(companyName: string): Promise<string | null> {
        try {
            const response = await fetch(
                `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&action=getcompany&format=json`
            );

            const data: any = await response.json();
            if (data.cik_lookup && Object.keys(data.cik_lookup).length > 0) {
                const firstMatch = Object.values(data.cik_lookup)[0] as any;
                return firstMatch.cik_str;
            }
            return null;
        } catch (error) {
            console.error('SEC CIK search error:', error);
            return null;
        }
    }

    private async fetch10KFiling(cik: string): Promise<FinancialData[]> {
        // This would parse 10-K XML documents
        // For simplicity, returning empty for now
        return [];
    }

    /**
     * Get stock data từ Alpha Vantage
     */
    async getStockData(ticker: string): Promise<FinancialData | null> {
        if (!this.alphaVantageKey) {
            console.warn('ALPHA_VANTAGE_KEY not set');
            return null;
        }

        try {
            // Get company overview
            const response = await fetch(
                `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${this.alphaVantageKey}`
            );

            const data: any = await response.json();

            return {
                company: data.Name,
                revenue: this.parseNumber(data.RevenueTTM),
                revenueGrowth: 0, // Would need historical data
                netIncome: this.parseNumber(data.NetIncomeCommon),
                grossMargin: this.parseFloat(data.GrossMarginTTM),
                operatingMargin: this.parseFloat(data.OperatingMarginTTM),
                ticker: ticker,
                currency: 'USD',
                fiscalYear: new Date().getFullYear(),
                source: 'alpha_vantage'
            };
        } catch (error) {
            console.error('Alpha Vantage error:', error);
            return null;
        }
    }

    /**
     * Get company financials from IEX Cloud
     */
    async getIexcFinancials(ticker: string): Promise<FinancialData | null> {
        if (!this.iexKey) {
            console.warn('IEX_CLOUD_KEY not set');
            return null;
        }

        try {
            const response = await fetch(
                `https://cloud.iexapis.com/stable/data/core_financials/${ticker}/annual?token=${this.iexKey}`
            );

            const data: any = await response.json();

            if (!data.financials || data.financials.length === 0) {
                return null;
            }

            const latest = data.financials[0];

            return {
                company: latest.reportDate,
                revenue: latest.totalRevenue || 0,
                revenueGrowth: 0,
                netIncome: latest.netIncome || 0,
                grossMargin: 0,
                operatingMargin: 0,
                ticker: ticker,
                currency: 'USD',
                fiscalYear: new Date(latest.reportDate).getFullYear(),
                source: 'iex_cloud'
            };
        } catch (error) {
            console.error('IEX Cloud error:', error);
            return null;
        }
    }

    private parseNumber(value: string | number): number {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        return parseInt(value.toString().replace(/[^0-9.-]/g, '')) || 0;
    }

    private parseFloat(value: string | number): number {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        return parseFloat(value.toString().replace(/[^0-9.-]/g, '')) || 0;
    }
}

export default FinancialDataFetcher;
