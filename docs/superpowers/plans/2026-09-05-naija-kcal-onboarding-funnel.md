# Naija Kcal Onboarding Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 9-screen 1e onboarding funnel, persist the profile it produces, and gate the core loop behind it — so the portion maths reads real calibration data instead of the phase-1 stub.

**Architecture:** A new `app/(onboarding)/` route group with a shared progress shell. All derived maths (BMR, TDEE, macro split, unit conversion) lives in pure, React-free modules under `src/logic/` and is built test-first. The profile moves from an in-memory zustand default to an AsyncStorage-persisted slice; the root layout routes to the funnel whenever onboarding is incomplete.

**Tech Stack:** Existing stack plus `@react-native-async-storage/async-storage` and zustand's `persist` middleware.

**Spec:** `design/HANDOFF.md` §1e (the 9-screen table) and §"Design Tokens". Phase 1 design doc: `docs/superpowers/specs/2026-09-05-naija-kcal-core-loop-design.md`.

## Global Constraints

- Everything in the phase-1 plan's Global Constraints still applies: tokens only (no literal colours), 44px minimum tap targets, copy verbatim from the handoff, `npx expo install` for dependencies, no claims of iOS verification from this host.
- **Onboarding gutter is 24px**, not the in-app 22px. The wider gutter deliberately signals a different mode.
- **Screen 01 has no progress bar** — the user has not entered a funnel yet. Progress starts at screen 03.
- Progress values are fixed by the handoff: **03 = 14%, 04 = 28%, 05 = 42%, 06 = 56%**. Screens 07-09 are the payoff and carry no bar.
- **Screens 08 and 09 are UI-only.** No authentication, no payment. Buttons advance or dismiss; they must not appear to transact. Add a `TODO(phase-3)` at each dead button.
- **No free-tier gating.** The paywall renders; nothing is blocked behind it.
- Every interactive surface uses `PressableScale`, not bare `Pressable`.

## Decisions this plan locks

| Decision | Choice | Why |
|---|---|---|
| Auth + paywall | UI only, non-functional | Confirmed 2026-09-05. Real rails need a backend and their own decisions. |
| Persistence | AsyncStorage via zustand `persist` | Confirmed. Profile data is not secret; secure-store is for tokens later. |
| Free tier | No gating | Confirmed. Handoff open decision #3 stays open. |
| BMR formula | **Mifflin-St Jeor** + activity multiplier | The handoff gives an output (2583) but never a formula. Mifflin-St Jeor is the current clinical default. **Flagged for design review.** |
| Macro targets | Ratio of the computed target: **35% carbs / 30% protein / 35% fat** | The mock's 390C/200P/70F sum to 2990 kcal against a 2583 target — they do not reconcile. A ratio keeps them internally consistent at any target. **Flagged for design review.** |

---

## File Structure

| File | Responsibility |
|---|---|
| `src/logic/body.ts` | PURE — Mifflin-St Jeor BMR, activity multiplier, TDEE, goal adjustment, macro split. |
| `src/logic/units.ts` | PURE — cm↔ft/in, kg↔lb conversion and display formatting. |
| `src/state/useAppStore.ts` | Extended: AsyncStorage persistence, `onboarding` slice, `completeOnboarding()`. |
| `src/components/onboarding/ProgressBar.tsx` | The 4px bonnet progress track. |
| `src/components/onboarding/OptionRow.tsx` | Selectable row used by screens 03 and 08. |
| `src/components/onboarding/ValuePicker.tsx` | Height/weight/age picker with neighbours at 40% opacity. |
| `src/components/onboarding/Segmented.tsx` | Metric/Imperial and activity-band segmented control. |
| `app/(onboarding)/_layout.tsx` | Stack + shared gutter/progress shell. |
| `app/(onboarding)/01-scan.tsx` … `09-paywall.tsx` | The nine screens. |

---

## Task 1: Persist the profile

