// Contract tests of the E2 patterns on the VB renderer — the server reference is backend core's
// RecordMergeSyncTest / AppShellExtrasSyncTest, the web reference libs/mateu recordMerge.ts,
// appShortcuts.ts, headerValues.ts, liveUpdates.ts and idleSession.ts (same rules, same storage keys).
// Run: node test-e2.mjs (npm test runs it with the other suites).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { reduceContexts, islandContentOf, isRichAtom, HOST_ID } from './reduceContexts.mjs'
import {
  MERGE_CUSTOM, mergeInitialPicks, mergeParametersOf, mergeSummaryOf, mergeResultOf, recordMergeAtomOf,
} from './recordMerge.mjs'
import {
  appShortcutFor, isShortcutsHelpKey, quickLaunchMatch, appShortcutRowsOf, isTypingElement,
  headerChangesOf, shouldLeadLive, liveReconnectDelay, LIVE_STALE_MS, idlePhaseOf, latestActivityOf,
  recordActivityOf, IDLE_ACTIVITY_KEY, IDLE_WRITE_EVERY_MS, seedHeaderValues, updateHeaderValue,
  headerValuesList, HEADER_VALUES_KEY,
} from './appExtras.mjs'
import { applyDomEffects } from './files.mjs'
import { REDWOOD_COVERAGE } from './coverage.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')

const memory = new Map()
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: (k) => memory.delete(k),
}

// ── 1. Compare & merge ───────────────────────────────────────────────────────────────────────
const merge = {
  type: 'RecordMerge', title: 'Duplicate guests',
  records: [{ id: 'a', label: 'Profile 1021', caption: '12 stays' }, { id: 'b', label: 'Profile 3388' }],
  fields: [
    { fieldId: 'name', label: 'Name', values: ['Ana', 'Ana'], chosen: 'a', differs: false },
    { fieldId: 'email', label: 'Email', values: [null, 'ana@example.com'], chosen: 'b', differs: true },
    { fieldId: 'phone', label: 'Phone', values: ['+34 600', '+34 611'], editable: true, differs: true },
  ],
  mergeActionId: 'mergeProfiles', mergeLabel: 'Merge', parameters: { survivor: 'a' }, differencesOnly: false,
}

test('RecordMerge: picks start from the server, else the first record with a value', () => {
  assert.deepEqual(mergeInitialPicks(merge), { name: 'a', email: 'b', phone: 'a' })
})

test('RecordMerge: the merge sends the parameters plus _merged and _choices (custom = typed)', () => {
  assert.deepEqual(mergeParametersOf(merge, { name: 'a', email: 'b', phone: MERGE_CUSTOM }, { phone: '+34 622' }), {
    survivor: 'a',
    _merged: { name: 'Ana', email: 'ana@example.com', phone: '+34 622' },
    _choices: { name: 'a', email: 'b', phone: 'custom' },
  })
  assert.deepEqual(mergeSummaryOf(merge, { phone: MERGE_CUSTOM }), { fields: 3, differ: 2, custom: 1 })
  assert.equal(mergeResultOf(merge, { email: 'b' }, {})[1].text, 'ana@example.com')
})

test('RecordMerge: the atom has a radio group per field with accessible names, differing rows marked', () => {
  const a = recordMergeAtomOf(merge, 'profiles')
  assert.equal(a.isRecordMerge, true)
  assert.equal(isRichAtom(a), true)
  assert.equal(a.records.length, 2)
  const email = a.rows[1]
  assert.match(email.rowClass, /mateu-rm-differs/)
  assert.match(a.rows[0].rowClass, /mateu-rm-same/)
  assert.equal(email.cells[1].checked, true)
  assert.equal(email.cells[1].ariaLabel, 'Use value from Profile 3388 for Email')
  assert.equal(email.cells[0].name, email.cells[1].name)
  assert.equal(a.rows[2].editable, true)
  assert.equal(a.anyEditable, true)
  assert.equal(JSON.parse(a.spec).mergeActionId, 'mergeProfiles')
  assert.equal(a.summary, '3 fields: 2 differ; 0 typed by hand')
})

