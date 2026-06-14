---
title: "Identifiable, Named, and Searchable"
description: "The marker interfaces that entities and row DTOs must implement to work with the CRUD machinery."
---

These three interfaces are the minimum contracts that entities and row DTOs must satisfy to work with Mateu's CRUD orchestrators and listing components.

---

## Identifiable

Every entity used with `AutoCrudOrchestrator`, `AutoListOrchestrator`, or any `CrudRepository` must implement `Identifiable`.

```java
public interface Identifiable {
    String id();
}
```

Mateu uses `id()` to:
- Link listing rows to their detail view.
- Populate the URL parameter (`:id`) when navigating to view/edit screens.
- Identify which records to delete when the user selects rows and clicks Delete.

### On a record

```java
public record Product(
    String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

For records, `id()` is already provided by the component accessor — no extra method needed.

### On a class

```java
public class Product implements Identifiable {

    private String id;
    private String name;

    @Override
    public String id() { return id; }
}
```

### On a row DTO

Row DTOs shown in a grid also benefit from `Identifiable`. Mark the id field with `@PrimaryKey` so Mateu knows which column to use as the row identifier:

```java
public record ProductRow(
    @PrimaryKey String id,
    String name,
    BigDecimal price
) implements Identifiable {}
```

Without `@PrimaryKey`, Mateu falls back to the field named `id` if it exists.

---

## Named

`Named` extends `Identifiable` and adds a `name()` method. Implement it when you want Mateu to display a human-readable title in the detail view header or in breadcrumbs — instead of falling back to `toString()`.

```java
public interface Named extends Identifiable {
    String name();
}
```

```java
public record Product(
    String id,
    String name,
    BigDecimal price
) implements Named {

    @Override
    public String name() { return name; }
}
```

`AutoNamedView` calls `named.name()` as the page title when the entity implements `Named`. If it does not, it falls back to `entity.toString()`.

`Named` is also required by `CompositionCrudRepository` — child entities used in embedded grids must implement `Named`.

---

## Searchable

`Searchable` lets an entity control how it matches a free-text search in the auto adapters.

```java
public interface Searchable {
    String searchableText();
}
```

`AutoListAdapter` and `AutoCrudAdapter` filter rows in memory using this priority:
1. If `T` implements `Searchable` → use `searchableText()`.
2. Otherwise → use `toString()`.

```java
public record Product(
    String id,
    String name,
    String description,
    BigDecimal price
) implements Identifiable, Searchable {

    @Override
    public String searchableText() {
        return name + " " + description;
    }
}
```

This is only relevant when you rely on in-memory filtering. If you override `search()` in the adapter to run a database query, `Searchable` is not involved.

---

## When to implement each

| Interface | Required by | Purpose |
|---|---|---|
| `Identifiable` | `CrudRepository<T>`, `AutoCrudAdapter<T>`, `AutoListAdapter<T>`, `FilteredAutoCrudOrchestrator<F,T>` | Identifies each entity so the framework can navigate, select, and delete rows |
| `Named` | `CompositionCrudRepository<T, P>`, `AutoNamedView` (optional) | Provides a human-readable title for detail views and breadcrumbs |
| `Searchable` | `AutoListAdapter<T>`, `AutoCrudAdapter<T>` (optional) | Controls which text is matched during in-memory free-text search |

---

## Next

- [AutoListAdapter and AutoCrudAdapter](/java-user-manual/build/auto-adapters/) — where `Identifiable` and `Searchable` are consumed
- [CrudRepository](/java-ui-definition/interfaces/crud-repository/) — the repository that requires `T extends Identifiable`
- [AutoListOrchestrator and AutoCrudOrchestrator](/java-user-manual/build/auto-orchestrators/) — the orchestrators that put it all together
