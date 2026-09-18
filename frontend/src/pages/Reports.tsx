import React, { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  Activity,
  Eye,
  Plus,
  Shield,
  BrainCircuit,
  Binary
} from "lucide-react";
import { fetchReports, generateReport } from "../services/api";

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("Incident Report");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewTitle, setPreviewTitle] = useState("SPECTRUM Incident Intelligence Brief (INC-2026-0917-0042)");

  const reportTypes = [
    { id: "Incident Report", name: "Incident Report", desc: "Correlated timeline, affected assets, MITRE mapping, and tactical response actions.", icon: FileText },
    { id: "Threat Intelligence Report", name: "Threat Intelligence Report", desc: "Active adversary profiles, IP reputation scores, and global IoC tracking.", icon: Shield },
    { id: "Network Security Report", name: "Network Security Report", desc: "Comprehensive throughput, protocol ratios, and perimeter firewall audit.", icon: Binary },
    { id: "ML Performance Report", name: "ML Performance Report", desc: "Statistical validation, confusion matrix, precision/recall, and SHAP fidelity.", icon: BrainCircuit },
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await fetchReports();
      setReports(res);
      setLoading(false);
    } catch (err) {
      console.error("Reports load error:", err);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const title = `SPECTRUM ${selectedType} - ${new Date().toISOString().slice(0, 10)}`;
      await generateReport(title, "INC-2026-0917-0042");
      await loadReports();
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Security Reports & Export</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit-grade forensic intelligence compilation with preview and automated PDF export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-[#BE185D] hover:bg-[#9D174D] disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            {generating ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Compile & Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Types Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((rt) => {
          const isSel = selectedType === rt.id;
          const Icon = rt.icon;
          return (
            <div
              key={rt.id}
              onClick={() => {
                setSelectedType(rt.id);
                setPreviewTitle(`SPECTRUM ${rt.name} Brief`);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
                isSel
                  ? "bg-[#FDF2F8] border-[#BE185D] ring-1 ring-[#BE185D]"
                  : "bg-white border-[#F3E8E8] hover:border-[#FCE7F3]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Icon className={`w-4 h-4 ${isSel ? "text-[#BE185D]" : "text-[#64748B]"}`} />
                  {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#BE185D]" />}
                </div>
                <h3 className="text-xs font-bold text-[#0F172A]">{rt.name}</h3>
                <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">{rt.desc}</p>
              </div>
              <div className="mt-3 text-[10px] font-mono text-[#94A3B8]">
                Format: PDF / A4
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Live Preview Box */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#BE185D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Document Preview: {selectedType}
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#F3E8E8]">
            Classification: TLP:AMBER / SOC CONFIDENTIAL
          </span>
        </div>

        {/* Mock Report Document Preview */}
        <div className="bg-[#FAF8F5] border border-[#E2E8F0] rounded-xl p-6 max-w-3xl mx-auto space-y-4 text-xs font-sans shadow-sm">
          {/* Header Banner */}
          <div className="border-b border-[#E2E8F0] pb-3 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-mono font-bold text-[#BE185D] uppercase tracking-wider">SPECTRUM AI NETWORK SECURITY PLATFORM</div>
              <div className="text-base font-bold text-[#0F172A] mt-0.5">{previewTitle}</div>
              <div className="text-[11px] text-[#64748B]">Prepared by: analyst@spectrum.internal | Platform Engine: RF-TEMPORAL-v2.4</div>
            </div>
            <div className="text-right text-[10px] font-mono text-[#64748B]">
              <div>Report ID: REP-2026-0917-001</div>
              <div>Generated: 2026-09-17 15:15 UTC</div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-1">
            <h4 className="font-bold text-[#0F172A] uppercase text-[11px] font-mono">1. Executive Summary</h4>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Continuous sliding-window behavioral feature extraction flagged imminent volumetric saturation targeting internal enterprise web infrastructure. Advance early warning horizon was established 45 seconds prior to service impact.
            </p>
          </div>

          {/* Section 2: Key Threat Metrics Table */}
          <div className="space-y-1">
            <h4 className="font-bold text-[#0F172A] uppercase text-[11px] font-mono">2. Key Threat & Forecast Metrics</h4>
            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-[#64748B]">
                    <th className="p-2.5">Metric</th>
                    <th className="p-2.5">Observed Value</th>
                    <th className="p-2.5">Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="p-2.5 text-[#64748B]">Current Threat State</td>
                    <td className="p-2.5 text-[#E11D48] font-bold">Critical</td>
                    <td className="p-2.5 text-[#64748B]">Breached alert threshold</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-[#64748B]">Overall Attack Risk</td>
                    <td className="p-2.5 text-[#0F172A] font-bold">92.4% / 100</td>
                    <td className="p-2.5 text-[#64748B]">Extreme saturation probability</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-[#64748B]">Early-Warning Horizon</td>
                    <td className="p-2.5 text-[#059669] font-bold">45 Seconds</td>
                    <td className="p-2.5 text-[#64748B]">Advance warning buffer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Mitigation Playbook */}
          <div className="space-y-1">
            <h4 className="font-bold text-[#0F172A] uppercase text-[11px] font-mono">3. Recommended Tactical Actions</h4>
            <div className="text-[11px] text-[#64748B] space-y-0.5 font-mono">
              <div>• Activate border rate-limiting rules on external ingress router.</div>
              <div>• Quarantine offensive source IP prefixes (198.51.100.0/24) at border firewall ACL.</div>
              <div>• Verify SYN-cookie protection on web-prod-01 (10.0.1.15).</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stored Reports Table */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="p-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
            Compiled Report Archive
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F3E8E8] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider bg-[#FAF8F5]/50">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Compiled At</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8] font-mono">
              {reports.map((rep) => (
                <tr key={rep.report_id} className="hover:bg-[#FDF2F8]/60 transition-colors">
                  <td className="py-2.5 px-3 text-[#BE185D] font-bold">{rep.report_id}</td>
                  <td className="py-2.5 px-3 text-[#0F172A] font-sans font-medium">{rep.title}</td>
                  <td className="py-2.5 px-3 text-[#64748B] uppercase text-[10px]">{rep.report_type}</td>
                  <td className="py-2.5 px-3 text-[#64748B] text-[11px]">{rep.created_at}</td>
                  <td className="py-2.5 px-3 text-[#64748B] text-[11px]">{rep.generated_by}</td>
                  <td className="py-2.5 px-3 text-right">
                    <a
                      href={`/api/v1/reports/${rep.report_id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] text-[#0F172A] text-[11px] font-medium rounded-lg inline-flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
