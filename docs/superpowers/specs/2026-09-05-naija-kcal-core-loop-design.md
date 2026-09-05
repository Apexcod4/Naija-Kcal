# Naija Kcal — core loop (phase 1) design

Date: 2026-09-05
Status: approved for planning
Source: `design/HANDOFF.md`, `design/Naija Kcal Redesign.dc.html` (option `#1a`)

## Overview

Naija Kcal is a calorie tracker for West African and Caribbean food. Its
differentiator is **the unit of logging**, not the dish database: a meal is a
*pair* (soup + swallow), portioned in local units (wraps, ladles, dericas) that
the user calibrates once, then split by **share-of-bowl** so the remainder is
attributed to the household rather than to the user.

This phase builds the **1a core loop** — the reference implementation of the
in-app experience. Onboarding, the dish library, and the recognition model are
out of scope.

**In scope:** Home/Today, Scan, Detect, Portion, the log toast, and the floating
nav pill plus scan FAB — plus the **Diary and You tabs**. The latter two were
not named in the original scoping question, but a three-tab bar with two dead
tabs is not a shippable deliverable, and both are specified in the handoff in
sufficient detail to build.

## Decisions locked

| Decision | Choice | Rationale |
|---|---|---|
| Home direction | **1a — "Today"** | The handoff names 1a the reference implementation; it is the only option interactive in the mock, so it carries the least guesswork. 1b/1c/1d are explicitly mutually exclusive and are not built. |
| Tab set | **Home / Diary / You** | Follows 1a. Resolves the handoff's flagged conflict with screen 10. The dish library becomes a destination (from Detect's "Not right?" link and Scan's search tile), not a tab. |
| Framework | **Expo + TypeScript** | iOS-first product developed on a Windows host. Expo Go gives device preview without a Mac; EAS or a Mac is required for a real iOS build. |
| Navigation | **expo-router** | File-based nesting maps cleanly onto "tabs, with a stack pushed over them". |
| State | **zustand** | The portion result must update on every stepper tap with no debounce. Selector subscriptions re-render only the result card and CTA, not the screen. |
| Free tier | **Deferred** | Handoff open decision #3. No gating in phase 1. |

## Architecture

```
app/
  _layout.tsx              root stack: (tabs) + scan/detect/portion
  (tabs)/_layout.tsx       custom floating glass pill + separate scan FAB
  (tabs)/index.tsx         Home / Today
  (tabs)/diary.tsx
  (tabs)/you.tsx
  scan.tsx                 full-bleed camera
  detect.tsx
  portion.tsx              presented as a sheet over detect
src/
  theme/tokens.ts          colour, spacing, radii
  theme/typography.ts      named role styles (hero, screenTitle, eyebrow, ...)
  logic/portion.ts         PURE — pair maths, fraction formatter, clamping
  logic/rings.ts           PURE — dashoffset
  state/useAppStore.ts     meals, profile, portion draft, toast
  data/seed.ts             seeded meals + profile defaults
  components/
    GlassCard.tsx          three material variants
    Bloom.tsx              static ambient blur circle
    ProgressRing.tsx       react-native-svg
    ScrollFade.tsx
    Stepper.tsx
    Chip.tsx
    FoodTile.tsx           enamel plate + colour circle — the photo slot
    MealRow.tsx
    Toast.tsx
```

### Why the logic layer is pure

`logic/portion.ts` and `logic/rings.ts` contain no React and no imports from
the app. The handoff supplies exact expected outputs and says "implement
exactly", which makes this maths directly unit-testable. It is built
test-first; all UI sits on a verified core.

## Pure logic contracts

### Portion maths

