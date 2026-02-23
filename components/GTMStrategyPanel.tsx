import React, { useState, useCallback } from "react";
import { GTMStrategyViewer } from "./GTMStrategyViewer";
import type { LivingPlaybook } from "@/data/gtmModels";

interface GTMState {
  playbook: LivingPlaybook | null;
  loading: boolean;
  error: string | null;
  selectedCompany: string;
  loadingPhase: string;
}

const LOADING_PHASES = [
  "Phân tích hồ sơ doanh nghiệp...",
  "Xây dựng Customer Segmentation...",
  "Quét Competitive Landscape...",
  "Tạo Market Reports từ VICO Database...",
  "Chạy Scenario Modeling...",
  "Hoàn thiện Living Playbook...",
];

const VALUE_METRICS = [
  { label: "Phân tích AI", value: "✓", sub: "Gemini 2.0 Flash + VICO DB", color: "from-blue-500 to-cyan-400" },
  { label: "Dữ liệu thực", value: "10K+", sub: "công ty Việt Nam trong database", color: "from-emerald-500 to-green-400" },
  { label: "Minh bạch", value: "100%", sub: "nguồn dữ liệu rõ ràng", color: "from-violet-500 to-purple-400" },
  { label: "Nguồn dữ liệu", value: "2", sub: "VICO Database + Gemini AI", color: "from-amber-500 to-orange-400" },
];

const FEATURE_MODULES = [
  {
    icon: "🎯",
    title: "Smart Customer Segmentation",
    desc: "AI tự động phân tích ICP & persona khách hàng mục tiêu",
    features: ["Persona AI", "TAM/SAM/SOM", "Buying behavior", "Match scoring"],
  },
  {
    icon: "🔍",
    title: "Competitive Landscape Tracker",
    desc: "Theo dõi đối thủ real-time với threat scoring",
    features: ["Market share map", "Competitive matrix", "Recent moves", "Threat alerts"],
  },
  {
    icon: "📊",
    title: "Instant Market Reports",
    desc: "Báo cáo thị trường từ nguồn chính phủ & nghiên cứu VN",
    features: ["VICO Database", "Gemini AI", "Industry Analysis", "Trend Tracking"],
  },
  {
    icon: "🧪",
    title: "Scenario Modeling",
    desc: "Mô phỏng kịch bản thâm nhập & mở rộng thị trường",
    features: ["Market entry", "Pricing strategy", "M&A analysis", "Risk simulation"],
  },
];

export function GTMStrategyPanel() {
  const [state, setState] = useState<GTMState>({
    playbook: null,
    loading: false,
    error: null,
    selectedCompany: "",
    loadingPhase: "",
  });

  const [companies, setCompanies] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCompanySearch = useCallback(async (query: string) => {
    setState((prev) => ({ ...prev, selectedCompany: query }));

    if (query.length < 2) {
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/gtm/generate?company=${encodeURIComponent(query)}`);
      const data = await response.json();
      setCompanies(data.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  }, []);

  const handleSelectCompany = (company: string) => {
    setState((prev) => ({ ...prev, selectedCompany: company }));
    setShowSuggestions(false);
  };

  const handleGeneratePlaybook = async () => {
    if (!state.selectedCompany.trim()) return;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      playbook: null,
      loadingPhase: LOADING_PHASES[0],
    }));

    // Simulate loading phases
    let phaseIdx = 0;
    const phaseInterval = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, LOADING_PHASES.length - 1);
      setState((prev) => ({ ...prev, loadingPhase: LOADING_PHASES[phaseIdx] }));
    }, 800);

    try {
      const response = await fetch("/api/gtm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: state.selectedCompany,
          targetMarkets: ["Vietnam", "Southeast Asia"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setState((prev) => ({ ...prev, playbook: data }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    } finally {
      clearInterval(phaseInterval);
      setState((prev) => ({ ...prev, loading: false, loadingPhase: "" }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGeneratePlaybook();
  };

  return (
    <div className="space-y-6">
      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700/50 p-8">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }} />
        </div>

        <div className="relative z-10">
          {/* Top badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 rounded-full text-red-600 dark:text-red-400 text-xs font-semibold tracking-wider uppercase">
              Global Copilot
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-full text-blue-600 dark:text-blue-400 text-xs font-semibold tracking-wider uppercase">
              Living Playbook
            </span>
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wider uppercase">
              Vietnam Market
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Go-To-Market Intelligence
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mb-6">
            Living Playbook — Chiến lược thâm nhập thị trường được AI tạo động, không phải báo cáo tĩnh.
            Một nguồn sự thật duy nhất cho đội ngũ sales & strategy.
          </p>

          {/* Strategic Value Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VALUE_METRICS.map((m, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-800/60 backdrop-blur border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 text-center group hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm">
                <div className={`text-3xl font-black bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>
                  {m.value}
                </div>
                <div className="text-gray-900 dark:text-white text-sm font-semibold mt-1">{m.label}</div>
                <div className="text-gray-500 text-xs mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SEARCH & GENERATE ═══ */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            V
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold">Tạo Living Playbook</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nhập tên công ty để AI xây dựng chiến lược GTM toàn diện</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Vingroup, FPT Software, Techcombank, VietJet, Viettel..."
              value={state.selectedCompany}
              onChange={(e) => handleCompanySearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            />

            {showSuggestions && companies.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto">
                {companies.map((company, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectCompany(company)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white first:rounded-t-xl last:rounded-b-xl transition-colors flex items-center gap-3"
                  >
                    <span className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-sm">🏢</span>
                    {company}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGeneratePlaybook}
            disabled={state.loading || !state.selectedCompany.trim()}
            className={`px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              state.loading || !state.selectedCompany.trim()
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 active:scale-[0.98] shadow-lg shadow-red-500/25"
            }`}
          >
            {state.loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Tạo Playbook
              </>
            )}
          </button>
        </div>

        {/* Loading Phase Indicator */}
        {state.loading && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-b-blue-500 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">{state.loadingPhase}</p>
                <div className="flex gap-1 mt-2">
                  {LOADING_PHASES.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        LOADING_PHASES.indexOf(state.loadingPhase) >= i
                          ? "bg-red-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ERROR ═══ */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-300">Lỗi tạo Playbook</h3>
              <p className="text-red-600 dark:text-red-400/80 text-sm mt-1">{state.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LIVING PLAYBOOK VIEWER ═══ */}
      {state.playbook && <GTMStrategyViewer playbook={state.playbook} />}

      {/* ═══ EMPTY STATE — FEATURE MODULES ═══ */}
      {!state.loading && !state.playbook && !state.error && (
        <div className="space-y-6">
          {/* Feature modules grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURE_MODULES.map((module, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all group shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{module.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{module.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {module.features.map((f, j) => (
                        <span
                          key={j}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs rounded-md border border-gray-200 dark:border-gray-700"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data sources footer */}
          <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">Nguồn dữ liệu xác minh</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "VICO Company Database (10K+ companies)", flag: "🇻🇳" },
                { name: "Gemini 2.0 Flash AI Analysis", flag: "🤖" },
              ].map((src, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 text-xs"
                >
                  <span>{src.flag}</span>
                  {src.name}
                </span>
              ))}
            </div>
          </div>

          {/* Quick start */}
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">
              Bắt đầu bằng cách nhập tên công ty — ví dụ:{" "}
              {["Vingroup", "FPT Software", "Techcombank", "VietJet", "Viettel"].map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setState((prev) => ({ ...prev, selectedCompany: c }));
                  }}
                  className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors mx-1 underline underline-offset-2"
                >
                  {c}
                </button>
              ))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
