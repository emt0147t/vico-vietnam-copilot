/**
 * 📋 EXAMPLE: CompetitorAnalysisDashboard with Data Quality
 * 
 * Shows how to integrate TrustedDataComponents into your existing pages
 * Copy this pattern to update other components
 */

import React, { useState, useEffect } from 'react';
import {
  TrustBadge,
  DataCard,
  DataLineageViewer,
  CitationList,
  UserContributionBox
} from './TrustedDataComponents';

import {
  QualityTrackedData,
  VerificationStatus
} from '../services/dataQualityScore';

interface CompetitorAnalysisDashboardProps {
  companyName: string;
  companyId: string;
}

/**
 * Example: Updated Competitor Analysis with Data Quality
 */
export const CompetitorAnalysisDashboardWithQuality: React.FC<
  CompetitorAnalysisDashboardProps
> = ({ companyName, companyId }) => {
  const [competitor, setCompetitor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dataQuality, setDataQuality] = useState<{
    averageTrust: number;
    realDataPercent: number;
    generatedDataPercent: number;
  } | null>(null);

  useEffect(() => {
    fetchCompetitorData();
  }, [companyName]);

  const fetchCompetitorData = async () => {
    setLoading(true);
    try {
      // Fetch from new endpoint with quality metadata
      const response = await fetch(`/api/competitor-intelligence-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCompany: { name: 'Your Company' },
          selectedCompetitors: [{ name: companyName }]
        })
      });

      const result = await response.json();

      if (result.success) {
        setCompetitor(result.data);

        // Extract quality metrics
        if (result.metadata?.dataQuality) {
          setDataQuality({
            averageTrust: result.metadata.dataQuality.averageTrustScore || 0,
            realDataPercent:
              parseFloat(result.metadata.dataQuality.percentRealData) || 0,
            generatedDataPercent:
              parseFloat(result.metadata.dataQuality.percentGeneratedData) || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch competitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!competitor) {
    return <div className="p-8 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER with Trust Score */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
          <p className="text-gray-500 mt-2">Competitive Analysis Report</p>
        </div>

        {dataQuality && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-right">
            <div className="text-3xl font-bold text-blue-900">
              {Math.round(dataQuality.averageTrust * 100)}%
            </div>
            <div className="text-sm text-blue-700 mt-1">Overall Trust Score</div>
            <div className="text-xs text-blue-600 mt-3">
              {dataQuality.realDataPercent}% Real Data
            </div>
          </div>
        )}
      </div>

      {/* DATA QUALITY WARNING */}
      {dataQuality && dataQuality.generatedDataPercent > 5 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
          <div className="text-orange-600 text-lg">⚠️</div>
          <div>
            <p className="font-semibold text-orange-900">
              Note: {Math.round(dataQuality.generatedDataPercent)}% of data is from estimates
            </p>
            <p className="text-sm text-orange-800 mt-1">
              We recommend verifying critical information from original sources
            </p>
          </div>
        </div>
      )}

      {/* FIRMOGRAPHICS SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Firmographics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* REVENUE CARD */}
          {competitor.revenue && (
            <DataCard
              title="Annual Revenue"
              value={competitor.revenue.value}
              unit="USD"
              data={competitor.revenue}
              showTrend={true}
              trendDirection={competitor.revenueGrowth > 0 ? 'up' : 'down'}
              citations={competitor.revenue.citations}
              onReportIssue={() => handleReportIssue('revenue')}
            />
          )}

          {/* HEADCOUNT CARD */}
          {competitor.headcount && (
            <DataCard
              title="Employee Count"
              value={competitor.headcount.value}
              unit="people"
              data={competitor.headcount}
              citations={competitor.headcount.citations}
              onReportIssue={() => handleReportIssue('headcount')}
            />
          )}

          {/* FUNDING CARD */}
          {competitor.funding && (
            <DataCard
              title="Total Funding"
              value={competitor.funding.value}
              unit="USD"
              data={competitor.funding}
              citations={competitor.funding.citations}
              onReportIssue={() => handleReportIssue('funding')}
            />
          )}
        </div>
      </section>

      {/* TECH STACK SECTION */}
      {competitor.techStack && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Technology Stack</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(competitor.techStack).map(([category, technologies]: any) => (
              <div
                key={category}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4 capitalize">
                  {category}
                </h3>
                <div className="space-y-2">
                  {technologies.map((tech: string, i: number) => (
                    <div key={i} className="text-sm text-gray-700 flex items-center">
                      <span className="text-blue-500 mr-2">→</span>
                      {tech}
                    </div>
                  ))}
                </div>
                <TrustBadge
                  score={competitor.techStack.trustScore || 0.75}
                  source={competitor.techStack.source || 'builtwith'}
                  lastUpdated={new Date(competitor.techStack.lastUpdated || Date.now())}
                  showDetails={true}
                  verificationStatus={VerificationStatus.UNVERIFIED}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RECENT NEWS SECTION */}
      {competitor.news && competitor.news.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Recent News</h2>

          <div className="space-y-4">
            {competitor.news.slice(0, 5).map((article: any, i: number) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex-1">{article.title}</h3>
                  <TrustBadge
                    score={article.trustScore || 0.75}
                    source={article.source}
                    lastUpdated={new Date(article.publishedAt)}
                    showDetails={false}
                  />
                </div>

                <p className="text-gray-600 text-sm mb-4">{article.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {article.source}
                  </span>
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Read full article →
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* DATA LINEAGE (OPTIONAL) */}
      {competitor.revenueHistory && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Revenue History</h2>
          <DataLineageViewer
            title="Revenue Over Time"
            currentValue={competitor.revenue?.value}
            history={competitor.revenueHistory.map((entry: any) => ({
              date: new Date(entry.date),
              source: entry.source,
              value: entry.value,
              confidence: entry.confidence
            }))}
          />
        </section>
      )}

      {/* USER CONTRIBUTION SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Help Improve Data</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserContributionBox
            field="Revenue"
            currentValue={competitor.revenue?.value}
            currentSource={competitor.revenue?.source}
            onSubmit={handleUserContribution}
          />

          <UserContributionBox
            field="Employee Count"
            currentValue={competitor.headcount?.value}
            currentSource={competitor.headcount?.source}
            onSubmit={handleUserContribution}
          />
        </div>
      </section>

      {/* FOOTER: Data Attribution */}
      <section className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📊 Data Sources</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">Official</p>
              <p className="text-gray-600">SEC EDGAR</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">News</p>
              <p className="text-gray-600">NewsAPI, GNews</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Company Data</p>
              <p className="text-gray-600">LinkedIn, Crunchbase</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Tech Stack</p>
              <p className="text-gray-600">BuiltWith, Wikipedia</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function handleReportIssue(field: string) {
  const description = prompt(`What's wrong with the ${field} data?`);
  if (!description) return;

  const sourceUrl = prompt('Link to correct information (optional)');

  try {
    const response = await fetch('/api/data-quality/report-issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: 'TODO: get from props',
        field,
        reportedValue: 'TODO: get from state',
        sourceUrl: sourceUrl || '',
        description,
        userId: 'TODO: get from auth'
      })
    });

    const result = await response.json();
    if (result.success) {
      alert('Thank you! Your report has been received.');
    }
  } catch (error) {
    console.error('Failed to report issue:', error);
    alert('Failed to submit report. Please try again.');
  }
}

