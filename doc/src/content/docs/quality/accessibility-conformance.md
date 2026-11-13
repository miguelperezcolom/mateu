---
title: Accessibility conformance report (WCAG 2.2 AA)
description: A criterion-by-criterion statement of how the UI Mateu generates conforms to WCAG 2.2 Level A and AA, per renderer, with the evidence behind each claim and the known gaps.
---

This is Mateu's accessibility conformance report. It follows the structure of the **ITI VPAT® 2.5
(WCAG edition)**: scope, method, then a table per conformance level in which each success
criterion gets one of four levels and a remark. The wording is ours. Procurement teams that need
the VPAT form itself can fill it from this page; every claim below links back to code or to a
test.

**Report date:** 2026-11-11 · **Product version:** Mateu 3.0-beta.58 (repository `master` at
`cc686502eb`) · **Standard:** [WCAG 2.2](https://www.w3.org/TR/WCAG22/), Levels A and AA.

## What this report covers, and what it cannot

Mateu is a framework, not an application. It generates the UI from a model the app author
declares, so a screen's accessibility comes from two sources:

- **What Mateu guarantees.** Markup, roles, names, focus management, keyboard operation, live
  announcements, language, page titles, error identification, the shell's navigation. Fixing any of
  these fixes every Mateu app at once, which is why most of the work happened here.
- **What the app author controls.** The words (labels, titles, help, error messages, image `alt`),
  the colours and custom CSS they add, the content of `Html`/`Markdown`/`Element` components, the
  web components they register, any media they embed, and which interaction patterns they choose
  (a drag-only board, an autoplaying carousel, a short undo window).

A level of **Supports** below means: a screen built from Mateu's components, with meaningful
labels and the framework's default theme, meets the criterion without code from the author. It
does **not** mean that any app built with Mateu conforms. An author can still break most criteria —
a `@Label("x")`, a white-on-yellow `@Style`, an image without `alt`. Where the author's part is
decisive, the remark says so.

### Renderers in scope

| Renderer | Platform | Built on |
|---|---|---|
| **Vaadin** (web) | Browsers | Vaadin web components (Lumo theme) + Mateu's own Lit elements in `libs/mateu` |
| **Redwood / VB** (web) | Browsers | Oracle JET + Spectra (`oj-sp-*`) inside Visual Builder; Mateu core in `apps/redwood/poc` |
| **React Native** | iOS, Android | React Native + React Native Paper (Material 3) |
| **Desktop** | Windows, macOS, Linux | The IntelliJ plugin (Swing) — the same code ships as the desktop app |

For the two native renderers the criteria are read as W3C's
[WCAG2ICT](https://www.w3.org/TR/wcag2ict-22/) note applies them to non-web software. A criterion
written for "a set of web pages" (2.4.1, 2.4.5, 3.2.3, 3.2.4, 3.2.6) is applied to the app's own
screens.

Out of scope: the `.NET` and Python servers and the Java adapters. They produce the wire model the
renderers draw and have no UI of their own (the conformance corpus pins them to identical output,
so a screen from any backend renders identically). Also out of scope: the visual editor, the
docs site, and the host's login page — Mateu does not authenticate.

## Method

Three kinds of evidence, labelled in the tables as **[axe]**, **[behaviour]** and **[code]**,
plus **[unit]**: a component test (vitest, the DOM ones in jsdom; the Redwood poc and React Native
node suites) that drives the behaviour without a real browser or assistive technology.

**Automated markup checks [axe].** axe-core with the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
and (since the fixes below) `wcag22aa` tags.

- `e2e/tests/shared/accessibility.spec.ts` — 8 routes covering the shapes Mateu generates (form,
  every field kind, validation, app shell, CRUD listing, tabs, sections, accordion). It is part of
  the shared Playwright suite, so it runs against **all five Java adapters** (MVC, WebFlux,
  Micronaut, Quarkus, Helidon MP) on every pull request.
- `e2e/a11y-audit.mjs` — the same rules over 16 routes, including the user-journey screens
  (`/j/tasks`, `/j/stock`, `/j/sales`, …). CI job `e2e (core)` fails on any violation or on a route
  it could not scan.
- `e2e/vb-a11y-probe.mjs` — axe over four Redwood screens of `demo/demo-vb` (home, a CRUD, a
  wizard, a check-in record), CI job `renderer-vb`.

**Automated behaviour checks [behaviour].** What axe cannot see, scripted in a real browser:
skip link is the first Tab stop and moves the focus; a `main` landmark exists; live regions exist at
boot; navigating announces the page title; a rejected save marks the field invalid, puts the
message on the control and moves the focus there; a drawer and a dialog keep the focus through 12
Tabs and a Shift+Tab and give it back on Esc; no element has an interactive role without a tab
stop. Redwood: the same six checks in `vb-a11y-probe.mjs`. React Native:
`e2e/rn-a11y-probe.mjs` drives the app on React Native for Web and checks that every control has a
name, text inputs are named, tappables are buttons, selection boxes expose a checked state, charts
have a text alternative and a rejected field carries its error in its name. Desktop:
`./gradlew renderProbe` prints each Swing component's accessible name, description and `labelFor`.

**Code inspection [code].** The mechanisms named in the remarks were read in the source at the
version above: `libs/mateu/.../infra/a11y/` (`focusTrap.ts`, `announcer.ts`, `activate.ts`,
`focusStyles.ts`, `accessKeys.ts`), `apps/redwood/poc/a11y.mjs`, `react-native/src/a11y/a11y.ts`,
`intellij-plugin/.../ui/A11y.kt`, and their unit tests.

**Results at this version.** CI run
[42977176795](https://github.com/miguelperezcolom/mateu/actions/runs/42977176795) on the commit
above: `a11y-audit.mjs` reported 0 violations across 16 routes (the one rule flagged on `/j/fields`
is the `vaadin-tabs` carve-out below); `vb-a11y-probe.mjs` passed all 10 checks; the three e2e
legs that run `accessibility.spec.ts` passed. `rn-a11y-probe.mjs` and the desktop render probe
**do not run in CI** — they were run by hand when the native work landed (5/5 checks on React
Native, every field bound on the desktop) and are not re-verified for this report.

**What was not done.** No audit by an external party. No testing with screen readers by users
with disabilities. Assistive technology was not exercised by hand for this report (NVDA, JAWS,
VoiceOver and TalkBack are the ones the mechanisms target). The WCAG 2.2-only axe rules
(`wcag22aa`, e.g. target size) joined the gate with the fixes below; one run of `a11y-audit.mjs`
with them, against a SUT built before those fixes, found no violation on its 8 routes beyond the
`vaadin-tabs` carve-out. Nothing measures reflow at 320 CSS
pixels, text spacing or non-text contrast. Where a criterion depends on one of those, it is not
claimed as Supports.

### Conformance levels used

- **Supports** — Mateu meets the criterion with no known exception in its own output.
- **Partially supports** — some of the output does not meet it, or it was not measured where it
  would have to be; the remark says which.
- **Does not support** — most of the relevant output does not meet it.
- **Not applicable** — Mateu produces nothing the criterion is about.

Short forms in the tables: **S**, **P**, **DNS**, **N/A**. Columns: **V** = Vaadin web, **R** =
Redwood web, **RN** = React Native, **D** = Desktop.

## Table 1 — WCAG 2.2 Level A

| Criterion | V | R | RN | D | Remarks |
|---|---|---|---|---|---|
| **1.1.1 Non-text Content** | S | P | S | P | `Image.alt` reaches every renderer (empty `alt` = decorative) — the text is the author's. Icon-only buttons carry names [code] [behaviour]. Charts: `mateu-chart`'s canvas is `role=img` named by the chart title (else its series) with the numbers as a visually-hidden data table, and `mateu-trend-chart`'s svg is `role=img` with a one-sentence summary (`infra/a11y/chartAlternative.ts`) [unit]. Redwood: a hidden text alternative next to `oj-chart` (`chartTextAlternativeOf`) — pinned by the poc tests, not checked in a rendered VB page. React Native charts are named [behaviour]. Desktop: not measured for charts. |
| **1.2.1 Audio-only and Video-only (Prerecorded)** | N/A | N/A | N/A | N/A | Mateu has no audio or video component. Media an author embeds through `Html`/`Element` is the author's. |
| **1.2.2 Captions (Prerecorded)** | N/A | N/A | N/A | N/A | As 1.2.1. |
| **1.2.3 Audio Description or Media Alternative (Prerecorded)** | N/A | N/A | N/A | N/A | As 1.2.1. |
| **1.3.1 Info and Relationships** | S | S | P | S | Web: labels are wired by the design system's own controls, headings are real headings, listings are grids/tables with headers, validation messages are tied to the control (`aria-describedby`, set inside the control's shadow root) [axe] [behaviour]. RN has no label-to-input relation, so the label and the required/invalid state are folded into the control's name [code]; section structure is conveyed through headings only. Desktop: `setLabelFor` binds each caption [code]. |
| **1.3.2 Meaningful Sequence** | S | S | S | S | The reading order is the model's declaration order; zone columns and side panels reflow in source order. |
| **1.3.3 Sensory Characteristics** | S | S | S | S | Mateu's own texts do not rely on shape or position. Instructions the author writes are the author's. |
| **1.4.1 Use of Color** | S | S | S | S | Statuses, badges, tones and validation always carry text; a colour is never the only signal in Mateu's own components. An author colouring a column with no text is the author's. |
| **1.4.2 Audio Control** | N/A | N/A | N/A | N/A | Mateu plays no audio. |
| **2.1.1 Keyboard** | P | P | S | S | Every widget Mateu makes clickable gets a role, a tab stop and Enter/Space (`activate.ts`) [behaviour]; kanban cards have a "Move…" menu [code]. `PlanningBoard` blocks are focusable: arrows move a block a day or a row, Shift+Left/Right change its length, Enter applies, Escape cancels; a `DropZone` offers "Move the selected rows here" for the selected rows of a `@DragRows` listing [unit]. **Remaining gaps (web):** that DropZone button needs the listing to have row selection; the signature pad is pointer-only (a drawn signature is the essential exception). Redwood: `PlanningBoard`/`DropZone` still pointer-only. RN: drag has `accessibilityActions` ("Move") [code]. Desktop: Swing keyboard operation throughout. |
| **2.1.2 No Keyboard Trap** | S | S | S | S | Modal overlays trap Tab on purpose and release on Esc/close, returning focus to the opener [behaviour]. No other trap is known. |
| **2.1.4 Character Key Shortcuts** | S | P | N/A | S | One-key shortcuts (`?`, a bare-letter `@AppShortcut`, a one-key `@Action(shortcut)`) never fire while typing in a field and can be **turned off** with the switch in the shortcuts list (one per-browser setting shared by both web renderers); Ctrl+/ always opens the list [unit]. Access keys need Alt. Redwood: the switch covers `?` and app shortcuts; a screen's one-key `@Action(shortcut)` (`keys.mjs`) is not yet covered. |
| **2.2.1 Timing Adjustable** | S | P | P | P | The idle-session warning (`@App(idleTimeoutMinutes)`) warns before signing out and lets the user extend with one action. Error messages are sticky. Toasts close on a clock that **stops while the toast is hovered, focused or the page is hidden** and resumes with what was left (at least 2 s); a toast with an action (Undo, Retry) stays at least 10 s (`infra/notify/dismissTimer.ts`, both web notifiers) [unit]. Redwood: the same rule on `oj-message` (`pausableToastClose`), pinned by the poc tests with a fake DOM, not in a live page. React Native: actionable toasts stay at least 10 s and stay until dismissed while a screen reader is on; plain toasts keep their 4 s. `@Banner(timeoutSeconds)` auto-dismisses if the author sets it. |
| **2.2.2 Pause, Stop, Hide** | S | S | S | S | An autoplaying `Carousel` has a visible pause/play button, also pauses while hovered or focused, and starts stopped under `prefers-reduced-motion` [unit]. Only the web renderer autoplays. Skeleton shimmer and busy pulses are loading indicators that end with the load. |
| **2.3.1 Three Flashes or Below Threshold** | S | S | S | S | Nothing Mateu draws flashes. |
| **2.4.1 Bypass Blocks** | S | S | N/A | N/A | "Skip to content" is the first Tab stop and a `main` landmark wraps the content [behaviour] (`mateu-skip-link.ts`, `poc/a11y.mjs`). Natives: screen readers navigate by element; there is no repeated web-style block to bypass. |
| **2.4.2 Page Titled** | S | S | S | S | `SetWindowTitle` sets the document / window / screen title on every route and is also announced [behaviour]. The title text is the author's (`@Title`). |
| **2.4.3 Focus Order** | S | S | S | S | Focus follows the declaration order; overlays take focus on open and return it; after navigation the focus moves to the new content's heading (not on first load, so the skip link stays reachable) [behaviour]. |
| **2.4.4 Link Purpose (In Context)** | S | S | S | S | Links and row links carry their visible text; the author writes it. |
| **2.5.1 Pointer Gestures** | S | S | S | S | No multipoint or path gesture is required: maps keep zoom buttons, carousels have buttons, boards have menus. The signature pad's stroke is essential to a signature. |
| **2.5.2 Pointer Cancellation** | S | S | S | S | Activation happens on the up event (native buttons, design-system controls). Drags can be cancelled with Esc (planning board) or by dropping outside a target. |
| **2.5.3 Label in Name** | S | S | S | S | The accessible name starts with the visible label — on RN it is `"<label>, required, invalid: …"` by construction (`fieldA11y`). |
| **2.5.4 Motion Actuation** | N/A | N/A | N/A | N/A | Nothing is operated by device motion. |
| **3.1.1 Language of Page** | S | S | P | P | Web: `<html lang>` is set from the server's locale (`AppDto.locale`, `chromeTexts.ts`), falling back to the browser's. Natives follow the OS language; the app's locale is not exposed to the platform's accessibility API separately. |
| **3.2.1 On Focus** | S | S | S | S | Focus never triggers navigation or a server action. The smart-search panel opens on click or typing, not on focus, for this reason. |
| **3.2.2 On Input** | S | P | P | S | The app-context selector (`@AppContext`) changes the context (the app reloads against it). The picker says so before it is used — its button is described by "Choosing another one reloads the app", repeated at the top of its panel — announces the change, and reloads 700 ms later; picking the current value does nothing [unit]. Redwood: the context drawer shows the same sentence (linked to each picker) and its chain announces the change — static checks only. RN: the selector's hint says it and the change is announced (not run on a device). `@AutoSave` and the record switcher re-render content in place, which is a content change, and are the author's choice. |
| **3.2.6 Consistent Help** | S | S | S | S | Mateu's own help mechanisms (the command center, `?` shortcuts help, the AI chat button) sit in the same place on every screen of the shell. Help the author adds is the author's. |
| **3.3.1 Error Identification** | S | S | S | S | A rejected field is marked invalid on the control, its message is tied to it and announced, and the focus moves to the first one [behaviour]. The server re-checks the same constraints and answers "There are validation errors". |
| **3.3.2 Labels or Instructions** | S | S | S | S | Every field gets a visible label (derived from the field name if the author gives none), required fields are marked and announced, `@Help` becomes the description. Whether a derived label is meaningful is the author's. |
| **3.3.7 Redundant Entry** | S | S | S | S | A wizard keeps every step's values across navigation in both directions; drafts (`Draftable`) resume where left; a failed save keeps the typed values. |
| **4.1.2 Name, Role, Value** | P | P | S | S | Web: design-system controls expose name/role/value; Mateu's own widgets carry roles and states (`aria-expanded`, `aria-selected`, `aria-busy`) [axe] [behaviour]. **Known exceptions, upstream:** `vaadin-tabs` puts a `<div tabindex="-1">` inside its own `role="tablist"` (Vaadin); `oj-navigation-list` puts its collapse icon `role="button"` inside the list (JET). Both are carved out of the gate for that one rule on that one element. RN: every touchable has a role (105 sites), checkboxes expose a checked state [behaviour]. Desktop: names and descriptions on every field and button [code]. |

4.1.1 Parsing is obsolete in WCAG 2.2 and is not listed.

## Table 2 — WCAG 2.2 Level AA

| Criterion | V | R | RN | D | Remarks |
|---|---|---|---|---|---|
| **1.2.4 Captions (Live)** | N/A | N/A | N/A | N/A | No media components. |
| **1.2.5 Audio Description (Prerecorded)** | N/A | N/A | N/A | N/A | No media components. |
| **1.3.4 Orientation** | S | S | S | S | No renderer locks orientation (the mobile app declares `orientation: default`); phone widths switch to a one-column layout. |
| **1.3.5 Identify Input Purpose** | S | P | P | N/A | A field declares its purpose with `@Autocomplete("given-name")` (.NET `[Autocomplete]`, Python `Autocomplete()`, YAML/fluent `FormField.autocomplete`); an editable email field gets `email` without it. The token travels as `FormFieldDto.autocomplete` from all three backends and the browser expander. Vaadin: on the text, email, password, textarea and number fields [unit]. Redwood: copied from the host's `data-autocomplete` onto the native input (`installInputPurpose`) — tested on a fake DOM, not in a live page. React Native: `autoComplete` + iOS `textContentType` (mapping tested; not run on a device). Other purposes are the author's to declare. Desktop: no platform equivalent. |
| **1.4.3 Contrast (Minimum)** | S | S | P | P | Web: axe measures contrast on every gated route with 0 violations [axe]; Redwood's dark-header actions were fixed from 1.33:1 to the inverse text colour [axe]. RN: colours come from Material 3 tonal tokens (light and dark) but are not measured by a tool. Desktop: the IDE theme draws most text; Mateu's own tones (status chips) are not measured. Colours the author sets (`@Style`, badge colours, `Element` content) are the author's. |
| **1.4.4 Resize Text** | S | S | S | P | Web: rem-based themes, browser zoom to 200 % works. RN: system font scaling is not disabled anywhere. Desktop: follows the IDE's font settings; fixed-size Swing panels were not tested at large sizes. |
| **1.4.5 Images of Text** | S | S | S | S | Mateu renders text as text. |
| **1.4.10 Reflow** | P | P | S | N/A | Forms, shells and listings adapt to narrow widths (zone columns wrap below 20rem, the listing box no longer forces 30rem). Data grids, gantt, planning boards and matrix grids scroll horizontally — allowed for two-dimensional content. **Not measured** at 320 CSS px. Desktop: window-based, not web reflow. |
| **1.4.11 Non-text Contrast** | P | P | P | P | Focus rings and control borders come from Lumo / Redwood / Material 3 / the IDE theme; Mateu's own widgets use the theme's tokens. **Not measured** (axe has no rule for it). |
| **1.4.12 Text Spacing** | P | P | N/A | N/A | No known clipping, but **not measured**. Cells and plain-text fields truncate with an ellipsis by design, which an override of spacing can make worse (`@Multiline` wraps instead). Natives: not applicable (no user style sheets). |
| **1.4.13 Content on Hover or Focus** | S | P | N/A | S | Tooltips are the browser's `title` or `vaadin-tooltip` (dismissible with Esc, hoverable). Redwood: JET's own popups; not separately verified. RN has no hover. |
| **2.4.5 Multiple Ways** | S | S | S | S | The app shell gives the menu plus, when the app enables them, the ⌘K palette / command center, global search, recent screens and breadcrumbs. A mount with a single screen has nothing to offer two ways to. |
| **2.4.6 Headings and Labels** | S | S | S | S | Every page, section and card title is a heading; labels are the author's words. |
| **2.4.7 Focus Visible** | S | S | S | S | Design-system controls draw their focus ring; Mateu's own activatable widgets add `:focus-visible` styles inside their shadow roots (`focusStyles.ts`). RN: the platform's focus highlight for keyboard users. Desktop: Swing focus painting. |
| **2.4.11 Focus Not Obscured (Minimum)** | P | P | S | S | A keyboard-focused control that lands under the pinned header, the folded index bar or a pinned `@Section(sticky)` card, or under a floating button, is scrolled clear of them (`mateu-page`, `infra/a11y/focusNotObscured.ts`) [unit — the offset logic only]. **Not measured in a browser**, and the connectivity banner is not counted. Redwood: not addressed. |
| **2.5.7 Dragging Movements** | P | P | S | P | Kanban: a "Move…" menu. `PlanningBoard`: the focused block's tool row (one day earlier/later, previous/next row, shorter/longer, Apply) [unit]. `DropZone`: "Move the selected rows here" — needs row selection on the listing. Redwood: PlanningBoard and DropZone still drag-only. RN offers "Move to…" pickers. Desktop: a keyboard alternative to dragging rows was not verified. |
| **2.5.8 Target Size (Minimum)** | P | P | S | P | Design-system buttons are at least 24 × 24 CSS px. **Not measured:** small glyph controls Mateu draws itself — filter-chip ✕, kanban ⋯, drawer header buttons, peer-navigation arrows. RN follows Material 3 touch targets. |
| **3.1.2 Language of Parts** | N/A | N/A | N/A | N/A | Mateu does not mix languages in its own texts; content in another language is the author's, and there is no field to mark it. |
| **3.2.3 Consistent Navigation** | S | S | S | S | The shell's navigation is generated once per app and stays in the same place and order on every screen. |
| **3.2.4 Consistent Identification** | S | S | S | S | The same action has the same label and icon wherever Mateu draws it (CRUD labels are overridable per CRUD, which the author keeps consistent). |
| **3.3.3 Error Suggestion** | S | S | S | S | Bean-validation messages ("must be greater than or equal to 1") are shown on the field; what a custom message suggests is the author's. |
| **3.3.4 Error Prevention (Legal, Financial, Data)** | S | S | S | S | Mateu provides the mechanisms — confirmation on actions (`confirmationRequired`), validation before submit, a review step in wizards, optimistic-lock conflicts, undo of deletes, the unsaved-changes guard. Using them for legal or financial steps is the author's job. |
| **3.3.8 Accessible Authentication (Minimum)** | N/A | N/A | N/A | N/A | Mateu does not authenticate; the sign-in page is the host framework's or the identity provider's, and its accessibility is theirs. |
| **4.1.3 Status Messages** | S | S | S | S | Two live regions created at boot (polite, assertive); error toasts are assertive; navigation, recovery after a connection loss and `UICommand.announce` are spoken [behaviour]. RN: `announceForAccessibility`. Desktop: `AccessibleAnnouncerUtil` (silent on IDE builds that lack it). |

## Known gaps, in one list

What Mateu can change and has not, at this version:

1. **Redwood still lacks** the keyboard / single-pointer alternatives for `PlanningBoard` and
   `DropZone` (2.1.1, 2.5.7), the focus-not-obscured offset (2.4.11), and the one-key switch for a
   screen's `@Action(shortcut)` (2.1.4).
2. **DropZone without dragging needs row selection** on the source listing (2.1.1, 2.5.7).
3. **The fixes of 2026-11 are verified by component tests, not in a browser or with assistive
   technology** — charts, autocomplete, pausable toasts, the app-context picker, planning-board
   keys, the focus offset, one-key shortcuts and the carousel button (see [unit] above). React
   Native's were not run on a device.
4. **Nothing measures** reflow, text spacing, non-text contrast or target size beyond axe's
   `target-size` rule; the native probes do not run in CI.
5. **No external audit and no hand testing with assistive technology** for this report.
6. **What the GA pass of the Explorer still finds with axe** (2026-11-13; fixed in the same pass:
   the unnamed frames of Redwood's whole-page examples, a named map pin and the skeleton without a
   role, the 24px targets of the kanban Move, a clickable calendar chip and the form editor's row
   buttons, an unnamed listBox field):
   - *nested-interactive* (4.1.2) on the Vaadin calendar's day cells, the kanban cards and the form
     editor's rows — a clickable container holding buttons; it needs a redesign of those widgets;
   - Redwood: a `ProgressBar`'s name does not reach JET's inner progressbar, a switch without a
     name in the pickers example, the content `MenuBar`'s `role=menubar` children, `aria-label`
     on `mateu-rich-text-field`, `link-in-text-block`, the foldout page's `aria-allowed-attr` and
     target size;
   - contrast below 4.5:1 on the record-merge "(empty)" text, the form editor's type badge, the
     task-queue chip and the calendar's day label;
   - Vaadin: the `VirtualList` scrollable region has no tab stop, a `@TitlePlaceholder` page with
     no title leaves `document.title` empty, and the item overview's photo (`TemplateImage`) has no
     alt text to give its `<img>`.

And two that only upstream can change: the `vaadin-tabs` and `oj-navigation-list` role-children
findings (4.1.2).

## What app authors must do

The framework's part ends where the author's words and choices begin:

- Give fields, pages, sections and actions meaningful labels (`@Label`, `@Title`), help where a
  field needs explaining (`@Help`), and validation messages that say how to fix the error.
- Give every `Image` an `alt` (empty when decorative).
- Keep custom colours (`@Style`, badge colours, theme overrides) at 4.5:1 for text and 3:1 for
  control boundaries.
- Do not bind single-letter `@Action(shortcut)`s; offer an action next to any drag-only board;
  avoid `auto` carousels and `@Banner(timeoutSeconds)` for content users must read.
- Make custom fluent components and registered web components keyboard-operable — see
  [Accessibility in your code](/java-user-manual/advanced/accessibility/).

## Related

- [Accessibility](/ux-patterns/accessibility/) — how each guarantee works, per renderer, and how to
  run the probes.
- [Support policy](/reference/support-policy/) — which versions get fixes, and how to report a problem.
- [Known issues](/reference/known-issues/)

To report an accessibility defect, open an issue on
[GitHub](https://github.com/miguelperezcolom/mateu/issues) with the renderer, the screen and the
assistive technology used.
