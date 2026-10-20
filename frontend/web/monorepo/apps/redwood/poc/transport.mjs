// Bridge transport — contract CONFIRMED against demo/demo-vb (see DESIGN-NOTES
// "Transport"): shell bootstrap through components/_/action; everything else through
// sync/{route|_no_route} with actionId '' on loads. SINGLE source: this file is
// tested in Node (capture.mjs) and packaged as AMD for VB (make-amd.mjs).

import { actionFailed, actionSucceeded, isErrorAnswer } from './polling.mjs'
import { reduceContexts, mediatorOf, HOST_ID, formLookupsOf, markLookupsLoaded, actionTransportOf, splitNestedApps, onLoadTriggers, listingOf, pendingSubresourcesOf, withInitialValues, inlineIslandOf } from './reduceContexts.mjs'
import { fetchWithPolicy, pendingActions, isIdempotentAction, currentView, isViewStale, staleResponseError } from './resilience.mjs'
import { awaitBundle, hasBundle, bundledIncrementFor } from './bundle.mjs'
import { asSection, labelledByShell, markHidden, unavailableMount, localMenuOptionOf, routeCollisionsOf, routeCollisionMessage } from './navTree.mjs'
import { currentMount, pathOfRoute } from './mount.mjs'
import { restAnswerOf, loadRestOptions, adoptAppSources, adoptReferencedSources } from './restSources.mjs'
import { observeWireVersion } from './wireVersion.mjs'
import { noteDocumentBase } from './files.mjs'
import { trustShellBase, trustDeclaredRemoteBases, isTrustedOrigin } from './hostHeaders.mjs'
import { neutralizeUntrusted } from './untrusted.mjs'

/** POST {base}/mateu/v3/sync/{route} — the standard request (= AxiosMateuApiClient.runAction).
 *  It goes out TIED to the current screen (resilience.currentView): if another one is showing by
 *  the time it answers, the response is dropped silently. Background ones (quiet/isolated: widgets,
 *  remote menus) belong to no screen; `options.view` sets it by hand (null: none). */
export async function callMateu(base, body, options = {}) {
  const view = options.view !== undefined ? options.view
    : (options.quiet || options.isolated) ? null : currentView()
  const bare = (body.route || '').replace(/^\//, '')
  noteDocumentBase(base) // a parked Document is requested from THIS backend
  const res = await fetchWithPolicy(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appState: {},
      componentState: {},
      parameters: {},
      initiatorComponentId: '',
      consumedRoute: '',
      serverSideType: undefined,
      ...body,
      route: bare ? `/${bare}` : '',
    }),
  }, { actionId: body.actionId, timeoutMillis: options.timeoutMillis, idempotent: options.idempotent, quiet: options.quiet, isolated: options.isolated, view })
  // R1: an origin the shell does not trust (an agent-named base, a remote's own remote) answers
  // through the untrusted strip: what it sends cannot run code in this tab
  const increment = answeredBy(base, await res.json())
  observeWireVersion(increment)
  // the catalogue entries this response names by ref (a page with no app shell gets them no other way)
  adoptReferencedSources(increment)
  // the body takes time too: whatever arrives after the screen changed is not applied either
  if (isViewStale(view)) throw staleResponseError(body.actionId)
  return increment
}

/** An answer as it may be painted: as written from a trusted origin (hostHeaders.isTrustedOrigin),
 *  through the untrusted strip (untrusted.mjs) from any other. */
export function answeredBy(base, increment) {
  return isTrustedOrigin(`${base}/mateu/v3/`) ? increment : neutralizeUntrusted(increment)
}

/** Shell bootstrap: the root App only resolves through the generic endpoint.
 *  Static-bundle: the shell is NOT exported (the bundle stores route loads, not the App's __load__),
 *  so in hybrid mode (bundle + backend) the menu comes from the backend as always; but if the
 *  backend is NOT there (pure static deployment) and the bundle carries the root route, it falls
 *  back to it so the app boots anyway. Only on failure — the happy path does not change. */
