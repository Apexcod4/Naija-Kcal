export const colors = {
  pot: '#0C0D0A',
  potDeep: '#080906',
  cream: '#F7EDD8',
  muted: '#8E9082',
  bonnet: '#F24C1E',
  bonnetInk: '#180A04',
  ugu: '#7FA650',
  uguText: '#A8CC78',
  palm: '#E8A33D',
  sky: '#6B84F2',
  line: 'rgba(245,233,208,0.13)',
  plate: '#EFECE1',
  ringTrack: 'rgba(247,237,216,0.12)',
  tabInactive: 'rgba(247,237,216,0.45)',
} as const;

/**
 * Placeholder swatches standing in for photography. The handoff is explicit
 * that these must not ship — every use goes through FoodTile, which prefers a
 * photoUri when one exists.
 */
export const food = {
  egusi: '#8A5A22',
  efoRiro: '#5C7A38',
  ogbono: '#6D4B18',
  ewedu: '#3F5C24',
  banga: '#A8360F',
  jollof: '#DA5121',
  akara: '#D89C44',
  poundedYam: '#D8CDB4',
  eba: '#E4D9BE',
  fufu: '#C9BFA2',
} as const;

export const space = {
  gutter: 22,
  gutterOnboarding: 24,
  cardPad: 18,
  cardGap: 10,
  sectionGap: 24,
  rowGap: 9,
} as const;

export const radii = {
  hero: 26,
  card: 22,
  compact: 20,
  tileSm: 12,
  tileMd: 20,
  cta: 28,
  tabBar: 31,
  chip: 100,
  bar: 4,
} as const;

export const material = {
  glass: {
    backgroundColor: 'rgba(247,237,216,0.07)',
    borderColor: 'rgba(247,237,216,0.17)',
    borderWidth: 0.5,
    blurIntensity: 22,
  },
  glassLight: {
    backgroundColor: 'rgba(247,237,216,0.06)',
    borderColor: 'rgba(247,237,216,0.14)',
    borderWidth: 0.5,
    blurIntensity: 22,
  },
  glassHeavy: {
    backgroundColor: 'rgba(247,237,216,0.07)',
    borderColor: 'rgba(247,237,216,0.18)',
    borderWidth: 0.5,
    blurIntensity: 24,
  },
} as const;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Tinted status card fill + border for a semantic accent. */
export const tint = (hex: string, fill = 0.11, border = 0.3) => ({
  backgroundColor: hexToRgba(hex, fill),
  borderColor: hexToRgba(hex, border),
  borderWidth: 1,
});
