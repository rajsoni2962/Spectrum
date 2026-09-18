import React, { useState } from "react";
import { Zap, TrendingUp, TrendingDown, Clock, ShieldAlert } from "lucide-react";

interface TemporalPoint {
  label: string;
  risk: number;
  type: "hist" | "now" | "fc";
  anomaly?: number;
}

interface TemporalRiskChartProps {
  currentRisk?: number;
  predictedAttack?: string;
  isThreatActive?: boolean;
  onInspectForecast?: () => void;
}

export const TemporalRiskChart: React.FC<TemporalRiskChartProps> = ({
  currentRisk = 7.4,
  predictedAttack = "Normal",
  isThreatActive = false,
  onInspectForecast,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TemporalPoint | null>(null);

  // Generate smooth 11-point timeline curve (-25m to Now to +12m)
  const isSevere = isThreatActive || currentRisk > 40;
  const points: TemporalPoint[] = [
    { label: "-25m", risk: isSevere ? 12 : 5.8, type: "hist", anomaly: 0.04 },
    { label: "-20m", risk: isSevere ? 18 : 6.2, type: "hist", anomaly: 0.05 },
    { label: "-15m", risk: isSevere ? 29 : 7.0, type: "hist", anomaly: 0.08 },
    { label: "-10m", risk: isSevere ? 48 : 6.8, type: "hist", anomaly: 0.12 },
    { label: "-5m", risk: isSevere ? 72 : 7.2, type: "hist", anomaly: 0.35 },
    { label: "Now", risk: currentRisk, type: "now", anomaly: isSevere ? 0.94 : 0.06 },
    { label: "+2.5m", risk: isSevere ? Math.min(currentRisk + 3.5, 99.4) : 8.0, type: "fc", anomaly: 0.96 },
    { label: "+5m", risk: isSevere ? Math.min(currentRisk + 6.2, 99.8) : 7.6, type: "fc", anomaly: 0.96 },
    { label: "+7.5m", risk: isSevere ? Math.min(currentRisk + 8.1, 100) : 7.1, type: "fc", anomaly: 0.95 },
    { label: "+10m", risk: isSevere ? Math.min(currentRisk + 9.4, 100) : 6.8, type: "fc", anomaly: 0.95 },
    { label: "+12.5m", risk: isSevere ? Math.min(currentRisk + 10.0, 100) : 6.4, type: "fc", anomaly: 0.94 },
  ];

  // SVG Geometry
  const width = 800;
  const height = 210;
  const padL = 40;
  const padR = 25;
  const padT = 20;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const getX = (idx: number) => padL + (idx / (points.length - 1)) * plotW;
  const getY = (val: number) => padT + plotH - (Math.min(Math.max(val, 0), 100) / 100) * plotH;

  const nowIdx = points.findIndex((p) => p.type === "now");
  const nowX = getX(nowIdx);
  const nowY = getY(points[nowIdx].risk);

  // Historical SVG Line & Area
  const histPoints = points.slice(0, nowIdx + 1);
  const histPath = histPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.risk)}`).join(" ");
  const histArea = `${histPath} L ${nowX} ${padT + plotH} L ${padL} ${padT + plotH} Z`;

  // Forecast SVG Line (Dashed) & Area
  const fcPoints = points.slice(nowIdx);
  const fcPath = fcPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(nowIdx + i)} ${getY(p.risk)}`)
    .join(" ");
  const fcArea = `${fcPath} L ${getX(points.length - 1)} ${padT + plotH} L ${nowX} ${padT + plotH} Z`;

  // Multi-Class Attack Probability Breakdown
  const threatProbabilities = [
    { name: "Server Flood Attack (DDoS)", probability: isSevere ? 96.4 : 3.2, color: "#E11D48" },
    { name: "Port Scanning (Finding Open Doors)", probability: isSevere ? 34.2 : 4.8, color: "#D97706" },
    { name: "Password Guessing (Brute Force)", probability: isSevere ? 18.5 : 2.1, color: "#2563EB" },
    { name: "Secret Data Leak (DNS Tunneling)", probability: isSevere ? 4.8 : 0.8, color: "#7C3AED" },
  ];

  return (
    <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#BE185D]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
              Threat Risk Timeline & Prediction Curve
            </h3>
            <p className="text-[10px] font-mono text-[#64748B]">
              Risk Trend (-25 min past → Observed Now → +12.5 min predicted horizon)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#64748B]">
            <span className="w-2.5 h-0.5 bg-[#BE185D] rounded-full" />
            Past Observed
          </span>
          <span className="flex items-center gap-1.5 text-[#BE185D]">
            <span className="w-2.5 h-0.5 border-b border-dashed border-[#BE185D]" />
            AI Predicted Forecast (+60m)
          </span>
        </div>
      </div>

      {/* SVG Canvas Container with Tooltip */}
      <div className="relative bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-2 overflow-hidden select-none">
        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute top-2 right-3 z-30 px-3 py-1.5 rounded bg-white border border-[#F3E8E8] text-xs font-mono shadow-xl animate-in fade-in duration-100 pointer-events-none"
          >
            <div className="text-[10px] text-[#64748B] uppercase font-semibold">
              Interval: {hoveredPoint.label} ({hoveredPoint.type === "fc" ? "PROJECTED" : "OBSERVED"})
            </div>
            <div className="text-[#0F172A] font-bold mt-0.5 flex items-center gap-2">
              <span>Risk:</span>
              <span
                className={
                  hoveredPoint.risk > 50
                    ? "text-[#E11D48]"
                    : hoveredPoint.risk > 20
                    ? "text-[#D97706]"
                    : "text-[#059669]"
                }
              >
                {hoveredPoint.risk.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-56">
          <defs>
            {/* Historical Gradient */}
            <linearGradient id="histGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BE185D" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#BE185D" stopOpacity={0.0} />
            </linearGradient>

            {/* Forecast Gradient */}
            <linearGradient id="fcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BE185D" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#BE185D" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Grid Horizontal Reference Lines */}
          {[25, 50, 75, 100].map((lvl) => {
            const y = getY(lvl);
            return (
              <g key={lvl}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
                <text
                  x={padL - 6}
                  y={y + 3}
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {lvl}%
                </text>
              </g>
            );
          })}

          {/* Shaded Forecast Zone Background */}
          <rect
            x={nowX}
            y={padT}
            width={width - padR - nowX}
            height={plotH}
            fill="#FDF2F8"
            fillOpacity="0.5"
          />

          {/* Area Fills */}
          <path d={histArea} fill="url(#histGradient)" />
          <path d={fcArea} fill="url(#fcGradient)" />

          {/* Historical Trajectory Path */}
          <path
            d={histPath}
            fill="none"
            stroke="#BE185D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Forecast Projected Path (Dashed) */}
          <path
            d={fcPath}
            fill="none"
            stroke="#BE185D"
            strokeWidth="2.5"
            strokeDasharray="4,4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* NOW Vertical Boundary Marker */}
          <line
            x1={nowX}
            y1={padT}
            x2={nowX}
            y2={padT + plotH}
            stroke="#0F172A"
            strokeWidth="1.5"
            strokeDasharray="2,2"
            strokeOpacity="0.35"
          />

          {/* NOW Point Circle with Glowing Ring */}
          <circle cx={nowX} cy={nowY} r="5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2" />
          <circle
            cx={nowX}
            cy={nowY}
            r="8"
            fill="none"
            stroke="#BE185D"
            strokeWidth="1"
            className="animate-ping opacity-75"
          />

          {/* Interactive Data Dots */}
          {points.map((p, idx) => {
            const x = getX(idx);
            const y = getY(p.risk);
            const isNow = p.type === "now";

            return (
              <g
                key={idx}
                className="cursor-pointer group/pt"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isNow ? 5 : 3.5}
                  fill={isNow ? "#0F172A" : "#BE185D"}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-transform group-hover/pt:scale-150"
                />
                <rect
                  x={x - 12}
                  y={padT}
                  width="24"
                  height={plotH}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* Bottom X-Axis Interval Labels */}
          {points.map((p, idx) => (
            <text
              key={`lbl-${idx}`}
              x={getX(idx)}
              y={height - 10}
              fill={p.type === "now" ? "#0F172A" : "#64748B"}
              fontSize="9"
              fontFamily="monospace"
              fontWeight={p.type === "now" ? "bold" : "normal"}
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>

      {/* Multi-Class Attack Probability Distribution Bars */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#0F172A] font-semibold mb-2 flex items-center justify-between">
          <span>Attack Type Likelihood Breakdown</span>
          <span className="text-[#64748B] font-normal">Based on Live Traffic Patterns & Indicators</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {threatProbabilities.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#0F172A] font-medium truncate">{t.name}</span>
                <span className="font-bold shrink-0 ml-1.5" style={{ color: t.color }}>
                  {t.probability.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar with animated fill */}
              <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${t.probability}%`,
                    backgroundColor: t.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
