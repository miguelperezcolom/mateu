# Web renderers — pre-beta UX review (GA, 2026-10)

Method: [`how-ux-is-evaluated.md`](../../doc/src/content/docs/ux-patterns/how-ux-is-evaluated.md).
Renderers: **Vaadin** (`libs/mateu` + `apps/vaadin`, Lumo) and **Redwood/VB** (`apps/redwood`,
Redwood/JET tokens). No brand identity: each finding is judged inside its design system.

Apps under test (own ports, branch `ux/review-web` from `origin/master` = v3.0-alpha.410):
`e2e/sut/apps/mvc-app1` (49 routes), `demo/demo-admin-panel` (64 routes) — Vaadin;
`demo/demo-vb` (14 routes), `demo/demo-vb-pms` (18 routes) — Redwood.

## How it was measured

| Method | Tool (repo) | Coverage |
|---|---|---|
| Screenshot catalogue + axe (WCAG 2.0/2.1/2.2 A+AA) + sideways-overflow + emoji probe | `e2e/ux/catalogue.mjs` | 145 routes × light/dark × 1440/390 = **580 screens** |
| Contact sheets for the two heuristic passes | `e2e/ux/contact-sheet.mjs` | all catalogue screens |
| Synthetic users + task metrics (JSON) | `e2e/ux/tasks.mjs` | 7 tasks × 4 profiles (mouse, phone, keyboard-only, screen-reader/a11y-tree) |
| 200 % zoom (640 CSS px at DPR 2) + forced colours | `e2e/ux/zoom-forced.mjs` | 15 key routes, both renderers |
| Behaviour probes axe cannot see | `e2e/a11y-audit.mjs`, `e2e/vb-a11y-probe.mjs` | 8 SUT routes / 10 VB checks |
| Visual-consistency guard (CI) | `scripts/check-design-tokens.mjs` | libs/mateu, apps/vaadin, apps/redwood poc templates + core |

References cited: Nielsen's 10 heuristics (H1–H10) and NN/g articles on forms, tables, error
messages, confirmation dialogs, empty states and dashboards; *Refactoring UI* (chapters cited by
name, e.g. RUI "Don't rely on color alone"); Silver / Wroblewski (forms); Few (dashboards); WCAG 2.2
AA (SC numbers); WAI-ARIA APG; Carbon / Fiori / Material / Redwood for patterns (not style).

Full catalogue (before / after / final, ~40 MB of JPEGs + JSON) is kept outside the repo; the
curated before/after evidence is in [`shots/`](shots/) and the numbers in [`metrics/`](metrics/).

## Headline numbers (before → after)

| Measure | Before | After |
|---|---|---|
| axe violations, all 580 screens | **1 193 nodes** | **136 nodes** (−89 %) |
| axe violations, Vaadin SUT (196 screens) | 60 nodes | **18** |
| axe violations, Vaadin admin demo (256 screens) | 372 nodes | **51** |
| axe violations, Redwood demo-vb (56 screens) | 279 nodes | **29** |
| axe violations, Redwood PMS (72 screens) | 482 nodes | **38** |
| Phone screens that scroll sideways (Vaadin) | 14 routes | **10 routes** (button rows that do not wrap, two grids, a skeleton demo — W-V-REFLOW-2) |
| Synthetic-user task completion (28 runs) | 13 / 28 | **24 / 28** |
| Provoked errors that were *not* deliberate probes | 4 (Delete without selection) | **0** |
| Hard-coded colour / spacing / font-size literals in Mateu's own components | 392 | **367** (ratchet in CI) |
| Emoji / non-DS glyphs used as icons by the generator (Vaadin) | 9 components | **3 (dev tools / content glyphs, listed below)** |

Task metrics (`metrics/tasks-before.json`, `metrics/tasks-after.json`):

| Task | Before (ok/4, errors) | After (ok/4, errors) | What changed |
|---|---|---|---|
| T1 Create a record | 4/4, 0 | 4/4, 0 | — |
| T2 Find a record and edit it | 2/4, 0 | 2/4, 0 | open (W-V-ROWCLICK) |
| T3 Delete a record | 0/4, 4 | 3/4, 0 | Delete disabled until selection; real confirmation dialog |
| T4 Wizard with a validation error | **0/4** | **4/4** | completion now shows the result step (W-V-WIZARD) |
| T5 Recover from a validation error | 3/4 | 3/4 | phone: full-screen date picker (upstream, W-V-PHONE-DATE) |
| T6 Find a screen through the menu | 4/4 | 4/4 | — |
| T7 Filter a listing | **0/4** | **4/4** | the search box searches what the listing shows (W-V-SEARCH) |

