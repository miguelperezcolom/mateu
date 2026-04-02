---
header_alt: true
title: Spec-driven UI for distributed systems
---

<meta name="description" content="Build full web apps from a single model. Define UI, behavior, navigation, validation, and browser effects in Java. No frontend layer. No duplicated models.">

<meta property="og:title" content="Mateu – Spec-driven UI for distributed systems">
<meta property="og:description" content="Define UI, behavior, navigation, validation, and browser effects in Java. No frontend layer. No duplicated models.">
<meta property="og:image" content="https://mateu.io/og-image.png">

# Spec-driven UI for distributed systems

## Build full web apps without a frontend layer

Define your app once in Java.  
Mateu renders the UI, wires the interaction model, and keeps everything connected to your backend.

**No HTML. No CSS. No JavaScript.**  
**No duplicated models. No API glue. No fragmented architecture.**

---

<div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">View GitHub</a>
  <a href="/java-user-manual/">Read the docs</a>
</div>

---

## 🚀 Build something real

👉 [**Build a full backoffice in 10 minutes →**](/build-a-full-backoffice-in-10-minutes)

See how Mateu is used to build a real admin app with:

- forms
- validation
- CRUD
- relationships
- navigation
- browser feedback

---

## One model. Full app.

With Mateu, you define:

- state
- actions
- action behavior
- relationships
- navigation
- layout
- rendering intent
- reactions
- rules
- validation
- UI effects

Everything else is generated.

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

## A real app model

A typical CRUD can include validation, relationships, rendering intent, and browser feedback in one place:

```java
@NotEmpty
String name;

@ForeignKey(search = PermissionIdOptionsSupplier.class, label = PermissionIdLabelSupplier.class)
@Stereotype(FieldStereotype.checkbox)
List<String> permissions;

@Button
public Message save() {
  return new Message("Saved successfully");
}
```

Mateu handles:

- rendering
- validation in the browser
- option loading
- interaction
- user feedback

👉 [See the CRUD example →](/java-user-manual/crud-example)

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

## One shell. Many services.

Each service can own its UI and expose its own menu tree.

A shell can compose them with `RemoteMenu`:

- independent services
- unified navigation
- centralized auth and branding
- no frontend integration layer

👉 [Learn about UI federation →](/mateu-about/ui-federation)

---

## Why this is different

Traditional apps split the same product into multiple layers:

- backend
- frontend
- API
- duplicated validation
- duplicated routing
- duplicated models

Mateu keeps all of that in one model.

👉 [See the Mateu model →](/mateu-about/mental-model)

---

## Built for

- internal tools
- CRUD-heavy systems
- enterprise apps
- microservice architectures
- platform backoffices

👉 [Build a full backoffice →](/build-a-full-backoffice-in-10-minutes)

---

## Why Mateu

- ⚡ Build apps faster
- 🧠 One language, one mental model
- 🔥 No frontend bugs or sync issues
- 🧩 High-level abstraction by default
- 🌐 Designed for distributed systems
- 🔌 UI as embeddable web components

---

## Stop building the same app twice.

Define it once.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)  
👉 [**Explore the GitHub repo**](https://github.com/miguelperezcolom/mateu)  
👉 [**Read the docs**](/java-user-manual/)

---

_Built by developers who got tired of building the same app twice._
