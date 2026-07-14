---
title: Kanban board
description: Show work organized in columns of cards — a backlog, a pipeline, a sprint.
---

**Status:** ✅ Implemented

## Intent

Show items grouped by stage — a task pipeline, a sales funnel, an approval flow — as columns of cards, so the shape of the work (what's stuck, what's in flight, how much is done) reads at a glance.

## Solution

Use the `Kanban` component: one `KanbanColumn` per stage, each holding `KanbanCard`s. A card carries a title, an optional description, a small `badge` (a tag or estimate) and an optional accent `color`. Give a card an `actionId` to make it clickable — a click dispatches the standard `action-requested` event, so an `@Action` method with that name runs (drill-in).

```java
@Section("Sprint 24")
Component board = Kanban.builder()
        .columns(List.of(
                KanbanColumn.builder().title("In progress").color("#3b82f6")
                        .cards(List.of(
                                KanbanCard.builder().title("Kanban component")
                                        .description("Ship the new board widget")
                                        .badge("8 pts").color("#3b82f6")
                                        .actionId("openCard").build()))
                        .build(),
                KanbanColumn.builder().title("Done").color("#10b981")
                        .cards(List.of(
                                KanbanCard.builder().title("Chat file upload")
                                        .badge("13 pts").color("#10b981").build()))
                        .build()))
        .build();
```

![Sprint board](/images/docs/kanban/sprint-board.png)

The renderer is dependency-free (plain CSS flexbox), themes through the standard CSS variables, and works in dark mode. Columns scroll horizontally when they overflow; each column header shows its card count; the card's `color` tints its left border.

## When to use it

Use a Kanban to **visualize** work by stage. It is read-only by design in this version (no drag-and-drop) — for moving cards between stages, make each card `actionId`-clickable and open a form/dialog that changes the item's stage, then re-render. Demo: `/kanban-demo`.
