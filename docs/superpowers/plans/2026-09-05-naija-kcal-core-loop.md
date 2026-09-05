# Naija Kcal Core Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Naija Kcal 1a core loop — Home/Today, Diary, You, Scan, Detect and Portion — as a running Expo app whose pair-portion maths is verified by tests.

**Architecture:** A pure, React-free logic layer (`src/logic/`) holds the portion and ring maths and is built test-first against exact expected values from the spec. A zustand store holds meals, profile and the portion draft; every total is derived, never stored. Navigation is owned by expo-router: a tab group with a custom floating glass pill, and Scan/Detect/Portion pushed above it as a full-screen stack.

**Tech Stack:** Expo SDK 57, React Native (new architecture), TypeScript, expo-router 57, zustand 5, react-native-svg 15, expo-blur, expo-camera, expo-font, react-native-reanimated 4 (+ react-native-worklets), jest via `jest-expo`, `@testing-library/react-native`.

**Spec:** `docs/superpowers/specs/2026-09-05-naija-kcal-core-loop-design.md`

**Design source:** `design/HANDOFF.md` is the authority on tokens and copy. `design/Naija Kcal Redesign.dc.html` option `#1a` holds exact constants in the `class Component extends DCLogic` block at the end of the file.

## Global Constraints

- **Host limits.** Development is on Windows; there is no Xcode. `npm test`, `npx tsc --noEmit` and `npx expo start` work locally. iOS simulator, real-device rendering and camera behaviour **cannot** be verified here. Never claim a task is verified on iOS. Device preview is Expo Go; a real iOS build needs a Mac or EAS.
- **Install dependencies with `npx expo install <pkg>`**, never bare `npm install <pkg>`, so versions match the SDK.
- **Colour tokens are exact.** `pot #0C0D0A`, `pot-deep #080906`, `cream #F7EDD8`, `muted #8E9082`, `bonnet #F24C1E`, `bonnet-ink #180A04`, `ugu #7FA650`, `ugu-text #A8CC78`, `palm #E8A33D`, `sky #6B84F2`, `line rgba(245,233,208,.13)`.
- **Never hardcode a colour, radius or font size in a component.** Import from `src/theme/tokens.ts`.
- **Food images are placeholders and must not ship.** Every food swatch goes through `FoodTile`, which takes `photoUri` and falls back to `colour`.
- **Minimum tap target 44px.** The mock's 34px steppers and 38px back buttons fail this; expand with `hitSlop`, never by changing visual size.
- **Copy is final** — take strings verbatim from `design/HANDOFF.md`. Do not paraphrase.
- **No debounce on the portion result.** The number moving in response to the tap is the interaction.
- **Undesigned states** (low-confidence, dish-not-found, camera-denied, empty-today, over-target, sync-pending, purchase-failure, single-item-detected) get structure but their copy stays a marked `TODO(design)` — the handoff says to flag rather than guess.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/theme/tokens.ts` | Colour, spacing, radii, material constants. No logic. |
| `src/theme/typography.ts` | Named type roles mapping to Archivo/Inter families, sizes, weights, tracking. |
| `src/logic/portion.ts` | Pure pair maths, clamping, fraction formatting, bar widths, share note. |
| `src/logic/rings.ts` | Pure dashoffset + ring geometry constants. |
| `src/logic/totals.ts` | Pure summation of a `Meal[]` into consumed kcal/macros. |
| `src/types.ts` | `Meal`, `Profile`, `Share`, `PortionDraft`. |
| `src/data/seed.ts` | Seeded meals + default profile. Data only. |
| `src/state/useAppStore.ts` | zustand store: meals, profile, draft, toast. Thin — delegates maths to `src/logic/`. |
| `src/components/*` | Presentational primitives. No store access; props only. |
| `app/*` | Routes. Compose components, read the store, own navigation. |

---

## Task 1: Project scaffold and test harness

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `jest.config.js`, `.gitignore`, `app/_layout.tsx`, `app/index.tsx`, `src/logic/smoke.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: a working `npm test` and `npx tsc --noEmit`; expo-router mounted with `app/` as the route root

- [ ] **Step 1: Scaffold Expo into the existing directory**

The project root already contains `design/` and `docs/`, so `create-expo-app` cannot target it directly. Scaffold to a temp dir and copy in:

```bash
npx --yes create-expo-app@latest .scaffold --template blank-typescript
rm -rf .scaffold/node_modules
cp -r .scaffold/. .
rm -rf .scaffold
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
npx expo install react-native-svg expo-blur expo-camera expo-font expo-haptics
npx expo install react-native-reanimated react-native-worklets
npm install zustand
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install --save-dev jest jest-expo @testing-library/react-native @types/jest @types/react typescript
```

- [ ] **Step 4: Point the entrypoint at expo-router**

In `package.json`, set `"main": "expo-router/entry"` and add scripts:

```json
{
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "test": "jest",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 5: Configure babel**

Reanimated 4 moved its babel plugin to `react-native-worklets`. Create `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

The worklets plugin must be **last** in the plugin list.

- [ ] **Step 6: Configure jest**

Create `jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
};
```

- [ ] **Step 7: Enable the router plugin and typed routes**

In `app.json`, under `expo`, add `"plugins": ["expo-router"]` and `"scheme": "naijakcal"`. Under `expo.experiments`, add `"typedRoutes": true`. Set `"newArchEnabled": true`.

- [ ] **Step 8: Write a smoke test that fails**

Create `src/logic/smoke.test.ts`:

```ts
import { appName } from './smoke';

test('scaffold is wired up', () => {
  expect(appName()).toBe('Naija Kcal');
});
```

- [ ] **Step 9: Run it to confirm it fails**

Run: `npm test -- smoke`
Expected: FAIL — cannot resolve `./smoke`.

- [ ] **Step 10: Add the minimal module**

Create `src/logic/smoke.ts`:

```ts
export const appName = (): string => 'Naija Kcal';
```

- [ ] **Step 11: Add a placeholder route so the app boots**

Create `app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

Create `app/index.tsx`:

```tsx
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Naija Kcal</Text>
    </View>
  );
}
```

- [ ] **Step 12: Verify the harness**

Run: `npm test && npx tsc --noEmit`
Expected: test PASSES, typecheck reports no errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold Expo + expo-router + jest harness"
```

---

## Task 2: Design tokens and typography

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/typography.ts`, `src/theme/tokens.test.ts`
- Delete: `src/logic/smoke.ts`, `src/logic/smoke.test.ts`

**Interfaces:**
- Produces: `colors`, `space`, `radii`, `material`, `type` — imported by every component from here on.

- [ ] **Step 1: Write the failing test**

Tokens are constants, so the test guards against transcription drift from the handoff — the most likely error in this file.

Create `src/theme/tokens.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- tokens`
Expected: FAIL — cannot resolve `./tokens`.

- [ ] **Step 3: Write the tokens**

Create `src/theme/tokens.ts`:

```ts
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

/** Tinted status card fill + border for a semantic accent. */
export const tint = (hex: string, fill = 0.11, border = 0.3) => ({
  backgroundColor: hexToRgba(hex, fill),
  borderColor: hexToRgba(hex, border),
  borderWidth: 1,
});

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- tokens`
Expected: PASS.

- [ ] **Step 5: Add the typography roles**

Create `src/theme/typography.ts`. `display` is Archivo, `ui` is Inter:

```ts
import { TextStyle } from 'react-native';
import { colors } from './tokens';

export const fonts = {
  display: 'Archivo_900',
  displayBold: 'Archivo_800',
  ui: 'Inter',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 60, letterSpacing: -2.3, lineHeight: 57, color: colors.cream },
  screenTitle: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -0.9, lineHeight: 34, color: colors.cream },
  detectTitle: { fontFamily: fonts.display, fontSize: 30, letterSpacing: -1, lineHeight: 34, color: colors.cream },
  sectionTitle: { fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.4, color: colors.cream },
  appName: { fontFamily: fonts.display, fontSize: 25, letterSpacing: -0.7, color: colors.cream },
  ringValue: { fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.8, color: colors.cream },
  metric: { fontFamily: fonts.display, fontSize: 16, color: colors.cream },
  ctaLabel: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.bonnetInk },
  eyebrow: { fontFamily: fonts.ui, fontWeight: '700', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.muted },
  body: { fontFamily: fonts.ui, fontWeight: '500', fontSize: 14.5, lineHeight: 21, color: colors.muted },
  rowTitle: { fontFamily: fonts.ui, fontWeight: '600', fontSize: 14.5, letterSpacing: -0.2, color: colors.cream },
  rowMeta: { fontFamily: fonts.ui, fontWeight: '500', fontSize: 11.5, color: colors.muted },
  chip: { fontFamily: fonts.ui, fontWeight: '700', fontSize: 12, color: colors.cream },
  tabLabel: { fontFamily: fonts.ui, fontWeight: '600', fontSize: 10 },
} satisfies Record<string, TextStyle>;
```

- [ ] **Step 6: Remove the smoke module**

```bash
rm src/logic/smoke.ts src/logic/smoke.test.ts
```

- [ ] **Step 7: Verify**

Run: `npm test && npx tsc --noEmit`
Expected: tokens test PASSES, typecheck clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add design tokens and typography roles"
```

---

## Task 3: Pure portion maths

This is the heart of the product. The handoff says "implement exactly" and supplies exact outputs.

**Files:**
- Create: `src/types.ts`, `src/logic/portion.ts`, `src/logic/portion.test.ts`

**Interfaces:**
- Produces:
  - `type Share = 33 | 50 | 100`
  - `type UnitRates = { kcal: number; carbs: number; protein: number; fat: number }`
  - `type PortionTotals = { kcal: number; carbs: number; protein: number; fat: number }`
  - `computePair(wraps: number, ladles: number, share: Share, rates?: { swallow: UnitRates; ladle: UnitRates }): PortionTotals`
  - `stepUnit(current: number, delta: number): number`
  - `formatUnit(n: number): string`
  - `barWidths(t: PortionTotals): { carbW: number; protW: number; fatW: number }`
  - `shareNote(share: Share): string`
  - `DEFAULT_RATES`

- [ ] **Step 1: Write the failing tests**

Create `src/logic/portion.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- portion`
Expected: FAIL — cannot resolve `./portion`.

