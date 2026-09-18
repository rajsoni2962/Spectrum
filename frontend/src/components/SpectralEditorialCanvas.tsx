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
  { id: "edge", name: "Border Gateway", ip: "198.51.100.1", xRatio: 0.12, yRatio: 0.46, role: "BGP Ingress", risk: "NORMAL", entropy: 0.74, rate: "12.4 Gbps" },
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

export const SpectralEditorialCanvas: React.FC<{
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

    // Soft particles traveling along edges
    const particles = CONNECTIONS.map((conn, idx) => ({
      from: conn[0],
      to: conn[1],
      progress: (idx * 0.16) % 1,
      speed: 0.0012 + (idx % 3) * 0.0006,
      color: idx % 2 === 0 ? "#BE185D" : "#E11D48",
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
      t += 0.007;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      // 1. Subtle warm grid
      ctx.strokeStyle = "rgba(243, 232, 232, 0.65)";
      ctx.lineWidth = 0.75;
      const gridSize = 52;

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

      // 2. Subtle Signal Wave Harmonics (Soft Rose & Lilac)
      const waveLayers = [
        { amp: 18, freq: 0.006, speed: 0.007, color: "rgba(225, 29, 72, 0.18)", yOffset: height * 0.52 },
        { amp: 12, freq: 0.010, speed: -0.005, color: "rgba(190, 24, 93, 0.14)", yOffset: height * 0.48 },
        { amp: 8, freq: 0.016, speed: 0.009, color: "rgba(244, 114, 182, 0.16)", yOffset: height * 0.55 },
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

      // 3. Threat Horizon Confidence Cone (+15m to +60m)
      const coneStartX = width * 0.50;
      const coneStartY = height * 0.45;
      const coneEndX = width * 0.94;
      const coneUpperY = height * 0.22;
      const coneLowerY = height * 0.68;

      const coneGrad = ctx.createLinearGradient(coneStartX, 0, coneEndX, 0);
      coneGrad.addColorStop(0, "rgba(252, 231, 243, 0.25)");
      coneGrad.addColorStop(0.6, "rgba(251, 113, 133, 0.12)");
      coneGrad.addColorStop(1, "rgba(244, 63, 94, 0.06)");

      ctx.beginPath();
      ctx.moveTo(coneStartX, coneStartY);
      ctx.lineTo(coneEndX, coneUpperY);
      ctx.lineTo(coneEndX, coneLowerY);
      ctx.closePath();
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Dashed bounds
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(190, 24, 93, 0.25)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(coneStartX, coneStartY);
      ctx.lineTo(coneEndX, coneUpperY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(coneStartX, coneStartY);
      ctx.lineTo(coneEndX, coneLowerY);
      ctx.stroke();

      // Trajectory curve
      ctx.beginPath();
      ctx.strokeStyle = "rgba(190, 24, 93, 0.70)";
      ctx.lineWidth = 1.5;
      ctx.moveTo(coneStartX, coneStartY);
      const midForecastX = (coneStartX + coneEndX) / 2;
      const midForecastY = (coneStartY + coneUpperY) / 2 + 8;
      ctx.quadraticCurveTo(midForecastX, midForecastY - 10, coneEndX, coneUpperY + (coneLowerY - coneUpperY) * 0.35);
      ctx.stroke();
      ctx.setLineDash([]);

      // Horizon Time Markers
      const markers = [
        { label: "Now", x: coneStartX, y: coneStartY },
        { label: "+15m", x: coneStartX + (coneEndX - coneStartX) * 0.33, y: coneStartY - 16 },
        { label: "+30m", x: coneStartX + (coneEndX - coneStartX) * 0.66, y: coneStartY - 32 },
        { label: "+60m horizon", x: coneEndX, y: coneUpperY + 28 },
      ];

      ctx.font = "10px 'JetBrains Mono', monospace";
      markers.forEach((m) => {
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#BE185D";
        ctx.fill();
        ctx.fillStyle = "#64748B";
        ctx.fillText(m.label, m.x - 14, m.y - 7);
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
        ctx.strokeStyle = "rgba(244, 114, 182, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // 5. Flowing Rose Pulses
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) p.progress = 0;

        const from = nodeMap.get(p.from);
        const to = nodeMap.get(p.to);
        if (!from || !to) return;

        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // 6. Nodes
      nodeMap.forEach(({ x, y, node }) => {
        const isSelected = hoveredNode?.id === node.id;
        const isCritical = node.risk === "CRITICAL";

        // Gentle node halo
        ctx.beginPath();
        const pulse = Math.sin(t * 1.5 + (node.id.charCodeAt(0) % 5)) * 1;
        ctx.arc(x, y, 9 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = isCritical
          ? "rgba(244, 63, 94, 0.20)"
          : isSelected
          ? "rgba(190, 24, 93, 0.16)"
          : "rgba(251, 113, 133, 0.12)";
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 5.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isCritical ? "#E11D48" : isSelected ? "#9D174D" : "#BE185D";
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        // Node label
        ctx.font = "11px 'Inter', sans-serif";
        ctx.fillStyle = isSelected ? "#0F172A" : "#475569";
        ctx.fillText(node.name, x + 10, y + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [hoveredNode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const width = rect.width;
    const height = rect.height;

    let found: NodePoint | null = null;
    for (const node of NETWORK_NODES) {
      const nx = node.xRatio * width;
      const ny = node.yRatio * height;
      const dist = Math.hypot(x - nx, y - ny);
      if (dist < 18) {
        found = node;
        break;
      }
    }
    setHoveredNode(found);
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
      className={`relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden bg-white/70 backdrop-blur-sm border border-[#F3E8E8] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className}`}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="w-full h-full cursor-pointer block"
      />

      {/* Floating Hover Tooltip */}
      {hoveredNode && mousePos && (
        <div
          className="absolute z-20 pointer-events-none p-3 rounded-xl bg-white/95 border border-[#F3E8E8] shadow-lg backdrop-blur-md text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-[#0F172A]">{hoveredNode.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                hoveredNode.risk === "CRITICAL"
                  ? "bg-rose-100 text-rose-700 font-semibold"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {hoveredNode.risk}
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] flex items-center justify-between gap-4 font-mono">
            <span>{hoveredNode.ip}</span>
            <span>{hoveredNode.rate}</span>
          </div>
          <div className="text-[10px] text-[#BE185D] pt-0.5">Click to inspect entity in Demo Console →</div>
        </div>
      )}

      {/* Subtle Bottom Bar Overlay */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-[#64748B] pointer-events-none">
        <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
          <span className="w-2 h-2 rounded-full bg-[#BE185D] animate-pulse" />
          Continuous Telemetry Envelope
        </span>
        <span className="font-mono text-[10px] text-[#94A3B8]">Air-Gapped In-Memory Stream</span>
      </div>
    </div>
  );
};
