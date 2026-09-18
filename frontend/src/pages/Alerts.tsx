import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  X,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { fetchAlerts, updateAlertAction, escalateAlertToIncident } from "../services/api";
import { AlertItem } from "../types";

interface AlertsProps {
  navigateWithPivot?: (page: string, params?: any) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ navigateWithPivot }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [isEscalating, setIsEscalating] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetchAlerts();
      const normalized = res.map((a: any) => ({
        ...a,
        alert_id: a.alert_id || a.alert_code || `ALT-${a.id}`,
        status:
          a.status === "Open"
            ? "NEW"
            : a.status === "Investigating"
            ? "INVESTIGATING"
            : a.status === "Acknowledged"
            ? "ACKNOWLEDGED"
            : a.status === "Resolved"
            ? "RESOLVED"
            : a.status ? a.status.toUpperCase() : "NEW",
        assigned: a.assigned_to || a.assigned || "analyst.soc",
        confidence: a.confidence !== undefined ? a.confidence : (a.confidence_score ? Math.round(a.confidence_score * 100) : 94),
        source: a.source || a.source_ip || "198.51.100.44",
        target: a.target || a.destination_ip || "10.0.1.15",
        created_at: a.created_at || a.timestamp || "Just now",
      }));
      setAlerts(normalized);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 2500);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const handleUpdateStatus = async (alertId: number, newStatus: string) => {
    try {
      await updateAlertAction(alertId, newStatus.toLowerCase(), actionNote);
    } catch {
      // Offline fallback
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus as any } : a))
    );
    setActionNote("");
    setSelectedAlert(null);
    await loadAlerts();
  };

  const handleEscalateToIncident = async () => {
    if (!selectedAlert) return;
    setIsEscalating(true);
    try {
      const res = await escalateAlertToIncident(selectedAlert.id, actionNote);
      setIsEscalating(false);
      setSelectedAlert(null);
      setActionNote("");
      if (navigateWithPivot && res.incident_number) {
        navigateWithPivot("incidents", { incidentNumber: res.incident_number });
      }
    } catch (err) {
      console.error("Failed to escalate alert:", err);
      setIsEscalating(false);
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.alert_id && a.alert_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.source && a.source.includes(searchQuery)) ||
        (a.target && a.target.includes(searchQuery));
      return matchStatus && matchSearch;
    });
  }, [alerts, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: alerts.length,
      new: alerts.filter((a) => a.status === "NEW").length,
      acknowledged: alerts.filter((a) => a.status === "ACKNOWLEDGED").length,
      investigating: alerts.filter((a) => a.status === "INVESTIGATING").length,
      resolved: alerts.filter((a) => a.status === "RESOLVED").length,
    };
  }, [alerts]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Alert Triage Queue</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Automated anomaly detection alerts correlated across temporal sliding windows
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 bg-white border border-[#F3E8E8] rounded-full text-[#64748B] shadow-xs">
            TOTAL: <strong className="text-[#0F172A]">{alerts.length}</strong>
          </span>
          <span className="px-3 py-1 bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] rounded-full font-semibold shadow-xs">
            NEW: {counts.new}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent"
              }`}
            >
              {st}
              {st === "NEW" && counts.new > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-[#E11D48] text-white rounded-full text-[9px]">
                  {counts.new}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by title, IP, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#BE185D]"
          />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F3E8E8] bg-[#FAF8F5] text-[#64748B] font-mono text-[11px] font-semibold">
                <th className="py-3 px-4">ALERT ID</th>
                <th className="py-3 px-4">SEVERITY</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">RULE / THREAT TITLE</th>
                <th className="py-3 px-4">SOURCE IP</th>
                <th className="py-3 px-4">TARGET IP</th>
                <th className="py-3 px-4 text-right">CONFIDENCE</th>
                <th className="py-3 px-4 text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                const isCritical = alert.severity === "Critical";
                const isHigh = alert.severity === "High";

                return (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#FDF2F8]/70"
                        : "hover:bg-[#FAF8F5]/80"
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-[#BE185D] font-semibold">
                      {alert.alert_id || alert.alert_code || `ALT-${alert.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          isCritical || isHigh
                            ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
                            : "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span
                        className={`inline-flex items-center gap-1.5 ${
                          alert.status === "NEW"
                            ? "text-[#E11D48] font-semibold"
                            : alert.status === "INVESTIGATING"
                            ? "text-[#2563EB] font-semibold"
                            : alert.status === "RESOLVED"
                            ? "text-[#059669] font-semibold"
                            : "text-[#64748B]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            alert.status === "NEW"
                              ? "bg-[#E11D48]"
                              : alert.status === "INVESTIGATING"
                              ? "bg-[#2563EB]"
                              : alert.status === "RESOLVED"
                              ? "bg-[#059669]"
                              : "bg-[#64748B]"
                          }`}
                        />
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#0F172A]">
                      <div className="truncate max-w-xs sm:max-w-md font-semibold">{alert.title}</div>
                      {alert.category && (
                        <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                          Category: {alert.category} {alert.mitre_technique_id && `• MITRE ${alert.mitre_technique_id}`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">
                      {alert.source}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#0F172A] font-semibold">
                      {alert.target}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-right text-[#059669] font-semibold">
                      {typeof alert.confidence === "number" && alert.confidence <= 1 ? (alert.confidence * 100).toFixed(1) : alert.confidence}%
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-right text-[#94A3B8]">
                      {typeof alert.created_at === "string" && alert.created_at.includes("T")
                        ? alert.created_at.replace("T", " ").substring(11, 19) + " UTC"
                        : alert.created_at}
                    </td>
                  </tr>
                );
              })}

              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#64748B]">
                    No alerts matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Alert Action Drawer */}
      {selectedAlert && (
        <div className="bg-white border border-[#F3E8E8] rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-[#0F172A]">
                Triage Case: {selectedAlert.alert_id || selectedAlert.alert_code || `ALT-${selectedAlert.id}`}
              </span>
              <span className="text-xs text-[#64748B]">
                — {selectedAlert.title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FDF2F8] border border-[#FCE7F3] text-[#BE185D] font-semibold">
                STATUS: {selectedAlert.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedAlert(null)}
              className="text-[#94A3B8] hover:text-[#0F172A] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description & Reasoning */}
          {selectedAlert.description && (
            <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-3.5 rounded-xl text-xs text-[#475569] leading-relaxed">
              <strong className="text-[#0F172A]">Model Assessment:</strong> {selectedAlert.description}
            </div>
          )}

          {/* Pivot Links & Action Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1">
            {/* Analyst Pivot Quick Links */}
            <div className="flex items-center gap-2 text-xs">
              {navigateWithPivot && (
                <>
                  <button
                    onClick={() => navigateWithPivot("investigation", { targetIp: selectedAlert.target || selectedAlert.source })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#F3E8E8] text-[#BE185D] text-[11px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Search className="w-3 h-3" />
                    Pivot to Investigation
                  </button>
                  <button
                    onClick={() => navigateWithPivot("network_explorer", { targetIp: selectedAlert.target })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#F3E8E8] text-[#64748B] hover:text-[#0F172A] text-[11px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Inspect Asset in Topology
                  </button>
                </>
              )}
            </div>

            {/* Triage Status Buttons & Escalate */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Optional triage note..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#BE185D] w-48 sm:w-64"
              />

              <button
                onClick={() => handleUpdateStatus(selectedAlert.id, "ACKNOWLEDGED")}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#F3E8E8] text-[#0F172A] text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Acknowledge
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedAlert.id, "RESOLVED")}
                className="px-3 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Resolve
              </button>
              <button
                onClick={handleEscalateToIncident}
                disabled={isEscalating}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#FFE4E6] hover:bg-[#FECDD3] border border-[#FECDD3] text-[#E11D48] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {isEscalating ? "Escalating..." : "Escalate to Incident"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
