/**
 * API Route: POST /api/news/import
 * Import news from CSV and enrich with AI
 */

export async function POST(req: Request) {
  try {
    const { maxRows = 5000, startRow = 0 } = await req.json();

    // Dynamic imports
    const { loadNewsFromCSV } = await import("../../utils/newsLoader");
    const { NewsEnrichmentService } = await import(
      "../../services/newsEnrichmentService"
    );
    const { NewsDB, initializeNewsDB, importNewsToDatabase } = await import(
      "../../utils/newsDatabase"
    );
    const { COMPANIES } = await import("../../data/companies");

    // Initialize database
    await initializeNewsDB();

    // Get existing count
    const existingCount = await NewsDB.getNewsCount();

    console.log(
      `📰 Starting news import: max=${maxRows}, start=${startRow}, existing=${existingCount}`
    );

    // Load news from CSV
    const newsItems = await loadNewsFromCSV({
      maxRows,
      startRow,
    });

    console.log(`✅ Loaded ${newsItems.length} news items from CSV`);

    // Extract company names for entity linking
    const knownCompanies = COMPANIES.map((c) => c.name);

    // Enrich with AI features
    const enrichedNews = await NewsEnrichmentService.enrichNewsBatch(
      newsItems,
      knownCompanies,
      3, // concurrency
      (current, total) => {
        console.log(
          `🤖 Enriching: ${current}/${total} (${Math.round((current / total) * 100)}%)`
        );
      }
    );

    console.log(`✅ Enriched ${enrichedNews.length} news items`);

    // Save to database
    const imported = await importNewsToDatabase(enrichedNews);

    const newTotal = await NewsDB.getNewsCount();

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        newTotal,
        message: `Successfully imported ${imported} news items (Total: ${newTotal})`,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("News import error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Import failed" }),
      { status: 500 }
    );
  }
}
