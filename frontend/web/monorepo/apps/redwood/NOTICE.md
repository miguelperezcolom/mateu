# NOTICE — Mateu renderer on Oracle Visual Builder / Redwood

> Spanish version: [NOTICE.es.md](NOTICE.es.md).

This directory (`frontend/web/monorepo/apps/redwood/`) holds the Mateu renderer built on Oracle
Visual Builder and the Redwood Design System. This NOTICE states what is published under Mateu's
licence, what belongs to Oracle, and what someone running it needs.

## What is published here (Mateu's licence)

All code authored in this directory is published under Mateu's licence (see `LICENSE.txt` at the
repository root):

- `poc/` — the bridge (`reduceContexts.mjs` and `core/`, `transport.mjs`, the generators
  `make-*.mjs`…) and its tests over the real wire (`test*.mjs`, `fixtures/`).
- In `webApps/vbredwoodapp/` — Mateu's action chains (`*-chains/*.js`, except those noted below),
  the declarative markup of the pages (`main-start-page.html`, `shell-page.html` as composed), the
  application JSON descriptors, `resources/css/app.css` (the app's own, minimal style sheet) and
  `resources/js/mateu-bridge.js` (generated from `poc/` by `make-amd.mjs`).

### The renderer jar (`io.mateu:mateu-redwood`)

The Maven module `backend/shared/frontend/redwood` packages as static resources the **optimised
build of this VB app** (`build/optimized/webApps/vbredwoodapp`, copied by `scripts/copy.mjs` into
`static/_redwood/`): the code listed above plus the few starter scaffolding files (section 4, which
keep their Oracle copyright headers). The jar **vendors no artefact from `static.oracle.com`**:
JET, the Spectra components (`oj-sp-*`) and the visual runtime are referenced by URL and loaded
from Oracle's CDN at run time, exactly as in a VB app hosted by Oracle.

## What belongs to Oracle

### 1. Oracle JET and the Redwood theme — UPL 1.0 (open source)

Oracle JavaScript Extension Toolkit (JET), including the Redwood theme (the CSS, fonts and images
its tooling distributes), is licensed under the
[Universal Permissive License v1.0](https://www.oracle.com/downloads/licenses/upl-license1.html),
compatible with Mateu's licence. This repository does not vendor JET (it is resolved from npm/the
CDN); should it ever be packaged (e.g. in a renderer jar), its `LICENSE.txt` and
`THIRDPARTYLICENSE.txt` must be included as the UPL requires.

Copyright (c) Oracle and/or its affiliates.

### 2. Spectra UI (`oj-sp-*`), the Visual Builder runtime and the illustration gallery — NOT open source

The Spectra components (`oj-sp-*`, served from `https://static.oracle.com/cdn/spectra-ui/...`), the
Visual Builder runtime (`visual-runtime.js`) and the gallery assets
(`https://static.oracle.com/cdn/fnd/gallery/...`, e.g. the welcome banner illustrations and the
`oj-ux-ico-*` icon font) are Oracle's property and have **no** public redistribution licence. This
repository **does not redistribute them**: the application references them at run time from
Oracle's CDN, and both `node_modules/` and the build output (`build/`) are excluded from version
control.

**Project rule: never vendor any artefact from `static.oracle.com`.** Everything from Oracle that
is not UPL is referenced by URL, never copied into the repository or into published artefacts.

### 3. Visual Builder build tooling

`@oracle/grunt-vb-build` and `@oracle/grunt-vb-audit` are downloaded from Oracle's CDN during
`npm install` (see `package.json`) under Oracle's terms. They are not redistributed with this
repository.

### 4. Visual Builder starter scaffolding

Only `webApps/vbredwoodapp/index.html` comes from the starter template the Visual Builder tooling
generates (the markup that boots the VB runtime); it keeps its Oracle copyright header. Every other
file the template contributed — the empty app, flow and page modules, the toast and message-band
chains, `Gruntfile.js` — has been rewritten from scratch as Mateu code, and `pages/shell-page.js`,
Mateu code that carried the Oracle header VB stamps on new files, now carries Mateu's.

Branding: by default the shell's FAB is neutral ("Search" with the magnifier). The "Ask Oracle"
look only appears if the app asks for it with `@App(askLabel, askIcon)`.

## Non-Oracle third parties

- **Leaflet 1.9.4** (BSD-2-Clause, © Volodymyr Agafonkin and contributors): paints the `Map`
  component, because JET has no street map (`oj-thematic-map` paints GeoJSON geography, not tiles).
  Like JET it is **not vendored**: `poc/map.mjs` loads it from cdnjs
  (`cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/`) the first time a screen paints a map.
- **OpenStreetMap tiles** (`tile.openstreetmap.org`, data © OpenStreetMap contributors, ODbL): the
  same the web renderer's `<mateu-map>` uses, and only the DEFAULT. Their usage policy does not
  allow heavy production traffic; a deployment with real load must point at its own or a
  contracted tile provider, configured per map on the wire: `Map.tileUrl` (a Leaflet URL template)
  + `Map.attribution` (`tileLayerOf` in `poc/map.mjs`).

Everything else the renderer paints without an Oracle component — the BPMN diagram (an SVG drawn
from the process' own BPMN-DI), the rich text editor, the board, timeline, heatmap and org
outline — is Mateu code: no further third-party library is loaded. (bpmn-js, which the web
renderer uses, is not used here: its licence is not a permissive one.)

## What someone running it needs

This renderer is designed for Oracle Visual Builder applications **hosted by Oracle** (VB Studio /
Visual Builder / Oracle Integration / Fusion Apps extensions) and also runs self-hosted as the
`io.mateu:mateu-redwood` jar. Either way the components and the runtime load from Oracle's CDN; in
production, the use of Visual Builder and of the Spectra components is subject to the terms of
the corresponding Oracle service (the Visual Builder entitlement the user already has through
their subscription). Think of this renderer as a connector: the code is free; the service it
connects to is not.

## Trademarks

Oracle, Oracle JET, Redwood and Visual Builder are trademarks of Oracle and/or its affiliates. This
project is not affiliated with or endorsed by Oracle.
