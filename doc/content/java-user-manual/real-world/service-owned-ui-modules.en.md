---
title: "Service-owned UI modules"
weight: 2
---

# Service-owned UI modules

In a microservices architecture, each service can own and expose its own UI. The shell application aggregates these into a unified interface using `RemoteMenu`.

---

## The pattern

Each service defines its own `@UI` and navigation:

```java
// In the content-service backend
@UI("/_content-service")
public class ContentServiceApp {

    @Menu
    Pages pages;

    @Menu
    Templates templates;

    @Menu
    @EyesOnly(roles = "admin")
    Settings settings;
}
```

The shell application pulls the remote service's menu and embeds it:

```java
// In the shell / backoffice
@UI("")
public class Shell {

    @Menu
    Home home;

    @Menu
    RemoteMenu contentService = new RemoteMenu(
            "Content",
            "https://content-service.internal/_content-service"
    );

    @Menu
    RemoteMenu analyticsService = new RemoteMenu(
            "Analytics",
            "https://analytics-service.internal/_analytics"
    );
}
```

The shell renders the combined navigation. Clicking a remote menu item proxies the request to the owning service.

---

## Why service-owned UI

| Concern | Benefit |
|---|---|
| Independent deployment | Each service's UI deploys with the service |
| Clear boundaries | UI logic lives with domain logic |
| No shared frontend | No coordination of a monolithic frontend repo |
| Authorization | Each service enforces its own `@EyesOnly` rules |
| Testability | Each UI module can be tested in isolation |

---

## What each service exposes

Each service is a standard Mateu application:

```java
@UI("/_orders")
public class OrdersServiceUI {

    @Menu
    OrdersOrchestrator orders;

    @Menu
    @EyesOnly(roles = "manager")
    ReportsPage reports;
}
```

The `@UI` path acts as the namespace for all routes in that service.

---

## Navigation within a service

Pages within a service use standard `@Route` with `parentRoute`:

```java
@Route(value = "/_orders/order-detail/:id", parentRoute = "/_orders")
public class OrderDetailPage implements ComponentTreeSupplier {
    // ...
}
```

Routes are scoped to the service. The shell navigates to them by assembling `service-base-url + route`.

---

## Security model

Each service validates `@EyesOnly` independently using the JWT token forwarded by the shell:

```
User browser → Shell (aggregates menus) → Service backend (validates @EyesOnly)
```

A user who lacks the required role sees the menu entry hidden in the service's response — not just in the shell.

---

---

## Shared UI library (single deployable)

A simpler variant of the same idea: package your `@UI` classes into a plain Java library and
let one or more Spring Boot apps depend on it. All services compile into a single deployable;
no `RemoteMenu` or HTTP federation required.

### 1. Create the UI library module

The library only needs `io.mateu:uidl` — no framework dependency:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>uidl</artifactId>
    <version>${mateu.version}</version>
</dependency>
```

Add the **indexer** annotation processor so that the library's `@UI` classes are discoverable
by downstream modules at compile time:

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>annotation-processor-indexer</artifactId>
    <version>${mateu.version}</version>
    <scope>provided</scope>
</dependency>
```

And configure it in the compiler plugin:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>io.mateu</groupId>
                <artifactId>annotation-processor-indexer</artifactId>
                <version>${mateu.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

When the library is compiled, `MateuUIIndexerProcessor` writes a manifest
`META-INF/mateu/ui-registrations` into the jar listing every `@UI` class.

### 2. Consume the library in the app

Add the library to `<dependencies>` as usual, **and also** to `<annotationProcessorPaths>` so
the framework-specific processor can read the manifest at compile time:

```xml
<!-- regular runtime dependency -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-ui-lib</artifactId>
    <version>1.0.0</version>
</dependency>
```

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path><!-- lombok --></path>
            <path>
                <groupId>io.mateu</groupId>
                <artifactId>annotation-processor-mvc</artifactId>
                <version>${mateu.version}</version>
            </path>
            <!-- also put the UI library here so the processor can read
                 META-INF/mateu/ui-registrations from its jar -->
            <path>
                <groupId>com.example</groupId>
                <artifactId>my-ui-lib</artifactId>
                <version>1.0.0</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

Mateu's `MateuIndexedUIProcessor` fires during the app's compilation, reads the manifest from
the library jar, and generates the controllers (`MyPageController`,
`MyPageMateuController`, …) exactly as if the `@UI` classes were in the app's own sources.

> **Why does the library need to be on the annotation processor classpath?**
> Annotation processors run in their own classloader, separate from the regular compile
> classpath. Adding the library to `<annotationProcessorPaths>` ensures the processor can
> load `META-INF/mateu/ui-registrations` from the jar.

---

## Next

- [Distributed control plane](/java-user-manual/real-world/distributed-control-plane/)
- [Navigation and menus](/java-user-manual/build/navigation-and-menus/)
- [Security](/java-user-manual/advanced/security/)
