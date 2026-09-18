import React, { useEffect, useRef, useState } from "react";
import { Radio, ShieldAlert, Crosshair, Server } from "lucide-react";

interface RadarTarget {
  id: string;
  name: string;
  ip: string;
  angle: number; // in degrees (0 to 360)
  distanceRatio: number; // 0.2 to 0.85
  risk: "NORMAL" | "HIGH" | "CRITICAL";
  activity: string;
}

interface LiveRadarWidgetProps {
  isThreatActive?: boolean;
  onSelectTarget?: (target: RadarTarget) => void;
}

export const LiveRadarWidget: React.FC<LiveRadarWidgetProps> = ({
  isThreatActive = false,
  onSelectTarget,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<RadarTarget | null>(null);

  const targets: RadarTarget[] = [
    {
      id: "t1",
      name: "web-prod-01",
      ip: "10.0.1.15",
      angle: 42,
      distanceRatio: 0.52,
      risk: isThreatActive ? "CRITICAL" : "NORMAL",
      activity: isThreatActive ? "Heavy Inbound Flood" : "Normal Web Traffic",
    },
    {
      id: "t2",
      name: "dc-kerberos-auth",
      ip: "10.0.1.5",
      angle: 158,
      distanceRatio: 0.38,
      risk: "NORMAL",
      activity: "User Login Authentication",
    },
    {
      id: "t3",
      name: "pg-cluster-db",
      ip: "10.0.1.20",
      angle: 265,
      distanceRatio: 0.44,
      risk: "NORMAL",
      activity: "Encrypted Database Sync",
    },
    {
      id: "t4",
      name: "gw-perimeter-fw",
      ip: "10.0.1.1",
      angle: 310,
      distanceRatio: 0.72,
      risk: "NORMAL",
      activity: "Firewall Traffic Filter",
    },
    {
      id: "t5",
      name: isThreatActive ? "external-botnet" : "dmz-proxy-02",
      ip: isThreatActive ? "198.51.100.44" : "10.0.1.18",
      angle: 85,
      distanceRatio: 0.84,
      risk: isThreatActive ? "CRITICAL" : "NORMAL",
      activity: isThreatActive ? "Distributed Flood Attack" : "Live Traffic Feed",
    },
  ];

  return (
    <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle Background Radial Glow */}
      <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-[#FDF2F8] blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3 z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-[#BE185D]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#BE185D] animate-ping" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
              Perimeter Security Radar
            </h3>
            <p className="text-[10px] font-mono text-[#64748B]">
              Live 360° Device & Traffic Range Scan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E2E8F0] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            SCAN: <strong className="text-[#0F172A]">Real-time</strong>
          </span>
        </div>
      </div>

      {/* Radar Screen Area */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-[#F3E8E8] bg-[#FAF8F5] overflow-hidden shadow-inner flex items-center justify-center select-none">
          {/* Radar Grid - Concentric Range Rings */}
          <div className="absolute w-[80%] h-[80%] rounded-full border border-[#E2E8F0]" />
          <div className="absolute w-[56%] h-[56%] rounded-full border border-[#E2E8F0]" />
          <div className="absolute w-[32%] h-[32%] rounded-full border border-[#E2E8F0]" />

          {/* Crosshair Axes */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#E2E8F0]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-[#E2E8F0]" />

          {/* Degree Markers */}
          <span className="absolute top-1 text-[8px] font-mono text-[#94A3B8]">000°</span>
          <span className="absolute right-1 text-[8px] font-mono text-[#94A3B8]">090°</span>
          <span className="absolute bottom-1 text-[8px] font-mono text-[#94A3B8]">180°</span>
          <span className="absolute left-1 text-[8px] font-mono text-[#94A3B8]">270°</span>

          {/* Continuous Rotating Radar Sweep Line with Phosphor Trail */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              animation: "radarSweep 5s linear infinite",
              background:
                "conic-gradient(from 0deg, rgba(190, 24, 93, 0.22) 0deg, rgba(190, 24, 93, 0.05) 35deg, transparent 65deg)",
            }}
          />

          {/* Center Sensor Beacon */}
          <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#BE185D] shadow-[0_0_8px_#BE185D]">
            <span className="absolute inset-0 rounded-full bg-[#BE185D] animate-ping opacity-75" />
          </div>

          {/* Plotted Monitored Asset Target Nodes */}
          {targets.map((t) => {
            // Convert angle and distance to X, Y percentages
            const rad = ((t.angle - 90) * Math.PI) / 180;
            const x = 50 + t.distanceRatio * 50 * Math.cos(rad);
            const y = 50 + t.distanceRatio * 50 * Math.sin(rad);
            const isCrit = t.risk === "CRITICAL";

            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTarget(t);
                  if (onSelectTarget) onSelectTarget(t);
                }}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group/node p-1 cursor-pointer focus:outline-none"
                title={`${t.name} (${t.ip}) - ${t.activity}`}
              >
                <div className="relative flex items-center justify-center">
                  {/* Ping Ring for Critical / Active Alert */}
                  {isCrit && (
                    <span className="absolute w-6 h-6 rounded-full bg-[#E11D48]/30 animate-ping pointer-events-none" />
                  )}

                  {/* Node Dot */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full border transition-transform group-hover/node:scale-150 ${
                      isCrit
                        ? "bg-[#E11D48] border-[#F43F5E] shadow-[0_0_8px_#E11D48]"
                        : "bg-[#059669] border-[#10B981] shadow-[0_0_6px_#059669]"
                    }`}
                  />

                  {/* Micro Host Label */}
                  <div className="absolute left-3 top-[-6px] hidden sm:block whitespace-nowrap px-1.5 py-0.5 rounded bg-white/95 border border-[#F3E8E8] text-[9px] font-mono text-[#0F172A] opacity-90 group-hover/node:opacity-100 transition-opacity pointer-events-none shadow-xs">
                    {t.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Details Strip / Telemetry Legend */}
      <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-xs font-mono text-[#64748B]">
        {selectedTarget ? (
          <div className="flex items-center justify-between w-full">
            <span className="truncate">
              Target: <strong className="text-[#0F172A]">{selectedTarget.name}</strong> ({selectedTarget.ip})
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                selectedTarget.risk === "CRITICAL"
                  ? "bg-[#FFE4E6] text-[#E11D48]"
                  : "bg-[#ECFDF5] text-[#059669]"
              }`}
            >
              {selectedTarget.risk}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              Internal Servers: <strong className="text-[#0F172A]">4 Normal</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isThreatActive ? "bg-[#E11D48]" : "bg-[#94A3B8]"}`} />
              Outside Boundary: <strong className="text-[#0F172A]">{isThreatActive ? "1 Threat Detected" : "Normal"}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Keyframe animation injected inline */}
      <style>{`
        @keyframes radarSweep {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
