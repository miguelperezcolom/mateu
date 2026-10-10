// EMBEDDED MODE — the renderer as a JET Custom Component (<mateu-ui>) dropped on a page of
// somebody else's Visual Builder app, next to the standalone app (the full VB app in the jar).
//
// ONE core, two modes. Standalone renders the content page of OUR VB app (main-start-page) through
// VB's runtime: page module + action chains + variables. Embedded renders the SAME page markup and
// runs the SAME chains, with the HOST's JET runtime and theme and without VB's: the markup is plain
// JET templating (oj-bind-*, Knockout) — the only VB in it is the names of the binding context
// ($application, $page, $variables, $listeners, $current) and the chains only use five Actions of
// VB's API. So this module brings the minimal runtime that gives those names their meaning — the
// descriptors (app-flow.json, the page JSONs) say what variables and listeners exist, exactly as
// they say it to VB — and the component (embedded/mateu-ui-viewModel.js) binds the page to it. No
// projection, chain or template is written twice: a fix to the content page is a fix to both.
//
// What the host sees is the component API (component.json): properties (baseUrl, route, params,
// initialState, appContext, token / headers / headersProvider, navigation) and DOM events
// (on-mateu-navigate, on-mateu-action, on-mateu-title, on-mateu-message, on-mateu-ready, on-mateu-error).
//
// The bridge is a module with module-level state (the registry hooks, the view in flight, the
// mount): ONE <mateu-ui> per page. A second instance would share it — documented as a limitation.

import { setHostHeaderProvider, setHostCredentials } from './hostHeaders.mjs'
import { setMount } from './mount.mjs'
import { inAppRouteOfLink } from './links.mjs'

// ── the component's properties ───────────────────────────────────────────────────────────────

/** The DOM events the component fires on its own element (bubbling). JET's convention: the event
 *  TYPE is camelCase (mateuNavigate) and a page listens with the kebab attribute on-mateu-navigate. */
export const EMBEDDED_EVENTS = Object.freeze({
  navigate: 'mateuNavigate',
  action: 'mateuAction',
  title: 'mateuTitle',
  message: 'mateuMessage',
  ready: 'mateuReady',
  error: 'mateuError',
})

/** How a navigation the SCREEN asks for (a row click, a NavigateTo, a link) is handled:
 *  - 'internal' (default): it happens inside the component; `mateuNavigate` is fired first and
 *    is CANCELABLE — a host listener calling preventDefault() takes it over;
 *  - 'host': it never happens inside; `mateuNavigate` is fired and the host decides (typically it
 *    navigates its own flow, or sets the component's `route`). */
export const NAVIGATION_POLICIES = Object.freeze(['internal', 'host'])

/** A property that may arrive as an object or as its JSON (an HTML attribute is a string). */
export function parseJsonProp(value, fallback = null) {
  if (value == null || value === '') return fallback
  if (typeof value === 'object') return value
  try {
    const parsed = JSON.parse(String(value))
    return parsed == null ? fallback : parsed
  } catch (e) {
    return fallback
  }
}

/** The backend base: the URL of the Mateu mount (its API is <base>/mateu/v3/...), no trailing
 *  slash. '' = same origin as the host page. */
export function normalizeBaseUrl(value) {
  const v = String(value == null ? '' : value).trim()
  return v.replace(/\/+$/, '')
}

/** Images, logos and web-component modules are served from the backend ROOT, not from the mount
 *  (as on the Vaadin renderer): the ORIGIN of an absolute base, '' for a relative one. */
export function assetBaseOf(baseUrl) {
  const m = /^(https?:\/\/[^/]+)/i.exec(String(baseUrl || ''))
  return m ? m[1] : ''
}

/** The component's properties, normalised (the component and the tests share this reading). */
export function embeddedConfigOf(props = {}) {
  const navigation = NAVIGATION_POLICIES.includes(props.navigation) ? props.navigation : 'internal'
  const headers = parseJsonProp(props.headers, null)
  return {
    baseUrl: normalizeBaseUrl(props.baseUrl),
    route: String(props.route == null ? '' : props.route).trim(),
    params: parseJsonProp(props.params, {}) || {},
    initialState: parseJsonProp(props.initialState, null),
    appContext: parseJsonProp(props.appContext, {}) || {},
    navigation,
    token: props.token ? String(props.token) : '',
    headers: headers && typeof headers === 'object' ? headers : null,
    headersProvider: typeof props.headersProvider === 'function' ? props.headersProvider : null,
    withCredentials: props.withCredentials === true || props.withCredentials === 'true',
  }
}

