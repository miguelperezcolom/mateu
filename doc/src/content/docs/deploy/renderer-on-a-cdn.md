---
title: Deploy a renderer to a CDN or static host
description: Upload a Mateu web renderer's files (Vaadin or Redwood) to any CDN or static host and point it at a Mateu backend — through a /mateu/* proxy on the host, or directly with one meta tag and CORS. What works through which proxy, and what to watch with streamed answers.
---

Your backend keeps serving the Mateu API (`/mateu/v3/…`), and the **page** — the renderer's
HTML, JavaScript and CSS — comes from a CDN or any static host: Netlify, S3 + CloudFront,
Cloudflare, an nginx in front of everything. Nothing is compiled or patched for it: you upload the
renderer's files as they come in its jar, and, at most, write the backend's address in **one** tag.

This is not the [static bundle](/deploy/static-bundle/): a bundle carries the screens themselves
and can run with no backend at all. Here the backend is still the one that builds every screen;
only the renderer's files move to the CDN.

## The files

Each renderer jar carries a ready site in its `static/` folder:

| Renderer | Jar | What is in `static/` |
|---|---|---|
| Vaadin | `io.mateu:mateu-vaadin` | `index.html`, `assets/`, `myassets/` |
| Redwood | `io.mateu:mateu-redwood` | `index.html`, `_redwood/` (the Visual Builder app) |

```bash
unzip -q mateu-vaadin-<version>.jar 'static/*' -d site-files
# upload site-files/static/ as the root of your site
```

- `index.html` is the **deployable page**: no template markers, aimed at the page's own origin.
- `_index.html` is the template a Mateu backend fills in for each request. The site does not need
  it (uploading it does no harm). A backend never serves `index.html`, so having the renderer on
  its classpath changes nothing there.
- Use the renderer jar of the **same Mateu version** as the backend (at least the same
  major.minor): the page and the API speak one wire version (see
  [Versions across teams](/deploy/versions-across-teams/)).
- Serve the files at the **root** of the host (`https://ui.example.com/`): the page loads
  `/assets/…` (Vaadin) and `/_redwood/…` (Redwood) from there.
