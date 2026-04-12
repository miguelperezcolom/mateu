---
title: "Admin panel"
weight: 2
---

# Admin panel in minutes

This example shows how to build a complete CRUD UI from a Java model.

It is a real example, not a toy snippet.

---

## What this case teaches

- how a model becomes a form and a list
- how validation propagates to the UI
- how Mateu handles standard CRUD flow
- how little code is needed for a useful backoffice screen

---

## Quick read

The example has four pieces:

- a `Product` model
- a `ProductRepository`
- a `ProductAdapter`
- a `Products` UI class

Together, they generate a complete CRUD UI.

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

- 👉 [State, actions and fields](/java-user-manual/state-actions-and-fields)
- 👉 [Validation](/java-user-manual/validation)
