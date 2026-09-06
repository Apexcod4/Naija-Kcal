export type Share = 33 | 50 | 100;

export type Goal = 'lose' | 'gain' | 'maintain' | 'clinical';
export type Activity = 'low' | 'moderate' | 'high';
export type System = 'metric' | 'imperial';
export type Sex = 'male' | 'female';

export type UnitRates = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type PortionTotals = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type MacroTargets = {
  carbs: number;
  protein: number;
  fat: number;
};

export type Meal = {
  /** Local calendar date, "YYYY-MM-DD". Meals are grouped by this. */
  date: string;
  id: string;
  name: string;
  unitString: string;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  /** Placeholder swatch, used only until photoUri exists. */
  colour: string;
  photoUri?: string;
  time: string;
};

export type Profile = {
  // Collected by the onboarding funnel
  goal: Goal;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  age: number;
  activity: Activity;
  unitSystem: System;

  // Computed from the above
  dailyTarget: number;
  macroTargets: MacroTargets;

  // Calibrated units — what the portion maths multiplies by
  wrapGrams: number;
  ladleMl: number;
  dericasPerPlate: number;

  householdSize: number;
};

export type PortionDraft = {
  wraps: number;
  ladles: number;
  share: Share;
};

export type DishCategory = 'soup' | 'swallow' | 'rice' | 'street' | 'caribbean';
export type DishUnit = 'ladle' | 'wrap' | 'derica' | 'piece' | 'plate';

export type Dish = {
  id: string;
  name: string;
  category: DishCategory;
  /** The local unit this dish is measured in. */
  unit: DishUnit;
  /** Display string for the unit, e.g. "Per ladle · 180 ml". */
  unitLabel: string;
  /** Per one unit. */
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  colour: string;
  photoUri?: string;
  ingredients?: string;
  /** Dish ids commonly eaten with this one — how a pair is built by hand. */
  pairsWith?: string[];
  /**
   * True only when the kcal figure comes from the design handoff. False means
   * the number is a provisional estimate and must not be presented as fact.
   */
  verified: boolean;
};

/** A soup + swallow pair, however it was assembled. */
export type DishPair = {
  soup: Dish;
  swallow: Dish;
  /** Where the pair came from — a scan, or built by hand in the library. */
  source: 'scan' | 'library';
  /** Recognition confidence per item, present only for scans. */
  confidence?: { soup: number; swallow: number };
};
