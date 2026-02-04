import React, { useState } from "react";
import { GTMStrategyViewer } from "./GTMStrategyViewer";
import type { GTMRecommendation } from "@/data/gtmModels";

interface GTMState {
  recommendation: GTMRecommendation | null;
  strategy: any | null;
  loading: boolean;
  error: string | null;
  selectedCompany: string;
}

export function GTMStrategyPanel() {
  const [state, setState] = useState<GTMState>({
    recommendation: null,
    strategy: null,
    loading: false,
    error: null,
    selectedCompany: "",
  });

  const [companies, setCompanies] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search companies as user types
  const handleCompanySearch = async (query: string) => {
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
  };

  const handleSelectCompany = (company: string) => {
    setState((prev) => ({ ...prev, selectedCompany: company }));
    setShowSuggestions(false);
  };

  const handleGenerateGTM = async () => {
    if (!state.selectedCompany.trim()) return;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      recommendation: null,
      strategy: null,
    }));

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
      setState((prev) => ({
        ...prev,
        recommendation: data.recommendation,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerateGTM();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🚀 Go-To-Market Intelligence
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Generate data-driven GTM strategies for Vietnamese companies
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Company Name
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a Vietnamese company (e.g., Vingroup, FPT Software, Techcombank)..."
                value={state.selectedCompany}
                onChange={(e) => handleCompanySearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && companies.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {companies.map((company, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCompany(company)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {company}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>

          <button
            onClick={handleGenerateGTM}
            disabled={state.loading || !state.selectedCompany.trim()}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              state.loading || !state.selectedCompany.trim()
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {state.loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Analyzing company and generating GTM strategy...
              </span>
            ) : (
              "Generate GTM Strategy 📊"
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">Error</h3>
              <p className="text-red-700 dark:text-red-400 text-sm">{state.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* GTM Strategy Viewer */}
      {state.recommendation && (
        <GTMStrategyViewer recommendation={state.recommendation} />
      )}

      {/* Empty State */}
      {!state.loading && !state.recommendation && !state.error && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No GTM Strategy Generated Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enter a company name above to generate a comprehensive Go-To-Market strategy based on:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            <li>✓ Company profile & industry</li>
            <li>✓ Market signals from news</li>
            <li>✓ Competitive landscape</li>
            <li>✓ Historical trends</li>
            <li>✓ Financial data</li>
            <li>✓ Growth opportunities</li>
          </ul>
          <div className="bg-white dark:bg-gray-800 rounded p-4 text-left text-xs text-gray-700 dark:text-gray-300">
            <p className="font-mono">
              Try: Vingroup • FPT Software • Techcombank • VietJet • Viettel
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
