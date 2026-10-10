# Native renderers — UX review findings (pre-beta, v3.0-alpha.410)

Method: [How Mateu's UX is evaluated](../../doc/src/content/docs/ux-patterns/how-ux-is-evaluated.md)
— §1 heuristic evaluation, §2 cognitive walkthroughs, §3 synthetic users, §4 task metrics, §5
accessibility — applied to the two NATIVE renderers:

- **React Native** (`frontend/app/react-native`), run as expo web at an iPhone 14 viewport (390×844)
  through Playwright, against `demo/demo-admin-panel` started on a private port with
  `--mateu.cors.allowed-origins` for the Expo origin. What expo web cannot show — the hardware Back
  button, the iOS keyboard — was reviewed in the code against the platform behaviour.
- **IntelliJ plugin** (`frontend/app/intellij-plugin`), through the render probe
  (`./gradlew renderProbe -Pprobe.json=… -Pprobe.baseUrl=…`) on increments captured from the same
  backend: real Swing tree, accessible names (`a11yName` / `labelFor`) and a PNG. Real Swing
  screenshots ARE possible headlessly-ish (the probe opens a frame and paints it), under the Darcula
  L&F — the theme most IntelliJ users work in. One limit: the app-shell navigator PNG drops glyphs
  of the bundled UI font without a booted IDE (IJ-15); the tree dump is unaffected.

Goal per the brief: correct (optimal where possible) and pleasant, **no brand identity** — each
renderer follows its platform: RN → Apple HIG / Material 3; IntelliJ → IntelliJ Platform UI
Guidelines and JB components.

References cited: Nielsen's 10 heuristics (H1 visibility of system status, H2 match with the real
world, H3 user control and freedom, H4 consistency and standards, H5 error prevention, H8 aesthetic
and minimalist design, H9 help users recover from errors); NN/g (*Placeholders in form fields are
harmful*, *Error-message guidelines*, *Mobile tables*); Refactoring UI (Wathan & Schoger — hierarchy
by weight/size not by lighter greys, "not every button is primary", "don't fill the space");
Few, *Show Me the Numbers* / *Information Dashboard Design* (right-align numbers, label values,
dashboards are dense); Krug; Norman (gulf of evaluation); Silver, *Form Design Patterns*
(read-only values are text); Apple HIG (44pt targets, navigation, dark mode, keyboard); Material 3
(48dp targets, navigation drawer active indicator, window size classes, system Back, FAB
placement); IntelliJ Platform UI Guidelines (theme colour keys, context-help text, banners);
WCAG 2.2 (1.1.1 non-text content, 1.3.1 info and relationships, 1.4.3 contrast, 2.4.6 headings and
labels, 2.5.8 target size, 4.1.2 name/role/value).

Priorities: **P1** blocks or misleads the user, or fails WCAG AA · **P2** slows the user down or
causes recoverable errors · **P3** polish.

## Catalogue (screenshots)

Evidence folder: `/private/tmp/claude-501/-Users-mguel-IdeaProjects-mateu/e5e6bb22-fdb5-44ff-95b8-b8117e101445/scratchpad/ux-native/`
(`shots/`, `ij-*.txt` probe dumps, `wire/` captured increments, `metrics-*.json`, `a11y-after-*.txt`).

| Pattern | React Native (before → after) | IntelliJ (probe) |
|---|---|---|
| App shell + menu | `00-home`, `01-drawer` → `after-01-drawer` | `ij-shell` (navigator tool window) |
| Form | `00-home`, `06/07-crud-new*`, `task-after-T3-create-record` | `ij-form` |
| Listing / CRUD | `02-crud-list` → `after-02-crud-list`; detail `05-crud-detail` → `after-05-crud-detail` | `ij-products` |
| Wizard | `03-wizard`, `08-wizard-next` → `after-03-wizard` | `ij-wizard` |
| Drawer / dialog | `12-drawer-host` → `after-12-drawer-host`; bottom sheet `15-drawer-open` | `ij-drawer` |
| Dashboard | `10-dashboard` → `after-10-dashboard` | `ij-dashboard` |
| Calendar | `11-calendar` | `ij-calendar` |
| Dark mode | `13-dark` | Darcula in every `ij-*` |

## Task metrics (synthetic first-time user, RN, phone width)

Script: `e2e/rn-task-metrics.mjs` (committed — the same tasks re-run after every change). The user
knows only the goal, finds controls by visible text / accessible name.