async function handleUserContribution(contribution: {
  value: string;
  sourceUrl: string;
  evidence: string;
}) {
  console.log('User submitted contribution:', contribution);

  // TODO: Submit to API
  // POST /api/data-quality/user-contribution

  alert('Thank you! Your contribution is being reviewed by our community.');
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Simple data card with quality indicators
 * 
 * <DataCard
 *   title="Revenue"
 *   value="$500M"
 *   unit="USD"
 *   data={{
 *     trustScore: 0.95,
 *     source: 'sec',
 *     lastUpdated: new Date('2024-01-15'),
 *     citations: [{ url: 'https://sec.gov/...', title: '10-K Filing' }],
 *     verificationStatus: 'verified'
 *   }}
 * />
 * 
 * DISPLAYS:
 * - Value: $500M
 * - Green badge: "Highly Trusted (95%)"  🟢
 * - Source: "From SEC 10-K Filing"
 * - "View sources" link
 * - "Report inaccuracy" button
 */

/**
 * EXAMPLE 2: Trust badge for quick reference
 * 
 * <TrustBadge
 *   score={0.85}
 *   source="newsapi"
 *   lastUpdated={new Date()}
 *   showDetails={true}
 * />
 * 
 * DISPLAYS:
 * - Color-coded badge: Green, Yellow, Orange, or Red
 * - Confidence percentage
 * - Source attribution
 * - Last updated date
 */

/**
 * EXAMPLE 3: Multiple data points with lineage
 * 
 * <DataLineageViewer
 *   title="Revenue"
 *   currentValue="$500M"
 *   history={[
 *     { date: new Date('2024-01'), source: 'sec', value: '$485M', confidence: 1.0 },
 *     { date: new Date('2023-12'), source: 'newsapi', value: '$490M', confidence: 0.7 }
 *   ]}
 * />
 * 
 * DISPLAYS:
 * - Current value prominently
 * - Timeline showing how data changed
 * - Sources for each version
 * - Confidence levels
 */

/**
 * PATTERNS TO FOLLOW:
 * 
 * 1. Always include trust data:
 *    Every data point should have trustScore, source, lastUpdated
 * 
 * 2. Show citations:
 *    Let users click to see where data came from
 * 
 * 3. Allow interaction:
 *    Users can report issues or contribute better data
 * 
 * 4. Handle conflicts:
 *    When multiple sources disagree, show all versions
 * 
 * 5. Never hide generated data:
 *    If no real data, show empty state, not fake estimates
 */
