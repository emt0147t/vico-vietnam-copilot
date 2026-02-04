/**
 * Market Pulse Component
 * Displays news classified by market signals with sentiment indicators
 */

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Briefcase,
  Users,
  Lock,
  Rocket,
  HandshakeIcon,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  SignalType,
  SentimentType,
  NewsItem,
} from "../../data/newsModels";

interface MarketPulseProps {
  companyName?: string;
  maxItems?: number;
}

export const MarketPulse: React.FC<MarketPulseProps> = ({
  companyName,
  maxItems = 20,
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<SignalType | "all">("all");

  useEffect(() => {
    fetchNews();
  }, [companyName, selectedSignal]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const searchType = selectedSignal === "all" ? "all" : "signal";
      const query = selectedSignal === "all" ? undefined : selectedSignal;

      const response = await fetch("/api/news/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: companyName ? "company" : searchType,
          query: companyName || query,
          limit: maxItems,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNews(data.results);
      }
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSignalIcon = (signal: SignalType) => {
    const iconProps = { className: "w-5 h-5" };
    switch (signal) {
      case SignalType.FUNDING:
        return <DollarSign {...iconProps} className="text-green-500" />;
      case SignalType.MERGER_ACQUISITION:
        return <Briefcase {...iconProps} className="text-purple-500" />;
      case SignalType.PRODUCT_LAUNCH:
        return <Rocket {...iconProps} className="text-blue-500" />;
      case SignalType.LEGAL_REGULATION:
        return <Lock {...iconProps} className="text-red-500" />;
      case SignalType.PERSONNEL:
        return <Users {...iconProps} className="text-orange-500" />;
      case SignalType.PARTNERSHIP:
        return <HandshakeIcon {...iconProps} className="text-indigo-500" />;
      case SignalType.EARNINGS:
        return <TrendingUp {...iconProps} className="text-teal-500" />;
      case SignalType.EXPANSION:
        return <Zap {...iconProps} className="text-yellow-500" />;
      default:
        return <AlertCircle {...iconProps} className="text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: SentimentType | undefined) => {
    switch (sentiment) {
      case SentimentType.POSITIVE:
        return "bg-green-50 border-green-200";
      case SentimentType.NEGATIVE:
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getSentimentBadgeColor = (sentiment: SentimentType | undefined) => {
    switch (sentiment) {
      case SentimentType.POSITIVE:
        return "bg-green-100 text-green-800";
      case SentimentType.NEGATIVE:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Market Pulse
        </h2>
        <p className="text-gray-600">
          {companyName
            ? `Real-time news and signals for ${companyName}`
            : "Monitor market signals and company movements"}
        </p>
      </div>

      {/* Signal Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSignal("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedSignal === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All Signals
        </button>
        {Object.values(SignalType)
          .filter((s) => s !== SignalType.OTHER)
          .map((signal) => (
            <button
              key={signal}
              onClick={() => setSelectedSignal(signal)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                selectedSignal === signal
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {getSignalIcon(signal)}
              {signal.replace("_", " ")}
            </button>
          ))}
      </div>

      {/* News List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No news found for this filter</p>
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border-2 transition ${getSentimentColor(item.sentiment)}`}
            >
              {/* Title and Links */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 break-words"
                  >
                    {item.title}
                  </a>
                </div>

                {/* Sentiment Badge */}
                {item.sentiment && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getSentimentBadgeColor(item.sentiment)}`}
                  >
                    {item.sentiment === SentimentType.POSITIVE
                      ? "📈 Positive"
                      : item.sentiment === SentimentType.NEGATIVE
                        ? "📉 Negative"
                        : "➖ Neutral"}
                  </span>
                )}
              </div>

              {/* Signals */}
              {item.signals && item.signals.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.signals.map((signal) => (
                    <div
                      key={signal}
                      className="flex items-center gap-1 bg-white bg-opacity-70 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {getSignalIcon(signal)}
                      {signal.replace("_", " ")}
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {item.summary && (
                <div className="mb-3 text-sm bg-white bg-opacity-50 p-3 rounded border-l-4 border-blue-400">
                  <p className="font-semibold text-gray-700 mb-1">Summary:</p>
                  <ul className="space-y-1 text-gray-700">
                    {item.summary.split("\n").map((bullet, i) => (
                      <li key={i} className="text-sm">
                        • {bullet.replace(/^-\s*/, "")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Company Mentions */}
              {item.mentionedCompanies && item.mentionedCompanies.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {item.mentionedCompanies.map((mention) => (
                    <span
                      key={mention.companyId}
                      className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium"
                    >
                      🏢 {mention.companyName}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-2">
                <span>
                  📰 {item.sourceName || "Unknown"}
                </span>
                <span>
                  {item.fetchedDate
                    ? new Date(item.fetchedDate).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketPulse;
