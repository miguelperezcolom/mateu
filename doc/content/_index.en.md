---
header_alt: true
title: Spec-driven development. Build full web apps with minimal code.
---
<meta name="description" content="Mateu lets you build complete web apps with minimal code. Define your UI in Java and let Mateu render and wire everything automatically.">
<meta property="og:title" content="Mateu – Spec-driven development">
<meta property="og:description" content="Define your UI in Java. Mateu renders it and connects it to your backend automatically.">
<meta property="og:image" content="https://mateu.io/og-image.png">

# Spec-driven development

## Build full web apps with minimal code

Define your UI in Java. Mateu renders it and connects it to your backend automatically.

**No HTML. No CSS. No JavaScript.**

<div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">GitHub</a>
  <a href="https://mateu.io/java-create-your-project/springboot-mvc/">Docs</a>
</div>

---

- One source of truth
- No frontend duplication
- No manual API glue
- Stateless by design

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

## Built for

- internal tools
- CRUD applications
- enterprise apps
- microservice UIs
- embedded UIs

👉 [Explore use cases →](/use-cases)

---

## Why Mateu

- ⚡ Build apps faster
- 🧠 One language, one mental model
- 🔥 No frontend duplication
- 🌐 Designed for distributed systems
- 🔌 Embeddable as web components

---

## Proven in microservices

Mateu can be used in systems where each service owns its own UI routes and screens, keeping UI definition close to backend ownership.

👉 [See how Mateu fits microservices →](/mateu-about/microservices)

---

## Stop splitting your app.

Define it once.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)

---

_Built by developers who got tired of building the same app twice._
