import React, { useState, useEffect } from "react";
import { Compass, ShieldAlert } from "lucide-react";
import { Investigation } from "./Investigation";
import { Reports } from "./Reports";

interface InvestigationWorkspaceProps {
  initialTab?: string;
  setActivePage?: (page: string) => void;
  pivotParams?: any;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  initialTab = "workbench",
  setActivePage,
  pivotParams,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="space-y-4">
      {/* Workspace Header */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#BE185D] tracking-wider uppercase font-mono">
              <Compass className="w-3.5 h-3.5 text-[#BE185D]" />
              <span>Workspace: Forensics & Investigation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-0.5">
              Evidence Analysis & Automated Containment
            </h1>
            <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
              Conduct deep-dive forensic analysis on suspicious hosts, inspect raw PCAP packet flows, generate cryptographic audit dossiers, and execute BGP or firewall isolation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#F3E8E8] text-[11px] font-mono text-[#64748B] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#E11D48]" />
              Advisory: <span className="text-[#0F172A] font-semibold">Playbooks Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Render Active Sub-View */}
      <div className="transition-opacity duration-150">
        {activeTab === "workbench" && <Investigation pivotParams={pivotParams} />}
        {activeTab === "reports" && <Reports />}
      </div>
    </div>
  );
};
