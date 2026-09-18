import React, { useEffect, useState } from "react";
import { NetworkTopology } from "../components/NetworkTopology";
import { fetchNetworkTopology } from "../services/api";
import { TopologyNode, TopologyEdge } from "../types";
import { Activity, RefreshCw } from "lucide-react";

interface NetworkExplorerProps {
  navigateWithPivot?: (page: string, params?: any) => void;
}

export const NetworkExplorer: React.FC<NetworkExplorerProps> = ({ navigateWithPivot }) => {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [edges, setEdges] = useState<TopologyEdge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopology();
    const interval = setInterval(loadTopology, 3500);
    return () => clearInterval(interval);
  }, []);

  const loadTopology = async () => {
    try {
      const res = await fetchNetworkTopology();
      setNodes(res.nodes);
      setEdges(res.edges);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load topology:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-xs font-mono text-[#64748B]">
        <Activity className="w-4 h-4 animate-spin text-[#BE185D] mr-2" />
        DISCOVERING NETWORK TOPOLOGY & FLOW TRAJECTORIES...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3E8E8] pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">Network Explorer</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Interconnected asset topology, routing boundaries, and live flow saturation mapping
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#64748B]">
          <span className="px-3 py-1 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg">
            NODES: <strong className="text-[#0F172A]">{nodes.length}</strong>
          </span>
          <span className="px-3 py-1 bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg">
            EDGES: <strong className="text-[#0F172A]">{edges.length}</strong>
          </span>
          <button
            onClick={loadTopology}
            className="p-1.5 bg-[#FAF8F5] hover:bg-[#FDF2F8] hover:text-[#BE185D] border border-[#E2E8F0] rounded-lg text-[#64748B] transition-colors"
            title="Refresh Topology"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topology Canvas & Inspector Drawer */}
      <NetworkTopology
        nodes={nodes}
        edges={edges}
        onPivotToInvestigation={(ip) => {
          if (navigateWithPivot) {
            navigateWithPivot("investigation", { targetIp: ip });
          }
        }}
      />
    </div>
  );
};
