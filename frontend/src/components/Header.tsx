import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, ChevronRight, Keyboard, Home, ArrowLeft } from "lucide-react";
import { WORKSPACE_PAGES_CONFIG } from "./WorkspaceSubHeader";
import { PrimaryModule } from "./GlobalRail";

interface HeaderProps {
  activePage: string;
  activeModule?: PrimaryModule;
  openAlertsCount: number;
  activeScenario: string;
  telemetryMode?: string;
  isContextualNavOpen: boolean;
  onOpenGlobalSearch: () => void;
  onOpenShortcuts?: () => void;
  onPivotToPage?: (page: string) => void;
  onOpenMobileNav?: () => void;
  onNavigateToPublic?: () => void;
}

const PAGE_METADATA: Record<string, { module: string; moduleId: PrimaryModule; section: string }> = {
  dashboard: { module: "COMMAND CENTER", moduleId: "overview", section: "Security Status" },
  attack_forecast: { module: "THREAT FORECASTING", moduleId: "detection", section: "Threat Forecast & Predictions" },
  alerts: { module: "THREAT FORECASTING", moduleId: "detection", section: "Active Security Alerts" },
  incidents: { module: "THREAT FORECASTING", moduleId: "detection", section: "Incident Reports" },
  mitre_attack: { module: "THREAT FORECASTING", moduleId: "detection", section: "Hacker Tactics (MITRE)" },
  ai_insights: { module: "THREAT FORECASTING", moduleId: "detection", section: "AI Behavior Findings" },
  investigation: { module: "INVESTIGATION", moduleId: "investigation", section: "Device Investigation" },
  reports: { module: "INVESTIGATION", moduleId: "investigation", section: "Security Audit Reports" },
  export_center: { module: "INVESTIGATION", moduleId: "investigation", section: "Export Center" },
  network_explorer: { module: "NETWORK & TRAFFIC", moduleId: "monitoring", section: "Device Map" },
  live_monitor: { module: "NETWORK & TRAFFIC", moduleId: "monitoring", section: "Live Traffic Stream" },
  traffic_analysis: { module: "NETWORK & TRAFFIC", moduleId: "monitoring", section: "Traffic Breakdown" },
  simulation_lab: { module: "SIMULATION & PLATFORM", moduleId: "settings", section: "Attack Simulator" },
  model_performance: { module: "SIMULATION & PLATFORM", moduleId: "settings", section: "AI Accuracy Checks" },
  data_sources: { module: "SIMULATION & PLATFORM", moduleId: "settings", section: "Network Sensors" },
  system_health: { module: "SIMULATION & PLATFORM", moduleId: "settings", section: "System Health" },
  settings: { module: "SIMULATION & PLATFORM", moduleId: "settings", section: "Platform Settings" },
  users_roles: { module: "SIMULATION & PLATFORM", moduleId: "settings", section: "User Access" },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  openAlertsCount,
  activeScenario,
  isContextualNavOpen,
  onOpenGlobalSearch,
  onOpenShortcuts,
  onPivotToPage,
  onOpenMobileNav,
  onNavigateToPublic,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBreadcrumbMenu, setShowBreadcrumbMenu] = useState(false);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const meta = PAGE_METADATA[activePage] || {
    module: "SPECTRUM",
    moduleId: "overview" as PrimaryModule,
    section: "Security Operations",
  };

  const isSimulated = activeScenario && activeScenario !== "Normal";
  const siblingPages = WORKSPACE_PAGES_CONFIG[meta.moduleId]?.items || [];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (breadcrumbRef.current && !breadcrumbRef.current.contains(e.target as Node)) {
        setShowBreadcrumbMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`h-14 bg-white/95 backdrop-blur-md border-b border-[#F3E8E8] fixed top-0 right-0 z-20 flex items-center justify-between px-3 sm:px-5 select-none transition-all duration-150 left-0 md:left-14 ${
        isContextualNavOpen ? "lg:left-[264px]" : "lg:left-14"
      }`}
    >
      {/* Left: Mobile Toggle & Interactive Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] rounded cursor-pointer mr-1"
          aria-label="Open Navigation"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Home / SPECTRUM Demo Console Root Link */}
        <button
          onClick={() => onPivotToPage && onPivotToPage("dashboard")}
          title="Return to SPECTRUM Demo Console"
          className="flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] p-1 rounded hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono font-bold text-[10px] sm:text-[11px] text-[#0F172A] tracking-wider uppercase">
            SPECTRUM DEMO CONSOLE
          </span>
        </button>

        <span className="text-[#CBD5E1]">/</span>

        {/* Module Level Link */}
        <button
          onClick={() => {
            const firstPage = siblingPages[0]?.id || "dashboard";
            if (onPivotToPage) onPivotToPage(firstPage);
          }}
          className="text-[#64748B] hover:text-[#0F172A] uppercase tracking-wider font-semibold font-mono text-[10px] sm:text-[11px] hover:underline cursor-pointer truncate max-w-[120px] sm:max-w-none"
        >
          {meta.module}
        </button>

        <span className="text-[#CBD5E1]">/</span>

        {/* Current Section with Sibling Switcher Dropdown */}
        <div ref={breadcrumbRef} className="relative">
          <button
            onClick={() => setShowBreadcrumbMenu(!showBreadcrumbMenu)}
            className="flex items-center gap-1 text-[#0F172A] font-medium text-xs font-mono hover:bg-[#FAF8F5] px-2 py-1 rounded cursor-pointer transition-colors"
            title="Click to switch views in this workspace"
          >
            <span className="truncate max-w-[130px] sm:max-w-none">{meta.section}</span>
            {siblingPages.length > 1 && (
              <ChevronDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
            )}
          </button>

          {/* Sibling Page Fast Dropdown */}
          {showBreadcrumbMenu && siblingPages.length > 1 && (
            <div className="absolute left-0 mt-1.5 w-60 bg-white border border-[#F3E8E8] rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] border-b border-[#F3E8E8]">
                Jump within {meta.module}
              </div>
              <div className="py-1 max-h-72 overflow-y-auto divide-y divide-[#F3E8E8]">
                {siblingPages.map((sibling) => {
                  const Icon = sibling.icon;
                  const isCurrent = activePage === sibling.id;
                  return (
                    <button
                      key={sibling.id}
                      onClick={() => {
                        if (onPivotToPage) onPivotToPage(sibling.id);
                        setShowBreadcrumbMenu(false);
                      }}
                      title={`${sibling.label} — ${sibling.hint || ""}`}
                      className={`w-full flex items-start justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-[#FDF2F8] text-[#BE185D] font-medium"
                          : "text-[#475569] hover:bg-[#FAF8F5] hover:text-[#0F172A]"
                      }`}
                    >
                      <div className="flex items-start gap-2 min-w-0 pr-2">
                        <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrent ? "text-[#BE185D]" : "text-[#64748B]"}`} />
                        <div className="min-w-0">
                          <div className={`truncate font-semibold text-xs ${isCurrent ? "text-[#BE185D]" : "text-[#0F172A]"}`}>
                            {sibling.label}
                          </div>
                          {sibling.hint && (
                            <div className="text-[10px] text-[#64748B] font-normal leading-tight mt-0.5 line-clamp-2">
                              {sibling.hint}
                            </div>
                          )}
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BE185D] shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Simulated Traffic Tag */}
        {isSimulated && (
          <span className="hidden xl:flex ml-2 px-2 py-0.5 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] rounded-full text-[10px] font-mono uppercase font-semibold items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            [SIMULATED: {activeScenario}]
          </span>
        )}
      </div>

      {/* Center: Universal Command Search (Ctrl+K) */}
      <div className="flex-1 max-w-md mx-3 hidden md:flex items-center gap-2">
        <div
          onClick={onOpenGlobalSearch}
          className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] border border-[#E2E8F0] hover:border-[#BE185D]/40 rounded-lg text-xs text-[#64748B] cursor-pointer transition-colors shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="truncate text-[11px]">Search assets, IOCs, IP flows, pages...</span>
          <kbd className="ml-auto px-1.5 py-0.2 bg-white border border-[#E2E8F0] rounded text-[9px] text-[#64748B] font-mono shadow-xs">
            Ctrl+K
          </kbd>
        </div>

        {/* Keyboard Shortcuts Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts cheat sheet (?)"
            className="p-1.5 bg-[#FAF8F5] border border-[#E2E8F0] hover:border-[#BE185D]/40 rounded-lg text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right: Telemetry Health Indicators & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Status Indicators */}
        <div className="hidden lg:flex items-center gap-3 px-2.5 py-1 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-[10px] font-mono text-[#64748B]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            Telemetry: <span className="text-[#0F172A] font-medium">10G TAP</span>
          </span>
          <span className="text-[#E2E8F0]">|</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BE185D]" />
            Inference: <span className="text-[#0F172A] font-medium">96.4%</span>
          </span>
          <span className="text-[#E2E8F0]">|</span>
          <span className="text-[#94A3B8]">RF-v2.4</span>
        </div>

        {/* Notifications Bell */}
        <button
          onClick={() => onPivotToPage && onPivotToPage("alerts")}
          className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent hover:border-[#F3E8E8] rounded-lg transition-colors relative cursor-pointer"
          title="Active Alerts Queue"
        >
          <Bell className="w-4 h-4" />
          {openAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E11D48]" />
          )}
        </button>

        {/* Analyst Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            <div className="w-5 h-5 rounded bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BE185D] text-[10px] font-bold font-mono">
              SA
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[11px] font-medium text-[#0F172A] leading-none">analyst.soc</div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#64748B] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#F3E8E8] rounded-xl shadow-xl py-1 text-xs z-50 animate-in fade-in zoom-in-95 duration-100 font-mono">
              <div className="px-3 py-2 border-b border-[#F3E8E8]">
                <div className="font-semibold text-[#0F172A] text-xs">SPECTRUM Demo Console</div>
                <div className="text-[10px] text-[#64748B]">Tier-2 Analyst Node</div>
              </div>
              <div className="py-1">
                {onNavigateToPublic && (
                  <div
                    onClick={() => {
                      onNavigateToPublic();
                      setShowProfileMenu(false);
                    }}
                    className="px-3 py-1.5 text-[#0F172A] hover:bg-[#FAF8F5] cursor-pointer flex items-center justify-between border-b border-[#F3E8E8]"
                  >
                    <span>Public Product Site</span>
                    <span className="text-[10px]">↗</span>
                  </div>
                )}
                <div
                  onClick={() => {
                    if (onPivotToPage) onPivotToPage("dashboard");
                    setShowProfileMenu(false);
                  }}
                  className="px-3 py-1.5 text-[#475569] hover:bg-[#FAF8F5] hover:text-[#0F172A] cursor-pointer"
                >
                  Command Center
                </div>
                <div
                  onClick={() => {
                    if (onPivotToPage) onPivotToPage("simulation_lab");
                    setShowProfileMenu(false);
                  }}
                  className="px-3 py-1.5 text-[#475569] hover:bg-[#FAF8F5] hover:text-[#0F172A] cursor-pointer"
                >
                  Simulation Lab
                </div>
                <div
                  onClick={() => {
                    if (onPivotToPage) onPivotToPage("settings");
                    setShowProfileMenu(false);
                  }}
                  className="px-3 py-1.5 text-[#475569] hover:bg-[#FAF8F5] hover:text-[#0F172A] cursor-pointer"
                >
                  Platform Settings
                </div>
                <div
                  onClick={() => {
                    if (onPivotToPage) onPivotToPage("system_health");
                    setShowProfileMenu(false);
                  }}
                  className="px-3 py-1.5 text-[#475569] hover:bg-[#FAF8F5] hover:text-[#0F172A] cursor-pointer"
                >
                  System Diagnostics
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
