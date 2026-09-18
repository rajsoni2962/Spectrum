import React, { useEffect, useRef } from "react";

interface RibbonWave {
  baseY: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  colorStop0: string;
  colorStop1: string;
  lineWidth: number;
  opacity: number;
}

export const SpectralFlowField: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

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

    // Subtle, barely-visible flowing ribbons undulating across the viewport
    const ribbons: RibbonWave[] = [
      {
        baseY: 0.52,
        amplitude: 55,
        frequency: 0.0016,
        speed: 0.004,
        phase: 0,
        colorStop0: "rgba(252, 231, 243, 0.18)", // very soft blush
        colorStop1: "rgba(217, 143, 168, 0.12)", // subtle blush rose
        lineWidth: 1.2,
        opacity: 0.16,
      },
      {
        baseY: 0.48,
        amplitude: 70,
        frequency: 0.0013,
        speed: -0.003,
        phase: 1.8,
        colorStop0: "rgba(244, 114, 182, 0.14)", // baby pink
        colorStop1: "rgba(190, 24, 93, 0.10)",   // muted rose
        lineWidth: 1.0,
        opacity: 0.14,
      },
      {
        baseY: 0.56,
        amplitude: 45,
        frequency: 0.0020,
        speed: 0.005,
        phase: 3.4,
        colorStop0: "rgba(251, 207, 232, 0.16)",
        colorStop1: "rgba(190, 24, 93, 0.08)",
        lineWidth: 1.1,
        opacity: 0.12,
      },
      {
        baseY: 0.44,
        amplitude: 80,
        frequency: 0.0010,
        speed: -0.003,
        phase: 4.8,
        colorStop0: "rgba(253, 242, 248, 0.20)",
        colorStop1: "rgba(217, 143, 168, 0.10)",
        lineWidth: 1.0,
        opacity: 0.15,
      },
      {
        baseY: 0.60,
        amplitude: 60,
        frequency: 0.0015,
        speed: 0.004,
        phase: 2.1,
        colorStop0: "rgba(244, 114, 182, 0.12)",
        colorStop1: "rgba(190, 24, 93, 0.08)",
        lineWidth: 1.0,
        opacity: 0.10,
      },
    ];

    // Barely visible, floating telemetry signal particles flowing along the vector field
    const numParticles = 12;
    const particles = Array.from({ length: numParticles }, (_, i) => ({
      xRatio: Math.random(),
      speed: 0.0003 + Math.random() * 0.0005,
      ribbonIndex: i % ribbons.length,
      yOffset: (Math.random() - 0.5) * 20,
      radius: 0.8 + Math.random() * 0.8,
      opacity: 0.08 + Math.random() * 0.10,
      color: i % 2 === 0 ? "#BE185D" : "#D98FA8",
    }));

    const render = () => {
      t += 0.008;

      // Mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);

      const mouseInfluenceX = (mouseRef.current.x / width - 0.5) * 60;
      const mouseInfluenceY = (mouseRef.current.y / height - 0.5) * 40;

      // Render each flowing spectral ribbon
      ribbons.forEach((r, idx) => {
        const currentBaseY = height * r.baseY + mouseInfluenceY * (0.4 + idx * 0.1);
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, r.colorStop0);
        grad.addColorStop(0.5, r.colorStop1);
        grad.addColorStop(1, r.colorStop0);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = r.lineWidth;
        ctx.globalAlpha = r.opacity;

        const step = 6;
        for (let x = 0; x <= width + step; x += step) {
          const wave1 = Math.sin(x * r.frequency + t * r.speed * 40 + r.phase);
          const wave2 = Math.cos(x * (r.frequency * 0.6) - t * 0.25 + r.phase * 0.8) * 0.45;
          const wave3 = Math.sin(x * (r.frequency * 1.5) + t * 0.4) * 0.25;

          const y = currentBaseY + (wave1 + wave2 + wave3) * r.amplitude + Math.sin(x * 0.001 + mouseInfluenceX * 0.02) * 15;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

        // Optional secondary barely-visible whisper halo line
        if (idx % 2 === 0) {
          ctx.beginPath();
          ctx.lineWidth = r.lineWidth * 2.0;
          ctx.globalAlpha = r.opacity * 0.15;
          for (let x = 0; x <= width + step; x += step) {
            const wave1 = Math.sin(x * r.frequency + t * r.speed * 40 + r.phase);
            const wave2 = Math.cos(x * (r.frequency * 0.6) - t * 0.25 + r.phase * 0.8) * 0.45;
            const y = currentBaseY + (wave1 + wave2) * r.amplitude + 2;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      });

      // Render flowing signal motes traveling gracefully along the waves
      particles.forEach((p) => {
        p.xRatio += p.speed;
        if (p.xRatio > 1) p.xRatio = 0;

        const r = ribbons[p.ribbonIndex];
        const currentBaseY = height * r.baseY + mouseInfluenceY * (0.4 + p.ribbonIndex * 0.1);
        const px = p.xRatio * width;
        const wave1 = Math.sin(px * r.frequency + t * r.speed * 40 + r.phase);
        const wave2 = Math.cos(px * (r.frequency * 0.6) - t * 0.25 + r.phase * 0.8) * 0.45;
        const py = currentBaseY + (wave1 + wave2) * r.amplitude + p.yOffset;

        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Very subtle particle glow
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * 0.12;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.targetX = e.clientX - rect.left;
    mouseRef.current.targetY = e.clientY - rect.top;
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.targetX = rect.width / 2;
    mouseRef.current.targetY = rect.height / 2;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
