import React, { useState } from 'react';
import { 
  Shield, Globe, MoreHorizontal, Star, Briefcase, TrendingUp, 
  Newspaper, Zap, Lightbulb, Plus, Info, X, ArrowUpRight, 
  ArrowDownRight, Target, ShieldCheck, ZapOff, InfoIcon, 
  ChevronRight, AlertCircle 
} from 'lucide-react';

export const Logo = () => (
  <div className="flex items-center gap-3 group cursor-pointer select-none" role="banner">
    <div className="w-11 h-11 bg-gradient-to-br from-[#E11D48] to-[#BE123C] rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#E11D48]/30 group-hover:scale-105 transition-transform duration-300">V</div>
    <div className="flex flex-col">
        <span className="text-xl font-black tracking-tighter text-[#18181B] leading-none">VICO</span>
        <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" aria-hidden="true"></span>
            <span className="text-[10px] font-bold text-[#E11D48] tracking-[0.1em] uppercase leading-none whitespace-nowrap">Vietnam Copilot</span>
        </div>
    </div>
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ElementType;
  error?: string;
  multiline?: boolean;
}

export const EnterpriseInput: React.FC<InputProps & { multiline?: boolean }> = ({ 
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
  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const containerClasses = `
    relative border rounded-xl bg-white transition-all duration-300 group
    ${error ? 'border-red-500 ring-4 ring-red-500/10' : isFocused ? 'border-[#E11D48] ring-4 ring-[#E11D48]/10 shadow-sm' : 'border-[#E4E4E7] hover:border-[#A1A1AA]'}
    ${className}
  `;

  return (
    <div className="w-full space-y-1.5">
      <div className={containerClasses}>
        <div className="px-4 pt-3">
          <label htmlFor={inputId} className={`text-[10px] font-black uppercase tracking-[0.15em] block transition-colors leading-none select-none ${error ? 'text-red-500' : isFocused ? 'text-[#E11D48]' : 'text-[#A1A1AA] group-hover:text-[#71717A]'}`}>
            {label}
          </label>
        </div>
        <div className="flex items-start px-4 pb-3 pt-1 gap-3">
          {multiline ? (
            <textarea
              id={inputId}
              value={props.value as string}
              onChange={props.onChange as any}
              placeholder={props.placeholder}
              required={props.required}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full bg-transparent border-none text-[#18181B] text-[15px] font-medium p-0 focus:ring-0 outline-none placeholder-[#A1A1AA] resize-none min-h-[80px] custom-scrollbar"
              aria-label={label}
              aria-invalid={!!error}
            />
          ) : (
            <input
              id={inputId}
              {...props}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full bg-transparent border-none text-[#18181B] text-[15px] font-medium p-0 focus:ring-0 outline-none placeholder-[#A1A1AA]"
              aria-label={label}
              aria-invalid={!!error}
            />
          )}
          {Icon && (
            <div className={`mt-0.5 transition-colors ${error ? 'text-red-400' : isFocused ? 'text-[#E11D48]' : 'text-[#A1A1AA] group-hover:text-[#A1A1AA]'}`} aria-hidden="true">
              <Icon size={18} />
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 px-1 animate-fade-in" role="alert">
          <AlertCircle size={12} className="text-red-500" />
          <span className="text-[11px] font-bold text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
};

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = "", title, icon: Icon, action, footer }) => (
  <div className={`bg-white border border-[#E4E4E7] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${className}`}>
    {(title || Icon) && (
      <div className="px-6 py-4 border-b border-[#E4E4E7] flex justify-between items-center bg-[#FAFAFA]">
        <div className="flex items-center gap-3">
          {Icon && <div className="p-1.5 bg-red-50 rounded-lg"><Icon size={18} className="text-[#E11D48]" /></div>}
          <h3 className="font-black text-[11px] text-[#18181B] uppercase tracking-widest">{title}</h3>
        </div>
        {action}
      </div>
    )}
    <div className="p-6">{children}</div>
    {footer && <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E4E4E7]">{footer}</div>}
  </div>
);

type BadgeVariant = 'default' | 'danger' | 'success' | 'warning' | 'info';

export const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: BadgeVariant }) => {
    const variants: Record<BadgeVariant, string> = {
        default: "bg-[#F4F4F5] text-[#71717A] font-bold",
        danger: "bg-red-100 text-red-600 font-black",
        success: "bg-green-100 text-green-600 font-black",
        warning: "bg-[#FEF3C7] text-[#92400E] font-black",
        info: "bg-[#FFF1F2] text-[#E11D48] font-black",
    };
    return <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border border-transparent ${variants[variant]}`}>{children}</span>;
};

type StatColor = 'red' | 'blue' | 'green' | 'purple' | 'orange';

export const StatCard = ({ title, value, change, trend, icon: Icon, color = "red" }: { 
  title: string; value: React.ReactNode; change: string; trend: 'up' | 'down'; icon?: React.ElementType; color?: StatColor 
}) => {
  const colorMap: Record<StatColor, string> = {
    red: 'text-[#E11D48]', blue: 'text-[#E11D48]', green: 'text-green-500', purple: 'text-[#E11D48]', orange: 'text-orange-500'
  };
  return (
    <div className="bg-white border border-[#E4E4E7] p-6 rounded-[1.5rem] relative overflow-hidden group hover:border-[#E11D48]/50 transition-all duration-500 shadow-sm hover:shadow-lg">
        <div className={`absolute -top-2 -right-2 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 ${colorMap[color]}`}>
            {Icon && <Icon size={48} />}
        </div>
        <div className="flex items-center gap-2 mb-4 text-[#71717A] text-[10px] font-black uppercase tracking-[0.2em]">
            <div className={`w-1.5 h-1.5 rounded-full ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true"></div>
            {title}
        </div>
        <div className="flex items-end justify-between">
            <div className="text-3xl font-black text-[#18181B] tracking-tighter">{value}</div>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {change}
            </div>
        </div>
    </div>
  );
};

export const ExpertCard = ({ name, role, tags }: { name: string; role: string; tags: string[] }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-[#E4E4E7] overflow-hidden w-full group hover:border-[#E11D48] transition-all duration-500">
     <div className="p-4 flex items-start gap-4">
        <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 overflow-hidden border border-[#E4E4E7] group-hover:border-[#E11D48]/30 transition-colors shadow-inner flex items-center justify-center">
                <span className="text-[#E11D48] font-black text-lg">{name.charAt(0)}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" aria-label="Online"></div>
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-black text-[#18181B] text-sm tracking-tight truncate uppercase">{name}</h3>
            <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider mt-0.5">{role}</p>
        </div>
     </div>
     <div className="px-4 pb-4 flex flex-wrap gap-1.5">
        {tags.map((t: string, i: number) => (
            <span key={i} className="px-1.5 py-1 bg-[#FAFAFA] text-[#71717A] text-[9px] font-black rounded-lg border border-[#E4E4E7] uppercase tracking-tighter transition-colors">{t}</span>
        ))}
     </div>
  </div>
);

export const NoteCard = ({ quote, label }: { quote?: string; label?: string }) => (
  <div className="bg-[#FFFBEB] rounded-2xl border border-amber-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
    <div className="p-4 border-b border-amber-100 flex justify-between items-center bg-white/30">
        <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-500 text-white rounded shadow-sm">
                <Lightbulb size={14} />
            </div>
            <span className="font-black text-amber-900 text-[10px] uppercase tracking-widest">{label || 'Strategic Note'}</span>
        </div>
    </div>
    <div className="p-5">
        <p className="text-sm text-amber-800 leading-relaxed italic font-medium">
            "{quote || 'The surge in mini EV searches reveals an emerging urban mobility segment focused on flexibility.'}"
        </p>
    </div>
  </div>
);