// src/components/common/NexPOSLogo.jsx
import React from "react";

/**
 * NexPOSIcon - Concept 3: Optical Barcode & Speed Beam
 * Obsidian (#18181B) container + crisp barcode pillars + Electric Amber (#F59E0B) laser scan beam forming 'N'
 */
export const NexPOSIcon = ({ size = 32, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NexPOS Icon"
    >
      {/* Obsidian rounded container */}
      <rect width="36" height="36" rx="9" fill="#18181B" />

      {/* Barcode Left Outer Pillar (White) */}
      <rect x="7" y="8" width="3.5" height="20" rx="1.2" fill="#FAF8F3" />

      {/* Barcode Left Inner Slit (Muted Zinc) */}
      <rect x="12" y="10" width="1.5" height="16" rx="0.75" fill="#71717A" />

      {/* Barcode Right Inner Slit (Muted Zinc) */}
      <rect x="22.5" y="10" width="1.5" height="16" rx="0.75" fill="#71717A" />

      {/* Barcode Right Outer Pillar (White) */}
      <rect x="25.5" y="8" width="3.5" height="20" rx="1.2" fill="#FAF8F3" />

      {/* Optical Speed Beam (Electric Amber) - Diagonally bridging the pillars to complete the 'N' monogram */}
      <path
        d="M8.5 10L27.5 25.5H23.5L8.5 13.5V10Z"
        fill="#F59E0B"
      />

      {/* Optical scanner focus pulse */}
      <circle cx="18" cy="18" r="1.75" fill="#FBBF24" />
    </svg>
  );
};

export const NexPOSLogo = ({
  size = "md",
  showWordmark = true,
  subtitle = null,
  className = "",
  onClick,
}) => {
  const iconSizes = {
    xs: 24,
    sm: 28,
    md: 36,
    lg: 42,
    xl: 48,
  };

  const textSizes = {
    xs: "text-base",
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const currentIconSize = iconSizes[size] || 36;
  const currentTextSize = textSizes[size] || "text-xl";

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${
        onClick ? "cursor-pointer group select-none" : ""
      } ${className}`}
    >
      <div className="transition-transform duration-200 group-hover:scale-105 shrink-0">
        <NexPOSIcon size={currentIconSize} />
      </div>
      {showWordmark && (
        <div className="leading-tight">
          <span
            className={`font-black tracking-tight ${currentTextSize} text-foreground flex items-center`}
          >
            <span>Nex</span>
            <span className="text-[#F59E0B] ml-0.5">POS</span>
          </span>
          {subtitle && (
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NexPOSLogo;
