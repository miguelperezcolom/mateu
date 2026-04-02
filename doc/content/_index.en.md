---
header_alt: true
title: Spec-driven development. Build full web apps with minimal code.
---
<meta name="description" content="Mateu lets you build complete web apps with minimal code. Define your UI in Java and let Mateu render and wire everything automatically.">
<meta property="og:title" content="Mateu – Spec-driven development">
<meta property="og:description" content="Define your UI in Java. Mateu renders it and connects it to your backend automatically.">
<meta property="og:image" content="https://mateu.io/og-image.png">

# Spec-driven development

Define your UI as code — not build it by hand.

## Build full web apps with minimal code

Define your UI once. Mateu builds it and wires everything together.

**No HTML. No CSS. No JavaScript.**

No duplicated models. No manual API glue. No fragmented architecture.

---

<div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">View GitHub</a>
  <a href="https://mateu.io/java-create-your-project/springboot-mvc/">Read the docs</a>
</div>

---

## The problem

Modern apps are split across too many layers:

- backend
- frontend
- APIs
- duplicated models
- state synchronization

You end up building the same app twice — and spending your time maintaining the gaps between them.

---

## What Mateu changes

With Mateu, you define your UI in plain Java using classes and annotations.

No templates. No markup. No frontend code.

- classes
- fields (state)
- annotations
- actions (methods)

Mateu renders the UI automatically and connects it to your backend.

---

## What you actually get

- forms
- tables
- layouts
- actions
- navigation

All generated from your backend code.

---

## Less code. Fewer moving parts.

Instead of splitting your app across layers:

- one source of truth
- no duplication
- no glue code
- no sync issues

**Build the same apps with a fraction of the complexity.**

---

## Write this

```java
@UI("")
public class Home {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

## Get this

<p align="center"><img src="../../../images/counter.png" width="700"/></p>

---

## Use cases

Mateu works especially well for:

### Internal tools
Admin panels, dashboards, and back-office apps.

### CRUD applications
Data-heavy systems with forms, tables, and actions.

### Enterprise apps
Complex business applications with many screens and workflows.

### Microservice UIs
Distributed systems where multiple services contribute to the UI.

### Embedded UIs
Integrate Mateu UIs into existing applications as web components.

👉 [Explore use cases →](/use-cases)

---

## Why Mateu

- ⚡ Build apps faster
- 🧠 One language, one mental model
- 🔥 No frontend duplication
- 🌐 Designed for stateless, distributed systems
- 🔌 Deliver UIs as embeddable web components
- 🎨 Keep frontend and backend decoupled

---

## Not backend-driven. Not frontend-driven.

**Defined once. Rendered automatically.**

---

## Mateu vs traditional stack

| Traditional stack              | Mateu                      |
|------------------------------|----------------------------|
| Backend + frontend           | Backend + generated UI     |
| API layer                    | No manual API needed       |
| Duplicated models            | Single source of truth     |
| State sync issues            | No sync problems           |
| More moving parts            | Minimal architecture       |

---

## Status

🚧 **Mateu v3 is in active development**

- cleaner architecture
- better components
- more flexibility
- improved docs

Early adopters welcome.

---

## Stop splitting your app.

Define it once.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)  
👉 [**Explore the GitHub repo**](https://github.com/miguelperezcolom/mateu)  
👉 [**Read the docs**](https://mateu.io/java-create-your-project/springboot-mvc/)

---

_Built by developers who got tired of building the same app twice._
