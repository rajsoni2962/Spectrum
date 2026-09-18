import React from "react";
import {
  LayoutDashboard,
  Zap,
  BellRing,
  ShieldAlert,
  Crosshair,
  BrainCircuit,
  Compass,
  FileSpreadsheet,
  Network,
  Activity,
  Binary,
  FlaskConical,
  Cpu,
  Database,
  Sliders,
  ArrowLeft,
  Search,
  Keyboard,
  ChevronRight,
} from "lucide-react";
import { PrimaryModule } from "./GlobalRail";

interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isAi?: boolean;
}

interface WorkspaceSubHeaderProps {
  activeModule: PrimaryModule;
  activePage: string;
  setActivePage: (page: string) => void;
  openAlertsCount: number;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}

export const WORKSPACE_PAGES_CONFIG: Record<
  PrimaryModule,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; items: NavItem[] }
> = {
  overview: {
    title: "Command Center",
    subtitle: "Real-time Security Status & Live Network Activity",
    icon: LayoutDashboard,
    items: [
      {
        id: "dashboard",
        label: "Security Status",
        shortLabel: "Status",
        hint: "Live overview of threat alerts, network status, and operational health.",
        icon: LayoutDashboard,
      },
    ],
  },
  detection: {
    title: "Threat Forecasting",
    subtitle: "AI Early Attack Prediction & Key Threat Factors",
    icon: Zap,
    items: [
      {
        id: "attack_forecast",
        label: "Threat Forecast",
        shortLabel: "Forecast",
        hint: "AI early attack prediction, horizon timelines, and decision factors.",
        icon: Zap,
        isAi: true,
      },
      {
        id: "alerts",
        label: "Security Alerts",
        shortLabel: "Alerts",
        hint: "Live feed of detected threats, packet anomalies, and urgent warnings.",
        icon: BellRing,
      },
      {
        id: "incidents",
        label: "Incident Reports",
        shortLabel: "Incidents",
        hint: "Correlated attack cases grouped with affected devices and timelines.",
        icon: ShieldAlert,
      },
      {
        id: "mitre_attack",
        label: "Hacker Tactics (MITRE)",
        shortLabel: "Tactics",
        hint: "Catalog of known attacker techniques mapped to current network activity.",
        icon: Crosshair,
      },
      {
        id: "ai_insights",
        label: "AI Insights",
        shortLabel: "Insights",
        hint: "Automated anomaly findings and machine learning behavioral patterns.",
        icon: BrainCircuit,
        isAi: true,
      },
    ],
  },
  investigation: {
    title: "Forensics & Investigation",
    subtitle: "Device Investigation & Deep Traffic Inspection",
    icon: Compass,
    items: [
      {
        id: "investigation",
        label: "Device Investigation",
        shortLabel: "Investigation",
        hint: "Deep packet inspection (PCAP), suspect device triage, and containment.",
        icon: Compass,
      },
      {
        id: "reports",
        label: "Audit Reports",
        shortLabel: "Reports",
        hint: "Downloadable executive security audits, posture reports, and briefs.",
        icon: FileSpreadsheet,
      },
    ],
  },
  monitoring: {
    title: "Network & Traffic",
    subtitle: "Connected Devices, Live Traffic Streams & Protocol Breakdown",
    icon: Network,
    items: [
      {
        id: "network_explorer",
        label: "Device Map",
        shortLabel: "Map",
        hint: "Interactive map of connected network nodes, firewalls, and servers.",
        icon: Network,
      },
      {
        id: "live_monitor",
        label: "Live Traffic Stream",
        shortLabel: "Traffic",
        hint: "Continuous 60FPS packet feed, 36-channel frequency meter & bandwidth.",
        icon: Activity,
      },
      {
        id: "traffic_analysis",
        label: "Traffic Breakdown",
        shortLabel: "Breakdown",
        hint: "Protocol distributions (TCP, UDP, HTTPS, DNS) and flow statistics.",
        icon: Binary,
      },
    ],
  },
  settings: {
    title: "Simulation & Platform",
    subtitle: "Attack Drills, AI Accuracy Checks & System Health",
    icon: Sliders,
    items: [
      {
        id: "simulation_lab",
        label: "Attack Simulator",
        shortLabel: "Drills",
        hint: "Inject synthetic attack scenarios to test detection and defense readiness.",
        icon: FlaskConical,
      },
      {
        id: "model_performance",
        label: "AI Accuracy Checks",
        shortLabel: "AI Models",
        hint: "Validation benchmarks, model accuracy, and detection confidence scores.",
        icon: Cpu,
        isAi: true,
      },
      {
        id: "data_sources",
        label: "Network Sensors",
        shortLabel: "Sensors",
        hint: "Status of 10 Gbps network capture interfaces, SPAN feeds, and sensors.",
        icon: Database,
      },
      {
        id: "system_health",
        label: "System Health",
        shortLabel: "Health",
        hint: "Server CPU, memory, API latency, and real-time service uptime.",
        icon: Activity,
      },
      {
        id: "settings",
        label: "Platform Settings",
        shortLabel: "Settings",
        hint: "Configure automated response rules, notifications, and alert thresholds.",
        icon: Sliders,
      },
    ],
  },
};

