---
title: "MultiView"
description: "The base class that handles route resolution and screen wrapping for all CRUD orchestrators."
---

`MultiView` is the root base class of the orchestrator hierarchy. It handles the routing contract — deciding which sub-screen to render for a given URL — and wraps each resolved view in the component shell that drives the navigation flow.

```java
public abstract class MultiView
    implements ActionHandler, ActionSupplier, RouteHandler, DtoSupplier
```

You never extend `MultiView` directly. Extend `Crud`, `AutoCrud`, `EditableView`, or `Wizard` instead. `MultiView` is documented here so you can understand what those classes inherit.

---

## Implemented interfaces

| Interface | What it provides |
|---|---|
| `ActionHandler` | Dispatches named actions triggered from the UI |
| `ActionSupplier` | Declares which actions the orchestrator exposes |
| `RouteHandler` | Receives the URL and decides which sub-component to render |
| `DtoSupplier` | Wraps the orchestrator in an `AppShell` mediator on first load |

---

## How routing works

When a request arrives at an orchestrated route (e.g. `/products`), Mateu calls `handleRoute()` on the orchestrator. The orchestrator:

1. On **first load** — renders itself as a mediator shell that hosts the sub-screens.
2. On **subsequent navigation** — calls the abstract `resolveInternalRoute()` to determine which sub-screen to show.
3. Wraps the resolved component in a `ServerSideComponentDto` with the correct state, triggers, and dirty-state tracking.

The subclass (`Crud`) provides the concrete `resolveInternalRoute()` that maps URL patterns to list/view/edit/new screens. `EditableView` provides its own implementation for the view/edit pattern.

---

## Abstract method

```java
protected abstract OrchestrationResult resolveInternalRoute(
    String route, HttpRequest httpRequest);
```

---

## Overridable methods

| Method | Default | Override to… |
|---|---|---|
| `layout()` | `AppLayout.SINGLE_SLOT` | Use `AppLayout.SPLIT` for a split-panel layout (also available via `@SplitCrud`) |
| `triggers(viewName, httpRequest)` | `List.of()` | Return triggers that fire when a specific sub-screen (`"list"`, `"view"`, `"edit"`, `"new"`) loads |

---

## Orchestrator hierarchy

```
MultiView
├── Crud<View, Editor, CreationForm, Filters, Row, IdType>
│   ├── FilteredAutoCrud<Filters, T>
│   │   └── AutoCrud<T>
│   │       └── (your class)
│   └── (your class)
├── EditableView<V, E>
│   └── AutoEditableView<T>
│       └── (your class)
└── Wizard
    └── (your class)
```

---

## Next

- [Full control with Crud](/java-user-manual/build/full-control-crud-orchestrator/) — the direct subclass used for explicit multi-screen CRUD
- [AutoCrud](/java-user-manual/build/auto-orchestrators/) — the simplest entry point built on top of `Crud`
- [EditableView](/java-user-manual/build/editable-view/) — single-entity view with an Edit button, no list
