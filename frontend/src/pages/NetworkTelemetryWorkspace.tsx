import React, { useState, useEffect } from "react";
import { Network } from "lucide-react";
import { NetworkExplorer } from "./NetworkExplorer";
import { LiveMonitor } from "./LiveMonitor";
import { TrafficAnalysis } from "./TrafficAnalysis";

interface NetworkTelemetryWorkspaceProps {
  initialTab?: string;
  setActivePage?: (page: string) => void;
  navigateWithPivot?: (targetPage: string, params: any) => void;
}

export const NetworkTelemetryWorkspace: React.FC<NetworkTelemetryWorkspaceProps> = ({
  initialTab = "topology",
  setActivePage,
  navigateWithPivot,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="space-y-4">
      {/* Workspace Header & Sub-Tab Bar */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#BE185D] tracking-wider uppercase font-mono">
              <Network className="w-3.5 h-3.5" />
              <span>Workspace: Network & Telemetry</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-0.5">
              Infrastructure Topology & Flow Ingress
            </h1>
            <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
              Real-time visualization of subnets, lateral movement blast radius, passive SPAN interface flow rates, and protocol entropy distributions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-mono text-[#065F46] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              TAP Status: <span className="text-[#0F172A] font-bold">Passive Zero-Drop</span>
            </span>
          </div>
        </div>

      </div>

      {/* Render Active Sub-View */}
      <div className="transition-opacity duration-150">
        {activeTab === "topology" && (
          <NetworkExplorer navigateWithPivot={navigateWithPivot} />
        )}
        {activeTab === "live" && <LiveMonitor />}
        {activeTab === "traffic" && <TrafficAnalysis />}
      </div>
    </div>
  );
};
