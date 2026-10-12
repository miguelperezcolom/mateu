# Walkthrough — app shell & navigation

Branch `walkthrough/app-shell` (2026-10-12). Walked as a user (click, keyboard, deep link, reload,
back/forward, console errors) on the combinations below; each fixed bug has a test that fails
without the fix. Prioritised (owner's budget cap): Java/Vaadin served first, then YAML/Vaadin, then
Redwood, then the ports; the cells not reached are marked **not walked yet**.

Legend: ✅ verified (how) · 🔧 was broken → fixed (commit) · ❌ broken, not fixed (owner decision) ·
N/A (documented as not applying) · — not walked yet.

## Fixtures

- **Java** — `e2e/sut/modules/sample1` package `io.mateu.sample1.shell`: `ShellApp` (`/shell`,
  MENU_ON_TOP: page / nested group / card group / `@EyesOnly` / rule leaf / RouteLink entries, two
  `@AppContext` pickers — enum + 12-option supplier —, header actions incl. a dropdown, inbox, ⌘K
  search, theme toggle, access keys) + `shell-routes.yaml` (`basePath: /shell`: fixed vs default
  params, a record master with child tabs) + one app per variant (`/shell-tiles`, `/shell-wide`,
  `/shell-flat`, `/shell-rail`, `/shell-left`, `/shell-sections`, `/shell-cc` chromeless).
- **YAML** — the `yaml-federation` console (`e2e/sut/yaml-federation/console`): its `app.yaml` now also
  declares a group, a card group, a rule leaf running a client-side flow, a header route action, a
  context picker and the theme toggle.
- **Specs** — `e2e/tests/shared/shell-menu.spec.ts` (12), `shell-header.spec.ts` (12),
  `shell-variants.spec.ts` (9) — run by all 5 Java adapters; `e2e/tests/renderer/shell.spec.ts` (5,
  renderer-agnostic: Vaadin + Redwood projects); `e2e/tests/yaml-federation/yaml-federation.spec.ts`
  (+4 "YAML shell").
- **Ports** — walked with a scratch Python twin of `ShellApp` behind the Vaadin bundle (not
  committed; the findings became port unit tests).

## Matrix

Columns: **MVC** = Java + Spring MVC + Vaadin (served); **5 adapters** = the shared specs on WebFlux,
Quarkus, Micronaut, Helidon MP too; **YAML** = YAML-authored shell (served, Vaadin); **Redwood** =
mvc-app1 built with `-Dmateu.renderer=mateu-redwood`; **Python / .NET** = port server, Vaadin
renderer; **RN / IntelliJ** = native renderers; **Static** = `mateu:bundle`.

| Feature | MVC (Vaadin) | 5 adapters | YAML | Redwood | Python | .NET | RN / IJ | Static |
|---|---|---|---|---|---|---|---|---|
| Mount at a non-root path, deep link, reload, back/forward | ✅ shell-menu | ✅ | ✅ yaml-federation | ✅ renderer/shell | ✅ browser | — | — | — |
| Home of an app with no home route | ❌ (1) | ❌ (1) | ✅ `home:` | — | 🔧 `67d648e89` (nested shell + loop) | 🔧 `67d648e89` | — | — |
| Page entry / nested group / RouteLink | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |
| Card group (card + card actions) | ✅ | ✅ | ✅ | — | ✅ | — | — | — |
| `@EyesOnly` entry hidden to anonymous | ✅ | ✅ | — | — | ✅ | — | — | N/A |
| Rule leaf (RunAction → app method) | 🔧 `233734845` (client + server) | 🔧 | ✅ (flow, client-side) | ✅ | 🔧 `dbd77f701` | 🔧 `dbd77f701` | — | — |
| routes.yaml on a class mount: fixed / default params, query override | 🔧 `d958e97fd` (404) | 🔧 | ✅ | ✅ | N/A (no basePath route files) | N/A | — | — |
| Pinned route reloaded (load by type) | 🔧 `feb0928ee` | 🔧 | — | ✅ | — | — | — | — |
| Record master + child tabs (default tab, deep link to tab, reload) | 🔧 `d958e97fd` | 🔧 | — | ✅ | — | — | — | — |
| AUTO variant rule (TILES / HAMBURGER / TABS) | ✅ shell-variants | ✅ | — | — | — | — | — | — |
| MENU_ON_TOP / HAMBURGER_MENU / TABS / MENU_ON_LEFT / HAMBURGER_SECTIONS | ✅ | ✅ | ✅ (MENU_ON_TOP) | ✅ (MENU_ON_TOP) | ✅ (MENU_ON_TOP) | — | — | — |
| RAIL / TILES keyboard operable | 🔧 `29754bfac` | 🔧 | — | — | — | — | — | — |
| Chromeless + command center (navigate, search) | 🔧 `29754bfac` (typed keys lost) | 🔧 | — | — | — | — | — | — |
| App title → home | 🔧 `29754bfac` (left the mount) | 🔧 | — | — | — | — | — | — |
| `@AppContext` enum picker (value read by every screen, reload) | ✅ | ✅ | ✅ | ✅ (renders, defaults to 1st) | ✅ | — | — | — |
| `@AppContext` picker keyboard / screen reader | 🔧 `a48db01e0` | 🔧 | 🔧 | — | 🔧 | — | — | — |
| `@AppContext` searchable picker (> 7, server search) | ✅ | ✅ | — | — | 🔧 `71b496e54` (error toast) | 🔧 `71b496e54` | — | — |
| Header actions (button + dropdown) | ✅ | ✅ | ✅ (route action) | ✅ | 🔧 `395fb916f` (request not injected) | — | — | — |
| Notification inbox (list, navigate, mark read) | ✅ | ✅ | — | ✅ (bell drawn) | ❌ (2) | — | — | — |
| ⌘K global search (entities + menu) | 🔧 `a48db01e0` (typed keys lost) | 🔧 | — | — | ❌ (2) | — | — | — |
| Theme toggle | ✅ | ✅ | ✅ | ✅ (drawn) | 🔧 `28f992ff4` (no way to ask) | 🔧 `28f992ff4` | — | — |
| Access keys (Alt + letter) | ✅ | ✅ | — | — | ✅ | — | — | — |
| Skip link, main/nav landmarks, window title | ✅ | ✅ | — | ✅ (landmarks) | ✅ | — | — | — |
| Chrome i18n (es) | ✅ | ✅ | — | — | ❌ (3) | — | — | — |
| Federation: RemoteMenu, static remote, remote deep links | ✅ (existing `federation/**`, not re-run) | — | ✅ yaml-federation (re-run) | — | — | — | — | ✅ static remote in yaml-federation |
| MicroFrontend, consuming external Mateu UIs | — | — | — | — | — | — | — | — |
| `appState` / `appData` route scopes | — (core SyncTests only) | — | — | — | — | — | — | — |
| Breadcrumbs | — | — | — | — | — | — | — | — |
| Visual editor (author / Play a shell) | — | — | — | — | — | — | — | — |

Counts (cells above, excluding "—"): ✅ 61 · 🔧 31 · ❌ 5 · N/A 3 · not walked yet: the rest.

## Bugs fixed (one line each)

1. `d958e97fd` — routes.yaml of a class-declared non-root mount (`basePath: /shop`) answered "Page
   not found": table absolute, request relative to the mount (every core suite ran at base url "").
2. `233734845` — a `@Menu Rule` leaf did nothing: the shell looked for the on-screen component
   without piercing shadow roots, and the server did not treat the app's rule actions as app-level.
3. `a48db01e0` — the `@AppContext` picker was unusable from the keyboard / screen reader (div
   options, no focus ring, name swallowing the panel); the ⌘K palette lost the keys typed right
   after ⌘K.
4. `29754bfac` — RAIL items and TILES tiles were mouse-only divs; the app title pushed `/` (left a
   non-root mount); the command center lost the keys typed right after opening.
5. `dbd77f701` — .NET/Python: a rule leaf's RunAction answered "Action not found".
6. `28f992ff4` — .NET/Python: no way to ask for the header theme toggle.
7. `71b496e54` — .NET/Python: every `@AppContext` picker showed an "Action not found" toast on
   open (`_appcontext-search-*` unimplemented).
8. `67d648e89` — .NET/Python: an app with no home route nested a second shell in its content area
   and tripped the browser's loop guard.
9. `395fb916f` — Python: the request was not injected into an action under
   `from __future__ import annotations`.
10. `feb0928ee` — a route pinning a param (`orders/pending`) reloaded by type took the defaults
    of a shorter route of the same view model (`orders`).

## ❌ Owner decisions

1. **Home of an app with no home route.** Seven doc pages say the landing page is "the first menu
   item"; the code never did that (it renders the app class itself — an empty page with its title;
   `AppSyncTest` even pins the `_no_home_route` sentinel). Implement the documented default (it
   changes the landing page of every app without `HomeRouteSupplier`) or correct the docs?
