---
header_alt: true
title: Spec-driven UI for distributed systems
---

<meta name="description" content="Mateu lets you build complete web applications from a single spec. Minimal code, no frontend, no duplication.">

<meta property="og:title" content="Mateu – Spec-driven UI framework">
<meta property="og:description" content="Define your app once. Get UI, behavior, navigation, and validation automatically.">
<meta property="og:image" content="https://mateu.io/og-image.png">


## Build full web apps with minimal code

Define your app once. Mateu builds the UI and wires everything together.

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

Modern applications are split across too many layers:

- backend
- frontend
- APIs
- duplicated models
- state synchronization

You end up building the same app twice — and maintaining the gaps between them.

---

## The shift

**What if your app wasn’t split at all?**

With Mateu, you define your UI using plain Java:

- classes
- fields (state)
- annotations
- actions (methods or buttons)

Mateu renders the UI automatically and connects it to your backend.

---

## What you actually write

With Mateu, you define:

- state
- actions (methods or buttons)
- action behavior
- relationships
- navigation
- layout
- rendering intent
- reactions
- rules
- validation

Everything else is generated.

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

## A real example

A typical CRUD with relationships, validation, and behavior:

```java
@NotEmpty
String name;

@ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
@Stereotype(FieldStereotype.checkbox)
List<String> permissions;

@Button
public void save() {
  // application logic
}
```

Mateu handles:

- UI rendering
- validation in the browser
- data binding
- option loading
- interaction

---

## Navigation is just your object model

```java
@Menu
MasterDataMenu masterData;

public class MasterDataMenu {

  @Menu EnvironmentCrudOrchestrator environments;
  @Menu LanguageCrudOrchestrator languages;

}
```

No routing config. No menu config. Just classes.

---

## Works with microservices

Each service owns its UI and exposes a menu.

The shell composes them:

- independent services
- unified navigation
- no frontend duplication

---

## Why Mateu

- ⚡ Build apps **10x faster**
- 🧠 One language, one mental model
- 🔥 No frontend bugs or sync issues
- 🧩 High-level building blocks
- 🌐 Designed for distributed systems
- 🔌 UI as embeddable web components

---

## Not backend-driven. Not frontend-driven.

**Spec-driven.**

Your app is defined once — not split across layers.

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
