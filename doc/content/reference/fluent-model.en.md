---
title: "Fluent model"
weight: 3
---

# Fluent model

Mateu is not only declarative.

It also provides a fluent model made of records and interfaces that implement `Component`.

This model lets you build pages, apps and reusable UI blocks programmatically.

---

## Core fluent types

### `App`

Represents an application shell.

Important fields include:

- route
- homeRoute
- pageTitle
- title
- subtitle
- menu
- widgets
- variant
- logo

`App` is the fluent equivalent of a full application shell.

---

### `Page`

Represents a full page with:

- title
- subtitle
- breadcrumbs
- header
- footer
- content
- toolbar
- buttons
- badges
- kpis
- actions

Use it when you want explicit control over a page structure.

---

### `Form`

Represents a fluent form with:

- header
- footer
- content
- toolbar
- buttons

Use it when you want form composition without relying only on inferred declarative fields.

---

### `Listing`

Represents a listing/table/card-style collection page.

Important capabilities include:

- columns
- filters
- toolbar
- search
- selection
- paging
- lazy loading
- detail path
- header/footer content

Use it for searchable collections and listing screens.

---

### `MenuBar`

Represents a fluent menu bar built from `Actionable` options.

Use it when navigation must be created explicitly.

---

## Action model

### `Action`

Fluent representation of action behavior.

It includes settings for:

- background
- validationRequired
- confirmationRequired
- rowsSelectedRequired
- href
- js
- sse
- modal config
- custom events

This matches the same conceptual space as the declarative `@Action`.

---

## Trigger model

Mateu also exposes a fluent trigger model.

Core types include:

- `Trigger`
- `OnLoadTrigger`
- `OnSuccessTrigger`
- `OnErrorTrigger`
- `OnValueChangeTrigger`
- `OnEnterTrigger`
- `OnCustomEventTrigger`

Use the fluent trigger model when dynamic interaction behavior should be described directly in code instead of only via annotations.

---

## UI metadata

### `UI`

Small fluent metadata object with:

- `favicon`
- `pageTitle`
- `homeRoute`

Useful in combination with `UISupplier`.

---

## Mental model

The fluent model gives you:

- explicit component trees
- explicit page composition
- explicit app composition
- a way to mix reusable UI blocks into declarative screens

Use declarative by default.  
Use fluent when you need more control.
