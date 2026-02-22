
import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, Lock, Mail, Loader2, AlertCircle, 
    Eye, EyeOff, ShieldCheck, Cpu, Activity, ScanLine 
} from 'lucide-react';
import { Logo, EnterpriseInput } from './VicoUI';
import { ThemeToggle } from './ThemeToggle';

interface LoginPageProps {
  onLoginSuccess: (data: any) => void;
  onSignupClick: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSignupClick, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  
  // Terminal animation with proper cleanup
  useEffect(() => {
      const logs = [
          "KHỞI TẠO VICO_CORE_V3.0...",
          "KẾT NỐI SECURE NODES [VN_HANOI]...",
          "THIẾT LẬP UPLINK [VN_HCMC]...",
          "NẠP MARKET_VECTORS_DB (12,160 BẢN GHI)...",
          "HỆ THỐNG SẴN SÀNG. CHỜ XÁC THỰC..."
      ];
      
      let delay = 0;
      logs.forEach((log) => {
          delay += 800;
          const timer = setTimeout(() => {
              setTerminalLines(prev => [...prev, log]);
          }, delay);
          timersRef.current.push(timer);
      });

      return () => {
          timersRef.current.forEach(clearTimeout);
          timersRef.current = [];
      };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      const storedUser = localStorage.getItem(`vico_user_${email}`);
      if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData.password === password) onLoginSuccess(userData);
            else setError('Thông tin đăng nhập không chính xác');
          } catch {
            setError('Dữ liệu tài khoản bị lỗi');
          }
      } else {
         if (email === 'demo@vico.com' && password === 'password') {
             onLoginSuccess({ firstName: 'Demo', lastName: 'User', jobTitle: 'Analyst', orgName: 'Vico Corp', email: 'demo@vico.com' });
         } else setError('Tài khoản không tồn tại trong hệ thống');
      }
    }, 1500);
    timersRef.current.push(timer);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#050505] text-gray-900 dark:text-white font-sans flex overflow-hidden relative selection:bg-[#B91C1C] selection:text-white transition-colors duration-300">
      {/* Background effects (dark mode only) */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden dark:block" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B91C1C]/5 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      {/* Light mode background */}
      <div className="absolute inset-0 z-0 pointer-events-none dark:hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#B91C1C]/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Top bar */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-widest group" aria-label="Quay lại trang chủ">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Quay lại
        </button>
        <ThemeToggle />
      </div>

      <div className="w-full h-full flex flex-col lg:flex-row relative z-10">
          {/* Left branding panel */}
          <div className="hidden lg:flex w-[55%] flex-col justify-between p-16 relative border-r border-gray-100 dark:border-white/5">
               <div className="mt-12">
                   <Logo />
                   
                   <h2 className="text-5xl xl:text-6xl font-black uppercase tracking-tighter leading-[0.95] mt-10 text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:via-gray-400 dark:to-gray-800">
                       Trí tuệ <br/> Thị trường <br/> Việt Nam
                   </h2>
               </div>

               <div className="space-y-6">
                   <div className="flex gap-6">
                        <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 backdrop-blur-sm w-60 rounded-2xl">
                            <div className="flex items-center gap-3 text-[#B91C1C] mb-2">
                                <Activity size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Live Pulse</span>
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">98.4%</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Phủ sóng thị trường</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 backdrop-blur-sm w-60 rounded-2xl">
                            <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
                                <Cpu size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Xử lý</span>
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">12ms</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Độ trễ</div>
                        </div>
                   </div>

                   <div className="font-mono text-[10px] text-green-600 dark:text-green-500/80 bg-gray-100 dark:bg-black/50 p-4 border-l-2 border-green-500/50 h-32 overflow-hidden rounded-r-xl">
                       {terminalLines.map((line, i) => (
                           <div key={i} className="mb-1 opacity-80">{'>'} {line}</div>
                       ))}
                       <div className="animate-pulse">_</div>
                   </div>
               </div>
          </div>

          {/* Right login form */}
          <div className="w-full lg:w-[45%] bg-white/80 dark:bg-[#080808]/80 backdrop-blur-md flex flex-col items-center justify-center p-8 lg:p-16 xl:p-20 relative min-h-screen lg:min-h-0">
               {/* Mobile branding */}
               <div className="lg:hidden mb-10">
                 <Logo />
               </div>

               <div className="w-full max-w-md">
                   <div className="mb-10 border-b border-gray-200 dark:border-white/10 pb-6">
                       <div className="flex items-center gap-2 text-[#B91C1C] mb-2">
                           <ScanLine size={20} className="animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Khu vực bảo mật</span>
                       </div>
                       <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Xác thực danh tính</h3>
                   </div>

                   {/* Demo credentials hint */}
                   <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl">
                     <p className="text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                       Demo: demo@vico.com / password
                     </p>
                   </div>

                   <form onSubmit={handleLogin} className="space-y-5">
                       <EnterpriseInput 
                           label="Email"
                           type="email"
                           required
                           value={email}
                           onChange={(e: any) => setEmail(e.target.value)}
                           placeholder="email@company.vn"
                           icon={Mail}
                       />

                       <div className="relative">
                           <EnterpriseInput 
                               label="Mật khẩu"
                               type={showPassword ? "text" : "password"}
                               required
                               value={password}
                               onChange={(e: any) => setPassword(e.target.value)}
                               placeholder="••••••••••••"
                               icon={Lock}
                           />
                           <button 
                               type="button" 
                               onClick={() => setShowPassword(!showPassword)} 
                               className="absolute right-4 bottom-3 text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                               aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                           >
                               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                       </div>

                       {error && (
                           <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 text-red-600 dark:text-red-500 text-xs font-bold animate-fade-in rounded-xl" role="alert">
                               <AlertCircle size={16} /> {error}
                           </div>
                       )}

                       <button 
                          disabled={isLoading}
                          className="w-full bg-[#B91C1C] hover:bg-red-700 text-white py-5 mt-4 font-black uppercase tracking-[0.15em] transition-all hover:shadow-[0_0_30px_rgba(185,28,28,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group rounded-2xl text-sm"
                       >
                           {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>
                               Đăng nhập <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                           </>}
                       </button>

                       <div className="text-center pt-4">
                           <button type="button" onClick={onSignupClick} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors">
                               Tạo tài khoản mới
                           </button>
                       </div>
                   </form>

                   <div className="mt-12 text-center">
                       <div className="inline-flex items-center gap-2 text-[10px] font-black text-[#B91C1C] uppercase tracking-[0.2em] opacity-60">
                           <ShieldCheck size={12} /> Kết nối được mã hóa
                       </div>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};
