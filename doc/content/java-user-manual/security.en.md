---
title: "Security"
weight: 12
---

# Security

Mateu lets you secure your UI declaratively.

## Application security

```java
@UI("")
@KeycloakSecured(
  url = "https://auth-server",
  realm = "realm",
  clientId = "client"
)
public class App {}
```

## Authorization

```java
@EyesOnly(roles = "admin")
@Menu
Users users;
```

## Mental model

Security is part of your model:
- authentication → `@KeycloakSecured`
- authorization → `@EyesOnly`
