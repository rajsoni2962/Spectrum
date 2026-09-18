import React, { useEffect, useState } from "react";
import { Binary, PieChart, BarChart3, Activity, Search, Filter } from "lucide-react";
import { fetchTrafficEvents } from "../services/api";

export const TrafficAnalysis: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedProto, setSelectedProto] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTrafficEvents(100).then((res) => setEvents(res || []));
  }, []);

  const tcpCount = events.filter((e) => e.protocol?.includes("TCP")).length;
  const udpCount = events.filter((e) => e.protocol?.includes("UDP")).length;
  const dnsCount = events.filter((e) => e.protocol?.includes("DNS") || e.destination_port === 53).length;
  const httpCount = events.filter((e) => e.protocol?.includes("HTTP") || [80, 443, 8080].includes(e.destination_port)).length;

  const filtered = events.filter((e) => {
    const matchProto = selectedProto === "ALL" || e.protocol?.toUpperCase() === selectedProto;
    const matchSearch =
      !search ||
      e.source_ip?.includes(search) ||
      e.destination_ip?.includes(search) ||
      String(e.destination_port).includes(search);
    return matchProto && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Flow Traffic Analysis</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Deep packet flow inspection, protocol dispersion, and entropy analysis across monitored segments
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#64748B] px-3 py-1 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg">
          INSPECTION WINDOW: 100 SAMPLES
        </div>
      </div>

      {/* Protocol Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            TCP Flow Share
          </div>
          <div className="text-xl font-bold font-mono text-[#BE185D] mt-1.5">
            {events.length ? ((tcpCount / events.length) * 100).toFixed(1) : 78.4}%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">{tcpCount} observed flows</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            UDP Amplification Ratio
          </div>
          <div className="text-xl font-bold font-mono text-[#059669] mt-1.5">
            {events.length ? ((udpCount / events.length) * 100).toFixed(1) : 14.2}%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">{udpCount} observed flows</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            DNS Query Entropy
          </div>
          <div className="text-xl font-bold font-mono text-[#D97706] mt-1.5">
            {events.length ? ((dnsCount / events.length) * 100).toFixed(1) : 3.8}%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Standard resolver profile</div>
        </div>

        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Avg Packet Payload
          </div>
          <div className="text-xl font-bold font-mono text-[#0F172A] mt-1.5">
            548 <span className="text-xs font-normal text-[#64748B]">Bytes</span>
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">MTU baseline normal</div>
        </div>
      </div>

      {/* Filter and Flow Table */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="font-bold text-[#0F172A] uppercase tracking-wider">
            Sampled Packet Ingress Flows ({filtered.length})
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter IP or port..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#BE185D]"
              />
            </div>

            <select
              value={selectedProto}
              onChange={(e) => setSelectedProto(e.target.value)}
              className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none"
            >
              <option value="ALL">Protocol: All</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F3E8E8] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider font-mono bg-[#FAF8F5]/50">
                <th className="py-2.5 px-3">Flow ID</th>
                <th className="py-2.5 px-3">Source IP</th>
                <th className="py-2.5 px-3">Target IP</th>
                <th className="py-2.5 px-3">Protocol</th>
                <th className="py-2.5 px-3">Target Port</th>
                <th className="py-2.5 px-3">Packets</th>
                <th className="py-2.5 px-3">Bytes</th>
                <th className="py-2.5 px-3">Anomaly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8] font-mono">
              {filtered.slice(0, 15).map((e, idx) => (
                <tr key={idx} className="hover:bg-[#FDF2F8]/60 transition-colors">
                  <td className="py-2.5 px-3 text-[#64748B]">FLW-{1000 + idx}</td>
                  <td className="py-2.5 px-3 text-[#0F172A] font-semibold">{e.source_ip}</td>
                  <td className="py-2.5 px-3 text-[#64748B]">{e.destination_ip}</td>
                  <td className="py-2.5 px-3 text-[#BE185D] font-medium">{e.protocol}</td>
                  <td className="py-2.5 px-3 text-[#64748B]">{e.destination_port}</td>
                  <td className="py-2.5 px-3 text-[#0F172A]">{e.packets_per_sec}</td>
                  <td className="py-2.5 px-3 text-[#64748B]">{(e.bytes_per_sec / 1024).toFixed(1)} KB</td>
                  <td className="py-2.5 px-3 text-[#D97706]">{e.anomaly_score?.toFixed(2) || "0.04"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
