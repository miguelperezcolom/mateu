---
title: "Architecture"
---

Mateu has three layers: a UI definition model, a small API that exposes it, and a renderer that turns it into a browser UI.

```text
ViewModel (your Java code)
  -> UI definition (Mateu internal format)
  -> Mateu API (HTTP endpoints)
  -> Renderer (browser / web components)
```

These layers are decoupled. You write ViewModels. Mateu produces the definition. The renderer consumes it.

## The UI definition layer

Mateu introspects your ViewModels — fields, methods, annotations — and produces an internal UI description. This description is a structured representation of:

- what fields exist and their types
- what actions are available
- how the layout is structured
- what validation rules apply
- what navigation entries are exposed

This description is the contract between backend and frontend. It is not HTML. It is not JSON for a specific component library. It is an abstract UI specification.

## The API layer

Mateu exposes a small set of HTTP endpoints that the renderer calls:

- fetch the UI description for a given path
- hydrate a ViewModel with current field values
- execute an action
- resolve a lookup (relationship options and labels)

These endpoints are registered automatically by the Mateu integration for your runtime (Spring Boot, Micronaut, Quarkus, etc.). You do not write them.

## The renderer

The reference renderer is a JavaScript web component (`<mateu-ui>`). It loads the UI description from the API, renders it using a configurable design system, and handles browser interactions — field binding, validation display, button clicks, navigation.

Because the renderer consumes an abstract UI description, it can be replaced. Any client that speaks HTTP and understands the Mateu component tree can serve as a renderer:

- **Web renderers** — JavaScript web components built on different design systems: Vaadin Lumo, SAP Fiori, Red Hat PatternFly, Oracle Redwood, Salesforce Lightning.
- **Desktop renderer** — an IntelliJ IDEA plugin that renders native Swing controls inside the IDE (tool windows, editor tabs, docking) on Windows, macOS, and Linux.
- **Mobile renderer** — an Expo / React Native application that renders native components on iOS and Android.

All renderers consume the same API. The same backend serves web, desktop, and mobile clients simultaneously.

## Stateless request cycle

Each browser interaction follows the same stateless path:

```text
1. Browser sends: current field values + action id
2. Mateu instantiates the ViewModel
3. Mateu hydrates it from the request
4. Mateu executes the action
5. Mateu serializes the updated UI definition
6. Browser renders the result
```

No session. No server-side UI state. The ViewModel is created per request and discarded after the response.

## Pluggable integration

Mateu integrates with your Java runtime through an adapter layer. The same ViewModel code works across:

- Spring Boot MVC
- Spring WebFlux
- Micronaut
- Quarkus

The integration registers the Mateu API endpoints and handles DI for ViewModel construction.

## Orchestrators

Orchestrators are the entry points for structured UI patterns. `AutoCrud` and `Crud` are orchestrators for CRUD flows. An orchestrator coordinates:

- which ViewModel to use for listing
- which ViewModel to use for viewing
- which ViewModel to use for editing
- which ViewModel to use for creation
- which adapter handles data access and mutations

## Related

- [Mateu and system architecture](/mateu-about/system-architecture) — where Mateu fits in hexagonal and DDD designs
- [How Mateu works](/mateu-about/how-mateu-works) — how ViewModels become UI definitions
- [Design systems](/design-systems) — available renderers and how to bring your own
