import React, { useState } from 'react';
import { Play, Activity, Database, MessageSquare, X, CheckCircle2, ChevronDown, BarChart3, Sparkles, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { EnterpriseInput, Logo } from './VicoUI';

interface LandingPageProps {
  onStart: () => void;
  onLoginClick?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLoginClick }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');

  const handleDemoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDemoError('');
    setDemoLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      lastName: (formData.get('lastName') as string || '').trim(),
      firstName: (formData.get('firstName') as string || '').trim(),
      email: (formData.get('email') as string || '').trim(),
      jobTitle: (formData.get('jobTitle') as string || '').trim(),
      phone: (formData.get('phone') as string || '').trim(),
    };

    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setDemoError(data.error || 'Gửi thất bại. Vui lòng thử lại.');
        setDemoLoading(false);
        return;
      }

      setDemoSubmitted(true);
      setDemoLoading(false);
      setTimeout(() => {
        setShowDemoModal(false);
        setDemoSubmitted(false);
      }, 2500);
    } catch {
      setDemoError('Không thể kết nối server. Vui lòng thử lại sau.');
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B101B] text-[#1A1F2B] dark:text-white font-sans overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 max-w-7xl mx-auto w-full z-20 relative">
        <button onClick={() => window.location.reload()} aria-label="Về trang chủ VICO" className="bg-transparent border-none cursor-pointer">
           <Logo />
        </button>
        <div className="flex items-center gap-3 md:gap-6">
          <ThemeToggle />
          <button 
            onClick={onLoginClick}
            className="text-gray-600 dark:text-gray-300 hover:text-[#1A1F2B] dark:hover:text-white text-sm font-semibold transition-colors hidden sm:block"
            aria-label="Đăng nhập vào VICO"
          >
            Đăng nhập
          </button>
          <button 
            onClick={onStart}
            className="bg-[#B91C1C] hover:bg-[#991B1B] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_4px_12px_rgba(185,28,28,0.2)] hover:shadow-[0_6px_16px_rgba(185,28,28,0.3)]"
          >
            Bắt đầu
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center pt-16 md:pt-28 px-4 md:px-0 text-center w-full max-w-6xl mx-auto relative z-10">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-500/[0.03] dark:bg-red-900/[0.07] blur-[120px] rounded-full pointer-events-none -z-10" aria-hidden="true"></div>

        <h1 className="text-5xl md:text-[5.5rem] font-extrabold tracking-tighter mb-8 leading-[1] max-w-5xl text-[#1A1F2B] dark:text-white">
          VICO <span className="text-[#F15048]">Vietnam Copilot</span> <br className="hidden md:block" />
          <span className="text-4xl md:text-[4rem]">Market Intelligence</span>
        </h1>

        <p className="text-[#555E6D] dark:text-gray-400 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed font-medium">
          Nền tảng trí tuệ thị trường Việt Nam. Thu thập, phân tích và trực quan hóa dữ liệu thị trường phân mảnh trong tích tắc.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <button 
            onClick={onStart}
            className="bg-[#B91C1C] hover:bg-[#991B1B] text-white px-10 py-5 rounded-3xl text-xl font-extrabold transition-all shadow-[0_12px_24px_rgba(185,28,28,0.3)] hover:shadow-[0_16px_32px_rgba(185,28,28,0.4)] w-full sm:w-auto transform active:scale-95"
          >
            Khởi động VICO
          </button>
          <button 
            onClick={() => setShowDemoModal(true)}
            className="bg-white dark:bg-transparent border border-[#E5E7EB] dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 text-[#1A1F2B] dark:text-white px-10 py-5 rounded-3xl text-xl font-bold transition-all w-full sm:w-auto transform active:scale-95 shadow-sm"
          >
            Đặt lịch Demo
          </button>
        </div>
        
        <div className="flex flex-wrap gap-x-8 md:gap-x-12 gap-y-4 text-[#555E6D] dark:text-gray-400 text-sm md:text-base font-bold mb-16 md:mb-20 justify-center">
            <div className="flex items-center gap-2.5"><Database size={18} className="text-[#9CA3AF]"/> Thu thập dữ liệu</div>
            <div className="flex items-center gap-2.5"><Activity size={18} className="text-[#9CA3AF]"/> Phân tích thị trường</div>
            <div className="flex items-center gap-2.5"><MessageSquare size={18} className="text-[#9CA3AF]"/> AI Chat (RAG)</div>
            <div className="flex items-center gap-2.5"><BarChart3 size={18} className="text-[#9CA3AF]"/> Báo cáo chiến lược</div>
        </div>

        <div className="w-full max-w-5xl mx-auto perspective-2000 px-4 pb-20">
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.08)] transform rotate-x-12 origin-top border border-[#F3F4F6] dark:border-gray-800 relative overflow-hidden transition-colors duration-300">
                <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-10">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-[#F9FAFB] dark:bg-gray-800 border border-[#F3F4F6] dark:border-gray-700 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-left flex justify-between items-center cursor-pointer hover:border-[#E5E7EB] dark:hover:border-gray-600 transition-all">
                             <div className="flex flex-col">
                                 <span className="text-[10px] md:text-[11px] text-[#9CA3AF] font-bold uppercase tracking-widest">Xu hướng</span>
                                 <span className="text-sm md:text-base font-bold text-[#1A1F2B] dark:text-gray-200">"AI & Blockchain"</span>
                             </div>
                             <ChevronDown size={18} className="text-[#9CA3AF]" />
                        </div>
                        <div className="bg-[#F9FAFB] dark:bg-gray-800 border border-[#F3F4F6] dark:border-gray-700 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-left flex justify-between items-center cursor-pointer hover:border-[#E5E7EB] dark:hover:border-gray-600 transition-all">
                             <div className="flex flex-col">
                                 <span className="text-[10px] md:text-[11px] text-[#9CA3AF] font-bold uppercase tracking-widest">Nguồn tin</span>
                                 <span className="text-sm md:text-base font-bold text-[#1A1F2B] dark:text-gray-200">Tin đầu tư mới</span>
                             </div>
                             <ChevronDown size={18} className="text-[#9CA3AF]" />
                        </div>
                    </div>
                </div>

                <div className="relative h-[250px] md:h-[450px] border-l-2 border-b-2 border-[#F3F4F6] dark:border-gray-800 m-2 md:m-4">
                    <div className="absolute -left-10 md:-left-12 top-0 text-[10px] md:text-[11px] font-bold text-[#9CA3AF] uppercase">Cao</div>
                    <div className="absolute -left-10 md:-left-12 top-1/2 text-[10px] md:text-[11px] font-bold text-[#9CA3AF] uppercase">TB</div>
                    <div className="absolute -left-10 md:-left-12 bottom-0 text-[10px] md:text-[11px] font-bold text-[#9CA3AF] uppercase">Thấp</div>

                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2" aria-hidden="true">
                         <div className="border-r-2 border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                         <div className="border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                         <div className="border-r-2 border-t-2 border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                         <div className="border-t-2 border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                    </div>

                    <div className="absolute top-[30%] left-[25%] flex flex-col items-center transform transition-all hover:scale-110 cursor-pointer group">
                        <div className="w-12 md:w-16 h-12 md:h-16 rounded-full border-2 border-[#F15048] bg-white dark:bg-gray-800 shadow-[0_12px_24px_rgba(241,80,72,0.2)] flex items-center justify-center p-2 md:p-3 relative z-10 group-hover:border-red-600 transition-all">
                           <span className="text-[#F15048] font-black text-xs md:text-sm">VNG</span>
                        </div>
                        <span className="mt-2 md:mt-4 text-[9px] md:text-[11px] font-bold text-[#F15048] uppercase tracking-widest bg-[#FEF2F2] dark:bg-red-900/30 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-[#FEE2E2] dark:border-red-800/50">AI Lab</span>
                    </div>

                    <div className="absolute bottom-[40%] right-[35%] flex flex-col items-center transform transition-all hover:scale-110 cursor-pointer group">
                        <div className="w-12 md:w-16 h-12 md:h-16 rounded-full border-2 border-orange-500 bg-white dark:bg-gray-800 shadow-[0_12px_24px_rgba(249,115,22,0.2)] flex items-center justify-center p-2 md:p-3 relative z-10 group-hover:border-orange-600 transition-all">
                           <div className="text-orange-500 font-black text-xs md:text-sm">FPT</div>
                        </div>
                        <span className="mt-2 md:mt-4 text-[9px] md:text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-[#FFF7ED] dark:bg-orange-900/30 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-[#FFEDD5] dark:border-orange-800/50">Chips</span>
                    </div>
                    
                    <div className="absolute top-[20%] right-[10%] md:right-[15%] flex flex-col items-center transform transition-all hover:scale-110 cursor-pointer group">
                        <div className="w-14 md:w-20 h-14 md:h-20 rounded-full border-2 border-blue-500 bg-white dark:bg-gray-800 shadow-[0_12px_24px_rgba(59,130,246,0.2)] flex items-center justify-center p-2 md:p-4 relative z-10 group-hover:border-blue-600 transition-all">
                           <div className="text-blue-500 font-black text-[10px] md:text-xs text-center leading-tight uppercase">VinFast</div>
                        </div>
                        <span className="mt-2 md:mt-4 text-[9px] md:text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-[#EFF6FF] dark:bg-blue-900/30 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-[#DBEAFE] dark:border-blue-800/50">EV Market</span>
                    </div>

                    <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2">
                        <button 
                          onClick={onStart}
                          className="w-14 md:w-16 h-14 md:h-16 bg-[#B91C1C] hover:bg-[#991B1B] rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(185,28,28,0.4)] transition-transform hover:scale-110 active:scale-95"
                          aria-label="Xem demo trực quan"
                        >
                            <Play fill="white" className="text-white ml-1" size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Trust indicators */}
        <div className="pb-16 flex flex-col items-center gap-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Dữ liệu thực từ database VICO</p>
          <div className="flex items-center gap-8 text-gray-300 dark:text-gray-600">
            <Sparkles size={16} />
            <span className="text-xs font-bold text-gray-400">10,289 công ty</span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs font-bold text-gray-400">9 ngành công nghiệp</span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs font-bold text-gray-400">Gemini AI + RSS</span>
          </div>
        </div>
      </main>

      {/* Book a Demo Modal */}
      {showDemoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1F2B]/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowDemoModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Đặt lịch demo"
        >
            <div 
                className="bg-white dark:bg-[#0B101B] w-full max-w-5xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-[#F3F4F6] dark:border-gray-800 shadow-[0_50px_100px_rgba(0,0,0,0.25)] flex flex-col md:flex-row relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setShowDemoModal(false)}
                    className="absolute top-6 right-6 md:top-8 md:right-8 text-[#9CA3AF] hover:text-[#1A1F2B] dark:hover:text-white z-10 p-2 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 rounded-full transition-all"
                    aria-label="Đóng"
                >
                    <X size={24} />
                </button>
                
                <div className="w-full md:w-5/12 p-8 md:p-16 bg-[#FDFCFB] dark:bg-[#0F1623] md:border-r border-[#F3F4F6] dark:border-gray-800 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-red-500/[0.02] dark:bg-red-900/[0.05] pointer-events-none" aria-hidden="true"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-10 md:mb-12">
                           <Logo />
                        </div>
                        
                        <h2 className="text-3xl md:text-5xl font-black mb-8 md:mb-10 leading-[1.1] text-[#1A1F2B] dark:text-white tracking-tighter">
                            Đặt lịch demo <span className="text-[#B91C1C]">VICO Copilot</span> 30 phút.
                        </h2>
                        
                        <p className="text-[#9CA3AF] font-bold uppercase tracking-widest text-xs mb-6 md:mb-8">Bạn sẽ nhận được</p>
                        
                        <ul className="space-y-6 md:space-y-8 text-[#555E6D] dark:text-gray-300">
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 bg-[#FEF2F2] dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="text-[#B91C1C]" size={16} />
                                </div>
                                <span className="font-semibold text-base md:text-lg leading-snug">Demo cá nhân hóa theo ngành</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 bg-[#FEF2F2] dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="text-[#B91C1C]" size={16} />
                                </div>
                                <span className="font-semibold text-base md:text-lg leading-snug">Case study lĩnh vực đầu tư</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 bg-[#FEF2F2] dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="text-[#B91C1C]" size={16} />
                                </div>
                                <span className="font-semibold text-base md:text-lg leading-snug">Khung giá bản quyền doanh nghiệp</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="w-full md:w-7/12 p-8 md:p-16 bg-white dark:bg-[#0B101B]">
                    {demoSubmitted ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle2 className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Đã nhận yêu cầu!</h3>
                        <p className="text-gray-500 text-sm">Chúng tôi sẽ liên hệ bạn trong 24 giờ.</p>
                      </div>
                    ) : (
                    <form className="space-y-5 md:space-y-6" onSubmit={handleDemoSubmit}>
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            <EnterpriseInput label="Họ" name="lastName" required type="text" placeholder="Nguyễn" />
                            <EnterpriseInput label="Tên" name="firstName" required type="text" placeholder="An" />
                        </div>
                        
                        <EnterpriseInput label="Email công việc" name="email" required type="email" placeholder="ceo@company.com.vn" />

                        <EnterpriseInput label="Chức vụ" name="jobTitle" required type="text" placeholder="Giám đốc chiến lược" />

                        <div className="grid grid-cols-[120px_1fr] md:grid-cols-[140px_1fr] gap-4 md:gap-6">
                            <div className="relative border rounded-xl bg-white dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 p-3 px-4 h-[64px] hover:border-gray-300 transition-all group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1 leading-none group-hover:text-gray-500">Vùng</label>
                                <div className="flex items-center justify-between">
                                  <span className="text-[15px] font-bold dark:text-gray-200">VN +84</span>
                                  <ChevronDown size={14} className="text-gray-400" />
                                </div>
                            </div>
                            <EnterpriseInput label="Số điện thoại" name="phone" type="tel" placeholder="090 123 4567" />
                        </div>

                        {demoError && (
                          <p className="text-red-500 text-sm font-semibold text-center">{demoError}</p>
                        )}

                        <button 
                            disabled={demoLoading}
                            className="w-full bg-[#B91C1C] hover:bg-[#991B1B] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-5 md:py-6 rounded-[1.5rem] text-lg md:text-xl transition-all shadow-[0_20px_40px_rgba(185,28,28,0.25)] hover:shadow-[0_24px_48px_rgba(185,28,28,0.35)] transform active:scale-95 mt-4 md:mt-6 uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                            {demoLoading ? (
                              <>
                                <Loader2 size={20} className="animate-spin" />
                                Đang gửi...
                              </>
                            ) : 'Đặt lịch ngay'}
                        </button>
                        
                        <p className="text-center text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.15em] mt-4 md:mt-6">
                            Dữ liệu được mã hóa • Không chia sẻ bên thứ ba
                        </p>
                    </form>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};