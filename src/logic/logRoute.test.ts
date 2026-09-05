import { DISHES, dishById } from '../data/dishes';
import { routeForMatch } from './logRoute';
import { matchPair } from './matchPair';

test('a complete pair goes straight to setting the portion', () => {
  const r = routeForMatch(matchPair('egusi and eba', DISHES));
  expect(r).toEqual({ action: 'portion', soup: dishById('egusi'), swallow: dishById('eba') });
});

test('half a pair opens that dish, where the counterpart can be picked', () => {
  const r = routeForMatch(matchPair('egusi', DISHES));
  expect(r).toEqual({ action: 'dish', id: 'egusi' });
});

test('a single non-pair dish opens its detail page', () => {
  const r = routeForMatch(matchPair('jollof rice', DISHES));
  expect(r).toEqual({ action: 'dish', id: 'jollof' });
});

test('an unmatched phrase opens the library with the text carried over', () => {
  const r = routeForMatch(matchPair('spaghetti bolognese', DISHES));
  expect(r).toEqual({ action: 'search', query: 'spaghetti bolognese' });
});

test('nothing typed does nothing rather than navigating somewhere odd', () => {
  expect(routeForMatch(matchPair('', DISHES))).toEqual({ action: 'search', query: '' });
});
