---
header_alt: true
title: Skip the frontend. Build full apps in your backend.
---
  <meta name="description" content="Mateu lets you build complete web apps from your backend. No frontend, no JavaScript, no complexity.">
  <meta property="og:title" content="Mateu – Skip the frontend">
  <meta property="og:description" content="Build complete UIs from your backend code. No HTML, CSS, or JavaScript required.">
  <meta property="og:image" content="https://mateu.io/og-image.png">

# Skip the frontend.

## Build full apps in your backend.

**Mateu** is an open-source framework that lets you build complete web applications — UI, workflows, and logic — using only backend code.

**No HTML. No CSS. No JavaScript.**

No React. No Angular. No frontend team required.

---

<div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">View GitHub</a>
  <a href="https://mateu.io/java-create-your-project/springboot-mvc/">Read the docs</a>
</div>

---

## The problem

Modern web development is broken.

To build a simple business app, you need:

- a backend (Java, Spring, etc.)
- a frontend (React, Vue…)
- APIs in between
- duplicated models
- constant context switching
- endless glue code

You spend more time wiring things together than building actual features.

---

## The idea

**What if your backend *was* the UI?**

Mateu lets you define screens, actions, and workflows directly in your backend code — and turns them into real, responsive web interfaces.

No API layer.
No frontend duplication.
No complexity.

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
- 🧠 Stay in one language, one stack, one mental model
- 🔥 No frontend bugs, no state sync issues
- 🧩 High-level components instead of low-level UI work
- 🌐 Built for stateless, distributed systems
- 🔌 Embed anywhere as web components

---

## Not just UI components

Most tools help you build UI pieces.

**Mateu lets you build the whole app.**

- screens
- navigation
- actions
- workflows
- state

All from your backend.

---

## Mateu vs traditional approach

| Traditional stack              | Mateu                    |
|------------------------------|--------------------------|
| Backend + frontend           | Backend only             |
| API layer                    | No API needed            |
| Duplicated models            | Single source of truth   |
| State sync issues            | No sync problems         |
| Slower development           | Faster iteration         |

---

## Mateu vs Vaadin

Vaadin is great — but it's still UI-first.

Mateu is **application-first**.

| Feature          | Vaadin        | Mateu                  |
|------------------|--------------|------------------------|
| Focus            | UI           | Full app               |
| Architecture     | Stateful     | Stateless              |
| Microservices    | Limited      | Native fit             |
| Frontend         | Coupled      | Fully decoupled        |

---

## Who is this for?

Mateu is built for:

- backend developers tired of frontend
- teams building internal tools
- startups that need to move fast
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

## Stop building frontends.

Start building products.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)  
👉 [**Explore the GitHub repo**](https://github.com/miguelperezcolom/mateu)  
👉 [**Read the docs**](https://mateu.io/java-create-your-project/springboot-mvc/)

---

_Built by backend developers who got tired of frontend._
