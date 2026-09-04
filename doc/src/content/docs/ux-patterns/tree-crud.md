---
title: Tree CRUD
description: Browse and edit a hierarchy in place — an expandable tree on the left, the selected node's editor on the right.
---

**Status:** ✅ Implemented — `gridLayout() = GridLayout.tree` + `@SplitCrud`

## Intent

Navigate a hierarchy and edit any node without leaving the tree.

## Problem

Some data is naturally a tree: categories inside categories, an org chart, a folder/document structure, a bill of materials, a project breakdown. A flat, paginated table cannot express it — pagination shreds the parent/child relationship, and forcing the user to drill down screen by screen (open category → open subcategory → open product → back → back) is the *CRUD Tunnel* anti-pattern applied to a tree, paid once per level.

## Solution

Render the master list of a CRUD as an **expandable tree grid**, and pair it with a split view so selecting a node opens its editor in place.

Two ingredients:

1. rows that carry a self-referential `children` collection;
2. `gridLayout()` returns `GridLayout.tree`, on a `@SplitCrud` CRUD.

### The row

```java
public record CategoryRow(

    @Priority(value = 1, identifier = true)   // becomes the expandable tree column
    String name,

    int products,

    List<CategoryRow> children                // the branches
) {}
```

- The first / identifier column becomes the **tree column** — it carries the expand/collapse toggle.
- A row with a non-empty `children` list gets an expand toggle; leaf rows leave `children` empty or `null`.
- `search()` returns only the **root** rows — each branch expands lazily from its `children` list.

### Homogeneous tree — one editor for every node

When every node is the same kind of thing (a category that nests into categories, a folder inside a folder), a plain `AutoCrud` is enough — just switch the layout to `tree`:

```java
@UI("/catalog")
@SplitCrud
public class CatalogTree extends AutoCrud<Category> {

    @Override
    public GridLayout gridLayout() {
        return GridLayout.tree;
    }
}
```

`Category` is `Identifiable`, exposes a `List<Category> children`, and its repository returns the **root** categories (each carrying its nested children). Selecting any node opens the `Category` editor in the detail pane; saving refreshes the tree in place.

### Heterogeneous tree — a different editor per node

Real workspaces mix node types: a project holds services, a service holds modules, a module holds entities — and each edits with its own form. Drop to the lower-level `Crud<…>` and supply the tree from its lifecycle methods:

- a single **row record** describes every node (`label`, a hidden `id`, `children`);
- `search()` builds the whole tree once;
- `save()` / `edit(id)` **route to the right editor** by decoding the node id;
- grouping nodes (a folder, a category header) set **`viewable = false`** so they show no open button and own no editor — only their children are openable.

```java
@UI("/workspace")
@SplitCrud @NotCreatable @NotDeletable
public class WorkspaceCrud extends Crud<
        Object, Object, Object, NoFilters, WorkspaceRow, String> {

    private final WorkspaceAdapter adapter;   // supplies the tree + the per-node editors

    @Override public GridLayout gridLayout() { return GridLayout.tree; }
    @Override public boolean    searchable() { return true; }

    @Override
    public String save(HttpRequest req) {
        String id = req.getString(getIdFieldForRow());
        adapter.save(id, req);   // route by id — the adapter knows which editor the id belongs to
        return id;
    }
}
```

```java
public record WorkspaceRow(

    String label,                 // the tree column

    @Hidden String id,            // real id for openable nodes; synthetic for grouping nodes

    @Hidden boolean viewable,     // false → grouping node: no open button, no editor

    List<WorkspaceRow> children
) {}
```

The orchestrator's `search()` returns the roots with their children nested; `edit(id)` and `view(id)` inspect the id to return the correct concept's form — in the example above they delegate to a `WorkspaceAdapter` service that owns the per-node routing.

## Structure

```
┌──────────────────────────┬──────────────────────┐
│  ▾ Electronics           │                      │
│    ▾ Phones              │   Product: iPhone    │
│        iPhone  ◀ selected│   Name   __________  │
│        Pixel             │   Price  __________  │
│    ▸ Laptops             │                      │
│  ▸ Home & Garden         │   [Save]   [Delete]  │
└──────────────────────────┴──────────────────────┘
```

## Tree is opt-in — the flat layouts are not

For a **non-hierarchical** listing you usually choose nothing: a listing you do not configure is a **table**, at any screen width. Ask for **list** or **cards** with `gridLayout()` when a table is not the right shape. See [Listing layout](/java-user-manual/build/listing-layout/).

**tree also changes the data contract**, not just the look: the rows must carry a self-referential `children` list. That is the extra reason to opt in deliberately.

## Principles served

- **Preserve context** — the whole hierarchy stays visible and interactive while you edit a node.
- **Minimize navigation** — no drill-down/back trips; expand and edit in place.
- **Workflow over screens** — the tree *is* the workspace, not a stop on the way to one.

## When to use it

- Data that is genuinely a tree: catalogs, org charts, folder/document structures, BOMs, project breakdowns.
- **Not** for flat collections — a table / list / cards CRUD (optionally `@SplitCrud`) is simpler and needs no `children` list.

## Related

- [Split View](/ux-patterns/split-view/) — the flat (non-hierarchical) master-detail CRUD this pattern builds on.
- [Listing layout](/java-user-manual/build/listing-layout/) — every `GridLayout` value and when to reach for each.
- [Workspace](/ux-patterns/workspace/) — composing several heterogeneous panels on one screen.
