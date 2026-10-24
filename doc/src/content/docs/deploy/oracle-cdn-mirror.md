---
title: "Serving Oracle's CDN from your own mirror"
description: "Point the Redwood renderer at a copy of Oracle's CDN your organisation hosts — for networks that cannot reach static.oracle.com, or to serve the whole runtime from your own infrastructure — with one setting."
---

The Redwood renderer (`io.mateu:mateu-redwood`) is an Oracle Visual Builder app. It loads Oracle's
runtime at run time from **Oracle's CDN**, `https://static.oracle.com/cdn`: Oracle JET, the Redwood
theme, the Spectra components (`oj-sp-*`), the Visual Builder runtime, and the gallery's images and
fonts. That is fine on the internet, but some deployments cannot or should not depend on it:

- the users' network does not reach `static.oracle.com` (an intranet, an air-gapped plant);
- security policy requires every script a page runs to come from your own hosts;
- you want to pin and cache the runtime yourself.

For those, host a **mirror** of Oracle's CDN and tell Mateu where it is:

```properties
mateu.oracle-cdn.url=https://cdn.example.com/oracle/cdn
```

The value is the URL that stands for `https://static.oracle.com/cdn` — a file at
`https://static.oracle.com/cdn/jet/18.1.0-2510.3/…` must be at
`https://cdn.example.com/oracle/cdn/jet/18.1.0-2510.3/…`. Unset, nothing changes.

## Why Mateu does not ship these files itself

Mateu's jars are Apache-2.0 and carry nothing from `static.oracle.com`. Oracle JET is open source
(UPL), but the Spectra components, the Visual Builder runtime and the gallery have **no public
redistribution licence** — see the renderer's
[NOTICE](https://github.com/miguelperezcolom/mateu/blob/master/frontend/web/monorepo/apps/redwood/NOTICE.md).
So the mirror is yours, and so is the decision to make it: Mateu only points the page at a URL.

:::caution[Check your Oracle agreement before mirroring]
Hosting a copy of Oracle's files is a licensing question for **your** organisation, not a technical
one. Oracle JET and the Redwood theme are UPL and may be mirrored freely (keep their licence files).
The Spectra components, the Visual Builder runtime and the gallery are Oracle's proprietary code with
no public redistribution licence: mirror them only if your agreement with Oracle allows you to host
them — ask your Oracle account team or your licensing department. A caching proxy you operate
(a forward proxy, not a public copy) is a different arrangement than a published mirror; it is
still worth confirming. When in doubt, leave the setting unset: the renderer keeps loading from
Oracle's CDN, exactly as an Oracle-hosted Visual Builder app does.
:::

## Setting it

| Backend | Setting |
|---|---|
| Java (every adapter) | `mateu.oracle-cdn.url` — `-Dmateu.oracle-cdn.url=…`, `MATEU_ORACLE_CDN_URL`, or the framework's configuration (`application.properties`…) |
| .NET | `MateuOptions.OracleCdnUrl`, or `MATEU_ORACLE_CDN_URL` |
| Python | `add_mateu(oracle_cdn_url=…)`, or `MATEU_ORACLE_CDN_URL` |
| Static bundle (`mateu-bundle:bundle`) | `-Dmateu.oracle-cdn.url=…` when the bundle is **built** — the published page carries the mirror |

The value must be an absolute `http(s)` URL (a trailing slash is ignored). Anything else is ignored
with one WARN at startup, and the page keeps loading from Oracle.

## What it changes

Everything Oracle-hosted the page loads goes to the mirror, and nothing to `static.oracle.com`:

- **The page** — the server rewrites, in the `index.html` it serves (every adapter, YAML mounts, the
  .NET and Python ports, static bundles), every `https://static.oracle.com/cdn` URL: the theme and the
  scripts, the runtime's configuration (`JET_CDN_PATH`), the module paths, the shell's background
  images and the preconnect hint.
- **Oracle's own files** — JET's bundle configuration and Spectra's loaders carry absolute
  `static.oracle.com` URLs of their own. Every URL RequireJS resolves (scripts, `css!`, `text!`) is
  pointed at the mirror as it is resolved, and so are the module paths Visual Builder applies from the
  app's configuration.
- **The renderer's own references** — the welcome banner's illustrations and other gallery images
  follow the same mirror.

The only setting is the URL: the renderer derives everything else from the page's runtime
configuration, so there is nothing to keep in step.

## What to mirror

The page fetches from these trees of Oracle's CDN. The exact versions are those of the Mateu release
you run, so mirror whole version folders and refresh the mirror when you upgrade Mateu:

| Tree | What it is |
|---|---|
| `jet/<version>/` (e.g. `jet/18.1.0-2510.3/`) | Oracle JET and the Redwood theme |
| `jet/packs/oj-c/`, `jet/packs/oj-dynamic/` | JET's core pack and the dynamic forms pack |
| `oars/packs/oj-oars/` | the OARS pack Spectra uses |
| `spectra-ui/oj-sp/<version>/` | the Spectra components |
| `vb/<version>/` | the Visual Builder runtime (`visual-runtime.js`, `.css`, `lib/`) |
| `fnd/gallery/<version>/` (e.g. `2604.0.2`, `2307.0.2`) | the gallery: shell background, welcome illustrations, the icon font and the Oracle font |

The mirror must answer with the right content types, and with `Access-Control-Allow-Origin` for
fonts and the files RequireJS fetches as text (any origin, or your app's).

**Check it.** `e2e/oracle-cdn-mirror-probe.mjs` acts as a forwarding mirror, opens a screen of your
app and fails if anything was fetched from `static.oracle.com` directly. It also lists the trees the
screen fetched — what your mirror needs:

```bash
java -Dmateu.oracle-cdn.url=http://localhost:9777/oracle/cdn -jar target/app.jar
cd e2e && BASE=http://localhost:8080 ROUTE=/products node oracle-cdn-mirror-probe.mjs
```

## What it does not cover

- **Leaflet and map tiles.** The `Map` component loads Leaflet from cdnjs and tiles from
  OpenStreetMap — neither is Oracle's. Point maps at your own tile server with `Map.tileUrl`.
- **The embedded component** (`<mateu-ui>` inside your own Visual Builder app) uses whatever runtime
  the host application loads, so the mirror is the host's choice there.
- **The Vaadin renderer** loads nothing from a CDN: its assets are inside its jar.
