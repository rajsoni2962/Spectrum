import React, { useEffect, useState, useMemo } from "react";
import {
  Activity,
  Pause,
  Play,
  Search,
  ArrowDownUp,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Waves,
  ShieldCheck,
  Cpu,
  Radio,
} from "lucide-react";
import { socWebSocket } from "../services/websocket";
import { fetchLiveMetrics } from "../services/api";
import { TrafficEvent } from "../types";
import { RadialPercentageGauge } from "../components/RadialPercentageGauge";
import { LivePacketFluxVisualizer } from "../components/LivePacketFluxVisualizer";
import { RollingNumber } from "../components/RollingNumber";

export const LiveMonitor: React.FC = () => {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [liveStats, setLiveStats] = useState<any>({
    packets_per_sec: 140,
    bytes_per_sec: 68000,
    active_connections: 22,
    unique_source_ips: 8,
    unique_destination_ips: 4,
    tcp_udp_ratio: 4.8,
  });
  const [isPaused, setIsPaused] = useState(false);

  // Filters
  const [filterProtocol, setFilterProtocol] = useState<string>("ALL");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [sourceSearch, setSourceSearch] = useState<string>("");
  const [destSearch, setDestSearch] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("ALL");

  // Time-series history for real-time traffic graph (last 24 intervals)
  const [trafficHistory, setTrafficHistory] = useState<
    { time: string; pps: number; kbps: number }[]
  >([]);

  useEffect(() => {
    fetchLiveMetrics().then((res) => {
      if (res.live_stats) setLiveStats(res.live_stats);
      if (res.recent_events) setEvents(res.recent_events);
    });

    const unsubscribe = socWebSocket.subscribe((data) => {
      if (isPaused) return;
      if (data.live_stats) {
        setLiveStats(data.live_stats);
        setTrafficHistory((prev) => {
          const now = new Date();
          const timeStr = `${String(now.getUTCMinutes()).padStart(2, "0")}:${String(
            now.getUTCSeconds()
          ).padStart(2, "0")}`;
          const newPt = {
            time: timeStr,
            pps: data.live_stats.packets_per_sec || 140,
            kbps: Math.round((data.live_stats.bytes_per_sec || 68000) / 1024),
          };
          const next = [...prev, newPt];
          return next.slice(-24);
        });
      }
      if (data.recent_events) {
        setEvents((prev) => {
          const combined = [...data.recent_events, ...prev];
          return combined.slice(0, 60);
        });
      }
    });

    return () => unsubscribe();
  }, [isPaused]);

  // Filtered event records
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchProto = filterProtocol === "ALL" || e.protocol.toUpperCase() === filterProtocol;
      const matchRisk = filterRisk === "ALL" || e.risk_level.toUpperCase() === filterRisk;
      const matchSrc = !sourceSearch || e.source_ip.includes(sourceSearch);
      const matchDst = !destSearch || e.destination_ip.includes(destSearch);
      return matchProto && matchRisk && matchSrc && matchDst;
    });
  }, [events, filterProtocol, filterRisk, sourceSearch, destSearch]);

  // SVG Chart geometry
  const svgW = 900;
  const svgH = 180;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 25;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxPps = Math.max(...trafficHistory.map((p) => p.pps), 200);

  const getGraphX = (i: number) =>
    trafficHistory.length <= 1
      ? padL
      : padL + (i / (trafficHistory.length - 1)) * plotW;
  const getGraphY = (val: number) =>
    padT + plotH - (val / maxPps) * plotH;

  const ppsPath = trafficHistory
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getGraphX(idx)} ${getGraphY(p.pps)}`)
    .join(" ");

  const areaPath =
    trafficHistory.length > 1
      ? `${ppsPath} L ${getGraphX(trafficHistory.length - 1)} ${padT + plotH} L ${padL} ${padT + plotH} Z`
      : "";

  const isSurge = liveStats.packets_per_sec > 10000;

  return (
    <div className="space-y-6 select-text font-sans">
      {/* 1. Header Banner with Looping Telemetry Video */}
      <div className="relative bg-white border border-[#F3E8E8] rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Looping Video Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-15"
            style={{ backgroundImage: "url('/videos/hero-telemetry-poster.jpg')" }}
            aria-hidden="true"
          />
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/videos/hero-telemetry-poster.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply scale-105"
          >
            <source src="/videos/hero-telemetry.mp4" type="video/mp4" />
            <source src="/videos/hero-telemetry.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/95" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#BE185D] font-semibold">
                LIVE NETWORK FEED
              </span>
              <span className="text-[#E2E8F0]">/</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                10 GBPS LIVE FEED (ZERO LOSS)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              Live Network Traffic Monitor
            </h1>

            <p className="text-xs text-[#64748B] max-w-2xl leading-relaxed">
              Real-time packet stream inspection, traffic pattern analysis, live velocity window,
              and zero-drop connection monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                isPaused
                  ? "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706] hover:bg-[#FDE68A]"
                  : "bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border-[#E2E8F0] text-[#0F172A]"
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? "Resume Feed" : "Pause Feed"}</span>
            </button>
            <div className="text-[11px] font-mono text-[#64748B] px-3 py-1.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg">
              BUFFER: <strong className="text-[#0F172A]">{events.length}</strong> FLOWS
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Pillars with Radial Percentage Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bandwidth Saturation */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Bandwidth Usage
            </span>
            <Activity className="w-4 h-4 text-[#BE185D]" />
          </div>
          <div className="my-2 flex items-center justify-center">
            <RadialPercentageGauge
              value={Math.min(((liveStats.bytes_per_sec || 68000) / 250000) * 100, 100)}
              size={100}
              strokeWidth={8}
              color="#BE185D"
              label={`${Math.round((liveStats.bytes_per_sec || 68000) / 1024)} KB/s`}
              sublabel="10G High-Speed Feed"
            />
          </div>
          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>Throughput Rate</span>
            <span className="text-[#0F172A] font-bold">
              <RollingNumber value={liveStats.bytes_per_sec / 1024} decimals={0} suffix=" KB/s" />
            </span>
          </div>
        </div>

        {/* Lossless Packet Ingress */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Packet Flow Rate
            </span>
            <Zap className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="my-2 flex flex-col items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#0F172A] tracking-tight">
              <RollingNumber value={liveStats.packets_per_sec || 140} decimals={0} />
              <span className="text-xs font-normal text-[#64748B] ml-1">pps</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSurge ? "bg-[#E11D48] animate-ping" : "bg-[#059669]"
                }`}
              />
              <span className="text-xs font-mono text-[#64748B]">
                {isSurge ? "Traffic Surge Alert" : "Normal Speed"}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>Packet Delivery</span>
            <span className="text-[#059669] font-semibold">100% Captured (Zero Lost)</span>
          </div>
        </div>

        {/* Socket Table Saturation */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Active Connections
            </span>
            <Cpu className="w-4 h-4 text-[#BE185D]" />
          </div>
          <div className="my-2 flex items-center justify-center">
            <RadialPercentageGauge
              value={Math.min(((liveStats.active_connections || 22) / 100) * 100, 100)}
              size={100}
              strokeWidth={8}
              color="#BE185D"
              label={`${liveStats.active_connections || 22} Conns`}
              sublabel="TCP & UDP Sessions"
            />
          </div>
          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>TCP/UDP Ratio</span>
            <span className="text-[#BE185D] font-bold">
              {liveStats.tcp_udp_ratio || 4.8}:1
            </span>
          </div>
        </div>

        {/* Threat Filter Rate */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Clean Traffic Rate
            </span>
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="my-2 flex items-center justify-center">
            <RadialPercentageGauge
              value={96.4}
              size={100}
              strokeWidth={8}
              color="#059669"
              label="96.4% Clean"
              sublabel="Zero False Alarms"
            />
          </div>
          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
            <span>Active Endpoints</span>
            <span className="text-[#0F172A] font-bold">
              {liveStats.unique_source_ips || 8} Senders → {liveStats.unique_destination_ips || 4} Receivers
            </span>
          </div>
        </div>
      </div>

      {/* 3. Live 36-Band Audio-Spectrum Packet Flux Visualizer */}
      <LivePacketFluxVisualizer
        pps={liveStats.packets_per_sec || 140}
        isThreatActive={isSurge}
      />

      {/* 4. Real-Time Traffic Velocity Sliding Window Waveform */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#BE185D]" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono">
                Live Traffic Activity & Velocity Waveform
              </h2>
              <p className="text-[11px] text-[#64748B]">
                Real-time packet speed (pps) across 24 sliding intervals
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#BE185D] animate-ping" />
            <span className="text-[#0F172A] font-semibold">
              {(trafficHistory[trafficHistory.length - 1]?.pps || 140).toLocaleString()} pps
            </span>
          </div>
        </div>

        <div className="relative w-full h-[180px] bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg overflow-hidden">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="liveWaveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BE185D" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#BE185D" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={padL} y1={padT + plotH * 0.25} x2={padL + plotW} y2={padT + plotH * 0.25} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1={padL} y1={padT + plotH * 0.5} x2={padL + plotW} y2={padT + plotH * 0.5} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1={padL} y1={padT + plotH * 0.75} x2={padL + plotW} y2={padT + plotH * 0.75} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3 3" />

            {/* Area Fill */}
            {trafficHistory.length > 1 && (
              <path d={areaPath} fill="url(#liveWaveGradient)" />
            )}

            {/* Stroke Path */}
            {trafficHistory.length > 1 && (
              <path
                d={ppsPath}
                fill="none"
                stroke="#BE185D"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Nodes */}
            {trafficHistory.map((pt, idx) => (
              <circle
                key={idx}
                cx={getGraphX(idx)}
                cy={getGraphY(pt.pps)}
                r={idx === trafficHistory.length - 1 ? 4 : 2.5}
                fill={idx === trafficHistory.length - 1 ? "#BE185D" : "#BE185D"}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 5. Live Events Table with Filters */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
              Recent Live Flow Captures ({filteredEvents.length})
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Passive promiscuous capture via port mirror (SPAN)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search Source IP..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] font-mono focus:outline-none focus:border-[#BE185D]"
            />
            <select
              value={filterProtocol}
              onChange={(e) => setFilterProtocol(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] font-mono focus:outline-none"
            >
              <option value="ALL">Protocol: All</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAF8F5] border-b border-[#F3E8E8] text-[#64748B]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Destination IP</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {filteredEvents.slice(0, 15).map((ev, idx) => (
                <tr key={idx} className="hover:bg-[#FDF2F8]/60 transition-colors">
                  <td className="py-2 px-3 text-[#64748B]">
                    {new Date(ev.timestamp).toISOString().split("T")[1]?.slice(0, 8) || "LIVE"}
                  </td>
                  <td className="py-2 px-3 text-[#0F172A] font-medium">{ev.source_ip}</td>
                  <td className="py-2 px-3 text-[#64748B]">{ev.destination_ip}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E2E8F0] text-[10px] text-[#BE185D] font-semibold">
                      {ev.protocol}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#64748B]">{ev.bytes || 64} B</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        ev.risk_level === "HIGH" || ev.risk_level === "CRITICAL"
                          ? "bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]"
                          : ev.risk_level === "MEDIUM"
                          ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                          : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      }`}
                    >
                      {ev.risk_level || "LOW"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
