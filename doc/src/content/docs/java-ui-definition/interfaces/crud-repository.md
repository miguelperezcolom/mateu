---
title: "CrudRepository"
description: "Interface for providing CRUD data access to AutoCrudOrchestrator."
---

`CrudRepository<T>` is the data-access contract consumed by `AutoCrudOrchestrator`. Implement it to back an automatic CRUD UI with your own storage — in-memory map, JPA repository, REST client, or anything else.

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
}
```

## Methods

| Method | Description |
|---|---|
| `findById(id)` | Return the entity with the given string ID, or `Optional.empty()` |
| `save(entity)` | Persist the entity and return its ID |
| `findAll()` | Return all entities for the listing view |
| `deleteAllById(ids)` | Delete every entity whose ID appears in the list |

## Full example

The snippet below mirrors the pattern used in the Items Catalog e2e test app. It shows the entity, repository, adapter, and orchestrator in one place.

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

// 3. Adapter — bridges the repository to AutoCrudOrchestrator
class ItemAdapter extends AutoCrudAdapter<Item> {

    @Override
    public CrudRepository<Item> repository() {
        return new ItemRepository();
    }
}

// 4. Orchestrator — the UI endpoint
@UI("/items")
public class ItemsCatalog extends AutoCrudOrchestrator<Item> {

    @Override
    public AutoCrudAdapter<Item> simpleAdapter() {
        return new ItemAdapter();
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

## Filtering in findAll vs custom search

`CrudRepository.findAll()` returns all rows, and the auto adapters apply search text filtering in memory. This is fine for small datasets. For large tables, override `search()` in the adapter to push filtering to the database:

```java
@Service
public class ProductAdapter extends AutoCrudAdapter<Product> {

    private final ProductJpaRepository jpa;

    public ProductAdapter(ProductJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public CrudRepository<Product> repository() {
        return productRepository; // used for save/delete/view
    }

    @Override
    public ListingData<Product> search(
            String searchText, Product filters,
            Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(jpa.findByNameContainingIgnoreCase(
            searchText != null ? searchText : ""));
    }
}
```

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

- [AutoListAdapter and AutoCrudAdapter](/java-user-manual/build/auto-adapters/) — pre-built adapters that consume a `CrudRepository`
- [CrudAdapter](/java-user-manual/build/crud-adapter/) — the lower-level interface for full control over each operation
- [AutoCrudOrchestrator and AutoListOrchestrator](/java-user-manual/build/auto-orchestrators/) — the orchestrators that use this repository indirectly
