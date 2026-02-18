/**
 * 💰 Crunchbase Data Fetcher
 * 
 * Fetches real funding data from Crunchbase API
 * Needs API key: https://www.crunchbase.com/
 */

export interface FundingData {
    totalFunding: number;
    totalFundingFormatted: string;
    lastRoundAmount: number;
    lastRoundDate: string;
    fundingRounds: Array<{
        roundType: string;
        amount: number;
        date: string;
        investors: string[];
    }>;
    investors: string[];
    foundedYear: number;
    founders: string[];
}

export class CrunchbaseDataFetcher {
    private apiKey = process.env.CRUNCHBASE_API_KEY || '';
    private baseUrl = 'https://api.crunchbase.com/api/v4';

    /**
     * Get company funding information
     */
    async getFundingData(companyName: string): Promise<FundingData | null> {
        if (!this.apiKey) {
            console.warn('CRUNCHBASE_API_KEY not set - using mock data');
            return null;
        }

        try {
            // Search for company first
            const searchResponse = await fetch(
                `${this.baseUrl}/entities/companies/search`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Cb-User-Key': this.apiKey
                    },
                    body: JSON.stringify({
                        name: companyName,
                        limit: 1
                    })
                }
            );

            const searchData: any = await searchResponse.json();
            if (!searchData.entities || searchData.entities.length === 0) {
                return null;
            }

            const company = searchData.entities[0];

            return {
                totalFunding: company.funding_total?.value_usd || 0,
                totalFundingFormatted: this.formatCurrency(company.funding_total?.value_usd || 0),
                lastRoundAmount: company.last_funding_amount?.value_usd || 0,
                lastRoundDate: company.last_funding_date || '',
                fundingRounds: company.funding_rounds?.map((round: any) => ({
                    roundType: round.round_type || 'Unknown',
                    amount: round.funds_raised?.value_usd || 0,
                    date: round.announced_on || '',
                    investors: round.investors?.map((i: any) => i.name) || []
                })) || [],
                investors: company.investors?.map((i: any) => i.name) || [],
                foundedYear: parseInt(company.founded_on?.split('-')[0] || '0'),
                founders: company.founders?.map((f: any) => f.name) || []
            };
        } catch (error) {
            console.error('Crunchbase API error:', error);
            return null;
        }
    }

    /**
     * Get person/founder information
     */
    async getFounderInfo(name: string) {
        if (!this.apiKey) return null;

        try {
            const response = await fetch(
                `${this.baseUrl}/entities/people/search`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Cb-User-Key': this.apiKey
                    },
                    body: JSON.stringify({
                        name: name,
                        limit: 1
                    })
                }
            );

            const data: any = await response.json();
            return data.entities?.[0] || null;
        } catch (error) {
            console.error('Crunchbase founder search error:', error);
            return null;
        }
    }

    private formatCurrency(amount: number): string {
        if (amount >= 1_000_000_000) {
            return `$${(amount / 1_000_000_000).toFixed(2)}B`;
        }
        if (amount >= 1_000_000) {
            return `$${(amount / 1_000_000).toFixed(2)}M`;
        }
        if (amount >= 1_000) {
            return `$${(amount / 1_000).toFixed(2)}K`;
        }
        return `$${amount.toFixed(2)}`;
    }
}

export default CrunchbaseDataFetcher;
