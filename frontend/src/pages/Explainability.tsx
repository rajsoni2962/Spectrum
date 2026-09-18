import React, { useEffect, useState } from "react";
import { SHAPWaterfall } from "../components/SHAPWaterfall";
import { fetchExplainability } from "../services/api";
import { ExplainabilityData } from "../types";
import { BrainCircuit, Activity, BarChart2, Info } from "lucide-react";

export const Explainability: React.FC = () => {
  const [data, setData] = useState<ExplainabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExplainability();
    const interval = setInterval(loadExplainability, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadExplainability = async () => {
    try {
      const res = await fetchExplainability();
      setData(res);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load explainability:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96 text-xs font-mono text-[#64748B]">
        <Activity className="w-4 h-4 animate-spin text-[#BE185D] mr-2" />
        CALCULATING LOCAL SHAPLEY FEATURE ATTRIBUTIONS...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Model Explainability (XAI)</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Transparent Shapley additive explanations (SHAP) attributing model inference to temporal behavioral features
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#64748B] px-3 py-1 bg-white border border-[#F3E8E8] rounded-full shadow-xs">
          SHAP v0.44 TREE-EXPLAINER
        </div>
      </div>

      {/* SHAP Waterfall Attribution Component */}
      <SHAPWaterfall
        prediction={data.prediction}
        confidence={data.confidence}
        baseValue={data.base_value}
        predictedRisk={data.predicted_risk_value}
        waterfall={data.waterfall}
        plainExplanation={data.plain_language_explanation}
      />
    </div>
  );
};
