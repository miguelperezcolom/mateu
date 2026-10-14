// The DOM half of the E2 patterns on the VB shell (appExtras.mjs, recordMerge.mjs), in Node over
// test-harness-dom's fake DOM: what the user does — app shortcuts and «?», quick launch in the
// Ask palette, the header values painted and followed across tabs, the live stream, the idle
// warning (stay, Escape, sign out, another tab signing out, expiry) and the merge picks, custom
// values, «only differences» and the merge action. The pure rules are pinned by test-e2.mjs.
// Run: node test-e2-dom.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { makeDom, sleep, FakeEvent } from './test-harness-dom.mjs'
import { setShortcutContext } from './keys.mjs'
import {
  installAppExtras, syncAppExtras, updateHeaderValue, headerValuesList, runAppShortcut,
  HEADER_VALUES_KEY, LIVE_LEADER_KEY, IDLE_SIGN_OUT_KEY, IDLE_ACTIVITY_KEY,
} from './appExtras.mjs'
import { installRecordMerges, setRecordMergeSink, readMergeDom, MERGE_CUSTOM } from './recordMerge.mjs'

let passed = 0
const tests = []
const test = (name, fn) => tests.push({ name, fn })
const sinkLog = () => { const calls = []; const fn = (...a) => calls.push(a); fn.calls = calls; return fn }

const memory = new Map()
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: (k) => memory.delete(k),
}

// ONE document for the whole file: appExtras installs its listeners once per document and keeps
// module state (the shell on show, the idle clock), exactly as the shell page does
const { doc, win, el, fire } = makeDom()
globalThis.document = doc
const assigned = []
win.location = { assign: (url) => assigned.push(url) }

/** A JET-like dialog: open()/close() + whether it is open. */
const dialog = (id) => {
  const d = el('oj-dialog', { id })
  d.isOpen = false
  d.open = () => { d.isOpen = true }
  d.close = () => { d.isOpen = false }
  return d
}
const values = el('span', { id: 'mateuHeaderValues' })
const help = dialog('mateuShortcutsHelp')
help.appendChild(el('div', { id: 'mateuShortcutsHelpBody' }))
const ask = dialog('mateuAskOracle')
const askInput = el('input', { id: 'mateuAskInput' })
ask.appendChild(askInput)
const idle = dialog('mateuIdleWarning')
idle.appendChild(el('p', { id: 'mateuIdleMessage' }))
const stay = el('oj-button', { id: 'mateuIdleStay' }, el('button'))
const signOut = el('oj-button', { id: 'mateuIdleSignOut' })
idle.appendChild(stay)
idle.appendChild(signOut)
const field = el('input')
for (const n of [values, help, ask, idle, field]) doc.body.appendChild(n)

const navigate = sinkLog()
const runAppAction = sinkLog()
const keepAlive = sinkLog()
const shell = {
  serverSideType: 'app.Shell',
  shortcuts: [
    { key: 'f9', route: '/reservations', label: 'Reservations', code: 'RES' },
    { key: 'g', route: '/guests', label: 'Guests' },
    { key: 'alt+y', actionId: 'syncNow', label: 'Sync', code: 'SYNC' },
  ],
  headerValues: [{ id: 'businessDate', label: 'Business date', value: '12 Oct 2026' }, { id: 'shift', value: 'Night' }],
}
installAppExtras(doc)
installAppExtras(doc) // idempotent: one set of listeners
syncAppExtras(shell, { base: '', navigate, runAppAction, keepAlive })

// ── header values ────────────────────────────────────────────────────────────────────────────
test('header values: painted in the header, labelled, the host shown', () => {
  assert.equal(values.hidden, false)
  const items = values.querySelectorAll('[data-header-value]')
  assert.deepEqual(items.map((i) => i.getAttribute('data-header-value')), ['businessDate', 'shift'])
  assert.equal(items[0].querySelector('.mateu-header-value-label').textContent, 'Business date')
  assert.equal(items[0].querySelector('strong').textContent, '12 Oct 2026')
  assert.equal(items[1].querySelector('.mateu-header-value-label'), null, 'no label, the value alone')
})

