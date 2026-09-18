import React, { useState } from "react";
import { TopologyNode, TopologyEdge } from "../types";
import {
  Server,
  Shield,
  Network,
  Laptop,
  Database,
  Globe,
  X,
  Activity,
  ArrowRight,
  Clock,
  Radio,
  ExternalLink
} from "lucide-react";

interface NetworkTopologyProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  onSelectNode?: (node: TopologyNode) => void;
  onPivotToInvestigation?: (ip: string) => void;
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  nodes,
  edges,
  onSelectNode,
  onPivotToInvestigation
}) => {
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(nodes[2] || nodes[0] || null);

  // Professional enterprise layout positions
  const nodePositions: Record<string, { x: number; y: number; category: string }> = {
    "gw-1": { x: 380, y: 70, category: "Gateway" },
    "sw-core": { x: 380, y: 170, category: "Switch" },
    "srv-web": { x: 180, y: 280, category: "Server" },
    "srv-db": { x: 330, y: 310, category: "Server" },
    "srv-dc": { x: 480, y: 280, category: "Server" },
    "ws-1": { x: 620, y: 200, category: "Endpoint" },
    "ws-2": { x: 620, y: 300, category: "Endpoint" },
    "ext-att-1": { x: 140, y: 60, category: "External IP" },
    "ext-c2": { x: 620, y: 60, category: "External IP" },
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "firewall":
      case "gateway":
        return Shield;
      case "workstation":
      case "endpoint":
        return Laptop;
      case "external_threat":
      case "external":
        return Globe;
      case "switch":
        return Network;
      case "database":
        return Database;
      default:
        return Server;
    }
  };

  const handleNodeClick = (node: TopologyNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="relative w-full h-[540px] bg-[#FAF8F5] border border-[#F3E8E8] rounded-xl overflow-hidden flex shadow-xs">
      {/* SVG Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#CBD5E1 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Legend */}
        <div className="absolute top-3 left-3 bg-white border border-[#F3E8E8] rounded-lg px-3 py-2 text-[11px] font-mono flex items-center gap-4 z-10 shadow-xs">
          <span className="flex items-center gap-1.5 text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#BE185D]" /> Normal Flow
          </span>
          <span className="flex items-center gap-1.5 text-[#E11D48]">
            <span className="w-2 h-2 rounded-full bg-[#E11D48]" /> Volumetric / Attacking
          </span>
          <span className="flex items-center gap-1.5 text-[#94A3B8]">
            <span className="w-2 h-0.5 bg-[#CBD5E1]" /> Edge Frequency
          </span>
        </div>

        <svg className="w-full h-full">
          {/* Render Edges */}
          {edges.map((edge, idx) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const isThreat = edge.status === "saturated" || edge.status === "blocked" || edge.status === "flagged";
            const strokeColor = isThreat ? "#E11D48" : "#CBD5E1";
            const strokeWidth = isThreat ? 2 : 1;

            return (
              <g key={idx}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isThreat ? "4 3" : undefined}
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isSelected = selectedNode?.id === node.id;
            const Icon = getNodeIcon(node.type);
            const isHighRisk = (node.risk_score ?? node.risk ?? 0) > 50;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer"
              >
                {/* Node Box */}
                <rect
                  x={-24}
                  y={-24}
                  width={48}
                  height={48}
                  rx={8}
                  fill="#FFFFFF"
                  stroke={
                    isSelected
                      ? "#BE185D"
                      : isHighRisk
                      ? "#E11D48"
                      : "#E2E8F0"
                  }
                  strokeWidth={isSelected ? "2.5" : "1"}
                  className="shadow-xs"
                />

                {/* Node Icon */}
                <foreignObject x={-10} y={-10} width={20} height={20}>
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      className={`w-4 h-4 ${
                        isHighRisk ? "text-[#E11D48]" : isSelected ? "text-[#BE185D]" : "text-[#64748B]"
                      }`}
                    />
                  </div>
                </foreignObject>

                {/* Node IP / Label */}
                <text
                  y={34}
                  textAnchor="middle"
                  fill="#0F172A"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                >
                  {node.ip}
                </text>
                <text
                  y={46}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                >
                  {node.name || node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right-Side Asset Detail Drawer */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-[#F3E8E8] flex flex-col justify-between p-4 z-20 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3E8E8] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                  Asset Details
                </span>
                <h3 className="text-sm font-bold text-[#0F172A] font-mono mt-0.5">
                  {selectedNode.ip}
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  (selectedNode.risk_score ?? selectedNode.risk ?? 0) > 70
                    ? "bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]"
                    : (selectedNode.risk_score ?? selectedNode.risk ?? 0) > 30
                    ? "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]"
                    : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                }`}
              >
                Risk: {selectedNode.risk_score ?? selectedNode.risk ?? 0}%
              </span>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[#64748B] text-[11px]">Hostname</span>
                <div className="text-[#0F172A] font-mono font-medium">{selectedNode.name || selectedNode.label}</div>
              </div>

              <div>
                <span className="text-[#64748B] text-[11px]">Asset Type</span>
                <div className="text-[#0F172A] capitalize">{selectedNode.type.replace("_", " ")}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#64748B] text-[11px]">First Seen</span>
                  <div className="text-[#64748B] font-mono text-[11px]">2026-09-17 08:00</div>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px]">Last Seen</span>
                  <div className="text-[#64748B] font-mono text-[11px]">Just now</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#64748B] text-[11px]">Active Connections</span>
                  <div className="text-[#0F172A] font-mono font-semibold">
                    {selectedNode.active_connections || 12}
                  </div>
                </div>
                <div>
                  <span className="text-[#64748B] text-[11px]">Open Ports</span>
                  <div className="text-[#BE185D] font-mono text-[11px]">
                    80, 443, 22
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[#64748B] text-[11px]">Status</span>
                <div className="text-[#059669] font-mono text-xs font-semibold mt-0.5">
                  ● {selectedNode.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Recent Events List */}
            <div className="border-t border-[#F3E8E8] pt-3">
              <span className="text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">
                Recent Security Events
              </span>
              <div className="space-y-1.5 mt-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#F3E8E8] text-[#475569]">
                  <div className="text-[#0F172A]">15:11:42 - Flow Ingress</div>
                  <div className="text-[10px] text-[#64748B]">45,000 pps high velocity</div>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#F3E8E8] text-[#475569]">
                  <div className="text-[#0F172A]">15:09:12 - SYN Disproportion</div>
                  <div className="text-[10px] text-[#64748B]">92% unacknowledged</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3E8E8] flex items-center justify-between text-xs">
            <button
              onClick={() => {
                if (selectedNode && onPivotToInvestigation) {
                  onPivotToInvestigation(selectedNode.ip);
                }
              }}
              className="w-full py-1.5 bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#FCE7F3] rounded-lg text-[#BE185D] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Pivot to Investigation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
