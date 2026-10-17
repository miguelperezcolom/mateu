// Data that reaches an HTML/URL sink of the Redwood renderer: what the user sees when a record value,
// a remote's state or a template tries to be markup, a link or an expression.
// Run: node test-security.mjs (npm test runs it with the other suites).
import './test-locale.mjs' // first: off English the suite reruns in English (see the module)
import assert from 'node:assert/strict'
import { interpolate, literalText, reduceContexts, HOST_ID } from './reduceContexts.mjs'

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
