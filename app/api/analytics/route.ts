/**
 * Analytics API Route — Specification
 * Actual Express handler registered in server.ts
 *
 * GET /api/analytics — Industry analytics from MarketIndustryAnalytics
 *
 * Query params:
 *   ?industry=Technology  → Market index for a specific industry
 *   ?trending=true        → Industry trend summary (most dynamic, mature, healthy)
 */

import type { Request, Response } from 'express';
import MarketIndustryAnalytics from '@/services/marketIndustryAnalytics';

const analytics = new MarketIndustryAnalytics();

export async function GET(req: Request, res: Response): Promise<void> {
    try {
        const industry = req.query['industry'] as string | undefined;
        const trending = req.query['trending'] as string | undefined;

        // Industry trend summary
        if (trending === 'true' || trending === '1') {
            const summary = analytics.getIndustryTrendSummary();
            res.json({ success: true, ...summary });
            return;
        }

        // Specific industry market index
        if (industry) {
            try {
                const metrics = await analytics.getMarketIndexByIndustry(industry);
                res.json({ success: true, ...metrics });
            } catch (err) {
                res.status(404).json({
                    success: false,
                    error: err instanceof Error ? err.message : `No data for "${industry}"`,
                });
            }
            return;
        }

        // No params — return usage
        res.json({
            success: true,
            message: 'VICO Analytics API',
            usage: {
                industry: '/api/analytics?industry=Technology',
                trending: '/api/analytics?trending=true',
                compare: '/api/analytics/compare',
            },
        });

    } catch (error) {
        console.error('Analytics API error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Analytics failed',
        });
    }
}
