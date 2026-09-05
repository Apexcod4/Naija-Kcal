# Handoff: Naija Kcal — structural redesign

## Overview

Naija Kcal is an iOS calorie-tracking app for West African and Caribbean food, aimed at Lagos/Accra iPhone users, the UK/US/Canada diaspora eating home food, people managing blood sugar or blood pressure, and macro-tracking gym users.

The previous build (bundled as `reference-previous-version.html`) was structurally a clone of Cal AI's 30-screen funnel with a different palette. This redesign changes the product's core model rather than its skin:

**The differentiator is the unit of logging, not the dish database.** Cal AI logs one photographed item at a time in generic servings. Nigerian eating is a *pair* — soup plus swallow — served from a shared bowl and measured in wraps, dericas and ladles. So:

1. **Pair logging.** A scan recognises soup + swallow as one meal, not two items.
2. **Local units.** Portions are entered as wraps of swallow, ladles of soup, dericas of rice — calibrated once per user in onboarding, then reused forever.
3. **Share-of-bowl.** After portion entry, the user says how much of the shared bowl was theirs (⅓ / ½ / all). The remainder is attributed to the household, not to them.
4. **Offline-first.** 340 dishes ship on device (~12 MB); scanning uses 0 MB of data. This is surfaced prominently — it's a purchase driver in the target markets.
5. **Funnel cut 20 → 9 screens.** Trust is earned by letting the user scan a real plate *before* any question is asked, replacing Cal AI's persuasion block (comparison chart, "what's stopping you", trust beat) entirely.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes showing intended look and behaviour, not production code to copy directly.

`Naija Kcal Redesign.dc.html` is a single-file HTML design document containing five design options laid out on a canvas. It uses a small in-house streaming-component runtime (`<x-dc>`, `<sc-if>`, `<sc-for>`, a `Component extends DCLogic` class). **Do not port that runtime.** Read it as a spec.

The task is to **recreate these designs in the target codebase's existing environment** — SwiftUI, React Native, Expo, whatever the app is actually built in — using its established patterns, navigation, and component library. If no codebase exists yet, choose the most appropriate framework (for an iOS-first product with this much camera and on-device-model work, SwiftUI or Expo + a native vision module) and implement there.

The mock is a static 393 × 852 frame (iPhone 15/16 logical size). In the real app all of this must respond to safe-area insets and Dynamic Type; the fixed pixel offsets below are ratios to reproduce, not literal constants to hard-code.

## Fidelity

**High-fidelity.** Colours, typography, spacing, radii and copy are final. Recreate pixel-faithfully using the codebase's own primitives. The one deliberately unresolved area is **food imagery**: every dish photo in the mock is a coloured radial-gradient circle standing in for a real photograph. Those are placeholders — the shipping app needs real photography or the user's own camera capture in those slots. Do not ship the gradients.

---

## Design Tokens

### Colour — dark theme (primary)

| Token | Hex | Use |
|---|---|---|
| `pot` | `#0C0D0A` | App background |
| `pot-deep` | `#080906` | Camera / viewfinder background |
| `cream` | `#F7EDD8` | Primary text, light fills |
| `muted` | `#8E9082` | Secondary text, labels, inactive icons |
| `bonnet` | `#F24C1E` | Brand accent: CTAs, selection, progress, streak |
| `bonnet-ink` | `#180A04` | Text/icons **on** `bonnet` fills |
| `ugu` | `#7FA650` | Success, confidence scores, under-target bars |
| `ugu-text` | `#A8CC78` | `ugu` used as text on dark (raises contrast) |
| `palm` | `#E8A33D` | Carbs |
| `sky` | `#6B84F2` | Fat, water, clinical/medical accents |
| `line` | `rgba(245,233,208,.13)` | Hairline dividers inside cards |

### Colour — light "enamel" theme (option 1d)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F1E8D6` | Background |
| `enamel` | `#FBF7EE` | Card surface |
| `ink` | `#14150F` | Text, inverted hero card, dark pill nav |
| `bonnet-deep` | `#C13A12` | Accent on light ground (darkened for 4.5:1 contrast) |

