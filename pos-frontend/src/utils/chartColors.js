/**
 * Centralized Chart Theme Palette & Helpers
 * Consistent warm, vivid 5-tone palette across all charts in the POS System
 */

export const CHART_PALETTE = [
  "#F5A623", // 1. Bright Vivid Gold
  "#F97316", // 2. Warm Tangerine / Orange
  "#E05D44", // 3. Warm Rose / Terracotta
  "#D97706", // 4. Rich Amber
  "#8C877D", // 5. Warm Slate Taupe
];

export const PRIMARY_CHART_COLOR = "#F5A623";
export const SECONDARY_CHART_COLOR = "#F97316";
export const TERTIARY_CHART_COLOR = "#E05D44";

/**
 * Returns a color from the 5-tone palette for a given series/category index
 * @param {number} index
 * @returns {string} Hex color
 */
export const getChartColor = (index) => {
  return CHART_PALETTE[index % CHART_PALETTE.length];
};
