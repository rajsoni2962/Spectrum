import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Zap,
  Network,
  Compass,
  FlaskConical,
  Clock,
  AlertTriangle,
  ChevronRight,
  Radio,
  Binary,
  Layers,
  Cpu,
} from "lucide-react";
import { fetchDashboardSummary } from "../services/api";
import { RadialPercentageGauge } from "../components/RadialPercentageGauge";
import { LiveRadarWidget } from "../components/LiveRadarWidget";
import { TemporalRiskChart } from "../components/TemporalRiskChart";
import { LiveThreatStreamCanvas } from "../components/LiveThreatStreamCanvas";
import { LivePacketFluxVisualizer } from "../components/LivePacketFluxVisualizer";
import { RollingNumber } from "../components/RollingNumber";

interface DashboardProps {
  setActivePage: (page: string) => void;
  navigateWithPivot?: (page: string, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActivePage, navigateWithPivot }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchDashboardSummary();
      setData(res);
      setLoading(false);
      const now = new Date();
      setLastUpdated(
        `${String(now.getUTCHours()).padStart(2, "0")}:${String(
          now.getUTCMinutes()
        ).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")} UTC`
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  const handlePivot = (page: string, params?: any) => {
    if (navigateWithPivot) {
      navigateWithPivot(page, params);
    } else {
      setActivePage(page);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96 text-xs font-mono text-[#64748B]">
        <Activity className="w-4 h-4 animate-spin text-[#BE185D] mr-2" />
        LOADING COMMAND CENTER POSTURE...
      </div>
    );
  }

  const {
    kpis = {
      network_health_percent: 94.2,
      current_threat_level: "Normal",
      overall_attack_risk: 7.4,
      active_incidents: 1,
      events_per_minute: 8400,
      model_confidence: 96.4,
      forecast_horizon_seconds: 300,
      predicted_attack: "Normal",
      is_simulated: false,
    },
    live_threat_feed = [],
  } = data || {};

  const isThreatActive = kpis.overall_attack_risk > 50 || kpis.current_threat_level !== "Normal";

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-text font-sans">
      {/* 1. Command Center Executive Posture Header with Ambient Video Loop */}
      <div className="relative bg-white border border-[#F3E8E8] rounded-2xl overflow-hidden shadow-xs">
        {/* Ambient Looping Telemetry Video Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-10"
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
          {/* Cream / Ivory Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-[#FAF8F5]/85 to-white/90" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#BE185D] font-bold">
                SPECTRUM DEMO CONSOLE
              </span>
              <span className="text-[#CBD5E1]">/</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isThreatActive
                    ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] animate-pulse"
                    : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isThreatActive ? "bg-[#E11D48]" : "bg-[#059669]"
                  }`}
                />
                {isThreatActive ? "ATTACK ESCALATION DETECTED" : "POSTURE NOMINAL"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
              Command Center & Threat Telemetry
            </h1>

            <p className="text-xs text-[#64748B] max-w-2xl leading-relaxed">
              Real-time network surveillance, AI early attack prediction, and autonomous
              containment workflows across monitored enterprise networks.
            </p>
          </div>

          {/* Right Status & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {/* Monitored Scope Tag */}
            <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-[#E2E8F0] text-xs font-mono text-[#64748B] flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#BE185D]" />
              <span className="text-[#0F172A] font-medium">10.0.1.0/24 DMZ</span>
            </div>

            {/* Live UTC Clock & Mode */}
            <div className="px-3 py-1.5 rounded-lg bg-white/90 border border-[#E2E8F0] text-xs font-mono text-[#64748B] flex items-center gap-2 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="text-[#0F172A] font-medium">{lastUpdated || "LIVE"}</span>
              <span className="text-[#E2E8F0]">|</span>
              <span className={kpis.is_simulated ? "text-[#B45309]" : "text-[#BE185D] font-semibold"}>
                {kpis.is_simulated ? "SIMULATION LAB" : "LIVE TAP"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual KPI Cards with Radial Percentage Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Threat Risk Radial Gauge */}
        <div
          onClick={() => handlePivot("attack_forecast")}
          title="Threat Probability: Overall likelihood of network attack escalation based on live traffic patterns"
          className="bg-white border border-[#F3E8E8] hover:border-[#BE185D]/40 rounded-xl p-4 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Threat Probability
            </span>
            <Zap className="w-4 h-4 text-[#BE185D] group-hover:scale-110 transition-transform" />
          </div>

          <div className="my-2 flex items-center justify-center">
            <RadialPercentageGauge
              value={kpis.overall_attack_risk}
              size={100}
              strokeWidth={8}
              color={isThreatActive ? "#E11D48" : "#059669"}
              bgColor="#F3E8E8"
              pulse={isThreatActive}
              label={isThreatActive ? "Elevated Anomaly" : "Baseline Risk"}
              sublabel={isThreatActive ? kpis.predicted_attack : "Low Trajectory"}
            />
          </div>

          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono">
            <span className={isThreatActive ? "text-[#E11D48] font-semibold" : "text-[#64748B]"}>
              {isThreatActive ? "Action Required" : "Zero Impact"}
            </span>
            <span className="text-[#BE185D] group-hover:underline flex items-center gap-0.5 font-medium">
              Forecast <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Network Health & Defense Readiness Radial Gauge */}
        <div
          onClick={() => handlePivot("attack_forecast")}
          title="Defense Readiness: Health baseline of monitored assets against historical daily normal traffic"
          className="bg-white border border-[#F3E8E8] hover:border-[#BE185D]/40 rounded-xl p-4 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Defense Readiness
            </span>
            <ShieldCheck className="w-4 h-4 text-[#059669] group-hover:scale-110 transition-transform" />
          </div>

          <div className="my-2 flex items-center justify-center">
            <RadialPercentageGauge
              value={kpis.network_health_percent}
              size={100}
              strokeWidth={8}
              color="#059669"
              bgColor="#F3E8E8"
              label="System Health"
              sublabel="Daily Normal"
            />
          </div>

          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#64748B]">Normal Baseline</span>
            <span className="text-[#BE185D] group-hover:underline flex items-center gap-0.5 font-medium">
              Profile <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: AI Model Inference Confidence Radial Gauge */}
        <div
          onClick={() => handlePivot("model_performance")}
          title="Model Accuracy: Real-time confidence score and F1 precision of the Random Forest attack classifier"
          className="bg-white border border-[#F3E8E8] hover:border-[#BE185D]/40 rounded-xl p-4 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Model Accuracy
            </span>
            <Cpu className="w-4 h-4 text-[#BE185D] group-hover:scale-110 transition-transform" />
          </div>

          <div className="my-2 flex items-center justify-center">
            <RadialPercentageGauge
              value={kpis.model_confidence}
              size={100}
              strokeWidth={8}
              color="#BE185D"
              bgColor="#F3E8E8"
              label="AI Detector"
              sublabel="96% Accuracy (F1)"
            />
          </div>

          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#BE185D] font-semibold">+60m Forecast</span>
            <span className="text-[#BE185D] group-hover:underline flex items-center gap-0.5 font-medium">
              Explain <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Ingress Flow Throughput */}
        <div
          onClick={() => handlePivot("live_monitor")}
          title="Live Network Feed: Real-time packets per second captured losslessly from the 10 Gbps network TAP"
          className="bg-white border border-[#F3E8E8] hover:border-[#BE185D]/40 rounded-xl p-4 transition-all cursor-pointer group shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#F3E8E8]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Live Network Feed
            </span>
            <Activity className="w-4 h-4 text-[#BE185D] group-hover:scale-110 transition-transform" />
          </div>

          <div className="my-2 flex flex-col items-center justify-center text-center">
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#0F172A] tracking-tight">
              <RollingNumber value={kpis.events_per_minute / 60} decimals={0} />
              <span className="text-xs font-normal text-[#64748B] ml-1">pps</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
              <span className="text-xs font-mono text-[#0F172A] font-medium">10 Gbps Live Feed</span>
            </div>
            <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
              Zero Lost Packets · Live Capture
            </div>
          </div>

          <div className="pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#059669]">100% Captured</span>
            <span className="text-[#BE185D] group-hover:underline flex items-center gap-0.5 font-medium">
              Live Stream <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts & Live Radar Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left (7 Cols): Temporal Risk Waveform Chart with Multi-Class Probability Bars */}
        <div className="lg:col-span-7">
          <TemporalRiskChart
            currentRisk={kpis.overall_attack_risk}
            predictedAttack={kpis.predicted_attack}
            isThreatActive={isThreatActive}
            onInspectForecast={() => handlePivot("attack_forecast")}
          />
        </div>

