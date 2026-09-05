import { DishPair } from '../types';
import { dishById } from './dishes';

export const LOW_CONFIDENCE_THRESHOLD = 70;

/**
 * The stubbed recognition result.
 *
 * The on-device model is still out of scope; this is the shape it must
 * return. It reads from the dish table rather than duplicating nutrition,
 * so a scanned pair and a hand-built one are the same kind of object.
 */
export const SCANNED_PAIR: DishPair = {
  soup: dishById('egusi')!,
  swallow: dishById('pounded-yam')!,
  source: 'scan',
  confidence: { soup: 96, swallow: 93 },
};
