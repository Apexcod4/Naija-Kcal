import { Dish } from '../types';
import { PairMatch } from './matchPair';

export type LogRoute =
  | { action: 'portion'; soup: Dish; swallow: Dish }
  | { action: 'dish'; id: string }
  | { action: 'search'; query: string };

/**
 * Where a typed or spoken meal should land.
 *
 * Half a pair routes to that dish's detail page rather than an error, because
 * "Usually eaten with" there is already the tool for choosing the counterpart.
 */
export function routeForMatch(match: PairMatch): LogRoute {
  switch (match.kind) {
    case 'pair':
      return { action: 'portion', soup: match.soup, swallow: match.swallow };
    case 'partial':
    case 'single':
      return { action: 'dish', id: match.dish.id };
    case 'none':
      return { action: 'search', query: match.query };
  }
}