`bonnet` `#F24C1E` must **not** be used as small text on `paper` — it fails contrast. Use `bonnet-deep` `#C13A12` for text and keep `#F24C1E` for fills only.

### Food-placeholder colours (replace with photography)

`#8A5A22` egusi/dark soup · `#5C7A38` efo riro/green soup · `#6D4B18` ogbono · `#3F5C24` ewedu · `#A8360F` banga · `#DA5121` jollof · `#D89C44` akara/pap · `#D8CDB4` pounded yam · `#E4D9BE` eba · `#C9BFA2` fufu · `#EFECE1` enamel plate rim

### Typography

Two families, both Google Fonts:

- **Archivo** — display. Weights 800/900 only. Always paired with negative tracking. Used for: numbers, headlines, CTA labels, dish kcal values.
- **Inter** — UI. Weights 400/500/600/650/700/800. Used for: body, labels, list rows, secondary text.

| Role | Family | Size | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Hero number (ledger/pot) | Archivo | 56–64 | 900 | −2.2 to −2.4 | `line-height: .94–.95` |
| Screen title | Archivo | 30 | 900 | −0.9 | `line-height: 1.14`, hand-broken over 2 lines |
| Detect title | Archivo | 29–31 | 900 | −1.0 | `line-height: 1.12` |
| Section title in-app | Archivo | 17–18 | 900 | −0.4 | e.g. "Today" |
| App name / nav title | Archivo | 24–25 | 900 | −0.7 | |
| Ring centre value | Archivo | 26 | 900 | −0.8 | |
| Metric value | Archivo | 14–22 | 900 | — | list-row kcal, macro grams |
| CTA label | Archivo | 17 | 800 | — | |
| Eyebrow / section label | Inter | 11 | 700 | +1.8 | uppercase, `muted` |
| Body / subtitle | Inter | 14.5 | 500 | — | `line-height: 1.45–1.55`, `muted` |
| List row title | Inter | 14.5–16 | 650 | −0.2 | |
| List row meta | Inter | 11.5–12.5 | 500 | — | `muted` |
| Option row title | Inter | 16 | 650 | −0.2 | |
| Chip / pill | Inter | 11–12.5 | 600–700 | — | |
| Tab label | Inter | 10 | 600 | — | |
| Status bar | Inter | 15 | 600 | — | |

Minimum type size anywhere: 10px (tab labels only). Nothing below 11px carries meaning.

### Spacing

Screen gutter **22px** (in-app screens) or **24px** (onboarding screens — the wider gutter signals a different mode). Card padding 18–19px; compact list card 12–14px vertical / 14–16px horizontal. Gap between stacked cards 9–11px. Gap between sections 22–26px. Gap in a row of 3 equal cards 9px.

### Radii

| Element | Radius |
|---|---|
| Phone frame | 46 |
| Hero / primary card | 26–28 |
| Standard card | 20–24 |
| Compact list card | 18–20 |
| Icon tile 30–38px | 10–12 |
| Icon tile 54–56px | 20 |
| Splash/feature tile 82–104px | 26–30 |
| CTA button (h 56) | 28 (full pill) |
| Tab bar (h 62) | 31 (full pill) |
| Stepper button (34–46px) | half of size (circle) |
| Chip / pill | 100 |
| Progress track / macro bar | 4–5 |

### Elevation & material

Three surface treatments, applied consistently:

**Glass card** (default surface on dark)
```
background: rgba(247,237,216,.07)
backdrop-filter: blur(22px) saturate(180%)
border: .5px solid rgba(247,237,216,.17)
```
A lighter variant `rgba(247,237,216,.06)` / border `rgba(247,237,216,.14)` is used for secondary/compact list cards. A heavier one (`blur(24px)`, border `.18`) is used for the tab bar and floating nav.

**Accent fill** (selected state, primary CTA)
```
background: #F24C1E
color: #180A04
box-shadow: 0 8px 26px rgba(242,76,30,.40)   /* selected row */
box-shadow: 0 10px 30px rgba(242,76,30,.42), inset 0 1px 0 rgba(255,255,255,.32)  /* CTA */
```

