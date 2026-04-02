---
header_alt: true
title: Stop building the same app twice
---

<meta name="description" content="Build real backoffice apps without a frontend. Define everything in Java. No duplicated models. No API glue.">

<meta property="og:title" content="Mateu – Stop building the same app twice">
<meta property="og:description" content="Build real backoffice apps without a frontend. One model. Full app.">
<meta property="og:image" content="https://mateu.io/og-image.png">

## Build real backoffice apps without a frontend

Define your app once in Java.  
Mateu renders the UI, wires interactions, and connects everything to your backend.

**No HTML. No CSS. No JavaScript.**  
**No duplicated models. No API glue. No sync issues.**

<div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="/build-a-full-backoffice-in-10-minutes"><strong>Build a backoffice →</strong></a>
  <a href="/java-user-manual/">Read the docs</a>
</div>

---

<p align="center">
  <img src="/images/workflow-edit.png" width="1000"/>
</p>

---

## 🧠 Understand the model

Mateu is simple — once you understand the model.

👉 [Understand the Mateu mental model →](/mateu-about/how-to-think-in-mateu)

---

## One model. Full app.

With Mateu, you define:

- state
- actions
- behavior
- relationships
- navigation
- layout
- validation
- UI reactions

Everything else is generated.

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

## This is a real app

<p align="center">
  <img src="/images/workflow-list.png" width="900"/>
</p>

<p align="center">
  <img src="/images/processes.png" width="900"/>
</p>

You’re not wiring components.  
You’re not syncing frontend and backend.

You’re just defining your application.

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

---

## And get a working UI

No templates. No controllers. No frontend layer.

---

## A real CRUD

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

---

## Navigation is your object model

```java
@Menu
MasterDataMenu masterData;
```

Menus, routing, and structure come from your classes.

---

## One shell. Many services.

Each microservice can expose its own UI.

Compose them with `RemoteMenu`:

- independent deployment
- unified navigation
- no frontend integration layer

---

## Built for

- internal tools
- admin panels
- microservice backoffices
- CRUD-heavy systems

---

## Why Mateu

- ⚡ Less code
- 🧠 One mental model
- 🔥 No frontend bugs
- 🧩 No duplication
- 🌐 Distributed-ready

---

## Stop building the same app twice.

Define it once.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)  
👉 [**Build a backoffice**](/build-a-full-backoffice-in-10-minutes)  
👉 [**Read the docs**](/java-user-manual/)

---

_Built by developers who got tired of writing useless code._