- [ ] **Step 3: Add the shared types**

Create `src/types.ts`:

```ts
export type Share = 33 | 50 | 100;

export type UnitRates = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type PortionTotals = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

export type Meal = {
  id: string;
  name: string;
  unitString: string;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  colour: string;
  photoUri?: string;
  time: string;
};

export type Profile = {
  dailyTarget: number;
  macroTargets: { carbs: number; protein: number; fat: number };
  wrapGrams: number;
  ladleMl: number;
  dericasPerPlate: number;
  householdSize: number;
  streak: number;
};

export type PortionDraft = {
  wraps: number;
  ladles: number;
  share: Share;
};
```

- [ ] **Step 4: Implement the maths**

Create `src/logic/portion.ts`:

```ts
import { PortionTotals, Share, UnitRates } from '../types';

export const STEP = 0.5;
export const MIN_UNITS = 0;
export const MAX_UNITS = 4;

/**
 * Per-unit rates. These are user profile data sourced from onboarding
 * calibration, not constants — the defaults below are the handoff's values
 * for a 210 g wrap and a 180 ml ladle.
 */
export const DEFAULT_RATES: { swallow: UnitRates; ladle: UnitRates } = {
  swallow: { kcal: 320, carbs: 72, protein: 4, fat: 1 },
  ladle: { kcal: 290, carbs: 9, protein: 18, fat: 22 },
};

export function computePair(
  wraps: number,
  ladles: number,
  share: Share,
  rates: { swallow: UnitRates; ladle: UnitRates } = DEFAULT_RATES
): PortionTotals {
  const m = share / 100;
  const at = (key: keyof UnitRates) =>
    Math.round((wraps * rates.swallow[key] + ladles * rates.ladle[key]) * m);

  return {
    kcal: at('kcal'),
    carbs: at('carbs'),
    protein: at('protein'),
    fat: at('fat'),
  };
}

/** Step a unit count by delta, clamped to the 0..4 range. */
export function stepUnit(current: number, delta: number): number {
  const next = current + delta;
  if (next < MIN_UNITS) return MIN_UNITS;
  if (next > MAX_UNITS) return MAX_UNITS;
  return next;
}

/**
 * Render a unit count using vulgar fractions. Covers every half reachable in
 * the 0..4 range — the mock only handled 0.5/1.5/2.5 and leaked "3.5".
 */
export function formatUnit(n: number): string {
  const whole = Math.floor(n);
  const isHalf = n - whole === 0.5;
  if (!isHalf) return String(n);
  return whole === 0 ? '½' : `${whole}½`;
}

/** Percentage widths for the three macro mini-bars on the result card. */
export function barWidths(t: PortionTotals) {
  return {
    carbW: Math.min(100, Math.round(t.carbs / 3.9)),
    protW: Math.min(100, Math.round(t.protein / 2)),
    fatW: Math.min(100, Math.round(t.fat * 1.4)),
  };
}

export function shareNote(share: Share): string {
  return share === 100
    ? 'Counted as your own bowl, not a split.'
    : 'Split from a shared bowl — the rest goes to the household, not to you.';
}

/** Human label for a share, used in the logged meal's unit string. */
export function shareLabel(share: Share): string {
  if (share === 100) return 'all of it';
  if (share === 50) return '½ of the bowl';
  return '⅓ of the bowl';
}
```

- [ ] **Step 5: Run to verify they pass**

Run: `npm test -- portion`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/logic/portion.ts src/logic/portion.test.ts
git commit -m "feat: add pure pair-portion maths with exact spec coverage"
```

---

## Task 4: Pure ring maths and daily totals

**Files:**
- Create: `src/logic/rings.ts`, `src/logic/rings.test.ts`, `src/logic/totals.ts`, `src/logic/totals.test.ts`

**Interfaces:**
- Consumes: `Meal`, `PortionTotals` from `src/types.ts`
- Produces:
  - `RING = { calories: {...}, macro: {...} }` with `size`, `r`, `strokeWidth`, `circumference`
  - `dashOffset(value: number, target: number, circumference: number): number`
  - `barHeightPct(value: number, target: number): number`
  - `sumMeals(meals: Meal[]): PortionTotals`

- [ ] **Step 1: Write the failing ring tests**

Create `src/logic/rings.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- rings`
Expected: FAIL — cannot resolve `./rings`.

- [ ] **Step 3: Implement**

Create `src/logic/rings.ts`:

```ts
export const RING = {
  calories: { size: 120, r: 50, strokeWidth: 12, circumference: 314 },
  macro: { size: 52, r: 21, strokeWidth: 7, circumference: 132 },
} as const;

/**
 * SVG stroke-dashoffset for a progress ring.
 * Rings clamp at their target — they do not overrun.
 */
export function dashOffset(value: number, target: number, circumference: number): number {
  if (target <= 0) return 0;
  const ratio = Math.min(1, value / target);
  return Math.max(0, circumference - circumference * ratio);
}

/**
 * Diary bar height as a percentage. Unlike the rings, over-target days are
 * meaningful here — the bar caps at 100% and is recoloured by the caller.
 */
export function barHeightPct(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test -- rings`
Expected: all PASS.

- [ ] **Step 5: Write the failing totals test**

Create `src/logic/totals.test.ts`:

```ts
import { sumMeals } from './totals';
import { SEED_MEALS } from '../data/seed';

test('sums the seeded day', () => {
  expect(sumMeals(SEED_MEALS)).toEqual({ kcal: 1157, carbs: 134, protein: 55, fat: 45 });
});

test('an empty day is all zeroes', () => {
  expect(sumMeals([])).toEqual({ kcal: 0, carbs: 0, protein: 0, fat: 0 });
});
```

- [ ] **Step 6: Run to verify it fails**

Run: `npm test -- totals`
Expected: FAIL — cannot resolve `./totals` or `../data/seed`.

- [ ] **Step 7: Add the seed data**

Create `src/data/seed.ts`:

```ts
import { food } from '../theme/tokens';
import { Meal, Profile } from '../types';

export const SEED_MEALS: Meal[] = [
  {
    id: 'seed-akara',
    name: 'Akara & pap',
    unitString: '3 balls · 1 cup · 08:15',
    kcal: 310, carbs: 38, protein: 11, fat: 14,
    colour: food.akara,
    time: '08:15',
  },
  {
    id: 'seed-jollof',
    name: 'Jollof rice, chicken',
    unitString: '1.5 derica · 12:40',
    kcal: 847, carbs: 96, protein: 44, fat: 31,
    colour: food.jollof,
    time: '12:40',
  },
];

export const DEFAULT_PROFILE: Profile = {
  dailyTarget: 2583,
  macroTargets: { carbs: 390, protein: 200, fat: 70 },
  wrapGrams: 210,
  ladleMl: 180,
  dericasPerPlate: 1.5,
  householdSize: 4,
  streak: 7,
};
```

- [ ] **Step 8: Implement the summation**

Create `src/logic/totals.ts`:

```ts
import { Meal, PortionTotals } from '../types';

export function sumMeals(meals: Meal[]): PortionTotals {
  return meals.reduce<PortionTotals>(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      carbs: acc.carbs + m.carbs,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 }
  );
}
```

- [ ] **Step 9: Run to verify it passes**

Run: `npm test`
Expected: all suites PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add ring maths, daily totals and seed data"
```

---

## Task 5: App store

**Files:**
- Create: `src/state/useAppStore.ts`, `src/state/useAppStore.test.ts`

**Interfaces:**
- Consumes: `computePair`, `formatUnit`, `shareLabel` from `src/logic/portion.ts`; `SEED_MEALS`, `DEFAULT_PROFILE` from `src/data/seed.ts`
- Produces: `useAppStore` with state `{ profile, meals, draft, toast }` and actions `setWraps`, `setLadles`, `setShare`, `resetDraft`, `logPair`, `hideToast`; plus selector `selectSharePromptVisible`

- [ ] **Step 1: Write the failing tests**

Create `src/state/useAppStore.test.ts`:

```ts
import { useAppStore } from './useAppStore';

const reset = () => useAppStore.getState().resetAll();

beforeEach(reset);

test('starts with the two seeded meals', () => {
  expect(useAppStore.getState().meals).toHaveLength(2);
});

test('logging APPENDS a meal rather than replacing it', () => {
  useAppStore.getState().logPair();
  useAppStore.getState().logPair();
  // The mock kept a single `extra` slot, so a second log overwrote the first.
  expect(useAppStore.getState().meals).toHaveLength(4);
});

test('the logged meal carries the computed totals', () => {
  useAppStore.getState().logPair();
  const last = useAppStore.getState().meals.at(-1)!;
  expect(last.kcal).toBe(610);
  expect(last.carbs).toBe(81);
});

test('the unit string names BOTH halves of the pair', () => {
  useAppStore.getState().setWraps(1.5);
  useAppStore.getState().setLadles(0.5);
  useAppStore.getState().logPair();
  const last = useAppStore.getState().meals.at(-1)!;
  // The mock interpolated only wraps, dropping the soup from a pair logger.
  expect(last.unitString).toContain('1½ wrap');
  expect(last.unitString).toContain('½ ladle');
});

test('steppers clamp through the store', () => {
  const { setWraps } = useAppStore.getState();
  setWraps(4);
  setWraps(4.5);
  expect(useAppStore.getState().draft.wraps).toBe(4);
});

test('logging raises a toast naming the amount', () => {
  useAppStore.getState().logPair();
  expect(useAppStore.getState().toast?.message).toBe(
    'Logged 610 kcal — you have room for fruit tonight.'
  );
});

test('logging resets the draft for the next meal', () => {
  useAppStore.getState().setWraps(3);
  useAppStore.getState().logPair();
  expect(useAppStore.getState().draft.wraps).toBe(1);
});

test('the share prompt is hidden for a household of one', () => {
  useAppStore.getState().setHouseholdSize(1);
  expect(useAppStore.getState().sharePromptVisible()).toBe(false);
  useAppStore.getState().setHouseholdSize(4);
  expect(useAppStore.getState().sharePromptVisible()).toBe(true);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- useAppStore`
Expected: FAIL — cannot resolve `./useAppStore`.

- [ ] **Step 3: Implement the store**

Create `src/state/useAppStore.ts`:

