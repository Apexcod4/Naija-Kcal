import { DISHES, dishById } from '../data/dishes';
import { dishCount, pairOptions, searchDishes, unitLadder } from './dishes';

describe('searchDishes', () => {
  test('an empty query returns everything', () => {
    expect(searchDishes(DISHES, '', 'all')).toHaveLength(DISHES.length);
  });

  test('matches on name, case-insensitively', () => {
    const r = searchDishes(DISHES, 'EGU', 'all');
    expect(r.map((d) => d.id)).toContain('egusi');
  });

  test('matches on ingredients too, so "melon" finds egusi', () => {
    const r = searchDishes(DISHES, 'melon', 'all');
    expect(r.map((d) => d.id)).toContain('egusi');
  });

  test('filters by category', () => {
    const soups = searchDishes(DISHES, '', 'soup');
    expect(soups.length).toBeGreaterThan(0);
    expect(soups.every((d) => d.category === 'soup')).toBe(true);
  });

  test('combines query and category', () => {
    // "eba" appears in swallow; asking for soups must not return it.
    const r = searchDishes(DISHES, 'eba', 'soup');
    expect(r.map((d) => d.id)).not.toContain('eba');
  });

  test('an unmatched query returns nothing rather than everything', () => {
    expect(searchDishes(DISHES, 'zzzzz', 'all')).toHaveLength(0);
  });

  test('ignores surrounding whitespace', () => {
    expect(searchDishes(DISHES, '  banga  ', 'all').map((d) => d.id)).toContain('banga');
  });
});

describe('dishCount', () => {
  test('reports the real size of the table, not a hardcoded 340', () => {
    expect(dishCount(DISHES)).toBe(DISHES.length);
  });
});

describe('unitLadder', () => {
  test('matches the design: 1 ladle 290, 1.5 ladle 435, full bowl 870', () => {
    const egusi = dishById('egusi')!;
    const ladder = unitLadder(egusi);
    expect(ladder.map((s) => s.kcal)).toEqual([290, 435, 870]);
  });

  test('labels the steps in the dish own unit', () => {
    const egusi = dishById('egusi')!;
    expect(unitLadder(egusi).map((s) => s.label)).toEqual([
      '1 ladle',
      '1½ ladle',
      'Full bowl',
    ]);
  });

  test('a swallow ladder is expressed in wraps', () => {
    const eba = dishById('eba')!;
    expect(unitLadder(eba)[0].label).toBe('1 wrap');
  });
});

describe('pairOptions', () => {
  test('resolves the ids a dish is usually eaten with', () => {
    const egusi = dishById('egusi')!;
    expect(pairOptions(egusi, DISHES).map((d) => d.id)).toEqual([
      'pounded-yam',
      'eba',
      'fufu',
    ]);
  });

  test('a dish with no pairings returns an empty list', () => {
    const jollof = dishById('jollof')!;
    expect(pairOptions(jollof, DISHES)).toEqual([]);
  });
});
