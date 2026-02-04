/**
 * News CSV Loader
 * Loads and parses news from d:\Tong_Hop_Tin_Tuc_Final.csv
 * Handles large files efficiently with streaming
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { NewsItem } from "../data/newsModels";

const CSV_PATH = "d:\\Tong_Hop_Tin_Tuc_Final.csv";

// Helper to generate unique ID from title + link
function generateNewsId(title: string, link: string): string {
  const combined = `${title}|${link}`;
  return crypto.createHash("sha256").update(combined).digest("hex").slice(0, 16);
}

// Helper to parse CSV line properly (handles quoted fields with commas)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export interface NewsLoadOptions {
  maxRows?: number; // Max rows to load
  startRow?: number; // Start from row N
  onProgress?: (current: number, total: number, percent: number) => void;
}

/**
 * Load news from CSV file
 * Format: Tiêu đề, Link, Nội dung
 */
export async function loadNewsFromCSV(
  options: NewsLoadOptions = {}
): Promise<NewsItem[]> {
  const {
    maxRows = Infinity,
    startRow = 0,
    onProgress,
  } = options;

  return new Promise((resolve, reject) => {
    const newsItems: NewsItem[] = [];
    let lineCount = 0;
    let processedCount = 0;
    let skipHeader = true; // Skip "Tiêu đề,Link,Nội dung" line

    const stream = fs.createReadStream(CSV_PATH, {
      encoding: "utf8",
      highWaterMark: 64 * 1024, // 64KB buffer
    });

    let buffer = "";

    stream.on("data", (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const rawLine of lines) {
        lineCount++;

        // Skip header and rows before startRow
        if (skipHeader) {
          skipHeader = false;
          continue;
        }
        if (lineCount <= startRow) continue;
        if (processedCount >= maxRows) break;

        try {
          const fields = parseCSVLine(rawLine);

          if (fields.length < 3) continue; // Skip incomplete rows

          const title = fields[0]?.trim() || "";
          const link = fields[1]?.trim() || "";
          const content = fields[2]?.trim() || "";

          if (!title || !link || !content) continue; // Skip empty rows

          const newsItem: NewsItem = {
            id: generateNewsId(title, link),
            title,
            link,
            content,
            sourceUrl: link,
            sourceName: extractSourceName(link),
            fetchedDate: new Date(),
            version: 1,
          };

          newsItems.push(newsItem);
          processedCount++;

          if (onProgress) {
            onProgress(processedCount, maxRows, (processedCount / maxRows) * 100);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse line ${lineCount}:`, error);
        }
      }
    });

    stream.on("end", () => {
      // Process final buffer if exists
      if (buffer && processedCount < maxRows) {
        try {
          const fields = parseCSVLine(buffer);
          if (fields.length >= 3) {
            const title = fields[0]?.trim() || "";
            const link = fields[1]?.trim() || "";
            const content = fields[2]?.trim() || "";

            if (title && link && content) {
              newsItems.push({
                id: generateNewsId(title, link),
                title,
                link,
                content,
                sourceUrl: link,
                sourceName: extractSourceName(link),
                fetchedDate: new Date(),
                version: 1,
              });
              processedCount++;
            }
          }
        } catch (error) {
          console.warn("⚠️ Failed to parse final buffer:", error);
        }
      }

      console.log(`✅ Loaded ${processedCount} news items from CSV`);
      resolve(newsItems);
    });

    stream.on("error", (error) => {
      console.error("❌ CSV stream error:", error);
      reject(error);
    });
  });
}

/**
 * Extract source name from URL
 * Example: https://vnexpress.net/... -> VNExpress
 */
function extractSourceName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    const parts = domain.split(".");
    if (parts.length >= 2) {
      return parts[parts.length - 2]
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
    }
    return domain;
  } catch {
    return "Unknown";
  }
}

/**
 * Load news with progress tracking (streaming for large files)
 */
export async function loadNewsFromCSVWithProgress(
  maxRows?: number
): Promise<NewsItem[]> {
  console.log(
    `📰 Loading news from ${CSV_PATH}${maxRows ? ` (max ${maxRows} rows)` : ""}`
  );

  return new Promise((resolve, reject) => {
    loadNewsFromCSV({
      maxRows,
      onProgress: (current, total, percent) => {
        process.stdout.write(
          `\r📰 Progress: ${current}/${total} (${percent.toFixed(1)}%)`
        );
      },
    })
      .then((news) => {
        console.log("\n✅ News loading complete");
        resolve(news);
      })
      .catch(reject);
  });
}