(Errors in T4/T5 are the deliberate "press Next/Validate first" probes; they show the validation
works. T3 keyboard and T2 keyboard are partly harness limits on vaadin-grid row recycling and are
recorded as such, see W-V-ROWCLICK.)

## Findings

Priority: **P1** blocks/misleads or fails WCAG AA · **P2** slows / recoverable errors · **P3** polish.
Status: ✅ fixed in the generator (with test where testable) · ⏳ open · ⬆ upstream (design-system
internals, carved out with a reason).

### Vaadin renderer

| ID | Priority | Screen | Finding | Method | Reference | Status |
|---|---|---|---|---|---|---|
| W-V-REFLOW | P1 | /wizard, /tabs, /accordion, /folded, request-access & branching wizards @390 | Two-column forms did not collapse at phone width: the second column was cut off at the screen edge, the page scrolled sideways. Cause: a server-side column styled `max-width:900px; margin:auto` (and tab/accordion panels, forms inside `vaadin-vertical-layout`) sized to their CONTENT, and an auto-responsive form's content is its widest row. | catalogue overflow probe, phone synthetic user (T4 "page scrolls sideways") | WCAG 1.4.10 Reflow; RUI "Relative sizing doesn't scale" | ✅ `serverSideStyle` (renderComponent) + `align-self: stretch` on forms/panels; test `renderComponent.test.ts` |
| W-V-GUTTER | P2 | every standalone page @390; crud @1280 | A page without an app shell touched the screen edges (0 px side gutter). | catalogue | RUI "Start with too much white space" | ✅ fixed-width pages default to `--lumo-space-m` gutter (`mateu-ux`) |
| W-V-WIZARD | P1 | /wizard (any wizard whose completion returns a `Message`) | After "Complete" the success toast appeared over the LAST step, still editable; the result step never showed — the user could not tell the work was done and could submit again. | T4: 0/4 → 4/4 | H1 visibility of status, H5 error prevention | ✅ `WizardActionDispatcher`: a non-error Message lands on the result step and shows the message (Python port already did) |
| W-V-DELETE | P2 | crud listings | "Delete" was enabled with nothing selected; pressing it answered with a red error toast. | T3 errors 4 → 0 | H5 error prevention; NN/g "disabled buttons" | ✅ selection-gated toolbar actions are disabled until rows are selected (`needsSelection`) |
| W-V-CONFIRM | P1 / P2 | delete confirmation | (P1) The confirmation was an unnamed `div`: no `role`, no `aria-modal`, focus stayed on the page behind it. (P2) "One moment, please — Are you sure? No / Yes" for a destructive action; Yes was the blue primary. | keyboard user ("confirmation opened without taking the focus"), heuristic | WAI-ARIA APG alertdialog; WCAG 2.4.3; NN/g "Confirmation dialogs" (name the action) | ✅ `role=alertdialog` + labelled/described + focus trap (safe button first); a delete reads "Delete the selected items? — This cannot be undone. — Cancel / **Delete**" in error colour; tests `confirmationTexts.test.ts` |
| W-V-BOOL | P1 | every grid with a boolean column, read-only boolean fields | A ✓/— icon with no accessible name: the screen reader announced an EMPTY cell. | a11y-tree synthetic user | WCAG 1.1.1, 4.1.2 | ✅ role="img" + "Yes"/"No" |
| W-V-VALMSG | P2 | crud create form, any form | Validation toast named fields by their programmer id ("title: Cannot be empty"); same on the server ("status: …"). | heuristic, walkthrough "recover from error" | H2 match the real world; NN/g error messages | ✅ client: label map walks metadata + `humanizeFieldId`; server: `ErrorBoundary.labelOf` (@Label / humanized) — Java + Python; tests `humanize.test.ts`, `ErrorBoundaryLabelTest`, `test_error_boundary.py` |
| W-V-CONTRAST | P1 | dashboard KPI captions, task-queue / collection group labels, meter labels, header facts, TOC badges, chat meta | `--lumo-tertiary-text-color` (placeholder grey) used for information: ~2.6:1. | axe (27 screens) | WCAG 1.4.3; RUI "Don't use grey text on colored backgrounds" | ✅ → `--lumo-secondary-text-color` |
| W-V-SEMTEXT | P1 | stat, comparison card, pricing, timeline, file list, side nav | Semantic *fill* tokens (`--lumo-success-color`…) used as TEXT colour (2.9:1 on white, worse on dark). | axe | WCAG 1.4.3 | ✅ → `*-text-color` tokens |
| W-V-HERO | P1 | welcome / hero search pages | A tertiary CTA ("See the dashboard") was blue-on-teal on the hero band (~1.6:1, unreadable). | axe + screenshot | WCAG 1.4.3 | ✅ the hero re-points Lumo's text tokens at its light ink; test `heroRenderer.test.ts` |
| W-V-INK | P1 | planning board blocks, funnel stages, callout CTA | White text on DATA colours (mid blue, amber) — 2.1–3.7:1. | axe | WCAG 1.4.3 | ✅ `inkOn(color)` picks the higher-contrast ink; warning callout uses Lumo warning contrast; test `inkOn.test.ts` |
| W-V-NOTICE | P2 | `Notice` / `@Notice` | Hard-coded pastels + dark inks stayed light on a dark page; severity glyphs ℹ ✓ ! in a coloured circle. | dark catalogue, icon rule | RUI "Define your shades up front"; owner rule "one icon family" | ✅ Lumo semantic tints + text tokens; Vaadin icons |
| W-V-ICON | P2 | notice, command center, file list, file upload, camera capture, task progress, process monitor, CollectionDetail empty pane | Emoji / text glyphs / hand-drawn inline SVG mixed with `vaadin-icon` on the same screens. | catalogue emoji probe (19 screens) | owner rule "one icon family per renderer"; RUI "Use good icons" (consistency) | ✅ all go through the `icon()` port; CollectionDetail default `vaadin:list-select` in Java/.NET/Python |
| W-V-DARKMQ | P3 | 9 display components | `@media (prefers-color-scheme: dark)` followed the OS, not the app's theme toggle. | dark catalogue | consistency | ✅ removed (their bases are theme tokens) |
| W-V-NUMBERS | P2 | every listing with numbers | Numeric columns travelled as `dataType: "string"`: left-aligned, no grouping ("80000"). | heuristic, coordinator note | NN/g "Data tables" (right-align numbers); Few | ✅ listing columns keep `integer`/`number` (Java `ColumnTypeMapper.getDataTypeForListingColumn`, .NET `ListingDataType`, Python `listing_data_type`) → right-aligned (`columnAlign`), grouped in the page locale from 5 digits (`formatNumberCell`); tests `columnAlign.test.ts` |
| W-V-SEARCH | P2 | crud listings | The search box searched only `toString()`: typing "Engineering" (visible in the Department column) found nothing. | T7: 0/4 → 4/4 | H4 consistency / user expectation | ✅ default `CrudStore.find` also matches the row's plain values (rows implementing `SearchableText` still decide) |
| W-V-SEARCHFIRST | P2 | hero search, smart search pages | A search-first listing (no OnLoad search) shimmered a skeleton for 15 s, then said "Nothing here yet." | screenshot + network trace | H1 (a wait for nothing, then a false claim); NN/g empty states | ✅ no skeleton without a pending search; the empty state says "Search to see results."; test `tableCrudSearchFirst.test.ts` |
| W-V-STATUS | P2 | YAML / REST listings with status columns | Raw constants (`OUT_OF_STOCK`) in status badges. | coordinator note, heuristic | H2 | ✅ humanized like the server's enum labels ("Out of stock") — Vaadin + Redwood; tests |
| W-V-PROGRESS | P1 | wizards | Progress bar without an accessible name. | axe | WCAG 4.1.2 | ✅ |
| W-V-NAMES | P1 | app brand button @390, task-queue groups, in-cell editors (12 on /inline-crud-demo), lookup fields, image fields, range slider | Controls / landmarks without accessible names. | axe | WCAG 4.1.2, 1.1.1, 1.3.1 | ✅ |
| W-V-TARGET | P1 | foldout paging dots | 11 px targets. | axe | WCAG 2.5.8 | ✅ 24 px targets, visual dot unchanged |
| W-V-UNCLAIMED | P2 (DX) | any page | An action no component claims was dropped silently. | coordinator note | H1 (for the developer) | ✅ console warning naming the id at `<mateu-ui>`; test `unclaimedAction.test.ts` |
| W-V-ROWCLICK | P2 | crud listings | Only the Id cell opens a record; clicking the title (the natural target) does nothing; on a phone the Id link is 22 px tall and the table shows only Id + half the title. | T2: 2/4 (mouse/sr hesitate, phone + keyboard fail) | Fitts; NN/g "Mobile tables" | ⏳ needs a decision: row click vs. selection checkbox vs. inline editing; `auto` = table by design (2026-09-04) |
| W-V-DASH-TIME | P2 | dashboards | KPI numbers state no timeframe ("Orders 3,421" — when?). The generator cannot invent the period. | dashboard checklist (Few) | Few, *Information Dashboard Design* | ⏳ documentation + an `ArchetypeAdvisor` hint are the proposed fix |
| W-V-REFLOW-2 | P2 | /action-features, /patterns/wizard, /accordion, /folded @390 | Rows of buttons (a wizard's Back/Next/Save/Skip/Finish, an action toolbar) do not wrap, and a two-column form inside an accordion panel still overflows by a few px. | catalogue overflow probe | WCAG 1.4.10 | ⏳ |
| W-V-SWITCHER | P2 | general overview | The record switcher renders as a text box showing the raw id ("r1") instead of a select of records. | a11y tree + screenshot | H2, H6 recognition over recall | ⏳ |
| W-V-PHONE-DATE | P3 | date fields @390 | Vaadin's full-screen date picker stays open after typing a date + Enter, leaving the page inert. | phone synthetic user (T5) | — | ⬆ Vaadin behaviour |
| W-V-TOAST-DUP | P3 | forms | A rejected save is announced twice (field alert + toast). | a11y tree | — | ⏳ |
| W-V-DELETE-FEEDBACK | P3 | crud | After a delete nothing confirms it except the row disappearing; no undo. | walkthrough "undo" | H1; principle 06 Recoverability | ⏳ (`Message.undoable` exists; the default delete does not use it) |
| W-V-TABLE-ID | P3 | AutoCrud listings | A UUID id column ("…-54211fd5db0c") is the first, primary link column. | heuristic | RUI "Labels are a last resort" | ⏳ |
| W-V-NESTED | P2 | /status-list-demo | `role=button` cell nested in an interactive row. | axe | WCAG 4.1.2 | ⏳ |
| W-V-SCROLLREGION | P2 | planning board @390 | Scrollable frame not keyboard-focusable. | axe | WCAG 2.1.1 | ⏳ |
| W-V-RECORD-SWITCH | P1 | general overview record switcher (any `@Label("")` field) | A field with a hidden label had no accessible name. | axe | WCAG 4.1.2 | ✅ the control is named by the humanized field id (`nameUnlabelledControl`) |
| W-V-DISABLED-CELL | P3 | resource grid | Disabled cells at 50 % opacity, not marked `aria-disabled`. | axe | WCAG 1.4.3 (exempt only when inactive) | ⏳ |
| W-V-DEMO-LANG | P3 | demo-admin-panel | Demo content mixes Spanish and English toasts/labels. | coordinator note | consistency | ⏳ demo content, not the generator |
| W-V-GLYPHS | P3 | chat (📎 ⚠️), rich-text toolbar (❝ 🔗), filter chips (★ ✕), debug overlay / form editor / workflow editor (🐛 🗑 👤 ⚙) | Remaining non-DS glyphs. | emoji probe | owner icon rule | ⏳ dev tools and content glyphs; listed for the next pass |
| W-V-UPSTREAM | — | tabs, select, accordion | `vaadin-tabs` aria-required-children, `vaadin-select-value-button` aria-allowed-attr, `vaadin-accordion-heading` aria-required-attr. | axe | — | ⬆ Vaadin internals |

### Redwood / VB renderer

| ID | Priority | Screen | Finding | Method | Reference | Status |
|---|---|---|---|---|---|---|
| W-R1 | P1 | every page in dark mode | The page-header band kept JET's light canvas while `oj-color-invert` turned the title white — **the page title was invisible**; tables, the smart-search bar and the data grid stayed white under white text (688 failing nodes). | dark catalogue + axe | WCAG 1.4.3; H1 | ✅ `app.css` dark overrides (JET `oj-bg-*` utilities are `!important`) |
| W-R2 | P1 | /stock (inline editing) | In-cell editors and switches had no accessible name. | axe | WCAG 4.1.2 | ✅ named after their column (`editorLabels`) |
| W-R-BOOL | P2 | listings | Booleans shown as raw `true`/`false`. | heuristic | H2 | ✅ Yes / No |
| W-R4 | P2 | listings | Numbers left-aligned. | heuristic | NN/g data tables | ✅ `oj-helper-text-align-end` for numeric columns |
| W-R5 | P1 | /property-availability | Link values in the matrix (link blue on tone tints) < 4.5:1. | axe | WCAG 1.4.3; RUI "Not every link needs a color" | ✅ body ink + underline |
| W-R6 | P2 | /property-availability | Page title renders as "…". | screenshot | H1 | ⏳ |
| W-R7 | P2 | /reservation-detail @390 | Header facts row scrolls sideways. | overflow probe | WCAG 1.4.10 | ⏳ |
| W-R8 | P2 | foldout panels in dark mode | oj-sp foldout panel containers keep a light background. | dark probe | WCAG 1.4.3 | ⏳ (partial: tables/headers fixed) |
| W-R9 | P2 | /end-of-day, /telephone-console (dark) | Guided-process step labels / console card titles below 4.5:1 in dark. | axe | WCAG 1.4.3 | ⏳ |
| W-R-UPSTREAM | — | nav list, booking foldout dots, data-grid databody | `oj-navigation-list` collapse icon (aria-required-children), oj-sp foldout pagination dots (target-size), `oj-datagrid` databody (scrollable-region-focusable). | axe | — | ⬆ JET / oj-sp internals |

### Cross-cutting

| ID | Priority | Finding | Status |
|---|---|---|---|
| W-X-TOKENS | P2 | 392 hard-coded colours / px spacing / rem font sizes in Mateu's own components (they ignore dark mode, forced colours and a customer theme). | ✅ guard + ratchet in CI (`scripts/check-design-tokens.mjs`, baseline `scripts/design-tokens-baseline.json`); 20+ removed in this pass; the heaviest remaining files are dev tools (form editor 63, debug overlay 39, workflow editor 38) and the command-center scrim |
| W-X-FORCED | — | Forced colours: no control disappears (0 borderless, textless controls on 15 routes). Wizard progress bar collapses to a hairline. | ✅ checked / P3 noted |
| W-X-ZOOM | — | 200 % zoom: no sideways scroll on the 15 checked routes after W-V-REFLOW. | ✅ |

## Counts

| | P1 | P2 | P3 | upstream (carved out) |
|---|---|---|---|---|
| Vaadin | 12 (12 ✅) | 16 (10 ✅, 6 ⏳) | 8 (1 ✅, 6 ⏳, 1 ⬆) | 1 group |
| Redwood | 3 (3 ✅) | 6 (2 ✅, 4 ⏳) | — | 1 group |
| Cross-cutting | — | 1 (✅) | — | — |
| **Total** | **15 — all fixed** | **23 — 13 fixed** | **8 — 1 fixed** | **2** |

## What is left (and why)

- **W-V-ROWCLICK** needs a product decision (whole-row click conflicts with selection and inline
  editing; phone layout of `auto` listings was fixed to TABLE on 2026-09-04 on purpose).
- **W-V-DASH-TIME** is content: the proposal is a dashboard checklist in the docs plus an advisor
  hint when a `MetricCard` has neither caption nor delta.
- Redwood W-R6–W-R9 and the remaining Vaadin a11y items are listed with their screens above; none is
  a regression of this pass.
- .NET port: changes compile-reviewed only (no `dotnet` SDK on the review machine); Python port
  tests run green (696).
