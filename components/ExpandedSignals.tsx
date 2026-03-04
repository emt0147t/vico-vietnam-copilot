import React, { useState } from "react";
import { SignalType } from "@/data/newsModels";

interface ExpandedSignalsProps {
  signals: { type: SignalType; confidence: number }[];
  compact?: boolean;
}

/**
 * Expanded Market Pulse Signals Component
 * Displays all 17 signal types with color coding and icons
 */
export const ExpandedSignals: React.FC<ExpandedSignalsProps> = ({
  signals,
  compact = false,
}) => {
  const signalConfig: Record<
    SignalType,
    { label: string; color: string; icon: string; description: string }
  > = {
    [SignalType.FUNDING]: {
      label: "Tài trợ",
      color: "bg-blue-600",
      icon: "$",
      description: "Gọi vốn, huy động vốn",
    },
    [SignalType.MERGER_ACQUISITION]: {
      label: "M&A",
      color: "bg-purple-600",
      icon: "⇌",
      description: "Sáp nhập, thâu tóm",
    },
    [SignalType.ACQUISITION]: {
      label: "Thâu tóm",
      color: "bg-[#E11D48]",
      icon: "◆",
      description: "Công ty bị thâu tóm",
    },
    [SignalType.PRODUCT_LAUNCH]: {
      label: "Ra mắt SP",
      color: "bg-green-600",
      icon: "▶",
      description: "Sản phẩm, dịch vụ mới",
    },
    [SignalType.IPO]: {
      label: "IPO",
      color: "bg-yellow-600",
      icon: "▲",
      description: "Niêm yết công khai",
    },
    [SignalType.LEGAL_REGULATION]: {
      label: "Pháp lý",
      color: "bg-red-600",
      icon: "§",
      description: "Quy định, vi phạm",
    },
    [SignalType.PERSONNEL]: {
      label: "Nhân sự",
      color: "bg-pink-600",
      icon: "⊕",
      description: "Bổ nhiệm, từ chức",
    },
    [SignalType.EXECUTIVE_CHANGE]: {
      label: "Ban lãnh đạo",
      color: "bg-rose-600",
      icon: "△",
      description: "Đổi lãnh đạo, CEO mới",
    },
    [SignalType.PARTNERSHIP]: {
      label: "Hợp tác",
      color: "bg-cyan-600",
      icon: "⊗",
      description: "Thỏa thuận, liên minh",
    },
    [SignalType.STRATEGIC_ALLIANCE]: {
      label: "Liên minh chiến lược",
      color: "bg-teal-600",
      icon: "◎",
      description: "Hợp tác chiến lược",
    },
    [SignalType.EARNINGS]: {
      label: "Kết quả kinh doanh",
      color: "bg-emerald-600",
      icon: "¤",
      description: "Doanh thu, lợi nhuận",
    },
    [SignalType.EXPANSION]: {
      label: "Mở rộng",
      color: "bg-orange-600",
      icon: "⊞",
      description: "Cơ sở mới, chi nhánh",
    },
    [SignalType.FACILITY_EXPANSION]: {
      label: "Nhà máy mới",
      color: "bg-amber-600",
      icon: "⊟",
      description: "Xây dựng, mở rộng cơ sở",
    },
    [SignalType.TECHNOLOGY_INNOVATION]: {
      label: "Công nghệ",
      color: "bg-[#F97316]",
      icon: "◇",
      description: "AI, bằng sáng chế, 5G",
    },
    [SignalType.MARKET_ENTRY]: {
      label: "Vào thị trường",
      color: "bg-sky-600",
      icon: "→",
      description: "Mở rộng sang thị trường mới",
    },
    [SignalType.INVESTMENT]: {
      label: "Đầu tư",
      color: "bg-lime-600",
      icon: "◈",
      description: "Vòng đầu tư, cấp vốn",
    },
    [SignalType.OTHER]: {
      label: "Khác",
      color: "bg-[#A1A1AA]",
      icon: "•",
      description: "Tín hiệu khác",
    },
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {signals.map((signal, idx) => {
          const config = signalConfig[signal.type];
          return (
            <div
              key={idx}
              className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 tooltip`}
              title={`${config.description} (${(signal.confidence * 100).toFixed(0)}%)`}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              <span className="text-xs opacity-80">
                {(signal.confidence * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Full view
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {signals.map((signal, idx) => {
        const config = signalConfig[signal.type];
        const confidenceBar = (signal.confidence * 100).toFixed(0);

        return (
          <div
            key={idx}
            className={`${config.color} bg-opacity-10 border-2 border-opacity-50 ${config.color.replace("bg-", "border-")} rounded-lg p-4 backdrop-blur-sm hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{config.icon}</span>
              <span className="text-sm font-bold">{confidenceBar}%</span>
            </div>
            <h4 className={`${config.color.replace("bg-", "text-")} font-bold`}>
              {config.label}
            </h4>
            <p className="text-xs text-[#71717A] mt-1">{config.description}</p>
            <div className="mt-3 w-full bg-[#E4E4E7] rounded-full h-2">
              <div
                className={`${config.color} h-2 rounded-full`}
                style={{ width: `${confidenceBar}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpandedSignals;