test('RecordMerge: the content projection paints it as an atom, and coverage + template know it', () => {
  const blocks = islandContentOf({ id: HOST_ID, tree: { type: 'ServerSide', id: 'p', children: [{ type: 'ClientSide', id: 'profiles', metadata: merge, children: [] }] }, state: {}, data: {} })
  const atoms = blocks.flatMap((b) => b.items || [])
  assert.equal(atoms.filter((a) => a.isRecordMerge).length, 1)
  assert.equal(REDWOOD_COVERAGE.RecordMerge.status, 'full')
  assert.match(readFileSync(join(here, 'templates', 'atoms.html'), 'utf8'), /isRecordMerge[\s\S]*data-rm-merge/)
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installRecordMerges\(\)/)
})

// ── 2. App shortcuts & quick launch ──────────────────────────────────────────────────────────
const shortcuts = [
  { key: 'f9', label: 'Reservations', route: '/reservations', code: 'RES' },
  { key: 'alt+g', label: 'Guests', route: '/guests', code: 'GST' },
  { key: 'g', label: 'Plain letter', route: '/plain' },
  { code: 'SYNC', label: 'Sync now', actionId: 'syncNow' },
]
const key = (k, extra = {}) => ({ key: k, code: '', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...extra })

test('app shortcuts: F-keys and combinations anywhere, plain keys never while typing', () => {
  assert.equal(appShortcutFor(shortcuts, key('F9'), true).route, '/reservations')
  assert.equal(appShortcutFor(shortcuts, key('©', { altKey: true, code: 'KeyG' }), false).route, '/guests')
  assert.equal(appShortcutFor(shortcuts, key('g'), true), undefined)
  assert.equal(appShortcutFor(shortcuts, key('g'), false).route, '/plain')
})

test('app shortcuts: a screen shortcut on the same key wins', () => {
  assert.equal(appShortcutFor(shortcuts, key('F9'), false, ['f9']), undefined)
})

test('app shortcuts: «?» opens the list, never while typing', () => {
  assert.equal(isShortcutsHelpKey(key('?', { shiftKey: true }), false), true)
  assert.equal(isShortcutsHelpKey(key('?', { shiftKey: true }), true), false)
  assert.equal(isTypingElement({ localName: 'input', type: 'text' }), true)
  assert.equal(isTypingElement({ localName: 'input', type: 'radio' }), false)
})

test('quick launch: an exact code; palette rows with code matches first', () => {
  assert.equal(quickLaunchMatch(shortcuts, ' res ').route, '/reservations')
  assert.equal(quickLaunchMatch(shortcuts, 're'), undefined)
  const rows = appShortcutRowsOf(shortcuts, 's')
  assert.deepEqual(rows.map((r) => r.label), ['Sync now', 'Reservations', 'Guests'])
  assert.equal(rows[1].kind, 'RES · F9')
  assert.equal(rows[0].actionId, 'syncNow')
  assert.deepEqual(appShortcutRowsOf(shortcuts, ''), [])
})

