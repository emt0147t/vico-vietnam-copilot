#!/usr/bin/env node

/**
 * Script to load, enrich, and import news from CSV
 * Usage: npx tsx scripts/importNews.ts [maxRows] [startRow] [addEmbeddings]
 *
 * Examples:
 *   npx tsx scripts/importNews.ts         # Import all (full)
 *   npx tsx scripts/importNews.ts 1000    # Import first 1000
 *   npx tsx scripts/importNews.ts 5000 0 true  # Import 5000 with embeddings
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config();

const MAX_ROWS = parseInt(process.argv[2] || "0", 10) || undefined;
const START_ROW = parseInt(process.argv[3] || "0", 10);
const ADD_EMBEDDINGS = process.argv[4] === "true";

async function main() {
  console.log("🚀 News Import and Enrichment Pipeline");
  console.log("=====================================\n");

  try {
    // Import modules
    const { loadNewsFromCSV } = await import("../utils/newsLoader");
    const { NewsEnrichmentService } = await import(
      "../services/newsEnrichmentService"
    );
    const { NewsDB, initializeNewsDB, importNewsToDatabase } = await import(
      "../utils/newsDatabase"
    );
    const { COMPANIES } = await import("../data/companies");
    const { RagService } = await import("../services/ragLayer");

    // Initialize
    console.log("1️⃣ Initializing database...");
    await initializeNewsDB();
    const existingCount = await NewsDB.getNewsCount();
    console.log(`   ✅ Database ready (${existingCount} existing articles)\n`);

    // Load CSV
    console.log("2️⃣ Loading news from CSV...");
    const startTime = Date.now();
    const newsItems = await loadNewsFromCSV({
      maxRows: MAX_ROWS,
      startRow: START_ROW,
    });
    const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `   ✅ Loaded ${newsItems.length} articles in ${loadTime}s\n`
    );

    // Get company names
    const knownCompanies = COMPANIES.map((c) => c.name);
    console.log(`   📊 Available companies for linking: ${knownCompanies.length}\n`);

    // Enrich with AI
    console.log("3️⃣ Enriching with AI...");
    console.log("   🏷️  Classifying market signals (Market Pulse)");
    console.log("   😊 Analyzing sentiment");
    console.log("   📝 Generating summaries");
    console.log("   🔗 Linking company mentions\n");

    const enrichStart = Date.now();
    let enrichedCount = 0;

    const enrichedNews = await NewsEnrichmentService.enrichNewsBatch(
      newsItems,
      knownCompanies,
      3,
      (current, total) => {
        enrichedCount = current;
        const percent = Math.round((current / total) * 100);
        const elapsed = Math.round((Date.now() - enrichStart) / 1000);
        const remaining = Math.round(
          ((total - current) / current) * elapsed || 0
        );
        process.stdout.write(
          `\r   ⏳ ${current}/${total} (${percent}%) - ETA: ${remaining}s`
        );
      }
    );
    console.log("\n   ✅ Enrichment complete\n");

    // Add embeddings if requested
    if (ADD_EMBEDDINGS) {
      console.log("4️⃣ Generating embeddings for semantic search...");
      const embedStart = Date.now();
      let embeddedCount = 0;

      for (const news of enrichedNews) {
        try {
          const combined = `${news.title} ${news.content}`;
          const embedding = await RagService.embedText(combined);
          if (embedding.length > 0) {
            news.embedding = embedding;
            news.embeddingModel = "vietnamese-embedding";
            embeddedCount++;
          }

          if (embeddedCount % 100 === 0) {
            const elapsed = Math.round((Date.now() - embedStart) / 1000);
            const remaining = Math.round(
              ((enrichedNews.length - embeddedCount) / embeddedCount) * elapsed ||
                0
            );
            process.stdout.write(
              `\r   ⏳ ${embeddedCount}/${enrichedNews.length} - ETA: ${remaining}s`
            );
          }
        } catch (error) {
          console.error(`\n   ⚠️ Embedding error for "${news.title}":`, error);
        }
      }

      console.log(
        `\n   ✅ Created ${embeddedCount}/${enrichedNews.length} embeddings\n`
      );
    }

    // Save to database
    console.log("5️⃣ Saving to MongoDB...");
    const imported = await importNewsToDatabase(enrichedNews);
    const newTotal = await NewsDB.getNewsCount();
    console.log(`   ✅ Saved ${imported} articles\n`);

    // Get statistics
    console.log("6️⃣ Final Statistics:");
    console.log("=====================================");
    console.log(`   📊 Total articles in database: ${newTotal}`);
    console.log(`   ➕ Imported in this run: ${imported}`);

    const stats = await NewsDB.getSignalDistribution();
    console.log("\n   🏷️  Market Signals:");
    for (const [signal, count] of Object.entries(stats).sort(
      (a, b) => b[1] - a[1]
    )) {
      console.log(`      • ${signal}: ${count}`);
    }

    console.log("\n✨ Import complete! Ready for production.");
    console.log("\n📖 Next steps:");
    console.log("   1. Test news search at /api/news/search");
    console.log("   2. View statistics at /api/news/stats");
    console.log("   3. Integrate news feed into company profiles");
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

main();
