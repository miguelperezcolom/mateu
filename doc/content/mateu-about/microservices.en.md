---
title: "Mateu in microservices"
weight: 25
---

# Mateu in microservices

Mateu works naturally in distributed architectures.

## Architecture pattern

- one shell application
- multiple backend services
- each service exposes its own UI
- shell composes them via RemoteMenu

## Example

```java
RemoteMenu users = new RemoteMenu("/_users");
```

## Responsibilities

Shell:

- auth
- branding
- navigation

Services:

- UI definition
- business logic
- CRUDs and workflows

## Why this matters

No duplicated frontend.

No integration layer.

Each service owns its UI.

## Result

- clearer ownership
- simpler system
- better scalability
