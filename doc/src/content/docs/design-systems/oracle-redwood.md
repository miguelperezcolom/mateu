---
title: "Oracle Redwood"
description: "Mateu renderer built on Oracle's Redwood design system."
---

The Oracle Redwood renderer is built on **Oracle Visual Builder** — it renders Mateu screens with the
Redwood design system's `oj-*` components (served from Oracle's CDN) inside a Visual Builder app. Use
it when your UIs need to match Oracle Cloud applications or will be embedded inside existing Oracle
Redwood interfaces.

:::note
This is the current Redwood/Visual-Builder line. The earlier standalone Oracle JET renderer
(`redwood-oj`) has been [retired](/design-systems/renderer-contract/).
:::

:::caution[Oracle licensing]
The renderer's own code is Mateu's (Apache 2.0) and the jar **vendors nothing from Oracle**. At run
time it loads from Oracle's CDN:

- **Oracle JET and the Redwood theme** — open source, [UPL 1.0](https://www.oracle.com/downloads/licenses/upl-license1.html).
- **The Spectra components (`oj-sp-*`), the Visual Builder runtime and Oracle's icon/illustration
  gallery** — Oracle's property, **not** open source. Their use is governed by **your own Oracle
  terms** (typically the Visual Builder entitlement of an Oracle Cloud subscription). Mateu grants
  no rights over them.

Think of this renderer as a connector: the code is free; the service it connects to is not. Using it
outside an Oracle subscription is a question for your Oracle agreement, not for Mateu's licence. The
full statement ships in the jar as `META-INF/NOTICE.md` (and in the repository under
`frontend/web/monorepo/apps/redwood/`). Oracle, Oracle JET, Redwood and Visual Builder are
trademarks of Oracle and/or its affiliates; Mateu is not affiliated with or endorsed by Oracle.
:::

![A form rendered by the Redwood renderer](/images/docs/design-systems/basic-form-redwood.png)

**Demo:** https://redwood.mateu.io/

Redwood's RDS toolkit standardizes full-page **templates** (Collection Detail, General Overview,
Guided Process, Create and Edit — Drawer…). Mateu builds those templates from the backend — see
the [page templates map](/ux-patterns/page-templates/) for the template → archetype mapping.

## Two modes, one renderer

| | **Standalone** | **Embedded** |
|---|---|---|
| What it is | A complete Visual Builder app (shell, menu, routes) in the `redwood` jar | `<mateu-ui>`, a JET Custom Component you import into **your own** Visual Builder app |
| Who owns the page | Mateu: the URL is the Mateu route, the shell is Mateu's | Your VB app: its shell, its navigation, its URL; Mateu fills one area of a page |
| JET / Redwood / Spectra | Loaded from Oracle's CDN by the packaged app | **Your app's** — the component brings no second runtime and no iframe |
| How you get it | Maven dependency | `mateu-ui-<version>.zip` (attached to each release) |

Both paint the same screens with the same code: the component's view **is** the standalone app's
content page and it runs the same action chains, so a screen looks and behaves the same in both.

## Add to your project (standalone)

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>redwood</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

## Embed Mateu screens in an existing Visual Builder app

Use this when the shell already exists — a Fusion extension, a VB app your team owns — and some of
its pages should show screens that a Mateu backend serves (a listing, a form, a wizard, a whole CRUD).

### 1. Import the component

Download `mateu-ui-<version>.zip` from the [release](https://github.com/miguelperezcolom/mateu/releases)
(or build it: `npm run build:embedded` in `frontend/web/monorepo/apps/redwood` →
`build/embedded/mateu-ui-<version>.zip`). In Visual Builder: **Components → + (Import Component)**,
pick the zip. It lands under `resources/components/mateu-ui/`; Visual Builder adds it to the
Components palette and to the page's imports when you drop it on a page (or add it by hand to the
page JSON: `"imports": {"components": {"mateu-ui": {"path": "resources/components/mateu-ui/loader"}}}`).

### 2. Drop it on a page

