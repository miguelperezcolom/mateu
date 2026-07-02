---
title: "CrudRepository"
description: "Interface for providing CRUD data access to AutoCrud."
---

`CrudRepository<T>` is the data-access contract consumed by `AutoCrud`. Implement it to back an automatic CRUD UI with your own storage — in-memory map, JPA repository, REST client, or anything else.

The type parameter `T` must implement `Identifiable`, which requires a single method:

```java
public interface Identifiable {
    String id();
}
```

## Interface

```java
public interface CrudRepository<T extends Identifiable> {
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

The snippet below mirrors the pattern used in the Items Catalog e2e test app. It shows the entity, repository, and orchestrator in one place.

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

// 2. Repository — holds your storage logic
class ItemRepository implements CrudRepository<Item> {

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
    public CrudRepository<Item> repository() {
        return new ItemRepository();
    }
}
```

Navigating to `/items` renders a full list-create-edit-delete UI with no additional configuration.

## Spring Data JPA integration

`CrudRepository` is a plain Java interface, not a Spring Data one. The most common pattern in Spring Boot applications is to wrap a Spring Data `JpaRepository` in a thin adapter:

```java
// Spring Data JPA repository
public interface ProductJpaRepository extends JpaRepository<Product, String> {
    List<Product> findByNameContainingIgnoreCase(String name);
}
```

```java
// Mateu CrudRepository — wraps the JPA repo
@Service
public class ProductRepository implements CrudRepository<Product> {

    private final ProductJpaRepository jpa;

    public ProductRepository(ProductJpaRepository jpa) {
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
2. keeps rows whose text contains `searchText` — using `Searchable.searchableText()` when the entity implements [`Searchable`](/java-ui-definition/interfaces/searchable/), otherwise `toString()`,
3. sorts by `pageable.sort()` (each `Sort` field is read reflectively via getter / record accessor / field), and
4. slices out the requested page.

The `filters` argument is **ignored** by the default — override `find` to apply field-level filtering. This is fine for small/medium datasets; everything happens in memory.

### Overriding for database-side paging

For large tables, override `find` so the search, filtering, sorting and pagination all run in the database. Because `Page` carries `totalElements`, you run a count query plus a paged query:

```java
@Service
public class ProductRepository implements CrudRepository<Product> {

    private final ProductJpaRepository jpa;

    public ProductRepository(ProductJpaRepository jpa) {
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

`AutoCrud` delegates to `find` automatically, so a repository that overrides it gets DB-side paging with no extra wiring. If you need access to the `HttpRequest` (e.g. tenant scoping), override `fetchRows(searchText, filters, pageable, httpRequest)` on the `AutoCrud` subclass instead — it wraps `repository().find(...)` by default.

---

## CompositionCrudRepository

`CompositionCrudRepository` extends `CrudRepository` for child entities that belong to a parent (a foreign-key relationship expressed with `@Composition`).

```java
public interface CompositionCrudRepository<EntityType extends Named, ParentIdType>
        extends CrudRepository<EntityType> {

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

Use `CompositionCrudRepository` when an embedded child grid inside a parent form must fetch its rows from the server filtered by the parent's ID. Annotate the parent field with `@Composition` to trigger this behaviour.

---

## Next

- [CrudAdapter](/java-user-manual/build/crud-adapter/) — the lower-level interface for full control over each operation
- [AutoCrud](/java-user-manual/build/auto-orchestrators/) — the orchestrator that consumes this repository