**Tinted status card** — for semantic messages. `rgba(<accent>,.10–.12)` fill with `rgba(<accent>,.28–.35)` border, using `ugu` for reassurance, `palm` for caution/explanation, `bonnet` for the primary computed result, `sky` for clinical.

**Ambient bloom** — every dark screen carries one blurred brand-orange circle behind the content, so the glass has something to refract. `width/height 340–460px`, `border-radius: 50%`, `filter: blur(78–84px)`, `opacity .24–.44`, `background #F24C1E`, positioned off-frame (e.g. `right:-90px; top:-60px`). Non-interactive. This is a signature of the identity, not decoration to drop — but implement it as a static blurred layer, not a runtime blur filter over scrolling content, for performance.

**Scroll fade** — content scrolls under the floating nav behind a 118–130px gradient from the background colour to transparent, `pointer-events: none`.

### Rings

All progress rings are SVG circles rotated `-90deg`, `stroke-linecap: round`, track `rgba(247,237,216,.12)`.

| Context | Viewbox | r | stroke-width | circumference |
|---|---|---|---|---|
| Home calories | 120 | 50 | 12 | 314 |
| Home macro | 52 | 21 | 7 | 132 |
| Plan-ready calories | 100 | 42 | 11 | 264 |
| Pot radial (1b) | 286 | 126 | 18 | 792 |

`stroke-dashoffset = circumference × (1 − min(1, value / target))`.

The pot radial in 1b is different: it uses `stroke-linecap: butt` and **segmented** dash arrays to show each meal as its own arc — `dasharray: "<arcLength> 750"` with a negative `dashoffset` equal to the cumulative length of preceding arcs plus a 6px gap.

---

## Screens / Views

There are five design options in the file. **1a is the reference implementation** for the in-app experience; **1b, 1c, 1d are alternative home screens** and a competing navigation model each; **1e is the onboarding funnel plus the dish library**. Pick one home direction before building — they are mutually exclusive.

### 1a — Live flow (the interactive reference)

Four screens plus three tabs, all functional in the mock.

#### Home / "Today" tab
- Header row: app name (Archivo 25/900/−0.7) left; streak pill right — glass pill, radius 100, padding 7×12, flame SVG in `bonnet` + count in Archivo 14/900/`bonnet`.
- Week strip: 7 equal flex columns, weekday initial (Inter 11/600/`muted`) over date (13px `cream`). Today's column uses `bonnet` for both, initial at weight 700 and date in Archivo 900.
- Summary card: glass, radius 26, padding 18, `display:flex; align-items:center; gap:6px`. Left: 118px calorie ring, centre showing remaining kcal (Archivo 26/900/−0.8, thousands-separated) over the word "left" (Inter 11/600/`muted`). Right: three macro rings (50px) in a `space-around` row, each with grams below (Archivo 14/900) and label (Inter 10/600/`muted`).
- Section header row: "Today" (Archivo 17/900/−0.4) and "<n> entries" (Inter 11.5/600/`muted`), `align-items: baseline`.
- Meal rows: glass-light card, radius 20, padding 12×14, gap 12. 46px enamel-plate square (radius 15, `#EFECE1`) containing a 32px food-colour circle — **this is the photo slot**. Then title (Inter 14.5/650/−0.2) over unit string (Inter 11.5/500/`muted`), then kcal (Archivo 16/900). 9px gap between rows.

#### Diary tab
Title, then averaging line; a glass card with a 7-bar week-vs-target chart (bars radius 6, `ugu` when at/under target, `bonnet` when over, `rgba(247,237,216,.3)` for today-in-progress, height as % of a 132px box); a "what you eat most" card with three labelled horizontal bars (`palm`/`ugu`/`bonnet`); and an `ugu`-tinted insight card. The insight is the point of the screen — a sentence that names a behaviour change and ties it to the result, not a stat.

#### You tab
Avatar card (56px initials tile, `bonnet`-tinted); **My units** list (wrap grams, ladle ml, rice plate in dericas) — this is where calibration is revisited; **Household** card showing member initials tiles + a plain-language explanation; an offline-status card with a `ugu` check tile.

