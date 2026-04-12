---
title: "Security"
weight: 7
aliases:
  - /java-user-manual/security/
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
