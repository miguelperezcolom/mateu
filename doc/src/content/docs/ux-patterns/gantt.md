---
title: Gantt / timeline
description: Monitor the progress of a schedule or project on a shared time axis.
---

**Status:** ✅ Implemented

## Intent

Show time-based work — a project plan, a shift schedule, a rollout — as bars on a shared time axis, so overlaps, gaps and progress are visible at a glance.

## Solution

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
