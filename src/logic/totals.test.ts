import { sumMeals } from './totals';
import { SEED_MEALS } from '../data/seed';

test('sums the seeded day', () => {
  expect(sumMeals(SEED_MEALS)).toEqual({ kcal: 1157, carbs: 134, protein: 55, fat: 45 });
});

test('an empty day is all zeroes', () => {
  expect(sumMeals([])).toEqual({ kcal: 0, carbs: 0, protein: 0, fat: 0 });
});
