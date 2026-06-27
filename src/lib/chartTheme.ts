"use client";

import { useTheme } from "@/components/ThemeProvider";

/**
 * Theme-aware colors for recharts. Recharts passes most colors as SVG
 * presentation attributes where CSS `var()` doesn't resolve reliably, so we
 * return concrete hex values chosen per theme instead.
 */
export function useChartColors() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return {
    // axis ticks/labels — slate-500 reads on both themes
    axis: "#64748b",
    // text label drawn inside charts (e.g. donut center)
    labelFill: dark ? "#ffffff" : "#0f172a",
    // grid lines — subtle on each background
    grid: dark ? "#1e293b" : "#e2e8f0",
    // bar hover cursor overlay
    cursor: dark ? "#1e293b66" : "#0f172a14",
    // tooltip container
    tooltip: {
      backgroundColor: dark ? "#1e293b" : "#ffffff",
      border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
      borderRadius: 8,
      fontSize: 11,
      color: dark ? "#e2e8f0" : "#0f172a",
    } as const,
  };
}
