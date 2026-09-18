import React, { useState } from "react";
import {
  Sliders,
  Activity,
  Cpu,
  Database,
  Users,
  FlaskConical,
  Download,
  Save,
  CheckCircle2,
} from "lucide-react";

import { SystemHealth } from "./SystemHealth";
import { ModelPerformance } from "./ModelPerformance";
import { DataSources } from "./DataSources";
import { UsersRoles } from "./UsersRoles";
import { SimulationLab } from "./SimulationLab";
import { ExportCenter } from "./ExportCenter";

interface SettingsProps {
  initialTab?: string;
  setActivePage?: (page: string) => void;
  hideTabs?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
  initialTab = "configuration",
  setActivePage,
  hideTabs = true,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Configuration form state
  const [alertThreshold, setAlertThreshold] = useState("65");
  const [incidentThreshold, setIncidentThreshold] = useState("82");
  const [horizonWindow, setHorizonWindow] = useState("60");
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.internal/soc/alerts");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "configuration", label: "Configuration", icon: Sliders },
    { id: "diagnostics", label: "System Diagnostics", icon: Activity },
    { id: "models", label: "Model Performance", icon: Cpu },
    { id: "data_sources", label: "Data Sources", icon: Database },
    { id: "access", label: "Access Control", icon: Users },
    { id: "simulation", label: "Simulation Lab", icon: FlaskConical },
    { id: "export", label: "Data Export", icon: Download },
  ];

  return (
    <div className="space-y-5">
      {/* Settings Top Bar & Subsystem Tabs */}
      <div className="border-b border-[#F3E8E8] pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
              Settings & Platform Administration
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Manage system policies, telemetry pipelines, machine learning benchmarks, and user access
            </p>
          </div>
          <div className="text-[11px] font-mono text-[#64748B] px-3 py-1 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg">
            ENGINE STATUS: ACTIVE
          </div>
        </div>

        {/* Tab Navigation (Hidden by default to avoid duplicate navigation) */}
        {!hideTabs && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                    isActive
                      ? "bg-white text-[#BE185D] border-[#BE185D] shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#BE185D]" : "text-[#94A3B8]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tab Content Panes */}
      <div className="min-h-[500px]">
        {activeTab === "configuration" && (
          <form
            onSubmit={handleSave}
            className="bg-white border border-[#F3E8E8] rounded-xl p-6 space-y-5 max-w-3xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#F3E8E8] pb-2 font-mono">
                Forecasting & Escalation Thresholds
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Alert Trigger Probability (%):
                  </label>
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#BE185D]"
                  />
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Generates predictive alert when attack probability reaches this value.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                    Incident Auto-Creation Threshold (%):
                  </label>
                  <input
                    type="number"
                    value={incidentThreshold}
                    onChange={(e) => setIncidentThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#BE185D]"
                  />
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Automatically opens formal incident case (INC-XXXX) when breached.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                  Temporal Sliding Horizon Window (Seconds):
                </label>
                <input
                  type="number"
                  value={horizonWindow}
                  onChange={(e) => setHorizonWindow(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#BE185D]"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Sliding temporal window for computing feature drift velocity and acceleration.
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#F3E8E8] pb-2 font-mono">
                Notification & SIEM Webhook
              </h3>

              <div>
                <label className="text-xs font-semibold text-[#0F172A] block mb-1">
                  Ingress Webhook Destination URL:
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] font-mono focus:outline-none focus:border-[#BE185D]"
                />
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Dispatches encrypted JSON payload on Critical alert or Incident trigger.
                </span>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-[#F3E8E8]">
              <button
                type="submit"
                className="px-4 py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>

              {saved && (
                <div className="text-xs font-mono text-[#059669] flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CONFIGURATION APPLIED & RELOADED</span>
                </div>
              )}
            </div>
          </form>
        )}

        {activeTab === "diagnostics" && <SystemHealth />}
        {activeTab === "models" && <ModelPerformance />}
        {activeTab === "data_sources" && <DataSources />}
        {activeTab === "access" && <UsersRoles />}
        {activeTab === "simulation" && <SimulationLab setActivePage={setActivePage} />}
        {activeTab === "export" && <ExportCenter />}
      </div>
    </div>
  );
};
