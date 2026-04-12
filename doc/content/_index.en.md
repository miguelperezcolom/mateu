---
title: "Mateu"
---

# Build business UIs in Java

## No frontend required

Mateu lets you build complete business UIs directly from your backend.

---

## The problem

- Frontends are complex
- Logic is duplicated
- Microservices are hard to integrate

---

## The solution

Define your UI in Java.

Mateu generates:

- forms
- CRUD
- validation
- navigation

---

## Use cases

### Admin panels
Build CRUD backoffices in minutes.

### Distributed backoffice
Compose UI from multiple microservices.

### Embedded UI
Use Mateu inside React, Vue or any app.

---

## Quick example

```java
@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {}
```

---

## Start here

👉 /java-user-manual/start-here/quickstart/
