import React, { useEffect, useRef, useState } from "react";

interface NodePoint {
  id: string;
  name: string;
  ip: string;
  xRatio: number;
  yRatio: number;
  role: string;
  risk: "NORMAL" | "ELEVATED" | "CRITICAL";
  entropy: number;
  rate: string;
}

const NETWORK_NODES: NodePoint[] = [
  { id: "edge", name: "Border Gateway", ip: "198.51.100.1", xRatio: 0.12, yRatio: 0.46, role: "BGP Edge", risk: "NORMAL", entropy: 0.74, rate: "12.4 Gbps" },
  { id: "fw", name: "Core NextGen FW", ip: "10.0.0.1", xRatio: 0.28, yRatio: 0.38, role: "Security Gateway", risk: "NORMAL", entropy: 0.81, rate: "8.2 Gbps" },
  { id: "web1", name: "web-prod-01", ip: "10.0.1.15", xRatio: 0.48, yRatio: 0.30, role: "Ingress Cluster", risk: "CRITICAL", entropy: 0.94, rate: "4.8 Gbps" },
  { id: "web2", name: "web-prod-02", ip: "10.0.1.16", xRatio: 0.48, yRatio: 0.62, role: "Ingress Cluster", risk: "NORMAL", entropy: 0.68, rate: "2.1 Gbps" },
  { id: "app", name: "api-backend-k8s", ip: "10.0.2.50", xRatio: 0.68, yRatio: 0.42, role: "Application Pod", risk: "NORMAL", entropy: 0.72, rate: "1.9 Gbps" },
  { id: "db", name: "pg-cluster-primary", ip: "10.0.3.10", xRatio: 0.86, yRatio: 0.54, role: "Database Primary", risk: "NORMAL", entropy: 0.62, rate: "950 Mbps" },
  { id: "auth", name: "dc-kerberos-auth", ip: "10.0.1.5", xRatio: 0.78, yRatio: 0.24, role: "Domain Controller", risk: "NORMAL", entropy: 0.70, rate: "340 Mbps" },
];

const CONNECTIONS: [string, string][] = [
  ["edge", "fw"],
  ["fw", "web1"],
  ["fw", "web2"],
  ["web1", "app"],
  ["web2", "app"],
  ["app", "db"],
  ["app", "auth"],
  ["web1", "auth"],
];