test('header values: a change repaints, flags the changed one and tells the other tabs', () => {
  memory.delete(HEADER_VALUES_KEY)
  assert.equal(updateHeaderValue('businessDate', '13 Oct 2026'), true)
  const item = values.querySelector('[data-header-value="businessDate"]')
  assert.equal(item.querySelector('strong').textContent, '13 Oct 2026')
  assert.ok(item.classList.contains('mateu-header-value-changed'))
  assert.equal(JSON.parse(memory.get(HEADER_VALUES_KEY)).value, '13 Oct 2026')
  assert.equal(updateHeaderValue('businessDate', '13 Oct 2026'), false, 'the same value changes nothing')
})

test('header values: another tab\'s change arrives through storage and is not echoed back', () => {
  memory.delete(HEADER_VALUES_KEY)
  win.dispatchEvent(new FakeEvent('storage', { key: HEADER_VALUES_KEY, newValue: JSON.stringify({ id: 'shift', value: 'Morning' }) }))
  assert.equal(headerValuesList().find((v) => v.id === 'shift').value, 'Morning')
  assert.equal(memory.has(HEADER_VALUES_KEY), false)
  win.dispatchEvent(new FakeEvent('storage', { key: HEADER_VALUES_KEY, newValue: '{not json' }))
  assert.equal(headerValuesList().length, 2)
})

// ── app shortcuts ────────────────────────────────────────────────────────────────────────────
test('shortcuts: a function key goes to its route from anywhere, even while typing', () => {
  const ev = fire(doc.body, 'keydown', { key: 'F9' })
  assert.deepEqual(navigate.calls.pop(), ['/reservations'])
  assert.ok(ev.defaultPrevented)
  doc.activeElement = field
  fire(field, 'keydown', { key: 'F9' })
  assert.deepEqual(navigate.calls.pop(), ['/reservations'])
})

test('shortcuts: a plain letter waits until the user is not typing', () => {
  doc.activeElement = field
  fire(field, 'keydown', { key: 'g' })
  assert.equal(navigate.calls.length, 0)
  doc.activeElement = doc.body
  fire(doc.body, 'keydown', { key: 'g' })
  assert.deepEqual(navigate.calls.pop(), ['/guests'])
})

test('shortcuts: an action shortcut runs the app action; a screen shortcut on the key wins', () => {
  fire(doc.body, 'keydown', { key: '©', code: 'KeyY', altKey: true })
  assert.deepEqual(runAppAction.calls.pop(), ['syncNow'])
  setShortcutContext({ tree: { actions: [{ id: 'screenSave', shortcut: 'F9' }] } })
  fire(doc.body, 'keydown', { key: 'F9' })
  assert.equal(navigate.calls.length, 0, 'the screen declares F9: the app stands down')
  setShortcutContext(null)
  const prevented = new FakeEvent('keydown', { key: 'F9', bubbles: true })
  prevented.preventDefault()
  doc.body.dispatchEvent(prevented)
  assert.equal(navigate.calls.length, 0, 'a key somebody already took is left alone')
})

test('«?» opens the list: app shortcuts with codes and keys, the screen\'s, the help key', () => {
  setShortcutContext({ tree: { actions: [{ id: 'print', shortcut: 'ctrl+p' }] } })
  doc.body.appendChild(el('oj-button', { 'data-action-id': 'print', 'aria-label': 'Print' }))
  doc.body.appendChild(el('oj-tab', { 'data-shortcut': 'alt+1', text: 'General' }))
  fire(doc.body, 'keydown', { key: '?', shiftKey: true })
  assert.equal(help.isOpen, true)
  const body = doc.getElementById('mateuShortcutsHelpBody')
  const labels = body.querySelectorAll('.mateu-sc-label').map((l) => l.textContent)
  assert.deepEqual(labels.slice(0, 3), ['Reservations', 'Guests', 'Sync'])
  assert.ok(labels.includes('Print') && labels.includes('General'), labels.join(','))
  assert.ok(body.querySelectorAll('.mateu-sc-code').map((c) => c.textContent).includes('RES'))
  assert.ok(body.querySelectorAll('.mateu-sc-key').map((k) => k.textContent).includes('F9'))
  // picking an app shortcut in the list runs it and closes the list
  body.querySelector('button.mateu-sc-row').click()
  assert.equal(help.isOpen, false)
  assert.deepEqual(navigate.calls.pop(), ['/reservations'])
  setShortcutContext(null)
  // not while typing: «?» is a character there
  doc.activeElement = field
  fire(field, 'keydown', { key: '?', shiftKey: true })
  assert.equal(help.isOpen, false)
  doc.activeElement = doc.body
})

