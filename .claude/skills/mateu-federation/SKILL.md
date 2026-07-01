---
name: mateu-federation
description: Wire a federated Mateu setup end to end — a shell app that aggregates several @UI modules by Maven (build-time, one deployment) or independent services by RemoteMenu over HTTP (runtime, true microservices). Use when building an app shell, microfrontends, service-owned UI modules, embedding a remote UI in a page, or composing several Mateu backends. Triggers on shell, @Menu, RemoteMenu, MicroFrontend, microfrontend, service-owned UI, compose backends.
---

# Federating Mateu apps

Same UI model, two ways to compose it. Pick by team/deploy boundaries.

| | Build-time (Maven) | Runtime (RemoteMenu) |
|---|---|---|
| Deploy | one jar | independent services |
| Coupling | compile-time (classpath) | runtime (HTTP) |
| New screen visible | rebuild + redeploy the app | immediately, no shell redeploy |
| Best for | cohesive modules, one team | true microservices, many teams |

## The shell

An app root is a `@UI("")` class; `@Menu` fields are the navigation.

```java
@UI("")
@Title("Operations Console")
public class Shell {
    @Menu Products products;                                // local ViewModel
    @Menu String reports = "/reports";                      // a route string
    @Menu RouteLink docs = new RouteLink("/docs", "Docs");  // labelled route
    @Menu Settings settings;                                // nested @Menu → submenu
    @Menu @EyesOnly(roles = "admin") AdminPanel admin;      // role-gated
}
```

## Build-time — several modules, one deployment

Each screen set is a framework-agnostic `@UI` module (indexer AP → `META-INF/mateu/
ui-registrations`); the shell app depends on each module **and** lists it on
`annotationProcessorPaths`. That's exactly the two-step wiring in the **mateu-scaffold**
skill — do the UI-module pom for each module, and add one AP `<path>` per module in the app
pom. The shell's `@Menu` fields then reference types/routes from those modules.

Use when the modules live in the same team and ship together.

## Runtime — RemoteMenu (independent services)

The shell stays thin and aggregates remote UIs over HTTP. Each service owns and exposes its
own `@UI` root; the shell only says who serves what.

```java
// shell service
@UI("")
@Title("Operations Console")
public class ShellRoot {
    @Menu RemoteMenu orders   = new RemoteMenu("http://orders:8081", "/orders");
    @Menu RemoteMenu products = new RemoteMenu("http://products:8082", "/products");
}
```

```java
// the orders service (a separate deployable Mateu app)
@UI("/orders")
public class OrdersRoot {
    @Menu OrdersCrud orders;
    @Menu OrderLinesView lines;
}
```

`RemoteMenu` constructors (from `io.mateu.uidl.data.RemoteMenu`):

```java
new RemoteMenu(baseUrl)                    // pull the remote root menu
new RemoteMenu(baseUrl, route)             // pull a specific remote route
new RemoteMenu(baseUrl, explode)           // explode entries into the parent menu
new RemoteMenu(baseUrl, route, explode)
```

The shell resolves each `RemoteMenu` by calling the remote's action endpoint
(`/mateu/v3/sync`) and rendering the returned UIDL (`RemoteMenuHandler` in core). A new
screen in a service appears in the shell **without redeploying the shell**.

### Embed a remote UI *inside a page* (not just the menu)

Use the `MicroFrontend` component (fluent) to mount a remote route inside a form/section:

```java
MicroFrontend.builder().baseUrl("/_orders").route("/my-tasks").build();
```

## End-to-end procedure

1. Scaffold each service/module with **mateu-scaffold** (each service is a normal Mateu app;
   each build-time module is a framework-agnostic UI module).
2. Give every service a distinct `@UI("/x")` root and its own port.
3. In the shell, add `@Menu` fields: local types, `RemoteMenu(...)` for runtime services, or
   consumed-module types for build-time modules.
4. Run each service (**mateu-run**) and the shell; open the shell and confirm every menu
   entry resolves. For runtime, check the shell can reach each `baseUrl`.

## Related

- Build wiring per module/service → **mateu-scaffold**.
- Run/verify each service → **mateu-run**.
- Concept reference → the `mateu` skill's `reference/federation.md`; docs under
  `doc/.../mateu-about/` (`ui-federation.md`, `shell-and-remote-menus.md`, `microservices.md`).