Per-unit values are **user profile data**, not constants — they come from
onboarding calibration (stubbed in phase 1 with the mock's defaults).

```
swallow: 320 kcal, 72 C,  4 P,  1 F   per wrap  (210 g)
soup:    290 kcal,  9 C, 18 P, 22 F   per ladle (180 ml)

m = share / 100                       // share in {33, 50, 100}
kcal    = round((wraps*320 + ladles*290) * m)
carbs_g = round((wraps*72  + ladles*9)   * m)
protein = round((wraps*4   + ladles*18)  * m)
fat_g   = round((wraps*1   + ladles*22)  * m)
```

Steppers: step `0.5`, clamped `0..4`.

Fraction formatter: `0.5` renders as a half glyph, `1.5` as one-and-a-half,
`2.5` as two-and-a-half, otherwise the plain number. Rendered with true vulgar
fraction glyphs.

Portion result mini-bar widths, from the mock:
`carbW = min(100, round(c/3.9))`, `protW = min(100, round(p/2))`,
`fatW = min(100, round(f*1.4))`.

Share note: `share === 100` yields "Counted as your own bowl, not a split.";
otherwise "Split from a shared bowl — the rest goes to the household, not to
you."

### Ring maths

```
dashoffset = max(0, C - C * min(1, value / target))
```

Rings clamp at target. The Diary bar chart does **not** clamp — over-target
days turn `bonnet` and cap at 100% height.

| Context | viewBox | r | stroke | circumference |
|---|---|---|---|---|
| Home calories | 120 | 50 | 12 | 314 |
| Home macro | 52 | 21 | 7 | 132 |

## State model

```ts
profile: {
  dailyTarget: 2583,
  macroTargets: { carbs: 390, protein: 200, fat: 70 },
  wrapGrams: 210, ladleMl: 180, dericasPerPlate: 1.5,
  householdSize: 4, streak: 7,
}
meals: Meal[]        // seeded with 2; appended on log
draft: { wraps: 1, ladles: 1, share: 100 }
toast: { visible, message } | null
```

`Meal = { id, name, unitString, kcal, carbs, protein, fat, colour, photoUri?, time }`

Seeded meals (from the mock):

- Akara & pap — `3 balls · 1 cup · 08:15` — 310 / 38C / 11P / 14F — `#D89C44`
- Jollof rice, chicken — `1.5 derica · 12:40` — 847 / 96C / 44P / 31F — `#DA5121`

**Derived, never stored:** consumed kcal and macros (sum over `meals`),
remaining, every ring offset, the live pair totals, the CTA label, the share
note.

`share` is hidden entirely when `householdSize === 1`.

## Navigation and flow

```
Home --[scan FAB]--> Scan --[shutter]--> Detect --[Set your portion]--> Portion
  ^                    |                   |                              |
  +--[back]------------+   [back]----------+       [Log N kcal]-----------+
                                                        |
Home(Today) <-------------------------------------------+  + toast, 3.6s
```

Navigation position is owned by **expo-router**, not by the store — the mock's
`screen` and `tab` state fields have no equivalent here. Scan, Detect and
Portion are pushed above the tabs as a full-screen stack, so the tab bar is not
reachable during the logging flow; logging a meal dismisses that stack back to
Home/Today. The mock's "tab switch resets screen to home" is an artifact of its
single flat state object.

The nav pill (3 tabs) and the `bonnet` scan FAB are two distinct floating
objects — logging is deliberately not a fourth tab.

## Motion

- Screen push 300–350ms; Portion rises as a sheet over Detect, not a lateral push.
- Shutter to Detect: freeze frame, reveal recognition card upward, **60–80ms
  stagger** between the soup row and the swallow row — the stagger is what
  sells "it found two things".
- Ring fill: animate `dashoffset` on mount, 700ms ease-out. On log, animate
  old value to new; do not remount.
- Result number: cross-fade / digit roll ~150ms, no layout shift (value box
  has a fixed min width for this reason).
- Toast: slide up 12px + fade, 220ms; auto-dismiss 3.6s; a second log cancels
  and restarts the timer.
- Ambient bloom: **static**. Implemented as a pre-blurred layer, not a runtime
  blur over scrolling content.

## Accessibility

- Every tap target >= 44px. The mock's 34px steppers and 38px back buttons fail
  this; hit areas are expanded via `hitSlop` **without** changing visual size.
- No state is colour-only; all meaningful colour is paired with text or a number.
- Numbers are the content of this app and must scale with Dynamic Type. Every
  number box gets room to grow vertically.
- `bonnet` on `pot` is used only at >=11px/700 or >=14px, per the handoff.

## Deviations from the mock (deliberate)

The mock's logic class is a prototype; three behaviours are corrected rather
than transcribed:

1. **`extra` is a single slot** — logging twice replaces the meal. Corrected to
   a proper `Meal[]` append, matching the handoff's own `meals: Meal[]`.
2. **Unit string drops the ladle count** — it interpolates only `wraps`, which
   loses half the pair in a pair-logging app. Corrected to carry both.
3. **Hardcoded `19:05` timestamp** — replaced with the actual log time.

The mock also carries an undocumented `pidginCopy` prop with an alternate scan
hint. Noted, not built; it implies a localisation axis that needs a decision.

## Out of scope (phase 1)

Onboarding funnel (1e, 9 screens), dish library and dish detail, the 340-dish
on-device database, the on-device recognition model, sync and offline queue,
paywall and free-tier gating, buka price data, home options 1b/1c/1d.

Recognition is **stubbed**: `expo-camera` renders a real live preview; the
shutter freezes and routes to Detect with the mock's hardcoded egusi and
pounded-yam pair.

## States needing design input

The handoff explicitly says to flag these rather than guess, because the tone
is specific. Built structurally, copy left as marked TODOs:

low-confidence recognition (<70%), dish not found, camera permission denied,
empty Today list, over-target day, offline sync-pending, purchase failure, and
the pair-logger case where only one item is detected.

## Assets

- **Fonts** — Archivo (800/900) and Inter (400–800, incl. 650) bundled locally
  via `expo-font`. Inter 650 requires the variable font.
- **Icons** — inline SVG paths lifted from the design HTML, via
  `react-native-svg`, `currentColor` semantics preserved.
- **Food imagery** — every dish image in the mock is a placeholder gradient and
  **must not ship**. `FoodTile` accepts `photoUri` and falls back to `colour`,
  so photography lands as a data change.

## Testing

- Unit (jest): `logic/portion.ts` and `logic/rings.ts` — exact expected values
  from this spec, fraction formatting, 0..4 clamping, share multipliers, ring
  clamp-at-target.
- Component (`@testing-library/react-native`): stepper clamping through the UI,
  share-chip selection updating the CTA label, toast lifecycle and timer
  cleanup on unmount.
- Typecheck: `tsc --noEmit`.
- **Not verifiable on this host:** iOS simulator, real device rendering,
  camera. Device preview via Expo Go; iOS build needs a Mac or EAS.