export async function bootstrapShell(base, initiator = 'shell') {
  // the shell's own backend is trusted with the user's token (hostHeaders.storedTokenMayGoTo)
  trustShellBase(base)
  await awaitBundle()
  // with a bundle that can boot the shell by itself, the backend is only PROBED: on a static host
  // its absence is the normal case, not an error band nor a sign of being offline
  const fallback = hasBundle() ? bundledIncrementFor('', initiator) : undefined
  try {
    const res = await fetchWithPolicy(`${base}/mateu/v3/components/_/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
    }, fallback ? { actionId: '__load__', quiet: true, isolated: true } : { actionId: '__load__' })
    const increment = await res.json()
    observeWireVersion(increment)
    adoptReferencedSources(increment)
    // the App carries the REST source catalogue (restSources) and the sample-mode opt-in
    return adoptAppSources(increment)
  } catch (e) {
    if (fallback) return fallback
    throw e
  }
}

/** INTERNAL route of a mediator/island after a state._route flip: outbound base +
 *  flip + query markers (the ?_embeddedMediator=1&_inline=1 must keep travelling). */
export function composeInnerRoute(outboundRoute, flip) {
  if (!flip || flip === '/' ) return outboundRoute
  const queryIndex = outboundRoute.indexOf('?')
  const base = queryIndex >= 0 ? outboundRoute.slice(0, queryIndex) : outboundRoute
  const query = queryIndex >= 0 ? outboundRoute.slice(queryIndex) : ''
  return base + flip + query
}

/**
 * The base of a PAGE crud to which its internal routes are appended (`/QN29HB`, `/QN29HB/edit`,
 * `/new`): its `consumedRoute`, not the route it was loaded with. Coming from the listing both
 * match (`/booking/bookings`), but a detail opened by direct link is loaded with
 * `/booking/bookings/QN29HB` and what is consumed is `/booking/bookings`: appending the Edit's
 * `/QN29HB/edit` there gave `/booking/bookings/QN29HB/QN29HB/edit`. Only when what is consumed is
 * a prefix of the route; an embedded mediator (no consumedRoute) keeps its route and its query markers.
 */
export function mediatorBaseOf(outbound, fallbackRoute = '') {
  const o = outbound || {}
  const own = o.route && o.route !== 'null' && o.route !== 'undefined' ? o.route : ''
  const loaded = own || (fallbackRoute && fallbackRoute !== 'null' ? fallbackRoute : '')
  // the ROOT of the mount is "" (a crud at @UI("")): "/" + "/P-002" composed "//P-002"
  const route = loaded === '/' ? '' : loaded
  const consumed = o.consumedRoute
  if (o.mountRoot) {
    const q = route.indexOf('?')
    return q >= 0 ? route.slice(q) : ''
  }
  if (!consumed || consumed === '_empty' || !consumed.startsWith('/')) return route
  const queryIndex = route.indexOf('?')
  const path = queryIndex >= 0 ? route.slice(0, queryIndex) : route
  const query = queryIndex >= 0 ? route.slice(queryIndex) : ''
  if (path !== consumed && path.startsWith(consumed + '/')) return consumed + query
  return route
}

/**
 * Does the response to an action ask to reload the mediator's internal route? Returns that route,
 * or null if there is no flip.
 *
 * A PAGE crud does not answer with the detail: it answers a STATE-ONLY fragment whose `_route`
 * points at it (row click → `/2CSXZN`, New → `/new`), meaning "reload my internal route
 * with this state". Whoever does not follow the flip is left looking at the listing: the request
 * goes out, the server answers 200, and nothing happens — the hardest failure of all to spot.
 *
 * The criterion is SEMANTIC (compare the `_route` value before and after), not by identity:
 * VB objects are proxies and references say nothing.
 */
export function routeFlipOf(previousState, nextCtx, increment, fallbackRoute = '') {
  const stateOnly = increment && (increment.fragments || []).length > 0
    && (increment.fragments || []).every((f) => !f.component)
  if (!stateOnly || !nextCtx || !nextCtx.state) return null
  const flip = nextCtx.state._route
  const previous = previousState ? previousState._route : undefined
  if (flip == null || flip === previous) return null
  const outbound = nextCtx.outbound || {}
  return composeInnerRoute(mediatorBaseOf(outbound, fallbackRoute), flip)
}

// ── a mount whose @UI is not an App ───────────────────────────────────────────────────────────
// @UI("/hello") on a plain page, @UI("/products") on a crud: the bootstrap (components/_/action)
// answers the page itself or nothing at all ("__load__ not supported by ProductsCrud") — never an
// App with a menu —, so there is no shell and no home route. Its home is the mount's own UI, which
// the sync endpoint resolves for a FRESH load: route '' with consumedRoute '_empty', exactly what
// the web renderer sends on a deep link or a reload. The shell remembers that the mount has no App
// and the home load ('' or '/') goes out that way.
let mountWithoutApp = false

/** What a mediator's content load consumes: its root route, else the route it was loaded with —
 *  where the root of the mount is "" (what the web client sends), never "/": a crud mounted at
 *  @UI("") read "/" as a record id and answered its own home with "Not found". */
export function mediatorConsumedRoute(info, effectiveRoute) {
  if (info && (info.rootRoute || info.rootKnown)) return info.rootRoute
  return !effectiveRoute || effectiveRoute === '/' ? '' : effectiveRoute
}

/** Did the bootstrap answer an App (the root of a console with its menu)? */
export function bootstrapHasApp(increment) {
  const fragments = (increment && increment.fragments) || []
  // a MEDIATOR-variant App is the chromeless wrapper of a crud mounted as the @UI — not a console
  // with a menu: the mount has no shell, exactly as when the bootstrap answered a page
  const isShellApp = (metadata) => !!metadata && metadata.type === 'App' && metadata.variant !== 'MEDIATOR'
  return fragments.some((f) => {
    const c = f && f.component
    if (!c) return false
    if (isShellApp(c.metadata)) return true
    return (c.children || []).some((child) => child && isShellApp(child.metadata))
  })
}

export function setMountWithoutApp(value) { mountWithoutApp = !!value }

/** Load of a route (actionId '': the real __load__; extra = consumedRoute/serverSideType…).
 *  Static-bundle: if a manifest is loaded, the load is answered FROM the bundle (no backend);
 *  it waits for the in-flight manifest fetch (the first load may get ahead of it) and, if the route
 *  is not in the bundle, falls back to the backend — so a hybrid deployment (bundle + backend) keeps working. */
export const loadRoute = async (base, route, initiator = '', extra = {}) => {
  // the home of a mount whose @UI is not an App: a fresh load of the mount — see bootstrapHasApp
  if ((!route || route === '/') && mountWithoutApp && !extra.consumedRoute && extra.serverSideType == null) {
    extra = { ...extra, consumedRoute: '_empty' }
  } else if (mountWithoutApp && route && route !== '/') {
    // …and below the mount (a deep link to /products/new): with no App to resolve it relative to,
    // the server knows the crud's inner routes by their full path, mount included
    route = pathOfRoute(route, currentMount())
    // a crud mounted at the ROOT (@UI("")) has no path prefix the server could match /P-001 by:
    // the deep link goes out as a FRESH load of the mount, as the web client sends it — the
    // answer is the crud's mediator, whose home is the record (followed in loadRouteInto)
    if (!currentMount() && !extra.consumedRoute && extra.serverSideType == null) {
      extra = { ...extra, consumedRoute: '_empty' }
    }
  }
  await awaitBundle()
  if (hasBundle()) {
    // a load INTO the shell (any but the fresh '_empty' one) gets the route's content, never the
    // shell aimed at it
    const bundled = bundledIncrementFor(route, initiator, { content: extra.consumedRoute !== '_empty' })
    if (bundled) return bundled
  }
  return callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })
}

/** Outgoing action: builds the request from the CONTEXT — "send the state you already have".
 *  The 4 route fields come from the `outbound` that loadRouteInto stamped when loading the
 *  context (a mediator needs consumedRoute + serverSideType on actions too). */
export function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
  // A REST-backed action never reaches the Mateu server as itself: the `search` of a listing with a
  // rowsSource, and any action declaring a restAction (the route's `__restdata__` load included),
  // are answered here — direct with fetch, or proxied through the reserved `__restfetch__` action
  // (restSources.mjs). The increment is shaped like the server's, so the chains do not know.
  const restAnswer = restAnswerOf(ctx, actionId, componentState, {
    route,
    appState: (extra && extra.appState) || {},
    server: (parameters, idempotent) => runMateuAction(base, ctx, route, '__restfetch__', componentState,
      { ...extra, parameters, idempotent: !!idempotent }),
  })
  if (restAnswer) return restAnswer
  // the OnSuccess ones (periodic refresh) are read from the context that LAUNCHES the action
  const source = ctx
  // the action goes to the ServerSide that DECLARES it (the view, not the mediator that loaded it): also
  // the triggers — the «refresh» OnLoad of a view loaded by a crud —, not only the buttons
  ctx = actionTransportOf(ctx, actionId)
  const outbound = (ctx && ctx.outbound) || {}
  // A surface loaded from another pod keeps talking to THAT pod. The base travels in the
  // outbound for the same reason as the 4 route fields: whoever fires an action (a listing's
  // `search` trigger, a toolbar button) knows which context it comes from, but
  // not which backend it came from — and sending it to the shell answers it empty, with no error.
  base = outbound.baseUrl != null ? outbound.baseUrl : base
  const initiator = (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || ''
  // Double-submit guard. A read is EXEMPT from exclusivity: the guard exists because
  // a second POST of a write means a second row, whereas a second
  // read only means fresher data — and blocking them would break type-ahead, where the
  // search for "mad" would be dropped because the one for "ma" is in flight.
  const exclusive = !isIdempotentAction(actionId, extra && extra.idempotent)
  const key = pendingActions.key(initiator, actionId)
  if (exclusive && !pendingActions.begin(key)) {
    // Duplicate: dropped BEFORE building the request.
    return Promise.resolve(null)
  }
  const release = () => { if (exclusive) pendingActions.end(key) }
  return callMateu(base, {
    route: outbound.route || route,
    consumedRoute: outbound.consumedRoute || '',
    actionId,
    componentState: componentState || (ctx && ctx.state) || {},
    serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
    initiatorComponentId: initiator,
    ...extra,
  }, { timeoutMillis: extra && extra.timeoutMillis, idempotent: extra && extra.idempotent })
    .then((inc) => {
      release()
      if (inc) (isErrorAnswer(inc) ? actionFailed : actionSucceeded)(source, actionId)
      return inc
    }, (e) => { release(); throw e })
}

/**
 * Loads the options of a context's REMOTE lookups that do not have them yet (the editable
 * fields of its form and the filters of its listing; formLookupsOf): one empty search
 * per lookup (`search-<field>`, up to 200), in parallel, against the ServerSide that declares it
 * — or the mediator, which resolves it with its filters class —, with the context's state.
 * Each response leaves its options in ctx.data[field]; the failing ones are marked as loaded too,
 * so they are not repeated on every action. Returns the new registry.
 */
export async function loadLookups(base, reg, ctxId = HOST_ID, opts = {}) {
  // the options of the fields backed by a REST source (optionsSource) — direct, or proxied
  reg = await loadRestOptions(reg, ctxId, {
    draft: opts.draft,
    appState: opts.appState || {},
    server: (parameters, idempotent) => {
      const owner = reg.contexts[ctxId]
      return runMateuAction(base, owner, opts.route || '', '__restfetch__', { ...(owner.state || {}), ...(opts.draft || {}) },
        { parameters, appState: opts.appState || {}, idempotent: !!idempotent })
    },
  })
  const ctx = reg && reg.contexts && reg.contexts[ctxId]
  const pending = formLookupsOf(ctx)
  if (!pending.length) return reg
  const state = { ...(ctx.state || {}), ...(opts.draft || {}) }
  const found = await Promise.all(pending.map((lookup) =>
    runMateuAction(base, actionTransportOf(ctx, lookup.actionId), opts.route || '', lookup.actionId, state, {
      parameters: { searchText: '', fieldId: lookup.fieldId, size: 200, page: 0 },
      appState: opts.appState || {},
      idempotent: true,
    }).catch(() => null)))
  let out = reg
  for (const inc of found) {
    // only the DATA: a failing lookup must not paint its error over the screen
    if (inc) out = reduceContexts(out, { fragments: (inc.fragments || []).filter((f) => !f.component) })
  }
  return markLookupsLoaded(out, ctxId, pending.map((lookup) => lookup.fieldId))
}

/** SSE action (Action.sse(true), e.g. LongTask): POST {base}/mateu/v3/sse/{route} with
 *  Accept text/event-stream — the response is a STREAM of UIIncrements (data: …\n\n).
 *  Increments are DELIVERED LIVE via `extra.onIncrement(inc)` (async; the LongTask's progress
 *  dialog is painted while the stream advances); if the callback returns
 *  true, the increment is considered CONSUMED and excluded from the returned list. Without a
 *  callback, classic behaviour: full list at the end. */
export async function runMateuActionSse(base, ctx, route, actionId, componentState, extra = {}) {
  const { onIncrement, ...bodyExtra } = extra || {}
  // tied to the current screen, like callMateu: each increment is checked as it arrives
  const view = currentView()
  ctx = actionTransportOf(ctx, actionId)
  const outbound = (ctx && ctx.outbound) || {}
  base = outbound.baseUrl != null ? outbound.baseUrl : base
  const effectiveRoute = outbound.route || route || ''
  const bare = effectiveRoute.replace(/^\//, '')
  noteDocumentBase(base)
  // No timeout: a LongTask keeps the stream open by design, so a ceiling would
  // kill it halfway. It still goes through the policy so the failure arrives classified.
  const res = await fetchWithPolicy(`${base}/mateu/v3/sse/${bare || '_no_route'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      appState: {},
      componentState: componentState || (ctx && ctx.state) || {},
      parameters: {},
      initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
      consumedRoute: outbound.consumedRoute || '',
      serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
      ...bodyExtra,
      route: bare ? `/${bare}` : '',
      actionId,
    }),
  }, { actionId, timeoutMillis: -1, view })
  const increments = []
  let reader
  const handle = async (raw) => {
    const line = raw.trim()
    if (!line.startsWith('data:')) return
    if (isViewStale(view)) {
      if (reader && reader.cancel) reader.cancel().catch(() => undefined)
      throw staleResponseError(actionId)
    }
    const inc = answeredBy(base, JSON.parse(line.slice(5).trim()))
    observeWireVersion(inc)
    adoptReferencedSources(inc)
    const consumed = onIncrement ? await onIncrement(inc) : false
    if (!consumed) increments.push(inc)
  }
  if (res.body && res.body.getReader) {
    reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let cut
      while ((cut = buffer.indexOf('\n\n')) >= 0) {
        await handle(buffer.slice(0, cut))
        buffer = buffer.slice(cut + 2)
      }
    }
    if (buffer.trim()) await handle(buffer)
  } else {
    for (const chunk of (await res.text()).split('\n\n')) await handle(chunk)
  }
  return increments
}