#### Scan
Full-bleed `pot-deep` with a radial-gradient "plate" placeholder. Four L-shaped corner brackets in `bonnet` (34px, 3px stroke, 12px outer radius) inset 52px horizontally, framing a 236px-tall region — the recognition frame. Top-left circular back button (38px glass). Top-centre `ugu` pill: "Offline · scanning on device". Above the shutter: title (Archivo 21/900/−0.5) "Point at the whole plate" and hint "Soup and swallow in one shot. We log them as a pair." Bottom row, `gap: 34px`: 46px library-picker tile, 82px `bonnet` shutter with a 5px `rgba(247,237,216,.22)` ring, 46px search tile.

#### Detect
Top 326px is the captured photo (placeholder gradient) fading into `pot` via `linear-gradient(to top, #0C0D0A 4%, transparent 46%)`. Then:
- Eyebrow "RECOGNISED AS A PAIR" in `bonnet`.
- Title, two lines, Archivo 29/900/−0.9.
- A glass card with **two rows** — the soup and the swallow — each: 34px colour tile, name (Inter 14.5/650) over ingredient list (Inter 11.5/500/`muted`), confidence % right-aligned in `ugu` 11.5/700. Hairline divider between.
- A `palm`-tinted explanation card with an info glyph: "Soup from a shared bowl. Next step asks how much of it was yours — not how many 'servings'." This card is doing the teaching for the whole product model; keep it.
- "Not right? **Search the library**" — links to screen 10.
- CTA: "Set your portion".

#### Portion
The most important screen in the app.
- Title "How much did you actually eat?" (Archivo 28/900/−0.9).
- Stepper card (glass, radius 24, padding 18) with two rows separated by a hairline. Each row: 38px colour tile, name (Inter 15/650) over the user's calibrated unit ("Your wrap = 210 g", "Your ladle = 180 ml"), then a stepper: 34px minus circle (glass), value (Archivo 19/900, `min-width: 56px`, centred), 34px plus circle (`bonnet`-tinted fill `rgba(242,76,30,.2)`, border `rgba(242,76,30,.45)`, `bonnet` glyph). **Step is 0.5, range 0–4**, and halves render as vulgar fractions: `½`, `1½`, `2½`.
- Eyebrow "SHARED BOWL — YOUR SHARE", then three equal chips: `⅓ / A third`, `½ / Half`, `1 / All of it`. Selected = accent fill; unselected = glass. Radius 18, padding 14×4.
- Result card (`bonnet`-tinted, radius 24, padding 18): "This meal" label with live kcal at Archivo 32/900/−1 in `bonnet`; three macro mini-bars (5px, radius 3) with grams under each; then a note that changes with the share selection — all-of-it: "Counted as your own bowl, not a split." otherwise: "Split from a shared bowl — the rest goes to the household, not to you."
- CTA label carries the number: "Log 610 kcal".

#### Log confirmation
On log, return to Home/Today with the new meal appended, and show a toast 108px above the bottom edge: `ugu` at 90% opacity, radius 20, padding 14×16, dark ink text, check glyph, auto-dismissing after 3.6s. Copy names the amount and gives permission, e.g. "Logged 612 kcal — you have room for fruit tonight."

#### Navigation (1a model)
Floating glass tab pill, 238×62 at `left: 24px; bottom: 28px`, three items (Home / Diary / You) with 19px line icons above 10px labels; active `bonnet`, inactive `rgba(247,237,216,.45)`. A separate 62px `bonnet` circular scan button at `right: 24px; bottom: 28px`. The split — nav pill and action button as two distinct floating objects — is intentional: logging is not a fourth tab.

### 1b — Home: "the pot"
Single 286px radial where each meal is its own arc, remaining calories at 62px in the centre with an `ugu` pill translating the number into food ("≈ 1 wrap + soup left"). Below: three macro cards with coloured dots, then three compact "eaten today" cards colour-keyed to the arcs. Nav: same tabs + scan button as 1a. Choose this if the emotional read of "how much of the day is spent" matters more than detail.