```html
<mateu-ui
  base-url="https://erp.acme.com/mateu"
  route="{{ $variables.mateuRoute }}"
  params="[[ { id: $variables.orderId } ]]"
  app-context="[[ { company: $application.variables.company } ]]"
  headers-provider="[[ $functions.mateuHeaders ]]"
  on-mateu-navigate="[[ $listeners.mateuNavigate ]]"
  on-mateu-title="[[ $listeners.mateuTitle ]]"></mateu-ui>
```

**Properties**

| Property (attribute) | Type | What it does |
|---|---|---|
| `baseUrl` (`base-url`) | string | The Mateu UI mount: its API is `<baseUrl>/mateu/v3/…`. Empty = the page's own origin. |
| `route` | string | The Mateu route, relative to the mount (`orders`, `orders/:id`). Empty = the app's home. **Written back** when the screen navigates inside the component — bind it with `{{ }}` to follow it. |
| `params` | object | Fills the route's `:placeholders`; the rest travel as the query (a listing opens filtered by them). |
| `initialState` (`initial-state`) | object | The component state the first load of the screen is sent with (a form opens pre-filled). |
| `appContext` (`app-context`) | object | The app state (`@AppContext`: company, hotel, fiscal year…) sent with every request. Changing it reloads the screen. |
| `token` | string | Sent as `Authorization: Bearer <token>` (a value with its own scheme, `Basic …`, as is). |
| `headers` | object | Extra headers for every request (tenant, correlation id…). |
| `headersProvider` (`headers-provider`) | function | `(url) => headers` or a Promise of them, called on **every** request — the way to pass a token that rotates. Wins over `token`/`headers`. |
| `withCredentials` (`with-credentials`) | boolean | Sends the browser's cookies to a backend on another origin. |
| `navigation` | `internal` \| `host` | Who handles a navigation the **screen** asks for (a row click, an action returning a route, a link). See below. |

Changing `route`, `params` or `initialState` opens that screen; `appContext` reloads the current
one; `baseUrl`/`withCredentials` start over; a new `token`/`headers`/`headersProvider` is simply used
from the next request on. Methods: `navigate(route, params)` and `reload()`.

**Events** (JET convention: the type is camelCase, a page listens with `on-mateu-…`; all bubble)

