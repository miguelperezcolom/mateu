---
title: "CrudStore"
description: "Interface for providing CRUD data access to AutoCrud."
---

`CrudStore<T>` is the data-access contract consumed by `AutoCrud`. Implement it to back an automatic CRUD UI with your own storage — in-memory map, JPA repository, REST client, or anything else.

It is a **data-access port** — a thin adapter over persistence. The name "repository" is reserved for domain-aggregate repositories, which is why this port is called `CrudStore`.

## Deprecated alias

The former name `CrudRepository` (and the `AutoCrud` override method `repository()`) still exist as a **deprecated alias marked for removal** (`@Deprecated(forRemoval = true)`): `CrudRepository extends CrudStore`, and `repository()` is still honored when `store()` is not overridden. Existing code keeps compiling unchanged, but new code should use `CrudStore` and override `store()`. The same applies to `CompositionCrudRepository` → `CompositionCrudStore`.

The type parameter `T` must implement `Identifiable`, which requires a single method:

```java
public interface Identifiable {
    String id();
}
```

## Interface

```java
public interface CrudStore<T extends Identifiable> {
    Optional<T> findById(String id);
    String save(T entity);
    List<T> findAll();
    void deleteAllById(List<String> selectedIds);

    // Search + filter + sort + paginate. Ships with a default in-memory
    // implementation (over findAll()); override it to push everything to the DB.
    Page<T> find(String searchText, T filters, Pageable pageable);
}
```

## Methods

| Method | Description |
|---|---|
| `findById(id)` | Return the entity with the given string ID, or `Optional.empty()` |
| `save(entity)` | Persist the entity and return its ID |
| `findAll()` | Return all entities for the listing view |
| `deleteAllById(ids)` | Delete every entity whose ID appears in the list |
| `find(searchText, filters, pageable)` | Search, filter, sort and paginate in one call, returning a [`Page<T>`](#the-find-method). **Has a default** implementation (in-memory over `findAll()`), so you only override it for DB-side paging. |

## Full example

The snippet below mirrors the pattern used in the Items Catalog e2e test app. It shows the entity, store, and orchestrator in one place.

```java
// 1. Entity — must implement Identifiable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
class Item implements Identifiable {

    String id;
    String name;
    double price;

    @Override
    public String id() { return id; }

    @Override
    public String toString() { return name != null ? "Item " + name : "New item"; }
}

// 2. Store — holds your storage logic
class ItemStore implements CrudStore<Item> {

    private static final Map<String, Item> db = new HashMap<>(Map.of(
        "1", new Item("1", "Widget A", 9.99),
        "2", new Item("2", "Widget B", 19.99)
    ));

    @Override
    public Optional<Item> findById(String id) {
        return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Item entity) {
        db.put(entity.getId(), entity);
        return entity.getId();
    }

    @Override
    public List<Item> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}

// 3. Orchestrator — the UI endpoint
@UI("/items")
public class ItemsCatalog extends AutoCrud<Item> {

    @Override
    public CrudStore<Item> store() {
        return new ItemStore();
    }
}
```

Navigating to `/items` renders a full list-create-edit-delete UI with no additional configuration.

## Spring Data JPA integration

`CrudStore` is a plain Java interface, not a Spring Data one. The most common pattern in Spring Boot applications is to wrap a Spring Data `CrudRepository`/`JpaRepository` in a thin adapter (note: that `CrudRepository` is Spring Data's own interface, unrelated to Mateu's port):

```java
// Spring Data JPA repository
public interface ProductJpaRepository extends JpaRepository<Product, String> {
    List<Product> findByNameContainingIgnoreCase(String name);
}
```

```java
// Mateu CrudStore — wraps the JPA repo
@Service
public class ProductStore implements CrudStore<Product> {

    private final ProductJpaRepository jpa;

    public ProductStore(ProductJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<Product> findById(String id) {
        return jpa.findById(id);
    }

    @Override
    public String save(Product entity) {
        return jpa.save(entity).id();
    }

    @Override
    public List<Product> findAll() {
        return jpa.findAll();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        jpa.deleteAllById(selectedIds);
    }
}
```

The adapter decouples Mateu's API from Spring Data so the rest of your code is not tied to the framework.

---

## The `find` method

`find(searchText, filters, pageable)` is the single entry point `AutoCrud` uses to populate the listing view. It returns a `Page<T>`:

```java
public record Page<T>(
    String searchSignature, int pageSize, int pageNumber, long totalElements, List<T> content) {}
```

The `Page` already carries `totalElements`, so **no separate `count` method is needed** — a DB-backed implementation is expected to run both the count and the page query inside `find` and return them together.

### Default (in-memory) behaviour

You get a working `find` for free. The default implementation:

1. loads `findAll()`,
2. keeps rows whose text contains **every whitespace-separated word** of `searchText`, case-insensitively and in any order — using `Searchable.searchableText()` when the entity implements [`Searchable`](/java-ui-definition/interfaces/searchable/), otherwise `toString()`,
3. applies the **field-level filters** (see below),
4. sorts by `pageable.sort()` (each `Sort` field is read reflectively via getter / record accessor / field), and
5. slices out the requested page.

This is fine for small/medium datasets; everything happens in memory.

**How the default decides a filter is set.** The `filters` object is hydrated from the component
state, so fields the user never touched keep their initializers (or primitive zeros/falses). To
tell them apart, the default compares each basic field (strings, numbers, booleans, chars, enums)
against a freshly-constructed instance of the filters class — the no-arg constructor, or for
records the canonical constructor fed with null/zero/false. Only fields whose value **differs from
that baseline** filter the rows: strings by case-insensitive containment, everything else by
equality. The flip side is that filtering **by** a field's default value (e.g. an initializer like
`status = AVAILABLE`) is invisible to the default — override `find` if you need that.