/** The header provider the transport asks on every send (hostHeaders.mjs): the host's provider
 *  (called each time — a token that rotates is read fresh), else the static headers + token. */
export function headerProviderOf(config) {
  const fixed = { ...(config.headers || {}) }
  if (config.token) fixed.Authorization = /^\w+\s/.test(config.token) ? config.token : 'Bearer ' + config.token
  if (config.headersProvider) {
    const provider = config.headersProvider
    return async (url) => ({ ...fixed, ...((await provider(url)) || {}) })
  }
  return Object.keys(fixed).length ? fixed : null
}

/**
 * The Mateu route the component opens: `route` with its `:placeholders` filled from `params`, the
 * rest of `params` as the query (`orders` + {status: 'OPEN'} → /orders?status=OPEN — a listing
 * opens filtered, the same as a deep link with filters). '' → the home of the app.
 */
export function composeEmbeddedRoute(route, params = {}) {
  let r = String(route == null ? '' : route).trim()
  const rest = {}
  for (const key of Object.keys(params || {})) {
    const value = params[key]
    const placeholder = new RegExp('(^|/):' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=/|$|\\?)')
    if (placeholder.test(r)) r = r.replace(placeholder, '$1' + encodeURIComponent(value == null ? '' : String(value)))
    else if (value != null && value !== '') rest[key] = value
  }
  if (r && r.charAt(0) !== '/' && r.charAt(0) !== '?') r = '/' + r
  const query = Object.keys(rest)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(typeof rest[k] === 'object' ? JSON.stringify(rest[k]) : String(rest[k])))
    .join('&')
  if (!query) return r
  return r + (r.indexOf('?') >= 0 ? '&' : '?') + query
}

/** What changed between two readings of the properties, and what the component must do about it:
 *  'boot' (the backend or the identity changed: start over), 'navigate' (another screen),
 *  'context' (the app context: reload the screen with it), or nothing. */
export function propertyChangeOf(previous, next) {
  if (!previous) return 'boot'
  if (previous.baseUrl !== next.baseUrl || previous.withCredentials !== next.withCredentials) return 'boot'
  if (JSON.stringify(previous.appContext) !== JSON.stringify(next.appContext)) return 'context'
  if (previous.route !== next.route || JSON.stringify(previous.params) !== JSON.stringify(next.params)
      || JSON.stringify(previous.initialState) !== JSON.stringify(next.initialState)) return 'navigate'
  return null
}

// ── the mode switch the chains consult ───────────────────────────────────────────────────────

let embeddedHost = null

/** The component registers itself here (null when it is gone): the chains ask isEmbedded() before
 *  touching what belongs to the host page — its URL, its title. */
export function setEmbeddedHost(host) { embeddedHost = host || null }

export function isEmbedded() { return embeddedHost != null }

/** Fires one of EMBEDDED_EVENTS on the component; true unless a listener cancelled it (and true
 *  when there is no component: standalone has nobody to ask). */
export function emitEmbedded(name, detail) {
  if (!embeddedHost || typeof embeddedHost.emit !== 'function') return true
  return embeddedHost.emit(name, detail) !== false
}

/** The page title: the document's in standalone; in a host page the title is the HOST's, so the
 *  component reports it (mateuTitle) and lets the host decide. */
// the last title reported: the screen's title arrives twice (its SetWindowTitle and its header)
let lastTitle = null
function isNewTitle(title) {
  if (title == null || title === '' || String(title) === lastTitle) return false
  lastTitle = String(title)
  return true
}

export function setDocTitle(title) {
  if (title == null || title === '') return
  if (isEmbedded()) {
    if (isNewTitle(title)) emitEmbedded(EMBEDDED_EVENTS.title, { title: String(title) })
    return
  }
  if (typeof document !== 'undefined') document.title = title
}

// the initial state the host seeds the FIRST load of a screen with (initialState): consumed once
let embeddedSeed = null

export function setEmbeddedSeed(state) {
  embeddedSeed = state && typeof state === 'object' && Object.keys(state).length ? state : null
}

/** The extra of a route load: {componentState} once after setEmbeddedSeed, {} otherwise. */
export function takeEmbeddedSeed() {
  const seed = embeddedSeed
  embeddedSeed = null
  return seed ? { componentState: seed } : {}
}

