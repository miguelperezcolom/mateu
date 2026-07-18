---
title: "Customizing CRUD and listings"
---

Mateu generates a full CRUD UI from your model.

Most real applications need to **refine that default UI**:
- hide fields
- adjust layouts
- customize lists
- add actions
- restrict what users can do

This section shows how to do that **progressively**, without breaking the model-driven approach.

---

## Golden rule

> Customize the model first. Customize the orchestrator only when the model is not enough.

---

# 1. Start with default CRUD

```java
@UI("/products")
public class Products extends AutoCrud<Product> {

    final ProductStore repository;

    public Products(ProductStore repository) {
        this.repository = repository;
    }

    @Override
    public CrudStore<Product> store() {
        return repository;
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

### Records vs classes for `Identifiable`

`Identifiable` requires a single method `String id()`. Java records satisfy this automatically — the compiler generates `id()` from the record component. Regular classes with Lombok's `@Data` do **not**: Lombok generates `getId()`, not `id()`. If you use a class, add the override explicitly:

```java
// ✅ record — id() generated automatically
public record Product(String id, String name) implements Identifiable {}

// ✅ class — must add id() manually
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product implements Identifiable {
    String id;
    String name;

    @Override
    public String id() { return id; }
}
```

Prefer records for row/entity types when they are immutable. Use classes when you need Lombok's `@Builder` combined with `@NoArgsConstructor` (e.g. for JPA or in-memory stores that mutate the entity after construction).

---

This already gives you:

- list
- view
- edit
- create

---

# 2. Restrict capabilities

Add class-level annotations to `AutoCrud` (or any `Crud` subclass) to remove capabilities:

| Annotation | Effect |
|---|---|
| `@ReadOnly` | Shorthand for `@NotCreatable @NotEditable @NotDeletable` — removes all write operations |
| `@NotCreatable` | Hides the New button |
| `@NotEditable` | Hides the Edit button in the detail view |
| `@NotDeletable` | Hides the Delete button |
| `@NotNavigable` | Hides the View button column — list rows are not clickable |

Common combinations:

| Intent | Annotations |
|---|---|
| Read-only catalogue with detail view | `@ReadOnly` |
| Simple read-only list (no detail) | `@ReadOnly @NotNavigable` |
| List you can add to but not click into | `@NotNavigable` |
| List you can edit but not create | `@NotCreatable` |

```java
@UI("/products")
@ReadOnly
public class ProductCatalogue extends AutoCrud<Product> { ... }
```

---

# 3. Control field visibility

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
- `@ReadOnly` — on a field: makes that field read-only in forms

---

# 4. Control editing

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

# 5. Improve list rendering

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

## Button labels

Every built-in CRUD button label can be replaced by overriding the matching method on your `AutoCrud` (or any `Crud`) subclass:

| Method | Default label |
|---|---|
| `newLabel()` | `New` |
| `saveLabel()` | `Save` |
| `cancelLabel()` | `Cancel` |
| `deleteLabel()` | `Delete` |
| `editLabel()` | `Edit` |
| `addAnotherLabel()` | `Add another` |
| `backToListLabel()` | `Back to list` |
| `importLabel()` | `Import` |
| `historyLabel()` | `History` |

```java
@UI("/products")
public class Products extends AutoCrud<Product> {

    @Override
    public String newLabel() { return "Add product"; }

    @Override
    public String deleteLabel() { return "Remove"; }

    // store() as usual …
}
```

This is the simplest way to localise or rephrase the CRUD chrome without touching the generated screens.

---

# 6. Customize forms

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
@Section("General")
String name;

@Section("Pricing")
BigDecimal price;
```

Consecutive fields sharing the same `@Section` name are grouped into one titled card.

---

## Styling

```java
@Style("max-width:600px;margin:auto;")
public class Products {}
```

---

# 7. Add actions

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

# 8. Customize list behavior

Override `fetchRows()` directly on your `AutoCrud` subclass to control how the listing is populated — push filtering to the database, sort server-side, or apply pagination:

```java
@UI("/products")
public class Products extends AutoCrud<Product> {

    final ProductStore repository;
    final ProductJpaRepository jpa;

    public Products(ProductStore repository, ProductJpaRepository jpa) {
        this.repository = repository;
        this.jpa = jpa;
    }

    @Override
    public CrudStore<Product> store() {
        return repository;
    }

    @Override
    public ListingData<Product> fetchRows(
            String searchText, Product filters,
            Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(jpa.findByNameContainingIgnoreCase(
            searchText != null ? searchText : ""));
    }
}
```

Typical customizations:
- filtering
- sorting
- search behavior
- pagination

---

# 9. When the model is not enough

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

# 10. Anti-patterns

## Overusing custom pages

Do not create custom pages too early. Start with the model and the CRUD. Add custom pages only when the model-driven approach cannot express what you need.

---

## Putting logic in the frontend

Mateu is backend-driven. Keep logic, validation, and state in Java. The UI is a projection of the server-side model, not an independent stateful application.

---

# 11. Summary

Customization in Mateu follows this progression:

1. Model (annotations)
2. Capability restrictions (`@ReadOnly`, `@NotNavigable`, `@NotCreatable`, `@NotEditable`, `@NotDeletable`)
3. Validation
4. Layout
5. Actions
6. Adapter
7. Custom UI (Callable / Route)

Stay in the model as long as possible.

Move to more advanced techniques only when needed.

---

## Next

- [Listing layout](/java-user-manual/build/listing-layout/) — understand how Mateu picks between table, list, cards, and master-detail, and how to override it
- [Listing row actions](/java-user-manual/build/listing-row-actions/) — add per-row contextual actions with `ColumnAction` and `ColumnActionGroup`
- [Filtered orchestrators](/java-user-manual/build/filtered-orchestrators/) — add a dedicated filter model without leaving the auto variants
- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — explicit separate models for filters, rows, views, and forms
- [Golden example: Orders, Customers and Order lines](/java-user-manual/build/orders-customers-order-lines/) — see all of these techniques applied in a realistic business UI
