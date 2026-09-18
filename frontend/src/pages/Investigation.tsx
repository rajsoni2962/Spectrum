import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Server,
  Activity,
  ShieldAlert,
  Clock,
  Database,
  Send,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Binary,
  Layers,
  CheckCircle2,
  AlertOctagon,
  FileDown
} from "lucide-react";
import { fetchInvestigationCase, queryInvestigationEvents } from "../services/api";
import { SideInspector, InspectorData } from "../components/SideInspector";

interface InvestigationProps {
  pivotParams?: { targetIp?: string };
}

export const Investigation: React.FC<InvestigationProps> = ({ pivotParams }) => {
  const [targetIp, setTargetIp] = useState<string>(pivotParams?.targetIp || "10.0.1.15");
  const [searchInput, setSearchInput] = useState<string>(pivotParams?.targetIp || "10.0.1.15");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"scope" | "query">("scope");

  // Side Inspector
  const [inspectorData, setInspectorData] = useState<InspectorData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Query mode states
  const [queryParams, setQueryParams] = useState({
    query: "",
    source_ip: "",
    destination_ip: "",
    protocol: "",
    min_risk: 0,
  });
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState("");
  const [notesList, setNotesList] = useState<string[]>([
    "15:10 UTC [Analyst.SOC]: Confirmed 45k+ pps surge from 198.51.100.0/24 subnet.",
    "15:05 UTC [Analyst.SOC]: Initiated border ACL drop for persistent RST anomaly sources.",
  ]);

  const loadCase = useCallback(async (ip: string) => {
    setLoading(true);
    try {
      const res = await fetchInvestigationCase(ip);
      setData(res);
    } catch (err) {
      console.error("Investigation fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pivotParams?.targetIp) {
      setTargetIp(pivotParams.targetIp);
      setSearchInput(pivotParams.targetIp);
    }
  }, [pivotParams]);

  useEffect(() => {
    loadCase(targetIp);
  }, [targetIp, loadCase]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTargetIp(searchInput.trim());
    }
  };

  const handleRunQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuerying(true);
    try {
      const res = await queryInvestigationEvents({
        query: queryParams.query || undefined,
        source_ip: queryParams.source_ip || undefined,
        destination_ip: queryParams.destination_ip || undefined,
        protocol: queryParams.protocol || undefined,
        min_risk: queryParams.min_risk ? Number(queryParams.min_risk) : undefined,
        limit: 50,
      });
      setQueryResults(res.events || []);
    } catch (err) {
      console.error("Query failed:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, "0")}:${String(
      now.getUTCMinutes()
    ).padStart(2, "0")} UTC`;
    setNotesList([`${timeStr} [Analyst.SOC]: ${newNote.trim()}`, ...notesList]);
    setNewNote("");
  };

  const handleInspectFlow = (ev: any) => {
    const peer = ev.source_ip === targetIp ? ev.destination_ip : ev.source_ip;
    setInspectorData({
      type: "flow",
      title: `Forensic Flow: ${ev.source_ip} → ${ev.destination_ip}`,
      subtitle: `Protocol: ${ev.protocol} · Flags: ${ev.tcp_flags || "ACK"}`,
      timestamp: ev.timestamp || "15:08:22 UTC",
      severity: ev.risk_score > 70 ? "CRITICAL" : "NORMAL",
      attributes: {
        "Source Host": ev.source_ip,
        "Destination Host": ev.destination_ip,
        "Transport Protocol": ev.protocol,
        "TCP Flags": ev.tcp_flags || "ACK",
        "Calculated Risk": ev.risk_score || 75.0,
        "Correlated Anomaly": ev.anomaly_score || 0.88,
        "Targeted Asset": targetIp,
      },
      tags: [ev.protocol, "FORENSIC-CORRELATED", "EVIDENCE"],
      metrics: [
        { label: "Entity Risk", value: `${ev.risk_score || 75.0}%` },
        { label: "Anomaly Magnitude", value: `${ev.anomaly_score || 0.88}σ` },
      ],
      playbookActions: [
        {
          label: `Quarantine Peer (${peer})`,
          destructive: true,
          action: () => alert(`Quarantine issued for peer IP: ${peer}`),
        },
      ],
    });
    setIsInspectorOpen(true);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96 text-xs font-mono text-[#64748B]">
        <Activity className="w-4 h-4 animate-spin text-[#BE185D] mr-2" />
        RECONSTRUCTING FORENSIC DOSSIER & RELATIONSHIP TIMELINE FOR {targetIp}...
      </div>
    );
  }

  const { target_asset, behavioral_telemetry, ai_assessment, correlated_events, timeline } =
    data || {};

  return (
    <div className="space-y-4 select-text">
      {/* Top Scope & Mode Bar */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-mono text-[#64748B] uppercase shrink-0 font-semibold">
            Scope Target:
          </span>
          <input
            type="text"
            placeholder="e.g. 10.0.1.15 or 198.51.100.44"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full md:w-60 px-3 py-1.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs font-mono text-[#0F172A] font-bold focus:outline-none focus:border-[#BE185D]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] font-mono transition-colors"
          >
            Pivot Scope
          </button>
        </form>

        {/* Quick Scope Selectors */}
        <div className="flex items-center gap-1.5 text-xs font-mono overflow-x-auto w-full md:w-auto">
          <span className="text-[10px] text-[#64748B] uppercase mr-1">Entities:</span>
          {[
            { label: "web-prod-01", ip: "10.0.1.15" },
            { label: "db-cluster", ip: "10.0.1.20" },
            { label: "dc-auth", ip: "10.0.1.5" },
            { label: "threat-origin", ip: "198.51.100.44" },
            { label: "c2-node", ip: "91.240.118.22" },
          ].map((item) => (
            <button
              key={item.ip}
              onClick={() => {
                setTargetIp(item.ip);
                setSearchInput(item.ip);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] border transition-colors ${
                targetIp === item.ip
                  ? "bg-[#FDF2F8] border-[#FCE7F3] text-[#BE185D] font-bold"
                  : "bg-[#FAF8F5] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-0.5 rounded-lg border border-[#E2E8F0]">
          <button
            onClick={() => setViewMode("scope")}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
              viewMode === "scope"
                ? "bg-white text-[#BE185D] border border-[#F3E8E8] shadow-sm font-semibold"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Asset Dossier
          </button>
          <button
            onClick={() => {
              setViewMode("query");
              if (queryResults.length === 0) handleRunQuery({ preventDefault: () => {} } as any);
            }}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
              viewMode === "query"
                ? "bg-white text-[#BE185D] border border-[#F3E8E8] shadow-sm font-semibold"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Flow Query
          </button>
        </div>
      </div>

      {viewMode === "scope" ? (
        /* 3-COLUMN COMMAND WORKSPACE (Left: Context, Center: Timeline & Evidence, Right: AI & Actions) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* COLUMN 1: LEFT (Case & Asset Context - 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {target_asset && (
              <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2 font-mono">
                    <Server className="w-3.5 h-3.5 text-[#BE185D]" />
                    Asset Context
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] font-bold">
                    RISK: {target_asset.risk_score || 88.5}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#F3E8E8]">
                    <span className="text-[#64748B]">Host:</span>
                    <span className="text-[#0F172A] font-semibold">{target_asset.hostname}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F3E8E8]">
                    <span className="text-[#64748B]">IP Address:</span>
                    <span className="text-[#BE185D] font-medium">{target_asset.ip_address}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F3E8E8]">
                    <span className="text-[#64748B]">Role:</span>
                    <span className="text-[#0F172A]">{target_asset.role}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F3E8E8]">
                    <span className="text-[#64748B]">Criticality:</span>
                    <span className="text-[#D97706] font-bold">{target_asset.criticality}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F3E8E8]">
                    <span className="text-[#64748B]">OS:</span>
                    <span className="text-[#64748B]">{target_asset.operating_system}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Open Ports:</span>
                    <span className="text-[#0F172A]">{target_asset.open_ports?.join(", ") || "80, 443"}</span>
                  </div>
                </div>

                {target_asset.vulnerabilities && target_asset.vulnerabilities.length > 0 && (
                  <div className="pt-2 border-t border-[#F3E8E8]">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase block mb-1">
                      Identified Vulnerabilities:
                    </span>
                    <div className="space-y-1 font-mono">
                      {target_asset.vulnerabilities.map((v: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-[11px] text-[#E11D48] bg-[#FFF1F2] px-2.5 py-1.5 rounded-lg border border-[#FFE4E6]"
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Behavioral Divergence Box */}
            {behavioral_telemetry && (
              <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-3 font-mono shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#F3E8E8] pb-2">
                  Behavioral Baselines
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#64748B] block">INGRESS RATE</span>
                    <span className="font-bold text-[#0F172A]">
                      {behavioral_telemetry.packet_rate?.toFixed(1) || 0} pps
                    </span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#64748B] block">SYN RATIO</span>
                    <span className="font-bold text-[#D97706]">
                      {(behavioral_telemetry.syn_ratio * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#64748B] block">RST RATIO</span>
                    <span className="font-bold text-[#E11D48]">
                      {(behavioral_telemetry.rst_ratio * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-2.5 rounded-lg">
                    <span className="text-[10px] text-[#64748B] block">FAILED CONNS</span>
                    <span className="font-bold text-[#0F172A]">
                      {behavioral_telemetry.failed_connections || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: CENTER (Timeline & Correlated Evidence Ledger - 6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Entity Communication Flow Visual */}
            <div className="bg-white border border-[#F3E8E8] rounded-xl p-3.5 space-y-2 font-mono shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center justify-between border-b border-[#F3E8E8] pb-2">
                <span>Entity Communication Path</span>
                <span className="text-[10px] text-[#BE185D] bg-[#FDF2F8] border border-[#FCE7F3] px-2 py-0.5 rounded font-semibold">Active Ingress Route</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg text-xs">
                <div className="text-center">
                  <div className="text-[10px] text-[#64748B]">SUSPECT SOURCE</div>
                  <div className="font-bold text-[#E11D48] mt-0.5">198.51.100.44</div>
                </div>
                <div className="flex-1 px-4 text-center">
                  <div className="text-[10px] font-semibold text-[#BE185D]">TCP 443 / 48.2 MB</div>
                  <div className="h-0.5 bg-[#BE185D]/40 w-full my-1 relative">
                    <span className="absolute right-0 -top-1 w-2 h-2 border-r-2 border-t-2 border-[#BE185D] rotate-45" />
                  </div>
                  <div className="text-[10px] text-[#64748B]">Edge Gateway [FW-01]</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-[#64748B]">TARGET HOST</div>
                  <div className="font-bold text-[#0F172A] mt-0.5">{targetIp}</div>
                </div>
              </div>
            </div>

            {/* Timeline Sequence */}
            <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#BE185D]" />
                  Chronological Forensic Milestones
                </h2>
                <span className="text-[10px] font-mono text-[#64748B]">UTC Timeline</span>
              </div>

              <div className="relative pl-3 space-y-3.5 border-l border-[#F3E8E8] mt-2 max-h-56 overflow-y-auto">
                {timeline && timeline.length > 0 ? (
                  timeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative pl-3 text-xs font-mono">
                      <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#BE185D] border-2 border-white shadow-sm" />
                      <div className="text-[10px] text-[#64748B]">{item.time}</div>
                      <div className="text-[#0F172A] font-semibold text-xs mt-0.5">{item.title}</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#64748B] font-mono">No timeline events recorded.</div>
                )}
              </div>
            </div>

            {/* Correlated Raw Flows Ledger */}
            <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2 font-mono">
                  <Database className="w-3.5 h-3.5 text-[#059669]" />
                  Correlated Raw Packet Ledger
                </h2>
                <span className="text-[10px] font-mono text-[#64748B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#F3E8E8]">
                  {correlated_events?.length || 0} Records
                </span>
              </div>

              <div className="border border-[#F3E8E8] rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#FAF8F5] text-[#64748B] border-b border-[#F3E8E8] sticky top-0 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Peer IP</th>
                        <th className="py-2.5 px-3">Proto</th>
                        <th className="py-2.5 px-3">Flags</th>
                        <th className="py-2.5 px-3 text-right">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3E8E8]">
                      {correlated_events && correlated_events.length > 0 ? (
                        correlated_events.map((ev: any, idx: number) => {
                          const peer = ev.source_ip === targetIp ? ev.destination_ip : ev.source_ip;
                          return (
                            <tr
                              key={idx}
                              onClick={() => handleInspectFlow(ev)}
                              className="hover:bg-[#FDF2F8]/60 cursor-pointer transition-colors"
                            >
                              <td className="py-2 px-3 text-[#64748B]">
                                {ev.timestamp ? ev.timestamp.substring(11, 19) : "15:08:22"}
                              </td>
                              <td className="py-2 px-3 text-[#BE185D] font-medium truncate max-w-[140px]">
                                {peer}
                              </td>
                              <td className="py-2 px-3 text-[#0F172A]">{ev.protocol}</td>
                              <td className="py-2 px-3 text-[#D97706]">{ev.tcp_flags || "ACK"}</td>
                              <td className="py-2 px-3 text-right font-bold text-[#E11D48]">
                                {ev.risk_score || 75.0}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-xs text-[#64748B]">
                            No correlated network flow events for this entity.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: RIGHT (AI Assessment & Tactical Playbooks - 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* AI Threat Assessment */}
            {ai_assessment && (
              <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-3 font-mono shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#BE185D] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AI Assessment
                  </h2>
                  <span className="text-[10px] text-[#64748B]">Temporal Engine</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[#64748B] text-[10px] uppercase font-semibold">Hypothesis:</span>
                    <p className="text-[#0F172A] font-sans font-medium text-xs mt-0.5 leading-relaxed">
                      {ai_assessment.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F3E8E8] flex justify-between items-center">
                    <span className="text-[#64748B]">Forecasted Attack:</span>
                    <span className="text-[#E11D48] font-bold">{ai_assessment.forecasted_attack}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Model Confidence:</span>
                    <span className="text-[#BE185D] font-bold">
                      {(ai_assessment.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Action Horizon:</span>
                    <span className="text-[#059669] font-bold">{ai_assessment.time_horizon}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tactical Containment Playbooks */}
            <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-2.5 font-mono shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#F3E8E8] pb-2">
                Tactical Playbooks
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => alert(`Host quarantine issued for ${targetIp}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FECDD3] text-[#E11D48] text-xs transition-colors font-medium"
                >
                  <span>Quarantine Host</span>
                  <AlertOctagon className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => alert(`Border ACL drop rule created for peer sources`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] text-[#0F172A] text-xs transition-colors font-medium"
                >
                  <span>Blackhole Ingress Subnet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => alert(`Port 443 rate-limiting rule pushed to Edge Gateway`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] text-[#0F172A] text-xs transition-colors font-medium"
                >
                  <span>Rate-Limit Target Port</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => alert(`Full forensic evidence bundle exported as JSON`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#FCE7F3] text-[#BE185D] text-xs transition-colors font-medium"
                >
                  <span>Export Case Bundle</span>
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Analyst Case Journal */}
            <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-3 font-mono shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-[#F3E8E8] pb-2">
                Analyst Journal
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto text-[11px]">
                {notesList.map((note, idx) => (
                  <div key={idx} className="p-2.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg text-[#0F172A]">
                    {note}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Add case triage note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] focus:outline-none focus:border-[#BE185D]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] border border-[#E2E8F0] rounded-lg text-[#BE185D] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Flow Query Mode */
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-4 font-mono shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="border-b border-[#F3E8E8] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Forensic Flow Search
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Execute low-level filter queries across ingress PCAP captures and NetFlow telemetry
            </p>
          </div>

          <form onSubmit={handleRunQuery} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-[#64748B] block mb-1 font-semibold">Source IP</label>
              <input
                type="text"
                placeholder="198.51.100.*"
                value={queryParams.source_ip}
                onChange={(e) => setQueryParams({ ...queryParams, source_ip: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#BE185D]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] block mb-1 font-semibold">Destination IP</label>
              <input
                type="text"
                placeholder="10.0.1.*"
                value={queryParams.destination_ip}
                onChange={(e) => setQueryParams({ ...queryParams, destination_ip: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#BE185D]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#64748B] block mb-1 font-semibold">Protocol</label>
              <select
                value={queryParams.protocol}
                onChange={(e) => setQueryParams({ ...queryParams, protocol: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none"
              >
                <option value="">All Protocols</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isQuerying}
                className="w-full py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white rounded-lg font-medium shadow-sm transition-colors"
              >
                {isQuerying ? "Querying..." : "Execute Query"}
              </button>
            </div>
          </form>

          {/* Results Table */}
          <div className="border border-[#F3E8E8] rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF8F5] text-[#64748B] border-b border-[#F3E8E8] sticky top-0 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Source IP</th>
                    <th className="py-2.5 px-3">Destination IP</th>
                    <th className="py-2.5 px-3">Proto</th>
                    <th className="py-2.5 px-3">Port</th>
                    <th className="py-2.5 px-3 text-right">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3E8E8]">
                  {queryResults.map((ev, idx) => (
                    <tr
                      key={idx}
                      onClick={() => handleInspectFlow(ev)}
                      className="hover:bg-[#FDF2F8]/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 text-[#64748B]">{ev.timestamp || "15:10:00"}</td>
                      <td className="py-2 px-3 text-[#0F172A] font-medium">{ev.source_ip}</td>
                      <td className="py-2 px-3 text-[#64748B]">{ev.destination_ip}</td>
                      <td className="py-2 px-3 text-[#BE185D] font-medium">{ev.protocol}</td>
                      <td className="py-2 px-3 text-[#64748B]">{ev.destination_port || 443}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#E11D48]">
                        {ev.risk_score || 80.0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Side Inspector Drawer */}
      <SideInspector
        data={inspectorData}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
};