/** The route a navigation request names (onMateuNavigate's event: a menu selection, a NavigateTo,
 *  a link), or null. */
export function navigationRouteOf(params) {
  const event = params && params.event
  const detail = (event && (event.detail || event)) || {}
  for (const key of ['route', 'currentId', 'selectedValue', 'value']) {
    if (detail[key] != null && detail[key] !== '') return String(detail[key])
  }
  return null
}

/**
 * The Mateu route an ordinary link of the content names (`<a href="/journey/bookings/7">` in a
 * Text/Html of the app), or null (the browser follows it). Standalone resolves it against the
 * page's own URL (links.inAppRouteOfLink); embedded, the page is the HOST's, so it is resolved
 * against the BACKEND (base-url): the app's links are written for the app, not for its host.
 * `hostLocation` is used when the base is relative ('' = same origin as the host page).
 */
export function embeddedRouteOfLink(anchor, event, baseUrl, hostLocation) {
  let base
  try {
    base = new URL((normalizeBaseUrl(baseUrl) || '') + '/', hostLocation ? hostLocation.href : undefined)
  } catch (e) {
    return null
  }
  const mount = base.pathname.replace(/\/+$/, '')
  const location = { href: base.href, origin: base.origin, pathname: base.pathname, search: '' }
  return inAppRouteOfLink(anchor, event, location, false, mount)
}

/** Whether a navigation the SCREEN asked for happens inside the component. */
export function navigatesInside(policy, notCancelled) {
  return policy !== 'host' && notCancelled
}

// ── the minimal runtime for VB's descriptors ─────────────────────────────────────────────────

/** VB's ActionChain: the chains only extend it (their logic is in run()). */
export class EmbeddedActionChain {}

const PATH = /^(!!|!)?\s*(\$[A-Za-z]\w*(?:\.[A-Za-z_$][\w$]*)*)$/

/**
 * Evaluates one listener-parameter expression of the descriptors: '{{ $event.detail.value }}',
 * '{{ !!$event.force }}', '{{ true }}' — dotted paths from the scope roots, optionally negated,
 * and literals. That is the whole grammar the descriptors use (a test pins it), so no eval and
 * nothing a CSP forbids. Objects and arrays are evaluated member by member; anything else is
 * returned as is.
 */
export function evalDescriptorValue(value, scope) {
  if (Array.isArray(value)) return value.map((v) => evalDescriptorValue(v, scope))
  if (value && typeof value === 'object') {
    const out = {}
    for (const k of Object.keys(value)) out[k] = evalDescriptorValue(value[k], scope)
    return out
  }
  if (typeof value !== 'string') return value
  const m = /^\{\{\s*([\s\S]*?)\s*\}\}$/.exec(value)
  if (!m) return value
  return evalDescriptorExpression(m[1], scope)
}

export function evalDescriptorExpression(expr, scope) {
  const e = String(expr).trim()
  if (e === 'true') return true
  if (e === 'false') return false
  if (e === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(e)) return Number(e)
  if (/^'[^']*'$/.test(e)) return e.slice(1, -1)
  const m = PATH.exec(e)
  if (!m) throw new Error('mateu-ui: unsupported descriptor expression: ' + e)
  const parts = m[2].split('.')
  let v = scope ? scope[parts[0]] : undefined
  for (let i = 1; i < parts.length && v != null; i++) v = v[parts[i]]
  if (m[1] === '!!') return !!v
  if (m[1] === '!') return !v
  return v
}

/** The value a variable starts with: its defaultValue, else the empty value of its type. */
export function defaultOfVariable(def) {
  if (def && Object.prototype.hasOwnProperty.call(def, 'defaultValue')) {
    const d = def.defaultValue
    return d && typeof d === 'object' ? JSON.parse(JSON.stringify(d)) : d
  }
  const type = def && def.type
  if (type === 'string') return ''
  if (type === 'boolean') return false
  if (type === 'number') return 0
  if (typeof type === 'string' && type.endsWith('[]')) return []
  return undefined
}

const ADP_TYPE = /ArrayDataProvider/

