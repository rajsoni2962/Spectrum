import React, { useId } from "react";

interface SpectrumWordmarkProps {
  size?: "header" | "hero" | "footer";
  className?: string;
  showSubtitle?: boolean;
}

// Exact vector paths extracted directly from official SPECTRUM brand reference
const PATH_S =
  "M 9.00 10.00 L 6.25 14.25 L 5.50 18.25 L 5.50 23.75 L 6.00 27.25 L 6.75 29.25 L 8.75 32.25 L 12.50 35.75 L 15.50 37.25 L 16.50 37.25 L 19.50 38.50 L 59.00 38.75 L 61.50 40.25 L 62.25 40.25 L 64.50 42.50 L 65.50 45.25 L 65.50 49.50 L 64.25 53.00 L 61.75 55.50 L 59.75 56.25 L 7.00 56.50 L 6.00 57.75 L 6.00 64.75 L 6.50 65.50 L 8.25 66.00 L 59.50 65.75 L 62.50 65.25 L 63.50 64.50 L 66.00 63.75 L 68.50 62.25 L 72.50 58.00 L 74.00 55.00 L 74.25 51.75 L 75.25 48.00 L 75.00 45.50 L 74.25 43.75 L 74.00 40.00 L 71.00 35.25 L 67.50 32.50 L 64.75 31.75 L 62.50 30.50 L 56.25 29.50 L 22.00 29.50 L 19.75 29.00 L 17.75 27.75 L 16.00 26.00 L 14.75 22.25 L 14.75 20.50 L 16.25 16.25 L 18.00 14.50 L 21.00 13.00 L 24.50 12.50 L 70.25 12.75 L 71.50 11.75 L 72.25 10.25 L 72.25 6.25 L 70.75 4.00 L 22.50 3.75 L 15.75 5.25 L 12.75 6.75 Z";

const PATH_P =
  "M 128.25 5.00 L 127.75 6.00 L 127.75 62.50 L 128.00 64.50 L 128.75 65.50 L 129.75 66.00 L 136.50 66.00 L 137.25 65.25 L 137.50 47.00 L 138.50 46.25 L 180.25 46.00 L 184.25 44.75 L 185.75 43.50 L 187.25 43.00 L 192.25 38.00 L 194.25 33.50 L 195.25 28.00 L 195.25 22.25 L 194.25 17.25 L 192.75 14.75 L 192.25 13.00 L 189.25 9.50 L 185.75 7.00 L 182.25 5.25 L 174.50 4.00 L 129.75 4.00 Z M 184.50 19.25 L 185.75 23.75 L 185.50 28.00 L 184.75 29.50 L 184.50 31.25 L 182.75 34.00 L 179.50 36.50 L 175.25 37.50 L 138.50 37.50 L 137.50 36.50 L 137.75 13.25 L 138.25 13.00 L 176.25 13.00 L 178.00 13.25 L 179.25 14.25 L 181.00 14.75 L 182.75 16.50 Z";

const PATH_C =
  "M 375.25 12.50 L 372.00 16.50 L 369.25 21.25 L 369.00 23.00 L 367.75 25.25 L 366.50 30.50 L 366.25 37.50 L 367.50 44.50 L 368.75 46.75 L 369.25 49.25 L 372.00 54.00 L 375.50 58.25 L 381.00 62.25 L 384.50 64.00 L 390.50 65.75 L 399.00 66.25 L 431.75 66.00 L 432.50 65.50 L 433.00 64.25 L 433.00 58.25 L 431.50 56.50 L 394.00 56.50 L 389.50 56.00 L 384.00 52.75 L 380.25 49.00 L 377.50 43.50 L 377.25 40.50 L 376.50 38.00 L 376.50 32.50 L 377.25 30.00 L 377.25 27.75 L 380.25 21.50 L 383.50 18.00 L 384.75 17.50 L 385.50 16.50 L 386.50 16.25 L 388.25 14.75 L 390.50 14.50 L 392.25 13.50 L 395.00 13.00 L 431.50 13.00 L 432.75 12.00 L 433.00 11.25 L 433.00 5.50 L 432.50 4.50 L 431.50 4.00 L 393.00 4.00 L 387.00 5.25 L 385.00 6.50 L 383.50 6.75 L 379.75 8.75 Z";

