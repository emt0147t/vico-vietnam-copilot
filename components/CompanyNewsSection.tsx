/**
 * Company News Section
 * Integrated into Company Profile page
 * Shows related news, signals, and sentiment
 */

import React, { useState, useEffect } from "react";
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { SentimentType, NewsItem, SignalType } from "../../data/newsModels";

interface CompanyNewsSectionProps {
  companyName: string;
  companyId?: string;
  maxItems?: number;
}

export const CompanyNewsSection: React.FC<CompanyNewsSectionProps> = ({
  companyName,
  companyId,
  maxItems = 10,
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    total: 0,
  });

  useEffect(() => {
    fetchCompanyNews();
  }, [companyName]);

  const fetchCompanyNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/news/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "company",
          query: companyName,
          limit: maxItems,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();
      if (data.success) {
        setNews(data.results);

        // Calculate sentiment stats
        const stats = {
          positive: 0,
          negative: 0,
          neutral: 0,
          total: data.results.length,
        };

        data.results.forEach((item: NewsItem) => {
          if (item.sentiment === SentimentType.POSITIVE) stats.positive++;
          else if (item.sentiment === SentimentType.NEGATIVE) stats.negative++;
          else stats.neutral++;
        });

        setStats(stats);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load news";
      setError(errorMsg);
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment?: SentimentType) => {
    if (sentiment === SentimentType.POSITIVE) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (sentiment === SentimentType.NEGATIVE) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (sentiment?: SentimentType) => {
    if (sentiment === SentimentType.POSITIVE) {
      return "bg-green-50 border-green-200";
    } else if (sentiment === SentimentType.NEGATIVE) {
      return "bg-red-50 border-red-200";
    }
    return "bg-gray-50 border-gray-200";
  };

  const getSignalBadgeColor = (signal: SignalType) => {
    const colors: Record<SignalType, string> = {
      [SignalType.FUNDING]: "bg-green-100 text-green-800",
      [SignalType.MERGER_ACQUISITION]: "bg-purple-100 text-purple-800",
      [SignalType.PRODUCT_LAUNCH]: "bg-blue-100 text-blue-800",
      [SignalType.LEGAL_REGULATION]: "bg-red-100 text-red-800",
      [SignalType.PERSONNEL]: "bg-orange-100 text-orange-800",
      [SignalType.PARTNERSHIP]: "bg-indigo-100 text-indigo-800",
      [SignalType.EARNINGS]: "bg-teal-100 text-teal-800",
      [SignalType.EXPANSION]: "bg-yellow-100 text-yellow-800",
      [SignalType.OTHER]: "bg-gray-100 text-gray-800",
    };
    return colors[signal] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-blue-600" />
          Recent News & Market Signals
        </h3>
        <button
          onClick={fetchCompanyNews}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Sentiment Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
            <div className="text-xs text-gray-600">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.neutral}</div>
            <div className="text-xs text-gray-600">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.negative}</div>
            <div className="text-xs text-gray-600">Negative</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading news...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* News List */}
      {!loading && news.length > 0 && (
        <div className="space-y-3">
          {news.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border-2 transition hover:shadow-md ${getSentimentColor(item.sentiment)}`}
            >
              {/* Title */}
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 group cursor-pointer"
              >
                {getSentimentIcon(item.sentiment)}
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-800 group-hover:underline break-words flex-1">
                  {item.title}
                </span>
              </a>

              {/* Signals and Summary */}
              {(item.signals || item.summary) && (
                <div className="mt-2 space-y-2">
                  {/* Signals */}
                  {item.signals && item.signals.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.signals.slice(0, 3).map((signal) => (
                        <span
                          key={signal}
                          className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSignalBadgeColor(signal)}`}
                        >
                          {signal.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Summary Preview */}
                  {item.summary && (
                    <div className="text-xs text-gray-700 bg-white bg-opacity-50 p-2 rounded border-l-2 border-blue-300">
                      {item.summary.split("\n")[0].substring(0, 100)}...
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>{item.sourceName || "Unknown"}</span>
                <span>
                  {item.fetchedDate
                    ? new Date(item.fetchedDate).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && news.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600">
          <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No recent news found for {companyName}</p>
        </div>
      )}
    </div>
  );
};

export default CompanyNewsSection;
