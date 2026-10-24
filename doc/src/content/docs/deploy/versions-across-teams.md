---
title: "Versions across teams and deployments"
description: "What happens when a screen changes while a user has it open, when the renderer is upgraded, and when several teams release Mateu UIs on their own schedules — and the rules that keep it working."
---

In a distributed setup nothing is released at the same time: each team ships its screens when it is
ready, the shell is upgraded on its own schedule, browser tabs stay open across deployments and
mobile installables update when their users let them. This page explains what Mateu does in each of
those situations and which rules make them safe. The normative contracts it builds on are
[Stability & versioning](/reference/stability-and-versioning/) and the
[wire specification](/reference/wire-specification/#status-and-versioning).

## What versions independently

| Piece | Versioned by | Ships with |
|---|---|---|
| Mateu (core, adapter, **web renderer**) | the Mateu release (`3.0-beta.N`, `3.0.0`…) | your artifact — the renderer jar (`mateu-vaadin` / `mateu-redwood`) is on your classpath |
| Your screens (`@UI` classes, YAML definitions) | your own release | your artifact |
| The wire between them | `wireVersion` in every response (currently `3.0`) | — |
| Native renderers | the installable (React Native app, IntelliJ plugin) | the store / marketplace / OTA |

Two consequences follow:

- **On the web, the backend and the renderer always move together.** Upgrading Mateu in an app
  upgrades the renderer that app serves. There is no separate renderer deployment to coordinate.
- **What actually crosses team and version boundaries is the wire** — and, inside it, a handful of
  names your code chooses: routes, action ids, field names and the class names of your view
  models. Those names are your public contract (see [Rules for teams](#rules-for-teams)).

## The server keeps nothing between requests

Every request rebuilds the screen from scratch: Mateu instantiates the view model class **currently
deployed**, writes into it the state the browser sends back, runs the action and answers. There is
no server-side session holding an "old version" of a screen
([execution model](/java-user-manual/concepts/execution-model/)). So:

- a tab opened before a deployment talks to the **new** code on its next click;
- during a rolling deployment, two consecutive clicks may reach an old and a new instance;
- nothing has to be migrated on the server — but the browser still holds the **old screen**: its
  layout, its field names, its action ids.

The rest of this page is about that mismatch: how Mateu notices it, what each kind of change does,
and the rules that keep it harmless.

## How Mateu notices a redeployment

Every response of Mateu's API carries an **`X-Mateu-Build`** header: a fingerprint of the deployed
UI. The server computes it once, on the first request, from the Mateu version, the bytecode of every
view model the application exposes (the routed classes and what they reach — exactly the set of
types the server accepts back from a client) and the `specs/ui` files. So it is **the same on every
replica of one release** and changes when a screen changes — and only then: a fix in a service class
does not ask anybody to reload. It is on every response, refusals and errors included.

Every renderer remembers the first build it saw from each backend (the URL up to `/mateu/`) and
compares every later response with it:

- **Another build on a successful response** — the app was deployed again while the screen was
  open. The renderer shows, once per backend, a notice that stays until it is dismissed:
  *"This app has been updated. Reload to use the latest version."* with a **Reload** action.
- **Another build on a refusal** (a 403 Mateu sent) — the screen the request came from no longer
  exists in that form: an action was removed or renamed, or the view model class was renamed or
  moved. Instead of *"You are not allowed to do this."* the user reads *"This screen has changed
  since you opened it. Reload to continue."*, with **Reload**.
- **The same build** — nothing changes: a refusal is a refusal.

What Reload does depends on the renderer:

| Renderer | The notice | Reload |
|---|---|---|
| Web (Vaadin) | a toast that stays until closed (error-styled for a stale screen) | reloads the page — the browser's unsaved-changes prompt still applies |
| Web (Redwood) | the shell's message band, with its button reading *Reload* | reloads the page |
| React Native | a toast that stays until closed | reloads the current screen from scratch (the app shell and menu stay as they are) |
| IntelliJ plugin | a sticky notification in the "Mateu errors" group | reloads the app shell and every open Mateu view on its current route; **unsaved edits are discarded** — pressing Reload is taken as consent |

The texts are in English and Spanish, following the UI's language like the rest of the renderer's own
text.

### Choosing the build id yourself

The computed id is what most apps want. To use your own instead — a CI build number, a git
commit — set **`mateu.build-id`** (`-Dmateu.build-id=…`, `MATEU_BUILD_ID`, or `mateu.build-id` in
your framework's configuration). It is reduced to `[A-Za-z0-9._-]` and 64 characters. Every replica
of a release must get the same value, or users are told about a redeployment on every request that
lands on another replica.

| Backend | Setting |
|---|---|
| Java (all adapters) | `mateu.build-id` / `MATEU_BUILD_ID` |
| .NET | `MateuOptions.BuildId` or `MATEU_BUILD_ID` |
| Python | `add_mateu(build_id=…)` or `MATEU_BUILD_ID` |

The .NET port computes its default from the module version ids of the assemblies holding the
registered UI types; the Python port from the source of the modules defining them. Both add the
`specs/ui` files and the port's own version.

### Behind a proxy or on another origin

The header must reach the browser. A reverse proxy that strips unknown response headers turns the
feature off (nothing breaks: without the header the renderer simply never notices). With CORS
enabled (`mateu.cors.allowed-origins`), Mateu lists `X-Mateu-Build` in
`Access-Control-Expose-Headers`, which a cross-origin renderer needs to read it; the .NET port does
the same on top of the host's CORS policy, only for origins that policy grants.

## A screen changed while the user had it open

The browser sends back three things the server interprets: the view model's class name
(`serverSideType`), the action id of the button pressed, and the component state (field name →
value). This is what each kind of change does on the next click from a tab that still shows the old
version:

| Change in the new release | What Mateu does | What the user sees |
|---|---|---|
| Anything that changes a screen | the response carries the new build | *"This app has been updated…"* once, with Reload |
| Field **added** | the field keeps its initializer (state has no value for it) | nothing until the screen re-renders. If the new field is **required** and not on the old screen, a save is refused with *"There are validation errors"* for a field the user cannot see — the notice above tells them to reload |
| Field **removed** | the value sent for it is ignored (logged at DEBUG) | nothing |
| Field **renamed** | old name ignored, new field keeps its initializer | what the user typed in that field is lost |
| Field **type changed** (e.g. `String` → `int`) and the old value no longer converts | the field keeps its server-side value; one WARN per field: *"Could not hydrate field…"* | the typed value is replaced |
| Action **removed or renamed** | refused: **403** and one WARN line (*"no such action"*) | *"This screen has changed since you opened it. Reload to continue."* |
| `@UI` class **renamed or moved to another package** | refused: **403** and *"serverSideType '…' is not a type this application exposes"* | the same stale-screen message, on every button until the page is reloaded |
| Route **removed or renamed** | the route resolves to nothing | the not-found page (also for bookmarks and deep links) |
| Layout / labels / new components | nothing to reconcile | the new version appears as soon as an action re-renders the screen, or on reload |

The 403 itself is deliberate: the server only accepts class names and action ids it exposes **now**,
which is what stops a client from naming arbitrary classes or methods. The build id is what lets the
renderer explain it; it reveals nothing about which actions exist, because the message depends only
on whether the deployment changed.

## Upgrading the renderer

### Web (Vaadin and Redwood)

The renderer is upgraded when you redeploy the app with a new Mateu version — and a new Mateu
version is a new build id, so open tabs are told to reload.

- **New page loads** get the new renderer. Mateu's assets are served with `Cache-Control: no-cache`
  plus ETag (or under a content-versioned path), so a browser revalidates and never keeps a stale
  bundle after a reload ([`StaticAssetCaching`](https://github.com/miguelperezcolom/mateu/blob/master/backend/shared/core/src/main/java/io/mateu/core/infra/StaticAssetCaching.java)).
- **Open tabs keep the renderer they loaded** until the user reloads. They keep working: a backend
  of the same wire major speaks a wire they understand (additive within a major — new fields are
  ignored, a new component type is drawn as a placeholder).
- The Vaadin renderer loads some components lazily (chat, gantt, planning board, rich text…) from
  chunks with fixed names; an old tab that opens one for the first time after a deployment gets the
  new chunk. That is the case the reload notice is there for.

### Native renderers

Native renderers are installed separately, so they **can** be older than the server:

- every response carries `wireVersion`; the React Native app and the IntelliJ plugin accept any
  minor of their major and show a one-time *"Version mismatch"* message for another major;
- they also send **`X-Mateu-Renderer`**, so the operator sees the problem too (next section);
- the **app registry** is the lever to force an upgrade: raise `requiredRendererVersion` (mobile) or
  `intellij.requiredPluginVersion` / `requiredIdeBuild` (desktop) and the next boot shows **Update
  required** — an over-the-air update first for EAS-built mobile apps, then the store link, or the
  IDE's own update flow ([app registry](/native/#app-registry-pointing-installables-at-their-backend)).
  Raise it only when the server actually uses something older installables cannot draw.

### Which renderer is calling

Every first-party renderer names itself in the **`X-Mateu-Renderer`** request header, on Mateu's
own requests only (never on calls to third-party REST sources):

```
X-Mateu-Renderer: vaadin/0.0.15 wire/3.0
X-Mateu-Renderer: redwood/2604.1.0 wire/3.0
X-Mateu-Renderer: react-native/1.0.0 wire/3.0
X-Mateu-Renderer: intellij/3.0-beta.12 wire/3.0
```

The version is the renderer's own (its npm package, the installable, the plugin), not Mateu's. When
the wire major differs from the server's, every backend logs **one WARN per distinct value**
(*"Renderer '…' speaks another wire major than this server (3.0)…"*) and still answers — the
renderer shows its own message to the user. Your code can read the header like any other
(`httpRequest.getHeaderValue("X-Mateu-Renderer")`), e.g. to adapt to an old installable.

## Several teams, several release trains

### Federated (each team runs its own service)

A shell composes other teams' services with `RemoteMenu`s or `MicroFrontend` islands. Each service
may be on **any Mateu 3.x** ([using external Mateu UIs](/java-user-manual/build/using-external-mateu-uis/#wire-versions)).
What matters is **who draws the screens**: a remote team's screens are rendered by the **shell's**
renderer, in the user's browser. So:

- **A remote on an older Mateu than the shell** — fine: the shell's renderer understands everything
  an older wire contains.
- **A remote on a newer Mateu than the shell** — fine for everything that existed before; a component
  type or field introduced after the shell's version is drawn as an "unsupported component"
  placeholder or ignored.
- Hence the rule: **upgrade the shell first** (its renderer must be at least as new as the newest
  remote), or keep remotes off features the shell's version does not have yet.

Each remote is a backend of its own, with its own build id: when one team redeploys, users of the
shell are told about that remote — once — not about the others.

Routes are part of the contract between teams: the shell's menu and any deep link point at a
remote's routes, and a renamed route breaks them like a removed page.

### In-process (modules in one deployable)

Modules mounted in-process (a Maven dependency, `mateu.ui.modules`) run on the **host's** Mateu:
their classes were compiled against their own version and run against the host's. Keep every module
on the **same Mateu minor** as the host ([UI federation](/mateu-about/ui-federation/#2-version-compatibility)).
The host checks it: the indexer annotation processor records its version in each module's
`META-INF/mateu/ui-registrations`, and on the first request the host logs one WARN per module built
against another minor:

```
UI module jar:file:/…/orders-ui-2.4.0.jar was built with Mateu 3.1.0, this application runs Mateu
3.0.2. In-process modules must be built against the same Mateu minor version: rebuild the module,
or mount it as a separate service (RemoteMenu).
```

A module indexed by a release older than that record, and a host built from a development snapshot,
are not reported.

## Rules for teams

1. **Treat these names as a public API**: routes, action ids (method names unless an id is set),
   field names of view models, and the fully qualified names of `@UI` classes and the view models
   they return. Changing one is safe for users now — they are told to reload — but it still throws
   away what they were doing on that screen.
2. **Expand, then contract.** Change them across two releases instead of one: add the new field or
   action next to the old one (the old method delegating to the new), release, and remove the old
   one in a later release, once no open tab can still be using it. The same goes for routes: keep the
   old route as an extra `routes.yaml` entry bound to the same view model until bookmarks have moved.
3. **New required fields**: give them a sensible initializer, or expect a save from an old tab to be
   refused once.
4. **One Mateu version per artifact.** Pin `mateu.version` and keep every `io.mateu` artifact on it
   ([production checklist](/deploy/production-checklist/)); the backend and the web renderer then
   always match.
5. **One build id per release.** Leave it computed, or set `mateu.build-id` from your pipeline —
   the same value on every replica.
6. **Federation: shell first.** Upgrade the shell's Mateu before (or together with) the newest
   remote. Remotes upgrade on their own schedule as long as they stay within the major.
7. **Native: raise the registry minimum only when needed**, and pair it with an OTA update so users
   are not sent to the store for a JavaScript-only change.
8. **A Mateu major** (`3` → `4`) changes the wire major: plan it like any breaking change, with all
   renderers and services moving inside one window. The WARN lines above tell you who is still on
   the old one.

## Limits

- A rolling deployment that alternates old and new replicas shows the reload notice as soon as one
  request reaches the other release, whichever direction that is. It is shown once.
- The notice appears on the **next request** after a deployment — a screen nobody touches is not
  interrupted.
- The Redwood notice uses the shell's message band, which is styled as an error; a later transport
  error replaces it.
- Python: an exception that escapes Mateu's own error handling and becomes a raw 500 is answered by
  Starlette outside any middleware, without the header. Mateu's endpoints catch their errors, so this
  does not happen on their normal paths.
- The AI chat stream and the live-update / agent-push streams send `X-Mateu-Renderer` (except the chat,
  whose URL may be an external AI service) but do not take part in the build comparison: the
  ordinary requests of the page do.
- The IntelliJ plugin shows the stale-screen text in English inside an embedded island that fails to
  load; the notification itself follows the UI language.
