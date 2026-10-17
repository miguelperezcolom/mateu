---
title: "Security"
---

Mateu does not authenticate: **identity comes from your host framework** (Spring Security, Quarkus
OIDC, Micronaut Security, MicroProfile JWT, ASP.NET Core authentication, your FastAPI dependency) or
from a `PrincipalResolver` bean — see [How authorization works](#how-authorization-works). On top of
that identity, `@EyesOnly` (and `@ReadOnlyUnless` / `@DisabledUnless`) drive what each user sees —
declaratively, with no filter chains or interceptors in your UI code.

---

## `@KeycloakSecured` (deprecated)

:::caution[Deprecated in 3.0-alpha.412]
`@KeycloakSecured` keeps working, but it is deprecated: logging the user in is your framework's job,
not the UI's. Configure an OIDC login / resource server for Keycloak in your framework (below, under
[Wiring each framework](#wiring-each-framework)) and, for an identity Mateu cannot see by itself,
register a `PrincipalResolver`.
:::

`@KeycloakSecured` is a type-level annotation. Applied to your `@UI` class, the generated index page logs the user in against Keycloak before the application loads:

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
> authorizer. See [Permissions in YAML](/define/yaml/permissions/).

## How authorization works

**Mateu does not authenticate.** Configure your framework's security — a Spring Security resource
server, Quarkus OIDC, Micronaut Security, MicroProfile JWT on Helidon, ASP.NET Core
authentication, your FastAPI dependency — and Mateu reads the principal it authenticated. Every
restricted element asks *who is the caller?* and gets its answer, first match wins, from:

1. a **`PrincipalResolver`** bean your application registers (`io.mateu.uidl.security`) — for an
   identity Mateu cannot see by itself (a session, headers set by a gateway that authenticated the
   request and is the only way in);
2. the **principal your framework authenticated**: Spring Security's `Authentication` (servlet and
   WebFlux — its token claims and its authorities: `ROLE_x` → role `x`, `SCOPE_x` → scope `x`,
   anything else → role and permission), Quarkus' `SecurityIdentity`, Micronaut Security's
   `Authentication`, the JAX-RS `SecurityContext` principal on Helidon MP (a MicroProfile
   `JsonWebToken`: its groups are roles);
3. otherwise the caller is **anonymous**: every `@EyesOnly`, `@ReadOnlyUnless`, `@DisabledUnless`
   and YAML `access:` element is hidden or denied.

Mateu never decodes the `Authorization` header itself: a token's payload is the client's to write,
so on its own it grants nothing. When no security module is on the classpath (and no
`PrincipalResolver` is registered) the server logs one WARN at startup saying restricted UI will be
hidden for everyone.

### Wiring each framework

**Spring Boot (MVC or WebFlux)** — a resource server validating your identity provider's tokens:

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://idp.example.com/realms/acme
```

To read Keycloak's `realm_access.roles`, Mateu also reads the authenticated token's claims, so no
authorities converter is needed.

**CSRF.** Spring Security turns CSRF protection on for every `POST`. Mateu's adapters contribute an
exemption for **its own JSON calls** (`<baseUrl>/mateu/v3/**` and `/mateu/mcp` with
`Content-Type: application/json`, plus the development endpoints `/mateu/dev/**`, served only with
`mateu.dev=true`), applied to every `SecurityFilterChain` you build from the
injected `HttpSecurity` / `ServerHttpSecurity` — nothing to configure, form login and session
cookies included. Your own endpoints, and any form-encoded, multipart or `text/plain` request to a
Mateu path, keep the CSRF check. It is safe because a cross-site page can only make the browser send
those three content types without asking first: a JSON `POST` from another origin needs a CORS
preflight, and Mateu's CORS is off unless you list the origins (`mateu.cors.allowed-origins`). Turn
the exemption off with `mateu.security.csrf-exemption.enabled=false` — and then exempt the Mateu
paths yourself, or every action answers 403 ("You are not allowed to do this."):

```java
@Bean
SecurityFilterChain security(HttpSecurity http) throws Exception {
  return http
      .csrf(csrf -> csrf.ignoringRequestMatchers(
          MateuCsrfAutoConfiguration.MATEU_JSON_CALLS)) // io.mateu.security
      .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
      .authorizeHttpRequests(a -> a.anyRequest().authenticated())
      .build();
}
```

(WebFlux: `csrf.requireCsrfProtectionMatcher(MateuCsrfWebFluxAutoConfiguration.CSRF_PROTECTED)`.)
The automatic exemption relies on Spring Security 7's top-level customizer beans; on an older
Spring Security, add the line above.

**Quarkus** — `quarkus-oidc` (or `quarkus-smallrye-jwt`):

```properties
quarkus.oidc.auth-server-url=https://idp.example.com/realms/acme
quarkus.oidc.client-id=my-app
```

**Micronaut** — `micronaut-security-jwt`:

```yaml
micronaut:
  security:
    token:
      jwt:
        signatures:
          jwks:
            idp:
              url: https://idp.example.com/realms/acme/protocol/openid-connect/certs
```

**Helidon MP** — `helidon-microprofile-jwt-auth`, with `@LoginConfig(authMethod = "MP-JWT")` on
your JAX-RS `Application` and `mp.jwt.verify.publickey.location` /
`mp.jwt.verify.issuer` in `microprofile-config.properties`. (Mateu's streamed actions, MCP and YAML
mounts run on Helidon's own routing, which does not carry the JAX-RS principal: register a
`PrincipalResolver` if those need roles.)

**CSRF on Quarkus, Micronaut and Helidon MP.** None of them adds CSRF protection to JSON requests
by default, so Mateu needs nothing there. If you add a CSRF filter that checks every `POST`, exempt
`application/json` requests to `<baseUrl>/mateu/v3/**` and `/mateu/mcp` the same way
(`io.mateu.core.infra.security.CsrfExemption.isMateuJsonCall(path, contentType)` is the rule).

**Your own identity source** — a `PrincipalResolver` bean:

```java
@Component
public class GatewayPrincipalResolver implements PrincipalResolver {
  @Override
  public Optional<CallerIdentity> resolve(HttpRequest request) {
    var user = request.getHeaderValue("X-Authenticated-User"); // set by YOUR gateway, the only way in
    var roles = request.getHeaderValue("X-Authenticated-Roles");
    return user == null
        ? Optional.empty()
        : Optional.of(CallerIdentity.withRoles(user, roles == null ? List.of() : List.of(roles.split(","))));
  }
}
```

The C# and Python backends follow the same rule: .NET reads only `HttpContext.User` — what ASP.NET
Core's authentication (`AddAuthentication().AddJwtBearer(...)`, cookies…) established — and Python
reads the `Identity` your FastAPI dependency or middleware put in `request.state.mateu_identity`
(`identity_from_claims(claims)` maps a verified token's claims), else Starlette's
`AuthenticationMiddleware`.

Before 3.0 beta, Mateu read the roles from the Bearer token's payload without verifying it; see
[Migrating from alpha](/reference/migrating-from-alpha/#defaults-that-changed).

A field `@EyesOnly` hides is also left out of the component's state: its value never reaches a
caller who may not see it.

Authorization is **provider-agnostic** — it works with Keycloak, Okta, Azure AD, Auth0 or any OIDC
issuer. From the claims of the authenticated token, each dimension is read from the conventional
claim shapes:

| `@EyesOnly` attribute | JWT claim(s) checked |
|---|---|
| `roles` | `realm_access.roles` + `resource_access.*.roles` (Keycloak) **and** a top-level `roles` claim (Okta / Azure AD / generic OIDC) |
| `groups` | `groups` claim (Okta / Azure AD) |
| `scopes` | `scope` (space-separated) or `scp` (Azure AD) claim |
| `permissions` | `permissions` claim (Auth0) |

If any required condition is not met, the element is omitted from the response. The user never sees the menu entry or page.

> `@KeycloakSecured` only configures the (Keycloak) login flow in the browser. The backend still has to authenticate the token it sends — configure your framework's security as above.

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

- a method marked `@Action`, `@Button`, `@Toolbar`, `@ListToolbarButton`, `@ViewToolbarButton`, `@Fab`, `@GroupAction`, `@WizardCompletionAction`, `@RestAction` or `@Menu` (any visibility but `private`, directly or through a composed annotation);
- a method whose id the view itself **advertises** — writes as a string literal in its own code (a `confirmActionId("doArchive")` of the dialog one of its actions returns, a `Button.builder().actionId("go")`), or names in one of its declarations: a component it holds or supplies (a fluent `Button`, a `MetricCard`, a map marker, an `EntityHeader` fact, a toolbar or header button, a menu `Rule` leaf, an `AppHeaderAction`), its triggers and subscriptions (`@Trigger`, `@SubscribeTo`, a `TriggersSupplier`), `@OnRowSelected`, `@AutoSave`, `@AppShortcut`, a `@Section` affordance (`addAction`/`editAction`/`viewMoreAction`), its `ActionSupplier` list, or the YAML layout bound to it. The method must not be plumbing: not a getter/setter, not `toString`/`equals`/…, not a framework callback such as `search` or `handleAction`;
- an id a `ComponentAdapter` declares in its `AdaptedView`;
- a field marked as an action, or holding a function (`Runnable`, `Callable`, `Supplier`, `Function`, `Consumer`).

**Writes.** A save takes from the posted state only what the form let the user change. On a CRUD
edit, the record saved is the one the route names: its id, and every field the editor showed
read-only for this request (`@ReadOnly`, `@EditableOnlyWhenCreating`, a `ReadOnlySupplier`, a
`@ReadOnlyUnless` the caller does not satisfy) or did not show (`@HiddenInEditor`), keep the
values of the loaded record whatever the request carries; on a create, the fields the creation
form showed read-only or hid (`@HiddenInCreate`) keep the values of a fresh creation form (a
`@GeneratedValue` stays the one generated for the form). `@EyesOnly` / `@ReadOnlyUnless` fields are
never written from the wire on any view. The optimistic-lock `@Version` is the client's copy on
purpose — the save compares it.

`private` methods, fields that are not actions, and injected dependencies are never reachable. `@EyesOnly` and `@DisabledUnless` on an action are enforced **when it is invoked**, not only when the button is drawn; a refused action answers HTTP 403, and so does an `actionId` that names nothing at all (a CRUD included): one WARN line, no stack trace.

### Strict action mode (`mateu.actions.strict`) — the default

**The threat.** An `actionId` is a string the client sends, and anyone can send any string — not
just the ids of the buttons on screen. Under the old convention *every* public method of a view
model was an action, so a view model that grew a public method never meant to be a button — a
helper, a `recalculatePrices()`, a `deleteDraftsOlderThan(...)` called by another action — exposed
it to every user who could open that view, whether or not a button for it was drawn.

**The mode.** Since 3.0-alpha.426 strict mode is **on by default**: an action is what is
*declared* as one — marked, or advertised by the view (the list above). A public method nobody
marked and nothing on the view names answers HTTP 403. What needs a marker is an id only a previous
*response* named — an undo toast's action (`Message.undoable(…, "restore", …)`), a method only
another backend or a test dispatches: mark it `@Action` (it adds nothing to the screen). Row actions
(`action-on-row-<method>`) must be marked too (`@ListToolbarButton`, `@Action`…): the old inference
"a method taking the clicked row is a row action" is off.

`mateu.actions.strict=false` (in `application.properties`, as a JVM system property, or
`MATEU_ACTIONS_STRICT=false`) brings back the old convention, for an app that has not been
migrated yet. Strict is the recommended setting for anything exposed to the internet.

**The .NET and Python backends are always strict**, with the same rule: their action resolution
(`ActionGuard` / `action_guard`) only reaches a method that is marked (`[Action]`/`[Button]`/`[Fab]`,
`@action`/`@button`/`@fab`) or whose id the view itself advertises (its component tree,
`OnRowSelected`, `SubscribeTo`, rule and header-action ids) — there is no switch for them.

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

In development, `mateu.errors.detailed=true` (`application.properties`, a system property, or `MATEU_ERRORS_DETAILED=true`)
puts the raw exception class and message back in the toast. The .NET (`Mateu.Uidl.UserFacingException`,
`System.ComponentModel.DataAnnotations.ValidationException`) and Python (`mateu_uidl.UserFacingException`,
pydantic `ValidationError`) backends apply the same boundary with the same texts — and an exception
there is now a toast instead of a framework HTTP 500.

**Data is not a template.** Texts the renderers show (titles, labels, texts, KPIs) may contain `${state.x}` expressions, which come from the definition. Values are data and are never evaluated: put them in the state and reference them, or escape a value you concatenate into such a text with `Templates.literal(value)`. HTML that a renderer shows (a `Text`, a header, an html column) is sanitized: scripts and inline event handlers (`onclick=…`) are removed — trigger behaviour with actions, not inline JavaScript.

---

## Typical deployment setup

An API gateway (Nginx, Envoy, Kong, etc.) may validate the token at the edge, but Mateu does not
trust a token just because a request reached it — a backend is often reachable by more than one
path. Configure your framework's security on the backend too:

```
Browser → API Gateway (validates JWT signature + expiry)
        → Mateu backend (the framework's resource server authenticates the token;
                         Mateu enforces @EyesOnly on the principal it established)
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

### Which origins receive it

The token, the `X-Session-Id` and the `@AppContext` values go only to origins trusted with them:

- the page's own origin, and the base url of the top-level `<mateu-ui>` (the host page wrote it);
- the remotes **your** app names in its menu (`RemoteMenu`) — your app chose them, just as
  `mateu.remote.allowed-hosts` does for the server's own calls;
- the origins you list yourself:

```html
<meta name="mateu-credential-origins" content="https://forms.example.com, https://api.example.com">
```

or `configureCredentialOrigins(['https://forms.example.com'])` (from `mateu`) before the UI boots.

A remote cannot hand out your credentials: the remotes **it** names, and a `MicroFrontend` island
on an origin not listed above, are called without them (a public remote still works). List such an
origin explicitly when it needs the user's identity. A lost-session redirect (the 302 to a login
page) is followed only for a trusted backend and only to an `http(s)` URL. The Redwood renderer
applies the same rule to the token it reads from storage.

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
- The Vaadin renderer's page has **no inline script**: its theme script is a file
  (`/assets/mateu-theme.js`) and the module bundle is external, so `script-src 'self'` is enough.
- Two pages do carry inline scripts, and then `script-src` must allow them by hash (or by nonce):
  a `@KeycloakSecured` UI (the token bootstrap, which embeds the Keycloak url/realm/client) and a
  page served by the Redwood renderer (Oracle Visual Builder's boot, plus Mateu's replayer of it).
  Their hashes are stable for a given configuration; compute them from the page Mateu serves with
  `IndexPage.inlineScriptHashes(html)` (core, `io.mateu.core.infra`) and put them in your header:

  ```java
  // e.g. once, at startup, from the page your mount serves
  String page = IndexPage.render(MyIndexController.class, "/static/_index.html", spec);
  String scriptSrc = "script-src 'self' " + String.join(" ", IndexPage.inlineScriptHashes(page));
  ```

  A filter that issues a per-request **nonce** works too: add `nonce="…"` to every inline
  `<script>` of the page and `'nonce-…'` to `script-src`. Redwood additionally loads JET and the
  Visual Builder runtime from Oracle's CDN: add that origin to `script-src`/`style-src`.

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
