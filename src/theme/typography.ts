import { TextStyle } from 'react-native';
import { colors } from './tokens';

/**
 * React Native resolves a custom face by family name, not by fontWeight, so
 * each weight is its own family. These keys must match the names registered
 * in src/theme/useFonts.ts.
 */
export const fonts = {
  display: 'Archivo_900',
  displayBold: 'Archivo_800',
  ui400: 'Inter_400Regular',
  ui500: 'Inter_500Medium',
  ui600: 'Inter_600SemiBold',
  ui700: 'Inter_700Bold',
  ui800: 'Inter_800ExtraBold',
} as const;

export const type = {
  hero: {
    fontFamily: fonts.display, fontSize: 60, letterSpacing: -2.3, lineHeight: 57, color: colors.cream,
  },
  screenTitle: {
    fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, lineHeight: 34, color: colors.cream,
  },
  detectTitle: {
    fontFamily: fonts.display, fontSize: 30, letterSpacing: -1, lineHeight: 34, color: colors.cream,
  },
  sectionTitle: {
    fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.4, color: colors.cream,
  },
  appName: {
    fontFamily: fonts.display, fontSize: 25, letterSpacing: -0.7, color: colors.cream,
  },
  ringValue: {
    fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.8, color: colors.cream,
  },
  metric: {
    fontFamily: fonts.display, fontSize: 16, color: colors.cream,
  },
  ctaLabel: {
    fontFamily: fonts.displayBold, fontSize: 17, color: colors.bonnetInk,
  },
  eyebrow: {
    fontFamily: fonts.ui700, fontSize: 11, letterSpacing: 1.8,
    textTransform: 'uppercase', color: colors.muted,
  },
  body: {
    fontFamily: fonts.ui500, fontSize: 14.5, lineHeight: 21, color: colors.muted,
  },
  // The handoff specifies Inter 650 here. No static face ships at 650, so this
  // uses 600. See docs/design-questions.md.
  rowTitle: {
    fontFamily: fonts.ui600, fontSize: 14.5, letterSpacing: -0.2, color: colors.cream,
  },
  rowMeta: {
    fontFamily: fonts.ui500, fontSize: 11.5, color: colors.muted,
  },
  chip: {
    fontFamily: fonts.ui700, fontSize: 12, color: colors.cream,
  },
  tabLabel: {
    fontFamily: fonts.ui600, fontSize: 10, color: colors.muted,
  },
} satisfies Record<string, TextStyle>;
