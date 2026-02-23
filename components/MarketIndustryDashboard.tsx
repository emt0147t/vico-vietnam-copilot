/**
 * Market & Industry Intelligence Dashboard
 * 
 * Displays comprehensive market report with all 4 pillars:
 * 1. Macro-Economic Indicators
 * 2. Industry-Specific Data
 * 3. Financial Pulse
 * 4. Exclusive VICO Insights
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { ComprehensiveMarketReport } from '@/app/api/market/marketIndustryController';

interface MarketReportProps {
  industry: string;
}

export default function MarketIndustryDashboard({ industry }: MarketReportProps) {
  const [report, setReport] = useState<ComprehensiveMarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`/api/market/industry/${encodeURIComponent(industry)}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Quá thời gian chờ (30s). Server có thể đang quá tải.');
      } else {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu thị trường');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [industry]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin thị trường {industry}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
        <svg className="mx-auto text-red-500 mb-4 w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.03 14A2 2 0 0012 19.84h0a2 2 0 001.74-1l8.03-14a2 2 0 00-1.74-3H12.03a2 2 0 00-1.74 1z" />
        </svg>
        <h3 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2">Không thể tải dữ liệu</h3>
        <p className="text-red-600 dark:text-red-300 text-sm mb-1">{error}</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-5">Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.</p>
        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
        >
          ↻ Thử lại
        </button>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center p-8 text-gray-500 dark:text-gray-400">Không có dữ liệu</div>;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{report.industry} Market Intelligence</h1>
        <p className="text-gray-600">
          Comprehensive analysis powered by real data • Last updated:{' '}
          {new Date(report.timestamp).toLocaleDateString()}
        </p>
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary summary={report.execSummary} />

      {/* Health Gauge */}
      <HealthGauge health={report.execSummary.overallMarketHealth} />

      {/* Pillar 1: Macro-Economic Indicators */}
      <MacroEconomicSection macro={report.macroEconomic} />

      {/* Pillar 2: Industry-Specific Data */}
      <IndustryDataSection industry={report.industryData} />

      {/* Pillar 3: Financial Pulse */}
      <FinancialPulseSection financial={report.financialPulse} />

      {/* Pillar 4: VICO Exclusive Insights */}
      <VicoInsightsSection insights={report.vicoInsights} />

      {/* Data Quality & Sources */}
      <DataQualitySection quality={report.dataQuality} />
    </div>
  );
}

/**
 * Executive Summary Section
 */
