---
title: Kanban board
description: Show work organized in columns of cards — a backlog, a pipeline, a sprint.
---

**Status:** ✅ Implemented

## Intent

Show items grouped by stage — a task pipeline, a sales funnel, an approval flow — as columns of cards, so the shape of the work (what's stuck, what's in flight, how much is done) reads at a glance.

## Solution

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

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

## Moving cards (drag and drop)

Give the board a `moveActionId` and its cards **move**: drag one to another column, or to another
place in its own, and the action runs. A line shows where the card will land; the card moves at
once and goes back to where it was if the action fails. Every card also has a **Move** menu (its
`⋯` button) — up, down, or to another column — so the keyboard and screen readers get the same
moves, and on a phone (React Native) and in the IntelliJ plugin that menu is the way to move.

The action receives `_cardId`, `_fromColumnId`, `_toColumnId` and `_toIndex` (the card's position
in the target column, counted after it left its old place):

```java
Component board = Kanban.builder()
        .id("board")
        .columns(columnsFromTheStore())
        .moveActionId("moveTask")
        .build();

// a plain method: the board naming it is what advertises it
public Object moveTask(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    tasks.move((String) p.get("_cardId"), (String) p.get("_toColumnId"), ((Number) p.get("_toIndex")).intValue());
    return this; // re-render: the board shows what the store now says
}
```

A board without `moveActionId` stays exactly as before — nothing drags and there is no Move menu.

## A live board from a REST source (YAML, no Java)

Instead of carrying its cards, a board can read them: `rowsSource` names a REST source (inline or a
[catalogue](/concepts/data-sources/) entry) whose items become cards. Each item goes to the declared
column whose `id` equals its `columnField` (default `status`); `card` is a template drawn per item
(`${row.x}` in any of its texts); a card colour that names a key of `cardColors` takes its value;
`cardRoute` is where a card goes when clicked (a route of the app, or a whole URL — then a new
tab). Combined with a move action declared in the definition's `actions:`, the board is live and
movable with no backend code:

```yaml
type: Form
title: Conservation board
actions:
  - id: moveTask
    restAction:
      source: {ref: museum-task-move}   # PUT /api/conservation-tasks/${state._cardId}
content:
  - type: Kanban
    id: board
    rowsSource: {ref: museum-conservation-tasks-all}
    columnField: status
    card: {title: "${row.title}", description: "${row.artworkTitle} · ${row.assignee}", badge: "${row.priority}", color: "${row.priority}"}
    cardColors: {urgent: "#dc2626", high: "#d97706", medium: "#2563eb", low: "#9ca3af"}
    cardRoute: conservation/tasks/${row.id}
    moveActionId: moveTask
    columns:
      - {id: backlog, title: Backlog}
      - {id: in_progress, title: In progress}
      - {id: done, title: Done}
```

A REST action reads the **call's parameters over the state**, so the move's body can use them: the
dropped card's item comes along (a `PUT` that needs the whole record has it) with `_toColumnId`
over it:

```yaml
- name: museum-task-move
  source:
    url: http://localhost:8121/api/conservation-tasks/${state._cardId}
    method: PUT
    proxy: true
    headers: {Content-Type: application/json, X-Api-Key: "${secret.MUSEUM_WRITE_KEY}"}
    body: '{"title":"${state.title}","artworkId":"${state.artworkId}","type":"${state.type}","priority":"${state.priority}","status":"${state._toColumnId}","assignee":"${state.assignee}","dueDate":"${state.dueDate}"}'
```

After a successful move the board reads its source again. Proxied sources work on both legs: the
cards are fetched through the server by the board's `id`, and a proxied write gets the same
parameters. The same fields exist in the ports (.NET `Kanban { MoveActionId, RowsSource, ColumnField,
Card, CardColors, CardRoute }`, Python `Kanban(move_action_id=…, rows_source=…, …)`).

## Keeping a manual order (`orderField`)

A live board shows its cards **in the order the source returns them**. A move within a column
sends `_toIndex`, but after the move the board reads the source again — so unless the source
**stores** an order, the card jumps back to wherever the source lists it. Moving between columns
works without one (the column is stored); keeping the order inside a column needs an order field.

When the items carry one, name it with `orderField`:

```yaml
- type: Kanban
  id: board
  rowsSource: {ref: tasks}
  columnField: status
  orderField: rank
  moveActionId: moveTask
  columns: [...]
```

- The cards of each column are **sorted by it** (numbers ascending — a numeric text counts as a
  number; texts after numbers; items without a value last, in the source's order).
- A move also sends **`_toOrder`**, the card's new value, chosen to keep it exactly where it was
  dropped: halfway between its new neighbours, one past the last card, one before the first, or `0`
  in an empty column. The same value is written **over the item's own field**, so a body that
  already sends `"rank": ${state.rank}` sends the new one with no change.

That is **one write per move**: no other card is renumbered, so the field must accept decimals
(`1.5` between `1` and `2`). If a neighbour has no numeric order there is nothing to fit between,
and the card's position (`_toIndex`) is sent instead. A board without `orderField` behaves as
before. The rule is pinned by a corpus every renderer runs (`conformance/client/kanban-order.json`);
the ports have it too (.NET `OrderField`, Python `order_field`).

## When to use it

Use a Kanban to **visualize** work by stage, and to move it along when the stages are the thing
users change. Demo: `/kanban-demo`.
