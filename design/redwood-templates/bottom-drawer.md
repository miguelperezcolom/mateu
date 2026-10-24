# Redwood «Bottom drawer» — review against the guide (2026-10-23)

Source: the Redwood guide page of `oj-sp-bottom-drawer-template` (category *Layouts*, since 22C —
the page itself only carries a one-line description), the *Detail pages* category page (its
specification table: sizes, contexts, required fields, configurations) and the real `oj-sp` API in
`design/vb-page-template-apis.md` §2.8.

Legend: ✅ supported · 🟡 partial · ❌ missing · ➖ not applicable.

## 1. When it is used

Extra information about an object or task, docked along the **bottom** edge and full width, so the
page above stays visible — list rows, form fields, text, tables. Two modes: **closable** (opened on
demand, closed with ✕) and **fixed** (always there, expanded or collapsed by a handle). In Mateu: a
`Drawer` with `position(DrawerPosition.bottom)` (`DrawerPosition.java:49`); `collapsible(true)` is
the fixed/expand-collapse flavour.

## 2. Regions (anatomy)

| # | Region | Guide | Mateu (model) | Redwood (renderer) | Status |
|---|---|---|---|---|---|
| 1 | Header | title or tabs; close (closable) or handle (fixed); expand/maximize | `headerTitle`, `subtitle`, `collapsible`, `maximizable`, `header` | the same `oj-drawer-popup` panel as every drawer: title + subtitle (`main-start-page.html:19082-19093`) | 🟡 |
| 2 | Main slot | form layout, collection container, data collections, 1-level navigation | `content` | content atoms + fields (`poc/core/tree.mjs:392-473`) | ✅ |
| — | Docking at the bottom | `oj-sp-bottom-drawer-template` in a popup or layout drawer, bottom position | `DrawerPosition.bottom` | ❌ the panel is `edge="end"` (`main-start-page.html:19082`): a bottom drawer opens **on the right** | ❌ |
| — | A drawer placed IN a page (not returned by an action) | — | e.g. `GanttPage.bottomPanel` (`GanttPage.java:100-113`) | drawn inline as a collapsible panel (`oj-collapsible`) in the content flow, not docked (`poc/core/content.mjs:1031-1044`) | 🟡 |

## 3. Responsive behaviour

The guide has no responsive section for this template. Vaadin: full width, height
`--mateu-drawer-height` (default 50vh, cap 90vh) at every size (`mateu-drawer.ts` `.panel.bottom`
styles). Redwood: n/a (not docked at the bottom).

## 4. Configuration

| Element | Guide | Mateu | Vaadin | Redwood | Status |
|---|---|---|---|---|---|
| Bottom position | required | `DrawerPosition.bottom` | ✅ | ❌ opens at the end edge | 🟡 |
| Sizes: default / maximized | yes | `maximizable` steps the *width* ladder; for a bottom drawer the height is fixed (`--mateu-drawer-height`) | 🟡 the ⤢ button has no visible effect on a bottom drawer (width is ignored, `mateu-drawer.ts:254`) | ❌ | 🟡 |
| Expand / collapse (fixed mode, handle) | yes | `collapsible` | ✅ ▾/▴ (`mateu-drawer.ts:284-287`), client-side | ❌ in an overlay; ✅ as `oj-collapsible` only when the drawer is part of the page | 🟡 |
| Closable mode (close icon) | yes | ✕ / Esc / backdrop (always closable) | ✅ | 🟡 Esc / outside click, no icon | 🟡 |
| Fixed mode (no close) | yes | — a returned `Drawer` can always be closed; `GanttPage.bottomPanel` is the only persistent one | 🟡 | 🟡 | 🟡 |
| Title or tabs | required | `headerTitle` / `header` | ✅ | 🟡 title only | 🟡 |
| Subtitle | optional | `subtitle` | ✅ | ✅ | ✅ |
| Next / previous object | optional | `peerNav` | ✅ | ❌ | 🟡 |
| Layout (reflow) vs popup | choice | `layout` / `modeless` | ✅ `layout` pads the root on the bottom (`mateu-drawer.ts:118-128`) | ❌ | 🟡 |
| `discoverability` (peeking tab) | API | — | ❌ | ❌ | ❌ |
| `spBeforeBottomDrawerStateChange` (cancelable) | API | — | ❌ | ❌ | ❌ |

## 5. Findings

1. **Redwood does not dock it at the bottom** — `position` is projected (`tree.mjs:456`) but never
   bound to the panel's `edge`. A bottom drawer is indistinguishable from an end drawer there.
2. Maximize on a bottom drawer is a no-op in Vaadin (it changes a width the bottom panel ignores).
3. No "fixed" mode for a returned drawer (the user can always dismiss it); the only persistent bottom
   drawer is the one an archetype composes into the page.
4. Spectra's `oj-sp-bottom-drawer-template` (`drawerState auto|closed|maximized|minimized`,
   `displayOptions.drawerMode fixed|closable`) maps onto `collapsible` + a missing "fixed" flag.

## 6. Proposed plan

1. Redwood: bind `edge` from `position` (`bottom`) and paint the content with
   `oj-sp-bottom-drawer-template`; `collapsible` → `drawerState minimized/auto`.
2. Make `maximizable` on a bottom drawer switch the height (default → full), as the guide's
   "Default / Maximized" sizing.
3. Consider a `Drawer.fixed` (no close) flag for the fixed mode.

## 7. Status — Spectra adopted (2026-10-24)

A returned `Drawer` with `position(bottom)` is docked at the BOTTOM edge of the `oj-drawer-popup` and
painted with **`oj-sp-bottom-drawer-template`** inside Spectra's `oj-sp-bottom-drawer-template-height-provider`
(auto = half the viewport, maximized = 90vh, minimized = the handle strip). `collapsible` →
`displayOptions.drawerMode: fixed` (the handle; `drawerState` auto ⇄ minimized written back), a
modeless popup that a click on the page does not dismiss; otherwise `closable` (the template's ✕ writes
back `closed`, which drops the overlay). `maximizable` → `displayOptions.maximize`.
Spectra keeps fixed and closable apart: a collapsible drawer has no ✕ on Redwood (Esc closes it) —
a `Drawer.fixed` flag (finding 3) would let a drawer be collapsible AND closable.

**#10 — ADOPTED in phase D2 (2026-10-24)**: `GanttPage.bottomPanel` (and `DataManagement.bottomPanel`) now dock in the `innerBottom` drawer of `oj-sp-data-management-page` as `oj-sp-bottom-drawer-template` (fixed for the Gantt page's persistent drawer, closable for a DockedPanel) — see data-management.md / gantt-page.md §7. Phase B's earlier note follows: NOT adopted, kept as the inline
`oj-collapsible`. The template needs its body as slot content; the page content is painted as flat
atoms (one VB template, no nesting), and the only nestable body (`drawer-body.html`) lives in the
overlay popup, which the side task drawer GanttPage opens at the same time takes, and which overlays
instead of reflowing. Way forward: `oj-sp-data-management-page`'s `innerBottom` slot (plan #10, full)
or a second docked popup with the body partial parametrised + a page padding for the reflow.
