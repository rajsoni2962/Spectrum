import React, { useState } from "react";
import {
  Server,
  Activity,
  GitCommit,
  AlertTriangle,
  ShieldAlert,
  Zap,
  ArrowRight,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface PipelineStage {
  id: "assets" | "traffic" | "behavior" | "anomalies" | "threats" | "forecast";
  title: string;
  metric: string;
  subtext: string;
  status: "NORMAL" | "ELEVATED" | "CRITICAL";
  icon: React.ComponentType<{ className?: string }>;
  details: { label: string; val: string }[];
}

interface NetworkBehaviorPipelineProps {
  isThreatActive: boolean;
  overallRisk: number;
  predictedAttack: string;
  onSelectStage?: (stageId: string) => void;
  onPivot?: (page: string, params?: any) => void;
}

export const NetworkBehaviorPipeline: React.FC<NetworkBehaviorPipelineProps> = ({
  isThreatActive,
  overallRisk,
  predictedAttack,
  onSelectStage,
  onPivot,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>("forecast");

  const stages: PipelineStage[] = [
    {
      id: "assets",
      title: "Assets & Hosts",
      metric: "12 Monitored",
      subtext: isThreatActive ? "1 target degraded" : "All nodes nominal",
      status: isThreatActive ? "ELEVATED" : "NORMAL",
      icon: Server,
      details: [
        { label: "Target Scope", val: "10.0.1.15 (web-prod-01)" },
        { label: "Subnets", val: "10.0.1.0/24 (DMZ), 10.0.2.0/24" },
        { label: "Critical Assets", val: "Domain Controller, DB Cluster" },
      ],
    },
    {
      id: "traffic",
      title: "Flow Telemetry",
      metric: isThreatActive ? "48.2 MB/s" : "4.2 MB/s",
      subtext: isThreatActive ? "1,840 pps ingress surge" : "180 pps steady",
      status: isThreatActive ? "CRITICAL" : "NORMAL",
      icon: Activity,
      details: [
        { label: "Ingress Protocol", val: isThreatActive ? "TCP SYN (82%)" : "TLS/HTTPS (64%)" },
        { label: "Packet Rate", val: isThreatActive ? "1,840 pps" : "180 pps" },
        { label: "Peak Velocity", val: isThreatActive ? "+420% vs baseline" : "Nominal" },
      ],
    },
    {
      id: "behavior",
      title: "Behavioral State",
      metric: isThreatActive ? "Entropy 4.92" : "Entropy 3.12",
      subtext: isThreatActive ? "SYN/ACK ratio: 18.4" : "SYN/ACK ratio: 1.02",
      status: isThreatActive ? "CRITICAL" : "NORMAL",
      icon: GitCommit,
      details: [
        { label: "Flow Entropy", val: isThreatActive ? "4.92 (High dispersion)" : "3.12 (Normal)" },
        { label: "SYN/ACK Balance", val: isThreatActive ? "18.4 : 1 (Unanswered SYN)" : "1.02 : 1" },
        { label: "Port Variance", val: isThreatActive ? "Targeted Port 443" : "Uniform multi-port" },
      ],
    },
    {
      id: "anomalies",
      title: "Anomalies",
      metric: isThreatActive ? "Score: 0.94" : "Score: 0.08",
      subtext: isThreatActive ? "Isolation Forest flagged" : "Within 2σ bounds",
      status: isThreatActive ? "CRITICAL" : "NORMAL",
      icon: AlertTriangle,
      details: [
        { label: "Algorithm", val: "Isolation Forest (Ensemble)" },
        { label: "Outlier Magnitude", val: isThreatActive ? "+4.8σ deviation" : "+0.3σ baseline" },
        { label: "Telemetry Drift", val: isThreatActive ? "Persistent for 120s" : "None" },
      ],
    },
    {
      id: "threats",
      title: "Attack Detection",
      metric: isThreatActive ? predictedAttack || "DDoS" : "Normal Posture",
      subtext: isThreatActive ? "RF Confidence: 96.4%" : "Model Confidence: 98.8%",
      status: isThreatActive ? "CRITICAL" : "NORMAL",
      icon: ShieldAlert,
      details: [
        { label: "Classifier", val: "Temporal Random Forest" },
        { label: "Confidence", val: isThreatActive ? "96.4%" : "98.8%" },
        { label: "Mitre Technique", val: isThreatActive ? "T1498 (Network Denial)" : "None" },
      ],
    },
    {
      id: "forecast",
      title: "Threat Forecast",
      metric: `${overallRisk.toFixed(1)}% Risk`,
      subtext: isThreatActive ? "Lead time: +5m to +10m" : "Lead time: Nominal",
      status: isThreatActive ? "CRITICAL" : "NORMAL",
      icon: Zap,
      details: [
        { label: "Early Horizon", val: "45s pre-saturation buffer" },
        { label: "Forecast Window", val: "5–10 min lookahead" },
        { label: "Projected Trajectory", val: isThreatActive ? "Escalating to 99%" : "Stable baseline" },
      ],
    },
  ];

  const getStatusColor = (status: "NORMAL" | "ELEVATED" | "CRITICAL") => {
    switch (status) {
      case "CRITICAL":
        return {
          border: "border-[#FECDD3]",
          bg: "bg-[#FFF1F2]",
          text: "text-[#E11D48]",
          dot: "bg-[#E11D48]",
        };
      case "ELEVATED":
        return {
          border: "border-[#FDE68A]",
          bg: "bg-[#FFFBEB]",
          text: "text-[#D97706]",
          dot: "bg-[#D97706]",
        };
      case "NORMAL":
      default:
        return {
          border: "border-[#F3E8E8]",
          bg: "bg-[#FAF8F5]",
          text: "text-[#059669]",
          dot: "bg-[#059669]",
        };
    }
  };

  const activeStageObj = stages.find((s) => s.id === selectedStage) || stages[5];

  return (
    <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3E8E8] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#BE185D] shadow-[0_0_8px_#BE185D]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] font-mono">
            Network Analytical Relationship Pipeline
          </h2>
          <span className="text-[10px] text-[#64748B] font-mono">
            (Network Behavior → Risk → Attack Forecast)
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#64748B] flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            Nominal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
            Breach Vector
          </span>
          <span className="text-[#94A3B8]">| Interactive Pipeline</span>
        </div>
      </div>

      {/* 6-Stage Connected Flow Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage === stage.id;
          const styling = getStatusColor(stage.status);

          return (
            <div
              key={stage.id}
              onClick={() => {
                setSelectedStage(stage.id);
                if (onSelectStage) onSelectStage(stage.id);
              }}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? "bg-[#FDF2F8] border-[#FCE7F3] shadow-sm ring-1 ring-[#BE185D]/30"
                  : `${styling.bg} ${styling.border} hover:border-[#BE185D]/40 hover:bg-[#FDF2F8]/50`
              }`}
            >
              {/* Top Step Number & Status Dot */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-bold text-[#94A3B8]">
                  0{idx + 1}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${styling.dot}`} />
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-1.5 mb-1">
                <Icon
                  className="w-3.5 h-3.5 shrink-0 text-[#BE185D]"
                />
                <span className="text-[11px] font-semibold text-[#0F172A] truncate">
                  {stage.title}
                </span>
              </div>

              {/* Metric & Subtext */}
              <div>
                <div
                  className={`text-xs font-bold font-mono truncate ${
                    stage.status === "CRITICAL"
                      ? "text-[#E11D48]"
                      : stage.status === "ELEVATED"
                      ? "text-[#D97706]"
                      : "text-[#0F172A]"
                  }`}
                >
                  {stage.metric}
                </div>
                <div className="text-[10px] text-[#64748B] truncate mt-0.5">
                  {stage.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Inspector Bar for Selected Pipeline Stage */}
      <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white border border-[#F3E8E8] text-[#BE185D] font-semibold shadow-xs">
            Stage: {activeStageObj.title}
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            {activeStageObj.details.map((d, i) => (
              <span key={i} className="text-[#64748B]">
                <strong className="text-[#94A3B8] font-normal">{d.label}: </strong>
                <span className="text-[#0F172A] font-semibold">{d.val}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Pivot button to drill into that subsystem */}
        {onPivot && (
          <button
            onClick={() => {
              if (activeStageObj.id === "forecast" || activeStageObj.id === "threats") {
                onPivot("attack_forecast");
              } else if (activeStageObj.id === "assets") {
                onPivot("network_explorer");
              } else if (activeStageObj.id === "traffic") {
                onPivot("traffic_analysis");
              } else {
                onPivot("investigation");
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FDF2F8] hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FCE7F3] rounded-lg text-[11px] font-mono font-medium whitespace-nowrap transition-colors cursor-pointer shadow-xs"
          >
            <span>Inspect Stage Deep-Dive</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
