---
title: "Shell and remote menus"
---

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

### Descriptor caching

To build the navigation, the shell asks each remote for its descriptor (title, menu, home wiring). That is an HTTP round trip landing on the remote's home route, and it happens every time the shell resolves a route — the first of the two requests a user sees on every page change.

The descriptor is app-shaped, not request-shaped: it only changes when the remote is redeployed. The shell therefore caches it briefly, keyed by the remote's base URL, route **and** the caller's authorization token (a remote is free to build a menu per user, so the token is part of the key, stored as a SHA-256 digest).

| Property | Env var | Default |
| --- | --- | --- |
| `mateu.remote-menu.descriptor-ttl-ms` | `MATEU_REMOTE_MENU_DESCRIPTOR_TTL_MS` | `30000` |

The TTL bounds how long a redeployed remote's new menu takes to appear in the shell, which is why the default is 30 s and not longer. Set it to `0` to disable the cache and ask on every navigation. The system property wins over the environment variable.

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
