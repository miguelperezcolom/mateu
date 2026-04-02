---
title: "The Mateu model"
weight: 3
---

# The Mateu model

Mateu is not a UI component library.

It is a **spec-driven application model**. You define what your application *is*, and Mateu produces the UI from that definition.

---

## What you define

| Concept | How |
|---|---|
| State | Fields in your class |
| Actions | Methods annotated with `@Action` |
| Navigation | `@Menu` and `@Route` annotations |
| Relationships | `@ForeignKey` |
| Layout | Layout annotations and interfaces |
| Validation | Bean Validation (`@NotNull`, `@Size`, …) |
| Dynamic behavior | `@Rule`, `@Trigger` |
| Presentation | `@Stereotype`, `@Style` |

## What Mateu produces

From your model, Mateu generates:

- a fully working UI rendered in the browser
- navigation structure with menus and routes
- form interactions and action wiring
- API communication between frontend and backend
- browser behavior (loading states, transitions, error display)

---

## The mental shift

In a traditional stack, you think in layers:

> "I need a backend endpoint, a frontend form, and an API contract between them."

In Mateu, you think in models:

> "I need to define the state, the actions, and the navigation. Mateu handles the rest."

There is no frontend to coordinate with. The UI is a projection of your model.

---

## One sentence

Define your application once. Mateu builds everything else.
