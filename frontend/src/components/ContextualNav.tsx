import React, { useState } from "react";
import {
  LayoutDashboard,
  Network,
  Activity,
  Binary,
  Zap,
  BellRing,
  ShieldAlert,
  Compass,
  FileSpreadsheet,
  Crosshair,
  BrainCircuit,
  Sliders,
  Cpu,
  Database,
  FlaskConical,
  Search,
  X,
} from "lucide-react";
import { PrimaryModule } from "./GlobalRail";
import { SpectrumLogo } from "./SpectrumLogo";

interface SubNavItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isAi?: boolean;
  shortcut?: string;
}

interface ContextualNavProps {
  activeModule: PrimaryModule;
  activePage: string;
  setActivePage: (page: string) => void;
  openAlertsCount: number;
  isOpen: boolean;
}

export const ContextualNav: React.FC<ContextualNavProps> = ({
  activeModule,
  activePage,
  setActivePage,
  openAlertsCount,
  isOpen,
}) => {
  const [filterText, setFilterText] = useState("");

  if (!isOpen) return null;

  const MODULE_SUBNAV: Record<
    PrimaryModule,
    { title: string; subtitle: string; items: SubNavItem[] }
  > = {
    overview: {
      title: "COMMAND CENTER",
      subtitle: "Security Status",
      items: [
        {
          id: "dashboard",
          label: "Command Center",
          description: "Live status & main gauges",
          icon: LayoutDashboard,
          shortcut: "G D",
        },
      ],
    },
    detection: {
      title: "THREAT FORECASTING",
      subtitle: "AI Predictions & Alerts",
      items: [
        {
          id: "attack_forecast",
          label: "Threat Forecast",
          description: "Early warning & key causes",
          icon: Zap,
          isAi: true,
          shortcut: "G F",
        },
        {
          id: "alerts",
          label: "Security Alerts",
          description: "Live list of detected alerts",
          icon: BellRing,
          badge: openAlertsCount,
          shortcut: "G A",
        },
        {
          id: "incidents",
          label: "Incident Reports",
          description: "Grouped attack cases",
          icon: ShieldAlert,
          shortcut: "G I",
        },
        {
          id: "mitre_attack",
          label: "Hacker Tactics (MITRE)",
          description: "Known attack techniques",
          icon: Crosshair,
          shortcut: "G M",
        },
        {
          id: "ai_insights",
          label: "AI Insights",
          description: "Automatic behavior findings",
          icon: BrainCircuit,
          isAi: true,
        },
      ],
    },
    investigation: {
      title: "INVESTIGATION",
      subtitle: "Device Checks & Reports",
      items: [
        {
          id: "investigation",
          label: "Device Investigation",
          description: "Check device packets & history",
          icon: Compass,
          shortcut: "G W",
        },
        {
          id: "reports",
          label: "Audit Reports",
          description: "Official security audit briefs",
          icon: FileSpreadsheet,
          shortcut: "G R",
        },
      ],
    },
    monitoring: {
      title: "NETWORK & TRAFFIC",
      subtitle: "Devices & Live Traffic",
      items: [
        {
          id: "network_explorer",
          label: "Device Map",
          description: "Connected devices & relations",
          icon: Network,
          shortcut: "G N",
        },
        {
          id: "live_monitor",
          label: "Live Traffic Stream",
          description: "Real-time network traffic feed",
          icon: Activity,
          shortcut: "G L",
        },
        {
          id: "traffic_analysis",
          label: "Traffic Breakdown",
          description: "Protocols & pattern checks",
          icon: Binary,
          shortcut: "G T",
        },
      ],
    },
    settings: {
      title: "SIMULATION & PLATFORM",
      subtitle: "Attack Drills & Health",
      items: [
        {
          id: "simulation_lab",
          label: "Attack Simulator",
          description: "Run test attack drills",
          icon: FlaskConical,
          shortcut: "G S",
        },
        {
          id: "model_performance",
          label: "AI Accuracy Checks",
          description: "Model precision & test scores",
          icon: Cpu,
          isAi: true,
        },
        {
          id: "data_sources",
          label: "Network Sensors",
          description: "Live sensor & capture inputs",
          icon: Database,
        },
        {
          id: "system_health",
          label: "System Health",
          description: "Server speed & uptime",
          icon: Activity,
          shortcut: "G H",
        },
        {
          id: "settings",
          label: "Platform Settings",
          description: "Notification rules & setup",
          icon: Sliders,
          shortcut: "G P",
        },
      ],
    },
  };

  const currentNav = MODULE_SUBNAV[activeModule] || MODULE_SUBNAV.overview;
  const filteredItems = filterText.trim()
    ? currentNav.items.filter(
        (it) =>
          it.label.toLowerCase().includes(filterText.toLowerCase()) ||
          (it.description && it.description.toLowerCase().includes(filterText.toLowerCase()))
      )
    : currentNav.items;

  return (
    <aside className="hidden md:flex w-52 h-screen bg-white border-r border-[#F3E8E8] fixed left-14 top-0 flex-col z-20 select-none animate-in slide-in-from-left-2 duration-150 font-sans">
      {/* Module Heading */}
      <div className="h-14 px-3 border-b border-[#F3E8E8] flex items-center justify-between bg-white">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#0F172A] font-semibold flex items-center gap-1.5">
            <span>{currentNav.title}</span>
          </div>
          <div className="text-[10px] text-[#64748B] truncate">{currentNav.subtitle}</div>
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#F3E8E8]">
          <SpectrumLogo size={13} />
          <span className="text-[9px] font-mono text-[#0F172A] font-bold tracking-wider">SPECTRUM</span>
        </div>
      </div>

      {/* Filter search if more than 3 items */}
      {currentNav.items.length > 3 && (
        <div className="px-2 pt-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg text-xs text-[#64748B]">
            <Search className="w-3 h-3 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Filter views..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-transparent text-[11px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none font-mono"
            />
            {filterText && (
              <button onClick={() => setFilterText("")} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-Items List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={`${item.label} — ${item.description || "Open view"}`}
              className={`w-full text-left p-2 rounded-lg transition-all group relative cursor-pointer ${
                isActive
                  ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] shadow-xs font-medium"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent"
              }`}
            >
              {/* Active Tab Line */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-[#BE185D]" />
              )}

              <div className="flex items-start gap-2.5">
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                    isActive
                      ? "text-[#BE185D]"
                      : "text-[#94A3B8] group-hover:text-[#0F172A]"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate">{item.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                          {item.badge}
                        </span>
                      )}
                      {item.isAi && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] font-bold">
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <div className="text-[10px] text-[#64748B] truncate mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Shortcut badge on hover */}
              {item.shortcut && (
                <div className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-mono text-[#64748B] bg-[#FAF8F5] px-1 rounded border border-[#F3E8E8]">
                    {item.shortcut}
                  </span>
                </div>
              )}

              {/* Floating Hover Hint Card */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 w-52 p-2.5 bg-white border border-[#F3E8E8] rounded-xl shadow-2xl text-left opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 hidden md:block">
                <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#F3E8E8]">
                  <span className="text-xs font-bold text-[#0F172A]">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="text-[9px] font-mono text-[#64748B] bg-[#FAF8F5] px-1 py-0.2 rounded border border-[#F3E8E8]">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
                {item.description && (
                  <p className="text-[11px] text-[#64748B] mt-1 leading-snug font-normal">
                    {item.description}
                  </p>
                )}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-[#F3E8E8] rotate-45" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer / Context Info */}
      <div className="p-3 border-t border-[#F3E8E8] bg-[#FAF8F5] text-[10px] font-mono text-[#64748B] flex items-center justify-between">
        <span>SPECTRUM v2.4</span>
        <span className="text-[#059669] font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
          ONLINE
        </span>
      </div>
    </aside>
  );
};
