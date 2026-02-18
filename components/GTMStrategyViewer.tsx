import React, { useState } from "react";
import type {
  LivingPlaybook,
  CustomerPersona,
  CompetitorEntry,
  MarketReport,
  ScenarioModel,
  ScenarioProjection,
  EntryStrategy,
} from "@/data/gtmModels";

type TabKey = "segmentation" | "competitive" | "reports" | "scenarios" | "validation";

interface GTMStrategyViewerProps {
  playbook: LivingPlaybook;
}

const TAB_CONFIG: { key: TabKey; icon: string; label: string }[] = [
  { key: "segmentation", icon: "🎯", label: "Customer Segmentation" },
  { key: "competitive", icon: "🔍", label: "Competitive Tracker" },
  { key: "reports", icon: "📊", label: "Market Reports" },
  { key: "scenarios", icon: "🧪", label: "Scenario Modeling" },
  { key: "validation", icon: "🛡️", label: "Validation & Trust" },
];

const STRATEGY_LABELS: Record<string, string> = {
  direct_sales: "🎯 Bán hàng trực tiếp",
  channel_partner: "🤝 Kênh đối tác",
  online_marketplace: "🌐 Thị trường trực tuyến",
  licensing: "📜 Cấp phép",
  joint_venture: "🏢 Liên doanh",
  acquisition: "📊 Thâu tóm",
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
    <div className="bg-gray-900 text-white rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* ═══ PLAYBOOK HEADER ═══ */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-800 to-gray-900 p-6 border-b border-gray-700/50">
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
            <p className="text-gray-400 mt-1">
              {company.industry} • {company.size} • Est. {company.founded}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Feasibility</div>
            <div className={`text-4xl font-black ${
              feasibilityScore >= 80 ? "text-emerald-400" : feasibilityScore >= 60 ? "text-amber-400" : "text-red-400"
            }`}>
              {feasibilityScore}
              <span className="text-lg text-gray-500">/100</span>
            </div>
          </div>
        </div>

        {/* Strategy metrics cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard label="Chiến lược" value={STRATEGY_LABELS[rec.recommendedStrategy] || rec.recommendedStrategy} color="text-white" small />
          <MetricCard label="ROI dự kiến" value={`${rec.estimatedROI}%`} color="text-emerald-400" />
          <MetricCard label="Time to Market" value={`${rec.timeToMarket} tháng`} color="text-blue-400" />
          <MetricCard label="Đầu tư" value={`$${rec.requiredInvestment}M`} color="text-amber-400" />
          <MetricCard label="Thị trường" value={rec.targetMarket} color="text-purple-400" />
        </div>

        {/* Feasibility bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                feasibilityScore >= 80 ? "bg-emerald-500" : feasibilityScore >= 60 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${feasibilityScore}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {feasibilityScore >= 80
              ? "✅ Tính khả thi cao — Tiến hành triển khai"
              : feasibilityScore >= 60
              ? "⚠️ Khả thi trung bình — Cần giải quyết rủi ro chính"
              : "❌ Rủi ro cao — Cân nhắc phương án thay thế"}
          </p>
        </div>
      </div>

      {/* ═══ SWOT MINI STRIP ═══ */}
      <div className="grid grid-cols-4 border-b border-gray-700/50">
        <SWOTMiniCell icon="💪" label="Điểm mạnh" items={swot.strengths} color="text-emerald-400" bg="bg-emerald-500/5" />
        <SWOTMiniCell icon="⚠️" label="Điểm yếu" items={swot.weaknesses} color="text-red-400" bg="bg-red-500/5" />
        <SWOTMiniCell icon="🚀" label="Cơ hội" items={swot.opportunities} color="text-blue-400" bg="bg-blue-500/5" />
        <SWOTMiniCell icon="⚡" label="Đe dọa" items={swot.threats} color="text-amber-400" bg="bg-amber-500/5" />
      </div>

      {/* ═══ TABS ═══ */}
      <div className="border-b border-gray-700/50 px-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-red-500 text-white bg-red-500/5"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
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
      </div>

      {/* ═══ NEXT STEPS FOOTER ═══ */}
      <div className="border-t border-gray-700/50 p-6 bg-gray-800/30">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Các bước tiếp theo
        </h3>
        <div className="grid md:grid-cols-2 gap-2">
          {playbook.nextSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
              <span className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xs font-bold shrink-0">
                {idx + 1}
              </span>
              <span className="text-gray-300 text-sm">{step}</span>
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
    <div className="bg-gray-800/50 backdrop-blur rounded-lg p-3 border border-gray-700/30">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`${small ? "text-sm" : "text-xl"} font-bold ${color}`}>{value}</p>
    </div>
  );
}

