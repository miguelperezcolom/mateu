---
header_alt: true
title: Spec-driven UI for distributed systems
---
<meta name="description" content="Build full web apps without a frontend layer. Mateu lets each service own its UI and composes everything into a single shell.">
<meta property="og:title" content="Mateu – Spec-driven UI for distributed systems">
<meta property="og:description" content="Microfrontends without a frontend. Define your UI in Java and let each service own its screens.">
<meta property="og:image" content="https://mateu.io/og-image.png">

# Spec-driven UI for distributed systems

## Build full web apps — without a frontend layer

Define your UI in Java.  
Each service owns its screens.  
Mateu renders and composes everything.

**No frontend. No APIs. No duplicated models.**

<div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">GitHub</a>
  <a href="/java-user-manual/">Docs</a>
</div>

---

## One shell. Many services.

Build a shell UI that federates modules from multiple backend services.

- each service owns its UI
- menus are composed with `RemoteMenu`
- auth and branding live in the shell
- no frontend integration layer

**This is microfrontends — without a frontend.**

👉 [Learn about UI federation →](/mateu-about/ui-federation)

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

## A real CRUD

Define a form with relationships, validation, and behavior:

```java
@ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
@Stereotype(FieldStereotype.checkbox)
List<String> permissions;
```

Mateu handles:

- option loading
- label resolution
- rendering
- interaction

👉 [See full example →](/java-user-manual/crud-example)

---

## What you actually write

With Mateu, you define:

- state (fields)
- actions
- relationships
- rendering intent

Everything else is generated.

---

## Not a framework. A model.

Mateu is not about UI components.

It’s about defining your app once.

- no duplicated models
- no frontend logic
- no API glue

Just one definition.

---

## How it works

Mateu defines a UI DSL in Java:

- classes → screens
- fields → state
- actions → behavior
- annotations → rendering and structure

Relationships and rendering are declarative:

- `@ForeignKey` → relationships
- `@Stereotype` → presentation

Each service exposes its UI.  
The shell composes them.

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
- CRUD-heavy systems
- enterprise apps
- microservice architectures
- platform backoffices

👉 [Explore use cases →](/use-cases)

---

## Stop building the same app twice.

Backend. Frontend. API.

Or just one model.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)

---

_Built by developers who got tired of building the same app twice._