const PATH_T =
  "M 479.75 4.50 L 479.00 5.50 L 478.75 6.75 L 479.00 11.25 L 479.50 12.25 L 480.75 13.00 L 508.00 13.25 L 508.50 18.00 L 508.25 64.25 L 508.75 65.75 L 509.75 66.25 L 515.75 66.25 L 516.75 65.75 L 517.50 64.75 L 517.75 61.75 L 517.75 13.75 L 518.50 13.00 L 545.75 13.00 L 547.00 12.00 L 547.25 11.25 L 547.25 5.25 L 545.50 4.00 L 481.00 4.00 Z";

const PATH_R =
  "M 601.75 5.50 L 601.50 53.50 L 601.75 65.25 L 602.50 66.00 L 609.75 66.25 L 611.00 65.50 L 611.25 43.75 L 611.75 42.50 L 612.50 42.25 L 641.25 42.25 L 643.50 44.25 L 645.50 47.00 L 653.75 55.75 L 654.00 56.50 L 655.75 58.00 L 661.75 65.25 L 664.00 66.50 L 671.50 66.50 L 673.25 66.00 L 673.50 64.25 L 654.50 42.75 L 655.25 41.75 L 658.00 41.25 L 663.50 38.50 L 666.75 35.25 L 669.50 30.75 L 670.00 27.25 L 670.00 20.50 L 669.50 16.50 L 668.00 13.00 L 664.00 8.50 L 661.25 6.75 L 659.25 6.25 L 658.50 5.50 L 651.50 4.25 L 604.00 4.25 L 602.75 4.50 Z M 611.25 13.50 L 611.75 13.00 L 616.50 12.75 L 654.00 13.25 L 655.25 14.25 L 656.75 14.75 L 660.00 18.75 L 660.50 21.25 L 660.50 25.25 L 660.00 27.75 L 656.75 31.75 L 654.00 32.50 L 652.25 33.50 L 615.25 33.50 L 611.50 33.00 Z";

const PATH_U =
  "M 727.75 5.25 L 727.25 6.50 L 727.25 43.50 L 727.75 47.25 L 729.00 49.75 L 729.50 52.75 L 730.50 53.75 L 730.75 54.75 L 734.00 59.00 L 737.75 62.25 L 744.75 65.50 L 752.00 66.75 L 773.75 66.75 L 782.00 65.50 L 783.75 64.50 L 786.00 64.00 L 790.75 61.00 L 795.25 56.25 L 797.00 53.25 L 797.25 51.25 L 798.50 49.75 L 799.50 43.00 L 799.50 7.00 L 799.00 5.50 L 798.25 5.00 L 791.25 5.00 L 790.25 6.25 L 790.25 41.00 L 788.50 48.00 L 786.50 50.75 L 786.00 52.25 L 781.00 56.00 L 776.50 56.50 L 774.00 57.25 L 754.25 57.50 L 745.50 55.75 L 744.50 54.75 L 743.25 54.25 L 740.25 51.25 L 737.50 45.25 L 737.00 42.00 L 736.75 6.00 L 736.50 5.50 L 734.75 4.75 L 728.75 4.75 Z";

const PATH_M =
  "M 940.00 5.75 L 939.25 5.00 L 938.25 4.75 L 932.50 4.75 L 931.00 5.50 L 926.75 10.50 L 918.25 19.25 L 911.75 27.00 L 903.25 35.75 L 895.50 44.75 L 895.00 44.75 L 890.25 40.00 L 859.75 5.25 L 851.50 5.25 L 850.75 6.25 L 850.50 12.50 L 851.00 65.75 L 852.75 66.75 L 858.75 66.75 L 859.50 66.50 L 860.25 65.50 L 860.50 21.25 L 862.50 22.50 L 864.50 25.25 L 871.50 32.50 L 873.25 35.00 L 880.50 42.50 L 886.50 50.00 L 888.25 51.50 L 888.50 52.25 L 891.75 55.75 L 893.25 56.75 L 897.50 56.50 L 900.50 53.50 L 904.25 48.75 L 906.25 47.25 L 910.00 42.50 L 929.75 21.50 L 930.25 22.00 L 930.50 29.25 L 930.50 65.00 L 931.50 66.25 L 932.75 66.75 L 939.25 66.50 L 940.25 65.00 Z";

