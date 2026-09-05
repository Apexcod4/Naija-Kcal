import { PortionTotals, Share, UnitRates } from '../types';

export const STEP = 0.5;
export const MIN_UNITS = 0;
export const MAX_UNITS = 4;

/**
 * Per-unit rates. These are user profile data sourced from onboarding
 * calibration, not constants — the defaults below are the handoff's values
 * for a 210 g wrap and a 180 ml ladle.
 */
export const DEFAULT_RATES: { swallow: UnitRates; ladle: UnitRates } = {
  swallow: { kcal: 320, carbs: 72, protein: 4, fat: 1 },
  ladle: { kcal: 290, carbs: 9, protein: 18, fat: 22 },
};

export function computePair(
  wraps: number,
  ladles: number,
  share: Share,
  rates: { swallow: UnitRates; ladle: UnitRates } = DEFAULT_RATES
): PortionTotals {
  const m = share / 100;
  const at = (key: keyof UnitRates) =>
    Math.round((wraps * rates.swallow[key] + ladles * rates.ladle[key]) * m);

  return {
    kcal: at('kcal'),
    carbs: at('carbs'),
    protein: at('protein'),
    fat: at('fat'),
  };
}

/** Step a unit count by delta, clamped to the 0..4 range. */
export function stepUnit(current: number, delta: number): number {
  const next = current + delta;
  if (next < MIN_UNITS) return MIN_UNITS;
  if (next > MAX_UNITS) return MAX_UNITS;
  return next;
}

/**
 * Render a unit count using vulgar fractions. Covers every half reachable in
 * the 0..4 range — the mock only handled 0.5/1.5/2.5 and leaked "3.5".
 */
export function formatUnit(n: number): string {
  const whole = Math.floor(n);
  const isHalf = n - whole === 0.5;
  if (!isHalf) return String(n);
  return whole === 0 ? '½' : `${whole}½`;
}

/** Percentage widths for the three macro mini-bars on the result card. */
export function barWidths(t: PortionTotals) {
  return {
    carbW: Math.min(100, Math.round(t.carbs / 3.9)),
    protW: Math.min(100, Math.round(t.protein / 2)),
    fatW: Math.min(100, Math.round(t.fat * 1.4)),
  };
}

export function shareNote(share: Share): string {
  return share === 100
    ? 'Counted as your own bowl, not a split.'
    : 'Split from a shared bowl — the rest goes to the household, not to you.';
}

/** Human label for a share, used in the logged meal's unit string. */
export function shareLabel(share: Share): string {
  if (share === 100) return 'all of it';
  if (share === 50) return '½ of the bowl';
  return '⅓ of the bowl';
}
