# Desktop renderer (IntelliJ plugin / desktop app) — UX review before 3.0 GA

Scope: `frontend/app/intellij-plugin`, the renderer that is both the IntelliJ plugin and the
standalone desktop app. This review follows the pre-beta one
([native-findings.md](native-findings.md), IJ-01…IJ-16), and covers visual and interaction polish.
It leaves out two areas other work streams own: LongTask progress and the Message / notification
rendering.

## Method

- **Backends:** `demo/demo-admin-panel` (:8595, Java), `demo/demo-starwars` (:8600, YAML only) and
  `demo/demo-museum` (:8601, YAML, `MATEU_ENVIRONMENT=public` against museum-api.ec1.mateu.io).
- **Increments:** 39 first loads captured with `POST /mateu/v3/sync/{route}`. They cover the CRUD
  listing, record view and edit; reflected forms with sections, zones and tabs; wizards (plain and
  RAIL); dashboards; collection detail; foldout; calendar; kanban; item overview; welcome; hero
  search; empty states and skeletons; and the three app shells.
- **Desktop renderer:** the render probe (`./gradlew renderProbe`) on every increment, through the
  real pipeline, with nested loads going to the live backend. Its output is a Swing tree dump (with
  accessible names) plus a PNG.
  - The probe gained a **batch mode** (a folder of increments rendered in one JVM; a Gradle start
    costs ~40 s per screen).
  - It also gained **light/dark themes**: `probe.properties` → `theme=light`.
  - It now applies the platform's own **New UI theme JSON** (`themes/expUI/expUI_{light,dark}.theme.json`
    over its parent theme). Without it, `IntelliJLaf` painted with Darcula's colours and a "light"
    render came out dark.
- **Web reference:** Vaadin screenshots of the same routes at the same viewport (1200×900), taken
  with Playwright.
- **Criteria:**
  - IntelliJ Platform UI Guidelines (jetbrains.design/intellij): theme colour keys, the
    default-button rule, read-only fields, navigator tool windows, type scale.
  - Nielsen's heuristics: H1 visibility of status, H2 match with the real world, H4 consistency,
    H8 minimalist design.
  - WCAG 2.2: 1.4.3 contrast, 1.4.10 reflow, 2.1.1 keyboard, 4.1.2 name/role/value.
  - Silver, *Form Design Patterns*: read-only values are text.
  - Few: dense, aligned data.
  - HiDPI and IDE zoom.
- **Before and after** were rendered with the same probe and theme: master's renderers vs this
  branch's.

Priorities: **P1** blocks or misleads the user, or fails WCAG AA · **P2** slows the user down,
looks broken or loses content · **P3** polish.

**Probe limits:** these do not affect the plugin itself, and are not findings.
- Without a booted IDE the offscreen paint drops some glyphs in strings that need a fallback font
  (IJ-15). For example, "Lars Møller · 1863" paints as "Lars Møller · 8". The tree dump always has
  the right text.
