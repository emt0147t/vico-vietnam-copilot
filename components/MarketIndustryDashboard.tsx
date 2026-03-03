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
import PESTELAnalysis from './PESTELAnalysis';
import { parseSimpleMarkdown } from '@/utils/parseSimpleMarkdown';
import { FadeIn, ShimmerSkeleton, CardSkeleton, TableSkeleton } from './AnimationUtils';

interface MarketReportProps {
  industry: string;
}

export default function MarketIndustryDashboard({ industry }: MarketReportProps) {
  const [report, setReport] = useState<ComprehensiveMarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradeData, setTradeData] = useState<any>(null);
  const [marketIndex, setMarketIndex] = useState<any>(null);

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
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Request timed out (30s). The server may be overloaded.');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to load market data');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [industry]);

  useEffect(() => {
    fetchReport();
    // Fetch trade data in parallel
    fetch(`/api/trade?industry=${encodeURIComponent(industry)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.success) setTradeData(data); })
      .catch(() => { });
    // Fetch VICO Market Index analytics in parallel
    fetch(`/api/analytics?industry=${encodeURIComponent(industry)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.success) setMarketIndex(data); })
      .catch(() => { });
  }, [fetchReport, industry]);

  if (loading) {
    return (
      <div className="space-y-8 pb-8 animate-pulse">
        {/* Header skeleton */}
        <div className="border-b pb-6">
          <ShimmerSkeleton width="45%" height="32px" borderRadius="8px" />
          <div className="mt-3"><ShimmerSkeleton width="70%" height="14px" /></div>
        </div>

        {/* Executive Summary skeleton */}
        <CardSkeleton rows={4} />

        {/* Macro indicators skeleton — 4 cards */}
        <div>
          <div className="mb-4"><ShimmerSkeleton width="30%" height="20px" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} rows={2} />)}
          </div>
        </div>

        {/* Industry data skeleton */}
        <div>
          <div className="mb-4"><ShimmerSkeleton width="25%" height="20px" /></div>
          <TableSkeleton rows={5} cols={4} />
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="h-5 w-5 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#A1A1AA] text-sm">Loading market data for {industry}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <svg className="mx-auto text-red-500 mb-4 w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.03 14A2 2 0 0012 19.84h0a2 2 0 001.74-1l8.03-14a2 2 0 00-1.74-3H12.03a2 2 0 00-1.74 1z" />
        </svg>
        <h3 className="text-red-700 font-bold text-lg mb-2">Unable to load data</h3>
        <p className="text-red-600 text-sm mb-1">{error}</p>
        <p className="text-[#71717A] text-xs mb-5">Please check your network connection or try again later.</p>
        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
        >
          ↻ Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center p-8 text-[#71717A]">No data available</div>;
  }

  return (
    <FadeIn duration={500}>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="border-b pb-6">
          <h1 className="text-4xl font-bold text-[#18181B] mb-2">{report.industry} Market Intelligence</h1>
          <p className="text-[#71717A]">
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

        {/* Pillar 5: PESTEL Macro-Environment Analysis */}
        <div className="bg-white rounded-lg shadow p-6 border border-[#E4E4E7]">
          <h2 className="text-2xl font-bold text-[#18181B] mb-4">
            🧠 Pillar 5: Macro-Environment (PESTEL)
          </h2>
          <PESTELAnalysis industry={industry} />
        </div>

        {/* Pillar 6: Trade Intelligence */}
        {tradeData && <TradeIntelligenceSection trade={tradeData} />}

        {/* Pillar 7: VICO Market Index */}
        {marketIndex && <VICOMarketIndexSection data={marketIndex} />}

        {/* Pillar 4: VICO Exclusive Insights */}
        <VicoInsightsSection insights={report.vicoInsights} />

        {/* Data Quality & Sources */}
        <DataQualitySection quality={report.dataQuality} />
      </div>
    </FadeIn>
  );
}

/**
 * Executive Summary Section
 */
