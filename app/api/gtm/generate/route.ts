/**
 * API Route: GTM Strategy Generation
 * POST /api/gtm/generate
 * Generate Go-To-Market recommendations
 */

import { NextRequest, NextResponse } from "next/server";
import { GTMStrategyService } from "@/services/gtmStrategyService";
import { NewsDB, initializeNewsDB } from "@/utils/newsDatabase";
import { COMPANIES } from "@/data/companies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, targetMarkets } = body;

    // Validate input
    if (!companyName) {
      return NextResponse.json(
        { error: "Company name required" },
        { status: 400 }
      );
    }

    // Find company in database
    const company = COMPANIES.find(
      (c) => c.name.toLowerCase() === companyName.toLowerCase()
    );

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Get company news and signals
    await initializeNewsDB();
    const companyNews = await NewsDB.searchByCompany(companyName, 100);

    // Extract signals from news
    const signalMap = new Map<string, number>();
    companyNews.forEach((news) => {
      news.signals?.forEach((signal) => {
        signalMap.set(signal, (signalMap.get(signal) || 0) + 1);
      });
    });

    const topSignals = Array.from(signalMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([signal]) => signal);

    // Get competitors
    const competitors = COMPANIES.filter(
      (c) => c.industry === company.industry && c.name !== companyName
    )
      .slice(0, 5)
      .map((c) => c.name);

    // Generate GTM recommendation
    const context = {
      name: companyName,
      industry: company.industry || "Technology",
      marketPosition: company.industry?.includes("Technology")
        ? "emerging"
        : "new_entrant",
      signals: topSignals,
      newsCount: companyNews.length,
      competitors,
      targetMarkets: targetMarkets || ["Vietnam"],
    };

    const recommendation = await GTMStrategyService.generateGTMRecommendation(
      context as any
    );

    return NextResponse.json(
      {
        success: true,
        recommendation,
        analysis: {
          newsCount: companyNews.length,
          topSignals,
          competitors,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GTM generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate GTM strategy" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get("company");

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name required" },
        { status: 400 }
      );
    }

    // Find company
    const company = COMPANIES.find(
      (c) => c.name.toLowerCase() === companyName.toLowerCase()
    );

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        company: {
          name: company.name,
          industry: company.industry,
          description: company.description,
          location: company.location,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GTM fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