export const SpectralHeroCanvas: React.FC<{
  onSelectNode?: (node: NodePoint) => void;
  className?: string;
}> = ({ onSelectNode, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodePoint | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    // Subtle, slow particles moving along topology vectors
    const particles = CONNECTIONS.map((conn, idx) => ({
      from: conn[0],
      to: conn[1],
      progress: (idx * 0.14) % 1,
      speed: 0.001 + (idx % 3) * 0.0005, // Gentle, calm motion
      color: idx % 2 === 0 ? "#7DD3FC" : "#A78BFA",
    }));

    const resize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      t += 0.006;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      // 1. Soft Precision Dark Coordinate Grid
      ctx.strokeStyle = "rgba(40, 48, 60, 0.45)";
      ctx.lineWidth = 0.75;
      const gridSize = 48;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Small subtle intersection crosses
      ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
      for (let x = gridSize; x < width; x += gridSize * 2) {
        for (let y = gridSize; y < height; y += gridSize * 2) {
          ctx.beginPath();
          ctx.moveTo(x - 2.5, y);
          ctx.lineTo(x + 2.5, y);
          ctx.moveTo(x, y - 2.5);
          ctx.lineTo(x, y + 2.5);
          ctx.stroke();
        }
      }

      // 2. Analytical Signal Harmonics (Calm Cyan & Violet Waves)
      const waveLayers = [
        { amp: 22, freq: 0.007, speed: 0.008, color: "rgba(125, 211, 252, 0.35)", yOffset: height * 0.52 },
        { amp: 15, freq: 0.011, speed: -0.006, color: "rgba(167, 139, 250, 0.30)", yOffset: height * 0.48 },
        { amp: 9, freq: 0.018, speed: 0.010, color: "rgba(147, 197, 253, 0.22)", yOffset: height * 0.56 },
      ];

      waveLayers.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 1.25;
        for (let x = 0; x < width; x += 3) {
          const y = w.yOffset + Math.sin(x * w.freq + t * w.speed * 40) * w.amp + Math.cos(x * 0.003 - t * 0.3) * (w.amp * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // 3. Threat Horizon Cone (+15m to +60m)
      const coneStartX = width * 0.52;
      const coneStartY = height * 0.45;
      const coneEndX = width * 0.94;
      const coneUpperY = height * 0.20;
      const coneLowerY = height * 0.70;

      // Dark gradient fill
      const coneGrad = ctx.createLinearGradient(coneStartX, 0, coneEndX, 0);
      coneGrad.addColorStop(0, "rgba(125, 211, 252, 0.04)");
      coneGrad.addColorStop(0.5, "rgba(167, 139, 250, 0.10)");
      coneGrad.addColorStop(1, "rgba(248, 113, 113, 0.08)");

      ctx.beginPath();
      ctx.moveTo(coneStartX, coneStartY);
      ctx.lineTo(coneEndX, coneUpperY);
      ctx.lineTo(coneEndX, coneLowerY);
      ctx.closePath();
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Dashed confidence envelope bounds
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(167, 139, 250, 0.45)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(coneStartX, coneStartY);
      ctx.lineTo(coneEndX, coneUpperY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(coneStartX, coneStartY);
      ctx.lineTo(coneEndX, coneLowerY);
      ctx.stroke();

      // Mean predicted trajectory
      ctx.beginPath();
      ctx.strokeStyle = "rgba(125, 211, 252, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.moveTo(coneStartX, coneStartY);
      const midForecastX = (coneStartX + coneEndX) / 2;
      const midForecastY = (coneStartY + coneUpperY) / 2 + 8;
      ctx.quadraticCurveTo(midForecastX, midForecastY - 10, coneEndX, coneUpperY + (coneLowerY - coneUpperY) * 0.35);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Horizon Time Markers
      const markers = [
        { label: "Now", x: coneStartX, y: coneStartY },
        { label: "+15m", x: coneStartX + (coneEndX - coneStartX) * 0.33, y: coneStartY - 16 },
        { label: "+30m", x: coneStartX + (coneEndX - coneStartX) * 0.66, y: coneStartY - 32 },
        { label: "+60m horizon", x: coneEndX, y: coneUpperY + 28 },
      ];

      ctx.font = "9px 'JetBrains Mono', monospace";
      markers.forEach((m) => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#7DD3FC";
        ctx.fill();
        ctx.fillStyle = "#9AA3AE";
        ctx.fillText(m.label, m.x - 12, m.y - 7);
      });

      // 4. Inter-Node Topology Vectors
      const nodeMap = new Map<string, { x: number; y: number; node: NodePoint }>();
      NETWORK_NODES.forEach((node) => {
        nodeMap.set(node.id, {
          x: node.xRatio * width,
          y: node.yRatio * height,
          node,
        });
      });

      CONNECTIONS.forEach(([fromId, toId]) => {
        const from = nodeMap.get(fromId);
        const to = nodeMap.get(toId);
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = "rgba(45, 55, 72, 0.75)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 5. Subtle Flowing Packet Pulses
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) p.progress = 0;

        const from = nodeMap.get(p.from);
        const to = nodeMap.get(p.to);
        if (!from || !to) return;

        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // 6. Scientific Network Entity Nodes
      nodeMap.forEach(({ x, y, node }) => {
        const isSelected = hoveredNode?.id === node.id;
        const isCritical = node.risk === "CRITICAL";

        // Gentle node halo
        ctx.beginPath();
        const pulse = Math.sin(t * 1.5 + (node.id.charCodeAt(0) % 5)) * 1;
        ctx.arc(x, y, 8 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = isCritical
          ? "rgba(248, 113, 113, 0.25)"
          : isSelected
          ? "rgba(125, 211, 252, 0.35)"
          : "rgba(125, 211, 252, 0.12)";
        ctx.fill();

        // Node center point
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#0B0D10";
        ctx.strokeStyle = isCritical ? "#F87171" : isSelected ? "#93DDFF" : "#7DD3FC";
        ctx.lineWidth = 1.75;
        ctx.fill();
        ctx.stroke();

        // Entity Name (Inter)
        ctx.font = "500 10.5px 'Inter', sans-serif";
        ctx.fillStyle = isCritical ? "#F87171" : isSelected ? "#FFFFFF" : "#E2E8F0";
        ctx.fillText(node.name, x + 10, y + 2);

        // Technical IP Address (Monospace)
        ctx.font = "400 8.5px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#9AA3AE";
        ctx.fillText(node.ip, x + 10, y + 13);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [hoveredNode]);

  // Handle Mouse Interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const hitRadius = 24;
    const found = NETWORK_NODES.find((node) => {
      const nx = node.xRatio * rect.width;
      const ny = node.yRatio * rect.height;
      const dist = Math.hypot(x - nx, y - ny);
      return dist <= hitRadius;
    });

    setHoveredNode(found || null);
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
    setMousePos(null);
  };

  const handleClick = () => {
    if (hoveredNode && onSelectNode) {
      onSelectNode(hoveredNode);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative w-full h-[380px] sm:h-[440px] md:h-[480px] overflow-hidden rounded-2xl bg-[#12151A] border border-[#262C34] shadow-[0_16px_48px_rgba(0,0,0,0.5)] cursor-crosshair group ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Analytical HUD Badges */}
      <div className="absolute top-3.5 left-3.5 pointer-events-none flex flex-wrap items-center gap-2 text-[11px] text-[#9AA3AE] z-10 font-sans">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#12151A]/90 backdrop-blur-sm border border-[#262C34] rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
          Spectral sensor: <span className="text-[#F2F4F7] font-medium font-mono text-[10px]">Active</span>
        </span>
        <span className="px-3 py-1 bg-[#12151A]/90 backdrop-blur-sm border border-[#262C34] rounded-full shadow-sm hidden sm:inline-block">
          Horizon: <span className="text-[#A78BFA] font-medium font-mono text-[10px]">+60m window</span>
        </span>
        <span className="px-3 py-1 bg-[#12151A]/90 backdrop-blur-sm border border-[#262C34] rounded-full shadow-sm hidden md:inline-block">
          Harmonics: <span className="text-[#7DD3FC] font-medium font-mono text-[10px]">3 bands</span>
        </span>
      </div>

      {/* Floating Scientific Telemetry Tooltip when hovering */}
      {hoveredNode && mousePos && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`,
          }}
        >
          <div className="bg-[#181C22] border border-[#262C34] p-3.5 rounded-xl shadow-2xl text-xs w-64 select-none animate-in fade-in duration-100">
            <div className="flex items-center justify-between border-b border-[#262C34] pb-2 mb-2">
              <span className="font-semibold text-[#F2F4F7] truncate font-sans">{hoveredNode.name}</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-medium font-mono ${
                  hoveredNode.risk === "CRITICAL"
                    ? "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30"
                    : "bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30"
                }`}
              >
                {hoveredNode.risk}
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] font-sans">
              <div className="flex justify-between text-[#9AA3AE]">
                <span>IP Address:</span>
                <span className="text-[#F2F4F7] font-mono text-[11px] font-medium">{hoveredNode.ip}</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Role:</span>
                <span className="text-[#7DD3FC] font-medium">{hoveredNode.role}</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Flow Entropy:</span>
                <span className="text-[#F2F4F7] font-mono text-[11px] font-medium">{hoveredNode.entropy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Current Ingress:</span>
                <span className="text-[#7DD3FC] font-mono text-[11px] font-medium">{hoveredNode.rate}</span>
              </div>
            </div>
            <div className="mt-2.5 pt-1.5 border-t border-[#262C34] text-[10px] text-[#596371] text-center font-sans">
              Click node to inspect forensic flow
            </div>
          </div>
        </div>
      )}

      {/* Bottom info strip */}
      <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[11px] text-[#9AA3AE] pointer-events-none font-sans">
        <span>Interactive topology radar · Hover nodes for telemetry details</span>
        <span className="hidden sm:inline font-mono text-[10px] text-[#596371]">v2.4 · AIR-GAPPED</span>
      </div>
    </div>
  );
};