function ExecutiveSummary({ summary }: any) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Executive Summary</h2>

      <div className="space-y-4">
        {/* Key Insights */}
        <div>
          <h3 className="font-semibold text-blue-800 mb-2">📊 Key Insights</h3>
          <ul className="space-y-1">
            {summary.keyInsights.map((insight: string, idx: number) => (
              <li key={idx} className="text-blue-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-green-700 mb-2">✓ Opportunities</h3>
            <ul className="space-y-1">
              {summary.opportunities.map((opp: string, idx: number) => (
                <li key={idx} className="text-green-700 text-sm">
                  {opp}
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          <div>
            <h3 className="font-semibold text-red-700 mb-2">⚠ Risks</h3>
            <ul className="space-y-1">
              {summary.risks.map((risk: string, idx: number) => (
                <li key={idx} className="text-red-700 text-sm">
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="font-semibold text-amber-800 mb-2">→ Recommendations</h3>
          <ul className="space-y-1">
            {summary.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="text-amber-800 text-sm">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Health Status Gauge
 */
function HealthGauge({ health }: any) {
  const colors = {
    Strong: 'text-green-600 bg-green-50',
    Moderate: 'text-amber-600 bg-amber-50',
    Weak: 'text-red-600 bg-red-50',
  };

  const colorClass = colors[health as keyof typeof colors] || colors.Moderate;

  return (
    <div className={`${colorClass} rounded-lg p-4 text-center`}>
      <p className="text-sm font-semibold mb-1">Market Health Status</p>
      <p className="text-3xl font-bold">{health}</p>
    </div>
  );
}

/**
 * Macro-Economic Indicators Section
 */
function MacroEconomicSection({ macro }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        🌍 Pillar 1: Macro-Economic Indicators
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <IndicatorCard
          label="GDP Growth"
          value={macro.gdpGrowth !== null ? `${macro.gdpGrowth.toFixed(2)}%` : 'N/A'}
          interpretation="Annual growth rate"
        />
        <IndicatorCard
          label="Inflation (CPI)"
          value={macro.inflation !== null ? `${macro.inflation.toFixed(2)}%` : 'N/A'}
          interpretation="Price growth rate"
        />
        <IndicatorCard
          label="FDI Inflows"
          value={macro.fdiInflows !== null ? `$${(macro.fdiInflows / 1000).toFixed(1)}B` : 'N/A'}
          interpretation="Foreign investment"
        />
        <IndicatorCard
          label="Interest Rate"
          value={macro.interestRate !== null ? `${macro.interestRate.toFixed(2)}%` : 'N/A'}
          interpretation="Lending rate"
        />
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-300">
        <p className="text-sm">
          <strong>Economic Trend:</strong> {macro.economicTrend} |{' '}
          <strong>Business Climate:</strong> {macro.businessClimate}
        </p>
      </div>
    </div>
  );
}

/**
 * Industry-Specific Data Section
 */
function IndustryDataSection({ industry }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        📈 Pillar 2: Industry-Specific Data
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <IndicatorCard
          label="Export Value"
          value={industry.exportValue !== null ? `$${(industry.exportValue / 1000).toFixed(1)}B` : 'N/A'}
          interpretation="Annual exports"
        />
        <IndicatorCard
          label="Import Value"
          value={industry.importValue !== null ? `$${(industry.importValue / 1000).toFixed(1)}B` : 'N/A'}
          interpretation="Annual imports"
        />
        <IndicatorCard
          label="Trade Balance"
          value={industry.tradeBalance !== null ? `$${(industry.tradeBalance / 1000).toFixed(1)}B` : 'N/A'}
          interpretation="Export - Import"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">🚢 Key Exports</h3>
          <ul className="space-y-1">
            {industry.keyExports.map((exp: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">↗</span>
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">📦 Key Imports</h3>
          <ul className="space-y-1">
            {industry.keyImports.map((imp: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">↙</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-semibold text-gray-800 mb-2">🌐 Major Trading Partners</h3>
        <p className="text-sm text-gray-700">
          {industry.majorPartners?.join(', ') || 'Data not available'}
        </p>
      </div>

      {industry.association && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-1">📋 Industry Association</h3>
          <p className="text-sm text-blue-800 mb-1">{industry.association.name}</p>
          <p className="text-xs text-blue-700">
            Website: {industry.association.website}
          </p>
          <p className="text-xs text-blue-700">
            Email: {industry.association.email}
          </p>
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold text-gray-800 mb-2">📰 Recent Trends</h3>
        <ul className="space-y-1">
          {industry.recentTrends?.map((trend: string, idx: number) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start">
              <span className="mr-2">•</span>
              <span>{trend}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Financial Pulse Section
 */
function FinancialPulseSection({ financial }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        💰 Pillar 3: Financial Pulse
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <IndicatorCard
          label="Avg Growth Rate"
          value={`${financial.industryMetrics.avgGrowth.toFixed(1)}%`}
          interpretation="Company growth"
        />
        <IndicatorCard
          label="Sentiment Score"
          value={`${financial.industryMetrics.sentimentScore.toFixed(0)}/100`}
          interpretation="Market sentiment"
        />
        <IndicatorCard
          label="Dynamic Score"
          value={`${financial.industryMetrics.dynamicScore.toFixed(0)}/100`}
          interpretation="Growth + sentiment"
        />
      </div>

      <h3 className="font-semibold text-gray-800 mb-3">🏆 Top Growth Leaders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left p-2">Company</th>
              <th className="text-left p-2">Growth</th>
              <th className="text-left p-2">Sentiment</th>
              <th className="text-left p-2">Size</th>
            </tr>
          </thead>
          <tbody>
            {financial.topCompaniesIndustry.map((company: any, idx: number) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium text-gray-900">{company.name}</td>
                <td className="p-2 text-blue-600 font-semibold">{company.growth?.toFixed(1)}%</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    company.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                    company.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {company.sentiment}
                  </span>
                </td>
                <td className="p-2 text-gray-600">{company.employees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * VICO Exclusive Insights Section
 */
function VicoInsightsSection({ insights }: any) {
  const concentration = insights.competitiveAnalysis;
  const mi = insights.marketIndex;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow p-6 border border-purple-200">
      <h2 className="text-2xl font-bold text-purple-900 mb-4">
        ⭐ Pillar 4: Exclusive VICO Insights (Unique to VICO)
      </h2>

      {/* Market Index */}
      <div className="mb-6 bg-white rounded p-4 border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-3">🎯 VICO Market Index</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <IndicatorCard
            label="Total Companies"
            value={concentration.totalCompanies.toString()}
            interpretation="In VICO database"
          />
          <IndicatorCard
            label="Est. Market Size"
            value={mi.estimatedMarketSize}
            interpretation="Based on employees"
          />
          <IndicatorCard
            label="Total Employees"
            value={`${(mi.totalEmployees / 1000).toFixed(1)}K`}
            interpretation="Across companies"
          />
        </div>
      </div>

      {/* Competitive Analysis */}
      <div className="mb-6 bg-white rounded p-4 border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-3">🏪 Competitive Analysis</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Market Concentration:</span>
            <span className="font-semibold text-purple-700">{concentration.marketConcentration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Top 5 Companies Share:</span>
            <span className="font-semibold text-purple-700">{concentration.top5PlayersShare.toFixed(1)}%</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Fragmentation Level:</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  concentration.marketFragmentation === 'Highly Fragmented'
                    ? 'bg-green-500 w-1/4'
                    : concentration.marketFragmentation === 'Moderate'
                      ? 'bg-amber-500 w-2/4'
                      : 'bg-red-500 w-3/4'
                }`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Leaders */}
      <div className="mb-6 bg-white rounded p-4 border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-3">📈 Growth Leaders</h3>
        <div className="space-y-2">
          {insights.growthLeaders.slice(0, 5).map((leader: any, idx: number) => (
            <div key={idx} className="flex items-start justify-between border-b pb-2 last:border-0">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{leader.name}</p>
                <p className="text-xs text-gray-600">Size: {leader.employees}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">{leader.growth?.toFixed(1)}%</p>
                <p className={`text-xs px-2 py-1 rounded ${
                  leader.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                  leader.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {leader.sentiment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hiring Signals */}
      <div className="bg-white rounded p-4 border border-purple-200">
        <h3 className="font-semibold text-purple-800 mb-3">👥 Hiring Signals</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Hiring Trend:</span>
            <span className={`font-semibold ${
              insights.hiringSignals.trend === 'Growing' ? 'text-green-600' :
              insights.hiringSignals.trend === 'Declining' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {insights.hiringSignals.trend}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Avg Company Age:</span>
            <span className="font-semibold text-purple-700">
              {insights.hiringSignals.averageCompanyAge.toFixed(1)} years
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Avg Growth Rate:</span>
            <span className="font-semibold text-purple-700">
              {insights.hiringSignals.avgGrowthRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Data Quality Section
 */
function DataQualitySection({ quality }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Data Quality & Sources</h2>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Data Completeness</span>
          <span className="text-sm font-bold text-gray-900">{quality.completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-blue-600"
            style={{ width: `${quality.completeness}%` }}
          ></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">📍 Data Sources</h3>
          <ul className="space-y-1">
            {quality.sources.map((source: string, idx: number) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">✓</span>
                <span>{source}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">ℹ️ Update Frequency</h3>
          <p className="text-sm text-gray-700 mb-2">
            • Macro indicators: Monthly (from World Bank)
          </p>
          <p className="text-sm text-gray-700 mb-2">
            • Industry data: Quarterly (from associations)
          </p>
          <p className="text-sm text-gray-700">
            • VICO insights: Real-time (from database updates)
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-4 italic">
        Last updated: {new Date(quality.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}

/**
 * Reusable Indicator Card
 */
function IndicatorCard({ label, value, interpretation }: any) {
  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-200 text-center">
      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-600">{interpretation}</p>
    </div>
  );
}
