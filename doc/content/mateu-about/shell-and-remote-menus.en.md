---
title: "Shell and remote menus"
weight: 23
---

# Shell and remote menus

Mateu allows you to build a shell application that composes UI modules from multiple services.

## The shell

The shell defines:

- authentication
- branding
- navigation
- shared UI elements

```java
@UI("")
@Title("Console")
@KeycloakSecured(...)
public class ShellHome {
}
```

## Remote menus

Remote menus allow the shell to include UI modules from other services.

```java
@Menu
RemoteMenu users = new RemoteMenu("/_users")
    .withAppServerSideType("...");
```

Each remote menu points to a UI exposed by another service.

## Ownership model

- shell → composition
- service → UI + logic

## Benefits

- no frontend integration layer
- independent deployment
- clear boundaries
- simpler architecture

## Mental model

The shell is a container.

Each service plugs its UI into it.
