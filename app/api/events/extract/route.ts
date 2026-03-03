/**
 * Event Extraction API Route
 * POST /api/events/extract — Extract business events from news articles
 * GET  /api/events/extract?company=FPT — Get recent events for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventExtractionService, NewsArticleInput } from '@/services/eventExtractionService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const articles: NewsArticleInput[] = body.articles || [];

        if (articles.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No articles provided' },
                { status: 400 }
            );
        }

        const result = await EventExtractionService.extractEvents(articles);

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('Event extraction API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to extract events',
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const company = searchParams.get('company');

        if (!company) {
            return NextResponse.json(
                { success: false, error: 'company parameter required' },
                { status: 400 }
            );
        }

        // For GET requests, we return event type metadata and instructions
        // Actual extraction requires POST with articles
        const { EVENT_TYPE_META } = await import('@/services/eventExtractionService');

        return NextResponse.json({
            success: true,
            message: `To extract events for ${company}, POST articles to this endpoint`,
            eventTypes: Object.entries(EVENT_TYPE_META).map(([type, meta]) => ({
                type,
                label: meta.label,
                labelVi: meta.labelVi,
                icon: meta.icon,
            })),
        });

    } catch (error) {
        console.error('Events API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to load event types' },
            { status: 500 }
        );
    }
}
