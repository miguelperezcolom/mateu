# Mateu shells, menus & federation

## Menus & shell

An app root is a `@UI("")` class; `@Menu` fields are the navigation. A menu entry can be:

```java
@UI("")
@Title("Console")
public class Shell {
    @Menu Products products;                               // local ViewModel
    @Menu String reports = "/reports";                     // a route string
    @Menu RouteLink docs = new RouteLink("/docs", "Docs"); // labelled route
    @Menu NestedApp settings;                              // nested @Menu fields → submenu
    @Menu @EyesOnly(roles = "admin") AdminPanel admin;     // role-gated
}
```

## Two ways to compose modules

### Build-time — Maven dependencies (one deployment)

Package several `@UI` modules into a single app via the classpath.

1. The module with `@UI` classes depends on `io.mateu:mateu-uidl` (+ `mateu-core` when it
   extends an archetype such as `AutoCrud`) and runs the
   **indexer** annotation processor, which writes `META-INF/mateu/ui-registrations`
   into its jar (one entry per `@UI` class).
2. The app module depends on that module **and** lists it in `annotationProcessorPaths`
   alongside the framework processor (`mateu-annotation-processor-mvc`, …). The framework
   processor reads the index from the classpath and generates the controllers — no
   sources needed.

```xml
<!-- module that owns @UI classes -->
<dependency><groupId>io.mateu</groupId><artifactId>mateu-uidl</artifactId><version>${mateu.version}</version></dependency>
<path><groupId>io.mateu</groupId><artifactId>mateu-annotation-processor-indexer</artifactId><version>${mateu.version}</version></path>
```

Use when the modules live in the same team / deployable.

### Runtime — RemoteMenu (independent microservices)

The shell stays thin and aggregates remote UIs over HTTP. Each service owns and
exposes its own UI root; the shell just says who serves what:

```java
@UI("")
@Title("Operations Console")
public class ShellRoot {
    @Menu RemoteMenu orders   = new RemoteMenu("http://orders:8081", "/orders");
    @Menu RemoteMenu products = new RemoteMenu("http://products:8082", "/products");
}
```

```java
// in the orders service
@UI("/orders")
public class OrdersRoot {
    @Menu OrdersCrud orders;
    @Menu OrderLinesOrchestrator lines;
}
```

The shell's server reads each remote's descriptor (an absolute `baseUrl` as written; a relative
one against `mateu.self-base-url`; restrict targets with `mateu.remote.allowed-hosts`), and the
**browser** then asks each remote for its menu and screens — so every remote must allow the
shell's origin: `mateu.cors.allowed-origins=https://shell.example.com` (CORS is off by default).
A new screen in a service appears in the shell **without redeploying the shell**. Details (tokens,
deep links, wire versions): https://mateu.io/java-user-manual/build/using-external-mateu-uis/.
To embed a remote UI inside a page (not just the menu), use the `MicroFrontend` component.

| | Build-time (Maven) | Runtime (RemoteMenu) |
|---|---|---|
| Deploy | one jar | independent services |
| Coupling | compile-time | runtime (HTTP) |
| New screen visible | rebuild + redeploy app | immediately, no shell redeploy |
| Best for | cohesive modules, one team | true microservices |
