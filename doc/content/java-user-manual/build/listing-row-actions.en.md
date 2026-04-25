---
title: "Listing row actions"
weight: 11
---

# Listing row actions

In Mateu, listing rows are UI models.

They are not required to match your domain model.

A row can include:

- fields to display
- status indicators
- contextual actions

---

## Single action per row

```java
public record ChangeRow(
        @Hidden String id,
        String page,
        String country,
        String language,
        Status status,
        ColumnAction action
) implements Identifiable {}
```

```java
new ColumnAction("compare", "Compare")
```

Use `ColumnAction` when there is a single action for the row.

---

## Multiple actions per row

```java
public record ReleaseRow(
        String id,
        String site,
        String name,
        String user,
        String date,
        Status status,
        ColumnActionGroup action
) {}
```

```java
new ColumnActionGroup(new ColumnAction[]{
        new ColumnAction("setAsBlue", "Set as blue"),
        new ColumnAction("setAsGreen", "Set as green"),
        new ColumnAction("preview", "Preview")
})
```

Use `ColumnActionGroup` when multiple actions are needed.

---

## Action identifiers

Each action has an `actionId`:

```java
new ColumnAction("compare", "Compare")
```

This id is used by Mateu to route the action to the backend.

---

## Row identifiers

Rows should include an identifier:

```java
@Hidden String id
```

This allows Mateu to know which row triggered the action.

---

## Status in rows

```java
Status status
```

Status is rendered visually (badge-like), not as plain text.

---

## Building rows in adapters

```java
.map(dto -> new ChangeRow(
        dto.pageId(),
        dto.page(),
        dto.country(),
        dto.language(),
        new Status(mapStatus(dto.status()), dto.status().name()),
        new ColumnAction("compare", "Compare")
))
```

Rows are typically built in adapters or query services.

---

## Key idea

> Rows are UI representations, not domain entities.

They can include:

- formatted data
- derived fields
- UI-specific constructs (actions, status)

---

## When to use

Use row actions when:

- actions depend on the specific row
- you need contextual operations
- actions should be visible directly in the list

---

## Summary

- `ColumnAction` → single action
- `ColumnActionGroup` → multiple actions
- `@Hidden id` → required for row context
- `Status` → visual state
- rows are UI models, not domain models
