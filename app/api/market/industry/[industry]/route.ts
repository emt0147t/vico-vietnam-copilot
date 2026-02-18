/**
 * API Route: GET /api/market/industry/:industry
 * 
 * Returns comprehensive market report combining:
 * - Macro-economic indicators
 * - Industry-specific trade data
 * - Financial metrics
 * - Exclusive VICO insights
 */

import { NextRequest, NextResponse } from 'next/server';
import MarketIndustryController from '@/app/api/market/marketIndustryController';

const controller = new MarketIndustryController();

export async function GET(
  request: NextRequest,
  { params }: { params: { industry: string } }
) {
  try {
    const industry = decodeURIComponent(params.industry);

    // Validate industry
    if (!industry || industry.trim().length === 0) {
      return NextResponse.json(
        { error: 'Industry parameter is required' },
        { status: 400 }
      );
    }

    // Get market report
    const report = await controller.getMarketReport(industry);

    // Add cache headers
    const response = NextResponse.json(report);
    response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    response.headers.set('Content-Type', 'application/json');

    return response;
  } catch (error) {
    console.error(`Error in market API for ${params.industry}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to generate market report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
