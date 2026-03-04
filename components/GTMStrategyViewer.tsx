import React, { useState } from "react";
import type {
  LivingPlaybook,
  CustomerPersona,
  CompetitorEntry,
  MarketReport,
  ScenarioModel,
  ScenarioProjection,
} from "@/data/gtmModels";

type TabKey = "segmentation" | "competitive" | "reports" | "scenarios" | "validation" | "swot";

interface GTMStrategyViewerProps {
  playbook: LivingPlaybook;
}

const TAB_CONFIG: { key: TabKey; icon: string; label: string }[] = [
  { key: "segmentation", icon: "◎", label: "Customer Segmentation" },
  { key: "competitive", icon: "◉", label: "Competitive Tracker" },
  { key: "reports", icon: "▣", label: "Market Reports" },
  { key: "scenarios", icon: "◇", label: "Scenario Modeling" },
  { key: "swot", icon: "○", label: "SWOT Analysis" },
  { key: "validation", icon: "□", label: "Validation & Trust" },
];

const STRATEGY_LABELS: Record<string, string> = {
  direct_sales: "Direct Sales",
  channel_partner: "Channel Partners",
  online_marketplace: "Online Marketplace",
  licensing: "Licensing",
  joint_venture: "Joint Venture",
  acquisition: "Acquisition",
};

/**
 * GTM Strategy Viewer — Global Copilot Edition
 * Living Playbook with 4 Feature Modules + Validation & Trust
 */
