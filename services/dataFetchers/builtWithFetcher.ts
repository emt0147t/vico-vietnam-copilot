/**
 * 🛠️ Built With / Tech Stack Fetcher
 * 
 * Detects tech stack used by companies
 * Source: BuiltWith API (https://builtwith.com/api)
 */

export interface TechStackData {
    cloud: string[];
    frontend: string[];
    backend: string[];
    database: string[];
    analytics: string[];
    other: string[];
}

export class BuiltWithFetcher {
    private apiKey = process.env.BUILTWITH_API_KEY || '';
    private baseUrl = 'https://api.builtwith.com/v20';

    /**
     * Detect tech stack từ website
     */
    async getTechStack(website: string): Promise<TechStackData | null> {
        if (!this.apiKey) {
            console.warn('BUILTWITH_API_KEY not set');
            return null;
        }

        // Clean URL
        const cleanUrl = this.cleanUrl(website);

        try {
            const response = await fetch(
                `${this.baseUrl}/api.json?key=${this.apiKey}&lookup=${encodeURIComponent(cleanUrl)}`
            );

            if (!response.ok) {
                return null;
            }

            const data: any = await response.json();

            if (!data.Results || data.Results.length === 0) {
                return null;
            }

            const result = data.Results[0];
            return this.parseTechStack(result.Result || []);
        } catch (error) {
            console.error('BuiltWith API error:', error);
            return null;
        }
    }

    /**
     * Parse BuiltWith response into tech categories
     */
    private parseTechStack(technologies: any[]): TechStackData {
        const stack: TechStackData = {
            cloud: [],
            frontend: [],
            backend: [],
            database: [],
            analytics: [],
            other: []
        };

        technologies.forEach((tech: any) => {
            const name = tech.Name || '';
            const category = tech.Category || [];

            // Classify by category
            if (category.includes('Cloud')) {
                stack.cloud.push(name);
            } else if (category.includes('JavaScript Frameworks')) {
                stack.frontend.push(name);
            } else if (category.includes('Web Frameworks')) {
                stack.backend.push(name);
            } else if (category.includes('Database Managers')) {
                stack.database.push(name);
            } else if (category.includes('Analytics')) {
                stack.analytics.push(name);
            } else {
                stack.other.push(name);
            }
        });

        // Remove duplicates
        Object.keys(stack).forEach(key => {
            stack[key as keyof TechStackData] = [...new Set(stack[key as keyof TechStackData])];
        });

        return stack;
    }

    private cleanUrl(url: string): string {
        // Remove protocol
        url = url.replace(/^https?:\/\//i, '');
        // Remove trailing slash
        url = url.replace(/\/$/, '');
        // Get domain only
        url = url.split('/')[0];
        return url;
    }
}

export default BuiltWithFetcher;
