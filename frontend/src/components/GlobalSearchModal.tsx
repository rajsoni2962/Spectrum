import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  ShieldAlert,
  Server,
  Zap,
  Globe,
  FileText,
  ArrowRight,
  LayoutDashboard,
  Compass,
  Network,
  Activity,
  Sliders,
  FlaskConical,
  Cpu,
  Database,
  Crosshair,
  BrainCircuit,
  CornerDownLeft,
} from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActivePage: (page: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  category: "PAGE" | "ASSET" | "INCIDENT" | "ACTION" | "SIMULATION";
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  setActivePage,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commandItems: CommandItem[] = [
    // Pages
    {
      id: "page-dashboard",
      label: "Command Center",
      sublabel: "Overall security status & live meters",
      category: "PAGE",
      icon: LayoutDashboard,
      shortcut: "G D",
      action: () => {
        setActivePage("dashboard");
        onClose();
      },
    },
    {
      id: "page-forecast",
      label: "Threat Forecast",
      sublabel: "AI early attack prediction & key threat causes",
      category: "PAGE",
      icon: Zap,
      shortcut: "G F",
      action: () => {
        setActivePage("attack_forecast");
        onClose();
      },
    },
    {
      id: "page-alerts",
      label: "Security Alerts",
      sublabel: "Live list of detected alerts & severity levels",
      category: "PAGE",
      icon: ShieldAlert,
      shortcut: "G A",
      action: () => {
        setActivePage("alerts");
        onClose();
      },
    },
    {
      id: "page-incidents",
      label: "Incident Reports",
      sublabel: "Grouped attack cases & affected devices",
      category: "PAGE",
      icon: ShieldAlert,
      shortcut: "G I",
      action: () => {
        setActivePage("incidents");
        onClose();
      },
    },
    {
      id: "page-mitre",
      label: "Hacker Tactics (MITRE)",
      sublabel: "Known attacker methods & tactics database",
      category: "PAGE",
      icon: Crosshair,
      shortcut: "G M",
      action: () => {
        setActivePage("mitre_attack");
        onClose();
      },
    },
    {
      id: "page-ai-insights",
      label: "AI Behavior Findings",
      sublabel: "Automatic AI anomaly discoveries & findings",
      category: "PAGE",
      icon: BrainCircuit,
      action: () => {
        setActivePage("ai_insights");
        onClose();
      },
    },
    {
      id: "page-workbench",
      label: "Device Investigation",
      sublabel: "Inspect device traffic, packets & host history",
      category: "PAGE",
      icon: Compass,
      shortcut: "G W",
      action: () => {
        setActivePage("investigation");
        onClose();
      },
    },
    {
      id: "page-reports",
      label: "Audit Reports & PDF",
      sublabel: "Official security summaries & downloadable audit logs",
      category: "PAGE",
      icon: FileText,
      action: () => {
        setActivePage("reports");
        onClose();
      },
    },
    {
      id: "page-topology",
      label: "Device Connection Map",
      sublabel: "Map of connected servers, firewalls & devices",
      category: "PAGE",
      icon: Network,
      shortcut: "G N",
      action: () => {
        setActivePage("network_explorer");
        onClose();
      },
    },
    {
      id: "page-live-monitor",
      label: "Live Traffic Stream",
      sublabel: "Real-time incoming packet inspection stream",
      category: "PAGE",
      icon: Activity,
      shortcut: "G L",
      action: () => {
        setActivePage("live_monitor");
        onClose();
      },
    },
    {
      id: "page-traffic",
      label: "Traffic Breakdown",
      sublabel: "Network traffic types & pattern checks",
      category: "PAGE",
      icon: Activity,
      action: () => {
        setActivePage("traffic_analysis");
        onClose();
      },
    },
    {
      id: "page-sim-lab",
      label: "Attack Simulator",
      sublabel: "Run test attack drills to verify defenses",
      category: "PAGE",
      icon: FlaskConical,
      shortcut: "G S",
      action: () => {
        setActivePage("simulation_lab");
        onClose();
      },
    },
    {
      id: "page-diagnostics",
      label: "AI Accuracy Checks",
      sublabel: "Detection precision, test scores & accuracy curves",
      category: "PAGE",
      icon: Cpu,
      action: () => {
        setActivePage("model_performance");
        onClose();
      },
    },
    {
      id: "page-sensors",
      label: "Network Sensors & Inputs",
      sublabel: "Sensor hardware status & network packet feeds",
      category: "PAGE",
      icon: Database,
      action: () => {
        setActivePage("data_sources");
        onClose();
      },
    },
    {
      id: "page-system-health",
      label: "System Health & Uptime",
      sublabel: "Server performance, latency & service status",
      category: "PAGE",
      icon: Activity,
      shortcut: "G H",
      action: () => {
        setActivePage("system_health");
        onClose();
      },
    },
    {
      id: "page-settings",
      label: "Platform Settings",
      sublabel: "Alert settings, email/webhook alerts & API setup",
      category: "PAGE",
      icon: Sliders,
      action: () => {
        setActivePage("settings");
        onClose();
      },
    },

    // Monitored Assets
    {
      id: "asset-10.0.1.15",
      label: "10.0.1.15 — Primary Web Production (DMZ)",
      sublabel: "High risk target under SYN Flood reconnaissance",
      category: "ASSET",
      icon: Server,
      action: () => {
        setActivePage("investigation");
        onClose();
      },
    },
    {
      id: "asset-10.0.1.5",
      label: "10.0.1.5 — PostgreSQL Cluster Core",
      sublabel: "Critical internal database node (Protected)",
      category: "ASSET",
      icon: Server,
      action: () => {
        setActivePage("network_explorer");
        onClose();
      },
    },
    {
      id: "asset-198.51.100.44",
      label: "198.51.100.44 — External Adversary (APT-29)",
      sublabel: "External threat actor conducting reconnaissance",
      category: "ASSET",
      icon: Globe,
      action: () => {
        setActivePage("attack_forecast");
        onClose();
      },
    },

    // Active Incidents
    {
      id: "inc-0042",
      label: "INC-2026-0917-0042: SYN Flood Saturation",
      sublabel: "Critical severity • Web DMZ • 45,000 pps burst",
      category: "INCIDENT",
      icon: ShieldAlert,
      action: () => {
        setActivePage("incidents");
        onClose();
      },
    },

    // Actions & Simulations
    {
      id: "action-run-sim",
      label: "Trigger Simulation: Port Scan Reconnaissance",
      sublabel: "Inject multi-vector synthetic probes into telemetry",
      category: "SIMULATION",
      icon: FlaskConical,
      action: () => {
        setActivePage("simulation_lab");
        onClose();
      },
    },
    {
      id: "action-gen-report",
      label: "Generate TLP:AMBER Forensic Audit Brief",
      sublabel: "Compile cryptographic incident PDF dossier",
      category: "ACTION",
      icon: FileText,
      action: () => {
        setActivePage("reports");
        onClose();
      },
    },
  ];

  const filtered = query.trim()
    ? commandItems.filter(
        (q) =>
          q.label.toLowerCase().includes(query.toLowerCase()) ||
          (q.sublabel && q.sublabel.toLowerCase().includes(query.toLowerCase())) ||
          q.category.toLowerCase().includes(query.toLowerCase())
      )
    : commandItems;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev <= 0 ? (filtered.length ? filtered.length - 1 : 0) : prev - 1
        );
      } else if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex + 1] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-24 px-4 select-none animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-2xl bg-white border border-[#F3E8E8] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8] gap-3">
          <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search pages, monitored hosts, incidents, MITRE techniques, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[#94A3B8] hover:text-[#0F172A] text-xs font-mono px-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="p-3 overflow-y-auto space-y-1 bg-white divide-y divide-transparent flex-1"
        >
          <div className="text-[10px] font-mono text-[#94A3B8] px-2 py-1 uppercase tracking-wider flex items-center justify-between">
            <span>Commands, Workspaces & Monitored IOCs</span>
            <span>{filtered.length} matches</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-[#64748B]">
              No matching records found for "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left transition-colors group cursor-pointer ${
                    isSelected
                      ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] shadow-xs"
                      : "text-[#475569] hover:bg-[#FAF8F5] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-1.5 rounded-md border shrink-0 ${
                        isSelected
                          ? "bg-white border-[#FCE7F3] text-[#BE185D]"
                          : "bg-[#FAF8F5] border-[#E2E8F0] text-[#64748B]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`font-semibold truncate flex items-center gap-2 ${isSelected ? "text-[#BE185D]" : "text-[#0F172A]"}`}>
                        <span>{item.label}</span>
                      </div>
                      {item.sublabel && (
                        <div className="text-[11px] text-[#64748B] truncate mt-0.5 font-mono">
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white border border-[#E2E8F0] rounded text-[10px] font-mono text-[#64748B]">
                        {item.shortcut}
                      </kbd>
                    )}
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                        item.category === "PAGE"
                          ? "bg-[#FAF8F5] text-[#475569] border-[#E2E8F0]"
                          : item.category === "INCIDENT"
                          ? "bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]"
                          : item.category === "ASSET"
                          ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                          : item.category === "SIMULATION"
                          ? "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                          : "bg-[#FDF2F8] text-[#BE185D] border-[#FCE7F3]"
                      }`}
                    >
                      {item.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#BE185D] hidden sm:inline" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer with Keyboard Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-[#F3E8E8] text-[10px] font-mono text-[#64748B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.2 bg-white border border-[#E2E8F0] rounded text-[9px] text-[#64748B]">
                ↑
              </kbd>{" "}
              <kbd className="px-1 py-0.2 bg-white border border-[#E2E8F0] rounded text-[9px] text-[#64748B]">
                ↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.2 bg-white border border-[#E2E8F0] rounded text-[9px] text-[#64748B]">
                Enter
              </kbd>{" "}
              Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.2 bg-white border border-[#E2E8F0] rounded text-[9px] text-[#64748B]">
                Esc
              </kbd>{" "}
              Exit
            </span>
          </div>
          <span className="text-[#BE185D] font-semibold hidden sm:inline">
            SPECTRUM UNIVERSAL PALETTE
          </span>
        </div>
      </div>
    </div>
  );
};
