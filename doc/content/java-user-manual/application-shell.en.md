---
title: "Application shell in Mateu"
weight: 8
---

# Application shell in Mateu

Mateu does not just generate UI components.

It also defines the **application shell**:

- navigation structure
- navigation presentation
- branding
- global layout
- security

---

## Navigation structure

Defined using `@Menu`.

```java
@Menu
Users users;
```

---

## Navigation presentation

Inferred automatically from menu structure.

Override with `@App`.

```java
@App(AppVariant.MENU_ON_LEFT)
```

---

## Branding

You can define branding elements:

```java
@Logo("/images/logo.png")
@FavIcon("/images/favicon.png")
@Title("My App")
```

---

## Page title

```java
@PageTitle("Users")
```

---

## Security

Mateu allows you to secure your UI declaratively.

Example:

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

This secures the application using Keycloak.

### Fine-grained security

You can also restrict access to specific parts of the UI.

```java
@EyesOnly(roles = "admin")
@Menu
RemoteMenu users;
```

You can use roles or scopes to control visibility and access.

---

## Layout

Use `@Style` and layout annotations to control global layout.

```java
@Style("max-width:900px;margin:auto;")
```

---

## Mental model

The application shell is not configured separately.

It is derived from your model:

- menus → structure
- `@App` → presentation
- annotations → branding and behavior
- `@KeycloakSecured` → authentication
- `@EyesOnly` → authorization

---

## Summary

Mateu defines the full application shell declaratively.

You don’t configure it separately.

You define it as part of your application model.
