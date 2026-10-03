---
title: "Security"
---

Mateu provides two security annotations: `@KeycloakSecured` for authentication and `@EyesOnly` for role-based authorization. Both are declarative — no security filter chains or interceptor configuration required.

---

## Authentication with `@KeycloakSecured`

`@KeycloakSecured` is a type-level annotation. Apply it to your `@UI` class to require Keycloak login before the application loads:

```java
@UI("")
@KeycloakSecured(
        url      = "https://auth.example.com/auth",
        realm    = "my-realm",
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

When the application loads, unauthenticated users are redirected to the Keycloak login page. After login, the browser receives a JWT Bearer token that is sent with every subsequent request.

---

## Authorization with `@EyesOnly`

`@EyesOnly` can be applied to fields, methods, and types. It hides the annotated element from any user who does not satisfy the required conditions.

```java
public class App {
    @Menu
    Products products;          // visible to all authenticated users

    @Menu
    @EyesOnly(roles = "admin")
    AdminPanel admin;           // only visible to users with the "admin" role

    @Menu
    @EyesOnly(roles = {"editor", "admin"})
    CmsPages pages;             // visible to "editor" OR "admin"
}
```

`@EyesOnly` can be applied to:
- `@Menu` fields — hides the menu entry
- `@Menu` methods — hides the menu entry
- Classes (types) — hides the whole page or orchestrator

---

## How authorization works

Mateu reads the JWT Bearer token from the `Authorization` request header. It decodes the payload and checks the claims. Signature verification is expected to happen at the API gateway before the request reaches Mateu.

Authorization is **provider-agnostic** — it works with Keycloak, Okta, Azure AD, Auth0 or any OIDC issuer, reading each dimension from the conventional claim shapes:

| `@EyesOnly` attribute | JWT claim(s) checked |
|---|---|
| `roles` | `realm_access.roles` + `resource_access.*.roles` (Keycloak) **and** a top-level `roles` claim (Okta / Azure AD / generic OIDC) |
| `groups` | `groups` claim (Okta / Azure AD) |
| `scopes` | `scope` (space-separated) or `scp` (Azure AD) claim |
| `permissions` | `permissions` claim (Auth0) |

If any required condition is not met, the element is omitted from the response. The user never sees the menu entry or page.

> `@KeycloakSecured` only configures the (Keycloak) login flow. Authorization via `@EyesOnly` is independent of the identity provider — point your gateway at any OIDC issuer and the role/group/scope/permission checks above apply unchanged.

---

## Condition logic

Multiple values within a single attribute use OR logic:

```java
@EyesOnly(roles = {"admin", "superuser"})   // user must have "admin" OR "superuser"
```

Multiple attributes use AND logic:

```java
@EyesOnly(roles = "admin", scopes = "write")  // must have "admin" AND "write"
```

---

## Securing individual fields

`@EyesOnly` on a record field hides it from both the form and the listing:

```java
public record User(
        String id,
        String name,
        @EyesOnly(roles = "admin") String internalNote
) {}
```

Users without the `admin` role see `id` and `name` but not `internalNote`.

---

## Typical deployment setup

In a distributed system, an API gateway (Nginx, Envoy, Kong, etc.) validates the JWT signature and token expiry. Mateu trusts the token but does not re-validate the signature:

```
Browser → API Gateway (validates JWT signature + expiry)
        → Mateu backend (reads claims from Bearer token, enforces @EyesOnly)
```

For common cases, the gateway can also inject identity headers (`X-User-Id`, `X-User-Email`) that action handlers read directly.

---

## Caching and compression of the frontend assets

Spring Security's default headers put `Cache-Control: no-cache, no-store, max-age=0, must-revalidate` on every response that has no cache policy of its own — static files included. Left at that, a browser downloads the whole renderer (≈900 KB for the Vaadin bundle, ≈780 KB for Redwood's app bundle, uncompressed) on every page load.

The Spring MVC and WebFlux adapters therefore serve Mateu's assets with a policy, which Spring Security's writer leaves alone:

| Path | `Cache-Control` | Why |
|---|---|---|
| `/version_<n>/**` (Redwood) | `max-age=31536000, public, immutable` | the build stamps a new number into the path whenever the bundle changes |
| `/assets/**`, `/js/**`, `/myassets/**` (Vaadin bundle, keycloak.min.js…) | `no-cache` + weak `ETag` + `Last-Modified` | stable names: the browser keeps them and gets a `304` while they are unchanged |

They resolve from the same locations as Spring Boot's static handler (`spring.web.resources.static-locations`). Turn the policy off with `mateu.static-assets.caching=false`. The bootstrap page itself is generated per request and keeps whatever your security configuration sets.

Compression is the application's (or its proxy's) choice. With Spring Boot:

```yaml
server:
  compression:
    enabled: true
    min-response-size: 1KB
    mime-types: [text/html, text/css, text/javascript, application/javascript, application/json, image/svg+xml]
```

Leave `text/event-stream` out of the list: a compressed stream is buffered, and SSE updates would arrive in lumps. Behind a gateway that every request passes through, enabling compression there once covers every backend.

---

## Reading the current user in actions

Inside action handlers, read the JWT or injected headers from the `HttpRequest`:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    String authHeader = httpRequest.getHeaderValue("Authorization");
    // parse the Bearer token to extract user identity, or read injected headers:
    String userId = httpRequest.getHeaderValue("X-User-Id");
    return null;
}
```

---

## Service-owned authorization

In a microservices deployment, each service enforces `@EyesOnly` independently. The shell forwards the JWT to the service backend, which applies its own rules. A user who lacks a role sees the menu entry removed in the service's response — not just hidden in the shell.

See [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) for how this fits into a distributed architecture.

---

## Next

- [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) — how each service enforces its own authorization
- [Rules](/java-user-manual/advanced/rules/) — client-side field visibility (complement to server-side `@EyesOnly`)
- [Testing](/java-user-manual/advanced/testing/) — how to test pages that depend on authorization headers
