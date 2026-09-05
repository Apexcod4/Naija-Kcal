import { food } from '../theme/tokens';
import { Meal, Profile } from '../types';

export const SEED_MEALS: Meal[] = [
  {
    id: 'seed-akara',
    name: 'Akara & pap',
    unitString: '3 balls · 1 cup · 08:15',
    kcal: 310, carbs: 38, protein: 11, fat: 14,
    colour: food.akara,
    time: '08:15',
  },
  {
    id: 'seed-jollof',
    name: 'Jollof rice, chicken',
    unitString: '1.5 derica · 12:40',
    kcal: 847, carbs: 96, protein: 44, fat: 31,
    colour: food.jollof,
    time: '12:40',
  },
];

/**
 * Stands in for the onboarding funnel, which is out of scope for phase 1.
 * Every value here is user data in the shipping app, not a constant.
 */
export const DEFAULT_PROFILE: Profile = {
  dailyTarget: 2583,
  macroTargets: { carbs: 390, protein: 200, fat: 70 },
  wrapGrams: 210,
  ladleMl: 180,
  dericasPerPlate: 1.5,
  householdSize: 4,
  streak: 7,
};
