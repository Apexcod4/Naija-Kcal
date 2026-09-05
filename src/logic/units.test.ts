import { cmToFtIn, ftInToCm, formatHeight, formatWeight, kgToLb, lbToKg } from './units';

test('converts height both ways', () => {
  expect(cmToFtIn(180)).toEqual({ ft: 5, inches: 11 });
  expect(ftInToCm(5, 11)).toBe(180);
});

test('rolls 12 inches into a foot rather than reporting 5 feet 12', () => {
  expect(cmToFtIn(183)).toEqual({ ft: 6, inches: 0 });
});

test('converts weight both ways', () => {
  expect(kgToLb(80)).toBe(176);
  expect(lbToKg(176)).toBe(80);
});

test('formats for display', () => {
  expect(formatHeight(180, 'metric')).toBe('180 cm');
  expect(formatHeight(180, 'imperial')).toBe(`5'11"`);
  expect(formatWeight(80, 'metric')).toBe('80 kg');
  expect(formatWeight(80, 'imperial')).toBe('176 lb');
});
