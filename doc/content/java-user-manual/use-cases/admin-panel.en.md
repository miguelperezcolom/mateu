---
title: "Admin panel"
weight: 1
aliases:
  - /java-user-manual/admin-panel/
---

# Admin panel

Build a full CRUD UI from a Java model.

This case is meant to do two things at once:

- show the result
- show exactly what code produces it

---

## What this case teaches

- model → form + list
- validation → UI
- repository + adapter + orchestrator → CRUD

---

## Quick read

This example has four pieces:

- a `Product` model
- a `ProductRepository`
- a `ProductAdapter`
- a `Products` UI class

Together they generate a complete CRUD UI.

---

## Full code

```java
package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

enum ProductStatus {
    Available, OutOfStock
}

record Product(
        @NotEmpty @EditableOnlyWhenCreating String id,
        @NotEmpty String name,
        @Stereotype(FieldStereotype.textarea)
        @HiddenInList String description,
        @NotNull
        @Status(
                defaultStatus = StatusType.NONE,
                mappings = {
                        @StatusMapping(from = "Available", to = StatusType.SUCCESS),
                        @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
                }
        )
        ProductStatus status) implements Identifiable {

    @Override
    public String toString() {
        return name != null ? "Product " + name : "New product";
    }
}

class ProductRepository implements CrudRepository<Product> {

    private static final Map<String, Product> db = new HashMap<>();

    @Override
    public Optional<Product> findById(String id) {
        return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Product entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Product> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}

class ProductAdapter extends AutoCrudAdapter<Product> {

    @Override
    public CrudRepository<Product> repository() {
        return new ProductRepository();
    }
}

@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {

    @Override
    public AutoCrudAdapter<Product> simpleAdapter() {
        return new ProductAdapter();
    }
}
```

---

## What Mateu generates by default

With `AutoCrudOrchestrator`, Mateu generates more than a listing.

The default CRUD flow is:

- `/products` → list
- `/products/:id` → readonly detail view
- `/products/:id/edit` → edit view
- `/products/new` → create view

The default action in the listing is usually **View**, not **Edit**.

That means the normal navigation is:

1. open the list
2. open the readonly detail view
3. continue to edit if needed

👉 See [CRUD navigation flow](/java-user-manual/build/crud-navigation-flow/)

---

## Walkthrough

### Product list

![Products list](/images/docs/admin-panel/products-list.jpeg)

The list is generated automatically from the model and repository.

### New product form

![Empty new product form](/images/docs/admin-panel/new-product-form-empty.png)

### Filled form

![Filled product form](/images/docs/admin-panel/add-second-product-filled-form.png)

### Save feedback

![Saved message](/images/docs/admin-panel/add-second-product-saved.png)

### Back to list

![Back to list after save](/images/docs/admin-panel/add-second-product-back-to-list.png)

### Delete flow

![Select product in list](/images/docs/admin-panel/select-second-product-on-list.png)

![Delete confirmation](/images/docs/admin-panel/confirm-deletion.png)

![Product deleted](/images/docs/admin-panel/second-product-has-been-deleted.png)

---

## Going further: column actions

The Products example also shows how to add **per-row actions** in the listing.

Add a `ColumnActionGroup` field to the model and initialize it in the compact constructor:

```java
record Product(
        @NotEmpty @EditableOnlyWhenCreating String id,
        @NotEmpty String name,
        @Stereotype(FieldStereotype.textarea)
        @HiddenInList String description,
        boolean certified,
        @NotNull
        @Status(
                defaultStatus = StatusType.NONE,
                mappings = {
                        @StatusMapping(from = "Available", to = StatusType.SUCCESS),
                        @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
                }
        )
        ProductStatus status,
        ColumnActionGroup action,
        @Colspan(2)
        List<ProductComponent> components
) implements Identifiable, LookupOptionsSupplier {

    Product {
        action = new ColumnActionGroup(new ColumnAction[]{
                new ColumnAction("setAsBlue", "Set as blue"),
                new ColumnAction("setAsGreen", "Set as green")
        });
    }
}
```

Then add handler methods with matching names in the orchestrator:

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {

    @Override
    public AutoCrudAdapter<Product> simpleAdapter() {
        return new ProductAdapter();
    }

    void setAsBlue(Product row) {
        // called when "Set as blue" is clicked for a row
    }

    void setAsGreen(Product row) {
        // called when "Set as green" is clicked for a row
    }

    @ListToolbarButton
    void doSomethingOnRows(List<Product> selection) {
        // called when the toolbar button is clicked with selected rows
    }
}
```

- `ColumnAction("actionId", "Label")` — single action button per row
- `ColumnActionGroup` — group of action buttons per row
- The method name in the orchestrator must match the `actionId`
- `@ListToolbarButton` adds a button to the list toolbar that receives all selected rows

---

## Going further: nested collections in the form

The `List<ProductComponent>` field in the Product model renders as an **inline editable table** inside the detail form.

```java
public record ProductComponent(
        String code,
        int quantity,
        @Lookup(bubble = true)
        String relatedComponentCode,
        boolean special,
        @Hidden("!state['special']")
        String comment
) {}
```

Key points:

- `@Lookup(bubble = true)` shows a lookup widget without opening a separate page
- `@Hidden("!state['special']")` hides `comment` unless `special` is checked — the expression is evaluated in the browser as the user changes values
- `@Colspan(2)` on the `components` field in `Product` makes the table span the full width

The nested table works the same as any collection field: Mateu adds add/remove buttons and renders each child's fields as columns.

---

## Mental model

- model → data + UI definition
- annotations → behavior and rendering hints
- repository → persistence
- adapter → connection point
- orchestrator → full CRUD flow
- `ColumnAction` / `ColumnActionGroup` → per-row actions; handler methods go in the orchestrator
- `@ListToolbarButton` → batch action on selected rows
- `List<ChildRecord>` → inline editable nested table

---

## Next

- [Users CRUD with lookups](/java-user-manual/use-cases/users-crud/)
- [Custom listing](/java-user-manual/use-cases/custom-listing/)
- [Nested CRUD](/java-user-manual/use-cases/nested-crud/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Validation](/java-user-manual/concepts/validation/)
- [CRUD navigation flow](/java-user-manual/build/crud-navigation-flow/)
