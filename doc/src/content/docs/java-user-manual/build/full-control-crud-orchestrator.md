---
title: "Full control with Crud"
description: "Explicit separate models for filters, rows, view, editor, and creation form."
---

`Crud` is the most flexible CRUD base class in Mateu. It lets you define a separate type for every screen — filters, grid rows, read-only detail, edit form, and creation form — while the framework still handles all routing and navigation automatically.

Use it when `AutoCrud<T>` or `FilteredAutoCrud<Filters,T>` are not enough because different screens need genuinely different models.

---

## Class signature

```java
public abstract class Crud<
    View,
    Editor extends CrudEditorForm<IdType>,
    CreationForm extends CrudCreationForm<IdType>,
    Filters,
    Row,
    IdType>
```

### Type parameters

| Type | Meaning |
|---|---|
| `View` | The object rendered in the read-only detail screen |
| `Editor` | The form shown in the edit screen — must implement `CrudEditorForm<IdType>` |
| `CreationForm` | The form shown in the create screen — must implement `CrudCreationForm<IdType>` |
| `Filters` | The filter bar DTO |
| `Row` | The DTO shown as a grid row in the listing |
| `IdType` | The type of the entity identifier (usually `String`) |

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

### On the orchestrator

| Method | Return type | Purpose |
|---|---|---|
| `adapter()` | `CrudAdapter<View,Editor,CreationForm,Filters,Row,IdType>` | The data layer that backs all operations |
| `editorClass()` | `Class<Editor>` | Class of the editor form |
| `creationFormClass()` | `Class<CreationForm>` | Class of the creation form |
| `toId(String id)` | `IdType` | Converts the URL string id to the actual `IdType` |
| `getIdFieldForRow()` | `String` | Field name in `Row` that holds the identifier |
| `search(searchText, filters, pageable, httpRequest)` | `Object` | Executes the filtered search and returns `ListingData<Row>` |
| `save(httpRequest)` | `Object` | Persists the edit form |
| `saveNew(httpRequest)` | `Object` | Persists the creation form |

### On the adapter (`CrudAdapter`)

| Method | Purpose |
|---|---|
| `search(searchText, filters, pageable, httpRequest)` | Returns `ListingData<Row>` |
| `getView(id, httpRequest)` | Returns the `View` object |
| `getEditor(id, httpRequest)` | Returns the `Editor` object |
| `getCreationForm(httpRequest)` | Returns a blank `CreationForm` |
| `deleteAllById(ids, httpRequest)` | Deletes selected rows |

---

## Required interfaces

### CrudEditorForm&lt;IdType&gt;

The editor must implement this interface:

```java
public interface CrudEditorForm<IdType> {
    void save(HttpRequest httpRequest);
    IdType id();
}
```

`save()` is called when the user submits the edit form. `id()` is used to navigate back to the detail view after saving.

### CrudCreationForm&lt;IdType&gt;

The creation form must implement this interface:

```java
public interface CrudCreationForm<IdType> {
    IdType create(HttpRequest httpRequest);
}
```

`create()` is called when the user submits the creation form. It returns the id of the newly created entity.

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
public class ProductEditor implements CrudEditorForm<String> {

    public String id;

    @NotEmpty
    public String name;

    public String description;

    @NotNull
    public BigDecimal price;

    public ProductStatus status;

    @Override
    public String id() { return id; }

    @Override
    public void save(HttpRequest httpRequest) {
        // persist changes — inject services via constructor or Spring
    }
}
```

```java
public class ProductCreationForm implements CrudCreationForm<String> {

    @NotEmpty
    public String name;

    @NotNull
    public BigDecimal price;

    @Override
    public String create(HttpRequest httpRequest) {
        // create and persist — return the new entity's id
        return UUID.randomUUID().toString();
    }
}
```

### Adapter

```java
@Service
public class ProductCrudAdapter
    implements CrudAdapter<ProductView, ProductEditor, ProductCreationForm, ProductFilters, ProductRow, String> {

    private final ProductService service;

    public ProductCrudAdapter(ProductService service) {
        this.service = service;
    }

    @Override
    public ListingData<ProductRow> search(
            String searchText, ProductFilters filters, Pageable pageable, HttpRequest httpRequest) {
        return service.search(searchText, filters, pageable);
    }

    @Override
    public ProductView getView(String id, HttpRequest httpRequest) {
        return service.findView(id);
    }

    @Override
    public ProductEditor getEditor(String id, HttpRequest httpRequest) {
        return service.findEditor(id);
    }

    @Override
    public ProductCreationForm getCreationForm(HttpRequest httpRequest) {
        return new ProductCreationForm();
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {
        service.deleteAll(ids);
    }
}
```

### Orchestrator

```java
@Service
@UI("/products")
public class ProductOrchestrator
    extends Crud<ProductView, ProductEditor, ProductCreationForm, ProductFilters, ProductRow, String> {

    private final ProductCrudAdapter adapter;

    public ProductOrchestrator(ProductCrudAdapter adapter) {
        this.adapter = adapter;
    }

    @Override
    public CrudAdapter<ProductView, ProductEditor, ProductCreationForm, ProductFilters, ProductRow, String> adapter() {
        return adapter;
    }

    @Override
    public Class<ProductEditor> editorClass() { return ProductEditor.class; }

    @Override
    public Class<ProductCreationForm> creationFormClass() { return ProductCreationForm.class; }

    @Override
    public String toId(String id) { return id; }

    @Override
    public String getIdFieldForRow() { return "id"; }

    @Override
    public Object search(String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
        return adapter.search(searchText, (ProductFilters) filters, pageable, httpRequest);
    }

    @Override
    public Object save(HttpRequest httpRequest) {
        var editor = httpRequest.getComponentState(ProductEditor.class);
        editor.save(httpRequest);
        return editor.id();
    }

    @Override
    public Object saveNew(HttpRequest httpRequest) {
        var form = httpRequest.getComponentState(ProductCreationForm.class);
        return form.create(httpRequest);
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
| `view(id, httpRequest)` | calls `adapter().getView()` | customize the view before rendering |
| `edit(id, httpRequest)` | calls `adapter().getEditor()` | customize the editor before rendering |
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

Move to `Crud` only when the view, editor, or creation forms must differ from each other or from the row model. The simpler variants cover most real-world cases.

---

## Next

- [Master-detail](/java-user-manual/build/master-detail/) — embedding a child CRUD inside a parent screen
- [Relationships vs embedded CRUDs](/java-user-manual/build/relationships-vs-embedded-cruds/) — choosing between `@Lookup`, `List<Entity>`, and an embedded orchestrator
- [Golden example: Orders, Customers and Order lines](/java-user-manual/build/orders-customers-order-lines/) — a complete business UI combining all of the above
