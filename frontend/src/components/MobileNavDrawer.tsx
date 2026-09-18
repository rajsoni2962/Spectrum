import React from "react";
import {
  X,
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Compass,
  BrainCircuit,
  FileSpreadsheet,
  Sliders,
  FlaskConical,
  ExternalLink,
  ChevronRight,
  Search,
  Zap,
  Network,
  Binary,
  BellRing,
  ShieldCheck,
  Crosshair,
  HardDriveDownload,
  Cpu,
  Database,
  Users
} from "lucide-react";
import { PrimaryModule } from "./GlobalRail";
import { SpectrumLogo } from "./SpectrumLogo";

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: PrimaryModule;
  activePage: string;
  setActiveModule: (mod: PrimaryModule) => void;
  setActivePage: (page: string) => void;
  openAlertsCount: number;
  activeScenario?: string;
  onNavigateToPublic: () => void;
  onOpenSearch: () => void;
}

const MODULES_CONFIG: {
  id: PrimaryModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isAi?: boolean;
  pages: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; isAi?: boolean; badge?: number }[];
}[] = [
  {
    id: "overview",
    label: "Command Center",
    icon: LayoutDashboard,
    pages: [
      { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
    ],
  },
  {
    id: "detection",
    label: "Threat Forecasting",
    icon: Zap,
    isAi: true,
    pages: [
      { id: "attack_forecast", label: "Threat Forecast & SHAP", icon: Zap, isAi: true },
      { id: "alerts", label: "Alerts Queue", icon: BellRing },
      { id: "incidents", label: "Incident Dossiers", icon: ShieldAlert },
      { id: "mitre_attack", label: "MITRE ATT&CK Matrix", icon: Crosshair },
      { id: "ai_insights", label: "AI Insights", icon: BrainCircuit, isAi: true },
    ],
  },
  {
    id: "investigation",
    label: "Investigation",
    icon: Compass,
    pages: [
      { id: "investigation", label: "Forensic Workbench", icon: Compass },
      { id: "reports", label: "Audit Briefs & Reports", icon: FileSpreadsheet },
    ],
  },
  {
    id: "monitoring",
    label: "Network & Telemetry",
    icon: Network,
    pages: [
      { id: "network_explorer", label: "Network Topology", icon: Network },
      { id: "live_monitor", label: "Live Ingress Monitor", icon: Activity },
      { id: "traffic_analysis", label: "Traffic Flow Analysis", icon: Binary },
    ],
  },
  {
    id: "settings",
    label: "Simulation & Platform",
    icon: Sliders,
    pages: [
      { id: "simulation_lab", label: "Simulation Lab", icon: FlaskConical },
      { id: "model_performance", label: "Model Diagnostics", icon: Cpu, isAi: true },
      { id: "data_sources", label: "Sensors & TAP Feeds", icon: Database },
      { id: "system_health", label: "System Diagnostics", icon: Activity },
      { id: "settings", label: "Platform Configuration", icon: Sliders },
    ],
  },
];

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeModule,
  activePage,
  setActiveModule,
  setActivePage,
  openAlertsCount,
  activeScenario,
  onNavigateToPublic,
  onOpenSearch,
}) => {
  if (!isOpen) return null;

  const currentMod = MODULES_CONFIG.find((m) => m.id === activeModule) || MODULES_CONFIG[0];
  const isSimulated = activeScenario && activeScenario !== "Normal";

  return (
    <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-4/5 max-w-sm h-full bg-[#FAF8F5] border-r border-[#F3E8E8] flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-[#F3E8E8] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-[#FDF2F8] border border-[#FCE7F3]">
              <SpectrumLogo size={22} />
            </div>
            <div>
              <div className="text-sm font-bold font-mono tracking-wider text-[#0F172A]">
                SPECTRUM
              </div>
              <div className="text-[9px] font-mono text-[#64748B] font-semibold">
                DEMO CONSOLE v2.4
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search & Public Site Navigation Strip */}
        <div className="p-3 border-b border-[#F3E8E8] space-y-2 bg-white">
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded text-xs text-[#64748B] font-mono cursor-pointer hover:border-[#BE185D]/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Search telemetry & IOCs...</span>
            </span>
            <kbd className="px-1 py-0.2 text-[9px] bg-white border border-[#E2E8F0] rounded text-[#64748B]">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToPublic();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-[#FDF2F8] hover:bg-[#FCE7F3] text-[#BE185D] border border-[#FCE7F3] rounded text-xs font-mono transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Exit to Public Product Site</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Module Selector Pills (Horizontal Scroll) */}
        <div className="px-3 py-2 border-b border-[#F3E8E8] bg-[#FAF8F5] overflow-x-auto flex items-center gap-1.5 select-none no-scrollbar">
          {MODULES_CONFIG.map((mod) => {
            const isSelected = activeModule === mod.id;
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => {
                  setActiveModule(mod.id);
                  setActivePage(mod.pages[0]?.id || "dashboard");
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] font-bold"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-white border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mod.label}</span>
                {mod.id === "detection" && openAlertsCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-navigation items for current active module */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider px-2 py-1">
            {currentMod.label} Workspace
          </div>

          {currentMod.pages.map((p) => {
            const isPageActive = activePage === p.id;
            const PageIcon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActivePage(p.id);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                  isPageActive
                    ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] font-bold shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PageIcon className={`w-4 h-4 ${isPageActive ? "text-[#BE185D]" : "text-[#94A3B8]"}`} />
                  <span>{p.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {p.isAi && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] font-bold">
                      AI
                    </span>
                  )}
                  {p.id === "alerts" && openAlertsCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] font-bold">
                      {openAlertsCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Status */}
        <div className="p-3 border-t border-[#F3E8E8] bg-white font-mono text-[10px] text-[#64748B] space-y-1.5">
          {isSimulated && (
            <div className="px-2 py-1 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
              <span>SIMULATED TRAFFIC: {activeScenario}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>Daemon: Connected</span>
            </span>
            <span>analyst.soc</span>
          </div>
        </div>
      </div>
    </div>
  );
};
