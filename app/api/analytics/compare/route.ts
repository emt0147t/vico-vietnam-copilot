/**
 * Cross-Industry Comparison API — Specification
 * Actual Express handler registered in server.ts
 *
 * GET /api/analytics/compare — All industries ranked and compared
 */

import type { Request, Response } from 'express';
import MarketIndustryAnalytics from '@/services/marketIndustryAnalytics';

const analytics = new MarketIndustryAnalytics();

export async function GET(_req: Request, res: Response): Promise<void> {
    try {
        const comparison = await analytics.getIndustryComparison();
        res.json({ success: true, ...comparison });
    } catch (error) {
        console.error('Industry comparison error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Comparison failed',
        });
    }
}