**Files:**
- Modify: `src/state/useAppStore.ts`, `src/state/useAppStore.test.ts`
- Create: `src/state/storage.ts`

**Interfaces:**
- Produces: extended `Profile` type; `useAppStore` gains `onboardingComplete: boolean`, `setProfile(patch: Partial<Profile>)`, `completeOnboarding()`, `resetOnboarding()`; store is wrapped in `persist`.

- [ ] **Step 1: Install AsyncStorage**

```bash
npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 1b: Extend the Profile type**

The phase-1 `Profile` has no field for anything the funnel collects, so
`setProfile` would have nothing to write. In `src/types.ts`, extend it:

```ts
import { Activity, Goal } from './logic/body';
import { System } from './logic/units';

export type Profile = {
  // Collected by onboarding
  goal: Goal;
  sex: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  age: number;
  activity: Activity;
  unitSystem: System;
  // Computed from the above
  dailyTarget: number;
  macroTargets: { carbs: number; protein: number; fat: number };
  // Calibrated units
  wrapGrams: number;
  ladleMl: number;
  dericasPerPlate: number;
  householdSize: number;
  streak: number;
};
```

Extend `DEFAULT_PROFILE` in `src/data/seed.ts` to match, keeping the existing
values and adding: `goal: 'gain'`, `sex: 'male'`, `heightCm: 180`,
`weightKg: 80`, `age: 30`, `activity: 'moderate'`, `unitSystem: 'metric'`.
These are the mock's persona and keep every phase-1 test passing unchanged.

- [ ] **Step 2: Write the failing tests**

Append to `src/state/useAppStore.test.ts`:

```ts
test('a fresh install has not completed onboarding', () => {
  expect(useAppStore.getState().onboardingComplete).toBe(false);
});

test('setProfile merges rather than replacing', () => {
  useAppStore.getState().setProfile({ wrapGrams: 300 });
  const p = useAppStore.getState().profile;
  expect(p.wrapGrams).toBe(300);
  expect(p.ladleMl).toBe(180); // untouched
});

test('completing onboarding flips the gate', () => {
  useAppStore.getState().completeOnboarding();
  expect(useAppStore.getState().onboardingComplete).toBe(true);
});