### 1c — Home: "the ledger"
No tabs. A 4-way segmented control in the header (Today / Week / Pot / You) is the entire navigation, and a single full-width `bonnet` bar at the bottom — "Log what you ate" — is the only action. Day shown as a 20px horizontal stacked spend bar (breakfast/lunch/dinner/remaining) with meal labels beneath, then three tinted macro cards, then a vertical timeline: 2px rail, 16px colour dots with a 3px background-coloured border, time + dish + unit string, and context chips (buka name + naira price, "shared with 2 others"). Ends with a muted "Nothing logged since" node. Choose this for the macro-tracking and clinical audiences — it's the densest and most factual.

### 1d — Home: "enamel" (light theme)
Cream `paper` ground, `enamel` cards, and one inverted `ink` hero card carrying the remaining-calorie number and a 9px stacked spend bar. Below it a food-first feed: the newest meal gets a full-width 126px photo with a dark glass unit chip overlaid bottom-left; older meals are 88px photo thumbnails in horizontal cards. No tabs — a single dark floating pill, centred, "Log a meal" + 42px `bonnet` camera circle. Choose this if the app should feel like a food journal rather than a dashboard. Note the `bonnet-deep` substitution for all small accent text.

### 1e — Onboarding funnel (9 screens) + library

| # | Screen | Purpose | Notes |
|---|---|---|---|
| 01 | Scan first, ask later | Prove the scanner before asking anything | Camera-live on launch. `ugu` pill "No account needed". Title "Scan your dinner right now". Secondary "Or skip the demo". **No progress bar** — the user hasn't entered a funnel yet. |
| 02 | The proof beat | Convert the demo into a reason to continue | "MATCHED OFFLINE IN 0.4s" in `ugu`; result headline with kcal in `bonnet`; a 3-row spec list (340 dishes on device / 0 MB per scan / local units). This screen replaces Cal AI's entire comparison-chart-and-objections block. |
| 03 | Goal | Merge four Cal AI screens (gender, goal, workouts, attribution) into one | Four option rows: Lose weight, Gain weight (selected in mock), Maintain, **Manage sugar or BP** (`sky`-tinted icon — the clinical audience gets a first-class entry here). Progress 14%. |
| 04 | Body & activity | Merge height/weight/age/activity into one screen | Metric/Imperial segmented toggle, then three picker cards (height/weight/age) showing the neighbouring values at 40% opacity above and below the `bonnet` selected value, then a 3-way activity segmented row, then a `ugu`-tinted card stating the computed baseline burn. Progress 28%. |
| 05 | **Calibrate your units** | The product's differentiator, made explicit | `bonnet` badge "ONLY IN NAIJA KCAL". Wrap size chosen by picking one of three physically-sized circles (38/54/66px) labelled 140 g / 210 g / 300 g — size the swatch, don't just print the number. Then rice plate in dericas on a slider (0.5–3, at 1.5). Escape hatch: "Not sure? Use the average". CTA "Save my units". Progress 42%. |
| 06 | Household | Set the divisor for shared-bowl logging | Big stepper (Archivo 64/900) for adult count, member list, and the key note: "Cooking alone? Set this to 1 and the share step disappears from logging." Progress 56%. |
| 07 | Plan ready | The payoff | "BUILT FROM 6 ANSWERS" in `ugu` — name the cost you didn't charge. Full ring + target, three macro cards, then "what that looks like": the target expressed as an actual day of food (akara 310 / jollof 847 / egusi 612 / 814 to spare). A `bonnet`-tinted card states the date the goal is reached. |
| 08 | Save & notify | Account + permission, merged | Framed as backup, not signup: "The app already works. This is only a backup — and it's the first thing we've asked you for." Apple (solid `cream` button) / Google / **phone number** — the last is not optional in these markets. Decline path is explicit: "Not now — keep it on this phone only". The iOS notification alert is shown over a 55% scrim, with honest copy: "One nudge at dinner time. Nothing else." |
| 09 | Paywall | Naira pricing, local rails | Headline is earned rather than generic: "You've logged one meal free. Keep going?" Four benefit rows, then Yearly (accent, ₦1,250/mo · ₦15,000 once, SAVE 62%) and Monthly (₦3,300). Payment-method chips: Card / Bank transfer / USSD / Apple Pay — **USSD and bank transfer are required**, not decorative. Footer "No payment due now · cancel in two taps". |
| 10 | Dish library | Browse/search the 340 dishes | Search field says "Search 340 dishes — works offline". Category chips (Soups / Swallow / Rice / Street / Caribbean). "PAIRS YOU EAT OFTEN" as two photo cards — pairs are first-class objects, not two dishes. Then a per-ladle soup list. Note the tab bar's middle item is **Library** here, not Diary — resolve this before building. |
| 11 | Dish detail | Per-unit truth for one dish | Status chips (ON DEVICE / SOUP). Per-unit calorie row: 1 ladle 290 (selected) / 1½ ladle 435 / full bowl 870. Macro bars per ladle. "USUALLY EATEN WITH" — three swallow options, which is how the pair gets constructed manually. CTA "Log this as a pair". |