- Platform icons (checkboxes, the date picker's arrow) keep Darcula's set.

## Findings

| ID | Where | What | Evidence | Criterion | Pri | Status |
|---|---|---|---|---|---|---|
| D-01 | Every YAML record page (Star Wars person, museum artwork) | The page title showed the raw template (`${state.name}`, `${state.title}`). `Text`, `Image`, `Avatar` and `Markdown` did not interpolate either ("Image: ${state.imageCredit}"; the avatar showed "state.image"). Only `Page` and field labels interpolated. | `D01-dark-sw-person-before.jpg`, `D01-dark-mu-artwork-before.jpg`; dump `JBLabel text='${state.name}'` | H1, H2 | **P1** | **Fixed**: `PageChrome.header` (shared by Page and Form) interpolates the header. The dispatcher interpolates `INTERPOLATED_KEYS` (Text, Image, Avatar, Markdown, Badge, Anchor, Notice). |
| D-02 | Same pages | The Form's `toolbar` was never rendered. **Edit** and **Back to People** were missing, so a YAML record could be neither edited nor left from its page. Badges, KPIs, peer navigation and banners on a Form were dropped too. A `Button` with a `route` ran its `actionId`, which the server refuses (403). | `D01-*-before.jpg`; wire `Form.toolbar` has 2 buttons, dump has none | H3 (user control), H4 | **P1** | **Fixed**: the Form renders the page header, toolbar included; it goes to the native host toolbar when there is one. `noHeader` (a template owns the header) is honoured. `renderButton` and the native `ToolbarSpec` navigate a `route`. |
| D-03 | Any primary button (Save, Next, Edit, the welcome CTA) | `buttonStyle: primary` set the **"Got It" tooltip style**. In the light theme that is dark-grey text on a dark-grey fill ("Start check-in" unreadable). In dark it looked like any other button, so no screen had a primary action. | `D03-light-adm-welcome-before.jpg` | WCAG 1.4.3; IntelliJ guidelines (one default button) | **P1** | **Fixed**: `DarculaButtonUI.DEFAULT_STYLE_KEY` (the platform's accent default button), without becoming the root pane's default (Enter in a field does not fire a page action). |
| D-04 | Record view mode (Products, Star Wars person, every `readOnly` field) | Read-only values were **disabled inputs**: disabled text at 2.24:1 (light) and 2.09:1 (dark) on the field, measured from the New UI palettes. They could not be selected or copied, and they read as "unavailable", not "this is the record". The required asterisk showed on values nobody fills in, and numbers came out raw (`77.0`). | `D04-light-adm-product-view-before.jpg`, `web-adm-product-view.jpg` | WCAG 1.4.3; Silver (read-only values are text); IntelliJ guidelines (read-only, copyable) | **P1** | **Fixed**: `ReadOnlyValues`. The value is shown as selectable, copyable text in the label colour. Options show their label, empty values read "—", passwords are masked, numbers follow the UI locale, and there is no asterisk. A field a rule disables keeps its disabled control. |
| D-05 | Kanban (Sprint board, museum conservation), Skeleton | Columns painted a fixed `#F4F4F5` and skeletons `#E4E6E9`, which showed as **white slabs in a dark IDE**; the dark cards on top had text at about 1.3:1. | `D05-dark-adm-kanban-before.jpg`, `D05-dark-adm-empty-skeleton-before.jpg` | IntelliJ guidelines (theme keys); WCAG 1.4.3 | **P1** | **Fixed**: `SurfaceColors` (a tint of the theme's panel, list-coloured cards with the theme border, evaluated lazily so a theme switch needs no re-render). Skeleton sizes are HiDPI-scaled. |
| D-06 | Foldout (`/foldout-demo`), item overview, any Markdown | Nine foldout panels were **squeezed into ~110 px slivers** at 1200 px: headings were cut ("Not…") and text wrapped word by word. Markdown printed tables as raw pipes (`\| Date \| Concept \|`) and headings with their hashes (`### Ergonomic chair`). | `D06-dark-adm-foldout-before.jpg` vs `web-adm-foldout.jpg`; `D06-dark-adm-product-overview-before.jpg` | H8; WCAG 1.4.10 | **P1** | **Fixed**: each panel keeps its declared width (22rem by default) and the row scrolls sideways, as on the web, with the theme's divider between panels. `MarkdownHtml` handles headings, pipe tables, numbered lists, `code` and http(s)/mailto links (others stay text), and escapes everything first. |
| D-07 | Composed pages: wizard, dashboard, welcome, item overview, hero search, YAML forms | The root is a plain layout with no page gutter, so the content **touched the window's edges** (the wizard title at x=5, y=0). | `D07-dark-adm-branching-wizard-before.jpg`, `D07-dark-adm-dashboard-before.jpg` | IntelliJ guidelines (content insets); H4 | P2 | **Fixed**: `PageChrome.padsAsPage`. A server-side envelope with a `pageType`, whose root is not Page/App/Crud/Form, gets the 16 px gutter; islands carry no `pageType`. A Form with a header gets the gutter too. |
| D-08 | Titles, KPIs, metric values, calendar days… (38 places) | Font sizes were absolute (`deriveFont(20f)`). At IDE zoom or with a larger UI font, **titles became smaller than the body text**. | Code | HiDPI / IDE zoom; IntelliJ guidelines (type scale) | P2 | **Fixed**: `PageChrome.fontSize(px)` = px × label size / 13, so sizes follow the IDE's zoom and font setting. |
| D-09 | Navigator (every app shell) | The menu was a **column of hyperlinks**: no selected row, no arrow-key navigation, no type-to-search, and N unrelated links for a screen reader (IJ-13). | `D09-dark-adm-shell-before.jpg` | IntelliJ guidelines (tool-window navigators are trees); WCAG 2.1.1 | P2 | **Fixed**: `MenuTree`, the platform `Tree` with speed search. Groups are expanded and bold; a click or Enter on a leaf opens it; Enter on a group folds it. Card menus keep their cards. A hostile label is never rendered as HTML (the renderer is set before the model). |
| D-10 | Welcome / hero CTAs | The call-to-action buttons were stretched into **full-width bars, one per line**. A `WelcomePage` whose template owns the header showed its title twice. | `D03-light-adm-welcome-before.jpg` | H8; Refactoring UI | P2 | **Fixed**: consecutive buttons share one centred row; `noHeader` is honoured (D-02). |
| D-11 | Kanban cards | Card titles were cut early ("Mount fabrica…") with room to spare: the L&F's 72 px button minimum on the "⋯" menu took half the card. A cut title had no way to be read in full. | `D11-dark-mu-conservation-before.jpg` | H1 | P2 | **Fixed**: the menu button is glyph-sized; the title carries a tooltip (and stays out of the focus cycle; the card is the keyboard target). |
| D-12 | Long body texts (museum "Before you start", any long `Text`) | A `Text` is a one-line label, so a paragraph was **cut at the edge of its column** mid-sentence. | `D12-dark-mu-artwork-new-before.jpg` | WCAG 1.4.10; H1 | P2 | **Fixed**: a body text over 90 characters wraps (a read-only wrapping text area in the label font); headings and short texts stay labels. |
| D-13 | Standalone `Image` | A remote image was fetched **on the EDT while the screen was drawn**, so a slow image host froze the whole IDE. The placeholder printed the full URL. | Code | H1; IntelliJ threading rules | P2 | **Fixed**: the image is loaded off the EDT; meanwhile "Loading image…" (or the alt), then "Image unavailable" with the URL in a tooltip. |
| D-14 | RAIL wizard (`@WizardProgress(RAIL)`) | The form shrank to a 130 px column at the far left, beside the rail. `renderHBox` read only `flex: G S NN%`, not `flex: 1` / `flex: 0 0 15rem`. | `D07-dark-adm-branching-wizard-before.jpg` | H8 | P2 | **Fixed**: `FlexSpec`. A percentage (also inside `calc()`, the zones) weighs that much, `flex: G` grows, and `flex: 0 0 <len>` is a fixed column. |
| D-15 | Listings: dates | ISO dates (`2026-05-11`) instead of the user's locale format (IJ-16). | `D04`/listing shots | H2 | P3 | Open |
| D-16 | Listings: numeric headers | The header is left-aligned over right-aligned numbers (IJ-14). | Products listing | Few | P3 | Open |
| D-17 | Listings: status chips | Chips are square and sit at the top of the 30 px row, not vertically centred. | Products / reservations | IntelliJ guidelines (tags) | P3 | Open |
| D-18 | Calendar month view | An empty band about 50 px tall sits between the weekday header and the grid. | `adm-calendar` render | H8 | P3 | Open |
| D-19 | Read-only checkbox | It stays a disabled checkbox, so its label has the same low contrast as D-04. | Product view | WCAG 1.4.3 | P3 | Open (a read-only "✓ Certified" text would follow D-04) |
| D-20 | Pagination | The label has leading spaces ("  Page 1 of 20") and the buttons read "‹ Prev"; the platform uses icon buttons. | Products | IntelliJ guidelines | P3 | Open |
| D-21 | RAIL wizard rail | The web's left divider (`border-left`) is not drawn. | After shot | H4 | P3 | Open |
| D-22 | Page header rows | `FlowLayout` puts its gap BEFORE the first item, so the title row and the button rows start 8–12 px right of the subtitle and the content. | `D01-dark-sw-person-after.jpg` | Alignment (Refactoring UI) | P3 | Open (a leading-gap-free row layout for `buttonRow` and the title row) |

Totals: 6 P1 (all fixed), 8 P2 (all fixed), 8 P3 (open).

## Before / after

Every pair is in `desktop-shots/` (720 px JPEG). Each "before" is master's renderer and each "after"
is this branch, both under the same New UI theme.

| Finding | Before | After |
|---|---|---|
| D-01/02 Star Wars person (YAML Form) | `D01-dark-sw-person-before.jpg` | `D01-dark-sw-person-after.jpg` |
| D-01/02 museum artwork (ItemOverviewPage) | `D01-dark-mu-artwork-before.jpg` | `D01-dark-mu-artwork-after.jpg` |
| D-03/10 welcome, light | `D03-light-adm-welcome-before.jpg` | `D03-light-adm-welcome-after.jpg` |
| D-04 product view, light / dark | `D04-light-adm-product-view-before.jpg` | `D04-light-adm-product-view-after.jpg` |
| D-05 kanban, dark | `D05-dark-adm-kanban-before.jpg` | `D05-dark-adm-kanban-after.jpg` |
| D-05 skeletons, dark | `D05-dark-adm-empty-skeleton-before.jpg` | `D05-dark-adm-empty-skeleton-after.jpg` |
| D-06 foldout | `D06-dark-adm-foldout-before.jpg` | `D06-dark-adm-foldout-after.jpg` |
| D-06 item overview markdown | `D06-dark-adm-product-overview-before.jpg` | `D06-dark-adm-product-overview-after.jpg` |
| D-07/14 RAIL wizard | `D07-dark-adm-branching-wizard-before.jpg` | `D07-dark-adm-branching-wizard-after.jpg` |
| D-07 dashboard | `D07-dark-adm-dashboard-before.jpg` | `D07-dark-adm-dashboard-after.jpg` |
| D-09 navigator | `D09-dark-adm-shell-before.jpg` | `D09-dark-adm-shell-after.jpg` |
| D-11 museum conservation board | `D11-dark-mu-conservation-before.jpg` | `D11-dark-mu-conservation-after.jpg` |
| D-12 museum new artwork | `D12-dark-mu-artwork-new-before.jpg` | `D12-dark-mu-artwork-new-after.jpg` |
| Web reference | `web-adm-foldout.jpg`, `web-sw-person.jpg`, `web-adm-product-view.jpg` | |

## Tests and tooling

- **Tests:** `DesktopPolishTest` (15 tests, one or more per finding). `AppShellRenderTest` now pins
  the navigator tree (rows, Enter on a leaf opens it, Enter on a group folds it).
  `FormFieldRenderTest` pins that a read-only value is selectable text while a disabled field stays
  disabled. `HtmlInDataTest` (the beacon guard) caught the tree's default HTML renderer during this
  work.
- **Render probe:** batch mode, `probe.properties` (`theme`, `size`) and the theme-JSON applier.
  Reproduce with:
  `./gradlew renderProbe -Pprobe.json=<folder of increments> -Pprobe.png=<out folder> -Pprobe.baseUrl=http://localhost:8595`.

## For other teams

- The Products wire still types `price` as a plain number. The plugin now writes it as a number
  (`650`); the money look needs `@Stereotype(money)` (see IJ-07 in the earlier review).
