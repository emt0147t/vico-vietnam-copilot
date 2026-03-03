/**
 * API Route: GTM Living Playbook Generation
 * POST /api/gtm/generate — Generate full AI-powered Living Playbook
 * GET  /api/gtm/generate?company=X — Search company suggestions
 * 
 * Uses gtmPlaybookService (Gemini 2.0 Flash + VICO Database)
 */

import { NextRequest, NextResponse } from "next/server";
import { generateLivingPlaybook } from "@/services/gtmPlaybookService";
import CompaniesDataService from "@/services/companiesDataService";

// ============================================================================
// POST — Generate Living Playbook
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, targetMarkets } = body;

    // Validate input
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
      return NextResponse.json(
        { error: "Company name is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    // Generate the Living Playbook via AI service
    // The service handles company lookup, competitor finding, and AI generation
    const playbook = await generateLivingPlaybook(
      companyName.trim(),
      targetMarkets || ["Vietnam", "Southeast Asia"]
    );

    return NextResponse.json(playbook, { status: 200 });
  } catch (error) {
    console.error("GTM generation error:", error);

    const message = error instanceof Error ? error.message : "Failed to generate playbook";

    // Differentiate between AI errors and other errors
    if (message.includes("API key") || message.includes("GEMINI")) {
      return NextResponse.json(
        { error: "AI service not configured. Please set GEMINI_API_KEY environment variable." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET — Company Search Suggestions
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("company");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Company query required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    const service = CompaniesDataService.getInstance();
    const results = service.searchCompanies(query, 10);

    // Return structured suggestions
    const suggestions = results.map(c => ({
      name: c.name,
      industry: c.industry || "Unknown",
      ticker: c.ticker || null,
      dataTier: c.dataTier || "basic",
      size: c.size || null,
    }));

    return NextResponse.json({
      success: true,
      query,
      count: suggestions.length,
      suggestions,
    }, { status: 200 });
  } catch (error) {
    console.error("GTM search error:", error);
    return NextResponse.json(
      { error: "Failed to search companies" },
      { status: 500 }
    );
  }
}
