/**
 * Trade Data API Route
 * GET /api/trade — Query Vietnam trade data by commodity or industry
 *
 * Query params:
 *   ?commodity=phones       → Commodity-level trade data (fuzzy search)
 *   ?industry=Technology    → Industry-level trade profile
 *   ?summary=true           → Vietnam 2024 trade overview
 *   ?list=commodities       → List all available commodity keys
 *   ?list=industries        → List all available industry keys
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getCommodityTradeData,
    getIndustryTradeProfile,
    findCommodityByName,
    getVietnamTradeSummary2024,
    VIETNAM_COMMODITY_TRADE,
    VIETNAM_INDUSTRY_TRADE,
} from '@/data/vietnamTradeData';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const commodity = searchParams.get('commodity');
        const industry = searchParams.get('industry');
        const summary = searchParams.get('summary');
        const list = searchParams.get('list');

        // List available keys
        if (list === 'commodities') {
            const commodities = Object.entries(VIETNAM_COMMODITY_TRADE).map(([key, data]) => ({
                key,
                commodity: data.commodity,
                commodityVi: data.commodityVi,
                exportValue2024: data.exportValue2024,
            }));
            return NextResponse.json({ success: true, commodities, total: commodities.length });
        }

        if (list === 'industries') {
            const industries = Object.entries(VIETNAM_INDUSTRY_TRADE).map(([key, data]) => ({
                key,
                industry: data.industry,
                totalExport2024: data.totalExport2024,
                totalImport2024: data.totalImport2024,
                tradeBalance2024: data.tradeBalance2024,
            }));
            return NextResponse.json({ success: true, industries, total: industries.length });
        }

        // Vietnam trade summary
        if (summary === 'true' || summary === '1') {
            const tradeSummary = getVietnamTradeSummary2024();
            return NextResponse.json({ success: true, ...tradeSummary });
        }

        // Commodity lookup
        if (commodity) {
            // Try exact key first, then fuzzy search
            let data = getCommodityTradeData(commodity);
            if (!data) {
                data = findCommodityByName(commodity);
            }

            if (!data) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `No trade data found for commodity: "${commodity}"`,
                        availableKeys: Object.keys(VIETNAM_COMMODITY_TRADE),
                    },
                    { status: 404 }
                );
            }

            // Compute derived metrics
            const exportGrowth = ((data.exportValue2024 - data.exportValue2023) / data.exportValue2023 * 100).toFixed(1);
            const importGrowth = ((data.importValue2024 - data.importValue2023) / data.importValue2023 * 100).toFixed(1);
            const tradeBalance2024 = data.exportValue2024 - data.importValue2024;

            return NextResponse.json({
                success: true,
                ...data,
                computed: {
                    exportGrowthPct: parseFloat(exportGrowth),
                    importGrowthPct: parseFloat(importGrowth),
                    tradeBalance2024,
                    tradeBalanceLabel: tradeBalance2024 >= 0 ? 'Surplus' : 'Deficit',
                },
            });
        }

        // Industry lookup
        if (industry) {
            const data = getIndustryTradeProfile(industry);
            if (!data) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `No trade profile for industry: "${industry}"`,
                        availableIndustries: Object.keys(VIETNAM_INDUSTRY_TRADE),
                    },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                ...data,
                tradeBalanceLabel: data.tradeBalance2024 >= 0 ? 'Surplus' : 'Deficit',
            });
        }

        // No params — return usage instructions
        return NextResponse.json({
            success: true,
            message: 'Vietnam Trade Data API',
            usage: {
                commodity: '/api/trade?commodity=phones',
                industry: '/api/trade?industry=Technology',
                summary: '/api/trade?summary=true',
                listCommodities: '/api/trade?list=commodities',
                listIndustries: '/api/trade?list=industries',
            },
            totalCommodities: Object.keys(VIETNAM_COMMODITY_TRADE).length,
            totalIndustries: Object.keys(VIETNAM_INDUSTRY_TRADE).length,
        });

    } catch (error) {
        console.error('Trade API error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to fetch trade data' },
            { status: 500 }
        );
    }
}
