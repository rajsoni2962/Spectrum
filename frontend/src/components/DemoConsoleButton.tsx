import React from "react";
import { ArrowRight } from "lucide-react";

interface DemoConsoleButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

/**
 * Reusable DemoConsoleButton featuring a precision perimeter light beam.
 * - Deep navy/charcoal fill (#0F172A)
 * - Ultra-thin rounded border track
 * - Continuous slow, cinematic light highlight with subtle rose/pink tint (#F472B6)
 * - 1-2px lift and subtle animation intensification on hover
 * - Full prefers-reduced-motion compliance
 */
export const DemoConsoleButton: React.FC<DemoConsoleButtonProps> = ({
  onClick,
  className = "",
  label = "Demo Console",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ padding: "2px" }}
      className={`group relative inline-flex items-center justify-center rounded-full bg-[#1E293B] overflow-hidden transition-all duration-300 hover:-translate-y-[2px] shadow-[0_2px_8px_rgba(15,23,42,0.12)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.22)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BE185D] focus-visible:ring-offset-2 cursor-pointer select-none ${className}`}
    >
      {/* 1. Base Subtle Perimeter Ring (Defines complete rounded capsule against cream background) */}
      <span
        className="absolute inset-0 rounded-full border border-[#334155] pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* 2. Traveling Pink -> White -> Pink Perimeter Light Beam */}
      <span
        className="pointer-events-none rounded-full animate-border-sweep opacity-100 transition-opacity duration-300 motion-reduce:hidden z-[2]"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "420px",
          height: "420px",
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgba(244,114,182,0) 265deg, #F472B6 290deg, #FDA4AF 312deg, #FFFFFF 324deg, #FFFFFF 336deg, #FDA4AF 348deg, #F472B6 358deg, rgba(244,114,182,0) 360deg)",
        }}
        aria-hidden="true"
      />

      {/* 3. Deep Navy Solid Core Surface with Subtle Inner Soft Reflection */}
      <span className="relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-full bg-[#0F172A] px-5 py-2.5 transition-colors duration-300 group-hover:bg-[#141C2E] overflow-hidden">
        {/* Soft, localized reflection cast gently on the inner edge as the highlight passes */}
        <span
          className="pointer-events-none rounded-full animate-border-sweep opacity-35 group-hover:opacity-50 transition-opacity duration-300 motion-reduce:hidden"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "420px",
            height: "420px",
            filter: "blur(8px)",
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 265deg, rgba(244,114,182,0) 275deg, #F472B6 300deg, #FFFFFF 330deg, #F472B6 355deg, transparent 360deg)",
          }}
          aria-hidden="true"
        />

        {/* Static Typography & Pink Arrow with Subtle Hover Nudge */}
        <span className="relative z-20 tracking-tight text-white font-semibold text-xs">{label}</span>
        <ArrowRight className="relative z-20 w-3.5 h-3.5 text-[#F472B6] transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
      </span>
    </button>
  );
};
