---
header_alt: true
title: Spec-driven development. Build full apps with minimal code.
---

<meta name="description" content="Mateu lets you build full web apps from a single spec in Java. No frontend, no duplication, minimal code.">
<meta property="og:title" content="Mateu – Spec-driven development">
<meta property="og:description" content="Define your app once. Mateu builds the UI automatically.">
<meta property="og:image" content="https://mateu.io/og-image.png">

## Build full web apps with minimal code

Define your app once.  
Mateu builds the UI and wires everything together.

**No HTML. No CSS. No JavaScript.**

No duplicated models. No API glue. No fragmented architecture.

---

<div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">View GitHub</a>
  <a href="/java-user-manual/build-a-real-app/"><strong>Build a real app →</strong></a>
</div>

---

## One model. Full app.

With Mateu, your application is defined as a single model:

- fields → state
- methods → actions
- annotations → behavior and rendering

Mateu generates:

- UI
- navigation
- interaction
- validation
- browser behavior

---

## 🔐 Built-in security

Secure your entire app declaratively.

```java
@UI("")
@KeycloakSecured(
  url = "https://your-auth-server",
  realm = "your-realm",
  clientId = "your-client"
)
public class App {}
```

No separate frontend auth layer.  
No duplicated security logic.

---

## From this

```java
@UI("")
public class Home {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

## To this

<p align="center"><img src="../../../images/counter.png" width="700"/></p>

---

## Real app. No frontend.

<p align="center">
  <img src="../../../images/processes.png" width="800"/>
</p>

<p align="center"><em>Built entirely from Java classes. No frontend code.</em></p>

---

## Why this matters

Modern apps are split across:

- backend
- frontend
- APIs
- duplicated models
- synchronization layers

You build the same app twice — and maintain the gap forever.

---

## Mateu removes that gap

- one source of truth
- no duplication
- no glue code
- no sync problems

---

## Spec-driven

Mateu is not backend-driven or frontend-driven.

It is:

> **spec-driven**

Your app is defined once — not split across layers.

---

## What Mateu gives you

- ⚡ Build apps **10x faster**
- 🧠 One language, one mental model
- 🔥 No frontend bugs
- 🧩 High-level building blocks
- 🌐 Stateless, microservice-friendly
- 🔌 Embeddable UI (web components)
- 🔐 Secure your UI declaratively

---

## More examples

<p align="center">
  <img src="../../../images/workflow-list.png" width="800"/>
</p>

<p align="center">
  <img src="../../../images/workflow-edit.png" width="800"/>
</p>

---

## Built for real architectures

Mateu fits naturally with:

- Spring Boot
- DDD
- Hexagonal architecture

It does not replace your backend.  
It sits on top of it.

---

## Learn by building

👉 [Build a full backoffice in 10 minutes →](/java-user-manual/build-a-real-app/)  
👉 [Explore the documentation →](/java-user-manual/)  
👉 [View GitHub →](https://github.com/miguelperezcolom/mateu)

---

## Stop splitting your app

Define it once.

---

_Built by developers who got tired of writing useless code._
