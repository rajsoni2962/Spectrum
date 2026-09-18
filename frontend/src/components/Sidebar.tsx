import React from "react";
import {
  LayoutDashboard,
  Activity,
  Zap,
  BellRing,
  ShieldAlert,
  Network,
  Binary,
  FolderSearch,
  ShieldCheck,
  Crosshair,
  BrainCircuit,
  FileSpreadsheet,
  Sliders
} from "lucide-react";
import { KXLogo, KXWordmark } from "./KXLogo";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAi?: boolean;
  badge?: number;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  openAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  openAlertsCount,
}) => {
  const sections: NavSection[] = [
    {
      group: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "MONITOR",
      items: [
        { id: "live_monitor", label: "Live Network", icon: Activity },
      ],
    },
    {
      group: "DETECT",
      items: [
        { id: "attack_forecast", label: "Threat Forecast", icon: Zap, isAi: true },
        { id: "alerts", label: "Alerts", icon: BellRing, badge: openAlertsCount > 0 ? openAlertsCount : undefined },
        { id: "incidents", label: "Incidents", icon: ShieldAlert },
      ],
    },
    {
      group: "INVESTIGATE",
      items: [
        { id: "network_explorer", label: "Network", icon: Network },
        { id: "traffic_analysis", label: "Traffic", icon: Binary },
        { id: "investigation", label: "Cases", icon: FolderSearch },
      ],
    },
    {
      group: "INTELLIGENCE",
      items: [
        { id: "threat_intel", label: "Threat Intelligence", icon: ShieldCheck },
        { id: "mitre_attack", label: "MITRE ATT&CK", icon: Crosshair },
        { id: "ai_insights", label: "AI Insights", icon: BrainCircuit, isAi: true },
      ],
    },
    {
      group: "REPORTS",
      items: [
        { id: "reports", label: "Reports", icon: FileSpreadsheet },
      ],
    },
    {
      group: "SETTINGS",
      items: [
        { id: "settings", label: "Settings", icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-60 h-screen bg-white border-r border-[#F3E8E8] fixed left-0 top-0 flex flex-col z-30 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      {/* Brand Header with KX Geometric Monogram */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-[#F3E8E8] bg-white">
        <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center shrink-0 text-[#BE185D]">
          <KXLogo size={20} />
        </div>
        <KXWordmark />
      </div>

      {/* Simplified Workflow-Driven Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3.5">
        {sections.map((section) => (
          <div key={section.group}>
            <div className="px-2.5 mb-1 text-[9px] font-semibold tracking-[0.14em] text-[#64748B] uppercase font-mono">
              {section.group}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12px] font-medium transition-colors text-left relative ${
                      isActive
                        ? "bg-[#FDF2F8] text-[#BE185D] font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    {/* Active Accent Tab Line */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#BE185D]"
                      />
                    )}

                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isActive
                            ? "text-[#BE185D]"
                            : "text-[#94A3B8]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] text-[10px] font-mono font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Engine Status Bottom Footer */}
      <div className="p-3 border-t border-[#F3E8E8] bg-white">
        <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64748B] text-[10px] font-mono font-semibold">SYSTEM ENGINE</span>
            <span className="flex items-center gap-1.5 text-[#059669] font-mono text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
            <span className="text-[#64748B]">INFERENCE</span>
            <span className="font-semibold text-[#0F172A]">RF-TEMPORAL v2.4</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