---

## Interactions & Behavior

### Flow graph (1a)
```
Home ──[scan FAB]──> Scan ──[shutter]──> Detect ──[Set your portion]──> Portion
  ^                    |                   |                              |
  └──[back]────────────┘   [back]──────────┘        [Log N kcal]──────────┘
                                                       │
Home(Today) <──────────────────────────────────────────┘  + toast, 3.6s
Home tabs: Today <-> Diary <-> You  (tab switch resets to Home screen)
```

### Portion maths (implement exactly)

Per-unit values are the calibrated defaults from onboarding; make them user data, not constants.

```
swallow: 320 kcal, 72 C, 4 P, 1 F   per wrap (210 g)
soup:    290 kcal,  9 C, 18 P, 22 F per ladle (180 ml)

multiplier m = share / 100          // share ∈ {33, 50, 100}
kcal    = round((wraps*320 + ladles*290) * m)
carbs_g = round((wraps*72  + ladles*9)   * m)
protein = round((wraps*4   + ladles*18)  * m)
fat_g   = round((wraps*1   + ladles*22)  * m)
```

Steppers: step 0.5, clamped 0–4. Display 0.5 → `½`, 1.5 → `1½`, 2.5 → `2½`, otherwise the plain number.

The CTA label and the result card update on every stepper/chip change — the number moving in response to the tap *is* the interaction. Don't debounce it.

### Ring maths
`dashoffset = max(0, C − C × min(1, value / target))`. Values clamp at the target — the ring does not overrun, but the diary bar chart does (over-target days turn `bonnet` and cap at 100% height).

### Transitions
The mock is static; these are the intended motions:
- **Screen push** (Home → Scan → Detect → Portion): standard platform push, 300–350ms. Portion should feel like a sheet rising over Detect rather than a lateral push.
- **Shutter → Detect**: freeze the frame, then reveal the recognition card upward from below with a 60–80ms stagger between the soup row and the swallow row. That stagger sells "it found two things".
- **Ring fill**: animate `dashoffset` on mount, 700ms, ease-out. On log, animate from the old value to the new one rather than re-mounting.
- **Result number**: on stepper change, cross-fade or roll digits over ~150ms — no layout shift (the value box is `min-width: 56px` for this reason).
- **Toast**: slide up 12px + fade in, 220ms; auto-dismiss at 3.6s with fade out. Cancel and restart the timer if a second log lands.
- **Bloom**: static. Do not animate it.

### States not designed yet — you'll need to invent these
Low-confidence recognition (<70%), dish not found, camera permission denied, no meals logged today (empty Today list), over-target day on Home, offline sync-pending indicator, paywall purchase failure, and the pair-logger case where only one item is detected. Flag these back to design rather than guessing at the copy — the tone is specific.

### Accessibility
- Every tap target ≥ 44px. The 34px steppers and 38px back buttons in the mock **fail this** — expand their hit areas to 44px without changing the visual size.
- All meaningful colour is paired with text or a number; no state is colour-only.
- `bonnet` `#F24C1E` on `pot` `#0C0D0A` is fine at headline scale and for fills. Small `bonnet` body text on dark is borderline — the mock only uses it at ≥11px/700 or ≥14px, keep it that way.
- Numbers are the content of this app. They must scale with Dynamic Type; the Archivo display sizes are the ones most likely to break layout, so give every number box room to grow vertically.