test('quick launch: an exact code + Enter in the Ask palette closes it and goes there', () => {
  ask.open()
  askInput.value = ' res '
  const ev = fire(askInput, 'keydown', { key: 'Enter' })
  assert.ok(ev.defaultPrevented)
  assert.equal(ask.isOpen, false)
  assert.deepEqual(navigate.calls.pop(), ['/reservations'])
  ask.open()
  askInput.value = 'reser'
  fire(askInput, 'keydown', { key: 'Enter' })
  assert.equal(ask.isOpen, true, 'not a code: the palette handles Enter itself')
  ask.close()
})

test('runAppShortcut: nothing to run, nothing happens', () => {
  runAppShortcut(null)
  runAppShortcut({ label: 'nowhere' })
  assert.equal(navigate.calls.length + runAppAction.calls.length, 0)
})

// ── live updates ─────────────────────────────────────────────────────────────────────────────
test('live: the leader tab holds the stream and applies the header changes it carries', async () => {
  const encoder = new TextEncoder()
  const requests = []
  globalThis.fetch = (url, init) => {
    requests.push({ url, body: JSON.parse(init.body) })
    const chunks = [
      'data: {"commands":[]}\n\n',
      'data: {"commands":[{"type":"UpdateHeaderValue","data":{"id":"businessDate","value":"14 Oct 2026"}}]}\n\n',
      'data: not json\n\n',
    ]
    return Promise.resolve({
      ok: true,
      body: new ReadableStream({ start(c) { for (const s of chunks) c.enqueue(encoder.encode(s)); c.close() } }),
    })
  }
  syncAppExtras({ ...shell, liveUpdates: true }, { base: '/app', navigate, runAppAction, keepAlive })
  await sleep(30)
  assert.equal(requests[0].url, '/app/mateu/v3/sse/_no_route')
  assert.equal(requests[0].body.actionId, '_live-updates')
  assert.equal(requests[0].body.serverSideType, 'app.Shell')
  assert.ok(JSON.parse(memory.get(LIVE_LEADER_KEY)).tab, 'this tab is the leader')
  assert.equal(headerValuesList().find((v) => v.id === 'businessDate').value, '14 Oct 2026')
})

test('live: another tab leading → this one holds no stream; leaving releases the lead', async () => {
  // turn it off: the lead is released
  syncAppExtras(shell, { base: '/app', navigate, runAppAction, keepAlive })
  assert.equal(memory.has(LIVE_LEADER_KEY), false)
  // a fresh leader elsewhere: this tab does not connect
  memory.set(LIVE_LEADER_KEY, JSON.stringify({ tab: 'other', at: Date.now() }))
  let calls = 0
  globalThis.fetch = () => { calls++; return new Promise(() => {}) }
  syncAppExtras({ ...shell, liveUpdates: true }, { base: '/app', navigate, runAppAction, keepAlive })
  await sleep(10)
  assert.equal(calls, 0)
  // the other tab went silent: this one takes over on its next tick (forced here by a re-sync)
  memory.set(LIVE_LEADER_KEY, JSON.stringify({ tab: 'other', at: 0 }))
  syncAppExtras({ ...shell, liveUpdates: true, serverSideType: 'app.Other' }, { base: '/app', navigate, runAppAction, keepAlive })
  await sleep(10)
  assert.equal(calls, 1)
  win.dispatchEvent(new FakeEvent('pagehide'))
  assert.equal(memory.has(LIVE_LEADER_KEY), false)
  syncAppExtras(shell, { base: '/app', navigate, runAppAction, keepAlive })
})

