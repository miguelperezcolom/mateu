---
header_alt: true
title: Spec-driven development. Build full web apps with minimal code.
---
<meta name="description" content="Mateu lets you build complete web apps with minimal code. Define your UI in Java and get a working app instantly.">
<meta property="og:title" content="Mateu – Spec-driven development">
<meta property="og:description" content="Define your UI in Java. Get a working web app instantly. No frontend. No APIs. No duplication.">
<meta property="og:image" content="https://mateu.io/og-image.png">

# Spec-driven development

## Build full web apps with minimal code

Define your UI in Java — and get a working web app instantly.

**No frontend. No APIs. No duplicated models.**

<div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">GitHub</a>
  <a href="https://mateu.io/java-create-your-project/springboot-mvc/">Docs</a>
</div>

---

## Built for modern architectures

Each service can own its UI.

No central frontend. No coordination bottlenecks.

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

## A real example

```java
@UI("/users")
public class Users {

  List<User> users = userService.findAll();

  @Button
  Runnable create = () -> {};

}
```

Mateu generates a full CRUD UI automatically:

- tables
- forms
- actions
- navigation

---

## UI federation

Compose UIs across services — without a frontend application.

- each service owns its UI
- independent deployment
- no frontend integration layer

👉 [Learn about UI federation →](/mateu-about/ui-federation)

---

## Why Mateu

- ⚡ Build apps faster
- 🧠 One language, one mental model
- 🔥 No frontend duplication
- 🌐 Designed for distributed systems
- 🔌 Embeddable as web components

---

## Built for

- internal tools
- CRUD applications
- enterprise apps
- microservice UIs
- embedded UIs

👉 [Explore use cases →](/use-cases)

---

## Stop splitting your app.

Define it once.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)

---

_Built by developers who got tired of building the same app twice._
