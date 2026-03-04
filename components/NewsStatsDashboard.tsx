/**
 * News Statistics Dashboard
 * Shows signal distribution, sentiment analysis, and market overview
 */

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RefreshCw, TrendingUp } from "lucide-react";

interface NewsStats {
  totalNews: number;
  signals: Record<string, number>;
  sentiments: Record<string, number>;
  lastUpdated: string;
}

export const NewsStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/news/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-[#71717A]">Loading statistics...</p>
      </div>
    );
  }

  // Prepare signal data
  const signalData = Object.entries(stats.signals)
    .map(([name, value]) => ({
      name: name.replace("_", " ").toUpperCase(),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  // Prepare sentiment data
  const sentimentData = Object.entries(stats.sentiments).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Colors
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
  const SENTIMENT_COLORS = { Positive: "#10b981", Negative: "#ef4444", Neutral: "#9ca3af" };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-[#18181B]">News Intelligence</h2>
          <p className="text-[#71717A] text-sm mt-1">Market signal distribution and sentiment analysis</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">Total Articles</p>
          <p className="text-4xl font-bold mt-2">{stats.totalNews.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">Positive Signal</p>
          <p className="text-4xl font-bold mt-2">{stats.sentiments.positive || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">Negative Signal</p>
          <p className="text-4xl font-bold mt-2">{stats.sentiments.negative || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">Neutral Signal</p>
          <p className="text-4xl font-bold mt-2">{stats.sentiments.neutral || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signal Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-[#E4E4E7]">
          <h3 className="text-xl font-bold text-[#18181B] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Market Signals
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={signalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-[#E4E4E7]">
          <h3 className="text-xl font-bold text-[#18181B] mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Signals Table */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-[#E4E4E7]">
        <h3 className="text-xl font-bold text-[#18181B] mb-4">Top Market Signals</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#E4E4E7]">
                <th className="text-left py-3 px-4 font-semibold text-[#18181B]">Signal Type</th>
                <th className="text-right py-3 px-4 font-semibold text-[#18181B]">Count</th>
                <th className="text-right py-3 px-4 font-semibold text-[#18181B]">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {signalData.slice(0, 8).map((item, idx) => (
                <tr key={idx} className="border-b border-[#E4E4E7] hover:bg-[#FAFAFA]">
                  <td className="py-3 px-4 text-[#18181B]">{item.name}</td>
                  <td className="text-right py-3 px-4 text-[#18181B] font-semibold">{item.value}</td>
                  <td className="text-right py-3 px-4 text-[#71717A]">
                    {((item.value / stats.totalNews) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-[#71717A]">
        <p>Last updated: {new Date(stats.lastUpdated).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default NewsStatsDashboard;
