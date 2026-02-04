/**
 * News Enrichment Service
 * Features:
 * - Signal Classification (Market Pulse)
 * - Sentiment Analysis
 * - AI Summarization via Gemini
 * - Entity Linking (Company Mentions)
 */

import {
  NewsItem,
  SignalType,
  SentimentType,
  SignalMetadata,
  SentimentResult,
  NewsSummary,
  CompanyMention,
  SIGNAL_KEYWORDS,
  POSITIVE_KEYWORDS,
  NEGATIVE_KEYWORDS,
} from "../data/newsModels";

// Using Google's SDK through browser environment
declare const google: any;
const ai = typeof google !== 'undefined' ? google.generativeAI : null;

export const NewsEnrichmentService = {
  /**
   * Classify news into market signals using keywords + AI
   * Supports 17 signal types for comprehensive market intelligence
   */
  classifySignals: async (
    title: string,
    content: string
  ): Promise<SignalMetadata[]> => {
    const text = `${title} ${content}`.toLowerCase();
    const signals: SignalMetadata[] = [];

    // Fast keyword-based classification first
    for (const [signalType, keywords] of Object.entries(SIGNAL_KEYWORDS)) {
      if (signalType === SignalType.OTHER) continue;

      const matchedKeywords = keywords.filter((kw) => text.includes(kw));

      if (matchedKeywords.length > 0) {
        // Calculate confidence based on keyword matches
        const baseConfidence = 0.5;
        const matchBonus = Math.min(0.4, matchedKeywords.length * 0.12);
        const confidence = Math.min(0.95, baseConfidence + matchBonus);

        signals.push({
          type: signalType as SignalType,
          confidence,
          keywords: matchedKeywords,
          description: `Detected ${signalType} signal based on ${matchedKeywords.length} keywords`,
        });
      }
    }

    // If no signals found or low confidence, use Gemini for classification
    if (signals.length === 0 || (signals[0]?.confidence || 0) < 0.6) {
      try {
        const signalList = Object.keys(SignalType)
          .filter((k) => k !== "OTHER")
          .join(", ")
          .toLowerCase();

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: {
            parts: [
              {
                text: `Classify this Vietnamese/English news into market signals. Return ONLY the signal types and confidence (0-1).

News Title: ${title}
News Content: ${content.slice(0, 500)}

Available signal types: ${signalList}

Format (one per line): SIGNAL_TYPE,CONFIDENCE
Example:
acquisition,0.9
technology_innovation,0.7`,
              },
            ],
          },
        });

        const text = (response as any).text || "";
        const matches = text.match(/([a-z_]+),([0-9.]+)/gi);

        if (matches) {
          matches.forEach((match) => {
            const parts = match.match(/([a-z_]+),([0-9.]+)/i);
            if (parts) {
              const type = parts[1].toLowerCase() as SignalType;
              const confidence = Math.min(0.95, parseFloat(parts[2]));

              if (Object.values(SignalType).includes(type)) {
                // Check if signal already detected by keywords
                if (!signals.find((s) => s.type === type)) {
                  signals.push({
                    type,
                    confidence,
                    keywords: [],
                    description: `Classified as ${type} by AI`,
                  });
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("Signal classification error:", error);
      }
    }

    // Sort by confidence and limit to top 3 signals
    return signals
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  },

  /**
   * Analyze sentiment using keywords + Gemini
   */
  analyzeSentiment: async (
    title: string,
    content: string
  ): Promise<SentimentResult> => {
    const text = `${title} ${content}`.toLowerCase();

    // Quick keyword-based sentiment
    const positiveMatches = POSITIVE_KEYWORDS.filter((kw) => text.includes(kw));
    const negativeMatches = NEGATIVE_KEYWORDS.filter((kw) => text.includes(kw));

    // Calculate quick sentiment score
    const quickScore =
      (positiveMatches.length - negativeMatches.length) /
      Math.max(1, positiveMatches.length + negativeMatches.length);

    // If score is ambiguous (-0.3 to 0.3), use Gemini for better accuracy
    if (Math.abs(quickScore) < 0.3 && content.length > 100) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: {
            parts: [
              {
                text: `Analyze the sentiment of this news for the company/topic mentioned.
Return ONLY sentiment type (positive/negative/neutral) and score (-1 to 1).

Title: ${title}
Content: ${content.slice(0, 500)}

Format: SENTIMENT,SCORE`,
              },
            ],
          },
        });

        const responseText = (response as any).text || "";
        const match = responseText.match(/([a-z]+),(-?[0-9.]+)/i);

        if (match) {
          const sentiment = match[1].toLowerCase();
          const score = Math.max(-1, Math.min(1, parseFloat(match[2])));

          let type: SentimentType = SentimentType.NEUTRAL;
          if (sentiment.includes("positive")) type = SentimentType.POSITIVE;
          else if (sentiment.includes("negative")) type = SentimentType.NEGATIVE;

          return {
            type,
            score,
            keywords:
              score > 0
                ? positiveMatches.slice(0, 5)
                : negativeMatches.slice(0, 5),
            rationale: `Analyzed by Gemini`,
          };
        }
      } catch (error) {
        console.error("Sentiment analysis error:", error);
      }
    }

    // Use quick sentiment
    let type: SentimentType = SentimentType.NEUTRAL;
    if (quickScore > 0.2) type = SentimentType.POSITIVE;
    else if (quickScore < -0.2) type = SentimentType.NEGATIVE;

    return {
      type,
      score: quickScore,
      keywords:
        quickScore > 0
          ? positiveMatches.slice(0, 5)
          : negativeMatches.slice(0, 5),
    };
  },

  /**
   * Generate AI summary (3-bullet points) using Gemini
   */
  summarize: async (
    title: string,
    content: string
  ): Promise<NewsSummary> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: {
          parts: [
            {
              text: `Summarize this news into exactly 3 bullet points (Vietnamese). Each bullet should be 1 sentence max.

Title: ${title}
Content: ${content}

Also indicate business impact (high/medium/low).

Format:
- Bullet 1
- Bullet 2
- Bullet 3
Impact: high/medium/low`,
            },
          ],
        },
      });

      const responseText = (response as any).text || "";
      const lines = responseText.split("\n").filter((l: string) => l.trim());

      // Extract bullets
      const bullets = lines
        .filter((l: string) => l.trim().startsWith("-"))
        .slice(0, 3)
        .map((l: string) => l.replace(/^-\s*/, "").trim());

      // Extract impact level
      const impactLine = lines.find((l: string) =>
        l.toLowerCase().includes("impact")
      );
      let impactLevel: "high" | "medium" | "low" = "medium";
      if (impactLine?.toLowerCase().includes("high")) impactLevel = "high";
      else if (impactLine?.toLowerCase().includes("low")) impactLevel = "low";

      return {
        bullets:
          bullets.length > 0
            ? bullets
            : [
                "Không thể tóm tắt",
                "",
              ],
        keyTakeaways: bullets.slice(0, 2),
        impactLevel,
      };
    } catch (error) {
      console.error("Summarization error:", error);
      return {
        bullets: ["Lỗi tóm tắt", "", ""],
        keyTakeaways: [],
        impactLevel: "medium",
      };
    }
  },

  /**
   * Extract company mentions from news content
   * Uses fuzzy matching against known company names
   */
  extractCompanyMentions: async (
    content: string,
    knownCompanies: string[]
  ): Promise<CompanyMention[]> => {
    const mentions: CompanyMention[] = [];
    const contentLower = content.toLowerCase();

    for (const company of knownCompanies) {
      const companyLower = company.toLowerCase();

      // Exact matches
      const regex = new RegExp(`\\b${companyLower}\\b`, "gi");
      let match;

      while ((match = regex.exec(content)) !== null) {
        const position = match.index;
        const contextStart = Math.max(0, position - 50);
        const contextEnd = Math.min(content.length, position + company.length + 50);
        const context = content.slice(contextStart, contextEnd).trim();

        mentions.push({
          companyId: company.toLowerCase().replace(/\s+/g, "-"),
          companyName: company,
          mentionContext: context,
          mentionPosition: position,
          confidence: 0.95, // High confidence for exact matches
        });
      }

      // Partial matches (e.g., "VinFast" mentioned as "Vin Fast")
      const partialRegex = new RegExp(
        companyLower.split(/\s+/).join("\\s*"),
        "gi"
      );
      const partialMatches = content.match(partialRegex);

      if (partialMatches && partialMatches.length > mentions.length) {
        // Additional partial matches found
        const additionalMatches = partialMatches.length - mentions.length;
        for (let i = 0; i < Math.min(additionalMatches, 2); i++) {
          const partialPosition = contentLower.indexOf(
            companyLower.split(/\s+/)[0]
          );
          if (partialPosition !== -1) {
            const contextStart = Math.max(0, partialPosition - 50);
            const contextEnd = Math.min(
              content.length,
              partialPosition + 50
            );
            const context = content
              .slice(contextStart, contextEnd)
              .trim();

            mentions.push({
              companyId: company.toLowerCase().replace(/\s+/g, "-"),
              companyName: company,
              mentionContext: context,
              mentionPosition: partialPosition,
              confidence: 0.7, // Lower confidence for partial matches
            });
          }
        }
      }
    }

    // Remove duplicates
    return Array.from(
      new Map(
        mentions.map((m) => [m.companyId + m.mentionPosition, m])
      ).values()
    );
  },

  /**
   * Enrich a single news item with all AI features
   */
  enrichNews: async (
    newsItem: NewsItem,
    knownCompanies: string[]
  ): Promise<NewsItem> => {
    const enriched = { ...newsItem, processedAt: new Date(), version: 1 };

    try {
      // Classify signals
      const signals = await NewsEnrichmentService.classifySignals(
        newsItem.title,
        newsItem.content
      );
      if (signals.length > 0) {
        enriched.signals = signals.map((s) => s.type);
        enriched.signalConfidence = Math.max(
          ...signals.map((s) => s.confidence)
        );
      }

      // Analyze sentiment
      const sentiment = await NewsEnrichmentService.analyzeSentiment(
        newsItem.title,
        newsItem.content
      );
      enriched.sentiment = sentiment.type;
      enriched.sentimentScore = sentiment.score;

      // Summarize
      const summary = await NewsEnrichmentService.summarize(
        newsItem.title,
        newsItem.content
      );
      enriched.summary = summary.bullets.join("\n");

      // Extract company mentions
      const mentions = await NewsEnrichmentService.extractCompanyMentions(
        newsItem.content,
        knownCompanies
      );
      if (mentions.length > 0) {
        enriched.mentionedCompanies = mentions;
      }
    } catch (error) {
      console.error("Error enriching news:", error);
    }

    return enriched;
  },

  /**
   * Batch enrich multiple news items
   */
  enrichNewsBatch: async (
    newsItems: NewsItem[],
    knownCompanies: string[],
    concurrency: number = 3,
    onProgress?: (current: number, total: number) => void
  ): Promise<NewsItem[]> => {
    const enriched: NewsItem[] = [];
    const batchSize = Math.max(1, Math.ceil(newsItems.length / concurrency));

    for (let i = 0; i < newsItems.length; i += batchSize) {
      const batch = newsItems.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((item) =>
          NewsEnrichmentService.enrichNews(item, knownCompanies)
        )
      );
      enriched.push(...results);

      if (onProgress) {
        onProgress(enriched.length, newsItems.length);
      }
    }

    return enriched;
  },
};
