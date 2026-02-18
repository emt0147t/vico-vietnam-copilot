/**
 * 🎨 React Components for Trusted Data Display
 * 
 * Components that show data with trust indicators, sources, and citations
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

import {
  QualityTrackedData,
  VerificationStatus,
  DataQualityScorer
} from '../services/dataQualityScore';

interface TrustBadgeProps {
  score: number;              // 0-1.0
  source: string;
  lastUpdated: Date;
  showDetails?: boolean;
  verificationStatus?: VerificationStatus;
}

/**
 * Trust Badge Component
 * Shows visual indicator of data trustworthiness
 */
export const TrustBadge: React.FC<TrustBadgeProps> = ({
  score,
  source,
  lastUpdated,
  showDetails = false,
  verificationStatus = VerificationStatus.UNVERIFIED
}) => {
  const [showMore, setShowMore] = useState(false);
  const trustLevel = DataQualityScorer.getTrustLevel(score);
  const daysSinceUpdate = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

  const colors = {
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900'
  };

  const icons = {
    check: <CheckCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
    alert: <AlertCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    error: <AlertTriangle className="w-4 h-4" />
  };

  return (
    <div className={`trust-badge border rounded-lg p-3 ${colors[trustLevel.color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icons[trustLevel.icon]}
          <span className="font-medium text-sm">{trustLevel.level.replace('_', ' ')}</span>
          <span className="text-xs opacity-75">({Math.round(score * 100)}%)</span>
        </div>
        {showDetails && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs underline hover:opacity-75"
          >
            {showMore ? 'Hide' : 'Details'}
          </button>
        )}
      </div>

      {showMore && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20 text-xs space-y-2">
          <div>
            <span className="opacity-75">Source:</span>
            <span className="ml-2 font-mono">{source}</span>
          </div>
          <div>
            <span className="opacity-75">Updated:</span>
            <span className="ml-2">
              {daysSinceUpdate === 0 ? 'Today' : `${daysSinceUpdate}d ago`}
              {daysSinceUpdate > 365 && ' (STALE)'}
            </span>
          </div>
          <div>
            <span className="opacity-75">Status:</span>
            <span className="ml-2 capitalize">{verificationStatus.replace('_', ' ')}</span>
          </div>
        </div>
      )}

      {score === 0 && (
        <div className="mt-2 text-xs font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          This is generated/synthetic data - not trusted
        </div>
      )}
    </div>
  );
};

interface DataCardProps {
  title: string;
  value: string | number;
  unit?: string;
  data: QualityTrackedData;
  showTrend?: boolean;
  trendDirection?: 'up' | 'down' | 'neutral';
  citations?: Array<{ url: string; text: string; date: string }>;
  onReportIssue?: () => void;
}

/**
 * Data Card Component
 * Displays a single data point with trust indicator
 */
export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  unit,
  data,
  showTrend = false,
  trendDirection = 'neutral',
  citations = [],
  onReportIssue
}) => {
  const [showCitations, setShowCitations] = useState(false);

  const trendIcons = {
    up: <TrendingUp className="w-5 h-5 text-green-600" />,
    down: <TrendingDown className="w-5 h-5 text-red-600" />,
    neutral: <span />
  };

  return (
    <div className="data-card bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-tight">{title}</h3>
        </div>
        {showTrend && trendIcons[trendDirection]}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {value}
          {unit && <span className="text-lg text-gray-500 ml-2">{unit}</span>}
        </div>
      </div>

      {data.validationIssues && data.validationIssues.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {data.validationIssues[0]}
        </div>
      )}

      <div className="mb-4">
        <TrustBadge
          score={data.trustScore}
          source={data.source}
          lastUpdated={data.lastUpdated}
          showDetails={true}
          verificationStatus={data.verificationStatus}
        />
      </div>

      {data.citations && data.citations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            View {data.citations.length} source(s)
          </button>

          {showCitations && (
            <ul className="mt-3 space-y-2 text-xs">
              {data.citations.map((cite, i) => (
                <li key={i} className="flex gap-2">
                  <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex-1"
                  >
                    {cite.title || cite.url.split('/')[2]}
                  </a>
                  <span className="text-gray-500 flex-shrink-0">{cite.documentType}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {data.verificationStatus === VerificationStatus.DISPUTED && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-orange-600 mt-0.5" />
          <div className="text-xs text-orange-800">
            <p className="font-semibold mb-1">Conflicting data from multiple sources</p>
            <button className="text-orange-600 hover:text-orange-800 underline">View alternatives</button>
          </div>
        </div>
      )}

      {onReportIssue && (
        <button
          onClick={onReportIssue}
          className="mt-4 w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-700 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-3 h-3" />
          Report inaccuracy
        </button>
      )}
    </div>
  );
};

interface DataLineageViewerProps {
  title: string;
  currentValue: any;
  history: Array<{
    date: Date;
    source: string;
    value: any;
    confidence: number;
  }>;
  conflictingValues?: Array<{
    source: string;
    value: any;
  }>;
}

/**
 * Data Lineage Viewer
 * Shows how data evolved over time from different sources
 */
export const DataLineageViewer: React.FC<DataLineageViewerProps> = ({
  title,
  currentValue,
  history,
  conflictingValues
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title} - Data History</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
        <p className="text-xs text-blue-700 font-semibold mb-1">Current Value</p>
        <p className="text-2xl font-bold text-blue-900">{currentValue}</p>
      </div>

      {expanded && (
        <div className="space-y-3 text-sm">
          <div className="border-l-2 border-gray-300 pl-4">
            {history.map((entry, i) => (
              <div
                key={i}
                className={`pb-4 ${i < history.length - 1 ? 'border-b border-gray-200 mb-4' : ''}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-mono text-xs text-gray-600">
                    {entry.date.toLocaleDateString()}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {entry.source}
                  </span>
                </div>
                <p className="text-gray-900 font-semibold mb-2">{entry.value}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${entry.confidence * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Confidence: {Math.round(entry.confidence * 100)}%</p>
              </div>
            ))}
          </div>

          {conflictingValues && conflictingValues.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-xs font-semibold text-orange-900 mb-2">Conflicting Values</p>
              <ul className="space-y-1 text-xs text-orange-800">
                {conflictingValues.map((conflict, i) => (
                  <li key={i}>
                    <span className="font-medium">{conflict.source}:</span> {conflict.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface CitationListProps {
  citations: Array<{
    url: string;
    title: string;
    date: Date;
    excerpt?: string;
    documentType?: 'filing' | 'news' | 'api' | 'webpage' | 'other';
  }>;
  onReportIssue?: () => void;
}

/**
 * Citation List Component
 * Shows all sources for a data point
 */
export const CitationList: React.FC<CitationListProps> = ({ citations, onReportIssue }) => {
  if (citations.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">No citations available for this data point</div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-sm text-gray-900 mb-3">Sources</h4>
      <ol className="space-y-3 list-decimal list-inside">
        {citations.map((cite, i) => (
          <li key={i} className="text-sm">
            <a
              href={cite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
            >
              {cite.title || cite.url.split('/')[2]}
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="text-xs text-gray-600 mt-1 ml-5">
              <p className="flex items-center gap-2">
                <span>{cite.date.toLocaleDateString()}</span>
                {cite.documentType && <span className="px-2 py-0.5 bg-gray-200 rounded">{cite.documentType}</span>}
              </p>
              {cite.excerpt && <p className="italic mt-1 text-gray-700">"{cite.excerpt}"</p>}
            </div>
          </li>
        ))}
      </ol>

      {onReportIssue && (
        <button
          onClick={onReportIssue}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline font-medium"
        >
          Report inaccuracy in these sources
        </button>
      )}
    </div>
  );
};

interface UserContributionBoxProps {
  field: string;
  currentValue?: any;
  currentSource?: string;
  onSubmit: (contribution: {
    value: string;
    sourceUrl: string;
    evidence: string;
  }) => Promise<void>;
}

/**
 * User Contribution Box
 * Allows users to submit better data
 */
export const UserContributionBox: React.FC<UserContributionBoxProps> = ({
  field,
  currentValue,
  currentSource,
  onSubmit
}) => {
  const [value, setValue] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !sourceUrl.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ value, sourceUrl, evidence });
      setSubmitted(true);
      setValue('');
      setSourceUrl('');
      setEvidence('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert('Error submitting contribution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mt-6">
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">Help improve this data</h4>
          <p className="text-sm text-blue-800">
            {currentValue && currentSource ? (
              <>
                We currently have <strong>{currentValue}</strong> from{' '}
                <strong>{currentSource}</strong>. Do you have more accurate information?
              </>
            ) : (
              'Do you have data for this field? Share with our community!'
            )}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Thank you! Your contribution will be reviewed by our community.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct {field}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`New value for ${field}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source URL (required)
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why this is more accurate
            </label>
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Explain how you found this information..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !value.trim() || !sourceUrl.trim()}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition"
          >
            {submitting ? 'Submitting...' : 'Submit Contribution'}
          </button>
        </form>
      )}
    </div>
  );
};

export default {
  TrustBadge,
  DataCard,
  DataLineageViewer,
  CitationList,
  UserContributionBox
};
