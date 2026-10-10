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

> **YAML-authored apps** express the same restrictions as data — `access:` on routes, menu items
> and actions; `eyesOnly`/`readOnlyUnless`/`disabledUnless` on components — evaluated by the same
> authorizer. See [Permissions in YAML](/java-ui-definition/yaml-security/).

## How authorization works

Every restricted element asks one question: *who is the caller?* Mateu answers it **only from a
trusted source** — never from the unverified payload of a token, which anyone can write. The
sources, first match wins:

1. a **`PrincipalResolver`** bean your application registers (`io.mateu.uidl.security`) — for an
   identity Mateu cannot see by itself (a session, a header set by a gateway you trust);
2. the **principal your framework authenticated**: Spring Security's `Authentication` (servlet and
   WebFlux), a Micronaut Security `Authentication`, Quarkus' `SecurityIdentity` (quarkus-oidc,
   smallrye-jwt), the JAX-RS `SecurityContext` principal on Helidon MP (MicroProfile JWT);
3. the **Bearer token, verified**: by a `TokenVerifier` bean, or by Mateu's built-in JWT verifier
   when it is configured (below). A token whose signature, expiry (`exp` is required), `nbf`,
   issuer or audience does not check out is no identity at all;
4. otherwise the caller is **anonymous**: every `@EyesOnly`, `@ReadOnlyUnless`, `@DisabledUnless`
   and YAML `access:` element is hidden or denied.

### Configuring the built-in JWT verifier

```properties
# RS256/384/512, ES256/384/512 — keys fetched from the identity provider and cached
mateu.security.jwt.jwks-uri=https://idp.example.com/realms/acme/protocol/openid-connect/certs
# recommended
mateu.security.jwt.issuer=https://idp.example.com/realms/acme
# optional
mateu.security.jwt.audience=my-app
# the default
mateu.security.jwt.clock-skew-seconds=30

# HS256/384/512 with a shared secret — development and tests
mateu.security.jwt.secret=change-me-to-at-least-32-random-bytes
```

The keys are read from the framework's configuration (`application.properties`/`.yml` on Spring and
Micronaut, MicroProfile Config on Quarkus and Helidon), a JVM system property, or the environment
(`MATEU_SECURITY_JWT_JWKS_URI`, …). The algorithm is never chosen by the token alone: HMAC tokens
are accepted only with a `secret`, RSA/ECDSA ones only with a `jwks-uri` — so `alg: none` and the
RS→HS confusion attack get nowhere.

If your framework already authenticates the request — e.g. a Spring Boot resource server
(`spring-boot-starter-oauth2-resource-server` + `spring.security.oauth2.resourceserver.jwt.*`) — you
need none of this: Mateu reads the verified `Authentication` (its token claims and its authorities:
`ROLE_x` → role `x`, `SCOPE_x` → scope `x`, anything else → role and permission).

### The default, and the development opt-out

With **no** verifier configured and no authenticated principal, a Bearer token is **ignored**:
restricted UI stays hidden for everyone, and the server logs a WARN box at startup saying so. For a
local experiment with hand-written tokens only:

```properties
# NEVER in a deployed profile
mateu.security.trust-unverified-tokens=true
```

