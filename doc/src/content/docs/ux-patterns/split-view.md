---
title: Split View
description: Work on a collection without ever leaving the collection.
---

**Status:** ✅ Implemented — `@SplitCrud`

## Intent

Work on a collection without ever leaving it.

## Problem

The list → detail → back flow forces users to lose their position in the list, their active filters, and their scroll position on every round trip. Reviewing forty orders pays that cost forty times. This is the root cause of the *CRUD Tunnel* anti-pattern.

## Solution

Annotate the `CrudOrchestrator` with `@SplitCrud`. The framework renders the list on the left and the detail on the right, in a master-detail split layout. Selecting a row loads the detail panel in place instead of navigating to a new route.

```java
@UI("/orders")
@SplitCrud
public class OrdersCrud extends AutoCrudOrchestrator<Order> {
    // nothing else needed
}
```

The URL still updates (`/orders/42`, `/orders/new`) so deep linking and browser history work correctly.

## Structure

```
┌─────────────────────┬──────────────────────────┐
│  Filters            │                          │
│  ─────────────────  │   Detail / form          │
│  Row 1              │                          │
│  Row 2  ◀ selected  │   Field A  ___________  │
│  Row 3              │   Field B  ___________  │
│  ...                │                          │
│                     │   [Save]  [Delete]       │
└─────────────────────┴──────────────────────────┘
```

## Actions available

The split layout wires up these actions automatically:

| Action | Description |
|--------|-------------|
| `view` | Opens selected row in detail panel |
| `new` | Opens creation form in detail panel |
| `edit` | Switches detail panel to edit mode |
| `save` / `create` | Saves changes, stays in layout |
| `cancel-view` / `cancel-new` / `cancel-edit` | Closes detail panel, returns to list |
| `delete-edit` | Deletes from within the detail panel |

## Principles served

- **Preserve context** — the list stays visible and interactive
- **Minimize navigation** — zero page transitions for the common case