test('app shortcuts: the shell wires the extras and the Ask palette lists the codes', () => {
  assert.match(webApp('pages/shell-page-chains/loadMateuShell.js'), /bridge\.installAppExtras\(\)[\s\S]*bridge\.syncAppExtras\(reg\.shell/)
  assert.match(webApp('pages/shell-page-chains/askOracleOpen.js'), /appShortcutRowsOf/)
  const page = webApp('pages/shell-page.html')
  assert.match(page, /id="mateuShortcutsHelp"/)
  assert.match(page, /id="mateuIdleWarning" role="alertdialog"/)
  assert.match(page, /id="mateuHeaderValues"/)
})

// ── 3. Live header values ────────────────────────────────────────────────────────────────────
test('header values: the App carries them; UpdateHeaderValue becomes an effect', () => {
  const reg = reduceContexts({ contexts: {}, stack: [], shell: null }, {
    commands: [{ type: 'UpdateHeaderValue', data: { id: 'businessDate', label: null, value: '13 Oct' } }],
    messages: [],
    fragments: [{ component: { type: 'ClientSide', id: 'app', metadata: {
      type: 'App', title: 'PMS', menu: [], shortcuts, liveUpdates: true,
      headerValues: [{ id: 'businessDate', label: 'Business date', value: '12 Oct' }],
      idleSession: { timeoutSeconds: 1800, warningSeconds: 60, signOutUrl: '/', keepAliveActionId: '_keep-alive' },
    }, children: [] } }],
  })
  assert.equal(reg.shell.liveUpdates, true)
  assert.equal(reg.shell.shortcuts.length, 4)
  assert.equal(reg.shell.headerValues[0].value, '12 Oct')
  assert.equal(reg.shell.idleSession.keepAliveActionId, '_keep-alive')
  assert.deepEqual(reg.effects.headerValues, [{ id: 'businessDate', value: '13 Oct' }])
  const seen = []
  applyDomEffects(reg.effects, null, { mateuHeaderValue: (id, v) => seen.push([id, v]), mateuAnnounce: () => {} })
  assert.deepEqual(seen, [['businessDate', '13 Oct']])
})

test('header values: the store keeps the label and tells the other tabs (same key as the web)', () => {
  seedHeaderValues([{ id: 'businessDate', label: 'Business date', value: '12 Oct' }])
  assert.equal(updateHeaderValue('businessDate', '13 Oct', { quiet: true }), true)
  assert.deepEqual(headerValuesList(), [{ id: 'businessDate', label: 'Business date', value: '13 Oct' }])
  assert.deepEqual(JSON.parse(memory.get(HEADER_VALUES_KEY)).id, 'businessDate')
  memory.delete(HEADER_VALUES_KEY)
  assert.equal(updateHeaderValue('businessDate', '13 Oct', { quiet: true }), false)
  updateHeaderValue('businessDate', '14 Oct', { quiet: true, broadcast: false })
  assert.equal(memory.get(HEADER_VALUES_KEY), undefined)
})

test('live stream: one leader per browser, back-off on errors, header changes of an increment', () => {
  assert.equal(shouldLeadLive(null, 'me', 1), true)
  assert.equal(shouldLeadLive({ tab: 'other', at: 1000 }, 'me', 2000), false)
  assert.equal(shouldLeadLive({ tab: 'other', at: 0 }, 'me', LIVE_STALE_MS + 1), true)
  assert.equal(liveReconnectDelay(0), 1000)
  assert.equal(liveReconnectDelay(3), 8000)
  assert.equal(liveReconnectDelay(30), 60000)
  assert.deepEqual(headerChangesOf({ commands: [{ type: 'UpdateHeaderValue', data: { id: 'x', value: 'y' } }, { type: 'NavigateTo', data: '/' }] }),
    [{ id: 'x', value: 'y' }])
})

// ── 4. Idle session ──────────────────────────────────────────────────────────────────────────
test('idle: active, warning with the seconds left, expired; measured from any tab', () => {
  const idle = { timeoutSeconds: 60, warningSeconds: 20 }
  assert.deepEqual(idlePhaseOf(30000, 0, idle), { phase: 'active', secondsLeft: 30 })
  assert.deepEqual(idlePhaseOf(45000, 0, idle), { phase: 'warning', secondsLeft: 15 })
  assert.deepEqual(idlePhaseOf(60000, 0, idle), { phase: 'expired', secondsLeft: 0 })
  memory.set(IDLE_ACTIVITY_KEY, '50000')
  assert.equal(latestActivityOf(10000), 50000)
  const state = { own: 0, written: 0 }
  recordActivityOf(state, 1000)
  assert.equal(memory.get(IDLE_ACTIVITY_KEY), '50000')
  recordActivityOf(state, IDLE_WRITE_EVERY_MS + 1)
  assert.equal(memory.get(IDLE_ACTIVITY_KEY), String(IDLE_WRITE_EVERY_MS + 1))
})

console.log(`\n${passed} E2 tests passed`)
