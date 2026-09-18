import React, { useState } from "react";
import {
  Crosshair,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";

interface MitreItem {
  id: string;
  technique: string;
  tactic: string;
  confidence: number;
  evidence: string;
  observedEvents: number;
  status: "ACTIVE" | "EVALUATED" | "MONITORED";
  detectionVector: string;
  mitigation: string;
}

export const MitreAttack: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedTactic, setSelectedTactic] = useState<string>("ALL");

  const techniques: MitreItem[] = [
    {
      id: "T1498",
      technique: "Network Denial of Service",
      tactic: "Impact",
      confidence: 96.4,
      evidence: "Multi-source volumetric SYN packet flood exceeding 45,000 pps, asymmetric handshake completion ratio <8%",
      observedEvents: 1420,
      status: "ACTIVE",
      detectionVector: "Temporal sliding-window packet velocity & TCP flag skew",
      mitigation: "BGP Flowspec ingress throttling, activate perimeter SYN cookies",
    },
    {
      id: "T1046",
      technique: "Network Service Discovery",
      tactic: "Discovery",
      confidence: 91.2,
      evidence: "Rapid sequential TCP SYN probes targeting ports 21-8080 across domain controller 10.0.1.5, high RST/ACK returns",
      observedEvents: 420,
      status: "EVALUATED",
      detectionVector: "Destination port Shannon entropy collapse and RST anomaly",
      mitigation: "Drop unauthenticated perimeter probe packets, isolate scanner IP at ACL",
    },
    {
      id: "T1110",
      technique: "Brute Force: Password Spraying",
      tactic: "Credential Access",
      confidence: 88.5,
      evidence: "High-frequency authentication burst (port 22/3389), zero payload transfer, 12 attempts per second from 185.220.101.5",
      observedEvents: 312,
      status: "EVALUATED",
      detectionVector: "Authentication connection frequency burst and session duration variance",
      mitigation: "Trigger progressive fail2ban lockout, mandate multi-factor authentication",
    },
    {
      id: "T1071.004",
      technique: "Application Layer Protocol: DNS",
      tactic: "Command and Control",
      confidence: 84.7,
      evidence: "Periodic beaconing pulses at 30s jittered intervals to external IP 91.240.118.22, irregular DNS query entropy",
      observedEvents: 184,
      status: "MONITORED",
      detectionVector: "C2 heartbeat periodicity and TXT record payload length skew",
      mitigation: "Sinkhole malicious domain, terminate active session sockets",
    },
    {
      id: "T1190",
      technique: "Exploit Public-Facing Application",
      tactic: "Initial Access",
      confidence: 79.1,
      evidence: "Repetitive URI parameter injection patterns and SQL syntax fragments in HTTP GET queries against web-prod-01",
      observedEvents: 96,
      status: "MONITORED",
      detectionVector: "HTTP 500 error frequency and payload length variance",
      mitigation: "Deploy WAF CRS rule enforcement, patch vulnerable application endpoint",
    },
    {
      id: "T1059",
      technique: "Command and Scripting Interpreter",
      tactic: "Execution",
      confidence: 73.0,
      evidence: "Outbound HTTP connection attempting curl pipe to sh syntax targeting perimeter gateway",
      observedEvents: 24,
      status: "MONITORED",
      detectionVector: "Infiltration classifier anomaly scoring on egress socket",
      mitigation: "Restrict egress socket permissions on production application servers",
    },
  ];

  const tactics = ["ALL", "Impact", "Discovery", "Credential Access", "Command and Control", "Initial Access", "Execution"];

  const filtered = techniques.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.technique.toLowerCase().includes(search.toLowerCase()) ||
      t.evidence.toLowerCase().includes(search.toLowerCase());
    const matchesTactic = selectedTactic === "ALL" || t.tactic === selectedTactic;
    return matchesSearch && matchesTactic;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">MITRE ATT&CK Matrix Alignment</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time correlation of detected behavioral feature anomalies to standardized adversary tactics and techniques.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-mono text-[#64748B] px-3 py-1 bg-white border border-[#F3E8E8] rounded-full shadow-xs">
            ATT&CK v14.1 Enterprise Matrix
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#F3E8E8] rounded-2xl p-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter techniques, IDs, or evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#BE185D]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-[#64748B] font-semibold uppercase mr-1">Tactic:</span>
          {tactics.map((tac) => (
            <button
              key={tac}
              onClick={() => setSelectedTactic(tac)}
              className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedTactic === tac
                  ? "bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] border border-transparent"
              }`}
            >
              {tac}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#F3E8E8] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Technique ID</th>
                <th className="py-3 px-4">Technique Name</th>
                <th className="py-3 px-4">Tactic</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Observed Events</th>
                <th className="py-3 px-4">Correlated Evidence</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#BE185D]">
                    {item.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0F172A]">
                    {item.technique}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#FAF8F5] text-[#64748B] border border-[#F3E8E8]">
                      {item.tactic}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className={item.confidence >= 90 ? "text-[#E11D48] font-bold" : item.confidence >= 80 ? "text-[#D97706] font-bold" : "text-[#059669] font-bold"}>
                      {item.confidence.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#64748B]">
                    {item.observedEvents.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[#475569] max-w-xs text-[11px] leading-relaxed">
                    {item.evidence}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      item.status === "ACTIVE"
                        ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
                        : item.status === "EVALUATED"
                        ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                        : "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tactical Mitigation Guidance Section */}
      <div className="bg-white border border-[#F3E8E8] rounded-2xl p-5 shadow-xs">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
          Recommended Adversary Mitigations (Enterprise Framework)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-4 rounded-xl">
            <div className="text-[#0F172A] font-bold flex items-center justify-between">
              <span>M1037: Filter Network Traffic (T1498)</span>
              <span className="text-[10px] font-mono text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full font-semibold">RECOMMENDED</span>
            </div>
            <p className="text-[11px] text-[#475569] mt-1.5 leading-relaxed">
              Enforce upstream BGP Flowspec rate-limiting on port 80/443 and drop non-SYN packets outside established state tables during volumetric surges.
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#F3E8E8] p-4 rounded-xl">
            <div className="text-[#0F172A] font-bold flex items-center justify-between">
              <span>M1031: Network Intrusion Prevention (T1046)</span>
              <span className="text-[10px] font-mono text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full font-semibold">RECOMMENDED</span>
            </div>
            <p className="text-[11px] text-[#475569] mt-1.5 leading-relaxed">
              Automate dynamic null-routing for persistent horizontal scanner prefixes observed probing more than 5 distinct closed internal ports in a 60s sliding window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
