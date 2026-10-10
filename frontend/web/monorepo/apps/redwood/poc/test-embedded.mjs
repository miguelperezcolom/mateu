// Tests of the EMBEDDED mode (<mateu-ui>, embedded.mjs + make-embedded.mjs): the component's
// properties → the requests it sends (route, params, initial state, app context, the host's
// identity), the navigation events and policy, the minimal VB runtime the shared chains run on, and
// the package the generator builds. The last group runs the REAL generated bridge and the REAL
// chains (the ones the standalone VB app runs) on that runtime, against wire fixtures.
// Run: node test-embedded.mjs (npm test runs it).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  EMBEDDED_EVENTS, embeddedConfigOf, headerProviderOf, composeEmbeddedRoute, propertyChangeOf, assetBaseOf,
  parseJsonProp, navigationRouteOf, navigatesInside, evalDescriptorValue, evalDescriptorExpression, defaultOfVariable,
  createVbRuntime, embeddedActions, EmbeddedActionChain, setEmbeddedHost, isEmbedded, emitEmbedded, setDocTitle,
  setEmbeddedSeed, takeEmbeddedSeed, CONTENT_INSTALLERS, CONTENT_ACTION_SINKS, NOT_IN_EMBEDDED,
  installEmbeddedContentRuntime, bootEmbedded, embeddedRouteOfLink,
} from './embedded.mjs'
import { setHostHeaderProvider, setHostCredentials, hostHeadersFor, cleanHeaders, lastHostHeadersOf } from './hostHeaders.mjs'
import { fetchWithPolicy, authHeadersOf } from './resilience.mjs'
import {
  frameOf, embeddedViewOf, componentModulesOf, bundleChains, scopeCss, scopeSelector, zipOf, componentFiles,
  SHELL_CHAINS, MODULE_ALIASES,
} from './make-embedded.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const webApp = (...p) => join(here, '..', 'webApps', 'vbredwoodapp', ...p)
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
let passed = 0
const tests = []
const test = (name, fn) => tests.push([name, fn])

/** A ko-like observable for Node: fn() reads, fn(v) writes, .writes counts the writes. */
const observable = (initial) => {
  let value = initial
  const fn = (...args) => {
    if (args.length) { value = args[0]; fn.writes++; return undefined }
    return value
  }
  fn.writes = 0
  return fn
}
/** An ADP stand-in: what fireDataProviderEvent and the variable watchers do to it. */
const adpFactory = (rows, keyAttributes) => {
  const adp = { provider: { kind: 'adp', keyAttributes, rows: (rows || []).slice() } }
  adp.setData = (next) => { adp.provider.rows = (next || []).slice() }
  adp.add = (items) => { adp.provider.rows.push(...items) }
  adp.remove = (keys) => { adp.provider.rows = adp.provider.rows.filter((r) => !keys.includes(r[keyAttributes])) }
  adp.refresh = () => { adp.refreshed = true }
  return adp
}

// ── properties ────────────────────────────────────────────────────────────────────────────

test('properties: attributes arrive as strings (JSON), objects stay objects, defaults are safe', () => {
  const c = embeddedConfigOf({ baseUrl: 'https://erp.acme.com/mateu/', route: ' orders ', params: '{"id":42}', appContext: { hotel: 'H1' } })
  assert.equal(c.baseUrl, 'https://erp.acme.com/mateu')
  assert.equal(c.route, 'orders')
  assert.deepEqual(c.params, { id: 42 })
  assert.deepEqual(c.appContext, { hotel: 'H1' })
  assert.equal(c.navigation, 'internal')
  assert.equal(c.initialState, null)
  assert.equal(embeddedConfigOf({ navigation: 'host' }).navigation, 'host')
  assert.equal(embeddedConfigOf({ navigation: 'nonsense' }).navigation, 'internal')
  assert.equal(embeddedConfigOf({ withCredentials: 'true' }).withCredentials, true)
  assert.deepEqual(parseJsonProp('not json', { x: 1 }), { x: 1 })
  assert.deepEqual(embeddedConfigOf({}).params, {})
})

