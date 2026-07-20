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

## Demo

`demo-admin-panel/.../datamanagement/DataManagementDemo.java` (`/data-management-demo`): a project
plan shown as a table and as a Gantt, switchable from the toolbar.

## See also

- [Gantt](./gantt) — the Gantt component and the `GanttPage` archetype used as the timeline view.
- [Inline editing in listings](./inline-crud-editing) and [High-density screens](./high-density) —
  for the dense, editable grid view.
