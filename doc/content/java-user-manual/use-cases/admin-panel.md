---
title: "Admin panel"
weight: 2
---

# Admin panel in minutes

This example shows how to build a complete CRUD UI from a Java model.

---

## 💡 The idea

Define:

- a model
- a repository
- an adapter
- a UI class

Mateu generates everything else.

This example uses Spring Boot MVC plus Mateu's declarative CRUD support.

---

## Full example

### Product model

```java
package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

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
```

### Repository

```java
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
```

### Adapter

```java
class ProductAdapter extends AutoCrudAdapter<Product> {

    @Override
    public CrudRepository<Product> repository() {
        return new ProductRepository();
    }
}
```

### UI

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {

    @Override
    public AutoCrudAdapter<Product> simpleAdapter() {
        return new ProductAdapter();
    }
}
```

---

## What this generates

With those classes, Mateu gives you:

- a list page
- create and edit forms
- validation from Bean Validation annotations
- visual status rendering
- delete confirmation
- standard CRUD actions

---

## Walkthrough

### 1. Product list

![Products list](/images/docs/admin-panel/products-list.jpeg)

The list is generated automatically from your model and repository.

Notice how:

- `status` is rendered visually
- `description` is hidden from the list
- standard actions are already available

---

### 2. New product form

![Empty new product form](/images/docs/admin-panel/new-product-form-empty.png)

Mateu generates the form from the `Product` record.

Here you can already see several conventions at work:

- `id` is editable when creating
- `name` is required
- `description` uses a textarea because of `@Stereotype(FieldStereotype.textarea)`
- `status` becomes a selector from the enum

---

### 3. Filled form

![Filled product form](/images/docs/admin-panel/add-second-product-filled-form.png)

The developer did not build this form manually.

The model drives:

- which fields appear
- their order
- their validation
- their rendering type

---

### 4. Save feedback

![Saved message](/images/docs/admin-panel/add-second-product-saved.png)

After saving, the UI shows feedback automatically.

---

### 5. Back to the list

![Back to list after save](/images/docs/admin-panel/add-second-product-back-to-list.png)

The new product is now available in the list.

---

### 6. Select a row to delete

![Select product in list](/images/docs/admin-panel/select-second-product-on-list.png)

Selection and batch actions are already integrated into the CRUD flow.

---

### 7. Confirm deletion

![Delete confirmation](/images/docs/admin-panel/confirm-deletion.png)

Delete confirmation is part of the generated experience, so you do not need to handcraft this common interaction.

---

### 8. Product deleted

![Product deleted](/images/docs/admin-panel/second-product-has-been-deleted.png)

The list updates after deletion.

You end up with a complete CRUD cycle:

- list
- create
- edit
- delete

---

## Why this matters

In a traditional stack, this usually means building and maintaining:

- backend
- API
- frontend views
- state management
- forms
- validation
- repeated wiring between layers

With Mateu:

👉 everything comes from the model plus a thin adapter layer

---

## Mental model

- model → data + UI definition
- annotations → behavior and rendering hints
- repository → persistence
- adapter → connection point
- orchestrator → full CRUD flow

---

## When to use this pattern

This pattern is a strong fit for:

- admin panels
- internal tools
- backoffice UIs
- systems where speed and maintainability matter more than pixel-perfect custom frontend work

---

## Next

👉 [Build a real CRUD with relationships →](/java-user-manual/build-a-real-crud-with-relationships)
