---
title: "Customizing CRUD and listings"
weight: 9
---

# Customizing CRUD and listings

Mateu generates a full CRUD UI from your model.

Most real applications need to **refine that default UI**:
- hide fields
- adjust layouts
- customize lists
- add actions

This section shows how to do that **progressively**, without breaking the model-driven approach.

---

## Golden rule

> Customize the model first. Customize the orchestrator only when the model is not enough.

---

# 1. Start with default CRUD

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {

    final ProductAdapter adapter;

    public Products(ProductAdapter adapter) {
        this.adapter = adapter;
    }

    @Override
    public AutoCrudAdapter<Product> simpleAdapter() {
        return adapter;
    }
}
```

```java
public record Product(
        String id,
        String name,
        BigDecimal price,
        ProductStatus status
) implements Identifiable {}
```

This already gives you:

- list
- view
- edit
- create

---

# 2. Control visibility

Hide fields depending on context.

```java
public record Product(

        @HiddenInList
        String id,

        String name,

        BigDecimal price,

        @HiddenInEditor
        ProductStatus status

) implements Identifiable {}
```

### Common annotations

- `@HiddenInList`
- `@HiddenInView`
- `@HiddenInEditor`
- `@ReadOnly`

---

# 3. Control editing

```java
@EditableOnlyWhenCreating
String id;
```

```java
@NotNull
BigDecimal price;
```

Mateu uses standard validation annotations:
- `@NotNull`
- `@NotEmpty`
- `@Email`
- etc.

---

# 4. Improve list rendering

## Status as badge

```java
@Status
ProductStatus status;
```

This renders the field as a visual badge instead of plain text.

---

## Labels and display

```java
@Override
public String toString() {
    return name;
}
```

Used in:
- lists
- lookups
- references

---

# 5. Customize forms

## Layout

```java
@FormLayout(columns = 2)
public record Product(
    String name,
    BigDecimal price,
    ProductStatus status
) {}
```

---

## Grouping fields

```java
@FormSection("General")
String name;

@FormSection("Pricing")
BigDecimal price;
```

---

## Styling

```java
@Style("max-width:600px;margin:auto;")
public class Products {}
```

---

# 6. Add actions

## Page-level action

```java
@Button
public Object publish() {
    return new Message("Published");
}
```

---

## Mutating state

```java
@Button
public Object discount() {
    price = price.multiply(BigDecimal.valueOf(0.9));
    return List.of(new Message("Discount applied"), new State(this));
}
```

---

# 7. Customize list behavior

At this level, customization moves to the adapter.

```java
public class ProductAdapter extends AutoCrudAdapter<Product> {

    final ProductRepository repository;

    public ProductAdapter(ProductRepository repository) {
        this.repository = repository;
    }

    @Override
    public CrudRepository<Product> repository() {
        return repository;
    }
}
```

Typical customizations:
- filtering
- sorting
- search behavior
- pagination

---

# 8. When the model is not enough

Use:

- `Callable<?>` → dynamic UI
- `@Route` → custom pages
- embedded orchestrators → master-detail

Example:

```java
Callable<?> stats = () -> new HorizontalLayout(
    new KPI("Revenue", "10k"),
    new KPI("Orders", "120")
);
```

---

# 9. Anti-patterns

## ❌ Overusing custom pages

Don't create pages too early.

Start with:
- model
- CRUD

Then extend only when needed.

---

## ❌ Putting logic in the frontend

Mateu is backend-driven.

Keep:
- logic
- validation
- state

in Java.

---

# 10. Summary

Customization in Mateu follows this progression:

1. Model (annotations)
2. Validation
3. Layout
4. Actions
5. Adapter
6. Custom UI (Callable / Route)

Stay in the model as long as possible.

Move to more advanced techniques only when needed.