### Range and multi-select criteria

An entity-shaped example object can't say "price between 100 and 150" or "status in (A, B)", so
those conditions travel separately as `FilterCriterion` records (`io.mateu.uidl.data`):

```java
public record FilterCriterion(String field, FilterOperator operator, List<Object> values) {}
// operators: between, gte, lte, in — values already coerced to the field's type
```

They come from the smart search bar's range widgets (temporal fields by default, numeric fields
annotated with `@RangeFilter`) and enum multi-selects, and reach the store through a second
overload:

```java
default Page<T> find(String searchText, T filters, List<FilterCriterion> criteria, Pageable pageable)
```

The framework calls the 4-arg overload **only when such criteria exist**, so a store that
only overrides the 3-arg `find` keeps working unchanged for plain searches — but a range/multi
search on it falls back to the in-memory default over `findAll()`. Override the 4-arg overload too
when you want ranges and value lists resolved in the database (translate `between`/`gte`/`lte` to
comparisons and `in` to an IN clause).

### Overriding for database-side paging

For large tables, override `find` so the search, filtering, sorting and pagination all run in the database. Because `Page` carries `totalElements`, you run a count query plus a paged query:

```java
@Service
public class ProductStore implements CrudStore<Product> {

    private final ProductJpaRepository jpa;

    public ProductStore(ProductJpaRepository jpa) {
        this.jpa = jpa;
    }

    // findById / save / findAll / deleteAllById as usual …

    @Override
    public Page<Product> find(String searchText, Product filters, Pageable pageable) {
        var springPageable = org.springframework.data.domain.PageRequest.of(
            pageable.page(), pageable.size(), toSpringSort(pageable.sort()));
        var result = jpa.findByNameContainingIgnoreCase(
            searchText != null ? searchText : "", springPageable);
        return new Page<>(
            searchText, result.getSize(), result.getNumber(),
            result.getTotalElements(), result.getContent());
    }
}
```

`AutoCrud` delegates to `find` automatically, so a store that overrides it gets DB-side paging with no extra wiring. If you need access to the `HttpRequest` (e.g. tenant scoping), override `fetchRows(searchText, filters, pageable, httpRequest)` on the `AutoCrud` subclass instead — it wraps `store().find(...)` by default.

---

## CompositionCrudStore

`CompositionCrudStore` extends `CrudStore` for child entities that belong to a parent (a foreign-key relationship expressed with `@Composition`).

```java
public interface CompositionCrudStore<EntityType extends Named, ParentIdType>
        extends CrudStore<EntityType> {

    ListingData<EntityType> search(
        String searchText,
        EntityType filters,
        ParentIdType parentId,
        Pageable pageable);
}
```

The type constraint on `EntityType` tightens to `Named`, which extends `Identifiable` and adds:

```java
public interface Named extends Identifiable {
    String name();
}
```

### Additional method

| Method | Description |
|---|---|
| `search(searchText, filters, parentId, pageable)` | Return a paginated list of child entities scoped to the given `parentId` |

Use `CompositionCrudStore` when an embedded child grid inside a parent form must fetch its rows from the server filtered by the parent's ID. Annotate the parent field with `@Composition` to trigger this behaviour.

---

## Next

- [CrudAdapter](/java-user-manual/build/crud-adapter/) — the lower-level interface for full control over each operation
- [AutoCrud](/java-user-manual/build/auto-orchestrators/) — the orchestrator that consumes this store