which reads the claims unverified and logs a WARN box at startup. Before 3.0 beta this was the
behaviour by default; see [Migrating from alpha](/reference/migrating-from-alpha/#defaults-that-changed).

The C# and Python backends follow the same rule: .NET reads only the claims of
`HttpContext.User` — what ASP.NET Core's authentication (JwtBearer, cookies…) verified — and never
decodes the header itself; Python's default `jwt_identity_provider()` uses the principal
Starlette's `AuthenticationMiddleware` authenticated, else verifies the token against
`MATEU_SECURITY_JWT_JWKS_URI` / `MATEU_SECURITY_JWT_SECRET` (+ `_ISSUER`, `_AUDIENCE`), and
ignores it otherwise (`MATEU_SECURITY_TRUST_UNVERIFIED_TOKENS=true` is the same dev-only opt-out).

A field `@EyesOnly` hides is also left out of the component's state: its value never reaches a
caller who may not see it.

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

## What a request can reach

The browser is untrusted, so the server decides what a request may touch — never the request.

**Server-side types.** Every request names the view it talks to (`serverSideType`). Mateu only resolves types the application exposes:

- registered ones: `@UI` classes, `viewModel`s of `routes.yaml` / a `RouteEntrySupplier`, the `modelView` of the route's YAML page, types a `ComponentAdapter` is registered for;
- types reachable from those: nested views (fields), rows of cruds and listings, what an annotated method returns, member classes;
- types this server itself sent to the browser (a view an action returned);
- classes shaped like a view model: they carry Mateu annotations, implement a view interface (`Listing`, `ComponentTreeSupplier`, …) or extend a Mateu orchestrator.

Anything else — a library class, a service or repository bean, an interface — is answered with **HTTP 403** and logged. A type annotated with `@EyesOnly` is refused to callers who do not satisfy it.

**Actions.** An `actionId` only runs a method that is an action:

- a method marked `@Action`, `@Button`, `@Toolbar`, `@ListToolbarButton`, `@ViewToolbarButton`, `@Fab`, `@GroupAction`, `@WizardCompletionAction` or `@RestAction` (any visibility but `private`);
- a `public` method of the view itself — not a getter/setter, not `toString`/`equals`/…, not a framework callback such as `search` or `handleAction`;
- a row action: a method that receives the clicked row or the selected rows (`ColumnAction("retry")` → `retry(Row row)`);
- an id a `ComponentAdapter` declares in its `AdaptedView`.

`private` methods, fields that are not actions, and injected dependencies are never reachable. `@EyesOnly` and `@DisabledUnless` on an action are enforced **when it is invoked**, not only when the button is drawn; a refused action answers HTTP 403.

### Strict action mode (`mateu.actions.strict`)

**The threat.** An `actionId` is a string the client sends, and anyone can send any string — not
just the ids of the buttons on screen. With the default convention, *every* public method of a view
model is an action. That is convenient (a fluent `Button` can name a method without annotating it),
and the framework already excludes accessors, `Object`/framework callbacks, lifecycle methods,
statics and anything outside the view's own code. But a view model that grows a public method that
was never meant to be a button — a helper, a `recalculatePrices()`, a `deleteDraftsOlderThan(...)`
called by another action — exposes it to every user who can open that view, whether or not a button
for it is drawn. Visibility rules (`@EyesOnly`, `@DisabledUnless`) protect it only if they were put
on that method too. Likewise a non-public method that takes a row (`retry(Row row)`) is inferred to
be a row action.

**The mode.** Set `mateu.actions.strict=true` (JVM system property, or `MATEU_ACTIONS_STRICT=true`)
and an action is only what is *declared* as one:

- a method carrying an action marker — `@Action`, `@Button`, `@Toolbar`, `@ListToolbarButton`,
  `@ViewToolbarButton`, `@Fab`, `@GroupAction`, `@WizardCompletionAction`, `@RestAction`, `@Menu`
  (directly or through a composed annotation);
- an id a `ComponentAdapter` declares in its `AdaptedView`;
- a field marked as an action, or holding a function (`Runnable`, `Callable`, `Supplier`,
  `Function`, `Consumer`) — a field of that type is already a deliberate UI declaration.

Unmarked public methods and inferred row actions answer HTTP 403. Before turning it on, mark the
methods your fluent buttons, `ColumnAction`s and `@SubscribeTo`/`@OnRowSelected` handlers name with
`@Action` (it adds nothing else to the screen). The default is `false` for now so existing apps keep
working; strict is the recommended setting for anything exposed to the internet, and it is expected
to become the default in a later release.

**The .NET and Python backends are always strict.** Their action resolution (`ActionGuard` /
`action_guard`) only reaches a method that is marked (`[Action]`/`[Button]`/`[Fab]`,
`@action`/`@button`/`@fab`) or whose id the view itself advertises (its component tree,
`OnRowSelected`, `SubscribeTo`, rule and header-action ids) — there is no "public methods are
actions" convention to switch off.

**Errors do not leak.** When an action throws, the user sees one of three things:

| What was thrown | What the toast shows |
|---|---|
| `io.mateu.uidl.UserFacingException` (anywhere in the cause chain) | its title (default "Error") and message, as written |
| a Bean Validation `ConstraintViolationException` | "Validation error" and the constraint messages |
| anything else | "Something went wrong — An unexpected error occurred. Reference: `3f9c1a0b7d42`" |

In the last case the exception — class, message and stack trace — is logged at `ERROR` under that
same reference, so a user reporting it gives support the exact log line. An exception's message is
written for developers and routinely carries what a user must not see (SQL, file paths, hostnames,
another customer's data); it used to go straight into the toast. Throw a `UserFacingException` for
the messages that ARE for the user:

```java
@Action
void reserve() {
  if (stock < quantity) {
    throw new UserFacingException("Not enough stock", "Only " + stock + " units left.");
  }
}
```

In development, `mateu.errors.detailed=true` (system property, or `MATEU_ERRORS_DETAILED=true`)
puts the raw exception class and message back in the toast. The .NET (`Mateu.Uidl.UserFacingException`,
`System.ComponentModel.DataAnnotations.ValidationException`) and Python (`mateu_uidl.UserFacingException`,
pydantic `ValidationError`) backends apply the same boundary with the same texts — and an exception
there is now a toast instead of a framework HTTP 500.

**Data is not a template.** Texts the renderers show (titles, labels, texts, KPIs) may contain `${state.x}` expressions, which come from the definition. Values are data and are never evaluated: put them in the state and reference them, or escape a value you concatenate into such a text with `Templates.literal(value)`. HTML that a renderer shows (a `Text`, a header, an html column) is sanitized: scripts and inline event handlers (`onclick=…`) are removed — trigger behaviour with actions, not inline JavaScript.

---

## Typical deployment setup

An API gateway (Nginx, Envoy, Kong, etc.) may validate the token at the edge, but Mateu does not
trust a token just because a request reached it — a backend is often reachable by more than one
path. Configure the verifier (or your framework's resource server) on the backend too:

```
Browser → API Gateway (validates JWT signature + expiry)
        → Mateu backend (verifies the token — jwks-uri or the framework's resource server —
                         then enforces @EyesOnly on its claims)
```

If the gateway injects identity headers (`X-User-Id`, `X-User-Roles`) and the backend is reachable
ONLY through it, a `PrincipalResolver` bean can turn them into the caller's identity.

---

## Caching and compression of the frontend assets

Spring Security's default headers put `Cache-Control: no-cache, no-store, max-age=0, must-revalidate` on every response that has no cache policy of its own — static files included. Left at that, a browser downloads the whole renderer (≈900 KB for the Vaadin bundle, ≈780 KB for Redwood's app bundle, uncompressed) on every page load.

Every Java adapter therefore serves Mateu's assets with a policy (Spring Security's writer leaves it alone; Micronaut, Quarkus and Helidon MP set it with a response filter):

| Path | `Cache-Control` | Why |
|---|---|---|
| `/version_<n>/**` (Redwood) | `max-age=31536000, public, immutable` | the build stamps a new number into the path whenever the bundle changes |
| `/assets/**`, `/js/**`, `/myassets/**` (Vaadin bundle, keycloak.min.js…) | `no-cache` + weak `ETag` + `Last-Modified` | stable names: the browser keeps them and gets a `304` while they are unchanged |

On Spring they resolve from the same locations as Spring Boot's static handler (`spring.web.resources.static-locations`). Turn the policy off with `mateu.static-assets.caching=false`. The bootstrap page itself is generated per request and keeps whatever your security configuration sets.

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

Inside action handlers, ask your framework for the authenticated user, or read the principal it
put on the request:

```java
@Override
public Object handleAction(String actionId, HttpRequest httpRequest) {
    java.security.Principal user = httpRequest.getUserPrincipal(); // null when nobody is authenticated
    return null;
}
```

Never take authorization decisions from a value you decoded from the `Authorization` header
yourself — it is the client's to write.

---

## Where the browser keeps the Bearer token

Every request the web client sends carries `Authorization: Bearer <token>` when a token is
available. The bootstrap (the Keycloak adapter `@KeycloakSecured` injects, your own login page, an
`onSessionExpired` handler) leaves it and Mateu reads it on each request. Where it lives is a
security trade-off, so it is configurable:

| Storage | Survives a reload | Shared by tabs | Readable by a script injected into the page |
|---|---|---|---|
| `localStorage` (default) | yes | yes | yes |
| `sessionStorage` | yes (same tab) | no | yes |
| `memory` | no — set it again after every load | no | only while the page is open |
| a `provider` function | whatever the provider does | — | the token stays inside your OIDC library |

Declare it in the page that hosts `<mateu-ui>`:

```html
<meta name="mateu-auth-token-storage" content="sessionStorage">
```

or programmatically, before the UI boots:

```ts
import { configureAuthToken, setAuthToken } from 'mateu'

configureAuthToken({ storage: 'memory' })
setAuthToken(keycloak.token)               // after login and after each refresh
// or: configureAuthToken({ provider: () => keycloak.token })
```

The storage key is `__mateu_auth_token`. When your backend can use them, **HttpOnly session
cookies are safer than any of these**: no token is visible to scripts at all. Storage access never
throws — a browser that blocks storage (sandboxed iframe, privacy mode) just sends no token.

---

## Content Security Policy

The web renderer runs under a strict Content Security Policy — no `'unsafe-eval'`. Rules, `${…}`
expressions and conditions are evaluated by Mateu's own expression evaluator, not by `eval` or
`new Function`. A policy like this one works:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'self';
  base-uri 'self';
  object-src 'none'
```

- `style-src 'unsafe-inline'` is needed: the web components and the per-component `style`
  attributes Mateu renders are inline styles.
- `img-src data: blob:` covers uploaded/captured images and signatures, which travel as data URIs.
- Add the origins of any REST source, SSE endpoint, remote menu or federated backend to
  `connect-src`, and your identity provider to `connect-src`/`frame-src` when it uses an iframe.
- The inline theme script in the default `index.html` needs either a hash in `script-src` or
  moving to a file; the shipped bundle's own scripts are external.

**`RunJS`** — the one feature that executes arbitrary JavaScript sent by the server (a
`RunJS` rule action or an action's `js`) — is **off by default**. Enable it explicitly, and then
the page needs `'unsafe-eval'`:

```html
<meta name="mateu-allow-run-js" content="true">
```

Server-sent URLs (`NavigateTo`, action `href`s, breadcrumbs, links) are only followed when they
are `http(s)` or relative: same-origin ones in the current tab, cross-origin ones in a new tab
without an opener. `javascript:` URLs are never followed.

---

## Service-owned authorization

In a microservices deployment, each service enforces `@EyesOnly` independently. The shell forwards the JWT to the service backend, which applies its own rules. A user who lacks a role sees the menu entry removed in the service's response — not just hidden in the shell.

See [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) for how this fits into a distributed architecture.

---

## Next

- [Service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/) — how each service enforces its own authorization
- [Rules](/java-user-manual/advanced/rules/) — client-side field visibility (complement to server-side `@EyesOnly`)
- [Testing](/java-user-manual/advanced/testing/) — how to test pages that depend on authorization headers