/**
 * Builds the runtime over the descriptors.
 *
 * @param opts.app        app-flow.json (variables, constants)
 * @param opts.pages      the page descriptors, merged into ONE page scope (the content page and
 *                        the parts of the shell page the embedded frame keeps: banner, toast)
 * @param opts.chains     { name: ChainClass } (the generated bundle of our chain modules)
 * @param opts.constants  overrides of app constants (mateuBaseUrl ← the base-url property)
 * @param opts.translations { appBundle: { key: text } }
 * @param opts.observable (initial) => ko-like observable (fn(), fn(v)) — the binding sees changes
 * @param opts.adpFactory (rows, keyAttributes) => { provider, setData(rows), add(items), remove(keys), refresh() }
 * @param opts.root       the component element: component methods are looked up inside it first
 * @param opts.policy     () => the navigation policy (read at each navigation: it is a property)
 * @param opts.emit       (name, detail) => notCancelled — fires the component's DOM events
 */
export function createVbRuntime(opts) {
  const observable = opts.observable
  const pages = opts.pages || []
  const appDefs = (opts.app && opts.app.variables) || {}
  const appConstants = {}
  for (const [k, def] of Object.entries((opts.app && opts.app.constants) || {})) {
    appConstants[k] = def && Object.prototype.hasOwnProperty.call(def, 'defaultValue') ? def.defaultValue : def
  }
  Object.assign(appConstants, opts.constants || {})

  const watchers = new Map() // 'app.x' | 'page.x' → [fn]
  const watch = (key, fn) => { if (!watchers.has(key)) watchers.set(key, []); watchers.get(key).push(fn) }
  const adps = []

  const makeVariables = (defs, scopeKey) => {
    const vars = {}
    for (const [name, def] of Object.entries(defs)) {
      if (def && typeof def.type === 'string' && ADP_TYPE.test(def.type)) {
        const dv = (def.defaultValue || {})
        const keyAttributes = dv.keyAttributes || 'id'
        const source = typeof dv.data === 'string' ? /^\{\{\s*\$(application\.variables|variables|page\.variables)\.(\w+)\s*\}\}$/.exec(dv.data) : null
        const adp = opts.adpFactory([], keyAttributes)
        adps.push(adp)
        if (source) watch((source[1] === 'application.variables' ? 'app.' : 'page.') + source[2], (rows) => adp.setData(rows || []))
        const box = observable(adp.provider)
        Object.defineProperty(vars, name, { enumerable: true, get: () => box(), set: (v) => box(v) })
        continue
      }
      const box = observable(defaultOfVariable(def))
      const key = scopeKey + '.' + name
      Object.defineProperty(vars, name, {
        enumerable: true,
        get: () => box(),
        set: (v) => {
          box(v)
          for (const fn of watchers.get(key) || []) fn(v)
        },
      })
    }
    return vars
  }

  const pageDefs = {}
  const listenerDefs = {}
  for (const page of pages) {
    Object.assign(pageDefs, page.variables || {})
    Object.assign(listenerDefs, page.eventListeners || {})
  }
  const $application = {
    variables: makeVariables(appDefs, 'app'),
    constants: appConstants,
    translations: opts.translations || { appBundle: {} },
    user: { isAuthenticated: false, roles: [], permissions: [] },
  }
  const $page = { variables: makeVariables(pageDefs, 'page'), constants: {} }
  // the ADPs bound to a variable start with its value (a later assignment re-feeds them)
  for (const page of pages) {
    for (const [name, def] of Object.entries(page.variables || {})) {
      const dv = def && def.defaultValue
      if (!(def && ADP_TYPE.test(String(def.type)) && dv && typeof dv.data === 'string')) continue
      const m = /^\{\{\s*\$(application\.variables|variables|page\.variables)\.(\w+)\s*\}\}$/.exec(dv.data)
      if (m) {
        const scope = m[1] === 'application.variables' ? $application.variables : $page.variables
        const rows = scope[m[2]]
        const adp = $page.variables[name] && adps.find((a) => a.provider === $page.variables[name])
        if (adp && Array.isArray(rows) && rows.length) adp.setData(rows)
      }
    }
  }

  // the screen's title is the host's to show (its header, its breadcrumbs, document.title): every
  // new one is reported (mateuTitle)
  watch('app.mateuHostTitle', (title) => {
    if (opts.emit && isNewTitle(title)) opts.emit(EMBEDDED_EVENTS.title, { title: String(title) })
  })

  const runtime = {}
  const context = () => ({
    $application,
    $page,
    $variables: $page.variables,
    $flow: { variables: {}, constants: {} },
    $constants: $page.constants,
    __mateuRuntime: runtime,
  })

  const chainError = (name, e) => {
    if (e && e.stale === true) return
    if (typeof console !== 'undefined' && console.error) console.error('mateu-ui: chain ' + name + ' failed', e)
    if (opts.emit) opts.emit(EMBEDDED_EVENTS.error, { chain: name, message: (e && e.message) || String(e) })
  }

  /** Runs one chain by name (the VB chain id), as VB does: a new instance, run(context, params). */
  runtime.callChain = async (name, params = {}, ctx = context()) => {
    const Chain = (opts.chains || {})[name]
    if (!Chain) {
      if (typeof console !== 'undefined' && console.warn) console.warn('mateu-ui: no chain ' + name + ' in the embedded runtime')
      return undefined
    }
    if (name === 'onMateuNavigate' && !(params && params.__fromHost)) {
      // a navigation the SCREEN asked for: the host hears it first, and the policy decides
      const route = navigationRouteOf(params)
      if (route != null) {
        const notCancelled = opts.emit ? opts.emit(EMBEDDED_EVENTS.navigate, { route, force: !!(params && params.force) }) : true
        const policy = typeof opts.policy === 'function' ? opts.policy() : 'internal'
        if (!navigatesInside(policy, notCancelled)) return undefined
      }
    }
    if (name === 'runMateuAction' && opts.emit && params && params.actionId) {
      opts.emit(EMBEDDED_EVENTS.action, { actionId: params.actionId, parameters: params.parameters || {} })
    }
    const clean = params && params.__fromHost ? Object.assign({}, params, { __fromHost: undefined }) : params
    return new Chain().run(ctx, clean || {})
  }

  /** The listeners of the descriptors, as the page binds them: on-x="[[ $listeners.name ]]".
   *  JET calls a listener with (event, data, bindingContext); $current is the binding context's. */
  const $listeners = {}
  const runListener = async (name, $event, $current) => {
    const def = listenerDefs[name]
    if (!def) return
    const ctx = context()
    const scope = { ...ctx, $event, $current }
    for (const step of def.chains || []) {
      try {
        const params = evalDescriptorValue(step.parameters || {}, scope)
        await runtime.callChain(step.chain, params, ctx)
      } catch (e) {
        chainError(step.chain, e)
      }
    }
  }
  for (const name of Object.keys(listenerDefs)) {
    $listeners[name] = (event, data, bindingContext) => {
      const current = bindingContext && bindingContext.$current !== undefined ? bindingContext.$current
        : (data && data.$current !== undefined ? data.$current : undefined)
      runListener(name, event, current)
    }
  }
  runtime.runListener = runListener

  /** VB's application events (Actions.fireEvent 'application:x'): the listeners of that name. */
  runtime.fireEvent = (name, payload) => runListener(name, payload, undefined)

  runtime.findElement = (selector) => {
    const root = opts.root
    const inRoot = root && typeof root.querySelector === 'function' ? root.querySelector(selector) : null
    if (inRoot) return inRoot
    // an open oj-dialog / drawer lives in JET's popup layer (body), not under the component
    return typeof document !== 'undefined' ? document.querySelector(selector) : null
  }

  runtime.context = context
  /** Calls fn with every new value of a variable ('app.x' or 'page.x'). */
  runtime.watch = watch
  runtime.$application = $application
  runtime.$page = $page
  runtime.$listeners = $listeners
  runtime.adps = adps
  /** What the component's view binds against: the same names a VB page sees. */
  runtime.bindingContext = { $application, $page, $variables: $page.variables, $listeners, $flow: { variables: {} } }
  return runtime
}

