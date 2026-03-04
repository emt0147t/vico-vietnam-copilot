/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * ðŸ† DATA PROVENANCE UI â€” Badges, tooltips, and panels for verified data
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * React components that display data provenance information:
 *   - VerifiedBadge: Small inline badge showing confidence level
 *   - SourceTag: Shows where a specific data point comes from
 *   - ProvenanceTooltip: Hover detail for any verified field
 *   - DataSourcesPanel: Full panel showing all sources for a company
 *   - VerifiedCompanyBanner: Header banner for verified-first companies
 *
 * These components consume the provenance metadata from verifiedCompanies.ts
 * and display it in a user-friendly way.
 */

import React, { useState } from 'react';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES (mirrors server-side types for client-side use)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export type DataSourceType =
  | 'company_website' | 'hose_filing' | 'hnx_filing' | 'upcom_filing'
  | 'cafef' | 'ssi_iboard' | 'dkkd_gov' | 'press_release'
  | 'investor_disclosure' | 'dealstreetasia' | 'techinasia' | 'crunchbase'
  | 'sensortower' | 'data_ai' | 'linkedin_company' | 'topcv_jobs'
  | 'vietnamworks_jobs' | 'google_news_rss' | 'news_article' | 'gso_gov'
  | 'sbv_gov' | 'viettel_annual_report' | 'mwg_annual_report' | 'idc_report'
  | 'econony_sea_report' | 'y_combinator' | 'on_chain_data'
  | 'manual_research' | 'ai_generated';

export interface DataProvenance {
  source: DataSourceType;
  url: string;
  fetchedAt: string;
  isVerified: boolean;
  confidence: number;
  note?: string;
}