test('route + params: placeholders filled, the rest as the query; empty → the home', () => {
  assert.equal(composeEmbeddedRoute('orders', {}), '/orders')
  assert.equal(composeEmbeddedRoute('orders/:id', { id: 42 }), '/orders/42')
  assert.equal(composeEmbeddedRoute('orders/:id/lines', { id: 'a b', status: 'OPEN' }), '/orders/a%20b/lines?status=OPEN')
  assert.equal(composeEmbeddedRoute('/orders?x=1', { status: 'OPEN' }), '/orders?x=1&status=OPEN')
  assert.equal(composeEmbeddedRoute('customers/:customerId', { customerId: 3, customer: 'x' }), '/customers/3?customer=x',
    'a placeholder only matches its whole name')
  assert.equal(composeEmbeddedRoute('', {}), '')
  assert.equal(composeEmbeddedRoute('', { q: 'x' }), '?q=x')
})

test('a property change says what to do: boot, reload with the context, navigate, or nothing', () => {
  const a = embeddedConfigOf({ baseUrl: 'http://x', route: 'orders' })
  assert.equal(propertyChangeOf(null, a), 'boot')
  assert.equal(propertyChangeOf(a, embeddedConfigOf({ baseUrl: 'http://y', route: 'orders' })), 'boot')
  assert.equal(propertyChangeOf(a, embeddedConfigOf({ baseUrl: 'http://x', route: 'orders', appContext: { h: 1 } })), 'context')
  assert.equal(propertyChangeOf(a, embeddedConfigOf({ baseUrl: 'http://x', route: 'customers' })), 'navigate')
  assert.equal(propertyChangeOf(a, embeddedConfigOf({ baseUrl: 'http://x', route: 'orders', params: { id: 1 } })), 'navigate')
  assert.equal(propertyChangeOf(a, embeddedConfigOf({ baseUrl: 'http://x', route: 'orders', initialState: { a: 1 } })), 'navigate')
  assert.equal(propertyChangeOf(a, embeddedConfigOf({ baseUrl: 'http://x', route: 'orders', token: 'new' })), null,
    'the identity is read on each request: no reload')
})

test('assets come from the backend ROOT, not from the mount', () => {
  assert.equal(assetBaseOf('https://erp.acme.com/mateu'), 'https://erp.acme.com')
  assert.equal(assetBaseOf(''), '')
  assert.equal(assetBaseOf('/mateu'), '')
})

// ── the host's identity ───────────────────────────────────────────────────────────────────

test('token / headers / provider → the header provider the transport asks', async () => {
  assert.equal(headerProviderOf(embeddedConfigOf({})), null)
  assert.deepEqual(headerProviderOf(embeddedConfigOf({ token: 'abc' })), { Authorization: 'Bearer abc' })
  assert.deepEqual(headerProviderOf(embeddedConfigOf({ token: 'Basic dXNlcg==' })), { Authorization: 'Basic dXNlcg==' })
  assert.deepEqual(headerProviderOf(embeddedConfigOf({ headers: '{"X-Tenant":"t1"}', token: 'abc' })), { 'X-Tenant': 't1', Authorization: 'Bearer abc' })
  let calls = 0
  const provider = headerProviderOf(embeddedConfigOf({ token: 'old', headersProvider: async (url) => ({ Authorization: 'Bearer ' + (++calls), 'X-Url': url }) }))
  assert.deepEqual(await provider('u'), { Authorization: 'Bearer 1', 'X-Url': 'u' }, 'the provider wins over the static token')
  assert.deepEqual(await provider('u'), { Authorization: 'Bearer 2', 'X-Url': 'u' }, 'asked again on every request')
  assert.deepEqual(cleanHeaders({ a: undefined, b: '', c: 1 }), { c: '1' })
})

test('every Mateu request carries the host headers, read fresh on each send; cookies on request', async () => {
  const original = globalThis.fetch
  const sent = []
  globalThis.fetch = async (url, init) => { sent.push({ url, init }); return new Response('{}', { status: 200 }) }
  try {
    let n = 0
    setHostHeaderProvider(() => ({ Authorization: 'Bearer t' + (++n), 'X-Host-App': 'acme' }))
    setHostCredentials('include')
    await fetchWithPolicy('http://b/mateu/v3/sync/x', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, { actionId: '' })
    await fetchWithPolicy('http://b/mateu/v3/sync/x', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, { actionId: '' })
    assert.equal(sent[0].init.headers.Authorization, 'Bearer t1')
    assert.equal(sent[1].init.headers.Authorization, 'Bearer t2')
    assert.equal(sent[0].init.headers['X-Host-App'], 'acme')
    assert.equal(sent[0].init.headers['Content-Type'], 'application/json')
    assert.equal(sent[0].init.credentials, 'include')
    assert.deepEqual(authHeadersOf(), { Authorization: 'Bearer t2', 'X-Host-App': 'acme' }, 'the sync callers (chat, client log) see the last answer')
    // a provider that throws: the request still goes (the backend answers 401, the honest answer)
    setHostHeaderProvider(() => { throw new Error('no token') })
    setHostCredentials(undefined)
    const prevWarn = console.warn
    console.warn = () => {}
    await fetchWithPolicy('http://b/mateu/v3/sync/x', { method: 'POST', headers: {} }, { actionId: '' })
    console.warn = prevWarn
    assert.equal(sent[2].init.headers.Authorization, undefined)
    assert.equal(sent[2].init.credentials, undefined)
  } finally {
    globalThis.fetch = original
    setHostHeaderProvider(null)
    setHostCredentials(undefined)
  }
  assert.deepEqual(lastHostHeadersOf(), {})
  assert.deepEqual(await hostHeadersFor('x'), {}, 'standalone: no provider, nothing added')
})

