---
title: "Spring Data JPA store"
description: "Back an AutoCrud with a Spring Data JPA repository — no hand-written CrudStore, with search, filters, ranges, sorting, paging and totals run in the database."
---

Every `AutoCrud` needs a [`CrudStore`](/java-ui-definition/interfaces/crud-store/). When the entity
is a JPA entity behind a Spring Data repository, you don't have to write one: the optional
**`mateu-spring-data`** module turns the repository into a store whose listing search runs in the
database.

:::caution[Experimental]
`JpaCrudStore` and `CrudStores` are marked `@Experimental`: they may change in a minor release (see
[Stability & versioning](/reference/stability-and-versioning/#experimental-api)).
:::

## Add the module

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mateu-spring-data</artifactId>
  <!-- version from io.mateu:mateu-bom -->
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

The module brings no JPA stack of its own — your application already has one. Keep
`spring-boot-starter-validation` (or any Jakarta EL implementation) on the classpath: Mateu ships
Hibernate Validator, and Hibernate refuses to start a persistence unit when the validator has no EL
to interpolate its messages with.

## Use it

The repository extends **both** `JpaRepository` and `JpaSpecificationExecutor` — the second one is
what lets the store build the search as a query:

```java
@Entity
public class Product implements Identifiable {

    @Id @GeneratedValue Long id;
    String name;
    String description;
    @Enumerated(EnumType.STRING) Category category;
    double price;
    LocalDate released;

    @Version @Hidden Long version;

    @Override
    public String id() { return id == null ? null : id.toString(); }
}

public interface ProductRepository
        extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {}
```

```java
@UI("/products")
public class Products extends AutoCrud<Product> {

    @Autowired ProductRepository repository;

    @Override
    public CrudStore<Product> store() {
        return CrudStores.of(repository);
    }
}
```

`CrudStores.of` reads the entity and id types from the repository's `JpaRepository<Product, Long>`
declaration and converts Mateu's `String` ids to the entity's id type (`Long`, `Integer`, `UUID`,
`String`…). If the types can't be resolved (an unusual proxy), build the store directly:
`new JpaCrudStore<>(repository, repository, Product.class, Long.class)`.

Two optional refinements:

```java
CrudStores.of(repository)
    .searchingIn("name", "customer.name");   // where the free-text search looks

CrudStores.of(repository, entityManager);    // listing totals run in the database too
```

## What runs in the database

The listing search — `find(searchText, filters, criteria, pageable)` — is **one JPA
`Specification` and one Spring Data page request**: a count query plus a page query, whatever the
size of the table.

| Input | Translated to |
|---|---|
| **Search text** | Split on whitespace; **every word** must appear (case-insensitive `LIKE`) in **at least one** searchable attribute — every `String` attribute of the entity, or the ones given to `searchingIn(...)` (paths such as `customer.name` join the association). `%` and `_` in the text are literal. |
| **Filters** (the example object) | A field counts as set only when it differs from a freshly built instance of the filters class — exactly [the default store's rule](/java-ui-definition/interfaces/crud-store/#default-in-memory-behaviour). Strings: case-insensitive containment; everything else: equality. Fields the entity has no attribute for are ignored. |
| **Criteria** (`FilterCriterion`) | `between` → `BETWEEN` (an open bound becomes `>=` / `<=`), `gte` → `>=`, `lte` → `<=`, `in` → `IN`. The field may be a path (`customer.name`); values are converted to the attribute's type (a `Double` from the wire against a `Long` column, an enum name against an enum). |
| **Sort** | Spring Data `Sort` by attribute path. A sort key with no attribute behind it (a computed column) is skipped instead of failing the query, and the id is appended as the last key so pages are stable. |
| **Paging** | `PageRequest`; the returned `Page` carries the total of the whole result. |

### Listing totals (`@Aggregate` / `@GroupBy`)

With an `EntityManager` (`CrudStores.of(repository, entityManager)`), `summaries(...)` runs as
aggregate queries — `SUM`/`AVG`/`MIN`/`MAX`/`COUNT` over the same search, filters and criteria, plus
a `GROUP BY` query for the groups. Without one, the totals are computed in memory **over the rows
the pushed-down search returns** (so they still agree with the listing, but the whole filtered
result is loaded). Either way the output matches the default store's: counts as `long`, the rest as
`double`, groups ordered by their value case-insensitively.

## Optimistic locking

A JPA `@Version` field joins Mateu's [optimistic locking](/ux-patterns/optimistic-locking/)
flow with no Mateu annotation:

- a save carrying an older version than the stored row is rejected **before** it reaches the
  database and the user gets the usual conflict dialog (reload / overwrite);
- *Overwrite* adopts the stored version and saves — the user's version wins explicitly;
- Mateu never increments a JPA version itself (Hibernate does), and a race the pre-check could not
  see — Spring's `OptimisticLockingFailureException` — is reported with the same dialog.

Keep the version in the form state — annotate it `@Hidden` rather than leaving it out — or the save
has nothing to compare (and a `Long` version arriving `null` makes Spring Data treat an existing
row as new).

## Limitations

- **The search text does not use `SearchableText` / `toString()`.** Those are Java methods the
  database can't run; the pushed-down search looks in attributes instead. Use `searchingIn(...)` to
  pick them.
- **Lazy associations.** Mateu maps the entities it gets reflectively, outside any transaction. A
  lazy association the form or listing shows must be fetched (an entity graph on the repository, a
  DTO projection) or it fails with a `LazyInitializationException`.
- **Example filters can't filter *by* a default value** (same rule as the default store) — use a
  criterion or override `find`.
- **No reactive variant.** There is no R2DBC store; Spring Data R2DBC has no `Specification`
  equivalent to build on. A WebFlux app can still use `JpaCrudStore` (the calls are blocking), or
  implement `CrudStore` over its reactive repository.
- Anything more specific — tenant scoping, soft deletes, full-text indexes — is an ordinary
  override: extend `JpaCrudStore` and override `find`, or override `fetchRows(...)` on the `AutoCrud`
  when you need the `HttpRequest`.

## Next

- [`CrudStore`](/java-ui-definition/interfaces/crud-store/) — the port this implements
- [`AutoCrud<T>`](/java-user-manual/build/auto-orchestrators/) — the orchestrator that consumes it
