---
title: "Identifiable, Named, and SearchableText"
description: "The marker interfaces that entities and row DTOs must implement to work with the CRUD machinery."
---

These three interfaces are the minimum contracts that entities and row DTOs must satisfy to work with Mateu's CRUD orchestrators and listing components.

---

## Identifiable

:::note[Imports]
The samples leave out their `import` lines and compile with single-type imports. Some names exist
in two Mateu packages (the `@Menu` annotation and the `Menu` record, `@Button` and `Button`…), so
wildcard imports of both packages fail with "reference is ambiguous" — see
[Java imports](/reference/java-imports/).
:::

Every entity used with `AutoCrud`, `AutoCrud`, or any `CrudStore` must implement `Identifiable`.

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

### Who assigns the id

An entity's id is one of two kinds, and the creation form follows it:

- **A technical id** — a field named `id` (or marked `@PrimaryKey`) with nothing else on it, like the
  `Product` above. **New** shows no input for it, a create never takes it from the browser, and the
  **store assigns it** when it saves a new record. `save` returns the id it stored the record under:
  a store that assigns none is refused with "The record was saved without an id", never reported as
  saved. A JPA `@GeneratedValue` id is technical too: the database assigns it.
- **An id the user types** — a product code, a username, an ISO country code. Mark it
  `@EditableOnlyWhenCreating`: **New** shows the input, and afterwards it is read-only. A create
  naming an id that is already stored is refused ("A record with this id already exists"), never
  run as an edit.

A store for a technical id assigns it when the record arrives without one:

```java
public class ProductStore implements CrudStore<Product> {

    private final Map<String, Product> db = new ConcurrentHashMap<>();

    @Override
    public String save(Product entity) {
        var product = entity.id() == null || entity.id().isBlank()
                ? new Product(UUID.randomUUID().toString(), entity.name(), entity.price(), entity.status())
                : entity;
        db.put(product.id(), product);
        return product.id();
    }

    @Override
    public Optional<Product> findById(String id) { return Optional.ofNullable(db.get(id)); }

    @Override
    public List<Product> findAll() { return List.copyOf(db.values()); }

    @Override
    public void deleteAllById(List<String> ids) { ids.forEach(db::remove); }
}
```

And an id the user types needs only the annotation (the store keys by it as it comes):

```java
public record Product(
    @EditableOnlyWhenCreating @NotEmpty String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
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

The CRUD detail pages use `named.name()` as the page title when the entity implements `Named`. If it does not, the title falls back to the standard title resolution (`@Title`, `TitleSupplier`, class name).

`Named` is also required by `CompositionCrudStore` — child entities used in embedded grids must implement `Named`.

---

## SearchableText

`SearchableText` lets an entity control how it matches a free-text search in the auto adapters. (Not to be confused with the `Searchable` capability interface, which shows the search box on a [listing](/java-user-manual/build/capability-listings/).)

```java
public interface SearchableText {
    String searchableText();
}
```

`AutoCrud<T>` and `FilteredAutoCrud<F,T>` filter rows in memory using this priority:
1. If `T` implements `SearchableText` → use `searchableText()`.
2. Otherwise → use `toString()`.

```java
public record Product(
    String id,
    String name,
    String description,
    BigDecimal price
) implements Identifiable, SearchableText {

    @Override
    public String searchableText() {
        return name + " " + description;
    }
}
```

This is only relevant when you rely on in-memory filtering. If you override `CrudStore.find(...)` to run a database query, `SearchableText` is not involved.

---

## When to implement each

| Interface | Required by | Purpose |
|---|---|---|
| `Identifiable` | `CrudStore<T>`, `AutoCrud<T>`, `FilteredAutoCrud<F,T>` | Identifies each entity so the framework can navigate, select, and delete rows |
| `Named` | `CompositionCrudStore<T, P>`, CRUD detail pages (optional) | Provides a human-readable title for detail views and breadcrumbs |
| `SearchableText` | `AutoCrud<T>`, `FilteredAutoCrud<F,T>` (optional) | Controls which text is matched during in-memory free-text search |

---

## Next

- [AutoCrud&lt;T&gt;](/java-user-manual/build/auto-orchestrators/) — where `Identifiable` and `SearchableText` are consumed
- [CrudStore](/java-ui-definition/interfaces/crud-store/) — the repository that requires `T extends Identifiable`
- [AutoCrud](/java-user-manual/build/auto-orchestrators/) — the orchestrators that put it all together