| Task | Before | After |
|---|---|---|
| T1 open Products from the menu | ✅ 2 taps, 7.9 s | ✅ 2 taps, 7.7 s |
| T2 find "Producto 10" and open it | ✅ 4 taps | ✅ 4 taps |
| T3 create a product | ❌ **New does nothing** (RN-01) | ✅ 9 taps incl. one recoverable validation error, read next to its field |
| T4 save an empty product, understand what is missing | ❌ (no form) | ✅ error under the field + toast |
| T5 read a contact card | ❌ **labels with no values** (RN-02) | ✅ |
| T6 complete Wizard 1 | ✅ 5 taps | ✅ 5 taps (Next now where the thumb expects it, RN-16) |
| T7 open a link to a missing screen and get back to work | ✅ | ✅ |
| **Success** | **4 / 7** | **7 / 7** |

## Accessibility probes

| Probe | Before | After |
|---|---|---|
| `e2e/rn-a11y-probe.mjs` — Products (extended with 3 checks: stateful checkboxes, no nested controls, charts named) | 2/4 (search box unnamed) — and the new checks would fail: 10 glyph-only "☐" buttons with no state, nested inside the row button | **7/7** — 10 checkboxes with name + `aria-checked`, 0 nested, 0 unnamed inputs |
| `rn-a11y-probe.mjs` — home | 4/5 | 6/6 |
| `rn-a11y-probe.mjs` — dashboard | charts with no text alternative | 6/6 — "Chart. 2026. Jan: 120, Feb: 190, …" |
| IntelliJ probe — Products | 9 filter inputs + the search box with no accessible name | all named ("Search Products", "Price from", "Added to"…) |
| IntelliJ probe — dashboard | 2 charts with no accessible context at all (bare `JComponent`) | named with their data |
| Text contrast (RN tokens, `theme.test.ts`) | `faint` 2.07:1 on white, used for **67** text styles; `muted` 4.27:1 on the grey surface; warning 3.98:1 on its tint | every text token ≥ 4.5:1 on every surface, pinned by a test |
| Badge / chip contrast (IntelliJ, Darcula) | header badges ~1.6:1; status chips white on amber 1.99:1, on light blue 2.99:1 | ≥ 4.5:1, pinned by `NativeUxReviewTest` |

## Findings — React Native

