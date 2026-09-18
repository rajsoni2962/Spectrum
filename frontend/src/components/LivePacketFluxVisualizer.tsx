import React, { useEffect, useRef, useState } from "react";
import { Activity, Radio, BarChart3, Sliders, Waves, Zap } from "lucide-react";
import { RollingNumber } from "./RollingNumber";

interface LivePacketFluxVisualizerProps {
  pps?: number;
  isThreatActive?: boolean;
}

export const LivePacketFluxVisualizer: React.FC<LivePacketFluxVisualizerProps> = ({
  pps = 140,
  isThreatActive = false,
}) => {
  const [viewMode, setViewMode] = useState<"fft" | "wave">("fft");
  const [entropy, setEntropy] = useState(7.82);
  const [jitter, setJitter] = useState(0.48);
  const [bufferSaturation, setBufferSaturation] = useState(38.4);

  // Bars data
  const BARS_COUNT = 36;
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: BARS_COUNT }, (_, i) => 20 + Math.sin(i * 0.4) * 15 + Math.random() * 20)
  );
  const peaksRef = useRef<number[]>(Array(BARS_COUNT).fill(25));
  const [peaks, setPeaks] = useState<number[]>(Array(BARS_COUNT).fill(25));

  // Dynamic animation loop for live reactive flux
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const updateLoop = () => {
      tick += 0.05;
      const threatMultiplier = isThreatActive ? 1.8 : 1.0;
      const baseFlux = Math.min(Math.max((pps / 200) * 40, 20), 85) * threatMultiplier;

      const newBars = Array.from({ length: BARS_COUNT }, (_, i) => {
        // Compound wave combining sine harmonics + noise
        const w1 = Math.sin(tick * 1.5 + i * 0.25) * 22;
        const w2 = Math.cos(tick * 0.8 + i * 0.4) * 14;
        const noise = (Math.random() - 0.5) * 12;
        const centerFalloff = 1 - Math.abs(i - BARS_COUNT / 2) / (BARS_COUNT / 1.6);
        const val = Math.max(8, Math.min(96, (baseFlux + w1 + w2 + noise) * centerFalloff));
        return val;
      });

      // Update falling peaks
      const newPeaks = peaksRef.current.map((prevPeak, i) => {
        const barVal = newBars[i];
        if (barVal >= prevPeak) {
          return barVal;
        } else {
          return Math.max(barVal, prevPeak - 0.8);
        }
      });
      peaksRef.current = newPeaks;

      setBars(newBars);
      setPeaks([...newPeaks]);

      // Subtle live jitter/entropy drift
      if (Math.random() > 0.85) {
        setEntropy(+(7.75 + Math.random() * 0.2).toFixed(2));
        setJitter(+(0.4 + Math.random() * 0.25).toFixed(2));
        setBufferSaturation(
          isThreatActive ? +(78 + Math.random() * 16).toFixed(1) : +(34 + Math.random() * 8).toFixed(1)
        );
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [pps, isThreatActive]);

  return (
    <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 shadow-xs space-y-4 select-none relative overflow-hidden">
      {/* Subtle background glow when threat active */}
      {isThreatActive && (
        <div className="absolute inset-0 bg-radial from-[#FFE4E6]/40 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3E8E8] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#FDF2F8] border border-[#FCE7F3]">
            <Waves className="w-4 h-4 text-[#BE185D]" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <span>Live Traffic Activity & Waveform Monitor</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] animate-pulse">
                LIVE 60FPS
              </span>
            </h3>
            <p className="text-[11px] text-[#64748B] font-mono">
              Live 36-Channel Activity Meter • Traffic Randomness & Volume
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E2E8F0]">
          <button
            onClick={() => setViewMode("fft")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
              viewMode === "fft"
                ? "bg-white text-[#BE185D] font-bold border border-[#FCE7F3] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Frequency Bars
          </button>
          <button
            onClick={() => setViewMode("wave")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
              viewMode === "wave"
                ? "bg-white text-[#BE185D] font-bold border border-[#FCE7F3] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Continuous Wave
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Bar Visualizer / Waveform */}
      <div className="h-36 sm:h-40 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-3 relative flex items-end justify-between gap-1 overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #F3E8E8 1px, transparent 1px), linear-gradient(to bottom, #F3E8E8 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Zero-line reference */}
        <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-[#E2E8F0] pointer-events-none" />

        {viewMode === "fft" ? (
          // 36-Band Audio-Spectrum style bars with peak dots
          bars.map((height, i) => {
            const peakHeight = peaks[i] || height;
            const isCenterHigh = i >= 12 && i <= 24;
            const barColor = isThreatActive
              ? isCenterHigh
                ? "from-[#E11D48] to-[#D97706]"
                : "from-[#E11D48]/80 to-[#E11D48]/40"
              : isCenterHigh
              ? "from-[#BE185D] to-[#DB2777]"
              : "from-[#BE185D]/70 to-[#F472B6]";

            return (
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center relative group">
                {/* Floating Peak Indicator Line */}
                <div
                  className="absolute w-full h-0.5 bg-[#0F172A] rounded-full transition-all duration-75 shadow-xs"
                  style={{ bottom: `${peakHeight}%` }}
                />

                {/* Animated Spectrum Column */}
                <div
                  className={`w-full rounded-t-xs bg-gradient-to-t ${barColor} transition-all duration-75 opacity-90 group-hover:opacity-100`}
                  style={{ height: `${height}%` }}
                />

                {/* Micro tooltip on hover */}
                <div className="absolute -top-8 bg-white border border-[#F3E8E8] text-[9px] font-mono text-[#0F172A] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap shadow-lg">
                  Channel {i + 1}: {height.toFixed(0)}% Activity
                </div>
              </div>
            );
          })
        ) : (
          // Continuous Live Sine Oscilloscope Waveform
          <svg className="w-full h-full" viewBox="0 0 900 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isThreatActive ? "#E11D48" : "#BE185D"} stopOpacity={0.25} />
                <stop offset="100%" stopColor={isThreatActive ? "#E11D48" : "#BE185D"} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Filled Area */}
            <path
              d={
                bars.reduce((acc, h, idx) => {
                  const x = (idx / (bars.length - 1)) * 900;
                  const y = 150 - (h / 100) * 130;
                  return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
                }, "") + " L 900,160 L 0,160 Z"
              }
              fill="url(#waveGradient)"
            />

            {/* Stroke Line */}
            <path
              d={bars.reduce((acc, h, idx) => {
                const x = (idx / (bars.length - 1)) * 900;
                const y = 150 - (h / 100) * 130;
                return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
              }, "")}
              fill="none"
              stroke={isThreatActive ? "#E11D48" : "#BE185D"}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Bottom Telemetry Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Shannon Entropy */}
        <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between">
            <span>Traffic Randomness</span>
            <span className="text-[#BE185D] font-semibold">97.8%</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#0F172A] mt-0.5">
            <RollingNumber value={entropy} decimals={2} />
            <span className="text-xs font-normal text-[#64748B] ml-1">/ 8.0 (Normal)</span>
          </div>
          {/* Micro Progress Bar */}
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[#BE185D] rounded-full transition-all duration-300"
              style={{ width: `${(entropy / 8.0) * 100}%` }}
            />
          </div>
        </div>

        {/* Ingress Buffer Saturation */}
        <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between">
            <span>Buffer Usage</span>
            <span className={isThreatActive ? "text-[#E11D48] font-semibold" : "text-[#059669]"}>
              {isThreatActive ? "HIGH" : "NORMAL"}
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-[#0F172A] mt-0.5">
            <RollingNumber value={bufferSaturation} decimals={1} suffix="%" />
          </div>
          {/* Micro Progress Bar */}
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isThreatActive ? "bg-[#E11D48]" : "bg-[#059669]"
              }`}
              style={{ width: `${bufferSaturation}%` }}
            />
          </div>
        </div>

        {/* Jitter Profile */}
        <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between">
            <span>Latency Delay (Jitter)</span>
            <span className="text-[#64748B]">Low Variance</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#0F172A] mt-0.5">
            <RollingNumber value={jitter} decimals={2} suffix=" ms" />
          </div>
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[#64748B] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(jitter * 80, 100)}%` }}
            />
          </div>
        </div>

        {/* Loss Rate */}
        <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between">
            <span>Packet Lost Rate</span>
            <span className="text-[#059669] font-semibold">0.00%</span>
          </div>
          <div className="text-lg font-bold font-mono text-[#059669] mt-0.5">
            100% Captured
          </div>
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-[#059669] rounded-full" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