/**
 * A mediator whose WRAPPER arrives as a chrome App (ClientSide type App) instead of wrapped in a
 * ServerSide. It is the shape the backend sends today when opening a menu option: the same App as in
 * the bootstrap, but requested for a SUB-route (route below rootRoute). reduceContexts absorbs
 * it as the shell and the context stays empty, so mediatorOf(host) does not detect it and the 2nd load
 * —the one with the real content: the crud's search form + listing— never fires. So it is read from the
 * increment: if it carries an App whose rootRoute is a prefix of the requested route, there is content to fetch.
 *
 * The app root (route === rootRoute) is the shell/home and does NOT go through here: the
 * bootstrap resolves it. Only a navigation below the root needs the second hop.
 */
function mediatorFromShellApp(increment, route) {
  for (const fr of increment?.fragments || []) {
    const c = fr.component
    const md = c?.metadata
    if (c?.type !== 'ClientSide' || md?.type !== 'App') continue
    const rootRoute = md.rootRoute || ''
    if (rootRoute && route && route.startsWith(`${rootRoute}/`)) {
      return {
        rootRoute: md.homeConsumedRoute || rootRoute,
        serverSideType: md.homeServerSideType ?? md.serverSideType,
      }
    }
  }
  return null
}

/** Did the load answer the server's «Not found.» (a lone Text, no ServerSide)? */
export function isServerNotFound(ctx) {
  const t = ctx && ctx.tree
  return !!(t && t.type === 'ClientSide' && t.metadata && t.metadata.type === 'Text'
    && /^not found\.?$/i.test(String(t.metadata.text || '').trim()))
}

