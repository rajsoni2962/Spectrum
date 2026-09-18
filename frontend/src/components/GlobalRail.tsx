import React from "react";
import {
  LayoutDashboard,
  Compass,
  Sliders,
  FlaskConical,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Network,
  Globe,
} from "lucide-react";
import { KXLogo } from "./KXLogo";

export type PrimaryModule =
  | "overview"
  | "detection"
  | "investigation"
  | "monitoring"
  | "settings";

interface GlobalRailProps {
  activeModule: PrimaryModule;
  setActiveModule: (mod: PrimaryModule) => void;
  openAlertsCount: number;
  activeScenario?: string;
  isContextualNavOpen: boolean;
  onToggleContextualNav: () => void;
  onNavigateToPublic?: () => void;
}

export const GlobalRail: React.FC<GlobalRailProps> = ({
  activeModule,
  setActiveModule,
  openAlertsCount,
  activeScenario,
  isContextualNavOpen,
  onToggleContextualNav,
  onNavigateToPublic,
}) => {
  const modules: {
    id: PrimaryModule;
    label: string;
    hint: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    isAi?: boolean;
    shortcut?: string;
  }[] = [
    {
      id: "overview",
      label: "Command Center",
      hint: "Live threat risk meters, system posture, and recent security event stream.",
      icon: LayoutDashboard,
      shortcut: "G D",
    },
    {
      id: "detection",
      label: "Threat Forecasting",
      hint: "AI early attack prediction, key threat factors, and active alert queue.",
      icon: Zap,
      badge: openAlertsCount,
      isAi: true,
      shortcut: "G F",
    },
    {
      id: "investigation",
      label: "Forensics & Investigation",
      hint: "Device investigation, raw packet PCAP inspection, and audit reports.",
      icon: Compass,
      shortcut: "G W",
    },
    {
      id: "monitoring",
      label: "Network & Telemetry",
      hint: "Connected device map, real-time packet stream, and traffic breakdown.",
      icon: Network,
      shortcut: "G N",
    },
    {
      id: "settings",
      label: "Simulation & Platform",
      hint: "Simulate test attack drills, verify AI accuracy, and platform settings.",
      icon: Sliders,
      shortcut: "G S",
    },
  ];

  const isSimulated = activeScenario && activeScenario !== "Normal";

  return (
    <nav className="hidden md:flex w-14 h-screen bg-white border-r border-[#F3E8E8] fixed left-0 top-0 flex-col items-center justify-between py-3 z-30 select-none">
      {/* Top: SPECTRUM Signal Logo & Nav Toggle */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group w-full flex justify-center">
          <div
            onClick={onNavigateToPublic ? onNavigateToPublic : () => setActiveModule("overview")}
            title="SPECTRUM — Click to view Public Overview / Brand Home"
            className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#F3E8E8] hover:border-[#BE185D]/40 flex items-center justify-center cursor-pointer transition-colors group p-1 shadow-xs"
          >
            <KXLogo size={22} />
          </div>
          {/* Logo Hover Tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-2 bg-white border border-[#F3E8E8] rounded-xl shadow-xl text-left opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 w-48">
            <div className="text-xs font-bold text-[#0F172A]">SPECTRUM</div>
            <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
              Click to view Public Marketing Site & Product Overview.
            </p>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-[#F3E8E8] rotate-45" />
          </div>
        </div>

        {/* Toggle Contextual Sidebar Drawer */}
        <div className="relative group w-full flex justify-center">
          <button
            onClick={onToggleContextualNav}
            title={isContextualNavOpen ? "Collapse Sub-Navigation ([)" : "Expand Sub-Navigation ([)"}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
          >
            {isContextualNavOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
          {/* Sidebar Toggle Tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-2 bg-white border border-[#F3E8E8] rounded-xl shadow-xl text-left opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 w-44">
            <div className="text-xs font-semibold text-[#0F172A]">
              {isContextualNavOpen ? "Hide Sub-Navigation" : "Show Sub-Navigation"}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Toggle side views panel (Key: [)</p>
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-[#F3E8E8] rotate-45" />
          </div>
        </div>
      </div>

      {/* Center: Primary Module Icon Rail */}
      <div className="flex flex-col items-center gap-1.5 w-full px-2">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <div key={m.id} className="relative group w-full flex justify-center">
              <button
                onClick={() => {
                  setActiveModule(m.id);
                  if (!isContextualNavOpen) onToggleContextualNav();
                }}
                title={`${m.label}: ${m.hint}`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center relative transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent"
                }`}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r bg-[#BE185D]" />
                )}

                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-[#BE185D]"
                      : "text-[#64748B] group-hover:text-[#0F172A]"
                  }`}
                />

                {/* Badge Count (e.g. Alerts) */}
                {m.badge !== undefined && m.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BE185D]" />
                )}
              </button>

              {/* Hover Tooltip with Rich Hint Description & Shortcut */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-2 bg-white border border-[#F3E8E8] rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 font-sans w-60 text-left">
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#F3E8E8]">
                  <span className="text-xs font-bold text-[#0F172A]">{m.label}</span>
                  {m.shortcut && (
                    <kbd className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded text-[9px] font-mono text-[#64748B]">
                      {m.shortcut}
                    </kbd>
                  )}
                </div>
                <p className="text-[11px] text-[#64748B] mt-1.5 leading-snug">
                  {m.hint}
                </p>
                {/* Micro Arrow Pointer */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-[#F3E8E8] rotate-45" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Simulation Status, Public Link & Health Indicator */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {/* Active Simulation Indicator */}
        {isSimulated && (
          <div className="relative group w-full flex justify-center">
            <button
              onClick={() => {
                setActiveModule("settings");
                if (!isContextualNavOpen) onToggleContextualNav();
              }}
              title={`Simulation Active: ${activeScenario}`}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors border cursor-pointer bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
            >
              <FlaskConical className="w-4 h-4 animate-pulse" />
            </button>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white border border-[#F3E8E8] text-xs font-medium text-[#0F172A] rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-sans">
              Simulation Active ({activeScenario})
            </div>
          </div>
        )}

        {/* Public Product Home Link */}
        {onNavigateToPublic && (
          <div className="relative group w-full flex justify-center">
            <button
              onClick={onNavigateToPublic}
              title="Return to Public Product Site"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent"
            >
              <Globe className="w-4 h-4" />
            </button>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white border border-[#F3E8E8] text-xs font-medium text-[#0F172A] rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-sans">
              Public Product Site
            </div>
          </div>
        )}

        {/* System Online Indicator */}
        <div className="mt-1 flex items-center justify-center" title="SOC Telemetry Pipeline: ONLINE (10Gbps)">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
        </div>
      </div>
    </nav>
  );
};
