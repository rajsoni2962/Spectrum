import React, { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Globe,
  AlertTriangle,
  ExternalLink,
  Users,
  Flame,
  Binary,
  ArrowRight,
  Filter,
  Layers
} from "lucide-react";
import { fetchThreatIndicators } from "../services/api";
import { SideInspector, InspectorData } from "../components/SideInspector";

export const ThreatIntelligence: React.FC = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Progressive disclosure side inspector
  const [inspectorData, setInspectorData] = useState<InspectorData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  useEffect(() => {
    loadIndicators();
  }, [searchTerm]);

  const loadIndicators = async () => {
    try {
      const res = await fetchThreatIndicators(searchTerm || undefined);
      setIndicators(res);
      setLoading(false);
    } catch (err) {
      console.error("Threat indicators load error:", err);
    }
  };

  const filteredIndicators = useMemo(() => {
    return indicators.filter((ioc) => {
      const matchType = selectedType === "ALL" || ioc.type === selectedType;
      return matchType;
    });
  }, [indicators, selectedType]);

  const handleRowClick = (ioc: any) => {
    setInspectorData({
      type: "ioc",
      title: `Indicator: ${ioc.value}`,
      subtitle: `${ioc.type} · Actor: ${ioc.threat_actor || "Unknown"}`,
      timestamp: ioc.last_seen || "Recent",
      severity: ioc.reputation_score > 80 ? "CRITICAL" : "WARNING",
      attributes: {
        "Indicator Value": ioc.value,
        "Indicator Type": ioc.type,
        "Threat Actor": ioc.threat_actor || "Unattributed",
        "Associated Malware": ioc.malware || "Unknown",
        "Reputation Score": `${ioc.reputation_score}/100`,
        "Confidence Rating": ioc.confidence || "High",
        "Intelligence Feed": ioc.feed || "AlienVault OTX",
        "First Seen": "2026-09-10 12:00 UTC",
        "Last Observed": ioc.last_seen || "2026-09-17 15:10 UTC",
      },
      tags: [ioc.type, ioc.threat_actor, ioc.malware].filter(Boolean),
      metrics: [
        { label: "Reputation Risk", value: `${ioc.reputation_score}/100` },
        { label: "Confidence", value: ioc.confidence || "95%" },
      ],
      playbookActions: [
        {
          label: `Blackhole Indicator (${ioc.value}) on Edge ACL`,
          destructive: true,
          action: () => alert(`Firewall rule created to blackhole ${ioc.value}`),
        },
      ],
    });
    setIsInspectorOpen(true);
  };

  return (
    <div className="space-y-5 select-text font-mono">
      {/* 1. TOP INTELLIGENCE SUMMARY STRIP */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#BE185D]" />
            <h1 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Threat Intelligence & Adversary Knowledge Base
            </h1>
          </div>
          <p className="text-[11px] text-[#64748B] font-sans mt-0.5">
            Continuous external feed ingestion, IOC attribution graph, and kill-chain correlation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div>
            <div className="text-[10px] text-[#64748B] uppercase font-semibold">Tracked Indicators</div>
            <div className="text-sm font-bold text-[#0F172A] mt-0.5">1,428 Active</div>
          </div>
          <div className="h-6 w-px bg-[#F3E8E8] hidden sm:block" />
          <div>
            <div className="text-[10px] text-[#64748B] uppercase font-semibold">Threat Actors</div>
            <div className="text-sm font-bold text-[#E11D48] mt-0.5">18 Profiles</div>
          </div>
          <div className="h-6 w-px bg-[#F3E8E8] hidden sm:block" />
          <div>
            <div className="text-[10px] text-[#64748B] uppercase font-semibold">Affected Assets</div>
            <div className="text-sm font-bold text-[#BE185D] mt-0.5">3 Local Hosts</div>
          </div>
        </div>
      </div>

      {/* 2. ADVERSARY RELATIONSHIP MAP (Actor → Technique → IoC → Affected Asset) */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#BE185D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Active Campaign Relationship Graph
            </h2>
          </div>
          <span className="text-[10px] text-[#64748B] font-mono">Actor → Technique → IOC → Target</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Node 1: Actor */}
          <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl p-3.5 text-xs space-y-1 relative">
            <div className="text-[9px] uppercase text-[#64748B] font-bold">Threat Actor</div>
            <div className="font-bold text-[#E11D48] text-sm">Storm-0558 / APT28</div>
            <div className="text-[10px] text-[#475569]">Nation-State Volumetric & C2</div>
            <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#F3E8E8] mt-1.5">
              Origin: Eastern Europe
            </div>
          </div>

          {/* Node 2: Technique */}
          <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl p-3.5 text-xs space-y-1 relative">
            <div className="text-[9px] uppercase text-[#64748B] font-bold">MITRE Technique</div>
            <div className="font-bold text-[#D97706] text-sm">T1498.001 (SYN Flood)</div>
            <div className="text-[10px] text-[#475569]">Network Denial of Service</div>
            <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#F3E8E8] mt-1.5">
              Tactic: Impact
            </div>
          </div>

          {/* Node 3: Indicator */}
          <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl p-3.5 text-xs space-y-1 relative">
            <div className="text-[9px] uppercase text-[#64748B] font-bold">Observed Indicator</div>
            <div className="font-bold text-[#BE185D] text-sm">198.51.100.44</div>
            <div className="text-[10px] text-[#475569]">Subnet: 198.51.100.0/24</div>
            <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#F3E8E8] mt-1.5">
              Reputation: 96/100 (Malicious)
            </div>
          </div>

          {/* Node 4: Target Asset */}
          <div className="bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl p-3.5 text-xs space-y-1 relative">
            <div className="text-[9px] uppercase text-[#64748B] font-bold">Affected Asset</div>
            <div className="font-bold text-[#0F172A] text-sm">10.0.1.15 (web-prod-01)</div>
            <div className="text-[10px] text-[#475569]">Role: DMZ Web Frontend</div>
            <div className="text-[10px] text-[#64748B] pt-1.5 border-t border-[#F3E8E8] mt-1.5">
              Exposure: Port 443 TCP
            </div>
          </div>
        </div>
      </div>

      {/* 3. DATA-ORIENTED INDICATOR REGISTRY */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl overflow-hidden shadow-xs">
        {/* Controls Bar */}
        <div className="p-3.5 border-b border-[#F3E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Indicator Registry & Reputation Ledger
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-[#64748B] border border-[#F3E8E8] font-semibold">
              {filteredIndicators.length} matching
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search IOC, actor, malware..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#F3E8E8] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#BE185D]"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-[#F3E8E8] rounded-xl px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="IP">IP Address</option>
              <option value="DOMAIN">Domain</option>
              <option value="HASH">File Hash</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#F3E8E8] text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5">Indicator Value</th>
                <th className="py-3 px-3.5">Threat Actor / Campaign</th>
                <th className="py-3 px-3.5">Reputation</th>
                <th className="py-3 px-3.5">Confidence</th>
                <th className="py-3 px-3.5">Associated Malware</th>
                <th className="py-3 px-3.5">Feed Source</th>
                <th className="py-3 px-3.5">Last Observed</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {filteredIndicators.map((ioc, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(ioc)}
                  className="hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-3.5 text-[#BE185D] font-bold whitespace-nowrap">{ioc.type}</td>
                  <td className="py-2.5 px-3.5 text-[#0F172A] font-semibold whitespace-nowrap">{ioc.value}</td>
                  <td className="py-2.5 px-3.5 text-[#475569] whitespace-nowrap">{ioc.threat_actor}</td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ioc.reputation_score > 90
                          ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
                          : ioc.reputation_score > 70
                          ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                          : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                      }`}
                    >
                      {ioc.reputation_score}/100
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-[#0F172A] whitespace-nowrap">{ioc.confidence}</td>
                  <td className="py-2.5 px-3.5 text-[#475569] whitespace-nowrap">{ioc.malware}</td>
                  <td className="py-2.5 px-3.5 text-[#64748B] whitespace-nowrap">{ioc.feed}</td>
                  <td className="py-2.5 px-3.5 text-[#64748B] text-[11px] whitespace-nowrap">{ioc.last_seen}</td>
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    <span className="text-[10px] text-[#BE185D] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Inspector */}
      <SideInspector
        data={inspectorData}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </div>
  );
};
