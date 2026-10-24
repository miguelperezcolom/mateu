---
title: Gantt / timeline
description: Monitor the progress of a schedule or project on a shared time axis.
---

**Status:** ✅ Implemented

## Intent

Show time-based work — a project plan, a shift schedule, a rollout — as bars on a shared time axis, so overlaps, gaps and progress are visible at a glance.

## Solution

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Use the `Gantt` component: one `GanttTask` per row, with a date span, optional progress (rendered as a fill inside the bar) and optional color. The component derives the axis from the tasks' dates, draws month headers and marks today with a vertical line.

```java
@Section("Schedule")
Component plan = Gantt.builder()
        .tasks(List.of(
                GanttTask.builder().title("Discovery & research")
                        .start(LocalDate.of(2026, 6, 1)).end(LocalDate.of(2026, 6, 12))
                        .progress(100).build(),
                GanttTask.builder().title("Implementation")
                        .start(LocalDate.of(2026, 7, 1)).end(LocalDate.of(2026, 8, 14))
                        .progress(25).build(),
                GanttTask.builder().title("QA & launch")
                        .start(LocalDate.of(2026, 8, 17)).end(LocalDate.of(2026, 8, 31))
                        .color("#10b981").build()))
        .build();
```

![Project plan](/images/docs/gantt/project-plan.png)

The renderer is dependency-free (plain CSS grid), themes through the standard CSS variables, and works in dark mode. Hovering a bar shows the task's dates and progress.

## When to use it

Use a Gantt to **monitor** schedules and communicate plans. It is read-only by design in this version — for interactive re-planning (dragging bars, dependencies), pair it with a form or CRUD that edits the underlying tasks and re-renders.


## Gantt page template (`GanttPage` archetype)

The Redwood **Gantt page** is a scheduling workspace: jobs, shifts or project tasks as blocks of
time across a horizon, with their start, progress and end, so the user can follow operations, spot
overlaps and act on a task. Mateu's `GanttPage` archetype gives the full-page version of the `Gantt`
component: an edge-to-edge canvas, a task drawer opened by clicking a bar, and room for supporting
information below.

### When to use it

- The schedule **is** the page — a production plan, a project timeline, a rollout — rather than one
  section of a form (for that, embed a `Gantt` as above).
- The user mostly **monitors** and drills into tasks. Mateu's Gantt is read-only: when the user must
  move or resize blocks across resources, use a [planning board](/ux-patterns/planning-board/)
  (resources × days, drag to reschedule).
- When the same records also need a tabular view, use [Data management](/ux-patterns/data-management/)
  (grid ⇄ Gantt) instead.

### Anatomy

| Region | What it holds | Mateu piece |
|---|---|---|
| Page header | title (Redwood: also subtitle, avatar, Save/Cancel, undo/redo, history, timestamp) | `heading()` — the class `@Title` by default |
| Time-range selector | the period shown (Redwood: a month picker above the chart) | — the axis is derived from the tasks' dates |
| Row axis | one label per row | one row per `GanttTask` (`title`) |
| Timeline | bars with progress on a shared time axis, today marked | `tasks(rq)` → `List<GanttTask>` (`start`, `end`, `progress`, `color`) |
| Task drawer | the clicked task's details, beside the canvas | `taskDrawer(task, rq)` / `taskDetail(task, rq)` — opened by `selectGanttTask` |
| Detail panel | a summary docked under the canvas | `detail(rq)` → shown in a `Card` |
| Bottom drawer | supporting data (typically a table) that stays docked while the task drawer opens | `bottomPanel(rq)` + `bottomPanelTitle()` → a collapsible, modeless bottom `Drawer` |

![The Gantt page: the canvas edge to edge with the tasks table docked below](/images/docs/redwood-templates/gantt-page-1.png)

![A click on a bar opens the task in a side drawer](/images/docs/redwood-templates/gantt-page-2.png)

### Responsive behaviour

The canvas lays out **edge to edge** (`PageWidthStyle.EDGE_TO_EDGE`) at every width; the time axis
scrolls horizontally, and on Redwood the row labels take at most 30% of the width. The scale follows
the plan's span — weeks over days for short plans, months over weeks for plans longer than two
months.

