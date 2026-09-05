import { colors, radii, material } from './tokens';

test('brand colours match the handoff exactly', () => {
  expect(colors.pot).toBe('#0C0D0A');
  expect(colors.potDeep).toBe('#080906');
  expect(colors.cream).toBe('#F7EDD8');
  expect(colors.muted).toBe('#8E9082');
  expect(colors.bonnet).toBe('#F24C1E');
  expect(colors.bonnetInk).toBe('#180A04');
  expect(colors.ugu).toBe('#7FA650');
  expect(colors.uguText).toBe('#A8CC78');
  expect(colors.palm).toBe('#E8A33D');
  expect(colors.sky).toBe('#6B84F2');
});

test('CTA and tab bar are full pills', () => {
  expect(radii.cta).toBe(28);
  expect(radii.tabBar).toBe(31);
});

test('glass material matches the handoff', () => {
  expect(material.glass.borderWidth).toBe(0.5);
  expect(material.glass.blurIntensity).toBe(22);
});