- The Redwood renderer still loads Oracle JET, Spectra and the Visual Builder runtime from Oracle's
  CDN (`static.oracle.com`), as when a backend serves it. See
  [Oracle's CDN from a mirror](/deploy/oracle-cdn-mirror/) if that domain is not reachable.

### Routes on the host

- **Vaadin** uses path routes (`/products/3`). Give the host an **SPA rewrite**: every path that is
  not a file answers `index.html` (Netlify `/* /index.html 200`, nginx `try_files $uri /index.html`,
  CloudFront a custom error response, S3 website hosting the error document).
- **Redwood** uses hash routes (`/#/products/3`), so it needs no rewrite.

## Recommended: proxy `/mateu/*` to the backend

Configure the host to forward every request under `/mateu/` to the backend. The page then sees the
backend on **its own origin**: `index.html` stays as it is, there is no CORS, and cookies (a
cookie sign-in, a session) work as they do when the backend serves the page.

**Netlify** (`_redirects` at the site root; the proxy rule goes first):

```text
/mateu/*  https://api.example.com/mateu/:splat  200
/*        /index.html                           200
```

(For the Redwood renderer, the second line is optional.)

**nginx:**

```nginx
server {
  listen 443 ssl;
  server_name ui.example.com;
  root /srv/mateu-site;

  location /mateu/ {
    proxy_pass https://api.example.com;
    proxy_set_header Host api.example.com;
    proxy_http_version 1.1;
    # streamed answers (SSE): pass each event as it comes, and keep long streams open
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 1h;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

**CloudFront:** two origins (the S3 bucket or other host with the files, and the backend) and a
**cache behavior** for the path pattern `/mateu/*` aimed at the backend origin, with:

- allowed methods **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE**;
- the managed cache policy **CachingDisabled**;
- an origin request policy that forwards the viewer's headers, query string and cookies, except
  `Host` (the managed **AllViewerExceptHostHeader** policy).

**Cloudflare:** with both the site and the backend behind your zone, send `/mateu/*` to the
backend's host with an **Origin Rule** (or a small Worker that `fetch`es the backend). Cloudflare
Pages' own `_redirects` file only proxies to paths on the same site, so it cannot point at another
host. Check what your plan includes before choosing.

### What a proxy costs, and when it breaks streams

Through the proxy every call makes one more hop. One measurement, from Spain to a Cloud Run backend
in `europe-west1` with a sync call (`POST /mateu/v3/sync/products`, a fresh TLS connection each
time): direct, a median of 0.125 s; through Netlify's `/mateu/*` rewrite, a median of 0.28–0.30 s
and a p90 of 0.43 s. That is about 50 ms more at best and 150–300 ms typically. Another CDN, or an
nginx next to the backend, will give other figures, so measure yours. When latency matters, use
the direct path below.

Most of Mateu's traffic is plain request/response calls, and those work through any proxy. **Streamed
answers (Server-Sent Events, `POST /mateu/v3/sse/…`) need a proxy that passes each event on as it
arrives and keeps an idle stream open.** A short streamed answer (one event, then the end) works
through Netlify's proxy, just later. A stream that runs over time did not. In a test, an origin
sent one event every 5 s for 90 s. Direct, every event arrived on time. Through a Netlify `_redirects` 200
rewrite, none arrived. Netlify held the whole answer back and replied after 31 s with
`HTTP 504` and an "Inactivity Timeout" page (Netlify documents a 26-second limit for proxied requests).
What streams over time in Mateu:

- `LongTask` progress (`Flux` actions): behind Netlify, the progress shows nothing until the task
  ends, and a task longer than about 30 s fails;
- `@App(liveUpdates)` (live header values), record presence (`@App(presence)`) and the agent push
  channel: these streams stay open for minutes, so they fail behind Netlify.

For those, use the **direct path** below for the whole app, or a proxy that streams. nginx streams
with `proxy_buffering off` and a long `proxy_read_timeout`, as in the example above. For the others,
read their documentation before relying on it. CloudFront's origin **response timeout** (30 s by default)
also applies to the wait *between two packets* of an answer, and an optional *response completion
timeout* caps the whole answer
([CloudFront origin settings](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesOrigin.html)).
Cloudflare answers `524` when the origin does not respond within its proxy read timeout (125 s by
default; adjustable only on Enterprise)
([Error 524](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-524/)),
and its [response buffering](https://developers.cloudflare.com/network/response-buffering/) page
describes when it streams. Test a long `LongTask` through yours before you rely on it.

When a proxy answers a streamed action with a gateway error page (`502`, `503` or `504` that is not
Mateu's JSON), the Vaadin renderer says that a proxy cut the stream, instead of showing the error page's HTML.

## Alternative: name the backend in the page

When the host cannot proxy, or you want the browser to call the backend directly, write the
backend's address in the deployable page's one setting. It is already in `index.html`, empty:

```html
<meta name="mateu-backend" content="https://api.example.com">
```

- Empty or absent means the page's own origin (the proxy setup above).
- The value is the backend's base URL: an `http(s)` URL, or a path on the same origin when the UI is
  mounted below the root (`/admin`). Anything else is ignored, with a warning in the browser's
  console.
- Both renderers read the same tag at startup. It is plain HTML, so a deploy step can write it per
  environment (`sed`, a templating step, an edge rule).

The backend must then allow the site's origin, because every call is now cross-origin. Mateu's
CORS is off unless you list the origins:

```properties
mateu.cors.allowed-origins=https://ui.example.com
# or the environment variable MATEU_CORS_ALLOWED_ORIGINS
```

(.NET and Python have the same setting: see [Security](/java-user-manual/advanced/security/).)

On the direct path:

- Streamed answers go straight to the backend, so nothing in between buffers them.
- Cookies set by the backend are third-party cookies for the site's origin, and browsers increasingly
  refuse them. Use bearer tokens (a [sign-in provider](/deploy/sign-in/)) rather than a cookie
  session.

## Sign-in

When a backend serves the page, it writes the sign-in providers into it
(`<meta name="mateu-auth" …>`, see [Sign-in providers](/deploy/sign-in/)). The deployable page has
no such tag, because nothing writes it. If your app signs in through Mateu's providers on the web,
copy that tag from the page your backend serves (view the page source) into the site's `index.html`,
next to `mateu-backend`.

## The phone and desktop apps

The [Mateu app](/native/mateu-app/) (phone and desktop) works with the **site's address** when the
host proxies `/mateu/*`. Share `https://ui.example.com` (or a QR code, or
`https://mateu.io/add?u=https://ui.example.com`). The app asks `https://ui.example.com/mateu/v3/manifest`
and from then on talks to `https://ui.example.com/mateu/v3/…`, which the host forwards to the
backend. Without a proxy, give the apps the **backend's** address instead. The apps do not read the
page, only the API.

## Check it locally

The repository has a plain static server that can stand in for the CDN, and a browser check that
runs a listing, a refused save, a create and a streamed action against both setups:

```bash
# a backend with a Product CRUD at /products and a streamed «Run» at /jobs, on :8188,
# started with --mateu.cors.allowed-origins=http://localhost:9301,http://localhost:9303
node e2e/cdn-static-server.mjs --dir site-vaadin  --port 9300 --proxy   http://localhost:8188
node e2e/cdn-static-server.mjs --dir site-vaadin  --port 9301 --backend http://localhost:8188
node e2e/cdn-static-server.mjs --dir site-redwood --port 9302 --proxy   http://localhost:8188
node e2e/cdn-static-server.mjs --dir site-redwood --port 9303 --backend http://localhost:8188
node e2e/cdn-site-probe.mjs --backend http://localhost:8188 \
  --site vaadin,proxy,http://localhost:9300  --site vaadin,direct,http://localhost:9301 \
  --site redwood,proxy,http://localhost:9302 --site redwood,direct,http://localhost:9303
```

(`--backend` writes the `mateu-backend` tag into the page as it is served, which is the one edit the
direct path needs.)

## Related

- [Netlify](/deploy/netlify/): deploying a folder to Netlify, by hand or from CI.
- [Static bundle](/deploy/static-bundle/) and [A 100 % static UI](/deploy/static-ui/): the screens
  themselves as files, with no backend.
- [Production checklist](/deploy/production-checklist/): reverse proxies, CSP, CORS.
- [Under a path prefix](/deploy/under-a-path-prefix/): a backend served below `/crm/`.