function ExecutiveSummary({ summary }: any) {
  return (
    <div className="bg-gradient-to-r from-[#FFF1F2] to-blue-100 rounded-lg p-6 border border-blue-200">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Executive Summary</h2>

      <div className="space-y-4">
        {/* Key Insights */}
        <div>
          <h3 className="font-semibold text-blue-800 mb-2">📊 Key Insights</h3>
          <ul className="space-y-1">
            {summary.keyInsights.map((insight: string, idx: number) => (
              <li key={idx} className="text-blue-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{parseSimpleMarkdown(insight)}</span>
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
                  {parseSimpleMarkdown(opp)}
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
                  {parseSimpleMarkdown(risk)}
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
                {parseSimpleMarkdown(rec)}
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
    <div className="bg-white rounded-lg shadow p-6 border border-[#E4E4E7]">
      <h2 className="text-2xl font-bold text-[#18181B] mb-4">
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

      <div className="mt-4 p-4 bg-[#FAFAFA] rounded border border-[#E4E4E7]">
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
    <div className="bg-white rounded-lg shadow p-6 border border-[#E4E4E7]">
      <h2 className="text-2xl font-bold text-[#18181B] mb-4">
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
          <h3 className="font-semibold text-[#18181B] mb-2">🚢 Key Exports</h3>
          <ul className="space-y-1">
            {industry.keyExports.map((exp: string, idx: number) => (
              <li key={idx} className="text-sm text-[#18181B] flex items-start">
                <span className="mr-2">↗</span>
                <span>{exp}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-[#18181B] mb-2">📦 Key Imports</h3>
          <ul className="space-y-1">
            {industry.keyImports.map((imp: string, idx: number) => (
              <li key={idx} className="text-sm text-[#18181B] flex items-start">
                <span className="mr-2">↙</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-semibold text-[#18181B] mb-2">🌐 Major Trading Partners</h3>
        <p className="text-sm text-[#18181B]">
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
        <h3 className="font-semibold text-[#18181B] mb-2">📰 Recent Trends</h3>
        <ul className="space-y-1">
          {industry.recentTrends?.map((trend: string, idx: number) => (
            <li key={idx} className="text-sm text-[#18181B] flex items-start">
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
    <div className="bg-white rounded-lg shadow p-6 border border-[#E4E4E7]">
      <h2 className="text-2xl font-bold text-[#18181B] mb-4">
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

      <h3 className="font-semibold text-[#18181B] mb-3">🏆 Top Growth Leaders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F4F5] border-b">
            <tr>
              <th className="text-left p-2">Company</th>
              <th className="text-left p-2">Growth</th>
              <th className="text-left p-2">Sentiment</th>
              <th className="text-left p-2">Size</th>
            </tr>
          </thead>
          <tbody>
            {financial.topCompaniesIndustry.map((company: any, idx: number) => (
              <tr key={idx} className="border-b hover:bg-[#FAFAFA]">
                <td className="p-2 font-medium text-[#18181B]">
                  {company.name}
                  {company.ticker && (
                    <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-[#FFF1F2] text-[#BE123C] rounded font-mono">
                      {company.ticker}
                    </span>
                  )}
                </td>
                <td className="p-2 text-blue-600 font-semibold">{company.growth?.toFixed(1)}%</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${company.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                    company.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                      'bg-[#F4F4F5] text-[#18181B]'
                    }`}>
                    {company.sentiment}
                  </span>
                </td>
                <td className="p-2 text-[#71717A]">{company.employees}</td>
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
            <span className="text-[#18181B]">Market Concentration:</span>
            <span className="font-semibold text-purple-700">{concentration.marketConcentration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#18181B]">Top 5 Companies Share:</span>
            <span className="font-semibold text-purple-700">{concentration.top5PlayersShare.toFixed(1)}%</span>
          </div>
          <div>
            <p className="text-sm text-[#71717A] mb-1">Fragmentation Level:</p>
            <div className="w-full bg-[#E4E4E7] rounded-full h-2">
              <div
                className={`h-2 rounded-full ${concentration.marketFragmentation === 'Highly Fragmented'
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
                <p className="text-sm font-semibold text-[#18181B]">{leader.name}</p>
                <p className="text-xs text-[#71717A]">Size: {leader.employees}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">{leader.growth?.toFixed(1)}%</p>
                <p className={`text-xs px-2 py-1 rounded ${leader.sentiment === 'Positive' ? 'bg-green-100 text-green-700' :
                  leader.sentiment === 'Negative' ? 'bg-red-100 text-red-700' :
                    'bg-[#F4F4F5] text-[#18181B]'
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
            <span className="text-[#18181B]">Hiring Trend:</span>
            <span className={`font-semibold ${insights.hiringSignals.trend === 'Growing' ? 'text-green-600' :
              insights.hiringSignals.trend === 'Declining' ? 'text-red-600' :
                'text-[#71717A]'
              }`}>
              {insights.hiringSignals.trend}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#18181B]">Avg Company Age:</span>
            <span className="font-semibold text-purple-700">
              {insights.hiringSignals.averageCompanyAge.toFixed(1)} years
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#18181B]">Avg Growth Rate:</span>
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
    <div className="bg-[#FAFAFA] rounded-lg p-6 border border-[#E4E4E7]">
      <h2 className="text-lg font-bold text-[#18181B] mb-4">📊 Data Quality & Sources</h2>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#18181B]">Data Completeness</span>
          <span className="text-sm font-bold text-[#18181B]">{quality.completeness}%</span>
        </div>
        <div className="w-full bg-[#E4E4E7] rounded-full h-3">
          <div
            className="h-3 rounded-full bg-blue-600"
            style={{ width: `${quality.completeness}%` }}
          ></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-[#18181B] mb-2">📍 Data Sources</h3>
          <ul className="space-y-1">
            {quality.sources.map((source: string, idx: number) => (
              <li key={idx} className="text-sm text-[#18181B] flex items-start">
                <span className="mr-2">✓</span>
                <span>{source}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-[#18181B] mb-2">ℹ️ Update Frequency</h3>
          <p className="text-sm text-[#18181B] mb-2">
            • Macro indicators: Monthly (from World Bank)
          </p>
          <p className="text-sm text-[#18181B] mb-2">
            • Industry data: Quarterly (from associations)
          </p>
          <p className="text-sm text-[#18181B]">
            • VICO insights: Real-time (from database updates)
          </p>
        </div>
      </div>

      <p className="text-xs text-[#71717A] mt-4 italic">
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
    <div className="bg-[#FAFAFA] rounded p-4 border border-[#E4E4E7] text-center">
      <p className="text-xs font-semibold text-[#71717A] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#18181B] mb-1">{value}</p>
      <p className="text-xs text-[#71717A]">{interpretation}</p>
    </div>
  );
}

/**
 * Pillar 7: VICO Market Index — Industry analytics from VICO database
 */
function VICOMarketIndexSection({ data }: { data: any }) {
  const concentration = data.concentrationRatio;
  const health = data.industryHealth;
  const hiring = data.hiringTrend;
  const top5 = concentration?.top5Companies || [];

  // Color helpers
  const concentrationColor = (level: string) => {
    switch (level) {
      case 'Highly Concentrated': return 'text-red-700 bg-red-100';
      case 'Concentrated': return 'text-orange-700 bg-orange-100';
      case 'Moderate': return 'text-amber-700 bg-amber-100';
      case 'Highly Fragmented': return 'text-green-700 bg-green-100';
      default: return 'text-[#18181B] bg-[#F4F4F5]';
    }
  };

  const trendColor = (trend: string) => {
    switch (trend) {
      case 'Growing': return 'text-emerald-600';
      case 'Declining': return 'text-red-600';
      default: return 'text-[#71717A]';
    }
  };

  const trendIcon = (trend: string) => {
    switch (trend) {
      case 'Growing': return '📈';
      case 'Declining': return '📉';
      default: return '➡️';
    }
  };

  // Dynamic score gauge color
  const dynamicScoreColor = (score: number) => {
    if (score >= 70) return 'from-emerald-500 to-green-400';
    if (score >= 40) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-orange-400';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-[#E4E4E7]">
      <h2 className="text-2xl font-bold text-[#18181B] mb-1">
        📊 Pillar 7: VICO Market Index
      </h2>
      <p className="text-[#71717A] text-sm mb-6">
        VICO Proprietary Industry Index — {data.totalCompanies} companies • Est. {data.estimatedMarketSize} market size
      </p>

      {/* Top row: Key indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#FFF1F2] border border-[#E4E4E7] rounded-xl p-4 text-center">
          <p className="text-xs font-semibold text-[#E11D48] uppercase tracking-wider mb-1">Total Companies</p>
          <p className="text-3xl font-black text-[#BE123C]">{data.totalCompanies}</p>
          <p className="text-xs text-[#E11D48] mt-1">in VICO DB</p>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-1">Total Employees</p>
          <p className="text-3xl font-black text-cyan-700">
            {data.totalEmployees >= 1000 ? `${(data.totalEmployees / 1000).toFixed(1)}K` : data.totalEmployees}
          </p>
          <p className="text-xs text-cyan-500 mt-1">estimated</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Dynamic Score</p>
          <p className="text-3xl font-black text-purple-700">{health?.dynamicScore?.toFixed(0) ?? 'N/A'}</p>
          <p className="text-xs text-purple-500 mt-1">/ 100</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Trend</p>
          <p className={`text-2xl font-black ${trendColor(hiring?.trend)}`}>
            {trendIcon(hiring?.trend)} {hiring?.trend}
          </p>
          <p className="text-xs text-emerald-500 mt-1">{hiring?.growthPercentage?.toFixed(1)}% growth</p>
        </div>
      </div>

      {/* Dynamic Score Gauge Bar */}
      <div className="mb-6 bg-[#FAFAFA] rounded-xl p-4 border border-[#E4E4E7]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-[#18181B]">Industry Health Dynamic Score</span>
          <span className="text-sm font-black text-[#18181B]">{health?.dynamicScore?.toFixed(1) ?? '—'} / 100</span>
        </div>
        <div className="w-full bg-[#E4E4E7] rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${dynamicScoreColor(health?.dynamicScore || 0)} transition-all duration-700`}
            style={{ width: `${Math.min(100, health?.dynamicScore || 0)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-[#A1A1AA]">
          <span>Declining</span>
          <span>Stable</span>
          <span>Thriving</span>
        </div>
      </div>

      {/* Two-column: Concentration + Hiring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Concentration Ratio */}
        <div className="bg-[#FAFAFA] rounded-xl p-4 border border-[#E4E4E7]">
          <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider mb-3">🏪 Industry Concentration</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#71717A] text-sm">Market Structure:</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${concentrationColor(concentration?.marketConcentration)}`}>
                {concentration?.marketConcentration || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A] text-sm">Top 5 Share:</span>
              <span className="text-lg font-black text-[#18181B]">{concentration?.top5EmployeeShare?.toFixed(1)}%</span>
            </div>
            {/* Concentration bar */}
            <div>
              <div className="w-full bg-[#E4E4E7] rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    (concentration?.top5EmployeeShare || 0) > 70 ? 'bg-red-500' :
                    (concentration?.top5EmployeeShare || 0) > 50 ? 'bg-orange-500' :
                    (concentration?.top5EmployeeShare || 0) > 25 ? 'bg-amber-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, concentration?.top5EmployeeShare || 0)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A] text-sm">Sentiment Score:</span>
              <span className="font-bold text-[#18181B]">{health?.sentimentScore?.toFixed(0)}/100</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-green-50 rounded-lg p-2">
                <p className="font-bold text-green-700">{health?.positiveCompanies || 0}</p>
                <p className="text-green-600">Positive</p>
              </div>
              <div className="bg-[#F4F4F5] rounded-lg p-2">
                <p className="font-bold text-[#18181B]">{health?.neutralCompanies || 0}</p>
                <p className="text-[#71717A]">Neutral</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="font-bold text-red-700">{health?.negativeCompanies || 0}</p>
                <p className="text-red-600">Negative</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Trend */}
        <div className="bg-[#FAFAFA] rounded-xl p-4 border border-[#E4E4E7]">
          <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider mb-3">👥 Hiring Trend</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#71717A] text-sm">Trend:</span>
              <span className={`font-bold ${trendColor(hiring?.trend)}`}>
                {trendIcon(hiring?.trend)} {hiring?.trend}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A] text-sm">Growth %:</span>
              <span className="font-bold text-[#18181B]">{hiring?.growthPercentage?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A] text-sm">Avg Company Age:</span>
              <span className="font-bold text-[#18181B]">{hiring?.avgCompanyAge?.toFixed(1)} years</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#71717A] text-sm">Avg Industry Growth:</span>
              <span className="font-bold text-[#18181B]">{health?.avgGrowthRate?.toFixed(1)}%</span>
            </div>

            {/* Employee Size Distribution */}
            {hiring?.employeeSizeDistribution && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Size Distribution</p>
                <div className="space-y-1.5">
                  {Object.entries(hiring.employeeSizeDistribution as Record<string, number>)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([size, count]) => {
                      const total = Object.values(hiring.employeeSizeDistribution as Record<string, number>)
                        .reduce((s: number, v) => s + (v as number), 0);
                      const pct = ((count as number) / total) * 100;
                      return (
                        <div key={size} className="flex items-center gap-2">
                          <span className="text-xs text-[#71717A] w-32 truncate" title={size}>{size}</span>
                          <div className="flex-1 bg-[#E4E4E7] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#E11D48] to-cyan-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#18181B] w-8 text-right">{count as number}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Companies Table */}
      {top5.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider mb-3">🏆 Top 5 Companies by Employee Count</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#FFF1F2] to-[#FFF1F2] border-b border-[#E4E4E7]">
                <tr>
                  <th className="text-left p-3 text-[#18181B] font-bold">#</th>
                  <th className="text-left p-3 text-[#18181B] font-bold">Company</th>
                  <th className="text-left p-3 text-[#18181B] font-bold">Industry</th>
                  <th className="text-right p-3 text-[#18181B] font-bold">Est. Employees</th>
                  <th className="text-right p-3 text-[#18181B] font-bold">Share</th>
                </tr>
              </thead>
              <tbody>
                {top5.map((company: any, idx: number) => {
                  const sharePct = data.totalEmployees > 0
                    ? ((company.employeeCount / data.totalEmployees) * 100).toFixed(1)
                    : '—';
                  return (
                    <tr key={idx} className="border-b hover:bg-[#FFF1F2]/50 transition-colors">
                      <td className="p-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-[#F4F4F5] text-[#18181B]' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-[#FAFAFA] text-[#71717A]'
                        }`}>
                          {company.rank}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-[#18181B]">{company.name}</td>
                      <td className="p-3 text-[#71717A]">{company.industry}</td>
                      <td className="p-3 text-right font-mono font-bold text-[#18181B]">
                        {company.employeeCount?.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-xs font-bold px-2 py-1 bg-[#FFF1F2] text-[#BE123C] rounded-full">
                          {sharePct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Pillar 6: Trade Intelligence Section
 */
function TradeIntelligenceSection({ trade }: { trade: any }) {
  const balance = trade.tradeBalance2024 || 0;
  const isSurplus = balance >= 0;
  const formatUSD = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}B`;
    return `$${val}M`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-[#E4E4E7]">
      <h2 className="text-2xl font-bold text-[#18181B] mb-1">
        🚢 Pillar 6: Trade Intelligence
      </h2>
      <p className="text-[#71717A] text-sm mb-6">
        Import/Export data for {trade.industry} — Source: {trade.dataSource || 'General Dept. of Customs'}
      </p>

      {/* Trade Balance + Export/Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Exports 2024</p>
          <p className="text-3xl font-black text-blue-700">{formatUSD(trade.totalExport2024 || 0)}</p>
          {trade.yoyExportGrowth != null && (
            <p className={`text-sm font-bold mt-1 ${trade.yoyExportGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trade.yoyExportGrowth >= 0 ? '↑' : '↓'} {Math.abs(trade.yoyExportGrowth)}% YoY
            </p>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Imports 2024</p>
          <p className="text-3xl font-black text-amber-700">{formatUSD(trade.totalImport2024 || 0)}</p>
          {trade.yoyImportGrowth != null && (
            <p className={`text-sm font-bold mt-1 ${trade.yoyImportGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trade.yoyImportGrowth >= 0 ? '↑' : '↓'} {Math.abs(trade.yoyImportGrowth)}% YoY
            </p>
          )}
        </div>

        <div className={`${isSurplus ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} border rounded-xl p-5 text-center`}>
          <p className={`text-xs font-semibold ${isSurplus ? 'text-emerald-600' : 'text-red-600'} uppercase tracking-wider mb-1`}>
            Trade Balance
          </p>
          <p className={`text-3xl font-black ${isSurplus ? 'text-emerald-700' : 'text-red-700'}`}>
            {isSurplus ? '+' : ''}{formatUSD(balance)}
          </p>
          <p className={`text-sm font-bold mt-1 ${isSurplus ? 'text-emerald-600' : 'text-red-600'}`}>
            {isSurplus ? '✅ Surplus' : '⚠️ Deficit'}
          </p>
        </div>
      </div>

      {/* Key Commodities & Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export commodities */}
        {trade.keyExportCommodities && (
          <div>
            <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider mb-3">📦 Key Export Products</h3>
            <div className="space-y-2">
              {trade.keyExportCommodities.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-[#FAFAFA] rounded-lg px-3 py-2 border border-[#E4E4E7]">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[#18181B] text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trading partners */}
        {trade.majorTradingPartners && (
          <div>
            <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider mb-3">🌍 Key Trade Partners</h3>
            <div className="space-y-2">
              {trade.majorTradingPartners.map((partner: string, i: number) => {
                const barWidth = Math.max(20, 100 - i * 15);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[#18181B] text-sm font-medium w-28 truncate">{partner}</span>
                    <div className="flex-1 bg-[#F4F4F5] rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#E11D48] to-cyan-500 rounded-full transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

