---
title: "UI federation"
weight: 22
---

# UI federation

Mateu lets you build a shell UI that federates menus and UI modules from multiple backend services.

## The idea

Instead of a central frontend application reimplementing every module, each service exposes its own UI entry point.

A shell application composes those modules into a single console.

## Shell example

```java
@UI("")
@Title("Console")
@KeycloakSecured(url = "...", realm = "mateu", clientId = "demo")
@FavIcon("/images/riu.svg")
@PageTitle("Console")
@Logo("/images/riu.svg")
public class ShellHome implements WidgetSupplier {

    @EyesOnly(roles = "admin")
    @Menu
    RemoteMenu users = new RemoteMenu("/_users")
        .withAppServerSideType("io.mateu.workflow.usersservice.infra.in.ui.UsersHome");

    @EyesOnly(roles = {"admin", "operator"})
    @Menu
    RemoteMenu content = new RemoteMenu("/_content-service")
        .withAppServerSideType("io.mateu.workflow.contentservice.infra.in.ui.ContentServiceHome");

    @EyesOnly(scopes = {"workflow:read"})
    @Menu
    RemoteMenu workflow = new RemoteMenu("/_workflow")
        .withAppServerSideType("io.mateu.workflow.infra.in.ui.WorkflowHome");
}
```

## What this shows

The shell owns:

- branding
- authentication
- page metadata
- top-level navigation
- shared widgets

Each microservice owns:

- its own UI root
- its own menus
- its own CRUDs and screens
- its own backend behavior

## Remote menus

A `RemoteMenu` lets the shell include UI modules exposed by another service.

This means UI composition happens at the backend level — not in a separate frontend application.

## Security and visibility

Menus can be controlled declaratively:

- `@EyesOnly(roles = ...)`
- `@EyesOnly(scopes = ...)`

## Shared widgets

The shell can render shared UI elements:

```java
@Override
public List<Component> widgets(HttpRequest httpRequest) {
    return List.of(/* user info, logout, etc. */);
}
```

## Why this matters

- one shell
- many service-owned modules
- centralized auth and branding
- decentralized ownership

## One sentence

A backend-defined shell that federates UI modules from multiple services.
