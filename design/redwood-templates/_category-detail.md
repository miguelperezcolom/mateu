# Redwood category «Detail pages» — Mateu summary (2026-10-23)

For folding into `doc/src/content/docs/ux-patterns/page-templates.md`. Reformulated from the Redwood
category page "Choosing the right detail page template"; statuses verified in code (see the
per-template reviews in this folder and the cited files).

## What the family is for

Detail pages explore **one entity** — a person, an order, a work order — and let the user move
sideways to its **peers** (previous / next record) without going back to the list. Redwood offers
four full pages and two drawers for it; the choice depends on how much there is to show and whether
the user must keep the page underneath in view.

| Redwood template | Pick it when… | Mateu piece | Redwood renderer |
|---|---|---|---|
| Foldout layout (horizontal) | an overview across the top plus 2–8 categories of related information, each in its own vertical panel the user unfolds | `Foldout` archetype (`@Panel` fields; `panelSummary` for the strip) | ✅ `oj-sp-foldout-layout` + `oj-sp-foldout-panel` |
| Foldout layout (vertical) | a small amount of varied content: the overview is the first vertical panel, the rest fold out beside it | `Foldout` (the overview field is the first panel) | ✅ same component; the horizontal/vertical overview variants are not distinguished |
| General overview | the simplest detail page: the attributes of one object, read-only, with related collections and an optional info column | `GeneralOverview<Row>` (record switcher, `overview`, `info` slot) | ✅ `oj-sp-general-overview-page` + `oj-sp-header-general-overview` |
| Item overview | the item itself fills the page: a key-info panel next to tabbed related information | `ItemOverview` archetype | 🟡 composed (key panel + `oj-tab-bar`); the `oj-sp-item-overview-page` attempt was reverted (see the Redwood DESIGN-NOTES) |
| General drawer | more about one or several objects of the current page, read-only, without leaving it | `Drawer` returned from an action (`subtitle`, `size`, `maximizable`, `peerNav`, `position`) | 🟡 `oj-drawer-popup` at the end edge with title + subtitle; size, maximize, peer arrows, position, close icon not drawn — [review](general-drawer.md) |
| Bottom drawer | the same, docked full width along the bottom; closable, or fixed with an expand/collapse handle | `Drawer` with `DrawerPosition.bottom` + `collapsible` | ❌ opens at the end edge like any drawer — [review](bottom-drawer.md) |

## Elements shared by the family

- **Required**: a title (and, for foldouts, at least two titled panels).
- **Header extras**: subtitle, avatar, badges, contextual information, timestamp, previous/next
  object, PWA back arrow, edit/share/favourite icon buttons (item overview). In Mateu these are the
  canonical page-header pieces (`@Subtitle`, `@Avatar`, `@BadgeInHeader`, `@KPI`, `@Timestamp`,
  `PeerNavigationSupplier`) — see [Page templates](/ux-patterns/page-templates/).
- **Messages**: banner, toast and empty-state messages — `@Banner`/`PageBanner`, `Message`,
  `EmptyState`.
- **Compatible drawers**: every detail page accepts the general drawer as a popup; the general
  overview also accepts the create-and-edit and bottom drawers. In Mateu any page can return any
  `Drawer` from an action — there is no compatibility check.
- **Page width**: foldouts are edge to edge (`Foldout` declares `EDGE_TO_EDGE`); general overview
  allows all three widths; item overview fixed or full width (`@PageWidth` / `PageWidthSupplier`).

## Drawer specification in Redwood terms (for the drawers row)

- General drawer: sizes S/M/L (XL with maximize), start or end position, popup (modal or not) or
  layout (overlay or push); required title and close. Mateu models all of it on `Drawer`
  (`DrawerSize`, `DrawerPosition`, `modeless`, `layout`); Vaadin draws it all, Redwood does not yet
  (see the review).
- Bottom drawer: default or maximized height, closable (close icon) or fixed (handle,
  expand/collapse), tabs or title. Mateu: `DrawerPosition.bottom` + `collapsible`; no "fixed" flag
  and maximize does not change the height.

## Gaps worth listing on the map

1. Redwood drawers: size, maximize, peer arrows, start/bottom position, modeless/layout and the close
   icon are on the wire but not drawn (`poc/core/tree.mjs:451-473`, `main-start-page.html:19082`).
2. Neither the general nor the bottom drawer template of Spectra is used — an undeclared imitation.
3. Small screens: no drawer goes full window (guide rule) in any web renderer.
4. Item overview is composed, not `oj-sp-item-overview-page`.
