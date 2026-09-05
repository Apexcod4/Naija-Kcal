import { Activity, Goal, MacroTargets, Sex } from '../types';

export const ACTIVITY_MULTIPLIER: Record<Activity, number> = {
  low: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const DEFICIT = 500;
const SURPLUS = 300;
/** Below this, an automatically-applied deficit is not safe to prescribe. */
const FLOOR = 1400;

/**
 * Mifflin-St Jeor. The handoff supplies an output target (2583) but never a
 * formula, so this choice is flagged in docs/design-questions.md.
 */
export function bmr(sex: Sex, kg: number, cm: number, age: number): number {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function tdee(bmrValue: number, activity: Activity): number {
  return Math.round(bmrValue * ACTIVITY_MULTIPLIER[activity]);
}

export function dailyTarget(tdeeValue: number, goal: Goal): number {
  if (goal === 'lose') {
    const reduced = tdeeValue - DEFICIT;
    // Never prescribe a deficit that lands under the safety floor; hold at
    // maintenance and leave the decision to a human.
    return reduced < FLOOR ? tdeeValue : reduced;
  }
  if (goal === 'gain') return tdeeValue + SURPLUS;
  return tdeeValue;
}

/**
 * A ratio of the computed target rather than fixed grams. The mock's
 * 390C/200P/70F sum to 2990 kcal against a 2583 target — they were authored
 * independently and never reconciled. Flagged in docs/design-questions.md.
 */
export function macroTargets(target: number): MacroTargets {
  return {
    carbs: Math.round((target * 0.35) / 4),
    protein: Math.round((target * 0.3) / 4),
    fat: Math.round((target * 0.35) / 9),
  };
}
