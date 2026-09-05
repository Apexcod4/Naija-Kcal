import { RING, dashOffset, barHeightPct } from './rings';

test('ring geometry matches the handoff', () => {
  expect(RING.calories).toMatchObject({ size: 120, r: 50, strokeWidth: 12, circumference: 314 });
  expect(RING.macro).toMatchObject({ size: 52, r: 21, strokeWidth: 7, circumference: 132 });
});

test('an empty ring is fully offset', () => {
  expect(dashOffset(0, 2583, 314)).toBe(314);
});

test('a half-full ring is half offset', () => {
  expect(dashOffset(1000, 2000, 314)).toBeCloseTo(157, 5);
});

test('rings clamp at the target and never overrun', () => {
  expect(dashOffset(2583, 2583, 314)).toBe(0);
  expect(dashOffset(9999, 2583, 314)).toBe(0);
});

test('a zero target does not produce NaN', () => {
  expect(dashOffset(100, 0, 314)).toBe(0);
});

test('the diary bar does NOT clamp the same way — it caps at 100%', () => {
  expect(barHeightPct(1000, 2000)).toBe(50);
  expect(barHeightPct(4000, 2000)).toBe(100);
});