| ID | Screen | Steps | Evidence | Method | Reference | P | Status |
|---|---|---|---|---|---|---|---|
| RN-01 | Any CRUD listing | Products → tap **New** (or Delete, or a bulk action) | No request is sent, nothing happens (`06-crud-new.png`, network log). The toolbar read `btn.id`; the wire carries `actionId` | Synthetic user T3, network log | H1; Norman (gulf of execution) | **P1** | **Fixed** `buttonActionId` (`uxRules.test.ts`) |
| RN-02 | Reflected view whose values travel in the fragment state (e.g. `/drawer-demo`) | Open the contact card | "Nombre" / "Email" with **no values** (`12-drawer-host.png`); the controller read only `initialData`, never `UIFragmentDto.state` | Synthetic user T5 | H1; misleads (data looks missing) | **P1** | **Fixed** `serverSideState` (`after-12-drawer-host.png`) |
| RN-03 | Everywhere | — | `theme.faint` #ADB5BD = 2.07:1 on white, on 67 text styles (captions, KPI titles, "Views/Columns", placeholders, empty states); muted 4.27:1 on #F4F4F5; warning 3.98:1; sidebar greys 1.7–4.4:1 | Heuristic + contrast calc | WCAG 1.4.3; Refactoring UI (hierarchy by weight, not by unreadable grey) | **P1** | **Fixed**: tokens re-picked, `theme.test.ts` fails on any text token < 4.5:1 |
| RN-04 | CRUD with row selection | Select a row with VoiceOver/TalkBack | The box was a `button` reading "☐", no checked state, NESTED inside the row's accessible touchable (unreachable for a screen reader; invalid `<button>` in `<button>` on web — console hydration errors) | a11y probe, code | WCAG 4.1.2; HIG/Material selection controls | **P1** | **Fixed** `SelectBox`: sibling of the row, role checkbox, `aria-checked`, "Select Producto 10", 44pt hit slop |
| RN-05 | Boot / any screen whose load fails | Start the app with the backend down (or a load that fails before anything rendered) | Dead end: "Could not connect to Mateu backend / Failed to fetch", nothing to press — the only way out was killing the app | Walkthrough | H9; NN/g error messages (say what to do) | **P1** | **Fixed**: plain-language title + detail + **Try again** (App root and every view host) — `loadFailureMessage` |
| RN-06 | CRUD search box | Focus it with a screen reader | Announced as a bare "text field" (placeholder is not a name) | a11y probe | WCAG 4.1.2 / 1.3.1 | **P1** | **Fixed** ("Search Products", role search) |
| RN-07 | Boolean fields, selects | Focus "Certified" / "Status" | Switch unnamed; select announced as just its value ("Available, button") | a11y probe dump (`label:null`) | WCAG 4.1.2 | **P1** | **Fixed**: switch carries the field name; select trigger "Status: Available", expanded/selected states |
| RN-08 | CRUD detail (view mode) | Open a product | Read-only values drawn as bordered input boxes identical to editable ones (typing silently fails); an empty value was an empty box | Screenshot `05-crud-detail.png`, fill() timed out | H4, H2; Silver (read-only values are text) | **P1** | **Fixed** `ReadOnlyValue` (text, "—" when empty, named) incl. options and dates (`after-05-crud-detail.png`) |
| RN-09 | Android, any pushed detail | Open a row, press the system Back | The custom detail stack had no `BackHandler`: Back skipped the whole stack (and the unsaved-changes guard) and left the screen/app | Code review vs. platform | Material navigation (system Back goes back inside the app); H3 | **P1** | **Fixed**: Back pops the detail through the same dirty guard as "‹ Back" |
| RN-10 | Every form | Look at an empty field | The label was echoed as the placeholder, in near-black on web — an empty field looked already filled ("Name" in the Name box) | Screenshot `00-home.png`, input dump | NN/g *Placeholders are harmful*; H8 | P2 | **Fixed**: only a declared placeholder, in `faint` |
| RN-11 | Dashboard charts | — | No text alternative; no scale; the legend sat between the bars and their axis labels; series palette started with the error red and had two adjacent blues once the accent was neutral | Screenshot `10-dashboard.png`, a11y probe | WCAG 1.1.1; Few | **P1** (a11y) | **Fixed**: data in the accessible label, top value shown, axis labels under the plot, Okabe-Ito palette |
| RN-12 | Buttons, ✕, back, checkboxes, menu rows | — | Buttons ~37pt tall, banner ✕ ~22×17, checkboxes ~16pt | Measured in screenshots | HIG 44pt / Material 48dp; WCAG 2.5.8 | P2 | **Fixed**: `theme.minTouch` 44 + `hitSlop` on glyph controls |
| RN-13 | Any screen with app FABs | Scroll a CRUD to its pagination | The chat FAB covered "Next →" (`02-crud-list.png`) and floated ABOVE the open drawer (`01-drawer.png`) | Screenshot | Material FAB guidance; WCAG 2.4.11 (focus not obscured) | P2 | **Fixed**: FABs live inside the screen (drawer/tab bar cover them) in a reserved bottom band (`fabInset`) |
| RN-14 | Undeclared (`auto`) listing on a phone | Products | A 4+ column table scrolled sideways, last column cut at the edge ("Cert") | Screenshot | NN/g mobile tables; Material 3 window size classes / lists | P2 | **Fixed** `effectiveListingLayout`: compact width → list rows (title + supporting line); declared layouts untouched |
| RN-15 | Drawer | Open the menu | No "you are here"; dark custom sidebar (#354a5e) read as another product's chrome; "🔔 NOTIFICATIONS" announced with the emoji; context values shown as "—" | Screenshot `01-drawer.png` | H1; Material 3 navigation drawer; HIG | P2 | **Fixed**: light drawer, active indicator + `aria-selected` on the current entry, "Notifications, 2 unread", "Hotel: not set" |
| RN-16 | Wizard | Step 1 | The declared `justification: END` bar stretched each item: primary "Next" ended up centred | Screenshot `03-wizard.png` | H4; Fitts / thumb zone | P2 | **Fixed** `rowJustification` (`after-03-wizard.png`) |
| RN-17 | Wizard (bare-layout roots) | — | Title (an h2 Text) rendered as body text flush at the screen edge; no heading for screen-reader navigation | Screenshot | WCAG 2.4.6 / 1.3.1; Refactoring UI hierarchy | P2 | **Fixed**: h1–h6 Text → heading size/weight + header role; 16pt gutter on bare roots |
| RN-18 | Wizard progress | — | The bar's own text ("Step 1") was dropped; bar invisible to screen readers | Wire vs screenshot | H1; WCAG 4.1.2 | P2 | **Fixed**: text above the bar, `progressbar` role with value |
| RN-19 | iOS forms | Type in the last field | No `KeyboardAvoidingView`: the keyboard covers the bottom Save/Next bar; taps on buttons while the keyboard is up were eaten (no `keyboardShouldPersistTaps`) | Code review vs. platform | HIG keyboard guidance | P2 | **Fixed** |
| RN-20 | Everywhere | — | Brand accent = RIU red #E4002B = the danger colour: every primary button read as destructive, Delete looked like Search | Screenshot, `theme.ts` | Brief ("no brand identity"); H4; Material/HIG semantic colour | P2 | **Fixed**: neutral system-like blue accent, error red distinct (pinned by test); Delete (`color: error`) gets a destructive outline |
| RN-21 | Theme toggle (`@App(themeToggle)`) | Tap 🌙 | Only the navigation chrome turns dark; content stays light — half-dark screens. Toggle had no accessible name | Screenshot `13-dark.png` | H4; HIG dark mode | P2 | **Name fixed**; half-dark **open** — real dark mode needs the module-level `StyleSheet` tokens made theme-aware (all renderers), not a pass-sized change |
| RN-22 | Header | Navigate anywhere | The top bar always says the app title; the screen title is only in the page body (duplicated on the home) | Screenshots | Material top app bar / HIG navigation bar title | P3 | Open — needs a decision on title ownership between header and page |
| RN-23 | Type scale | — | 19 distinct font sizes, some 8–10pt | grep of styles | Refactoring UI (a constrained type scale); HIG minimum 11pt | P3 | Partly (the touched styles ≥ 11pt); open for the rest |
| RN-24 | List rows | Products on a phone | Supporting line shows raw "true"/"false" for booleans | `after-02-crud-list.png` | H2 | P3 | Open |
| RN-25 | Toasts | Save with an error | The toast sits over the back bar at the top | `task-after-T3` | Material snackbar (bottom) | P3 | Open |
| RN-26 | CRUD detail | — | "Back to list" duplicates the native "‹ Back"; four equal-weight buttons wrap to two rows | `05-crud-detail.png` | H8; Refactoring UI | P3 | Open (server toolbar content) |
| RN-27 | Calendar month grid | Phone width | Event titles truncated to 4 letters ("Sprin…") | `11-calendar.png` | NN/g mobile; HIG | P3 | Open — a list/agenda view on compact widths would fit the platform |
| RN-28 | Web dev setup | `npm run web` against a backend | CORS is off by default, the app stopped at "Could not connect / Failed to fetch"; no doc said to allow the Expo origin | Walkthrough (first run) | H9, H10 | P2 | **Fixed**: README + `native/react-native.md` say how; the message now reads "Can't reach the server…" |
| RN-29 | Probe affordance | — | Pointing expo web at a route needed a rebuild (`EXPO_PUBLIC_MATEU_ROUTE`) | Review tooling | — | P3 | **Fixed**: `?route=/x` on web |

## Findings — IntelliJ plugin

| ID | Screen | Steps | Evidence | Method | Reference | P | Status |
|---|---|---|---|---|---|---|---|
| IJ-01 | Page header badges | Any page with `@BadgeInHeader` under Darcula | Light pastel background and NO foreground: theme's light-grey text on light chip ≈ 1.6:1 | Code + contrast calc | WCAG 1.4.3; IntelliJ UI guidelines (theme keys) | **P1** | **Fixed** `ToneColors` (theme `Banner.*`/`Tag.background` keys + label foreground); test |
| IJ-02 | Listing status cells | Products | White on amber 1.99:1, on light blue 2.99:1 | Contrast calc | WCAG 1.4.3 | **P1** | **Fixed** `ToneColors.solid` (dark text on amber, deeper blue); test |
| IJ-03 | Listing filters + search | Products → Filters | 9 filter inputs (incl. both ends of each range) and the search box with no accessible name | Probe a11y dump | WCAG 4.1.2 / 1.3.1 | **P1** | **Fixed**: captions `labelling(...)`, ranges "Price from/to", "Search Products"; test |
| IJ-04 | Dashboard charts | — | `ChartPanel` was a bare `JComponent` — NULL accessible context; bars without values | Probe dump, screenshot | WCAG 1.1.1; Few | **P1** | **Fixed**: JPanel with the data as accessible name; value labels on bars/points; test |
| IJ-05 | Reflected view with values in the fragment state (`/drawer-demo`) | Open it | Labels with empty values (same defect as RN-02) | Probe dump (`JBLabel [0x0] text=''`) | H1; misleads | **P1** | **Fixed** `withFragmentState`; probe now shows "Ada Lovelace"; test |
| IJ-06 | Dashboard (ResponsiveGrid) | `/dashboard-demo` | Plain `GridLayout`: KPI band in a half-width cell stretched to the chart's height — four 430px boxes with the numbers at the top | `ij-dashboard.png` (before) | Few (dense dashboards); Refactoring UI | P2 | **Fixed** span-aware `renderSpanGrid` (band spans the row, rows sized to content); test |
| IJ-07 | Listing numeric columns | Products → Price | Left-aligned raw doubles "650.0" | `ij-products.png` | Few (right-align numbers) | P2 | **Fixed**: right-aligned, locale-grouped, by dataType OR by JSON-number value (the wire types `price` as "string" — see "for other teams") |
| IJ-08 | Page banners | Any `@Banner` under Darcula | Fixed light pastels glaring in a dark IDE | Code | IntelliJ UI guidelines (Banner colours) | P2 | **Fixed**: theme `Banner.*Background/BorderColor` |
| IJ-09 | Image / signature fields | Form with two image fields | Two "Upload" and two "Delete" buttons, indistinguishable out of context; Delete enabled with nothing to delete | Probe dump | WCAG 2.4.6 / 4.1.2; H5 | P2 | **Fixed** ("Upload Avatar", "Delete Foto"; Delete disabled when empty); test |
| IJ-10 | Any CRUD listing in a headless context (probe, unit tests) | — | `ColumnChooser`/`SavedViews` called `PropertiesComponent.getInstance()` and crashed the whole crud render without an Application | Probe stack trace | Robustness (tooling) | P3 | **Fixed** `UserPrefs` (in-memory fallback) |
| IJ-11 | Wizard | — | Title rendered as body text; progress text ("Step 1") dropped; progress bar unnamed | Probe dump | WCAG 2.4.6 / 4.1.2; H1 | P2 | **Fixed**: h1–h6 → bold scaled title; bar paints and names its text; test |
| IJ-12 | Everywhere (43 places) | — | Secondary text (subtitles, captions, hints) painted with the theme's DISABLED label colour: live content read as greyed-out controls | Code | IntelliJ UI guidelines (context-help foreground for secondary text); H4 | P2 | **Fixed** `ToneColors.secondaryText()` |
| IJ-13 | Navigator | App menu | Menu entries are 16px hyperlinks, no selection state; IDE navigators are trees/lists with a selected row | Probe dump | IntelliJ UI guidelines (tool windows) | P3 | Open |
| IJ-14 | Listing headers | Price column | Header left-aligned over right-aligned numbers | `ij-products.png` | Few | P3 | Open |
| IJ-15 | Render probe | App-shell navigator PNG | Glyphs dropped in the offscreen paint without a booted IDE (tree dump fine; content screens fine) | `probe` runs | Tooling | P3 | Open (tried forcing the font, `printAll`, a Robot screen capture — same) |
| IJ-16 | Listing dates | Products → Added | ISO dates ("2026-05-11") not in the user's locale format | `ij-products.png` | H2 | P3 | Open |

## Counts

| | P1 | P2 | P3 | Total |
|---|---|---|---|---|
| React Native | 10 (10 fixed) | 12 (11 fixed, 1 partly — RN-21) | 7 (1 fixed, 1 partly) | 29 |
| IntelliJ | 5 (5 fixed) | 6 (6 fixed) | 5 (1 fixed) | 16 |

## For other teams (not fixed here)

- **Wire / core (all renderers):** numeric grid columns are emitted with `dataType: "string"`
  (Products `price`, a `double`) — renderers cannot right-align/format them by type. The IntelliJ
  renderer now falls back to the JSON value; the web renderers should get it from the wire.
- **Server validation messages** use the field id ("status: Cannot be empty") instead of its label,
  and the demo mixes languages in one toast ("Revisa los campos" + "Cannot be empty").
- **Web renderers** (from the developer-journey pass): an action nobody handles is dropped with no
  feedback; a YAML listing's `dataType: status` column shows raw constants; the generated CRUD page has
  no side gutter at 1280px.
