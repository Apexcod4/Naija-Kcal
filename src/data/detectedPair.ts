import { food } from '../theme/tokens';

export type DetectedItem = {
  name: string;
  ingredients: string;
  /** Percentage, 0-100. */
  confidence: number;
  colour: string;
  category: 'soup' | 'swallow';
};

/**
 * Stubbed recognition result. The on-device model is out of scope for phase 1;
 * this is the shape it must return — one or more items with a confidence score
 * and a category, so soup and swallow can be paired automatically.
 */
export const DETECTED_PAIR: DetectedItem[] = [
  {
    name: 'Egusi soup',
    ingredients: 'Melon seed, spinach, beef, palm oil',
    confidence: 96,
    colour: food.egusi,
    category: 'soup',
  },
  {
    name: 'Pounded yam',
    ingredients: 'Pounded yam',
    confidence: 93,
    colour: food.poundedYam,
    category: 'swallow',
  },
];

export const LOW_CONFIDENCE_THRESHOLD = 70;
