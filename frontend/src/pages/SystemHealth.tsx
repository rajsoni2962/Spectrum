import React, { useEffect, useState } from "react";
import { HeartPulse, CheckCircle2, Server, Activity, Shield, Clock } from "lucide-react";
import { fetchSystemHealth } from "../services/api";

export const SystemHealth: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-xs font-mono text-[#64748B]">
        <Activity className="w-4 h-4 animate-spin text-[#BE185D] mr-2" />
        QUERYING SUBSYSTEM DIAGNOSTICS & TELEMETRY DAEMONS...
      </div>
    );
  }

  const { subsystems, connectors, audit_logs, uptime } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">System Health & Diagnostics</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time daemon heartbeats, pipeline latencies, connector states, and audit log
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#64748B]">UPTIME:</span>
          <span className="text-[#059669] font-bold">{uptime}</span>
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
        </div>
      </div>

      {/* Subsystem Health Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* API Gateway */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">API Gateway</span>
            <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-full text-[10px] font-mono font-bold">
              {subsystems.api_status.status}
            </span>
          </div>
          <div className="text-sm font-bold text-[#0F172A]">FastAPI REST Engine</div>
          <div className="text-[11px] text-[#64748B] font-mono">Latency: {subsystems.api_status.latency_ms} ms</div>
        </div>

        {/* Database */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Relational Store</span>
            <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-full text-[10px] font-mono font-bold">
              {subsystems.database_status.status}
            </span>
          </div>
          <div className="text-sm font-bold text-[#0F172A]">PostgreSQL / SQLite</div>
          <div className="text-[11px] text-[#64748B] font-mono">Pool Size: {subsystems.database_status.pool_size} active</div>
        </div>

        {/* ML Inference */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Inference Daemon</span>
            <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-full text-[10px] font-mono font-bold">
              {subsystems.ml_engine_status.status}
            </span>
          </div>
          <div className="text-sm font-bold text-[#0F172A]">RF-TEMPORAL-v2.4</div>
          <div className="text-[11px] text-[#64748B] font-mono">Inference: {subsystems.ml_engine_status.inference_latency_ms} ms</div>
        </div>

        {/* WebSocket */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748B] uppercase font-semibold">Telemetry Socket</span>
            <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] rounded-full text-[10px] font-mono font-bold">
              {subsystems.websocket_status.status}
            </span>
          </div>
          <div className="text-sm font-bold text-[#0F172A]">Ingress WS Bus</div>
          <div className="text-[11px] text-[#64748B] font-mono">Clients: {subsystems.websocket_status.active_clients || 1} connected</div>
        </div>
      </div>

      {/* Connectors Table */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            Active Connector Subsystems
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#F3E8E8] text-[11px] text-[#64748B] uppercase bg-[#FAF8F5]/50">
                <th className="py-2.5 px-3">Connector Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Events Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {connectors.map((conn: any) => (
                <tr key={conn.name} className="hover:bg-[#FDF2F8]/60 transition-colors">
                  <td className="py-2.5 px-3 text-[#0F172A] font-semibold font-sans">{conn.name}</td>
                  <td className="py-2.5 px-3 text-[#64748B]">{conn.type}</td>
                  <td className="py-2.5 px-3 text-[#059669] font-semibold">{conn.status}</td>
                  <td className="py-2.5 px-3 text-[#0F172A]">{conn.events_processed.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            Platform Audit Trail (Last 24 Hours)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#F3E8E8] text-[11px] text-[#64748B] uppercase bg-[#FAF8F5]/50">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User / System</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {audit_logs.map((log: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#FDF2F8]/60 transition-colors">
                  <td className="py-2.5 px-3 text-[#64748B]">{log.time}</td>
                  <td className="py-2.5 px-3 text-[#BE185D] font-bold">{log.user}</td>
                  <td className="py-2.5 px-3 text-[#0F172A] font-medium">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#64748B] font-sans text-[11px]">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
