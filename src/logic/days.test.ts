import { Meal } from '../types';
import {
  addDays,
  currentStreak,
  dayLabel,
  mealsForDate,
  toISODate,
  weekOf,
} from './days';

const meal = (id: string, date: string, kcal = 100): Meal => ({
  id,
  date,
  name: 'Egusi & eba',
  unitString: '1 wrap · 1 ladle · all of it · 19:05',
  kcal,
  carbs: 10,
  protein: 10,
  fat: 10,
  colour: '#8A5A22',
  time: '19:05',
});

describe('toISODate', () => {
  test('formats a local date, not a UTC one', () => {
    // Month is zero-based: 8 is September. A UTC-based conversion would
    // shift this by a day for anyone west of Greenwich.
    expect(toISODate(new Date(2026, 8, 6, 23, 30))).toBe('2026-09-06');
  });

  test('pads single-digit months and days', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDays', () => {
  test('moves forward and back', () => {
    expect(addDays('2026-09-06', 1)).toBe('2026-09-07');
    expect(addDays('2026-09-06', -1)).toBe('2026-09-05');
  });

  test('crosses a month boundary', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
  });

  test('crosses a year boundary', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('dayLabel', () => {
  const today = '2026-09-06';

  test('names today and yesterday rather than dating them', () => {
    expect(dayLabel(today, today)).toBe('Today');
    expect(dayLabel('2026-09-05', today)).toBe('Yesterday');
  });

  test('dates anything older', () => {
    expect(dayLabel('2026-09-01', today)).toBe('Tue 1 Sep');
  });
});

describe('mealsForDate', () => {
  const meals = [meal('a', '2026-09-06'), meal('b', '2026-09-05'), meal('c', '2026-09-06')];

  test('returns only that day', () => {
    expect(mealsForDate(meals, '2026-09-06').map((m) => m.id)).toEqual(['a', 'c']);
  });

  test('an unlogged day is empty, not everything', () => {
    expect(mealsForDate(meals, '2026-01-01')).toEqual([]);
  });
});

describe('weekOf', () => {
  test('returns Monday through Sunday containing the date', () => {
    // 2026-09-06 is a Sunday, so its week starts Monday the 31st of August.
    expect(weekOf('2026-09-06')).toEqual([
      '2026-08-31', '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-04', '2026-09-05', '2026-09-06',
    ]);
  });

  test('a Monday is the first day of its own week', () => {
    expect(weekOf('2026-09-07')[0]).toBe('2026-09-07');
  });
});

describe('currentStreak', () => {
  const today = '2026-09-06';

  test('counts consecutive logged days ending today', () => {
    const meals = [meal('a', '2026-09-06'), meal('b', '2026-09-05'), meal('c', '2026-09-04')];
    expect(currentStreak(meals, today)).toBe(3);
  });

  test('a gap ends the streak', () => {
    const meals = [meal('a', '2026-09-06'), meal('b', '2026-09-04')];
    expect(currentStreak(meals, today)).toBe(1);
  });

  test('today being unlogged does not break a run yet', () => {
    // You have not missed a day until the day is over.
    const meals = [meal('a', '2026-09-05'), meal('b', '2026-09-04')];
    expect(currentStreak(meals, today)).toBe(2);
  });

  test('an empty log has no streak', () => {
    expect(currentStreak([], today)).toBe(0);
  });

  test('two days of silence ends it', () => {
    expect(currentStreak([meal('a', '2026-09-03')], today)).toBe(0);
  });
});
