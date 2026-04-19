---
title: "Execution model"
weight: 9
---

# Execution model

Understanding how Mateu works at runtime is key to mastering the framework.

This page explains what happens on every request.

---

## High-level flow

A Mateu request follows this sequence:

1. resolve target ViewModel
2. instantiate ViewModel
3. hydrate state (route + query params)
4. evaluate UI (fields + components)
5. execute action (if any)
6. return UI effects and/or updated state

---

## Step by step

### 1. Resolve ViewModel

Mateu determines which ViewModel to use based on:

- `@UI` (base URL)
- `@Route` (internal routing)

---

### 2. Instantiate

A new instance of the ViewModel is created.

Mateu UIs are stateless between requests.

---

### 3. Hydration

Mateu injects:

- path parameters
- query parameters

into matching fields.

👉 See [Routing and parameters →](/java-user-manual/concepts/routing-and-parameters/)

---

### 4. UI evaluation

Now the ViewModel is fully hydrated.

- declarative fields are ready
- fluent components are evaluated

Important:

- `Component` fields → evaluated directly
- `Callable<?>` fields → evaluated now (after hydration)

---

### 5. Action execution

If the request triggers an action:

- the method is executed
- state can be mutated
- results can be returned

---

### 6. Response

Mateu sends back:

- UI effects (`Message`, `UICommand`, etc.)
- updated state (`State`)

---

## Mental model

Think of Mateu as:

👉 request → ViewModel → evaluation → action → response

---

## Why this matters

This explains:

- why route params are available in components
- why `Callable<?>` works for dynamic UI
- how actions can mutate state and return effects

---

## Related

- [ViewModel lifecycle →](/java-user-manual/concepts/viewmodel-lifecycle/)
- [Routing and parameters →](/java-user-manual/concepts/routing-and-parameters/)