// ── the mode switch ───────────────────────────────────────────────────────────────────────

test('embedded: the title is reported to the host (mateuTitle), never written to document.title', () => {
  const emitted = []
  setEmbeddedHost({ emit: (name, detail) => { emitted.push([name, detail]); return true } })
  try {
    assert.equal(isEmbedded(), true)
    setDocTitle('Orders')
    setDocTitle('')
    assert.deepEqual(emitted, [[EMBEDDED_EVENTS.title, { title: 'Orders' }]])
    assert.equal(emitEmbedded(EMBEDDED_EVENTS.ready, {}), true)
  } finally {
    setEmbeddedHost(null)
  }
  assert.equal(isEmbedded(), false)
  assert.equal(emitEmbedded(EMBEDDED_EVENTS.navigate, {}), true, 'standalone: nobody to ask, nothing cancelled')
})

test('the initial state seeds the NEXT load only', () => {
  assert.deepEqual(takeEmbeddedSeed(), {})
  setEmbeddedSeed({ name: 'Ada' })
  assert.deepEqual(takeEmbeddedSeed(), { componentState: { name: 'Ada' } })
  assert.deepEqual(takeEmbeddedSeed(), {})
  setEmbeddedSeed({})
  assert.deepEqual(takeEmbeddedSeed(), {})
})

test('the route a navigation names, and whether it happens inside', () => {
  assert.equal(navigationRouteOf({ event: { detail: { route: '/x' } } }), '/x')
  assert.equal(navigationRouteOf({ event: { detail: { currentId: '/y' } } }), '/y')
  assert.equal(navigationRouteOf({ event: { route: '/z' } }), '/z', 'an application event payload')
  assert.equal(navigationRouteOf({}), null)
  assert.equal(navigatesInside('internal', true), true)
  assert.equal(navigatesInside('internal', false), false, 'the host cancelled it')
  assert.equal(navigatesInside('host', true), false)
})

test('a content link is resolved against the BACKEND, not the host page', () => {
  const a = (href, attrs = {}) => ({ getAttribute: (n) => (n === 'href' ? href : attrs[n] != null ? attrs[n] : null) })
  const host = { href: 'https://vb.oraclecloud.com/ic/builder/rt/app/live/index.html' }
  assert.equal(embeddedRouteOfLink(a('/mateu/orders/7'), {}, 'https://erp.acme.com/mateu', host), '/orders/7',
    'an absolute path is resolved against the backend origin, and is a screen when it is under the mount')
  assert.equal(embeddedRouteOfLink(a('/other/x'), {}, 'https://erp.acme.com/mateu', host), null, 'another UI of that backend')
  assert.equal(embeddedRouteOfLink(a('https://erp.acme.com/mateu/orders/7'), {}, 'https://erp.acme.com/mateu', host), '/orders/7')
  assert.equal(embeddedRouteOfLink(a('orders/7'), {}, 'https://erp.acme.com/mateu', host), '/orders/7')
  assert.equal(embeddedRouteOfLink(a('https://other.com/x'), {}, 'https://erp.acme.com/mateu', host), null)
  assert.equal(embeddedRouteOfLink(a('/orders', { target: '_blank' }), {}, 'http://localhost:9005', host), null)
  assert.equal(embeddedRouteOfLink(a('/orders'), {}, 'http://localhost:9005', host), '/orders')
})

// ── the runtime for VB's descriptors ──────────────────────────────────────────────────────

