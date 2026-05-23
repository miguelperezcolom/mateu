---
title: "Concepts"
---

These are the core building blocks of Mateu. Understanding them lets you build any UI the framework supports.

---

## What Mateu does

Mateu turns a plain Java class into a running UI. Fields become form state. Annotated methods become actions. Routes are declared with `@UI` and `@Route`. The framework handles everything between.

The request cycle is stateless: each request instantiates the ViewModel, hydrates it with URL and form data, executes the requested action, and discards the object.

---

## Recommended reading order

1. [State, actions and fields](./state-actions-and-fields/) — fields, controls, actions, return types
2. [Execution model](./execution-model/) — the stateless request cycle
3. [ViewModel lifecycle](./viewmodel-lifecycle/) — instantiate → hydrate → execute → respond
4. [Routing and parameters](./routing-and-parameters/) — path params, query params, URL binding
5. [UI vs Route](./ui-vs-route/) — `@UI` vs `@Route` and how they compose
6. [Field stereotypes](./field-stereotypes/) — overriding inferred controls with `@Stereotype`
7. [Validation](./validation/) — Bean Validation annotations in the UI
8. [Action behavior](./action-behavior/) — `@Button`, `@Toolbar`, `@Action`, row-level actions
9. [UI effects](./ui-effects/) — what actions can return and what each type does
10. [Declarative vs fluent](./declarative-vs-fluent/) — when to use annotations vs the builder API

---

## What you will learn

These concepts explain how Mateu:

- turns a Java class into a rendered form
- maps URL parameters to ViewModel fields
- executes actions inside a stateless lifecycle
- sends effects back to the browser (messages, navigation, state updates)
- lets you override inferred rendering with stereotypes
- validates input using standard Bean Validation