test('calibrated units feed the portion maths', () => {
  useAppStore.getState().setProfile({ wrapGrams: 300 });
  expect(useAppStore.getState().profile.wrapGrams).toBe(300);
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `npm test -- useAppStore`
Expected: FAIL — `onboardingComplete` is undefined.

- [ ] **Step 4: Add the storage adapter**

Create `src/state/storage.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Profile and meal data only — nothing secret. Auth tokens, when they exist,
 * belong in expo-secure-store instead.
 */
export const appStorage = createJSONStorage(() => AsyncStorage);
```

- [ ] **Step 5: Wrap the store in persist**

In `src/state/useAppStore.ts`, import `persist` from `zustand/middleware` and the adapter, add `onboardingComplete: false` plus the three actions, and wrap the creator:

```ts
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({ /* ...existing state and actions... */ }),
    {
      name: 'naija-kcal',
      storage: appStorage,
      // Meals are day-scoped and toast is ephemeral; only durable data persists.
      partialize: (s) => ({ profile: s.profile, onboardingComplete: s.onboardingComplete }),
    }
  )
);
```

Add the actions:

```ts
onboardingComplete: false,
setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
completeOnboarding: () => set({ onboardingComplete: true }),
resetOnboarding: () => set({ onboardingComplete: false, profile: DEFAULT_PROFILE }),
```

`resetAll` must also reset `onboardingComplete` to `false`.

- [ ] **Step 6: Mock AsyncStorage in jest**

Add to `jest.config.js` `setupFiles`:

```js
setupFiles: ['<rootDir>/jest.setup.js'],
```

Create `jest.setup.js`:

```js
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

- [ ] **Step 7: Run to verify they pass**

Run: `npm test -- useAppStore`
Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: persist profile and onboarding state to AsyncStorage"
```

---

## Task 2: Body maths

**Files:**
- Create: `src/logic/body.ts`, `src/logic/body.test.ts`

**Interfaces:**
- Produces:
  - `type Goal = 'lose' | 'gain' | 'maintain' | 'clinical'`
  - `type Activity = 'low' | 'moderate' | 'high'`
  - `bmr(sex: 'male' | 'female', kg: number, cm: number, age: number): number`
  - `tdee(bmrValue: number, activity: Activity): number`
  - `dailyTarget(tdeeValue: number, goal: Goal): number`
  - `macroTargets(target: number): { carbs: number; protein: number; fat: number }`

- [ ] **Step 1: Write the failing tests**

Create `src/logic/body.test.ts`:

```ts
import { bmr, tdee, dailyTarget, macroTargets, ACTIVITY_MULTIPLIER } from './body';

describe('bmr — Mifflin-St Jeor', () => {
  test('male: 10w + 6.25h - 5a + 5', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(bmr('male', 80, 180, 30)).toBe(1780);
  });

  test('female: 10w + 6.25h - 5a - 161', () => {
    // 10*65 + 6.25*165 - 5*30 - 161 = 650 + 1031.25 - 150 - 161 = 1370.25 -> 1370
    expect(bmr('female', 65, 165, 30)).toBe(1370);
  });
});

describe('tdee', () => {
  test('applies the activity multiplier', () => {
    expect(tdee(1780, 'low')).toBe(Math.round(1780 * ACTIVITY_MULTIPLIER.low));
    expect(tdee(1780, 'high')).toBeGreaterThan(tdee(1780, 'low'));
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

  test('never returns a dangerous floor', () => {
    expect(dailyTarget(1200, 'lose')).toBe(1200);
  });
});

describe('macroTargets', () => {
  test('splits the target and reconciles back to it', () => {
    const m = macroTargets(2583);
    const kcal = m.carbs * 4 + m.protein * 4 + m.fat * 9;
    // The mock's own numbers did not reconcile; a ratio always does.
    expect(Math.abs(kcal - 2583)).toBeLessThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- body`
Expected: FAIL — cannot resolve `./body`.

- [ ] **Step 3: Implement**

Create `src/logic/body.ts`:

```ts
export type Goal = 'lose' | 'gain' | 'maintain' | 'clinical';
export type Activity = 'low' | 'moderate' | 'high';

export const ACTIVITY_MULTIPLIER: Record<Activity, number> = {
  low: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const DEFICIT = 500;
const SURPLUS = 300;
/** Below this, a computed deficit is unsafe to apply automatically. */
const FLOOR = 1400;

/**
 * Mifflin-St Jeor. The handoff supplies a target (2583) but never a formula,
 * so this choice is flagged in docs/design-questions.md.
 */
export function bmr(sex: 'male' | 'female', kg: number, cm: number, age: number): number {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

export function tdee(bmrValue: number, activity: Activity): number {
  return Math.round(bmrValue * ACTIVITY_MULTIPLIER[activity]);
}

export function dailyTarget(tdeeValue: number, goal: Goal): number {
  if (goal === 'lose') {
    const reduced = tdeeValue - DEFICIT;
    // Never prescribe a deficit that lands under the safety floor; hold at
    // maintenance instead and let a human decide.
    return reduced < FLOOR ? tdeeValue : reduced;
  }
  if (goal === 'gain') return tdeeValue + SURPLUS;
  return tdeeValue;
}

/**
 * A ratio rather than fixed grams. The mock's 390C/200P/70F sum to 2990 kcal
 * against a 2583 target — they were authored independently and do not
 * reconcile. Flagged in docs/design-questions.md.
 */
export function macroTargets(target: number) {
  return {
    carbs: Math.round((target * 0.35) / 4),
    protein: Math.round((target * 0.3) / 4),
    fat: Math.round((target * 0.35) / 9),
  };
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test -- body`
Expected: all PASS. If the `dailyTarget` floor branch reads awkwardly, simplify it to `Math.max(FLOOR, tdeeValue - DEFICIT)` and adjust the floor test to match — but keep a test proving a low TDEE is not driven below the floor.

- [ ] **Step 5: Commit**

```bash
git add src/logic/body.ts src/logic/body.test.ts
git commit -m "feat: add BMR, TDEE and macro-split maths"
```

---

## Task 3: Unit conversion

**Files:**
- Create: `src/logic/units.ts`, `src/logic/units.test.ts`

**Interfaces:**
- Produces: `cmToFtIn(cm)`, `ftInToCm(ft, inches)`, `kgToLb(kg)`, `lbToKg(lb)`, `formatHeight(cm, system)`, `formatWeight(kg, system)`

- [ ] **Step 1: Write the failing tests**

Create `src/logic/units.test.ts`:

```ts
import { cmToFtIn, ftInToCm, kgToLb, lbToKg, formatHeight, formatWeight } from './units';

test('converts height both ways', () => {
  expect(cmToFtIn(180)).toEqual({ ft: 5, inches: 11 });
  expect(ftInToCm(5, 11)).toBe(180);
});

test('rolls 12 inches into a foot', () => {
  // 182.9cm is 6'0", not 5'12".
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm test -- units`
Expected: FAIL — cannot resolve `./units`.

- [ ] **Step 3: Implement**

Create `src/logic/units.ts`:

```ts
export type System = 'metric' | 'imperial';

const CM_PER_INCH = 2.54;
const LB_PER_KG = 2.20462;

export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  // Rounding can land on 12 inches; roll it into the next foot.
  return { ft: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * CM_PER_INCH);
}

export const kgToLb = (kg: number): number => Math.round(kg * LB_PER_KG);
export const lbToKg = (lb: number): number => Math.round(lb / LB_PER_KG);

export function formatHeight(cm: number, system: System): string {
  if (system === 'metric') return `${cm} cm`;
  const { ft, inches } = cmToFtIn(cm);
  return `${ft}'${inches}"`;
}

export function formatWeight(kg: number, system: System): string {
  return system === 'metric' ? `${kg} kg` : `${kgToLb(kg)} lb`;
}
```

- [ ] **Step 4: Run to verify they pass**

Run: `npm test -- units`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/logic/units.ts src/logic/units.test.ts
git commit -m "feat: add metric/imperial conversion"
```

---

## Task 4: Onboarding shell and shared controls

**Files:**
- Create: `app/(onboarding)/_layout.tsx`, `src/components/onboarding/ProgressBar.tsx`, `src/components/onboarding/OptionRow.tsx`, `src/components/onboarding/Segmented.tsx`, `src/components/onboarding/OnboardingScreen.tsx`
- Create: `src/components/onboarding/ProgressBar.test.tsx`

**Interfaces:**
- Produces:
  - `<ProgressBar percent: number />`
  - `<OptionRow title icon? selected onPress subtitle? accent? />`
  - `<Segmented options: {value,label}[] value onChange />`
  - `<OnboardingScreen progress?: number title? children footer />` — the shared 24px-gutter shell with the CTA pinned bottom

- [ ] **Step 1: Write the failing ProgressBar test**

Create `src/components/onboarding/ProgressBar.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import ProgressBar from './ProgressBar';

test('reports progress to assistive tech', () => {
  const { getByRole } = render(<ProgressBar percent={42} />);
  expect(getByRole('progressbar').props.accessibilityValue).toMatchObject({ now: 42, min: 0, max: 100 });
});

test('clamps out-of-range values', () => {
  const { getByRole } = render(<ProgressBar percent={140} />);
  expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- ProgressBar`
Expected: FAIL — cannot resolve `./ProgressBar`.

- [ ] **Step 3: Implement ProgressBar**

Create `src/components/onboarding/ProgressBar.tsx`:

```tsx
import { View } from 'react-native';
import { colors } from '../../theme/tokens';

export default function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}
      style={{ height: 4, borderRadius: 2, backgroundColor: colors.ringTrack }}
    >
      <View
        style={{ width: `${clamped}%`, height: 4, borderRadius: 2, backgroundColor: colors.bonnet }}
      />
    </View>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- ProgressBar`
Expected: PASS.

- [ ] **Step 5: Implement the shared shell**

Create `src/components/onboarding/OnboardingScreen.tsx`. Note the **24px** gutter — wider than the in-app 22px, deliberately signalling a different mode:

```tsx
import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Bloom from '../Bloom';
import { colors, space } from '../../theme/tokens';
import { type as t } from '../../theme/typography';
import ProgressBar from './ProgressBar';

type Props = {
  /** Omit entirely on screens that carry no bar (01, 02, 07, 08, 09). */
  progress?: number;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function OnboardingScreen({ progress, title, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.pot }}>
      <Bloom style={{ right: -100, top: -70 }} />

      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: space.gutterOnboarding }}>
        {progress !== undefined ? <ProgressBar percent={progress} /> : null}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 24,
          paddingHorizontal: space.gutterOnboarding,
          paddingBottom: 140,
          gap: 20,
        }}
      >
        {title ? <Text style={t.screenTitle}>{title}</Text> : null}
        {children}
      </ScrollView>

      {footer ? (
        <View
          style={{
            position: 'absolute',
            left: space.gutterOnboarding,
            right: space.gutterOnboarding,
            bottom: insets.bottom + 20,
            gap: 12,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 6: Implement OptionRow and Segmented**

Create `src/components/onboarding/OptionRow.tsx`:

```tsx
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import PressableScale from '../PressableScale';
import { colors, material, radii, space } from '../../theme/tokens';
import { type as t } from '../../theme/typography';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  selected: boolean;
  onPress: () => void;
};