test('live: a failed stream is retried with a back-off, not in a loop', async () => {
  let calls = 0
  globalThis.fetch = () => { calls++; return Promise.resolve({ ok: false, status: 503 }) }
  syncAppExtras({ ...shell, liveUpdates: true }, { base: '/app', navigate, runAppAction, keepAlive })
  await sleep(50)
  assert.equal(calls, 1, 'one attempt, then a wait')
  syncAppExtras(shell, { base: '/app', navigate, runAppAction, keepAlive })
})

// ── idle warning ─────────────────────────────────────────────────────────────────────────────
const idleShell = { ...shell, idleSession: { timeoutSeconds: 3, warningSeconds: 2, signOutUrl: '/logout', keepAliveActionId: '_keep-alive' } }

test('idle: the warning opens with the countdown, focus goes to «Stay»; Escape stays', async () => {
  syncAppExtras(idleShell, { base: '', navigate, runAppAction, keepAlive })
  await sleep(1100)
  assert.equal(idle.isOpen, true)
  assert.match(doc.getElementById('mateuIdleMessage').textContent, /\d+ second/)
  await sleep(150)
  assert.equal(doc.activeElement, stay.querySelector('button'))
  const ev = fire(doc.body, 'keydown', { key: 'Escape' })
  assert.ok(ev.defaultPrevented)
  assert.equal(idle.isOpen, false)
  assert.deepEqual(keepAlive.calls.pop(), ['_keep-alive'])
})

test('idle: «Stay signed in» in another tab closes this tab\'s warning', async () => {
  await sleep(2050)
  assert.equal(idle.isOpen, true)
  memory.set(IDLE_ACTIVITY_KEY, String(Date.now() + 60_000))
  win.dispatchEvent(new FakeEvent('storage', { key: IDLE_ACTIVITY_KEY, newValue: memory.get(IDLE_ACTIVITY_KEY) }))
  assert.equal(idle.isOpen, false)
  // activity while active is recorded (not while the warning is up)
  fire(doc.body, 'pointerdown')
})

test('idle: «Stay» clicked keeps the session', () => {
  idle.open()
  fire(stay, 'ojAction')
  assert.equal(idle.isOpen, false)
  assert.deepEqual(keepAlive.calls.pop(), ['_keep-alive'])
})

test('idle: «Sign out» → a cancelable event the app may take over, then the sign-out url', () => {
  let claimed = 0
  const take = (e) => { claimed++; assert.equal(e.detail.url, '/logout'); e.preventDefault() }
  doc.addEventListener('mateu-idle-sign-out', take)
  fire(signOut, 'ojAction')
  assert.equal(claimed, 1)
  assert.equal(assigned.length, 0, 'the app signed out itself')
  assert.ok(memory.get(IDLE_SIGN_OUT_KEY), 'the other tabs are told')
  assert.equal(doc.getElementById('mateuIdleMessage').textContent.length > 0, true)
  // already signing out: a second sign-out (another tab) does nothing more
  win.dispatchEvent(new FakeEvent('storage', { key: IDLE_SIGN_OUT_KEY, newValue: '1' }))
  assert.equal(claimed, 1)
  doc.removeEventListener('mateu-idle-sign-out', take)
  syncAppExtras(shell, { base: '', navigate, runAppAction, keepAlive }) // stops the idle clock
})

