/**
 * API Route: GET /api/news/stats
 * Get news statistics and signal distribution
 */

export async function GET(req: Request) {
  try {
    // Dynamic imports
    const { NewsDB, initializeNewsDB } = await import(
      "../../utils/newsDatabase"
    );
    const { SentimentType, SignalType } = await import(
      "../../data/newsModels"
    );

    // Initialize database
    await initializeNewsDB();

    // Get statistics
    const count = await NewsDB.getNewsCount();
    const signalDist = await NewsDB.getSignalDistribution();

    // Get sentiment distribution
    const sentimentDist: Record<string, number> = {};
    for (const sentiment of Object.values(SentimentType)) {
      const results = await NewsDB.searchBySentiment(sentiment);
      sentimentDist[sentiment] = results.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalNews: count,
          signals: signalDist,
          sentiments: sentimentDist,
          lastUpdated: new Date(),
        },
      }),
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=300" }, // 5min cache
      }
    );
  } catch (error: any) {
    console.error("Stats error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Stats retrieval failed" }),
      { status: 500 }
    );
  }
}
