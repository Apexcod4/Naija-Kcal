import { computePair, stepUnit, formatUnit, barWidths, shareNote } from './portion';

describe('computePair', () => {
  test('default pair — 1 wrap, 1 ladle, all of it', () => {
    expect(computePair(1, 1, 100)).toEqual({ kcal: 610, carbs: 81, protein: 22, fat: 23 });
  });

  test('half share halves every value', () => {
    expect(computePair(1, 1, 50)).toEqual({ kcal: 305, carbs: 41, protein: 11, fat: 12 });
  });

  test('third share uses 0.33, not 1/3', () => {
    expect(computePair(1, 1, 33).kcal).toBe(201);
  });

  test('halves are supported on both units', () => {
    expect(computePair(1.5, 0.5, 100).kcal).toBe(625);
  });

  test('zero of both is zero', () => {
    expect(computePair(0, 0, 100)).toEqual({ kcal: 0, carbs: 0, protein: 0, fat: 0 });
  });
});

describe('stepUnit', () => {
  test('steps by half', () => {
    expect(stepUnit(1, 0.5)).toBe(1.5);
    expect(stepUnit(1, -0.5)).toBe(0.5);
  });

  test('clamps at 4', () => {
    expect(stepUnit(4, 0.5)).toBe(4);
  });

  test('clamps at 0', () => {
    expect(stepUnit(0, -0.5)).toBe(0);
  });
});

describe('formatUnit', () => {
  test('renders every reachable half as a vulgar fraction', () => {
    expect(formatUnit(0.5)).toBe('½');
    expect(formatUnit(1.5)).toBe('1½');
    expect(formatUnit(2.5)).toBe('2½');
    // The mock omits this case and leaks "3.5" to the UI.
    expect(formatUnit(3.5)).toBe('3½');
  });

  test('renders whole numbers plainly', () => {
    expect(formatUnit(0)).toBe('0');
    expect(formatUnit(2)).toBe('2');
    expect(formatUnit(4)).toBe('4');
  });
});

describe('barWidths', () => {
  test('derives percentage widths for the default pair', () => {
    expect(barWidths(computePair(1, 1, 100))).toEqual({ carbW: 21, protW: 11, fatW: 32 });
  });

  test('caps each bar at 100', () => {
    expect(barWidths({ kcal: 0, carbs: 900, protein: 900, fat: 900 })).toEqual({
      carbW: 100, protW: 100, fatW: 100,
    });
  });
});

describe('shareNote', () => {
  test('all-of-it is not framed as a split', () => {
    expect(shareNote(100)).toBe('Counted as your own bowl, not a split.');
  });

  test('partial shares attribute the rest to the household', () => {
    expect(shareNote(50)).toBe(
      'Split from a shared bowl — the rest goes to the household, not to you.'
    );
    expect(shareNote(33)).toBe(shareNote(50));
  });
});
