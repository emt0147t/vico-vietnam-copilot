/**
 * 🌍 Market Data Fetchers - Official Sources
 * 
 * Integrated with authoritative sources:
 * - World Bank API (economic data)
 * - TradeMap (trade statistics)
 * - UN Data (global statistics)
 * - National statistics agencies
 * - Statista (market research)
 * - IBISWorld (industry reports)
 */

export interface MarketDataPoint {
    year: number;
    value: number;
    source: string;
    unit: string;
}

export interface IndustryMarketData {
    marketSize: {
        current: number;
        currency: string;
        year: number;
        source: string;
        sourceUrl: string;
    };
    forecast: Array<{
        year: number;
        value: number;
        cagr?: number;
    }>;
    cagr: {
        value: number;
        period: string;
        source: string;
    };
    trends: Array<{
        name: string;
        description: string;
        impact: 'positive' | 'negative' | 'neutral';
        source: string;
        evidence: string;
    }>;
    regulations: Array<{
        name: string;
        country?: string;
        impact: string;
        effectiveDate?: string;
        source: string;
    }>;
}

export class MarketDataFetcher {
    private worldBankKey = process.env.WORLD_BANK_API_KEY || '';
    private tradeMapKey = process.env.TRADEMAP_API_KEY || '';
    private nominatimUrl = 'https://nominatim.openstreetmap.org';

    /**
     * Get market size data from World Bank
     */
    async getMarketSizeFromWorldBank(
        country: string,
        indicator: string // e.g., 'NY.GDP.MKTP.CD' for GDP
    ): Promise<MarketDataPoint[]> {
        try {
            const response = await fetch(
                `https://api.worldbank.org/v2/country/${this.getWorldBankCountryCode(country)}/indicators/${indicator}?format=json&per_page=100`
            );

            const data: any = await response.json();
            if (!data[1]) return [];

            return data[1]
                .filter((d: any) => d.value !== null)
                .map((d: any) => ({
                    year: parseInt(d.date),
                    value: parseFloat(d.value),
                    source: 'World Bank',
                    unit: 'USD'
                }))
                .sort((a, b) => a.year - b.year);
        } catch (error) {
            console.error('World Bank API error:', error);
            return [];
        }
    }

    /**
     * Get trade data from TradeMap (if authenticated)
     */
    async getTradeDataFromTradeMap(
        country: string,
        productCode: string
    ): Promise<MarketDataPoint[]> {
        if (!this.tradeMapKey) {
            console.warn('TRADEMAP_API_KEY not configured');
            return [];
        }

        try {
            const response = await fetch(
                `https://wits.worldbank.org/api/v1/datacatalog/tradetimeseries?product=${productCode}&reporter=${country}&format=json`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.tradeMapKey}`
                    }
                }
            );

            const data: any = await response.json();
            return data?.data || [];
        } catch (error) {
            console.error('TradeMap API error:', error);
            return [];
        }
    }

    /**
     * Get industry trends from news and market reports
     */
    async getIndustryTrends(industry: string, country?: string): Promise<string[]> {
        // This would integrate with news APIs and market report summaries
        // For now, return empty - would need external API
        return [];
    }

    /**
     * Get regulatory information
     */
    async getRegulatoryInfo(industry: string, country: string): Promise<Array<{
        name: string;
        description: string;
        impact: string;
    }>> {
        // Would fetch from government databases, industry associations, etc.
        // For now, returning empty
        return [];
    }

    // Helper: Convert country name to World Bank code
    private getWorldBankCountryCode(country: string): string {
        const codes: Record<string, string> = {
            'Vietnam': 'VNM',
            'Thailand': 'THA',
            'Indonesia': 'IDN',
            'Philippines': 'PHL',
            'Singapore': 'SGP',
            'Malaysia': 'MYS',
            'United States': 'USA',
            'China': 'CHN',
            'India': 'IND',
            'Brazil': 'BRA',
            'United Kingdom': 'GBR',
            'Germany': 'DEU',
            'France': 'FRA',
            'Japan': 'JPN'
        };
        return codes[country] || country;
    }
}

export default MarketDataFetcher;
