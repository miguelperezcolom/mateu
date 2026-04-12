---
title: "Quickstart"
weight: 1
---

# Quickstart

Build a complete admin panel in minutes.

No frontend required.

---

## What you'll build

A fully functional product admin panel with:

- product list
- create / edit forms
- validation
- status badges
- delete confirmation

---

## 1. Add Mateu to your project

Add dependencies:

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>mvc-core</artifactId>
  <version>0.0.1-MATEU</version>
</dependency>

<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>annotation-processor-mvc</artifactId>
  <version>0.0.1-MATEU</version>
</dependency>
```

---

## 2. Define your model

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

## 3. Create the UI

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

## 4. Run

```bash
mvn spring-boot:run
```

Open:

http://localhost:8080/products

---

## 🎉 Result

You now have:

- a working admin panel
- forms
- validation
- CRUD
- navigation

---

## 🧠 What just happened?

You defined a model.

Mateu generated:

- UI
- layout
- forms
- validation
- interactions

👉 One model → full UI

---

## Next

👉 [See full example → Admin panel](/java-user-manual/use-cases/admin-panel)