2. **Absolute routes in a Python/.NET non-root mount.** A notification / global-search hit route
   `/shell/probe` works on Java (the mount is stripped) but answers "Route not found: /shell/probe"
   on Python (and presumably .NET). Should the ports accept mount-absolute routes, or are those
   routes defined as mount-relative?
3. **Python chrome language.** The Python port sends no `AppMetadata.locale` unless the translator
   declares one (Java derives it from `Accept-Language`): the shell chrome stays in the host page's
   language. Parity wanted?
4. **YAML mounts next to `@UI` classes.** In a deployment that has any `@UI` class, the `type: UI`
   mounts are not served on any Java adapter (404, though the log lists them as discovered). The doc
   claimed "adding an `@UI` class later changes nothing"; corrected (`1aef6475a`) to state the
   limitation. Serve both?

## Doc claims found wrong and fixed

- `define/yaml/app-shell.md` — "adding an `@UI` class later changes nothing" (`1aef6475a`).
- `reference/parity.md` — theme toggle row added for the ports (`28f992ff4`).
- Not fixed (owner decision 1): "the landing page is the first menu item" (navigation.md,
  application-shell.md, ui-vs-route.md, route.md, fluent-nested-apps.md, annotations/index.md,
  migrating-from-alpha.md).

## For other areas

- Core: `TestMateu.runAt(baseUrl, rq)` runs a request the way a non-root mount's controller does —
  every other helper runs at base url "", which hid the non-root bugs; worth using in routing tests.
- Redwood defaults an `@AppContext` to its first option (Vaadin leaves it unset) — semantic
  difference, not filed.
- CLAUDE.md says the Vaadin shell draws `@AppContext` with `mateu-vaadin-app-context-picker`
  (vaadin-select / combo-box); the shared appRenderer actually uses the DS-neutral
  `mateu-app-context-picker`.
