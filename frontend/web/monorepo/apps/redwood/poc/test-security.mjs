// Data that reaches an HTML/URL sink of the Redwood renderer: what the user sees when a record value,
// a remote's state or a template tries to be markup, a link or an expression.
// Run: node test-security.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { interpolate, literalText, reduceContexts, HOST_ID } from './reduceContexts.mjs'
import { storedTokenMayGoTo, trustShellBase, trustDeclaredRemoteBases, resetCredentialOrigins } from './hostHeaders.mjs'
import { fetchWithPolicy, connectivity } from './resilience.mjs'
import { expandRemoteMenus } from './transport.mjs'
import { fileDownloadOf, isPassiveInlineType } from './files.mjs'
import { sanitizeElementHtml } from './elements.mjs'
import { sanitizeHtml } from './richtext.mjs'

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

// ── MINOR 7: Element HTML ─────────────────────────────────────────────────

test('MINOR 7: Element HTML with data goes through the whitelist (no style, form, svg animation, math, template)', () => {
  const out = sanitizeElementHtml('<style>body{display:none}</style><form action="//phish"><input name=p></form>'
    + '<svg><set attributeName="href" to="javascript:alert(1)"/><animate/></svg><math><mi>x</mi></math>'
    + '<template><img src=x onerror=1></template><table class="t"><tr><td style="color: red; background: url(//x)">1</td></tr></table>')
  assert.equal(out, '<table class="t"><tr><td style="color: red">1</td></tr></table>')
  assert.equal(sanitizeHtml('<b class="x">a</b>'), '<b>a</b>', 'a rich-text value keeps no attributes')
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