/** VB's Actions, the five the chains use (a test pins that no chain uses another). Each finds the
 *  runtime in the context it is given — the one the runtime built for that chain. */
const runtimeOf = (context) => {
  const rt = context && context.__mateuRuntime
  if (!rt) throw new Error('mateu-ui: an action outside the embedded runtime')
  return rt
}

export const embeddedActions = Object.freeze({
  callChain(context, { chain, params } = {}) {
    return runtimeOf(context).callChain(chain, params || {}, context)
  },
  async callComponentMethod(context, { selector, method, params } = {}) {
    const el = runtimeOf(context).findElement(selector)
    if (!el || typeof el[method] !== 'function') throw new Error('mateu-ui: no ' + selector + '.' + method + '()')
    return el[method](...(params || []))
  },
  fireEvent(context, { name, payload } = {}) {
    return runtimeOf(context).fireEvent(name, payload)
  },
  fireNotificationEvent(context, notification = {}) {
    const rt = runtimeOf(context)
    if (rt.emitMessage) rt.emitMessage(notification)
    return rt.fireEvent('vbNotification', notification)
  },
  async fireDataProviderEvent(context, { target, add, remove, refresh } = {}) {
    const rt = runtimeOf(context)
    const adp = rt.adps.find((a) => a.provider === target)
    if (!adp) return
    if (remove && remove.keys) adp.remove(remove.keys)
    if (add && add.data) adp.add(Array.isArray(add.data) ? add.data : [add.data])
    if (refresh !== undefined) adp.refresh()
  },
})

