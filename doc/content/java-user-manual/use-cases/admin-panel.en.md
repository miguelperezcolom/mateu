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

## Mental model

- model → data + UI definition
- annotations → behavior and rendering hints
- repository → persistence
- adapter → connection point
- orchestrator → full CRUD flow

---

## Next

- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Validation](/java-user-manual/concepts/validation/)
- [CRUD navigation flow](/java-user-manual/build/crud-navigation-flow/)