function SWOTMiniCell({ icon, label, items, color, bg }: { icon: string; label: string; items: string[]; color: string; bg: string }) {
  return (
    <div className={`p-4 ${bg} border-r border-gray-700/30 last:border-r-0`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
        <span className="text-gray-600 text-xs">({items.length})</span>
      </div>
      <ul className="space-y-1">
        {items.slice(0, 2).map((item, i) => (
          <li key={i} className="text-gray-400 text-xs truncate">• {item}</li>
        ))}
        {items.length > 2 && (
          <li className="text-gray-600 text-xs">+{items.length - 2} more</li>
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
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-400 text-sm">Total Addressable Market</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{data.totalAddressableMarket}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-400 text-sm">Serviceable Available Market</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{data.serviceableMarket}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-400 text-sm">Target Market Share</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{data.targetMarketShare}%</p>
        </div>
      </div>

      {/* ICP Summary */}
      <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Ideal Customer Profile</h4>
        <p className="text-gray-300">{data.icpSummary}</p>
      </div>

      {/* Segment Breakdown */}
      {data.segmentBreakdown && data.segmentBreakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Phân khúc thị trường</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {data.segmentBreakdown.map((seg, i) => (
              <div key={i} className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold capitalize">{seg.segment.replace(/_/g, " ")}</span>
                  <span className="text-sm text-gray-400">{seg.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-1.5 mb-2">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${seg.percentage}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
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
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Personas</h4>
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
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="text-white font-semibold">{persona.name}</h5>
          <p className="text-gray-400 text-sm">{persona.role} • {persona.industry}</p>
        </div>
        <span className={`px-2 py-1 rounded-lg text-sm font-bold border ${scoreColor}`}>
          {persona.matchScore}%
        </span>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-500">Company Size:</span>
          <span className="text-gray-300 ml-2">{persona.companySize}</span>
        </div>
        <div>
          <span className="text-gray-500">Budget:</span>
          <span className="text-gray-300 ml-2">{persona.budget}</span>
        </div>
        <div>
          <span className="text-gray-500">Pain Points:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {persona.painPoints.map((p, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">{p}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Goals:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {persona.goals.map((g, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">{g}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Buying Behavior:</span>
          <span className="text-gray-300 ml-2">{persona.buyingBehavior}</span>
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
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
          <p className="text-gray-400 text-sm mb-1">Vị thế thị trường</p>
          <p className="text-xl font-bold text-white capitalize">{data.marketPosition.replace(/_/g, " ")}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
          <p className="text-gray-400 text-sm mb-1">Đối thủ theo dõi</p>
          <p className="text-xl font-bold text-blue-400">{data.competitors.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/30">
          <p className="text-gray-400 text-sm mb-1">Lần cập nhật</p>
          <p className="text-sm font-semibold text-gray-300">{data.lastUpdated}</p>
        </div>
      </div>

      {/* Differentiators */}
      <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Lợi thế cạnh tranh</h4>
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
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Thị phần</h4>
          <div className="space-y-2">
            {data.marketShareChart.map((entry, i) => (
              <div key={i} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white font-medium">{entry.company}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-bold">{entry.share}%</span>
                    <span className={`text-xs ${
                      entry.trend === "up" ? "text-emerald-400" : entry.trend === "down" ? "text-red-400" : "text-gray-500"
                    }`}>
                      {entry.trend === "up" ? "▲" : entry.trend === "down" ? "▼" : "—"}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${i === 0 ? "bg-red-500" : "bg-gray-500"}`}
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
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Chi tiết đối thủ</h4>
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
    <div className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/30">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h5 className="text-white font-semibold text-lg">{competitor.name}</h5>
          <p className="text-gray-400 text-sm">{competitor.positioning} • Market share: {competitor.marketShare}%</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border uppercase ${threatColors[competitor.threatLevel]}`}>
          {competitor.threatLevel} threat
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <p className="text-emerald-400 text-xs font-semibold mb-1.5">Điểm mạnh</p>
          <ul className="space-y-1">
            {competitor.strengths.map((s, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-1.5">
                <span className="text-emerald-500">+</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-red-400 text-xs font-semibold mb-1.5">Điểm yếu</p>
          <ul className="space-y-1">
            {competitor.weaknesses.map((w, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-1.5">
                <span className="text-red-500">−</span>{w}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-blue-400 text-xs font-semibold mb-1.5">Động thái gần đây</p>
          <ul className="space-y-1">
            {competitor.recentMoves.map((m, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-1.5">
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
        <div key={report.id} className="bg-gray-800/40 rounded-xl border border-gray-700/30 overflow-hidden">
          {/* Report header */}
          <div className="p-5 border-b border-gray-700/30">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-white font-semibold text-lg">{report.topic}</h4>
                <p className="text-gray-400 text-sm mt-1">{report.summary}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <div className={`text-2xl font-bold ${
                  report.confidence >= 85 ? "text-emerald-400" : report.confidence >= 70 ? "text-amber-400" : "text-red-400"
                }`}>
                  {report.confidence}%
                </div>
                <div className="text-gray-500 text-xs">Confidence</div>
              </div>
            </div>

            <div className="flex gap-4 mt-3">
              <div className="text-sm">
                <span className="text-gray-500">Quy mô: </span>
                <span className="text-white font-semibold">{report.marketSize}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Tăng trưởng: </span>
                <span className="text-emerald-400 font-semibold">{report.growthRate}</span>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="p-5 border-b border-gray-700/30">
            <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Phát hiện chính</h5>
            <ul className="space-y-1.5">
              {report.keyFindings.map((f, i) => (
                <li key={i} className="text-gray-300 text-sm flex gap-2">
                  <span className="text-red-400 shrink-0">◆</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Trends */}
          {report.trends && report.trends.length > 0 && (
            <div className="p-5 border-b border-gray-700/30">
              <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Xu hướng thị trường</h5>
              <div className="grid md:grid-cols-2 gap-2">
                {report.trends.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2.5">
                    <span className={`text-lg ${
                      t.impact === "positive" ? "text-emerald-400" : t.impact === "negative" ? "text-red-400" : "text-gray-400"
                    }`}>
                      {t.impact === "positive" ? "↑" : t.impact === "negative" ? "↓" : "→"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 text-sm truncate">{t.trend}</p>
                      <p className="text-gray-500 text-xs">{t.timeframe}</p>
                    </div>
                    <span className="text-xs text-gray-500">{t.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources */}
          <div className="p-5 bg-gray-800/20">
            <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Nguồn dữ liệu</h5>
            <div className="flex flex-wrap gap-2">
              {report.dataSources.map((src, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                    src.reliability >= 90
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : src.reliability >= 75
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-gray-700/50 border-gray-600 text-gray-400"
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
        <div key={scenario.id} className="bg-gray-800/40 rounded-xl border border-gray-700/30 overflow-hidden">
          <div className="p-5 border-b border-gray-700/30">
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
                  <p className="text-gray-400 text-sm capitalize">{scenario.type.replace(/_/g, " ")} • {scenario.timeHorizon}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Probability</div>
                  <div className={`text-xl font-bold ${
                    scenario.probability >= 70 ? "text-emerald-400" : scenario.probability >= 40 ? "text-amber-400" : "text-red-400"
                  }`}>{scenario.probability}%</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                  scenario.impact === "high" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  scenario.impact === "medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}>
                  {scenario.impact} impact
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">{scenario.description}</p>
          </div>

          {/* Assumptions */}
          <div className="p-5 border-b border-gray-700/30">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Giả định</h5>
            <div className="flex flex-wrap gap-2">
              {scenario.assumptions.map((a, i) => (
                <span key={i} className="px-2.5 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-xs">{a}</span>
              ))}
            </div>
          </div>

          {/* Projections */}
          <div className="p-5 border-b border-gray-700/30">
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dự báo kịch bản</h5>
            <div className="space-y-3">
              {scenario.projections.map((proj, i) => (
                <ProjectionBar key={i} projection={proj} />
              ))}
            </div>
          </div>

          {/* Actions & Risks */}
          <div className="grid md:grid-cols-2">
            <div className="p-5 border-r border-gray-700/30">
              <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Hành động đề xuất</h5>
              <ul className="space-y-1.5">
                {scenario.recommendedActions.map((a, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-emerald-500">→</span>{a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-5">
              <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Rủi ro</h5>
              <ul className="space-y-1.5">
                {scenario.risks.map((r, i) => (
                  <li key={i} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-red-500">⚠</span>{r}
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
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-300 font-medium">{projection.metric}</span>
        <span className="text-gray-500">{projection.unit}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-400 w-20">Lạc quan</span>
          <div className="flex-1 bg-gray-700/50 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pctOpt}%` }} />
          </div>
          <span className="text-xs text-gray-300 w-16 text-right">{projection.optimistic.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-blue-400 w-20">Cơ sở</span>
          <div className="flex-1 bg-gray-700/50 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pctBase}%` }} />
          </div>
          <span className="text-xs text-gray-300 w-16 text-right">{projection.baseline.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400 w-20">Bi quan</span>
          <div className="flex-1 bg-gray-700/50 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${pctPes}%` }} />
          </div>
          <span className="text-xs text-gray-300 w-16 text-right">{projection.pessimistic.toLocaleString()}</span>
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
      <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700/30">
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Giá trị chiến lược</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-400">{metrics.timeToInsight}</div>
            <div className="text-gray-400 text-sm">Tốc độ phân tích</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-emerald-400">{metrics.dataAccuracy}%</div>
            <div className="text-gray-400 text-sm">Độ chính xác</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-violet-400">{metrics.costSavings}%</div>
            <div className="text-gray-400 text-sm">Tiết kiệm chi phí</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-amber-400">{metrics.decisionsImproved}</div>
            <div className="text-gray-400 text-sm">Quyết định cải thiện</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-red-400">{metrics.sourcesAnalyzed}</div>
            <div className="text-gray-400 text-sm">Nguồn phân tích</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-cyan-400">{metrics.reportsCached}</div>
            <div className="text-gray-400 text-sm">Báo cáo đã cache</div>
          </div>
        </div>
      </div>

      {/* Validation Sources */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Nguồn xác minh — "One Source of Truth"</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {sources.map((src, i) => (
            <div key={i} className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${
                src.type === "government" ? "bg-red-500/20 text-red-400" :
                src.type === "academic" ? "bg-blue-500/20 text-blue-400" :
                src.type === "industry" ? "bg-amber-500/20 text-amber-400" :
                src.type === "expert" ? "bg-violet-500/20 text-violet-400" :
                "bg-gray-700 text-gray-400"
              }`}>
                {src.country === "Vietnam" ? "🇻🇳" : "🌍"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{src.source}</p>
                <p className="text-gray-500 text-xs capitalize">{src.type} • {src.dataPoints} data points</p>
              </div>
              <div className={`text-sm font-bold ${
                src.confidence >= 90 ? "text-emerald-400" : src.confidence >= 75 ? "text-amber-400" : "text-red-400"
              }`}>
                {src.confidence}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expert Call Logs */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Expert Call Logs</h4>
        <div className="space-y-3">
          {callLogs.map((log) => (
            <div key={log.id} className="bg-gray-800/40 rounded-xl p-5 border border-gray-700/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="text-white font-semibold">{log.expert}</h5>
                  <p className="text-gray-400 text-sm">{log.title} — {log.organization}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">{log.date}</p>
                  <p className="text-gray-500 text-xs">{log.duration}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-400 text-xs font-semibold mb-1.5">Key Insights</p>
                  <ul className="space-y-1">
                    {log.keyInsights.map((ins, i) => (
                      <li key={i} className="text-gray-300 text-sm flex gap-1.5">
                        <span className="text-blue-500">💡</span>{ins}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-emerald-400 text-xs font-semibold mb-1.5">Action Items</p>
                  <ul className="space-y-1">
                    {log.actionItems.map((act, i) => (
                      <li key={i} className="text-gray-300 text-sm flex gap-1.5">
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

export default GTMStrategyViewer;
