---
title: "Application shell in Mateu"
weight: 1
aliases:
  - /java-user-manual/application-shell/
---

# Application shell in Mateu

Mateu does not just generate UI components.

It also defines the **application shell**:

- navigation structure
- navigation presentation
- branding
- global layout
- security

## Navigation structure

Defined using `@Menu`.

```java
@Menu
Users users;
```

## Navigation presentation

Override with `@App`.

```java
@App(AppVariant.MENU_ON_LEFT)
```

## Security

```java
@UI("")
@Title("Console")
@KeycloakSecured(
  url = "https://lemur-11.cloud-iam.com/auth",
  realm = "mateu",
  clientId = "demo"
)
public class ShellHome {
}
```

## Mental model

The application shell is derived from your model.