---

## State Management

State needed for the 1a flow:

| State | Type | Initial | Notes |
|---|---|---|---|
| `screen` | `'home' \| 'scan' \| 'detect' \| 'portion'` | `'home'` | Navigation position |
| `tab` | `'home' \| 'diary' \| 'you'` | `'home'` | Switching tab also returns `screen` to `'home'` |
| `wraps` | number | 1 | 0–4, step 0.5 |
| `ladles` | number | 1 | 0–4, step 0.5 |
| `share` | 33 \| 50 \| 100 | 100 | Hidden entirely when household size is 1 |
| `meals` | Meal[] | 2 seeded | `{name, unitString, kcal, carbs, protein, fat, colour \| photoUri, time}` |
| `toast` | `{visible, message}` | hidden | 3.6s timer, must be cleared on unmount |

Derived, not stored: consumed kcal/macros (sum over `meals`), remaining, all ring offsets, the pair's live kcal/macros, the CTA label, the share note.

User profile (from onboarding, persisted): goal, height, weight, age, activity band, daily target, macro targets, `wrapGrams`, `ladleMl`, `dericasPerPlate`, `householdSize`, streak.

### Data requirements
- On-device dish database, ~340 entries: name, category (soup/swallow/rice/street/caribbean), per-unit calories and macros, the unit each is measured in, typical pairings, and a photo. Must be queryable with no network.
- On-device recognition model returning **one or more** items with confidence scores, plus a category so soup and swallow can be paired automatically.
- Sync is background and optional — the app must be fully usable with the network off, including logging. Queue writes locally and reconcile.
- Buka/street-food prices (the `palm` chip in 1c) imply a location-based menu dataset. Not designed; treat as a later phase.

---

## Assets

Nothing in this bundle is a shippable asset.

- **Fonts**: Archivo and Inter, both Google Fonts / SIL Open Font License. The mock loads them from `fonts.googleapis.com`; bundle them locally in the app.
- **Icons**: all icons are inline SVG paths written for this design — line icons at 1.8–2.6px stroke on a 18–30px box, using `currentColor` where they inherit state. Substitute your codebase's icon set at matching weight, or lift the paths from the HTML.
- **Food photography**: every dish image is a placeholder gradient. Real photography is needed for the library (340 dishes), the "pairs you eat often" cards, and the dish detail hero. Logged meals should use the user's own capture.
- **Logo**: the app name is set in Archivo 900 as a wordmark. There is no logo mark in this redesign; the previous version used a plate glyph (see `reference-previous-version.html`) if one is wanted.
- **Brand colour**: `#F24C1E` is the existing Naija Kcal accent, carried over unchanged from the previous version.

---

## Files

| File | What it is |
|---|---|
| `Naija Kcal Redesign.dc.html` | The design document. Five options: `#1a` live flow, `#1b` pot home, `#1c` ledger home, `#1d` enamel/light home, `#1e` 9-screen onboarding + library. Open in a browser; `1a` is interactive — tap the orange **+**. |
| `reference-previous-version.html` | The previous build, for comparison. Shows the 20-screen Cal AI-derived funnel this redesign replaces. Useful for understanding what was cut and why. Not a target. |
| `README.md` | This document. |

### Where to look in the HTML
Search for `id="1a"` … `id="1e"` to find each option. In `1a`, the logic class at the bottom of the file (`class Component extends DCLogic`) holds the portion maths, meal seed data, ring-offset helper and fraction formatter — that's the part worth reading closely.

### Open decisions before you build
1. **Which home screen** — 1b, 1c or 1d. They imply different navigation models (tabs+FAB, segmented+single bar, no tabs+floating pill) and can't be mixed.
2. **Tab set** — 1a says Home/Diary/You; screen 10 says Home/Library/You. The library needs a home either as a tab or as a destination from search and from Detect's "Not right?" link.
3. **Free tier** — screen 09 states one scan a day free. Confirm before implementing gating.
