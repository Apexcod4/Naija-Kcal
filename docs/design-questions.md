# Blocked on design — undesigned states

`design/HANDOFF.md` lists these as deliberately not designed and says to flag
rather than guess, because the tone is specific. Each is built structurally
with placeholder copy marked `TODO(design)` in the source.

| State | Where | What is needed |
|---|---|---|
| Low-confidence recognition (<70%) | `app/detect.tsx` | Copy for an uncertain match, and whether the CTA changes. |
| Dish not found | `app/library.tsx`, `app/dish/[id].tsx` | Empty-search and unknown-id copy. Both now have structure and a TODO. |
| Camera permission denied | `app/scan.tsx` | Copy for the denied state and the re-request affordance. |
| No meals logged today | `app/(tabs)/index.tsx` | Empty-state copy for the Today list. |
| Over-target day | `app/(tabs)/index.tsx` | Whether the ring, the number, or neither changes treatment. |
| Offline sync-pending | not yet built | Indicator placement and copy. |
| Paywall purchase failure | out of phase 1 | — |
| Only one item detected | `app/detect.tsx` | How a pair logger presents a single item. |

## Onboarding funnel — formulas the handoff does not specify

The handoff's §1e describes all nine screens but never gives the arithmetic
behind screens 04 and 07. These three choices need confirming.

1. **BMR formula.** The handoff gives an output target (2583) but no formula.
   This build uses **Mifflin-St Jeor** with activity multipliers
   1.375 / 1.55 / 1.725, a 500 kcal deficit for "lose", a 300 kcal surplus for
   "gain", and a 1400 kcal floor below which no deficit is applied. Confirm.
2. **Macro targets.** The mock's 390C / 200P / 70F sum to **2990 kcal** against
   a **2583** target — they were authored independently and never reconciled.
   This build derives macros as **35% carbs / 30% protein / 35% fat** of the
   computed target, so they always reconcile. Confirm the split.
3. **Sex input.** Mifflin-St Jeor requires biological sex, but the handoff
   explicitly *merged away* Cal AI's gender screen. Resolved by adding a
   discreet Female/Male segmented control to screen 04, keeping the funnel at
   nine screens. Confirm this is acceptable, or switch to a sex-neutral
   formula (roughly a -78 constant) that never asks.

Also unspecified and currently placeholder:

- **Goal date** on screen 07 ("you reach your goal around <date>") uses a flat
  12 weeks. A real projection needs a target weight, which nothing collects.
- **Example day** on screen 07 uses the handoff's akara/jollof/egusi trio
  regardless of the computed target; only the "to spare" figure is derived.

## Dish library — the dataset is provisional and must be replaced

The handoff specifies **~340 dishes on device**. The design file supplies
roughly **eight**. `src/data/dishes.ts` currently holds **26**, of which **6** carry verified figures.

**Five soups carry the designer's own kcal figures** and are marked
`verified: true`: Egusi 290, Efo riro 240, Ogbono 265, Ewedu & gbegiri 185,
Banga 330 (all per 180 ml ladle). Pounded yam's 320 per wrap matches the
handoff's portion maths. **Every other number in that file is an estimate**
and is marked `verified: false`.

This matters more than usual here: the handoff names people managing blood
sugar and blood pressure as a target audience, and presenting invented carb
and calorie values to that audience as fact would be harmful. The UI
therefore labels unverified rows with an "estimate" tag in the list and a
`palm`-tinted warning card on the detail screen.

**What is needed:** a real 340-row dataset — name, category, unit, per-unit
kcal and macros, typical pairings, photo. Replacing `src/data/dishes.ts`
requires no UI changes.

Related: the search placeholder reads **"Search 26 dishes — works offline"**,
deriving the count from the table rather than hardcoding the design's "340",
so the app never claims a catalogue it does not ship. It will read 340
automatically once the real data lands.

## Other open questions

1. **`pidginCopy`** — the mock carries an undocumented prop that swaps the scan
   hint to Pidgin ("Soup and swallow together — no need snap them one by one.").
   Is Pidgin a supported locale, and if so what is its scope? Nothing else in
   the design has a Pidgin variant, so this looks like the start of a
   localisation axis rather than a one-off.
2. **Inter 650** — the handoff specifies weight 650 for row titles. No static
   Inter face ships at 650, so this build uses `Inter_600SemiBold`. Acceptable,
   or should the variable font be bundled?
3. **Free tier** — screen 09 states one scan a day free. Unconfirmed, and not
   implemented in phase 1.
4. **Diary history** — the week chart's non-today columns are seeded constants.
   A real per-day store is needed before this screen is truthful.
5. **Logged meal identity** — RESOLVED. Logged pairs now take their name from
   the pair itself, so a library-built egusi and eba logs as "Egusi & eba".
   Only the scanned pair is still fixed, pending the recognition model.

## Deviations from the mock (deliberate, already implemented)

The mock's `class Component extends DCLogic` is a prototype. Four behaviours
were corrected rather than transcribed:

1. **Single `extra` slot** — logging twice replaced the previous meal. Now a
   proper `Meal[]` append, matching the handoff's own data model.
2. **Unit string dropped the ladle count** — it interpolated only wraps, losing
   half the pair in a pair-logging app. Now names both.
3. **Hardcoded `19:05` timestamp** — now the real log time.
4. **`fmt()` handled only 0.5/1.5/2.5** — but the stepper range is 0–4 at step
   0.5, so `3.5` was reachable and rendered as the string "3.5" instead of
   `3½`. `formatUnit` now covers every half in range.
