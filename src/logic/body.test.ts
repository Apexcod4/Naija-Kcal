import { ACTIVITY_MULTIPLIER, bmr, dailyTarget, macroTargets, tdee } from './body';

describe('bmr — Mifflin-St Jeor', () => {
  test('male: 10w + 6.25h - 5a + 5', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(bmr('male', 80, 180, 30)).toBe(1780);
  });

  test('female: 10w + 6.25h - 5a - 161', () => {
    // 650 + 1031.25 - 150 - 161 = 1370.25 -> 1370
    expect(bmr('female', 65, 165, 30)).toBe(1370);
  });

  test('sex changes the result by the constant offset', () => {
    expect(bmr('male', 70, 170, 30) - bmr('female', 70, 170, 30)).toBe(166);
  });
});

describe('tdee', () => {
  test('applies the activity multiplier', () => {
    expect(tdee(1780, 'low')).toBe(Math.round(1780 * ACTIVITY_MULTIPLIER.low));
  });

  test('more activity means a higher burn', () => {
    expect(tdee(1780, 'high')).toBeGreaterThan(tdee(1780, 'moderate'));
    expect(tdee(1780, 'moderate')).toBeGreaterThan(tdee(1780, 'low'));
  });
});

describe('dailyTarget', () => {
  test('losing weight subtracts a deficit', () => {
    expect(dailyTarget(2500, 'lose')).toBe(2000);
  });

  test('gaining weight adds a surplus', () => {
    expect(dailyTarget(2500, 'gain')).toBe(2800);
  });

  test('maintaining and clinical leave the number alone', () => {
    expect(dailyTarget(2500, 'maintain')).toBe(2500);
    expect(dailyTarget(2500, 'clinical')).toBe(2500);
  });

  test('never prescribes a deficit below the safety floor', () => {
    // 1600 - 500 = 1100, under the floor, so hold at maintenance.
    expect(dailyTarget(1600, 'lose')).toBe(1600);
  });
});

describe('macroTargets', () => {
  test('splits the target so it reconciles back to it', () => {
    const m = macroTargets(2583);
    const kcal = m.carbs * 4 + m.protein * 4 + m.fat * 9;
    // The mock's own 390/200/70 summed to 2990 against a 2583 target.
    expect(Math.abs(kcal - 2583)).toBeLessThanOrEqual(10);
  });

  test('scales with the target', () => {
    expect(macroTargets(3000).carbs).toBeGreaterThan(macroTargets(2000).carbs);
  });
});
