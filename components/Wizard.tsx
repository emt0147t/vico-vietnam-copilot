
import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';
import { Logo, ExpertCard, NoteCard, Badge, EnterpriseInput } from './VicoUI';
import { 
  Check, Rocket, Loader2, Building2, Briefcase, Mail, Globe, 
  ArrowLeft, BarChart3, Shield, Zap, Info, ChevronRight, Search, 
  Plus, Target, RefreshCw, AlertTriangle
} from 'lucide-react';
import { RagService } from '../services/ragLayer';
import { loadFromDB } from '../utils/db';
import { COMPANIES } from '../data/companies';

interface WizardProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

const STEPS = [
  "Thông tin cá nhân",
  "Tổ chức của bạn",
  "Tùy chỉnh phân tích",
  "Đối thủ cạnh tranh",
  "Hoàn tất thiết lập"
];

const Stepper = ({ currentStep }: { currentStep: number }) => (
  <div className="w-full bg-transparent mb-16">
    <div className="flex justify-between items-center relative py-4 border-b border-gray-100 dark:border-gray-800">
      {STEPS.map((step, i) => (
        <div key={i} className="flex-1 flex flex-col items-center relative">
          <span className={`text-[10px] md:text-[11px] font-bold text-center px-2 transition-all duration-300 uppercase tracking-wider ${i === currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            {step}
          </span>
          {i === currentStep && (
            <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#B91C1C] rounded-full animate-fade-in shadow-[0_1px_4px_rgba(185,28,28,0.3)]"></div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const SuggestionInput = ({ label, value, onChange, placeholder, suggestions = [], onSelectSuggestion, icon }: any) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    return (
      <div className="w-full relative">
          <EnterpriseInput 
              label={label}
              value={value}
              onChange={(e: any) => {
                onChange(e);
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder={placeholder}
              icon={icon}
              autoComplete="off"
          />
           
           {showSuggestions && suggestions.length > 0 && (
             <div className="absolute z-[100] left-0 right-0 top-[calc(100%+8px)] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden p-1.5 animate-fade-in">
                {suggestions.map((s: any, i: number) => (
                  <button 
                    key={i} 
                    onMouseDown={(e) => { e.preventDefault(); onSelectSuggestion(s); setShowSuggestions(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-[#B91C1C]"><Building2 size={18} /></div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{s.industry}</div>
                    </div>
                  </button>
                ))}
             </div>
           )}
      </div>
    );
};

export function Wizard({ onComplete, onBack }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState("");
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<any[]>([]);
  const [isSearchingCompetitors, setIsSearchingCompetitors] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false); // Loading intro state
  const [dbEmpty, setDbEmpty] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const features = [
      { icon: Zap, title: "Radar Thị Trường", desc: "Theo dõi biến động đối thủ theo thời gian thực trên toàn Việt Nam." },
      { icon: BarChart3, title: "AI Phân Tích", desc: "Động cơ tư duy sâu được hiệu chỉnh cho các sắc thái thị trường địa phương." },
      { icon: Shield, title: "Bảo Mật Doanh Nghiệp", desc: "Mã hóa cấp quân đội cho dữ liệu chiến lược của bạn." }
  ];

  useEffect(() => {
    let cancelled = false;
    const checkDB = async () => {
        const docs = await loadFromDB('vectors');
        if (cancelled) return;
        setDbEmpty(docs.length === 0);
        if (docs.length === 0) {
            await RagService.autoSeed(() => {});
        }
    };
    checkDB();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        setActiveFeatureIndex((prev) => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [features.length]);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', jobTitle: '',
    orgName: '', orgWebsite: '', orgSize: '251-1000', hqCountry: 'Vietnam',
    companyDescription: '', productsServices: '',
    competitors: [] as any[],
  });

  const [orgSuggestions, setOrgSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (formData.orgName.length > 1) {
      debounceRef.current = setTimeout(() => {
        fetchOrgSuggestions(formData.orgName);
      }, 300);
    } else { 
      setOrgSuggestions([]);
    }
  }, [formData.orgName]);

  const fetchOrgSuggestions = useCallback(async (query: string) => {
    try {
      const url = `/api/companies/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.companies && Array.isArray(data.companies) && data.companies.length > 0) {
        setOrgSuggestions(data.companies.slice(0, 5));
      } else {
        const filtered = COMPANIES.filter(c => c.name?.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
        setOrgSuggestions(filtered);
      }
    } catch {
      const filtered = COMPANIES.filter(c => c.name?.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      setOrgSuggestions(filtered);
    }
  }, []);

  const handleSelectOrg = (company: any) => {
    // Ưu tiên dữ liệu "mới" từ CSV nếu có, nếu không dùng dữ liệu cũ
    const description = company.intro_new || company.intro || company.giới_thiệu_mới || '';
    const products = company.products_new || company.products || company.sản_phẩm_dịch_vụ_mới || '';
    
    setFormData({ 
      ...formData, 
      orgName: company.name, 
      orgWebsite: company.website || '', 
      orgSize: company.size || '1001+', 
      companyDescription: description,
      productsServices: products
    });
    setOrgSuggestions([]);
  };

  const nextStep = () => { if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(c => c - 1); };

  const handleAnalyzeAndNext = async () => {
      setIsAnalyzing(true);
      const phases = ["Hiệu chỉnh Vector...", "Quét các Node địa phương...", "Phân tích động lực ngành...", "Hoàn tất thiết lập..."];
      for (const p of phases) { 
        setAnalysisPhase(p); 
        await new Promise(r => setTimeout(r, 600)); 
      }
      setIsAnalyzing(false);
      nextStep();
  };

  const findRivalsAndNext = async () => {
    setIsSearchingCompetitors(true);
    try {
        let results = [];

        // 🆕 NEW: Use Unified Competitor Engine API with source=all
        // This searches from BOTH companies.csv (10,000+) AND companies.ts (12 top companies)
        // Returns competitors with highest similarity scores
        try {
          const searchQuery = formData.orgName || formData.companyDescription || formData.productsServices;
          const response = await fetch(
            `/api/companies/competitors?company=${encodeURIComponent(searchQuery)}&limit=15&minSimilarity=25&source=all`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.competitors && data.competitors.length > 0) {
              results = data.competitors.map((c: any) => ({
                name: c.name,
                intro: c.about || '',
                products: c.matchReasons?.join(', ') || '',
                industry: c.industry,
                similarity: c.similarity,
                matchReasons: c.matchReasons,
                breakdown: c.breakdown,
                source: c.source
              }));
            }
          }
        } catch {
          // API failed, will use fallback below
        }

        if (results.length < 3) {
          results = COMPANIES.slice(0, 12).map(c => ({
            name: c.name,
            intro: c.intro,
            products: c.products,
            industry: c.industry,
            similarity: 40,
          }));
        }

        // Hiển thị results (đã deduplicated + sorted)
        setSuggestedCompetitors(
          results.map((r: any) => ({ 
            ...r, 
            selected: r.similarity > 50, // Auto-select cao điểm
            similarity: r.similarity || 45
          }))
        );
        
    } catch (e) {
        // Fallback cuối cùng
        setSuggestedCompetitors(
          COMPANIES.slice(0, 8).map(c => ({
            name: c.name,
            intro: c.intro,
            products: c.products,
            similarity: 40,
            selected: false
          }))
        );
    } finally {
        setIsSearchingCompetitors(false);
        nextStep();
    }
  };

  const toggleCompetitor = (name: string) => {
    setSuggestedCompetitors(prev => prev.map(c => 
        c.name === name ? { ...c, selected: !c.selected } : c
    ));
  };

  const finalizeAndComplete = () => {
    setIsLaunching(true);
    const timer = setTimeout(() => {
      const selected = suggestedCompetitors.filter(c => c.selected);
      onComplete({ ...formData, competitors: selected });
    }, 2500);
    timersRef.current.push(timer);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B101B] flex font-sans transition-colors duration-300">
      
      {/* 🚀 LOADING INTRO OVERLAY */}
      {isLaunching && (
        <div className="fixed inset-0 z-[200] bg-[#0B101B] flex items-center justify-center">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B91C1C]/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse delay-300"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[80px] animate-pulse delay-500"></div>
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:40px_40px]"></div>
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 text-center space-y-8 animate-fade-in">
            {/* Logo Animation */}
            <div className="relative mx-auto w-32 h-32">
              {/* Outer ring spinning */}
              <div className="absolute inset-0 rounded-full border-2 border-[#B91C1C]/30 animate-spin" style={{ animationDuration: '3s' }}></div>
              {/* Middle ring spinning reverse */}
              <div className="absolute inset-3 rounded-full border-2 border-dashed border-[#B91C1C]/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              {/* Inner solid circle */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#B91C1C] to-red-700 flex items-center justify-center shadow-2xl shadow-red-900/50">
                <span className="text-white font-black text-2xl">V</span>
              </div>
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-full bg-[#B91C1C]/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
            </div>
            
            {/* Text Content */}
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                Đang khởi động
              </h2>
              <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">
                Đang chuẩn bị phòng tác chiến cho <span className="text-[#B91C1C] font-bold">{formData.orgName}</span>
              </p>
            </div>
            
            {/* Loading Progress */}
            <div className="space-y-4 w-64 mx-auto">
              {/* Progress bar */}
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#B91C1C] to-red-500 rounded-full animate-loading-bar"></div>
              </div>
              
              {/* Loading steps */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="w-4 h-4 rounded-full bg-[#B91C1C] flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                  <span>Nạp dữ liệu thị trường</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="w-4 h-4 rounded-full bg-[#B91C1C] flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                  <span>Phân tích đối thủ cạnh tranh</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 animate-fade-in" style={{ animationDelay: '1s' }}>
                  <Loader2 size={14} className="text-[#B91C1C] animate-spin" />
                  <span>Khởi tạo AI Engine...</span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] pt-4">
              VICO Intelligence • Powered by AI
            </p>
          </div>
        </div>
      )}
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[42%] relative flex-col justify-between p-16 xl:p-24 overflow-hidden border-r border-gray-100 dark:border-gray-800 bg-[#FDFCFB] dark:bg-[#0D121F]">
          <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 dark:opacity-10"></div>
               <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#B91C1C]/5 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10">
              <Logo />
              <div className="mt-32 space-y-8 animate-fade-in">
                <h1 className="text-5xl xl:text-6xl font-black text-gray-900 dark:text-white leading-[1.05] tracking-tighter">
                    Nâng tầm <br/>
                    <span className="text-[#B91C1C]">Trí tuệ số.</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-sm leading-relaxed font-medium">
                    Thiết lập phòng tác chiến chiến lược với động cơ AI độc quyền của VICO.
                </p>
              </div>
          </div>

          <div className="relative z-10 mt-auto">
             <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] max-w-sm shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B91C1C]"></div>
                  {features.map((feat, idx) => (
                      <div key={idx} className={`transition-all duration-700 absolute inset-0 p-8 flex items-start gap-5 ${idx === activeFeatureIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 text-[#B91C1C]">
                              <feat.icon size={24} />
                          </div>
                          <div>
                              <h3 className="font-black text-gray-900 dark:text-white text-base mb-1.5 uppercase tracking-tight">{feat.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{feat.desc}</p>
                          </div>
                      </div>
                  ))}
                  <div className="opacity-0 flex items-start gap-5 pointer-events-none p-2">
                       <div className="w-12 h-12"></div>
                       <div><h3 className="text-base mb-1.5">Spacer</h3><p className="text-sm">Long text line for spacing purposes only.</p></div>
                  </div>
             </div>
             
             <div className="mt-12 text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.4em]">
                 VICO INTEL • SYSTEM READY
             </div>
          </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[58%] flex flex-col items-center bg-white dark:bg-[#0B101B] overflow-y-auto custom-scrollbar">
          
          <div className="w-full max-w-[540px] px-8 py-16">
            
            <Stepper currentStep={currentStep} />

            <div className="mb-14 text-center lg:text-left animate-fade-in">
                <h1 className="text-[34px] font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                    {currentStep === 0 && (formData.firstName ? `${formData.firstName}, hãy bắt đầu nhé...` : "Một chút về bạn...")}
                    {currentStep === 1 && "Thông tin về tổ chức của bạn..."}
                    {currentStep === 2 && "Tùy chỉnh phân tích chiến lược..."}
                    {currentStep === 3 && "Xác định các đối thủ..."}
                    {currentStep === 4 && "Khởi chạy hệ thống..."}
                </h1>
                <p className="text-gray-500 text-[15px] mt-4 font-medium leading-relaxed">
                    Giúp VICO hiệu chỉnh mô hình trí tuệ phù hợp với bối cảnh chuyên môn của bạn.
                </p>
            </div>

            <div className="space-y-6 animate-slide-up">
                {currentStep === 0 && (
                    <>
                        <div className="grid grid-cols-2 gap-5">
                            <EnterpriseInput label="Họ" value={formData.firstName} onChange={(e:any)=>setFormData({...formData, firstName: e.target.value})} placeholder="Nguyễn" />
                            <EnterpriseInput label="Tên" value={formData.lastName} onChange={(e:any)=>setFormData({...formData, lastName: e.target.value})} placeholder="An" />
                        </div>
                        <EnterpriseInput label="Chức vụ" value={formData.jobTitle} onChange={(e:any)=>setFormData({...formData, jobTitle: e.target.value})} placeholder="Ví dụ: Giám đốc chiến lược" icon={Briefcase} />
                        <EnterpriseInput label="Email công việc" value={formData.email} onChange={(e:any)=>setFormData({...formData, email: e.target.value})} placeholder="an.nguyen@vico.vn" icon={Mail} />
                        
                        <div className="pt-10">
                            <button onClick={nextStep} disabled={!formData.firstName.trim() || !formData.email.trim()} className="w-full py-5 bg-[#B91C1C] hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-900/20 transition-all text-sm transform active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed">
                                Tiếp tục <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={onBack} className="w-full mt-6 text-[10px] font-black text-gray-300 hover:text-gray-600 dark:hover:text-white flex items-center justify-center gap-2 transition-colors uppercase tracking-[0.3em]">
                                <ArrowLeft size={14} /> Trở lại trang chủ
                            </button>
                        </div>
                    </>
                )}

                {currentStep === 1 && (
                    <>
                        <SuggestionInput label="Tên tổ chức" value={formData.orgName} onChange={(e:any)=>setFormData({...formData, orgName: e.target.value})} suggestions={orgSuggestions} onSelectSuggestion={handleSelectOrg} placeholder="Ví dụ: VinFast Auto" icon={Building2} />
                        <EnterpriseInput label="Website tổ chức" value={formData.orgWebsite} onChange={(e:any)=>setFormData({...formData, orgWebsite: e.target.value})} placeholder="vico.vn" icon={Globe} />
                        
                        <div className="grid grid-cols-2 gap-5">
                            <div className="relative border rounded-xl bg-white dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 p-3 px-4 h-[64px] hover:border-gray-300 transition-all group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1 leading-none group-hover:text-gray-500">Quy mô</label>
                                <select value={formData.orgSize} onChange={(e:any)=>setFormData({...formData, orgSize: e.target.value})} className="w-full bg-transparent border-none text-[15px] font-bold p-0 focus:ring-0 outline-none appearance-none cursor-pointer dark:text-white [&>option]:bg-white [&>option]:dark:bg-gray-900 [&>option]:dark:text-white [&>option]:py-2">
                                    {["1-50", "51-250", "251-1000", "1001+"].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div className="relative border rounded-xl bg-white dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 p-3 px-4 h-[64px] hover:border-gray-300 transition-all group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1 leading-none group-hover:text-gray-500">Quốc gia HQ</label>
                                <select value={formData.hqCountry} onChange={(e:any)=>setFormData({...formData, hqCountry: e.target.value})} className="w-full bg-transparent border-none text-[15px] font-bold p-0 focus:ring-0 outline-none appearance-none cursor-pointer dark:text-white [&>option]:bg-white [&>option]:dark:bg-gray-900 [&>option]:dark:text-white [&>option]:py-2">
                                    {["Vietnam", "United States", "Singapore", "Japan", "Germany"].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="pt-10">
                            <button onClick={handleAnalyzeAndNext} disabled={isAnalyzing} className="w-full py-5 bg-[#B91C1C] hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl flex items-center justify-center gap-4 transition-all transform active:scale-[0.98]">
                                {isAnalyzing ? <><Loader2 size={22} className="animate-spin" /> {analysisPhase}</> : <>Khởi tạo Intelligence Scan <ChevronRight size={18}/></>}
                            </button>
                            <button onClick={prevStep} className="w-full mt-6 text-[10px] font-black text-gray-300 hover:text-gray-600 flex items-center justify-center gap-2 transition-colors uppercase tracking-[0.3em]">
                                <ArrowLeft size={14} /> Quay lại bước trước
                            </button>
                        </div>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        {dbEmpty && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-4 mb-8">
                                <div className="p-2 bg-blue-500 text-white rounded-lg shadow-lg">
                                    <Info size={20} />
                                </div>
                                <div className="text-xs text-blue-900 dark:text-blue-200 font-bold uppercase tracking-tight">
                                    Kho tri thức đang trống. VICO sẽ sử dụng dữ liệu thị trường trực tuyến để phân tích.
                                </div>
                            </div>
                        )}
                        <div className="space-y-8">
                            <EnterpriseInput 
                                label="Bối cảnh chiến lược"
                                value={formData.companyDescription}
                                onChange={(e: any) => setFormData({...formData, companyDescription: e.target.value})}
                                placeholder="Mô tả lĩnh vực chiến lược bạn muốn phân tích..."
                                multiline
                            />
                            <EnterpriseInput 
                                label="Sản phẩm & Dịch vụ"
                                value={formData.productsServices}
                                onChange={(e: any) => setFormData({...formData, productsServices: e.target.value})}
                                placeholder="Liệt kê các sản phẩm hoặc dịch vụ trọng tâm..."
                                multiline
                            />
                        </div>
                        <div className="pt-10">
                            <button onClick={findRivalsAndNext} disabled={isSearchingCompetitors} className="w-full py-5 bg-[#B91C1C] hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl flex items-center justify-center gap-3">
                                {isSearchingCompetitors ? <><Loader2 size={20} className="animate-spin"/> Đang quét thị trường...</> : <>Tìm kiếm đối thủ ngành <ChevronRight size={18} /></>}
                            </button>
                            <button onClick={prevStep} className="w-full mt-6 text-[10px] font-black text-gray-300 hover:text-gray-600 flex items-center justify-center gap-2 transition-colors uppercase tracking-[0.3em]">
                                <ArrowLeft size={14} /> Quay lại bước trước
                            </button>
                        </div>
                    </>
                )}

                {currentStep === 3 && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
                                Đối thủ được phát hiện ({suggestedCompetitors.length})
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-black text-[#B91C1C] uppercase cursor-pointer hover:opacity-70" onClick={findRivalsAndNext}>
                                <RefreshCw size={12} className={isSearchingCompetitors ? "animate-spin" : ""} /> Quét lại
                            </div>
                        </div>
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {suggestedCompetitors.length > 0 ? suggestedCompetitors.map((comp, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => toggleCompetitor(comp.name)}
                                    className={`w-full p-5 border rounded-xl flex items-start gap-4 transition-all group ${comp.selected ? 'bg-red-50/20 border-[#B91C1C] shadow-lg' : 'bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-gray-300'}`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-black transition-colors text-xs ${comp.selected ? 'bg-[#B91C1C] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                        {comp.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-xs font-black text-gray-900 dark:text-white truncate">{comp.name}</div>
                                            <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap ${comp.similarity >= 70 ? 'bg-green-100 text-green-700' : comp.similarity >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {comp.similarity}% match
                                            </div>
                                        </div>
                                        {comp.products && comp.products !== 'N/A' && (
                                            <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                                📦 {comp.products.substring(0, 80)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${comp.selected ? 'bg-[#B91C1C]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        {comp.selected && <Check size={12} className="text-white" />}
                                    </div>
                                </button>
                            )) : (
                                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                    <Target className="mx-auto text-gray-200 mb-3" size={40} />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tìm kiếm...</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-8">
                            <button onClick={nextStep} className="w-full py-5 bg-[#B91C1C] hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl">Chốt phương án chiến lược <ChevronRight size={18} className="inline ml-2"/></button>
                            <button onClick={prevStep} className="w-full mt-6 text-[10px] font-black text-gray-300 hover:text-gray-600 flex items-center justify-center gap-2 transition-colors uppercase tracking-[0.3em]">
                                <ArrowLeft size={14} /> Quay lại bước trước
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="text-center space-y-10 py-6 animate-fade-in">
                        <div className="w-28 h-28 bg-red-50 dark:bg-red-900/10 rounded-[3rem] flex items-center justify-center mx-auto text-[#B91C1C] shadow-inner border border-red-100 dark:border-red-900/20">
                            <Rocket size={54} className="animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Sẵn sàng xuất kích</h2>
                            <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-xs mx-auto">
                                Phòng tác chiến của bạn đã được hiệu chỉnh cho <span className="text-[#B91C1C] font-bold">{formData.orgName || "tổ chức của bạn"}</span>.
                            </p>
                        </div>
                        <button onClick={finalizeAndComplete} className="w-full py-6 bg-[#B91C1C] hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] rounded-3xl shadow-2xl transition-all hover:-translate-y-1 transform active:scale-95 text-lg shadow-red-900/20">
                            Mở phòng tác chiến
                        </button>
                    </div>
                )}
            </div>
            
            <footer className="mt-24 text-center">
                <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em]">
                    © 2025 VICO INTEL • VIETNAM STRATEGIC COPILOT
                </p>
            </footer>
          </div>
      </div>
    </div>
  );
}
