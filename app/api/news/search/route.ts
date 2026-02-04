/**
 * API Route: POST /api/news/search
 * Search news by company, signal, sentiment, or embedding
 */

export async function POST(req: Request) {
  try {
    const { type, query, limit = 10, minSimilarity = 0.5 } = await req.json();

    if (!type) {
      return new Response(
        JSON.stringify({ error: "Missing search type" }),
        { status: 400 }
      );
    }

    // Dynamic import to avoid circular dependencies
    const { NewsDB, initializeNewsDB } = await import(
      "../../utils/newsDatabase"
    );

    await initializeNewsDB();

    let results: any[] = [];

    switch (type) {
      case "company":
        if (!query) throw new Error("Company name required");
        results = await NewsDB.searchNewsByCompany(query);
        break;

      case "signal":
        if (!query) throw new Error("Signal type required");
        results = await NewsDB.searchNewsBySignal(query);
        break;

      case "sentiment":
        if (!query) throw new Error("Sentiment type required");
        results = await NewsDB.searchBySentiment(query);
        break;

      case "embedding":
        const embedding = query;
        if (!Array.isArray(embedding))
          throw new Error("Embedding array required");
        const searchResults = await NewsDB.searchByEmbedding(
          embedding,
          limit,
          minSimilarity
        );
        results = searchResults.map((sr) => ({
          ...sr.newsItem,
          similarity: sr.similarity,
        }));
        break;

      case "all":
        results = await NewsDB.getAllNews(limit);
        break;

      default:
        throw new Error(`Unknown search type: ${type}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: results.length,
        results: results.slice(0, limit),
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("News search error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Search failed" }),
      { status: 500 }
    );
  }
}
