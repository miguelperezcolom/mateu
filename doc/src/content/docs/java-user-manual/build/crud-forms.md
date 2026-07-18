---
title: "CrudEditorForm and CrudCreationForm"
description: "The interfaces that give edit and create forms their save and create behaviour in a Crud."
---

When using `Crud` directly, the `Editor` and `CreationForm` type parameters must implement these two interfaces. They are the contract between the form object and the framework's save/create actions.

---

## CrudEditorForm&lt;IdType&gt;

The edit form interface. Mateu calls `save()` when the user submits the edit form, and uses `id()` to navigate back to the detail view after saving.

```java
public interface CrudEditorForm<IdType> {
    void save(HttpRequest httpRequest);
    IdType id();
}
```

| Method | Called when | Must do |
|---|---|---|
| `save(httpRequest)` | User clicks Save in the edit form | Persist the current field values |
| `id()` | After save, to redirect to the detail view | Return the entity's identifier |

### Example

```java
public class ProductEditor implements CrudEditorForm<String> {

    public String id;

    @NotEmpty
    public String name;

    @NotNull
    public BigDecimal price;

    public ProductStatus status;

    private final ProductService service;

    public ProductEditor(ProductService service) {
        this.service = service;
    }

    @Override
    public String id() {
        return id;
    }

    @Override
    public void save(HttpRequest httpRequest) {
        service.update(id, name, price, status);
    }
}
```

### Reading hydrated state in save()

When `save()` is called, the form fields have already been hydrated from the browser state — you can read them directly:

```java
@Override
public void save(HttpRequest httpRequest) {
    // 'name', 'price', 'status' already contain the values the user edited
    var entity = new Product(id, name, price, status);
    repository.save(entity);
}
```

---

## CrudCreationForm&lt;IdType&gt;

The creation form interface. Mateu calls `create()` when the user submits the create form. It returns the id of the newly created entity, which the framework uses to navigate to the detail view.

```java
public interface CrudCreationForm<IdType> {
    IdType create(HttpRequest httpRequest);
}
```

| Method | Called when | Must do |
|---|---|---|
| `create(httpRequest)` | User clicks Save in the create form | Persist the new entity and return its id |

### Example

```java
public class ProductCreationForm implements CrudCreationForm<String> {

    @NotEmpty
    public String name;

    @NotNull
    public BigDecimal price;

    private final ProductService service;

    public ProductCreationForm(ProductService service) {
        this.service = service;
    }

    @Override
    public String create(HttpRequest httpRequest) {
        return service.create(name, price);
    }
}
```

---

## Implementing both on the same class

A common shortcut is implementing both interfaces on a single class, using a nullable `id` field to distinguish create from edit:

```java
public class ProductForm
        implements Identifiable, CrudEditorForm<String>, CrudCreationForm<String> {

    @EditableOnlyWhenCreating
    public String id;

    @NotEmpty
    public String name;

    @NotNull
    public BigDecimal price;

    public ProductStatus status;

    @Override
    public String id() { return id; }

    @Override
    public void save(HttpRequest httpRequest) {
        service.update(id, name, price, status);
    }

    @Override
    public String create(HttpRequest httpRequest) {
        return service.create(name, price, status);
    }
}
```

The orchestrator then uses this class for both `Editor` and `CreationForm`:

```java
public class ProductOrchestrator
    extends Crud<ProductView, ProductForm, ProductForm, ProductFilters, ProductRow, String> {
    ...
    @Override public Class<ProductForm> editorClass()       { return ProductForm.class; }
    @Override public Class<ProductForm> creationFormClass() { return ProductForm.class; }
}
```

---

## Using AutoNamedView instead

When the entity itself is the form (no separate editor class), use `AutoNamedView<T>` in the adapter rather than creating a dedicated form class. `AutoNamedView` implements both `CrudEditorForm` and `CrudCreationForm` automatically via its `save()` and `create()` methods, which delegate to the `CrudStore`.

This is what `AutoCrud` does internally — it wraps the entity in `AutoNamedView` so you never have to write the form interfaces yourself.

This is handled automatically by `AutoCrud` and `FilteredAutoCrud` — you only need these interfaces when using `Crud` directly with separate types for view, editor, and creation form.

---

## Next

- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — how these interfaces fit into the six-type-parameter orchestrator
- [CrudAdapter](/java-user-manual/build/crud-adapter/) — where `getEditor()` and `getCreationForm()` return instances of these interfaces