test('descriptor expressions: the whole grammar the page descriptors use, and nothing else', () => {
  const scope = { $event: { detail: { value: 7 }, force: 1 }, $current: { data: { id: 'a' } }, $application: { variables: { home: '/h' } } }
  assert.equal(evalDescriptorValue('{{ $event.detail.value }}', scope), 7)
  assert.equal(evalDescriptorValue('{{ !!$event.force }}', scope), true)
  assert.equal(evalDescriptorValue('{{ !$event.missing }}', scope), true)
  assert.equal(evalDescriptorValue('{{ true }}', scope), true)
  assert.equal(evalDescriptorValue('{{ $current.data.id }}', scope), 'a')
  assert.equal(evalDescriptorValue('{{ $current.nothing.deep }}', scope), undefined)
  assert.deepEqual(evalDescriptorValue({ detail: { route: '{{ $application.variables.home }}' } }, scope), { detail: { route: '/h' } })
  assert.equal(evalDescriptorValue('plain', scope), 'plain')
  assert.equal(evalDescriptorValue(-1, scope), -1)
  assert.throws(() => evalDescriptorExpression('alert(1)', scope), /unsupported/)
  // every parameter expression of the real descriptors evaluates (none needs more than this)
  const pages = [readJson(webApp('flows', 'main', 'pages', 'main-start-page.json')), readJson(webApp('pages', 'shell-page.json'))]
  let count = 0
  for (const page of pages) {
    for (const def of Object.values(page.eventListeners)) {
      for (const step of def.chains) {
        evalDescriptorValue(step.parameters || {}, { $event: {}, $current: {}, $application: { variables: {} }, $page: { variables: {} }, $variables: {} })
        count++
      }
    }
  }
  assert.ok(count > 100)
})

test('variables: defaults of their type, writes notify the binding, ADPs follow their source', () => {
  assert.equal(defaultOfVariable({ type: 'string' }), '')
  assert.equal(defaultOfVariable({ type: 'boolean' }), false)
  assert.deepEqual(defaultOfVariable({ type: 'any[]' }), [])
  assert.equal(defaultOfVariable({ type: 'any' }), undefined)
  const shared = { a: 1 }
  const copy = defaultOfVariable({ type: 'any', defaultValue: shared })
  assert.deepEqual(copy, shared)
  assert.notEqual(copy, shared, 'each runtime gets its own copy of an object default')
  const rt = createVbRuntime({
    app: { variables: { rows: { type: 'any', defaultValue: [{ id: 1 }] }, busy: { type: 'boolean' } }, constants: { mateuBaseUrl: { type: 'string', defaultValue: 'http://dev' } } },
    pages: [{ variables: { listADP: { type: 'vb/ArrayDataProvider2', defaultValue: { data: '{{ $application.variables.rows }}', keyAttributes: 'id' } } } }],
    observable, adpFactory, constants: { mateuBaseUrl: 'http://prod' },
  })
  assert.equal(rt.$application.constants.mateuBaseUrl, 'http://prod')
  assert.equal(rt.$application.variables.busy, false)
  assert.deepEqual(rt.$page.variables.listADP.rows, [{ id: 1 }], 'an ADP starts with its source')
  rt.$application.variables.rows = [{ id: 2 }, { id: 3 }]
  assert.deepEqual(rt.$page.variables.listADP.rows, [{ id: 2 }, { id: 3 }], 'and follows it')
  assert.equal(rt.bindingContext.$variables, rt.$page.variables)
})