export default function OptionRow({ title, subtitle, icon, selected, onPress }: Props) {
  const ink = selected ? colors.bonnetInk : colors.cream;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      scaleTo={0.985}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 64,
        borderRadius: radii.card,
        paddingHorizontal: space.cardPad,
        paddingVertical: 14,
        backgroundColor: selected ? colors.bonnet : material.glass.backgroundColor,
        borderWidth: selected ? 1 : material.glass.borderWidth,
        borderColor: selected ? colors.bonnet : material.glass.borderColor,
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={[t.rowTitle, { fontSize: 16, color: ink }]}>{title}</Text>
        {subtitle ? (
          <Text style={[t.rowMeta, { color: selected ? colors.bonnetInk : colors.muted, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}
```

Create `src/components/onboarding/Segmented.tsx`:

```tsx
import { Text, View } from 'react-native';
import PressableScale from '../PressableScale';
import { colors, material, radii } from '../../theme/tokens';
import { type as t } from '../../theme/typography';

type Option<T> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export default function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        gap: 4,
        borderRadius: radii.compact,
        backgroundColor: material.glass.backgroundColor,
        borderWidth: material.glass.borderWidth,
        borderColor: material.glass.borderColor,
      }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <PressableScale
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            scaleTo={0.97}
            style={{
              flex: 1,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.tileSm + 2,
              backgroundColor: selected ? colors.bonnet : 'transparent',
            }}
          >
            <Text style={[t.rowTitle, { color: selected ? colors.bonnetInk : colors.cream }]}>
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 7: Add the route group layout**

Create `app/(onboarding)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/tokens';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.pot },
        animation: 'slide_from_right',
        animationDuration: 320,
        gestureEnabled: false, // a funnel should not be swipe-dismissable
      }}
    />
  );
}
```

- [ ] **Step 8: Verify**

Run: `npm test && npx tsc --noEmit`
Expected: clean, all PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add onboarding shell, progress bar and shared controls"
```

---

## Task 5: Screens 01 and 02 — scan first, then the proof beat

The whole redesign rests on these two: the user scans a real plate *before* being asked anything, which is what replaces Cal AI's persuasion block.

**Files:**
- Create: `app/(onboarding)/01-scan.tsx`, `app/(onboarding)/02-proof.tsx`

- [ ] **Step 1: Build screen 01**

No progress bar — the user has not entered a funnel yet. Reuse the live camera treatment from `app/scan.tsx` (corner brackets, `ugu` pill), but the pill reads **"No account needed"**, the title is **"Scan your dinner right now"**, and a secondary text button reads **"Or skip the demo"**. Shutter routes to `/02-proof`; skip routes to `/03-goal`.

Create `app/(onboarding)/01-scan.tsx` following `app/scan.tsx`'s structure exactly — camera fill, `CornerBrackets`, top pill, bottom title block, 82px shutter with the 5px `colors.shutterRing` border and `haptic="medium"`.

- [ ] **Step 2: Build screen 02**

Create `app/(onboarding)/02-proof.tsx`. No progress bar. Contents in order:

- Eyebrow **"MATCHED OFFLINE IN 0.4s"** in `colors.uguText`.
- Result headline naming the dish, kcal in `colors.bonnet` at `type.hero` scale.
- A three-row spec list in a `GlassCard`: **"340 dishes on this phone"**, **"0 MB of data per scan"**, **"Measured in wraps, ladles and dericas"** — each with a `ugu` check tile.
- CTA **"Set up my targets"** → `/03-goal`.

This screen replaces Cal AI's entire comparison-chart-and-objections block; keep it short and factual.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add onboarding screens 01 scan-first and 02 proof beat"
```

---

## Task 6: Screen 03 — goal

**Files:**
- Create: `app/(onboarding)/03-goal.tsx`

- [ ] **Step 1: Build the screen**

`OnboardingScreen` with `progress={14}` and title **"What are you working towards?"**. Four `OptionRow`s writing `goal` to the store:

| Option | Value | Note |
|---|---|---|
| Lose weight | `lose` | |
| Gain weight | `gain` | selected by default in the mock |
| Maintain | `maintain` | |
| Manage sugar or BP | `clinical` | icon tinted `colors.sky` — the clinical audience is first-class here, not an afterthought |

CTA **"Continue"** → `/04-body`, disabled until a selection exists.

This screen merges four Cal AI screens (gender, goal, workouts, attribution) into one.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: add onboarding screen 03 goal"
```

---

## Task 7: Screen 04 — body and activity

**Files:**
- Create: `app/(onboarding)/04-body.tsx`, `src/components/onboarding/ValuePicker.tsx`

- [ ] **Step 1: Build ValuePicker**

Create `src/components/onboarding/ValuePicker.tsx`: a card showing the selected value in `type.ringValue` with the neighbouring values above and below at **40% opacity**, driven by a horizontal or vertical scroll. Props: `{ label, value, min, max, step, onChange, format }`.

- [ ] **Step 2: Build the screen**

`OnboardingScreen` with `progress={28}` and title **"Your body and your week"**. In order:

- `Segmented` for **Metric / Imperial**, writing to local state and reformatting the pickers via `src/logic/units.ts`.
- Three `ValuePicker` cards: **height**, **weight**, **age**.
- A three-way `Segmented` for activity: **Low / Moderate / High**.
- A `ugu`-tinted `StatusCard` stating the computed baseline burn, live from `bmr()` and `tdee()`.

CTA **"Continue"** → `/05-units`, writing height/weight/age/activity to the profile.

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: add onboarding screen 04 body and activity"
```

---

## Task 8: Screen 05 — calibrate your units

This is the product's differentiator made explicit, and the screen that produces the numbers the portion maths multiplies by.

**Files:**
- Create: `app/(onboarding)/05-units.tsx`

- [ ] **Step 1: Build the screen**

`OnboardingScreen` with `progress={42}` and title **"Calibrate your units"**. A `bonnet` badge reads **"ONLY IN NAIJA KCAL"**.

- **Wrap size** — three tappable circles whose *rendered diameters are 38 / 54 / 66px*, labelled **140 g / 210 g / 300 g**. The handoff is explicit: size the swatch, don't just print the number. Writes `wrapGrams`.
- **Rice plate** — a slider from **0.5 to 3**, default **1.5**, in dericas. Writes `dericasPerPlate`.
- Escape hatch: a text button **"Not sure? Use the average"** which writes 210 g / 1.5 dericas and advances.
- CTA **"Save my units"** → `/06-household`.

Install the slider:

```bash
npx expo install @react-native-community/slider
```

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: add onboarding screen 05 unit calibration"
```

---

## Task 9: Screen 06 — household

**Files:**
- Create: `app/(onboarding)/06-household.tsx`

- [ ] **Step 1: Build the screen**

`OnboardingScreen` with `progress={56}` and title **"Who eats from the pot?"**. A large stepper for adult count rendered at `fontFamily: fonts.display, fontSize: 64`, a member list of initial tiles, and the key note verbatim:

> "Cooking alone? Set this to 1 and the share step disappears from logging."

That sentence is load-bearing — it is the only place the app explains why the share step sometimes vanishes. Writes `householdSize`. CTA **"Continue"** → `/07-plan`.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: add onboarding screen 06 household"
```

---

## Task 10: Screen 07 — plan ready

**Files:**
- Create: `app/(onboarding)/07-plan.tsx`

- [ ] **Step 1: Build the screen**

No progress bar — this is the payoff. Eyebrow **"BUILT FROM 6 ANSWERS"** in `colors.uguText`: name the cost you didn't charge.

- A full `ProgressRing` at the plan-ready geometry (viewBox 100, r 42, stroke 11, circumference 264 — add this as `RING.planReady` in `src/logic/rings.ts`) showing the computed `dailyTarget`.
- Three macro cards from `macroTargets()`.
- **"What that looks like"** — the target expressed as an actual day of food, using the handoff's example: akara 310 / jollof 847 / egusi 612 / 814 to spare. Compute the remainder from the real target rather than hardcoding 814.
- A `bonnet`-tinted card stating the date the goal is reached.

CTA **"Save my plan"** → writes `dailyTarget` and `macroTargets` to the profile, then routes to `/08-save`.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: add onboarding screen 07 plan ready"
```

---

## Task 11: Screens 08 and 09 — account and paywall (UI only)

**Neither screen authenticates or transacts.** Every button either advances or dismisses, and carries a `TODO(phase-3)` comment.

**Files:**
- Create: `app/(onboarding)/08-save.tsx`, `app/(onboarding)/09-paywall.tsx`

- [ ] **Step 1: Build screen 08**

Framed as backup, not signup. Title and body verbatim:

> "The app already works. This is only a backup — and it's the first thing we've asked you for."

Three `OptionRow`-style buttons: **Apple** (solid `colors.cream` fill), **Google**, **phone number** — the last is not optional in these markets. An explicit decline path: **"Not now — keep it on this phone only"**.

Then the iOS notification alert mock over a **55% scrim**, with the honest copy:

> "One nudge at dinner time. Nothing else."

All three sign-in buttons: `// TODO(phase-3): no authentication is wired.` They advance to `/09-paywall`.

- [ ] **Step 2: Build screen 09**

Headline is earned rather than generic:

> "You've logged one meal free. Keep going?"

- Four benefit rows.
- **Yearly** (accent fill): ₦1,250/mo · ₦15,000 once · **SAVE 62%**.
- **Monthly**: ₦3,300.
- Payment-method chips: **Card / Bank transfer / USSD / Apple Pay**. USSD and bank transfer are required in these markets, not decorative — render them with equal weight.
- Footer: **"No payment due now · cancel in two taps"**.

`// TODO(phase-3): no payment is wired.` The CTA calls `completeOnboarding()` and routes to `/(tabs)`.

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat: add onboarding screens 08 account and 09 paywall (UI only)"
```

---

## Task 12: Gate the app behind onboarding

**Files:**
- Modify: `app/_layout.tsx`
- Create: `src/__tests__/onboarding-gate.test.tsx`

**Interfaces:**
- Consumes: `onboardingComplete` from the store.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/onboarding-gate.test.tsx`:

```tsx
import { useAppStore } from '../state/useAppStore';
import { shouldShowOnboarding } from '../logic/gate';

test('a fresh install goes to the funnel', () => {
  useAppStore.getState().resetAll();
  expect(shouldShowOnboarding(useAppStore.getState())).toBe(true);
});

test('a completed profile goes straight to the app', () => {
  useAppStore.getState().resetAll();
  useAppStore.getState().completeOnboarding();
  expect(shouldShowOnboarding(useAppStore.getState())).toBe(false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- onboarding-gate`
Expected: FAIL — cannot resolve `../logic/gate`.

- [ ] **Step 3: Implement the gate predicate**

Create `src/logic/gate.ts`:

```ts
export function shouldShowOnboarding(state: { onboardingComplete: boolean }): boolean {
  return !state.onboardingComplete;
}
```

Keeping this a pure predicate rather than inlining `!onboardingComplete` in the layout means the routing rule is testable without rendering a navigator.

- [ ] **Step 4: Wire the redirect**

In `app/_layout.tsx`, read the store and the persist-hydration flag. Do not redirect until AsyncStorage has rehydrated, or a returning user will flash the funnel on every cold start:

```tsx
const hydrated = useAppStore.persist.hasHydrated();
const showOnboarding = useAppStore((s) => shouldShowOnboarding(s));

if (!fontsReady || !hydrated) return <View style={{ flex: 1, backgroundColor: colors.pot }} />;
```

Then register the group and use `<Redirect href="/(onboarding)/01-scan" />` when `showOnboarding` is true.

- [ ] **Step 5: Run the full suite**

Run: `npm test && npx tsc --noEmit`
Expected: clean, all PASS.

- [ ] **Step 6: Verify the app still bundles**

Run: `npx expo export --platform ios --output-dir .expo-export`
Expected: bundles with no error. Then `rm -rf .expo-export`.

- [ ] **Step 7: Update the design questions doc**

Add to `docs/design-questions.md`:

- **BMR formula** — the handoff gives a target (2583) but no formula. This build uses Mifflin-St Jeor with activity multipliers 1.375 / 1.55 / 1.725 and a 500 kcal deficit / 300 kcal surplus. Confirm.
- **Macro targets** — the mock's 390C/200P/70F sum to 2990 kcal against a 2583 target and do not reconcile. This build derives macros as 35/30/35 of the computed target. Confirm the split.
- **Sex input** — Mifflin-St Jeor needs it, but the handoff explicitly *merged away* Cal AI's gender screen. Currently defaulted; either the formula or the screen set needs to change.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: gate the core loop behind onboarding completion"
```

---

## Verification Summary

Runs on the Windows host: `npm test`, `npx tsc --noEmit`, `npx expo export --platform ios`.

Cannot be verified here, and must not be claimed: camera on screen 01, the ValuePicker scroll feel, slider drag, notification-permission alert appearance, and every animation. Preview via Expo Go.

**To re-run onboarding during testing**, call `useAppStore.getState().resetOnboarding()` from the dev menu, or clear the app's storage by deleting and reinstalling Expo Go's copy of the project.
