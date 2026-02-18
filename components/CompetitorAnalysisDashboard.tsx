'use client';

import React, { useState, useEffect } from 'react';
import { CompetitorComparison } from '@/app/api/competitor/competitorAnalysisController';

interface CompetitorAnalysisPageProps {
  company?: string;
  competitor?: string;
}

/**
 * Competitor Analysis Dashboard
 * 
 * Shows comprehensive 4-pillar comparison:
 * 1. Legal & Scale (Pháp lý & Quy mô)
 * 2. Recruitment & HR (Tuyển dụng & Nhân sự)
 * 3. Digital Health (Sức khỏe kỹ thuật số)
 * 4. Media & Reputation (Truyền thông & Tin tức)
 * 
 * All data from real sources (0% generated)
 */
export default function CompetitorAnalysisDashboard({
  company = 'FPT Software',
  competitor = 'Vingroup',
}: CompetitorAnalysisPageProps) {
  const [data, setData] = useState<CompetitorComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState(company);
  const [selectedCompetitor, setSelectedCompetitor] = useState(competitor);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          company: selectedCompany,
          competitor: selectedCompetitor,
        });

        const response = await fetch(`/api/competitor/analyze?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch competitor analysis');
        }

        const analysisData = await response.json();
        setData(analysisData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedCompany, selectedCompetitor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <svg
            className="w-8 h-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <span className="ml-4 text-gray-600">Analyzing competitors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto mt-8">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Analysis</h1>
        <p className="text-gray-600 mb-8">Comprehensive 4-pillar intelligence (0% AI-generated data)</p>

        {/* Comparison Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Competitor</label>
              <input
                type="text"
                value={selectedCompetitor}
                onChange={(e) => setSelectedCompetitor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Overall Scorecard */}
        <OverallScorecard data={data} />

        {/* 4 Pillar Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ScaleSection data={data} />
          <GrowthSection data={data} />
          <TechnologySection data={data} />
          <ReputationSection data={data} />
        </div>

        {/* Competitive Position */}
        <CompetitivePositionSection data={data} />

        {/* Risk Assessment */}
        <RiskAssessmentSection data={data} />

        {/* Opportunities */}
        <OpportunitiesSection data={data} />

        {/* Recommendations */}
        <RecommendationsSection data={data} />

        {/* Data Quality */}
        <DataQualitySection data={data} />
      </div>
    </div>
  );
}

/**
 * Overall Scorecard Component
 */
function OverallScorecard({ data }: { data: CompetitorComparison }) {
  const { company, competitor } = data.analysis.overall;
  const winner = data.analysis.overall.overallWinner;
  const isCompanyAhead = winner === data.company.companyName;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Scorecard</h2>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Company Score */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{data.company.companyName}</h3>
          <div className="relative w-40 h-40 mx-auto mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isCompanyAhead ? '#10b981' : '#3b82f6'}
                strokeWidth="6"
                strokeDasharray={`${(company / 100) * 282.7} 282.7`}
                strokeLinecap="round"
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                fontSize="28"
                fontWeight="bold"
                fill={isCompanyAhead ? '#10b981' : '#3b82f6'}
              >
                {company}
              </text>
            </svg>
          </div>
          {isCompanyAhead && <p className="text-green-600 font-semibold">🏆 Leader</p>}
        </div>

        {/* Competitor Score */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{data.competitor.companyName}</h3>
          <div className="relative w-40 h-40 mx-auto mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={!isCompanyAhead ? '#10b981' : '#3b82f6'}
                strokeWidth="6"
                strokeDasharray={`${(competitor / 100) * 282.7} 282.7`}
                strokeLinecap="round"
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                fontSize="28"
                fontWeight="bold"
                fill={!isCompanyAhead ? '#10b981' : '#3b82f6'}
              >
                {competitor}
              </text>
            </svg>
          </div>
          {!isCompanyAhead && <p className="text-green-600 font-semibold">🏆 Leader</p>}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">Category Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(data.analysis.overall.categories).map(([category, scores]) => (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{category}</span>
                <span className="text-xs text-gray-500">
                  {scores.company} vs {scores.competitor}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${(scores.company / Math.max(scores.company, scores.competitor)) * 100}%` }}
                  />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600"
                    style={{ width: `${(scores.competitor / Math.max(scores.company, scores.competitor)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Scale Comparison Component
 */
function ScaleSection({ data }: { data: CompetitorComparison }) {
  const { scale } = data.analysis.dimensions;

  return (
    <SectionCard title="📊 Scale & Foundation" subtitle="Legal & Capitalization">
      <div className="space-y-4">
        <DetailRow
          label="Operating Status"
          company={scale.operatingStatus.company}
          competitor={scale.operatingStatus.competitor}
          verdict={scale.operatingStatus.verdict}
        />
        <DetailRow
          label="Years in Business"
          company={scale.yearsInBusiness.company?.toString() || 'Unknown'}
          competitor={scale.yearsInBusiness.competitor?.toString() || 'Unknown'}
          verdict={scale.yearsInBusiness.verdict}
        />
        <DetailRow
          label="Business Scope"
          company={scale.employees.company}
          competitor={scale.employees.competitor}
          verdict={scale.employees.verdict}
        />
      </div>
    </SectionCard>
  );
}

/**
 * Growth Comparison Component
 */
function GrowthSection({ data }: { data: CompetitorComparison }) {
  const { growth } = data.analysis.dimensions;

  return (
    <SectionCard title="📈 Growth & Hiring" subtitle="Hiring Signals & Trajectory">
      <div className="space-y-4">
        <DetailRow
          label="Open Positions"
          company={growth.hiringActivity.companyOpenPositions.toString()}
          competitor={growth.hiringActivity.competitorOpenPositions.toString()}
          verdict={growth.hiringActivity.verdict}
        />
        <DetailRow
          label="Growth Phase"
          company={growth.growthPhase.company}
          competitor={growth.growthPhase.competitor}
          verdict={growth.growthPhase.verdict}
        />

        {/* Hiring Signals */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-medium text-sm text-gray-900 mb-3">Hiring Signals</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 mb-2">{data.company.companyName}</p>
              {growth.hiringSignals.company.length > 0 ? (
                <div className="space-y-1">
                  {growth.hiringSignals.company.slice(0, 3).map((signal, i) => (
                    <div key={i} className="text-xs text-gray-700">
                      <span className={signal.strength === 'Strong' ? 'font-bold' : ''}>
                        {signal.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No clear signals</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-2">{data.competitor.companyName}</p>
              {growth.hiringSignals.competitor.length > 0 ? (
                <div className="space-y-1">
                  {growth.hiringSignals.competitor.slice(0, 3).map((signal, i) => (
                    <div key={i} className="text-xs text-gray-700">
                      <span className={signal.strength === 'Strong' ? 'font-bold' : ''}>
                        {signal.category}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No clear signals</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/**
 * Technology Comparison Component
 */
function TechnologySection({ data }: { data: CompetitorComparison }) {
  const { technology } = data.analysis.dimensions;

  return (
    <SectionCard title="💻 Technology & Digital" subtitle="Maturity & Infrastructure">
      <div className="space-y-4">
        <DetailRow
          label="Digital Maturity"
          company={technology.digitalMaturity.company.toString()}
          competitor={technology.digitalMaturity.competitor.toString()}
          verdict={technology.digitalMaturity.verdict}
        />
        <DetailRow
          label="Hosting"
          company={technology.infrastructure.company}
          competitor={technology.infrastructure.competitor}
          verdict=""
        />
        <DetailRow
          label="Monthly Traffic"
          company={
            technology.digitalTraffic.company
              ? `${(technology.digitalTraffic.company / 1000000).toFixed(1)}M`
              : 'N/A'
          }
          competitor={
            technology.digitalTraffic.competitor
              ? `${(technology.digitalTraffic.competitor / 1000000).toFixed(1)}M`
              : 'N/A'
          }
          verdict={technology.digitalTraffic.verdict}
        />

        {/* Tech Stack */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-medium text-sm text-gray-900 mb-3">Tech Stack</h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 mb-2">{data.company.companyName}</p>
              <div className="flex flex-wrap gap-1">
                {technology.techStack.company.slice(0, 3).map((tech, i) => (
                  <span
                    key={i}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 mb-2">{data.competitor.companyName}</p>
              <div className="flex flex-wrap gap-1">
                {technology.techStack.competitor.slice(0, 3).map((tech, i) => (
                  <span
                    key={i}
                    className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

/**
 * Reputation Comparison Component
 */
function ReputationSection({ data }: { data: CompetitorComparison }) {
  const { reputation } = data.analysis.dimensions;

  return (
    <SectionCard title="🏆 Reputation & Trust" subtitle="Media & Awards">
      <div className="space-y-4">
        <DetailRow
          label="Reliability Score"
          company={reputation.reliabilityScore.company.toString()}
          competitor={reputation.reliabilityScore.competitor.toString()}
          verdict={reputation.reliabilityScore.verdict}
        />
        <DetailRow
          label="Awards"
          company={reputation.awards.company.toString()}
          competitor={reputation.awards.competitor.toString()}
          verdict=""
        />
        <DetailRow
          label="Positive News %"
          company={`${reputation.mediaPresence.company}%`}
          competitor={`${reputation.mediaPresence.competitor}%`}
          verdict=""
        />
        <DetailRow
          label="Risk Profile"
          company={reputation.riskProfile.company}
          competitor={reputation.riskProfile.competitor}
          verdict={reputation.riskProfile.verdict}
        />
      </div>
    </SectionCard>
  );
}

/**
 * Competitive Position Component
 */
function CompetitivePositionSection({ data }: { data: CompetitorComparison }) {
  const { competitivePosition } = data.analysis;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">⚔️ Competitive Position</h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-lg font-semibold text-blue-900">
          {competitivePosition.overallVerdic}
          {competitivePosition.margin > 20 && ' (Clear winner)'}
        </p>
        <p className="text-sm text-blue-700 mt-1">{competitivePosition.battlefieldAdvantage}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Strengths</h4>
          <div>
            <p className="text-xs font-semibold text-blue-600 mb-2">{data.company.companyName}</p>
            <ul className="space-y-1">
              {competitivePosition.strengths.company.map((s, i) => (
                <li key={i} className="text-sm text-gray-700">✓ {s}</li>
              ))}
            </ul>
            <p className="text-xs font-semibold text-purple-600 mt-3 mb-2">{data.competitor.companyName}</p>
            <ul className="space-y-1">
              {competitivePosition.strengths.competitor.map((s, i) => (
                <li key={i} className="text-sm text-gray-700">✓ {s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Weaknesses</h4>
          <div>
            <p className="text-xs font-semibold text-blue-600 mb-2">{data.company.companyName}</p>
            <ul className="space-y-1">
              {competitivePosition.weaknesses.company.length > 0 ? (
                competitivePosition.weaknesses.company.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700">✗ {s}</li>
                ))
              ) : (
                <li className="text-sm text-gray-500">None identified</li>
              )}
            </ul>
            <p className="text-xs font-semibold text-purple-600 mt-3 mb-2">{data.competitor.companyName}</p>
            <ul className="space-y-1">
              {competitivePosition.weaknesses.competitor.length > 0 ? (
                competitivePosition.weaknesses.competitor.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700">✗ {s}</li>
                ))
              ) : (
                <li className="text-sm text-gray-500">None identified</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Risk Assessment Component
 */
function RiskAssessmentSection({ data }: { data: CompetitorComparison }) {
  const { riskAssessment } = data.analysis;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Risk Assessment</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <RiskBox
          title={data.company.companyName}
          critical={riskAssessment.companyRisks.critical}
          high={riskAssessment.companyRisks.high}
          medium={riskAssessment.companyRisks.medium}
        />
        <RiskBox
          title={data.competitor.companyName}
          critical={riskAssessment.competitorRisks.critical}
          high={riskAssessment.competitorRisks.high}
          medium={riskAssessment.competitorRisks.medium}
        />
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="font-semibold text-yellow-900 mb-2">Critical Factors to Watch:</p>
        <ul className="space-y-1">
          {riskAssessment.criticalFactors.length > 0 ? (
            riskAssessment.criticalFactors.map((factor, i) => (
              <li key={i} className="text-sm text-yellow-800">• {factor}</li>
            ))
          ) : (
            <li className="text-sm text-yellow-700">No critical risk factors identified</li>
          )}
        </ul>
      </div>
    </div>
  );
}

/**
 * Risk Box Component
 */
function RiskBox({
  title,
  critical,
  high,
  medium,
}: {
  title: string;
  critical: number;
  high: number;
  medium: number;
}) {
  const riskLevel =
    critical > 0 ? 'Critical' : high > 0 ? 'High' : medium > 0 ? 'Medium' : 'Low';
  const riskColor =
    critical > 0
      ? 'red'
      : high > 0
        ? 'orange'
        : medium > 0
          ? 'yellow'
          : 'green';

  return (
    <div className={`p-4 border-2 border-${riskColor}-200 bg-${riskColor}-50 rounded-lg`}>
      <h4 className={`font-semibold text-${riskColor}-900 mb-3`}>{title}</h4>
      <div className="space-y-2">
        {critical > 0 && <RiskItem level="Critical" count={critical} color={riskColor} />}
        {high > 0 && <RiskItem level="High" count={high} color={riskColor} />}
        {medium > 0 && <RiskItem level="Medium" count={medium} color={riskColor} />}
        {critical === 0 && high === 0 && medium === 0 && (
          <p className={`text-sm text-${riskColor}-700`}>No identified risks</p>
        )}
      </div>
    </div>
  );
}

/**
 * Risk Item Component
 */
function RiskItem({ level, count, color }: { level: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm font-medium text-${color}-800`}>{level} Risk</span>
      <span className={`inline-block bg-${color}-200 text-${color}-800 px-3 py-1 rounded-full text-sm font-semibold`}>
        {count}
      </span>
    </div>
  );
}

