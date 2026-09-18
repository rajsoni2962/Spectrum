import React from "react";

interface RadialPercentageGaugeProps {
  value: number; // 0 to 100
  size?: number; // in pixels
  strokeWidth?: number;
  color?: string; // e.g. "#4ADE80", "#F87171", "#7DD3FC", "#A78BFA"
  bgColor?: string;
  label?: string;
  unit?: string;
  sublabel?: string;
  pulse?: boolean;
}

export const RadialPercentageGauge: React.FC<RadialPercentageGaugeProps> = ({
  value,
  size = 90,
  strokeWidth = 7,
  color = "#BE185D",
  bgColor = "#F3E8E8",
  label,
  unit = "%",
  sublabel,
  pulse = false,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Active Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease",
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex items-baseline font-mono font-bold text-[#0F172A] tracking-tight">
            <span className="text-base sm:text-lg leading-none">{clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}</span>
            <span className="text-[10px] text-[#64748B] ml-0.5">{unit}</span>
          </div>
          {pulse && (
            <span
              className="w-1.5 h-1.5 rounded-full mt-1 animate-ping"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
      </div>

      {(label || sublabel) && (
        <div className="min-w-0">
          {label && (
            <div className="text-xs font-semibold text-[#0F172A] truncate tracking-tight">
              {label}
            </div>
          )}
          {sublabel && (
            <div className="text-[11px] font-mono text-[#64748B] truncate mt-0.5">
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
