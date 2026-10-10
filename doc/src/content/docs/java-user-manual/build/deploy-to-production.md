---
title: "Deploy to production"
description: "Packaging, reverse proxies and paths, authentication, stateless view models, static bundles on a CDN, CSP and CORS — the checklist for running a Mateu app in production."
---

A Mateu app is an ordinary application of its framework — a Spring Boot jar, a Quarkus app, a
Micronaut or Helidon jar — that also serves the renderer's static assets and the Mateu action
endpoint. Most of production is therefore what you already do for that framework. This page covers
what is specific to Mateu.

## 1. Package

Package exactly as the framework expects; the renderer (`mateu-vaadin` or `mateu-redwood`) is a jar of static
assets on the classpath and travels inside your artifact.

| Runtime | Build | Run |
|---|---|---|
| Spring Boot (MVC / WebFlux) | `mvn package` | `java -jar target/app.jar` |
| Quarkus | `mvn package` (fast-jar) | `java -jar target/quarkus-app/quarkus-run.jar` |
| Micronaut | `mvn package` | `java -jar target/app.jar` |
| Helidon MP | `mvn package` | `java -jar target/<artifactId>.jar` (the Helidon parent drops the version from the name) |

Checks before you ship:

- **Pin `mateu.version`** to a release and keep every `io.mateu` artifact on that same version.
- The Mateu **annotation processor ran**: the jar contains one generated controller per `@UI` class
  (`*MateuController`). An app whose processor did not run boots fine and answers 404 everywhere.
- For a multi-module app, the UI modules were compiled with `mateu-annotation-processor-indexer` and are on
  the app's `annotationProcessorPaths` (see [service-owned UI modules](/java-user-manual/real-world/service-owned-ui-modules/)).
- Helidon MP: the app has a `META-INF/beans.xml` and `jersey-media-json-jackson` on the runtime
  classpath — without them every route answers 404 or the UI renders empty.

