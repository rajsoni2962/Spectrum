import React, { useEffect, useRef, useState } from "react";
import { Network, Play, Pause, ShieldAlert, Zap, Globe, RefreshCw } from "lucide-react";
import { RollingNumber } from "./RollingNumber";

interface Node {
  id: string;
  label: string;
  ip: string;
  x: number;
  y: number;
  type: "external" | "gateway" | "target" | "internal" | "db";
  status: "normal" | "attacked" | "secure";
  pulseRadius: number;
}

interface Packet {
  id: number;
  fromNode: string;
  toNode: string;
  progress: number; // 0 to 1
  speed: number;
  isMalicious: boolean;
  color: string;
}

interface LiveThreatStreamCanvasProps {
  isThreatActive?: boolean;
  onSelectNode?: (nodeIp: string) => void;
}

export const LiveThreatStreamCanvas: React.FC<LiveThreatStreamCanvasProps> = ({
  isThreatActive = false,
  onSelectNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [packetCount, setPacketCount] = useState(14820);
  const [activePacketsVisual, setActivePacketsVisual] = useState(24);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let packetIdCounter = 0;

    // Fixed logical resolution
    const width = 800;
    const height = 320;
    canvas.width = width;
    canvas.height = height;

    // 5 Topology Nodes
    const nodes: Node[] = [
      {
        id: "external",
        label: "Outside Attacker",
        ip: "198.51.100.44",
        x: 80,
        y: 160,
        type: "external",
        status: isThreatActive ? "attacked" : "normal",
        pulseRadius: 0,
      },
      {
        id: "gateway",
        label: "Main Firewall",
        ip: "10.0.1.1",
        x: 240,
        y: 160,
        type: "gateway",
        status: "normal",
        pulseRadius: 0,
      },
      {
        id: "dmz",
        label: "Public Web Server",
        ip: "10.0.1.15",
        x: 420,
        y: 110,
        type: "target",
        status: isThreatActive ? "attacked" : "normal",
        pulseRadius: 0,
      },
      {
        id: "app",
        label: "Internal App",
        ip: "10.0.1.20",
        x: 420,
        y: 220,
        type: "internal",
        status: "normal",
        pulseRadius: 0,
      },
      {
        id: "db",
        label: "Database Core",
        ip: "10.0.1.5",
        x: 640,
        y: 160,
        type: "db",
        status: "secure",
        pulseRadius: 0,
      },
    ];

    // Links between nodes
    const links = [
      { from: "external", to: "gateway" },
      { from: "gateway", to: "dmz" },
      { from: "gateway", to: "app" },
      { from: "dmz", to: "db" },
      { from: "app", to: "db" },
    ];

    let packets: Packet[] = [];

    // Spawn a packet
    const spawnPacket = () => {
      const link = links[Math.floor(Math.random() * links.length)];
      const isFromExternal = link.from === "external";
      const isMalicious = isThreatActive && (isFromExternal || link.to === "dmz");

      packets.push({
        id: packetIdCounter++,
        fromNode: link.from,
        toNode: link.to,
        progress: 0,
        speed: (0.008 + Math.random() * 0.012) * (isMalicious ? 1.6 : 1.0),
        isMalicious,
        color: isMalicious ? "#E11D48" : isFromExternal ? "#D97706" : "#BE185D",
      });
    };

    // Initialize with some packets
    for (let i = 0; i < 15; i++) {
      spawnPacket();
      if (packets[i]) packets[i].progress = Math.random();
    }

    let frameTick = 0;

    const render = () => {
      if (!isPlaying) {
        animId = requestAnimationFrame(render);
        return;
      }

      frameTick++;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = "#F3E8E8";
      ctx.lineWidth = 0.75;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 1. Draw Links
      links.forEach((link) => {
        const from = nodes.find((n) => n.id === link.from);
        const to = nodes.find((n) => n.id === link.to);
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);

        // Slight curved bezier line for elegance
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 10;
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);

        const isAttackedPath = isThreatActive && (link.from === "external" || link.to === "dmz");
        ctx.strokeStyle = isAttackedPath ? "rgba(225, 29, 72, 0.45)" : "rgba(203, 213, 225, 0.8)";
        ctx.lineWidth = isAttackedPath ? 2 : 1.2;
        ctx.stroke();
      });

      // 2. Spawn packets based on rate
      if (frameTick % (isThreatActive ? 3 : 8) === 0 && packets.length < 40) {
        spawnPacket();
      }

      // 3. Update & Draw Packets
      packets.forEach((p) => {
        p.progress += p.speed;

        const from = nodes.find((n) => n.id === p.fromNode);
        const to = nodes.find((n) => n.id === p.toNode);
        if (!from || !to) return;

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 10;

        // Quadratic Bezier Interpolation
        const t = p.progress;
        const invT = 1 - t;
        const x = invT * invT * from.x + 2 * invT * t * midX + t * t * to.x;
        const y = invT * invT * from.y + 2 * invT * t * midY + t * t * to.y;

        // Draw Packet Glowing Blip
        ctx.beginPath();
        ctx.arc(x, y, p.isMalicious ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.isMalicious ? 8 : 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // When packet arrives, trigger node pulse
        if (p.progress >= 1) {
          to.pulseRadius = 1;
        }
      });

      // Filter finished packets
      packets = packets.filter((p) => p.progress < 1);

      // 4. Draw Nodes
      nodes.forEach((node) => {
        // Node Status Color
        const nodeColor =
          node.type === "external"
            ? "#E11D48"
            : node.status === "attacked"
            ? "#E11D48"
            : node.type === "db"
            ? "#059669"
            : "#BE185D";

        // Animated Pulse Ring
        if (node.pulseRadius > 0) {
          node.pulseRadius += 0.8;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 14 + node.pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = nodeColor;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = Math.max(0, 1 - node.pulseRadius / 25);
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          if (node.pulseRadius > 25) node.pulseRadius = 0;
        }

        // Node Outer Ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = nodeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node Center Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Labels
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#0F172A";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y - 20);

        ctx.font = "9px monospace";
        ctx.fillStyle = "#64748B";
        ctx.fillText(node.ip, node.x, node.y + 24);
      });

      // Update state counters occasionally
      if (frameTick % 40 === 0) {
        setPacketCount((prev) => prev + Math.floor(Math.random() * 40 + 10));
        setActivePacketsVisual(packets.length);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isThreatActive]);

  return (
    <div className="bg-white border border-[#F3E8E8] rounded-xl p-5 shadow-xs space-y-4 select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3E8E8] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#FDF2F8] border border-[#FCE7F3]">
            <Network className="w-4 h-4 text-[#BE185D]" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <span>Live Network Map & Traffic Flow</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] animate-pulse">
                STREAMING
              </span>
            </h3>
            <p className="text-[11px] text-[#64748B] font-mono">
              Live Traffic Path: Internet → Main Firewall → Web Server → Database
            </p>
          </div>
        </div>

        {/* Controls & Metrics */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E2E8F0] rounded-lg text-[10px] font-mono text-[#64748B] flex items-center gap-2">
            <span>
              Active: <strong className="text-[#0F172A]">{activePacketsVisual}</strong>
            </span>
            <span className="text-[#E2E8F0]">|</span>
            <span>
              Total: <strong className="text-[#0F172A]">{packetCount.toLocaleString()}</strong>
            </span>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            title={isPlaying ? "Pause Stream Visualizer" : "Resume Stream Visualizer"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* HTML5 Canvas Topology Stream */}
      <div className="w-full bg-[#FAF8F5] border border-[#F3E8E8] rounded-lg overflow-hidden relative shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-56 sm:h-64 block cursor-crosshair"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 800;
            if (clickX > 320 && clickX < 520 && onSelectNode) {
              onSelectNode("10.0.1.15");
            }
          }}
        />

        {/* Floating Canvas Legend */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono text-[#64748B] bg-white/95 px-2.5 py-1 rounded-md border border-[#F3E8E8] backdrop-blur-xs shadow-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#BE185D]" />
            Safe Traffic
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
            Outside Scan
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
            Blocked Attack
          </span>
        </div>
      </div>
    </div>
  );
};