| Event | `detail` | When |
|---|---|---|
| `mateuNavigate` | `{route, force}` | The screen asks for another route. **Cancelable.** |
| `mateuAction` | `{actionId, parameters}` | The user ran a Mateu action. |
| `mateuTitle` | `{title}` | A new screen title — the page title is yours: show it where your page wants it. |
| `mateuMessage` | `{summary, message, type, displayMode}` | A message for the user (also shown inside the component). |
| `mateuReady` | `{route}` | The first screen is painted. |
| `mateuError` | `{kind, message, status}` | A request failed (also shown in the component's error band). |

**Navigation.** With `navigation="internal"` (the default) the screen navigates inside the component
and `route` is written back; `mateuNavigate` fires first, and a listener that calls
`event.preventDefault()` keeps the component where it is — for example to open the route in another
page of your flow instead. With `navigation="host"` the component never navigates by itself: it only
fires `mateuNavigate`, and your page decides (navigate its flow, or set `route`). Your page's URL is
never touched either way: the component does not use the browser history.

### 3. Identity (your app's user on the Mateu backend)

The component calls the Mateu backend from the browser, so the backend must be able to tell who
the user is. Pass the identity your VB app already has:

- **A bearer token your app holds** (OAuth/IDCS/OCI IAM token, a JWT from your gateway): bind
  `token="[[ $variables.accessToken ]]"`, or — if it rotates — use `headers-provider` with a page
  function, so it is read on every request:

  ```js
  // the page module (main-page.js), bound as headers-provider="[[ $functions.mateuHeaders ]]"
  define([], () => {
    let accessToken = '';
    class PageModule {
      // call it from the action chain that obtains/refreshes the token (your security provider,
      // a service connection to your IdP…)
      setAccessToken(token) { accessToken = token; }
      // asked on every request (it is passed as a plain function: do not rely on `this`)
      mateuHeaders(url) { return { Authorization: 'Bearer ' + accessToken }; }
    }
    return PageModule;
  });
  ```

- **Cookies** (the Mateu backend is behind the same SSO and shares the session cookie):
  `with-credentials="true"`, and on the backend `mateu.cors.allow-credentials=true` for your origin.

On a `401` the component dispatches the cancelable `mateu-session-expired` event on `document`
(`detail: {retry, giveUp}`): refresh the token in your app and call `detail.retry()` — the request is
sent again once, with whatever your provider answers then.

### 4. CORS on the Mateu backend

A VB app is served from another origin (`https://<instance>.oraclecloud.com`), so allow it:

```properties
mateu.cors.allowed-origins=https://myinstance-vb.builder.ocp.oraclecloud.com
# only with with-credentials="true":
mateu.cors.allow-credentials=true
```

See [configuration](/java-create-your-project/configuration/#cross-origin-access-cors).

### What the component does not do (limitations)

- **One `<mateu-ui>` per page.** The renderer core is a module with page-level state; a second
  instance on the same page takes over from the first (a warning is logged).
- **No app shell.** The Mateu App's menu, header actions, `@AppContext` pickers, notification bell,
  AI chat and Ask palette are shell chrome: the host page has its own. Pass the context with
  `app-context`; navigate with `route` or your own menu.
- **Dialogs, drawers and toasts** open in JET's popup layer over the page, as any JET overlay of the
  host does.
- **Requirements on the host page:** JET 16–19 with the Redwood theme, the Spectra components
  (`oj-sp`, present in every Redwood VB app) and the Redwood icon font. On a plain JET page (not
  VB) the component points the missing `oj-sp`/`oj-dynamic`/`oj-oars` module paths at Oracle's CDN.
- **Licensing:** the zip contains only Mateu code (Apache 2.0) — no file from Oracle. Inside your VB
  app it runs on your app's JET, Redwood and Spectra, i.e. entirely under **your** Oracle agreement.

### Manual test plan (a real Visual Builder instance)

The component is verified in CI-like conditions against a plain JET host page (JET 18.1 from
Oracle's CDN, `e2e/vb-embedded-probe.mjs`), not inside the Visual Builder designer. In a VB instance:

1. Backend: run a Mateu app (e.g. `demo/demo-vb`) reachable from the browser over HTTPS, with
   `mateu.cors.allowed-origins=<your VB app origin>`.
2. Import `mateu-ui-<version>.zip` (Components → Import). Expect it in the palette under *Mateu UI*,
   with its properties in the Properties pane.
3. On a new page drop the component; set `base-url` to the backend and `route` to `products`. Run the
   app (Preview): the listing renders with your app's Redwood look, no console errors.
4. Click **New**: the create drawer opens over the page; fill *Name*, **Save**: the row appears.
5. Bind `route` to a page variable with `{{ }}`, add a button that sets it to `person`: the form
   renders; edit *Name*, **Save**: the message shows.
6. Add an event listener for `mateuNavigate` (on-mateu-navigate) that logs `$event.detail`; on the
   person form click **Go to products**: the listener runs and the listing renders inside; the page
   URL does not change. Set `navigation` to `host`: the listener runs and the form stays.
7. Identity: protect the backend with your IdP; pass the token (`token` or `headers-provider`):
   requests carry `Authorization` (browser network tab) and the screens load; with an expired token
   the `mateu-session-expired` event fires.
8. Design time: the component should render (or show an empty box) in the designer canvas without
   breaking the page — it only calls the backend when it has a reachable `base-url`.

## Characteristics

- Modern Oracle Cloud look and feel
- Designed for data-dense enterprise UIs
- Builds the RDS page templates (Smart Search, Collection Detail, General Overview, Guided Process…) from the same archetypes as every other renderer

## Related

- [Design systems overview](/design-systems/)
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
