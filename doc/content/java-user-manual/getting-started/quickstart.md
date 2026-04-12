---
title: "Quickstart"
weight: 1
---

# Build an admin panel in minutes

This guide shows how to create a real UI using Mateu.

No frontend. No API layer. Just Java.

---

## What you get

- product list
- forms
- validation
- CRUD
- navigation

---

## 1. Model

```java
enum ProductStatus {
  Available, OutOfStock
}

record Product(
  @NotEmpty String id,
  @NotEmpty String name,
  @NotNull ProductStatus status
) implements Identifiable {}
```

---

## 2. UI

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

## 3. Run

```bash
mvn spring-boot:run
```

Open:

http://localhost:8080/products

---

## Result

![Products list](/images/docs/admin-panel/products-list.jpeg)

👉 You just built a full admin panel.

---

## Why this is different

You defined a model.

Mateu generated everything else.

---

## Next

👉 Admin panel deep dive