export const WorkspaceSubHeader: React.FC<WorkspaceSubHeaderProps> = ({
  activeModule,
  activePage,
  setActivePage,
  openAlertsCount,
  onOpenSearch,
  onOpenShortcuts,
}) => {
  const currentConfig = WORKSPACE_PAGES_CONFIG[activeModule] || WORKSPACE_PAGES_CONFIG.overview;
  const isDashboard = activePage === "dashboard";
  const WorkspaceIcon = currentConfig.icon;

  return (
    <nav aria-label="Workspace Sub-Navigation" className="bg-white border border-[#F3E8E8] rounded-xl mb-5 px-3 sm:px-4 py-2.5 shadow-sm select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Workspace Title & Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Back to Command Center Button (visible when not on dashboard) */}
          {!isDashboard && (
            <button
              onClick={() => setActivePage("dashboard")}
              title="Return to Command Center (G then D)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] text-xs font-mono transition-colors cursor-pointer group shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Command Center</span>
            </button>
          )}

          {/* Sibling Page Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full scrollbar-none">
            {currentConfig.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              const badgeCount = item.id === "alerts" ? openAlertsCount : item.badge;

              return (
                <div key={item.id} className="relative group/pill shrink-0">
                  <button
                    onClick={() => setActivePage(item.id)}
                    title={`${item.label} — ${item.hint || ""}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] shadow-xs"
                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${
                        isActive
                          ? "text-[#BE185D]"
                          : "text-[#94A3B8]"
                      }`}
                    />
                    <span>{item.label}</span>

                    {/* Alert / Incident Badge */}
                    {badgeCount !== undefined && badgeCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]">
                        {badgeCount}
                      </span>
                    )}

                    {/* AI Tag */}
                    {item.isAi && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3]">
                        AI
                      </span>
                    )}
                  </button>

                  {/* Floating Hover Hint Tooltip */}
                  {item.hint && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white border border-[#F3E8E8] rounded-lg shadow-xl text-[11px] font-sans opacity-0 pointer-events-none group-hover/pill:opacity-100 transition-all duration-150 z-50 w-52 text-left hidden sm:block">
                      <div className="font-semibold text-[#0F172A] text-[11px] pb-0.5 border-b border-[#F3E8E8] flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.isAi && (
                          <span className="text-[9px] font-mono px-1 rounded bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3]">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#64748B] mt-1 leading-snug font-normal">
                        {item.hint}
                      </p>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-[#F3E8E8] rotate-45" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-[#F3E8E8]">
          {/* Quick Search Button */}
          <div className="relative group/action">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-mono text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
              title="Search demo console assets, views, and actions (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span className="hidden sm:inline text-[11px]">Quick Jump</span>
              <kbd className="hidden md:inline px-1 py-0.2 bg-white border border-[#E2E8F0] rounded text-[9px] text-[#64748B] font-mono">
                Ctrl+K
              </kbd>
            </button>
            <div className="absolute bottom-full mb-2 right-0 px-2.5 py-1 bg-white border border-[#F3E8E8] rounded-lg shadow-xl text-[10px] font-sans text-[#64748B] opacity-0 pointer-events-none group-hover/action:opacity-100 transition-opacity z-50 whitespace-nowrap hidden sm:block">
              Quick search palette & command finder (Ctrl+K)
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white border-r border-b border-[#F3E8E8] rotate-45" />
            </div>
          </div>

          {/* Shortcuts Help Button */}
          <div className="relative group/action">
            <button
              onClick={onOpenShortcuts}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-mono text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
              title="Keyboard shortcuts cheat sheet (?)"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#94A3B8]" />
              <kbd className="px-1 py-0.2 bg-white border border-[#E2E8F0] rounded text-[9px] text-[#64748B] font-mono">
                ?
              </kbd>
            </button>
            <div className="absolute bottom-full mb-2 right-0 px-2.5 py-1 bg-white border border-[#F3E8E8] rounded-lg shadow-xl text-[10px] font-sans text-[#64748B] opacity-0 pointer-events-none group-hover/action:opacity-100 transition-opacity z-50 whitespace-nowrap hidden sm:block">
              View keyboard navigation hotkeys (?)
              <div className="absolute -bottom-1 right-2 w-2 h-2 bg-white border-r border-b border-[#F3E8E8] rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