// ── booting the content runtime inside a host page ───────────────────────────────────────────

/**
 * The document-level pieces of the content runtime: what loadMateuShell installs before its first
 * navigation (rules, calendars, maps, keys, drag and drop…) — the page markup relies on them. The
 * standalone shell keeps its own list in its chain; test-embedded.mjs reads that chain and fails if
 * it installs something this list does not (or does not explicitly leave out, NOT_IN_EMBEDDED), so
 * the two cannot drift apart silently.
 */
export const CONTENT_INSTALLERS = Object.freeze([
  'installRules', 'installPlanningRange', 'installActionPanels', 'installTileReorder', 'installRichText',
  'installMatrixGrids', 'installCalendars', 'installMaps', 'installRowTones', 'installStickyHeader',
  'installKeys', 'installHover', 'installBpmn', 'installCookieConsent', 'installContextMenus',
  'installChatComponents', 'installCustomComponents', 'installDragAndDrop', 'installAnnouncer',
  'trackPressedControls',
])

/** The sinks that run a page action (an Element event, a rule, a calendar day, a drop…). */
export const CONTENT_ACTION_SINKS = Object.freeze([
  'setElementEventSink', 'setRuleActionSink', 'setCalendarActionSink', 'setMatrixActionSink',
  'setMapActionSink', 'setPlanningRangeSink', 'setUndoSink', 'setPollingRunner', 'setDropSink',
  'setKeysActionSink',
])

/** What the standalone shell installs and the component deliberately does NOT, and why. */
export const NOT_IN_EMBEDDED = Object.freeze({
  // a skip link is the first child of the BODY: the host page owns its own landmarks
  mountSkipLink: 'the host page owns the document landmarks',
  // it reports EVERY uncaught error of the page to the Mateu backend: in a host page most of them
  // are the host's own, and they are not ours to ship to another server
  installClientErrorReporting: 'would ship the host page errors to the Mateu backend',
  // the IDE visual editor's canvas frames the STANDALONE app (its preview page), never a host app
  installEditorPreview: 'the visual editor previews the standalone app only',
  // the tile-reorder sink is wired, with its own payload, by installEmbeddedContentRuntime
  setTileReorderSink: 'wired separately (its payload is a scope, not an action)',
  // live reload (dev mode) answers an app-level change by reloading the WINDOW: in a host page that
  // is the host's app, not ours — the embedded component is not live-reloaded (yet)
  installDevLiveReload: 'an app-level reload would reload the host page',
})

/**
 * Installs the content runtime for an embedded component: the same pieces loadMateuShell installs
 * (CONTENT_INSTALLERS), with every action sink running the page action through the runtime, plus
 * the transport hooks that feed the busy bar, the error band and the offline band of the frame.
 */
let contentInstalled = false
let currentVars = null