/**
 * SPECTRUM Vector Wordmark Component
 * 
 * Recreates the official SPECTRUM wordmark as custom SVG vector paths matching the uploaded reference:
 * - Wide geometric monoline letterforms (S, P, C, T, R, U, M)
 * - Custom three-horizontal-bar metallic rose gradient E
 * - 100% single horizontal line (cannot wrap)
 * - Exact character proportions & width-to-height ratio (~13.3 : 1)
 * - Live HTML text for the tagline descriptor
 */
export const SpectrumWordmark: React.FC<SpectrumWordmarkProps> = ({
  size = "hero",
  className = "",
  showSubtitle = true,
}) => {
  const gradientId = useId();

  const renderSvg = (svgClassName: string) => (
    <svg
      viewBox="0 0 946 71"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={svgClassName}
      aria-label="SPECTRUM"
      role="img"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#996274" />
          <stop offset="35%" stopColor="#BE185D" />
          <stop offset="75%" stopColor="#D98FA8" />
          <stop offset="100%" stopColor="#EBB4BD" />
        </linearGradient>
      </defs>

      {/* S */}
      <path id="wordmark-s" d={PATH_S} fill="#0F172A" />

      {/* P (outer + inner counter) */}
      <path id="wordmark-p" d={PATH_P} fill="#0F172A" fillRule="evenodd" />

      {/* Custom 3-horizontal-bar metallic rose E */}
      <g id="wordmark-e">
        <rect x="249.5" y="4.0" width="63.5" height="9.2" rx="4.6" fill={`url(#${gradientId})`} />
        <rect x="249.75" y="30.25" width="63.2" height="9.2" rx="4.6" fill={`url(#${gradientId})`} />
        <rect x="249.75" y="56.75" width="63.5" height="9.6" rx="4.8" fill={`url(#${gradientId})`} />
      </g>

      {/* C */}
      <path id="wordmark-c" d={PATH_C} fill="#0F172A" />

      {/* T */}
      <path id="wordmark-t" d={PATH_T} fill="#0F172A" />

      {/* R (outer + inner counter) */}
      <path id="wordmark-r" d={PATH_R} fill="#0F172A" fillRule="evenodd" />

      {/* U */}
      <path id="wordmark-u" d={PATH_U} fill="#0F172A" />

      {/* M */}
      <path id="wordmark-m" d={PATH_M} fill="#0F172A" />
    </svg>
  );

  // 1. Header Navigation Size
  if (size === "header") {
    return (
      <div
        className={`inline-flex items-center select-text whitespace-nowrap ${className}`}
        style={{ whiteSpace: "nowrap" }}
      >
        <span className="sr-only">SPECTRUM</span>
        {renderSvg("w-[125px] sm:w-[145px] h-auto block")}
      </div>
    );
  }

  // 2. Footer Brand Size
  if (size === "footer") {
    return (
      <div
        className={`flex flex-col items-start select-text whitespace-nowrap ${className}`}
        style={{ whiteSpace: "nowrap" }}
      >
        <span className="sr-only">SPECTRUM</span>
        {renderSvg("w-[130px] sm:w-[155px] h-auto block")}
        {showSubtitle && (
          <div className="font-montserrat font-normal text-[9px] sm:text-[10px] tracking-[0.30em] text-[#64748B] uppercase mt-1.5 pl-[0.12em] whitespace-nowrap">
            AI Network Security & Attack Forecasting
          </div>
        )}
      </div>
    );
  }

  // 3. Hero Display Size (Custom SVG wordmark, single horizontal line, responsive, centered)
  return (
    <div
      className={`w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center select-text whitespace-nowrap ${className}`}
      style={{ whiteSpace: "nowrap" }}
    >
      <span className="sr-only">SPECTRUM</span>

      {/* S P [custom E] C T R U M (Custom Vector SVG Wordmark) */}
      <div className="w-full flex justify-center items-center">
        {renderSvg("w-[320px] sm:w-[420px] md:w-[490px] lg:w-[540px] max-w-full h-auto block drop-shadow-[0_1px_1px_rgba(0,0,0,0.04)]")}
      </div>

      {/* Live HTML Tagline Text matching reference */}
      {showSubtitle && (
        <div
          className="w-full font-montserrat font-normal text-[10px] sm:text-xs md:text-sm tracking-[0.28em] sm:tracking-[0.34em] text-[#475569] uppercase mt-2.5 sm:mt-3 pl-[0.2em] whitespace-nowrap select-text leading-tight"
          style={{ whiteSpace: "nowrap" }}
        >
          AI Network Security & Attack Forecasting
        </div>
      )}
    </div>
  );
};
