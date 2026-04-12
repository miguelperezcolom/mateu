---
title: "Admin panel"
weight: 2
---

# Admin panel in minutes

This example shows how to build a complete CRUD UI from a Java model.

It is a real example, not a toy snippet.

By the end, you will have:

- a product list
- create and edit forms
- validation
- visual status badges
- delete confirmation

---

## The complete code

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

import java.util.*;

enum ProductStatus { Available, OutOfStock }

record Product(
  @NotEmpty @EditableOnlyWhenCreating String id,
  @NotEmpty String name,
  @Stereotype(FieldStereotype.textarea) @HiddenInList String description,
  @NotNull @Status(defaultStatus = StatusType.NONE, mappings = {
    @StatusMapping(from = "Available", to = StatusType.SUCCESS),
    @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
  }) ProductStatus status
) implements Identifiable {}

class ProductRepository implements CrudRepository<Product> {
  private static final Map<String, Product> db = new HashMap<>();
  public Optional<Product> findById(String id) { return Optional.ofNullable(db.get(id)); }
  public String save(Product entity) { db.put(entity.id(), entity); return entity.id(); }
  public List<Product> findAll() { return db.values().stream().toList(); }
  public void deleteAllById(List<String> selectedIds) { selectedIds.forEach(db::remove); }
}

class ProductAdapter extends AutoCrudAdapter<Product> {
  public CrudRepository<Product> repository() { return new ProductRepository(); }
}

@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {
  public AutoCrudAdapter<Product> simpleAdapter() { return new ProductAdapter(); }
}
```

---

## Walkthrough

![Products list](/images/docs/admin-panel/products-list.jpeg)

![Empty new product form](/images/docs/admin-panel/new-product-form-empty.png)

![Filled product form](/images/docs/admin-panel/add-second-product-filled-form.png)

![Saved message](/images/docs/admin-panel/add-second-product-saved.png)

![Back to list after save](/images/docs/admin-panel/add-second-product-back-to-list.png)

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
