# Changelog

All notable changes to Mateu. Versions follow the scheme described in
[Stability & versioning](https://mateu.io/reference/stability-and-versioning/); every release is a
git tag `vX.Y-…` and a GitHub release whose artifacts are on Maven Central under `io.mateu`.

Upgrading from an earlier alpha? Read [Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/)
first — it collects every rename and removal in one place.

This file starts at `v3.0-alpha.400`. For older releases, see the GitHub releases page.

## [Unreleased]

### Added
- **A CRUD's record page can show its own content** (`DetailContentSupplier`). The view class (for an
  `AutoCrud<T>`, `T`) implements `Component detailContent(HttpRequest)` and its `/{id}` page shows
  that component — e.g. an `ItemOverview` with the key information beside tabs — instead of the
  read-only form. The header (title, subtitle, `Status` badges, KPIs) and the toolbar stay the
  CRUD's, the editor and the creation form keep their forms although they are the same class, an
  `ItemOverview` (any `ComponentTreeSupplier`) is expanded in place so its buttons reach the CRUD
  (`edit`, `cancel-view`, `action-on-view-<method>`), and `null` keeps the form. An editable view's
  view mode honours it too. It replaces overriding `resolveInternalRoute` and copying the
  `PageView`. Python `DetailContentSupplier.detail_content()`, .NET `IDetailContentSupplier.DetailContent()`
  on the crud record page (title + Back to list/Edit kept). (Java, .NET, Python)
- **`PageView.toBuilder()`**: copy a page with one thing changed instead of calling its 29-argument
  constructor. (Java)
### Fixed
- **Micronaut: dates go out as ISO-8601 strings.** The JSON mappers the adapter installs in place of
  Micronaut's (`MateuMicronautJsonMapper`, `MateuMicronautJacksonDatabindMapper`) left Jackson's
  `WRITE_DATES_AS_TIMESTAMPS` on, so a `LocalDate` in component data (grid rows…) was written as
  `[2025,12,19]` and shown as "2025,12,19". They now write `"2025-12-19"`, like the other adapters.
  (Java)
