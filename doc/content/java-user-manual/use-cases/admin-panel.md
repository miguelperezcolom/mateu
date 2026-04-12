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
- a UI class

Mateu generates everything else.

---

## 🧩 Model

```java
enum ProductStatus {
    Available, OutOfStock
}

record Product(
        @NotEmpty @EditableOnlyWhenCreating String id,
        @NotEmpty String name,
        @HiddenInList String description,
        @NotNull ProductStatus status
) implements Identifiable {}
```

---

## 🗄️ Repository

```java
class ProductRepository implements CrudRepository<Product> {
  // your persistence
}
```

---

## 🔌 Adapter

```java
class ProductAdapter extends AutoCrudAdapter<Product> {

  @Override
  public CrudRepository<Product> repository() {
    return new ProductRepository();
  }

}
```

---

## 🖥️ UI

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

## ⚡ Result

### Product list

- table generated automatically  
- status rendered visually  
- actions included  

---

### Create product

- form generated from model  
- validation applied  
- enum → dropdown automatically  

---

### Edit product

- data loaded automatically  
- fields controlled by annotations  

---

### Delete product

- selection + confirmation dialog  
- list updated automatically  

---

## 🔥 Why this matters

In a traditional stack, this requires:

- backend
- API
- frontend
- state management
- forms
- validation

With Mateu:

👉 everything comes from the model

---

## 🧠 Mental model

- model → data + UI definition  
- annotations → behavior  
- adapter → data access  
- orchestrator → full CRUD  

---

## Next

👉 [Build a real CRUD with relationships →](/java-user-manual/build-a-real-crud-with-relationships)