export function installEmbeddedContentRuntime(b, runtime) {
  const runPageAction = (actionId, parameters, atom) => runtime.fireEvent('application:mateuElementEvent', {
    actionId, parameters, fromNested: !!(atom && atom.fromNested),
  })
  for (const sink of CONTENT_ACTION_SINKS) if (typeof b[sink] === 'function') b[sink](runPageAction)
  if (typeof b.setTileReorderSink === 'function') {
    b.setTileReorderSink((scope) => runtime.fireEvent('application:mateuTilesReordered', { scope: scope || '' }))
  }
  // the document-level listeners once per page; the sinks and hooks above/below follow the
  // CURRENT component (a new <mateu-ui> takes them over)
  const vars = runtime.$application.variables
  if (!contentInstalled) {
    contentInstalled = true
    for (const name of CONTENT_INSTALLERS) if (typeof b[name] === 'function') b[name]()
    if (b.connectivity) {
      b.connectivity.start()
      b.connectivity.subscribe((online) => { if (currentVars) currentVars.mateuOffline = !online })
    }
  }
  currentVars = vars
  if (typeof b.setTransportHooks === 'function') {
    b.setTransportHooks({
      onStart: () => { vars.mateuBusy = true; if (b.markPressedControlBusy) b.markPressedControlBusy() },
      onSettle: ({ failure }) => {
        vars.mateuBusy = false
        if (b.clearPressedControlBusy) b.clearPressedControlBusy()
        if (failure && failure.kind !== 'cancelled') {
          vars.mateuLastError = failure.message
          if (b.announce) b.announce(failure.message, { politeness: 'assertive' })
          emitEmbedded(EMBEDDED_EVENTS.error, { kind: failure.kind, message: failure.message, status: failure.status })
        }
      },
    })
  }
}

/**
 * Boots (or re-boots, when the backend or the identity change) the component: the host's identity
 * and app context, the App of the mount (its REST sources, its home, its menu routes — never
 * painted: the host owns the chrome), then the route the properties name. Mirrors loadMateuShell
 * minus the shell chrome; the navigation itself is the shell's own chain (onMateuNavigate).
 */
export async function bootEmbedded(b, runtime, config) {
  const vars = runtime.$application.variables
  setHostHeaderProvider(headerProviderOf(config))
  setHostCredentials(config.withCredentials ? 'include' : undefined)
  // no mount: a host page's URL is the host's — routes never reach it (hash mode, pushes skipped)
  setMount(null)
  runtime.$application.constants.mateuBaseUrl = config.baseUrl
  if (b.setElementModuleBase) b.setElementModuleBase(assetBaseOf(config.baseUrl))
  vars.mateuAppState = { ...(config.appContext || {}) }
  const boot = await b.bootstrapShell(config.baseUrl, 'shell')
  const withoutApp = !b.bootstrapHasApp(boot)
  b.setMountWithoutApp(withoutApp)
  const reg = b.reduceContexts({ contexts: {}, stack: [], shell: null }, boot)
  if (reg.shell && reg.shell.menu && b.expandRemoteMenus) {
    reg.shell.menu = await b.expandRemoteMenus(reg.shell.menu, { sections: reg.shell.variant === 'HAMBURGER_SECTIONS' })
  }
  vars.mateuRegistry = reg
  const nav = b.shellNavOf(reg)
  vars.mateuShellSST = nav.serverSideType || ''
  const firstLeaf = (nav.menuTree || []).find((entry) => !entry.hasChildren)
  const homeRoute = b.routeUnderMount(nav.homeRoute) || (firstLeaf ? firstLeaf.id : '') || (withoutApp ? '/' : '')
  vars.mateuHomeRoute = homeRoute
  await navigateEmbedded(runtime, config, homeRoute)
  emitEmbedded(EMBEDDED_EVENTS.ready, { route: vars.mateuSelectedNavId || vars.mateuSelectedRoute || '' })
}

/** The host asked for a screen (the route/params/initialState properties): it always happens —
 *  the policy is for what the SCREEN asks for. */
export function navigateEmbedded(runtime, config, homeRoute) {
  const route = composeEmbeddedRoute(config.route, config.params) || homeRoute || runtime.$application.variables.mateuHomeRoute || ''
  if (!route) return Promise.resolve()
  setEmbeddedSeed(config.initialState)
  return runtime.callChain('onMateuNavigate', { event: { detail: { route } }, force: true, __fromHost: true })
}

/** The routines the bridge exports for the component (make-amd adds them to its return). */
export const EMBEDDED_API = {
  EMBEDDED_EVENTS,
  embeddedConfigOf,
  headerProviderOf,
  composeEmbeddedRoute,
  propertyChangeOf,
  navigationRouteOf,
  embeddedRouteOfLink,
  assetBaseOf,
  setEmbeddedHost,
  isEmbedded,
  emitEmbedded,
  setDocTitle,
  setEmbeddedSeed,
  takeEmbeddedSeed,
  createVbRuntime,
  embeddedActions,
  EmbeddedActionChain,
  CONTENT_INSTALLERS,
  CONTENT_ACTION_SINKS,
  installEmbeddedContentRuntime,
  bootEmbedded,
  navigateEmbedded,
  setHostHeaderProvider,
  setHostCredentials,
}
