---
header_alt: true
title: Spec-driven development. Build full apps with minimal code.
---
<meta name="description" content="Mateu lets you build complete web apps from a single spec. Less code, fewer moving parts, no frontend required.">
<meta property="og:title" content="Mateu – Spec-driven development">
<meta property="og:description" content="Define your app once. Get UI, workflows, and logic automatically.">
<meta property="og:image" content="https://mateu.io/og-image.png">

# Spec-driven development

## Build full web apps with minimal code

Define your application once — and get a complete UI automatically.

**No HTML. No CSS. No JavaScript.**

No duplicated models. No API glue. No fragmented architecture.

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

## The shift

**What if your app wasn’t split at all?**

With Mateu, you define a single specification of your application:

- data
- actions
- workflows
- UI structure

And Mateu turns it into a complete, working web application.

---

## Less code. Fewer moving parts.

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

## Why Mateu

- ⚡ Build apps **10x faster**
- 🧠 One language, one mental model
- 🔥 No frontend bugs or sync issues
- 🧩 High-level building blocks instead of low-level UI code
- 🌐 Designed for stateless, distributed systems
- 🔌 Deliver UIs as embeddable web components

---

## Not backend-driven. Not frontend-driven.

**Spec-driven.**

Your app is defined once — not split across layers.

---

## Mateu vs traditional stack

| Traditional stack              | Mateu                    |
|------------------------------|--------------------------|
| Backend + frontend           | Single spec              |
| API layer                    | No API needed            |
| Duplicated models            | Single source of truth   |
| State sync issues            | No sync problems         |
| More moving parts            | Minimal architecture     |

---

## Who is this for?

- backend developers who want to move faster
- teams building internal tools
- startups reducing complexity
- microservice architectures
- CRUD-heavy business apps

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
