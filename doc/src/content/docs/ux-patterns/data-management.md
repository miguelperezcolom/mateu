---
title: Data management
description: A dense, full-width page that shows the same data as a grid and as a Gantt, with a toolbar switcher between them — the Redwood Data management template.
---

**Status:** ✅ Implemented (Java; .NET/Python ports planned)

## Intent

Present a data set two ways — a **data grid** and a **Gantt timeline** — on one dense, full-width
page, with a toolbar switcher so the user can review it as a table or as a schedule. The Oracle
Redwood **Data management** template.

## How

Extend `DataManagement` and supply the two views:

```java
@UI("/project-plan")
@Title("Project plan")
public class ProjectPlanBoard extends DataManagement {

    @Override protected Component gridView(HttpRequest rq)  { return theDenseTable(); }
    @Override protected Component ganttView(HttpRequest rq) { return theGanttCanvas(); }
}
```

- The page lays out **full width** (`PageWidthStyle.FULL_WIDTH`).
- A toolbar switcher (two buttons, labels via `gridLabel()`/`ganttLabel()`) flips the active view.
- The active view is kept in state (`_view`, `"grid"` by default) and the page **re-renders in
  place** when the user switches — no navigation.
- A heading (from `@Title`) sits above the toolbar; override `heading()` or return blank to omit it.

`gridView` is any component — typically a dense table (an embedded crud/listing, a fluent `Grid`,
or `@InlineEditing` + `@Compact` for in-place editing); `ganttView` is typically a `Gantt` (the same
canvas the `GanttPage` archetype uses). Pure composition of existing components, so it renders on
every renderer without renderer work.

## Redwood parameter and slot reference

The real `data-management-page` API is **considerably richer than "grid ⇄ Gantt"**: it is a
transactional page with four dockable panels. Mateu covers the view switcher and the full-width
canvas; the panel system is not built. The canonical page-header elements shared by every template
are documented once in [Page templates](/ux-patterns/page-templates/).

**Legend:** ✅ supported · 🟡 partial · — not supported · ⚪ deliberately out of scope

| Redwood prop / slot | Mateu | |
|---|---|---|
| Full-width canvas | `pageWidth()` → `PageWidthStyle.FULL_WIDTH` | ✅ |
| View switcher | `gridView`/`ganttView` + `gridLabel()`/`ganttLabel()`; the active view is page state and re-renders in place | ✅ |
| Page heading | `heading()` (from `@Title`; return blank to omit) | ✅ |
| **Slots** `innerEnd` / `outerEnd` / `innerBottom` / `outerBottom` | — the four dockable panels are not built. `Drawer` already supports the underlying mechanic (`layout = true` docks and **pushes** the content instead of overlaying, for every `DrawerPosition`), so the missing piece is the page-level slot grammar, not the behaviour | 🟡 |
| `endOpened` / `bottomOpened: inner \| outer \| none` | — | — |
| `endDisplay` / `bottomDisplay: reflowModeless \| overlayModal` | `Drawer.layout` (reflow) vs `Drawer.modeless` (overlay) express both modes at component level | 🟡 |
| `bottomDrawerState: auto \| closed \| maximized \| minimized` + `displayOptions.bottomDrawerMode/Height` | `DrawerPosition.bottom` + `collapsible` + `maximizable` + `DrawerSize` | 🟡 |
| Transactional header (`save`/`cancel`) | — this archetype is a viewer; use `AutoCrud` or an advanced create-edit form for the transaction | — |
| **Slot** `messages` | toasts/alerts ride on the wire's `messages`, not as a page slot | 🟡 |
| **Slot** `search` | the app-level smart search bar / ⌘K palette, not a page slot | 🟡 |
| **Slot** `announcement` (aria-live) | live regions are installed client-side for a11y, but the backend cannot declare announcement content | 🟡 |
| `feedback` + `openFeedback` | ⚪ the embedded survey is a Fusion Apps concern, out of scope by decision | ⚪ |

## Demo

`demo-admin-panel/.../datamanagement/DataManagementDemo.java` (`/data-management-demo`): a project
plan shown as a table and as a Gantt, switchable from the toolbar.

## See also

- [Gantt](/ux-patterns/gantt/) — the Gantt component and the `GanttPage` archetype used as the timeline view.
- [Inline editing in listings](/ux-patterns/inline-crud-editing/) and [High-density screens](/ux-patterns/high-density/) —
  for the dense, editable grid view.
