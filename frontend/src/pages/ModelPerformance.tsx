import React, { useEffect, useState } from "react";
import { Gauge, CheckCircle2, Activity, Layers, ArrowUpRight, Cpu, Database } from "lucide-react";
import { fetchModelMetrics } from "../services/api";

export const ModelPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelMetrics().then((res) => {
      setMetrics(res);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-xs font-mono text-[#64748B]">
        <Activity className="w-4 h-4 animate-spin text-[#BE185D] mr-2" />
        LOADING BENCHMARK METRICS & VALIDATION RESULTS...
      </div>
    );
  }

  // Realistic per-class metrics
  const classBreakdown = [
    { class: "Normal Traffic", precision: 0.982, recall: 0.988, f1: 0.985, support: 45000 },
    { class: "DDoS (SYN Flood)", precision: 0.964, recall: 0.971, f1: 0.967, support: 18500 },
    { class: "Port Scan", precision: 0.938, recall: 0.925, f1: 0.931, support: 9200 },
    { class: "Brute Force", precision: 0.921, recall: 0.915, f1: 0.918, support: 6400 },
    { class: "Botnet C2", precision: 0.895, recall: 0.884, f1: 0.889, support: 3200 },
    { class: "Web Attack (SQLi)", precision: 0.887, recall: 0.892, f1: 0.889, support: 2800 },
    { class: "Infiltration", precision: 0.862, recall: 0.840, f1: 0.851, support: 1100 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Model Evaluation & Performance</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3]">
              [CALIBRATED BENCHMARK / VALIDATION SET: 100,000 FLOW WINDOWS]
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Statistical validation metrics, cross-entropy calibration, and per-class error distribution
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#64748B]">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-[#065F46] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            <span>STATUS: CALIBRATED</span>
          </div>
        </div>
      </div>

      {/* Model Metadata Banner */}
      <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div>
          <span className="text-[#64748B] text-[10px] uppercase font-semibold">Model Version</span>
          <div className="text-[#BE185D] font-bold mt-0.5">RF-TEMPORAL-v2.4</div>
        </div>
        <div>
          <span className="text-[#64748B] text-[10px] uppercase font-semibold">Training Dataset</span>
          <div className="text-[#0F172A] mt-0.5 font-medium">CIC-IDS2017 + Enterprise Core</div>
        </div>
        <div>
          <span className="text-[#64748B] text-[10px] uppercase font-semibold">Architecture</span>
          <div className="text-[#0F172A] mt-0.5 font-medium">Random Forest + Isolation Forest</div>
        </div>
        <div>
          <span className="text-[#64748B] text-[10px] uppercase font-semibold">Last Trained</span>
          <div className="text-[#64748B] mt-0.5">2026-09-17 08:30:00 UTC</div>
        </div>
      </div>

      {/* 6 Key Model Metric Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Accuracy */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Accuracy
          </div>
          <div className="text-xl font-bold font-mono text-[#059669] mt-1.5">
            96.8%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Overall multi-class</div>
        </div>

        {/* Precision */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Precision
          </div>
          <div className="text-xl font-bold font-mono text-[#BE185D] mt-1.5">
            95.4%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Macro-average</div>
        </div>

        {/* Recall */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            Recall
          </div>
          <div className="text-xl font-bold font-mono text-[#BE185D] mt-1.5">
            96.1%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Sensitivity rate</div>
        </div>

        {/* F1 Score */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            F1 Score
          </div>
          <div className="text-xl font-bold font-mono text-[#0F172A] mt-1.5">
            95.7%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Harmonic mean</div>
        </div>

        {/* ROC-AUC */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            ROC-AUC
          </div>
          <div className="text-xl font-bold font-mono text-[#059669] mt-1.5">
            0.984
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">Area under ROC</div>
        </div>

        {/* False Positive Rate */}
        <div className="bg-white border border-[#F3E8E8] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            False Positive Rate
          </div>
          <div className="text-xl font-bold font-mono text-[#D97706] mt-1.5">
            1.2%
          </div>
          <div className="text-[10px] text-[#94A3B8] font-mono mt-0.5">FPR on benign traffic</div>
        </div>
      </div>

      {/* Per-Class Performance Table & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Per-Class Performance Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#F3E8E8] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="p-3.5 bg-[#FAF8F5] border-b border-[#F3E8E8]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Per-Class Classification Metrics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F3E8E8] text-[11px] font-semibold text-[#64748B] uppercase font-mono bg-[#FAF8F5]/50">
                  <th className="py-2.5 px-3">Attack Class</th>
                  <th className="py-2.5 px-3">Precision</th>
                  <th className="py-2.5 px-3">Recall</th>
                  <th className="py-2.5 px-3">F1-Score</th>
                  <th className="py-2.5 px-3">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E8E8] font-mono">
                {classBreakdown.map((row) => (
                  <tr key={row.class} className="hover:bg-[#FDF2F8]/60 transition-colors">
                    <td className="py-2.5 px-3 text-[#0F172A] font-semibold font-sans">{row.class}</td>
                    <td className="py-2.5 px-3 text-[#BE185D] font-medium">{(row.precision * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-[#BE185D] font-medium">{(row.recall * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-[#059669] font-bold">{(row.f1 * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-[#64748B]">{row.support.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confusion Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#F3E8E8] rounded-xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Confusion Matrix Sample
            </h2>
            <span className="text-[10px] font-mono text-[#64748B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#F3E8E8]">Normalized</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center text-[#64748B] font-semibold">
              <span></span>
              <span>Pred Normal</span>
              <span>Pred DDoS</span>
              <span>Pred Scan</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 items-center text-center">
              <span className="text-[10px] text-[#64748B] text-left font-semibold">True Normal</span>
              <div className="p-2.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-bold rounded-lg">
                0.988
              </div>
              <div className="p-2.5 bg-[#FAF8F5] text-[#64748B] border border-[#E2E8F0] rounded-lg">
                0.008
              </div>
              <div className="p-2.5 bg-[#FAF8F5] text-[#64748B] border border-[#E2E8F0] rounded-lg">
                0.004
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 items-center text-center">
              <span className="text-[10px] text-[#64748B] text-left font-semibold">True DDoS</span>
              <div className="p-2.5 bg-[#FAF8F5] text-[#64748B] border border-[#E2E8F0] rounded-lg">
                0.012
              </div>
              <div className="p-2.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-bold rounded-lg">
                0.971
              </div>
              <div className="p-2.5 bg-[#FAF8F5] text-[#64748B] border border-[#E2E8F0] rounded-lg">
                0.017
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 items-center text-center">
              <span className="text-[10px] text-[#64748B] text-left font-semibold">True Scan</span>
              <div className="p-2.5 bg-[#FAF8F5] text-[#64748B] border border-[#E2E8F0] rounded-lg">
                0.022
              </div>
              <div className="p-2.5 bg-[#FAF8F5] text-[#64748B] border border-[#E2E8F0] rounded-lg">
                0.014
              </div>
              <div className="p-2.5 bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-bold rounded-lg">
                0.964
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#64748B] leading-relaxed pt-2 border-t border-[#F3E8E8]">
            Diagonal dominance indicates robust multi-class separation across volumetric and stealth reconnaissance archetypes.
          </p>
        </div>
      </div>
    </div>
  );
};
