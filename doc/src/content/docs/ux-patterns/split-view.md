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

Annotate the `Crud` with `@SplitCrud`. The framework renders the list on the left and the detail on the right, in a master-detail split layout. Selecting a row loads the detail panel in place instead of navigating to a new route.

```java
@UI("/orders")
@SplitCrud
public class OrdersCrud extends AutoCrud<Order> {
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

| Action | Available | Description |
|--------|-----------|-------------|
| `view` | always | Opens selected row in detail panel |
| `new` | always | Opens creation form in detail panel |
| `edit` | always | Switches detail panel to edit mode |
| `save` / `create` | always | Saves changes; list refreshes automatically |
| `cancel-edit` | always | Cancels the current edit, reverts to view mode |
| `delete-edit` | always | Deletes the record from within the detail panel |
| `cancel-view` | **not shown** | Hidden — the list is already visible, no need to go back |
| `cancel-new` | **not shown** | Hidden — click another row or elsewhere to leave |

## Principles served

- **Preserve context** — the list stays visible and interactive
- **Minimize navigation** — zero page transitions for the common case

## Hierarchical collections

When the collection is a **tree** rather than a flat list — categories inside categories, an org chart, a folder structure — render the master list as an expandable tree grid (`gridLayout() = GridLayout.tree`) on the same `@SplitCrud`. See [Tree CRUD](./tree-crud).