test('listeners run their chains with $event/$current; Actions reach the runtime', async () => {
  const ran = []
  class Recorder extends EmbeddedActionChain {
    async run(context, params) {
      ran.push(['recorder', params])
      await embeddedActions.callChain(context, { chain: 'second', params: { n: 2 } })
    }
  }
  class Second extends EmbeddedActionChain {
    async run(context, params) {
      ran.push(['second', params])
      context.$page.variables.messageToast = 'hi'
      await embeddedActions.callComponentMethod(context, { selector: '#toast', method: 'open', params: ['x'] })
      await embeddedActions.fireDataProviderEvent(context, { target: context.$page.variables.bannerADP, add: { data: { id: 'b1' } } })
    }
  }
  const opened = []
  const root = { querySelector: (sel) => (sel === '#toast' ? { open: (a) => opened.push(a) } : null) }
  const rt = createVbRuntime({
    app: { variables: {} },
    pages: [{
      variables: { messageToast: { type: 'string' }, bannerADP: { type: 'vb/ArrayDataProvider2', defaultValue: { keyAttributes: 'id' } } },
      eventListeners: { clicked: { chains: [{ chain: 'recorder', parameters: { id: '{{ $current.data.id }}', value: '{{ $event.detail.value }}' } }] } },
    }],
    chains: { recorder: Recorder, second: Second },
    observable, adpFactory, root,
  })
  // JET calls an on-* listener with (event, data, bindingContext)
  rt.$listeners.clicked({ detail: { value: 'v' } }, {}, { $current: { data: { id: 'row1' } } })
  await new Promise((r) => setTimeout(r, 0))
  assert.deepEqual(ran, [['recorder', { id: 'row1', value: 'v' }], ['second', { n: 2 }]])
  assert.deepEqual(opened, ['x'])
  assert.equal(rt.$page.variables.messageToast, 'hi')
  assert.deepEqual(rt.$page.variables.bannerADP.rows, [{ id: 'b1' }])
  await embeddedActions.fireDataProviderEvent(rt.context(), { target: rt.$page.variables.bannerADP, remove: { keys: ['b1'] } })
  assert.deepEqual(rt.$page.variables.bannerADP.rows, [])
})

test('navigation the SCREEN asks for: mateuNavigate first; internal goes on, cancelled/host does not', async () => {
  const runs = []
  class Nav extends EmbeddedActionChain { async run(context, params) { runs.push(params) } }
  const emitted = []
  let cancel = false
  let policy = 'internal'
  const rt = createVbRuntime({
    app: { variables: {} },
    pages: [{ eventListeners: { 'application:mateuNavigate': { chains: [{ chain: 'onMateuNavigate', parameters: { event: '{{ $event }}', force: '{{ !!$event.force }}' } }] } } }],
    chains: { onMateuNavigate: Nav },
    observable, adpFactory,
    policy: () => policy,
    emit: (name, detail) => { emitted.push([name, detail]); return !(cancel && name === EMBEDDED_EVENTS.navigate) },
  })
  await embeddedActions.fireEvent(rt.context(), { name: 'application:mateuNavigate', payload: { route: '/products' } })
  assert.deepEqual(emitted.at(-1), [EMBEDDED_EVENTS.navigate, { route: '/products', force: false }])
  assert.equal(runs.length, 1)
  cancel = true
  await embeddedActions.fireEvent(rt.context(), { name: 'application:mateuNavigate', payload: { route: '/x' } })
  assert.equal(runs.length, 1, 'the host cancelled it')
  cancel = false
  policy = 'host'
  await embeddedActions.fireEvent(rt.context(), { name: 'application:mateuNavigate', payload: { route: '/y' } })
  assert.equal(runs.length, 1, 'the host owns navigation')
  assert.equal(emitted.filter(([n]) => n === EMBEDDED_EVENTS.navigate).length, 3)
  // what the HOST asks for (properties, methods) always happens, without asking it back
  await rt.callChain('onMateuNavigate', { event: { detail: { route: '/z' } }, force: true, __fromHost: true })
  assert.equal(runs.length, 2)
  assert.equal(runs[1].__fromHost, undefined, 'the marker does not reach the chain')
  assert.equal(emitted.filter(([n]) => n === EMBEDDED_EVENTS.navigate).length, 3)
})

test('actions are reported to the host (mateuAction); a failing chain reports mateuError', async () => {
  class Run extends EmbeddedActionChain { async run() { throw new Error('boom') } }
  const emitted = []
  const rt = createVbRuntime({
    app: { variables: {} },
    pages: [{ eventListeners: { act: { chains: [{ chain: 'runMateuAction', parameters: { actionId: '{{ $current.data.actionId }}' } }] } } }],
    chains: { runMateuAction: Run }, observable, adpFactory,
    emit: (name, detail) => { emitted.push([name, detail]); return true },
  })
  const prev = console.error
  console.error = () => {}
  await rt.runListener('act', {}, { data: { actionId: 'save' } })
  console.error = prev
  assert.deepEqual(emitted[0], [EMBEDDED_EVENTS.action, { actionId: 'save', parameters: {} }])
  assert.equal(emitted[1][0], EMBEDDED_EVENTS.error)
  assert.equal(emitted[1][1].message, 'boom')
})

// ── the content runtime: the same pieces as the standalone shell ──────────────────────────

