import React, { useState, useEffect } from 'react';
import { Search, Filter, BarChart3 } from 'lucide-react';

interface Company {
  name: string;
  intro: string;
  address: string;
  year: number;
  size: string;
  products: string;
  customers: string;
  industry: 'Automotive' | 'Technology' | 'Education' | 'Retail' | 'Finance';
  website?: string;
  revenue: string;
  growth: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  logoUrl?: string;
}

export function CompanyBrowser() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, byIndustry: {} as Record<string, number> });

  const industries = ['Technology', 'Automotive', 'Education', 'Retail', 'Finance'];

  // Load initial data
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async (search = '', industry = '') => {
    setLoading(true);
    try {
      let url = '/api/companies';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (industry) params.append('industry', industry);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setCompanies(data.companies || []);
      
      // Calculate stats
      const byIndustry: Record<string, number> = {};
      data.companies?.forEach((c: Company) => {
        byIndustry[c.industry] = (byIndustry[c.industry] || 0) + 1;
      });
      
      setStats({ total: data.total || 0, byIndustry });
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCompanies(searchQuery, selectedIndustry);
  };

  const handleIndustryFilter = (industry: string) => {
    setSelectedIndustry(industry === selectedIndustry ? '' : industry);
    fetchCompanies(searchQuery, industry === selectedIndustry ? '' : industry);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-500" />
            Cơ Sở Dữ Liệu Công Ty
          </h1>
          <p className="text-slate-300">
            {stats.total.toLocaleString()} công ty từ file CSV enriched
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8 shadow-xl">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm công ty, sản phẩm, địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Industry Filter */}
          <div>
            <h3 className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Ngành
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => handleIndustryFilter(industry)}
                  className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
                    selectedIndustry === industry
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {industry}
                  {stats.byIndustry[industry] && (
                    <span className="ml-1 text-xs">({stats.byIndustry[industry]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Stats */}
        {searchQuery || selectedIndustry ? (
          <div className="bg-slate-700 rounded-lg p-4 mb-6 text-slate-300">
            Kết quả: <span className="font-bold text-white">{companies.length}</span> công ty
          </div>
        ) : null}

        {/* Companies List */}
        {loading ? (
          <div className="text-center text-slate-300 py-12">
            <div className="animate-spin text-blue-500 mb-3">⏳</div>
            Đang tải dữ liệu...
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center text-slate-300 py-12">
            Không tìm thấy công ty phù hợp
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company, idx) => (
              <div
                key={idx}
                className="bg-slate-800 rounded-lg p-5 hover:bg-slate-700 transition border border-slate-700 hover:border-blue-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{company.name}</h3>
                    <p className="text-slate-400 text-sm">{company.address}</p>
                  </div>
                  <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                    {company.industry}
                  </span>
                </div>

                <p className="text-slate-300 text-sm mb-3 line-clamp-2">{company.intro}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs">
                  <div>
                    <p className="text-slate-400">Năm thành lập</p>
                    <p className="text-white font-semibold">{company.year}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Quy mô</p>
                    <p className="text-white font-semibold">{company.size}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Doanh thu</p>
                    <p className="text-white font-semibold">{company.revenue}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Tăng trưởng</p>
                    <p className="text-green-400 font-semibold">{company.growth}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs mb-1">Sản phẩm/Dịch vụ:</p>
                  <p className="text-slate-200 text-sm line-clamp-1">{company.products}</p>
                </div>

                {company.website && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <a
                      href={`https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      {company.website} →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyBrowser;