A container image needs nothing special: a JRE 21 base image and the jar. The starters in
[`starters/`](https://github.com/miguelperezcolom/mateu/tree/master/starters) are a good base.

## 2. Paths, reverse proxies and load balancers

The browser talks to two kinds of URLs:

- the **app's routes** and its **action endpoint**, under the path of the `@UI` mount:
  `@UI("/admin")` serves `/admin/**` and posts actions to `/admin/mateu/v3/…`;
- the renderer's **static assets** under `/assets/**`.

What follows from it:

- Serve the app at the **root of its host** (`https://admin.example.com/`), or give the mount the
  public path you want (`@UI("/admin")`) and route **both** `/admin/**` **and** `/assets/**` to the
  backend.
- A servlet **context path** (`server.servlet.context-path`) or a proxy that **strips a prefix** is
  not supported: the generated page references `/assets/…` from the root, so the assets 404 behind a
  prefix.
- Several Mateu apps behind one host: give each its own `@UI` path. They all load `/assets/**` from
  the same place, so they must run the **same Mateu release** — or live on separate hosts.
- Long-running actions (`LongTask`, streamed responses) use **server-sent events**: disable response
  buffering for the action endpoint on the proxy (`proxy_buffering off;` in nginx) and raise its read
  timeout above your longest task.
- Sticky sessions are **not** needed — see the next section.

## 3. Stateless view models

Mateu keeps no UI state on the server between requests: the browser sends the component state with
every action, and a routed view model is **instantiated fresh on every request**. That is what makes
any instance able to answer any request, so you can scale horizontally behind a plain load balancer.

Keep it that way:

- Do not register a view model with mutable fields as a **singleton** bean. Leave it a plain class
  (Mateu instantiates it and still injects `@Autowired`/`@Inject` fields), or make the bean
  **prototype**-scoped. A singleton view model shares one user's half-typed form with everybody.
- Keep data in your stores and services, not in static fields of a view model (the in-memory stores
  of the starters and demos are for demos).
- `AutoCrud` subclasses that only hold `final` injected services are stateless and can be singletons.

## 4. Authentication and authorization

Mateu does not authenticate users itself; it reads an identity the platform established:

- **Login**: put your identity provider in front of the app — an OIDC-aware gateway, Spring Security,
  Quarkus OIDC… — or use `@KeycloakSecured` on the `@UI` class to have the browser log in against
  Keycloak and send a Bearer token with every request.
- **Authorization**: `@EyesOnly`, `@ReadOnlyUnless` and `@DisabledUnless` read roles, groups, scopes
  and permissions from the JWT in the `Authorization` header (see [Security](/java-user-manual/advanced/security/)).
- **Verify the token before it reaches Mateu.** Mateu decodes the token's claims to decide what to
  show; it does **not** verify the signature. Validate it in the gateway or in your framework's
  security filter (Spring Security resource server, Quarkus OIDC, Micronaut Security) — otherwise a
  forged token can claim any role.
- Enforce permissions in your **services** too. Hiding a button is UX; the action method behind it
  must still check who is calling.

## 5. A static bundle on a CDN

Screens that need no server logic can ship as a **static bundle** — `mvn -Pbundle package` with the
`mateu-bundle` plugin — and be served by any CDN or object store with no Mateu backend at runtime. See
[Static bundle](/java-user-manual/build/static-bundle/) and [100% static UI](/java-user-manual/build/static-ui/).

For production:

- Serve `index.html` with **no caching** (or a short TTL) and the hashed assets with a long one
  (`Cache-Control: public, max-age=31536000, immutable`).
- Configure the host's **SPA fallback** — every unknown path answers `index.html` — so deep links
  work.
- `staticOnly` (`-Dmateu.bundle.static=true`) fails the build if a route still needs a server: turn
  it on for bundles that have no backend.
- The bundle calls your REST APIs **from the browser**: those APIs need CORS for the CDN's origin,
  and must never receive a secret the browser can read. Use a source in `proxy` mode (served through
  a Mateu backend, which injects `${secret.…}` server-side) for anything that needs a key.
- Re-pointing a bundle to another environment means editing the source catalogue in
  `manifest.json` — no rebuild of the screens.

## 6. Content Security Policy

The web renderers work under a CSP; the parts to allow:

- `script-src 'self'` plus the CDN of your identity provider's JS adapter if you use one (Keycloak).
- **No `'unsafe-eval'`**: client-side expressions — `${…}` in labels, rules, `@Disabled(expression)`,
  visibility rules — run in Mateu's own sandboxed evaluator. Only a page that opts into RunJS
  (`<meta name="mateu-allow-run-js" content="true">`) needs `'unsafe-eval'`, and only that page.
- `style-src 'self' 'unsafe-inline'` — web components set inline styles.
- `connect-src 'self'` plus every REST API your screens call directly (`@RestOptions`,
  `@RestListing`, sources in direct mode).
- The **Redwood** renderer loads Oracle JET from Oracle's CDN (`https://static.oracle.com`): allow it
  in `script-src`, `style-src`, `font-src` and `img-src`.
- `img-src data:` if you use `@UploadableImage`, `@Signature` or `@PhotoCapture` (their values are
  data URIs).

Start in `Content-Security-Policy-Report-Only` mode and tighten from the reports.

## 7. CORS

A browser only needs CORS when the page and the backend are on **different origins** — a static
bundle on a CDN calling your APIs, a renderer served separately from its backend, a micro-frontend
embedded in another product. A Mateu app served by its own backend (the normal case) needs none.

CORS is **off by default** on every adapter (Spring MVC, WebFlux, Quarkus, Micronaut, Helidon): only
same-origin pages may call the Mateu endpoints. Allow the exact origins you need:

```properties
mateu.cors.allowed-origins=https://app.example.com,https://cdn.example.com
# only if the browser must send cookies / Authorization with a credentialed request
mateu.cors.allow-credentials=true
```

`*` is refused together with credentials. On Micronaut, a server bound to localhost also refuses
non-localhost origins unless `micronaut.server.cors.localhost-pass-through=true`. .NET: configure
ASP.NET Core's CORS middleware for the Mateu endpoints; Python: `add_mateu(app, cors_origins=[...])`.

The MCP endpoint (`POST /mateu/mcp`) is likewise **off** unless `mateu.mcp.enabled=true` — turn it on
only where an agent should operate the app, behind the same authentication as the UI.

## 8. Before go-live

- [ ] `mateu.version` pinned to a release; all `io.mateu` artifacts on it
- [ ] Generated controllers present in the artifact; every menu entry loads
- [ ] Served at the host root, or `@UI` path + `/assets/**` both routed to the backend
- [ ] SSE not buffered by the proxy (if you use long-running actions)
- [ ] No singleton view model with mutable fields
- [ ] Token signatures verified before Mateu; services check permissions
- [ ] CSP set (report-only first), CORS limited to the origins you need
- [ ] Static bundle: SPA fallback, cache headers, `staticOnly` on, no secrets in direct sources
