import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { AttackForecast } from "./AttackForecast";
import { Alerts } from "./Alerts";
import { Incidents } from "./Incidents";
import { MitreAttack } from "./MitreAttack";
import { AIInsights } from "./AIInsights";

interface ThreatForecastingWorkspaceProps {
  initialTab?: string;
  setActivePage?: (page: string) => void;
  navigateWithPivot?: (targetPage: string, params: any) => void;
  pivotParams?: any;
  openAlertsCount?: number;
}

export const ThreatForecastingWorkspace: React.FC<ThreatForecastingWorkspaceProps> = ({
  initialTab = "forecast",
  setActivePage,
  navigateWithPivot,
  pivotParams,
  openAlertsCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);



  return (
    <div className="space-y-4">
      {/* Workspace Header and Sub-Tab Bar */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#BE185D] tracking-wider uppercase font-mono">
              <Zap className="w-3.5 h-3.5 text-[#BE185D]" />
              <span>Workspace: Threat Forecasting & Detection</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mt-0.5">
              Predictive AI Detection & Threat Horizons
            </h1>
            <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
              Continuous sliding-window behavioral analysis forecasts attack trajectory before impact, correlates MITRE enterprise tactics, and decomposes telemetry via KernelSHAP.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#F3E8E8] text-[11px] font-mono text-[#64748B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              Forecaster Horizon: <span className="text-[#0F172A] font-semibold">+60 min</span>
            </span>
          </div>
        </div>

      </div>

      {/* Render Active Sub-View */}
      <div className="transition-opacity duration-150">
        {activeTab === "forecast" && (
          <AttackForecast setActivePage={setActivePage || (() => {})} />
        )}
        {activeTab === "alerts" && (
          <Alerts navigateWithPivot={navigateWithPivot} />
        )}
        {activeTab === "incidents" && (
          <Incidents pivotParams={pivotParams} navigateWithPivot={navigateWithPivot} />
        )}
        {activeTab === "mitre" && <MitreAttack />}
        {activeTab === "insights" && <AIInsights />}
      </div>
    </div>
  );
};