export const GTMStrategyViewer: React.FC<GTMStrategyViewerProps> = ({ playbook }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("segmentation");

  const rec = playbook.gtmRecommendation;
  const swot = playbook.swotAnalysis;
  const company = playbook.company;

  // Feasibility score
  const getFeasibilityScore = () => {
    const factors = {
      roi: (rec.estimatedROI / 200) * 30,
      timeToMarket: Math.max(0, 30 - rec.timeToMarket * 2),
      investment: Math.max(0, 40 - rec.requiredInvestment * 5),
    };
    return Math.round(Math.min(100, factors.roi + factors.timeToMarket + factors.investment));
  };

  const feasibilityScore = getFeasibilityScore();

  return (
    <div className="bg-white text-[#18181B] rounded-2xl border border-[#E4E4E7] overflow-hidden">
      {/* ═══ PLAYBOOK HEADER ═══ */}
      <div className="bg-gradient-to-r from-gray-100 via-white to-gray-50 p-6 border-b border-[#E4E4E7]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 text-xs font-semibold">
                LIVING PLAYBOOK v{playbook.version}
              </span>
              <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400 text-xs font-semibold capitalize">
                {playbook.status}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">{company.name}</h2>
            <p className="text-[#A1A1AA] mt-1">
              {company.industry} • {company.size} • Est. {company.founded}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#A1A1AA]">Feasibility</div>
            <div className={`text-4xl font-black ${feasibilityScore >= 80 ? "text-emerald-400" : feasibilityScore >= 60 ? "text-amber-400" : "text-red-400"
              }`}>
              {feasibilityScore}
              <span className="text-lg text-[#71717A]">/100</span>
            </div>
          </div>
        </div>

        {/* Strategy metrics cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard label="Strategy" value={STRATEGY_LABELS[rec.recommendedStrategy] || rec.recommendedStrategy} color="text-white" small />
          <MetricCard label="Estimated ROI" value={`${rec.estimatedROI}%`} color="text-emerald-400" />
          <MetricCard label="Time to Market" value={`${rec.timeToMarket} months`} color="text-blue-400" />
          <MetricCard label="Investment" value={`$${rec.requiredInvestment}M`} color="text-amber-400" />
          <MetricCard label="Market" value={rec.targetMarket} color="text-purple-400" />
        </div>

        {/* Feasibility bar */}
        <div className="mt-4">
          <div className="w-full bg-[#A1A1AA]/50 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${feasibilityScore >= 80 ? "bg-emerald-500" : feasibilityScore >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}
              style={{ width: `${feasibilityScore}%` }}
            />
          </div>
          <p className="text-[#71717A] text-xs mt-1">
            {feasibilityScore >= 80
              ? "High feasibility — Proceed with implementation"
              : feasibilityScore >= 60
                ? "Medium feasibility — Must address key risks"
                : "High risk — Consider alternative approaches"}
          </p>
        </div>
      </div>

      {/* ═══ SWOT MINI STRIP ═══ */}
      <div className="grid grid-cols-4 border-b border-[#E4E4E7]/50">
        <SWOTMiniCell icon="S" label="Strengths" items={swot.strengths} color="text-emerald-400" bg="bg-emerald-500/5" />
        <SWOTMiniCell icon="W" label="Weaknesses" items={swot.weaknesses} color="text-red-400" bg="bg-red-500/5" />
        <SWOTMiniCell icon="O" label="Opportunities" items={swot.opportunities} color="text-blue-400" bg="bg-blue-500/5" />
        <SWOTMiniCell icon="T" label="Threats" items={swot.threats} color="text-amber-400" bg="bg-amber-500/5" />
      </div>

      {/* ═══ TABS ═══ */}
      <div className="border-b border-[#E4E4E7] px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key
                ? "border-red-500 text-red-600 bg-red-100"
                : "border-transparent text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5]"
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <div className="p-6">
        {activeTab === "segmentation" && <SegmentationTab data={playbook.customerSegmentation} />}
        {activeTab === "competitive" && <CompetitiveTab data={playbook.competitiveTracker} />}
        {activeTab === "reports" && <ReportsTab data={playbook.marketReports} />}
        {activeTab === "scenarios" && <ScenariosTab data={playbook.scenarioModels} />}
        {activeTab === "validation" && (
          <ValidationTab
            sources={playbook.validationSources}
            callLogs={playbook.expertCallLogs}
            metrics={playbook.strategicMetrics}
          />
        )}
        {activeTab === "swot" && <SWOTTab data={playbook.swotAnalysis} />}
      </div>

      {/* ═══ NEXT STEPS FOOTER ═══ */}
      <div className="border-t border-[#E4E4E7] p-6 bg-[#F4F4F5]">
        <h3 className="text-sm font-semibold text-[#71717A] uppercase tracking-wider mb-3">
          Next Steps
        </h3>
        <div className="grid md:grid-cols-2 gap-2">
          {playbook.nextSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-[#E4E4E7]">
              <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="text-[#18181B] text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function MetricCard({ label, value, color, small }: { label: string; value: string; color: string; small?: boolean }) {
  return (
    <div className="bg-white backdrop-blur rounded-lg p-3 border border-[#E4E4E7]">
      <p className="text-[#71717A] text-xs mb-1">{label}</p>
      <p className={`${small ? "text-sm" : "text-xl"} font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SWOTMiniCell({ icon, label, items, color, bg }: { icon: string; label: string; items: string[]; color: string; bg: string }) {
  return (
    <div className={`p-4 ${bg} border-r border-[#E4E4E7] last:border-r-0`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
        <span className="text-[#71717A] text-xs">({items.length})</span>
      </div>
      <ul className="space-y-1">
        {items.slice(0, 2).map((item, i) => (
          <li key={i} className="text-[#71717A] text-xs truncate">• {item}</li>
        ))}
        {items.length > 2 && (
          <li className="text-[#71717A] text-xs">+{items.length - 2} more</li>
        )}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1: SMART CUSTOMER SEGMENTATION
   ═══════════════════════════════════════════════════════════ */
function SegmentationTab({ data }: { data: LivingPlaybook["customerSegmentation"] }) {
  return (
    <div className="space-y-6">
      {/* TAM/SAM/SOM */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#E4E4E7]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-[#71717A] text-sm">Total Addressable Market</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{data.totalAddressableMarket}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E4E7]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[#71717A] text-sm">Serviceable Available Market</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{data.serviceableMarket}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#E4E4E7]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[#71717A] text-sm">Target Market Share</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{data.targetMarketShare}%</p>
        </div>
      </div>

      {/* ICP Summary */}
      <div className="bg-gradient-to-r from-red-100 to-transparent border border-red-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2">Ideal Customer Profile</h4>
        <p className="text-[#18181B]">{data.icpSummary}</p>
      </div>

      {/* Segment Breakdown */}
      {data.segmentBreakdown && data.segmentBreakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Market Segments</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {data.segmentBreakdown.map((seg, i) => (
              <div key={i} className="bg-[#F4F4F5]/40 rounded-lg p-4 border border-[#E4E4E7]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold capitalize">{seg.segment.replace(/_/g, " ")}</span>
                  <span className="text-sm text-[#A1A1AA]">{seg.percentage}%</span>
                </div>
                <div className="w-full bg-[#A1A1AA]/50 rounded-full h-1.5 mb-2">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${seg.percentage}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-[#A1A1AA]">
                  <div>Revenue: <span className="text-white">{seg.revenue}</span></div>
                  <div>Count: <span className="text-white">{seg.count}</span></div>
                  <div>Avg Deal: <span className="text-white">{seg.avgDealSize}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Personas */}
      <div>
        <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Customer Personas</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {data.personas.map((p) => (
            <PersonaCard key={p.id} persona={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonaCard({ persona }: { persona: CustomerPersona }) {
  const scoreColor =
    persona.matchScore >= 80
      ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/30"
      : persona.matchScore >= 60
        ? "text-amber-400 bg-amber-500/20 border-amber-500/30"
        : "text-red-400 bg-red-500/20 border-red-500/30";

  return (
    <div className="bg-[#F4F4F5]/50 rounded-xl p-5 border border-[#E4E4E7]/30 hover:border-[#E4E4E7] transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="text-white font-semibold">{persona.name}</h5>
          <p className="text-[#A1A1AA] text-sm">{persona.role} • {persona.industry}</p>
        </div>
        <span className={`px-2 py-1 rounded-lg text-sm font-bold border ${scoreColor}`}>
          {persona.matchScore}%
        </span>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-[#71717A]">Company Size:</span>
          <span className="text-[#A1A1AA] ml-2">{persona.companySize}</span>
        </div>
        <div>
          <span className="text-[#71717A]">Budget:</span>
          <span className="text-[#A1A1AA] ml-2">{persona.budget}</span>
        </div>
        <div>
          <span className="text-[#71717A]">Pain Points:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {persona.painPoints.map((p, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">{p}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[#71717A]">Goals:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {persona.goals.map((g, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">{g}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[#71717A]">Buying Behavior:</span>
          <span className="text-[#A1A1AA] ml-2">{persona.buyingBehavior}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2: COMPETITIVE LANDSCAPE TRACKER
   ═══════════════════════════════════════════════════════════ */
function CompetitiveTab({ data }: { data: LivingPlaybook["competitiveTracker"] }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#F4F4F5]/50 rounded-xl p-5 border border-[#E4E4E7]/30">
          <p className="text-[#A1A1AA] text-sm mb-1">Market Position</p>
          <p className="text-xl font-bold text-white capitalize">{data.marketPosition.replace(/_/g, " ")}</p>
        </div>
        <div className="bg-[#F4F4F5]/50 rounded-xl p-5 border border-[#E4E4E7]/30">
          <p className="text-[#A1A1AA] text-sm mb-1">Tracked Competitors</p>
          <p className="text-xl font-bold text-blue-400">{data.competitors.length}</p>
        </div>
        <div className="bg-[#F4F4F5]/50 rounded-xl p-5 border border-[#E4E4E7]/30">
          <p className="text-[#A1A1AA] text-sm mb-1">Last Updated</p>
          <p className="text-sm font-semibold text-[#A1A1AA]">{data.lastUpdated}</p>
        </div>
      </div>

      {/* Differentiators */}
      <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Competitive Advantages</h4>
        <div className="flex flex-wrap gap-2">
          {data.competitiveAdvantages.map((adv, i) => (
            <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-sm">
              ✦ {adv}
            </span>
          ))}
        </div>
      </div>

      {/* Market Share */}
      {data.marketShareChart && data.marketShareChart.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Market Share</h4>
          <div className="space-y-2">
            {data.marketShareChart.map((entry, i) => (
              <div key={i} className="bg-[#F4F4F5]/40 rounded-lg p-3 border border-[#E4E4E7]/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white font-medium">{entry.company}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#A1A1AA] font-bold">{entry.share}%</span>
                    <span className={`text-xs ${entry.trend === "up" ? "text-emerald-400" : entry.trend === "down" ? "text-red-400" : "text-[#71717A]"
                      }`}>
                      {entry.trend === "up" ? "▲" : entry.trend === "down" ? "▼" : "—"}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-[#A1A1AA]/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${i === 0 ? "bg-red-500" : "bg-[#FAFAFA]"}`}
                    style={{ width: `${Math.min(entry.share * 2, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Cards */}
      <div>
        <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Competitor Details</h4>
        <div className="space-y-4">
          {data.competitors.map((comp, i) => (
            <CompetitorCard key={i} competitor={comp} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompetitorCard({ competitor }: { competitor: CompetitorEntry }) {
  const threatColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="bg-[#F4F4F5]/40 rounded-xl p-5 border border-[#E4E4E7]/30">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h5 className="text-white font-semibold text-lg">{competitor.name}</h5>
          <p className="text-[#A1A1AA] text-sm">{competitor.positioning} • Market share: {competitor.marketShare}%</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border uppercase ${threatColors[competitor.threatLevel]}`}>
          {competitor.threatLevel} threat
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <p className="text-emerald-400 text-xs font-semibold mb-1.5">Strengths</p>
          <ul className="space-y-1">
            {competitor.strengths.map((s, i) => (
              <li key={i} className="text-[#A1A1AA] text-sm flex gap-1.5">
                <span className="text-emerald-500">+</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-red-400 text-xs font-semibold mb-1.5">Weaknesses</p>
          <ul className="space-y-1">
            {competitor.weaknesses.map((w, i) => (
              <li key={i} className="text-[#A1A1AA] text-sm flex gap-1.5">
                <span className="text-red-500">−</span>{w}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-blue-400 text-xs font-semibold mb-1.5">Recent Moves</p>
          <ul className="space-y-1">
            {competitor.recentMoves.map((m, i) => (
              <li key={i} className="text-[#A1A1AA] text-sm flex gap-1.5">
                <span className="text-blue-500">→</span>{m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 3: INSTANT MARKET REPORTS
   ═══════════════════════════════════════════════════════════ */
function ReportsTab({ data }: { data: MarketReport[] }) {
  return (
    <div className="space-y-6">
      {data.map((report) => (
        <div key={report.id} className="bg-[#F4F4F5]/40 rounded-xl border border-[#E4E4E7]/30 overflow-hidden">
          {/* Report header */}
          <div className="p-5 border-b border-[#E4E4E7]/30">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-semibold text-lg">{report.topic}</h4>
                <p className="text-[#A1A1AA] text-sm mt-1">{report.summary}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className={`text-2xl font-bold ${report.confidence >= 85 ? "text-emerald-400" : report.confidence >= 70 ? "text-amber-400" : "text-red-400"
                  }`}>
                  {report.confidence}%
                </div>
                <div className="text-[#71717A] text-xs">Confidence</div>
              </div>
            </div>

            <div className="flex gap-4 mt-3">
              <div className="text-sm">
                <span className="text-[#71717A]">Size: </span>
                <span className="text-white font-semibold">{report.marketSize}</span>
              </div>
              <div className="text-sm">
                <span className="text-[#71717A]">Growth: </span>
                <span className="text-emerald-400 font-semibold">{report.growthRate}</span>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="p-5 border-b border-[#E4E4E7]/30">
            <h5 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Key Findings</h5>
            <ul className="space-y-1.5">
              {report.keyFindings.map((f, i) => (
                <li key={i} className="text-[#A1A1AA] text-sm flex gap-2">
                  <span className="text-red-400 shrink-0">◆</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Trends */}
          {report.trends && report.trends.length > 0 && (
            <div className="p-5 border-b border-[#E4E4E7]/30">
              <h5 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Market Trends</h5>
              <div className="grid md:grid-cols-2 gap-2">
                {report.trends.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#F4F4F5]/50 rounded-lg p-2.5">
                    <span className={`text-lg ${t.impact === "positive" ? "text-emerald-400" : t.impact === "negative" ? "text-red-400" : "text-[#A1A1AA]"
                      }`}>
                      {t.impact === "positive" ? "↑" : t.impact === "negative" ? "↓" : "→"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#A1A1AA] text-sm truncate">{t.trend}</p>
                      <p className="text-[#71717A] text-xs">{t.timeframe}</p>
                    </div>
                    <span className="text-xs text-[#71717A]">{t.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources */}
          <div className="p-5 bg-[#F4F4F5]/20">
            <h5 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Data Sources</h5>
            <div className="flex flex-wrap gap-2">
              {report.dataSources.map((src, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${src.reliability >= 90
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : src.reliability >= 75
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-[#A1A1AA]/50 border-[#E4E4E7] text-[#A1A1AA]"
                    }`}
                >
                  {src.country === "Vietnam" ? "🇻🇳" : "🌍"} {src.name}
                  <span className="opacity-60">({src.reliability}%)</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 4: SCENARIO MODELING
   ═══════════════════════════════════════════════════════════ */
function ScenariosTab({ data }: { data: ScenarioModel[] }) {
  return (
    <div className="space-y-6">
      {data.map((scenario) => (
        <div key={scenario.id} className="bg-[#F4F4F5]/40 rounded-xl border border-[#E4E4E7]/30 overflow-hidden">
          <div className="p-5 border-b border-[#E4E4E7]/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {scenario.type === "market_entry" ? "🚀" :
                    scenario.type === "expansion" ? "📈" :
                      scenario.type === "diversification" ? "🔄" :
                        scenario.type === "merger_acquisition" ? "🤝" :
                          scenario.type === "digital_transformation" ? "💻" : "💰"}
                </span>
                <div>
                  <h4 className="text-white font-semibold">{scenario.name}</h4>
                  <p className="text-[#A1A1AA] text-sm capitalize">{scenario.type.replace(/_/g, " ")} • {scenario.timeHorizon}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-[#71717A]">Probability</div>
                  <div className={`text-xl font-bold ${scenario.probability >= 70 ? "text-emerald-400" : scenario.probability >= 40 ? "text-amber-400" : "text-red-400"
                    }`}>{scenario.probability}%</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${scenario.impact === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  scenario.impact === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}>
                  {scenario.impact} impact
                </span>
              </div>
            </div>
            <p className="text-[#A1A1AA] text-sm">{scenario.description}</p>
          </div>

          {/* Assumptions */}
          <div className="p-5 border-b border-[#E4E4E7]/30">
            <h5 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-2">Assumptions</h5>
            <div className="flex flex-wrap gap-2">
              {scenario.assumptions.map((a, i) => (
                <span key={i} className="px-2.5 py-1 bg-[#A1A1AA]/50 text-[#A1A1AA] rounded-lg text-xs">{a}</span>
              ))}
            </div>
          </div>

          {/* Projections */}
          <div className="p-5 border-b border-[#E4E4E7]/30">
            <h5 className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mb-3">Scenario Forecasts</h5>
            <div className="space-y-3">
              {scenario.projections.map((proj, i) => (
                <ProjectionBar key={i} projection={proj} />
              ))}
            </div>
          </div>

          {/* Actions & Risks */}
          <div className="grid md:grid-cols-2">
            <div className="p-5 border-r border-[#E4E4E7]/30">
              <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Recommended Actions</h5>
              <ul className="space-y-1.5">
                {scenario.recommendedActions.map((a, i) => (
                  <li key={i} className="text-[#A1A1AA] text-sm flex gap-2">
                    <span className="text-emerald-500">→</span>{a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5">
              <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Risks</h5>
              <ul className="space-y-1.5">
                {scenario.risks.map((r, i) => (
                  <li key={i} className="text-[#A1A1AA] text-sm flex gap-2">
                    <span className="text-red-500">•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectionBar({ projection }: { projection: ScenarioProjection }) {
  const max = Math.max(projection.optimistic, projection.pessimistic, projection.baseline);
  const pctBase = (projection.baseline / max) * 100;
  const pctOpt = (projection.optimistic / max) * 100;
  const pctPes = (projection.pessimistic / max) * 100;

  return (
    <div className="bg-[#F4F4F5]/50 rounded-lg p-3">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-[#A1A1AA] font-medium">{projection.metric}</span>
        <span className="text-[#71717A]">{projection.unit}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 w-20">Optimistic</span>
          <div className="flex-1 bg-[#A1A1AA]/50 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pctOpt}%` }} />
          </div>
          <span className="text-xs text-[#A1A1AA] w-16 text-right">{projection.optimistic.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-400 w-20">Baseline</span>
          <div className="flex-1 bg-[#A1A1AA]/50 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pctBase}%` }} />
          </div>
          <span className="text-xs text-[#A1A1AA] w-16 text-right">{projection.baseline.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400 w-20">Pessimistic</span>
          <div className="flex-1 bg-[#A1A1AA]/50 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${pctPes}%` }} />
          </div>
          <span className="text-xs text-[#A1A1AA] w-16 text-right">{projection.pessimistic.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 5: VALIDATION & TRUST
   ═══════════════════════════════════════════════════════════ */
function ValidationTab({
  sources,
  callLogs,
  metrics,
}: {
  sources: LivingPlaybook["validationSources"];
  callLogs: LivingPlaybook["expertCallLogs"];
  metrics: LivingPlaybook["strategicMetrics"];
}) {
  return (
    <div className="space-y-6">
      {/* Strategic Value Metrics */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-5 border border-[#E4E4E7]/30">
        <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-4">Strategic Value</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-400">{metrics.timeToInsight}</div>
            <div className="text-[#A1A1AA] text-sm">Analysis Speed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400">{metrics.dataAccuracy}%</div>
            <div className="text-[#A1A1AA] text-sm">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-[#F97316]">{metrics.costSavings}%</div>
            <div className="text-[#A1A1AA] text-sm">Cost Savings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-amber-400">{metrics.decisionsImproved}</div>
            <div className="text-[#A1A1AA] text-sm">Decision Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-red-400">{metrics.sourcesAnalyzed}</div>
            <div className="text-[#A1A1AA] text-sm">Analysis Sources</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-cyan-400">{metrics.reportsCached}</div>
            <div className="text-[#A1A1AA] text-sm">Cached Reports</div>
          </div>
        </div>
      </div>

      {/* Validation Sources */}
      <div>
        <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Verification Sources — "One Source of Truth"</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {sources.map((src, i) => (
            <div key={i} className="bg-[#F4F4F5]/40 rounded-lg p-4 border border-[#E4E4E7]/30 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${src.type === "government" ? "bg-red-500/20 text-red-400" :
                src.type === "academic" ? "bg-blue-500/20 text-blue-400" :
                  src.type === "industry" ? "bg-amber-500/20 text-amber-400" :
                    src.type === "expert" ? "bg-[#F97316]/20 text-[#F97316]" :
                      "bg-[#A1A1AA] text-[#A1A1AA]"
                }`}>
                {src.country === "Vietnam" ? "VN" : "○"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{src.source}</p>
                <p className="text-[#71717A] text-xs capitalize">{src.type} • {src.dataPoints} data points</p>
              </div>
              <div className={`text-sm font-bold ${src.confidence >= 90 ? "text-emerald-400" : src.confidence >= 75 ? "text-amber-400" : "text-red-400"
                }`}>
                {src.confidence}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expert Call Logs */}
      <div>
        <h4 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Expert Call Logs</h4>
        <div className="space-y-3">
          {callLogs.map((log) => (
            <div key={log.id} className="bg-[#F4F4F5]/40 rounded-xl p-5 border border-[#E4E4E7]/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-white font-semibold">{log.expert}</h5>
                  <p className="text-[#A1A1AA] text-sm">{log.title} — {log.organization}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#A1A1AA] text-sm">{log.date}</p>
                  <p className="text-[#71717A] text-xs">{log.duration}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-400 text-xs font-semibold mb-1.5">Key Insights</p>
                  <ul className="space-y-1">
                    {log.keyInsights.map((ins, i) => (
                      <li key={i} className="text-[#A1A1AA] text-sm flex gap-1.5">
                        <span className="text-blue-500">•</span>{ins}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-emerald-400 text-xs font-semibold mb-1.5">Action Items</p>
                  <ul className="space-y-1">
                    {log.actionItems.map((act, i) => (
                      <li key={i} className="text-[#A1A1AA] text-sm flex gap-1.5">
                        <span className="text-emerald-500">✓</span>{act}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 6: SWOT ANALYSIS (2×2 Grid)
   ═══════════════════════════════════════════════════════════ */
function SWOTTab({ data }: { data: LivingPlaybook["swotAnalysis"] }) {
  const quadrants = [
    {
      title: "Strengths",
      titleVi: "Strengths",
      icon: "S",
      items: data.strengths,
      gradient: "from-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-500/30",
      badge: "bg-emerald-500/20 text-emerald-400",
      dot: "bg-emerald-500",
    },
    {
      title: "Weaknesses",
      titleVi: "Weaknesses",
      icon: "W",
      items: data.weaknesses,
      gradient: "from-red-500/10 to-red-500/5",
      border: "border-red-500/30",
      badge: "bg-red-500/20 text-red-400",
      dot: "bg-red-500",
    },
    {
      title: "Opportunities",
      titleVi: "Opportunities",
      icon: "O",
      items: data.opportunities,
      gradient: "from-blue-500/10 to-blue-500/5",
      border: "border-blue-500/30",
      badge: "bg-blue-500/20 text-blue-400",
      dot: "bg-blue-500",
    },
    {
      title: "Threats",
      titleVi: "Threats",
      icon: "T",
      items: data.threats,
      gradient: "from-amber-500/10 to-amber-500/5",
      border: "border-amber-500/30",
      badge: "bg-amber-500/20 text-amber-400",
      dot: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-bold text-[#18181B]">SWOT Analysis</h3>
        <span className="px-2 py-0.5 bg-[#F4F4F5] text-[#71717A] text-xs rounded-full">
          {data.strengths.length + data.weaknesses.length + data.opportunities.length + data.threats.length} factors
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((q) => (
          <div
            key={q.title}
            className={`bg-gradient-to-br ${q.gradient} rounded-xl border ${q.border} p-5 transition-all hover:shadow-lg`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{q.icon}</span>
              <div>
                <h4 className="font-bold text-[#18181B] text-sm">{q.title}</h4>
                <p className="text-[#71717A] text-xs">{q.titleVi}</p>
              </div>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${q.badge}`}>
                {q.items.length}
              </span>
            </div>
            <ul className="space-y-2">
              {q.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 group">
                  <div className={`w-2 h-2 rounded-full ${q.dot} mt-1.5 shrink-0 group-hover:scale-125 transition-transform`} />
                  <span className="text-[#18181B] text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GTMStrategyViewer;
