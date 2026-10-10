> English translation of DESIGN-NOTES.md (the Spanish original). When they differ, update both.

# Mateu-on-VB — Design notes (handoff for resuming from another PC)

> Licences and redistribution limits of the Oracle pieces: see [NOTICE.md](NOTICE.md).

> This doc is the **source of truth for continuing** the project. Claude's session memory lives outside the repo
> (local to one PC), so everything needed to resume is here, in the repo.

## Where everything is

- **Phased roadmap (with visual gates) + final deliverable**: `RENDERER-ROADMAP.md` (this directory)
- **Executable POC** (validates the LOGIC): `frontend/web/monorepo/apps/redwood/poc/` — `reduceContexts.mjs` + `fixtures/*.json` +
  `test.mjs`. Run: `cd frontend/web/monorepo/apps/redwood/poc && node test.mjs` → 10 tests OK.
- **Full design (PDF)**: `frontend/web/monorepo/apps/redwood-renderer-design.pdf`
- **Reference VB apps**: `.dev/vb/dashboard` (classic JET), `.dev/vb/empty` (dynamic UI), `.dev/vb/frontoffice`
  (Redwood Starter with the `oj-sp`/Spectra pack — the BASE to build on).

## What the project is (in one sentence)

Turn a **real VB app hosted on Oracle** into a Mateu renderer, by means of a **portable JS kit** (bridge)
that consumes the standard `UIIncrementDto` and paints it with the authentic `oj-sp`/`oj-c`/`oj-dynamic` components.
VB = "just another renderer"; the Mateu backend **is not touched**. Decision made: the translation lives in a **JS bridge
inside the VB app** (not server-side, no Mateu hosting in VB's chains runtime).

## Architecture (the core, already validated in the POC **against the real wire**)

- **Transport (CONFIRMED 2026-07-24 against demo/demo-vb :9005)** — TWO endpoints:
  - **Shell bootstrap**: `POST /{base}/mateu/v3/components/_/action` with `{route:'', actionId:'__load__'}`
    → App fragment (menu, variant, contextSelectors). This is the ONLY use of that endpoint; the root route does NOT
    resolve through sync.
  - **Everything else**: `POST /{base}/mateu/v3/sync/{route without slash | _no_route}` with body
    `{serverSideType, appState, componentState, parameters, initiatorComponentId, consumedRoute, route, actionId}`
    (= `AxiosMateuApiClient.runAction`). LOADS use `actionId: ''` (`__load__` gives
    "not supported" on orchestrators!).
- **Initiator echo (the key to routing)**: the `targetComponentId` of each fragment is the ECHO of the request's
  `initiatorComponentId` (`''` → host), and the server DERIVES the internal ids from the initiator
  (`crud1` → `crud1_app`, `crud1_list`): id uniqueness across surfaces is the CLIENT's responsibility — the bridge
  ALWAYS posts with the surface's contextId as initiator.
- **Mediators (crud, island)**: the 1st load returns a ServerSide whose child0 is a **chromeless** App
  (variant MEDIATOR); the CONTENT arrives with a 2nd identical request + `consumedRoute` = the inner App's `rootRoute`
  + `serverSideType` = its `homeServerSideType` (without them: the mediator again or "No value
  present"). `mediatorOf(ctx)` in the reducer extracts that info.
- **`reduceContexts(reg, increment)`** — PURE reducer (the same code that will become methods of `app-flow.js`):
  - Registry = `contexts` (map `targetComponentId → context`, host = `__root__`) + `stack` (open drawers)
    + `shell` (when an `App` arrives).
  - A **context** holds the `tree` (component tree, NOT flat fields), `state`, `pageType`, `pageWidth`,
    `kind` (`host`/`drawer`/`island`), `dirty`, and presentation if it is a drawer.
  - Fragments routed by id: `Add` = new stacked overlay; `Replace`/`ReplaceKeepData`/State = update
    the target context; an `App` configures the `shell` (menu→navigator, title, width, appContext, headerActions)
    and does NOT create a content context.
  - Commands → **effects** (navigate/toast/download/runAction) or mutate the registry (`CloseModal` = close by
    pure state; `MarkAsClean/Dirty`).
- **`applyIncrement`** (VB action chain) = `reduce → assign contexts/stack → effects pipeline` (ifActions).
- **Render** = recursive dispatcher by `metadata.type` → self-referencing fragment `mateu-node` (the VB analogue of
  `renderClientSideComponent`). Forms are the `FormLayout` branch; most archetypes (item-overview,
  overviews, welcome, collection-detail) are COMPOSITION of a core of ~20 types → they come out "for free". Only a
  few have a dedicated wire type (DashboardLayout, FoldoutLayout, HeroSection, EntityHeader, Scoreboard,
  MetricCard). `pageType`/`pageWidth` (already on the wire) choose the outer template + width.
- **Outgoing**: `onAction(actionId, contextId)` → `runActionChain` uses `contexts[contextId].route/state`
  (`state` is two-way → saving = "send the state you already have").

## State & applying increments (decision 2026-07-24)

**The wire separates the two axes**: `RunActionRqDto` carries `componentState` **and** `appState` as distinct maps
(+ `parameters`, `initiatorComponentId`, `consumedRoute`, `route`, `serverSideType`, `serverSideComponentRoute`).
The mapping to VB respects that separation **by scope**:

- **`appState`** (appContext, merged into EVERY request) → **`$application.variables.mateuAppState`** (object).
  The application scope survives navigation → exactly what appContext needs.
- **`componentState`** (per component boundary, ephemeral) → lives inside the **registry**, which also goes in
  **`$application`** (`$application.variables.mateuRegistry`) to **keep islands alive on navigation** within the
  same shell without reloading.
- **Not "one variable per id"**: in VB variables are declared statically and ids are runtime UUIDs.
  It is ONE `object` variable (`@dt: object`/free) whose **keys** are the ids = the reducer's `contexts`.
  Internal markers (`_route`, `_embeddedMediator`, `_inline`, `_selectedId`…) travel inside `state`, with no
  special treatment.
- **Two-way without dynamic paths**: `oj-c-*` is not bound against `registry.contexts[<uuid>].state.<fieldId>`
  (fragile). Each `mateu-node` instance receives its context as an **input parameter with writeback**, exposes a
  fragment var `state`, and binds locally `value="{{ $variables.state.<fieldId> }}"`. The registry remains the
  single source of truth for **outgoing** actions; the writeback keeps the input in sync.
- **Outgoing**: `runActionChain(contextId)` builds `{ componentState: contexts[id].state, appState: mateuAppState,
  parameters, initiatorComponentId: id, route/serverSideType/consumedRoute/serverSideComponentRoute: from the context }`.

**Applying an increment to the target = a DATA operation, not a DOM one** (the antidote to the historical failure: the
Redwood renderers looked up the `mateu-ux` by id and remounted it imperatively → they broke islands/mediator):

1. **Routing** — the reducer already writes each fragment into `contexts[targetComponentId]` by key (`Add`→overlay to
   `stack`; `Replace/ReplaceKeepData/State`→merge; `App`→`shell`). The id is just a map key.
2. **Binding by id** — each surface reads its entry: host (`contexts.__root__`); overlays (`oj-bind-for-each`
   over `stack`, each id→`oj-sp-drawer`/`oj-dialog` with `contexts[id]`); embedded islands (when the dispatcher
   sees a `ServerSideComponent` boundary with its own id, it mounts a nested `mateu-node` bound to `contexts[thatId]`,
   kind=island — the VB analogue of `mateu-component`).
3. **Surgical re-render** — the reducer is **immutable with structural sharing**: only the touched entries
   get a new ref. `applyIncrement` reassigns `mateuRegistry` in one go; since each surface is **keyed by
   id** (`oj-bind-for-each key`, `oj-bind-if`), Knockout/JET only repaints the surface whose ref changed. Zero
   `getElementById`.

**Tricky cases (they have bitten us before):**
- **State-only** fragment (no `component`) → MERGE, not replace (the reducer keeps the `tree`, line 100). A
  host state push must not erase an island's routed content.
- Mediator/island **`_route` flips** live in `state`; changing `state._route` changes that entry's ref → it
  repaints only the island, without remounting the shell.
- **Unknown target in `Replace`** currently falls to `HOST_ID` (line 95) — which is exactly where the mediator was clobbering
  the host. Pin it down with real captures (create island vs. clobber host).
- **SSE/LongTask**: post with `initiatorComponentId = contextId`; the server echoes `targetComponentId` →
  it lands through the same routing.

**To verify in the Designer**: that the top-level reassignment of `mateuRegistry` propagates the keyed diff in
`oj-bind-for-each` without repainting everything (Knockout/JET observability) — test INSIDE a real VB app before
signing off Phase 9 (nested app).

## Wire contract (CONFIRMED with real increments — fixtures/real/*.json)

- `UIIncrement { messages, commands, fragments, banners, appendBanners, appData, appState }`
- `UIFragment { targetComponentId, component, data, state, action: Add|Replace|ReplaceKeepData }` —
  **the component state travels in `fragment.state`** (e.g. `{name:'Ada', age:36}` on load,
  and the save answers with a State-only fragment with the new state + the toast in `messages`).
- **Fragment root**: `ServerSide { id, serverSideType, route, pageType, pageWidth, initialData,
  actions, triggers, children:[ClientSide{metadata:{type:Page|App,…}}] }` for routed content;
  `ClientSide` with `metadata.type:'App'` only in the bootstrap (shell) — a MEDIATOR App ALWAYS arrives
  wrapped in a ServerSide and is content, not shell.
- **Drawer (Add)**: ClientSide root `metadata.type:'Drawer'` with `headerTitle/position/width/size/…`
  and **`metadata.initialData`** = initial state of the drawer's form; the content goes in
  `metadata.content` (Card pattern), NOT in `children`.
- **CloseModal carries `data.eventName`** (e.g. `mateu-crud:saved-in-drawer`): on close that event
  must be EMITTED through the @SubscribeTo bus — that is how the crud's listing refreshes (the ServerSides
  carry `triggers`). The reducer already emits it as an `events` effect.
- **Embedded island boundary**: INNER ServerSide node of the host's tree, with id = field name
  (`_guestNote`), `route` with `?_embeddedMediator=1&_inline=1` and those markers also in
  `initialData`. `collectIslands(tree)` locates them to mount the nested `mateu-node`.
- `UICommand { type, data, targetComponentId }` — types: `SetWindowTitle`, `SetFavicon`, `DispatchEvent`,
  `NavigateTo`, `PushStateToHistory`, `RunAction`, `MarkAsDirty`, `MarkAsClean`, `DownloadFile`, `CloseModal`,
  `AddContentToHead`, `AddContentToBody`.
- `FormField { fieldId, dataType, stereotype, label, required, readOnly, options, placeholder, min, max,
  multiline, … }`
- `ServerSideComponent.pageType` + `.pageWidth` are on the wire (pageType values: landing/collection/detail/
  form/process/dashboard; pageWidth: fixed/fullWidth/edgeToEdge).
- Type catalogue: `ComponentMetadataType` (~110; App, FormLayout, FormField, Card, TabLayout, FormSection,
  DashboardLayout, Scoreboard, MetricCard, DashboardPanel, FoldoutLayout, HeroSection, EntityHeader, TaskQueue,
  Crud/Table/Grid, + leaves).

## VB action chain builtins

**Confirmed** (seen in `.dev/vb/dashboard/**/*.json`):
- `vb/action/builtin/assignVariablesAction` — `{ "$scope.variables.x": { "source": "{{ … }}" } }`
- `vb/action/builtin/ifAction` — `{ condition }` + `outcomes.{true,false}`
- `vb/action/builtin/callModuleFunctionAction` — `{ module: "[[ $application.functions ]]", functionName, params }`;
  result in `$chain.results.<actionId>`
- `vb/action/builtin/navigateAction` — `{ "@dt": {targetType:"flow"}, parameters: { flow } }`
- `vb/action/builtin/fireDataProviderEventAction` — `{ target, add: { data } }` (useful for banners/ADP)

**To verify in the Designer** (names/param keys depending on version):
- `callChainAction` — the chain id key (`id` vs `chain`) + `params`
- `fireEventAction` — `{ name, payload }` (the `frontoffice` shell already listens to `spShowToast`)
- exact construction of `JsonMetadataProvider` (from `oj-dynamic`) if `oj-dyn-form` is used
- real wire paths against a CAPTURED increment: `component.id`, `initialData`, `Drawer` metadata

## Final deliverable (NOT negotiable)

A **portable JS kit** for VB hosted on Oracle: (1) bridge as an **AMD** module (`define([...], …)`) or methods
of `app-flow.js`; (2) VB artefacts (chains JSON, `mateu-node` fragment, host-page, `app-flow.json` entries); (3) `baseUrl`.
No build that VB cannot reproduce; the POC's `.mjs` is only a Node test → the AMD/UMD wrapper of the SAME core is
shipped. Self-contained, app-agnostic, portable. "Done" = empty VB app on Oracle + import the
kit + point at a Mateu → screen with native Redwood look, zero code of your own. Detail in the roadmap.

## Project status (2026-07-24, branch `redwood-fable`)

- **Done — roadmap prerequisite**: support backend `demo/demo-vb` (Spring MVC, **port 9005**
  so as not to clash with the other instances of the process in other clones; CORS open) with one screen per
  phase: `/hello` (P1), root app with menu (P2), `/person` (P3), `/products` crud editInDrawer (P4–5),
  `/island-host` + island `GuestNoteView` (P9). `capture.mjs` captures the 13 real flows →
  `fixtures/real/*.json`, and `test.mjs` (11 tests) validates the reducer **against that real wire** (the
  synthetic fixtures were deleted). To regenerate: start demo-vb (`mvn spring-boot:run`) + `node capture.mjs`.
- The old renderers `apps/redwood` and `apps/redwood-spectra` (+ their `-lit` modules) were DELETED
  on this branch; demo-admin-panel and explorer go back to mateu-vaadin. Project rule: **zero own HTML/CSS
  — always authentic VB/Redwood components**.
- Resolved from the original plan: "Replace with unknown target falls to HOST_ID" no longer applies (routing
  is by initiator echo + fallback by `tree.id`); `PushStateToHistory` and `DispatchEvent` are already
  mapped in the reducer (`urlPush`/`events` effects).

## Phase 1 — DONE (pending the user's visual verification)

- **Working VB app**: `frontend/web/monorepo/apps/redwood` (copy of the Redwood Starter `frontoffice`). Locally:
  `npm install` once; `npx grunt vb-build --no-optimize=true --force` (--force skips the deploy step
  that asks for --url; the exchange dependencies were emptied — the `oj-sp` load from the CDN through
  the paths in `app-flow.json`); `npx grunt vb-serve --port=9006` → http://localhost:9006 (with
  demo-vb running on :9005). `rootURL` was added to `visual-application.json`.
- **Kit**: `resources/js/mateu-bridge.js` is GENERATED by `poc/make-amd.mjs` from the single
  source (`reduceContexts.mjs` + `transport.mjs`) — regenerate after touching the core. The constant
  `mateuBaseUrl` lives in `app-flow.json`. Chain `loadMateuHello` (JS ActionChain with the bridge as
  an AMD dependency) in `vbEnter` of main-start-page → variables → `oj-bind-text` (starter markup,
  bindings changed; ZERO own HTML/CSS).
- **Authentic shell**: `shell-page.html` mounts `oj-sp-simple-ui-shell` + `oj-sp-global-header`
  (slots declared `globalHeader`/`stretchingContents`; imports added in shell-page.json).
  The capture `poc/shots/fase1.png` shows the Oracle global header + Ask Oracle FAB of the
  Spectra shell with Mateu's text in its place.
- ⚠ The process STOPS at the end of each phase for the user's visual verification.

## Phase 2 — DONE (pending the user's visual verification)

