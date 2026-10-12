---
title: "Architecture"
---

Mateu has three layers: a UI definition model, a small API (or a static bundle) that delivers it, and a renderer that turns it into a UI — in a browser, in the IDE or on a phone.

```text
Your UI model (YAML / visual editor, or a ViewModel in Java, C# or Python)
  -> UI definition (the Mateu wire model)
  -> Mateu API (HTTP endpoints) — or a static bundle, with no backend
  -> Renderer (web components, IntelliJ plugin, React Native app)
```

These layers are decoupled. You declare the UI once. Mateu produces the definition. The renderer consumes it.

## The UI definition layer

Mateu reads your UI model — YAML definitions (written by hand or with the visual editor), or ViewModels in code (fields, methods, annotations) — and produces an internal UI description. This description is a structured representation of:

- what fields exist and their types
- what actions are available
- how the layout is structured
- what validation rules apply
- what navigation entries are exposed

This description is the contract between whatever serves the UI and whatever renders it. It is not HTML. It is not JSON for a specific component library. It is an abstract UI specification.

## The API layer

Mateu exposes a small set of HTTP endpoints that the renderer calls:

- fetch the UI description for a given path
- hydrate a ViewModel with current field values
- execute an action
- resolve a lookup (relationship options and labels)

These endpoints are registered automatically by the Mateu integration for your runtime (Spring Boot, Micronaut, Quarkus, Helidon MP, ASP.NET, FastAPI). You do not write them. A UI with no server-side behaviour can skip this layer entirely: it is exported as a [static bundle](/deploy/static-bundle/) and served from a CDN.

## The renderer

The reference renderer is a JavaScript web component (`<mateu-ui>`). It loads the UI description from the API, renders it using a configurable design system, and handles browser interactions — field binding, validation display, button clicks, navigation.

Because the renderer consumes an abstract UI description, it can be replaced. Any client that speaks HTTP and understands the Mateu component tree can serve as a renderer:

- **Web renderers** — JavaScript web components built on different design systems: Vaadin Lumo and Oracle Redwood (on Visual Builder).
- **Desktop renderer** — an IntelliJ IDEA plugin that renders native Swing controls inside the IDE (tool windows, editor tabs, docking) on Windows, macOS, and Linux.
- **Mobile renderer** — an Expo / React Native application that renders native components on iOS and Android.

All renderers consume the same API. The same UI — and the same backend, when there is one — serves web, desktop, and mobile clients simultaneously.

## Stateless request cycle

When a backend serves the UI, each browser interaction follows the same stateless path:

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

When a backend serves the UI, Mateu integrates with its runtime through an adapter layer. On the JVM, the same ViewModel code works across:

- Spring Boot MVC
- Spring WebFlux
- Micronaut
- Quarkus
- Helidon MP

The integration registers the Mateu API endpoints and handles DI for ViewModel construction. The C# (ASP.NET) and Python (FastAPI) ports emit the same wire model, and a UI defined only in YAML is served by any of them — or by none, as a static bundle.

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
