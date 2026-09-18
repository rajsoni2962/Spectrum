import React, { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert,
  Clock,
  Send,
  Crosshair,
  BrainCircuit,
  FileText,
  Database,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  History,
  Tag
} from "lucide-react";
import { fetchIncidents, fetchIncidentDetail, addIncidentNote, updateIncidentStatus } from "../services/api";
import { IncidentItem } from "../types";

interface IncidentsProps {
  pivotParams?: { incidentNumber?: string };
  navigateWithPivot?: (page: string, params?: any) => void;
}

export const Incidents: React.FC<IncidentsProps> = ({ pivotParams, navigateWithPivot }) => {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [newNote, setNewNote] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const tabHints: Record<string, string> = {
    Overview: "Summary of incident severity, affected devices, and remediation status.",
    Timeline: "Chronological sequence of attack escalation and alert events.",
    Evidence: "Network flows, packet captures, and abnormal feature metrics.",
    "AI Analysis": "Predictive model decision factors, SHAP values, and confidence.",
    "MITRE ATT&CK": "Catalog of adversary tactics and techniques for this incident.",
    "Analyst Notes": "Investigation remarks, containment actions, and ticket updates.",
  };

  const tabs = [
    "Overview",
    "Timeline",
    "Evidence",
    "AI Analysis",
    "MITRE ATT&CK",
    "Analyst Notes",
  ];

  const loadIncidentData = useCallback(async () => {
    try {
      const res = await fetchIncidents();
      setIncidents(res);

      let targetInc = null;
      if (pivotParams?.incidentNumber) {
        targetInc = res.find((i: any) => i.incident_number === pivotParams.incidentNumber);
      }
      if (!targetInc && selectedIncident) {
        targetInc = res.find((i: any) => i.incident_number === selectedIncident.incident_number);
      }
      if (!targetInc && res.length > 0) {
        targetInc = res[0];
      }

      if (targetInc) {
        // Fetch full incident details including events and evidence
        const detail = await fetchIncidentDetail(targetInc.incident_number);
        setSelectedIncident(detail);
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    }
  }, [pivotParams, selectedIncident]);

  useEffect(() => {
    loadIncidentData();
    const interval = setInterval(loadIncidentData, 3500);
    return () => clearInterval(interval);
  }, [loadIncidentData]);

  const handleSelectIncident = async (incNum: string) => {
    try {
      const detail = await fetchIncidentDetail(incNum);
      setSelectedIncident(detail);
    } catch (err) {
      console.error("Failed to fetch detail:", err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      await addIncidentNote(selectedIncident.incident_number, newNote.trim());
      setNewNote("");
      const updated = await fetchIncidentDetail(selectedIncident.incident_number);
      setSelectedIncident(updated);
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedIncident) return;
    try {
      await updateIncidentStatus(selectedIncident.incident_number, status);
      const updated = await fetchIncidentDetail(selectedIncident.incident_number);
      setSelectedIncident(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const incident = selectedIncident || {
    incident_number: "INC-2026-0917-0042",
    title: "Predictive Ingress Anomaly Saturation",
    severity: "Critical",
    status: "Investigating",
    confidence: 0.96,
    first_detected: "2026-09-17 15:08:22 UTC",
    last_activity: "Just now",
    affected_assets: ["10.0.1.15", "10.0.1.1"],
    ai_prediction: "DDoS",
    timeline: [],
    correlated_evidence: []
  };

  const formattedConfidence = typeof incident.confidence === "number"
    ? incident.confidence <= 1 ? (incident.confidence * 100).toFixed(1) : incident.confidence.toFixed(1)
    : "95.0";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Incident Case Management</h1>
            <span className="font-mono text-xs text-[#BE185D] font-bold px-2.5 py-0.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-full">
              {incident.incident_number}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Formal security incident workspace, correlated evidence ledger, and response tracking
          </p>
        </div>

        {/* Case Switcher & Status Controls */}
        <div className="flex items-center gap-3">
          {incidents.length > 1 && (
            <select
              value={incident.incident_number}
              onChange={(e) => handleSelectIncident(e.target.value)}
              className="bg-white border border-[#F3E8E8] text-xs font-mono font-semibold rounded-xl px-3 py-1.5 text-[#BE185D] focus:outline-none shadow-xs cursor-pointer"
            >
              {incidents.map((i) => (
                <option key={i.id || i.incident_number} value={i.incident_number}>
                  {i.incident_number} ({i.severity})
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#64748B] uppercase font-medium">Status:</span>
            <select
              value={incident.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`bg-white border border-[#F3E8E8] text-xs font-mono font-bold rounded-xl px-3 py-1.5 focus:outline-none shadow-xs cursor-pointer ${
                incident.status === "OPEN"
                  ? "text-[#E11D48]"
                  : incident.status === "RESOLVED"
                  ? "text-[#059669]"
                  : "text-[#D97706]"
              }`}
            >
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="CONTAINED">CONTAINED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Metadata Banner */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs shadow-xs">
        <div>
          <span className="text-[#64748B] text-[11px] uppercase font-semibold">Severity</span>
          <div className="mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                incident.severity === "Critical" || incident.severity === "High"
                  ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
                  : "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
              }`}
            >
              {incident.severity.toUpperCase()}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[#64748B] text-[11px] uppercase font-semibold">Predicted Threat</span>
          <div className="font-mono text-[#0F172A] font-semibold mt-1 truncate">
            {incident.ai_prediction || "SYN Saturation Flood"}
          </div>
        </div>

        <div>
          <span className="text-[#64748B] text-[11px] uppercase font-semibold">Confidence</span>
          <div className="font-mono text-[#059669] font-bold mt-1">
            {formattedConfidence}%
          </div>
        </div>

        <div>
          <span className="text-[#64748B] text-[11px] uppercase font-semibold">Target Asset</span>
          <div className="font-mono text-[#0F172A] mt-1 truncate font-semibold">
            {incident.affected_assets?.[0] || "10.0.1.15"}
          </div>
        </div>

        <div>
          <span className="text-[#64748B] text-[11px] uppercase font-semibold">First Detected</span>
          <div className="font-mono text-[#475569] mt-1 text-[11px]">
            {incident.first_detected ? incident.first_detected.substring(11, 19) : "15:08:22"} UTC
          </div>
        </div>

        <div>
          <span className="text-[#64748B] text-[11px] uppercase font-semibold">Assigned Lead</span>
          <div className="font-mono text-[#475569] mt-1 text-[11px] truncate">
            {incident.assigned_analyst || "analyst@spectrum.internal"}
          </div>
        </div>
      </div>

      {/* 6 Tabs Bar with Hover Hint Tooltips */}
      <div className="border-b border-[#F3E8E8] flex items-center gap-1 overflow-x-auto pb-0.5">
        {tabs.map((tab) => (
          <div key={tab} className="relative group/tab shrink-0">
            <button
              onClick={() => setActiveTab(tab)}
              title={`${tab} — ${tabHints[tab] || ""}`}
              className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer rounded-t-lg ${
                activeTab === tab
                  ? "border-[#BE185D] text-[#BE185D] font-semibold bg-white shadow-xs"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-white"
              }`}
            >
              {tab}
            </button>

            {/* Floating Hint Tooltip */}
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-white border border-[#F3E8E8] text-[#475569] text-[11px] rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/tab:opacity-100 transition-all duration-150 z-50 hidden sm:block">
              <span className="text-[#0F172A] font-semibold">{tab}:</span>{" "}
              <span>{tabHints[tab]}</span>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-[#F3E8E8] rotate-45" />
            </div>
          </div>
        ))}
      </div>

      {/* Tab Content Panes */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-5 text-xs shadow-xs">
        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">{incident.title}</h3>
              {navigateWithPivot && incident.affected_assets?.[0] && (
                <button
                  onClick={() => navigateWithPivot("investigation", { targetIp: incident.affected_assets[0] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#F3E8E8] text-[#BE185D] rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Pivot to Investigation for {incident.affected_assets[0]}
                </button>
              )}
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Incident workspace for <code className="text-[#BE185D] font-mono bg-[#FDF2F8] px-1.5 py-0.5 rounded-md border border-[#FCE7F3]">{incident.incident_number}</code>.
              Threat vector classified as <strong className="text-[#0F172A]">{incident.ai_prediction || "Network Anomaly"}</strong> with {formattedConfidence}% model confidence.
              Continuous feature drift and temporal trajectory monitoring active across correlated endpoints.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-3.5 rounded-xl space-y-1">
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-medium">Attack Vector / Classification</span>
                <div className="font-semibold text-[#0F172A]">{incident.ai_prediction || "Volumetric Reflection Flood"}</div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-3.5 rounded-xl space-y-1">
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-medium">Assigned SOC Responder</span>
                <div className="font-semibold text-[#0F172A]">{incident.assigned_analyst || "analyst@spectrum.internal"}</div>
              </div>
            </div>

            {incident.recommended_actions && incident.recommended_actions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#F3E8E8]">
                <span className="text-[#64748B] text-[10px] font-mono uppercase block mb-2 font-semibold">
                  Recommended Mitigation Protocol:
                </span>
                <ul className="space-y-1.5">
                  {incident.recommended_actions.map((act: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#0F172A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BE185D] mt-1.5 shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "Timeline" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Forensic Chronology & Audit Events</h3>
            <div className="relative pl-4 space-y-4 border-l-2 border-[#F3E8E8] mt-2 font-mono">
              {incident.timeline && incident.timeline.length > 0 ? (
                incident.timeline.map((item: any, idx: number) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#BE185D] border-2 border-white shadow-xs" />
                    <span className="text-[#94A3B8] text-[10px]">{item.time}</span>
                    <div className="text-[#0F172A] font-semibold mt-0.5">
                      {item.event || item.description || "Incident Milestone"}
                    </div>
                    {item.created_by && (
                      <div className="text-[10px] text-[#64748B] mt-0.5">By: {item.created_by}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#64748B]">
                  Initial case creation milestone logged at {incident.first_detected}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === "Evidence" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Correlated Telemetry Flows</h3>
            {incident.correlated_evidence && incident.correlated_evidence.length > 0 ? (
              <div className="border border-[#F3E8E8] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAF8F5] text-[#64748B] border-b border-[#F3E8E8]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">TIMESTAMP</th>
                      <th className="py-2.5 px-3 font-semibold">SOURCE</th>
                      <th className="py-2.5 px-3 font-semibold">DESTINATION</th>
                      <th className="py-2.5 px-3 font-semibold">PROTOCOL</th>
                      <th className="py-2.5 px-3 font-semibold">FLAGS</th>
                      <th className="py-2.5 px-3 text-right font-semibold">PACKETS</th>
                      <th className="py-2.5 px-3 text-right font-semibold">RISK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3E8E8]">
                    {incident.correlated_evidence.map((ev: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="py-2 px-3 text-[#64748B]">{ev.timestamp ? ev.timestamp.substring(11, 19) : "15:08:22"}</td>
                        <td className="py-2 px-3 text-[#BE185D] font-medium">{ev.source_ip}:{ev.source_port || 45123}</td>
                        <td className="py-2 px-3 text-[#0F172A] font-semibold">{ev.destination_ip}:{ev.destination_port || 443}</td>
                        <td className="py-2 px-3 text-[#64748B]">{ev.protocol}</td>
                        <td className="py-2 px-3 text-[#D97706]">{ev.tcp_flags || "SYN"}</td>
                        <td className="py-2 px-3 text-right text-[#64748B]">{ev.packets}</td>
                        <td className="py-2 px-3 text-right text-[#E11D48] font-bold">{ev.risk_score || 85.0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-4 rounded-xl text-xs text-[#64748B]">
                No correlated raw packet flows archived for this incident window. Telemetry extraction active.
              </div>
            )}
          </div>
        )}

        {/* AI ANALYSIS TAB */}
        {activeTab === "AI Analysis" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Model Inference & Anomaly Decomposition</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-3.5 rounded-xl">
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-semibold">Ensemble Model Architecture</span>
                <div className="text-sm font-bold text-[#0F172A] mt-1">Random Forest + Isolation Forest</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Calibrated on 10 attack classes</div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-3.5 rounded-xl">
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-semibold">Confidence Score</span>
                <div className="text-sm font-bold text-[#059669] mt-1">{formattedConfidence}%</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Statistical probability bound</div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-3.5 rounded-xl">
                <span className="text-[#64748B] text-[10px] font-mono uppercase font-semibold">Advance Horizon</span>
                <div className="text-sm font-bold text-[#D97706] mt-1">45 seconds early warning</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Prior to buffer saturation</div>
              </div>
            </div>
            <div className="bg-[#FDF2F8] border border-[#FCE7F3] p-4 rounded-xl text-xs leading-relaxed text-[#475569]">
              <strong className="text-[#0F172A]">Feature Velocity Analysis:</strong> The temporal forecaster observed abnormal deviation in SYN ratio (+88% above 3-sigma baseline) combined with destination concentration index of 0.94. The rate of drift velocity peaked at 42.1k pps/s.
            </div>
          </div>
        )}

        {/* MITRE ATT&CK TAB */}
        {activeTab === "MITRE ATT&CK" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">MITRE ATT&CK Enterprise Matrix Alignment</h3>
            {incident.mitre_technique ? (
              <div className="space-y-3 bg-[#FAF8F5] border border-[#F3E8E8] p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3]">
                    {incident.mitre_technique.id}
                  </span>
                  <span className="text-sm font-bold text-[#0F172A]">{incident.mitre_technique.name}</span>
                  <span className="text-xs text-[#64748B]">({incident.mitre_technique.tactic})</span>
                </div>
                {incident.mitre_technique.description && (
                  <p className="text-xs text-[#475569] leading-relaxed">{incident.mitre_technique.description}</p>
                )}
                {incident.mitre_technique.detection_guidance && (
                  <div className="pt-2 border-t border-[#F3E8E8]">
                    <span className="text-[#64748B] text-[10px] uppercase font-mono font-semibold">Detection Guidance:</span>
                    <p className="text-xs text-[#0F172A] mt-0.5">{incident.mitre_technique.detection_guidance}</p>
                  </div>
                )}
                {incident.mitre_technique.mitigation && (
                  <div className="pt-2 border-t border-[#F3E8E8]">
                    <span className="text-[#64748B] text-[10px] uppercase font-mono font-semibold">Mitigation Strategy:</span>
                    <p className="text-xs text-[#0F172A] mt-0.5">{incident.mitre_technique.mitigation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-4 rounded-xl text-xs text-[#64748B]">
                Aligned with MITRE ATT&CK T1498 (Network Denial of Service) under Impact tactic.
              </div>
            )}
          </div>
        )}

        {/* ANALYST NOTES TAB */}
        {activeTab === "Analyst Notes" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">Analyst Case Notes & Collaboration</h3>

            <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-4 rounded-xl text-xs font-mono text-[#0F172A] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {incident.analyst_notes || "No analyst notes appended to this case yet."}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Append timestamped analyst note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#BE185D]"
              />
              <button
                type="submit"
                disabled={isSubmittingNote || !newNote.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingNote ? "Saving..." : "Add Note"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
