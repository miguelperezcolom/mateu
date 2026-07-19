---
title: To-do list
description: The user's pending work as grouped, actionable task cards — the Redwood "To-do list" page template.
---

**Status:** ✅ Implemented

## Intent

Give users a single place with everything pending on their plate: buckets like *Today / This week / Later* (or per status), each labelled with its counter, and cards with due-date and priority badges — where clicking a task **acts on it** (typically navigating to it) instead of selecting it for a side detail pane.

## Problem

A generic listing forces to-dos into rows and columns, and a collection-detail splits attention between a list and a detail pane. A personal work queue is neither: it is a flat, prioritized set of actionable cards organized by urgency.

## Solution

Extend `TodoList<Row>` and implement `rows()`, `idOf`, `titleOf`, `groupOf` and `actionOn`. The archetype composes a `TaskQueue` with one counted group per bucket; clicking a card runs `actionOn(row)` — return a `URI` to navigate, or any other Mateu action result.

```java
@UI("/todo-list-demo")
@Title("Front desk tasks")
public class FrontDeskTasks extends TodoList<FrontDeskTasks.Task> {

    public record Task(String id, String title, String guest, String bucket,
                       String due, String priority) {}

    @Override protected List<Task> rows(HttpRequest httpRequest) {
        return myPendingTasks();           // your use case / repository
    }
    @Override protected String idOf(Task t) { return t.id(); }
    @Override protected String titleOf(Task t) { return t.title(); }
    @Override protected String captionOf(Task t) { return t.guest(); }
    @Override protected List<Chip> badgesOf(Task t) {
        return List.of(new Chip(t.due()), new Chip(t.priority()));
    }
    @Override protected String groupOf(Task t) { return t.bucket(); }
    @Override protected Object actionOn(Task t, HttpRequest httpRequest) {
        return URI.create("/bookings/" + t.id());   // clicking navigates to the task
    }
}
```

![To-do list](/images/docs/to-do-list/todo-list-demo.png)

- **Buckets** render in first-appearance order with `name (count)` labels — override `groupOrder()` for an explicit order and `groupLabel(group, count)` for the label format.
- **Badges** (`captionOf` / `badgesOf`) carry the due date and priority of each card.
- When nothing is pending, the page shows an **"All caught up!"** empty state — override `emptyState()` to change it.
- Works on every renderer and on the .NET (`TodoList<TRow>`) and Python (`TodoList[Row]`) backends — see the [parity matrix](/reference/parity/).

## When to use it

Use the to-do list for **personal or team work queues**: approvals, reviews, front-desk tasks, follow-ups. Prefer [collection detail](./collection-detail) when browsing a collection calls for an in-place detail pane, and a [smart search](./smart-search) page when finding the item is the hard part.