/** The TERMINAL route of a menu entry inside a group (/gestion/island-host → /island-host),
 *  or null if it hangs from no group. */
export function terminalMenuRouteOf(menu, route) {
  const path = String(route || '').split('?')[0]
  const query = String(route || '').slice(path.length)
  let found = null
  const visit = (options, parent) => {
    for (const o of options || []) {
      const r = o && (o.route || o.path)
      if (!r) continue
      if (parent && r === path && r.indexOf(parent + '/') === 0) found = r.slice(parent.length) + query
      visit(o.submenus || o.submenu, r)
    }
  }
  visit(menu, '')
  return found
}

/**
 * Loads a LOCAL MENU route: the composed one with the serverSideType of the app that declares it (what
 * Vaadin does when the option is chosen); if the server does not recognise it —a RouteLink placed in a
 * group points at an absolute route that is not a menu path— it retries through the terminal one.
 * A route that is not from the menu is loaded as is.
 */
export async function loadMenuRouteInto(base, reg, route, targetId = '', extra = {}) {
  const shell = (reg && reg.shell) || {}
  const option = localMenuOptionOf(shell.menu, route)
  if (!option) return loadRouteInto(base, reg, route, targetId, extra)
  const next = await loadRouteInto(base, reg, route, targetId,
    { ...extra, serverSideType: option.serverSideType || shell.serverSideType })
  const terminal = terminalMenuRouteOf(shell.menu, route)
  if (terminal && isServerNotFound(next.contexts[targetId === '' ? HOST_ID : targetId]))
    return loadRouteInto(base, reg, terminal, targetId, extra)
  return next
}

/**
 * Loads a route INTO the registry and follows the mediator if there is one (crud/island: the 1st load
 * returns the chromeless App; the content arrives with consumedRoute + serverSideType).
 * Returns the new registry. targetId = key of the target context (initiator).
 */