- **Menu → Redwood in-app navigation**: `loadMateuShell` (shell-page's vbEnter) does the bootstrap,
  stores the registry in `$application.variables.mateuRegistry`, projects `shell.menu` to
  `mateuNavItems` ({id: route, label: caption}) and navigates to the first option. `oj-sp-in-app-navigation`
  (import + markup in shell-page) — NOTE: the component is anchored at the BOTTOM by design
  (`oj-applayout-fixed-bottom` UNCONDITIONAL in its template) — it is the current Redwood/FA 26 navigation
  paradigm, not a bug. `selection` uses ONE-WAY binding (`[[ ]]`): with writeback
  the component writes the variable BEFORE emitting `spSelectionChanged` and the chain's anti-echo guard
  cannot tell the echo from a real click.
- **Navigation**: `onMateuNavigate` — the event's detail = `{currentId, previousId}` (NOT value);
  anti-echo guard against `mateuSelectedRoute`; `bridge.loadRouteInto` (new in transport.mjs,
  single source) follows the mediator (2nd load with consumedRoute+serverSideType) — verified:
  /products makes exactly 2 requests and /island-host 1. Title: Page.title, falling back to the
  menu caption (a listing's Page carries NO title — it travels in the Crudl's metadata).
- **Mateu gotcha discovered**: the route of a TYPED `@Menu` option is derived from the FIELD NAME,
  not from the class's `@UI` (field `islandHost` → route `/islandHost` ≠ `/island-host` → "Not
  found."). Workaround in demo-vb: explicit `RouteLink`. Candidate for a framework fix.
- Evidence: `shots/fase2.png` (shell + menu + first route) and `shots/fase2-person.png` (content
  changed WITHOUT reloading the shell); `probe-fase2.mjs` automates the gate.

## Phase 3 — DONE (pending the user's visual verification)

- **Editable form end-to-end**: /person paints with `oj-form-layout` + authentic JET widgets
  (`oj-input-text`/`oj-input-number`/`oj-switch`) via the widgetFor switch — the bridge's
  `summarizeHost().fields` projection (isText/isNumber/isBoolean PRECOMPUTED). Two-way:
  per-field `value-changed` → chain `mateuFieldEdited` accumulates `{fieldId: value}` in the PAGE
  variable `mateuDraft` (guard `updatedFrom === 'internal'` to ignore the echo of the initial set).
  Save → `runMateuAction` (bridge) with `{...host.state, ...draft}` → State-only merge + toast
  (starter pattern: local `oj-sp-messages-toast` + `callComponentMethod open`) → NavigateTo →
  event `application:mateuNavigate` → the shell navigates. Evidence: `shots/fase3.png` and
  `shots/fase3-saved.png` ("Saved Grace").
- **Gotchas of the local VB runtime (JET 19 app + visualRuntime 2510 built for JET 18 — the console
  "version mismatch") that CONSTRAIN the design**:
  1. `oj-dynamic-form` (the real tag — NOT `oj-dyn-form`) accepts metadata as a plain object and
     REQUIRES `displayProperties`, but **does not absorb edits**: its `transientValue` is not
     updated while typing (and the `{{ }}` writeback writes neither to application nor to page
     variables). `ojRawValueUpdated` is deprecated/"not supported" in the cca variant. → widgetFor
     switch with classic widgets; REVISIT oj-dynamic-form in VB Studio with a matched runtime.
  2. The `oj-c-*` VComponents do not evaluate their property bindings (label undefined) → classic
     `oj-button` with slotted `oj-bind-text` (Redwood-themed in JET 19 anyway).
  3. VB's CSP evaluator breaks on ternaries/comparisons in attributes → EVERYTHING precomputed
     in the bridge data (chroming, isText…); bindings only with simple paths.
  4. `Actions.fireEvent` needs the QUALIFIED name (`application:mateuNavigate`); bare, it
     does not reach the shell's listener.
  5. Listener parameters in the page JSON DO evaluate `$current` (the
     `{{ $current.data.actionId }}` pattern is the mechanism to know which button/field fired).

## Phase 4 — DONE (pending the user's visual verification)

- **Listing end-to-end**: /products paints with classic `oj-table` (columns from the **Crud** component's
  metadata — GridColumns nested in `md.columns`) + `oj-input-search` (Enter →
  `ojValueAction`) + `oj-sp-empty-state` in the noData slot. Rows wrapped in a page-level
  `vb/ArrayDataProvider2` whose `data` is BOUND to the application variable
  `mateuListingRows` (keyAttributes `_rowNumber`, always present). Verified: 3 rows,
  search "lap" → only Laptop (server-side filtering), "zzz" → empty state.
- **Listing contract (real wire)**: the listing's ServerSide carries triggers
  `OnLoad → search` (that is how the rows arrive: the bridge runs them after loading the route —
  `onLoadTriggers`) and `OnCustomEvent mateu-crud:saved-in-drawer → search` (the drawer
  refresh, Phase 5). The search is actionId `search` with the text in **componentState.searchText**
  (+ `page`/`size`/`sort` — that is how `SearchActionHandler` reads it; it does NOT go in parameters). The response
  is a **DATA-ONLY** fragment: `data.crud.page.{content,totalElements}` (literal key `crud`).
- **Reducer: `data` axis**: contexts gain `data` (data computed by the server, separate from
  `state`); a data-only fragment MERGES data keeping tree and state. `listingOf(ctx)`
  projects title/columns/rows/toolbar/emptyStateMessage; test 14.
- **1.4 brought forward**: `loadRouteInto` stamps `ctx.outbound` (route/consumedRoute/serverSideType)
  and `runMateuAction` rebuilds the route fields from there — the listing's actions (it is
  mediator content) go out with the right consumedRoute without the surface knowing.
- Probe gotcha: the oj-table/search modules stamp hidden `oj-dialog`s with empty `h1`s —
  probes must look for the h1 WITH text, not the first one.
- Evidence: `shots/fase4.png`, `fase4-search.png`, `fase4-empty.png`.

## Phase 5 — DONE (pending the user's visual verification)

- **Full CRUD in a drawer**: New (toolbar from the wire) and row click → `oj-drawer-popup` drawer
  (edge end, modal) with the widgetFor form of the Mateu Drawer's content; Save/`create` →
  `CloseModal(mateu-crud:saved-in-drawer)` → the chain fires the subscribed `OnCustomEvent`
  triggers (search) → the listing refreshes; starter toast. Esc/✕ discards by pure state
  (`dismissOverlay`, no event — the "dismissed without saving" path); Cancel goes to the server
  (`cancel-new`/`cancel-edit` → CloseModal). Verified end-to-end: Monitor creation + Laptop
  edit 1200→999 persisted and refreshed.
- **Contract fixed**: row click = actionId `view` with the ROW as `parameters` (that is how mateu-table-crud
  dispatches it) → Add Drawer "Edit" with `initialData` = the row; the drawer carries NO inner
  ServerSide → its actions are posted against the HOST (the listing's outbound); drawer New→`cancel-new`/`create`, Edit→`cancel-edit`/`save`. New fixture
  `open-edit-drawer.json`; tests 15/15 (overlayOf/eventTriggersOf/dismissOverlay).
- VB: selectable row (`selection-mode.row single` + `firstSelectedRowChanged` → view);
  gotcha: `oj-drawer-popup` with one-way `opened` closes with Esc ONLY if focus is inside
  (correct modal behaviour); listener on `ojBeforeClose`. The oj-table "stale fetch" AbortError
  in the console is an optimisation of the component itself, benign.
- **Post-verification fix (the drawer reopened after saving)**: two causes. (a) using row
  SELECTION to open Edit — the table re-emits the selection event on refreshing
  after saving → `view` again; changed to `ojRowAction` (the right gesture, stateless).
  (b) a VB runtime RACE: it re-invokes the listener with the SAME stored event after the
  refresh (~30ms after the save; at DOM level there was only ONE ojRowAction — verified with a
  capture-phase listener at document level) → DEDUPE guard by the originalEvent's `timeStamp`
  in `mateuRowClicked`. Verified 5/5 edit+save cycles without reopening.
- Noted as pending: the toolbar's Delete button renders but select-to-delete
  (`crud_selected_items`) is not wired yet; column formatting (money/boolean) is also
  pending. Evidence: `shots/fase5-list.png`, `fase5-new.png`, `fase5-created.png`,
  `fase5-edit.png`, `fase5-edited.png`.

## Phase 6 — DONE (pending the user's visual verification)

- **Deep menu**: a `@Menu` group (class with nested @Menus) arrives on the wire as an option with
  **`submenus`** (not `submenu`!) and COMPOSED routes (`/gestion/person`) that **do NOT resolve through
  sync** — the bridge navigates by the TERMINAL route (trims the parent's prefix; `shellNavOf`).
  **The wire's VARIANT rules** (refined with TWO rounds of user feedback) — THREE modes
  in `shellNavOf().mode`: `TABS` → bottom in-app navigation; **`HAMBURGUER_MENU`/`TILES` →
  PERSISTENT navigator**: `oj-drawer-layout` (reflow, NOT popup) BELOW the header with a hierarchical
  `oj-navigation-list` in the start slot — **open at start**, **does not hide on
  navigating** (marks the active item via `selection`); the hamburger only folds/unfolds it and
  the content shifts (user feedback round 3 — the 2nd version used a modal popup
  that closed on navigating). **Packaged navigator?** NO: `oj-sp-navigator` and
  `oj-sp-ask-oracle-navigation-list` require the FA module machinery (tried live:
  0×0, `oj-pending-subtree-hidden`; their data carries module/focusViewId/productFamily) — VB's
  own templates (the "empty" app) mount the left nav just like us:
  `oj-navigation-list` in a drawer. Panel width: 280px on the start slot's container
  (JET/RDS cookbook pattern; oj-drawer-layout sizes by content and exposes no variable); **`MENU_ON_TOP` → FIRST-LEVEL options VISIBLE in the header** (no
  hamburger; leaves = borderless `oj-button` with the route in data-route, groups =
  `oj-menu-button` + `oj-menu`). Gotcha: `oj-navigation-list` parses its `<ul>` at init and the
  `li`s stamped by `oj-bind-for-each` arrive LATER → `refresh()` must be called when opening
  the drawer or they stay as raw links. The demo carries an explicit `@App(HAMBURGUER_MENU)` to
  showcase the drawer (remove the annotation → AUTO → MENU_ON_TOP → topbar); both modes
  verified (`shots/fase6-navdrawer*.png`, `fase6-topbar.png`).
- **@AppContext**: the App's `contextSelectors` → compact `oj-select-one` (utility classes
  `oj-form-control-max-width-sm` + `oj-sm-flex-wrap-nowrap`) in the global-header's `end` slot;
  the value goes to `$application.variables.mateuAppState` and travels as **appState in EVERY request**
  (threaded through loadRouteInto/runMateuAction/chains); on change, the current route is reloaded
  (uniform reactivity). Verified: "Saved Ada @ Playa" (the server reads it via
  `httpRequest.appContext`).
- **Header actions** (`AppActionsSupplier`): leaf → borderless `oj-button`; with children →
  `oj-menu-button` + `oj-menu`/`oj-option` (actionId in `value`, `detail.selectedValue` in the
  listener). APP-LEVEL dispatch confirmed: `sync/_no_route` + the App's serverSideType (stored
  in the shell slice) + appState — "Synced @ Playa", "Exported as PDF" through the shell's toast.
- Tests 16/16 (`shellNavOf`); fixtures regenerated (menu with group + selectors + actions).
  Evidence: `shots/fase6-submenu.png`, `fase6-context.png`, `fase6-header.png`.

## Phase 7 — DONE (pending the user's visual verification)

- **Foldout end-to-end**: demo-vb `/booking` (`BookingFoldout extends Foldout`: overview +
  3 `@Panel`) → wire `FoldoutLayout` (headers in `metadata.panels` {title,subtitle,icon,open},
  SLOTTED content `overview`/`panel-N`, pageWidth edgeToEdge) → projection `foldoutOf(ctx)`
  (+`collectTexts`) → **authentic `oj-sp-foldout-layout` + `oj-sp-foldout-panel`** (prop
  `panelTitle`, content in the default slot). The chrome is the real RDS: golden accent bar
  under each title, surfaces, "Parent page" breadcrumb and the component's own page-dots.
- **Interaction**: the click goes on the panel's CONTAINER (not on the title) — the panels
  share the space and focusing one folds the others; the dots (`a.pagination-dot`)
  navigate. **CRITICAL layout gotcha (post-verification: "the dots did nothing")**: the
  foldout's responsive logic only activates if its width is BOUNDED — the starter's
  `oj-vb-content` is a flex-item with `min-width:auto`, so wide content OVERFLOWED
  (scrollWidth === clientWidth → the component thought everything fit). Standard fix:
  `min-width:0` on shell-page's `oj-vb-content` (applies to ANY wide content:
  foldouts, tables, planning…) and no flex wrappers around the foldout in the page.
- Noted limitations: `open=false` (Notes initially folded) has NO API in
  `oj-sp-foldout-panel` (all start visible); `subtitle` does not exist as a prop (it is painted
  as the first line of the content); the panels' content is projected as TEXTS
  (`collectTexts`) — the general recursive dispatcher is still pending (later phases).
- Tests 17/17 (fixture `load-foldout.json`). Evidence: `shots/fase7.png`, `fase7-folded.png`.

## Phase 8 — DONE (pending the user's visual verification)

- **Guided process end-to-end**: demo-vb `/checkout` (`CheckoutWizard extends Wizard`, 3 steps +
  result, `@WizardProgress(STEPS)`) → wire: `ProgressSteps` with `steps [{id,title,status:
  current|upcoming|done}]` + the step's Card (normal form) + back/next buttons (normal actions)
  + `pageType process`; cross-step state travels in the state (position + per-step maps +
  flattened fields). Projection `wizardOf(ctx)` (steps with a `title` alias — the component's rail
  reads that field — + currentStep). Tests 18/18, fixture `load-wizard.json`.
