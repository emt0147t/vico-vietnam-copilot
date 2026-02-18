import { NextRequest, NextResponse } from 'next/server';
import CompetitorAnalysisController from '../competitorAnalysisController';

/**
 * Competitor Analysis API Endpoint
 * 
 * GET /api/competitor/analyze?company=FPT Software&competitor=Vingroup
 * 
 * Returns: Comprehensive 4-pillar competitor intelligence report
 * 
 * Response: CompetitorComparison JSON
 */

const controller = new CompetitorAnalysisController();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const company = searchParams.get('company');
    const competitor = searchParams.get('competitor');

    // Validate parameters
    if (!company || company.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company parameter is required' },
        { status: 400 }
      );
    }

    if (!competitor || competitor.trim().length === 0) {
      return NextResponse.json(
        { error: 'Competitor parameter is required' },
        { status: 400 }
      );
    }

    if (company.toLowerCase() === competitor.toLowerCase()) {
      return NextResponse.json(
        { error: 'Company and competitor must be different' },
        { status: 400 }
      );
    }

    // Generate competitor analysis
    const analysis = await controller.analyzeCompetitor(company, competitor);

    // Cache for 30 minutes (refresh frequently since hiring/news changes)
    const response = NextResponse.json(analysis);
    response.headers.set('Cache-Control', 'public, max-age=1800');

    return response;
  } catch (error) {
    console.error('Competitor analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate competitor analysis' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for batch analysis
 * 
 * POST /api/competitor/analyze
 * Body: { companies: string[], competitor: string }
 * 
 * Returns array of analyses comparing each company against the competitor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companies, competitor } = body;

    if (!Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { error: 'Companies array is required' },
        { status: 400 }
      );
    }

    if (!competitor || competitor.trim().length === 0) {
      return NextResponse.json(
        { error: 'Competitor is required' },
        { status: 400 }
      );
    }

    // Analyze all companies against competitor
    const analyses = await Promise.all(
      companies.map((company: string) =>
        controller.analyzeCompetitor(company, competitor)
      )
    );

    const response = NextResponse.json({
      competitor,
      analyses,
      timestamp: new Date().toISOString(),
    });
    response.headers.set('Cache-Control', 'public, max-age=1800');

    return response;
  } catch (error) {
    console.error('Batch competitor analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate batch competitor analysis' },
      { status: 500 }
    );
  }
}
