/**
 * Market & Industry Intelligence Page
 * 
 * Displays comprehensive market reports combining:
 * - Macro-economic indicators from World Bank
 * - Industry-specific trade data
 * - Financial metrics and growth leaders
 * - Exclusive VICO database insights
 * 
 * This replaces AI-generated data with real, authentic information
 */

'use client';

import { useState, useEffect } from 'react';
import MarketIndustryDashboard from '@/components/MarketIndustryDashboard';
import CrossIndustryScreener from '@/components/CrossIndustryScreener';
import CompaniesDataService from '@/services/companiesDataService';

type ViewMode = 'industry' | 'screener';

export default function MarketIndustryPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('Technology');
  const [industries, setIndustries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('industry');

  useEffect(() => {
    // Get all available industries from database
    const service = CompaniesDataService.getInstance();
    const availableIndustries = service.getIndustries();
    setIndustries(availableIndustries);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading industries...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Market & Industry Intelligence Hub
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time market insights combining macro-economic data, industry reports, and exclusive VICO database analysis
          </p>

          {/* View Toggle */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setView('industry')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                view === 'industry'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Industry Deep-Dive
            </button>
            <button
              onClick={() => setView('screener')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                view === 'screener'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Cross-Industry Screener
            </button>
          </div>
        </div>

        {view === 'screener' ? (
          <CrossIndustryScreener />
        ) : (
          <>
            {/* Industry Selector */}
            <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Industry</h2>
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedIndustry === ind
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Report Dashboard */}
            <MarketIndustryDashboard industry={selectedIndustry} />

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📚 About This Data</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  <strong>VICO Database:</strong> 3,802+ Vietnamese companies analyzed in real-time
                </li>
                <li>
                  <strong>Macro-Economy:</strong> World Bank Open Data API (real economic indicators)
                </li>
                <li>
                  <strong>Industry Data:</strong> Tổng cục Hải quan & Industry Associations
                </li>
                <li>
                  <strong>Financial Metrics:</strong> Based on publicly available company data
                </li>
              </ul>
              <p className="text-xs text-blue-700 mt-3 italic">
                All data is 100% real, sourced from official databases and public APIs. No AI-generated content or synthetic estimates.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