### Fixed
- **Quarkus: views reached only by Mateu keep their injected services.** ArC removed, as unused beans,
  the view classes Mateu reaches by reflection (an `AutoCrud` annotated `@Dependent`…) and the
  services only they inject; Mateu then created the view with `new` and its `@Inject` fields stayed
  `null` ("An unexpected error occurred" on the first action that used one). `mateu-quarkus` now
  defaults `quarkus.arc.remove-unused-beans=fwk` (its `META-INF/microprofile-config.properties`; the
  application's own setting wins): application beans are kept, unused framework beans are still
  removed. `@Unremovable` is no longer needed. (Java)
### Fixed
- **Spring Boot devtools: views get their beans.** With `spring-boot-devtools` on the classpath a
  view's `@Autowired` fields stayed `null` and `@Lookup` suppliers that are `@Component`s failed with
  "Cannot instantiate …". Mateu loaded the classes it reaches by name with its own classloader, which
  under devtools loads a second copy of the app's classes next to the RestartClassLoader's — no bean
  is an instance of those. Classes are now loaded from the thread context classloader first. (Java)
### Fixed
- **A view reached through a `@Menu` field gets its injected services.** The menu path created the
  target with its bare constructor, so a view that builds its content right away (a `Dashboard`, any
  `ComponentTreeSupplier`) found its `@Autowired`/`@Inject` fields `null`. It is now created through
  the instance factory, like every other view (bean if there is one, else a new instance with its
  injection points filled). (Java)
### Fixed
- **Live reload after a restart inside the JVM.** The dev event stream's boot id was a constant of
  Mateu's jar, which Quarkus dev mode and Spring Boot devtools do not reload: after their restart
  the browser reconnected, saw the same boot id and did not re-render. Each application start now
  gets a new one (`DevEndpoint.bootId()`). (Java)
- **Quarkus dev mode: editing Java re-renders the open browser.** Quarkus only looks for changed
  code when a request arrives, and the open live-reload stream is not one. With `mateu.dev=true`,
  `mateu-quarkus` now asks it to scan for changes once a second while a browser is watching
  (a `HotReplacementSetup`; dev mode only). (Java)
### Fixed
- **`TodoList`, `CalendarPage`, `CollectionDetail` and `GeneralOverview` no longer send the request
  to the client.** Their private `currentRequest` field travelled in the component state (base url,
  caller's remote address) and failed to come back (`WARN Hydrater: Could not hydrate field
  'currentRequest'`). It is `transient` now, and the state serializers skip transient fields in
  their nested-object pass too (Jackson already did). (Java)
### Fixed
- **No more `"nombre": "xxxx"` in every row of every list.** A leftover debug line in the wizard
  state serializer (used for every form's state) planted it next to `_rowNumber`. (Java)
- **A list of components is not an editable grid field.** A `List<Badge>` (a `Foldout`'s header
  badges) or `List<Component>` field registered the twelve row-editing actions (`estado_add`,
  `estado_create`, …) of a list of records. (Java, .NET, Python)
### Fixed
- **A `Drawer` or `Dialog` keeps its declared id on the wire.** `Drawer.builder().id("x")` went out
  with the component id `"fieldId"` (only the metadata carried `x`), so Redwood could not tell that
  an overlay re-sent while open was the same one and stacked a second drawer instead of refreshing
  it. Without an id the filler `"fieldId"` stays. (Java; .NET and Python already sent the id)
### Fixed
- **A CRUD view's `@ViewToolbarButton` that answers with a message refreshes the record.** A button
  that changed the record in the store and returned `Message.success(...)` left the view on the old
  values (workaround was `UICommand.navigateTo("/<crud>/<id>")`). A message-only answer now also
  sends the record reloaded from the store; any other answer is used as it is. (Java; the .NET and
  Python ports do not dispatch view-toolbar methods)

## [3.0-beta.7] — 2026-10-19

The residuals of the verification review: agent navigations honour only declared remotes (and answers from any other origin are rendered untrusted), path variants can no longer skip the JSON-body guard, data titles render as text everywhere, dev `save_spec` refuses script. Upgrade recommended.

### Security
- **The JSON-body guard decides on the canonical path.** MVC, WebFlux and Quarkus hand the filter
  the raw request URI while they route on the decoded one, so `POST /%6Dateu/mcp` or
  `/mateu/mcp;x=1` with `text/plain` still ran JSON-RPC, and on Quarkus a YAML mount's sync/SSE
  endpoints took a forged form post. The guard now matches the percent-decoded path without
  `;parameters`, empty or dot segments, in any case; Spring's CSRF exemption is granted only when
  the raw and the canonical path agree. (Java 5 adapters; .NET and Python check the matched
  endpoint and were not affected — the same spellings are now pinned there.)
- **A `Named` entity's `name()` is a data title.** It titled the page without `Templates.literal`
  and without `titleIsText`, so a record name planted markup in the header and a `${…}` in it was
  evaluated. It now renders as text, like a record's `toString()`. (Java)
- **`mateu_save_spec` (dev mode) refuses a page that would run code in the browser** — what the
  untrusted strip takes out of a pushed screen (`Element` `on…`/`import`/`srcdoc`/unsafe url
  attributes, `html: true`, script-capable or `mateu-*` elements, `javascript:` urls, `RunJS`, an
  action's `js`, a foreign `MicroFrontend`): a saved spec is served through the trusted render path.
  YAML aliases are expanded before the check. Shared cases `conformance/mcp/save-spec-script.json`.
  (Java, .NET, Python, sidecar)
- `mateu_save_spec` reads `${ secret.KEY }` (spaces) as a secret reference, as the interpolator
  does. (Java, .NET, Python)
- `mateu_dispatch_event` refuses the framework's own event names (the list every renderer drops,
  `conformance/client/agent-events.json`), so one renderer's filter defect is no bypass. (Java,
  .NET, Python)

### Fixed
- A crafted `__preview__` — a `Partial` with no `ref`, list items written as `null` — or a non-map
  `_editedRow` no longer logs an ERROR with a stack per request: null list items are dropped by the
  YAML loader, a ref-less partial renders nothing (WARN), the `update-row` refusal is shown as
  written. (Java, Python)

### Documentation
- `configuration.md`: `mateu.mcp.push.max-anonymous-sessions-per-address` and
  `mateu.micronaut.replace-json-mapper`. Known issues: Micronaut and Quarkus REST are stricter than
  the JSON-body rule. `SECURITY-DEPENDENCIES.md` re-checked over a full install (dead overrides
  removed); Dependabot also tracks `/demo` and `/e2e/sut`.

## [3.0-beta.6] — 2026-10-19

Fixes from the second independent pre-GA review: agent-authored screens are untrusted everywhere,
JSON-only request bodies, safer authoring actions, `update-row` and data titles hardened, the live
push plane tightened, release secrets scoped. **One breaking rule (415 on non-JSON bodies) — read
Behaviour changes before upgrading.** Upgrade recommended.

### Behaviour changes
- **Mateu's action endpoints accept only JSON bodies, on every adapter (breaking for non-JSON
  clients).** A `POST` to `<baseUrl>/mateu/v3/**` (sync, SSE, YAML mounts) or `/mateu/mcp` whose
  `Content-Type` is not `application/json` / `application/*+json` — `text/plain`, a form encoding,
  or none at all — now answers **415** with a plain-text body. The renderers, the native apps and the
  MCP sidecar already send JSON; a hand-written client (a `curl` without `-H 'Content-Type:
  application/json'`, a `fetch` posting a string, a beacon) must declare it. Out of scope:
  `…/mateu/v3/client-log` and `/mateu/dev/**`. (Java 5 adapters, .NET, Python)
- **`__validate__` answers 403** unless the call is an MCP tool call, or the app runs with
  `mateu.mcp.enabled=true` or in dev mode (the sidecar's authoring tools need one of those).
- **`update-row` is offered and accepted only by a crud with `@InlineEditing`** (and `canEdit()`):
  every crud used to advertise it; any other now answers 403.
- `mateu_save_spec` (dev mode) refuses more definitions than before — see Security.

### Security
- **An agent-authored screen is untrusted and runs no code (NB1).** A screen an agent sends — the
  chat's `render-screen`, a live push of kind `render` — was rendered like the app's own
  definitions, so an `Element`'s literal `onerror`, `html` content, `import` module, a `script`
  element or a `javascript:` link ran in the user's signed-in tab: a prompt-injected LLM could steal
  the token. Every shell (Vaadin, Redwood, React Native, IntelliJ) now calls `__preview__` with
  `_untrusted: true` and the backend strips everything script-capable (`on*`/`srcdoc`/`import`/unsafe
  url attributes, html content shown as text, code-loading or `mateu-*` elements, `RunJS` rules,
  action `js`, `AddContentToHead`/`Body`, `javascript:`/`vbscript:` urls, a `MicroFrontend`'s
  absolute `baseUrl`); the web renderers apply the same rules again in the browser. Shared cases:
  `conformance/untrusted/cases.json`. (Java, .NET, Python, all renderers)
- **React Native trusts no backend because a navigation names it (NB2).** A `navigation-requested`
  from the chat or live push carrying `baseUrl: https://attacker` used to send the Bearer token,
  `X-Session-Id` and the `@AppContext` values there; credentials now go only to the app's own backend
  or to a remote the app's menu declares.
- **Mateu's action endpoints accept only JSON bodies (NM1)** — the 415 rule above. Those are the
  requests a cross-site page can forge without a CORS preflight; before, Micronaut, Quarkus and
  Helidon MP (and the MCP endpoint everywhere, and .NET/Python) ran them, so a cookie-authenticated
  app was open to cross-site request forgery. Spring's CSRF exemption for Mateu's JSON calls relies
  on it. (Java 5 adapters, .NET, Python)
- **The reserved authoring actions are safe on the plain sync endpoint (NM2).** `__validate__` is
  gated (above). `__preview__` stays open — it is the render target of the chat, live push and the
  visual editor — but every reserved action now answers through the error boundary (a message +
  reference, never a raw 500), and every catalogue component previews with nothing set (`type:
  VerticalLayout` alone used to be an anonymous, log-flooding 500). (Java, .NET, Python)
- **`mateu_save_spec` (dev mode) saves only what a screen is made of (NM3).** A page, a layout
  envelope, a partial or a business-component catalogue — never a sources / environment / routes /
  actions / types / translations / mount / project definition, never a catalogue file name, and
  never a page that references a `${secret.…}`, marks a request `proxy: true` or overrides the url /
  headers / method / body of a source it names by `ref`. Before, an MCP caller in dev mode could
  re-point a proxied source at its own server and have Mateu send it the secret. Refusals are logged
  at WARN. (Java, .NET, Python, sidecar)
- **The log names a push session by fingerprint, never by handle (NM4).** Pairing and delivery were
  logged at INFO with the session handle — for an anonymously paired session, the credential. Logs
  now carry `s-` + the first 12 hex digits of its SHA-256 (identical in Java, .NET and Python).
- **Live UI push: anonymous UIs behind one address no longer lock each other out (NM5).** The
  per-owner cap (`max-sessions-per-owner`, 20) is now a signed-in user's only; anonymous sessions are
  capped per client address by the new, much higher `mateu.mcp.push.max-anonymous-sessions-per-address`
  (200; .NET `MateuOptions.McpPushMaxAnonymousSessionsPerAddress`, Python
  `add_mateu(mcp_push_max_anonymous_sessions_per_address=…)`). The address is the framework-resolved
  one (never a forwarded header Mateu reads itself); Helidon MP's JAX-RS leg now reports it too.
- **Pairing attempts are also counted per client address.** The 10-a-minute failure limit was
  bucketed per `X-Mateu-Agent-Key` only, so rotating the header gave a fresh bucket per guess while
  all anonymous callers shared one; the bucket map is now bounded (10 000). (Java, .NET, Python)
- **An agent dispatches only the events a screen declares (NM9).** Every event name an agent sent
  went out as a bubbling DOM event, so it could fire the framework's own
  (`server-side-action-requested`, `page-banners-received`, `route-changed`, `dirty`/`clean`…). Now
  only the built-in agent events, or one a view on screen subscribes to (`@SubscribeTo`) that is not
  a framework or DOM name, go out. Shared lists: `conformance/client/agent-events.json`. (web,
  Redwood; React Native and IntelliJ already delivered to their `@SubscribeTo` bus only)
- **The Redwood chat sends the token only where it is trusted (NM10).** It sent the stored Bearer to
  whatever `Chat.sseUrl` / `uploadUrl` a screen named; now only to the page, the shell's backend and
  the remotes its app names.
- **Inline row editing (`update-row`) is guarded like the editor's save (NM11).** A `@ReadOnly`
  field keeps the stored value, the row is laid over the stored record (its other fields survive),
  an id with no stored record is refused instead of inserted, and only a crud with `@InlineEditing`
  (and `canEdit()`) offers it. (Java, .NET, Python)
- **A page title that is data renders as text (NM12).** A record's own `toString()` titled the page
  and the web header rendered it as HTML, so whoever could name a record planted a tracking image or
  a phishing link in the header of everyone who opened it. Such titles travel marked
  `PageDto.titleIsText` (additive wire field; .NET `TitleIsText`, Python `title_is_text`) and render
  as text; declared titles (`@Title`, a `TitleSupplier`) keep their markup. (Java, .NET, Python, web)
- **A push session's secret hash is compared in constant time** in Java too (`MessageDigest.isEqual`;
  .NET and Python already did).
- **React Native: the push channel secret never comes from `Math.random`.** It fell back to it when
  `crypto.getRandomValues` was missing — Hermes' default — so on a device the 256-bit secret was
  predictable. `expo-crypto` now provides the secure source and the secret draw fails rather than
  fall back.
- **What an agent sends cannot forge or flood log lines.** The route / event / path an agent sends
  is logged through one helper (Java `LogSafe`, .NET `MateuLogging.Safe`, Python `log_safe`: clipped
  to 256 characters, control characters → `?`), and the ports clip a session's route to 512 like
  Java.
- **An agent's screen into the content asks before discarding unsaved work.** A `render-screen`
  with target content replaced the screen without the unsaved-changes check every navigation makes;
  Vaadin, Redwood and React Native now ask first (a drawer or dialog replaces nothing; IntelliJ opens
  a separate Preview tab).
- **Release workflows scope every credential (NM7).** The PyPI and NuGet publishes are split into a
  read-only build job and a publish job that alone holds the token (passed only through `with:`) or
  OIDC; the GPG key is imported right before `mvn deploy`, after `npm ci` and the Vite build;
  write permissions sit only in jobs that run no third-party code; every action is pinned by SHA.
- **The committed Claude Code settings are neutral (NM8).** `.claude/settings.json` no longer turns
  on `bypassPermissions` for whoever trusts the repository; personal modes go in the untracked
  `settings.local.json`.
- **Dependabot covers** the starters, pip, NuGet, the IntelliJ plugin, the VS Code extension and
  React Native (it tracked only the backend, the web monorepo, e2e, the docs and the actions).

### Fixed
- Python: the API freeze pins every public component (NM6) — 27 documented classes of
  `mateu_ui.uidl.components` (`VerticalLayout`, `FormField`, `Card`, `Notice`, `Chart`…) were missing
  from `__all__` and could change with no failure; a guard now fails on any public name left out.
- Python: `identity_from_claims` is public API (`mateu_ui.fastapi`, `mateu_ui.core`), as the docs teach.
- uidl: `@Documented` on the last three annotations without it (`GenericClass`, `KeycloakSecured`, `List`).
- `scripts/bump-example-version.sh` accepts a GA / patch release (`3.0.0`) and matches it on the
  next bump (it refused any version without a `-label.N` suffix).
- The visual editor's highlight pass is a no-op once the canvas has left the page (a flaky CI
  failure); `CSS.escape` has a fallback.
- The .NET YAML builder binds a string-valued map (an `Element` with `attributes:` rendered
  "Unsupported component: Element").

### Documentation
- `security.md`: the `@KeycloakSecured` `jsUrl` default is `https://esm.sh/keycloak-js@26.2.2`, and
  the CSP recipe says what that needs (NM13).
- `configuration.md` lists the `mateu.mcp.push.*` keys and `mateu.ui.modules`; `MATEU_MCP_ENABLED`
  works on Java too; parity gains the live UI push rows; the wire spec explains `consumedRoute` null
  vs `""` and the `KPIDto` discriminator; where the AI chat sits per shell variant; the support policy
  names the Quarkus version CI tests (3.40); the japicmp baseline is the one in `backend/pom.xml`;
  a Redwood static bundle names its manifest by an absolute path; the guides pin no release and a
  release deploy only names a version Central serves; the fixed "Vaadin foldout panels start
  expanded" known issue is gone; AI reference files and a demo use `HAMBURGER_MENU`.

## [3.0-beta.5] — 2026-10-19

Live UI push: an MCP agent can show a screen, navigate or dispatch an event in an open tab or app, paired by a one-time code.

### Added
- **Live UI push: an agent sends UI to a UI that is open.** With the MCP endpoint and
  `mateu.mcp.push.enabled=true` (.NET `MateuOptions.McpPush`, Python `add_mateu(mcp_push=True)`,
  `MATEU_MCP_PUSH_ENABLED` everywhere), each tab / app window keeps an *agent channel* open
  (`_agent-channel` over the existing SSE endpoint) and the shell offers **Connect AI**: a one-time
  pairing code, the connected agents, Disconnect. MCP tools `mateu_list_sessions`,
  `mateu_pair_session`, `mateu_push_ui` (validates first, then renders the page in that tab — content,
  drawer or dialog — through `__preview__`), `mateu_navigate` and `mateu_dispatch_event`. A caller
  reaches only its own user's sessions and the ones paired to it; rate and size limits, at most 20 live UI sessions per user (or
  per client address for anonymous UIs) besides the global 1000; every push logged. Wire: `AppDto.agentPush`, command `AgentPush {kind, event, detail}`. Identical in Java (5
  adapters), .NET, Python and the sidecar (which forwards to the app's `/mateu/mcp`), pinned by
  `conformance/mcp/push.json`; applied by Vaadin, Redwood, React Native and IntelliJ with the same
  code as the chat's events. (Java, .NET, Python, sidecar, Vaadin, Redwood, React Native, IntelliJ)

### Changed
- The chat's `sessionId` is the UI session id (the web's per-tab `X-Session-Id`; the native
  renderers' app session), shared with the agent channel.

## [3.0-beta.4] — 2026-10-19

The closing batch: the 3.x API frozen and enforced, a first-hour smoke against every release, the docs' code samples compiled, an AI plugin for Claude Code, one chat contract on every renderer, an MCP for authoring screens, and the product bugs those efforts found.

### Added
- **MCP for authoring UI.** The MCP endpoint (and the stdio sidecar) now also lets an agent *write*
  screens: resources `mateu://guide`, `mateu://catalog`, `mateu://schema/specs`, `mateu://schema/uidl`
  (shipped inside the app), and tools `mateu_list_components`, `mateu_get_component_schema`,
  `mateu_validate_uidl` (every error and warning with its JSONPath and line/column — unknown types
  and keys with a "did you mean", wrong values, `dataType: decimal`, undeclared actions, references
  to sources/partials/components/field types that do not resolve, and whatever the real loader still
  refuses), `mateu_preview_uidl` (renders the page and returns its projection) and, in development
  mode only, `mateu_save_spec` (writes into the specs directory; live reload shows it). Identical in
  Java, .NET, Python and the sidecar, pinned by `conformance/mcp/authoring.json`. (Java, .NET, Python,
  sidecar)
- A reserved sync action `__validate__` (`parameters._yaml` → report on `appData._validation`), what
  the tools are built on.
- The component catalogue `uidl-catalog.json`, generated with the schemas; every component's
  schema `$def` now carries a one-line `description` taken from the record's Javadoc.

### Changed
- The MCP tool texts and input schemas are the same in the four implementations
  (`additionalProperties: false` everywhere); `initialize` also advertises `resources`.

### Fixed
- The Java MCP endpoint answers a body that is not JSON with JSON-RPC `-32700` (and a non-object
  message with `-32600`) instead of failing the request.
- An MCP tool that fails unexpectedly answers the generic text with a reference id (logged under it)
  instead of the exception's message; a refused call is `Error: Forbidden`. (Java, .NET, Python,
  sidecar)
- A YAML preview that cannot be parsed says why (`Invalid YAML — line N (path): …`) instead of
  "Invalid or empty YAML"; `YamlUidlLoader.parseTextReporting` exposes the reason.

- **`Image.alt`** — the text alternative a screen reader reads (`""` marks the image decorative):
  `Image.builder().alt(…)` / `new Image(src, alt)` in Java (the existing constructors stay),
  `Image { Alt = … }` in .NET, `fluent.Image(alt=…)` in Python and `alt:` in YAML. Rendered as the
  `<img>` alt on Vaadin and Redwood, the accessibility label on React Native and the accessible
  name in the IntelliJ plugin. Wire: `ImageDto.alt` (additive).

### Behaviour changes
- Python: `Crud.save` and `Crud.delete` **refuse by default** with a user-facing "Not implemented"
  error naming the method to override (`FetchOnlyNotes cannot store changes yet: override
  save(Note) in FetchOnlyNotes.`), as `Crud<T>.Save`/`Delete` do in .NET (Java's `AutoCrud.store()`
  is abstract). They used to do nothing, so a crud that only implemented `fetch` answered "Saved" /
  "Deleted" and discarded every write. A crud that writes overrides both.

### Security
- Java: an `actionId` that names nothing on a plain view — no method, no field, no runner, and not
  advertised by the view — answers 403 with one WARN line, as on a CRUD and in the .NET and Python
  backends. It used to re-render the page with HTTP 200, so an unknown id looked like one that ran.
  The route load, the framework's reserved and app-level ids and every id the view advertises are
  unaffected.

### Fixed
- Java: a view whose fields are all `@ReadOnly` renders as a read-only form — its fields keep their
  labels and a `@ReadOnly` list of rows is a grid. It used to be taken for a page of components
  (a class counted as a form only with an editable field), so the labels vanished and the grid
  became its rows' text. (.NET and Python already rendered it; now pinned there too.)
- Python: an action returning a collection that holds the view (`[self, Message("Saved")]`)
  re-renders the view with its new state as well as showing the rest, as in Java and .NET. Before,
  the toast showed and the screen kept its old values.

### Documentation
- **The code samples of the docs are checked against the API.** Every Java, C#, Python and YAML block
  under `doc/` is compiled (against mateu-uidl + mateu-core / `backend/dotnet/src`), type-checked
  with mypy (against mateu-ui) or validated against `specs-schema.json` — `npm run check:snippets` in
  `doc/`, and the `snippets` job of the Docs workflow on PRs touching the docs or the authoring APIs.
  Running it the first time found about 190 samples out of date with the API (renamed constants and
  builder methods, removed annotations, missing required overrides, Java names in C#/Python
  samples…); they are fixed. Deliberate sketches opt out with ` ```java nocheck `.

### Added
- **SBOMs on every release.** The release workflow attaches CycloneDX (JSON) SBOMs to the GitHub
  release: the Maven artifacts, the web renderer's production npm dependencies, the Python wheel and
  the .NET packages (`scripts/release-sboms.sh`; nothing is added to a normal build).
- Docs: [Support policy](https://mateu.io/reference/support-policy/) (which versions get fixes, the
  supported Java / .NET / Python / framework / IDE versions) and
  [Known issues](https://mateu.io/reference/known-issues/) (current limitations with workarounds).

### Changed
- **The 3.x public API is frozen, and the build enforces it.** The Java compatibility check (japicmp,
  baseline `3.0-beta.1`) is now blocking by default for `mateu-uidl` and the archetypes of
  `mateu-core` (`mateu-dtos` stays report-only), and a break fails with the list of incompatible
  changes and the add + deprecate recipe. .NET pins every public member signature of `Mateu.Uidl`
  (not only the type names of `Mateu.Core`/`Mateu.AspNetCore`); Python pins the exports and the
  signatures of the `mateu_ui.uidl` decorators, functions and classes. See
  [Stability & versioning](https://mateu.io/reference/stability-and-versioning/#enforcement).

## [3.0-beta.3] — 2026-10-18

Fixes from a second external review.

### Fixed
- **A business component that references itself** — directly, through another component or through a
  partial — no longer crashes rendering, the static bundle export or the visual editor with a stack
  overflow: the cycle is cut at the repeated reference (a placeholder) and the rest renders. (Java,
  .NET, Python, visual editor)
- A partial inside a business component is expanded on the Java server too.
- `type: Partial` refs accept the same spellings in every backend and the visual editor: the short
  name, the classpath path (`specs/ui/partials/x.yaml`) or the specs-relative path
  (`partials/x.yaml`), `.yaml` or `.yml`.
- React Native and IntelliJ: a long-running task's stream re-authenticates on an expired session and
  retries once, like ordinary requests.

## [3.0-beta.2] — 2026-10-18

Security fixes from an external review. Upgrade recommended.

### Security
- **A YAML page hidden at its root answers 403.** A definition whose root (bare or the `layout:` of an
  envelope) is hidden from the caller by `eyesOnly:`/`access:` is refused before any state is
  hydrated or any action runs. Before, the caller's state and actions reached the view model, and an
  enveloped layout could be served in full. (Java, .NET, Python)
- **A failed personalisation never serves the unrestricted definition.** If applying the access keys
  or building the personalised spec fails, the request is rejected; a translation failure serves the
  restricted page untranslated. (Java, .NET, Python)
- **A configured auth token provider is authoritative.** A null, empty or failing answer sends no
  `Authorization` header instead of a token left in storage, and a request retried after a 401 no
  longer re-sends the previous token (web client and Redwood's embedded host header provider).

### Fixed
- A re-rendered `Element` dispatches the actions its current `on:` declares (no duplicate listeners,
  same DOM node), and removes the attributes, `style`, `class` and `slot` its definition no longer
  declares, leaving the component's own attributes alone (Vaadin and Redwood).

## [3.0-beta.1] — 2026-10-18

The first beta. Everything since the beta candidate (3.0-alpha.426): the last review findings, the
owner decisions, the parity audit and the new-project polish. From here on, API changes follow the
[stability policy](https://mateu.io/reference/stability-and-versioning/) — add and deprecate, never
remove silently. Upgrading from an alpha: read
[Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/).

### Behaviour changes
- **Money follows the UI locale** (3.0-alpha.430). A bare number with the money stereotype is
  formatted in the app's locale (`AppDto.locale`, else the browser/device/IDE) on Vaadin, Redwood,
  React Native and IntelliJ; the hard-coded `de-DE` is gone. An `Amount` keeps its own locale and
  currency; read-only money fields on detail pages are formatted.
- **CRUD "Add another" moved** from the record view toolbar to the toast that confirms a create
  (Java, .NET, Python; `addAnotherLabel()` still sets its text).
- **Renderer jars ship each asset once**, under `static/` (about half the size); Quarkus serves it
  through `ClasspathAssets`. Apps that referenced `META-INF/resources/...` paths of the renderer jars
  must use `static/...`.
- **Redwood**: the jar's index page is written by Mateu; no Oracle starter file is redistributed.
  A remote screen's `Element` loads its `import` from the remote's origin; a foldout panel declared
  `open=false` starts folded.

- **.NET: the `Mateu.Core` engine is internal.** `SyncHandler`, `MateuRegistry`, `ReflectionMapper`,
  `ComponentMapper`, the route/YAML/MCP machinery and the other engine types (43 of the 50 exported
  types) are no longer public; an app uses `Mateu.Uidl` + `AddMateu` / `MapMateu`. Still public:
  `DevSpecs`, `ISpecsCache`, `PartialRegistry`, `DocumentStore`, `BuiltInCsvExporter`,
  `InferenceSwitches` and the type forwards. Hosting the engine outside ASP.NET Core is no longer
  supported; register component adapters as `IComponentAdapter` services instead of
  `MateuRegistry.RegisterAdapter`. Pinned by `PublicSurfaceTests`.

### Fixed
- New projects look finished: no empty band above a MENU_ON_TOP bar without logo or widgets, a real
  dashboard template (one title, page width, a chart and a table), spacing above YAML form buttons,
  no blank header over a listing, the TABS shell title aligned with the content.
- Data links and rich text are safe on React Native and IntelliJ (3.0-alpha.427).
- .NET `[Money]` / Python `Money()` listing columns carry the money stereotype.
- The IntelliJ plugin uses no deprecated platform API on 2025.2 / 2025.3.

### Deprecated
- **Python: one namespace.** The `mateu-ui` wheel installs ONE top-level package, `mateu_ui`
  (`mateu_ui.uidl`, `mateu_ui.dtos`, `mateu_ui.core`, `mateu_ui.fastapi`), instead of four generic
  ones that could collide with other distributions. The old names (`mateu_uidl`, `mateu_dtos`,
  `mateu_core`, `mateu_fastapi`) still ship for the whole 3.x line as aliases of the SAME modules —
  submodule imports included (`from mateu_core.mapper import ReflectionMapper`) — and each emits one
  `DeprecationWarning` naming the new path. Type checkers only see the new paths (the aliases carry no
  `py.typed`). Starters, samples, the project generator and the docs use `mateu_ui.*`. The version
  now lives in `mateu_ui.__version__` (`mateu_ui.core.__version__` is the same value).

## [3.0-alpha.426] — 2026-10-18 (beta candidate)

The beta candidate: the refactor phase and every fix from the independent pre-GA review. Read
**Behaviour changes** before upgrading.

### Security
- **Strict action mode is the default** (Java): an `actionId` runs a method only when it is marked as
  an action or its id is advertised by the view (a component, a trigger, a menu rule, `@OnRowSelected`,
  a column action…); an unadvertised public method answers 403, as in the .NET and Python backends.
  `mateu.actions.strict=false` restores the old convention.
- **CRUD saves are not a mass-assignment channel**: an edit saves the record its route names (its
  id and its read-only / hidden fields keep the stored values), a create ignores the read-only and
  hidden-in-create fields of the posted state.
- An **unknown `actionId`** is a refused request on every backend — HTTP 403 and one WARN line, the
  same answer for a CRUD as for any other view (Java used to log an ERROR with a stack trace for a
  CRUD; .NET and Python answered an "Action not found" toast).
- **Data HTML is sanitised with an allow-list** (web): no custom element from data except
  `vaadin-icon`, no form controls; interpolated data in titles, texts and headers is text; markdown
  values render through Mateu's policy (`mateu-markdown`). Redwood header widgets and `Element`s
  with data go through the bridge's whitelist sanitiser; data-bound `href`/`src` are safe links only.
- **Credentials stay in scope**: the Bearer token, session id and app context go only to the page
  origin, the shell's backend and the remotes the app names — web, Redwood, React Native, IntelliJ.
- Active document types (HTML, SVG, XML, script) are never inlined or shown in the app's origin:
  they are parked and served sandboxed.
- The Vaadin page runs under `script-src 'self'` (the theme script is external, the remaining
  inline scripts carry CSP hashes); no template markers or Vite icon in a served page (Java, .NET,
  Python).
- The expression sandbox hands out no property descriptor and takes no forbidden function as a
  callback; the idle sign-out never follows a `javascript:` URL; a login flow's `?continue` never
  becomes a route parameter.
- The client-log endpoint is rate-limited per user / client address.

### Behaviour changes
- **Spring Security works out of the box**: Mateu exempts its own JSON endpoints from CSRF
  (`MateuCsrfAutoConfiguration` / `MateuCsrfWebFluxAutoConfiguration`); a 403 Mateu did not send
  (CSRF, the framework's security, a proxy) gets its own message instead of "You are not allowed".
- **Mateu's settings are read from the framework's configuration** (`application.properties`,
  MicroProfile Config, Micronaut config) as well as `-D` and environment variables.
- The no-security-module startup notice is a WARN.
- The runtime bundle endpoint (`GET /mateu/v3/bundle`) answers a failure through the error boundary
  (generic text + reference; the exception only with `mateu.errors.detailed`), as valid JSON.
- The mobile manifest's `wireVersion` is the envelope's (`"3.0"`) in Java, .NET and Python.
- .NET `Crud<T>.Save` / `Delete` **refuse by default** instead of silently dropping writes —
  override them. .NET crud ids come from `[Id]` (else `Id`, else the crud is refused); `Find` gets
  the filter state on the capability-listing path.
- .NET header badges, `[Hidden]` and `[Kpi]` follow Java's semantics; Python `eyes_only("admin")`
  takes a single string as one name.
- Optional web elements (chat, workflow, form editor, planning board, Gantt, matrix grid,
  signature, camera, markdown, date-range picker) load on first use; the classes stay exported from
  `mateu-vaadin`, but code that creates these elements before Mateu draws one must `await
  ensureElement(tag)`.
- Form rules settle before rendering: one render per change (was 2–3); an effect that held only
  in the middle of a rule chain no longer fires.
- Redwood: `?.`, `??` and regex literals in rules; `state:`/`appState:` seeds, `initialData` and
  the query string on statically served loads. React Native and IntelliJ: `?.` and regex literals.
- Core registries load under a lock instead of a monitor (no virtual-thread deadlock on a cold
  burst); the Micronaut adapter looks beans up without exceptions.
- A .NET or Python server that serves no web renderer answers a browser opening its mount with a
  short page explaining the sync API and `MATEU_UI` (still status 404).

### New
- The .NET and Python ports gained page toolbar actions (`[Toolbar]` / `@toolbar`), triggers
  (OnLoad / OnSuccess / OnError / OnValueChange), field help, placeholder, autofocus, step and slider
  bounds, and the generic fluent components (Breadcrumbs, Icon, Notification, Element, Tooltip,
  Details, SplitLayout, ConfirmDialog). An `info` toast variant everywhere.
- `wire-schema.json`: the response wire and the request, generated and pinned; a removed or
  renamed member fails the build.
- The canonical endpoint is named: `POST {baseUrl}/mateu/v3/sync/{route}`.
- Public API: `@Internal` marks plumbing outside the stability promise; every annotation has a
  `@Target` and `@Documented`; positional uidl records have builders; Python `ActionRequest` /
  `current_request` are public; .NET `MateuForbiddenException` lives in `Mateu.Uidl`, deprecations
  carry DiagnosticIds (`MATEU001`–`003`).

### Deprecated
- `Result` and `Stepper` wire types (registered, never produced); the dead `@List` annotation;
  `JwtExtractor` (→ `IdentityResolver`); `DashboardLayout` / `ContentLayout` are now for removal
  (→ `ResponsiveGrid`); the `RunActionUseCase` / `ComponentStateHelper` state statics (→ `ComponentState`).

### Fixed
- Scanning `specs/ui` inside a jar no longer closes the JVM-cached JarFile ("zip file closed" under
  concurrent load, seen on Quarkus).
- Bean-validation messages follow the request's language (English when it names none); a `@Size`
  condition holds for a valid length; a definition-only YAML page names the window.
- Redwood: the create/edit drawer validates before Save leaves and marks its fields; header widget
  links navigate again.
- CRUD import: the dialog's upload hands the success handler the response it reads.
- React Native and IntelliJ: a non-proxied `@RestAction` naming its source by ref fetches the
  resolved endpoint; registrations stay per session / per app.
- IntelliJ: a drawer, dialog or confirm dialog renders in place in a headless render.
- The Vaadin renderer prints no Lumo / vaadin-card warnings of its own in the console.

### Performance
- Singleton beans on the request path are resolved once; view-model injection points are found
  once per class; the structure hash is digested while the canonical JSON is written; `specs/ui` is
  walked once per classloader.
- Eager web bundle 678.8 → 604.1 KB gzip (lazy optional elements); `mateu-field` split.

### Docs
- Security guide (CSRF, strict actions, identity source), configuration, the C# and Python manuals,
  `static-ui.md`, the wire specification (schemas, MCP tool names), navigation/shell pages and
  `parity.md` now describe what ships; one "Imports" callout per Java sample page; the Micronaut
  page covers virtual-thread pinning on JDK 21–23; starters and guides point at the latest release.

### Build and CI
- e2e runs as three parallel legs; backend tests in one Maven build; client conformance corpus
  (expressions, route params) in all four renderers; core layering and request-budget tests.

## [3.0-alpha.425] — 2026-10-17

Optimistic locking in the browser, new field types, MCP fixes and raised test coverage.

### Added
- Field types `BigInteger`, `java.util.Date`, `java.sql.Date`, `ZonedDateTime`, `File`, `Optional<…>`;
  `Status` fields render.
- Grid column groups reach every renderer.
- REST sources named by `ref` work on pages without an app shell (`UIIncrementDto.restSources`).

### Fixed
- **Optimistic locking**: the conflict dialog's Reload / Overwrite work in the browser (routed editor
  and drawer); texts in English and translatable; `@Version` hidden on edit forms.
- MCP: listings, search text and results, content under an app shell and `@EyesOnly` action
  filtering — Java, .NET, Python and the sidecar.
- Derived OpenAPI / generated server: path parameters as `{id}` / `@PathVariable`.
- Menus of non-root apps no longer double the mount; drawer forms validate in the browser;
  read-only passwords are masked; `@SeparatorBefore` inside `@Tab`; React Native button routes
  navigate; ~25 smaller renderer and port fixes.

### Build and CI
- Coverage raised with ratcheted floors (core 89 %, web lib 93 %, Vaadin 86 %, ports 95–97 %) and
  an end-to-end `journeys` suite.

## [3.0-alpha.424] — 2026-10-17

The .NET and Python servers serve the web renderer themselves.

### Added
- **The .NET and Python servers serve the web renderer**: `MapMateu(ui:)` (.NET), `add_mateu(ui=…)`
  (Python) or `MATEU_UI`.
- Any `specs/ui` file declaring `type: Types` is read; the ports' YAML gains `Listing` over a REST
  source and RouteLink buttons; .NET `PageBanners.Replace/Append`; .NET/Python record pages are
  titled by the record.

### Fixed
- Redwood: islands held by form fields, drawers under dialogs, `Callable<Component>` holders, the
  `@Toc` index, calendar event and map marker clicks.
- Listings send one search per delete/bulk action and per filtered deep link; `?page=N` deep links
  open that page.
- Number fields keep numbers in the state; `Callable<String>` renders as read-only text.
- IntelliJ: canvases (Gantt, Kanban, planning board, matrix grid) keep their height on long pages.

## [3.0-alpha.423] — 2026-10-17

GA walkthrough, batch 2: YAML authoring, data and tooling, native renderers and the ports as servers.

### Fixed
- GA walkthrough batch 2: YAML authoring, data and tooling (wizards, editor, bundle, OpenAPI), the
  native renderers and the .NET / Python servers — each fix with a permanent test.
- Helidon, Quarkus, Micronaut: refused YAML routes and streamed actions answer 403; data fetches to
  the index answer 404.
- React Native: stack-aware navigation (a saved create/edit form gives its place to the record);
  numeric and rich-text fields.
- .NET / Python: terminal-route rule aligned with Java; .NET `[Range]` follows Bean semantics.
- IntelliJ: the global-search editor has an accessible name.

## [3.0-alpha.422] — 2026-10-15

Redwood: pages whose header paints the toolbar keep their tables and web components.

### Fixed
- Redwood: a page whose header paints the toolbar keeps its tables and web components (since
  alpha.417 the content was JSON-copied, so embedded grids lost their data provider).

## [3.0-alpha.421] — 2026-10-14

Listings inside drawers and dialogs on Redwood.

### Fixed
- A `Listing` embedded in a Drawer or Dialog is drawn as a listing on Redwood (search, columns,
  paging, first page on opening, row clicks in the overlay), and its first search is no longer
  refused.

## [3.0-alpha.420] — 2026-10-14

Redwood scroll position on navigation.

### Fixed
- Redwood: another screen opens at its top (not on back/forward, deep links, live reload or embedded).

### Build and CI
- The Redwood suites run in English whatever the machine's locale.

## [3.0-alpha.419] — 2026-10-13

Wizard Back button and Redwood page bands.

### Fixed
- A wizard draws no Back button on the first step shown.
- Redwood: an `EntityHeader` fact with an action is not taken for a page button; content is no
  longer hidden under a sticky page band.

## [3.0-alpha.418] — 2026-10-13

Crud record pages: page types, widths and the folded section bar.

### Fixed
- A crud's record page is typed `detail` and its editor/creation form `form` (an explicit
  `@PageTemplate` still wins); an edge-to-edge form keeps its gutter; the folded section bar pins
  under the whole header block and the scrollspy highlights the clicked section.

## [3.0-alpha.417] — 2026-10-13

Redwood wizard navigation, tab buttons and light-only theme.

### Changed
- Redwood is light only: `@App(themeToggle)` is ignored there and no stored or OS dark preference
  applies (Vaadin unchanged).

### Fixed
- Redwood: leaving a wizard replaces it; a tab's buttons stay in their tab and the page toolbar is not
  repeated under the content.

## [3.0-alpha.416] — 2026-10-13

Actions on `EntityHeader` facts; Redwood forms in overlays keep their layout.

### Added
- `EntityHeader` facts can carry an action (an icon button after the value) — Java, .NET, Python;
  Vaadin, Redwood, React Native, IntelliJ.

### Fixed
- Redwood: a form in a Drawer or Dialog keeps its layout (section columns, `maxColumns`, rows, the
  dialog width, the title once).

## [3.0-alpha.415] — 2026-10-12

GA walkthrough, batch 1: ~120 fixes, each with a test.

### Changed
- **`@Button`/`@Toolbar` actions answer "There are validation errors"** when the form breaks a
  bean-validation constraint: the server re-checks what the browser enforced.
- An app naming no home opens on its first menu item; YAML apps are served next to `@UI` apps on
  every adapter; error toasts stay until dismissed; `List<Enum>` is a multi-select; markdown/html
  fields edit with a preview; Redwood keeps listing state in the URL.

### Fixed
- ~120 fixes across the app shell and navigation, actions/events/overlays, forms/fields/wizards,
  page archetypes, display components, listings and CRUD — each with a test. Redwood no longer
  answers 400 on page load.

## [3.0-alpha.414] — 2026-10-12

Lambda buttons work again; card menus authored in YAML.

### Added
- **Card menus authored in YAML**, emitted by static bundles and edited by the visual editor.

### Fixed
- **Buttons with a lambda handler** (`new Button("Increment", () -> …)`) work again — since alpha.411
  they were not advertised to the browser; a lambda button inside a `Card` is runnable too.
- A YAML menu group no longer prefixes `null/` to its entries' routes.

## [3.0-alpha.413] — 2026-10-12

Every new project is a working app; YAML parity for page and shell headers.

### Added
- **Every new project is a working app**: the New Project wizard (IntelliJ, VS Code, archetype) generates
  an app shell with a menu, a Home page and the Products CRUD on every flavour × runtime.
- **YAML parity**: page header extras (`overline`, `titlePlaceholder`, `timestamp`, `badges`, `kpis`,
  `peerNav`, `recordSwitcher`, `banners`, `fabs`) and app-shell header features (`contextSelectors`,
  `headerActions`, `notifications`, source-backed `globalSearch`) are authorable in YAML;
  `pageType:` on YAML pages; .NET and Python gain YAML `type: Form` pages.
- Redwood: full page header and source-backed inbox / global search.
- Ports: listing/CRUD wire parity with Java (five new conformance cases), `HomeRouteSupplier`.

### Fixed
- Ports: delete acts on the selected rows; the Id column links to the record.
- IDE: the Mateu YAML schema applies in IntelliJ; visual editor fixes; New › Mateu wizards no longer
  trap on "already exists"; the New Project wizard validates inline.

### Documentation, starters and demos
- "What a Mateu UI is made of" and a top-down UX guide.

## [3.0-alpha.412] — 2026-10-12

External Mateu UIs, the mobile hub (server side) and the pre-beta API decisions.

### Breaking
- **.NET / Python proxied REST calls surface failures** like Java: a >=400 or transport error
  answers `_restfetchError {status, message}` instead of an empty `_restfetch` the renderer read as
  success; values interpolated into a JSON body are escaped; .NET sends a declared `Content-Type`
  (it was dropped, so a JSON body travelled as `text/plain`); .NET answers a malformed sync body with
  an error toast instead of a raw 500.

### Added
- **Mateu mobile, phase 1 (experimental)** — the server half of one generic Mateu app to which UIs
  are added by QR, like accounts in an authenticator ([Mobile app](https://mateu.io/ux-patterns/mobile-app/)):
  - `GET <baseUrl>/mateu/v3/manifest`: public, cacheable JSON with the UI's name, short name,
    icon, theme colour, wire and minimum app versions and, optionally, the OpenID Connect issuer +
    client id the host app trusts. Values come from `@Title`/`@Logo`/`@App(accentColor)`, the
    new `@MobileApp` and the `mateu.mobile.*` settings (system property or `MATEU_MOBILE_*`
    env var, which win). Served by the five Java adapters (`@UI` and YAML mounts), ASP.NET Core
    (`[MobileApp]`) and FastAPI (`@mobile_app`), member for member. Mateu still validates no
    token: the manifest only names the identity provider.
  - "Open on mobile": `@App(mobileQr = true)` / YAML `mobileQr: true` / `[App(MobileQr = true)]` /
    `@app(mobile_qr=True)` → `AppDto.mobileQr` → a header button (Vaadin and Redwood) opening a
    dialog with the QR of `https://mateu.io/add?u=<base URL>&r=<route>`, the link to copy and,
    on a phone, an "Open in the Mateu app" link instead. The QR is drawn by Mateu's own
    dependency-free encoder, in a lazy chunk.
  - `mateu.io/add`, the landing page the link opens when the app is not installed (store links are
    placeholders until the app is published), plus templates of the universal/App Link files.
- **Using external Mateu UIs**: a third-party UI module (a jar of `@UI` screens, e.g. a workflow
  engine's console) is mounted in-process by naming its package — `mateu.ui.modules=…` or
  `@EnableMateuUiModules` (Spring MVC and WebFlux) — since Mateu no longer scans `io.mateu.*`; a
  named package with no beans is warned about. Guide *Using external Mateu UIs*, with EventConductor
  as the worked example (`demo/demo-eventconductor`, `e2e/external-ui-probe.mjs`).

### Public API
- **Pre-beta API decisions** (3.0-alpha.412; the owner's resolutions of the open questions in
  `design/api-freeze-review.md`). Nothing is removed — every rename is an addition plus a deprecation:
  - **Wire DTOs are outside the Java binary promise**: the contract of `mateu-dtos` is the JSON wire,
    versioned by `wireVersion`. japicmp still reports on it but never blocks for it, so the allowlist
    no longer needs an entry per new wire field. Build DTOs through their builders.
  - **japicmp baseline → `3.0-alpha.411`**; the allowlist is back to the sentinel (every entry
    described the diff against alpha.408), and `-Dmateu.api.enforce=true` passes.
  - **The wire now says `HAMBURGER_MENU`**: the Java, .NET and Python servers send the right
    spelling; every first-party renderer accepts both (`HAMBURGUER_MENU` from an older server still
    renders), as the web and Redwood renderers have since 3.0-alpha.387. `AppVariantDto.HAMBURGUER_MENU`
    is deprecated. A renderer that only knows the old spelling (pre-alpha.387, or a custom one) would
    not draw the hamburger chrome for a new server — ship server and renderer together.
  - **`HeaderBadgesSupplier`** (`headerBadges()`) — named after `@BadgeInHeader` — replaces
    `BadgeSupplier`, which is deprecated and keeps working.
  - **`Button.resolvedActionId()`** — the id the button dispatches (declared, else derived from the
    label); `getActionId()` is deprecated (same value). `actionId()` stays the declared one. No wire
    change.
  - **`@KeycloakSecured` is deprecated** (still works): identity comes from the host framework's
    security or a `PrincipalResolver` — see the Security page.
  - **Inference switches unified**: `mateu.layout.inference.enabled` (default `false`) and
    `mateu.page.inference.enabled` (default `true`) — system property or `MATEU_…` env var; .NET
    `Mateu.LayoutInference.Enabled` / `Mateu.PageInference.Enabled`; Python
    `MATEU_LAYOUT_INFERENCE_ENABLED` / `MATEU_PAGE_INFERENCE_ENABLED`. The old
    `mateu.layout.inference` / `mateu.page.inference.disabled` (and the .NET switches) still work and
    warn once.
  - **.NET code-authoring types in `Mateu.Uidl`**: `IRouteEntrySupplier`, `IAppSupplier`,
    `IMenuSupplier`, `AppShell` and `RouteEntry` moved to the `Mateu.Uidl` assembly (same full names;
    `Mateu.Core` type-forwards them), so a UI-only module can author routes and shells in code.
  - **Python `Length`** is the length constraint; `Size` is deprecated (warns) — in Java and .NET
    `Size` is the sizing intent.
  - **Port idioms documented** in the parity matrix (menus, KPI, wizard steps and completion,
    progress style, edit-in-drawer, action options, toast variants). The port-only `[Secured]` /
    `@secured`, which was silently ignored, is now **enforced** with the semantics of
    `EyesOnly(permissions = …)` (view and actions 403, menu entries hidden) and deprecated in favour
    of `EyesOnly` — a view that carried it is no longer open to everyone.
- **The whole row opens the record**: on a navigable listing (a view per row, or `rowRoute`) a click
  anywhere on the row opens it — not only on the id link — in the web (Vaadin), Redwood, React
  Native and IntelliJ renderers. Clicks on the selection checkbox, on inline editors and on display
  columns (buttons, links, menus, action groups, components, columns with their own action) keep
  doing their own thing; Enter on a focused row opens it.
- **KPI timeframe** (`@Experimental`): `MetricCard.timeframe` ("Last 7 days") is shown under the
  value in every renderer and is part of the tile's accessible name; a dashboard whose KPI tiles
  carry no timeframe logs a one-time hint. Also in .NET (`Timeframe`) and Python (`timeframe`). The
  dashboard page gained a KPI checklist.

### Fixed
- **A remote screen under a YAML shell** (`type: AppShell` with a `RemoteMenu`) answered "Page not
  found" on a reload, a bookmark or a shared link: unclaimed routes are now offered to the shell's
  remotes, as an `@UI` class shell always did.
- **A custom element of a remote screen** (`Element` with `import: /…`) loaded its module from the
  shell's origin and 404'd; a root-relative module url of a remote screen is now resolved against
  the remote's origin (which must serve it with CORS).
- **Non-root apps**: no loop on mount-prefixed routes; route-typed `@Menu` entries go to the route they
  name on every adapter.

### Documentation, starters and demos
- Docs repositioned around "define the UI once — YAML, the visual editor, or code in Java, C# or
  Python — and render it anywhere, served or static"; guides for app stores, Netlify and Hetzner.
  Demos moved to `swapi.mateu.io` / `demo.mateu.io`.

### Build and CI
- NuGet and PyPI (`mateu-ui`) published through trusted publishing; adapter coverage covers YAML
  mounts and the runtime bundle.

## [3.0-alpha.411] — 2026-10-10

UX review of every renderer (method: *How Mateu's UX is evaluated*); findings in `design/ux-review/`.

### Fixed
- **Web (Vaadin + Redwood)**: axe violations across 580 screens fell from 1,193 to 136; synthetic
  users completed 24/28 tasks (was 13/28). Forms, tabs and accordions collapse to one column on
  phones; safe delete (disabled until rows are selected, confirmation defaults to Cancel);
  accessible names; contrast; Redwood dark mode; one icon family per renderer; search finds what
  the listing shows; numeric columns typed, right-aligned and locale-formatted (Java, .NET,
  Python); validation messages use field labels.
- **React Native**: New/Delete sent their request; values no longer go missing; AA contrast; row
  selection for screen readers; Android Back; retry after a failed load. **IntelliJ**: badge
  contrast, accessible names, KPI tiles.
- **No silent failures**: a missing annotation processor, two root UIs, an unparseable YAML
  definition (file, line, key, valid values) and a missing layout file are reported clearly in
  Java, .NET and Python.

### Build and CI
- A CI ratchet against hard-coded design values (`scripts/check-design-tokens.mjs`).

## [3.0-alpha.410] — 2026-10-10

Security (identity only from the host framework), Mateu ships UI only, documents and printing.

### Breaking
- **Roles no longer come from unverified tokens** (security). `@EyesOnly`, `@ReadOnlyUnless`,
  `@DisabledUnless`, YAML `access:` and menu visibility used to read the Bearer token's payload
  without checking its signature, so anyone could forge roles. **Mateu does not authenticate**: the
  caller's identity now comes only from the principal the host framework authenticated (Spring
  Security, Quarkus `SecurityIdentity`, Micronaut `Authentication`, the JAX-RS `SecurityContext`
  on Helidon) or a `PrincipalResolver` bean the app registers (`io.mateu.uidl.security`). A token
  on its own grants nothing; with no security module on the classpath a WARN at startup says
  restricted UI will be hidden. .NET already read only `HttpContext.User`; Python reads
  `request.state.mateu_identity` or Starlette's `AuthenticationMiddleware` (`jwt_identity_provider`
  and the `jwt` extra are removed). A field hidden by `@EyesOnly` is also left out of the
  component state. `java-jwt` is no longer a dependency of `mateu-core`.
- **Spring: no more component scan of all `io.mateu`.** The generated configuration used to scan
  the whole package, pulling in the beans of any third-party library living under `io.mateu.*`
  (e.g. a workflow engine's own UI). Mateu's beans now come from the adapter's auto-configuration,
  which scans only Mateu's packages. Apps no longer need `scanBasePackages = "io.mateu"` — drop it
  (and scan your own packages if your code lives under `io.mateu.*`).

### Added
- **Documents and printing** (`@Experimental`): an action returns a `Document` (filename, media
  type, bytes or a lazy supplier, `inline`|`attachment`, `printed()`) and the client shows it in a
  new tab, downloads it or opens the print dialog for it. Small documents ride the response; large
  and lazy ones are fetched once from a short-lived URL, `<baseUrl>/mateu/v3/documents/<token>`,
  served by all five Java adapters, ASP.NET Core and FastAPI. `UICommand.print()` prints the current
  page without the app chrome (Ctrl+P too). Mateu delivers documents but does not produce them:
  `DocumentRenderer` (HTML in, bytes out, laid out by a `PageSetup`) is a port the application
  implements with the library of its choice — no implementation ships. Vaadin, Redwood, React Native
  (system browser / share sheet) and IntelliJ (save dialog / OS viewer / print). See *Documents and
  printing* in the UX patterns.
- A JPA (`jakarta`/`javax.persistence.Version`) or Spring Data `@Version` on an entity now joins
  Mateu's optimistic locking: same conflict dialog, version incremented by the provider, not by Mateu.
- Visual editor: canvas ⇄ Layers ⇄ Properties selection, a project image picker, and navigation
  editing on the Board.

### Public API
- **API freeze review** (before the beta; full report in `design/api-freeze-review.md`):
  - **Deprecated** (still working; each names its replacement — see
    [Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/#deprecated-in-30-alpha410-still-working)):
    `AppVariant.HAMBURGUER_MENU` → `HAMBURGER_MENU`; the never-read `@GenericClass`,
    `annotations.ActionType`, the empty `ActionPosition` / `ActionStereotype` / `ActionThemeVariant`
    enums, `Binding`/`BindingSource`, `ClientSideEvent`, `Destination`, `ListAdapter` (→ `Listing`),
    `ColumnLayoutSelector`; 28 wire DTOs that no live DTO reaches. .NET marks `DashboardLayout` /
    `ContentLayout` `[Obsolete]` and Python warns on them, like Java's `@Deprecated`.
  - **`@Experimental`** now covers the 3.0-alpha.409 pattern-gap and PMS-parity APIs (display options,
    wizard drafts/hooks, record switcher, docked panels, `@Section` affordances, hero tones,
    `UICommand.announce`, pre-search content, action panel, matrix grid, map markers, drag rows /
    drop zones, access keys, card menus, calendar views, popovers/tooltips, row tones, reorderable
    dashboards, the action catalogue, the not-found page).
  - The stability page carries a **generated Stable / Experimental / Deprecated / Internal list** by
    package (`ApiStabilityListTest` fails when it is stale), and defines what the beta promises.
  - **japicmp** compares against `3.0-alpha.408` under the `mateu-*` ids; `-Dmateu.api.enforce=true`
    makes it blocking (it passes today); flip the default at the beta tag.
  - `DeprecationsNameTheirReplacementTest` (Java), `ApiFreezeTests` (.NET) and `test_api_freeze.py`
    (Python) fail on a deprecation that does not name its replacement.
  - Parity: .NET `AppVariant` constants and Python `AppVariant` enum (the right spelling travels under
    the wire name every renderer reads); Python aliases `BadgeInHeader` (= `HeaderBadge`) and
    `PageWidthStyle` (= `PageWidth`); 15 public Python names that were missing from
    `mateu_uidl.__all__` added.
  - `HeroSection` and `FoldoutPanel` regain their 3.0-alpha.408 constructors (alpha.409 had dropped
    them when adding `tone` / `summary`).

### Mateu ships UI only
- **Listing export engines are the application's.** The `mateu-export-excel` (Apache POI) and
  `mateu-export-pdf` (PDFBox) modules are **removed** (with their relocation poms and BOM entries),
  and no spreadsheet / PDF library is in Mateu's dependency graph any more. Mateu keeps everything
  that is UI — the Export buttons, the choice of columns, rows and filters, the download — and
  generation is a port the application implements: `ListingExporter` (`format()` +
  `export(ListingExport, HttpRequest)` → `ExportedFile`), replacing `ExcelExporter` / `PdfExporter`
  / `CsvExporter`. A listing opted into Excel / PDF shows the button only while an exporter for that
  format is registered; a request for a format nobody writes is answered with a message, never a 500.
  CSV keeps its dependency-free built-in writer. Same in the ports: .NET `IListingExporter` (the
  hand-written xlsx / PDF writers are gone), Python `ListingExporter` (the `export` extra with
  openpyxl / reportlab is gone). See [Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/).
- **`agent-cli` and `agent-cli-companion` removed** — the development bridge from the AI chat to a
  local LLM CLI is not UI. The chat panel, its SSE contract and the MCP endpoint stay; the chat no
  longer probes `127.0.0.1:8776` for a local companion (web and Redwood).

### Fixed
- **Enum values in grid and listing cells** read as their labels ("In house", not `IN_HOUSE`) on
  every renderer — the same `@Label` > `toString()` > humanized rule the form options use, carried
  as `GridColumn.valueLabels`. Rows keep the raw value (sorting, filtering, selection, editing).
  Java, .NET and Python; Vaadin, Redwood, React Native and IntelliJ.
- **`@NotNavigable` cruds no longer serve their record page** to a typed or bookmarked
  `/{id}` URL; it answers the not-found page.
- **`@Compact` on Redwood** (and on cruds/listings everywhere): dense `display="grid"` tables and
  Redwood's small-control density tokens; a `@Compact` crud now sets `CrudlDto.compact` and the
  high-density preset on its pages (Java, .NET, Python).
- **A crud mounted at the root (`@UI("")`) on Redwood** loaded "Not found": the shell's
  `__load__` bootstrap reached the crud as an action ("`__load__` not supported", logged as an
  ERROR) and the content load consumed `/` instead of `""`. `__load__` is now the route load for
  every view, a consumed `/` is the mount root, and the Redwood shell sends `""`.
- `@Autowired`/`@Inject` fields on view models Mateu instantiates are injected, as documented.
- The BOM manages the pre-rename artifact ids, so there is no second copy of Mateu on the classpath.
- The backend builds on JDK 26.

### Documentation, starters and demos
- **New Mateu project, everywhere**: IntelliJ **File › New › Project › Mateu**, VS Code **Mateu:
  New Project…** and the **`io.mateu:mateu-archetype`** Maven archetype (`-Dauthoring=code|yaml|static`)
  generate the same project from the same templates — the starters — via one description
  (`starters/generator/new-project.json`): authoring (code, YAML served by a backend, static YAML,
  code + YAML), runtime, renderer, sample, page templates, coordinates, latest release. Two new
  starters, `yaml` (no UI code) and `static` (no backend), are built and smoke-tested like the rest.
  Every starter and generated project ships an `AGENTS.md` plus a `CLAUDE.md` that imports it.

### Build and CI
- Actions pinned by SHA, least-privilege permissions, `--ignore-scripts`; aggregate checks
  `ci-ok`, `examples-ok`, `docs-ok`.

## [3.0-alpha.409] — 2026-10-10

More authoring kinds under `specs/ui/`, live reload, Mateu embedded in Visual Builder apps.

### Added
- **Authoring kinds under `specs/ui/`** (`@Experimental`): YAML permissions (access keys on routes,
  menus, fields and actions), translations (`${i18n.key}`, one file per locale), environments,
  field types (`types.yaml`, `fieldType:`, `tones`), sample data on sources (`sample:` /
  `sampleFile:`) and project settings (`type: Project`, `renderer: vaadin | redwood`).
- **Live reload** (`mateu.dev=true` / `MATEU_DEV=true`): an edited spec re-renders the open screen in
  place, keeping what was typed — all five adapters, .NET and Python; IntelliJ "Run Mateu App (Live)"
  and the VS Code equivalent.
- **Mateu embedded in Visual Builder apps**: the `<mateu-ui>` JET component, attached to the release
  as `mateu-ui-*.zip`.
- Redwood pattern gaps closed on the open renderers: per-archetype display options, GeneralOverview
  info slot, wizard drafts / skip / finish early / cancelable `beforeStepNavigate`, drawer "Save and
  next" and error banner, foldout summary, DataManagement docked panels, `RecordSwitcherSupplier`,
  section Add/Edit/View more, hero tone, `UICommand.announce`, SmartSearch pre-search content.

### Fixed
- Micronaut: the YAML translations bean was missing, so every YAML screen answered 500.
- Vaadin edit drawer: the record id reaches the server and typed values survive re-renders.
- CodeQL findings in the VS Code live launcher.

## [3.0-alpha.408] — 2026-10-10

Maven artifacts renamed to `mateu-*`; the public API is prepared for the beta.

### Breaking
- **Maven artifacts renamed to `mateu-*`**: `io.mateu:mvc-core` → `io.mateu:mateu-mvc`, `uidl` →
  `mateu-uidl`, `vaadin-lit` → `mateu-vaadin`, `annotation-processor-mvc` →
  `mateu-annotation-processor-mvc`… (full table in the migration guide). The old coordinates are
  published as relocation poms, so existing builds keep resolving with a warning.
- **No-op annotations removed** from `io.mateu.uidl.annotations` — nothing ever read them:
  `@Accordion`, `@AccordionPanel`, `@BaseRoute`, `@H1`…`@H5`, `@HorizontalLayout`, `@VerticalLayout`,
  `@SplitLayout`, `@Scroller`, `@Option`, `@RowAction`, `@State`, `@Tabs`. Each has a one-line
  replacement in the migration guide. `@BusinessComponent` now works (it was also unread): a
  field / no-arg method of a registered class holding a `Component` joins the business-component
  catalogue.

### Security
- Dependabot backlog: 93 of 102 alerts fixed; the rest documented in `SECURITY-DEPENDENCIES.md`.

### Added
- Shared **action catalogue** (`specs/ui/actions.yaml`) referenced from app shells, pages and flows;
  app shell `actions:` flows, widgets and header switches; visual editor: Redwood live canvas,
  route and action-id pickers.

### Public API
- **`@Experimental`** (`io.mateu.uidl.annotations`) marks API outside the stability promise — it may
  change in a minor release. Marked today: the AI assistant (`@AI`, `Chat`, the MCP wiring); the
  Figma contract is documented as experimental.
- **Name collisions pinned**: the simple names shared by two uidl packages (annotation ⇄ record
  pairs such as `@Badge`/`Badge`) are listed on the stability page with the explicit-import rule,
  and `NameCollisionsTest` fails on a new one. Removing the no-op annotations dropped seven of them
  (`HorizontalLayout`, `VerticalLayout`, `SplitLayout`, `Scroller`, `AccordionPanel`, `Option`,
  `State`); the empty `fluent.ActionType` enum went too.
- **Wire version check** in every first-party renderer (web/Vaadin, Redwood, React Native, IntelliJ):
  a server speaking another wire major gets one clear message instead of a broken screen.

### Build and CI
- CI builds the starters and demos against the commit being built, not the last release.

## [3.0-alpha.407] — 2026-10-10

GA readiness: nine work streams integrated. Read [Migrating from alpha](https://mateu.io/reference/migrating-from-alpha/) before upgrading.

### Breaking
- **CORS is off by default** on every adapter; allow origins with `mateu.cors.allowed-origins`.
- **The MCP endpoint is off by default**; `mateu.mcp.enabled=true`. Now also on the ports: .NET
  `MateuOptions.Mcp = true` / Python `add_mateu(..., mcp=True)` (or `MATEU_MCP_ENABLED=true` on
  both); a failing MCP tool call answers the error boundary's generic text + reference, never the
  raw exception.
- **`${secret.X}`** falls back only to the env var `MATEU_SECRET_X` (Java, .NET, Python).
- **RunJS is opt-in** (`<meta name="mateu-allow-run-js" content="true">`).
- **Quarkus** apps declare `quarkus-rest-jackson`; `quarkus-spring-di` is no longer brought in.
- The Spring bean `objectMapper` is now `mateuObjectMapper`.
- Python: CORS needs `cors_origins=[...]`; the distribution is **`mateu-ui`** on PyPI.

### Security
- An **error boundary** on every backend: `UserFacingException` messages are shown as written;
  anything else shows a generic message with a reference id, logged at ERROR under it.
- Proxied REST URLs are percent-encoded by position on every server and renderer.
- Strict CSP works: expressions run in Mateu's own sandboxed evaluator (no `new Function`).
- Server-sent URLs are checked (`javascript:` refused); token storage is configurable.

### Added
- `io.mateu:mateu-bom`; annotation processors are Gradle-incremental.
- SSE / LongTask on WebFlux, Quarkus and Helidon; client-log, asset caching, YAML mounts and the
  deep-link fallback on every adapter.
- A UI mount declares its home page: `home:` on `type: UI` (Java, .NET, Python).
- The client's own text in English and Spanish, chosen by `Translator.locale(…)` (`AppDto.locale`).
- Redwood renders every wire component type; chat panel, FABs, theme toggle, global search;
  reproducible ~5 MB jar that works at any mount path; `Map` takes `tileUrl`/`attribution`.
- .NET: net8.0 + net10.0, NuGet release job. Python: published to PyPI as `mateu-ui`, mypy-clean,
  split into modules, identity and secrets providers, Excel/PDF exports, embedded islands and more.
- IDE tooling: New › Mateu for every specs/ui file kind, Add Route…, a settings page and
  authentication in IntelliJ; the same in VS Code ("Mateu: New File…", "Mateu: Add Route…").

### Fixed
- .NET and Python primary buttons were sent as `"Primary"` and rendered as plain buttons.
- A nested `@Text`/`@Notice` read its state with an expression that evaluated as a subtraction.
- A dashboard `@Panel` holding a `Text` advertised twelve list actions nothing could trigger.
- A streamed action on the root view of a mount did nothing; LongTask steps no longer retitle the tab.
- The wire conformance corpus (25 cases) now matches exactly in Java, .NET and Python.

### Documentation, starters and demos
- **Starters**: `starters/` holds the smallest complete app on every runtime — Spring MVC, Spring
  WebFlux, Quarkus, Micronaut, Helidon MP, ASP.NET Core (C#) and FastAPI (Python). CI compiles the
  Java ones against each commit, boots them and loads their CRUD. The quickstart is the Spring MVC
  starter, file for file.
- **Demos**: every demo takes the Mateu version from a `mateu.version` property; the "start here"
  demos default to the latest release, the showcase demos to the local snapshot. All demos are on
  Spring Boot 4 / Java 21 and have distinct ports. CI compiles every demo against each commit.
- **Docs site**: built on every PR with a broken-link check, deployed from `master` and on every
  release. Every `AutoCrud` snippet now compiles (`store()` is mandatory). New pages: Stability &
  versioning, Migrating from alpha, Deploy to production.
- `CONTRIBUTING.md`, `SECURITY.md` (private reporting through GitHub Security Advisories), a pull
  request template and `CODEOWNERS`.

## [3.0-alpha.406] — 2026-10-10

Licensing for GA.

- The Apache-2.0 web bundle (`vaadin-lit`) no longer ships any Vaadin commercial component.
- CI fails the build when a bundled frontend package is not under an approved licence.
- Redwood: the starter files were rewritten as Mateu code; neutral branding by default.

## [3.0-alpha.405] — 2026-10-10

Redwood renderer: OPERA Cloud-like PMS parity, and the features it needed everywhere.

### Added
- **Drag rows to a destination** — `@DragRows` on a listing + `DropZone`.
- **Hover details** — `Popover` with a hover trigger, and `@Tooltip` on listing cells.
- **Action panel** ("I want to…"), **matrix grid**, **card menus** (`@Menu(display = cards)`).
- **Calendar** day / week / month / list views, per-date cells and clickable dates.
- **Keyboard access keys** (`@App(accessKeys = true)`), and `@Action(shortcut)` on Redwood.
- **Map** with markers (`Map.markers` + `markerActionId`) on Java, Vaadin, Redwood, React Native,
  IntelliJ, .NET and Python.
- **Reorderable dashboard tiles** (`ResponsiveGrid.reorderable`), also on .NET and Python.
- A wizard completion action that streams (`LongTask`) lands on the result step.
- Redwood: rich text (Markdown), Gantt, fluent Grid, images/avatars/galleries, dashboards and charts
  on any page, notification bell and undoable toasts, periodic refresh.
- Row tones (`@RowStatus`) and listing exports on `AutoCrud`; also on .NET and Python listings.
- `PlanningBoard` (Room Diary): attribute columns, icons, hover summary, resize, double click,
  range selection.
- Redwood: listings with groups/subtotals/totals, column chooser and saved views; client-side rules
  and dependent fields; more field types (radio, multi-select, money, file, image, signature,
  camera); master-detail and split layouts.

### Changed
- **Enum constants are labelled by their name humanized** (`OUT_OF_STOCK` → "Out of stock"), not the
  raw constant.
- A view advertises only the tree action ids it can actually run.

### Fixed
- Redwood: rich text sanitised by the right function; rule selectors fully escaped; only safe schemes
  as a capture image `src`; a finished guided process says so.
- The `vaadin-lit` jar no longer ships stale build files (including Highcharts).

## [3.0-alpha.404] — 2026-10-09

- Visual editor: **Tidy** (fixed-rule structure clean-ups), the **board** (every screen and the flow
  between them) and play mode, design notes on any component, desktop/tablet/phone widths.

## [3.0-alpha.403] — 2026-10-09

- Visual editor: share links (`#mateuz=`), an agent guide, palette cards with real Vaadin and
  Redwood thumbnails, and a look selector.

## [3.0-alpha.402] — 2026-10-07

- **Not-found page**: a route whose record does not exist (a `NoSuchElementException` while the
  route loads) answers a `NotFound` component instead of an error.
- WebFlux: a UI's own sub-route beats the root UI's deep route. WebFlux, Quarkus and Helidon: a deep
  route answers the index instead of a 404.
- Publishing: Maven pinned to 3.9.16 (3.10.0 broke the Central bundle).

## [3.0-alpha.401] — 2026-10-06

- Vaadin: the generated accent strip tiles without a seam.

## [3.0-alpha.400] — 2026-10-06

- Vaadin: `@App(accentColor)` alone gets a generated Redwood-style accent strip.

[Unreleased]: https://github.com/miguelperezcolom/mateu/compare/v3.0-alpha.425...HEAD
[3.0-alpha.425]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.425
[3.0-alpha.424]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.424
[3.0-alpha.423]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.423
[3.0-alpha.422]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.422
[3.0-alpha.421]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.421
[3.0-alpha.420]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.420
[3.0-alpha.419]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.419
[3.0-alpha.418]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.418
[3.0-alpha.417]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.417
[3.0-alpha.416]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.416
[3.0-alpha.415]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.415
[3.0-alpha.414]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.414
[3.0-alpha.413]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.413
[3.0-alpha.412]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.412
[3.0-alpha.411]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.411
[3.0-alpha.410]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.410
[3.0-alpha.409]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.409
[3.0-alpha.408]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.408
[3.0-alpha.407]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.407
[3.0-alpha.406]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.406
[3.0-alpha.405]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.405
[3.0-alpha.404]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.404
[3.0-alpha.403]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.403
[3.0-alpha.402]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.402
[3.0-alpha.401]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.401
[3.0-alpha.400]: https://github.com/miguelperezcolom/mateu/releases/tag/v3.0-alpha.400
