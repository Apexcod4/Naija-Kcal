import { LADLES_PER_BOWL } from '../data/dishes';
import { Dish, DishCategory } from '../types';

export type CategoryFilter = DishCategory | 'all';

/**
 * Offline search over the on-device table. Matches name and ingredients so a
 * user who knows what is in a soup but not its name can still find it.
 */
export function searchDishes(
  dishes: Dish[],
  query: string,
  category: CategoryFilter
): Dish[] {
  const q = query.trim().toLowerCase();

  return dishes.filter((d) => {
    if (category !== 'all' && d.category !== category) return false;
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      (d.ingredients?.toLowerCase().includes(q) ?? false)
    );
  });
}

/**
 * The real size of the table. The search placeholder reads from this rather
 * than the design's hardcoded "340", so the app never claims a catalogue it
 * does not ship.
 */
export const dishCount = (dishes: Dish[]): number => dishes.length;

export type UnitStep = { label: string; multiplier: number; kcal: number };

/**
 * Per-unit truth for one dish: one unit, one and a half, and a full bowl.
 * The design's egusi ladder (290 / 435 / 870) is exactly 1x / 1.5x / 3x.
 */
export function unitLadder(dish: Dish): UnitStep[] {
  return [
    { label: `1 ${dish.unit}`, multiplier: 1, kcal: Math.round(dish.kcal) },
    { label: `1½ ${dish.unit}`, multiplier: 1.5, kcal: Math.round(dish.kcal * 1.5) },
    {
      label: 'Full bowl',
      multiplier: LADLES_PER_BOWL,
      kcal: Math.round(dish.kcal * LADLES_PER_BOWL),
    },
  ];
}

/** Resolve the dishes this one is usually eaten with — how a pair is built. */
export function pairOptions(dish: Dish, dishes: Dish[]): Dish[] {
  if (!dish.pairsWith?.length) return [];
  return dish.pairsWith
    .map((id) => dishes.find((d) => d.id === id))
    .filter((d): d is Dish => d !== undefined);
}