export async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
  // live reload (liveReload.mjs): what was typed travels with the load — a view model is hydrated with
  // it — and is put back over the response, so a definition-only page keeps it
  const liveState = extra && extra.liveState
  if (extra && 'liveState' in extra) {
    const { liveState: _omit, ...rest } = extra
    extra = liveState ? { ...rest, componentState: liveState } : rest
  }
  // the raw INCREMENT is kept: the 1st load of a menu option arrives as a mediator App
  // (ClientSide type App), which reduceContexts routes to the CHROME (shell) and not to the context —
  // mediatorOf(host) does not see it, so the mediator has to be taken from the increment itself.
  let firstIncrement = await loadRoute(base, route, targetId, extra)
  const ctxId = targetId === '' ? HOST_ID : targetId
  let outbound = { route, consumedRoute: '', serverSideType: undefined, baseUrl: base }
  // The route CHAIN (P1): a record whose tabs are pages arrives as one or more NESTED Apps
  // (the master) before the screen of its slot. Each one is a LEVEL (title +
  // tabs), not the shell; its home is followed until the content is reached.
  const shellType = reg && reg.shell ? reg.shell.serverSideType : undefined
  const appLevels = []
  // the route that is really loaded: a master reached on its own (/customers/7) opens its default
  // tab (/customers/7/orders)
  let effectiveRoute = route
  for (let hop = 0; hop < 4; hop++) {
    const split = splitNestedApps(firstIncrement, shellType, route)
    if (!split.levels.length) break
    appLevels.push(...split.levels)
    const home = split.levels[split.levels.length - 1].home
    effectiveRoute = home.route || effectiveRoute
    outbound = { route: effectiveRoute, consumedRoute: home.consumedRoute || '', serverSideType: home.serverSideType, baseUrl: base }
    firstIncrement = await loadRoute(base, effectiveRoute, targetId, {
      ...extra,
      consumedRoute: outbound.consumedRoute,
      serverSideType: outbound.serverSideType,
    })
  }
  let next = reduceContexts(reg, firstIncrement)
  // the component's ACTIONS (with their sse flag) travel in the mediator's WRAPPER —
  // the content load loses them, so they are kept here
  const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
  const wrapperActions = (wrapperTree && wrapperTree.actions) || []
  const info = mediatorOf(next.contexts[ctxId]) || mediatorFromShellApp(firstIncrement, effectiveRoute)
  if (info) {
    // the home of a mount whose @UI is a crud (route '' or '/', a fresh load): the mediator names
    // the route of its content — the crud's own path
    if ((!effectiveRoute || effectiveRoute === '/') && info.homeRoute) effectiveRoute = info.homeRoute
    outbound = {
      route: effectiveRoute,
      consumedRoute: mediatorConsumedRoute(info, effectiveRoute),
      serverSideType: info.serverSideType,
      baseUrl: base,
      // a crud mounted at the ROOT consumes "": its inner routes (/P-002, /P-002/edit) are
      // composed against the root, not against the record a deep link loaded (mediatorBaseOf)
      mountRoot: !!(info.rootKnown && info.rootRoute === ''),
    }
    next = reduceContexts(
      next,
      await loadRoute(base, effectiveRoute, targetId, {
        ...extra,
        consumedRoute: outbound.consumedRoute,
        serverSideType: outbound.serverSideType,
      }),
    )
  }
  // the context REMEMBERS how it was loaded: outgoing actions rebuild the route fields
  // from here (structural sharing: only this entry's ref changes).
  // sseActionIds: actions announced Action.sse(true) — they go through the /sse endpoint
  next = {
    ...next,
    contexts: {
      ...next.contexts,
      [ctxId]: {
        ...next.contexts[ctxId],
        outbound,
        sseActionIds: wrapperActions.filter((a) => a && a.sse).map((a) => a.id),
        // the page's OWN actions (id + lowered flow): owner first over the action catalogue
        declaredActions: wrapperActions.filter((a) => a && a.id)
          .map((a) => ({ id: a.id, commands: a.commands || null })),
      },
    },
  }
  if (liveState && next.contexts[ctxId]) {
    next = {
      ...next,
      contexts: {
        ...next.contexts,
        [ctxId]: { ...next.contexts[ctxId], state: { ...(next.contexts[ctxId].state || {}), ...liveState } },
      },
    }
  }
  // the app levels (masters) of the HOST screen: one tab bar per level
  if (targetId === '') next = { ...next, appLevels, loadedRoute: effectiveRoute }
  return next
}

/**
 * Loads a @Subresource (subresourceIslandOf) into ITS context: loads it by its type — without the
 * mediator dance: the App wrapping it already says which class it is — with the state the parent seeds,
 * and its OnLoad search (the rows). Returns the new registry.
 */
export async function loadSubresource(base, reg, sub, extra = {}) {
  // an inline island arrived with its tree: nothing to load, its context comes from the node
  if (sub.inline) return registerInlineIsland(base, reg, sub, extra)
  // a MicroFrontend lives in ITS backend (its baseUrl), with the app state it was given
  if (sub.baseUrl) base = sub.baseUrl
  if (sub.appState) extra = { ...extra, appState: { ...(extra.appState || {}), ...sub.appState } }
  const outbound = { route: sub.route, consumedRoute: sub.consumedRoute, serverSideType: sub.serverSideType, baseUrl: base }
  let next = reduceContexts(reg, await loadRoute(base, sub.route, sub.id, {
    ...extra,
    consumedRoute: sub.consumedRoute,
    serverSideType: sub.serverSideType,
    componentState: sub.componentState || {},
  }))
  next = { ...next, contexts: { ...next.contexts, [sub.id]: { ...next.contexts[sub.id], outbound } } }
  for (const triggerActionId of onLoadTriggers(next.contexts[sub.id])) {
    const ctx = next.contexts[sub.id]
    const listing = listingOf(ctx)
    const componentState = { ...(sub.componentState || {}), ...(ctx.state || {}), page: 0, size: (listing && listing.pageSize) || 10 }
    const increment = await runMateuAction(base, ctx, sub.route, triggerActionId, componentState, extra)
    if (increment) next = reduceContexts(next, increment)
  }
  return next
}

/**
 * Loads the @Subresources the content leaves in view and that are not loaded yet (those of the
 * active tab: what is in another tab waits until it is opened). One that fails stays as a
 * gap: it does not bring the screen down.
 */
/**
 * An action of a surface that is neither the host nor the island (a MicroFrontend): posted to that
 * surface with its own state and outbound (route, consumed route, server-side type, base), and the
 * increment reduced into the registry. Returns the new registry (the chain re-projects the content).
 */
