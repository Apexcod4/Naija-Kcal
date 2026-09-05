export const RING = {
  calories: { size: 120, r: 50, strokeWidth: 12, circumference: 314 },
  macro: { size: 52, r: 21, strokeWidth: 7, circumference: 132 },
} as const;

/**
 * SVG stroke-dashoffset for a progress ring.
 * Rings clamp at their target — they do not overrun.
 */
export function dashOffset(value: number, target: number, circumference: number): number {
  if (target <= 0) return 0;
  const ratio = Math.min(1, value / target);
  return Math.max(0, circumference - circumference * ratio);
}

/**
 * Diary bar height as a percentage. Unlike the rings, over-target days are
 * meaningful here — the bar caps at 100% and is recoloured by the caller.
 */
export function barHeightPct(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}
