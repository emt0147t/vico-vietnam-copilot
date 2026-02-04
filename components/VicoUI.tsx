import React, { useState } from 'react';
import { 
  Shield, Globe, MoreHorizontal, Star, Briefcase, TrendingUp, 
  Newspaper, Zap, Lightbulb, Plus, Info, X, ArrowUpRight, 
  ArrowDownRight, Target, ShieldCheck, ZapOff, InfoIcon, 
  ChevronRight, AlertCircle 
} from 'lucide-react';

export const Logo = () => (
  <div className="flex items-center gap-3 group cursor-pointer select-none">
    <div className="w-11 h-11 bg-gradient-to-br from-[#B91C1C] to-[#991B1B] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform duration-300 border border-white/10">V</div>
    <div className="flex flex-col">
        <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">VICO</span>
        <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-pulse"></span>
            <span className="text-[10px] font-bold text-[#B91C1C] tracking-[0.1em] uppercase leading-none whitespace-nowrap">Vietnam Copilot</span>
        </div>
    </div>
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  icon?: any;
  error?: string;
  multiline?: boolean;
}

export const EnterpriseInput: React.FC<InputProps> = ({ 
  label, 
  icon: Icon, 
  error, 
  multiline, 
  className = "", 
  onFocus, 
  onBlur, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const containerClasses = `
    relative border rounded-xl bg-white dark:bg-gray-950/40 transition-all duration-300 group
    ${error ? 'border-red-500 ring-4 ring-red-500/5' : isFocused ? 'border-[#B91C1C] ring-4 ring-[#B91C1C]/5 shadow-sm' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}
    ${className}
  `;

  return (
    <div className="w-full space-y-1.5">
      <div className={containerClasses}>
        <div className="px-4 pt-3">
          <label className={`text-[10px] font-black uppercase tracking-[0.15em] block transition-colors leading-none select-none ${error ? 'text-red-500' : isFocused ? 'text-[#B91C1C]' : 'text-gray-400 group-hover:text-gray-500'}`}>
            {label}
          </label>
        </div>
        <div className="flex items-start px-4 pb-3 pt-1 gap-3">
          {multiline ? (
            <textarea
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full bg-transparent border-none text-gray-900 dark:text-white text-[15px] font-medium p-0 focus:ring-0 outline-none placeholder-gray-300 dark:placeholder-gray-600 resize-none min-h-[80px] custom-scrollbar"
            />
          ) : (
            <input
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full bg-transparent border-none text-gray-900 dark:text-white text-[15px] font-medium p-0 focus:ring-0 outline-none placeholder-gray-300 dark:placeholder-gray-600"
            />
          )}
          {Icon && (
            <div className={`mt-0.5 transition-colors ${error ? 'text-red-400' : isFocused ? 'text-[#B91C1C]' : 'text-gray-300 group-hover:text-gray-400'}`}>
              <Icon size={18} />
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 px-1 animate-fade-in">
          <AlertCircle size={12} className="text-red-500" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</span>
        </div>
      )}
    </div>
  );
};

export const PremiumCard = ({ children, className = "", title, icon: Icon, action, footer }: any) => (
  <div className={`bg-white dark:bg-[#0F1623] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${className}`}>
    {(title || Icon) && (
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/20">
        <div className="flex items-center gap-3">
          {Icon && <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg"><Icon size={18} className="text-[#B91C1C]" /></div>}
          <h3 className="font-black text-[11px] text-gray-900 dark:text-gray-100 uppercase tracking-widest">{title}</h3>
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
    {footer && <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/10 border-t border-gray-100 dark:border-gray-800">{footer}</div>}
  </div>
);

export const Badge = ({ children, variant = "default" }: any) => {
    const variants: any = {
        default: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 font-bold",
        danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-black",
        success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 font-black",
        warning: "bg-[#FEF3C7] text-[#92400E] dark:bg-amber-900/30 dark:text-amber-400 font-black",
        info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-black",
    };
    return <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border border-transparent ${variants[variant]}`}>{children}</span>;
};

export const StatCard = ({ title, value, change, trend, icon: Icon, color = "red" }: any) => (
  <div className="bg-white dark:bg-[#0F1623] border border-gray-200 dark:border-gray-800 p-6 rounded-[1.5rem] relative overflow-hidden group hover:border-[#B91C1C]/50 transition-all duration-500 shadow-sm hover:shadow-lg">
      <div className={`absolute -top-2 -right-2 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 ${color === 'red' ? 'text-[#B91C1C]' : 'text-blue-500'}`}>
          {Icon && <Icon size={48} />}
      </div>
      <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">
          <div className={`w-1.5 h-1.5 rounded-full ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {title}
      </div>
      <div className="flex items-end justify-between">
          <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {change}
          </div>
      </div>
  </div>
);

export const ExpertCard = ({ name, role, tags }: any) => (
  <div className="bg-white dark:bg-[#0F1623] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden w-full group hover:border-[#B91C1C] transition-all duration-500">
     <div className="p-4 flex items-start gap-4">
        <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 group-hover:border-[#B91C1C]/30 transition-colors shadow-inner">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="Expert" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0F1623] rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-black text-gray-900 dark:text-gray-100 text-sm tracking-tight truncate uppercase">{name}</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{role}</p>
        </div>
     </div>
     <div className="px-4 pb-4 flex flex-wrap gap-1.5">
        {tags.map((t: string, i: number) => (
            <span key={i} className="px-1.5 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-[9px] font-black rounded-lg border border-gray-100 dark:border-gray-700 uppercase tracking-tighter transition-colors">{t}</span>
        ))}
     </div>
  </div>
);

export const NoteCard = () => (
  <div className="bg-[#FFFBEB] dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30 overflow-hidden shadow-sm hover:shadow-md transition-all group">
    <div className="p-4 border-b border-amber-100 dark:border-amber-900/20 flex justify-between items-center bg-white/30 dark:bg-transparent">
        <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-500 text-white rounded shadow-sm">
                <Lightbulb size={14} />
            </div>
            <span className="font-black text-amber-900 dark:text-amber-200 text-[10px] uppercase tracking-widest">Strategy Node</span>
        </div>
    </div>
    <div className="p-5">
        <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed italic font-medium">
            "The surge in mini-EV searches indicates a burgeoning urban mobility segment prioritizing flexibility."
        </p>
    </div>
  </div>
);