### What you can configure

**Legend:** ✅ supported · 🟡 partial · ❌ not supported

| Element | Mateu piece | Redwood | Note |
|---|---|---|---|
| Edge-to-edge canvas | `pageWidth()` (declared by the archetype) | ✅ | |
| Bars: dates, progress, colour | `GanttTask(id, title, start, end, progress, color)` | ✅ | JET's `oj-gantt`; the done part in a darker shade of the bar's colour |
| Page heading | `heading()` (blank omits it) | ✅ | Redwood paints the page with Spectra's `oj-sp-data-management-page` (the Gantt page pattern is built on it): the heading is its header's title |
| Task click → side drawer | `taskDrawer(task, rq)` / `taskDetail(task, rq)` | ✅ | `oj-sp-general-drawer-template` at the drawer's size (see [Drawer](/ux-patterns/drawer/)) |
| Detail under the canvas | `detail(rq)` | ✅ | |
| Persistent bottom drawer | `bottomPanel(rq)`, `bottomPanelTitle()` | ✅ | Redwood docks it in the data-management page's `innerBottom` drawer as `oj-sp-bottom-drawer-template` in fixed mode (a handle minimizes it; no ✕) |
| Hierarchical rows (expand / collapse) | — | ❌ | rows are flat |
| Several segments per row, downtime, calendar events | — | ❌ | a `PlanningBoard` puts several blocks on a row |
| Dependencies between tasks | — | ❌ | |
| Adjusting the schedule (drag, resize) | — | ❌ | read-only; `PlanningBoard.moveActionId` for drag |
| Time-range / zoom control | — | ❌ | the scale is automatic |
| Transactional header (Save, Cancel, undo/redo, timestamp) | — | ❌ | |

### Building it with Mateu

Extend `GanttPage` and implement `tasks(rq)`; the other hooks are optional:

```java
@UI("/project-timeline")
@Title("Project plan")
public class ProjectTimeline extends GanttPage {

  @Override
  protected List<GanttTask> tasks(HttpRequest rq) {   // the schedule
    return List.of(
        new GanttTask("t1", "Analysis", LocalDate.of(2026, 1, 5), LocalDate.of(2026, 1, 16), 100, null),
        new GanttTask("t2", "Design", LocalDate.of(2026, 1, 12), LocalDate.of(2026, 1, 30), 80, null),
        new GanttTask("t3", "Build", LocalDate.of(2026, 1, 26), LocalDate.of(2026, 3, 6), 45, "#10b981"));
  }

  @Override
  protected Component detail(HttpRequest rq) {        // docked under the canvas
    return new Text("3 tasks · 5 January → 6 March 2026");
  }

  @Override
  protected Component taskDetail(GanttTask task, HttpRequest rq) {  // the task drawer's content
    return new Text(task.title() + ": " + task.start() + " → " + task.end());
  }
}
```

It is pure composition of existing components (Gantt + VerticalLayout + Card + Drawer), so it renders
on Vaadin, Redwood (on `oj-gantt`) and the native renderers without renderer work. Clicking a bar runs
`selectGanttTask`, which opens the task's detail in a side drawer (override `taskDrawer`/`taskDetail`
to change it). The same archetype exists in the .NET (`GanttPage`) and Python (`GanttPage`) ports.
Demo: `/gantt-page-demo` (`demo-admin-panel`, `demo-redwood-showcase` — the latter with a tasks
table in the bottom drawer).

### Known gaps

- A monitor, not a workspace: no hierarchy, no multiple segments per row, no dependencies, no
  drag/resize, no time-range control.
- No transactional page header.
- The default task-drawer text is in Spanish (`"… % completado"`) — override `taskDetail`.
- Redwood: the page is Spectra's `oj-sp-data-management-page` (bottom drawer docked in its
  `innerBottom` slot); the Gantt canvas stays JET's `oj-gantt`. The header's Cancel / primary are
  hidden (no transaction).

Details: [gantt-page review](https://github.com/miguelperezcolom/mateu/blob/master/design/redwood-templates/gantt-page.md).
