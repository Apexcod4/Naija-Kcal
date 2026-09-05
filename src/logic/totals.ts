import { Meal, PortionTotals } from '../types';

/** Sum a day's meals. Consumed totals are always derived, never stored. */
export function sumMeals(meals: Meal[]): PortionTotals {
  return meals.reduce<PortionTotals>(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      carbs: acc.carbs + m.carbs,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 }
  );
}