export async function runSurfaceAction(reg, surfaceId, actionId, parameters, extra = {}) {
  const ctx = reg && reg.contexts && reg.contexts[surfaceId]
  if (!ctx || !actionId) return reg
  const outbound = ctx.outbound || {}
  const increment = await runMateuAction(outbound.baseUrl, ctx, outbound.route || '', actionId, ctx.state || {},
    { ...extra, parameters: parameters || {} })
  if (!increment) return reg
  // the increment is reduced AS the surface's (initiator): its MarkAsClean/Dirty land on it and the
  // bus events it emits carry it as their source
  let next = reduceContexts(reg, increment, { initiator: surfaceId })
  const toasts = [...(next.effects.toasts || [])]
  // what it emitted (a DispatchEvent, a CloseModal with an event) reaches every subscriber of the
  // page — the host, the other islands — by @SubscribeTo scope; their answers are reduced too
  next = await deliverBusEvents(next, next.effects.events || [], { base: outbound.baseUrl, appState: extra.appState })
  toasts.push(...(next.effects.toasts || []))
  // an answer that re-rendered the host brings fresh inline islands: register them (no I/O)
  next = await ensureInlineIslands(outbound.baseUrl, next, extra)
  return { ...next, effects: { ...next.effects, toasts } }
}

/**
 * An INLINE island's context, from the node it arrived as (inlineIslandOf): its tree, its state
 * (initialData), and the outbound an action from it needs — the host's route and consumed route
 * (what the web client's nested mateu-component sends: its ux's) with ITS serverSideType, so the
 * server instantiates the island's class and answers to its id (the initiator). Then its OnLoad
 * triggers, like a loaded surface's. No request is made for the island itself.
 */
export async function registerInlineIsland(base, reg, sub, extra = {}) {
  const node = sub.inline
  const host = (reg.contexts || {})[HOST_ID] || {}
  const hostOutbound = host.outbound || {}
  const outbound = {
    route: hostOutbound.route || '',
    consumedRoute: hostOutbound.consumedRoute || '',
    serverSideType: sub.serverSideType || node.serverSideType,
    baseUrl: hostOutbound.baseUrl != null ? hostOutbound.baseUrl : base,
  }
  const previous = (reg.contexts || {})[sub.id]
  let next = {
    ...reg,
    contexts: {
      ...reg.contexts,
      [sub.id]: {
        id: sub.id,
        kind: 'island',
        tree: node,
        // a re-render of the host re-sends the island with its CURRENT state: it wins over what the
        // previous incarnation held
        state: withInitialValues(node, { ...((previous && previous.state) || {}), ...(sub.componentState || {}) }),
        data: (previous && previous.data) || {},
        dirty: false,
        outbound,
      },
    },
  }
  for (const triggerActionId of onLoadTriggers(next.contexts[sub.id])) {
    const ctx = next.contexts[sub.id]
    const increment = await runMateuAction(outbound.baseUrl, ctx, outbound.route, triggerActionId, ctx.state || {}, extra)
    if (increment) next = reduceContexts(next, increment, { initiator: sub.id })
  }
  return next
}

/** Every inline island of the host tree (inlineIslandOf), in document order. */
export function inlineIslandsOf(tree) {
  const out = []
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach((x) => walk(x, false)); return }
    if (!isRoot && n.type === 'ServerSide') {
      const inline = inlineIslandOf(n)
      if (inline) out.push(inline)
      return // another surface: its own islands are its business
    }
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v, false)
  }
  walk(tree, true)
  return out
}

/** Registers the host's inline islands that have no context yet (after a host re-render). */
export async function ensureInlineIslands(base, reg, extra = {}) {
  const host = (reg.contexts || {})[HOST_ID]
  let next = reg
  for (const inline of inlineIslandsOf(host && host.tree)) {
    if (!next.contexts[inline.id]) next = await registerInlineIsland(base, next, inline, extra)
  }
  return next
}

// ── the event bus (@SubscribeTo) across the page's surfaces ──────────────────────────────────────
//
// Vaadin dispatches a real DOM CustomEvent and each component's trigger decides by scope; here the
// surfaces are registry contexts, so the bus is a walk over them. `source` is the context that
// emitted (the reducer stamps the initiator). The listener's trigger says what it hears:
//   DOCUMENT (default)  anything, whoever sent it;
//   COMPONENT `from`    only an emitter NAMED `from` (@Emits(name), else its serverSideType);
//   SELF                what bubbles up from inside it — an island of the host is inside the host;
//                       a surface also hears what it emits itself.

/** The emitter's name on the bus: @Emits(name), else its class (what the web stamps as __source). */
export function busSourceNameOf(ctx) {
  const tree = ctx && ctx.tree
  return (tree && (tree.emitsName || tree.serverSideType)) || ''
}

/** Is `innerId` a surface INSIDE `outerId` (the host contains every island; a surface contains itself)? */
export function surfaceWithin(reg, innerId, outerId) {
  if (!innerId || !outerId) return false
  if (innerId === outerId) return true
  if (outerId === HOST_ID) return true // every other context of the registry lives in the host's page
  const outer = (reg.contexts || {})[outerId]
  return !!(outer && outer.tree && inlineIslandsOf(outer.tree).some((i) => i.id === innerId))
}

/** The [{ ctxId, actionId }] a bus event reaches, by each listener's @SubscribeTo scope. */
export function busSubscribersOf(reg, event, { skipHost = false } = {}) {
  const out = []
  const contexts = (reg && reg.contexts) || {}
  const sourceCtx = event.source ? contexts[event.source] : null
  const sourceName = busSourceNameOf(sourceCtx)
  for (const ctxId of Object.keys(contexts)) {
    if (skipHost && ctxId === HOST_ID) continue
    const ctx = contexts[ctxId]
    for (const t of ((ctx && ctx.tree && ctx.tree.triggers) || [])) {
      if (t.type !== 'OnCustomEvent' || t.eventName !== event.name || !t.actionId) continue
      const scope = String(t.source || 'DOCUMENT').toUpperCase()
      if (scope === 'COMPONENT' && !(t.from && sourceName && t.from === sourceName)) continue
      if (scope === 'SELF' && !(event.source && surfaceWithin(reg, event.source, ctxId))) continue
      out.push({ ctxId, actionId: t.actionId })
    }
  }
  return out
}

