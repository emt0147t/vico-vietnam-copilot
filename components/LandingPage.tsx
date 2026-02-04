import React, { useState } from 'react';
import { Play, Activity, Database, MessageSquare, X, CheckCircle2, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { EnterpriseInput, Logo } from './VicoUI';

interface LandingPageProps {
  onStart: () => void;
  onLoginClick?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLoginClick }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B101B] text-[#1A1F2B] dark:text-white font-sans overflow-hidden flex flex-col transition-colors duration-300">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 max-w-7xl mx-auto w-full z-20 relative">
        <div onClick={() => window.location.reload()}>
           <Logo />
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <ThemeToggle />
          <button 
            onClick={onLoginClick}
            className="text-gray-600 dark:text-gray-300 hover:text-[#1A1F2B] dark:hover:text-white text-sm font-semibold transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onStart}
            className="bg-[#B91C1C] hover:bg-[#991B1B] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_4px_12px_rgba(185,28,28,0.2)]"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center pt-20 md:pt-28 px-4 md:px-0 text-center w-full max-w-6xl mx-auto relative z-10">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-500/[0.03] dark:bg-red-900/[0.07] blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <h1 className="text-6xl md:text-[5.5rem] font-extrabold tracking-tighter mb-8 leading-[1] max-w-5xl text-[#1A1F2B] dark:text-white">
          VICO <span className="text-[#F15048] dark:text-[#F15048]">Vietnam Copilot</span> <br />
          Market Intelligence
        </h1>

        <p className="text-[#555E6D] dark:text-gray-400 text-xl md:text-[1.35rem] max-w-3xl mb-12 leading-relaxed font-medium">
          The ultimate Copilot for Vietnam. We collect, analyze, and visualize the fragmented market data in seconds.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-6 mb-16 w-full md:w-auto">
          <button 
            onClick={onStart}
            className="bg-[#B91C1C] hover:bg-[#991B1B] text-white px-10 py-5 rounded-3xl text-xl font-extrabold transition-all shadow-[0_12px_24px_rgba(185,28,28,0.3)] hover:shadow-[0_16px_32px_rgba(185,28,28,0.4)] w-full md:w-auto transform active:scale-95"
          >
            Start VICO Copilot
          </button>
          <button 
            onClick={() => setShowDemoModal(true)}
            className="bg-white dark:bg-transparent border border-[#E5E7EB] dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 text-[#1A1F2B] dark:text-white px-10 py-5 rounded-3xl text-xl font-bold transition-all w-full md:w-auto transform active:scale-95 shadow-sm"
          >
            Book a Demo
          </button>
        </div>
        
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-[#555E6D] dark:text-gray-400 text-base font-bold mb-20 justify-center">
            <div className="flex items-center gap-3"><Database size={20} className="text-[#9CA3AF]"/> Data Collection</div>
            <div className="flex items-center gap-3"><Activity size={20} className="text-[#9CA3AF]"/> Market Pulse</div>
            <div className="flex items-center gap-3"><MessageSquare size={20} className="text-[#9CA3AF]"/> AI Chat (RAG)</div>
        </div>

        <div className="w-full max-w-5xl mx-auto perspective-2000 px-4 pb-20">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.08)] transform rotate-x-12 origin-top border border-[#F3F4F6] dark:border-gray-800 relative overflow-hidden transition-colors duration-300">
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        <div className="bg-[#F9FAFB] dark:bg-gray-800 border border-[#F3F4F6] dark:border-gray-700 rounded-2xl px-6 py-4 text-left flex justify-between items-center cursor-pointer hover:border-[#E5E7EB] dark:hover:border-gray-600 transition-all">
                             <div className="flex flex-col">
                                 <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-widest">Filter Trend</span>
                                 <span className="text-base font-bold text-[#1A1F2B] dark:text-gray-200">"Blockchain" Mentions</span>
                             </div>
                             <ChevronDown size={18} className="text-[#9CA3AF]" />
                        </div>
                        <div className="bg-[#F9FAFB] dark:bg-gray-800 border border-[#F3F4F6] dark:border-gray-700 rounded-2xl px-6 py-4 text-left flex justify-between items-center cursor-pointer hover:border-[#E5E7EB] dark:hover:border-gray-600 transition-all">
                             <div className="flex flex-col">
                                 <span className="text-[11px] text-[#9CA3AF] font-bold uppercase tracking-widest">Source</span>
                                 <span className="text-base font-bold text-[#1A1F2B] dark:text-gray-200">All Funding News</span>
                             </div>
                             <ChevronDown size={18} className="text-[#9CA3AF]" />
                        </div>
                    </div>
                </div>

                <div className="relative h-[300px] md:h-[450px] border-l-2 border-b-2 border-[#F3F4F6] dark:border-gray-800 m-4">
                    <div className="absolute -left-12 top-0 text-[11px] font-bold text-[#9CA3AF] uppercase">High</div>
                    <div className="absolute -left-12 top-1/2 text-[11px] font-bold text-[#9CA3AF] uppercase">Med</div>
                    <div className="absolute -left-10 bottom-0 text-[11px] font-bold text-[#9CA3AF] uppercase">Low</div>

                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                         <div className="border-r-2 border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                         <div className="border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                         <div className="border-r-2 border-t-2 border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                         <div className="border-t-2 border-[#F9FAFB] dark:border-gray-800/50 border-dashed"></div>
                    </div>

                    <div className="absolute top-[30%] left-[25%] flex flex-col items-center transform transition-all hover:scale-110 cursor-pointer group">
                        <div className="w-16 h-16 rounded-full border-2 border-[#F15048] bg-white dark:bg-gray-800 shadow-[0_12px_24px_rgba(241,80,72,0.2)] flex items-center justify-center p-3 relative z-10 group-hover:border-red-600 transition-all">
                           <span className="text-[#F15048] font-black text-sm">VNG</span>
                        </div>
                        <span className="mt-4 text-[11px] font-bold text-[#F15048] uppercase tracking-widest bg-[#FEF2F2] dark:bg-red-900/30 px-3 py-1 rounded-full border border-[#FEE2E2] dark:border-red-800/50">AI Lab</span>
                    </div>

                    <div className="absolute bottom-[40%] right-[35%] flex flex-col items-center transform transition-all hover:scale-110 cursor-pointer group">
                        <div className="w-16 h-16 rounded-full border-2 border-orange-500 bg-white dark:bg-gray-800 shadow-[0_12px_24px_rgba(249,115,22,0.2)] flex items-center justify-center p-3 relative z-10 group-hover:border-orange-600 transition-all">
                           <div className="text-orange-500 font-black text-sm">FPT</div>
                        </div>
                        <span className="mt-4 text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-[#FFF7ED] dark:bg-orange-900/30 px-3 py-1 rounded-full border border-[#FFEDD5] dark:border-orange-800/50">Chips</span>
                    </div>
                    
                    <div className="absolute top-[20%] right-[15%] flex flex-col items-center transform transition-all hover:scale-110 cursor-pointer group">
                        <div className="w-20 h-20 rounded-full border-2 border-blue-500 bg-white dark:bg-gray-800 shadow-[0_12px_24px_rgba(59,130,246,0.2)] flex items-center justify-center p-4 relative z-10 group-hover:border-blue-600 transition-all">
                           <div className="text-blue-500 font-black text-xs text-center leading-tight uppercase">VinFast</div>
                        </div>
                        <span className="mt-4 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-[#EFF6FF] dark:bg-blue-900/30 px-3 py-1 rounded-full border border-[#DBEAFE] dark:border-blue-800/50">EV Market</span>
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                        <button className="w-16 h-16 bg-[#B91C1C] hover:bg-[#991B1B] rounded-full flex items-center justify-center shadow-[0_12px_32px_rgba(185,28,28,0.4)] transition-transform hover:scale-110 active:scale-95">
                            <Play fill="white" className="text-white ml-1.5" size={28} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Book a Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1F2B]/80 backdrop-blur-md animate-fade-in">
            <div 
                className="bg-white dark:bg-[#0B101B] w-full max-w-5xl rounded-[2.5rem] overflow-hidden border border-[#F3F4F6] dark:border-gray-800 shadow-[0_50px_100px_rgba(0,0,0,0.25)] flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setShowDemoModal(false)}
                    className="absolute top-8 right-8 text-[#9CA3AF] hover:text-[#1A1F2B] dark:hover:text-white z-10 p-2 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 rounded-full transition-all"
                >
                    <X size={28} />
                </button>
                
                <div className="w-full md:w-5/12 p-10 md:p-16 bg-[#FDFCFB] dark:bg-[#0F1623] border-r border-[#F3F4F6] dark:border-gray-800 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-red-500/[0.02] dark:bg-red-900/[0.05] pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-12">
                           <Logo />
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black mb-10 leading-[1.1] text-[#1A1F2B] dark:text-white tracking-tighter">
                            Book your 30-minute <span className="text-[#B91C1C]">VICO Copilot</span> demo.
                        </h2>
                        
                        <p className="text-[#9CA3AF] font-bold uppercase tracking-widest text-xs mb-8">Executive Session expectations</p>
                        
                        <ul className="space-y-8 text-[#555E6D] dark:text-gray-300">
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 bg-[#FEF2F2] dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="text-[#B91C1C]" size={16} />
                                </div>
                                <span className="font-semibold text-lg leading-snug">Personalized VICO walkthrough</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 bg-[#FEF2F2] dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="text-[#B91C1C]" size={16} />
                                </div>
                                <span className="font-semibold text-lg leading-snug">Investment sector case studies</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 bg-[#FEF2F2] dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="text-[#B91C1C]" size={16} />
                                </div>
                                <span className="font-semibold text-lg leading-snug">Enterprise licensing framework</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="w-full md:w-7/12 p-10 md:p-16 bg-white dark:bg-[#0B101B]">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Demo request received! We will contact you shortly.'); setShowDemoModal(false); }}>
                        <div className="grid grid-cols-2 gap-6">
                            <EnterpriseInput label="First name" required type="text" placeholder="Nguyen" />
                            <EnterpriseInput label="Last name" required type="text" placeholder="An" />
                        </div>
                        
                        <EnterpriseInput label="Corporate email" required type="email" placeholder="ceo@company.com.vn" />

                        <EnterpriseInput label="Strategic position" required type="text" placeholder="Head of Growth" />

                        <div className="grid grid-cols-[140px_1fr] gap-6">
                            <div className="relative border rounded-xl bg-white dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 p-3 px-4 h-[64px] hover:border-gray-300 transition-all group">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1 leading-none group-hover:text-gray-500">Region</label>
                                <div className="flex items-center justify-between">
                                  <span className="text-[15px] font-bold dark:text-gray-200">VN +84</span>
                                  <ChevronDown size={14} className="text-gray-400" />
                                </div>
                            </div>
                            <EnterpriseInput label="Direct contact" type="tel" placeholder="090 123 4567" />
                        </div>

                        <button className="w-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-black py-6 rounded-[1.5rem] text-xl transition-all shadow-[0_20px_40px_rgba(185,28,28,0.25)] hover:shadow-[0_24px_48px_rgba(185,28,28,0.35)] transform active:scale-95 mt-6 uppercase tracking-widest">
                            Schedule Briefing
                        </button>
                        
                        <p className="text-center text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] mt-6">
                            Secure Data Transmission • No Third-Party Sharing
                        </p>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};