---
title: Status list
description: Rows with an icon, a title, a status chip and/or an action — incidents, side-effects checklists, pending items.
---

**Status:** ✅ Implemented

## Intent

Show a set of heterogeneous items that each carry a *state* or need a *one-off action* — open incidents on a room, the side-effects checklist of a confirmation ("key will be encoded", "police report sent automatically"), pending verifications — without building a full CRUD for them.

## Solution

Use the `StatusList` component: one `StatusItem` per row, each with an `icon` (emoji), a `title`, a muted `description`, and on the right either a `status` chip (`statusColor` from the badge palette: `normal`, `success`, `warning`, `error`, `contrast`) and/or a small button (`actionLabel` + `actionId`).

```java
@Section("Estado")
Component checklist = StatusList.builder()
        .items(List.of(
                StatusItem.builder().id("ac").icon("🌡")
                        .title("Aire acondicionado con ruido")
                        .description("Habitación 901 · Reportado 28 Apr · Mantenimiento avisado")
                        .status("En curso").statusColor("normal").build(),
                StatusItem.builder().id("key").icon("🔑")
                        .title("Grabar llave / pulsera")
                        .description("Complemento de llave digital")
                        .actionLabel("Grabar").actionId("encodeKey").build(),
                StatusItem.builder().id("ses").icon("✓")
                        .title("Parte viajeros (SES)")
                        .description("Se enviará automáticamente al confirmar el check-in")
                        .status("Automático").statusColor("success").build()))
        .build();
```

![Status list](/images/docs/status-list/status-list.png)

An item's button dispatches the standard `action-requested` event with the **item's** `actionId` and parameters `{ "_item": id }`, so one `@Action` method can serve several rows by reading `_item`. Rows without a button are display-only.

## When to use it

Use a `StatusList` for **stateful checklists and incident lists** — things that are *about* the current entity but not a collection to browse. To narrate events in chronological order use a [Timeline](./timeline); for N-of-M identical subtasks use [Task progress](./task-progress). See it composed into a whole screen in [Front-office screens](./front-office). Demo: `/status-list-demo`.
