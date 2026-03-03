/**
 * PESTEL Analysis API Route
 * GET /api/pestel?industry=Technology&company=FPT
 */

import { NextRequest, NextResponse } from 'next/server';
import { PESTELService } from '@/services/pestelService';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const industry = searchParams.get('industry') || undefined;
        const company = searchParams.get('company') || undefined;
        const quick = searchParams.get('quick') === 'true';

        // Quick scores mode (no AI, instant)
        if (quick) {
            const scores = PESTELService.getQuickScores(industry);
            return NextResponse.json({
                success: true,
                data: scores,
                mode: 'quick',
            });
        }

        // Full report mode
        const report = await PESTELService.generateReport(industry, company);

        return NextResponse.json({
            success: true,
            data: report,
            mode: 'full',
        });

    } catch (error) {
        console.error('PESTEL API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate PESTEL report',
            },
            { status: 500 }
        );
    }
}
