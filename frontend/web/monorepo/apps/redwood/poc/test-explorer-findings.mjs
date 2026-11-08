// Display components the Mateu Explorer found drawn short of what the wire says (3.0-beta.51):
// a Text's variants, a Badge's icons, an OfferCard without an action, a StatusList's icons and its
// column count. Each test pins the projection (and, where the markup decides, the generated page).
// Run: node test-explorer-findings.mjs (npm test runs it with the other suites).
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { islandContentOf } from './reduceContexts.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const node = (metadata, children = [], id = '') => ({ type: 'ClientSide', id: id || metadata.id || '', metadata, children })
const atomsOf = (tree, state = {}, data = {}) =>
  (islandContentOf({ tree, state, data }) || []).flatMap((b) => b.items || [])
const page = () => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
const template = () => readFileSync(join(here, 'templates', 'atoms.html'), 'utf8')

test('a Text\'s variants: b is bold, i italic (they were dropped)', () => {
  const texts = atomsOf(node({ type: 'VerticalLayout' }, [
    node({ type: 'Text', text: 'bold', variants: ['b'] }),
    node({ type: 'Text', text: 'italic', variants: ['i'] }),
    node({ type: 'Text', text: 'Total', container: 'h4', variants: ['b', 'i'] }),
    node({ type: 'Text', text: 'plain' }),
  ])).filter((a) => a.isText)
  const by = (t) => texts.find((a) => a.text === t)
  assert.match(by('bold').cls, /oj-typography-bold/)
  assert.notEqual((by('bold').style || {}).fontStyle, 'italic')
  assert.equal(by('italic').style.fontStyle, 'italic')
  assert.match(by('Total').cls, /oj-typography-bold/)
  assert.equal(by('Total').style.fontStyle, 'italic')
  assert.doesNotMatch(by('plain').cls, /oj-typography-bold/)
})

console.log(`\n${passed} explorer-findings tests OK`)
