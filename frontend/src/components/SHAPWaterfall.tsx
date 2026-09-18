import React from "react";
import { SHAPWaterfallItem } from "../types";
import { BrainCircuit } from "lucide-react";

interface SHAPWaterfallProps {
  prediction: string;
  confidence: number;
  baseValue: number;
  predictedRisk: number;
  waterfall: SHAPWaterfallItem[];
  plainExplanation: string;
}

export const SHAPWaterfall: React.FC<SHAPWaterfallProps> = ({
  prediction,
  confidence,
  baseValue,
  predictedRisk,
  waterfall,
  plainExplanation,
}) => {
  return (
    <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 space-y-5 shadow-xs">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F3E8E8] pb-4">
        <div>
          <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
            Model Inference & Prediction Confidence
          </div>
          <div className="text-lg font-bold text-[#0F172A] flex items-center gap-2.5 mt-0.5">
            <span>Forecasted Class: <span className="text-[#E11D48]">{prediction}</span></span>
            <span className="text-xs px-2 py-0.5 bg-[#FDF2F8] text-[#BE185D] border border-[#FCE7F3] rounded font-mono font-bold">
              {(confidence * 100).toFixed(1)}% Confidence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <div className="text-[#64748B] text-[10px] uppercase">Base Benign Prior</div>
            <div className="text-sm font-bold text-[#059669] mt-0.5">{(baseValue * 100).toFixed(1)}%</div>
          </div>
          <div className="w-px h-8 bg-[#F3E8E8]" />
          <div>
            <div className="text-[#64748B] text-[10px] uppercase">Predicted Threat Risk</div>
            <div className="text-sm font-bold text-[#E11D48] mt-0.5">{(predictedRisk * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Natural Language Plain Explanation Callout */}
      <div className="p-3.5 bg-[#FDF2F8]/60 border border-[#FCE7F3] rounded-lg text-xs leading-relaxed text-[#0F172A] flex items-start gap-3">
        <BrainCircuit className="w-4 h-4 text-[#BE185D] shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-[#BE185D] mb-0.5 font-mono text-[11px] uppercase">
            Forensic Reasoning & Feature Attribution:
          </div>
          <p className="text-[#475569]">{plainExplanation}</p>
        </div>
      </div>

      {/* SHAP Waterfall Attribution List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono flex items-center justify-between">
          <span>Local Shapley Value (SHAP) Attribution Decomposition</span>
          <span className="text-[10px] text-[#64748B] font-normal">TREE-SHAP EXPLAINER v0.44</span>
        </div>

        <div className="space-y-2">
          {waterfall.map((item, idx) => {
            const isPositive = item.shap_value >= 0;
            const barPct = Math.min(Math.abs(item.shap_value) * 220, 100);

            return (
              <div
                key={idx}
                className="p-2.5 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="w-64 truncate">
                  <span className="font-semibold text-[#0F172A]">{item.feature_name || item.feature}</span>
                  <span className="text-[#64748B] text-[11px] ml-2">val: {item.actual_value || item.evidence || "-"}</span>
                </div>

                <div className="flex items-center gap-3 flex-1 max-w-sm">
                  <div className="w-full h-1.5 bg-[#E2E8F0] rounded-sm overflow-hidden flex">
                    <div
                      className={`h-full rounded-sm ${
                        isPositive ? "bg-[#E11D48]" : "bg-[#059669]"
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold shrink-0 w-16 text-right ${
                      isPositive ? "text-[#E11D48]" : "text-[#059669]"
                    }`}
                  >
                    {isPositive ? "+" : ""}{(item.shap_value * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
