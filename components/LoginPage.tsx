
import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, Lock, Mail, Loader2, AlertCircle, 
    Eye, EyeOff, ShieldCheck, Cpu, Activity, ScanLine, User 
} from 'lucide-react';
import { Logo, EnterpriseInput } from './VicoUI';
import { ThemeToggle } from './ThemeToggle';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-react';

interface LoginPageProps {
  onLoginSuccess: (data: any) => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [verifySource, setVerifySource] = useState<'login' | 'signup'>('signup'); // track which flow triggered verification
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clerk hooks
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { isSignedIn, userId } = useAuth();
  const clerkAvailable = !!signIn;
  
  // Terminal animation with proper cleanup
  useEffect(() => {
      const logs = [
          "KHỞI TẠO VICO...",
          "NẠP DATABASE (10,289 CÔNG TY)...",
          "PHÂN LOẠI 9 NGÀNH CÔNG NGHIỆP...",
          "KẾT NỐI GEMINI AI + RSS NEWS...",
          clerkAvailable 
              ? "HỆ THỐNG SẴN SÀNG. CHỜ XÁC THỰC..." 
              : "⚠ CLERK CHƯA CẤU HÌNH. VUI LÒNG THIẾT LẬP API KEYS."
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
  }, [clerkAvailable]);

  // If user is already signed in, auto-redirect
  useEffect(() => {
      if (isSignedIn && userId) {
          onLoginSuccess({
              id: userId,
              email: '',
              firstName: '',
              lastName: '',
              source: 'clerk',
          });
      }
  }, [isSignedIn, userId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!clerkAvailable) {
        setIsLoading(false);
        setError('Hệ thống xác thực chưa được cấu hình. Vui lòng thiết lập Clerk API keys trong .env');
        return;
    }
    
    try {
        const result = await signIn!.create({
            identifier: email,
            password: password,
        });

        if (result.status === 'complete') {
            await setSignInActive!({ session: result.createdSessionId });
            onLoginSuccess({
                id: result.id,
                email: email,
                firstName: '',
                lastName: '',
                source: 'clerk',
            });
        } else if (result.status === 'needs_first_factor' || result.status === 'needs_second_factor') {
            // Check if email code is a supported first factor
            const emailCodeFactor = result.supportedFirstFactors?.find(
                (f: any) => f.strategy === 'email_code'
            );
            if (emailCodeFactor) {
                await signIn!.prepareFirstFactor({
                    strategy: 'email_code',
                    emailAddressId: (emailCodeFactor as any).emailAddressId,
                });
                setVerifySource('login');
                setMode('verify');
                setSuccessMessage(`Mã xác thực đã gửi đến ${email}. Vui lòng kiểm tra hộp thư.`);
            } else {
                setError('Xác thực cần bước bổ sung. Vui lòng kiểm tra email.');
            }
        } else {
            setError('Xác thực cần bước bổ sung. Vui lòng kiểm tra email.');
        }
    } catch (err: any) {
        const clerkError = err?.errors?.[0];
        if (clerkError) {
            const errorMap: Record<string, string> = {
                'form_identifier_not_found': 'Tài khoản không tồn tại. Hãy nhấn "Tạo tài khoản mới" để đăng ký.',
                'form_password_incorrect': 'Mật khẩu không chính xác',
                'form_identifier_exists': 'Email đã được đăng ký',
                'too_many_requests': 'Quá nhiều lần thử. Vui lòng đợi vài phút.',
            };
            setError(errorMap[clerkError.code] || clerkError.longMessage || 'Đăng nhập thất bại');
        } else {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!signUp) {
        setIsLoading(false);
        setError('Hệ thống đăng ký chưa sẵn sàng.');
        return;
    }

    try {
        const result = await signUp.create({
            emailAddress: email,
            password: password,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
        });

        if (result.status === 'complete') {
            // No verification needed
            await setSignUpActive!({ session: result.createdSessionId });
            onLoginSuccess({
                id: result.id,
                email: email,
                firstName,
                lastName,
                source: 'clerk',
            });
        } else {
            // Need email verification
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setVerifySource('signup');
            setMode('verify');
            setSuccessMessage(`Mã xác thực đã gửi đến ${email}. Vui lòng kiểm tra hộp thư.`);
        }
    } catch (err: any) {
        const clerkError = err?.errors?.[0];
        if (clerkError) {
            const errorMap: Record<string, string> = {
                'form_identifier_exists': 'Email này đã được đăng ký. Hãy đăng nhập.',
                'form_password_pwned': 'Mật khẩu này không an toàn. Vui lòng chọn mật khẩu khác.',
                'form_password_length_too_short': 'Mật khẩu phải có ít nhất 8 ký tự.',
                'too_many_requests': 'Quá nhiều lần thử. Vui lòng đợi vài phút.',
            };
            setError(errorMap[clerkError.code] || clerkError.longMessage || 'Đăng ký thất bại');
        } else {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (verifySource === 'login') {
            // Login verification flow
            if (!signIn) { setIsLoading(false); return; }
            const result = await signIn.attemptFirstFactor({
                strategy: 'email_code',
                code: verificationCode,
            });
            if (result.status === 'complete') {
                await setSignInActive!({ session: result.createdSessionId });
                onLoginSuccess({
                    id: result.id,
                    email: email,
                    firstName: '',
                    lastName: '',
                    source: 'clerk',
                });
            } else {
                setError('Xác thực chưa hoàn tất. Vui lòng thử lại.');
            }
        } else {
            // Signup verification flow
            if (!signUp) { setIsLoading(false); return; }
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });
            if (result.status === 'complete') {
                await setSignUpActive!({ session: result.createdSessionId });
                onLoginSuccess({
                    id: result.id,
                    email: email,
                    firstName,
                    lastName,
                    source: 'clerk',
                });
            } else {
                setError('Xác thực chưa hoàn tất. Vui lòng thử lại.');
            }
        }
    } catch (err: any) {
        const clerkError = err?.errors?.[0];
        if (clerkError) {
            const errorMap: Record<string, string> = {
                'form_code_incorrect': 'Mã xác thực không đúng. Vui lòng kiểm tra lại.',
                'verification_expired': 'Mã đã hết hạn. Vui lòng gửi lại.',
            };
            setError(errorMap[clerkError.code] || clerkError.longMessage || 'Xác thực thất bại');
        } else {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        }
    } finally {
        setIsLoading(false);
    }
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
                                <span className="text-[10px] font-black uppercase tracking-widest">Database</span>
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">10,289</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Công ty Việt Nam</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 backdrop-blur-sm w-60 rounded-2xl">
                            <div className="flex items-center gap-3 text-gray-900 dark:text-white mb-2">
                                <Cpu size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Phân loại</span>
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-white">9</div>
                            <div className="text-[10px] text-gray-500 uppercase mt-1">Ngành công nghiệp</div>
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
                       <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                           {mode === 'login' ? 'Xác thực danh tính' : mode === 'signup' ? 'Tạo tài khoản' : 'Xác nhận email'}
                       </h3>
                   </div>

                   {/* Auth status indicator */}
                   {!clerkAvailable && (
                       <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                         <p className="text-[11px] text-amber-700 dark:text-amber-300 font-bold">
                           ⚠ Clerk chưa cấu hình. Vào .env để thiết lập VITE_CLERK_PUBLISHABLE_KEY
                         </p>
                       </div>
                   )}

                   {successMessage && (
                       <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
                         <p className="text-[11px] text-green-700 dark:text-green-300 font-bold">
                           ✓ {successMessage}
                         </p>
                       </div>
                   )}

                   {/* === VERIFY EMAIL CODE === */}
                   {mode === 'verify' && (
                     <form onSubmit={handleVerify} className="space-y-5">
                       <EnterpriseInput 
                           label="Mã xác thực"
                           type="text"
                           required
                           value={verificationCode}
                           onChange={(e: any) => setVerificationCode(e.target.value)}
                           placeholder="Nhập mã 6 số từ email"
                           icon={ShieldCheck}
                       />

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
                               Xác nhận <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                           </>}
                       </button>

                       <div className="text-center pt-4">
                           <button type="button" onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors">
                               ← Quay lại đăng nhập
                           </button>
                       </div>
                     </form>
                   )}

                   {/* === LOGIN FORM === */}
                   {mode === 'login' && (
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
                           <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors">
                               Tạo tài khoản mới
                           </button>
                       </div>
                   </form>
                   )}

                   {/* === SIGNUP FORM === */}
                   {mode === 'signup' && (
                   <form onSubmit={handleSignUp} className="space-y-5">
                       <div className="grid grid-cols-2 gap-4">
                           <EnterpriseInput 
                               label="Họ"
                               type="text"
                               value={lastName}
                               onChange={(e: any) => setLastName(e.target.value)}
                               placeholder="Nguyễn"
                               icon={User}
                           />
                           <EnterpriseInput 
                               label="Tên"
                               type="text"
                               value={firstName}
                               onChange={(e: any) => setFirstName(e.target.value)}
                               placeholder="Văn A"
                               icon={User}
                           />
                       </div>

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
                               placeholder="Tối thiểu 8 ký tự"
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
                               Đăng ký <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                           </>}
                       </button>

                       <div className="text-center pt-4">
                           <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors">
                               Đã có tài khoản? Đăng nhập
                           </button>
                       </div>
                   </form>
                   )}

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