```ts
import { create } from 'zustand';
import { computePair, formatUnit, shareLabel, stepUnit } from '../logic/portion';
import { DEFAULT_PROFILE, SEED_MEALS } from '../data/seed';
import { food } from '../theme/tokens';
import { Meal, PortionDraft, Profile, Share } from '../types';

const INITIAL_DRAFT: PortionDraft = { wraps: 1, ladles: 1, share: 100 };

type Toast = { message: string } | null;

type AppState = {
  profile: Profile;
  meals: Meal[];
  draft: PortionDraft;
  toast: Toast;

  setWraps: (n: number) => void;
  setLadles: (n: number) => void;
  stepWraps: (delta: number) => void;
  stepLadles: (delta: number) => void;
  setShare: (s: Share) => void;
  setHouseholdSize: (n: number) => void;
  resetDraft: () => void;
  logPair: () => void;
  hideToast: () => void;
  resetAll: () => void;
  sharePromptVisible: () => boolean;
};

const clamp = (n: number) => stepUnit(n, 0);

export const useAppStore = create<AppState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  meals: SEED_MEALS,
  draft: INITIAL_DRAFT,
  toast: null,

  setWraps: (n) => set((s) => ({ draft: { ...s.draft, wraps: clamp(n) } })),
  setLadles: (n) => set((s) => ({ draft: { ...s.draft, ladles: clamp(n) } })),
  stepWraps: (d) => set((s) => ({ draft: { ...s.draft, wraps: stepUnit(s.draft.wraps, d) } })),
  stepLadles: (d) => set((s) => ({ draft: { ...s.draft, ladles: stepUnit(s.draft.ladles, d) } })),
  setShare: (share) => set((s) => ({ draft: { ...s.draft, share } })),

  setHouseholdSize: (n) => set((s) => ({ profile: { ...s.profile, householdSize: n } })),

  resetDraft: () => set({ draft: INITIAL_DRAFT }),

  sharePromptVisible: () => get().profile.householdSize > 1,

  logPair: () => {
    const { draft, meals } = get();
    const totals = computePair(draft.wraps, draft.ladles, draft.share);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Both halves of the pair are named. The mock dropped the ladle count.
    const unitString =
      `${formatUnit(draft.wraps)} wrap · ${formatUnit(draft.ladles)} ladle · ` +
      `${shareLabel(draft.share)} · ${time}`;

    const meal: Meal = {
      id: `meal-${now.getTime()}`,
      name: 'Egusi & pounded yam',
      unitString,
      ...totals,
      colour: food.egusi,
      time,
    };

    set({
      meals: [...meals, meal],
      draft: INITIAL_DRAFT,
      toast: {
        message: `Logged ${totals.kcal} kcal — you have room for fruit tonight.`,
      },
    });
  },

  hideToast: () => set({ toast: null }),

  resetAll: () => set({ profile: DEFAULT_PROFILE, meals: SEED_MEALS, draft: INITIAL_DRAFT, toast: null }),
}));
```

Note: the toast **timer lives in the `Toast` component**, not the store — a store should not own a `setTimeout` it cannot clean up on unmount.

- [ ] **Step 4: Run to verify they pass**

Run: `npm test -- useAppStore`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/state/
git commit -m "feat: add app store with appending meal log"
```

---

## Task 6: Surface primitives — GlassCard, Bloom, ScrollFade, FoodTile

**Files:**
- Create: `src/components/GlassCard.tsx`, `src/components/Bloom.tsx`, `src/components/ScrollFade.tsx`, `src/components/FoodTile.tsx`, `src/components/FoodTile.test.tsx`

**Interfaces:**
- Produces:
  - `<GlassCard variant?: 'glass' | 'light' | 'heavy' radius?: number style? children />`
  - `<Bloom size?: number opacity?: number style? />`
  - `<ScrollFade height?: number />`
  - `<FoodTile colour: string photoUri?: string size?: number plate?: boolean />`

- [ ] **Step 1: Write the failing FoodTile test**

`FoodTile` is the photo seam the handoff insists on, so its fallback behaviour is worth locking down.

Create `src/components/FoodTile.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import FoodTile from './FoodTile';

test('falls back to the placeholder colour when there is no photo', () => {
  const { getByTestId, queryByTestId } = render(<FoodTile colour="#8A5A22" />);
  expect(getByTestId('food-swatch')).toBeTruthy();
  expect(queryByTestId('food-photo')).toBeNull();
});

test('renders the photo when one is supplied', () => {
  const { getByTestId, queryByTestId } = render(
    <FoodTile colour="#8A5A22" photoUri="file:///meal.jpg" />
  );
  expect(getByTestId('food-photo')).toBeTruthy();
  expect(queryByTestId('food-swatch')).toBeNull();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- FoodTile`
Expected: FAIL — cannot resolve `./FoodTile`.

- [ ] **Step 3: Implement FoodTile**

Create `src/components/FoodTile.tsx`:

```tsx
import { Image, View } from 'react-native';
import { colors, radii } from '../theme/tokens';

type Props = {
  colour: string;
  photoUri?: string;
  size?: number;
  /** Wrap the swatch in the enamel plate square used by meal rows. */
  plate?: boolean;
};

export default function FoodTile({ colour, photoUri, size = 46, plate = true }: Props) {
  const inner = size * 0.7;

  const content = photoUri ? (
    <Image
      testID="food-photo"
      source={{ uri: photoUri }}
      style={{ width: plate ? inner : size, height: plate ? inner : size, borderRadius: plate ? inner / 2 : radii.tileSm }}
    />
  ) : (
    <View
      testID="food-swatch"
      style={{
        width: plate ? inner : size,
        height: plate ? inner : size,
        borderRadius: plate ? inner / 2 : radii.tileSm,
        backgroundColor: colour,
      }}
    />
  );

  if (!plate) return content;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radii.tileSm + 3,
        backgroundColor: colors.plate,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {content}
    </View>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- FoodTile`
Expected: PASS.

- [ ] **Step 5: Implement GlassCard**

Create `src/components/GlassCard.tsx`:

```tsx
import { BlurView } from 'expo-blur';
import { StyleProp, View, ViewStyle } from 'react-native';
import { material, radii } from '../theme/tokens';

type Props = {
  variant?: 'glass' | 'light' | 'heavy';
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const VARIANTS = {
  glass: material.glass,
  light: material.glassLight,
  heavy: material.glassHeavy,
} as const;

export default function GlassCard({ variant = 'glass', radius = radii.card, style, children }: Props) {
  const m = VARIANTS[variant];
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <BlurView intensity={m.blurIntensity} tint="dark" style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: m.backgroundColor,
            borderColor: m.borderColor,
            borderWidth: m.borderWidth,
            borderRadius: radius,
          }}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}
```

- [ ] **Step 6: Implement Bloom**

The handoff is explicit that this is a signature of the identity, must be static, and must not be a runtime blur over scrolling content. A pre-blurred radial is faked with concentric low-opacity circles so nothing animates.

Create `src/components/Bloom.tsx`:

```tsx
import { StyleProp, View, ViewStyle } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { size?: number; opacity?: number; style?: StyleProp<ViewStyle> };

/**
 * Static ambient brand bloom. Non-interactive, never animated — it exists so
 * the glass surfaces have something to refract.
 */
export default function Bloom({ size = 400, opacity = 0.32, style }: Props) {
  const rings = [1, 0.78, 0.56, 0.34];
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {rings.map((scale, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: size * scale,
            height: size * scale,
            borderRadius: (size * scale) / 2,
            backgroundColor: colors.bonnet,
            opacity: opacity / rings.length,
          }}
        />
      ))}
    </View>
  );
}
```

- [ ] **Step 7: Implement ScrollFade**

Create `src/components/ScrollFade.tsx`:

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';

/** Gradient the content scrolls under, behind the floating nav. */
export default function ScrollFade({ height = 124 }: { height?: number }) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[`${colors.pot}00`, colors.pot]}
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height }}
    />
  );
}
```

Install the gradient dependency:

```bash
npx expo install expo-linear-gradient
```

- [ ] **Step 8: Verify**

Run: `npm test && npx tsc --noEmit`
Expected: PASS, clean.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add glass, bloom, scroll-fade and food-tile primitives"
```

---

## Task 7: ProgressRing

**Files:**
- Create: `src/components/ProgressRing.tsx`, `src/components/ProgressRing.test.tsx`

**Interfaces:**
- Consumes: `RING`, `dashOffset` from `src/logic/rings.ts`
- Produces: `<ProgressRing value target size r strokeWidth circumference colour children />`

- [ ] **Step 1: Write the failing test**

Create `src/components/ProgressRing.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import ProgressRing from './ProgressRing';
import { RING } from '../logic/rings';

test('an empty ring is fully offset', () => {
  const { getByTestId } = render(
    <ProgressRing value={0} target={2583} {...RING.calories} colour="#F24C1E" />
  );
  expect(getByTestId('ring-progress').props.strokeDashoffset).toBe(314);
});

