---
title: "Full control with CrudOrchestrator"
---

Mateu provides different levels of CRUD abstraction.

Most applications start with:

- `AutoCrudOrchestrator<T>`

But when you need full control over:

- filters
- listing rows
- view forms
- edit forms
- creation forms

you should use:

```java
CrudOrchestrator<
    View,
    Editor extends CrudEditorForm<IdType>,
    CreationForm extends CrudCreationForm<IdType>,
    Filters,
    Row,
    IdType
>
```

---

## When to use CrudOrchestrator

Use it when:

- filters need a custom model
- listing rows differ from the domain model
- creation form differs from edit form
- view form differs from edit form
- you need full control over layout and behavior

---

## Type parameters explained

| Type | Meaning |
|------|--------|
| `View` | Readonly detail representation |
| `Editor` | Edit form |
| `CreationForm` | Creation form |
| `Filters` | Filters / search state |
| `Row` | Row representation in list |
| `IdType` | Identifier type |

---

## Example

```java
@UI("/products")
public class Products extends CrudOrchestrator<
        ProductView,
        ProductEditor,
        ProductCreationForm,
        ProductFilters,
        ProductRow,
        String> {

    final ProductService service;

    public Products(ProductService service) {
        this.service = service;
    }

    @Override
    public List<ProductRow> list(ProductFilters filters) {
        return service.search(filters);
    }

    @Override
    public ProductView view(String id) {
        return service.findView(id);
    }

    @Override
    public ProductEditor edit(String id) {
        return service.findEditor(id);
    }

    @Override
    public ProductCreationForm create() {
        return new ProductCreationForm();
    }

    @Override
    public String save(ProductEditor editor) {
        return service.save(editor);
    }

    @Override
    public String create(ProductCreationForm form) {
        return service.create(form);
    }
}
```

---

## Example models

### Row (listing)

```java
public record ProductRow(
    String id,
    String name,
    BigDecimal price
) {}
```

---

### Filters

```java
public record ProductFilters(
    String searchText,
    ProductStatus status
) {}
```

---

### View

```java
public record ProductView(
    String id,
    String name,
    BigDecimal price,
    ProductStatus status
) {}
```

---

### Editor

```java
public class ProductEditor extends CrudEditorForm<String> {

    public String id;
    public String name;
    public BigDecimal price;
}
```

---

### Creation form

```java
public class ProductCreationForm extends CrudCreationForm<String> {

    public String name;
    public BigDecimal price;
}
```

---

## Why this exists

`AutoCrudOrchestrator` works best when:

- domain model ≈ UI model

But in real systems:

- view != edit model
- list != domain model
- filters are complex
- creation differs from editing

`CrudOrchestrator` gives full control over these concerns.

---

## Relationship with AutoCrudOrchestrator

| Approach | Use case |
|---------|--------|
| `AutoCrudOrchestrator<T>` | Fast CRUD from domain model |
| `FilteredAutoCrudOrchestrator<F,R>` | Custom filter model, same entity for forms |
| `CrudOrchestrator<...>` | Full control |

---

## Recommended progression

1. Start with `AutoCrudOrchestrator`
2. Customize using annotations
3. Add a custom filter model with `FilteredAutoCrudOrchestrator`
4. Move to `CrudOrchestrator` only when view/editor/creation forms must differ

---

## Summary

`CrudOrchestrator` is the most flexible way to build CRUD UIs in Mateu.

It lets you:

- decouple UI from domain model
- model each UI layer explicitly
- implement complex business flows

Use it when the automatic approach is not enough.

---

## Next

- [Master-detail](/java-user-manual/build/master-detail/) — embedding a child CRUD inside a parent screen using `Callable<?>`
- [Relationships vs embedded CRUDs](/java-user-manual/build/relationships-vs-embedded-cruds/) — choosing between `@Lookup`, `List<Entity>`, and an embedded orchestrator
- [Golden example: Orders, Customers and Order lines](/java-user-manual/build/orders-customers-order-lines/) — a complete business UI that combines orchestrators, lookups, and master-detail