/**
 * Opportunities Component
 */
function OpportunitiesSection({ data }: { data: CompetitorComparison }) {
  const { opportunities } = data.analysis;

  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Opportunities</h2>
      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <div key={i} className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-green-900">{opp.title}</h4>
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  opp.priority === 'Urgent'
                    ? 'bg-red-200 text-red-800'
                    : opp.priority === 'High'
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-yellow-200 text-yellow-800'
                }`}
              >
                {opp.priority}
              </span>
            </div>
            <p className="text-sm text-green-800 mb-2">{opp.description}</p>
            <p className="text-xs text-green-700">For: {opp.targetAudience}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Recommendations Component
 */
function RecommendationsSection({ data }: { data: CompetitorComparison }) {
  const { recommendations } = data.analysis;

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Recommendations</h2>
      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
            <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Action Items:</p>
              <ul className="space-y-1">
                {rec.actionItems.map((item, j) => (
                  <li key={j} className="text-sm text-gray-700">→ {item}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-blue-600 font-medium">Expected Impact: {rec.expectedImpact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Data Quality Component
 */
function DataQualitySection({ data }: { data: CompetitorComparison }) {
  const { dataQuality } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Data Quality</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">Data Completeness</span>
          <span className="text-sm font-bold text-blue-600">{dataQuality.completeness}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${dataQuality.completeness}%` }}
          />
        </div>
      </div>

      <div className="mb-4">
        <p className="font-semibold text-gray-700 mb-2">Sources:</p>
        <div className="flex flex-wrap gap-2">
          {dataQuality.sources.map((source, i) => (
            <span
              key={i}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
            >
              {source}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Last updated: {new Date(dataQuality.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}

// Helper Components

/**
 * Section Card Component
 */
function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

/**
 * Detail Row Component
 */
function DetailRow({
  label,
  company,
  competitor,
  verdict,
}: {
  label: string;
  company: string;
  competitor: string;
  verdict: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-gray-900">{label}</span>
        {verdict && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{verdict}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 bg-blue-50 rounded">
          <p className="text-xs text-blue-600 font-semibold mb-1">Company</p>
          <p className="text-sm text-gray-900">{company}</p>
        </div>
        <div className="p-2 bg-purple-50 rounded">
          <p className="text-xs text-purple-600 font-semibold mb-1">Competitor</p>
          <p className="text-sm text-gray-900">{competitor}</p>
        </div>
      </div>
    </div>
  );
}