test('the embedded content runtime installs what loadMateuShell installs (or says why not)', () => {
  const shell = readFileSync(webApp('pages', 'shell-page-chains', 'loadMateuShell.js'), 'utf8')
  const used = [...new Set([...shell.matchAll(/bridge\.(install\w+|set\w+Sink|setPollingRunner|trackPressedControls|mountSkipLink)\(/g)].map((m) => m[1]))]
  const covered = new Set([...CONTENT_INSTALLERS, ...CONTENT_ACTION_SINKS, ...Object.keys(NOT_IN_EMBEDDED)])
  const missing = used.filter((name) => !covered.has(name))
  assert.deepEqual(missing, [], 'add them to CONTENT_INSTALLERS / CONTENT_ACTION_SINKS, or to NOT_IN_EMBEDDED with the reason')
  // …and the installers are idempotent per page; the sinks follow the newest component
  const calls = []
  const b = new Proxy({}, { get: (t, name) => (name === 'connectivity' || name === 'setTransportHooks' ? undefined : (...args) => calls.push([name, args])) })
  const rt = createVbRuntime({ app: { variables: {} }, pages: [], observable, adpFactory })
  installEmbeddedContentRuntime(b, rt)
  installEmbeddedContentRuntime(b, rt)
  for (const name of CONTENT_INSTALLERS) assert.equal(calls.filter(([n]) => n === name).length, 1, name + ' once')
  for (const name of CONTENT_ACTION_SINKS) assert.equal(calls.filter(([n]) => n === name).length, 2, name + ' per component')
})

// ── the package ───────────────────────────────────────────────────────────────────────────

test('the view is the content page inside the shell frame, without the router outlet or the main landmark', () => {
  const shell = readFileSync(webApp('pages', 'shell-page.html'), 'utf8')
  const frame = frameOf(shell)
  assert.match(frame, /mateu-error-band/)
  assert.match(frame, /oj-sp-messages-banner/)
  assert.doesNotMatch(frame, /oj-sp-global-header|oj-sp-simple-ui-shell/, 'no shell chrome')
  const view = embeddedViewOf(shell, '<p id="content">page</p>')
  assert.match(view, /<p id="content">page<\/p>/)
  assert.doesNotMatch(view, /oj-vb-content|role="main"/)
  assert.throws(() => frameOf('<div></div>'), /@embedded-frame/)
})

test('every component of the view has a module; a tag without one fails the build', () => {
  const modules = componentModulesOf('<oj-button></oj-button><oj-bind-if></oj-bind-if><oj-c-progress-bar></oj-c-progress-bar><oj-tab-bar></oj-tab-bar>',
    { 'oj-button': { path: 'ojs/ojbutton' }, 'oj-tab-bar': { path: 'ojs/ojtabbar' } })
  assert.ok(modules.includes('ojs/ojbutton') && modules.includes('oj-c/progress-bar') && modules.includes('ojs/ojknockout'))
  assert.ok(modules.includes(MODULE_ALIASES['ojs/ojtabbar']) && !modules.includes('ojs/ojtabbar'), 'oj-tab-bar lives in ojnavigationlist')
  assert.throws(() => componentModulesOf('<oj-mystery></oj-mystery>', {}), /oj-mystery/)
})

test('the chains bundle: VB modules resolved to the runtime; a foreign dependency fails the build', () => {
  const src = bundleChains({ a: "define(['vb/action/actionChain', 'vb/action/actions', 'resources/js/mateu-bridge'], (A, B, C) => class a extends A {});" })
  let factory
  const define = (deps, f) => { factory = f; assert.deepEqual(deps, ['./mateu-ui-bridge']) }
  new Function('define', src)(define)
  const bridge = { EmbeddedActionChain, embeddedActions }
  const chains = factory(bridge)
  assert.ok(new chains.a() instanceof EmbeddedActionChain)
  assert.throws(() => bundleChains({ b: "define(['ojs/ojcore'], () => 1)" }), /ojs\/ojcore/)
})

test('the style sheet: our classes stay global, JET overrides scoped, page and shell rules dropped', () => {
  assert.equal(scopeSelector('.mateu-fab'), '.mateu-fab')
  assert.equal(scopeSelector('#mateuPicker .x'), '#mateuPicker .x')
  assert.equal(scopeSelector('oj-action-card.mateu-row-card'), 'oj-action-card.mateu-row-card')
  assert.equal(scopeSelector('.oj-sp-foldout-layout-children-container'), 'mateu-ui .oj-sp-foldout-layout-children-container')
  assert.equal(scopeSelector('body::after'), null)
  assert.equal(scopeSelector('html.mateu-theme-dark .oj-panel'), null)
  assert.equal(scopeSelector('oj-sp-global-header oj-button'), null)
  const css = scopeCss('body { color: red }\n/* c */\n.a, .mateu-b { x: 1 }\n@media (max-width: 1px) { .c { y: 2 } body { z: 3 } }\n@keyframes k { to { opacity: 1 } }\n@media print { body { a: 1 } }')
  assert.match(css, /mateu-ui \.a,\n\.mateu-b \{ x: 1 \}/)
  assert.match(css, /@media \(max-width: 1px\) \{\nmateu-ui \.c \{ y: 2 \}\n\}/)
  assert.match(css, /@keyframes k \{ to \{ opacity: 1 \} \}/)
  assert.doesNotMatch(css, /color: red|@media print/)
})

test('the package: the files of a JET component, nothing from Oracle, a valid zip', () => {
  const { files, version } = componentFiles()
  assert.deepEqual(Object.keys(files).sort(), ['NOTICE.md', 'component.json', 'loader.js', 'mateu-ui-bridge.js', 'mateu-ui-chains.js',
    'mateu-ui-descriptors.js', 'mateu-ui-styles.css', 'mateu-ui-view.html', 'mateu-ui-viewModel.js'])
  const meta = JSON.parse(files['component.json'])
  assert.equal(meta.name, 'mateu-ui')
  assert.equal(meta.version, version)
  for (const p of ['baseUrl', 'route', 'params', 'initialState', 'appContext', 'token', 'headers', 'headersProvider', 'navigation', 'withCredentials']) assert.ok(meta.properties[p], p)
  for (const e of Object.values(EMBEDDED_EVENTS)) assert.ok(meta.events[e], 'event ' + e + ' declared')
  assert.equal(meta.properties.route.writeback, true)
  // nothing vendored: no Oracle module is DEFINED in the package (they are referenced by id/URL)
  for (const [name, content] of Object.entries(files)) {
    assert.doesNotMatch(content, /define\(\s*["'](ojs|oj-sp|oj-c|oj-dynamic|oj-oars)\//, name)
    assert.doesNotMatch(content, /Copyright \(c\) \d{4}, Oracle/, name)
  }
  for (const name of SHELL_CHAINS) assert.match(files['mateu-ui-chains.js'], new RegExp(`chains\\["${name}"\\]`))
  const descriptors = files['mateu-ui-descriptors.js']
  assert.match(descriptors, /"oj-sp":"https:\/\/static\.oracle\.com\/cdn\/spectra-ui\//, 'oj-sp is referenced by URL')
  // a zip: local headers for every file, the end-of-central-directory record, deterministic
  const zip = zipOf({ 'a.txt': 'hello', 'b.txt': 'world' })
  assert.equal(zip.readUInt32LE(0), 0x04034b50)
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50)
  assert.equal(zip.readUInt16LE(zip.length - 22 + 10), 2)
  assert.deepEqual(zipOf({ 'b.txt': 'world', 'a.txt': 'hello' }), zip)
})

// ── the REAL bridge and chains on the embedded runtime ────────────────────────────────────

/** The generated bridge (the one both modes ship), loaded with stand-ins for its JET modules. */
function loadBridge() {
  let api
  const define = (deps, factory) => {
    const stub = function Stub() {}
    stub.IntlNumberConverter = function () {}
    stub.KeySetImpl = function () {}
    stub.RowDataGridProvider = function () {}
    api = factory((ids, ok) => ok && ok(), stub, stub, stub, stub, stub, stub)
  }
  new Function('define', readFileSync(webApp('resources', 'js', 'mateu-bridge.js'), 'utf8'))(define)
  return api
}

/** The generated chains bundle over that bridge. */
function loadChains(bridge) {
  let chains
  new Function('define', componentFiles().files['mateu-ui-chains.js'])((deps, factory) => { chains = factory(bridge) })
  return chains
}

test('end to end in Node: the properties become the requests the real chains send', async () => {
  // the little of a browser the chains touch (the page's language, its URL — that they must NOT
  // change —, element lookups that find nothing in Node)
  const hadWindow = 'window' in globalThis
  const hadDocument = 'document' in globalThis
  const location = { href: 'https://vb.example.com/host/index.html', pathname: '/host/index.html', search: '', hash: '', origin: 'https://vb.example.com' }
  const history = { pushState: () => { throw new Error('the host URL was pushed') }, replaceState: () => { throw new Error('the host URL was replaced') } }
  const element = () => ({ style: {}, setAttribute() {}, appendChild() {}, addEventListener() {}, classList: { add() {}, remove() {}, toggle() {} } })
  globalThis.window = globalThis
  globalThis.location = location
  globalThis.history = history
  globalThis.document = {
    title: 'Host title',
    documentElement: { lang: 'en' },
    body: element(),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: element,
    addEventListener() {},
    dispatchEvent: () => true,
  }
  const bridge = loadBridge()
  const chains = loadChains(bridge)
  const fixture = (name) => readFileSync(join(here, 'fixtures', 'real', name), 'utf8')
  const original = globalThis.fetch
  const sent = []
  globalThis.fetch = async (url, init) => {
    sent.push({ url, body: JSON.parse(init.body || '{}'), headers: init.headers })
    const body = url.endsWith('/components/_/action') ? fixture('app.json') : fixture('load-form.json')
    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  const emitted = []
  const app = readJson(webApp('app-flow.json'))
  const pages = [readJson(webApp('flows', 'main', 'pages', 'main-start-page.json')), readJson(webApp('pages', 'shell-page.json'))]
  const rt = bridge.createVbRuntime({
    app, pages, chains, observable, adpFactory,
    constants: { mateuBaseUrl: '' },
    translations: { appBundle: bridge.chromeTextsOf('en') },
    emit: (name, detail) => { emitted.push([name, detail]); return true },
    policy: () => 'internal',
  })
  bridge.setEmbeddedHost({ emit: (name, detail) => { emitted.push([name, detail]); return true } })
  const quiet = { warn: console.warn, error: console.error, debug: console.debug }
  console.warn = () => {}
  console.debug = () => {}
  try {
    const config = bridge.embeddedConfigOf({
      baseUrl: 'https://erp.acme.com/mateu', route: 'person/:id', params: { id: 7, tab: 'main' },
      initialState: { name: 'Seeded' }, appContext: { hotel: 'H1' }, token: 'host-token',
    })
    await bridge.bootEmbedded(bridge, rt, config)
    // 1. the App of the mount: the bootstrap, with the host's identity
    assert.equal(sent[0].url, 'https://erp.acme.com/mateu/mateu/v3/components/_/action')
    assert.equal(sent[0].headers.Authorization, 'Bearer host-token')
    // 2. the screen: the composed route, the seed and the app context, with the same identity
    const load = sent.find((s) => s.url.includes('/mateu/v3/sync/'))
    assert.equal(load.url, 'https://erp.acme.com/mateu/mateu/v3/sync/person/7')
    assert.equal(load.body.route, '/person/7')
    assert.deepEqual(load.body.componentState, { name: 'Seeded' })
    assert.deepEqual(load.body.appState, { hotel: 'H1' })
    assert.equal(load.headers.Authorization, 'Bearer host-token')
    // 3. painted: the content variables the page binds, and the host told
    assert.equal(rt.$application.variables.mateuHostTitle, 'Person')
    assert.ok(rt.$application.variables.mateuFormFieldsList.length > 0, 'the form fields are projected')
    assert.deepEqual(emitted.filter(([n]) => n === EMBEDDED_EVENTS.ready), [[EMBEDDED_EVENTS.ready, { route: '/person/7?tab=main' }]])
    assert.ok(emitted.some(([n, d]) => n === EMBEDDED_EVENTS.title && d.title === 'Person'))
    // the seed was for the FIRST load only
    const before = sent.length
    await bridge.navigateEmbedded(rt, { ...config, initialState: null, route: 'person/:id', params: { id: 8 } })
    const next = sent.slice(before).find((s) => s.url.includes('/sync/person/8'))
    assert.ok(next, 'a property change loads the new route')
    assert.deepEqual(next.body.componentState, {})
    // the host page is untouched: its title (history would have thrown)
    assert.equal(document.title, 'Host title')
  } finally {
    globalThis.fetch = original
    if (!hadWindow) delete globalThis.window
    if (!hadDocument) delete globalThis.document
    delete globalThis.location
    delete globalThis.history
    Object.assign(console, quiet)
    bridge.setEmbeddedHost(null)
    bridge.setHostHeaderProvider(null)
  }
})

for (const [name, fn] of tests) {
  try {
    await fn()
    passed++
    console.log('  ✓ ' + name)
  } catch (e) {
    console.error('  ✗ ' + name)
    console.error(e)
    process.exit(1)
  }
}
console.log(`${passed} embedded tests OK`)
