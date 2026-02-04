
import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Lock, Mail, Loader2, AlertCircle, 
    Eye, EyeOff, ShieldCheck, Cpu, Activity, 
    Globe, Terminal, Radio, ScanLine 
} from 'lucide-react';
import { Logo, EnterpriseInput } from './VicoUI';

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
  
  useEffect(() => {
      const logs = [
          "INITIALIZING VICO_CORE_V2.5...",
          "CONNECTING TO SECURE NODES [VN_HANOI]...",
          "ESTABLISHING UPLINK TO [VN_HCMC]...",
          "LOADING MARKET_VECTORS_DB (9931 RECORDS)...",
          "SYSTEM READY. WAITING FOR AUTH..."
      ];
      
      let delay = 0;
      logs.forEach((log, index) => {
          delay += 800;
          setTimeout(() => {
              setTerminalLines(prev => [...prev, log]);
          }, delay);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      const storedUser = localStorage.getItem(`vico_user_${email}`);
      if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.password === password) onLoginSuccess(userData);
          else setError('ACCESS DENIED: INVALID CREDENTIALS');
      } else {
         if (email === 'demo@vico.com' && password === 'password') {
             onLoginSuccess({ firstName: 'Demo', lastName: 'User', jobTitle: 'Analyst', orgName: 'Vico Corp', email: 'demo@vico.com' });
         } else setError('ACCOUNT NOT FOUND IN REGISTRY');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden relative selection:bg-[#B91C1C] selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#B91C1C]/5 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <button onClick={onBack} className="absolute top-8 left-8 z-50 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Abort Mission
      </button>

      <div className="w-full h-full flex flex-col lg:flex-row relative z-10">
          <div className="hidden lg:flex w-[60%] flex-col justify-between p-16 relative border-r border-white/5">
               <div className="mt-12">
                   <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 bg-[#B91C1C] flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(185,28,28,0.5)]">V</div>
                       <div>
                           <h1 className="text-4xl font-black tracking-tighter leading-none">VICO</h1>
                           <div className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-[0.3em]">Vietnam Intelligence</div>
                       </div>
                   </div>
                   
                   <h2 className="text-6xl font-black uppercase tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-400 to-gray-800">
                       Market <br/> Dominance <br/> Protocol
                   </h2>
               </div>

               <div className="space-y-6">
                   <div className="flex gap-8">
                        <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-sm w-64">
                            <div className="flex items-center gap-3 text-[#B91C1C] mb-2">
                                <Activity size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Live Pulse</span>
                            </div>
                            <div className="text-3xl font-black">98.4%</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Market Coverage</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-sm w-64">
                            <div className="flex items-center gap-3 text-white mb-2">
                                <Cpu size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Processing</span>
                            </div>
                            <div className="text-3xl font-black">12ms</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Latency</div>
                        </div>
                   </div>

                   <div className="font-mono text-[10px] text-green-500/80 bg-black/50 p-4 border-l-2 border-green-500/50 h-32 overflow-hidden">
                       {terminalLines.map((line, i) => (
                           <div key={i} className="mb-1 opacity-80">{'>'} {line}</div>
                       ))}
                       <div className="animate-pulse">_</div>
                   </div>
               </div>
          </div>

          <div className="w-full lg:w-[40%] bg-[#080808]/80 backdrop-blur-md flex flex-col items-center justify-center p-10 lg:p-20 relative">
               <div className="w-full max-w-md">
                   <div className="mb-12 border-b border-white/10 pb-6">
                       <div className="flex items-center gap-2 text-[#B91C1C] mb-2">
                           <ScanLine size={20} className="animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Restricted Area</span>
                       </div>
                       <h3 className="text-3xl font-black uppercase tracking-tight text-white">Identity Verification</h3>
                   </div>

                   <form onSubmit={handleLogin} className="space-y-6">
                       <EnterpriseInput 
                           label="Strategic ID / Email"
                           type="email"
                           required
                           value={email}
                           onChange={(e: any) => setEmail(e.target.value)}
                           placeholder="OFFICER@VICO.VN"
                           icon={Mail}
                           className="bg-white/5 border-white/10"
                       />

                       <div className="relative">
                           <EnterpriseInput 
                               label="Security Key"
                               type={showPassword ? "text" : "password"}
                               required
                               value={password}
                               onChange={(e: any) => setPassword(e.target.value)}
                               placeholder="••••••••••••"
                               icon={Lock}
                               className="bg-white/5 border-white/10"
                           />
                           <button 
                               type="button" 
                               onClick={() => setShowPassword(!showPassword)} 
                               className="absolute right-4 bottom-3 text-gray-600 hover:text-white transition-colors"
                           >
                               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                       </div>

                       {error && (
                           <div className="flex items-center gap-3 bg-red-900/20 border border-red-900/50 p-4 text-red-500 text-xs font-black uppercase tracking-wide animate-fade-in rounded-xl">
                               <AlertCircle size={16} /> {error}
                           </div>
                       )}

                       <button 
                          disabled={isLoading}
                          className="w-full bg-[#B91C1C] hover:bg-red-700 text-white py-6 mt-4 font-black uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_30px_rgba(185,28,28,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group rounded-2xl"
                       >
                           {isLoading ? <Loader2 className="animate-spin" /> : <>
                               Authorize Access <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={18} />
                           </>}
                       </button>

                       <div className="text-center pt-4">
                           <button type="button" onClick={onSignupClick} className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
                               Request New Clearance
                           </button>
                       </div>
                   </form>

                   <div className="absolute bottom-8 left-0 right-0 text-center">
                       <div className="inline-flex items-center gap-2 text-[9px] font-black text-[#B91C1C] uppercase tracking-[0.3em] opacity-60">
                           <ShieldCheck size={12} /> Encrypted Connection
                       </div>
                   </div>
               </div>
          </div>
      </div>
    </div>
  );
};
