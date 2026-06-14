---
title: "ViewOrchestrator"
description: "The base class that handles route resolution and screen wrapping for all CRUD orchestrators."
---

`ViewOrchestrator` is the root base class of the orchestrator hierarchy. It handles the routing contract — deciding which sub-screen to render for a given URL — and wraps each resolved view in the component shell that drives the navigation flow.

```java
public abstract class ViewOrchestrator
    implements ActionHandler, ActionSupplier, RouteHandler, DtoSupplier
```

You never extend `ViewOrchestrator` directly. Extend `CrudOrchestrator` or one of its derivatives instead. `ViewOrchestrator` is documented here so you can understand what `CrudOrchestrator` inherits.

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
2. On **subsequent navigation** — calls the abstract `resolveInternalRoute()` to determine which sub-screen to show (list, view, edit, or new).
3. Wraps the resolved component in a `ServerSideComponentDto` with the correct state, triggers, and dirty-state tracking.

The subclass (`CrudOrchestrator`) provides the concrete `resolveInternalRoute()` that maps URL patterns to list/view/edit/new screens.

---

## Abstract method

```java
protected abstract OrchestrationResult resolveInternalRoute(
    String route, HttpRequest httpRequest);
```

`CrudOrchestrator` implements this with a chain of `CrudOrchestratorRouteResolver` objects — one per URL pattern (`/list`, `/:id`, `/:id/edit`, `/new`).

---

## Overridable methods

| Method | Default | Override to… |
|---|---|---|
| `layout()` | `AppLayout.SINGLE_SLOT` | Use `AppLayout.SPLIT` for a split-panel layout (also available via `@SplitCrud`) |
| `triggers(viewName, httpRequest)` | `List.of()` | Return triggers that fire when a specific sub-screen (`"list"`, `"view"`, `"edit"`, `"new"`) loads |

---

## Orchestrator hierarchy

```
ViewOrchestrator
└── CrudOrchestrator<View, Editor, CreationForm, Filters, Row, IdType>
    ├── AutoCrudOrchestrator<T>
    │   └── (your class)
    ├── AutoListOrchestrator<T>
    │   └── (your class)
    ├── FilteredAutoCrudOrchestrator<Filters, Row>
    │   └── (your class)
    └── FilteredAutoListOrchestrator<Filters, Row>
        └── (your class)
```

---

## Next

- [Full control with CrudOrchestrator](/java-user-manual/build/full-control-crud-orchestrator/) — the direct subclass that most applications use
- [AutoListOrchestrator and AutoCrudOrchestrator](/java-user-manual/build/auto-orchestrators/) — the simplest entry points built on top of `CrudOrchestrator`
