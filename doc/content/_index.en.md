---
header_alt: true
title: Stop building the same app twice
---

<meta name="description" content="Build real web apps from a single Java model. No frontend, no duplication, no API glue. Mateu generates the UI automatically.">
<meta property="og:title" content="Mateu – Stop building the same app twice">
<meta property="og:description" content="Define your app once. Mateu builds UI, routing, interaction and security automatically.">
<meta property="og:image" content="https://mateu.io/og-image.png">

## Build full web apps with minimal code

Define your app once.  
Mateu builds the UI, routing, interaction and security.

**No HTML. No CSS. No JavaScript.**

No duplicated models. No API glue. No sync issues.

---

<div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="/java-user-manual/build-a-real-app/"><strong>Build a real app →</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">View GitHub</a>
</div>

---

## One model. Full app.

With Mateu, your application is a single model:

- fields → state
- methods → actions
- annotations → UI, routing, behavior, security

Mateu generates:

- UI
- navigation
- routing
- interaction
- validation
- security

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

No frontend auth.  
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

## Routing without a router

Routing is part of your model.

```java
@Route("/users/:id")
public class UserDetail {

  String id;

}
```

- automatic parameter binding
- nested routes
- implicit routes from menus

No route config. No duplication.

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
- 🔐 Built-in security
- 🧭 Routing without configuration

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

## Stop building the same app twice

Define it once.

---

_Built by developers who got tired of writing useless code._
