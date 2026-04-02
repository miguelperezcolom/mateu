---
title: "Mateu in microservices"
weight: 25
---

# Mateu in microservices

Mateu works naturally in distributed architectures.

Instead of building a separate frontend, each service can expose its own UI using Mateu.

## What this looks like

- each service exposes its own UI routes
- each service owns its own screens
- services communicate via backend protocols (e.g. gRPC)
- UI is composed across services

## Real example

```java
@UI("/_users")
@Title("Users")
public class UsersHome {

    @Menu
    UsersMenu users;
}
```

## Why this matters

UI stays close to business logic.

No duplication. No glue layer.

## Result

- clearer ownership
- simpler architecture
- better fit for microservices
