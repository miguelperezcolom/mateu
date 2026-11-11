# Changelog

All notable changes to Mateu. Versions follow the scheme described in
[Stability & versioning](https://mateu.io/reference/stability-and-versioning/); every release is a
git tag `vX.Y-…` and a GitHub release whose artifacts are on Maven Central under `io.mateu`.

This file starts at `v3.0-alpha.400`. For older releases, see the GitHub releases page.

## [Unreleased]

### Added

- **Sign-in providers (server side).** A UI declares the ways to sign in —
  `mateu.auth.providers=keycloak,github` with `mateu.auth.providers.<id>.type|label|icon|issuer|
  client-id|scopes|audience|url|platforms|continue-param|tenant`, `mateu.auth.login-on-start`,
  `mateu.auth.logout-url` (env `MATEU_AUTH_*`), or in code a `SignInProvidersSupplier` bean (Java,
  `io.mateu.uidl.security.SignInProvider`), `MateuOptions.SignIn` (.NET), `add_mateu(sign_in=[…])`
  (Python). Well-known ids fill themselves in (`google`, `microsoft` + `tenant`, `entra`, `github`,
  `apple`, `facebook`, `x`, `linkedin`, `gitlab` → `/oauth2/authorization/<id>`; `keycloak`, `okta`,
  `auth0`, `cognito`, `zitadel`, `authentik` with your issuer). The mobile manifest's `auth` gains
  `providers`, `loginOnStart` and `logoutUrl` (its `type`/`issuer`/`clientId`/`scopes` stay, = the
  first oidc provider offered on mobile, for the published phone app), and every served page — every
  Java adapter, YAML mounts, the Redwood page, .NET and Python — carries the web providers in
  `<meta name="mateu-auth">`. `@MobileApp(oidcIssuer…)` / `mateu.mobile.oidc.*` keep working as the
  native-only provider `default`. An unusable provider is skipped with a WARN at startup. Pinned
  byte for byte by `conformance/client/sign-in.json` in the three backends and by
  `AdapterParityITFoundation.offersTheSignInProviders` on the five adapters. Guide:
  [Sign-in providers](https://mateu.io/deploy/sign-in/). Mateu still validates nothing: the host
  framework does.

### Security

- **A route seed of a YAML field hidden from the caller no longer travels to them.** The `state:` /
  `defaultParams:` / `fixedParams:` seeds of a definition-only page were applied after the access
  keys, so the value of an `eyesOnly:` / `access:` field reached a caller who may not see it. Fixed in
  Java, .NET and Python, for fields of the page and of the business components it draws (conformance
  case `yaml-eyes-only` now seeds the hidden field).
- **The web clients keep the Bearer token in a cookie by default** (Vaadin/libs `authToken.ts`,
  Redwood `poc/authStore.mjs`): `__mateu_auth_token=<token>; Path=<the mount>; SameSite=Strict`,
  `Secure` on https, no `Domain`, `Max-Age` from the token's expiry (else a session cookie) — it was
  `localStorage`. Requests still send `Authorization: Bearer`; servers read the header, never the
  cookie. Cookies disabled, a write that does not read back or a token over ~3800 bytes fall back
  to `sessionStorage` (then memory); reads look in the cookie, the configured storage,
  `sessionStorage`, `localStorage`; writing or clearing removes every other copy.
  `<meta name="mateu-auth-token-storage">` / `configureAuthToken({ storage, cookiePath })` accept
  `cookie | localStorage | sessionStorage | memory` (now on Redwood too). The built-in sign-in's
  refresh and id tokens never go into the cookie: `sessionStorage` (`__mateu_auth_session_secrets`)
  by default, the non-secret part of the record in `localStorage`. A script-written cookie cannot be
  HttpOnly; the docs now show how to let the framework keep an HttpOnly session instead
  ([deploy/sign-in.md](https://mateu.io/deploy/sign-in/#httponly-cookie-let-the-server-keep-the-session)).

### Added — sign-in providers on the web

- **The web renderers sign the user in themselves when the UI declares sign-in providers**
  (`<meta name="mateu-auth">`, see [Sign-in providers](https://mateu.io/deploy/sign-in/)). One
  provider is followed straight away, several are offered in an accessible chooser ("Continue with
  …", English/Spanish, no brand artwork). OIDC providers run Authorization Code + PKCE (S256) with
  state and nonce, come back to the route the user was on, refresh before expiry and on a 401;
  redirect providers go to the framework's login URL with `continue=`. A 401 nobody else handles is
  refreshed and retried, else the user signs in again; an `onSessionExpired` handler, a claimed
  `mateu-session-expired` event or `configureAuthToken({ provider })` still take precedence.
  "Sign out" appears in the header (and `signOut()` from `mateu`): end_session at the IdP or the
  framework's `logoutUrl`. Vaadin (libs/mateu `infra/auth`) and Redwood (`poc/signIn.mjs`) are held
  to the new client corpus `conformance/client/sign-in-flow.json`; browser probe
  `e2e/sign-in-probe.mjs` (mock IdP).

### Added — sign-in providers in the native apps

- **The phone and desktop apps offer every sign-in provider a UI declares** (`auth.providers`): the
  `oidc` ones for their platform, straight to the one there is, or a chooser ("Continue with …", the
  provider used last first) when there are several. A `redirect` provider is not offered by a native
  app (its login ends in a browser cookie, not a token). A manifest with only the single `auth.issuer`
  / `clientId` keys is provider `default`, as before. One signed-in provider per UI; sign-out uses the
  provider that signed in. Corpus `conformance/client/sign-in-flow-native.json`, run by both apps.
- **The desktop app signs in without a device grant**: when the provider's discovery has no
  `device_authorization_endpoint` (Google, Apple, most social providers), it uses Authorization Code +
  PKCE with a loopback redirect (`http://127.0.0.1:<port>/callback`, RFC 8252). It also signs in when a
  UI opens (the manifest's `loginOnStart`), not only on the first 401, and its settings gained an OIDC
  `audience`.

### Added

- **Remote push to phones (experimental).** With `@App(osNotifications = true)` and a sender, an
  `inbox` message to a signed-in user also reaches their phone while the Mateu app is suspended or
  closed. The phone registers its Expo push token through the reserved app-level action
  `_push-register`, and removes it with `_push-unregister` on sign-out, when the UI leaves the hub, or
  when notifications are turned off. A tapped push opens its UI at its route, and a push that arrives
  while the app is in front is not shown twice. Delivery is behind interfaces: `PushSender` and
  `PushTokenStore` (in memory by default, lost on restart, with a WARN), plus
  `PushNotifications.send(user, …)` for your own entries. Mateu's optional Expo sender is turned on
  with `mateu.push.expo.enabled=true` (batches of 100; `DeviceNotRegistered` unregisters the token).
  The wire adds `AppDto.pushNotifications`. The same API exists in .NET (`IPushSender`,
  `IPushTokenStore`, `MateuOptions.ExpoPush`) and Python (`add_mateu(push_sender=…, expo_push=True)`).
  Phone builds need your FCM `google-services.json` (`GOOGLE_SERVICES_JSON`) and an APNs key
  (`MATEU_IOS_PUSH=true`); the "Push notifications to phones" deploy guide has the steps.

### Changed

- **.NET packages target `net10.0` only.** .NET 8 left Microsoft support on 10 November 2026, so
  `net8.0` is gone from `Mateu.Uidl`, `Mateu.Dtos`, `Mateu.Core` and `Mateu.AspNetCore`; building
  from source needs the .NET 10 SDK.
- **The IDE plugins, the desktop app, the Android APK and the over-the-air phone update wait for the
  release's tests**, like Maven Central: `buid-and-publish.yml` calls their workflows after `e2e`, so
  a release whose tests fail ships none of them. Their build jobs run with a read-only token; only
  small upload jobs, which check nothing out and build nothing, can write to the release.

### Added

- **`mateu-vaadin` is published on npm again**, by the release workflow, at each release's number
  spelled as SemVer (`v3.0-beta.N` → `3.0.0-beta.N`; a pre-release of a later line goes out under the
  `next` dist-tag). It is the same self-contained bundle every Mateu app serves at
  `/assets/mateu-vaadin.js`. The job runs after the tests and is skipped while the repository has no
  `NPM_TOKEN` secret.
- **React Native: an embedded app has its shell extras.** A `MicroFrontend` or island answering an
  `App` shows a compact bar above its content with its app-context selectors, up to two header
  actions (the rest in a "More" sheet) and its notification bell.
- **React Native: saved listing views and column choices survive a restart** (stored on the device
  per UI, route and listing), and the column chooser reorders columns.

### Fixed

- **Multi-value fields read `optionsSource`.** `multiSelect`, `listBox`, checkbox groups, multi-select
  `combobox` and `choice` fields take their options from a REST source like a select does (by `ref`
  or inline, direct or proxied), on Vaadin, React Native and IntelliJ; the picks are written back as
  the options' own values (numeric ids stay numbers). On IntelliJ a multi-select combobox with inline
  options is a checkbox group instead of a single pick.
- **IntelliJ and the desktop app draw SVG images** (`Image`, hero backgrounds, card and menu-card
  media, image fields), rasterised with the bundled JSVG library (MIT), instead of showing the alt
  text.
- **Desktop app branding on every platform:** the launchers start without IntelliJ IDEA's splash
  screen, and Help ▸ About names the app and its Mateu release. The Linux and Windows installers are
  built on CI only, so this is first verified by the next release's installers.

### Added — touch and desktop

- **React Native: drag rows onto a drop zone.** A long press lifts a `@DragRows` listing row — or the
  selection it is part of — and carries it to a `DropZone`; the zones of its type light up, the one
  under the finger fills in, and letting go sends the web's drop parameters (`_draggedIds`,
  `_dragType`). A long press let go without moving opens the **Move to…** picker, which stays as the
  screen reader's way.
- **React Native: `Workflow` and `FormEditor` are editable**, with the web editors' operations:
  settings, steps added / edited / deleted (deleting one clears what pointed at it), fields added /
  duplicated / moved / edited / deleted, each one's properties in a dialog; Export shares the JSON.
  `Bpmn` stays a read-only diagram, as on the web (whose renderer is a viewer).
- **React Native: hardware keyboard shortcuts in the web build** — `@Action(shortcut)`,
  `@Tab(shortcut)`, `@AppShortcut(key)` and an `ActionPanel`'s shortcut, a screen's key winning over
  the app's. iOS and Android give an Expo app no key events, so an attached keyboard does nothing
  there yet (known issue).
- **IntelliJ: `Workflow` and `FormEditor` are editable** (settings, a list of steps / fields with a
  properties form), and an `@AppContext` picker with more than seven options searches the server
  (`_appcontext-search-<field>`) instead of only its loaded options. Photo capture keeps the file
  picker: no pure-Java webcam library exists (known issue).
- **Every renderer writes an edited `Workflow` / `FormEditor` definition under the component's id**
  (the web element now names it as `fieldId` in its `value-changed`), and both components take an `id`
  in the three backends (`Workflow.builder().id("definition")`, .NET `{ Id = "definition" }`, Python
  `Workflow(id="definition")`): the view-model field of that name receives the edited JSON. Without
  an id they keep the filler `fieldId`.

### Removed

- `plugins-v*` releases no longer publish the plugins on their own.

### Fixed — Redwood (known issues)

- **A static remote that ships raw definitions loads.** A `RemoteMenu` naming a `specsOnly` static
  bundle's `manifest.json` is no longer shown disabled: its menu, screens and deep links are answered
  from the manifest, the definitions expanded in the browser by the same expander as Vaadin.
- **An island's `appState` is sent back.** What an island's (or the page's) answer put in `appState`,
  and a `MicroFrontend`'s declared `appState`, travel with every later action.
- **An island that is the page's content gets its `@Toc` index.**
- **Multi-value fields read `optionsSource`** (`multiSelect`, `listBox`, multi `combobox`) in the page
  form, the row editor and the listing filters.

### Fixed — Redwood (from the Explorer review)

- **Islands are their own surface.** An embedded island draws its own page header, toolbar, banners
  (close and timeout as declared), `@Button` row, tabs (keys and active tab no longer collide with the
  host's) and overlays; surfaces nested in surfaces load; a `MicroFrontend` answering a whole app or
  page is framed instead of replacing the shell. Its actions, typed values, `OnValueChange` /
  `@AutoSave` triggers, rules, shortcuts and catalogue flows go back to the island, not the host page.
- **`@OnRowSelected` works** (row click and the keyboard combination plus a digit).
- **Layout boxes in place**: `DashboardLayout` columns / `colSpan` / `rowSpan`, `ResponsiveGrid`
  tracks and areas inside cards, `BoardLayout` rows, side-by-side `SplitLayout` panes (draggable), a
  nested `Card` with all its slots, islands laid out in columns keep them (wizard rail, docked panel,
  overviews, `@Zones`), page width full / edge drop the inner gutters.
- **Forms**: labels aside, `@Compact` on islands, `@PlainText` as text (`@Multiline`, money
  formatted), `listBox`, `@Help` text, growing text areas, field `colspan`, integer fields without
  thousands separators, `${…}` in field labels.
- **Display**: `ProgressBar` draws again (`oj-c-progress-bar`), `ProgressSteps` with done marks and a
  vertical list, Checklist, Stat sparkline, MetricCard drill-in, OfferCard, Ledger totals, AddOnPicker
  running total, PaymentPicker sends the chosen method, ResourceGrid, TrendChart, Gantt /
  PlanningBoard heights and today marker, OrgChart full tree, BPMN labels, a virtualised `VirtualList`,
  `ContextMenu`, two calendars on one page no longer swap their events.
- **Listings**: fluent `Grid` columns as declared (formats, align, width, frozen, `actionId` links),
  listings inside examples drawn whole with their `gridLayout` (cards, list, master/detail, tree) and
  drops, a filter named `items` no longer hijacks every filter editor, totals-formatted rows,
  rows-required primary actions, a row click that opens is not a selection.
- **Text, navigation and shells**: Markdown and Code tabs are not interpolated, `\${…}` is literal,
  wrapped list items stay in the list, a declared `BreadcrumbsSupplier` trail is drawn, query
  parameters reach the server, distinct MENU_ON_LEFT / RAIL / TILES shells, `@App(chromeless)`,
  Ctrl+K / ⌘K palette, no Ask FAB inside a framed preview, a crud's Cancel label as declared.
- **Federation**: remote menu links keep the remote's prefix, fresh deep links and reloads of remote
  screens load from the remote, a static remote is no longer POSTed to, a remote that cannot be
  reached says so instead of "You're offline".

### Fixed — React Native (from the Explorer review)

- **Islands**: their toasts and errors show; they never set the window title; root-relative URLs
  (REST sources, micro frontend base urls, images, links) go to the backend; `MicroFrontend` chrome
  NONE / COMPACT / PAGE; an island keeps its state when its host re-renders.
- **Overlays**: a returned Dialog / ConfirmDialog / Drawer / Notification opens over the island, open
  overlays stay mounted, footers and headers run on the opener; drawers get subtitle, size, maximize,
  collapse handle, modeless and peer arrows; a crud drawer's Save / Save and next reach the crud.
- **Behaviour**: action parameters as the web sends them (calendar, org chart, checklist, timeline,
  file list, grid cells, `Element` events), `OnValueChange` triggers, live `${…}` re-interpolation
  (incl. `data` / `appState` / `appData`, literal `\${…}`), the dirty guard covers islands and menu
  navigation, focus moves to the first invalid field, `@Action(js)` never posted, app FABs.
- **Resilience**: `@Action(timeoutMillis)`, retries for reads and idempotent actions, no double
  submit, busy buttons, plain-language errors with Retry, an offline strip, a form skeleton on slow
  loads.
- **Display**: real Markdown (code blocks, tables, quotes, nested lists), stack layouts by their own
  attributes and style, cards with all their slots, button colours / sizes / icons, ~70 more wire
  icons, tabs and accordions, charts (radar, trend area, declared width), grids (group header row,
  formats, widths, tree rows), listing captions / master-detail / drop zones, Form header overline,
  badges, timestamp and KPIs, `@Toc` chips, `@Compact`, fields (help text, money, checkbox groups,
  list box, file upload, time and date-time pickers, markup preview, lookup labels).

### Fixed — Desktop (IntelliJ, from the Explorer review)

- **Layout**: content grows with what loads into it (it was clipped to its first height), wrapped
  HTML measured at its width, text areas keep four lines, a tab sheet is as tall as its selected tab;
  several plain islands on one page each search as themselves.
- **Plumbing**: root-relative REST sources, micro frontend urls and images resolve against the
  backend; links to another mount open that app, other origins the browser; an iframe app preview
  embeds the app; an embedded app shell shows its navigator and screens; `MicroFrontend` chrome; page
  header and footer components.
- **Page level**: page width, `@Compact`, `@Toc` index with Ctrl+Alt+N, labels aside, banner close
  and timeout, drawer subtitle / size / maximize / peer arrows / bottom dock.
- **Widgets**: charts by kind, card anatomy, badge looks, button colours / sizes / icons and live
  `${…}` labels, wire icons, grid formats / alignment / widths and tree rows, listing cards,
  responsive-grid tracks and areas, accordions and foldouts that fold, hero, timeline, BPMN; fields
  (file chooser, list box, checkbox groups, time / date-time pickers, markup preview, lookup labels,
  placeholders, `@Help`, whole numbers without `.0`).
- **Text**: Markdown code blocks, quotes and wrapped list items; Markdown is not interpolated;
  `\${…}` is literal; planning-board, date-picker and number texts follow the app's locale.
- The render probe gained a scrolling host, `settleMs` and `locale` options.

### Added — .NET and Python parity

- Page avatar / header / footer and their suppliers, `OverlineSupplier` / `TitlePlaceholderSupplier`,
  `@Tab(shortcut)`, reflected listing column options (`@Priority`, `@ColumnWidth`, `@Line`, column
  style, tooltip), `@Status(mappings)` / `@MappedValue`, `@GeneratedValue` (with a value generator) and
  `@EditableOnlyWhenCreating`, `@WizardLabels`, an island's `data`, app-level FABs and
  `@Fab(buttonStyle)`, `@OptionsLayout`, field and class styles and CSS classes, the `@Notice` field
  marker, class-level rules and validations (.NET `[FormValidation]`), Python's banner `closeable` /
  `timeout_seconds`, and the startup warning when the served renderer differs from `type: Project`.
- 20 new conformance cases pin them (Java, .NET and Python match exactly, empty allow-lists); the
  YAML loaders read `type: FormLayout`, FormField `placeholder` / `propertyRow`, typed route seeds.
- Java: `@Header` / `@Footer` / `@Avatar` fields are no longer drawn in the form body as well.

### Fixed — Java adapters

- New parity contracts run on all five adapters: dotted-id deep links (`/people/ana.perez`), the
  client-log rate limit, the renderer wire-major warning; Micronaut serves YAML mounts over HTTP in
  its parity suite; WebFlux revalidates fixed-name assets.
- Helidon: the client-log endpoint sees the Helidon security principal (per-user rate limit, user in
  the log lines).
- A listing's `@ColumnWidth("auto")` is an auto-width column again (it was sent as a CSS width of
  `auto`).

### Fixed — Deployment

- **A Mateu app works under a path prefix.** Under a servlet context path
  (`server.servlet.context-path`, `spring.webflux.base-path`) or behind a proxy that strips a prefix
  and sends `X-Forwarded-Prefix`, the served page loads its assets, calls its API and keeps the
  address bar under the prefix. Before, it loaded `/assets/…` from the host root: a blank page. The
  header is honoured only with `mateu.forwarded-prefix.trusted=true` (all five adapters, .NET
  `ForwardedPrefixTrusted`, Python `forwarded_prefix_trusted`). `<mateu-ui>` carries the prefix as
  `contextPath`. The installable app is not available under a prefix yet (see known issues).
- **Event streams pass through buffering proxies.** Every server-sent-event response sends
  `X-Accel-Buffering: no` and `Cache-Control: no-cache, no-transform`, on the five adapters and both
  ports. nginx's default buffering no longer holds a `LongTask`'s progress until the end.
- **Micronaut accepts an `application/*+json` body** on the sync, SSE and YAML-mount endpoints, and
  **Quarkus accepts `application/json ;charset=UTF-8`** (blanks before the `;`). Both answered 415.
  The five adapters are now held to the same JSON spellings by a parity test.
- **Helidon MP: an app that authenticates only in JAX-RS** (MicroProfile JWT, a
  `ContainerRequestFilter`) is seen by MCP and the YAML mounts too: a call bringing credentials is
  answered through Jersey. A streamed action answered by Jersey is sent event by event through an
  `SseEventSink` instead of a buffered `StreamingOutput`. The adapter now depends on
  `jersey-media-sse`.
- **`mateu.cors.paths`**: extra path patterns Mateu's CORS allow-list covers (`/elements/**`). A shell
  on another origin can load a remote screen's `Element` module with no CORS setup of its own.
- Micronaut logs one WARN at startup on JDK 21–23 with virtual threads (the carrier-pinning
  limitation), and the route index is built under a lock instead of a monitor.

### Documentation

- The [feature parity matrix](https://mateu.io/reference/parity/) and
  [known issues](https://mateu.io/reference/known-issues/) follow the Explorer review: the ports'
  closed gaps, the remaining port idioms, and each renderer's new state (embedded chrome, labels
  aside, banner options, keyboard row selection, page level, drawers, phone adaptations).
- `demo/demo-explorer/README.md` explains how the Explorer was used to review Redwood, React Native
  and the desktop renderer.

## [3.0-beta.56] — 2026-11-10

### Security

- **`__restfetch__` honours `@EyesOnly` / `@DisabledUnless`** on the `@RestAction` method (and
  `@EyesOnly` on the `@RestOptions` field) it proxies, instead of calling the endpoint for anyone
  who could open the page.
- **The lookups of a hidden field are refused.** `search-<field>`, `code-<field>`,
  `codesearch-<field>` and wizard lookups answer 403 when the field's `@EyesOnly` is not satisfied.
- **`GET /mateu/v3/bundle` is off by default.** Turn it on with `mateu.bundle.endpoint.enabled=true`;
  off, it answers 404. Its bare `@CrossOrigin` on MVC and WebFlux is gone: cross-origin access is
  `mateu.cors.allowed-origins`, as everywhere else.
- **The built-in CSV export neutralises formulas** (`=`, `+`, `-`, `@`, tab, CR at the start of a
  value, plain numbers excepted) and quotes a lone `\r`.
- **A CRUD write is gated on what it will do.** A `save` that would insert needs create permission;
  a `create` naming a stored record needs edit permission.
- **A 3xx on a proxied REST call is a failed call**, not an empty success (redirects are not followed).
- **`mateu-bundle:server` escapes contract text** into the generated Java (string literals and
  Javadoc).

### Fixed

- Windows desktop installer: installs only into its per-user folder (no directory page, `/D=` ignored, a folder of someone else's files is refused), and the uninstaller removes only what it installed and then an empty folder.
- Windows desktop: `mateu://` is registered on the IDE's executable, not on a batch file, so a crafted link cannot reach `cmd.exe`. A session a link started asks you to reopen the app from its shortcut to apply an update.
- IntelliJ / desktop: an inline document is opened by the OS only for PDF, PNG, JPEG, GIF and plain text with a matching MIME type; anything else goes to the Save dialog.
- Desktop hub: islands and remote screens end with what rendered them, and a session's credentials stay with its UI, so a UI left behind can no longer send the next UI's token anywhere.
- React Native: stored OIDC tokens record their issuer and client, and are discarded with no network when a manifest names another provider.
- IntelliJ visual editor: the loopback server checks the `Host` header and only the editor's own browser can reach the backend or the project's images through it.
- Linux desktop `install.sh`: a failed upgrade no longer strands settings in a temp directory.
- IntelliJ / desktop: tasks of an anonymous session are no longer written to disk, and remembered tasks are scoped by identity.
- IntelliJ Live Run: the debugger listens on `127.0.0.1` only; a project path with spaces no longer breaks a run (the specs directory travels only in `MATEU_DEV_SPECS_DIR`); Gradle + Micronaut no longer fails to start on a debug-port clash (it runs without the debugger).
- IntelliJ New Project: picks the highest final release of the bundled pin's major, or that major's newest pre-release before its GA, instead of Maven's `<release>`.
- **Python: a class-level `@eyes_only` now also covers view models bound only through `routes.yaml`
  or a page's `viewModel:`.** Render, listing search, wizards and crud writes answer 403.
- **.NET / Python: a crud save no longer writes `[ReadOnly]` / `ReadOnly()` fields from the client.**
  They keep the stored value (the fresh instance's on a create), like Java.
- **.NET / Python: the crud write gate follows what a save will do.** No id on the route needs create
  permission and an id needs edit permission, whatever the action id says.
- **.NET / Python: `__preview__` refuses a definition whose aliases expand past 100,000 nodes** instead
  of building it.
- **.NET / Python: a route's `fixedParams` win on every proxied leg** — over action parameters (.NET)
  and each selected row of a bulk call; Python's definition-only pages now apply them.
- **Python: a definition-only page's proxied `forEachSelectedRow` action runs once per row.** It used
  to make one call without the rows and report success.
- **.NET: a YAML app shell's proxied sources answer (`_appsource`).** The bell, palette search and
  context pickers stayed empty.
- **.NET / Python: the proxied fetch does not follow redirects, and a 3xx is a failed call.** A host's
  own .NET `HttpClient` should set `AllowAutoRedirect = false` too.
- **.NET: a `MateuForbiddenException` thrown inside an action is a 403** instead of a generic error.
- **.NET: `[GroupAction]` methods honour `[DisabledUnless]` / `[EyesOnly]`.**
- **.NET: a malformed body on the SSE endpoint streams the error increment** instead of a raw 500.
- **Quarkus / Micronaut: a client that leaves a streamed action cancels the work**, and the stream
  no longer keeps every increment in memory until it ends.
- **A `LongTask` reached outside the SSE leg no longer runs unobserved and dies at the grace period.**
  An MCP tool call waits for it (`mateu.mcp.task-timeout-seconds`, default 120) and answers how it
  ended; a `/sync` call, which nothing can resume, cancels it at once.
- **Spring MVC: identity and request data survive the request**, so a `notifyWhenDone()` task whose
  tab was closed still reaches its user's inbox.
- **Agent push: a stalled browser no longer blocks every other session**: messages are written
  outside the registry's lock, in order per session.
- **Web: streamed actions carry the `@AppContext` values**: a LongTask, a header action or an inbox action ran with no selected hotel/company.
- **Web: a live-pushed inbox entry works like a listed one**: its actions, read, dismiss and detail reach the server.
- **Web: Retry in the task center works after leaving the screen that started the task**, and says so when it cannot start.
- **Web and Redwood: a stream broken under a running task looks for it again** (`_progress-tasks` + `_progress-resume`, for ~12 s) instead of showing it failed while the server still runs it.
- **Web and Redwood: leaving a screen before a LongTask's first event no longer cancels the work**; the first event decides whether the stream is a task.
- **Web: a streamed action re-authenticates on a 401** like a sync one, once.
- **Web: a reattached task whose resume stream fails ends failed** instead of running forever.
- **Web: declining the unsaved-changes prompt keeps a finished task and its result action.**
- **Web: the request-loop breaker aborts only the looping request**, never a Save next to it.
- **Web and Redwood: live updates and header values are per app**, and with a per-tab identity (a token in `sessionStorage`, memory or a provider; a Redwood host provider) each tab holds its own stream and shares nothing.
- **Redwood: a resumed task survives the first navigation after a reload**, and a task's Retry carries the app state.

### Changed

- **VS Code Live Run** opens the debugger on loopback only (it was every interface), starts a Spring
  Boot or Micronaut app from a path with spaces, and debugs Gradle + Micronaut through the `run` task.
- **The VS Code editor's loopback proxy answers only the editor's webview** and the Redwood app it
  frames, so a web page in the developer's browser cannot read the backend through it.
- **VS Code New Project pins the highest stable release** of the starters' major (before that major's
  GA, its newest pre-release), not whatever Maven Central published last.
- **The Maven archetype no longer deletes the target folder** when it rejects an option: it removes
  only what it wrote.
- **A pre-release of a later minor or major** (`v3.1-rc.1`) no longer ships over the air to production
  phones, repins the examples, or fails the plugin and desktop jobs: those jobs skip it. Every
  `v3.0-beta.N` / `v3.0-rc.N` keeps publishing as before.
- **Mateu Publish** deploys the current release's renderer, each file checked against a pinned SHA-256
  (`scripts/bump-example-version.sh` moves the pin), and a site title can hold `$&`.
- **The .NET starter targets `net10.0`.** The Mateu packages still target `net8.0` and `net10.0`.
- **`mateu-bundle:server` defaults to Spring Boot 4.1.1**, the line the adapters are tested with.
- **IntelliJ / desktop: a long-running task never opens a modal window.** Every `LongTask` now runs
  in the IDE's Background Tasks (status bar, Background Tasks window); a blocking one also covers
  the Mateu view that started it — that view only — with its progress, Cancel and, for
  `.backgroundable()`, *Move to background*. The IDE stays usable throughout.
- **`DashboardLayout` is stable.** The `DashboardLandingPage` template produces it and renderers,
  demos and docs use it, so its deprecation is withdrawn in Java, .NET (`MATEU002`) and Python.
- **Python: a YAML shell's `variant: HAMBURGUER_MENU` is no longer accepted.** An unknown variant
  warns and counts as `AUTO`, as in Java.
- **The API check's baseline is `3.0-beta.55`** and its allowlist is back to the sentinel;
  `scripts/bump-example-version.sh` resets the allowlist whenever it moves the baseline.

### Added

- **IntelliJ / desktop: the inbox panel and tasks that survive a restart.** The bell opens the app's
  inbox with the All / Unread / Resolved filters and category groups of the other renderers. The
  tasks still running on a backend are remembered across IDE restarts (per backend, for an hour)
  and followed again in Background Tasks when the app is opened.
- **The phone app's bell catches up when the app comes back to the foreground**, so its badge counts
  what arrived while the app was away instead of waiting for the panel to open. The docs now say
  plainly what OS notifications can and cannot do on a phone: they are local, so a suspended or
  closed app posts none.

### Removed

- **The `?overrides=` URL parameter of the web client**: undocumented and unused, it let a link write the app state and beat the user's `@AppContext` selection.
- The dead `keycloak-js` dependency, `keycloak.min.js` and the `<!-- AQUIKEYCLOAK -->` marker of the Vaadin and Redwood pages.
- The inert Keycloak bootstrap of the served page (`IndexPage.Keycloak`, the `keycloak` field of
  `IndexPage.Spec`), left behind by the removal of `@KeycloakSecured`.

## [3.0-beta.55] — 2026-11-09

Everything since 3.0-beta.51 (beta.52 to beta.55).

### Changed

- **A constraint applies only to a field the user can edit.** A `@ReadOnly` or `@PlainText` field,
  one locked by a `@ReadOnlyUnless`/`@DisabledUnless` the user does not satisfy, and every field of a
  read-only view no longer carry their constraints to the browser nor have them re-checked on the
  server: a constraint nobody could fix blocked the submit. The server still never writes those
  fields. Java, .NET and Python alike (conformance cases `validation-locked`, `validation-unless`,
  `validation-read-only-view`).
- **Faster requests in apps with many screens.** Route resolution looks the route up in an index
  built once, instead of asking every `@UI` class on each request, and Mateu's settings are
  memoised instead of resolved through the framework's configuration on every read (an app whose
  configuration changes at runtime calls `MateuSettings.refresh()`; a Spring context refresh and
  Spring Cloud's `EnvironmentChangeEvent` do it for you). In an app with 200 routed classes a
  warm request is 17–40% faster.
- **The .NET and Python ports send `ETag` and `Last-Modified` with the renderer's assets** and
  answer a revalidation with `304 Not Modified`, as the Java adapters do: a repeat visit no longer
  downloads the bundle again.
- **The desktop app is built on IntelliJ IDEA Open Source 2026.3.** JetBrains stopped publishing
  IntelliJ IDEA Community after 2025.2. Its open-source successor, IntelliJ IDEA Open Source
  (Apache-2.0), now comes from the installers JetBrains attaches to the
  [intellij-community releases](https://github.com/JetBrains/intellij-community/releases). Each
  download is checked against a pinned SHA-256, and CI starts every packaged app before the release
  reaches installed apps. Apps installed from an earlier beta ask to be **reinstalled once**; their
  settings and list of UIs are kept. The Marketplace plugin still supports IntelliJ IDEA 2025.2 and
  later.
- **Calendars mark today on the phone too**, and the museum demo's calendar no longer pins the day it
  was generated as its month and as "Today": it opens on the current month.
- **A Collection Detail page shows one pane on a phone.** The list while nothing is selected, the
  selected record alone once a row is tapped (stacked, the list came back above the record). Tablets
  keep both side by side.
- **A long press on the phone app's back arrow goes back to the start of the section**, and picking a
  menu entry always opens it at its first screen — the one on view too. The menu also opens with a
  swipe from the left edge while the bar shows the back arrow.
- **The phone app follows Material 3 more closely.** Controls ripple on Android, the drawer has
  Material icons (`vaadin:*` tokens are mapped) and section headers, confirmations are Material
  dialogs, bottom tabs are Material's navigation bar, tab strips scroll when their labels would be
  cut, and a list's title, toolbar and search scroll away with its rows.
- **Android Back from a UI's first screen goes to My UIs** instead of leaving the hub app.
- **Signing out of a UI on the phone app ends the identity provider's session too** and draws a new
  session id. Register `mateu://auth` as a post-logout redirect at the provider.
- **A hidden UI on the phone app neither polls nor opens the sign-in browser,** and a refused sign-in
  does not reopen it for a minute. A link to a running UI asks before discarding unsaved edits.
- **Menu entries naming one view of a listing work on the phone app** (`reservas?vista=LLEGADAS_HOY`):
  the route's query seeds the listing's search, as on the web. Every tab of a TABS shell showed the same list.
- **A routed listing's toolbar shows once on the phone app** (the page's header shows it, the listing's
  copy stands down, and a button repeated in the page toolbar is one button).
- **An embedded island behind a mediator keeps what its host seeded on the phone app** (an `@Inline`
  `EditableView`'s `stayId`): sent on its loads, its reloads and its actions, and its LongTask streams.
  The front office's passport scan never reached the stay, and its progress never moved.
- **On the phone app,** a record's back bar no longer shows the raw route, a TABS shell's top bar hosts
  the screen's way back instead of stacking a second bar, a card around nothing is not drawn, a
  `@Notice` interpolates `${state.x}`, Redwood's `oj-ux-ico-*` icons draw as Material icons, and a
  wizard's progress is one compact row.
- **A wire `Dialog` is a Material dialog sized to its content on the phone app;** a `Drawer` stays a sheet.
  Text follows the Material type scale.
- **The Android build drops permissions it never used:** `SYSTEM_ALERT_WINDOW`, external storage and
  biometrics.
- **The Android release build is shrunk and obfuscated by R8,** with its resources shrunk too, and it
  no longer locks the screen to portrait: tablets and foldables rotate (Google Play asks for both).
- **A phone app built outside EAS asks for the `production` over-the-air updates** (the Play bundle
  built locally, the GitHub APK). It carried no update channel, so the updates each release publishes
  never reached it.
- **Desktop app: the navigator menu is a tree.** The app menu was a column of hyperlinks; it is now
  the IDE's own tree, with the selected row, arrow keys, expandable groups and type-to-search. Card
  menus keep their cards.
- **Desktop app: read-only values read as text.** A record's view mode showed every value as a
  greyed-out input (about 2:1 contrast). Values are now plain text you can select and copy, numbers are
  written in the UI's locale (`77`, not `77.0`), and a read-only field drops its required asterisk.
- **Desktop app: pages scale with the IDE font and get a margin.** Titles and other large text used
  fixed point sizes, so the IDE's zoom and font settings left them behind; they now scale with it.
  Composed pages (wizards, dashboards, welcome and item overview pages, YAML forms) no longer touch
  the window's edges.
- **Desktop app: the welcome hero's buttons sit in one centred row**, instead of one full-width bar
  each.

### Added

- **The .NET and Python servers close their documented gaps.** Both ports gain the 24 wire
  component types that were Java-only (`Grid` with column groups, `BoardLayout`, `CarouselLayout`,
  `Chat`, `MessageList`/`MessageInput`, `ContextMenu`, `MenuBar`, `Directory` — `DirectoryMenu` in
  C# —, `NotFound`, `VirtualList`, `CookieConsent`, `FormEditor`, `Workflow`…), YAML page templates
  (`template:`) and `type: AppShell` definitions, a listing's `rowRoute`, the editable views
  (`EditableView`, `AutoEditableView`, `MasterDetailView`), class-level `AutoSave`,
  `ViewToolbarButton`, `MainFilter`, `HiddenIn*`, `Section(sticky, columns, style)`, `Dialog`
  placement, the remaining action knobs (`sse`, `background`, confirmation texts, `href`, `js`,
  custom events), `MicroFrontend.chrome`, typed filter criteria for a `find` override and a route's
  `fixedParams` on the proxied leg, a page definition's `actions:`, `triggers:` and proxied
  listing/select sources, `@App(backLink)` and a YAML shell's `backLink`/`pageTitle`, page
  breadcrumbs, `@Inline` nested data-object forms, `HeroSearch` with a separate filters type
  (Python `HeroSearchListing[F, R]`), the fluent listing's grid options and a grid field's row
  detail, .NET length/pattern validation (`[StringLength]`, `[RegularExpression]`…); Python a
  class-level `read_only_unless`. **Static bundles from the ports**: `python -m mateu_ui.bundle`
  and `dotnet mateu-bundle` (the `Mateu.Bundle` tool) write the same bundle as
  `mateu-bundle:bundle`, held to one golden (`conformance/bundle`). New conformance cases pin all
  of it in Java, .NET and Python with empty allow-lists.
- **Progress is a task, shown the platform's way.** A `LongTask` no longer builds a dialog on the
  server: it reports a task (`Progress` command: title, text, fraction or indeterminate, "12 of
  300", state) and each renderer shows it natively — a modal progress for a blocking task, a task
  center (several tasks at once, kept when the user leaves the screen) for a background one, and on
  IntelliJ the platform's own background tasks. New, `@Experimental`: `.background()`,
  `.backgroundable()`, `.cancellable()` / `.onCancel(…)` (Cancel stops the work; only the caller who
  started the task can cancel it), `.retryable()` (a failed task offers Retry), `.resultAction(…)`
  ("Open report"), `.notifyWhenDone()` (the outcome lands in the inbox) and `step(text, done,
  total)`. A task that fails ends failed with the message the user sees. Existing `LongTask` code
  keeps compiling and working.
- **Messages say what they mean.** `Message` gains a persistence (`toast`, `sticky`, `inbox` — an
  error is sticky), any number of `actions` (Undo is one of them) and a dedup `key`; `position` is
  now only a hint for the web.
- **An inbox you act on, pushed live.** `AppNotification` gains a category, a severity, actions,
  a resolved state and a server-built detail; `NotificationsSupplier` gains `onNotificationAction`,
  `dismissNotifications` and `notificationDetail`; the bell groups, filters (unread / all /
  resolved) and dismisses. `LiveNotifications.publish(user, entry)` pushes a change to that user's
  open sessions only (apps with `@App(liveUpdates = true)`). IntelliJ shows messages and inbox entries
  as platform notifications. Java, .NET and Python.
- **Publish a design from Figma as a UI with no backend.** The Mateu Publish plugin reads the open
  file, builds a static site and uploads it to Netlify or Cloudflare Pages, or hands over a zip. It
  needs no Figma token, no Java and no repository.
- **The Mateu UI Kit says more.** A text or number field can name its stereotype (`email`, `money`…),
  a select or radio group where its options come from, and native slots and component properties
  replace the old `#config` layer. The kit is on [Figma Community](https://www.figma.com/community/file/1701291643502429777).
- **A task survives a reload.** Reloading the page (or losing the connection, or sending the phone
  app to the background) no longer cancels a running task: the renderer remembers its tasks for the
  session, asks the server which are still there (`_progress-tasks`) and follows them again
  (`_progress-resume`) — the task center fills up again. A task nobody follows is cancelled after a
  grace period, 60 s by default (`mateu.progress.reattach-grace-seconds`; 0 = the old
  cancel-on-close). Only the caller who started a task can see or follow it again. `@Experimental`;
  Java, .NET, Python and every renderer.
- **"About 2 min left".** A determinate task gets the server's estimate of the time left
  (`ProgressDto.etaSeconds`), only once the observed rate makes it honest — never for an
  indeterminate task. Same rules in the three backends (`conformance/progress/eta.json`), worded by
  every renderer in English and Spanish.
- **Notifications of the operating system.** `@App(osNotifications = true)`: a new inbox entry and a
  background task that finished show as OS notifications while the app is not in front — the Web
  Notifications API (permission asked only when the user clicks "Notify me on this device"), local
  notifications on the phone app (`expo-notifications`; no push service — a new store build,
  versionCode 200003), system notifications from IntelliJ. `@Experimental`.
- **Inbox messages are kept.** A `Message` with persistence `inbox` to a signed-in user is stored
  (`InboxStore` — implement it to keep entries anywhere; the default is in memory, bounded) and
  pushed to the user's other sessions, so it is still in the bell after a reload. `@App(inbox =
  true)` shows the bell without a `NotificationsSupplier`. `@Experimental`; Java, .NET and Python.
- **Cards drag on the phone app.** On a kanban board a long press lifts a card; it follows the finger
  and the board scrolls near the edges. Dropping it runs the board's move action, as on the web.
  The Move menu stays, for screen readers and for whoever prefers it.
- **About Mateu on the phone app.** An ⓘ on the hub's bar shows the app version and build, the Mateu
  release, and which code runs — the built-in bundle or an over-the-air update and when it was
  published. "Check for updates" downloads the latest update and restarts on it at once.
- **The Vaadin page shows a loader while its bundle downloads.** Before the renderer's JavaScript
  ran the page painted nothing (about 4 s of a blank screen on a 3G phone); a CSS-only spinner now
  shows after 0.7 s and goes away when the app starts. It respects dark mode and reduced motion,
  adds no script (the page still runs under `script-src 'self'`) and is served by the .NET and
  Python ports too, which use the same page.
- **Static bundles ship pre-compressed files.** `mateu-bundle:bundle` writes a `.gz` next to every
  text file (`-Dmateu.bundle.precompress=false` skips it), so nginx `gzip_static`, Caddy
  `precompressed` or a CDN origin serves them gzipped: the static VCN demo's first load on a 3G
  phone went from 14.4 s to 4.3 s on such a host. See *Deploy › Static UI › Hosting*.

### Fixed

- **A required field inside a page template is validated.** A definition-only page with a
  `template:` (a guided process, say) ran its action with the field empty.
- **A radio group lists the options of its `optionsSource`.** It drew an empty group.
- **The buttons of a record page work on a crud declared `Crud<Object, ...>`.** Since beta.42 the record was rebuilt
  from the crud's view class; with `Object` there was no record, the method never ran, and the page went blank under
  the title "Object". The record now comes from the crud's `view()`.
- **The IntelliJ plugin installs on current IDEs again.** It was capped at the 2025.3 line, so the
  Marketplace marked it incompatible with IntelliJ IDEA 2026.1, 2026.2 and 2026.3. The cap is gone, and
  every pull request and release now runs the JetBrains plugin verifier against 2025.2, 2025.3 and
  those three lines.
  The desktop app moves to IntelliJ IDEA Community 2025.2.6.4 (the latest patch of its base).
- **Open items of the October UX review, closed before GA** (status table in
  `design/ux-review/*-findings.md`, "Estado 2026-11-08"):
  - **Nothing pushes a phone page sideways any more.** A form's row of buttons wraps, and a
    `@FoldedLayout`'s sections stack under 20rem instead of the second one being cut off at the
    screen edge (Java, .NET and Python lay the row out the same way).
  - **Planning board blocks read on any colour**: when neither the light nor the dark ink reaches
    4.5:1 on a block's own colour (violet), the text is black. Its scrolling frame takes the focus,
    so a keyboard can scroll it.
  - **A disabled resource-grid card is `aria-disabled` and out of the tab order**; the selected one
    says it is pressed, and its status chip keeps its contrast.
  - **The rich-text toolbar, the chat's attachments and the saved-view star use the icon set**, not
    emoji; the star is a named toggle with its pressed state.
  - **Phone app:** a listing's selection boxes are one named checkbox each again (the Material
    migration had nested Paper's own checkbox, named by its icon glyph, inside ours) and a row's
    chevron is no longer a button inside the row; a month calendar opens on its agenda on a phone,
    the grid one tap away; a record pushed over its listing drops its «Back to list», which the
    back arrow already is; every font size is a step of the type scale (pinned by a test).
  - **An unreadable page in `specs/ui` is reported once**, by its own loader, instead of a second
    warning that called it a "route file".
- **Desktop app: YAML record pages work again.** A YAML page's title showed the raw `${state.name}`
  and its toolbar (Edit, Back to People) was missing, so a record could be neither edited nor left.
  Its header is now the same as any page's. `${state.x}` also works in texts, images, avatars, badges,
  links and Markdown. A button with a `route` navigates there, in the page and in the IDE toolbar,
  instead of sending its action id.
- **Desktop app: the primary button is the platform's default button.** It used the "Got It" tooltip
  style, which was unreadable (dark text on dark grey) in the light theme.
- **Desktop app: boards and skeletons follow the theme.** Kanban columns and loading skeletons used
  fixed light greys, which showed as white slabs in a dark IDE. Kanban card titles are no longer cut
  early by the card's menu button.
- **Desktop app: foldouts are readable.** Each panel keeps its declared width and the row scrolls
  sideways, as on the web; panels used to be squeezed into slivers. Markdown now draws headings,
  tables, numbered lists, code and links (it showed `###` and `| Date | Concept |` as typed).
- **Desktop app: long text wraps**, instead of being cut at the edge of its column.
- **Desktop app: images load without freezing the IDE.** An image URL was fetched while the screen
  was being drawn, so a slow image host froze the window.
- **Desktop app: the RAIL wizard's form fills the row.** The form kept its narrow preferred width beside
  the step rail; `flex` sizes in a row are now honoured, including fixed widths.
- **A listing's page header sends each toolbar button once.** A button declared
  `@ListToolbarButton` + `@Toolbar` (the documented way to give a bulk button its look) reached the
  page toolbar through both annotations and was sent twice; the listing's copy, which carries the
  selection guard, is the one kept.
- **A server-paged REST listing no longer stops at its first page (phone app).** A source with a
  `totalPath` was fetched once and paged on the device: 77 astronauts showed as "20 total".
- **Tree listings open on the phone app.** Rows lost their `children`, so only the roots showed.
- **Picture columns show pictures on the phone app** in cards, list rows and tables, not the url.
- **A data-authored shell's inbox, search and context pickers work on the phone app.** Their REST
  sources were never read. The shell's source catalogue is now known before its first screen, which
  also stops listings failing on a url that was not resolved yet.
- **A failed REST listing says so on the phone app,** with Try again, rather than "No data"; offline
  errors read in plain words.
- **On the phone app, page templates that own their header no longer repeat the title,** banners
  interpolate `${state.x}`, buttons read on dark bands, and a refused save no longer names fields by
  their ids.

### Removed

3.0.0 is the first stable release and keeps no compatibility with the 3.0 pre-releases (alphas,
betas, release candidates): everything they deprecated, and every alias kept for them, is removed.

- **`AppVariant.HAMBURGUER_MENU`** (Java, YAML `variant:`, .NET/Python strings, and on the wire —
  renderers no longer accept it) → `HAMBURGER_MENU`.
- **`@KeycloakSecured`** → your framework's authentication (an OIDC login / resource server), or a
  `PrincipalResolver` bean. The annotation processors no longer read it or index it.
- **`BadgeSupplier`** → `HeaderBadgesSupplier`.
- **`Button.getActionId()`** → `Button.resolvedActionId()`.
- **`ContentLayout`** (Java, .NET, Python, YAML `type: ContentLayout`) → a `ResponsiveGrid` with named
  areas (`@Aside` already composes one). The wire type `ContentLayoutDto` stays.
- **`@GenericClass`** → declare the field with its type argument (`List<MyDto>`).
- **`@List`** (`io.mateu.uidl.annotations.List`) → `@BulletedList`.
- **`ActionType`**, **`ActionPosition`**, **`ActionStereotype`**, **`ActionThemeVariant`** →
  `@Toolbar` / `@Button` / `@Hidden`; `ButtonStyle` / `ButtonColor` / `ButtonVariant`.
- **`Binding`**, **`BindingSource`**, **`ClientSideEvent`**, **`Destination`** → binding by convention,
  `UICommand.dispatchEvent` + `@SubscribeTo`, `UICommand.navigateTo` (or return a `URI`).
- **`ListAdapter`** → `Listing<Row>`.
- **`io.mateu.uidl.layout.ColumnLayoutSelector`** → declare `gridLayout()`.
- **The settings `mateu.layout.inference` and `mateu.page.inference.disabled`** (.NET switches
  `Mateu.LayoutInference`, `Mateu.PageInference.Disabled`) → `mateu.layout.inference.enabled`,
  `mateu.page.inference.enabled`. The old names are now ignored.
- **Core: `JwtExtractor`** → `IdentityResolver`; **`application.runaction.DeclaredRestMethod`** →
  `io.mateu.core.domain.DeclaredRestMethod`; the static `wrap` / `getState` / `withoutRestricted` /
  `getAppRoute` of `ComponentStateHelper` and `RunActionUseCase` → `ComponentState`;
  `RunActionUseCase.SECRET_ENV_PREFIX` / `secretEnvName` → `SecretResolver`.
- **.NET `[Secured]`, Python `@secured`** → `EyesOnly(permissions = …)` on the class.
- **Python `Size`** (the length constraint) → `Length`; **Python `components.Step`** → `ProgressStep`.
- **`@App(accentStrip)`, `@App(accentStripSeed)`** and core's **`AccentStrip`** generator (no effect
  since no renderer draws a strip) → nothing: remove them; the accent is `@App(accentColor)`.
- **`AppShell`'s pre-`ai` constructor** → the canonical constructor or `AppShell.builder()`.
- **The YAML key `definition:`** on a route entry → `layout:`; **the YAML key `modelView:`** on a page
  definition → `viewModel:`. The old keys are no longer read (nor in the schemas, the IDEs or the
  visual editor).
- **The endpoint `POST …/mateu/v3/components/_/action`** → `POST …/mateu/v3/sync/{route}` (every
  renderer already used it; Redwood and the visual editor moved too). The Java adapters now answer
  only `v3/sync/**` and `v3/sse/**` for actions, instead of any `v3/<operation>/**`.
- **The pre-rename Maven ids** (`uidl`, `core`, `mvc-core`, `vaadin-lit`… — the relocation poms and
  their entries in `mateu-bom`) → the `mateu-*` artifacts.
- **Python's pre-rename packages** `mateu_uidl`, `mateu_dtos`, `mateu_core`, `mateu_fastapi` →
  `mateu_ui.uidl`, `mateu_ui.dtos`, `mateu_ui.core`, `mateu_ui.fastapi`.
- **.NET type forwards** of `RouteEntry`, `IRouteEntrySupplier`, `IMenuSupplier`, `IAppSupplier`,
  `AppShell` and `MateuForbiddenException` from `Mateu.Core` (they live in `Mateu.Uidl`; source code
  is unaffected, only binaries built against a pre-release relied on them).
- **Rich text stored as a Quill Delta** (the pre-release editor's format) is no longer converted: a
  rich-text value is HTML.
- **The wire's never-produced types** `Result` and `Stepper`, the `AppDto` members `accentStrip` /
  `generatedAccentStrip` (never sent) and the unreachable pre-3.0 DTOs of `mateu-dtos`
  (`JourneyDto`, `ViewDto`, `PageMainContentDto`, `SearchFormDto`, `BadgeColorDto`… — 28 types).
  `wireVersion` stays `3.0`: no 3.0.0 renderer or server produces or reads any of them.
- **Figma → YAML**: a Section whose content slot is empty no longer takes the layers that follow it
  (the convention of libraries older than native slots) — put the fields in the slot.

### Experimental

- **What joined the API after the freeze is experimental in 3.0.0.** The GA review marked the
  additions of the betas that were not marked yet — Java: `@NoCrudNavigation`, `DetailContentSupplier`,
  `@AI(followLabel, followingLabel)`, `Direction.parse`, `Image.alt`, `ProgressSteps.resultTitle`,
  `MicroFrontend.resolvedByServer`, `RouteTable.Match.params(incoming, query)`,
  `HttpRequest.getRemoteAddress`, `GeneralOverview.recordLabel`/`label` (and `@Internal` on plumbing:
  `forTheClient`, the archetypes' `bindRequest`, `MultiView.wrapView`); .NET: the same features
  through the port's doc-comment convention. The full list per backend is on the
  [stability page](https://mateu.io/reference/stability-and-versioning/#recent-api-experimental-in-300).

## [3.0-beta.51] — 2026-11-04

### Added

- **Follow mode in the AI chat panel** (web; Java, YAML, .NET, Python). A robot button in the chat
  header lets the user choose whether the view follows the assistant. On (the default, as before) it
  reads **Following** («Siguiendo»), filled, and the agent's `navigation-requested` and
  `render-screen` move the content as they arrive; off it reads **Follow** («Seguir»), outlined, and
  they wait on the reply as buttons the user clicks when they want to see them, so the screen no
  longer changes under them with every agent action. Other agent events keep applying; the choice is
  remembered per browser. Both texts are the app's to set: `@AI(followingLabel, followLabel)`,
  `[AI(FollowingLabel, FollowLabel)]`, `@ai(following_label, follow_label)` (`AppDto.followingLabel`
  / `followLabel`).

- **The AI chat in a YAML app shell** (Java). `type: AppShell` takes an `ai:` block — `sse`, `mcp`,
  `upload`, `followingLabel`, `followLabel` — the data twin of `@AI` (`io.mateu.uidl.data.AppAiChat`,
  `AppShell.ai`), so a data-authored app gets the assistant without a Java class. The pre-`ai`
  `AppShell` constructor stays, deprecated.

### Fixed

- **A field's `initialValue` no longer overwrites a loaded record (Vaadin).** A field declaring one
  announced it as an edit when it mounted, and edits are defended against what arrives later, so a
  YAML page with `data:` showed the default instead of the record, and saving it wrote the default
  to the API (a `DONE` task saved as `BACKLOG`). It also marked the untouched page as dirty.

- **Redwood tables no longer lose rows (Redwood).** A listing fed by a REST source keyed its rows by
  the identifier column, which may repeat (a day, a task's title), and `oj-table` drew one row per
  key: `/visits` showed 10 of its 25 rows. A repeat now gets its occurrence in the key.

- **A required select is no longer filled in unasked (Redwood).** A field whose options came from a
  source took those options as its value, and `oj-select-one` answered with the first one, which the
  form then saved. An artwork created with only a title landed in the first museum of the list.

## [3.0-beta.50] — 2026-11-04

### Fixed

- **An avatar can be an address relative to the site.** The comment thread, the org chart and the
  testimonials of the Vaadin renderer took anything not starting with `http` or `data:` for initials, and
  wrote a path like `/photos/a` in the circle; now it draws the image.

- **Redwood: a primary column's image is 2rem, as on Vaadin.** At 1.25rem, initials could not be read.

## [3.0-beta.49] — 2026-11-03

### Fixed

- **A YAML page can ask before losing unsaved changes** (`confirmOnNavigationIfDirty: true`, the twin of
  `@ConfirmOnNavigationIfDirty`): until now a menu click or a previous/next arrow discarded what was typed
  on any page without a class behind it. A REST action that succeeds settles the changes when it declares
  `validationRequired` or a `successRoute`. A button with a route now asks too, on Vaadin as on Redwood.
  The space and museum editing pages declare it. Java and the
  web and Redwood renderers; not in the .NET and Python YAML builders yet.

- **A page's previous/next arrows, the remaining cases.** On Vaadin a drawer's arrows read a relative
  `peerNav` route against the current URL; they now navigate inside the app and close the drawer. On
  Redwood a page foldout that is not a declared `FoldoutPage` lost the page's `peerNav` (it owns the
  header, so nothing drew it): it now fills the layout's own arrows; and an arrow or a route button
  naming another mount's path loads it in the browser.

- **Redwood: a foldout panel shows a scroll bar only when its content does not fit.** The room left for
  the paging dots overflowed every panel by a constant 32px, whatever it held and however tall the window.

- **Redwood: saving a record no longer wipes a select nobody touched.** `oj-select-one` drops a value that
  is not among its options (a loan's closed exhibition, when the choices are the open and planned ones) and
  that counted as an edit, so saving sent the field empty. The value now survives, as on Vaadin; the field
  still shows blank, because the options do not hold it.

## [3.0-beta.48] — 2026-11-03

### Fixed

- **Redwood**: a subheader with more options than fit no longer runs past the edge of the window: what doesn't fit goes into a «More» menu at its end, as on the web renderer.

## [3.0-beta.47] — 2026-11-03

### Fixed

- **Redwood: a tree listing (`gridLayout: tree`) folds.** It drew every level always open, with the
  names indented and no way to close a branch; now each parent has a chevron, as on Vaadin. Folding
  makes no round trip, a click elsewhere on the row still opens the record, and a new search or filter
  opens the tree again so a folded branch never hides a match. A tree's columns no longer offer a sort.

- **A page's previous/next arrows work everywhere.** On Vaadin a relative `peerNav` route was read
  against the current URL (`/astronauts/astronauts/9`); the arrows now navigate inside the app, like
  a breadcrumb, and ask about unsaved changes. On Redwood `peerNav` was ignored by the Item Overview,
  General Overview and `FoldoutPage` templates; it now fills their own previous/next.

## [3.0-beta.46] — 2026-11-03

### Fixed

- **Web**: browser Back to a listing from a record opened from it left the grey rows for ever on Vaadin: the tab's structure cache handed out the objects on screen, whose OnLoad had already fired, so the search never ran. It now stores and hands out copies.

## [3.0-beta.45] — 2026-11-03

### Fixed

- **A menu entry whose route is its group's route opens its page, not the group's index** (Java,
  YAML and `@Menu` shells). The group «Launches» answers at a route derived from its label
  (`/launches`); its entry «All launches» names `route: launches` explicitly. Opening `/launches`
  showed the group's section index (Launch calendar, All launches, …) while the breadcrumb already
  said «Launches › All launches» — on the space demo, also for «Missions › All missions». An
  explicit leaf route now wins over a group's derived one: the section index is only served when no
  entry of the menu claims that route, so group routes nobody claims keep their index. .NET and
  Python serve no group index and already resolved the leaf.

## [3.0-beta.44] — 2026-11-03

### Fixed

- **Web: Back and Forward within a listing search again in place** (review M6). Between two states
  of a listing (`?page=1 ↔ ?page=2`, a filter, a sort) the whole app was re-mounted and the route
  reloaded; the listing now marks the history entries it writes and searches again on its own. A
  run of picks in one multi-select panel is one history entry, a default saved view applied on
  opening replaces the entry instead of adding one, a refused Back ("unsaved changes") returns to
  the URL the user was really on, and two listings on one page keep apart in the query string
  (the second prefixes its keys with its id).

- **Web: a page's width is its own** (review M16). An embedded island (an `@Inline` view, a
  component tree in a form, a micro frontend) no longer decides the host page's width — a board in
  an island made the host bleed, an island's declared edge-to-edge did too. Only the server's
  DEFAULT 900 px column is lifted on full/edge pages: a view that asks for a column
  (`@Style(StyleConstants.CONTAINER)`) keeps it. A YAML page draws at the same width whether or not
  its route seeds it, and a bundle's YAML page takes its page type from its `template:` or its
  `type: Listing`, as the server does.

- **Web (Vaadin): small fixes from the final review.** A Kanban `color` that is not a colour (a
  live row's `red;background:url(…)`) never reaches a `style`; picking a move from a card's menu
  keeps the keyboard on the card; a select whose value comes as an option keeps a `0`; a list
  holding both `"25"` and `25` answers the one picked; radio groups send back the option's own
  (numeric) value; a `mailto:`/`tel:` row route opens on a row click as it does from its link; and
  the identifier link of a row keeps the app's mount (`/back-office/people/3`).

- **The proxied leg evaluates a source template like the browser** (Java, .NET, Python, Redwood,
  React Native). `${1e3}` was empty on the server, `===`/`!==` compared loosely (`n=1 === '1'` was
  true), `${state.q[0]}` and any method call (`.toLowerCase()`) rendered empty: the server's
  `ProxyExpression` now reads exponents, indexes strings, compares strictly, and runs
  `Math.round/floor/ceil/abs/min/max` and the pure string/number/list methods (`toLowerCase`,
  `toUpperCase`, `trim`, `includes`, `startsWith`, `endsWith`, `indexOf`, `slice`, `substring`,
  `padStart`, `padEnd`, `toFixed`, `join`, `toString`). Redwood and React Native gained what they
  lacked of it; 11 new `source-templates.json` cases run on every leg. **Behaviour change**: a
  proxied `===` is strict now, as it always was in the browser.

- **`proxy_unsafe_template` also flags a url whose host a client value would choose**
  (`${state.base}/x`, `https://${host}/x`): only a `${secret.X}` may name the origin, so the proxied
  leg refuses the call (Java, .NET and Python validators).

- **.NET and Python: `forEachSelectedRow` on a proxied source runs once per selected row** on the
  server, like Java — a failed row answers "N of M failed" with what the service said — and the
  action's parameters (a kanban move's `_toColumnId`) reach `${state.x}` on the ports' proxied leg.
  React Native's bulk call used to run once with the page state there.

- **CRUD write gates agree in Java, .NET and Python.** Java refuses a forced "Save and next" the
  crud's display disables (403, not "not handled"); Python's `Crud` gains `can_create()`,
  `can_edit()` and `can_delete()` (they take New/Delete/Edit away and refuse the writes) and refuses
  a forced `new`, `/new`, `edit`, `/{id}/edit` or disabled `save-and-next` with a 403 instead of an
  empty answer; .NET refuses New and `/new` when `CanCreate` is false (the creation form used to open
  and only its save was refused), Edit and `/{id}/edit` when `CanEdit` is false.

- **.NET and Python: a deep link to a dotted id is a route** (`/people/ana.perez`, `/versions/1.2`):
  a file is an asset extension, as Java's `SpaFallback` reads it — any dot used to mean a file (404).

- **.NET `Dev = false` and Python `live_reload=False` win over `MATEU_DEV=true`.** .NET still mapped
  the dev endpoints, and Python's manifest advertised `devEvents` it did not serve (the apps retried
  the 404 every 30 s). A Python 403's error message has duration 0 like every error (it sent 5000).

### Fixed (natives and Redwood — final review, remaining items)

- **Desktop: a link asks before the hub calls its address** (M13). A `mateu://add?u=…` link can come
  from any web page: the app now shows the address and asks before it fetches the manifest or walks
  up a page's path. A local port is never followed to another address (no redirects from loopback),
  and an address that answers without a Mateu manifest (a 404/405 from any web server) is no longer
  added as a UI.

- **Redwood: two nested listings with the same toolbar action each send their own selection** (M17).
  A nested listing's toolbar button names its listing; two identical listings get their own keys
  (by component id; a generated UUID is left out), so they no longer share rows or selection.

- **Redwood live boards**: a card's texts are its row's data and are never evaluated as `${…}`; a
  second move made before the first answered no longer erases it (each pending move is dropped when
  ITS action answers); two identical boards on one page keep their own items.

- **React Native: a flow's `NavigateTo` interpolates its destination** (`orders/${state.id}`, each
  value percent-encoded), like the web's `resolveFlowCommand` (M4). An empty REST answer (a 204
  delete) is a success with nothing to merge, not a parse error (A21). A background manifest refresh
  that finds the UI now needs a newer app no longer unmounts the screen on display: it says so above
  it, and the next open asks for the update.

- **Desktop sign-in**: signing out or removing a UI asks the provider to revoke the refresh token
  (RFC 7009, when its discovery names a `revocation_endpoint`); a token stored under an earlier
  provider or client is deleted when the new one is stored; the issuer's host is compared
  case-insensitively; a refresh runs once per session for the whole app (it was per project).

- **Desktop**: an over-long numeric `wireVersion` is compared instead of throwing (it hung
  "Opening…"); the updater's plugin download is bounded (512 MB) and its staging folder is deleted
  without following links (the `/Applications` class of bug, #1000 — the CI guard now covers the
  plugin's sources too); `tel:` row links open; a card click keeps its row's own `_` keys; the focus
  stays on a card moved from the keyboard.

- **Live reload on the phone and the desktop app** asks the manifest again, with the reconnect
  back-off, while the server is still starting — opened together with "Run Mateu App (Live)", it
  used to find nothing and stay off.

### Corrections (to earlier entries)

- The entry that gave Python `canX()` gates was premature: Python's `Crud` had no `can_create` /
  `can_edit` / `can_delete` until the entry above.

- "A static bundle has no hash at all" (structure ETag): exported entries do carry a structure hash;
  what a bundle has no use for is the server's omission of an unchanged structure.

## [3.0-beta.43] — 2026-11-02

### Fixed

- **Redwood: date fields write and read dates in the UI's language.** Every `oj-input-date` /
  `oj-input-date-time` (the page form, the crud drawer, the dialog, the `List<Row>` row editor, a
  date range's two ends, the island) and the listing's range filters now carry a converter of their
  own in the UI locale — the page's language refined by the browser's region, the rule the Vaadin
  date pickers follow (#1004) — instead of JET's default one, which used whatever locale JET booted
  with: a Spanish interface could show a typed 15/2/2041 back as 2/15/2041 and read 5/2 as May 2nd.
  The range filters' «From»/«To» and the renderer's own Add / Add selected / Search / Done / Yes / No
  are chrome texts now (they were fixed English, or fixed Spanish).

- **A crud's built-in buttons speak the UI's language** (Java; Vaadin and Redwood alike). New, Save,
  Save and next, Cancel, Delete, Edit, Add another, Back to list, Import, History and the drawer's
  New / Edit title were English in a Spanish UI — «Save» next to Redwood's own «Cancelar». They pass
  through the app's `Translator` (so an app can still translate or rename them), and when it leaves
  them as they are, Mateu's own words come out in the request's language (`Translator.locale`, else
  the browser's `Accept-Language` — the language the client draws its chrome in) from a small
  catalogue of its own (`BuiltInTexts`, Spanish for now; the wizard's Save / Save and close / Skip,
  the calendar's Today and the optimistic-lock dialog's Reload / Overwrite benefit too). A label an
  app writes itself (`newLabel()` returning «Add a title») is left as it is; with no language, or one
  the catalogue lacks, they stay English. A static bundle's raw render keeps English.

## [3.0-beta.42] — 2026-11-02

### Added

- **An embedded `MicroFrontend` keeps out of the host page's chrome: `chrome(NONE | COMPACT | PAGE)`**
  (Java, Vaadin and Redwood; experimental). With any value the micro frontend is a block of the page,
  not a page of its own: the renderers apply no window title, history push or favicon from it, its
  navigation does not touch the address bar, and it draws no breadcrumb — before, each load renamed
  the browser tab after the remote, so the host page's title never stuck. Its requests carry
  `embeddedChrome` and the server answering them strips those commands too (also for `resolve =
  SERVER`, whose host now asks the remote as embedded and keeps the chrome for later interactions).
  `NONE` hides the remote page's header, `COMPACT` keeps only its actions, `PAGE` keeps title and
  actions. Without `chrome`, nothing changes. Wire: `MicroFrontend.chrome` and
  `RunActionRqDto.embeddedChrome`, both optional.

- **A foldout panel whose author did not decide is open while it fits** (YAML, all renderers). A
  `FoldoutPanel` with no `open:` now reaches the wire as `autoOpen: true` (`FoldoutPanel.autoOpen`,
  `@Experimental`; .NET `AutoOpen`, Python `auto_open`) instead of a silent `open: false`: the
  renderer opens such panels in declaration order while the row has room for each (its `width`,
  else 22rem, after the overview, the panels declared open and a strip per other panel), folds the
  rest, re-decides on resize, and a hand toggle wins until the next page. A museum exhibition at
  1600px used to show "Loans" and "Budget and visitors" folded beside empty space. `open: true/false`
  and every Java panel are unchanged. One rule in libs/mateu, Redwood, React Native and IntelliJ,
  pinned by `conformance/client/foldout-auto.json`; the browser expander applies the same default.

### Fixed

- **A crud's record page keeps its custom content after one of its own buttons** (Java). On the
  record page of a crud or a Navigable listing whose record implements `DetailContentSupplier`, a
  `@Toolbar` method of the record that answered the record (`return this`,
  `List.of(this, Message.success(...))`) ran against the record on its own, and its answer replaced
  the page with a bare reflected form of it: no Back to list / Edit, and none of the record's
  content — blank below the header when its fields are `@Hidden` and its inputs fluent `FormField`s
  inside `detailContent`. Those buttons now bubble to the crud as `action-on-view-<method>` (like a
  `@ViewToolbarButton`, keeping the method's `@Action` settings), and an answer of the record — or
  nothing, or the record with messages, also from a `@ViewToolbarButton` — re-renders the record
  page in place exactly as the view route draws it, route kept, messages shown. An answer of only
  messages still shows the record reloaded from the store (return `List.of(this, Message…)` to keep
  the values typed in the page). `@RestAction` and `Flux`-returning record methods keep their plain
  ids.

- **The calendar speaks the UI's language** (Vaadin and Redwood). A Spanish UI showed «noviembre de
  2026» over a `MON TUE … SUN` header, with `Today · Month · Week · List` in the CalendarPage toolbar:
  the weekday row was hard-coded English, the other dates used the browser's locale instead of the
  UI's, and the toolbar's built-in labels reached the screen in English whenever the app's
  Translator did not know them. Weekday and month names now come from `Intl` in the UI's locale
  (`<html lang>` set from `AppDto.locale` — the same locale source as the date pickers, now shared
  in `libs/mateu` `uiLocale.ts`), and the view names, *Today*, *+ Create* and the cells' event
  counts from the chrome catalogue (`calendarToday`, `calendarMonth`, `calendarWeek`, `calendarDay`,
  `calendarList`, `calendarCreate`, `calendarOneEvent`, `calendarEvents`; es/en). A toolbar label
  the app's Translator did translate is drawn as it came.

- **Redwood: a foldout panel taller than the window can be read to the end.** Spectra fixes every
  panel to the row's height and takes the wheel for its carousel, so "The works" of a museum
  exhibition (a grid of cards) was cut at the bottom with no way to reach its last rows. An open panel
  now scrolls inside, and the wheel over it scrolls the panel while it has room before paging the row
  (`poc/foldouts.mjs` `installFoldoutPanelScroll`). The Vaadin shell already grew the panels.

- **Redwood: a field's help (`@Help`, a `DescriptionSupplier`) is shown.** The server sends it as the
  field's `description` and Vaadin draws it as helper text under the field; Redwood dropped it. It is
  now the field's Redwood instruction text — JET's `help.instruction`, which the inputs draw under
  the field (text-like inputs while they have the focus, switches, radios and checkbox sets always)
  and read to assistive technology — on every field kind and every copy of the field templates: the
  page form, the crud drawer, the dialog, the wizard, the island and the `List<Row>` row editor. A
  widget JET does not own (`@Searchable`, file / image capture, colour, rich text, markdown, stars,
  a nested list in the row editor) draws the same text under its value.

- **Redwood: an action that re-renders the form in place keeps the scroll position.** An editor's
  `@Button` at the bottom of a long crud edit form re-renders the form in place (same component id
  and type); the page jumped back to its top. The scroll (the window's and that of a scrolled
  container holding the focus) and the focus of the pressed button are now put back once the answer
  is painted, until the reader scrolls, types or clicks. A navigation, a route flip (a row to its
  detail) or a host replaced by another component still start at the top.

- **A record page's tab is named after the record, never its id** (Java, web). A definition page
  whose title waits for its record (`title: ${state.name}`) was named by the route's last segment
  until the record landed — `/missions/6` read "6", its Edit page just "Edit" — and on an in-app
  navigation a late server title could overwrite the record's name for good. The fallback now
  humanizes the route PATTERN, skipping parameters and numbers (`missions/:id` → "Missions"), and
  once the page has named itself for a location a later fallback for the same location keeps it.

- **A menu group's own route opens an index of its entries under a data-authored shell** (Java).
  The menu gives each group a route derived from its label (`Solar system` → `/solarSystem`); under
  a `type: AppShell` it answered "Page not found" (the group carries no path, only the menu derived
  one), while a Java shell already showed the section index. Both now answer the index, it names
  the window after the group, and a YAML entry is linked at its own mount-relative route.

- **Web: an identical read in flight is shared, not repeated.** A record page whose route `data:`
  and a listing over the same record asked the API twice for `/missions/6` within 10 ms;
  `fetchExternalJson` now hands both callers the one response (each its own copy). Writes are never
  shared, and nothing is cached once the call settles.

- **Vaadin: a Gantt spanning decades fits its lane.** The axis drew one header cell per month — about
  780 for 1961–2026 — which pushed the lane into a long horizontal scroll with one or two bars in
  view. Its unit now follows the span (months, quarters, years, decades: `ganttScale` /
  `ganttTicks` in libs/mateu).

- **Vaadin: card images are named by the card's title** (listing cards, card lists) instead of an
  empty `alt`, and a tree listing hands its grid the row count, so the browser console no longer
  warns that the grid "needs the total number of items".

- **Redwood at phone width and back (live crawl of the demo sites).** A DataManagement page's docked
  panels stay closed below 600 px — JET turns them into a full-screen sheet there, which hid the
  listing on load — and dock again once the window is wide; a panel left open across the breakpoint
  used to stay in JET's z-order container and push the whole shell down by its height (438 px on
  /loans). A MENU_ON_TOP / TABS shell folds its menu strip into a ☰ navigator at phone width (the strip
  scrolled sideways with half the entries off screen), and a long listing title ends in an ellipsis.

- **Redwood: `gridLayout: masterDetail` opens the clicked row's fields beside the list** (an end panel;
  a full-screen sheet on a phone). The table ignored the declaration and a row click did nothing.

- **Redwood: a RouteLink button always navigates.** A header painted from a projection that lagged a
  slow load handed over its id without the route and the action went to the server (403); every
  action is now checked against the screen's RouteLink buttons before it leaves, and one whose
  record has not loaded yet sends nothing.

- **Redwood: a YAML page is headed by its own title and subtitle** (a page served as a client-side
  tree took the menu label: «Launch sites map» for «Launch sites»), and a listing page shows its
  subtitle.

- **Redwood: a YAML guided process can be walked by its steps**: the rail drew every step disabled
  (faint, not clickable, the current one indistinguishable). Text, number and text-area fields show
  their `placeholder`.

- **Redwood: a Gantt's axis unit follows its span** (months up to 18 months, quarters up to 54, then
  years), as the web renderer's does: a six-decade plan drawn by months and weeks had negative tick
  widths and one task on screen.

- **Redwood console noise**: an oj-table fetch the table aborted itself no longer surfaces as an
  uncaught «Aborting stale fetch»; leaving a DataManagement page no longer fails the navigation chain
  («Cannot read properties of null (reading 'end')»); banners carry their keys (VB's «No keys were
  specified» warning); a foldout's last content clears its floating paging dots.

### Fixed (security — final independent review)

- **A `@ReadOnly` `EditableView`/`AutoEditableView` refuses writes, not only its Edit button** (H1).
  The `/edit` route and the `edit`/`save` actions answer 403 when a request names them; they used to
  run, and a forced `save` persisted. `AutoEditableView.save` re-checks the editor's bean-validation
  constraints on the server, as a CRUD save does.

- **The structure cache no longer stores a page's values** (H2). The server's structure ETag covers
  the structure only — a page whose values changed (an edited record, a clock) gets the small
  state-only answer, with its values on the fragment state —, and the browser persists only the
  structure: the values a page was opened with stay in the tab's memory, so another tab, a reload or
  another user of the browser never sees them painted. Signing in or out clears the cache.

- **The unsupported-component placeholder shows the wire type name as text** (H3): a name carrying
  markup (an agent push, a foreign remote) used to become live HTML in its shadow root. An untrusted
  definition's `Element` with a name that is not a plain tag name becomes an empty `div`.

- **An action id a response handed out is remembered per caller** (Java strict mode): the confirm
  of a dialog only an admin could open is no longer callable by everybody once one admin opened it.
  Kept for eight hours.

- `nested-form-action-<field>` with no method part answers 403 instead of a server error; a 403
  inside a drawer save is not turned into the drawer's error banner.

- A composed `rowRoute` (`people/${row.id}`) percent-encodes each value on the web too, and
  `/\host` counts as another site in `rowRoute`, documents and Redwood's leave-the-mount rule.

- The desktop app no longer migrates a pre-per-UI refresh token to whatever issuer the manifest names
  now (it is deleted: one more sign-in), and forgets a refresh token the provider answers
  `invalid_grant` to.

- The mobile `ota` job publishes only for a published release, never for a manual re-run of an
  older tag (which would have downgraded every phone).

- A route's `fixedParams` now also win on the PROXIED REST leg (they were applied only when
  hydrating the view model), and only a `${secret.X}` may choose a proxied url's origin — any other
  expression (`String(state.x)`, `state['x']`, a bare name) is refused (Java, .NET, Python).

- Helidon MP: the streamed actions, MCP and YAML mounts see the roles and scopes of Helidon
  security's subject; an app authenticating with a JAX-RS filter at `@Priority(AUTHENTICATION)`
  requires a login there (`mateu.helidon.authentication-required=false` opts out) and a streamed
  action carrying credentials is handed to Jersey, where the filter's identity applies.

- .NET/Python inline YAML partials as source before applying access keys and `${i18n}`: a section
  guarded by `eyesOnly:` inside a partial reached every caller.

### Fixed (behaviour — final independent review)

- Constraints inside an `@Inline` nested form are validated with the page, by the client and by
  the server's re-check (they were checked by neither).

- .NET/Python: the structure hash no longer includes the page's values or random nested ids, and a
  proxied rows fetch is answered by the source its id names (a listing next to a live board).

- React Native: REST source templates evaluate `String(x)`, `Number(x)`, `encodeURIComponent(x)`
  (encoded once), `Math.*` and string/list methods, and send a money value's amount — demo-starwars
  searches sent nothing on the phone. RN now runs the source-template corpus.

- `?sort=name:asc` / `desc` is read by the server (it failed the search) and by Redwood (it was
  dropped), like Vaadin.

- Kanban: a move the server REFUSED (a handler that threw answers an error message) puts the card
  back on Vaadin, React Native and IntelliJ, and only a failure of the move itself does; a live board
  reads its source again after a server-side move. IntelliJ reads a proxied call's
  `_restfetchError` (a failed delete said "Deleted").

- Vaadin: the window title no longer follows a form opened in a drawer or a dialog.

### Documentation

- Corrected: the drawer error banner text, the proxied-leg expression subset, Redwood's rich text
  and header expressions, the structure cache, Kanban failures and live re-reads, `rowRoute`
  escaping, YAML `HorizontalLayout` spacing, the OTA job, read-only editable views, strict mode per
  caller, and `mateu.helidon.authentication-required` (now in the configuration table, with the
  custom JAX-RS filter case).

## [3.0-beta.41] — 2026-11-02

### Fixed

- **Redwood: a field with `@Label("")` shows no label.** Its label fell back to the raw field id
  whenever it was empty (a `warnings` field read "warnings"); the id is now used only when the wire
  sends no label at all.

- **Redwood: a `List<Row>` field's row dialog draws the row's multi-selects and nested lists.** The
  dialog ("Edit block", Prev/Next) skipped every list-typed field of the row, so a
  `@Stereotype(multiSelect) List<String>` whose options come from the row's `OptionsSupplier` (a
  block's audience: departments, hotels, job titles) and a nested `List<Child>` (a quick-links
  block's `List<Link>`) could not be edited at all. A multiple choice is now an `oj-select-many`
  (an `oj-checkboxset` for `checkbox` / `choice`) with the options the server sends inline; a nested
  list is a small table of the child's fields with add / remove / move up / move down, edited on the
  client — its rows live in the row's draft and travel with the row on Save, and the form's Save
  persists them. The end of a date range edited in the dialog is folded back into its field (it was
  kept under `<field>#from` / `#to`). Still not edited in the dialog: a list with neither options
  nor columns (a `List<Integer>`), and a nested child's own non-simple fields (selects, dates,
  nested lists — its cells are text inputs, a number or a switch only when the column's inline editor
  type says so).

## [3.0-beta.40] — 2026-11-02

### Fixed

- **Vaadin: the breadcrumb from a record back to its crud list shows the list.** It changed the URL
  but left the record on screen, because the reload of the list's route got a state-only answer
  (#1021).

## [3.0-beta.39] — 2026-11-02

### Fixed

- **A plain `Listing` embedded in a menu or a drawer keeps its Export buttons** (Java): the exporters
  were not consulted outside a page mapping, so `csvExportable()` advertised the action but no button
  was sent (#1019).

- **Redwood: a comment's avatar can be initials or an emoji**; only a URL is fetched as an image
  (#1019).

## [3.0-beta.38] — 2026-11-02

### Added

- **`OrgChart` in focus** (`@Experimental`; Java, YAML, .NET, Python). `display: focus` shows one
  node at a time — its chain of managers above, its reports below — and picking one moves the focus
  there, client-side; `focus` names the node it opens on. Redwood draws it with Spectra's
  `oj-sp-hierarchy-viewer`; Vaadin, React Native and IntelliJ draw their own. `tree` stays the
  default (#1016).

## [3.0-beta.37] — 2026-11-02

### Fixed

- **An editor's `@Button` (and a `@ViewToolbarButton`) updates its crud page however the crud is
  hosted** (Java). The answer aimed at an id derived from the component that sent the action
  (`"ux_" + initiator − "_app" + "_cs_edit"` / `"_cs_view"`), which only names the page when the crud
  is its app's home. As a menu entry of another app the app sends it, the answer — right values,
  right message — went to `ux_ux_root_…_App_cs_edit`, which does not exist, and the form never
  changed. A crud's routed `view` / `edit` / `new` page now carries its own id and route in its state
  (`_pageId`, `_pageRoute`; internal, left out of `CrudFormState`), which every bubbled action sends
  back, and the answer goes there. The edit / creation form is also re-rendered in place rather than
  only re-stated, so what the editor computes from its values (a preview, a `Callable<Component>`
  field, a button's visibility) follows them — same page, still in edit mode — and, when the action
  changed a value, the form is marked dirty: leaving it asks first, as after typing.

## [3.0-beta.36] — 2026-11-01

### Added

- **A crud's edit and creation forms render the editor's own `@Button`s** (Java). They sit under the
  form — in the drawer's bottom row, before Cancel/Save — and are the actions that only make sense
  while editing (insert a medium into the text, translate it, refresh a preview). Like save, they
  bubble to the crud with the form's values (`action-on-editor-<method>` /
  `action-on-creation-form-<method>`): the method runs on the editor rebuilt from them, and an answer
  of `this`, nothing, messages or `List.of(this, Message…)` updates the form in place — still in edit
  mode, Save still saving what the action produced. Hidden (`VisibilitySupplier`, `@Hidden`,
  `@Audience`) and unauthorised buttons are left out, and an id naming no `@Button` of the form is
  refused (403). They used to be dropped: the form showed only Cancel/Save, and an editor method
  invoked on its own answered a bare page of the editor without them.

### Fixed

- **Vaadin: date pickers format and parse in the user's locale.** `vaadin-date-picker`,
  `vaadin-date-time-picker`, `vcf-date-range-picker` and the grid's inline date editors used
  Vaadin's en-US default (M/D/YYYY): in a Spanish browser "15/2/2027" read as month 15, the field
  silently kept no value while still showing the text, and the server rejected the form as if the
  date were missing. The locale is the UI's (`<html lang>`, from `AppDto.locale`, else the
  browser's); order, separator and padding come from `Intl.DateTimeFormat`, typing accepts 1–2
  digit day/month, 2- or 4-digit year and ISO `yyyy-mm-dd`, an impossible date (month 14,
  31 February) leaves the field marked invalid, and month/weekday names, the first day of the week
  and the calendar's buttons follow the locale too.

- **A `List<Row>` field's row editor honours the row's `VisibilitySupplier`.** The editor ("Edit" and
  "+") was built from the row CLASS, so `isHidden` was never asked and every field of every row type
  showed (a quick-links block offered its HTML, item, section, limit and media fields). It is now built
  on the row instance with that row's values, re-built for the neighbour on Prev/Next, and re-built
  while editing when a field the visibility depends on changes: each enum/boolean field of the row is
  probed, and the ones that change what `isHidden` hides get an OnValueChange trigger that answers
  `<field>_refresh-detail` (a background read, Vaadin and Redwood). Visibility hanging on a free-text
  field is evaluated when the editor opens.

- **Vaadin: a wide row grid keeps "Edit" in view** — the per-row Edit column (and the details toggle)
  is frozen to the end by the renderer instead of sitting past the horizontal scroll (no wire change).

### Fixed (security and parity — Fable review)

- **Screen readers no longer hear a stale message over a newer one (Vaadin + Redwood).** Repeating a
  message (two failed saves in a row) clears the live region and puts the text back 60 ms later; a
  different message announced in between was then overwritten by the old one. A newer announcement
  now cancels the pending repeat (`libs/mateu` `announcer.ts`, Redwood `poc/a11y.mjs`). This was also
  the intermittent Redwood suite failure: a test waited a fixed 80 ms for the previous test's repeat.

- **Live reload reaches the desktop and phone apps.** Only the browser followed a development
  server's live-reload events, so a YAML edit or a HotSwap re-rendered the web tab while the screen
  opened from the IDE in the Mateu desktop app or on the phone stayed stale (the docs said the desktop
  app re-rendered). A backend in development mode now names its event stream in the hub manifest
  (`devEvents`, Java/.NET/Python; absent outside development mode), and the IntelliJ renderer
  (`live/LiveReload.kt`) and the React Native app (`core/liveReload.ts`) follow it while a UI is open,
  re-rendering on a YAML edit, an IDE reload or a restart. The meaning of each event is a shared
  corpus, `conformance/client/live-reload.json`, run by the web, React Native and IntelliJ suites.

### Documentation

- Desktop installers are built on CI only; their build never uses `File.deleteRecursively()` (CLAUDE.md, CONTRIBUTING.md) (#1007).

- The museums conservation board is the reference example of `orderField` (#1008).

## [3.0-beta.35] — 2026-11-01

### Added

- **Kanban `orderField`**: a live board keeps the manual order of its cards (each move sends `_toOrder`, the midpoint between its new neighbours); shared corpus run by Vaadin, Redwood, React Native and IntelliJ (#1001).

### Changed

- .NET and Python proxies evaluate the same source-template subset as Java (shared corpus) and their validators warn `proxy_unsafe_template`; two .NET parity fixes (`String(-0)`, compact `JSON.stringify`) (#1001).

### Fixed

- React Native and IntelliJ: JSON-escaped `body:` values; the window title follows a YAML record's data (#1001).

- Redwood: staying after a refused back/forward restores the history; pages with no declared width take their type's default (dashboards/collections full width) (#1001).

- Web master-detail listings stack on phones (#1001).

- Desktop installer build: never deletes through a symlink — the macOS dmg stage could delete /Applications when built locally (#1000).

## [3.0-beta.34] — 2026-11-01

### Added

- **Redwood: an editable `richText` is Spectra's rich text editor.** `oj-sp-input-rich-text-2` (CKEditor 5)
  from the same Oracle CDN, with headings, bold/italic/underline, lists, links, a horizontal rule,
  the source view and undo/redo — instead of Mateu's small contenteditable editor, which stays as the
  fallback when the CDN does not load. No picture upload: CKEditor would inline it as base64 in the
  value. Same contract as before: the value is HTML (a legacy Quill Delta opens converted), sanitised
  by the same allowlist, and it is committed when the editor is left, before a click on Save runs.

### Fixed

- **A deep link to a record whose id has a dot opens it.** `/people/ana.perez` or `/releases/1.2` on a
  reload or a shared link was a 404: any dot made a path a file. Now a path is a file only when its last
  segment ends in a web asset's extension (`SpaFallback.isAsset`), on every adapter and in every
  generated index controller.

## [3.0-beta.33] — 2026-11-01

### Security

- **A CRUD's writes are refused if forced, not only undrawn** (Java, .NET, Python): `@ReadOnly`,
  `@NotCreatable`/`@NotEditable`/`@NotDeletable`, `canCreate/canEdit/canDelete()` and `display()`
  toggles (`off`/`disabled`) now answer 403 to a crafted `create`/`save`/`update-row`/`delete`.

- **Strict action mode no longer reads the class's string literals**: an unmarked method is accepted
  when the view's declarations name it or a response to the view emitted its id (a dialog's confirm,
  an undo, a served row's `ColumnAction`). A handler named only by a literal now needs `@Action`.

- `nested-form-action-<field>-<method>` must name a field, and its validated buttons are re-checked.

- A failed save in an edit drawer shows the error boundary's text (generic + reference), not the
  raw exception message (Java, .NET, Python).

- A proxied REST source's headers and body template never reach the client (app catalogue,
  responses, `manifest.json`); `__restfetch__` refuses a source that is not `proxy: true`.

- Helidon MP: the SSE, MCP and YAML-mount routes (outside Jersey) see Helidon security's caller and
  refuse anonymous calls when the app requires a login; Quarkus `/mateu/mcp` runs after HTTP security.

- Bulk-delete ids reach the store as the crud's id type; a save never adopts a client `@Version`
  ahead of the stored one, and a version column is not inline-editable.

### Added

- **Desktop app: one sign-in per UI.** Switching UIs in the desktop hub no longer drops the session
  of the one you leave: each UI keeps its own (keyed by address + identity provider + client), Sign
  out is per UI, removing a UI deletes its stored tokens. An earlier single stored token moves to its
  UI once. Verified end to end against Keycloak (device flow, refresh, two realms).

- **Kanban boards move: drag and drop, and a Move menu.** A `Kanban` with a `moveActionId` lets
  its cards be dragged to another column or reordered within one (a line shows where it lands); each
  card also has a Move menu (`⋯`: up, down, to another column) for the keyboard, screen readers, phones
  and the IntelliJ plugin. The card moves at once and goes back if the action fails; the action gets
  the card's item plus `_cardId`, `_fromColumnId`, `_toColumnId` and `_toIndex`. A board can also be
  **live**: `rowsSource` + `columnField` + a `card` template (`${row.x}`) + `cardColors` + `cardRoute`
  draw the cards from a REST source, read again after each move — so a YAML page with a `restAction`
  move needs no Java. A REST action now reads its call parameters over the state on both legs
  (browser and proxied). Java, .NET, Python; Vaadin, Redwood, React Native, IntelliJ.

- **Live run ▸ Desktop opens the UI in the Mateu desktop app, a separate IntelliJ.** It used to repoint
  the developer's own IDE and open its tool window. The IDE now hands the installed desktop app
  `mateu://add?u=http://localhost:<port>` (macOS: by bundle id, since the phone app claims the scheme
  too); without it, a notification offers the download or the old way. The desktop app accepts plain
  http for this machine only (hub-links corpus option `allowLoopbackHttp`). VS Code: setting
  `mateu.liveRun.openIn` + *Mateu: Open Running App in the Desktop App*.

- **A `mateu://` link that STARTS the desktop app now works.** The platform took the URL as the whole
  command line and never opened the workspace the launcher passes: the app sat on IntelliJ's welcome
  screen and answered "This Mateu app does not add UIs from links". It now opens its bundled workspace
  first.

- **The hub apps check whether they can render a UI, by themselves.** The UI manifest now carries the
  server's Mateu release (`mateuVersion`, beside `wireVersion`; Java, .NET and Python, omitted on a
  development build). When a UI is added, opened or its manifest refreshed, the phone and desktop apps
  compare it with their own wire and release (`conformance/client/app-compat.json`): another wire
  major, or `minAppVersion` above the phone app → not added or opened, **Update Mateu** offered; a
  newer minor or release → opens with a note. **Update Mateu** installs an over-the-air update when
  there is one, else opens the store (or, for the GitHub APK, the releases page); on the desktop it
  checks the update feed at once. Each release now publishes the phone app over the air when the
  repository has `EXPO_TOKEN`.

- `uploadableImage`: "Use a URL" beside Upload (Vaadin, Redwood; IntelliJ shows a URL value as an image) (#991).

- A failed REST call shows the service's message (`message`/`error`/`detail`/RFC 7807, as text) instead of "Request failed (HTTP 400)", on the direct and the proxied leg, in every renderer and backend (#991).

### Changed

- **Vaadin: listings, boards and dashboards use the full width.** Every page sat in the server's
  default 900px column whatever width it resolved to; that column is now only a FIXED page's (a
  form's reading measure), and full/edge pages take their width. The width rules: full-bleed content
  (gantt, planning board, kanban, BPMN, map, foldout) → edge-to-edge, but full width on a form page;
  collection and dashboard pages → full width; form/process/landing → fixed. A YAML listing page
  served with route seeds is a collection (it went out as a form page).

- **A YAML `HorizontalLayout` with no `spacing:` is spaced** on the Java backend and in static bundles,
  as it already was on .NET and Python — an image beside a form no longer touches it.

### Fixed

- **Vaadin: an edge page's header keeps its gutter** (a templated foldout's title, back arrow and
  actions touched the viewport edges), and a YAML page filling a template no longer draws its window
  title ("13") above its own header.

- **Vaadin: a listing's header wraps on a phone** — the actions go below the title instead of
  squeezing it to "Laun…".

- **Desktop sign-in failed against a client that requires PKCE.** A client set up for the phone app
  (Keycloak "PKCE Method: S256") refused the desktop's device request with "Missing parameter:
  code_challenge_method". The device flow now sends a PKCE challenge (and its verifier on the token poll).

- **Phone app: no way to sign out of a UI with bottom tabs.** "Sign out" lived only in the app shell's
  drawer; a UI whose shell has tabs (or no menu) had none. The hub's top bar now offers it while signed in.

- **Back returns to the previous page, sort or filters of a listing** (Vaadin and Redwood). Each
  change the user makes is now a history entry (`pushState`); it used to replace the URL, so Back
  left the listing. A hand-typed `?sort=name:asc` is read as `ascending` instead of failing.

- **The browser tab of a YAML record page shows the record's name** (Vaadin), not the route's id
  ("28" → "Voyager 1"): the window title follows the page title once its `data:` arrives, and the
  screen reader hears it once. Redwood header texts now evaluate expressions (`${state.a ?? ''}`,
  `${data.x}`) like the web.

- **A server `NavigateTo` no longer raises the browser's "Leave site?" prompt** on a form with
  unsaved changes; staying after a refused Forward no longer scrambles the history; React Native and
  the IntelliJ plugin ask before every leave action (`cancel-new`, `back`…), not only three.

- **Redwood: a listing whose rows open nothing shows no hand cursor.** Every table row invited a click;
  now only a row that opens its route, its record or its detail does (`mateu-rows-open`).

- Redwood: a listing nested in a page selects rows and its toolbar acts on them; the list refreshes after a write without a 403 (#991).

- Redwood: header texts interpolate expressions (`${state.x ?? 'y'}`, ternaries, `data.x`) (#992).

- Desktop installers: the Windows setup builds again — per-file LZMA instead of one solid block that crashed makensis (#990).

- Flaky tests fixed: the tab-session test bus, the .NET micro-frontend remote deadline (#989, #998).

### Fixed (security and parity — Fable review)

- **A `type: Partial`'s access keys and `${i18n.…}` are applied on the server**, like the same
  content written inline. A section guarded by `eyesOnly:` used to reach every caller once it lived
  in a partial, and its texts stayed raw.

- **A bundle never ships a definition that depends on who asks.** A hybrid bundle wrote access-guarded
  definitions raw into `manifest.json` and the browser expanded them for everybody; now they are not
  shipped, and the resolver refuses to expand a route with `access:` or a definition with access keys.

- **One route-parameter order everywhere: `fixed > client state > path > query > defaults`.** The .NET
  and Python servers ranked the path over the client state, let a null erase a default and ignored the
  URL query; static bundles (web, Redwood, React Native) dropped the query too.

- **A proxied REST source sends what the browser would.** The server now evaluates the expression
  subset sources use (`${(state.page ?? 0) * 20}`, conditionals, `?.`, `String`/`Number`) instead of
  sending it empty, and a list value is `a,b` on every leg (Java sent `[a, b]`, Python `['a', 'b']`,
  Redwood `["a","b"]`). The validator flags a template the server cannot evaluate
  (`proxy_unsafe_template`). Pinned by `conformance/client/source-templates.json`.

### Documentation

- Docs audit applied: generated component list (CI-checked), `MasterDetailView`/`@DetailPart`, parity rows, C#/Python server options, `layout:` in samples (#983).

## [3.0-beta.32] — 2026-11-01

### Added

- **A `rowRoute` can be a URL: the row opens it in a new tab.** A row whose items have no page in the
  app (a gallery's photographs, a document in another system) can point at one elsewhere:
  `rowRoute: ${row.imageLarge}` or `https://example.com/docs/${row.id}`. A route that starts with a
  scheme or `//` leaves the app — a new tab on the web renderers, the browser on React Native and in
  the IntelliJ plugin — and only http(s)/mailto/tel are opened. A one-placeholder template takes its
  value unescaped (Redwood escaped it as a path segment). Vaadin, Redwood, React Native, IntelliJ.

### Fixed

- Redwood: a new screen no longer inherits the previous one's state — a listing reached from a record searched with that record's fields and came back empty or with one row (#974).

- Redwood: a RouteLink route is read against the screen's state (`missions/${state.id}/edit`) (#974).

- Redwood: a docked panel with no toggle action (a YAML `DockedPanel`) stays closed when closed (#977).

- Vaadin: a revisited record page keeps the data it loaded itself (the detail went blank) (#976).

- A YAML page filling a template takes the template's page type — a collection detail no longer switches from full to fixed width when a record is selected (#978).

- Desktop app: release builds go through the IntelliJ layout-index helper; a failing Windows setup now says why (#973).

## [3.0-beta.31] — 2026-11-01

### Fixed

- **Redwood: a `Listing` in a foldout panel is drawn, with its rows.** On a `FoldoutPage` (an exhibition's
  works and loans) the listing's rows were loaded but the panel drew nothing: a panel's content was read
  without the page around it, so the listing was not known to sit in a templated page's slot. A foldout
  panel is such a slot now.

## [3.0-beta.30] — 2026-10-31

### Fixed

- **A source url no longer encodes an explicit `encodeURIComponent(…)` twice.** Since Mateu encodes
  every value where it lands in a url, `search=${encodeURIComponent(state.searchText)}` sent
  `Sample%2520Return` and a multi-select `Painting%252CPhotograph`, so every search with a space and
  every multi-valued filter matched nothing (demo-starwars wraps every value this way, so its live
  filters were broken). An expression that is exactly one `encodeURIComponent(x)` call now means
  `${x}`: encoded once, a list joined with commas as JavaScript does. The same in Vaadin, Redwood and
  the Java, .NET and Python proxies, which now also resolve a fallback (`${state.page ?? 0}`) and a
  nested path.

- **A money value interpolates as its amount.** A `dataType: money` value is `{value, currency,
  locale}`; `${state.v}` landed as `[object Object]` in the browser and as `{value=12500000,
  currency=EUR, …}` on the proxy, so a proxied write answered 400. `${state.v}` is now the amount and
  `${state.v.currency}` the currency, on every leg. Vaadin's money input also starts an empty amount
  in the field's declared `currency` attribute (EUR when none), as Redwood already did.

- **A `Navigate` step resolves its placeholders.** `route: launch-sites/${state._markerId}` navigated
  to the literal text; the route is now interpolated (encoded like a url) against the page's state
  with the action's parameters on top, so a map marker can open its record. Vaadin and Redwood.

- **YAML anchors and aliases are resolved in specs files.** Jackson's YAML parser read `*api` as the
  string `"api"`, so `museum-artworks: *api` in an environment re-pointed nothing while the log still
  counted it. The Java specs loader now resolves aliases and merge keys (`<<: *base`), as Python's
  does; .NET resolved aliases but not merge keys, and now does both.

- **Vaadin: `${state.x}` in a banner, a MetricCard, an EntityHeader, an Anchor and an Avatar's image.**
  The components that draw their texts straight from their metadata never interpolated them: a YAML
  record page (`title: ${state.name}` on a route with `data:`) showed the raw template in the Welcome /
  MultimediaContentPage banner (title, subtitle, overline), in a `MetricCard`, a `Stat`, an
  `EntityHeader` left in the body and an `Anchor`, and an `Avatar` requested `image: ${state.thumbnail}`
  literally (a 404). They interpolate now, like everything else (`interpolateFields`). Redwood already
  did, except a MetricCard's and a Stat's value and an EntityHeader's metric label: those too.

- **Vaadin: a select whose options have numeric values shows its value.** `vaadin-select` and
  `vaadin-combo-box` match values as strings, so an option source giving ids (`{value: 25}`) never
  matched the field's `25` and the control stayed blank. The control gets the values as strings and a
  pick is written back as the option's own value (`25`, not `"25"`); the same for a checkbox group's
  list of ids.

- **Vaadin: a `combobox` and a `multiSelect` read their `optionsSource`.** Only `select` fetched a REST
  source; a single or multi-valued combobox and a multi-select (checkbox group) listed nothing. The
  fetch is shared by every stereotype that offers options (Redwood already loaded them for any field).

- **An editable `image` field can be changed.** In an editable form the `image` stereotype drew only
  the image, full size, with no input. It is now the URL input with a contained preview that follows
  the value; read-only it stays the image. Redwood offered a file upload for it (that is
  `uploadableImage`): now the same URL input and preview.

- **A tree listing over a REST source keeps its children.** A `gridLayout: tree` Listing whose
  `rowsSource` is a REST source projected each fetched row onto its declared columns, so `children`
  (not a column) was dropped and only the roots showed; the workaround, a `children` column, painted
  `[object Object]`. The row projection now carries the tree's `children` through, level by level
  (read through the source's `fields` map, so `fields: {children: subComponents}` points it at
  another response field), on the direct and the proxied leg. Vaadin draws the hierarchy in its tree
  grid; Redwood, which drew the roots as a flat table, now draws every level flattened under its
  parent with the first column indented (always expanded — no expand/collapse toggle yet).

- **A `Partial` inside a wizard step renders.** The partials of a `GuidedProcessPage` step were never
  expanded: the steps are records of slots, not components, so the expander stepped over them and
  the step drew nothing (`No mapper renders io.mateu.uidl.data.Partial`). A template's list of parts
  is now walked like the template itself.

- **Redwood: a `Listing` inside a templated page stays where it is.** On a page that declares a
  `template:` (general overview, multimedia content, welcome, collection detail…) the first `Listing`
  anywhere was taken for the page's own listing and hoisted out of its slot: a general overview was
  drawn twice (the listing on top — its search box and its band, a second header — the page below it;
  a foldout page the same), a multimedia page's gallery went to the top with
  a search bar — and, the listing owning the page, its sections fell back to the generic form, so the
  section's `Image` was not drawn and a read-only `html` field showed its raw markup —, and a welcome's
  featured cards and a collection detail's nested listing were not drawn at all. Such a listing is now
  content of its slot: it loads its first page from its `rowsSource` on opening (the record's state
  interpolated) and is drawn in place, as picture cards (`gridLayout: cards`) or a table, a row with a
  `rowRoute` opening its record. Only a hero search's results, a data management page's table and a
  collection detail's list slot remain the page's listing.

- **Redwood: a section's first heading is kept.** A `Text` with `container: h2` opening a section was
  taken for the section's title and dropped; only a heading that IS the title is now left out.

- **Redwood: a `dateRange` form field is drawn**, as two date inputs (from, to) whose edits keep the
  field's `{from, to}` value. It was not drawn at all.

- **Redwood: an `Image` honours its `style` and `cssClasses`** (a `max-width: 220px` portrait was drawn
  as wide as its column).

- **Redwood: no more `ojtabbar.js` 404 on every page.** The page imported `oj-tab-bar` from
  `ojs/ojtabbar`, which JET does not ship; it lives in `ojs/ojnavigationlist`.

- **A page opened again is loaded once, not twice.** A route drawn from the client structure cache
  (any return visit) was replaced by the server's identical structure as soon as it answered: the
  structure hash counted the random ids of the nested components that name none (a YAML page's
  texts, cards…), so it changed on every request and the server never answered state-only. The page
  re-mounted — it flickered — and ran its OnLoad, its record fetch, a second time. The hash leaves
  those instance ids out; and the web shells keep the predicted structure when the answer is the same
  one (a static bundle has no hash at all), taking only its state and data.

- **Vaadin: no search box a listing cannot search.** A listing over a source that takes no text and
  with no filters still drew the search bar — a box without an input that took no typing (the works
  and loans of an exhibition's foldout panels). It draws none.

- **Redwood: the page does not jump to its top before the next one opens.** Following a link halfway
  down a page scrolled it to the top at the click, and only then did the new screen arrive. It goes
  to the top when the old screen is hidden or the new one is in place, whichever comes first.

## [3.0-beta.29] — 2026-10-31

### Fixed

- Redwood: every navigation names the browser tab (federated screens kept the previous title); an empty listing speaks the chrome language (#952).

- Redwood: a page foldout owns its header as Toolkit 26C draws it (back → go-to-parent, actions on the overview panel); pinned foldout panels without a gap; listing actions that need rows are disabled until a row is checked (#956).

## [3.0-beta.28] — 2026-10-31

### Changed

- Redwood page templates as the Toolkit 26C draws them: item overview keeps the page width; a lone tab draws no bar; read-only fields stacked (label above value) in the item overview and collection detail; collection detail content on Spectra's own inset; a declared `FoldoutPage` owns its header (back → go-to-parent, actions on the overview panel) (#947).

- Star Wars demo: edit/new pages put Cancel + the primary action in the header; record pages show read-only details in up to 3 columns (#947).

## [3.0-beta.27] — 2026-10-31

### Added

- **Micro frontends resolved in the server** (`MicroFrontend.resolve = SERVER`, `timeoutMs`): the host asks the remote while building the view and embeds its fragments; timeout/error degrades to the client. Remotes, identity, correlation id, fragment cache and resolution listeners behind interfaces (`io.mateu.uidl.remote`). Java, .NET and Python; every renderer paints the embedded answer. `@Experimental`.

- **`@ContentSlot(key, fallback, timeoutMs, description, degradeToClient)`**: content resolved server-side against a content service (`/content-slots/{key}`), fallback on empty/error/timeout; keys checked at compile time and listed in `META-INF/mateu/content-slots.json` (new artifact `mateu-annotation-processor-slots`). Contract: docs `components/content-slot`.

- Remote-decided fragment cache (`@CacheableFragment`, `FragmentCachePolicySupplier`, per-audience keys, `notModified`).

- Demo `demo/demo-microfrontends` (:8623).

### Fixed

- Dev live-reload no longer loses a change made right after connecting; parity tests no longer depend on test order.

## [3.0-beta.26] — 2026-10-31

### Fixed

- **A menu entry named like its group goes below it.** A `@Menu` field named like the menu that holds
  it (`users` inside a `users` section, the natural spelling of a users CRUD) got the group's own path,
  `/users` instead of `/users/users`, since `3.0-alpha.425` routed an entry "already under its group"
  once: equal to the group was taken for under it. Its screen was never reached (the route landed on
  the group's index) and, since every route of the group starts with it, it was selected on all of
  them. Strictly under, now, in Java, .NET and Python; and the server compares an entry's path below
  its group when it marks it selected.

- **Redwood: an empty single select is empty.** JET's `oj-select-one` paints its first option when the
  value is null and it has no placeholder, and only the generic form's copy had one: in every other
  form surface (host, drawer, dialog, wizard, island, listing…) an unset select looked filled in with
  its first option while the form held nothing. Every copy now carries the placeholder (the atoms
  template, expanded by `make-html.mjs`); a test pins it.

## [3.0-beta.25] — 2026-10-30

### Added

- Page templates in YAML: `WelcomePage`, `DashboardLandingPage`, `GeneralOverviewPage`, `CollectionDetailPage`, `FoldoutPage`, `MultimediaContentPage`, `AdvancedCreateEditPage`, `GuidedProcessPage`, `DataManagementPage`, `HeroSearchPage` — drawn with Spectra's templates on Redwood (#939). Star Wars demo: one page per template.

- Figma library of every template and component + the figma-to-yaml converter (#940).

### Fixed

- Vaadin: no flash of the previous screen on navigation (#941).

## [3.0-beta.24] — 2026-10-30

### Changed

- Redwood: the item overview page as in Redwood's examples — the template owns the page (edge to edge, no content card), compact tab bar, the overview body stacked (label above value), sections in the main slot with Spectra's `oj-sp-section` header (#937).

- Star Wars demo: record pages fill the main slot with sections (#935).

## [3.0-beta.23] — 2026-10-30

### Added

- **Page templates in YAML** — `template:` on a `type: Form`: a page fills one of Redwood's page templates (fields and slots named as Spectra names them) or is free. First template: `ItemOverviewPage` (avatar/photo, body/footer slots, the form's content as the main slot). Redwood paints Spectra's `oj-sp-item-overview-page` (with its own edit action); the other renderers draw Mateu's version. Not yet in the .NET/Python YAML builders.

- Web: `Image` interpolates `src`/`alt` against the page state.

- IDEs: the Item Overview page template writes `template:`.

### Changed

- Redwood: no longer overrides the item overview template's look (forced `light` display mode and panel surface removed).

- Star Wars demo: the record pages use the Item overview template.

## [3.0-beta.22] — 2026-10-29

Redwood listings over a REST source search, filter and page again; RouteLink buttons navigate; the
mobile app goes Material 3, adds a UI from any page address and opens a UI it knows at once.

### Fixed

- **Redwood: a REST source url evaluates its expressions.** Each `${…}` of a `rowsSource` url is an
  expression (`state.page ?? 0`, `state.sort?.[0]?.fieldId`, `encodeURIComponent(…)`), as the web
  renderer evaluates it; Redwood read it as a dotted path, so it came out empty and the listing's
  search, filters, sort and pager did nothing. The evaluator gained the pure global functions a url
  needs (`encodeURIComponent` and friends, `parseInt`, `String`/`Number`/`Boolean`).
- **Redwood: a Button whose actionable is a RouteLink navigates** in a listing toolbar and in a record
  page header (primary, back, secondary). It ran its `actionId` — only the label's echo — and strict
  mode answered 403 "You're not allowed to do this". Header labels are interpolated
  (`Back to ${state.name}`).
- **Listings over a REST source keep the fields a column reads beside its own** — a primary cell's
  `leadingPath` (picture) and `captionPath`, a `tooltipPath` — on the web, Redwood and React Native;
  a row mapped to the column ids alone dropped them. React Native's list row draws the picture and
  the caption.
- **Visual editor:** on the mount board, a welcome page no longer swallows the sections the shell also
  leads to into its own band.

### Mobile app

- **Material 3 hub** (React Native Paper): top app bars, the list with round avatars, a "+" FAB that
  opens a bottom sheet (Scan a QR code / Type an address), the open UI's bar in its colour.
- **Add a UI from the address of any of its pages** — a browser's own "QR code for this page", a
  pasted page url: the app asks for the manifest from the full path upwards and opens the screen.
- **Opening fast:** a UI opened before opens with its cached manifest (refreshed in the background),
  a static bundle kept on disk and revalidated with its ETag, and its last screens painted while the
  fresh ones load — never for a UI that signs in. Icons cached on disk. `[Mateu timing]` logs.
- **EAS build:** `.easignore` patterns take no trailing `/` (eas-cli matches bare folder paths); the
  shared library sources the bundler watches are kept.

### Docs and demos

- Static UI: reads static, writes through a same-origin backend that holds the API key.
- Mobile app: adding from a page address; opening fast. Figma: generating and publishing the library.
- Public Star Wars demos: starwars.ec1.mateu.io (Vaadin) and starwars-rw.ec1.mateu.io (static Redwood).

## [3.0-beta.21] — 2026-10-29

On Redwood, a Welcome's hero image is drawn again, as the banner's texture (as on redwood.oracle.com).

### Fixed

- **Redwood: a Welcome's `heroImage()` is drawn again.** Since the welcome became Spectra's
  `oj-sp-welcome-page`, the image went to the banner with an empty `illustration-foreground` (which
  Spectra counts as one) and full stretch, so nothing was drawn: a blank band, white text on white.
  It is now the banner's texture, as on redwood.oracle.com — `illustration-background`, no
  foreground, no stretch — drawn in the band's right half and clipped to it, and made absolute
  (Spectra resolves it inside its CDN stylesheet). A texture shaped like Oracle's (about 864×250,
  the shapes on the right) fills the slot.
- **Redwood: no line under the global header.** The collapsed subheader kept a 1px transparent
  border, a line of page background above a welcome banner.

## [3.0-beta.20] — 2026-10-27

On Redwood, a crud refreshes its listing after an action as the server asks — keeping its query — and a crud toolbar button can show a LongTask's progress dialog.

### Fixed

- **Redwood: a `RunAction` the server answers with runs.** A crud that refreshes its listing after an
  action (`UICommand.runAction("search")`, `CrudActionResult.withActionToRun`) got its `search`
  collected and never run, so the listing stayed as it was; now it runs after the answer, after the
  bus events' triggers, as on Vaadin.
- **Redwood: a listing refreshed after an action keeps its query.** The `search` a crud runs after an
  action (a RunAction, or the refresh after a save in its drawer) went back to page 1 with only the
  host state, dropping the search text, the filter chips and the sort; it now re-runs the listing's
  own query — same text, chips, sort and page.
- **Redwood: a crud toolbar button declared `@Action(sse = true)` goes through `/sse`.** Only the
  page wrapper's actions were noted as SSE when the route loaded; a `@ListToolbarButton` comes in
  the crud's tree, so it went out as a plain sync and its `LongTask` never showed its progress dialog.

## [3.0-beta.19] — 2026-10-27

A Redwood page that polls its status refreshes when it should, and only repaints what changed.

### Fixed

- **Redwood: a periodic refresh reads its trigger's condition.** An `OnLoad`/`OnSuccess` poll with
  a condition (`state.status.type != 'SUCCESS'`: poll while a process runs) now stops once the
  condition no longer holds, as on Vaadin; it kept polling a finished process.
- **Redwood: a screen a crud opens in place arms its own polling.** A record opened from its listing
  (and the listing again, coming back) goes through the crud's route flip, which never started or
  stopped the periodic refresh: a running process opened from the list never refreshed, and back on
  the list the record's `refresh` went on going out to the crud («refresh not supported by …»).
- **Redwood: an answer that changes nothing repaints nothing.** After every action the page
  variables were all assigned again — some twice on the way — and every table got a new data
  provider, so a status poll re-stamped the whole page every round (~700 DOM nodes, focus and
  scroll lost). Now the page is assigned once, only what differs, and unchanged rows keep their
  provider.

## [3.0-beta.18] — 2026-10-27

A server-sent navigation now navigates on Redwood too.

### Fixed

- **Redwood: a `navigation-requested` `DispatchEvent` from the server navigates**, as it does on
  Vaadin. It went to the event bus, where nothing listens for it, and the page stayed where it was —
  e.g. EventConductor forms' «Back to list» and «Complete» on a task page (#905).
- **Redwood: other server-sent `DispatchEvent`s reach the bus with their `payload`** as the detail;
  subscribers got `null`.

## [3.0-beta.17] — 2026-10-26

Composed page templates read the same header pieces as a normal page, and the docs gain a
one-question decision tree for choosing a page template.

### Added

- **Header pieces on the composed archetypes.** `Dashboard`, `Welcome`, `ItemOverview`, `Foldout`,
  `DataManagement`, `GanttPage`, `HeroSearch`, `SmartSearchPage` and the `@AutoPage` pages now pick
  up what a reflected page puts in its header: `@Subtitle`, `@Overline`, `@Timestamp`, `@KPI`,
  `@BadgeInHeader`, `@Avatar`, `@Banner`, `PeerNavigationSupplier` and `RecordSwitcherSupplier`.
  An archetype that declares none of them renders exactly as before. Java, .NET and Python. On
  Redwood the dashboard landing page shows the subtitle; the other Spectra templates do not draw
  these pieces yet.
- **Opt-in Cancel and primary action on `DataManagement` and `GanttPage`.** A `cancel` `@Toolbar`
  method plus one `@Toolbar(buttonStyle = primary)` method go to the page header; on Redwood they
  become the data-management page's own Cancel and primary buttons, which stayed hidden before.
- **Docs: choosing a page template.** A decision tree (what is the user doing → family →
  template), the questions that settle the close calls between templates, and a table of what goes
  in the page header.

### Changed

- **`Welcome.heroTitle()` and `heroSubtitle()` fall back to the page's `@Title`/`TitleSupplier`
  and `@Subtitle`/`SubtitleSupplier`** (they returned null). An override still wins. Same in .NET
  and Python.
- **A composed archetype with `@Toolbar`/`@Button` methods is now titled** like the view, unless its
  tree already names itself (a hero, an entity header, a title text). It used to be wrapped with no
  title, which also hid the Vaadin composed heading.

## [3.0-beta.16] — 2026-10-26

The Vaadin shell follows Redwood's own guidelines for the brand accent and the page widths, and
IntelliJ opens a Mateu UI on any renderer from one run configuration.

### Added

- **IntelliJ: one run configuration, every renderer.** A **Mateu App** run configuration starts the
  project's UI in development mode and opens it on the web, in the IDE's Mateu tool window (desktop),
  in the Mateu app on an Android emulator or iOS simulator, or on a phone through a QR code; Debug
  attaches the JVM debugger. YAML-only projects run with `mateu-bundle:dev`. **Run | Open Mateu App
  In…** opens the running app on another target without restarting it. .NET and Python projects
  come later.

### Changed

- **Vaadin page widths follow Redwood's "Page resolutions and margins".** Fixed width caps the
  content at 1392px (was 1408px), so from a 1440px screen the margin is (width − 1392) / 2. Full
  width keeps a 24px margin up to 1440px, then grows it with the screen up to 96px (reached at
  1584px) and lets the content grow from there (it was 24px at every width). The Redwood renderer
  keeps the 1408px it measured on the Spectra shell, which places its floating chrome with it.

- **The Vaadin shell follows Redwood's cobranding rules for the brand accent.** Redwood removes its
  colour strip as soon as an app brings its own brand and puts the accent on the Section dash, so
  `@App(accentColor)` no longer draws an accent strip (under page headers, on top of listings or at
  the foot of the welcome hero). It now colours the Section dash, a short rule under every section
  title (the primary colour when no accent is declared). `@App(accentStrip)`,
  `@App(accentStripSeed)` and `io.mateu.core.infra.AccentStrip` are deprecated for removal and have
  no effect; `AppDto.accentStrip`/`generatedAccentStrip` are no longer sent.

## [3.0-beta.15] — 2026-10-26

### Added

- **`mvn mateu-bundle:dev` — a static UI with live reload.** The bundle plugin's new `dev` goal
  builds the bundle exactly as `mateu-bundle:bundle` does (same configuration, `mateu.bundle.mock`
  included), serves it on http://localhost:3000 with the SPA fallback (JDK only, no Node), and
  rebuilds it on every change under the resource directories, reloading the open pages
  (`-Dmateu.dev.liveReload=false` to refresh by hand). A rebuild that fails — a YAML error, a
  `staticOnly` violation — is logged and the last good bundle keeps being served.
  `-Dmateu.dev.port` (a busy port moves to the next free one), `-Dmateu.dev.host`. The `static`
  starter, its `AGENTS.md` and the docs use it.
- **Every Mateu UI is an installable app (PWA).** Chrome and Edge offer "Install app" on the
  desktop (its own window and icon), phones add it to the home screen, and the shell opens offline.
  Every served page (the five Java adapters, YAML mounts, .NET, Python) links a web app manifest
  and registers a service worker, both under `<baseUrl>/mateu/v3/pwa/`; a static bundle ships
  `pwa/manifest.webmanifest` and `mateu-sw.js`, and opens offline with its screens. The manifest's
  name, colour and icon are derived exactly like the mobile app's (`mateu.mobile.*` > `@MobileApp` >
  the app shell); Mateu's own 192/512 px and maskable icons always follow the declared one. The
  worker is network first (never hides a new deploy), versioned per build, and never caches the
  Mateu API or REST-source data. On by default: `mateu.pwa.enabled=false` / `MATEU_PWA_ENABLED`
  (.NET also `MateuOptions.Pwa`), `-Dmateu.bundle.pwa=false` for a bundle; always off in
  development mode and under `mateu-bundle:dev`. Turned off, the worker's URL answers a worker that
  unregisters itself. See [Install as a desktop or phone app](https://mateu.io/deploy/install-as-app/).

- **The same static UI on a phone.** The React Native renderer (the Mateu app) opens a static
  bundle — a YAML-only project with no backend — natively: the hub accepts its URL (QR, link, typed
  address), and every screen is answered on the device from `manifest.json` by the web's own
  resolver and client-side expander (now a platform-neutral module of `libs/mateu`,
  `bundleResolver.ts`), whatever web renderer the project uses; sources are called from the device
  (sample data in a mock build), listings filter/search/sort/page and `restAction`s write as on the
  web. `mateu-bundle:bundle` writes the UI manifest the app reads (`mateu/v3/manifest`, with
  `"bundle": "manifest.json"`); `mateu-bundle:dev` prints the simulator/emulator URLs and, with
  `-Dmateu.dev.host=0.0.0.0`, the LAN URL and a terminal QR code (`-Dmateu.dev.expoUrl`,
  `-Dmateu.dev.qr`). RN also honours a `restAction`'s `successRoute` now.

### Changed

- **Listings size their columns sensibly when none of them declares a width.** This applies to both
  renderers, Vaadin and Redwood. Identifiers, numbers, amounts, dates, booleans, statuses, enums and
  row actions fit their content and don't grow. Text columns share the rest of the width, each in
  proportion to its `weight` (default 1). The table fills the width, and it scrolls horizontally
  rather than squeezing the columns. Before, Redwood's own sizing could give an `Id` holding
  "P-001" 200px, and Vaadin gave every column the same share. A declared `width` or `flexGrow`
  still wins.
  On Redwood the listing table now uses `oj-table` `layout="fixed"`, where a long text is cut with
  an ellipsis. The full text shows on hover.
- **A Redwood welcome hero keeps the same look on every visit.** Without a declared tone, the hero's
  background and illustration were drawn at random each time the page was entered; they are now
  chosen from the page's identity — its class, or its route for a YAML page (served or from a
  static bundle) — so a page always looks the same, while different welcome pages still vary. A
  declared `heroTone()` / `@WelcomeBanner(tone)` / `tone:` still wins.

### Fixed

- **Vaadin: money columns line up on the right.** A YAML listing expanded in the browser
  (`specsOnly`) carried no `align` for a `stereotype: money` column, so Price sat on the left;
  `columnAlign` now also reads the stereotype (as the server's column mapper does) and normalizes a
  declared alignment (`end`/`right`, `center`, `start`/`left`).

## [3.0-beta.13] — 2026-10-24

Version skew handled end to end (a redeployment and a stale screen are told to the user, every
renderer names itself), Oracle's CDN from your own mirror, Spectra wherever it fits on Redwood, a
one-column default for short forms, unsaved changes asked about in drawers, and a Material Design
React Native app.

### Added

- **The React Native renderer looks like a Material app.** Material Design 3 through React Native
  Paper (MIT): top app bar, navigation drawer, Material buttons, outlined fields, cards, segmented
  tabs, dialogs, bottom sheets, snackbars and FABs; listing status columns are chips coloured by
  their tone; dark mode follows the device (or `@App(themeToggle)`) and the primary colour is the
  app's `@App(accentColor)`. A CRUD listing's `New` is an extended FAB ("+ New") above the
  pagination bar; on a phone (< 600dp) every form section is one column and a RAIL wizard's step
  rail collapses to "Step 2 of 4 · Title" above the form.
- **Version skew is handled, not just tolerated.** For distributed setups where teams release on
  their own schedules and tabs stay open across deployments:
  - every response of Mateu's API carries **`X-Mateu-Build`**, a fingerprint of the deployed UI
    (Mateu version + the bytecode of the exposed view models + `specs/ui`), the same on every
    replica of a release; `mateu.build-id` / `MATEU_BUILD_ID` replaces it with your own (a CI build
    number). Java (all five adapters), .NET and Python. Exposed through CORS;
  - every renderer (Vaadin, Redwood, React Native, IntelliJ) notices a redeployment and offers
    *"This app has been updated. Reload to use the latest version."*, and tells a screen that went
    stale apart from a permission refusal: a removed action or a renamed `@UI` class from an old tab
    now says *"This screen has changed since you opened it. Reload to continue."* instead of
    *"You are not allowed to do this."*;
  - every renderer names itself in **`X-Mateu-Renderer`** (`<name>/<version> wire/<major>.<minor>`);
    the server logs one WARN per renderer of another wire major;
  - the indexer annotation processor records its Mateu version in `ui-registrations`, and the host
    logs one WARN per in-process UI module built against another Mateu minor;
  - `e2e/version-skew-probe.mjs` restarts a real app with another build and asserts what the user
    sees (Vaadin and Redwood).

- **Redwood: Oracle's CDN from your own mirror.** `mateu.oracle-cdn.url` (`MATEU_ORACLE_CDN_URL`;
  .NET `MateuOptions.OracleCdnUrl`, Python `add_mateu(oracle_cdn_url=…)`, `-Dmateu.oracle-cdn.url`
  for a static bundle) points the Redwood renderer at a mirror of `https://static.oracle.com/cdn`
  your organisation hosts — if its agreement with Oracle allows it (JET is UPL; Spectra, the VB
  runtime and the gallery are not redistributable without it). Mateu still ships nothing of
  Oracle's. The served page is rewritten, and Oracle's own files (JET's bundle config, Spectra's
  loaders) are redirected as RequireJS resolves them: a screen loads with zero requests to
  `static.oracle.com`. `e2e/oracle-cdn-mirror-probe.mjs` checks it and lists the trees to mirror.

- **`CalendarPage` jumps to any date**: the new `goCalendarToDate` action (`_date`, an ISO date)
  moves the displayed period to the one holding it — Java, .NET (`ICalendarPage.GoToDate`, a default
  interface method) and Python (`go_calendar_to_date`). The Redwood renderer's Spectra calendar runs it
  from its title date picker, only against a backend that advertises it.

- **A welcome hero can carry an overline** — the short line above its title ("Good morning",
  "Sales"): `Welcome.heroOverline()`, `@WelcomeBanner(overline = …)` and `HeroSection.overline`
  (wire `HeroSectionDto.overline`; `@Experimental`). .NET `HeroOverline` / `[WelcomeBanner(Overline)]`
  / `HeroSection.Overline`, Python `hero_overline()` / `@welcome_banner(overline=…)` /
  `HeroSection(overline=…)`. Redwood binds it to Spectra's `overlineText` on `oj-sp-welcome-page`
  (and paints it above a content hero's title); Vaadin, React Native and IntelliJ draw it small and
  muted above the title.

### Changed

- **Redwood dashboards keep the geometry they declare.** Spectra's `oj-sp-dashboard-grid` (up to five
  panels) lays the panels out itself and ignores `@Panel(colSpan, rowSpan)` and `columns()`, so it is
  now used only when the dashboard declares none of them; a panel spanning more than one column or
  row, or a fixed `columns()`, keeps Mateu's grid with the declared columns and spans. That grid
  now really gives each panel its width (it painted every panel as one narrow cell, spans ignored).

- **A small form is one column.** A form that declares no column count lays out in ONE column when
  it has up to 6 visible fields and in TWO from 7 on (it was always 2), counted over the whole form
  — every section shares the result — and over the fields that render as form fields (not
  `@Hidden`, `@KPI`, `@BadgeInHeader`, `@Timestamp`, `@AppContext`, `@Aside`, `@Menu`,
  `@Composition`, `@Version` or component-holder fields; a grid counts as one; permission-gated
  fields count, so one class has one layout). Each wizard step is its own form. Declarations win:
  `@FormLayout(columns = N)` (whose default is now `0` = unset), `@Section(columns = N)` and
  `@Zones` (which keeps 2). **To keep the old look on a small form, add `@FormLayout(columns = 2)`**
  (.NET `[FormLayout(Columns = 2)]`, Python `@form_layout(columns=2)` — the three servers apply the
  same rule, pinned by the new `form-columns` conformance case). Labels-aside still needs a
  DECLARED single column, so an inferred one keeps its labels on top. See
  [how many columns](https://mateu.io/java-ui-definition/forms/#how-many-columns).

### Fixed

- **A CRUD create/edit drawer no longer drops unsaved edits silently on the Vaadin renderer.** The
  drawer's form (`editInDrawer()`, or an `Editable` listing without `Navigable`) is dirty-tracked
  like the routed editor (`confirmOnNavigationIfDirty`, Java + .NET capability forms; Python
  already did), and closing a dialog or drawer by hand — Cancel, ✕, Esc, a click outside, the
  record arrows — with unsaved edits asks "Discard your changes?" first, as Redwood does through
  its drawer template's unsaved-changes banner. The question is scoped to that overlay (a dirty
  page behind is neither asked about nor cleaned); a server `closeModal` after a save never asks,
  and a refused save keeps the drawer dirty.
- **Redwood: leaving a screen with a create/edit drawer open.** Redwood now scopes unsaved changes
  per overlay as the web does: an edit in a drawer marks the DRAWER (its form's
  `confirmOnNavigationIfDirty` is read from the overlay's content — before, drawer edits were
  never tracked), so the browser's Back, a menu entry, a link or a `NavigateTo` asks once when the
  page or an open overlay holds unsaved changes; staying keeps the drawer and what was typed (a
  Back gets its address back, pushed so the next Back still stays in the app), leaving discards
  them. Any navigation now closes the open drawers and dialogs — they used to stay, orphaned,
  over the new page.
- **Redwood: the item overview shows the page's title.** Spectra's item overview page has no title
  of its own; the page's title (`@Title`, or an `EntityHeader`'s) is now the `itemTitle` of its
  overview panel, instead of whatever heading the key panel started with.
- **Redwood: readable gantt bar labels.** A task's label is drawn inside its bar, in white, only
  when the bar is mostly done (≥ 75%); otherwise it goes beside the bar in dark ink — white on
  the light, unfilled part of the bar could not be read.

### Documentation

- New page *Serving Oracle's CDN from your own mirror* (Serve & deploy).
- New page *Versions across teams and deployments* (Serve & deploy): what happens when a screen
  changes under an open tab, when the renderer is upgraded and when teams release independently,
  and the rules that keep it working. The wire specification documents the two transport headers.

## [3.0-beta.12] — 2026-10-24

Fixes from trying a static YAML project on Redwood: a listing's filters stay in its search header in
the visual editor and Play, a node can be dragged to a new place on the Redwood canvas, and the YAML
starters' home page says it is a landing page.

### Fixed

- **Redwood: a YAML listing's filters stay in its search header.** In the visual editor's Redwood
  canvas and Play (and for a read-only listing the server sends as a bare Crud), a `type: Listing`
  with `filters:` painted each filter a second time as a loose form field under the grid — the page
  arrives with no `pageType`, so it was taken for a form and the Crud's filter FormFields became its
  fields. The generic form now leaves a listing's filters out; they are the smart filters of the
  list header only (offered in the search box's dropdown, and applied as chips that filter the rows,
  sample rows included).
- **Visual editor: a node can be dragged to a new place on the Redwood canvas.** Pressing on a
  component painted in the Redwood frame and dragging it never started a move (only the palette's
  drags worked): the press happened inside the iframe, where the editor never sees it — and the
  frame's own guard cancelled `pointerdown`, which suppresses `mousedown` altogether. The frame now
  relays the press, the moves and the release by message (`press` / `pointer`, in its viewport; the
  editor translates them), so the canvas runs the same move drag as on Vaadin — ghost, drop line,
  drop zone, `node-moved` — same-origin (IntelliJ) and cross-origin (VS Code) alike. A press that
  does not travel is still a click that selects, and the click ending a drag selects nothing.
- **YAML starters: the home page declares `pageType: landing`.** The `yaml` and `static` starters'
  `home.yaml` (and the `mateu-yaml` skill's example) now say what their page is, like their
  `products.yaml` already declares `pageType: collection` — the YAML twin of `@PageTemplate` (a
  Java Welcome page resolves to `landing`). The generator's cases pin both.

## [3.0-beta.11] — 2026-10-23

Redwood, the Redwood way: a record's create/edit page is Spectra's transactional page (its header,
its sections, its anchor navigator), section actions and tabs follow Spectra, Redwood's loader while
the app loads — and every Redwood page template is documented in Mateu terms, with screenshots.

### Documentation

- **Redwood page templates, the Mateu way.** Every Redwood template guide (Advanced create and edit,
  Collection detail, Guided process, Dashboard landing, Welcome, Foldout, General and Item overview,
  General / Bottom / Create-and-edit drawers, Data management, Gantt page) now has its Mateu
  counterpart: when to use it, anatomy, responsive behaviour, what you can configure — each element
  with the Mateu piece that gives it and whether Redwood paints it — a working example, screenshots
  of Mateu on the Redwood renderer, and its known gaps. New page *Redwood page templates* groups them
  as Redwood does (overview, detail, transactional). The element-by-element reviews live in
  `design/redwood-templates/`. `demo-redwood-showcase` gained the Advanced create and edit (both
  variants), General / Bottom drawer, Data management and Gantt page demos.

### Changed

- **Redwood: a record's create/edit page is Spectra's transactional page.** Following Redwood's
  Advanced Create & Edit template, with Spectra's own components:
  - the page header of a page that cancels beside a primary action (a crud's editor or creation
    form) is `oj-sp-header-create-edit` — its Cancel and primary action, the record's badge and
    contextual info, sticky on scroll;
  - every titled `@Section` is `oj-sp-section` — its title with the accent marker, no white card,
    the fields on the page, the title sticky while its section scrolls;
  - the sections index (`@Toc`) is drawn as Spectra's vertical anchor navigator (its markup,
    styles and keyboard; a "Sections" button with a popup on medium and small screens). It starts
    under the page header and sticks under it; it used to sit beside the header.
- **Redwood: a section's actions are Spectra's.** `@Section(editAction | addAction, viewMoreAction)`
  is `oj-sp-section`'s own primary action (edit, else add) and its «View more» link — in the rich
  content and in a plain form alike (the generic form's sections are `oj-sp-section` too now). A
  section declaring both edit and add keeps the add as one of its own buttons. Demo: `demo-vb`
  › Section actions. Sections laid out in columns (an `@Aside` form, a crud's `@Zones`) keep
  their Spectra header too.
- **Redwood: content tabs look like Redwood's.** A form's tab strip shows the tabs at their own
  width from the start, over a full-width divider line (JET `oj-tab-bar` `layout="condense"` +
  `oj-divider-bottom`); they used to spread over the whole width with no line.
- **Redwood: a Dashboard with the default `columns()` keeps each tile's width.** The KPI band takes
  the whole row and a panel its `colSpan`; they were all squeezed into one narrow cell.
- **Redwood: the sections index steps aside for a detail slot.** A page with an `@Aside` panel
  never shows the `@Toc` index on Redwood — the template's rule: the anchor navigator and the detail
  slot exclude each other.
- **Redwood: Redwood's loader while the app loads.** The page shows Redwood's large progress circle
  while Oracle's CDN downloads (it was blank) and while a new screen loads (it was a skeleton).

## [3.0-beta.10] — 2026-10-23

Redwood: the tables on a record's edit page (a form's `List<Row>` fields) are editable.

### Fixed

- **Redwood: a table on a record's edit page is editable.** A `List<Row>` field of a form edits its
  rows in a dialog — "+ Add" below the table, Edit / Remove per row — whatever its form position.
  Only `@DetailFormCustomisation(position = modal…)` used to count, and the default position is
  `right`, so a plain list on an edit page came out as a read-only table. Demo: `demo-vb`
  › Purchase orders.

## [3.0-beta.9] — 2026-10-23

The visual editor's palette drag works on the Redwood canvas, and the Mateu AI skills install in Codex and Antigravity CLI too.

### Added

- **Mateu's AI skills for Codex and Antigravity CLI.** The eight skills of the Claude Code plugin
  now install in Codex from the repository marketplace (`.agents/plugins/marketplace.json` +
  `.codex-plugin/plugin.json`, sharing the same skills directory) and in Antigravity CLI from a
  bundle generated by `scripts/package-antigravity-plugin.mjs`; consistency checks and tests run in
  CI. Docs: *Build UIs with AI*. PR #861 (thanks, @alejbormeg).

### Changed

- **The IDE plugins follow the framework's version.** The framework's release now publishes the
  IntelliJ plugin as `3.0-beta.9` and the VS Code extension as `2.99.9` (the VS Code Marketplace only
  takes numeric, ever-growing versions: betas stay below `3.0.0`, and from the GA on every version
  is the framework's own); there are no separate `plugins-v*` releases any more (the last was 0.2.17).

### Fixed

- **Visual editor: dragging from the palette onto the Redwood canvas shows where the component lands.**
  The canvas could not see inside the Redwood iframe, so a drop had no insertion line and always
  landed at the end of the page. It now reads the painted nodes' boxes from the frame (directly
  when same-origin, as in IntelliJ; through a new `measure`/`layout` message otherwise, as in
  VS Code — that leg needs the Redwood jar rebuilt), deriving a box for containers Redwood does
  not stamp. On every canvas a ghost follows the pointer and the target container is highlighted
  next to the insertion line.

## [3.0-beta.8] — 2026-10-20

Fixes and small features found while building a multi-service workshop (Quarkus, Spring Boot 4, Micronaut and a static YAML shell, Redwood renderer): a CRUD record page can show its own content (`DetailContentSupplier`), authored routes under a CRUD get its navigation automatically, shared CRUD instances no longer leak routing state between requests, Quarkus needs no `@Unremovable` and reloads the browser in dev, and a long list of Redwood rendering fixes. Upgrade recommended.

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

- **Quarkus: live reload works under `quarkus:dev` out of the box.** `mateu-quarkus` now ships
  `%dev.mateu.dev=true` among its configuration defaults, so Mateu's development mode (specs read
  from the source tree and watched, the open tab re-rendered after a recompile) is on in Quarkus's
  dev profile only — never in the packaged application or the tests. Override it with
  `%dev.mateu.dev=false`. (Java)

- **A page that overrides a CRUD's sub-screen gets the CRUD's navigation.** When an authored route
  (`routes.yaml`, a `RouteEntrySupplier`) binds `<crud>/:id`, `<crud>/:id/edit` or `<crud>/new` to
  your own view model, Mateu adds what the built-in screen has: **Back to list** and **Edit** on the
  record page (Edit only when the CRUD can edit), **Cancel** on the editor and the creation page —
  labelled by the CRUD's hooks (`backToListLabel()`, `editLabel()`, `cancelLabel()`), with its
  action ids (`cancel-view`, `edit`, `cancel-edit`, `cancel-new`) and navigating where the built-in
  ones would. A button or method of the page with that id wins; `@NoCrudNavigation` on the view
  model opts out. The CRUD is found from the route (a class it resolves to, or the `@Menu` field the
  path reaches from an app). (Java)
- **A page that builds its own tree shows its toolbar.** A routed `ItemOverview` (any
  `ComponentTreeSupplier`) ignored its `@Toolbar` / `@Button` methods: nothing was rendered. Its
  tree now goes inside a page carrying them (a tree that is already a page gets them added), and they
  run on the view like a normal page's; a view with none renders exactly as before. (Java)

### Changed

- **A `RemoteMenu` with a label groups its entries in every menu variant.** When the remote answers
  with several top-level entries and the shell declared the section's label, they now go into a
  submenu named (and iconed, and placed by its path) as the shell named it — `HAMBURGER_SECTIONS`
  already made it a section; `MENU_ON_TOP` and the others spliced the entries flat next to the
  shell's own, with their raw routes, and dropped the label. Without a declared label nothing
  changes. Routes, deep links and reloads still reach the remote by route. And when the shell and a
  remote, or two remotes, claim the same route, the browser console now warns once naming the route
  and both sources, instead of one silently shadowing the other. (Vaadin, Redwood)

### Fixed

- **Cancel (and the other leave actions) ask before dropping unsaved changes.** A dirty editor
  already asked when the user left it through the menu, the browser's back button or a reload, but
  its own **Cancel** ran straight away and the edits were lost. Now the actions the server treats as
  leaving the screen — `cancel`, `cancel-…` (the CRUD's `cancel-edit`/`cancel-new`/`cancel-create`/
  `cancel-view`), `back` and `backToList` — ask the same "unsaved changes" question first; "stay"
  sends nothing. A business action that merely starts with `cancel` (`cancelBooking`) is not one,
  and neither is a wizard's Back (or any wizard step action): it moves between steps of the same
  screen and keeps what was typed, so it never asks; the wizard's Cancel does. Nor does the
  optimistic-lock conflict dialog's **Reload** (it runs `cancel-edit`): the user already chose
  there to drop their changes.
  Redwood now follows Vaadin's single rule for unsaved changes: an edit marks the screen dirty only
  when the form that owns the field asks before it is left (`@ConfirmOnNavigationIfDirty`, CRUD
  create/edit views), in every edit path (page forms, forms painted as page content, drawers and
  dialogs by their own form, islands). Before, any edit on any Redwood form counted — a filter or
  search box too — while a CRUD form painted as page content never did, so its menu, back and
  reload did not ask. (Vaadin, Redwood)

- **Micronaut: dates go out as ISO-8601 strings.** The JSON mappers the adapter installs in place of
  Micronaut's (`MateuMicronautJsonMapper`, `MateuMicronautJacksonDatabindMapper`) left Jackson's
  `WRITE_DATES_AS_TIMESTAMPS` on, so a `LocalDate` in component data (grid rows…) was written as
  `[2025,12,19]` and shown as "2025,12,19". They now write `"2025-12-19"`, like the other adapters.
  (Java)
- **Quarkus: views reached only by Mateu keep their injected services.** ArC removed, as unused beans,
  the view classes Mateu reaches by reflection (an `AutoCrud` annotated `@Dependent`…) and the
  services only they inject; Mateu then created the view with `new` and its `@Inject` fields stayed
  `null` ("An unexpected error occurred" on the first action that used one). `mateu-quarkus` now
  defaults `quarkus.arc.remove-unused-beans=fwk` (its `META-INF/microprofile-config.properties`; the
  application's own setting wins): application beans are kept, unused framework beans are still
  removed. `@Unremovable` is no longer needed. (Java)
- **Spring Boot devtools: views get their beans.** With `spring-boot-devtools` on the classpath a
  view's `@Autowired` fields stayed `null` and `@Lookup` suppliers that are `@Component`s failed with
  "Cannot instantiate …". Mateu loaded the classes it reaches by name with its own classloader, which
  under devtools loads a second copy of the app's classes next to the RestartClassLoader's — no bean
  is an instance of those. Classes are now loaded from the thread context classloader first. (Java)
- **A view reached through a `@Menu` field gets its injected services.** The menu path created the
  target with its bare constructor, so a view that builds its content right away (a `Dashboard`, any
  `ComponentTreeSupplier`) found its `@Autowired`/`@Inject` fields `null`. It is now created through
  the instance factory, like every other view (bean if there is one, else a new instance with its
  injection points filled). (Java)
- **Live reload after a restart inside the JVM.** The dev event stream's boot id was a constant of
  Mateu's jar, which Quarkus dev mode and Spring Boot devtools do not reload: after their restart
  the browser reconnected, saw the same boot id and did not re-render. Each application start now
  gets a new one (`DevEndpoint.bootId()`). (Java)
- **Quarkus dev mode: editing Java re-renders the open browser.** Quarkus only looks for changed
  code when a request arrives, and the open live-reload stream is not one. With `mateu.dev=true`,
  `mateu-quarkus` now asks it to scan for changes once a second while a browser is watching
  (a `HotReplacementSetup`; dev mode only). (Java)
- **`TodoList`, `CalendarPage`, `CollectionDetail` and `GeneralOverview` no longer send the request
  to the client.** Their private `currentRequest` field travelled in the component state (base url,
  caller's remote address) and failed to come back (`WARN Hydrater: Could not hydrate field
  'currentRequest'`). It is `transient` now, and the state serializers skip transient fields in
  their nested-object pass too (Jackson already did). (Java)
- **No more `"nombre": "xxxx"` in every row of every list.** A leftover debug line in the wizard
  state serializer (used for every form's state) planted it next to `_rowNumber`. (Java)
- **A list of components is not an editable grid field.** A `List<Badge>` (a `Foldout`'s header
  badges) or `List<Component>` field registered the twelve row-editing actions (`estado_add`,
  `estado_create`, …) of a list of records. (Java, .NET, Python)
- **A `Drawer` or `Dialog` keeps its declared id on the wire.** `Drawer.builder().id("x")` went out
  with the component id `"fieldId"` (only the metadata carried `x`), so Redwood could not tell that
  an overlay re-sent while open was the same one and stacked a second drawer instead of refreshing
  it. Without an id the filler `"fieldId"` stays. (Java; .NET and Python already sent the id)
- **A CRUD view's `@ViewToolbarButton` that answers with a message refreshes the record.** A button
  that changed the record in the store and returned `Message.success(...)` left the view on the old
  values (workaround was `UICommand.navigateTo("/<crud>/<id>")`). A message-only answer now also
  sends the record reloaded from the store; any other answer is used as it is. (Java; the .NET and
  Python ports do not dispatch view-toolbar methods)
- **A subclass of a `Foldout`, `ItemOverview`, `Dashboard` or `Welcome` keeps what its parent
  declares.** They read only the concrete class's own fields (and the Foldout only its own
  `@Title`), so subclassing a page to mount it elsewhere or to add a panel gave an empty page. They
  now walk the class hierarchy, parent fields first. (Java; .NET and Python already did)
- **`@Email`, `@Positive`, `@PositiveOrZero`, `@Negative`, `@NegativeOrZero`, `@DecimalMin` and
  `@DecimalMax` are checked like `@Pattern` and `@Min`/`@Max`:** they travel to the client as
  validations and the server re-checks them before a validated action. They were ignored on both
  sides (`pepe` went through an `@Email` field). Messages are the validator's own, in the request's
  language. `@Past`/`@Future` are still not mapped. (Java; the .NET and Python ports have their own
  constraint markers and do not have these yet)
- **An enum that overrides `toString()` works in selects and filters.** Its options carried the
  `toString()` as the value, while the state and the server use the constant name: a filter on it
  was silently ignored and a form select showed nothing selected. The value is the constant name;
  the `toString()` stays the label (after `@Label`). (Java)
- **A `@Menu` submenu called like the app's mount opens its pages.** With `@UI("/biblioteca")` and
  `@Menu MenuBiblioteca biblioteca`, a menu click, a deep link or a reload of
  `/biblioteca/biblioteca/catalogo` answered the app again: the content load (route
  `/biblioteca/catalogo`, typed with the app) took the `/biblioteca` prefix for the app's own mount.
  Inside its mount the app is at `""`, so that prefix is the menu entry; and a route that repeats
  the segment (`/biblioteca/biblioteca/...`) is now read relative to the mount. (Java; the .NET and
  Python ports use absolute routes and never had the second spelling)
- **A wizard step's `@Toolbar` buttons run.** They were drawn under the step's form, but the
  wizard's dispatcher never called them. They now run on the step as typed (not validated), and the
  wizard shows the same step again with what they changed; a returned `Message` shows over it.
  (Java)

- **The archetypes' own texts go through the app's `Translator`.** `CalendarPage` (Today,
  + Create, Month/Week/Day/List), `TodoList` and `CollectionDetail`/`GeneralOverview` (empty
  states, the "N items" counter) wrote fixed English. They are built-in texts now (`BuiltInTexts`),
  like the wizard's and the CRUD's; `BuiltInTexts` also translates a text built lazily, with no
  request at hand (a `Callable<Component>` field), through the app's translator. (Java)

- **A CRUD registered as a shared bean no longer leaks one request's routing into the next.** An
  `AutoCrud` that the container shares (a Spring singleton, a Quarkus `@ApplicationScoped` bean
  behind its client proxy) kept the route of an earlier request in the instance, so "New" pushed
  `/app/students/students/new` and saving landed on a url that did not reload; concurrent users
  raced on the same fields, and behind a proxy the request's state was written into the proxy's
  fields while the methods ran on the real instance. Mateu now detects a shared view-model bean (two
  lookups return the same object; decided once per class) and builds a fresh instance per request
  — constructor and `@Inject`/`@Autowired` fields from the container, `@PostConstruct` run — with a
  one-time warning; container interceptors do not apply to it. The docs no longer say a CRUD with
  only `final` services may be a singleton. (Java)

- **`HttpRequest.getClickedRow(Class)` also reads a row opened from a listing.** The renderers send
  an opened row (a row click, `view`) as the action's own parameters, one per column, not under
  `_clickedRow`; `getClickedRow` answered `null` and the handler hit a NullPointerException
  (workaround was `getParameters(Row.class)`). Without `_clickedRow` it now builds the row from the
  parameters named like the row's fields (internal `_…` ones left out), and still answers `null`
  when there are none. The same fallback fills an action method's row parameter in the Python and
  .NET ports. (Java, .NET, Python)

- **Guided process: the finished screen is titled like the wizard's result step.** The step
  indicators leave the result step out (it is no step of the process), so Redwood's guided process
  invented an English "Completed" step for it and counted it ("4 | 4" for three steps). The wire's
  `ProgressSteps` now carries `resultTitle` — the result step's `@Label` (Python/.NET: its step
  title) — Redwood uses it (a translated "Completed" when an older server sends none) and hides the
  template's counter on that screen. The Python and .NET wizards, which listed a completion
  wizard's result step as one more bullet (.NET marked it done, so Redwood added "Completed" after
  it), now leave it out like Java and count only the real steps in the rail. (Java, .NET, Python,
  Redwood)

- **The archetypes have the request before they build their tree.** `CalendarPage`, `TodoList`,
  `CollectionDetail` and `GeneralOverview` build it in a `Callable<Component>` field, which Mateu
  invokes while mapping the page (and while checking an action is on it), but they learnt the
  request only afterwards, from `triggers(...)`: on a first render `events(...)`, `rows(...)`,
  `switcherOptions(...)` got `null`, and their built-in texts ("Today", "All caught up!"…) were
  translated with no request, ignoring the browser's language (`messages_es.properties`). Mateu now
  hands the request over as soon as it has the instance (created and hydrated, about to be mapped,
  about to be checked). (Java)

- **Collection Detail counts "1 item", not "1 items".** The default `listLabel(count)` uses the
  built-in text `item` for one result and `items` otherwise (both through the app's `Translator`).
  (Java, .NET, Python)

- **A CRUD whose record page an authored route overrides opens its rows again.** With
  `<crud>/:id` (or `:id/edit`, `new`) bound to your own view model in `routes.yaml` or a
  `RouteEntrySupplier`, clicking a row of the CRUD's list answered 403 ("you are not allowed to do
  this"): Mateu moved the crud's `view` action to the record's route and ran it on YOUR view model,
  which knows no such action. The crud's `view`, `edit` and `new` now navigate there: your view
  model is loaded at the sub-route and the url is pushed, as for the built-in screens. (Java)
- **Redwood: `gridLayout = cards` listings are a grid of cards.** The Redwood renderer always drew
  a table (which also clipped columns on a phone); a listing that declares cards — or
  `listingType(card)` — now gets a responsive grid of `oj-action-card`s (one column on a phone),
  like the web renderer's: the image column, the title (identifier column, else the first), status
  badges beside it, the `@Line(2+)` columns under it, the other columns as label/value pairs and
  the row actions as buttons. A card's click opens the row like a table row (`view`,
  `@RowRoute`, `@Details`), with a checkbox per card when row selection is enabled.

- **Redwood: the Foldout honours its navigation, orientation, Edit, badges and panel icons.** The
  server sent them and Redwood drew none. `navigationHeader()` now fills oj-sp-foldout-layout's own
  header (the go-to-parent link labelled `parentLabel`, the previous/next arrows), each control
  running its action id; `overviewEditActionId()` is the overview panel's pencil; the foldout's
  `List<Badge>` badges head the overview; `@Panel(icon)` shows in the panel's corner; and
  `orientation(horizontal)` puts the overview across the top with the panels below it (vertical,
  the default, keeps it as the first column). `FoldoutNavigation.title` is still not drawn: the
  layout's header has no place for it.

- **Redwood: `Text.style` shows, and a `HorizontalLayout` in the content is a row.** The Text
  atom only used its size class, and a HorizontalLayout's children were stacked like a vertical
  one (a panel's title and its close button, one under the other). A Text now carries its `style`,
  filtered like an Element's HTML style (presentation properties only, no `url()`/`expression()`;
  the filter now also keeps `flex`/`align-*`/`justify-*`), with a declared weight or size winning
  over Redwood's `!important` typography classes; a HorizontalLayout of texts, buttons, badges,
  links and icons is drawn as one row that wraps on a phone, with its own style. A layout of
  buttons only keeps the button bar, and one holding anything else (a grid, a form…) is still
  stacked.

- **Redwood: the message band's close button closes the notice.** The band's keys came from a
  counter typed as a string with no default, so the first notice had no id and every later one was
  `"NaN"`: closing removed nothing and an error stayed on screen for good. The counter is now a
  number and each notice gets its own text key, the one `spClose` hands back.
- **Redwood: a header badge takes its colour from the state.** A `Status` field's badge travels as
  `text: ${state.x.message}`, `color: ${state.x.type}`; the label was resolved but the colour was
  read as the literal template, so the chip was always grey. The colour is now resolved like the text.
- **Redwood: only the EntityHeader that heads the page goes up to the screen header.** The first
  `EntityHeader` found anywhere in the tree was lifted, so a collection's detail (next to its list),
  a task card under a planning chart or one inside a drawer emptied its panel and retitled the page
  with the selected item. Now only one that is the page's first content is lifted (a Java
  `EntityHeader` field leading the form, a foldout's summary); drawers and dialogs are not searched.
- **Redwood: reloading or closing the tab with unsaved changes asks first.** Menu navigation and
  the browser's back already asked; the window's own exits did not, so an edit was lost without a
  word. The shell now raises the browser's "Leave site?" prompt (`beforeunload`) while the screen
  is dirty, like the Vaadin renderer. (Not in the embedded `<mateu-ui>`: the host page owns its
  window's unload.)
- **Redwood: a composed page is headed by its own title.** A Dashboard, SmartSearchPage,
  HeroSearchPage, GanttPage or DataManagement page has no `Page` node: its `@Title` only travelled
  as the window title, and the header showed the menu label instead (and the Gantt/Data Management
  heading text a second time). The screen now keeps its window title and the header prefers it to
  the menu label, so the page's own heading text is not repeated. The listing header
  (`oj-sp-smart-filter-search`) also shows the page subtitle, so a SmartSearchPage's
  `pageSubtitle()` is visible.
- **Visual editor: a component dropped on the Redwood canvas lands.** The canvas did not re-render
  when a palette drag started, so the Redwood frame was never told to let the pointer through and
  its iframe swallowed the moves and the release: the YAML changed only on the next click, nothing
  was selected and Undo stayed off. The drag is now part of the canvas state. (A drop on the Redwood
  canvas still lands at the end of the page: the frame's nodes cannot be hit-tested from the editor.)
- **Redwood: `@Zones` columns in a form.** A crud's detail or editor with `@Zones` +
  `@Section(zone=…)` arrives as a `ResponsiveGrid` of columns, but the one-column generic form won
  (the page has fields) and every section was painted stacked in one card. A grid of explicit tracks
  is now the page's body, like a slot template, with its fields editable in place. An entity page
  whose NARROW zone comes first is painted in its columns (the reverted item-overview template still
  claimed it and the page came out blank; the general overview template took it after an action).
- **Redwood: grid tracks of fixed length.** `gridTemplateColumns` with a `rem`/`px` track
  (`22rem 1fr`, `1fr 22rem`) split 50/50: the fixed track weighed like a `1fr`. Tracks are now
  measured against a desktop content width, and a row's twelfths always add up to 12. A column grid
  nested in a card (a CollectionDetail's list/detail inside its form card) is lifted out of it instead
  of stacking.
- **Redwood: Item Overview tabs.** On entry the first tab's content was shown but no tab was
  selected in the bar; it now selects the tab it shows (the one marked open, else the first). On a
  phone the tabs that do not fit went off the card with no way to reach them: the item overview's
  bar and the content tab strips now put them in an overflow menu.
- **Redwood: a wizard in a drawer advances.** A Drawer whose content is an `EmbeddedView` (the
  Guided Process Drawer) is painted from its embedded surface; the answer to Next re-rendered the
  overlay's frame instead and the drawer stayed on step 1. The re-render now goes to the surface and
  the drawer keeps its header — apps no longer need to return a new Drawer on every step.
- **Redwood: clicking a Gantt bar selects its task.** `Gantt.onTaskSelectionActionId` (GanttPage's
  `selectGanttTask`, DataManagement) and a PlanningBoard's `selectActionId` never fired: the chain
  dropped the selection changes JET reports as `internal` — which are the user's — and with the tasks
  inline in each row the selected key comes back null anyway. A click resolves the bar under the
  pointer (as the double click already did), once per pick. The done part of a coloured task is
  drawn in a darker shade of its colour instead of JET's one grey.
- **Redwood: General Overview content and `infoWidth()`.** Only the titled `Card`s of the page were
  drawn in the main area, so anything else `overview()` returned (a chart, a Markdown, an untitled
  card) was lost; every piece of the main slot is now a card, in order. Main and info are drawn as
  two columns at the widths of the overview's grid (`infoWidth()`, first when promoted) instead of
  a grid of cards where the info card fell wherever there was room.
- **Redwood: Welcome tiles show what their panels hold.** Each `DashboardPanel` kept only its text,
  its first metric or its first chart, so a `FeatureGrid` or a `Checklist` came out as an empty card;
  the chart was always moved to the end, drawn as bars with a fixed «Occupancy %» legend, and
  `colSpan`/`subtitle` were ignored. Every panel is now a tile in its declared order and width, with
  its subtitle and its content drawn like any page content (a `TrendChart` as its line/area chart).
- **Redwood: a Dialog shows its whole content.** A `Dialog` drew only the lines of text it held:
  an `EntityHeader`, a `Badge`, a `Meter`, a `StatusList`… inside it were lost (a `Drawer` drew
  them). A dialog with more than text is now drawn from its content, in order.
- **Redwood: a `Drawer` placed in the page** (a GanttPage's bottom panel, a docked side panel) had no
  view: its content came out loose, without its title. It is now a panel with its title as the
  header, collapsible when it says so.
- **Redwood: `MetricCard.icon`, `Meter` thresholds and unit, `info` status tone.** A metric's icon was
  not drawn (an icon name is Redwood's icon, an emoji is drawn as itself). A `Meter` showed
  `value / max` and ignored `unit`, `warnAt` and `dangerAt`: it now reads like the web renderer's —
  the value with its unit, the caption or else the fill percent, and the fill turning warning/error
  past the thresholds. A `StatusItem` coloured `info` had no colour.
- **Redwood: `EmptyState` icon and `StatusList` rows without avatar.** An empty state printed its icon
  name as text («vaadin:list-select Select an item»); an icon name is no longer part of the title (an
  emoji still is). A status list row without an avatar left an empty square before its title.
- **Redwood: HeroSection `centered` and `image`.** The flags reached the page as classes with no style:
  the texts were not centred and stayed dark over the darkened image (unreadable on a dark picture).

### Documentation

- The wizard page says outright that the last step field is the result screen (Next never reaches
  it, only the completion action does) and documents step toolbar buttons.
- **`GeneralOverview.recordLabel()`** labels the context switcher ("Requisition", "Customer"…).
  The `record` field lives in the base class, so a subclass had no way to label it. Blank by
  default (unlabelled, as before). `GeneralOverview` now implements `LabelSupplier` for it; a
  subclass that supplies labels of its own overrides `label(...)`. (Java)

- **A wizard in a drawer is described as what it is.** The drawer page, the page-template guide and
  core's long-drawer-wizard warning no longer imply Redwood renders its guided-process template in
  a drawer: the renderers draw the drawer's wizard as a generic wizard (Redwood: the step train),
  and the full-page Guided Process is a routed `Wizard` with `@WizardProgress(RAIL)`.

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
Migrating from alpha (a page of the pre-release docs).

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
    Migrating from alpha (a page of the pre-release docs)):
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
  openpyxl / reportlab is gone). See Migrating from alpha (a page of the pre-release docs).
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

GA readiness: nine work streams integrated. Read Migrating from alpha (a page of the pre-release docs) before upgrading.

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
