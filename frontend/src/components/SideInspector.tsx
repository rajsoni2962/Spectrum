import React from "react";
import { X, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";

export interface InspectorData {
  type: "flow" | "asset" | "alert" | "forecast" | "ioc";
  title: string;
  subtitle?: string;
  timestamp?: string;
  severity?: "CRITICAL" | "HIGH" | "WARNING" | "NORMAL" | "BENIGN";
  attributes: Record<string, string | number | boolean>;
  tags?: string[];
  metrics?: { label: string; value: string | number; change?: string }[];
  playbookActions?: { label: string; action: () => void; destructive?: boolean }[];
}

interface SideInspectorProps {
  data: InspectorData | null;
  isOpen: boolean;
  onClose: () => void;
  onPivot?: (page: string, params?: any) => void;
}

export const SideInspector: React.FC<SideInspectorProps> = ({
  data,
  isOpen,
  onClose,
  onPivot,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityStyle = (sev?: string) => {
    switch (sev) {
      case "CRITICAL":
      case "HIGH":
        return "bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3]";
      case "WARNING":
        return "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]";
      case "NORMAL":
      case "BENIGN":
        return "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]";
      default:
        return "bg-white text-[#64748B] border-[#E2E8F0]";
    }
  };

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-[400px] bg-white border-l border-[#F3E8E8] shadow-2xl z-40 flex flex-col animate-in slide-in-from-right-4 duration-150 select-text">
      {/* Header */}
      <div className="p-4 border-b border-[#F3E8E8] flex items-center justify-between bg-[#FAF8F5]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#E2E8F0] text-[#64748B] font-semibold">
            {data.type.toUpperCase()} INSPECTOR
          </span>
          {data.severity && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityStyle(
                data.severity
              )}`}
            >
              {data.severity}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyJson}
            title="Copy RAW JSON"
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-white rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title & Subtitle */}
        <div>
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight">{data.title}</h2>
          {data.subtitle && <p className="text-xs text-[#64748B] font-mono mt-0.5">{data.subtitle}</p>}
          {data.timestamp && (
            <p className="text-[11px] text-[#94A3B8] font-mono mt-1">Observed at: {data.timestamp}</p>
          )}
        </div>

        {/* Metrics Strip */}
        {data.metrics && data.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {data.metrics.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#F3E8E8]">
                <div className="text-[10px] uppercase font-mono text-[#94A3B8]">{m.label}</div>
                <div className="text-sm font-bold font-mono text-[#0F172A] mt-0.5">{m.value}</div>
                {m.change && <div className="text-[10px] text-[#64748B] font-mono mt-0.5">{m.change}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-mono text-[#94A3B8] mb-1.5 font-semibold">
              Classification Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF8F5] text-[#475569] border border-[#E2E8F0]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key-Value Attribute Table */}
        <div>
          <div className="text-[10px] uppercase font-mono text-[#94A3B8] mb-2 font-semibold">
            Telemetry Attributes
          </div>
          <div className="rounded-lg border border-[#F3E8E8] bg-[#FAF8F5] divide-y divide-[#F3E8E8] text-xs font-mono overflow-hidden">
            {Object.entries(data.attributes).map(([key, value], idx) => (
              <div key={idx} className="flex items-center justify-between p-2">
                <span className="text-[#64748B] text-[11px]">{key}</span>
                <span className="text-[#0F172A] font-semibold text-[11px] truncate max-w-[200px]">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pivot Action Link */}
        {onPivot && (data.attributes.source || data.attributes.ip || data.attributes.destination) && (
          <div className="pt-2">
            <button
              onClick={() => {
                const target =
                  String(data.attributes.ip || data.attributes.source || data.attributes.destination);
                onPivot("investigation", { targetIp: target });
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#FCE7F3] rounded-lg text-xs font-medium text-[#BE185D] transition-colors cursor-pointer shadow-xs"
            >
              <span>Pivot into Deep Investigation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Playbook Containment Actions */}
        {data.playbookActions && data.playbookActions.length > 0 && (
          <div className="pt-2 border-t border-[#F3E8E8]">
            <div className="text-[10px] uppercase font-mono text-[#94A3B8] mb-2 font-semibold">
              Tactical Playbook Containment
            </div>
            <div className="space-y-1.5">
              {data.playbookActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    action.destructive
                      ? "bg-[#FFE4E6] hover:bg-[#FECDD3] text-[#E11D48] border-[#FECDD3]"
                      : "bg-[#FAF8F5] hover:bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]"
                  }`}
                >
                  <span>{action.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