- **Authentic `oj-sp-guided-process`** (refined with user feedback: overview + no phantom Next +
  rail marking the step): full template — illustrated band, initial **OVERVIEW**
  (numbered columns 01/02/03 + Start button) that appears when `current-step` is EMPTY and whose
  Start moves to step 1 by INTERNAL WRITEBACK (no event — do not intercept); right rail
  `N|M` with the step list. Integration: the step's form (widgetFor) in its slot; Continue →
  `spBeforeNext` → the wire's forward action; last step → `primaryAction` {confirm's label,
  disabled} **WITHOUT availableFromStep** (if you set it, the button appears DISABLED on all
  steps — the "phantom Next"); never null (it reads .label unconditionally). RAIL: each step
  needs **`display:'on'`** or it comes out with oj-disabled (greyed out, no selection mark); Mateu's
  status is NOT emitted (the indicator expects another enum). Effective current-step in a separate
  var (`mateuWizardShownStep`: '' on entry = overview; the real step after each action).
  The **page h1 is SUPPRESSED in wizard mode** (the guided-process already carries the title in its
  overview and its header; user feedback) — any extra wizard toolbar action
  would go to the step's slot, not to a duplicated header.
  **Back = click on the RAIL** (feedback: a Back in the content contradicts the footer's
  Cancel): `spBeforeStepNavigate` (detail {currentStep,nextStep,triggeredFrom:'continue'|'step'})
  with triggeredFrom 'step' runs the necessary 'back's against Mateu (fromIdx−toIdx times);
  FORWARD through the rail does not navigate (the shown step is restored imperatively — the event
  is cancelable but the chain runs async and preventDefault arrives late). The slot carries no
  buttons (the component's footer/rail navigate). **Cancel** (`spCancel` — the component
  dispatches it bare, no dialog on this path): abandon the process → navigate to home
  (`mateuHomeRoute`, the menu's first leaf, stored at bootstrap); on re-entry the wizard
  starts from scratch (fresh instance per request). Verified: overview→Start→1→2→3→Confirm→
  "Order confirmed…", rail marking each step, rail-back keeping the state, Cancel→home
  and re-entry to the overview. Probe gotcha: the result goes in a readonly input
  — `innerText` does not see input values.
- Evidence: `shots/fase8.png`, `fase8-step3.png` (rail 3|3 + Confirm), `fase8-result.png`.

## Phase 9 — DONE (pending the user's visual verification)

- **Embedded island end-to-end** (`/island-host`, in Gestion): the host is a normal form and the
  boundary (`collectIslands`: inner ServerSide, id `_guestNote`) is loaded as its OWN
  SURFACE — `loadRouteInto(base, reg, boundary.route, boundary.id)` (initiator = boundary id
  → mediator + content + stamped outbound, ALL generic and already existing). Its actions
  (Edit/Save/Cancel) are posted against its context and the responses come back addressed to it:
  **only the island is re-projected — the host IS NOT TOUCHED** (verified: an unsaved local edit
  in the host, room=999, survives the island's Edit and Save).
- **Mediator route-flip (the documented mechanic, now implemented)**: `edit`/`save`
  answer a STATE-ONLY fragment with a new `state._route` (`/edit`→`/view`) = "reload my
  inner route": `composeInnerRoute(outbound.route, flip)` = base + flip + query markers
  (`/guest-note/edit?_embeddedMediator=1&_inline=1`) and reload with the context's outbound.
- **Helpers with a BOUNDARY**: `collectFields`/`collectActions` no longer cross inner ServerSides
  (the island's fields/actions were leaking into the host's form — test 19).
- **CRITICAL VB GOTCHA**: VB variables sit behind PROXIES — each read may return a different
  wrapper → NEVER compare by identity (`after.tree === before.tree` fails even though
  the reducer preserves refs). Flip detection by a SEMANTIC criterion (state-only increment).
  This also qualifies the design's "structural sharing": it holds WITHIN one reducer pass, not
  between reads of the variable.
- Tests 20/20. Evidence: `shots/fase9.png` (host+island in view), `fase9-edit.png` (island in
  edit with the host intact), `fase9-saved.png` (saved, view with the new note).

## Gates 1.x — CLOSED (pending the user's verification)

- **1.1 state / 1.2 increments-to-target / 1.4 routes**: fell de facto with phases 3–9
  (registry in $application, surgical repaint proven with the island, outbound + composeInnerRoute).
- **1.3 commands→effects**: COMPLETED with the banners — `@Banner` travels in `Page.metadata.banners`
  ({theme,title,description}); `bannersOf(ctx)` maps them to the starter's `oj-sp-messages-banner`.
  GOTCHAs: the ADP is mutated with `Actions.fireDataProviderEvent` (add/remove with key tracking —
  assigning `.data` does NOT refresh) and the `messageType`s carry the **`general-*`** prefix
  (general-info/success/warning/error — the starter's pattern). Honest PENDING: `RunAction` and
  `DownloadFile` are mapped in the reducer but NOT executed in VB (there is no real fixture of their data
  — capture before implementing, project rule).
- **1.5 URL sync**: Mateu routes as the shell's HASH (#/route — deep-linkable without static
  server support): deep-link at bootstrap (the initial hash wins over the first leaf);
  navigation → pushState (no reload); back/forward → hashchange → onMateuNavigate(fromUrl) —
  the listener is registered in loadMateuShell REUSING the chain's context (VB scopes
  stay alive after vbEnter). **dirtyGuard**: mateuDirty (app var, switched on by the
  value-changed events, switched off by navigation/actions) → confirm on leaving; cancelling restores the URL
  (replaceState — does not fire hashchange). The wire's `PushStateToHistory` → urlPush effect
  (mapped; no demo flow emits it yet).
- **1.6 pageWidth anatomy (VISUAL)**: `pageStyleOf(ctx)` → the container's :style bindings:
  fixed = 1408px centred + 24px (Person measures 1408px), fullWidth = fluid + 24px (no demo
  page), edgeToEdge = 0 (Booking measures padding 0). RDS 24C measurement.
- Tests 21/21. Evidence: `shots/gates-banner.png` (Redwood INFO banner on Hello).

## Redwood headers rule (user feedback, 2026-07-25)

**A page with a Redwood header (wizard/general-overview/welcome) carries NO h1 of its own** — whatever
would have been in the page header is INTEGRATED into the Redwood header (e.g. the page title goes
as the parent-page link of `oj-sp-header-general-overview`, via `translations.goToParent`), and the
header goes FULL-BLEED (no padding above or at the sides): the projections force
`mateuPagePadding='0'` when there is a Redwood header and the content below recovers the gutters
with the system's utility classes (`oj-sm-padding-4x-horizontal`). Zero own CSS.

**Generalisation (feedback, 2026-07-25): EVERY page paints its header with a vb header** —
the h1 was REMOVED from the renderer. Split by page type:

- **Listing (crud)** → `oj-sp-smart-filter-search`: pageTitle + `primaryAction` (first button
  of the wire's toolbar, e.g. New) + `secondaryActions` (the rest, e.g. Delete); the table and
  the search go in its `main` slot (with `oj-sm-padding-4x-horizontal`). Events
  `spPrimaryAction`/`spSecondaryAction` → runMateuAction (the secondary arrives with
  `detail.secondaryItem` = item/label → resolved against the toolbar). `primaryAction` is never
  null: `{label:'', display:'off'}` when there is no toolbar.
- **Generic page (form / text / foldout / item overview / island)** →
  `oj-sp-header-general-overview` WITHOUT switcher (all its props are optional): `page-title` +
  `display-options.go-to-parent="false"` (otherwise it paints the default "Parent page" link).
  Projection `mateuPageHeader = {title}` in both chains; null when the template already integrates its
  header (wizard/overview/welcome/listing) — those suppress the generic one.
- Form/island buttons stay with their content (Mateu's wire does not distinguish
  page toolbar from form buttons in `actionsOf`; the crud's do travel separately).

**Content gutters (2026-07-25)**: the oj-sp headers' internal title indent is
`--oj-core-spacing-12x` (3rem = 48px). The content under a full-bleed header is aligned with the
JET utility class of the SAME scale: `oj-sm-padding-12x-horizontal` (48px) +
`oj-sm-padding-6x-vertical` (24px, the RDS gutter) for breathing room under the decorative
strip. `oj-sp-public-primary-content-container` has NO padding of its own (computes 0), and there is
no public `oj-sp-*` content-padding class — the JET spacing utility classes
(scale 1x=4px, up to 12x) are the official OJET route. Measured empirically
(getComputedStyle on probes): the header's h1 sits 48px from the container's edge; with
12x the form/table line up EXACTLY with the title.

**GOTCHA (2026-07-25)**: the content page's TEXT branch was conditioned on
`!mateuFormMetadata` — on every page without a form (welcome, listing, wizard, overview…)
it painted an EMPTY div which, with the gutters' vertical padding, was a 48px white band
ABOVE the header. Correct condition: `!!mateuHostText` (only when there is real text).
In `/hello` what appears above the page header is not a gap: it is the wire's INFO `@Banner`
(the shell's oj-sp-messages-banner, under the global header — its mount animation covers
the global header for a few ms, transient).

**"Parent page" GOTCHA (2026-07-25)**: oj-sp components with a header stamp the goToParent link
("Parent page") by default. It must be explicitly turned off on EACH one:
`display-options.go-to-parent="false"` on the generic header (`oj-sp-header-general-overview`)
AND ALSO on `oj-sp-foldout-layout`, which internally stamps an `oj-sp-header-navigation`
whose only visible band was that link (its API is not in the CDN loader — read at runtime
via `customElements.get('oj-sp-foldout-layout').metadata.properties`). The foldout DOES count
as a "template with integrated header" (corrected 2026-07-25): its internal `oj-sp-header-navigation`
is a 16px shell that CANNOT be collapsed with any option (tried
goToParent/bidirectionalNavigation/inFlowBack off), so stacking the generic header on top
always left a strip. RDS-faithful resolution: the foldout goes WITHOUT a generic header, edge-to-edge
under the global header, with the title in the overview panel (like RDS's Foldout template);
its internal header carries `display-options.go-to-parent="false"` +
`display-options.background="transparent"` (it stays as 16px of invisible breathing room).

Evidence: `shots/fase4.png` (products), `hdr-person.png`, `hdr-island.png`, `hdr-hello.png`,
`hdr-booking.png`, `hdr-chair.png`, `gap-welcome.png`, `gap-hello.png`, `gap-checkout.png`.

**RDS colour anatomy (2026-07-25)**: WHITE page header ≠ content, and a canvas with
textures around it (reference: the redwood-oj renderer on :8000 and the user's RDS screenshot).
How: (1) the headers carry the JET utility class `oj-bg-neutral-0` (white) —
on the host element, which KEEPS it alongside `oj-complete` (the VComponents do not overwrite it);
the listing's results area recovers its colour with `oj-bg-body` in the main slot.
(2) The surrounding canvas = `resources/css/app.css` (the project's ONLY app css, the
standard VB customisation point): body at `--oj-core-neutral-30` (#F1EFED) + a fixed `body::after`
with the OFFICIAL textures from the gallery on Oracle's CDN
(`static.oracle.com/cdn/fnd/gallery/2604.0.2/images/background-shell-generic-start/end.png`,
the SAME recipe FA paints with: inset 270px 0 0 0, anchored bottom left/right, z-index -1).
(3) The Home icon that `oj-sp-global-header` stamps (no position API) moves all the way to the
right with `order: 99` (it shares a flex container with the end slot). Colours measured from the
utility classes: oj-bg-neutral-0 #FFF · oj-bg-body/neutral-10 #FBF9F8 · neutral-20 #F5F4F2 ·
neutral-30 #F1EFED. **Full-height navigator**: `oj-drawer-layout` does not grow by itself
(flex 0 1 auto → content height, the menu got cut off on short pages) — `style="flex: 1
1 auto"` on the element (pageContent/oj-web-applayout-page is already a 100% flex column), same inline
mechanism as the `min-width:0` of oj-vb-content. **Shell pageLayout**: `oj-sp-simple-ui-shell`
adapts its chrome (chat FAB size, etc.) to `page-layout` (fixedWidth/fullWidth/edgeToEdge)
— it is fed from the wire's `pageWidth` per page (`mateuShellPageLayout`, fixed→fixedWidth)
in both chains; it does not constrain the content (our container still rules the width). **Alignment of the floating chrome (chat FAB)**: the shell positions its FAB
with `right = max(24px, (100vw − 1536px)/2)` over the FULL viewport (ignoring the navigator
drawer), so centring the fixed content in the remaining area misaligned it on wide
viewports. Double fix: (1) `pageStyleOf` anchors the RIGHT edge of the fixed content to the same
formula (`margin: 0 max(24px, calc((100vw - 1536px)/2 + 64px)) 0 auto`, cap 1408 — the FAB
sits exactly where the content ends, as in FA); (2) the `oj-web-applayout-max-width` class
is gone from the starter's wrapper — it capped the area at 1440 and broke
any viewport-relative formula. Verified at 1440/1920/2400; in edgeToEdge the FAB sits
on the page's right edge. **Rule drawer ⇒ edge-to-edge (2026-07-25)**: with a persistent
navigator on the left (HAMBURGUER_MENU) the format switches to edge-to-edge AUTOMATICALLY
(both chains ignore the wire's pageWidth and force edgeToEdge in pageStyle and in the shell's
page-layout): centring a fixed one in the remaining area looked odd — the drawer already
consumes the side. The content gutters are still set by the branches (12x/6x). The
right-edge anchoring to the shell's box (previous paragraph) remains for the variants
WITHOUT a drawer (tabs/topbar).

**Table density (2026-07-25, rule CORRECTED by the user)**: `oj-table` ships both
Redwood formats — `display="list"` (airy) and `display="grid"` (compact, with gridlines).
First rule (by column count, ≥6→grid) DISCARDED: the compact grid is for WORK tables, not
lookup tables — `listingOf` precomputes `display` = grid only when some column
of the wire is `editable` (@InlineEditing), otherwise list. Products (8 columns, not editable) →
list. Verified with `StockCrud` (@InlineEditing, /stock) in demo-vb: its columns travel
`editable` → grid (37px, gridlines), Products stays list (shots/stock-grid.png).

**Cell editing WIRED (2026-07-25, /stock)**: contract CAPTURED (fixtures/real/
update-row.json + load-stock.json, test 23): the wire's columns carry `editable` +
`editorType` (text/integer/number/boolean; @ReadOnly → editable:false), the commit is the
`update-row` action with `parameters._editedRow` = THE WHOLE edited ROW (extras like
_rowNumber do no harm), and the response is ONLY a success toast — no fragments (the value
is already on the client). VB implementation: `listingOf` projects a `template` per column
(cellEditText/Number/Boolean — editorType integer and number share oj-input-number) +
`editable` at listing level; oj-table stamps 3 shared `<template slot>`s with editors
ALWAYS visible (no rowEdit edit-mode: Mateu's commit is PER CELL, not per row);
the listener passes the template's CONTEXT ($current.row/item/columnIndex — row.data or
item.data depending on version) to the `mateuCellEdited` chain, which guards: updatedFrom !== 'internal'
(re-stamp) and unchanged value (no-op) → runMateuAction('update-row'). A row click does NOT
navigate in work tables (guard in mateuRowClicked by listing.editable). The toast became
SINGLE at page level (#mateuToast outside the branches — before it lived in the
form's branch and listing pages did not show it). Verified e2e: text/number/boolean
persist after a hard reload (the switch is operated on its thumb). NOTE ~/.m2 SHARED between clones (opus/k3): if demo-vb stops compiling with
"cannot access io.mateu.uidl..." another clone overwrote the 0.0.1-MATEU jars — reinstall the
backend from this clone (cd backend && mvn clean install -DskipTests).

## Welcome / General Overview / Item Overview archetypes — DONE (pending verification)

- The design thesis is confirmed: all three are COMPOSITION of the core — welcome = HeroSection +
  Buttons + DashboardLayout/DashboardPanel; general overview = FormField switcher (options) +
  EntityHeader {title,subtitle,badges,facts,metric} + Cards; item overview = Card (key info) +
  TabLayout/Tab. Projections `welcomeOf`/`generalOverviewOf`/`itemOverviewOf` (+ `cardOf`,
  `findAllByType`); when there is an archetype, the generic form is suppressed. Tests 22/22; fixtures
  load-welcome/requisitions/chair.
- **Welcome** → `oj-sp-header-welcome-banner` (pageTitle/descriptionText + integrated primaryAction/
  secondaryAction → spPrimary/SecondaryAction → the wire's actions; CTA navigates);
  tiles as `div.oj-panel` (JET system class) + typography.
- **General Overview** → `oj-sp-header-general-overview`: contextualInfo = facts [{label,value}]
  (+ metric as a fact); **the record switcher IS THE TITLE** (`oj-sp-data-switcher` with
  caret — appears when `selectObject.data` is a NON-empty DataProvider; the object is
  composed in a variable referencing another variable — `{"data": "{{ $page.variables.overviewADP }}"}`
  DOES resolve); on-select-object-value-changed → the archetype's `switchRecord` action (empirically:
  reloading with the state also works). Probe GOTCHA: the facts go in a conveyor-belt and
  `innerText` does not report them (use textContent).
- **Item Overview** → `oj-panel` with the key data + classic `oj-tab-bar` (ul/li +
  refresh() after stamping, same gotcha as navigation-list); client-side tab selection
  (the tabs travel whole in the tree).
- Evidence: `shots/arch-welcome.png`, `arch-overview.png`, `arch-overview-switched.png`,
  `arch-item.png`.

## TaskQueue — the front-office listings (2026-07-25)

The check-in/check-out/at-home "listings" ARE `TaskQueue`: INLINE data in the metadata
(`groups[].label` + `items[]{id,title,caption,badges[{label,color}],selected}`), with no data axis
or triggers. Click contract (= the web renderer's mateu-task-queue.ts): `metadata.actionId`
(openGuest) with `parameters._item` = the item's id; the server RE-RENDERS the host (Replace to
the ServerSide's uuid) with the `selected` card and the EmptyState placeholder replaced by the
DETAIL. Projections `taskQueueOf` (badges → JET oj-badge-*-subtle badge classes, cardClass
selected → oj-bg-neutral-20, EVERYTHING precomputed for the CSP) and `emptyStateOf` (placeholder /
welcome page). VB: `oj-action-card` cards (JET core, ojs/ojactioncard — fires
ojAction on click) grouped under `oj-typography-subheading-xs`, right panel
`oj-sp-empty-state`. RECURRING GOTCHA: make-amd.mjs carries an EXPLICIT exports LIST — every new
projection must be added there or the AMD bridge does not expose it ("is not a function").
Fixtures fo-load-checkin + fo-open-guest; test 24. Shots fo-checkin/checkout/encasa(+sel).

**NEXT (detected, not done)**: the detail after openGuest is a MEDIATOR-ISLAND of the App
flavour — a ClientSide `App` node variant=MEDIATOR with a stable id (`island_checkin_st_maria`)
and homeRoute (`/checkin/st-maria?_embeddedMediator=1`) + homeConsumedRoute + homeServerSideType
in its OWN metadata (collectIslands does NOT detect it: it looks for ServerSide boundaries). Its content
is the embedded CheckInWizard (wizardOf already projects it: Identity/Room/Extras/Confirm,
actions selectPax/back/next) with display types still without a branch: EntityHeader, Notice,
BulletedList, Card, Separator, ProgressSteps, Div.

## TaskQueue detail — the embedded wizard-island PAINTS (2026-07-25)

`collectIslands` now ALSO detects the App-mediator flavour (ClientSide `App` node
variant=MEDIATOR with a stable id; route/consumedRoute/serverSideType come from its OWN
home* metadata) and both chains load the island when it appears (runMateuAction loads it if its
context does not exist yet — before, only onMateuNavigate loaded islands). The content is projected
with `islandContentOf(ctx)` — a GENERIC display projection: BLOCKS (plain|card→oj-panel) of
atoms precomputed for the CSP (is* flags): Text (sizes→oj-typography-*, with
`interpolate()` of ${state.x} against the island's state), ProgressSteps→oj-train (JET core),
EntityHeader (title+badges+subtitle+facts), Notice (oj-panel + oj-bg-{success|warning|
danger|info}-30, with its nested Buttons e.g. selectPax with parameters), BulletedList,
Separator (gap), Buttons (Back/Next → runMateuIslandAction, which now accepts parameters).
Tree GOTCHA: children travel in `children` AND/OR in `metadata.content` (CustomField,
Notice, Card) — the walker descends both. The old form-island branch remains for
islands WITHOUT display content (GuestNote). oj-sp-in-app-navigation GOTCHA: the component
stamps its REAL bar as a fixed overlay at the bottom, but its HOST element reserves 64px in flow
wherever it is — it must go at the END of pageContent (if it goes at the top it leaves an empty band under
the header AND the content's background is covered by the bar and can't be clicked).
Verified e2e against :8594: click guest → detail (EntityHeader+Notice pax+Preferences),
selectPax re-renders, Next advances to the Room step. PENDING flagged: atoms
ResourceGrid/AddOnPicker/Ledger/PaymentPicker/StatusList/Meter/TaskProgress (steps 2-4 and
check-out) and NESTED islands (App inside the island, e.g. the document — the walker
skips them). Fixture fo-island-wizard, test 25. Shots fo-checkin-sel/fo-checkin-step2.

## Front-office business atoms — COMPLETE (2026-07-25)

`islandContentOf` now projects the 9 remaining display types (shapes captured from the real
wire; dispatch contracts = those of the shared web renderer): **Badge** (chips →
oj-badge), **ResourceGrid** (room grid → oj-action-card tiles in oj-flex,
columns→oj-sm-N, disabled→oj-panel with oj-text-color-disabled, selected→oj-bg-neutral-20;
click → actionId + {_item}), **OfferCard** (oj-panel with tag/title/features·joined/
currentLabel/priceLabel + CTA), **AddOnPicker** (rows with oj-switch; the `addonToggled`
chain computes the client TOTAL after the toggle and dispatches actionId +
{_item,_added,_total}), **StatusList** (rows with oj-avatar initials + coloured status
oj-text-color-*), **Ledger** (concept/amount rows, included→includedLabel, negatives→
green, total in subheading; currency formatted de-DE like the web renderer), **PaymentPicker**
(methods → buttons, selected callToAction, click → methodActionId + {_method}; Confirm →
actionId + {_method: selected}), **Meter** (JET core oj-progress-bar ojs/ojprogress +
label/values/caption), **Stat** (label + value in heading). Fixtures fo-island-step-last /
fo-island-checkout / fo-island-encasa; test 26 (26/26). Verified e2e: full wizard
(room with grid+upgrade, extras with switches), the check-out folio with total and payment
methods, at-home balance/stays. Shots fo-checkin-step2/step3, fo-checkout-sel,
fo-encasa-sel.

## NESTED island + SSE — the check-in document WORKS (2026-07-25)

The App-mediator INSIDE the island (DocumentoView, 3 states) paints and operates. Pieces and
gotchas (all bitten today):

- **Seed**: the nested App node carries `initialData` ({stayId, paxIndex, _embeddedMediator,
  _inline…}) — it must travel as `componentState` on LOAD and on EVERY ACTION (the server
  does NOT echo it in its responses; without it the actions answer the empty view in a loop).
  `collectIslands` captures it; `runMateuNestedAction` always merges it (seed + state).
- **sse flag**: the component's ACTIONS (with `sse:true` — scan) travel ONLY in the mediator's
  WRAPPER (1st request of the 2-step dance); the consumedRoute+serverSideType shortcut
  skips them → the nested one is loaded WITHOUT the shortcut and `loadRouteInto` stamps
  `sseActionIds` on the context.
- **SSE transport** (`runMateuActionSse`): POST `{base}/mateu/v3/sse/{route}` with Accept
  text/event-stream, SAME body; response = stream `data:<UIIncrement>\n\n` (= the web renderer's
  SSEService). MVP: read in full and the increments reduced in order (no live progress
  dialog). The scan's LongTask (~2s of Flux) arrives this way; the last
  increment carries the `dispatchEvent(documento-escaneado)`.
- **Events**: the chain accumulates the events of ALL reductions and fires the subscribed
  OnCustomEvent triggers in nested→island→host (reloadDocumento answers a route-flip →
  `maybeFlip` reloads the inner route; the wizard's band switches to "documentation complete").
- **Definitive CSP GOTCHA (2 failed attempts)**: reading `$application.variables.X` as the
  data of an oj-bind-for-each INSIDE nested templates does NOT re-bind the inner
  contexts ($current points to the outer scope; the `as=` alias neither) — the data must
  flow through `$current`: `mergeNestedContent` MERGES the nested one's atoms into the
  mother island's isNestedBlock block, marked `fromNested` (buttons included), and
  `dispatchIslandAction` routes by that flag to runMateuIslandAction/runMateuNestedAction.
- The document's states 2/3 are `@Section(propertyList)` → atom `isPropertyRow`
  (FormField with propertyRow=true, interpolated state value).
- NOTE on the DEMO's state: María's document was left scanned by the probes (in-memory);
  James/Klaus start pristine after restarting :8594.

Fixtures fo-nested-doc (seeded) + test 27 (27/27). Shots fo-nested-doc*.png.

## RDS header band (feedback 2026-07-26)

In fixed/fullWidth, Redwood paints the header over a full-bleed BAND (white in light mode,
black in inverted) that also PEEKS out from behind the start of the content — the header is not
"boxed in" like the card. VB/oj-sp does NOT provide it under this runtime (tested:
with the container uncapped, the header takes the full width but its title sits at 48px — it does not
consume the shell's pageLayout to cap its interior). Own composition with system classes: band = div
`oj-bg-neutral-30` + `oj-sm-padding-10x-bottom` (40px) full-bleed — the SAME colour the header's interior
paints (`oj-sp-header-general-overview-bg-light` =
#F1EFED, corrected 2026-07-26: with white it left a grey box inside a white band), which
CONTAINS the header (title + strip) capped to the content's box (mateuBandBoxMargin =
the pageStyle's horizontal formula); the card overlaps the band with a -40px top margin
(injected into mateuPageMargin when showBand = pageHeader && pw !== edgeToEdge). The strip
stays at the CARD's width (it is inside the capped header) and the white band peeks out 40px
at the sides under it = the anatomy of the user's RDS screenshots. In edge-to-edge
(drawer nav) there is no band: the generic header is painted inline as before
(mateuPageHeaderInline). Shots rv-banda.png.

On "consuming the shell's pageLayout" instead of our own formula: we are already the SAME
source — the shell receives its page-layout from our variable (mateuShellPageLayout, derived
from pw), and band/box derive from the same pw. "Real" consumption is not possible from
plain VB markup: the oj-sp components consume it through the VComponents' provide/inject
(__oj_provided_contexts), internal to their tree — and it is also verified that under this
runtime they do not even use it to cap their interior. A single source of truth (pw in the
chain) + the RDS formula is the practical equivalent.

## Reservation 360 — user flow rethought (2026-07-26)

A reservation's detail is ONE screen (`/reserva/:id`, ReservaOverview) for the three
states, and tasks are launched from its toolbar (the FA pattern: record overview +
guided process as a task):

- Common content: guest header (GuestHeaders per state), Summary (property list with
  the status "Arrives/Leaves/Left…"), guests with their document status (StatusList).
- Per state: arrival → notices of what is missing (documentation / room) + toolbar
  "Start check-in"; in house → balance Meter + open incidents + toolbar
  Check-out/charge/message; departure → "folio closed" Notice + Ledger + "View folio".
- ToolbarSupplier (static @Toolbar cannot vary by state) + ActionHandler
  returning URI (navigations) or Message.
- The listing ALWAYS navigates to /reserva/:id (per-state routing is gone).
- **"Only what's missing" wizard**: CheckInWizard.stepApplies — identity only if
  paxPendientes>0; room only if the assigned one is not INSPECTED. María (all ready) →
  2-step wizard (Extras→Confirm); James (no doc) → Identity→Extras→Confirm.
- hostContentOf now ALWAYS filters the Page title (the header band already paints it;
  before, only in wizard mode).

Verified e2e per state + shots ro-*.png.

**Closed (same day)**: (1) the wizard RETURNS to the 360 on completion — the
@WizardCompletionAction dispatcher returns the method's result if it is not null, so
confirmarCheckin returns URI /reserva/:id (and the 360 now shows in house); (2) CORE FIX:
Wizard.component() advances position to the FIRST applicable step (it always started at 0 and
showed the identity content even though the rail said Extras→Confirm; navigation already
skipped, the initial position did not) — 32 core Wizard* tests green. PENDING: fold
/encasa and /checkout into the 360 if desired.

## The screen header IS the reservation's (2026-07-26)

In the 360, the generic band header no longer says "Reservation": `entityHeaderOf(host)`
projects the content's EntityHeader to the screen header — pageTitle = the guest,
pageSubtitle = subtitle + badges concatenated, facts (+metric) → contextualInfo (with
`display-options.contextual-info-label=true`, which hides the labels by default) —
and hostContentOf filters it out of the content (dropEntityHeader; the wizard's/islands' is kept).
The header ends up with the full RDS object-header grammar: guest + subtitle +
BALANCE/PRE-AUTHORISED/LOYALTY + actions on the right.

## Toolbar actions in the band HEADER (2026-07-26)

The Page's toolbar (ToolbarSupplier/@Toolbar) is NO LONGER painted in the content: it is
projected to the generic band header's actions — `pageToolbarOf(ctx)` reads
Page.metadata.toolbar; the buttonStyle=primary button goes to `primaryAction` and the rest to
`secondaryActions` of the oj-sp-header-general-overview (same pattern as the collection
header; spSecondaryAction resolves by label via headerSecondaryAction). The toolbar atom in
islandContentOf is marked `fromPageToolbar` and hostContentOf filters it (ISLANDS
keep it: they have no header). The 360 thus shows "Start check-in" /
"Check-out"+"Message guest" / "Back to the reservation" at the top right, like the RDS
grammar of the screenshots.

## Band also for the collection header (smart search, 2026-07-26)

The listing did not have the band behind the header (the WHOLE oj-sp-smart-filter-search lived
inside the capped box). Same anatomy as the generic header: the component is split —
the header (title+search+actions+strip) goes in the full-bleed BAND capped to the box
(flag mateuPageHeader.showListBand, pw != edgeToEdge; inline in edge) and the TABLE lives in the
container's card (which overlaps -40px). GOTCHA: the component reserves its content region at
VIEWPORT HEIGHT even if the main slot is empty (chained internal min-height)
— app.css hides its internal `.oj-sp-public-primary-content-container` in the
header-only copies (#mateuListHeader/#mateuListHeaderInline). Overlap 40, strip at box width,
9 visible rows, search and row click intact.

## /encasa and /checkout FOLDED into the Reservation 360 (2026-07-26)

The EnCasaDetail/CheckOutDetail pages (and the three dead queues) are REMOVED: the 360 is
the single reservation screen. Check-out is a MODE of the 360 (`modoCheckout`, @Hidden):
the Check-out toolbar activates it (in-place re-render, no navigation) and these appear: Folio
breakdown (Ledger), Post charge (fluid FormField cargoBusqueda + @AutoSave buscarCargos +
results as a StatusList with rowActionId seleccionarCargo) and Payment (PaymentPicker →
confirmPayment closes the stay → DEPARTED + banner). "Back to the reservation" turns the
mode off. The mode's @Section are frameless with DISTINCT blank value ("  ", "   "…) and their
Callables return an empty VerticalLayout outside the mode (a titled section would always paint the
empty card). Renderer: atom `isInput` (fluid FormField string/integer editable →
oj-input-text bound by fieldId; hostInputChanged → draft + runMateuAction(buscarCargos),
the value-changed on blur/Enter acts as the debounce) and StatusList rows with `rowClickable`
(rowActionId without actionLabel = the whole row is an oj-action-card that dispatches {_item} —
the web renderer's contract). The StatusList markup was REGENERATED by regex in the 6 copies
(incremental chopping became fragile — TODO: generate the atom templates from a single
source).

## Standalone wizard: sticky footer vs tab bar + real forward (2026-07-26)

- The guided process's footer (Continue/Back) is `position: sticky; bottom: 0` — with the bottom
  tab bar (fixed, 64px) it was COVERED and unreachable. Self-conditioned rule in
  app.css: `body:has(.oj-applayout-fixed-bottom) .oj-sp-guided-process-step-details-footer
  { bottom: 64px }` — only acts when the bar exists (shells with a drawer are
  unaffected).
- The wizard's FORWARD action was chosen as the "first non-back action" — in rich wizards
  (check-in) the first is selectPax and Continue fired that. New projection
  `wizardForwardOf(ctx)`: derives the forward from the tree's REAL FOOTER (the button
  block that accompanies 'back'), falling back to the old criterion.
- Steps with RICH blocks additionally suppress the step's generic form
  (mateuFormFieldsList = []) — on Confirm the guest/room/stay/regime fields
  leaked in as inputs after the button, duplicating the header and the Summary (property rows).

## VB GOTCHA: projection variables — neither null nor a shape change (2026-07-26)

Two silent crashes with the same pattern (they broke onMateuNavigate HALFWAY: the URL was not
updated when navigating by tabs and the row click "did nothing" on returning to the listing):

1. **"Cannot assign non-array to an array property"** — an `any` variable to which an ARRAY is
   once assigned stays typed as an array by VB: assigning null to it afterwards BLOWS UP the
   assignment (and the whole chain). Every list projection (mateuHostContent,
   mateuWizardContent) is declared `any[]` with default `[]` and NEVER assigned null (`|| []`);
   the bind-ifs condition on `.length` (CSP-safe: 0 is falsy).
2. **"Cannot read properties of null (reading 'title')"** — assigning null to a variable
   whose INNER binding (`mateuPageHeader.title`) is re-evaluated BEFORE the outer bind-if
   collapses. Object projections are ALWAYS assigned as an object with precomputed flags
   (`mateuPageHeader = {title, showBand, showInline}`) and the bind-ifs read the
   flags. (Mind the TDZ: a chain's consts are read in order — pwAfter was moved up.)

## Reservations v2: crud listing + standalone detail pages (2026-07-26)

User rethink: /reservas goes from master-detail to a simple LISTING (a crud)
that opens each reservation as a separate PAGE according to its state. Pieces:

- **Backend**: `ReservasListing extends Listing<Filtros,Reserva>` — columns
  id/guest/room/nights/status/tier; `handleAction("view")` (the VB renderer's row click
  posts view with the row as parameters) returns a URI by state →
  /checkin/:id | /encasa/:id | /checkout/:id. The 360 toolbar's Check-out NAVIGATES
  (URI) — the bus is gone. ReservasQueue removed.
- **vb's Smart Search (feedback)**: the search lives IN THE HEADER — the oj-sp-smart-filter-search's
  `smartFilters` property (it has NO search slot: only main/dashboard;
  the slot stayed in oj-subtree-hidden). Contract captured live: config
  {askHint, value:[]}; Enter adds {filter:'keyword', label, value} to value and fires
  smartFiltersChanged (removing the chip deletes it) → the chain concatenates keywords → search.
- **Standalone detail pages**: projection `hostContentOf(host, islandRawBlocks,
  {forWizard})` — islandContentOf's blocks at HOST level, with the host's FIRST island
  (document) merged fromNested (dispatches to runMateuIslandAction via
  dispatchHostBlockAction; the rest against the host). RULE: the blocks RULE when they are
  RICH (EntityHeader/Meter/Ledger/StatusList/…) — the generic form and the text are suppressed
  (the 360 also has FormFields and was painting raw fields). In wizard mode the blocks go
  INSIDE the guided process's panel, filtering title/ProgressSteps/back-next (the guided
  process itself supplies them). Host listeners: hostBlockAction / hostPaymentConfirm /
  hostAddonToggled.
- **Archetype GOTCHA**: `generalOverviewOf` matched ANY page with an EntityHeader
  (the 360 was painted as an overview with a switcher) — it now REQUIRES the record switcher.
- **SSE in islands**: runMateuIslandAction routes by sseActionIds (the document also scans
  standalone); the host's island loads go WITHOUT the shortcut (2-step dance) in order
  to capture the wrapper's sse flag.

Verified e2e: listing → click Carlos → /encasa/st-carlos (full toolbar, Meter,
StatusList) → toolbar Check-out → /checkout/st-carlos (folio + methods); click María →
/checkin/st-maria (standalone guided process); search "sale hoy" → chip + 2 rows.
Shots rv-*.png.

## Unified reservations (evolution, 2026-07-26)

The Check-In/Check-Out/At Home menus are UNIFIED into `/reservas` (ReservasQueue, evolution):
one search box + one TaskQueue with ALL stays and the STATE per line — "Arrives
today/tomorrow/<date>" (ARRIVING, amber if today), "Leaves today/tomorrow/<date>" (IN_HOUSE, amber if
today / green if not), "Left <date>" (DEPARTED, neutral). Clicking opens the island according to state
(check-in wizard / at-home 360 / check-out folio); `forzarCheckout` (a line option or toolbar
event) forces the folio for in-house stays. New pieces:

- **Framework**: `QueueItem` + `actionLabel`/`actionId` (a card's LINE option; a button
  that dispatches its actionId with {_item} — QueueItemDto + TaskQueueMapper + mateu-task-queue.ts
  with stopPropagation; the .NET/Python ports NOT touched yet). The VB renderer projects it
  (hasAction/parameters) and paints an oj-button inside the oj-action-card — the button's click
  ALSO fires the card's ojAction: temporal guard window.__mateuQueueRowActionAt
  (<800ms → echo, queueItemClicked ignores it).
- **Island toolbar**: islandContentOf projects the island's Page (title +
  metadata.toolbar → atom isButtons); the 360's "Check-out" emits
  `UICommand.dispatchEvent("checkout-solicitado", {_item})` and the HOST (ReservasQueue
  @SubscribeTo) receives it: runMateuIslandAction now processes bus EVENTS →
  host triggers → full re-projection with possible REPLACEMENT of the island (at home →
  folio).
- Seeder: klaus arrives tomorrow; new noah (arrives +3) and oliver (DEPARTED yesterday, with a folio).

Verified e2e (5 flows): arrives→wizard, leaves→360 (Check-out toolbar visible),
toolbar→folio, line→folio, left→folio. Shots rv-*.png.

## Backend switched to demo-front-office (2026-07-25)

**Navigation variant (project rule, corrected by the user)**: the renderer
OBEYS the wire's variant — no client overrides. For the in-app navigation pattern
(the tab bar at the BOTTOM, oj-sp-in-app-navigation — ubiquitous in Oracle apps) the APP must
emit TABS: in demo-front-office it was enough to REMOVE the explicit `value = MENU_ON_TOP` from `@App`
(it became `@App(themeToggle = true)`) — the AUTO heuristic gives TABS because its menu is
flat RouteLinks (`hasMenuItems` only counts `Menu` groups). Evidence: shots/fo-tabs.png.


`constants.mateuBaseUrl` → `http://localhost:8595` = **demo-front-office-evolution**, the
working COPY created 2026-07-26 (user decision: the original demo-front-office
:8594 stays as an untouchable shared instance; the front-office's evolution is done in
demo/demo-front-office-evolution, registered in the demo/pom.xml aggregator). SINGLE point of
change in app-flow.json; demo-vb stays on :9005 to go back. First contact: the shell BOOTS completely (MENU_ON_TOP menu with
Check-In/Check-Out/At Home/Automations, @AppContext selectors Mode+Hotel, page header with strip, the
check-in's search field). GAP identified in /checkin (wire types): TaskQueue (the arrivals queue — the
front-office's central component) and EmptyState
have no projection/branch yet; CustomField wraps islands. Obvious next work:
TaskQueue projection + branch (cards grouped with counters, click → action with _item).

## Next step on resuming
2. **Phases 1.x** (MECHANISM gates in the VB runtime, before Phase 2): 1.1 state (variables +
   two-way round-trip), 1.2 applying increments to the target (surgical re-render by id, islands), 1.3
   UI commands → effects, 1.4 route resolution (4 outgoing route fields + composition), 1.5 URL sync (PushStateToHistory + deep-link + back/forward + dirtyGuard), and 1.6 (VISUAL) styles around the
   content = the three `pageWidth` modes (fixed/fullWidth/edgeToEdge) faithful to the RDS 24C measurement.
3. Pending to capture when the time comes: foldout/item-overview (P7+, add screens to demo-vb),
   a real `PushStateToHistory` (crud navigation without a drawer) and the SSE/LongTask spike in hosted VB.

## Check-in operations checklist — phase 1 (2026-07-26)

The Reservation 360 in the to-arrive state shows the check-in OPERATIONS (documents,
room, wifi, key, signature, payment, ancillaries) as an executable checklist, and the wizard
asks for ONLY the pending ones.

- **Domain (evolution)**: `CheckInOps` (flags wifi/key/signature/payment/extras, withers) +
  in-memory `CheckInOpsRepository` per stayId (accessor `FrontOffice.checkInOps()`).
  Documents and room are DERIVED (paxPendientes / housekeeping INSPECTED), not
  stored. Both screens write: the 360 (quick actions `opWifi`/`opLlave`) and the
  wizard (llaveGrabada/firmaCapturada/preautorizado persist their flag; confirmarCheckin
  closes `extras`) — so checklist and branching always match.
- **360** (`ReservaOverview.paraLlegada`): `TaskProgress` banner ("Check-in operations
  · N of 7", no CTA — the header already carries "Confirm check-in", renamed from "Start")
  + `StatusList` with an avatar-emoji per operation, pending/done description, chip
  Pending/✓ Done and a quick-action button only on the pending ones that are resolved in
  situ (wifi "Create", key "Record"); "Complete" on documents opens the wizard. The wizard
  seeds the Confirm step from the ops (key→recorded, signature→signed, payment→
  pre-authorised) and `stepApplies("extras")` looks at `ops.extras()`.
- **Bridge**: atom `isTaskProgress` in `islandContentOf` (everything precomputed: valueText
  "N of M", panelClass neutral→success on completion, button hidden if complete — the
  TaskProgress component's contract); added to the RICH-blocks rule in BOTH chains
  (shell onMateuNavigate + runMateuAction). Markup: new block in the 6 atom copies
  (inserted by script before each `isMeter`, listener resolved per copy: 4×
  hostBlockAction, 2× islandBlockAction) — oj-panel + oj-progress-bar, JET utilities only.
  Real fixture `fo-reserva-arriving.json` (captured with transport.loadRouteInto against
  :8595) + test 28. 28/28.
- **Serving GOTCHA**: `grunt vb-serve` serves from `build/optimized` (versioned paths
  `version_<ts>/...`) — markup/bridge changes do NOT arrive until `npx grunt vb-build` +
  restarting the serve. The symptom is subtle: the new atoms do not paint but the rest
  works (the old templates keep being served). Verify with
  `curl :9006/version_*/flows/main/pages/main-start-page.html | grep <new atom>`.
- Verified live (st-klaus, 4 pax): banner 1→2→3 of 7 with the quick actions (wifi toast
  with credentials, key recorded), and "Confirm check-in" opens the wizard with steps
  Identity/Extras/Confirm — Room OMITTED (already inspected). Shots:
  ops-checklist.png, ops-checklist-llave.png, ops-wizard.png.
- **3-column checklist (2026-07-26, user feedback)**: `StatusList` gained
  `columns` (uidl record + StatusListDto + StatusListMapper + web mateu-status-list with
  an auto-fit grid; 0 = classic list). In the bridge, `columns>1` projects `wrapClass:
  'oj-flex'` on the atom and each item as a CELL (`gridCell` + `cellClass: oj-flex-item
  oj-sm-12 oj-md-(12/N)`) with its own branch in the markup (title+chip / description / button
  stacked vertically — a ROW squeezed to a third splits its content wherever it falls and ends up
  untidy); the 6 copies carry the cell branch before the row branch (guard
  `!gridCell`). The 360 uses `.columns(3)` → the 7 operations fit without scrolling. NOTE: build
  order of the shared modules: install via the reactor (`mvn -pl shared/dtos,shared/uidl,
  shared/core` from backend/) — uidl alone against a stale dtos in ~/.m2 breaks
  enforcer/convergence.
- **Zones in the host's content (2026-07-26, user idea: "guests on the
  left, cards on the right")**: the 360 uses `@Zones` (huespedes 36% / operativa
  64%; the zoneless header stays as a top band). Projection: `islandContentOf`
  detects the ZONED ROW (HorizontalLayout of columns `flex: 1 1 calc(NN%…)`, root level
  only) and turns each zone into a column-block with `colClass` in twelfths
  (36→oj-md-4, 64→oj-md-8, oj-sm-12 on small); if a zone generates SEVERAL blocks they are
  merged into one (an oj-flex does not stack two items in the same cell — happens in checkout
  mode: folio+charges+payment, all frameless). `hostContentOf` stamps `blockClass`
  on all of them (non-zoned → oj-sm-12) and the mateuHostContent loop wraps the blocks in
  an `oj-flex` with a div per block bound to blockClass (only the HOST's loop — wizard
  and island unchanged). The operations checklist moves to `.columns(2)` (the 64% lane)
  and the guests go back to a 1-column list in their card. Result: EVERYTHING visible without
  scrolling on arrival, in-house and checkout. Tests 28 (md-6) and 29 (zones md-4/md-8). 29/29.
- **Phase 2 — room mode (2026-07-26)**: the Room card carries "Change"
  ALWAYS (even when done — upgrades) → `modoHabitacion` paints in the operations lane the
  floor-12 ResourceGrid (HabitacionStep's helpers made public and reused) +
  the current/upgrade OfferCards; `elegirHabitacion`/{_item} assigns the REAL room
  (stay.assignRoom + inventory type) and `upgrade360` assigns suite 1401 (seeded
  as an assignable room); both return to the checklist with a toast, and the operation's
  state is re-derived from the new room's housekeeping (changing to an uninspected one
  sends it back to Pending). Mode toolbar: "Back to the reservation". No renderer
  changes (ResourceGrid/OfferCard already projected on the host).
- **Menu icons (2026-07-26)**: `Actionable.icon()` (default null) + `icon` field on
  `RouteLink` (uidl) → `AppMenuDtoBuilder.icon(option.icon())` → `MenuOptionDto.icon` (already
  existed on the wire). Convention: NEUTRAL names from the Vaadin set ("vaadin:calendar-user");
  each renderer translates to its own — the bridge with `ojIconOf` (OJ_ICONS dictionary →
  oj-ux-ico-* of the CDN's gallery bundle, ~3,400 classes; whatever already arrives as
  oj-ux-* passes as is, untranslatable → no icon). `oj-sp-in-app-navigation` accepts `icon` per item and
  paints it. Demo: Reservations → calendar-contact, Automations → task.
- **Per-pax registration in the 360 (2026-07-26, user request)**: each guest can
  start the document SCAN or MANUAL FILL-IN from the 360 itself. The wizard's
  `DocumentoView` island is also embedded in the 360 (band under the two zones,
  frameless section " " + @Inline; onHydrated seeds it with stayId+paxSeleccionado);
  the guest rows carry numeric pax ids, clickable row + "Register" button
  (pending ones) → `seleccionarPax` re-seeds the island, and the host refreshes with the event
  `documento-escaneado` (@SubscribeTo → refrescarReserva), which now ALSO emits the manual
  save (override of the "save" case in DocumentoView adding the dispatchEvent to the super's
  result). The empty state offers "Fill in manually" (Button → EditableView's standard "edit");
  the editor switches to EDITABLE document/name and `save()` registers the whole pax
  (`Pax.register` + `Companion.rename`) or updates contact if already registered.
  **VB runtime fixes that made it work**: (1) reload of the level-1 island
  when its SEED changes (mateuIslandSeed in app-flow + compare in runMateuAction /
  onMateuNavigate / runMateuIslandAction — the mechanism the nested one already had);
  (2) the seed travels on EVERY island action and on the route-flip reload (the state's nulls
  do not overwrite the seed) — without this `edit`/`save` arrived with stayId null and the save was
  a silent no-op; (3) fromNested inputs go to the ISLAND's draft and do not re-trigger the
  host's auto-save (hostInputChanged + listener with fromNested); (4) the merged island's
  Page toolbar (the editor's Cancel/Save) is NOT filtered out as the host's toolbar
  (fromPageToolbar && !fromNested); (5) the host's re-projection after island actions
  passes the SAME opts as runMateuAction (title + dropEntityHeader) — without them the title
  and the EntityHeader reappeared duplicated in the content; (6) block hoisting/merge
  preserve the block's props (colClass/blockClass survive the merge).
- **Phase 3 — payment, ancillaries and signature (2026-07-26)**: three more cards become executable.
  "Charge" → payment mode (PaymentPicker card/cash/tier-Points with RESERVATION TOTAL;
  confirming marks `ops.cobro` with a per-method toast). "Choose" (ancillaries) → extras mode
  (AddOnPicker of the catalogue with added from stay.addOns; each toggle persists
  addAddOn/removeAddOn; "Close selection" marks `ops.extras`). "Send to tablet" (signature) →
  FIRST SSE ACTION OF THE HOST: `ActionSupplier.actions()` in the 360 declares opFirma
  sse(true) (keeping the "*" wildcard), the flux emits "sent to tablet" and after 5 s
  dispatchEvent(firma-capturada-360) → @SubscribeTo → opFirmaDone marks `ops.firma`.
  **VB runtime**: `runMateuAction` now consults `host.sseActionIds` (loadRouteInto already
  stamped them on the host too: the root tree carries the actions with their sse flag) and goes through
  runMateuActionSse applying ALL increments with events/toasts ACCUMULATED (each
  reduce replaces effects); host triggers receive the event's detail as
  parameters. GOTCHA caught: `[] || x` — an EMPTY mateuWizardContent is truthy and
  hostAddonToggled looked for the picker in it (the 360's toggles did not dispatch); choose
  by length.
- **PER-PAX actions in the guest rows (2026-07-26, user feedback: "they are
  actions on each pax… they come out misplaced")**: `StatusItem` gained a SECOND action
  (actionLabel2/actionId2, uidl+dto+mapper+web with two buttons). Each pending pax carries
  "Scan" (→ `escanearPax`, host SSE: toast "Scanning…", 2 s, `Paxes.scan` and
  documento-escaneado event → refresh) and "Manual" (→ pax mode in the operations lane:
  document/name/email/phone form bound to the host's draft + "Save cardex" →
  `Paxes.register`). The per-pax logic lives in `ui/common/Paxes` (conceptually shared
  with the wizard's island, which STAYS in the wizard — the 360 no longer embeds DocumentoView).
  **Bridge**: StatusList items project `actions[]` (+hasActions) and a row WITH
  actions is painted STACKED (title+badge / description / buttons) — the inline row
  looked misplaced in the 36% lane; the grid cards iterate `actions` (allows two
  buttons per operation). Templates: stacked branch ×6 + actions for-each ×6.
- **LongTask progress dialog + drawer with display blocks (2026-07-27)**: (1) the
  room drawer recovers the CARDS (ResourceGrid + OfferCards): `overlayOf` projects
  `content` (islandContentOf over the Drawer's tree) and the drawer panel paints the
  blocks with a copy of the atoms template (hostBlockAction listener — the drawer's actions
  post against the host with the overlay's state). (2) `escanearPax` and `opFirma`
  go back to `LongTask` (real progress bar) and the VB renderer finally paints the DIALOG:
  `runMateuActionSse` STREAMS (incremental reader + async `extra.onIncrement`; true =
  increment consumed, excluded from the return), `longTaskWatcher()` (bridge) consumes the
  Dialog-with-ProgressBar Add and the state-only ones to its id returning {open|progress, title,
  text, value, rest} — `rest` carries the last increment's commands/messages (the refresh's
  dispatchEvent) WITHOUT the dialog's fragment; both SSE chains
  (runMateuAction + runMateuIslandAction) open/update/close `#mateuProgressDialog`
  (oj-dialog + oj-c-progress-bar) and reduce only the rests → on close, the event refreshes
  the foldout in place. Fixture `fo-sse-scan-stream.json` + test 30. 30/30.
- **JET GOTCHA**: `oj-progress-bar` (legacy, import ojs/ojprogress from the page json) does NOT
  register at runtime (JET version mismatch with the CDN) — the Meter bars were
  always invisible; ALL bars migrated to `oj-c-progress-bar` (core pack, already
  loaded). (2nd merge gotcha: `foldoutOf` lost the `panel.width` projection
  on merging — the foldout's panels were sharing space on their own and the cockpit's cards
  overlapped; width + headerTitle restored in the projection.)
- **Guest actions as ICONS + width split (2026-07-27, user
  feedback)**: `StatusItem` gains `actionIcon/actionIcon2/actionIcon3` (uidl+dto+mapper+TS;
  NEUTRAL names from the Vaadin set — the demo uses vaadin:barcode/pencil/ban/rotate-left);
  the bridge translates them with `ojIconOf` (OJ_ICONS += scan-barcode/edit/do-not-enter/undo) and
  row actions with `iconClass` are painted as `oj-button display="icons"
  chroming="borderless"` with the label as tooltip/aria (icon branch + text branch at the 18
  action-button sites). Merge GOTCHA no. 3 caught: the bridge had LOST the
  third row action (actionLabel3 — "No show" had been missing since the merge);
  restored together with the icons. Foldout widths: Operations 46→50rem (cockpit cells
  20→22rem in app.css) and Profile 17→14rem.
- **Guest cards: h3 without avatar + more air (2026-07-27, user feedback)**: the
  bridge's `asCards` rule (any list with actions → cards) was OVERRIDING the markup's stacked
  branch that already painted the requested design — name as h3 (the level after the
  h2 of the foldout section), no avatar, .mateu-list-item rhythm. Now ONLY columns>1
  forces cards; a one-column list with actions goes through the stacked branch.
  `.mateu-list-item` goes from 28 to 40px of separation between passengers.
- **Operations as h3 cards + counter in the panel title (2026-07-27)**: the
  cockpit's cells lose the avatar tile and the title becomes h3 (same card as the
  guests); the "N of 7" leaves the body and is COMPOSED into the panel's title
  (`headerLabel` in foldoutOf = title · subtitle, bound in panel-title to the live
  indexed CONTENT — it refreshes without re-stamping; the body's subtitle block is removed).
  Merge GOTCHA no. 4: the fixed grid's classes (.mateu-grid/.mateu-grid-cell, 22rem cells
  with their own gap) were no longer stamped by the bridge either — restored in
  wrapClass/cellClass for columns>1.
- **Icons on operations + content headings (2026-07-27)**: the 6 operations carry an
  icon with a tooltip (Op.actionIcon → StatusItem.actionIcon; vaadin:exchange/wifi/key/pen/
  credit-card/gift → OJ_ICONS exchange-h/connection/key/signature/bank-card/gift). New
  HEADING atom: a Text with container h1..h6 is projected isHeading and painted as
  <h3 class="mateu-atom-heading oj-typography-subheading-xs"> (the step after the section's
  h2; app.css leaves it without its own margin) with group rhythm `oj-sm-margin-10x-top`
  when it does NOT open the block — Profile becomes h3 (Preferences / Last stay) with 40px
  between groups, and as a bonus the checkout mode's titles (Folio breakdown, Post charge,
  Payment) become real headings.
- **Anti-scrollbar slack + single-line bullets (2026-07-27)**: the cockpit had 8px of
  slack (2×22rem+40 = 744 over 752) — the classic Windows/external-monitor scrollbar
  (15px) made the second column JUMP on repaint (the "misplacement" when creating the wifi;
  invisible in headless/Mac with overlay scrollbars). Operations panel 50→51rem = 24px
  of slack. And the Redwood theme puts `padding-right: 40px` on `ul`s (in addition to the browser's inline-
  start) — a quarter of the Profile lane; `.mateu-atom-bullets` overrides it and
  "Connecting rooms" goes back to one line (li 118→158px).
- **Room with number + GATED confirm (2026-07-27)**: the operation's card
  is titled "Room 612" (the number matters; the description becomes type + inspection
  status) and "Confirm check-in" only enables with EVERYTHING done (all 7 ops — cardex
  of all pax with no-shows aside + operations): `toolbar()` computes
  `operaciones(stay).allMatch(done)` → `Button.disabled` → `pageToolbarOf` projects it and
  the chains translate it to the oj-sp-header's API: the primaryAction is disabled with
  `display: 'disabled'` (NOT with a boolean `disabled` — that one is ignored). Verified in
  both directions (clean photo → disabled; 7 of 7 via wire → enabled).
- **Group post-check-in modal (2026-07-27)**: on confirming the check-in of a GROUP
  reservation (simulation: group = first word of the agency — "TUI Deutschland" and "TUI
  Group · …" share group TUI), the action returns a `Dialog` (uidl) proposing to
  continue with the group's next pending arrival or go back to the listing; with no group or no
  more arrivals → `UICommand.navigateTo("/reservas")` directly (NOTE: a `URI` INSIDE a
  List is NOT mapped — only bare; in collections use the UICommand). **Renderer**: a
  `Dialog` overlay is painted as a MODAL (`#mateuModal`, standard oj-dialog: title + text lines
  + the Dialog's actions in the footer) and not as a drawer — `overlayOf` gains
  `isDialog` + `texts` (collectTexts) and `actionsOf` propagates `parameters` (the
  "Check-in of X" button travels with `_item`); runMateuAction routes isDialog overlays to the modal
  (open/close by method, also closing on navigation) and `mateuModalDismissed` discards the
  overlay only if the TOP is still a Dialog. VB GOTCHA: an `oj-bind-for-each` over an
  ABSENT default property BREAKS the whole page ("Unable to process binding") —
  `texts: []` added to ALL mateuDrawer defaults. Build GOTCHA: `grunt vb-build`
  now ABORTS at the end in a network subtask (--url) — build/optimized is still
  generated correctly; do not trust the exit code, verify the artefact.
- **In-house screen (2026-07-27)**: the foldout extends to IN_HOUSE (outside the checkout
  mode, which keeps the two flat columns): Guests | **Stay** | Profile. The
  Stay panel is titled with the LIVE balance ("Stay · € 1,710.50 · 95% preauth.",
  balanceResumen → subtitle → headerLabel) and composes the balance Meter + the cockpit of
  cards: **Folio** (badge OK/Watch/At limit according to the preauth %; "Post charge" opens
  the catalogue drawer — clickable rows → `postearCargo` posts and CLOSES with
  `UICommand.closeModal()`), **one card per open incident** ("Resolve" →
  `stay.resolveIncident`; with none open → "✓ OK" card) and **Departure** ("Late check-out"
  +€50 to the folio — the charge itself acts as the flag; booked → 15:00 badge). Icons
  cart/check/clock added to OJ_ICONS. All verified live with Carlos: posting from
  the drawer (1,710.50 → 1,735.50), resolving the TV incident, late check-out
  (→ 1,785.50 · 99% and "At limit"), with the panel header and facts refreshing.
- **In-house v2: General Overview (2026-07-27, user's design)**: foldout out for
  in-house — RDS overview anatomy: main content (balance KPI as is +
  incidents as full-width CARDS: Notice danger/warning with the Resolve button
  INSIDE — parameters on the Notice content's Buttons) and secondary info beside it
  (guests DATA ONLY, no badges/actions, and the departure: date · 12:00/15:00 · nights ·
  regime). The FIVE actions go to the header's toolbar (Add charge / Change
  room / Manage folio / Message guest / Register request) + Check-out
  primary — the Spectra header collapses the secondary ones into the "…" menu. New drawers:
  Manage folio (Ledger) and Register request (clickable requests; late-checkout
  posts +€50 and closes with closeModal; the rest toast). Spectra GOTCHA: the
  spSecondaryAction event identifies the item by its id/value — without an id it arrived with
  secondaryItem="undefined"; the secondary ones carry id=value=actionId and
  headerSecondaryAction resolves by actionId OR label.
- **In-house overview polish (2026-07-27)**: h3 heading "Incidents" (its group
  margin puts the 40px between the KPI and the list); ALL incidents are listed — open
  first (danger/warning cards with Resolve), and the RESOLVED ones at the end as slim green
  notices "✓ Resolved · <title>"; with none open → "No open incidents — N resolved".
  The secondary info goes on a NEUTRAL BAND (zone VerticalLayout with
  cssClasses("oj-panel oj-bg-neutral-20") + align-self flex-start): the bridge's zone
  projection carries the column's wire cssClasses over to the block.
- **Incidents with a timeline (2026-07-27, user's design)**: ALL with the same
  card (title + badge Open/In progress/✓ Resolved on the right; resolved ones at the END) and
  below it their timeline "d MMM · HH:mm — comment" opening with the opening
  description. Domain: `Incident` gains `openedAt/resolvedAt` (schema stay_incident +
  seeder with dates; `resolve()` stamps the resolution); the "in progress" line is derived.
  Framework: `StatusItem.lines` (uidl+dto+mapper+TS) — the renderer's STACKED branch
  also accepts rows WITHOUT actions when they carry lines (guards hasActions||hasLines) and
  paints the timeline between the description and the buttons. Resolve as a ✓ icon only on
  the open ones.
- **In-house v3: 2-fold foldout + incident types + creation (2026-07-27, user
  insight: "the general overview IS a folded layout of just 2 folds")**: in-house
  goes back to the FoldoutLayout — overview "Information" (guests + departure) and panel
  "Stay · balance" (KPI + incidents) — with underlined titles and the foldout's own colours,
  and consistent with the arrival screen. "Incidents (N)" with a counter;
  incident titles as h4 (new `StatusList.itemHeadingLevel` uidl→dto→wire; the
  bridge marks isH4 and the template paints h3|h4 — cascade h2 panel → h3 group → h4 item);
  the TYPE under the title (new `IncidentType` TV/Air conditioning/Service/Restaurant/
  Cleaning/General with icon, column in schema + seeder). Creation: "New
  incident" action in the header → drawer with Title/Comment (drawer fields) + the type
  as clickable rows → `crearIncidencia` reads the drawer's state and reportIncident.
  Drawer GOTCHA: the content's FormFields came out DUPLICATED (field grammar +
  the blocks' isInput atoms) and the user typed in the dead twin — overlayOf
  filters the blocks' isInput.
- **In-house v4: the NATIVE oj-sp-general-overview-page template (2026-07-27, contributed by
  the user from a VB Studio scaffold)**: Spectra DOES ship the full template —
  `oj-sp/general-overview-page/loader` (it does not appear in the bundles: its component.json and its
  view go INLINE in the loader; the correct name carries the -page suffix). API: header props
  (pageTitle/pageSubtitle/contextualInfo/primaryAction/secondaryActions/badge/
  timestamp/selectContext...), slots `main` + `info` (+search/announcement) — main with a
  neutral-10 background and info as a full-height neutral-20 complement (the "colours
  like the foldout" the user pointed out) — and the SAME sp* events as the standalone header.
  **Renderer rule**: entity page (hostEntity) whose body is EXACTLY two
  column-blocks → `mateuGop {on, main, info}` and the template is mounted (integrated header;
  the generic band and the host loop are suppressed); the blocks go full width
  inside their slot (the info's width is set by the template). The in-house backend went back to
  two zones with the MAIN first (KPI + incidents) and info after (guests + departure) —
  the fold order the user was correcting.
- **Fold titles in the general overview (2026-07-27)**: each slot of the
  oj-sp-general-overview-page is titled in the foldout's style — the backend opens each
  zone with a Text container=h2 ("Stay · balance" / "Information"), the bridge
  marks it `isH2` and the gop PROMOTES it to the slot's title (gopFold: title + items without the
  heading), painted as h2 heading-sm + underline. The original underline
  (.oj-sp-foldout-panel-title-underline, 36×4 with --oj-sp-theme-accent) is SCOPED to
  oj-sp-foldout-panel — `.mateu-fold-title-underline` in app.css replicates the stroke with the
  SAME theme token.
- **Width per state in the 360 (2026-07-27)**: the static @PageWidth(EDGE_TO_EDGE) is gone
  — `PageWidthSupplier.pageWidth()` decides by state: ARRIVAL (foldout) stays full-bleed
  and stay/departure go FIXED (1408px box with the RDS formula and the canvas
  around it). The shell's content wrapper already applied pageStyleOf's maxWidth/margin/padding,
  so the backend supplier was enough.
- **Guest message in a drawer + textarea (2026-07-27)**: "Message guest" opens a
  drawer ("Message to <name>") with FREE TEXT and Send → toast with the message +
  closeModal. The drawer's field grammar learned `textarea`:
  dynFormMetadataOf/fieldListOf carry the stereotype and the panel paints `oj-text-area`
  (rows 4) for FormFields with FieldStereotype.textarea.
- **Button dedup in drawers (2026-07-27)**: the Buttons in a drawer's CONTENT
  came out twice — as an isButtons atom in place (with their parameters) AND in the
  footer's action row (actionsOf collects all the tree's Buttons). `overlayOf` filters from the
  footer the actionIds already painted in the content blocks (same pattern as the
  duplicate-isInput filter).
- **Drawer action bar anchored at the bottom (2026-07-27)**: Redwood guideline — the drawer's
  actions go in a FOOTER bar with a divider. A content Button WITHOUT
  parameters moves to the footer (Send); the ones carrying parameters (option lists)
  stay in place and are not duplicated. The drawer wrapper becomes a flex column
  min-height:100vh and the bar uses margin-top:auto + oj-divider-top — NOTE: the JET spacing
  utilities carry !important (oj-sm-margin-6x-top overrode margin-top:auto;
  inline padding-top instead). The bar is only painted if there are actions (bind-if).
- **Check-out and departure on the General Overview template (2026-07-27)**: the flat
  branch of `cuerpo` in ReservaOverview (check-out mode and DEPARTED) moves to the SAME gop
  anatomy as the at-home stay — WIDE zone first with its fold h2 Text ("Check-out ·
  balance" / "Stay · left on X") + folio/charges/payment, and the key info ("Information":
  `claveCheckout` = departure + guests in check-out, huespedesRail in DEPARTED) as a
  narrow complementary zone. "Back to the reservation" travels as the gop header's secondary.
  **Item-overview attempt REVERTED the same day**: `oj-sp-item-overview-page` +
  `oj-sp-item-overview` was mounted (detection by anatomy: narrow zone first → iop, wide first → gop;
  EntityHeader → panel with badge/facts;
  "Back…" → goToParent arrow; edge-to-edge format because the template sets its
  backgrounds) — it worked at DOM level but the painting was not convincing (the panel's column
  paints no background of its own in displayMode 'light': the white is only the
  component's card, and the whole thing hung loose over the canvas), so we went back to the gop
  the renderer already masters. The bridge KEEPS `itemOverviewPageOf` (+ badges/
  subtitlePlain in entityHeaderOf) with its contract test (#31) in case it is retried;
  the item-overview loaders remain listed in the app-flow bundle (inert).
  Findings for the retry: the iop-page's component.json goes inline in its loader; the
  oj-sp-item-overview's goes as the VComponent's `_metadata` (props itemTitle/
  itemSubtitle/badge/secondaryActions, slots body/footer); translations.go-to-parent
  sets the arrow's label; getInitialMode → displayMode 'light' with the Redwood theme.
  **Fix that SURVIVES the revert**: runMateuAction did NOT recompute mateuPageMargin/
  Padding/MaxWidth after an action — the previous state's -40px band overlap
  carried over to the next screen (betrayed by the iop's internal sticky elements); the
  action chain now recomputes margins with the same logic as onMateuNavigate.
- **Departure (DEPARTED): simple info + incidents (2026-07-28)**: in the gop's Information
  zone, `infoSalida(stay)` replaces the check-in rail — a SIMPLE guest list
  (name + doc, no actions or cardex badges) and "Incidents (N)" with a StatusList of
  badges (✓ Resolved / Unresolved) or a success Notice if there were none. Seeder: st-oliver carries
  a RESOLVED incident for the demo.
- **Search-as-you-type (@AutoSave) in charge posting (2026-07-28)**: the VB renderer
  honours the host's AutoSave trigger — `autoSaveOf(ctx)` (bridge) + `on-raw-value-changed`
  on the host's inputs (15 copies) → chain `hostInputTyped` (draft + per-token debounce at module
  level + `Actions.callChain(runMateuAction)` + FOCUS restored to the
  recreated input with the cursor at the end, 250ms tick). FRAMEWORK BUG fixed in
  `TriggerMapper.createTriggers`: implementing TriggersSupplier made it return early
  SUPPRESSING the class's @Trigger/@SubscribeTo/@AutoSave, and a supplier's AutoSaveTrigger
  fell into the switch's `default`, turning into an empty OnLoad — now the supplier's
  triggers are ADDED to those from the annotations and the AutoSaveTrigger case
  exists. (The class's @AutoSave already travelled fine through the annotations path.)
- **Listing quick selector by ENUM (2026-07-28)**: an enum filter in Filters
  (ReservasListing.Vista: Arrivals today / Departures today / In house, labels via @Label) travels
  as a FormField select with options in the metadata (sometimes from the MEDIATOR, not from the Crud
  node — quickFiltersOf searches the whole tree) → `listingOf.quickFilters` → chips
  `oj-sp-filter-chip` under the smart search (applied/nonApplied as TWO oj-bind-if — no
  CSP ternaries); chain `listingQuickFilter` toggles `mateuQuickFilter` {fieldId,value}
  and re-searches with `mateuLastSearchText`; `runMateuSearch` merges the active filter into
  componentState; reset on navigation. NOTE: listener params via binding CONTEXT
  (`$current.data.value`) — `$event.target.dataset` points to the chip's inner child.
- **Demo reservations seed (2026-07-28)**: framework — PageListingBuilder emits toolbar
  buttons for a declarative Listing's `@ListToolbarButton` methods (label from
  @Label); in VB the first is the smart search's primaryAction. `seedDemo` creates 10
  reservations (4 arrivals today, 1 tomorrow, 3 at home, 2 departures; ids demo-<stamp>-i) and
  answers Message + dispatchEvent("reservas-seeded") → the listing refreshes through its
  @Trigger(OnCustomEvent) (standard bus). The DB is in-memory: a restart re-seeds.
- **White band over the foldout (2026-07-28, user's fix)**: the foldout-layout
  mounts its OWN empty oj-sp-header-navigation (16px, bg-neutral-0) →
  `.oj-sp-foldout-layout-header-horizontal { display: none }` in app.css.
- **Welcome page as HOME (2026-07-28)**: `Bienvenida extends Welcome` at /bienvenida +
  `@HomeRoute("/bienvenida")` in the app → AppDto.homeRoute → `shellNavOf.homeRoute` → the shell's
  boot PREFERS it over the menu's first option (deep-link still rules).
  Tiles = 3 `MetricCard` @Panel(title="") with LIVE counters (instance per request) →
  `welcomeOf` extracts the MetricCard from the panel (isKpi/kpiTitle/kpiValue/kpiCaption) and the
  tile paints the KPI (heading-lg value + caption). ~~The TABS menu is HIDDEN on the home~~
  (REPLACED 2026-09-27: the bar appears on all pages, see "Filters inside the
  header and tabs on the home") and the oj-sp-global-header's house icon navigates to
  the home (event ojSpHomeClick → onMateuNavigate).
- **@AppContext in a side drawer (2026-07-28)**: the direct oj-select-ones did not fit
  the dark header → an icon (oj-ux-ico-settings, borderless) opens an
  oj-drawer-popup edge=end ("Working context") with the selectors in standard style
  (same contextChanged listener); toggleMateuContextDrawer page flip. The icon
  button carries `oj-color-invert` (JET utility) for LIGHT iconography over the dark
  header — the same white as the global-header's own home icon. The earlier CSS
  attempt (the theme's --oj-text-field-* variables) stays documented: it worked for
  bg/placeholder but the user preferred the drawer.
- **Decision modal: buttons with parameters in the footer (2026-07-28)**: the GROUP
  check-in modal only offered "Back to the listing" — "Check-in of <name>" carries
  parameters (_item) and the drawers' footer rule (buttons with parameters
  stay in the content: option lists) left it in a content the modal does not
  paint. In `overlayOf`, if the overlay is a DIALOG all the buttons go to the footer WITH
  their parameters (the mateuActionClicked listener already dispatches them). Test #32.
- **Ask Oracle on the shell's FAB (2026-07-28)**: the red FAB is the CHAT of the
  oj-sp-simple-ui-shell itself (prop `chat`, event `ojSpChatAction`) → it opens the palette
  #mateuAskOracle (oj-dialog: focused oj-input-search + oj-action-card rows with
  icon/kind). Destinations: Home + the app's navigation (mateuNavItems, with their icons) +
  the listing's QUICK VIEWS (Arrivals today / Departures today / In house). Typing
  re-filters live (askOracleTyped reuses buildResults exposed as a static of
  askOracleOpen — AMD chains can require each other with './'). A quick view
  leaves `mateuQuickFilter` + `mateuQuickFilterPending`: onMateuNavigate APPLIES it in the
  OnLoad search (lands filtered and with the chip applied) instead of resetting it, and
  consumes the flag. Verified: FAB → palette → "lleg" → 1 row → click → listing only
  "Arrives today".
- **Quick selector chips: actionable + spLabelAction (2026-07-28)**: the chips did NOT
  activate the view — `oj-sp-filter-chip` is not clickable without `actionable="true"`, and a
  click on the LABEL emits `spLabelAction` (not `spAction`) → both events go to the
  same listener. NOTE on verification: after a seed, the sorted page 0 (ARRIVING first)
  may be ALL arrivals — a "filter works" with Arrivals today was a false positive;
  test with "Departures today" (mixes states for sure).
- **Welcome hero: RDS-spec colour+illustration pairs, rotating (2026-07-28)**:
  the Figma "Welcome Banner - Illustration" defines 8 colour↔illustration PAIRS (Purple
  #856B94→Journey FINAL_7, Orange #AA643A→8 and 1, Lilac #6C7495→4, Teal #517F7E→5,
  Blue #427E96→6, Green #4D835C→2, Pink #A46573→3). In oj-sp-header-welcome-banner:
  `background-color` (dark-* enum) + `illustration-foreground` (URL) + themed-image
  "none" — NOTE: with themed-image="pebbles" the component IGNORES backgroundColor (fixed
  paired background), and the props only apply AT MOUNT (bindings, not post-mount). The
  chains rotate the pair on every visit to the welcome (Math.random in a JS chain, allowed);
  the home's KPIs navigate with `?vista=` (see below). ASSETS PENDING: export
  from Figma the 8 "Journey Headers Abstract FINAL_N" (transparent PNG) to
  webApps/vbredwoodapp/resources/images/journey-N.png — until then the hero paints the
  colour without illustration (the background-image 404 is silent). RESOLVED with the
  OFFICIAL assets the user supplied: the fnd gallery
  (https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/) ships 5 pairs
  illust-welcome-banner-bg/fg-01..05.png (background layer + figure layer, transparent) —
  the chains rotate [tone, pair]: dark-ocean+01, dark-pine+02, dark-plum+03,
  dark-sienna+04, dark-teal+05 (illustration-background + illustration-foreground +
  background-color). Verified: pine+crane, sienna+figures. The Figma "Journey Headers"
  remain as an alternative if they are ever exported.
- **Home KPIs navigate with the view applied + filtered deep-link (2026-07-28)**:
  each MetricCard carries an actionId (verLlegadasHoy/verEnCasa/verSalidasHoy) and its @Action
  returns URI "/reservas?vista=X" — the KPI tile is an oj-action-card (welcomeKpiClicked
  → runMateuAction). GENERIC in onMateuNavigate: a route with `?field=value` is
  consumed as a PENDING quick filter (same mechanics as Ask Oracle) and forces the
  reload even if the route does not change — any server NavigateTo/URI can land
  an already-filtered listing. welcomeOf carries kpiActionId; chips with air (margin-6x-bottom
  towards the table).
- **Automations as a listing with ROW actions (2026-07-28)**: the board did not
  render in VB → `AutomatizacionesListing` at /automatizaciones (the board stays at
  /automatizaciones-board): smart search + chips by the Estado enum (the quick selector is
  ALREADY generic) + one row per process; the "Fix" action travels as a row
  field `ColumnActionGroup` (Mateu mechanism: column dataType=actionGroup on the wire,
  each row carries acciones.actions[{methodNameInCrud,label}]) — only on rows with
  warnings/errors. Renderer: listingOf marks the actionGroup column → the oj-table's
  `cellRowActions` template (data-oj-as="cell" to keep the ROW context
  inside the actions for-each); chain listingRowAction → runMateuAction
  `action-on-row-<method>` with parameters {id} → Listing.handleActionOnRow invokes the
  method; the refresh arrives through the bus (dispatchEvent "automatizacion-arreglada" +
  @Trigger OnCustomEvent → search). Verified: 6 Fix → click → toast + 5.
- **VAADIN renderer against the front-office (2026-07-28)**: three fixes when testing :5174.
  (1) `lit-vaadin-helpers@0.3.1` (a DEAD dependency of libs/mateu, without a single import)
  pinned lit 2.8 → its `@lit/reactive-element@1.6.3` got HOISTED to the monorepo
  root and vite's `dedupe` served it to the whole tree mixed with lit 3.3.3 —
  symptoms: infinite `__isItemSelectable` recursion in vaadin-grid (Lit's accessor
  stores in `__<name>` and falls to the mixin's private method), "component loaded twice",
  and the menu tab not being marked. The dependency was removed → tree converged on lit 3 +
  RE 2.1.2 and the three symptoms gone. (2) FRAMEWORK: a declarative Listing that
  supports the "view" action is NAVIGABLE — PageListingBuilder marks the first column
  with actionId="view" (the same signal as ListRouteResolver.withViewOnFirstColumn on the
  AutoCrud path; Selectors excluded) → the id cell is painted as a link in the
  shared renderer. (3) FRAMEWORK: ListingBackend.actions() ADVERTISES "view" when
  supportsAction("view") — without advertising it, mateu-component discards the click's
  action-requested (known rule of the shared renderer) and the link did nothing.
  Verified: /reservas on :5174 paints rows + chips + seed, clicking the id navigates to
  /reserva/st-sophie and the full 360 renders in Vaadin; VB is unaffected.
- **Automations in the VAADIN renderer (2026-07-28)**: the listing renders out of the box —
  @Status badges and a "···" menu per row (the actionGroup's renderMenuCell; rows without
  actions do not show it). TWO nuances: (1) the shared renderer sends the row as
  `parameters._clickedRow` (canonical contract) while VB sends `{id}` — the demo's row
  action accepts BOTH (rowId helper); verified: Fix → credit goes to
  Ok and the listing refreshes through the bus. (2) The "vanished tab" of Automations is NOT
  a bug: the option carries @Audience("Staff") — with context Mode=Customer (which
  persists in localStorage `mateu-app-context`) it is hidden by design; with Mode unset
  or Staff, it appears. At 1500px the listing falls into cards mode, where status and actions are not
  projected (known limitation of the shared renderer's cards mode).
- **SSE + cards in the shared renderer (2026-07-28)**: two fixes in libs/mateu.
  (1) The scan (SSE LongTask) opened the modal but neither progressed nor closed: in
  mateu-component the action lookup used `find(exact || wildcard)` and the wildcard
  `'*'` (sse:false) comes BEFORE `escanearPax(sse:true)` in the list → the action went out
  through the normal sync and only the first increment arrived. The EXACT match now wins over the
  wildcard (a declared sse/background/confirmation flag must not be covered by a catch-all). Verified: /sse on the network, progress, closing and rail refreshed to Cardex OK.
  (2) CARDS mode cut the columns to the first 6 and status (@Status, 7th) and
  actions (ColumnActionGroup, 8th) disappeared — status badges and row
  actions ALWAYS go into the card (formatListValue and renderCardActionButtons already
  knew how to paint them). Verified on /automatizaciones at 1400px: badge + Fix
  working from the card. NOTE: Automations' first column no longer comes out
  as a link — the supportsAction("view") gate left it right after the last restart.
- Pending: the AddOnPicker's "Total extras" is not visible in the host copies (cosmetic). Phase 3: payment (PaymentPicker), ancillaries (AddOnPicker) and signature via
  SSE from the 360 (host SSE in the chains only exists for islands — today those ops are done in the
  wizard).

## Final Vaadin renderer batch (2026-07-28)

- **Listing toolbar to the PAGE header**: the user asked for title + toolbar on the
  SAME line without putting the title in the crud (explicit feedback; the opposite attempt was
  reverted). `PageListingBuilder.getToolbarButtons(instance)` extracted as public
  (@ListToolbarButton + Import/History/Export) and `ReflectionPageMapper` concatenates it to the
  Page toolbar for ListingBackend/ReactiveListingBackend (cast to
  `io.mateu.uidl.fluent.UserTrigger` — UserTrigger lives in uidl.fluent, not in
  .interfaces!). The crud SUPPRESSES its copy when a MATEU-PAGE ancestor carries a toolbar
  (`pageShowsToolbar` in mateu-table-crud crosses shadow roots upwards). VB is unaffected:
  it keeps reading listing.toolbar from the crud metadata.
- **@ListToolbarButton are ADVERTISED in `ListingBackend.actions()`** (uidl): the Page
  header button dispatches the bare method name and mateu-component discards
  unadvertised actions — the "+ 10 demo reservations" seed did nothing in Vaadin (in VB it
  worked because its renderer does not consult the list). Now actions() walks
  getClass().getMethods() and adds each annotated method (with its confirmation/
  rowsSelected flags). Verified: 19 → 29 items and re-search via the trigger
  "reservas-seeded". NOTE: direct getAnnotation — composed (semantic) annotations are not
  resolved here (uidl does not see core's MetaAnnotations).
- **goHome by URL**: the wire's homeRoute is RELATIVE to the request (it went to /reservas)
  → `pushState('/') + PopStateEvent` in mateu-app.
- **Live menu tabs**: `isActiveOption(option)` with selectedRoute (the wire's `selected`
  flag is from construction time).
- **Stacked cards (mateu-status-list stacked mode)**: title+chip on one line (chip on
  the right with margin-left:auto), description below, actions as icon-buttons
  (title=label); operations grid with column-gap 2.5rem/row-gap 1rem; guests
  (1-col stack) capped at `max-width: 22rem` = same card width as the operations
  grid's cells (they asked for them to match). itemHeadingLevel 3/4 (Profile → h4 in
  Preferences/Last stay).
- **Vaadin foldout at 100%** with proportional split: `flex: <weight> 1 <width>` per
  section (weight = parseFloat of the declared width); the container needed
  `expand-fields` on vaadin-form-layout — with `??` it did not work because expandFields
  arrives as a primitive `false` → `||`.
- **Persistent drawers**: Add with an existing overlay id refreshes in place;
  Replace in-place by serverSideType preserves overlays (ids are fresh uuids per
  render). Ancillaries/payment method change no longer close the drawer.
- **Vaadin icon aliases** (renderIcon): wifi→connect, pen→pencil, automation→cogs.
- **KPIs without a double frame** (dashboardRenderer: panel with a single MetricCard → the metric
  alone) and "N of 7" joined to the section title (mateu-vaadin-foldout: `· subtitle` in the
  h3).

## Session 2026-07-28 (dogfooding front-office-evolution, VB + Vaadin)

- **VB drawer honours the wire's `Drawer.width`**: `oj-drawer-popup` shrank to its content; the inner div
  now binds `:style.width` to `mateuDrawer.width` (overlayOf already carried it) with a 26rem fallback
  and `max-width: 90vw`. Charges 26→30rem, folio 30→34rem (backend).
- **Clickable row cards to full row**: the `oj-action-card`s of `rowActionId` without a button
  (charges catalogue) were inline and shrank — class `mateu-row-card` on the 15 stamps +
  `display:block; width:100%` in app.css, and `:first-of-type { margin-top: .75rem }` for air
  after the check-out's search input.
- **Foldout Guests panel at 25rem** (useful content 22rem = one `.mateu-grid-cell`).
- **Branding**: `shell.logo` in the bridge's projection (single source + regen), variable
  `mateuShellLogo` (mateuBaseUrl + AppDto.logo) painted in the global header's start slot; the
  integrated Oracle logo is hidden (`.oj-sp-logo-global-header-logo-container { display:none }`).
  Backend: `@Logo("/images/riu.svg")` on the FrontOfficeSuite of both front-offices.
- **Welcome trend chart**: a `TrendChart` or `Chart` (chartData.labels + datasets[0]) in a Welcome
  tile is projected as `welcome.trend` (precomputed items id/value/group/series), tile
  excluded from the KPIs; markup with `oj-chart` type=bar (import `ojs/ojchart`) over the ADP
  `welcomeTrendADP` ← `mateuWelcomeTrendItems` (app-flow). The Bienvenida now emits a BAR `Chart`
  (maintainAspectRatio=false, 200px) — the web renderer paints it with chart.js.
- **Nested route** `/reservas/:id` (before `/reserva/:id`) — the Reservations tab stays marked in
  the shells with a menu; `idFromRoute(mount="reservas")`. On completing check-in → navigateTo
  `/reservas?vista=LLEGADAS_HOY` (quick-filter mechanism already supported by onMateuNavigate).
- **Room drawer also closes in-house** (`elegirHabitacion`/`upgrade360`: closeModal
  whenever the selection comes from the drawer, not conditioned on ARRIVING).
- **Vaadin (shared)**: hoist of the initial EntityHeader to mateu-page's canonical header
  (pageRenderer marks `__hoistedToPageHeader`, entityHeaderRenderer skips it; kpisBelow = label+value
  pairs under the title, badges next to the title) — VB is unaffected (it does not use
  mateu-page). pageWidth edgeToEdge in Vaadin via the no-padding hook (compact-changed) + the header's own
  gutter (`:host([data-edge])`); vars `--mateu-shell-gutter(-top)` declared by the
  vaadin shell. Foldout: FABs only with real overflow (>32px + ResizeObserver) and the last fold
  never narrower than the overview. StatusList grid row-gap 2rem (overridable vars).

## Path URL in the renderer jar (2026-07-30)

- **Dual URL mode** (fixed at `loadMateuShell`'s bootstrap): **PATH** (`/products`, no
  `#`) when the app is served by the Mateu backend — the signal is the hidden `<mateu-ui>` that the generated
  controller injects (AQUIUI/HASTAAQUIUI markers of the jar's `_index.html`) —, **HASH**
  (`#/route`) on static serving (local `vb-serve`, VB hosted on Oracle), where the server
  cannot rewrite arbitrary paths to the index. `window.__mateuUrlPathMode` publishes the mode;
  back/forward = `popstate` in path, `hashchange` in hash; in path the home (including the server's
  `_no_home_route` sentinel) is reflected as `/`, never as a path.
- **visual-runtime GOTCHA**: the MODULES base (requirejs) is derived from `location.pathname`
  (a fallback that ignores `<base href>`), so served at `/products` it requested
  `/products/version_<ts>/bundles/...` → 404 and the shell did not boot. The way out:
  `vbInitConfig.BASE_URL` WINS over that fallback (seen in the runtime's source: `BASE_URL ||
  (pageDir + BASE_URL_TOKEN)`, and with a token that starts with `/` it would use origin+token) —
  `scripts/copy.mjs` injects `BASE_URL: '/version_<ts>/'` derived from the token itself, in addition to
  `<base href="/">` for the remaining relative resources (css). Multi-segment deep-links are
  covered by the SpaRedirectFilter (forward to the index) + absolute base.
- Verified with Playwright against demo-vb :9005 served by the jar: deep-link `/products`
  (crud rows), menu click → `/stock` without hash, back → `/products` re-rendered, root
  stable at `/`.

## Federated menus: navigation had to go back to the pod (2026-09-03)

Failure observed on `rw.ec1.mateu.io` (`ec-demo1/shell-redwood`, the SAME shell as the Vaadin one at
`ec1.mateu.io` with `io.mateu:mateu-redwood` instead of `mateu-vaadin`): **the menu painted in full and
no crud opened**. `Booking → Bookings` answered a red `Text` "Not found.".

Three things broken, in a chain. All three are about NAVIGATION, not about menu expansion: asking each
pod for its menu was already done (`expandRemoteMenus`), and that was precisely what exposed
entries that led nowhere when pressed.

1. **The route was being trimmed**. `shellNavOf` navigates a group leaf by its TERMINAL route, because
   the composed one of a LOCAL menu (`/gestion/person`) is a menu path and not a route the
   backend resolves. Applied to a leaf of another pod it is the other way round: `/booking/bookings` is
   exactly what that pod serves, and trimming it to `/bookings` leaves it ownerless — it neither matches
   the `remoteRoutes` registry (so the request goes out to the shell's base) nor exists there. The
   mark to tell them apart was already there: `expandRemoteMenus` leaves its `baseUrl` on the adopted leaf.
2. **The context did not remember which backend it came from**. With the route resolved correctly,
   the crud painted toolbar and columns but WITHOUT rows: the `search` trigger the listing asks for on load
   went out again to the shell's base, which answers 200 with zero fragments — an empty listing and
   not a single error in sight. Now `loadRouteInto` stamps `outbound.baseUrl` (next to the 4 route
   fields it already kept, for the same reason) and `runMateuAction`/`runMateuActionSse` prefer it;
   the chains read `bridge.baseOf(reg)` instead of the shell's constant. Whoever fires an action
   knows which CONTEXT it comes from, never which backend it came from.
3. **The third level was lost**. A federated shell brings three levels without asking: shell
   group (`Admin`) → pod group (`Workflow`) → its screens (`Processes`, `Steps`). The
   projector modelled two, so the pod group stayed as if it were a screen —click → group
   route → empty content— and its screens appeared nowhere: `Processes`,
   `Steps` and all of `Forms`/`Worker` were UNREACHABLE. `navNodeOf` is now recursive and the two
   navigation markups (nested `oj-menu` submenu in the bar, third `<ul>` in the navigator)
   paint the level below; a group at any depth only expands.

Tests: 4 new in `poc/test.mjs` (75). The case of the pod answering with a GROUP is the one that
was not covered — the old fixture made the pod answer a loose leaf, a shape no
real pod has, and that is why the test passed with navigation broken.

**Verified against the cluster WITHOUT deploying**, serving the freshly built bundle to the deployed
app (`e2e/vb-live-dev.mjs`, see README): `Booking → Bookings`, `Content → Labels`,
`Content → Content types`, `Admin → Workflow → Processes` and `→ Steps` load with real rows, and
each one's three requests (mediator, content and `search`) go out to the right `/_pod`.

**Pending noted**: the host page's title stays at `...` (the `SetWindowTitle`
arrives in the content increment and does not feed `mateuHostTitle`) — seen in any federated
crud, and independent of federation.

## Polish after the first real use of the federated console (2026-09-03)

Three things seen when using `rw.ec1.mateu.io` with the cruds already loading.

**1. The detail could not be reached from the listing.** A PAGE crud does not answer the detail: it answers
a STATE-ONLY fragment whose `_route` points to it (row click → `/2CSXZN`, New → `/new`,
back → `/list`). The ISLAND's chain followed that flip since Phase 9; the HOST's did not, so
the request went out, the server answered 200 and nothing happened — the hardest failure to
see of all, because there is no error anywhere. `routeFlipOf` (transport) extracts the criterion
and `runMateuAction` follows it.

Two details that cost a round each:

- **`_route` and `PushStateToHistory` are NOT the same thing**, though they look alike. The first is the
  INTERNAL route that must be reloaded (`/list`); the second is the URL, relative to the mediator (`''` for
  the listing). Using the first as the URL leaves addresses that do not exist —
  `/booking/bookings/list` instead of `/booking/bookings`— and the back button lands on a blank.
- **After the flip the OnLoad triggers of the new content must be fired**: without that, going back
  from the detail lands on a table with its columns and not a single row.

The whole cycle was verified against the cluster: row → detail → Edit → Cancel → Back to list →
New → browser back, with the same URLs as the Vaadin shell of the same app.

**2. Ask Oracle only offered the menu's first level.** It walked `mateuNavItems`, so it
listed GROUPS (which are not a destination: pressing them leads nowhere) and not the screens —
which in a federated shell are nearly all of them. It now walks the whole tree and offers only the leaves,
with the group trail on the right of the row (`Processes · Admin › Workflow`): two pods may
have a screen with the same name. Along the way, the "quick views" now come from the
quickFilters of the listing being viewed, instead of three hand-written front-office routes
that in any other app are three dead destinations.

**3. The page title came out empty (`...`) in every federated crud.** `summarizeHost` looked for the
label in the menu's FIRST level, and the screen hangs from the pod's group, two levels down. It now
searches at any depth and, before that, uses the title the Crud itself declares.

**4. White space at the bottom: half a victory.** `oj-web-applayout-page` sets `min-height:100vh`,
but the shell's `stretchingContents` slot already starts BELOW the 50px header: the page measured
50px more than the window and a scrollbar appeared that led nowhere. Fixed
by making the shell distribute its height (flex column + `min-height:100vh` on its root).

What was NOT done, and why: stretching the listing's CARD to the bottom (as the Vaadin shell does).
Between the content container and the table there are wrappers set by the VB runtime
(`oj-vb-content`/`oj-module`) and JET's `oj-drawer-layout`; it was tried twice —with a
`*:has(#mateuTable)` wildcard and naming the chain one by one— and both times it misplaced the card
(ROW `oj-flex`es cannot be turned into columns). The gap left is canvas, not a cut,
so it is noted rather than forced blindly. The same goes for width: the side margins on wide screens are RDS's `fixed` mode (1408px cap, centred) and the Vaadin
shell of the same app does exactly the same — changing it would be a product DECISION, not
a fix.

### The Page toolbar was painted twice (2026-09-03)

On entering a reservation, `Back to list` / `Add another` / `Edit` came out in the header AND again
in a row under the form. Both projections come from the SAME `Page.metadata.toolbar`:
`pageToolbarOf` takes it to the header and `actionsOf` (which walks the tree looking for nodes with
`actionId` + `label`) also collects it for `mateuFormActions`. The header rules when it
is painted; without a header, the row below is the only one and stays whole. Applied in both chains
(navigation and action), because both rebuild the projections.

With that, the detail is as Oracle's component dictates: the main action visible and the
rest in the `···` overflow (`oj-sp-header-general-overview` decides the split, not
us). Verified that `Edit` from the `···` still leads to `/booking/bookings/<id>/edit`.

It is the same failure already seen in the retired redwood-oj renderer, where `renderFilterBar`
painted `metadata.toolbar` in addition to the crud's heading: **when two different projections
read the same piece of the wire, one of the two has to be explicitly silenced.**

### The ellipsis came out too early (2026-09-03)

`oj-sp-header-general-overview` gives ONE primary-action slot and paints **the first secondary** as a
button; everything else goes into the `···` overflow. There is no `displayOptions` or threshold to
touch: with 3 actions and none marked primary, two came out hidden. It is Spectra's behaviour, not ours —
ours is HOW we distribute the actions among its slots, and we were doing it wrong twice over:

- **`primaryToolbarButton`**: the wire's `buttonStyle: primary` rules; if the wire is silent, the
  LAST one that is not a back action is taken. In Mateu's toolbars the order is "leave, …, advance"
  (Cancel→Save, Back to list→Add another→Edit), so the last non-back is the one a user came to
  do. Explicit heuristic, to be replaced the day the wire brings the button's role (the `role`
  that was deferred in Phase 0).
- **`backToolbarButton` → `displayOptions.goToParent`**: going back is not just another action. RDS has its
  own affordance (link above the title + `spGoToParent` event) and putting it among the
  secondaries hid it precisely when it is what is pressed most. Its label comes from the wire's button
  via `translations.goToParent` (without that it says "Parent page").

With both, a crud's detail goes from "one button and two hidden" to **Back to list** (link)
+ **Add another** + **Edit**, and the `···` no longer appears: 4 buttons are needed (back + primary +
two secondaries) for it to be needed again. The editor stays Cancel + Save.

## Tabbed form, embedded tables and web components (2026-09-03)

A process's detail (`/workflow/processes/{id}`) showed the tabs' labels and nothing
else: neither the fields outside, nor the tables inside, nor the graph. Five things, all different.

**1. The page was claimed by the wrong archetype.** `itemOverviewOf` activated with ANY
`TabLayout` in the tree and projects "key-data panel + tabs", pulling from each tab only loose
texts. This page is not an item overview: it is a FORM that carries tabs inside. Now
the archetype requires its panel (a `Card` outside the `TabLayout`); without it, it falls back to the
generic content.

**2. Tabs are FLATTENED.** The `isTabs` atom is just the bar; the active tab's content
comes after it, as normal atoms of the same container. Nesting atoms inside atoms
would force duplicating the whole template inside the tab and fighting VB's nested
`$current`. The active tab is CLIENT state (`mateuActiveTab`): changing it reprojects the
same context without asking the server anything, and a navigation resets it. Conscious limitation:
a fixed id (`#mateuContentTabs`), i.e. ONE tab bar per screen.

**3. Embedded table (`isGrid`).** A list with columns inside a form is not a crud's
listing (that one has its search header and its route). Its data provider **travels in the atom**:
there are several per page and one variable per table cannot be declared in advance, so the core
receives the app's factory (`setDataProviderFactory`, `ojs/ojarraydataprovider`) and in Node it
stays without it — the atom carries the rows anyway and the tests check them.

**4. Third-party web component (`isElement`).** The wire brings the tag, attributes and the
module's URL. The template only puts the slot (`.mateu-element`) because VB does not know how to write
`<{name}>`; the bridge creates the element **once per slot** and on later renders only
rewrites its attributes: a web component keeps state the server does not know about (a graph's zoom and
selection), and recreating it throws that away. The attributes are `${state.x}` and are re-interpolated on
each render — their only data channel, and the metadata is not resent with a State.

> **GOTCHA that cost the first round**: `import(url)` is NOT valid. The VB build's transpiler
> turns it into an AMD `require()` and requirejs goes about resolving the URL as one of its own
> module ids: the request does not even go out, the slot stays empty and there is not even an error. A
> `<script type="module">` is injected instead, which nobody can rewrite.

> **And the second**: the `oj-tab-bar` comes out VERTICAL by default (like the navigator) — `edge="top"`
> must be set — and it parses its `<ul>` on initialisation, so the `<li>`s that a for-each stamps
> arrive late and `refresh()` has to be called on it. The same trap as the shell's
> `oj-navigation-list`, twice.

**5. The deep-link fell into the listing.** Two chained failures: `remoteRouteOf` only matched
EXACT routes and only the menu's reach the registry (`/workflow/processes`), so the detail
went out to the shell's backend → "Not found."; it now matches by prefix with the longest registry
entry that fits. And once in the right pod, the mediator answers `rootRoute` = the WHOLE route that was
requested and `homeConsumedRoute` = its own (`/workflow/processes`): sending the whole one as
consumedRoute the server serves the crud's default view, and that is why entering through a
process's link showed the listing.

Real-wire fixture `wf-process.json` + test 79 (the outside fields, the 6 tabs, the Steps
grid with its badges and the graph with the attributes already interpolated) and test 80 (the deep-link).

### A box inside a box (2026-09-03)

Any screen with tabs or with a table inside painted its fields in an `oj-panel`
placed inside the content container — box inside a box—, whereas a normal record (which
goes through the form branch) does not have it. The panel came from the wire's `Card`, which on these
pages is not a card: **it is the page's frame**, and that is painted by the container.

Rule: a SINGLE card WITHOUT A TITLE that wraps all the content is flattened. With a title it is a real
card and is respected, just as when there are several (the 360 and its zones keep their
panels). A card's title is recognisable because `visit()` puts it in as the first text atom
with the subheading class.

## Filters inside the header and tabs on the home (2026-09-27)

### Filters: through oj-sp-smart-filter-search's `smartFilters` API

The "Filter by" row was painted AFTER the closing of `<oj-sp-smart-filter-search>`, and Redwood's
colour strip (`div.oj-sp-header-general-overview-header-strip`) is at the FOOT of the component's header:
it ended up in the middle of the page, between the search box and the filters+table. Now the filters
travel through the component's API (oj-sp 2604.1.0 loader) and it paints them, above the strip:

- `value` → the applied ones, as chips INSIDE the field (with their ✕); free text goes right there
  as `keyword` chips. `bridge.smartFilterValueOf` takes them out of Mateu's state and
  `bridge.filterStateOfSmartFilters` does the reverse (text + componentState values).
- `suggestions` → the NOT applied ones, in the DROPDOWN the search opens on entering it (2026-10-04;
  before they went in `suggestionFilters`, a row of buttons under the box, which was not what was remembered
  of the smart search). One row per filter (`smartFilterDropdownRowsOf`: `{id, category:'suggestion',
  chips:[chip]}`); choosing it applies that complex chip and the component opens its editor
  (`onSuggestionsListViewItemAction` → `openFilterPopup`). Local DataProvider
  (`suggestionsProviderOf`): the component wraps it in a ListDataProviderView with
  `{op:'$ne', value:{filters}}` (the applied ones) + `{text}` (what was typed). Two details the popup's
  oj-list-view demands: the iterator gives a block with data (`done: false`) and then the empty
  end, and `getTotalSize` is -1 — with a single `done` block or with the total of all rows, typing
  «busi» painted «Business key» six times.
- (`suggestionFiltersProviderOf` is still exported; it is no longer used in the header.)
- `filtersMetadata` → an oj-dynamic `JsonMetadataProvider` polymorphic by `filter` (the
  fieldId): the editor the component's popup opens. By kind: text `oj-input-text`, number
  `oj-input-number`, select/boolean `oj-select-single`, multi (enum) `oj-checkboxset` (array),
  range `{gte,lte}` of `oj-input-date(-time)`/`oj-input-number` — with THAT exact shape the
  component recognises the range and paints the formatted "from - to" chip. The provider is loaded
  on demand (`require` in the AMD) only if the listing declares filters.
- Option ones carry `filterLabel` (the chip reads "Vista Llegadas hoy"); text and range do NOT
  (with filterLabel the component would show the label instead of what was typed).
- A range's suggestion carries `value: {gte:null, lte:null}`: the popup takes its fields from the
  value's keys (without them it comes out empty). The component would paint it "Llegada -": app.css hides
  the value part of the UNapplied chips inside the smart search (Mateu uses no counters).
- The config is projected ONLY on navigating (`onMateuNavigate`). The searches the component itself
  launches (`smartFiltersChanged` → `runMateuSearch`) do NOT reassign it: they would close the popup
  of the filter being edited. A chip just taken out of the suggestions has no value yet → it does not
  change the state → no search is made.
- The own row, its per-kind editor and the chains mateuFilterApplied/DraftChanged/
  Opened/FiltersCleared/RangeApplied (and their app variables) were deleted.

Verified against the cluster with the local bundle: /booking/bookings (multi Status, date-range Arrival and
Departure, text Hotel — they filter), front /reservas "Vista" 20→8 rows at 1440 and at
390 (at 390 the component uses its full-screen dialog). /partners/partners sends
`type: ["Company"]`/`status: ["Inactive"]` just like the old row and the backend returns all 259
rows with the deployed bundle too: the Crud declares those filters as a simple enum and Mateu publishes
them as multiSelect — it is the backend's, not the renderer's.

### TABS menu: the bar also appears on the home

Before, `oj-sp-in-app-navigation` was hidden on the home (`mateuSelectedRoute !== mateuHomeRoute`).
Now it appears on ALL pages: the app's navigation does not disappear depending on where you are. On the
home there is no selected tab (its route is not a menu option). The real bar is a fixed overlay
stamped by the component; its host element goes at the end of the content and its in-flow box
reserves the 64px, so the home is not covered when scrolling to the bottom (checked at 1440 and
390).

## Top menu over the dark header: selected/pressed/focus states (2026-09-27)

With the dropdown open, the oj-menu-button (half-chrome) becomes `oj-selected` and JET gives it the LIGHT
surface selected background — rgb(228,241,247) with border rgb(34,126,158) — with app.css's
white text on top: the label almost vanished. In half-chrome (oj-redwood-min.css
of JET 18.1) hover and pressed are a `background-image` LAYER of `--oj-core-bg-color-hover/-active`,
and selected the background `--oj-button-borderless-chrome-bg-color-selected`. For the buttons of the
global-header's `start` zone (top menu and hamburger), and only for them: white veil
0.10 hover / 0.14 selected / 0.22 pressed, transparent borders, white text and icon
(also the dropdown's triangle, which came out almost black) and JET's focus outline in
white at 60 %. Selected+hover also painted another layer behind the icon itself (a lighter
square around the triangle): overridden with a selector more specific than JET's.

## Agent chat: own FAB and left-hand drawer (2026-09-27)

The chat lived as a "💬 Chat" tab inside the Ask Oracle palette (a modal oj-dialog): the
user had to open "Ask Oracle" to talk to the agent, and the dialog covered precisely the
screen they were asking about. It was a design error: they are two different things.

- **Two FABs**, stacked in the corner. Below, Ask Oracle's: stamped by oj-sp-simple-ui-shell
  (`oj-ux-ico-oracle-chat`, event `ojSpChatAction` — the glyph is changed later by the section
  "The Ask Oracle FAB carries the Ask Oracle brand") and it opens the palette, which is now ONLY the
  destination search. That shell `<a>` has no href or role (it could not be reached with the
  tab key and only said "Ask"): `loadMateuShell` gives it `role=button`, `tabindex=0`,
  `aria-label`/`title` "Ask Oracle" and Enter/Space. Above it, the chat's: `oj-button
  display="icons"` `oj-ux-ico-chat` "Chat with the assistant" (the label is its aria-label and its
  tooltip), only if the App declares `sseUrl`. It follows the shell FAB's geometry: 72px at 24px from the
  edge from 1024px (flush to the edge with a tab bar) and 52px flush to the edge below that.
- **LEFT drawer in push mode**: `oj-drawer-layout#mateuChatDrawer` with a START drawer,
  wrapping the navigator's layout and the content. It is the JET pattern for a side panel that
  coexists with the page: at wide widths (`start-display` auto, ≥1024px) it is REFLOW — the content
  narrows and shifts to the right, nothing is covered —; at narrow widths JET turns it into OVERLAY, and
  the panel takes the full width under the header. oj-drawer-popup was discarded: it is always an overlay and
  would cover the screen. The layout lives in `stretchingContents`, so the global header does not
  move, and the tab bar is a fixed overlay of its component (it does not move either): the panel
  deducts its height. JET's reflow wrapper is `sticky` (not the panel: the wrapper has
  overflow:auto and a sticky inside would stick to it) and that way the conversation stays in view when
  the page scrolls.
- **Focus**: on opening, to the typing field; in overlay JET moves the focus to the ✕ when it finishes
  opening (~0.5 s) and `toggleMateuChat` gives it back as long as it is still inside the panel. On closing
  (✕, Escape in overlay → ojBeforeClose → `chatClose`, or the FAB itself), it returns to the FAB.
- **What the chat does is preserved**: SSE streaming, history (app variables, survives
  closing/opening), `render-screen`, errors as assistant text. And two things it did NOT do and
  the user took for granted: the body carries `currentRoute` (the control plane picks the
  agent by the screen: at /mapping/dictionary it answers "I am the mapping agent…",
  verified) and the stream presents the session token (`bridge.authHeadersOf()`; without it, the
  cluster's agent answered 401 — the stream does not go through fetchWithPolicy).
- Deleted `mateuChatMode`, `chatShowChat` and `chatShowSearch`; new `mateuChatOpen` and
  `toggleMateuChat` (listeners `chatToggle`/`chatClose`).

## The Ask Oracle FAB carries the Ask Oracle brand, not a speech bubble (2026-09-27)

The user saw "the conversation symbol" on that FAB and asked why, if what it opens is
Ask Oracle. The glyph was `oj-ux-ico-oracle-chat`: the one `oj-sp-simple-ui-shell` stamps on its
chat FAB (`$properties.chat`, title "Ask") — the dotted speech bubble of Oracle's DIGITAL
assistant. While the chat lived inside the palette it made sense; since the agent's chat
has its own FAB (`oj-ux-ico-chat`, another speech bubble) there were two speech bubbles for two
different things, and the lower one opens no conversation but the search.

- **Default glyph**: `oj-ux-ico-oracle-o`, Oracle's "O". It is the one the `oj-sp-ask-oracle` component itself uses
  for its brand button (`oj-sp-rw-ask-oracle-branding-icon-image`, seen in
  `oj-sp/2604.1.0/ask-oracle/loader.js`); it is in the Redwood icon font the app already
  loads (`ojuxIconFont`), so nothing is drawn by hand and nothing is vendored. The label "Ask
  Oracle" is the FAB's accessible name, its tooltip and the palette's title (variable
  `mateuAskLabel`).
- **App's brand**: `@App(askLabel, askIcon)` → `AppDto.askLabel/askIcon` → `askFabOf(shell,
  base)` (poc/widgets.mjs, tested) decides `{ label, kind: glyph | initial | image }`; blank,
  Ask Oracle. `@App` was chosen and not `@AI` because the FAB exists without an agent (the chat is the OTHER FAB).
  `brandAskFab` marks the shell's `<a>` after painting (like the name and keyboard before,
  which are still there): it removes `oj-ux-ico-oracle-chat`, sets the glyph or puts the brand inside the same
  `div role=img` — so the shell's `oj-sp-ux-icon-size-*` still size it at each width —
  and is idempotent. The initial goes in white over the FAB's background (like the glyph); an image in
  a white circle, because a logo is usually coloured on transparent and on the FAB's red
  it got lost (RIU's is red).
- Verified with the bundle served over front.ec1 and rw.ec1 at 1440 and 390: the "O" below and the
  chat's speech bubble above (rw), and with the App rewritten to `askLabel="Ask RIU"` the "R"/the logo and
  the palette titled "Ask RIU".

## The agent chat opens from the header, not from a FAB (2026-09-27)

Two FABs stacked in the corner (Ask Oracle and the chat) competed for the same spot and the chat's
covered content. The chat becomes a button in the global header, as in the Vaadin renderer:

- `oj-button#mateuChatToggle` (`chroming="borderless"`, `display="icons"`, `oj-ux-ico-chat`) in
  the actions of `oj-sp-global-header` (`end` slot), right before the App's widgets (the inbox
  bell…), only if the App declares `sseUrl`. The label "Chat" is its accessible name and its
  tooltip (fixed: oj-button does not repaint a bound text inside);
  `aria-controls="mateuChatPanel"`, and `toggleMateuChat` sets `aria-expanded` on its `<button>`.
- While the panel is open it carries `mateu-chat-open`: the dark header's white "selected" veil
  and a white line below. Hover/pressed: the same veil as the top menu.
- The left drawer (reflow at wide widths, full-width overlay at narrow) does not change; on closing
  the focus returns to the button. The Ask Oracle FAB does not change. `#mateuChatFab` and its CSS deleted.


## UX batch 2026-10-04 (hamburger, subheader, search box, forms, FAB, wizard, confirmation)

- **HAMBURGER_SECTIONS**: the hamburger goes at the far left (in front of the logo) and switches
  glyph ☰ ↔ ✕. The sections are no longer in the `oj-drawer-layout` (reflow, under the subheader): they are
  their own FLOATING panel (`#mateuSectionsOverlay`, fixed, 280px, under the global header, over
  the subheader and the content) with a veil; it closes with the ✕, Esc (listener on the document
  while it is open), a click on the veil or on choosing a section. oj-drawer-popup was no good: it covers the
  header and with it the ✕. It slides in; no animation with prefers-reduced-motion.
- **Empty subheader** (sections on the home): it folds (`mateu-subheader-empty`, height 0 + opacity,
  200ms transition) instead of leaving a white strip.
- **Page forms and wizards**: `oj-formlayout-full-width` and `wideColumns` (the wire's or 2
  when undeclared, like Vaadin's FormLayout); the page form no longer goes in half a column
  (`oj-md-6`). @Colspan is still not applied: of the classic oj-form-layout's children only
  oj-label-value has `colspan`, and wrapping the control in one misaligns the grid and removes its
  label (tested) — it calls for oj-c-form-layout.
- **FAB**: the wizard's footers (and the guided process's sticky) keep away from the FAB's column
  (padding-inline-end 5.5rem) and the content leaves 6rem at the end.
- **Row editor**: an empty read-only field («Line», «Total» of a new room) is
  label + «—», with no box or focus; the initial focus goes to the first editable field. In the
  editable list's table, its empty cells say «—».
- **Confirmation**: the generic texts in the interface's language (`confirmationDefaultsOf`,
  es → «Sí»/«No»).

## Chrome i18n and chat parity (2026-10-10)

- **The renderer's own words** live in ONE catalogue, `poc/i18n.mjs` (`en` + `es`; a partial language
  —`fr`, `de`…— only brings what it has and the rest falls back to English key by key). The language is
  the interface's, with the same source as the web renderer (`chromeTexts.ts`): `<html lang>`, which
  `index.html` now sets from the browser (before, only the jar, in `copy.mjs`), otherwise `navigator.language`,
  English by default. The bridge says them with `chromeText(key, vars)`; the pages' HTML links the
  VB translations bundle (`$application.translations.appBundle.<key>`), which `make-nls.mjs`
  **generates** from the same catalogue (`npm run bridge`; `--check` in CI). That way VB resolves
  the language through its locale and nothing needs re-linking. VB starter texts removed.
- **The chat** was closed against `mateu-chat.ts` function by function — table in RENDERER-ROADMAP. What
  was missing (context + screen projection, `mcpUrl`, attachments, local agent, brand title,
  turn tools, empty response/cut-off explained, wide mode) is pure logic in
  `poc/chat.mjs`; the chains only wire it up. The attachments create their `<input type=file>` from the chain:
  VB's declarative binding on a hidden native input is not reliable.
- Screenshots: `poc/shots/chat-en.png`, `chat-es-tools.png` (in-progress turn tool, chrome in
  Spanish), `i18n-en-products.png`, `i18n-es-products.png`.

