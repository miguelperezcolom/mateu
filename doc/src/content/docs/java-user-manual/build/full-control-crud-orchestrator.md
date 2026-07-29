---
title: "Full control with Crud"
description: "Explicit separate models for filters, rows, view, editor, and creation form."
---

`Crud` is the most flexible CRUD base class in Mateu. It lets you define a separate type for every screen — filters, grid rows, read-only detail, edit form, and creation form — while the framework still handles all routing and navigation automatically.

Use it when `AutoCrud<T>` or `FilteredAutoCrud<Filters,T>` are not enough because different screens need genuinely different models.

---

## Class signature

`Crud` is a [`Listing`](/java-user-manual/build/capability-listings/) that declares **every** capability — search box, filter bar, navigation, editing, creation, and deletion — with an explicit type for each screen:

```java
public abstract class Crud<View, Editor, CreationForm, Filters, Row, IdType>
    implements Listing<Row>,
        Searchable,
        Filterable<Filters>,
        Navigable<View, IdType>,
        Editable<Editor, IdType>,
        Creatable<CreationForm, IdType>,
        Deletable<IdType>
```

### Type parameters

| Type | Meaning |
|---|---|
| `View` | The object rendered in the read-only detail screen |
| `Editor` | The form shown in the edit screen — any class; no interface required |
| `CreationForm` | The form shown in the create screen — any class; no interface required |
| `Filters` | The filter bar DTO |
| `Row` | The DTO shown as a grid row in the listing |
| `IdType` | The type of the entity identifier (usually `String`) |

The editor and creation form are plain view models: Mateu renders their fields and hydrates them back from the submitted state. Persistence is the orchestrator's job — `save(httpRequest)` and `create(httpRequest)` receive the submitted form state and decide how to store it.

---

## Routes generated

| Route | Screen |
|---|---|
| `/your-route` | Listing with filter bar |
| `/your-route/:id` | Read-only detail (`View`) |
| `/your-route/:id/edit` | Edit form (`Editor`) |
| `/your-route/new` | Create form (`CreationForm`) |

---

## Abstract methods to implement

The whole CRUD lifecycle lives on the orchestrator — there is no separate data-layer interface. Inject your services (query service, use cases, repository) into the orchestrator and call them from these methods:

| Method | Return type | Purpose |
|---|---|---|
| `search(request, httpRequest)` | `ListingData<Row>` | Executes the search — `request` is a [`SearchRequest`](/java-ui-definition/interfaces/listing/#the-searchrequest) carrying `searchText()`, `filters()`, `criteria()`, and `pageable()` |
| `view(id, httpRequest)` | `View` | Returns the `View` object for the read-only detail screen |
| `edit(id, httpRequest)` | `Editor` | Returns the `Editor` object for the edit screen |
| `creationForm(httpRequest)` | `CreationForm` | Returns a blank (or pre-populated) `CreationForm` |
| `save(httpRequest)` | `IdType` | Persists the edit form state and returns the record id (used to navigate back to the detail view) |
| `create(httpRequest)` | `IdType` | Persists the creation form state and returns the new record's id |
| `deleteAllById(ids, httpRequest)` | `void` | Deletes the selected rows |

`getIdFieldForRow()` has a default (the `@PrimaryKey`/`id` field of `Row`); override it only when the identifier lives in a differently-named field. `toId(String)` converts the route id into `IdType` automatically for strings, well-known scalars (`Integer`, `Long`, `UUID`, enums, …) and single-`String`-constructor types — override it for anything else.

---

## Full example

### Models

```java
public record ProductFilters(
    String name,
    ProductStatus status
) {}
```

```java
public record ProductRow(
    @PrimaryKey String id,
    String name,
    BigDecimal price,
    ProductStatus status
) implements Identifiable {}
```

```java
public record ProductView(
    String id,
    String name,
    String description,
    BigDecimal price,
    ProductStatus status
) {}
```

```java
public class ProductEditor {

    public String id;

    @NotEmpty
    public String name;

    public String description;

    @NotNull
    public BigDecimal price;

    public ProductStatus status;
}
```

```java
public class ProductCreationForm {

    @NotEmpty
    public String name;

    @NotNull
    public BigDecimal price;
}
```

Both are plain view models — no interface to implement. Persistence happens in the orchestrator's `save()`/`create()` below.

### Orchestrator

```java
@Service
@UI("/products")
public class ProductOrchestrator
    extends Crud<ProductView, ProductEditor, ProductCreationForm, ProductFilters, ProductRow, String> {

    private final ProductService service;

    public ProductOrchestrator(ProductService service) {
        this.service = service;
    }

    @Override
    public ListingData<ProductRow> search(SearchRequest request, HttpRequest httpRequest) {
        return service.search(request.searchText(), filters(request), request.pageable());
    }

    @Override
    public ProductView view(String id, HttpRequest httpRequest) {
        return service.findView(id);
    }

    @Override
    public ProductEditor edit(String id, HttpRequest httpRequest) {
        return service.findEditor(id);
    }

    @Override
    public ProductCreationForm creationForm(HttpRequest httpRequest) {
        return new ProductCreationForm();
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {
        service.deleteAll(ids);
    }

    @Override
    public String save(HttpRequest httpRequest) {
        var editor = httpRequest.getComponentState(ProductEditor.class);
        service.update(editor.id, editor.name, editor.description, editor.price, editor.status);
        return editor.id;
    }

    @Override
    public String create(HttpRequest httpRequest) {
        var form = httpRequest.getComponentState(ProductCreationForm.class);
        return service.create(form.name, form.price);
    }
}
```

---

## Capability annotations

All capability annotations available on `AutoCrud<T>` also work on `Crud`:

| Annotation | Effect |
|---|---|
| `@ReadOnly` | Hides New, Edit, and Delete — shorthand for `@NotCreatable @NotEditable @NotDeletable` |
| `@NotCreatable` | Hides the New button |
| `@NotEditable` | Hides the Edit button in the detail view |
| `@NotDeletable` | Hides the Delete button |
| `@NotNavigable` | Hides the View button column — rows are not clickable |

---

## Optional overrides

| Method | Default | Override to… |
|---|---|---|
| `readOnly()` | `false` | make the whole orchestrator read-only programmatically |
| `searchable()` | `true` | hide the search bar |
| `selectionEnabled()` | `true` | disable row selection |
| `title()` | class name | override the page title |

---

## Progression

| Class | Filter type | Row type | Write | Separate forms |
|---|---|---|---|---|
| `AutoCrud<T>` | T | T | ✓ (or `@ReadOnly`) | — |
| `FilteredAutoCrud<Filters,T>` | Filters | T | ✓ (or `@ReadOnly`) | — |
| `Crud<V,E,C,F,R,Id>` | F | R | ✓ (or `@ReadOnly`) | ✓ |

Move to `Crud` only when the view, editor, or creation forms must differ from each other or from the row model. The simpler variants cover most real-world cases. And when you don't want the *whole* pack, don't extend `Crud` at all — implement `Listing<Row>` plus just the [capability interfaces](/java-user-manual/build/capability-listings/) you need.

---

## Next

- [Listings and capabilities](/java-user-manual/build/capability-listings/) — the capability model `Crud` is built on
- [Master-detail](/java-user-manual/build/master-detail/) — embedding a child CRUD inside a parent screen
- [Relationships vs embedded CRUDs](/java-user-manual/build/relationships-vs-embedded-cruds/) — choosing between `@Lookup`, `List<Entity>`, and an embedded orchestrator
- [Golden example: Orders, Customers and Order lines](/java-user-manual/build/orders-customers-order-lines/) — a complete business UI combining all of the above
