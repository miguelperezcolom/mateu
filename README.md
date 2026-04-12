# Mateu

[![Discord](https://img.shields.io/badge/Discord-Join%20us-5865F2?logo=discord&logoColor=white)](https://discord.gg/2E34heWF)

Mateu is a **model-driven UI framework for Java** that lets you build **business web applications** at very high speed.

Define your UI once in Java.  
Mateu generates forms, navigation, CRUD screens and application structure automatically.

---

## Why Mateu

Traditional business applications usually require:

- backend logic
- frontend app
- API layer
- duplicated models
- duplicated validation
- a lot of glue code

Mateu takes a different approach:

- one application model
- one source of truth
- less code
- fewer moving parts

---

## Example (real admin panel)

With Mateu, this:

```java
enum ProductStatus {
    Available, OutOfStock
}

record Product(
    @NotEmpty String id,
    @NotEmpty String name,
    @NotNull ProductStatus status
) implements Identifiable {}

@UI("/products")
public class Products extends AutoCrudOrchestrator<Product> {
}
```

becomes:

![Admin panel](https://mateu.io/images/docs/admin-panel/products-list.jpeg)

👉 See full example: https://mateu.io/java-user-manual/use-cases/admin-panel/

---

## What you get

- forms and inputs from fields
- validation from annotations
- menus from your object model
- full CRUD with minimal code
- responsive UI out of the box

---

## When to use Mateu

Mateu is a great fit for:

- admin panels
- internal tools
- enterprise backoffices
- CRUD-heavy applications

Mateu is **not designed for**:

- marketing websites
- highly custom visual experiences
- frontend-heavy products

---

## 💬 Community

Have questions, ideas or feedback?

👉 **Join our Discord**: https://discord.gg/2E34heWF

---

## 📚 Documentation

- Docs: https://mateu.io
- Java manual: https://mateu.io/java-user-manual/

---

## One-sentence summary

Mateu turns backend Java models into real business UIs with almost no frontend code.