/**
 * Runs the subscribed actions of every surface a bus event reaches (busSubscribersOf) and reduces
 * their answers; the event's detail travels as the action's parameters (plus `__source`, like the
 * web's). `skipHost`: the host's own subscribers are run by the caller (runMateuAction.js does, with
 * its listing paging) — the islands' are not. Returns the new registry; its effects are the last
 * answer's, with every toast of the round accumulated.
 */
export async function deliverBusEvents(reg, events, { base, appState, skipHost = false } = {}) {
  let next = reg
  const toasts = []
  for (const event of events || []) {
    for (const { ctxId, actionId } of busSubscribersOf(next, event, { skipHost })) {
      const ctx = next.contexts[ctxId]
      if (!ctx) continue
      const outbound = ctx.outbound || {}
      const detail = event.detail && typeof event.detail === 'object' ? event.detail : {}
      const sourceName = busSourceNameOf(next.contexts[event.source])
      const parameters = { ...detail, ...(sourceName && detail.__source == null ? { __source: sourceName } : {}) }
      const increment = await runMateuAction(outbound.baseUrl != null ? outbound.baseUrl : base, ctx, outbound.route || '',
        actionId, { ...(ctx.state || {}), ...detail }, { appState, parameters })
      if (!increment) continue
      next = reduceContexts(next, increment, { initiator: ctxId })
      toasts.push(...(next.effects.toasts || []))
    }
  }
  return next === reg ? reg : { ...next, effects: { ...next.effects, toasts } }
}

export async function loadSubresources(base, reg, blocks, extra = {}) {
  let next = reg
  for (const sub of pendingSubresourcesOf(blocks, next.contexts)) {
    try {
      next = await loadSubresource(base, next, sub, extra)
    } catch (ignored) { /* the error band already reports it (onSettle) */ }
  }
  return next
}

/**
 * Which backend a surface was loaded from, or undefined if not known yet.
 *
 * An island is loaded with `loadRouteInto`, which receives the base as an argument: the chain that
 * fires it knows the context id, not the pod. By asking the HOST (the default value)
 * the island is loaded from wherever the screen containing it came from, which is always what it wants.
 */
export function baseOf(reg, ctxId = HOST_ID) {
  const ctx = reg && reg.contexts && reg.contexts[ctxId]
  return ctx && ctx.outbound ? ctx.outbound.baseUrl : undefined
}

// ── federated menus ────────────────────────────────────────────────────────────────────────
//
// A shell declares sections served by ANOTHER pod: `RemoteMenu("/_workflow")`. The tree arriving
// in the bootstrap carries those options marked `remote` and WITHOUT children — the children belong
// to the pod, and they have to be fetched. Until now this renderer did not do it: it painted the
// label the shell had written and nothing below, which reads as "that service has no screens"
// instead of "nobody has asked it".
//
// What follows is the easy half. The other is in navigation: an entry brought from another pod
// can only be loaded by calling THAT pod, and this bridge always called the shell's base. That is
// why each adopted option is recorded in `remoteRoutes`, and the navigation chain looks up
// there where it has to go. Without that second half, expanding the menu is worse than not expanding it:
// entries appear that lead nowhere when clicked.

/** Menu route → where it really lives. Filled by expandRemoteMenus; read by navigation. */
const remoteRoutes = new Map()

/**
 * Where a route lives, or undefined if the shell itself serves it.
 *
 * It also matches by PREFIX, with the longest registered entry that fits: only MENU routes reach the
 * registry (`/workflow/processes`), and everything hanging from them —a process's
 * detail, `/new`, `/{id}/edit`— lives in the same pod. Without this, a deep-link to
 * `/workflow/processes/<id>` went to the shell's backend, which answers "Not found.".
 */