test('a completed ring has no offset', () => {
  const { getByTestId } = render(
    <ProgressRing value={2583} target={2583} {...RING.calories} colour="#F24C1E" />
  );
  expect(getByTestId('ring-progress').props.strokeDashoffset).toBe(0);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- ProgressRing`
Expected: FAIL — cannot resolve `./ProgressRing`.

- [ ] **Step 3: Implement**

Create `src/components/ProgressRing.tsx`:

```tsx
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { dashOffset } from '../logic/rings';
import { colors } from '../theme/tokens';

type Props = {
  value: number;
  target: number;
  size: number;
  r: number;
  strokeWidth: number;
  circumference: number;
  colour: string;
  /** Rendered centred inside the ring. */
  children?: React.ReactNode;
  /** Visual diameter; defaults to the viewBox size. */
  diameter?: number;
};

export default function ProgressRing({
  value, target, size, r, strokeWidth, circumference, colour, children, diameter,
}: Props) {
  const d = diameter ?? size;
  const offset = dashOffset(value, target, circumference);
  const c = size / 2;

  return (
    <View style={{ width: d, height: d, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={d} height={d} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={c} cy={c} r={r} stroke={colors.ringTrack} strokeWidth={strokeWidth} fill="none" />
        <Circle
          testID="ring-progress"
          cx={c} cy={c} r={r}
          stroke={colour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- ProgressRing`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProgressRing.tsx src/components/ProgressRing.test.tsx
git commit -m "feat: add SVG progress ring"
```

---

## Task 8: Stepper, Chip and Toast

**Files:**
- Create: `src/components/Stepper.tsx`, `src/components/Stepper.test.tsx`, `src/components/Chip.tsx`, `src/components/Toast.tsx`, `src/components/Toast.test.tsx`

**Interfaces:**
- Produces:
  - `<Stepper value: number onStep: (delta: number) => void label: string />`
  - `<Chip label: string sublabel?: string selected: boolean onPress: () => void />`
  - `<Toast message: string | null onHide: () => void />`

- [ ] **Step 1: Write the failing Stepper test**

Accessibility is a spec requirement, so assert the hit area rather than trusting it.

Create `src/components/Stepper.test.tsx`:

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import Stepper from './Stepper';

test('the 34px buttons expand to a 44px hit target', () => {
  const { getByTestId } = render(<Stepper value={1} label="1" onStep={() => {}} />);
  // 34 visual + 5 hitSlop on each side = 44.
  expect(getByTestId('stepper-plus').props.hitSlop).toMatchObject({ top: 5, bottom: 5, left: 5, right: 5 });
});

test('reports the delta rather than the new value', () => {
  const onStep = jest.fn();
  const { getByTestId } = render(<Stepper value={1} label="1" onStep={onStep} />);
  fireEvent.press(getByTestId('stepper-plus'));
  expect(onStep).toHaveBeenCalledWith(0.5);
  fireEvent.press(getByTestId('stepper-minus'));
  expect(onStep).toHaveBeenCalledWith(-0.5);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- Stepper`
Expected: FAIL — cannot resolve `./Stepper`.

- [ ] **Step 3: Implement Stepper**

Create `src/components/Stepper.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';
import { colors, material } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { MAX_UNITS, MIN_UNITS, STEP } from '../logic/portion';

const SIZE = 34;
const SLOP = { top: 5, bottom: 5, left: 5, right: 5 }; // 34 + 10 = 44

type Props = { value: number; label: string; onStep: (delta: number) => void };

export default function Stepper({ value, label, onStep }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable
        testID="stepper-minus"
        hitSlop={SLOP}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        onPress={() => onStep(-STEP)}
        style={{
          width: SIZE, height: SIZE, borderRadius: SIZE / 2,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: material.glass.backgroundColor,
          borderWidth: material.glass.borderWidth,
          borderColor: material.glass.borderColor,
        }}
      >
        <Text style={{ color: colors.cream, fontSize: 20, lineHeight: 22 }}>{'−'}</Text>
      </Pressable>

      <Text
        accessibilityLiveRegion="polite"
        accessibilityValue={{ now: value, min: MIN_UNITS, max: MAX_UNITS, text: label }}
        style={[t.metric, { fontSize: 19, minWidth: 56, textAlign: 'center' }]}
      >
        {label}
      </Text>

      <Pressable
        testID="stepper-plus"
        hitSlop={SLOP}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        onPress={() => onStep(STEP)}
        style={{
          width: SIZE, height: SIZE, borderRadius: SIZE / 2,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(242,76,30,0.2)',
          borderWidth: 1,
          borderColor: 'rgba(242,76,30,0.45)',
        }}
      >
        <Text style={{ color: colors.bonnet, fontSize: 20, lineHeight: 22 }}>+</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- Stepper`
Expected: PASS.

- [ ] **Step 5: Implement Chip**

Create `src/components/Chip.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';
import { colors, material } from '../theme/tokens';
import { type as t } from '../theme/typography';

type Props = { label: string; sublabel?: string; selected: boolean; onPress: () => void };

export default function Chip({ label, sublabel, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        flex: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 4, alignItems: 'center',
        backgroundColor: selected ? colors.bonnet : material.glass.backgroundColor,
        borderWidth: selected ? 1 : material.glass.borderWidth,
        borderColor: selected ? colors.bonnet : material.glass.borderColor,
      }}
    >
      <Text style={[t.metric, { color: selected ? colors.bonnetInk : colors.cream }]}>{label}</Text>
      {sublabel ? (
        <Text style={[t.rowMeta, { color: selected ? colors.bonnetInk : colors.muted, marginTop: 2 }]}>
          {sublabel}
        </Text>
      ) : null}
    </Pressable>
  );
}
```

- [ ] **Step 6: Write the failing Toast test**

The handoff requires a 3.6s auto-dismiss whose timer restarts when a second log lands, and the spec requires cleanup on unmount.

Create `src/components/Toast.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import Toast from './Toast';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('auto-dismisses after 3.6 seconds', () => {
  const onHide = jest.fn();
  render(<Toast message="Logged 610 kcal" onHide={onHide} />);
  jest.advanceTimersByTime(3599);
  expect(onHide).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(onHide).toHaveBeenCalledTimes(1);
});

test('does not fire after unmount', () => {
  const onHide = jest.fn();
  const { unmount } = render(<Toast message="Logged 610 kcal" onHide={onHide} />);
  unmount();
  jest.advanceTimersByTime(5000);
  expect(onHide).not.toHaveBeenCalled();
});

test('a new message restarts the timer', () => {
  const onHide = jest.fn();
  const { rerender } = render(<Toast message="first" onHide={onHide} />);
  jest.advanceTimersByTime(3000);
  rerender(<Toast message="second" onHide={onHide} />);
  jest.advanceTimersByTime(3000);
  expect(onHide).not.toHaveBeenCalled();
  jest.advanceTimersByTime(600);
  expect(onHide).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 7: Run to verify it fails**

Run: `npm test -- Toast`
Expected: FAIL — cannot resolve `./Toast`.

- [ ] **Step 8: Implement Toast**

Create `src/components/Toast.tsx`:

```tsx
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { colors, radii } from '../theme/tokens';
import { type as t } from '../theme/typography';

const DURATION_MS = 3600;

type Props = { message: string | null; onHide: () => void };

export default function Toast({ message, onHide }: Props) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onHide, DURATION_MS);
    return () => clearTimeout(id);
  }, [message, onHide]);

  if (!message) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOut.duration(220)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={{ position: 'absolute', left: 22, right: 22, bottom: 108 }}
    >
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: colors.ugu, opacity: 0.9,
          borderRadius: radii.compact, paddingVertical: 14, paddingHorizontal: 16,
        }}
      >
        <Text style={{ color: colors.bonnetInk, fontSize: 15 }}>{'✓'}</Text>
        <Text style={[t.rowTitle, { color: colors.bonnetInk, flex: 1 }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}
```

- [ ] **Step 9: Run to verify all pass**

Run: `npm test`
Expected: all suites PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add stepper, chip and auto-dismissing toast"
```

---

## Task 9: Fonts and root layout

**Files:**
- Create: `assets/fonts/` (Archivo + Inter), `src/theme/useFonts.ts`
- Modify: `app/_layout.tsx`

**Interfaces:**
- Produces: `useAppFonts(): boolean` — true once fonts are ready; root layout gates render on it.

- [ ] **Step 1: Install the font packages**

Both are Google Fonts under the SIL OFL. Using the Expo Google Fonts packages avoids hand-managing binaries:

```bash
npx expo install @expo-google-fonts/archivo @expo-google-fonts/inter expo-splash-screen
```

- [ ] **Step 2: Add the font hook**

Create `src/theme/useFonts.ts`:

```ts
import { useFonts } from 'expo-font';
import { Archivo_800ExtraBold, Archivo_900Black } from '@expo-google-fonts/archivo';
import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Archivo_900: Archivo_900Black,
    Archivo_800: Archivo_800ExtraBold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });
  return loaded;
}
```

Then update `src/theme/typography.ts` so `fonts.ui` resolves per weight. Replace the `fonts` export with:

```ts
export const fonts = {
  display: 'Archivo_900',
  displayBold: 'Archivo_800',
  ui400: 'Inter_400Regular',
  ui500: 'Inter_500Medium',
  ui600: 'Inter_600SemiBold',
  ui700: 'Inter_700Bold',
  ui800: 'Inter_800ExtraBold',
} as const;
```

and in every `type` entry replace `fontFamily: fonts.ui` + `fontWeight` with the matching numbered family (React Native picks the face by family name, not by `fontWeight`, for custom fonts). For example `eyebrow` becomes `{ fontFamily: fonts.ui700, fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.muted }`.

> **Note on Inter 650:** the handoff calls for weight 650 on row titles. No static Inter face ships at 650; `Inter_600SemiBold` is the nearest and is what this build uses. Flag to design if the difference is visible.

- [ ] **Step 3: Gate the root layout on fonts**

Replace `app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { colors } from '../src/theme/tokens';
import { useAppFonts } from '../src/theme/useFonts';

export default function RootLayout() {
  const fontsReady = useAppFonts();

  if (!fontsReady) return <View style={{ flex: 1, backgroundColor: colors.pot }} />;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.pot },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="detect" />
        <Stack.Screen name="portion" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
```

`portion` uses `presentation: 'modal'` because the handoff says it should feel like a sheet rising over Detect, not a lateral push.

- [ ] **Step 4: Remove the placeholder route**

```bash
rm app/index.tsx
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm test`
Expected: clean, all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: bundle Archivo and Inter, gate root layout on fonts"
```

---

## Task 10: Tab layout — floating glass pill and scan FAB

The handoff is emphatic that the nav pill and the scan button are two distinct floating objects, because logging is deliberately not a fourth tab.

**Files:**
- Create: `app/(tabs)/_layout.tsx`, `src/components/TabBar.tsx`, `src/components/icons.tsx`
- Create: `app/(tabs)/index.tsx`, `app/(tabs)/diary.tsx`, `app/(tabs)/you.tsx` (stubs)

**Interfaces:**
- Consumes: `colors`, `radii`, `type`
- Produces: `<TabBar {...BottomTabBarProps} />`; icon components `HomeIcon`, `DiaryIcon`, `YouIcon`, `ScanIcon`, `FlameIcon`, `BackIcon`, `SearchIcon`, each `({ color, size }) => JSX`

- [ ] **Step 1: Add the icon set**

Lift the paths from `design/Naija Kcal Redesign.dc.html`. Create `src/components/icons.tsx`:

```tsx
import Svg, { Path, Circle } from 'react-native-svg';

type IconProps = { color: string; size?: number };

const stroke = { strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

export const HomeIcon = ({ color, size = 19 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" stroke={color} {...stroke} />
  </Svg>
);

export const DiaryIcon = ({ color, size = 19 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 4h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5z" stroke={color} {...stroke} />
    <Path d="M9 9h6M9 13h6" stroke={color} {...stroke} />
  </Svg>
);

export const YouIcon = ({ color, size = 19 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={3.5} stroke={color} {...stroke} />
    <Path d="M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" stroke={color} {...stroke} />
  </Svg>
);

export const ScanIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3" stroke={color} {...stroke} strokeWidth={2.2} />
  </Svg>
);

export const FlameIcon = ({ color, size = 13 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2s5 4.5 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.5-4 .3 1.4 1.2 2 2 2 0-3 1.5-5.5 1.5-7z" fill={color} />
  </Svg>
);

export const BackIcon = ({ color, size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M15 5l-7 7 7 7" stroke={color} {...stroke} strokeWidth={2.2} />
  </Svg>
);

export const SearchIcon = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={11} cy={11} r={6.5} stroke={color} {...stroke} />
    <Path d="M16 16l4 4" stroke={color} {...stroke} strokeWidth={2.2} />
  </Svg>
);
```

- [ ] **Step 2: Build the tab bar**

Create `src/components/TabBar.tsx`:

```tsx
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { colors, material, radii } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { DiaryIcon, HomeIcon, ScanIcon, YouIcon } from './icons';

const ICONS = { index: HomeIcon, diary: DiaryIcon, you: YouIcon } as const;
const LABELS = { index: 'Home', diary: 'Diary', you: 'You' } as const;

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 28, height: 62, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 }}>
      <View style={{ width: 238, height: 62, borderRadius: radii.tabBar, overflow: 'hidden' }}>
        <BlurView intensity={material.glassHeavy.blurIntensity} tint="dark" style={{ flex: 1 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: material.glassHeavy.backgroundColor, borderWidth: material.glassHeavy.borderWidth, borderColor: material.glassHeavy.borderColor, borderRadius: radii.tabBar }}>
            {state.routes.map((route, i) => {
              const focused = state.index === i;
              const Icon = ICONS[route.name as keyof typeof ICONS];
              const colour = focused ? colors.bonnet : colors.tabInactive;
              if (!Icon) return null;
              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={LABELS[route.name as keyof typeof LABELS]}
                  onPress={() => navigation.navigate(route.name)}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, height: '100%' }}
                >
                  <Icon color={colour} />
                  <Text style={[t.tabLabel, { color: colour }]}>{LABELS[route.name as keyof typeof LABELS]}</Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scan a meal"
        onPress={() => router.push('/scan')}
        style={{
          width: 62, height: 62, borderRadius: 31, backgroundColor: colors.bonnet,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: colors.bonnet, shadowOpacity: 0.42, shadowRadius: 30, shadowOffset: { width: 0, height: 10 },
        }}
      >
        <ScanIcon color={colors.bonnetInk} />
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 3: Wire the tab group**

Create `app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';
import TabBar from '../../src/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
```

- [ ] **Step 4: Add stub screens so the group resolves**

Create `app/(tabs)/index.tsx`, `app/(tabs)/diary.tsx` and `app/(tabs)/you.tsx`, each with the same shape (substituting the name):

```tsx
import { Text, View } from 'react-native';
import { colors } from '../../src/theme/tokens';

export default function Screen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.pot, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.cream }}>Home</Text>
    </View>
  );
}
```

- [ ] **Step 5: Verify it boots**

Run: `npx tsc --noEmit`
Expected: clean.

Run: `npx expo start`
Expected: bundles without error. Open in Expo Go and confirm the pill and FAB render and the three tabs switch. **This is the first step needing a device** — if none is available, note it and move on rather than claiming it passed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add floating glass tab pill and scan FAB"
```

---

## Task 11: Home / Today

**Files:**
- Create: `src/components/MealRow.tsx`, `src/components/StreakPill.tsx`, `src/components/WeekStrip.tsx`, `src/components/SummaryCard.tsx`
- Modify: `app/(tabs)/index.tsx`

**Interfaces:**
- Consumes: `useAppStore`, `sumMeals`, `RING`, `ProgressRing`, `GlassCard`, `FoodTile`, `Bloom`, `ScrollFade`, `Toast`
- Produces: `<MealRow meal: Meal />`, `<SummaryCard consumed target macroTargets />`

- [ ] **Step 1: Build the meal row**

Create `src/components/MealRow.tsx`:

```tsx
import { Text, View } from 'react-native';
import { Meal } from '../types';
import { radii, space } from '../theme/tokens';
import { type as t } from '../theme/typography';
import FoodTile from './FoodTile';
import GlassCard from './GlassCard';

export default function MealRow({ meal }: { meal: Meal }) {
  return (
    <GlassCard variant="light" radius={radii.compact}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 }}>
        <FoodTile colour={meal.colour} photoUri={meal.photoUri} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={t.rowTitle}>{meal.name}</Text>
          <Text style={[t.rowMeta, { marginTop: 2 }]}>{meal.unitString}</Text>
        </View>
        <Text style={t.metric}>{meal.kcal}</Text>
      </View>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Build the summary card**

Create `src/components/SummaryCard.tsx`:

```tsx
import { Text, View } from 'react-native';
import { RING } from '../logic/rings';
import { colors, radii, space } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { PortionTotals } from '../types';
import GlassCard from './GlassCard';
import ProgressRing from './ProgressRing';

type Props = {
  consumed: PortionTotals;
  target: number;
  macroTargets: { carbs: number; protein: number; fat: number };
};

const MACROS = [
  { key: 'carbs', label: 'Carbs', colour: colors.palm },
  { key: 'protein', label: 'Protein', colour: colors.ugu },
  { key: 'fat', label: 'Fat', colour: colors.sky },
] as const;

export default function SummaryCard({ consumed, target, macroTargets }: Props) {
  const left = Math.max(0, target - consumed.kcal);

  return (
    <GlassCard radius={radii.hero}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: space.cardPad }}>
        <ProgressRing {...RING.calories} diameter={118} value={consumed.kcal} target={target} colour={colors.bonnet}>
          <View style={{ alignItems: 'center' }}>
            <Text style={t.ringValue}>{left.toLocaleString()}</Text>
            <Text style={[t.rowMeta, { fontSize: 11 }]}>left</Text>
          </View>
        </ProgressRing>

        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
          {MACROS.map((m) => (
            <View key={m.key} style={{ alignItems: 'center' }}>
              <ProgressRing
                {...RING.macro}
                diameter={50}
                value={consumed[m.key]}
                target={macroTargets[m.key]}
                colour={m.colour}
              />
              <Text style={[t.metric, { fontSize: 14, marginTop: 4 }]}>{consumed[m.key]}g</Text>
              <Text style={[t.tabLabel, { color: colors.muted }]}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </GlassCard>
  );
}
```

- [ ] **Step 3: Build the streak pill and week strip**

Create `src/components/StreakPill.tsx`:

```tsx
import { Text, View } from 'react-native';
import { colors, material, radii } from '../theme/tokens';
import { type as t } from '../theme/typography';
import { FlameIcon } from './icons';

export default function StreakPill({ days }: { days: number }) {
  return (
    <View
      accessibilityLabel={`${days} day streak`}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderRadius: radii.chip, paddingVertical: 7, paddingHorizontal: 12,
        backgroundColor: material.glass.backgroundColor,
        borderWidth: material.glass.borderWidth, borderColor: material.glass.borderColor,
      }}
    >
      <FlameIcon color={colors.bonnet} />
      <Text style={[t.metric, { fontSize: 14, color: colors.bonnet }]}>{days}</Text>
    </View>
  );
}
```

Create `src/components/WeekStrip.tsx`:

```tsx
import { Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { fonts, type as t } from '../theme/typography';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeekStrip({ todayIndex, dates }: { todayIndex: number; dates: number[] }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {DAYS.map((d, i) => {
        const today = i === todayIndex;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
            <Text style={[t.tabLabel, { fontSize: 11, color: today ? colors.bonnet : colors.muted }]}>{d}</Text>
            <Text
              style={
                today
                  ? { fontFamily: fonts.display, fontSize: 13, color: colors.bonnet }
                  : { fontFamily: fonts.ui500, fontSize: 13, color: colors.cream }
              }
            >
              {dates[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 4: Assemble the screen**

Replace `app/(tabs)/index.tsx`:

```tsx
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import MealRow from '../../src/components/MealRow';
import ScrollFade from '../../src/components/ScrollFade';
import StreakPill from '../../src/components/StreakPill';
import SummaryCard from '../../src/components/SummaryCard';
import Toast from '../../src/components/Toast';
import WeekStrip from '../../src/components/WeekStrip';
import { sumMeals } from '../../src/logic/totals';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, space } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

export default function Home() {
  const insets = useSafeAreaInsets();
  const meals = useAppStore((s) => s.meals);
  const profile = useAppStore((s) => s.profile);
  const toast = useAppStore((s) => s.toast);
  const hideToast = useAppStore((s) => s.hideToast);

  const consumed = useMemo(() => sumMeals(meals), [meals]);

  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // Monday-first
  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - todayIndex + i);
      return d.getDate();
    }),
    [meals.length]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ right: -90, top: -60 }} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: space.gutter,
          paddingBottom: 140,
          gap: space.sectionGap,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={t.appName}>Naija Kcal</Text>
          <StreakPill days={profile.streak} />
        </View>

        <WeekStrip todayIndex={todayIndex} dates={dates} />

        <SummaryCard consumed={consumed} target={profile.dailyTarget} macroTargets={profile.macroTargets} />

        <View style={{ gap: space.rowGap }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={t.sectionTitle}>Today</Text>
            <Text style={[t.rowMeta, { fontSize: 11.5 }]}>{meals.length} entries</Text>
          </View>

          {meals.length === 0 ? (
            // TODO(design): empty-today copy is not designed. Structure only.
            <Text style={t.body}>Nothing logged yet.</Text>
          ) : (
            meals.map((m) => <MealRow key={m.id} meal={m} />)
          )}
        </View>
      </ScrollView>

      <ScrollFade />
      <Toast message={toast?.message ?? null} onHide={hideToast} />
    </View>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm test`
Expected: clean, all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build Home/Today screen"
```

---

## Task 12: Diary and You

**Files:**
- Modify: `app/(tabs)/diary.tsx`, `app/(tabs)/you.tsx`
- Create: `src/components/WeekChart.tsx`, `src/components/StatusCard.tsx`

**Interfaces:**
- Consumes: `barHeightPct`, `tint`, `GlassCard`
- Produces: `<WeekChart values: number[] target: number />`, `<StatusCard accent: string children />`

- [ ] **Step 1: Build the week chart**

The handoff notes the diary bar chart, unlike the rings, keeps meaning past the target — over-target days turn `bonnet`.

Create `src/components/WeekChart.tsx`:

```tsx
import { Text, View } from 'react-native';
import { barHeightPct } from '../logic/rings';
import { colors } from '../theme/tokens';
import { type as t } from '../theme/typography';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BOX = 132;

type Props = { values: number[]; target: number; todayIndex: number };

export default function WeekChart({ values, target, todayIndex }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BOX + 22, gap: 8 }}>
      {values.map((v, i) => {
        const pct = barHeightPct(v, target);
        const inProgress = i === todayIndex;
        const colour = inProgress ? 'rgba(247,237,216,0.3)' : v > target ? colors.bonnet : colors.ugu;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ height: BOX, width: '100%', justifyContent: 'flex-end' }}>
              <View style={{ height: `${pct}%`, borderRadius: 6, backgroundColor: colour }} />
            </View>
            <Text style={[t.tabLabel, { color: colors.muted }]}>{DAYS[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 2: Build the tinted status card**

Create `src/components/StatusCard.tsx`:

```tsx
import { View } from 'react-native';
import { radii, space, tint } from '../theme/tokens';

type Props = { accent: string; children: React.ReactNode };

export default function StatusCard({ accent, children }: Props) {
  return (
    <View style={[{ borderRadius: radii.card, padding: space.cardPad }, tint(accent)]}>
      {children}
    </View>
  );
}
```

- [ ] **Step 3: Build the Diary screen**

The handoff says the insight card is the point of the screen — a sentence naming a behaviour change tied to a result, not a stat.

Replace `app/(tabs)/diary.tsx`:

```tsx
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import GlassCard from '../../src/components/GlassCard';
import ScrollFade from '../../src/components/ScrollFade';
import StatusCard from '../../src/components/StatusCard';
import WeekChart from '../../src/components/WeekChart';
import { sumMeals } from '../../src/logic/totals';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, radii, space } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

const MOST_EATEN = [
  { label: 'Swallow', pct: 78, colour: colors.palm },
  { label: 'Soups', pct: 64, colour: colors.ugu },
  { label: 'Rice dishes', pct: 41, colour: colors.bonnet },
];

export default function Diary() {
  const insets = useSafeAreaInsets();
  const meals = useAppStore((s) => s.meals);
  const target = useAppStore((s) => s.profile.dailyTarget);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const today = sumMeals(meals).kcal;
  const week = [2410, 2180, 2620, 2350, 2480, 2900, 0];
  week[todayIndex] = today;

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ left: -110, top: 40 }} opacity={0.24} />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: space.gutter, paddingBottom: 140, gap: space.sectionGap }}>
        <View>
          <Text style={t.screenTitle}>Diary</Text>
          <Text style={[t.body, { marginTop: 8 }]}>You are averaging 2,410 kcal a day this week.</Text>
        </View>

        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad }}>
            <Text style={[t.eyebrow, { marginBottom: 14 }]}>This week vs target</Text>
            <WeekChart values={week} target={target} todayIndex={todayIndex} />
          </View>
        </GlassCard>

        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad, gap: 14 }}>
            <Text style={[t.eyebrow]}>What you eat most</Text>
            {MOST_EATEN.map((m) => (
              <View key={m.label} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={t.rowTitle}>{m.label}</Text>
                  <Text style={[t.rowMeta]}>{m.pct}%</Text>
                </View>
                <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.ringTrack }}>
                  <View style={{ width: `${m.pct}%`, height: 5, borderRadius: 3, backgroundColor: m.colour }} />
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        <StatusCard accent={colors.ugu}>
          <Text style={[t.eyebrow, { color: colors.uguText }]}>Insight</Text>
          <Text style={[t.rowTitle, { marginTop: 8, lineHeight: 21 }]}>
            You switched to half portions of swallow on weekdays. That alone is the reason you are
            under target four days running.
          </Text>
        </StatusCard>
      </ScrollView>

      <ScrollFade />
    </View>
  );
}
```

- [ ] **Step 4: Build the You screen**

Replace `app/(tabs)/you.tsx`:

```tsx
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../../src/components/Bloom';
import GlassCard from '../../src/components/GlassCard';
import ScrollFade from '../../src/components/ScrollFade';
import { useAppStore } from '../../src/state/useAppStore';
import { colors, radii, space, tint } from '../../src/theme/tokens';
import { type as t } from '../../src/theme/typography';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
      <Text style={t.rowTitle}>{label}</Text>
      <Text style={t.metric}>{value}</Text>
    </View>
  );
}

export default function You() {
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ right: -100, top: -40 }} opacity={0.24} />

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: space.gutter, paddingBottom: 140, gap: space.sectionGap }}>
        <Text style={t.screenTitle}>You</Text>

        <GlassCard radius={radii.hero}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: space.cardPad }}>
            <View style={[{ width: 56, height: 56, borderRadius: radii.tileMd, alignItems: 'center', justifyContent: 'center' }, tint(colors.bonnet, 0.16, 0.32)]}>
              <Text style={[t.metric, { fontSize: 20, color: colors.bonnet }]}>AF</Text>
            </View>
            <View>
              <Text style={t.rowTitle}>Your profile</Text>
              <Text style={[t.rowMeta, { marginTop: 2 }]}>{profile.dailyTarget.toLocaleString()} kcal daily target</Text>
            </View>
          </View>
        </GlassCard>

        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad }}>
            <Text style={[t.eyebrow, { marginBottom: 4 }]}>My units</Text>
            <Row label="One wrap of swallow" value={`${profile.wrapGrams} g`} />
            <View style={{ height: 1, backgroundColor: colors.line }} />
            <Row label="One ladle of soup" value={`${profile.ladleMl} ml`} />
            <View style={{ height: 1, backgroundColor: colors.line }} />
            <Row label="Rice plate" value={`${profile.dericasPerPlate} derica`} />
          </View>
        </GlassCard>

        <GlassCard radius={radii.hero}>
          <View style={{ padding: space.cardPad, gap: 10 }}>
            <Text style={t.eyebrow}>Household</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['A', 'B', 'C', 'D'].slice(0, profile.householdSize).map((initial) => (
                <View key={initial} style={[{ width: 38, height: 38, borderRadius: radii.tileSm, alignItems: 'center', justifyContent: 'center' }, tint(colors.cream, 0.08, 0.16)]}>
                  <Text style={[t.rowTitle, { fontSize: 13 }]}>{initial}</Text>
                </View>
              ))}
            </View>
            <Text style={t.body}>
              When you log from a shared bowl, only your share counts against your target. The rest
              goes to the household.
            </Text>
          </View>
        </GlassCard>

        <View style={[{ borderRadius: radii.hero, padding: space.cardPad, flexDirection: 'row', alignItems: 'center', gap: 14 }, tint(colors.ugu)]}>
          <View style={{ width: 38, height: 38, borderRadius: radii.tileSm, backgroundColor: colors.ugu, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.bonnetInk, fontSize: 18 }}>{'✓'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={t.rowTitle}>340 dishes on this phone</Text>
            <Text style={[t.rowMeta, { marginTop: 2 }]}>Scanning uses no data.</Text>
          </View>
        </View>
      </ScrollView>

      <ScrollFade />
    </View>
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm test`
Expected: clean, all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build Diary and You tabs"
```

---

## Task 13: Scan

**Files:**
- Create: `app/scan.tsx`, `src/components/CornerBrackets.tsx`

**Interfaces:**
- Consumes: `expo-camera`, `colors`, `icons`
- Produces: route `/scan`; shutter navigates to `/detect`

- [ ] **Step 1: Build the recognition frame**

Create `src/components/CornerBrackets.tsx`:

```tsx
import { View } from 'react-native';
import { colors } from '../theme/tokens';

const S = 34;
const W = 3;
const R = 12;

/** Four L-shaped brackets marking the recognition region. */
export default function CornerBrackets({ height = 236, inset = 52 }: { height?: number; inset?: number }) {
  const corner = (style: object, radii: object) => (
    <View style={[{ position: 'absolute', width: S, height: S, borderColor: colors.bonnet }, style, radii]} />
  );

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: inset, right: inset, height, top: '30%' }}>
      {corner({ top: 0, left: 0, borderTopWidth: W, borderLeftWidth: W }, { borderTopLeftRadius: R })}
      {corner({ top: 0, right: 0, borderTopWidth: W, borderRightWidth: W }, { borderTopRightRadius: R })}
      {corner({ bottom: 0, left: 0, borderBottomWidth: W, borderLeftWidth: W }, { borderBottomLeftRadius: R })}
      {corner({ bottom: 0, right: 0, borderBottomWidth: W, borderRightWidth: W }, { borderBottomRightRadius: R })}
    </View>
  );
}
```

- [ ] **Step 2: Build the screen**

Create `app/scan.tsx`:

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CornerBrackets from '../src/components/CornerBrackets';
import { BackIcon, SearchIcon } from '../src/components/icons';
import { colors, material, radii, space, tint } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';

export default function Scan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  const glassCircle = {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center' as const, justifyContent: 'center' as const,
    backgroundColor: material.glass.backgroundColor,
    borderWidth: material.glass.borderWidth, borderColor: material.glass.borderColor,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.potDeep }}>
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        // TODO(design): camera-permission-denied copy is not designed. Structure only.
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 14 }]}>
          <Text style={t.body}>Camera access is needed to scan a plate.</Text>
          <Pressable onPress={requestPermission} hitSlop={8}>
            <Text style={[t.rowTitle, { color: colors.bonnet }]}>Allow camera</Text>
          </Pressable>
        </View>
      )}

      <CornerBrackets />

      <View style={{ position: 'absolute', top: insets.top + 8, left: space.gutter, right: space.gutter, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={3} onPress={() => router.back()} style={glassCircle}>
          <BackIcon color={colors.cream} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[{ borderRadius: radii.chip, paddingVertical: 7, paddingHorizontal: 12 }, tint(colors.ugu, 0.12, 0.35)]}>
            <Text style={[t.chip, { color: colors.uguText }]}>Offline · scanning on device</Text>
          </View>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <View style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom: insets.bottom + 150, alignItems: 'center', gap: 6 }}>
        <Text style={[t.sectionTitle, { fontSize: 21, letterSpacing: -0.5 }]}>Point at the whole plate</Text>
        <Text style={[t.body, { textAlign: 'center' }]}>Soup and swallow in one shot. We log them as a pair.</Text>
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 34 }}>
        <View style={[glassCircle, { width: 46, height: 46, borderRadius: radii.tileSm + 4 }]} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capture"
          onPress={() => router.push('/detect')}
          style={{
            width: 82, height: 82, borderRadius: 41, backgroundColor: colors.bonnet,
            borderWidth: 5, borderColor: 'rgba(247,237,216,0.22)',
          }}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Search the library" style={[glassCircle, { width: 46, height: 46, borderRadius: radii.tileSm + 4 }]}>
          <SearchIcon color={colors.cream} />
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Declare the camera permission string**

In `app.json`, add to `expo.plugins`:

```json
["expo-camera", { "cameraPermission": "Naija Kcal uses the camera to recognise your meal on device." }]
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build Scan screen with live camera and recognition frame"
```

---

## Task 14: Detect

**Files:**
- Create: `app/detect.tsx`, `src/data/detectedPair.ts`

**Interfaces:**
- Consumes: `GlassCard`, `FoodTile`, `StatusCard`, `tint`
- Produces: route `/detect`; `DETECTED_PAIR` — the stubbed recognition result

- [ ] **Step 1: Add the stubbed recognition result**

Recognition is out of scope for this phase; this is the shape the real model must return.

Create `src/data/detectedPair.ts`:

```ts
import { food } from '../theme/tokens';

export type DetectedItem = {
  name: string;
  ingredients: string;
  confidence: number;
  colour: string;
  category: 'soup' | 'swallow';
};

export const DETECTED_PAIR: DetectedItem[] = [
  { name: 'Egusi soup', ingredients: 'Melon seed, spinach, beef, palm oil', confidence: 96, colour: food.egusi, category: 'soup' },
  { name: 'Pounded yam', ingredients: 'Pounded yam', confidence: 93, colour: food.poundedYam, category: 'swallow' },
];

export const LOW_CONFIDENCE_THRESHOLD = 70;
```

- [ ] **Step 2: Build the screen**

The 60–80ms stagger between the two rows is what sells "it found two things", so it is built in from the start rather than added as polish.

Create `app/detect.tsx`:

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodTile from '../src/components/FoodTile';
import GlassCard from '../src/components/GlassCard';
import StatusCard from '../src/components/StatusCard';
import { BackIcon } from '../src/components/icons';
import { DETECTED_PAIR, LOW_CONFIDENCE_THRESHOLD } from '../src/data/detectedPair';
import { colors, food, material, radii, space } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';

const PHOTO_H = 326;

export default function Detect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const lowConfidence = DETECTED_PAIR.some((d) => d.confidence < LOW_CONFIDENCE_THRESHOLD);

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H, backgroundColor: food.egusi }} />
      <LinearGradient
        colors={['transparent', `${colors.pot}00`, colors.pot]}
        locations={[0, 0.54, 0.96]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PHOTO_H }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={3}
        onPress={() => router.back()}
        style={{
          position: 'absolute', top: insets.top + 8, left: space.gutter,
          width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
          backgroundColor: material.glass.backgroundColor,
          borderWidth: material.glass.borderWidth, borderColor: material.glass.borderColor,
          zIndex: 2,
        }}
      >
        <BackIcon color={colors.cream} />
      </Pressable>

      <ScrollView contentContainerStyle={{ paddingTop: PHOTO_H - 60, paddingHorizontal: space.gutter, paddingBottom: insets.bottom + 110, gap: 16 }}>
        <View>
          <Text style={[t.eyebrow, { color: colors.bonnet }]}>Recognised as a pair</Text>
          <Text style={[t.detectTitle, { marginTop: 8 }]}>Egusi soup{'\n'}and pounded yam</Text>
        </View>

        <GlassCard radius={radii.card}>
          <View style={{ paddingHorizontal: 16 }}>
            {DETECTED_PAIR.map((item, i) => (
              <Animated.View key={item.name} entering={FadeInUp.delay(i * 70).duration(280)}>
                {i > 0 ? <View style={{ height: 1, backgroundColor: colors.line }} /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
                  <FoodTile colour={item.colour} size={34} plate={false} />
                  <View style={{ flex: 1 }}>
                    <Text style={t.rowTitle}>{item.name}</Text>
                    <Text style={[t.rowMeta, { marginTop: 2 }]}>{item.ingredients}</Text>
                  </View>
                  <Text style={[t.rowMeta, { color: colors.uguText, fontWeight: '700' }]}>{item.confidence}%</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </GlassCard>

        {lowConfidence ? (
          // TODO(design): low-confidence (<70%) copy is not designed. Structure only.
          <StatusCard accent={colors.palm}>
            <Text style={t.rowTitle}>We are not sure about this one.</Text>
          </StatusCard>
        ) : null}

        <StatusCard accent={colors.palm}>
          <Text style={[t.body, { color: colors.cream }]}>
            Soup from a shared bowl. Next step asks how much of it was yours — not how many
            "servings".
          </Text>
        </StatusCard>

        <Text style={t.body}>
          Not right? <Text style={{ color: colors.bonnet }}>Search the library</Text>
        </Text>
      </ScrollView>

      <View style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom: insets.bottom + 20 }}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/portion')}
          style={{ height: 56, borderRadius: radii.cta, backgroundColor: colors.bonnet, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={t.ctaLabel}>Set your portion</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm test`
Expected: clean, all PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build Detect screen with staggered pair reveal"
```

---

## Task 15: Portion — the core screen

The handoff calls this the most important screen in the app. The number moving in response to the tap is the interaction.

**Files:**
- Create: `app/portion.tsx`, `app/portion.test.tsx`

**Interfaces:**
- Consumes: `useAppStore`, `computePair`, `formatUnit`, `barWidths`, `shareNote`, `Stepper`, `Chip`
- Produces: route `/portion`; logging dismisses back to Home

- [ ] **Step 1: Write the failing integration test**

Create `app/portion.test.tsx`:

```tsx
import { render, fireEvent, within } from '@testing-library/react-native';
import Portion from './portion';
import { useAppStore } from '../src/state/useAppStore';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), dismissAll: jest.fn(), replace: jest.fn() }),
}));

beforeEach(() => useAppStore.getState().resetAll());

test('the CTA carries the live number', () => {
  const { getByText } = render(<Portion />);
  expect(getByText('Log 610 kcal')).toBeTruthy();
});

test('stepping a unit updates the CTA immediately', () => {
  const { getByTestId, getByText } = render(<Portion />);
  fireEvent.press(within(getByTestId('wraps-stepper')).getByTestId('stepper-plus'));
  // 1.5 wraps + 1 ladle = 480 + 290 = 770
  expect(getByText('Log 770 kcal')).toBeTruthy();
});

test('choosing a half share halves the number', () => {
  const { getByText } = render(<Portion />);
  fireEvent.press(getByText('Half'));
  expect(getByText('Log 305 kcal')).toBeTruthy();
});

test('the share note changes with the selection', () => {
  const { getByText, queryByText } = render(<Portion />);
  expect(getByText('Counted as your own bowl, not a split.')).toBeTruthy();
  fireEvent.press(getByText('Half'));
  expect(queryByText('Counted as your own bowl, not a split.')).toBeNull();
});

test('the share prompt disappears for a household of one', () => {
  useAppStore.getState().setHouseholdSize(1);
  const { queryByText } = render(<Portion />);
  expect(queryByText('Half')).toBeNull();
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- portion.test`
Expected: FAIL — cannot resolve `./portion`.

- [ ] **Step 3: Build the screen**

Create `app/portion.tsx`:

```tsx
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chip from '../src/components/Chip';
import FoodTile from '../src/components/FoodTile';
import GlassCard from '../src/components/GlassCard';
import Stepper from '../src/components/Stepper';
import { barWidths, computePair, formatUnit, shareNote } from '../src/logic/portion';
import { DETECTED_PAIR } from '../src/data/detectedPair';
import { useAppStore } from '../src/state/useAppStore';
import { colors, radii, space, tint } from '../src/theme/tokens';
import { type as t } from '../src/theme/typography';
import { Share } from '../src/types';

const SHARES: { value: Share; label: string; sub: string }[] = [
  { value: 33, label: '⅓', sub: 'A third' },
  { value: 50, label: '½', sub: 'Half' },
  { value: 100, label: '1', sub: 'All of it' },
];

export default function Portion() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const draft = useAppStore((s) => s.draft);
  const profile = useAppStore((s) => s.profile);
  const stepWraps = useAppStore((s) => s.stepWraps);
  const stepLadles = useAppStore((s) => s.stepLadles);
  const setShare = useAppStore((s) => s.setShare);
  const logPair = useAppStore((s) => s.logPair);
  const shareVisible = profile.householdSize > 1;

  const totals = computePair(draft.wraps, draft.ladles, draft.share);
  const bars = barWidths(totals);

  const [soup, swallow] = DETECTED_PAIR;

  const onLog = () => {
    logPair();
    router.dismissAll();
  };

  const macroBars = [
    { label: 'Carbs', grams: totals.carbs, w: bars.carbW, colour: colors.palm },
    { label: 'Protein', grams: totals.protein, w: bars.protW, colour: colors.ugu },
    { label: 'Fat', grams: totals.fat, w: bars.fatW, colour: colors.sky },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: space.gutter, paddingBottom: insets.bottom + 110, gap: 20 }}>
        <Text style={[t.screenTitle, { fontSize: 28 }]}>How much did{'\n'}you actually eat?</Text>

        <GlassCard radius={radii.card}>
          <View style={{ paddingHorizontal: space.cardPad }}>
            <View testID="ladles-stepper" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 }}>
              <FoodTile colour={soup.colour} size={38} plate={false} />
              <View style={{ flex: 1 }}>
                <Text style={[t.rowTitle, { fontSize: 15 }]}>{soup.name}</Text>
                <Text style={[t.rowMeta, { marginTop: 2 }]}>Your ladle = {profile.ladleMl} ml</Text>
              </View>
              <Stepper value={draft.ladles} label={formatUnit(draft.ladles)} onStep={stepLadles} />
            </View>

            <View style={{ height: 1, backgroundColor: colors.line }} />

            <View testID="wraps-stepper" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 }}>
              <FoodTile colour={swallow.colour} size={38} plate={false} />
              <View style={{ flex: 1 }}>
                <Text style={[t.rowTitle, { fontSize: 15 }]}>{swallow.name}</Text>
                <Text style={[t.rowMeta, { marginTop: 2 }]}>Your wrap = {profile.wrapGrams} g</Text>
              </View>
              <Stepper value={draft.wraps} label={formatUnit(draft.wraps)} onStep={stepWraps} />
            </View>
          </View>
        </GlassCard>

        {shareVisible ? (
          <View style={{ gap: 10 }}>
            <Text style={t.eyebrow}>Shared bowl — your share</Text>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              {SHARES.map((s) => (
                <Chip
                  key={s.value}
                  label={s.label}
                  sublabel={s.sub}
                  selected={draft.share === s.value}
                  onPress={() => setShare(s.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={[{ borderRadius: radii.card, padding: space.cardPad, gap: 14 }, tint(colors.bonnet, 0.11, 0.3)]}>
          <View>
            <Text style={t.eyebrow}>This meal</Text>
            <Text style={{ fontFamily: t.hero.fontFamily, fontSize: 32, letterSpacing: -1, color: colors.bonnet, marginTop: 4 }}>
              {totals.kcal} kcal
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            {macroBars.map((m) => (
              <View key={m.label} style={{ flex: 1, gap: 5 }}>
                <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.ringTrack }}>
                  <View style={{ width: `${m.w}%`, height: 5, borderRadius: 3, backgroundColor: m.colour }} />
                </View>
                <Text style={[t.metric, { fontSize: 14 }]}>{m.grams}g</Text>
                <Text style={[t.tabLabel, { color: colors.muted }]}>{m.label}</Text>
              </View>
            ))}
          </View>

          <Text style={t.body}>{shareNote(draft.share)}</Text>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom: insets.bottom + 20 }}>
        <Pressable
          accessibilityRole="button"
          onPress={onLog}
          style={{ height: 56, borderRadius: radii.cta, backgroundColor: colors.bonnet, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={t.ctaLabel}>Log {totals.kcal} kcal</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- portion.test`
Expected: all PASS.

- [ ] **Step 5: Run the whole suite**

Run: `npm test && npx tsc --noEmit`
Expected: clean, all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build Portion screen with live pair maths"
```

---

## Task 16: Ring and result-number motion

The rings must animate `dashoffset` on mount over 700ms ease-out, and on log must animate from the old value to the new rather than remounting. The portion result number cross-fades over ~150ms on every stepper change, with no layout shift.

**Files:**
- Modify: `src/components/ProgressRing.tsx`, `app/portion.tsx`
- Create: `src/components/RollingNumber.tsx`

**Interfaces:**
- ProgressRing: unchanged public props; internal animation only, so the Task 7 tests must still pass.
- Produces: `<RollingNumber value: number suffix?: string style? minWidth? />`

- [ ] **Step 1: Add the animated circle**

Replace the progress `Circle` in `src/components/ProgressRing.tsx`. Add these imports:

```tsx
import { useEffect } from 'react';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
```

Inside the component, before the return:

```tsx
const progress = useSharedValue(circumference);

useEffect(() => {
  progress.value = withTiming(offset, { duration: 700, easing: Easing.out(Easing.cubic) });
}, [offset, progress]);

const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: progress.value }));
```

Then swap the progress circle for:

```tsx
<AnimatedCircle
  testID="ring-progress"
  cx={c} cy={c} r={r}
  stroke={colour}
  strokeWidth={strokeWidth}
  strokeLinecap="round"
  strokeDasharray={circumference}
  strokeDashoffset={offset}
  animatedProps={animatedProps}
  fill="none"
/>
```

`strokeDashoffset={offset}` is kept as the static prop so the Task 7 tests, which read `props.strokeDashoffset`, still assert the correct target value.

- [ ] **Step 2: Run to verify nothing regressed**

Run: `npm test -- ProgressRing`
Expected: both tests still PASS.

- [ ] **Step 3: Add the rolling number**

Create `src/components/RollingNumber.tsx`. The value box carries a fixed `minWidth` so a digit change never reflows the card:

```tsx
import { StyleProp, Text, TextStyle, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type Props = {
  value: number;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  minWidth?: number;
};

export default function RollingNumber({ value, suffix, style, minWidth = 96 }: Props) {
  return (
    <View style={{ minWidth, flexDirection: 'row', alignItems: 'baseline' }}>
      <Animated.Text
        key={value}
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        style={style}
      >
        {value}
      </Animated.Text>
      {suffix ? <Text style={style}>{suffix}</Text> : null}
    </View>
  );
}
```

Keying on `value` is what makes the cross-fade fire: React remounts the text node on each change, and Reanimated's layout animations handle the transition. The surrounding `View` keeps the footprint stable so nothing shifts.

- [ ] **Step 4: Use it for the result card number**

In `app/portion.tsx`, import it and replace the static result `Text`:

```tsx
<RollingNumber
  value={totals.kcal}
  suffix=" kcal"
  style={{ fontFamily: t.hero.fontFamily, fontSize: 32, letterSpacing: -1, color: colors.bonnet, marginTop: 4 }}
/>
```

Leave the CTA label as plain text — it is a button, and animating its label fights the press feedback.

- [ ] **Step 5: Run the whole suite**

Run: `npm test && npx tsc --noEmit`
Expected: clean, all PASS. The Task 15 assertions on `Log 610 kcal` are unaffected because the CTA was not changed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: animate ring dashoffset and cross-fade the result number"
```

---

## Task 17: Undesigned states and a11y sweep

**Files:**
- Create: `docs/design-questions.md`
- Modify: `app/(tabs)/index.tsx`, `app/detect.tsx`, `app/scan.tsx` as needed

**Interfaces:**
- Produces: a written list of blocked copy decisions for the design owner.

- [ ] **Step 1: Write the open-questions doc**

Create `docs/design-questions.md`:

```markdown
# Blocked on design — undesigned states

`design/HANDOFF.md` lists these as deliberately not designed and says to flag
rather than guess, because the tone is specific. Each is built structurally with
placeholder copy marked `TODO(design)` in the source.

| State | Where | What is needed |
|---|---|---|
| Low-confidence recognition (<70%) | `app/detect.tsx` | Copy for an uncertain match, and whether the CTA changes. |
| Dish not found | not yet routed | Copy + whether it routes to the library or to manual entry. |
| Camera permission denied | `app/scan.tsx` | Copy for the denied state and the re-request affordance. |
| No meals logged today | `app/(tabs)/index.tsx` | Empty-state copy for the Today list. |
| Over-target day | `app/(tabs)/index.tsx` | Whether the ring, the number, or neither changes treatment. |
| Offline sync-pending | not yet built | Indicator placement and copy. |
| Paywall purchase failure | out of phase 1 | — |
| Only one item detected | `app/detect.tsx` | How a pair logger presents a single item. |

## Other open questions

1. **`pidginCopy`** — the mock carries an undocumented prop swapping the scan
   hint to Pidgin ("Soup and swallow together — no need snap them one by one.").
   Is Pidgin a supported locale, and if so what is its scope?
2. **Inter 650** — the handoff specifies weight 650 for row titles. No static
   Inter face ships at 650; this build uses `Inter_600SemiBold`. Acceptable, or
   should the variable font be bundled?
3. **Free tier** — screen 09 states one scan a day free. Unconfirmed, and not
   implemented in phase 1.
```

- [ ] **Step 2: Confirm every placeholder is marked**

Run: `grep -rn "TODO(design)" app/ src/`
Expected: at least the empty-today, camera-denied and low-confidence sites appear.

- [ ] **Step 3: Confirm no raw hex leaked into components**

Run: `grep -rnE "#[0-9A-Fa-f]{6}" src/components/ app/`
Expected: no matches outside `src/theme/tokens.ts`. Any hit is a token violation — fix it.

- [ ] **Step 4: Give the number boxes room to grow**

The spec says numbers are the content of this app and must scale with Dynamic Type, and that the Archivo display sizes are the ones most likely to break layout. Every fixed-height container holding a number needs a floor, not a fixed height.

In `src/components/SummaryCard.tsx`, the ring centre must not clip its label at large text sizes — change the centre `View` to:

```tsx
<View style={{ alignItems: 'center', minHeight: 44, justifyContent: 'center' }}>
```

In `src/components/MealRow.tsx`, let the row grow instead of clipping — replace the row `View` style with:

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 70 }}>
```

and add `numberOfLines={2}` to the meal title so a long dish name wraps rather than truncating mid-word.

Cap the very largest display sizes so a 200% text setting cannot push the hero number off screen — in `app/portion.tsx` and `src/components/SummaryCard.tsx`, add `maxFontSizeMultiplier={1.6}` to the Archivo number `Text` nodes only. Body and label text keeps unrestricted scaling.

- [ ] **Step 5: Run the full suite**

Run: `npm test && npx tsc --noEmit`
Expected: clean, all PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: give number boxes room for Dynamic Type; record design questions"
```

---

## Verification Summary

What can be verified on the Windows host:

```bash
npm test          # portion, rings, totals, store, FoodTile, ProgressRing, Stepper, Toast, Portion screen
npx tsc --noEmit  # types
npx expo start    # bundles; preview via Expo Go on a physical iPhone
```

What **cannot** be verified here, and must not be claimed:

- iOS simulator rendering
- Real camera capture and permission flows
- Blur fidelity (`expo-blur` renders differently on iOS vs the web preview)
- Dynamic Type behaviour at large accessibility sizes
- Final font rendering and tracking

Hand these to a Mac or an EAS build before calling the phase done.