// ── record merge ─────────────────────────────────────────────────────────────────────────────
const mergeRoot = () => {
  const spec = {
    records: [{ id: 'a', label: 'Profile 1021' }, { id: 'b', label: 'Profile 3388' }],
    fields: [
      { fieldId: 'email', label: 'Email', values: [null, 'ana@example.com'], differs: true },
      { fieldId: 'phone', label: 'Phone', values: ['+34 600', '+34 611'], editable: true, differs: true },
    ],
    parameters: { survivor: 'a' },
    mergeActionId: 'mergeProfiles',
  }
  const root = el('div', { 'data-rm-spec': JSON.stringify(spec) })
  const radio = (field, value, checked) => {
    const r = el('input', { type: 'radio', 'data-rm-field': field, value })
    r.value = value
    let on = checked
    Object.defineProperty(r, 'checked', {
      get: () => on,
      set: (v) => {
        on = !!v
        if (on) for (const other of root.querySelectorAll('input[type="radio"][data-rm-field="' + field + '"]')) if (other !== r) other.checked = false
      },
    })
    return el('div', { 'data-rm-cell': '' }, r)
  }
  root.appendChild(radio('email', 'a', false))
  root.appendChild(radio('email', 'b', true))
  root.appendChild(radio('phone', 'a', true))
  root.appendChild(radio('phone', 'b', false))
  root.appendChild(radio('phone', MERGE_CUSTOM, false))
  const custom = el('input', { type: 'text', 'data-rm-custom': 'phone' })
  custom.value = ''
  root.appendChild(custom)
  for (const id of ['email', 'phone']) {
    root.appendChild(el('div', { 'data-rm-result': id }, el('span', { class: 'mateu-rm-result-value' }), el('span', { class: 'mateu-rm-result-from' })))
  }
  root.appendChild(el('span', { 'data-rm-summary': '' }))
  root.appendChild(el('oj-switch', { 'data-rm-diff': '' }))
  root.appendChild(el('oj-button', { 'data-rm-merge': '' }))
  doc.body.appendChild(root)
  return { root, custom }
}

test('merge: a pick repaints the result, the picked cell and the summary', () => {
  installRecordMerges(doc)
  installRecordMerges(doc)
  const { root } = mergeRoot()
  const radios = root.querySelectorAll('input[type="radio"]')
  radios[1].checked = false
  radios[0].checked = true
  fire(radios[0], 'change')
  assert.equal(root.querySelector('[data-rm-result="email"] .mateu-rm-result-from').textContent.includes('Profile 1021'), true)
  assert.ok(radios[0].parentNode.classList.contains('mateu-rm-picked'))
  assert.equal(radios[1].parentNode.classList.contains('mateu-rm-picked'), false)
  assert.ok(root.querySelector('[data-rm-summary]').textContent.length > 0)
  root.remove()
})

test('merge: typing a custom value picks it; «only differences» toggles the rows', () => {
  const { root, custom } = mergeRoot()
  custom.value = '+34 622'
  fire(custom, 'input')
  assert.deepEqual(readMergeDom(root), { picks: { email: 'b', phone: MERGE_CUSTOM }, custom: { phone: '+34 622' } })
  assert.equal(root.querySelector('[data-rm-result="phone"] .mateu-rm-result-value').textContent, '+34 622')
  const sw = root.querySelector('[data-rm-diff]')
  fire(sw, 'valueChanged', { detail: { value: true } })
  assert.ok(root.classList.contains('mateu-rm-diff-only'))
  fire(sw, 'valueChanged', { detail: { value: false } })
  assert.equal(root.classList.contains('mateu-rm-diff-only'), false)
  root.remove()
})

test('merge: the button runs the merge action with _merged and _choices', () => {
  const sink = sinkLog()
  setRecordMergeSink(sink)
  const { root, custom } = mergeRoot()
  custom.value = '+34 699'
  fire(custom, 'input')
  fire(root.querySelector('[data-rm-merge]'), 'ojAction')
  assert.equal(sink.calls.length, 1)
  const [actionId, parameters] = sink.calls[0]
  assert.equal(actionId, 'mergeProfiles')
  assert.equal(parameters.survivor, 'a')
  assert.deepEqual(parameters._merged, { email: 'ana@example.com', phone: '+34 699' })
  assert.deepEqual(parameters._choices, { email: 'b', phone: MERGE_CUSTOM })
  // no sink, or a broken spec: nothing runs, nothing throws
  setRecordMergeSink(null)
  fire(root.querySelector('[data-rm-merge]'), 'ojAction')
  root.setAttribute('data-rm-spec', '{broken')
  fire(root.querySelector('input[type="radio"]'), 'change')
  assert.equal(sink.calls.length, 1)
  root.remove()
})

for (const t of tests) {
  await t.fn()
  passed++
  console.log('  ✓ ' + t.name)
}
console.log(`\n${passed} E2 DOM tests passed`)
