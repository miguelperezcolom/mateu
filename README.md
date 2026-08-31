# Mateu

[![Discord](https://img.shields.io/badge/Discord-Join%20us-5865F2?logo=discord&logoColor=white)](https://discord.gg/YFb9utDMYK)

Mateu is a **model-driven UI framework** for building **business applications**: you declare what a
screen contains, and Mateu derives the UI. Java is the reference implementation; .NET and Python
speak the same wire.

---

## Why Mateu

An LLM will write you a React admin panel in a minute. So "less code" is no longer the point.

The point is what happens **on day 200**.

Generated code **derives** from your model and then **diverges** from it: the moment someone edits
it, it is theirs to maintain, and it drifts. Mateu does not generate the UI — it **derives** it, so
it cannot drift. Change the model and the screen is already correct.

That is one distinction, and it is the whole framework:

> **Source of truth vs artifact.** You maintain the declaration. Everything downstream — the UI, the
> API contract it implies, a static bundle — is derived, and nobody edits it.

### Start from whatever you already have

|  |  |
|---|---|
| A domain model? | Declare `@UI` classes — inside-out |
| A design or a mockup? | Draw it in the visual editor — outside-in |
| An existing REST API? | Point the screens at it |

All three land on the same declaration. Code-first tools cannot start from a design; design-first
low-code tools cannot start from your domain model.

### And the UI travels with the domain

Each service ships its own screens **inside its own jar** — the UI module needs one dependency and
no framework coupling — and they aggregate into one shell, or embed into an IDE, a mobile app or
another product's page. Eight teams can own, version and deploy their slice of the same back office
independently.

That is micro-frontends without the micro-frontend tax: what federates is a **declaration**, not a
JS bundle, so there is one framework version, no runtime composition and no CSS collisions.

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
- the same screens on the web, on mobile (React Native) and inside an IDE — no renderer work
- an optional [static bundle](https://mateu.io/java-user-manual/build/static-bundle/): the same app
  served from a CDN with no backend running

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

When one screen out of forty does need to be special, you drop to a custom component for that one
and keep routing, state, validation, i18n and the rest of the app.

---

## 💬 Community

Have questions, ideas or feedback?

👉 **Join our Discord**: https://discord.gg/YFb9utDMYK

---

## 📚 Documentation

- Docs: https://mateu.io
- Java manual: https://mateu.io/java-user-manual/

---

## One-sentence summary

Mateu derives real business UIs from a declaration you keep — so they cannot drift away from it.