        {/* Right (5 Cols): Live Spatial Perimeter Telemetry Radar */}
        <div className="lg:col-span-5">
          <LiveRadarWidget
            isThreatActive={isThreatActive}
            onSelectTarget={(target) => handlePivot("investigation", { targetIp: target.ip })}
          />
        </div>
      </div>

      {/* 4. Real-time Live Packet Stream Canvas & 36-Band Flux FFT Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left (6 Cols): Interactive 2D Canvas Topology with Traveling Data Pulses */}
        <div className="lg:col-span-6">
          <LiveThreatStreamCanvas
            isThreatActive={isThreatActive}
            onSelectNode={(nodeIp) => handlePivot("investigation", { targetIp: nodeIp })}
          />
        </div>

        {/* Right (6 Cols): High-Frequency Packet Flux FFT & Shannon Entropy */}
        <div className="lg:col-span-6">
          <LivePacketFluxVisualizer
            pps={kpis.events_per_minute / 60}
            isThreatActive={isThreatActive}
          />
        </div>
      </div>

      {/* 5. Protocol Flow Distribution & Live Security Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Protocol Flow Distribution & Entropy */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-[#BE185D]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                Traffic Types & Protocol Breakdown
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#64748B]">Window: 10,000 Flows</span>
          </div>

          {/* Segmented Protocol Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#FAF8F5]">
              <div style={{ width: "78.4%" }} className="bg-[#BE185D] h-full" title="TCP 78.4%" />
              <div style={{ width: "14.2%" }} className="bg-[#059669] h-full" title="UDP 14.2%" />
              <div style={{ width: "5.8%" }} className="bg-[#D97706] h-full" title="HTTPS 5.8%" />
              <div style={{ width: "1.6%" }} className="bg-[#7C3AED] h-full" title="DNS 1.6%" />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#BE185D]" />
                TCP: <strong className="text-[#0F172A]">78.4%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                UDP: <strong className="text-[#0F172A]">14.2%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                HTTPS: <strong className="text-[#0F172A]">5.8%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                DNS: <strong className="text-[#0F172A]">1.6%</strong>
              </span>
            </div>
          </div>

          {/* Additional Protocol Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#F3E8E8]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Port Activity Pattern</div>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">3.84 bits</div>
              <div className="text-[10px] text-[#059669] mt-0.5">Normal (Not Scanning)</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#F3E8E8]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Connection Request Balance</div>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">
                {isThreatActive ? "0.07 (Heavy Flood)" : "1.02 (Balanced)"}
              </div>
              <div className={isThreatActive ? "text-[10px] text-[#E11D48] mt-0.5" : "text-[10px] text-[#059669] mt-0.5"}>
                {isThreatActive ? "Severe Inbound Flood" : "Healthy Normal Connections"}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Telemetry Signals Feed */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F3E8E8]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#BE185D]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                  Live Security Event Stream
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">Buffer: 8 Events</span>
            </div>

            <div className="divide-y divide-[#F3E8E8] mt-2">
              {live_threat_feed && live_threat_feed.length > 0 ? (
                live_threat_feed.slice(0, 4).map((event: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => handlePivot("alerts")}
                    className="py-2.5 flex items-center justify-between text-xs hover:bg-[#FAF8F5] px-2 rounded transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          event.severity === "CRITICAL" || event.risk_level === "HIGH"
                            ? "bg-[#E11D48] animate-ping"
                            : event.severity === "HIGH" || event.risk_level === "MEDIUM"
                            ? "bg-[#D97706]"
                            : "bg-[#059669]"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="font-mono text-[#0F172A] truncate font-medium group-hover:text-[#BE185D]">
                          {event.message || event.type || "Network Flow Anomaly"}
                        </div>
                        <div className="text-[10px] font-mono text-[#64748B] truncate">
                          {event.source_ip || "10.0.1.15"} → {event.destination_ip || "10.0.1.5"} ({event.protocol || "TCP"})
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                          event.severity === "CRITICAL" || event.risk_level === "HIGH"
                            ? "bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]"
                            : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                        }`}
                      >
                        {event.severity || "CRITICAL"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#64748B] font-mono">
                  No critical signals in current sliding buffer
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F3E8E8] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#94A3B8]">Real-time telemetry stream active</span>
            <button
              onClick={() => handlePivot("alerts")}
              className="text-xs font-medium text-[#BE185D] hover:text-[#9D174D] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Alerts ({kpis.active_incidents})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Streamlined Workspace Jump Cards (4 Core Areas) */}
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Specialized Workspaces & Workbenches
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handlePivot("attack_forecast")}
            title="Threat Forecaster — AI predictions of impending attacks and key threat factor explanations"
            className="p-4 rounded-xl bg-white border border-[#F3E8E8] hover:border-[#BE185D]/50 text-left transition-all group cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D] group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-[#BE185D] font-bold">PREDICTIVE</span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mt-3">Threat Forecaster</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Early attack predictions and AI key threat factor explanations.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-xs font-mono text-[#64748B] group-hover:text-[#BE185D]">
              <span>Open View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => handlePivot("network_explorer")}
            title="Network Devices & Connections — Interactive device connectivity map and attack spread paths"
            className="p-4 rounded-xl bg-white border border-[#F3E8E8] hover:border-[#BE185D]/50 text-left transition-all group cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D] group-hover:scale-105 transition-transform">
                  <Network className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-[#BE185D] font-bold">DEVICES</span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mt-3">Network Devices & Connections</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Interactive device map, attack spread path, and affected equipment.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-xs font-mono text-[#64748B] group-hover:text-[#BE185D]">
              <span>Open View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => handlePivot("investigation")}
            title="Device Investigation Workbench — Deep-dive packet inspection, host dossiers, and one-click isolation"
            className="p-4 rounded-xl bg-white border border-[#F3E8E8] hover:border-[#BE185D]/50 text-left transition-all group cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D] group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-[#BE185D] font-bold">INVESTIGATE</span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mt-3">Device Investigation Workbench</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Deep-dive packet inspection, device history dossiers, and one-click isolation.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-xs font-mono text-[#64748B] group-hover:text-[#BE185D]">
              <span>Open View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => handlePivot("simulation_lab")}
            title="Attack Simulator & Drills — Simulate test attacks to evaluate real-time early detection and defense readiness"
            className="p-4 rounded-xl bg-white border border-[#F3E8E8] hover:border-[#BE185D]/50 text-left transition-all group cursor-pointer shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D] group-hover:scale-105 transition-transform">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-[#BE185D] font-bold">DRILLS</span>
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] mt-3">Attack Simulator & Drills</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Simulate test attacks to evaluate real-time early detection and defense readiness.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-[#F3E8E8] flex items-center justify-between text-xs font-mono text-[#64748B] group-hover:text-[#BE185D]">
              <span>Open View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