export function remoteRouteOf(route) {
  if (route == null) return undefined
  const bare = String(route).replace(/^\//, '')
  const exact = remoteRoutes.get(route) || remoteRoutes.get(bare)
  if (exact) return exact
  let best = null
  let bestLength = -1
  for (const [registered, descriptor] of remoteRoutes) {
    const prefix = String(registered).replace(/^\//, '')
    if (!prefix || prefix.length <= bestLength) continue
    if (bare === prefix || bare.indexOf(prefix + '/') === 0) {
      best = descriptor
      bestLength = prefix.length
    }
  }
  return best || undefined
}

/**
 * Records which pod a route that did NOT come from the menu goes to: the navigation requested by a
 * remote widget (the inbox badge's link emits navigation-requested with its baseUrl and its
 * serverSideType). A route the menu already registered stays as it is — the menu rules.
 */
export function registerRemoteRoute(route, descriptor) {
  if (!route || !descriptor || !descriptor.baseUrl || remoteRouteOf(route)) return false
  const entry = {
    baseUrl: descriptor.baseUrl,
    consumedRoute: descriptor.consumedRoute || '',
    serverSideType: descriptor.serverSideType,
    uriPrefix: descriptor.uriPrefix || '',
  }
  remoteRoutes.set(route, entry)
  remoteRoutes.set(String(route).replace(/^\//, ''), entry)
  return true
}

const childrenOf = (option) => option.submenus || option.submenu || []

/** The remote options of the tree, at any depth.
 *  It does not descend INTO a remote one: whatever hangs from it belongs to the pod, which has not answered yet. */
function collectRemoteMenus(menu, found = []) {
  for (const option of menu || []) {
    if (option.remote) found.push(option)
    else if (childrenOf(option).length) collectRemoteMenus(childrenOf(option), found)
  }
  return found
}

/** The menu of the App a pod answers with, or null if it did not answer with one. */
function appMenuOf(increment) {
  for (const fragment of (increment && increment.fragments) || []) {
    const md = (fragment.component && fragment.component.metadata) || {}
    if (fragment.component && fragment.component.type === 'ClientSide' && md.type === 'App') {
      return { menu: md.menu || [], route: md.route || '', serverSideType: md.serverSideType }
    }
  }
  return null
}

/**
 * Marks the leaves brought from a pod with where that pod lives.
 *
 * Only those without their own `baseUrl`: a pod can federate in turn, and its response already comes
 * resolved. A group is not marked, it is walked — what navigates is the leaf.
 */
function adoptRemote(menu, option, app) {
  const serverSideType = option.serverSideType ? option.serverSideType : app.serverSideType
  for (const child of menu || []) {
    if (child.baseUrl) continue
    if (childrenOf(child).length) {
      adoptRemote(childrenOf(child), option, app)
      // The group belongs to the pod too: whatever hangs from its route and is none of its leaves —the
      // page of ONE task, /forms/task/<id>, under the group /forms whose leaves are /forms/tasks
      // and /forms/executions— lives in the same pod. It is what the shell's server claims
      // (RemoteMenuHandler.claimLength counts every menu route, groups included); without
      // this that deep-link went to the shell's backend, which answers "Not found.". Only as a
      // fallback prefix: remoteRouteOf keeps the longest registered entry, so a leaf
      // still beats the group containing it. The group is not marked: what navigates is the leaf.
      registerGroupRoute(child.route || child.path || '', option, app, serverSideType)
      continue
    }
    child.baseUrl = option.baseUrl
    child.consumedRoute = app.route || ''
    child.serverSideType = serverSideType
    child.uriPrefix = option.route
    const descriptor = {
      baseUrl: option.baseUrl,
      consumedRoute: app.route || '',
      serverSideType,
      uriPrefix: option.route,
    }
    // By the route as is, and by the one navigation will see when shellNavOf strips the
    // parent's prefix. Two keys for the same entry is cheaper than rebuilding
    // here the calculation the nav does, and having them drift apart later.
    const route = child.route || child.path || ''
    remoteRoutes.set(route, descriptor)
    remoteRoutes.set(String(route).replace(/^\//, ''), descriptor)
  }
}

/** The route of a pod's group, registered as a prefix; that of an already registered leaf is not overwritten. */
function registerGroupRoute(route, option, app, serverSideType) {
  const bare = String(route || '').replace(/^\//, '')
  if (!bare || remoteRoutes.has(bare)) return
  const descriptor = {
    baseUrl: option.baseUrl,
    consumedRoute: app.route || '',
    serverSideType,
    uriPrefix: option.route,
  }
  remoteRoutes.set('/' + bare, descriptor)
  remoteRoutes.set(bare, descriptor)
}

function spliceRemote(menu, answers, sections = false, depth = 0) {
  const out = []
  for (const option of menu || []) {
    if (option.remote) {
      const app = answers.get(option)
      // HIDDEN remote (`@Menu @Hidden RemoteMenu`, visible:false on the wire): its routes are
      // registered all the same —a deep-link or a reload under them has to go to its pod— but it
      // contributes nothing to the menu, not even the label if the pod did not answer.
      // HIDDEN remote (`@Menu @Hidden RemoteMenu`, visible:false on the wire): its routes are
      // registered all the same —a deep-link or a reload under them has to go to its pod— and its
      // entries stay in the tree, hidden: they are not painted (shellNavOf), but a page under
      // them has its breadcrumbs. If the pod did not answer, the placeholder stays, hidden too.
      if (option.visible === false) {
        if (app) {
          adoptRemote(app.menu, option, app)
          // grouped as a visible one would be (navTree.ts does the same), then hidden
          const shaped = sections && depth === 0 ? asSection(app.menu, option) : app.menu
          out.push(...markHidden(labelledByShell(shaped, option)))
        } else {
          out.push(option)
        }
        continue
      }
      if (app) {
        adoptRemote(app.menu, option, app)
        // HAMBURGER_SECTIONS: a pod mounted at the first level is ONE section whatever it
        // answers (asSection, navTree.mjs); otherwise, the label the shell declared names the
        // pod's entry, or groups its entries (labelledByShell)
        const entries = sections && depth === 0 ? asSection(app.menu, option) : app.menu
        out.push(...labelledByShell(entries, option))
      } else {
        // The pod did not answer. The section stays, disabled and saying why: an empty section
        // is understandable, one that disappears looks like it never existed.
        out.push(unavailableMount(option))
      }
    } else if (childrenOf(option).length) {
      out.push({ ...option, submenus: spliceRemote(childrenOf(option), answers, sections, depth + 1) })
    } else {
      out.push(option)
    }
  }
  return out
}

/**
 * Asks each pod for its menu and puts it where its option was.
 *
 * In parallel, and one failing pod does not bring down the rest: its section stays as it was instead of
 * taking down the ones that did answer. With `sections` (HAMBURGER_SECTIONS) each pod
 * mounted at the first level stays as a single section (asSection).
 */
export async function expandRemoteMenus(menu, { sections = false } = {}) {
  const remotes = collectRemoteMenus(menu)
  if (!remotes.length) return menu
  // the remotes the SHELL's app names may receive the token; those a remote names may not
  trustDeclaredRemoteBases(remotes.map((option) => option.baseUrl || ''))
  const answers = new Map()
  await Promise.all(remotes.map(async (option) => {
    try {
      const increment = await callMateu(option.baseUrl || '', {
        route: option.route || '',
        actionId: '',
        consumedRoute: '_empty',
        initiatorComponentId: (option.baseUrl || '') + '#' + (option.route || ''),
        parameters: option.params || {},
        // its failure is ITS section's: no error band or "offline" for the whole app
      }, { quiet: true, isolated: true, timeoutMillis: 20000 })
      const app = appMenuOf(increment)
      if (app) answers.set(option, app)
    } catch (e) {
      // Silent on purpose (quiet/isolated): the section stays unavailable (spliceRemote).
    }
  }))
  // two sources claiming the same route: the later registration wins without a word — say so
  for (const collision of routeCollisionsOf(menu, answers, remotes)) {
    console.warn(routeCollisionMessage(collision))
  }
  return spliceRemote(menu, answers, sections)
}
