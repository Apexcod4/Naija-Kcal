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

## Logging input methods — two of four are blocked on a native build

Competitive input (Amy, a shipping Nigerian-food tracker) offers four ways to
log: type, voice, barcode and menu scan. Naija Kcal had camera and library
only. Text and barcode are now built; the other two cannot be.

| Method | State | Blocker |
|---|---|---|
| Type a meal | **Built** | — |
| Barcode | **Built** (scan works; lookup does not) | No barcode-to-product table ships. The free online ones are network calls, which would break the "0 MB per scan" claim screen 02 makes. Unrecognised codes say so rather than reaching for the network. |
| Voice | Slot visible, disabled | `expo-speech-recognition` is a native module Expo Go does not bundle. Enabling it ends on-device testing until an EAS build exists. |
| Menu scan | Slot visible, disabled | Needs OCR (ML Kit or cloud) plus the buka price dataset, already deferred. |

**Design question raised by this work:** the bottom of the home screen now
carries three floating objects — the nav pill, the `bonnet` scan FAB, and the
input bar — consuming roughly 160px of a 852px screen. The handoff is explicit
that the pill/FAB split is intentional ("logging is not a fourth tab"), but it
was written before a text input existed. The input bar's own scan button was
removed to avoid duplicating the FAB, but the crowding is a visual judgment
that needs a look on a real device.

**Worth stealing from Amy:** it shows a per-estimate confidence score and its
sourcing ("Confidence level 65 · Moderate — I searched for Nigerian yam and
stew nutrition and found research papers"). That is a better answer to the
provisional-data problem than this build's binary `verified` flag, because it
tells the user *how* uncertain a number is rather than merely that it is.

**Worth noting about Amy:** it logs Nigerian food in **cups** ("Boiled Yam
(1.5 cups)", "Tomato-based Stew (0.5 cup)") and never asks what share of a
shared bowl was the user's. The dish recognition is ahead of ours; the unit
model is the gap this product exists to fill.

## Accuracy: the eval harness, and why fuzzy matching is not coming

`npm run eval` measures `matchPair` against 23 hard, real-world cases in
`evals/matchPair.cases.ts` — Pidgin, inline quantities, regional names,
misspellings, and phrasings taken from a competitor's real logs. It prints an
accuracy figure and guards a floor, so the number can only go up.

**Baseline was 67%. It is now 100%**, and every point came from unglamorous
changes: an `aliases` field on `Dish`, adding `n` as a separator, and a
stricter matching rule. Nothing clever was added.

**The rule change that mattered most.** The matcher used to resolve a token
against any *fragment* of a dish name, so `"yam and stew"` returned Pounded
yam and logged 320 kcal for a plate of boiled yam. A confident wrong answer is
worse than no answer in a tracker. A token must now be, contain, or alias a
whole dish name, and an ingredient match must be unambiguous — `"yam"` appears
in both *Pounded yam* and *Yam flour*, so it resolves to neither.

**Fuzzy matching is deliberately not used, and should not be added.** The
eval carries an adversarial case, `"ora and eba"`. Ora soup and Oha soup are
different real Nigerian dishes **one character apart**; eba/ewa and efo/efa
are the same story. Edit-distance matching would resolve `ora → oha` and log
the wrong soup with full confidence. This domain has a dense namespace of
short, near-identical words, which is exactly where fuzzy matching does
damage. Misspellings are handled by curated aliases instead — a finite,
reviewable list.

**Judge quality.** One original case expected `partial(moi-moi)` for
`"moi moi and pap"`. That expectation was wrong — street food is not half a
pair — and the code was right. Worth remembering that a failing eval case is
sometimes a flawed judge, not a defect.

**Next for accuracy:** log user corrections and convert them into eval cases,
so the case set grows from real misses rather than imagination.

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
