---
title: "Serving the app under a path prefix"
description: "Run a Mateu app under a servlet context path, a framework base path or behind a reverse proxy that serves it at /crm/ and strips the prefix — what to set on each server and on nginx."
---

A Mateu app does not have to own the root of its host. It can run at `https://example.com/crm/`
in two ways:

- **The server itself lives under the prefix**: a servlet context path
  (`server.servlet.context-path=/crm`), a WebFlux base path, Quarkus' root path, Micronaut's context
  path, ASP.NET's `UsePathBase`, an ASGI `root_path`. The server sees `/crm/…` and answers it.
- **A reverse proxy strips the prefix**: nginx, an ingress or an API gateway serves the app at
  `/crm/` and forwards `/crm/orders/3` to the backend as `/orders/3`. The server never sees `/crm`.

Either way the page Mateu serves must name its assets, its API and its installable-app files under
`/crm`, or the browser asks the root of the host for them and the screen stays blank. You only have
to tell Mateu what the **public base** is; it writes the page for it (`<mateu-ui baseUrl="/crm/admin"
publicBase="/crm">`, `/crm/assets/…`, `/crm/admin/mateu/v3/pwa/…`) and both renderers — Vaadin and
Redwood — call `/crm/admin/mateu/v3/sync/…` from there.

Nothing else changes: the routes of your UIs (`@UI("/admin")`, `routes.yaml`) stay as they are, and
everything the server receives below the base is answered as before.

## The server lives under the prefix

Set your framework's own setting. Mateu reads it; there is nothing Mateu-specific to add.

| Server | Setting |
| --- | --- |
| Spring MVC | `server.servlet.context-path=/crm` |
| Spring WebFlux | `spring.webflux.base-path=/crm` |
| Quarkus | `quarkus.http.root-path=/crm` |
| Micronaut | `micronaut.server.context-path=/crm` |
| Helidon MP | no server-wide context path — use `mateu.public-base-path` and route the prefix on the proxy |
| ASP.NET (Mateu.NET) | `app.UsePathBase("/crm")` before `MapMateu(…)` |
| FastAPI (`mateu-ui`) | `FastAPI(root_path="/crm")` or `uvicorn --root-path /crm` |

```properties
# Spring Boot (MVC)
server.servlet.context-path=/crm
```

The app is then at `http://localhost:8080/crm/`, a UI declared `@UI("/admin")` at
`http://localhost:8080/crm/admin`, and a deep link like `/crm/admin/orders/3` opens that screen.

## A reverse proxy strips the prefix

The proxy forwards `/crm/x` as `/x`, so the server cannot tell on its own. Tell Mateu with **one** of:

- **an explicit setting** — the simplest, and the one to prefer when the prefix is fixed:

  ```properties
  mateu.public-base-path=/crm
  ```

  (`MATEU_PUBLIC_BASE_PATH=/crm` as an environment variable; .NET `MateuOptions.PublicBasePath`;
  Python `add_mateu(…, public_base_path="/crm")`.)

- **the proxy's `X-Forwarded-Prefix` header**, when one backend is reached under several prefixes.
  Mateu ignores the header unless you trust it:

  ```properties
  mateu.trust-forwarded-prefix=true
  ```

  Only switch this on when a proxy you control **always** sets (overwrites) the header: a client
  can send its own, and the page would then be written for whatever prefix it chose. On Spring you
  can also let Spring apply it (`server.forward-headers-strategy=framework`, which turns
  `X-Forwarded-Prefix` into the request's context path). On ASP.NET use the platform's own opt-in,
  `app.UseForwardedHeaders(new ForwardedHeadersOptions { ForwardedHeaders = ForwardedHeaders.XForwardedPrefix })`.
  The Python port does not read the header: use the setting or `--root-path`.

When both are present the setting wins. A framework context path is added after the proxy prefix:
a proxy at `/edge` in front of a Spring app at `/crm` is `/edge/crm`.

### nginx

```nginx
location /crm/ {
    # the trailing slash on proxy_pass strips /crm: /crm/admin/orders/3 → /admin/orders/3
    proxy_pass http://mateu-app:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    # only needed with mateu.trust-forwarded-prefix=true (instead of mateu.public-base-path)
    proxy_set_header X-Forwarded-Prefix /crm;
    # streamed actions (LongTask) are server-sent events: no buffering, a long read timeout
    proxy_buffering off;
    proxy_read_timeout 3600s;
}
```

```properties
# application.properties of the app behind it
mateu.public-base-path=/crm
```

If instead you forward the prefix (`proxy_pass http://mateu-app:8080;` with no trailing slash), the
server sees `/crm/…`: then set the framework's context path (the table above), not
`mateu.public-base-path`.

### Kubernetes ingress (ingress-nginx)

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
    - host: example.com
      http:
        paths:
          - path: /crm(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service: { name: my-mateu-app, port: { number: 8080 } }
```

with `mateu.public-base-path=/crm` (or `MATEU_PUBLIC_BASE_PATH=/crm` in the deployment).

## What follows from it

- **Root-relative paths the server names are put under the base by the renderer**: a
  `NavigateTo("/orders/3")`, a crud's inner route, the base url of another UI of the same app, a
  REST source of your own (`url: /api/products`). A full URL (`https://…`) is left alone.
- **Your own static files** referenced from a screen (an `Image` with `src: /images/logo.png`) are
  NOT rewritten: write them relative to the page or as a full URL.
- **Several Mateu apps behind one host** each under its own prefix (`/crm/`, `/billing/`) load
  their assets from their own `/crm/assets/…` and `/billing/assets/…`, so they no longer have to run
  the same Mateu release.
- **The installable app** (the PWA) is scoped to the public path, so its service worker never
  answers for another app on the host.
- **A static bundle** (`mateu-bundle:bundle`) is not concerned: it is files, served where you put
  them.
