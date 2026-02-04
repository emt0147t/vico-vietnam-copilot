import React, { useState } from "react";
import { GTMStrategy, GTMRecommendation, EntryStrategy } from "@/data/gtmModels";

interface GTMStrategyViewerProps {
  recommendation: GTMRecommendation;
  strategy?: GTMStrategy;
  onGenerate?: () => void;
}

/**
 * GTM Strategy Builder Component
 * Displays Go-To-Market recommendations and strategies
 */
export const GTMStrategyViewer: React.FC<GTMStrategyViewerProps> = ({
  recommendation,
  strategy,
  onGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "swot" | "plan" | "timeline">(
    "overview"
  );

  const strategyLabels: Record<EntryStrategy, string> = {
    [EntryStrategy.DIRECT_SALES]: "🎯 Bán hàng trực tiếp",
    [EntryStrategy.CHANNEL_PARTNER]: "🤝 Kênh đối tác",
    [EntryStrategy.ONLINE_MARKETPLACE]: "🌐 Thị trường trực tuyến",
    [EntryStrategy.LICENSING]: "📜 Cấp phép",
    [EntryStrategy.JOINT_VENTURE]: "🏢 Liên doanh",
    [EntryStrategy.ACQUISITION]: "📊 Thâu tóm",
  };

  const getFeasibilityScore = () => {
    const factors = {
      roi: (recommendation.estimatedROI / 200) * 30,
      timeToMarket: Math.max(0, 30 - recommendation.timeToMarket * 2),
      investment: Math.max(0, 40 - recommendation.requiredInvestment * 5),
    };
    return Math.round(
      Math.min(100, factors.roi + factors.timeToMarket + factors.investment)
    );
  };

  const feasibilityScore = getFeasibilityScore();
  const feasibilityColor =
    feasibilityScore >= 80
      ? "text-green-600"
      : feasibilityScore >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-6">
        <h2 className="text-3xl font-bold mb-2">{recommendation.companyName}</h2>
        <p className="text-gray-400 mb-4">GTM Strategy for {recommendation.targetMarket}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Recommended Strategy</p>
            <p className="text-xl font-bold mt-2">
              {strategyLabels[recommendation.recommendedStrategy]}
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Estimated ROI</p>
            <p className="text-2xl font-bold text-green-500 mt-2">
              {recommendation.estimatedROI}%
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Time to Market</p>
            <p className="text-2xl font-bold text-blue-500 mt-2">
              {recommendation.timeToMarket} months
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Investment Required</p>
            <p className="text-2xl font-bold text-yellow-500 mt-2">
              ${recommendation.requiredInvestment}M
            </p>
          </div>
        </div>

        {/* Feasibility Score */}
        <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Market Entry Feasibility</h3>
            <span className={`text-4xl font-bold ${feasibilityColor}`}>
              {feasibilityScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                feasibilityScore >= 80
                  ? "bg-green-500"
                  : feasibilityScore >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${feasibilityScore}%` }}
            ></div>
          </div>
          <p className="text-gray-300 mt-3 text-sm">
            {feasibilityScore >= 80
              ? "✅ Highly feasible - Proceed with strategy"
              : feasibilityScore >= 60
              ? "⚠️ Moderately feasible - Address key risks"
              : "❌ High risk - Consider alternatives"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        {(["overview", "swot", "plan", "timeline"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 font-semibold border-b-2 transition-colors ${
              activeTab === tab
                ? "border-red-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab === "overview"
              ? "📋 Tổng quan"
              : tab === "swot"
              ? "🎯 SWOT"
              : tab === "plan"
              ? "📊 Kế hoạch"
              : "📅 Timeline"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-3">Giải pháp chiến lược</h3>
            <p className="text-gray-300">{recommendation.rationale}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Các bước tiếp theo</h3>
              <ol className="space-y-2">
                {recommendation.nextSteps.map((step, idx) => (
                  <li key={idx} className="text-gray-300 flex gap-3">
                    <span className="text-red-500 font-bold">{idx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-3">📈 Chỉ số chính</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-400">ROI dự kiến:</span>
                  <span className="font-bold text-green-400">
                    {recommendation.estimatedROI}%
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Thời gian triển khai:</span>
                  <span className="font-bold text-blue-400">
                    {recommendation.timeToMarket} tháng
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-400">Đầu tư cần thiết:</span>
                  <span className="font-bold text-yellow-400">
                    ${recommendation.requiredInvestment}M
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SWOT Tab */}
      {activeTab === "swot" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-900 bg-opacity-30 border border-green-500 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-green-400 mb-3">💪 Điểm mạnh</h3>
            <ul className="space-y-2">
              {recommendation.strengths.map((s, idx) => (
                <li key={idx} className="text-gray-300 flex gap-2">
                  <span className="text-green-400">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-900 bg-opacity-30 border border-red-500 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-red-400 mb-3">⚠️ Điểm yếu</h3>
            <ul className="space-y-2">
              {recommendation.weaknesses.map((w, idx) => (
                <li key={idx} className="text-gray-300 flex gap-2">
                  <span className="text-red-400">✗</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-900 bg-opacity-30 border border-blue-500 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-blue-400 mb-3">🚀 Cơ hội</h3>
            <ul className="space-y-2">
              {recommendation.opportunities.map((o, idx) => (
                <li key={idx} className="text-gray-300 flex gap-2">
                  <span className="text-blue-400">◆</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">⚡ Đe dọa</h3>
            <ul className="space-y-2">
              {recommendation.threats.map((t, idx) => (
                <li key={idx} className="text-gray-300 flex gap-2">
                  <span className="text-yellow-400">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Plan Tab */}
      {activeTab === "plan" && (
        <div className="space-y-4">
          {strategy && (
            <>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-3">🎯 Marketing Plan</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Budget:</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${strategy.go_to_market.marketingStrategy.budget.toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Channels:</p>
                    <p className="font-semibold">
                      {strategy.go_to_market.marketingStrategy.channels.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-bold mb-3">💼 Sales Plan</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Sales Model:</p>
                    <p className="font-semibold">{strategy.go_to_market.salesStrategy.salesModel}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Team Size:</p>
                    <p className="font-semibold">
                      {strategy.go_to_market.salesStrategy.teamSize} people
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Annual Quota:</p>
                    <p className="font-semibold">
                      ${(strategy.go_to_market.salesStrategy.quota / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          {strategy?.timeline.map((milestone, idx) => (
            <div key={idx} className="bg-gray-800 p-6 rounded-lg border-l-4 border-red-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">Phase {milestone.phase}: {milestone.name}</h3>
                  <p className="text-gray-400 text-sm">
                    Month {milestone.startMonth} - {milestone.endMonth}
                  </p>
                </div>
                <span className="text-lg font-bold text-yellow-400">
                  ${(milestone.budget / 1000000).toFixed(1)}M
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-2">Objectives:</p>
                <ul className="space-y-1">
                  {milestone.objectives.map((obj, i) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2">
                      <span className="text-red-400">→</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Button */}
      {!strategy && onGenerate && (
        <button
          onClick={onGenerate}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          💼 Build Full GTM Strategy
        </button>
      )}
    </div>
  );
};

export default GTMStrategyViewer;
