import React, { useState } from "react";
export { SpectrumWordmark } from "./SpectrumWordmark";

interface SpectrumLogoProps {
  size?: number;
  className?: string;
  useImage?: boolean;
}

/**
 * SPECTRUM Brand Icon Component
 *
 * Official sculptural ribbon emblem featuring:
 * - Rose-pink metallic ribbon 'S' fold
 * - Shaded charcoal and blush transitions
 * - Central vertical spine with radiant 4-point star flare
 */
export const SpectrumLogo: React.FC<SpectrumLogoProps> = ({
  size = 24,
  className = "",
  useImage = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Primary: High-fidelity transparent alpha asset
  if (useImage && !imgFailed) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src="/spectrum-logo-clean.png"
          alt="SPECTRUM Icon"
          width={size}
          height={Math.round(size * 1.41)}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(190,24,93,0.12)]"
        />
      </div>
    );
  }

  // Fallback: Vector SVG rendering of the sculptural ribbon & flare
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
        aria-label="SPECTRUM Icon"
        role="img"
      >
        <defs>
          {/* Upper Blush-to-Rose Gradient */}
          <linearGradient id="logoRoseTop" x1="20%" y1="10%" x2="85%" y2="80%">
            <stop offset="0%" stopColor="#FCE7F3" />
            <stop offset="35%" stopColor="#EBB4BD" />
            <stop offset="70%" stopColor="#D98FA8" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>

          {/* Lower Charcoal-to-Plum Gradient */}
          <linearGradient id="logoCharcoalBottom" x1="15%" y1="20%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#BE185D" />
            <stop offset="40%" stopColor="#664A57" />
            <stop offset="75%" stopColor="#2D1F29" />
            <stop offset="100%" stopColor="#1E1B24" />
          </linearGradient>

          {/* Center Flare Shimmer Gradient */}
          <radialGradient id="logoStarShine" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF5F7" />
            <stop offset="60%" stopColor="#F472B6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#BE185D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Upper Ribbon Loop */}
        <path
          d="M 50 12 C 55 12 76 22 84 38 C 92 54 84 72 70 76 C 58 79 50 68 46 56 C 42 44 44 26 50 12 Z"
          fill="url(#logoRoseTop)"
        />

        {/* Lower Ribbon Fold */}
        <path
          d="M 50 128 C 45 128 24 118 16 102 C 8 86 16 68 30 64 C 42 61 50 72 54 84 C 58 96 56 114 50 128 Z"
          fill="url(#logoCharcoalBottom)"
        />

        {/* Center Diagonal Transition Spine */}
        <path
          d="M 28 42 C 40 46 54 62 60 74 C 66 86 64 98 52 94 C 40 90 32 76 28 62 C 26 52 26 44 28 42 Z"
          fill="url(#logoRoseTop)"
          opacity="0.9"
        />

        {/* Central Vertical Spine Line */}
        <line
          x1="50"
          y1="25"
          x2="50"
          y2="115"
          stroke="#FFF0F5"
          strokeWidth="1.2"
          strokeOpacity="0.65"
        />

        {/* Central Radiant 4-Point Star Flare */}
        <g transform="translate(50, 68)">
          <path
            d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z"
            fill="url(#logoStarShine)"
          />
          <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
};

// Aliases for seamless backwards compatibility
export const KXLogo = SpectrumLogo;

