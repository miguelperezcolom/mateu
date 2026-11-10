// Explorer review, stream W4 (texts, navigation & shell, federation) — regressions of the fixes.
import assert from 'node:assert/strict'
import { interpolate, islandContentOf } from './core/content.mjs'
import { fieldListOf } from './core/tree.mjs'
import { markdownToHtml } from './richtext.mjs'
import { runSurfaceAction } from './transport.mjs'
import { ruleSurfacesOf } from './rules.mjs'

let passed = 0
const test = (name, fn) => {
  try { fn(); passed++ } catch (e) { console.error('✗ ' + name); throw e }
}
const atest = async (name, fn) => {
  try { await fn(); passed++ } catch (e) { console.error('✗ ' + name); throw e }
}
const cs = (metadata, children = [], extra = {}) => ({ type: 'ClientSide', metadata, children, ...extra })

test('an escaped ${i18n.x} is the literal text, an unescaped one its key', () => {
  assert.equal(interpolate('A YAML page with \\${i18n.title}', {}), 'A YAML page with ${i18n.title}')
  assert.equal(interpolate('Hello ${i18n.greeting}', {}), 'Hello greeting')
})

test('a Markdown is prose: its ${…} is never interpolated (descriptions, Code tabs)', () => {
  const tree = cs({ type: 'Markdown', markdown: 'A `${…}` in a label, and `@Label("Price (${state.currency})")`' })
  const blocks = islandContentOf({ tree, state: { currency: 'EUR' } }) || []
  const html = JSON.stringify(blocks)
  assert.ok(html.includes('${state.currency}'), html)
  assert.ok(!html.includes('Price (EUR)'), html)
})

test('a form field label is interpolated against the state, like a section title', () => {
  const tree = cs({ type: 'Form', title: 'Rate' }, [
    cs({ type: 'FormLayout' }, [
      cs({ type: 'FormField', fieldId: 'price', dataType: 'number', stereotype: 'regular', label: 'Price per night (${state.currency})' }),
    ]),
  ])
  const fields = fieldListOf(tree, { currency: 'USD', price: 1 }, {})
  assert.equal(fields.length, 1)
  assert.equal(fields[0].label, 'Price per night (USD)')
  // …and the same field painted in an island's form layout (islandContentOf → layoutFieldOf)
  const blocks = islandContentOf({ tree, state: { currency: 'USD', price: 1 } }) || []
  assert.ok(JSON.stringify(blocks).includes('Price per night (USD)'), JSON.stringify(blocks).slice(0, 600))
})

test('a list item wrapped onto a second line stays one item (lazy continuation)', () => {
  const html = markdownToHtml('Mateu:\n\n- keeps the required fields;\n- folds the optional ones into\n  More options;\n- done\n\nAfter.')
  assert.equal(html, '<p>Mateu:</p><ul><li>keeps the required fields;</li><li>folds the optional ones into More options;</li><li>done</li></ul><p>After.</p>')
})

await atest('an island action\'s error is shown ONCE (no subscriber answered: its toasts were counted twice)', async () => {
  const original = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ fragments: [], commands: [],
    messages: [{ variant: 'error', text: 'Errors stay until you close them', duration: 0, persistence: 'sticky' }] }) })
  try {
    const island = { type: 'ServerSide', id: 'isl', serverSideType: 'x.FluentButtons', actions: [{ id: 'fail' }], children: [] }
    const reg = {
      contexts: {
        __root__: { id: '__root__', kind: 'host', tree: { type: 'ServerSide', id: 'host', serverSideType: 'x.Page', children: [island] }, state: {}, data: {}, outbound: { baseUrl: 'http://x', route: '/r' } },
        isl: { id: 'isl', kind: 'island', tree: island, state: {}, data: {}, outbound: { baseUrl: 'http://x', route: '/r', serverSideType: 'x.FluentButtons' } },
      },
      stack: [],
    }
    const next = await runSurfaceAction(reg, 'isl', 'fail', {}, { appState: {} })
    assert.equal(next.effects.toasts.length, 1, JSON.stringify(next.effects.toasts))
  } finally {
    globalThis.fetch = original
  }
})

test('the rules of an island painted inside the host apply to its fields (@Hidden("!state.company"))', () => {
  const island = { type: 'ServerSide', id: 'ship', serverSideType: 'x.ShippingForm', initialData: { company: false },
    rules: [{ filter: 'true', action: 'SetDataValue', fieldName: 'companyName', fieldAttribute: 'hidden', expression: '!state.company', result: 'Continue' }], children: [] }
  const reg = { contexts: { __root__: { id: '__root__', kind: 'host', tree: { type: 'ServerSide', id: 'entry', children: [island] }, state: {}, data: {} } }, stack: [] }
  const surfaces = ruleSurfacesOf(reg)
  assert.equal(surfaces.length, 1)
  assert.equal(surfaces[0].surface, 'host')
  assert.equal(surfaces[0].ctx.tree, island)
  assert.deepEqual(surfaces[0].ctx.state, { company: false })
})

console.log(`test-explorer-w4: ${passed} passed`)