export interface ProvenanceSummary {
  totalFields: number;
  verifiedFields: number;
  estimatedFields: number;
  aiGeneratedFields: number;
  verificationRate: number;
  overallConfidence: number;
  topSources: { source: DataSourceType; count: number; label: string }[];
  badge: { label: string; color: string; bg: string };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const SOURCE_LABELS: Record<DataSourceType, string> = {
  company_website: 'Company Website',
  hose_filing: 'HOSE Filing',
  hnx_filing: 'HNX Filing',
  upcom_filing: 'UPCoM Filing',
  cafef: 'CafeF',
  ssi_iboard: 'SSI iBoard',
  dkkd_gov: 'DKKD.gov.vn',
  press_release: 'Press Release',
  investor_disclosure: 'Investor Disclosure',
  dealstreetasia: 'DealStreetAsia',
  techinasia: 'TechinAsia',
  crunchbase: 'Crunchbase',
  sensortower: 'SensorTower',
  data_ai: 'Data.ai',
  linkedin_company: 'LinkedIn',
  topcv_jobs: 'TopCV Jobs',
  vietnamworks_jobs: 'VietnamWorks Jobs',
  google_news_rss: 'Google News',
  news_article: 'News Article',
  gso_gov: 'GSO Vietnam',
  sbv_gov: 'SBV Vietnam',
  viettel_annual_report: 'Viettel Annual Report',
  mwg_annual_report: 'MWG Annual Report',
  idc_report: 'IDC Report',
  econony_sea_report: 'e-Conomy SEA',
  y_combinator: 'Y Combinator',
  on_chain_data: 'On-Chain Data',
  manual_research: 'Manual Research',
  ai_generated: 'AI Generated',
};

const SOURCE_ICONS: Partial<Record<DataSourceType, string>> = {
  company_website: 'â—‹',
  hose_filing: 'â–£',
  hnx_filing: 'â–£',
  upcom_filing: 'â–£',
  cafef: 'â–²',
  dkkd_gov: 'â–¡',
  press_release: 'â—‡',
  investor_disclosure: '$',
  dealstreetasia: 'â—‡',
  techinasia: 'â—‡',
  crunchbase: 'â—Ž',
  linkedin_company: 'â—Ž',
  topcv_jobs: 'â—‰',
  google_news_rss: 'â—‡',
  ai_generated: 'â–³',
  manual_research: 'â—†',
};

function getConfidenceConfig(confidence: number) {
  if (confidence >= 0.85) return {
    label: 'Verified',
    labelVi: 'ÄÃ£ xÃ¡c minh',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    icon: 'âœ“',
  };
  if (confidence >= 0.60) return {
    label: 'Estimated',
    labelVi: 'Æ¯á»›c tÃ­nh',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: '~',
  };
  return {
    label: 'Low Confidence',
    labelVi: 'Äá»™ tin cáº­y tháº¥p',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    icon: '!',
  };
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 1. VERIFIED BADGE â€” Small inline badge showing verification status
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface VerifiedBadgeProps {
  confidence: number;
  source?: DataSourceType;
  compact?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  confidence,
  source,
  compact = false,
  className = '',
}) => {
  const config = getConfidenceConfig(confidence);
  const sourceLabel = source ? SOURCE_LABELS[source] : null;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 px-1 py-px rounded text-[9px] font-bold ${config.bg} ${config.color} border ${config.border} ${className}`}
        title={`${config.label} (${Math.round(confidence * 100)}%)${sourceLabel ? ` â€” ${sourceLabel}` : ''}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.icon}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${config.bg} ${config.color} border ${config.border} ${className}`}
      title={sourceLabel ? `Source: ${sourceLabel}` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
      <span className="opacity-60">{Math.round(confidence * 100)}%</span>
    </span>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 2. SOURCE TAG â€” Shows where a specific data point comes from
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface SourceTagProps {
  provenance: DataProvenance;
  showUrl?: boolean;
  className?: string;
}

export const SourceTag: React.FC<SourceTagProps> = ({
  provenance,
  showUrl = false,
  className = '',
}) => {
  const icon = SOURCE_ICONS[provenance.source] || 'â—‹';
  const label = SOURCE_LABELS[provenance.source] || provenance.source;
  const config = getConfidenceConfig(provenance.confidence);

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] ${config.color} ${className}`}>
      <span>{icon}</span>
      {showUrl && provenance.url ? (
        <a
          href={provenance.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          title={`Verify at: ${provenance.url}`}
        >
          {label}
        </a>
      ) : (
        <span>{label}</span>
      )}
      {provenance.isVerified && (
        <span className="text-green-600" title="Human-verified">âœ“</span>
      )}
    </span>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 3. PROVENANCE TOOLTIP â€” Hover detail for any verified field
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface ProvenanceTooltipProps {
  fieldName: string;
  provenance: DataProvenance;
  children: React.ReactNode;
}

export const ProvenanceTooltip: React.FC<ProvenanceTooltipProps> = ({
  fieldName,
  provenance,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = getConfidenceConfig(provenance.confidence);
  const sourceLabel = SOURCE_LABELS[provenance.source] || provenance.source;
  const icon = SOURCE_ICONS[provenance.source] || 'â—‹';

  return (
    <span className="relative inline-block group">
      <span
        className="cursor-help border-b border-dotted border-current"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
        <VerifiedBadge confidence={provenance.confidence} compact className="ml-0.5" />
      </span>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-1 w-64 p-2.5 rounded-lg shadow-lg border bg-white text-xs">
          <div className="font-semibold text-zinc-800 mb-1.5">
            {fieldName}
          </div>

          <div className="space-y-1.5">
            {/* Confidence */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Confidence</span>
              <span className={`font-bold ${config.color}`}>
                {Math.round(provenance.confidence * 100)}% â€” {config.label}
              </span>
            </div>

            {/* Source */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Source</span>
              <span className={`font-medium ${config.color}`}>
                {icon} {sourceLabel}
              </span>
            </div>

            {/* Verified */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Verified</span>
              <span className={provenance.isVerified ? 'text-green-600 font-bold' : 'text-zinc-400'}>
                {provenance.isVerified ? 'âœ“ Yes' : 'âœ— No'}
              </span>
            </div>

            {/* URL */}
            {provenance.url && (
              <div className="pt-1 border-t border-zinc-100">
                <a
                  href={provenance.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate block"
                  title={provenance.url}
                >
                  Verify source
                </a>
              </div>
            )}

            {/* Note */}
            {provenance.note && (
              <div className="pt-1 border-t border-zinc-100 text-zinc-500 italic">
                {provenance.note}
              </div>
            )}

            {/* Last fetched */}
            <div className="text-zinc-400 text-[9px]">
              Last verified: {new Date(provenance.fetchedAt).toLocaleDateString('en-US')}
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 4. DATA SOURCES PANEL â€” Full panel showing all sources for a company
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface DataSourcesPanelProps {
  provenanceSummary: ProvenanceSummary;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourcesPanel: React.FC<DataSourcesPanelProps> = ({
  provenanceSummary,
  companyName,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { totalFields, verifiedFields, estimatedFields, aiGeneratedFields, verificationRate, topSources, badge } = provenanceSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-800">
                Data Sources â€” {companyName}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Verified-first data policy
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-200:bg-zinc-700 rounded-md transition-colors text-zinc-500"
            >
              âœ•
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-3 space-y-3">
          {/* Verification meter */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-zinc-500">Data Verification Rate</span>
              <span className={`font-bold ${badge.color}`}>{verificationRate}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${verificationRate}%`,
                  background: verificationRate >= 70 ? 'linear-gradient(90deg, #22c55e, #10b981)' :
                    verificationRate >= 40 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                      'linear-gradient(90deg, #ef4444, #dc2626)',
                }}
              />
            </div>
          </div>

          {/* Field breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-700">{verifiedFields}</div>
              <div className="text-[10px] text-green-600">Verified</div>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <div className="text-lg font-bold text-amber-700">{estimatedFields}</div>
              <div className="text-[10px] text-amber-600">Estimated</div>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-700">{aiGeneratedFields}</div>
              <div className="text-[10px] text-red-600">AI Generated</div>
            </div>
          </div>

          {/* Top sources */}
          <div>
            <div className="text-[11px] font-semibold text-zinc-600 mb-1.5">
              Top Data Sources
            </div>
            <div className="space-y-1">
              {topSources.map((ts, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span>{SOURCE_ICONS[ts.source] || 'â—‹'}</span>
                    <span className="text-zinc-700">{ts.label}</span>
                  </span>
                  <span className="text-zinc-400 font-mono">{ts.count} fields</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 text-center">
            {totalFields} total data fields â€¢ Policy: Verified-First
          </div>
        </div>
      </div>
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 5. VERIFIED COMPANY BANNER â€” Header badge for verified-first companies
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface VerifiedCompanyBannerProps {
  companyName: string;
  dataScore: number;
  provenanceSummary?: ProvenanceSummary;
  onShowSources?: () => void;
  className?: string;
}

export const VerifiedCompanyBanner: React.FC<VerifiedCompanyBannerProps> = ({
  companyName,
  dataScore,
  provenanceSummary,
  onShowSources,
  className = '',
}) => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 ${className}`}>
        {/* Shield icon */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
          <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a.75.75 0 01.65.376l1.562 2.716 3.09.76a.75.75 0 01.381 1.226L13.48 8.552l.31 3.157a.75.75 0 01-1.049.752L10 11.178l-2.741 1.283a.75.75 0 01-1.049-.752l.31-3.157L4.317 6.078a.75.75 0 01.381-1.226l3.09-.76L9.35 1.376A.75.75 0 0110 1z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-[11px] leading-tight">
          <div className="font-bold text-green-700">
            Verified Data
          </div>
          <div className="text-green-600">
            Score: {dataScore}/100
            {provenanceSummary && ` â€¢ ${provenanceSummary.verificationRate}% verified`}
          </div>
        </div>

        {/* View Sources button */}
        {(onShowSources || provenanceSummary) && (
          <button
            onClick={() => onShowSources ? onShowSources() : setShowPanel(true)}
            className="ml-1 px-2 py-0.5 text-[10px] font-semibold text-green-700 bg-green-100 hover:bg-green-200:bg-green-900/60 rounded transition-colors"
          >
            View Sources
          </button>
        )}
      </div>

      {/* Panel */}
      {provenanceSummary && (
        <DataSourcesPanel
          provenanceSummary={provenanceSummary}
          companyName={companyName}
          isOpen={showPanel}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 6. AI GENERATED WARNING â€” Shows when data is AI-generated
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface AIGeneratedWarningProps {
  section: string;
  className?: string;
}

export const AIGeneratedWarning: React.FC<AIGeneratedWarningProps> = ({
  section,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] text-amber-700 ${className}`}>
      <span>â–³</span>
      <span>
        <strong>{section}</strong> is AI-generated analysis, not verified data
      </span>
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// 7. VERIFIED FIELD WRAPPER â€” Wraps any value display with provenance info
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

interface VerifiedFieldDisplayProps {
  fieldName: string;
  value: React.ReactNode;
  provenance: DataProvenance;
  showSource?: boolean;
  className?: string;
}

export const VerifiedFieldDisplay: React.FC<VerifiedFieldDisplayProps> = ({
  fieldName,
  value,
  provenance,
  showSource = true,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <ProvenanceTooltip fieldName={fieldName} provenance={provenance}>
        {value}
      </ProvenanceTooltip>
      {showSource && (
        <div className="mt-0.5">
          <SourceTag provenance={provenance} showUrl />
        </div>
      )}
    </div>
  );
};

export default {
  VerifiedBadge,
  SourceTag,
  ProvenanceTooltip,
  DataSourcesPanel,
  VerifiedCompanyBanner,
  AIGeneratedWarning,
  VerifiedFieldDisplay,
};
