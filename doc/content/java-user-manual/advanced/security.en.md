---
title: "Security"
weight: 7
aliases:
  - /java-user-manual/security/
---

# Security

Mateu provides two security annotations: `@KeycloakSecured` for authentication and `@EyesOnly` for authorization.

---

## Authentication with @KeycloakSecured

Annotate your `@UI` class to require Keycloak login before the application loads:

```java
@UI("")
@KeycloakSecured(
        url = "https://auth.example.com/auth",
        realm = "my-realm",
        clientId = "my-client"
)
public class App {
    @Menu Products products;
    @Menu Orders orders;
}
```

| Parameter | Description |
|---|---|
| `url` | Base URL of your Keycloak server |
| `realm` | Keycloak realm name |
| `clientId` | OAuth2 client ID registered in Keycloak |
| `jsUrl` | Optional: custom URL for the Keycloak JS adapter (defaults to `{url}/js/keycloak.js`) |

When the application loads, unauthenticated users are redirected to the Keycloak login page. After login, the browser receives a JWT Bearer token.

---

## Authorization with @EyesOnly

`@EyesOnly` hides menu items, fields, or whole pages from users who do not have the required roles, groups, scopes, or permissions.

```java
public class App {
    @Menu
    Products products;     // visible to all authenticated users

    @Menu
    @EyesOnly(roles = "admin")
    AdminPanel admin;      // only visible to users with the "admin" role

    @Menu
    @EyesOnly(roles = {"editor", "admin"})
    CmsPages pages;        // visible to "editor" OR "admin"
}
```

`@EyesOnly` can be applied to:
- `@Menu` fields — hides the menu entry
- `@Menu` methods — hides the menu entry
- Classes (types) — hides the whole page/orchestrator

---

## How authorization works

Mateu reads the JWT Bearer token from the `Authorization` request header. It decodes the payload (without a signature check — this is expected to happen at the gateway) and checks:

| `@EyesOnly` attribute | JWT claim checked |
|---|---|
| `roles` | `realm_access.roles` (Keycloak realm roles) |
| `scopes` | `scope` claim (space-separated list) |
| `groups` | *(reserved for future use)* |
| `permissions` | *(reserved for future use)* |

If any required condition fails, the element is hidden from the response. The user never sees the menu entry.

---

## Multiple conditions

All specified attributes must be satisfied (AND logic):

```java
@EyesOnly(roles = "admin", scopes = "write")
```

Multiple values within a single attribute are OR logic:

```java
@EyesOnly(roles = {"admin", "superuser"})   // user must have "admin" OR "superuser"
```

---

## Typical setup

In a distributed system where an API gateway (Nginx, Envoy, etc.) validates the JWT and injects the decoded claims:

```
Browser → API Gateway (validates JWT) → Mateu backend (reads claims from Bearer token)
```

Mateu trusts the token but does not re-validate the signature. The gateway is responsible for signature verification and token expiry.

---

## Securing individual fields (declarative API)

`@EyesOnly` on fields hides them from the form and listing:

```java
public record User(
        String id,
        String name,
        @EyesOnly(roles = "admin") String internalNote
) {}
```

Users without the `admin` role see the `id` and `name` fields but not `internalNote`.

---

## Reading the current user in actions

Inside action handlers, read the JWT claims from the `Authorization` header:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    String authHeader = httpRequest.getHeaderValue("Authorization");
    // parse the Bearer token to extract user identity
    return null;
}
```

For common cases, the gateway can inject identity headers (`X-User-Id`, `X-User-Email`) that you read directly.

---

## Next

- [Navigation and menus](/java-user-manual/build/navigation-and-menus/)
- [Domain models](/java-user-manual/build/domain-models/)
- [Advanced rules](/java-user-manual/advanced/rules/)
