export type Share = 33 | 50 | 100;

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

export type Meal = {
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
  dailyTarget: number;
  macroTargets: { carbs: number; protein: number; fat: number };
  wrapGrams: number;
  ladleMl: number;
  dericasPerPlate: number;
  householdSize: number;
  streak: number;
};

export type PortionDraft = {
  wraps: number;
  ladles: number;
  share: Share;
};
