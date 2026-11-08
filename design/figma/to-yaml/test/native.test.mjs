// A file made with the CURRENT library (design/figma/plugin): params set in Figma's properties panel
// (TEXT/BOOLEAN component properties) and content DRAGGED into native slots (layers of type SLOT
// under the instance), every config property mirrored by its `#prop:`/`#flag:` marker layer and an
// untouched TEXT one showing its own name. test/fixtures/native.figma.json is synthetic — Figma does not document the
// REST shape of slot content yet (figma/rest-api-spec#88) — and is pinned against test/golden-native,
// which FigmaYamlGoldenTest (backend/shared/core) also runs through the real validator and loader.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/schema.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = JSON.parse(readFileSync(join(here, 'fixtures/native.figma.json'), 'utf8'))
const converter = () => new FigmaToYaml({ contract: loadContract(), schema: loadSchema() })

const text = (name, characters, ref) => ({ type: 'TEXT', name, characters, ...(ref ? { componentPropertyReferences: { characters: ref } } : {}) })
const screen = (children, components) => ({
  components,
  document: { children: [{ type: 'CANVAS', name: 'Screens', children: [{ type: 'FRAME', id: '1:1', name: 'screen', children }] }] },
})

test('the native fixture converts to its golden, with no warnings', () => {
  const { files, warnings } = converter().convert(fixture)
  assert.deepEqual(warnings, [])
  assert.deepEqual(files.map((f) => f.path), ['order.yaml'])
  assert.equal(files[0].text, readFileSync(join(here, 'golden-native/order.yaml'), 'utf8'))
})

test('properties are read: TEXT values, BOOLEAN true, untouched placeholders skipped', () => {
  const page = converter().convert(fixture).files[0].value
  const customer = page.template.body[0]
  assert.equal(customer.id, 'customer')
  assert.equal(customer.required, true)
  assert.equal(customer.label, 'Customer')
  assert.ok(!('placeholder' in customer), 'an untouched "Value" is its placeholder, not a value')
  assert.ok(!('overline' in page), 'an untouched "Overline" is not read')
  assert.equal(page.template.avatar.initials, '${state.initials}')
  assert.equal(page.toolbar[0].actionId, 'backToList')
  assert.equal(page.toolbar[1].buttonStyle, 'primary')
})

test('slot content: a SLOT named after its frame, one renamed (read by its property), and the old sibling fallback', () => {
  const page = converter().convert(fixture).files[0].value
  const titles = page.content.map((c) => c.title.text)
  assert.deepEqual(titles, ['Lines', 'Delivery', 'Notes'])
  assert.deepEqual(page.content[0].content.content.map((f) => f.id), ['product', 'quantity'])
  assert.deepEqual(page.content[1].content.content.map((f) => f.id), ['address'])
  assert.ok(page.content[1].content.content[0].propertyRow)
  // the Notes section (old library, empty frame slot) takes the field that follows it
  assert.deepEqual(page.content[2].content.content.map((f) => f.id), ['note'])
})

test('precedence: a property beats #config and the text layer, and is read once', () => {
  const button = {
    type: 'INSTANCE', id: '2:1', name: 'Button', componentId: 'b',
    componentProperties: {
      style: { type: 'VARIANT', value: 'primary' },
      'actionId#1:1': { type: 'TEXT', value: 'save' },
      'label#1:2': { type: 'TEXT', value: 'Save' },
    },
    children: [text('Label', 'Save', 'label#1:2'), text('#config', 'actionId=old; route=orders')],
  }
  const file = screen([{ type: 'FRAME', name: 'slot:toolbar', children: [button] }], { b: { name: 'style=primary, size=m', componentSetId: 's' } })
  file.componentSets = { s: { name: 'Mateu/Actions/Button' } }
  const { files, warnings } = converter().convert(file)
  assert.deepEqual(warnings, [])
  const b = files[0].value.toolbar[0]
  assert.equal(b.actionId, 'save', '#config does not override the property')
  assert.equal(b.label, 'Save')
  assert.equal(b.actionable.route, 'orders', '#config still fills what no property says')
})

test('an untouched config property is unset: its own name (current library) or empty (older library)', () => {
  const field = (id, fieldId, required) => ({
    type: 'INSTANCE', id, name: 'TextField', componentId: 'tf',
    componentProperties: {
      'fieldId#1:1': { type: 'TEXT', value: fieldId },
      'required#1:2': { type: 'BOOLEAN', value: required },
      'label#1:3': { type: 'TEXT', value: 'Name' },
    },
    children: [
      text('Label', 'Name', 'label#1:3'),
      // the marker rows mirror the properties: never read as content, never warned about
      { type: 'FRAME', id: `${id}-p`, name: '#props', children: [text('#prop:fieldId', fieldId, 'fieldId#1:1')] },
      { type: 'FRAME', id: `${id}-f`, name: '#flags', children: [{ ...text('#flag:required', 'required'), visible: required, componentPropertyReferences: { visible: 'required#1:2' } }] },
    ],
  })
  const { files, warnings } = converter().convert(screen([field('2:1', 'fieldId', true), field('2:2', '', false), field('2:3', 'email', false)], { tf: { name: 'Mateu/Field/TextField' } }))
  assert.deepEqual(warnings, [])
  const [a, b, c] = files[0].value.content
  assert.ok(!('id' in a), 'a value equal to the prop name is unset')
  assert.equal(a.required, true)
  assert.ok(!('id' in b), 'an empty value is unset')
  assert.ok(!('required' in b))
  assert.equal(c.id, 'email')
  assert.deepEqual(files[0].value.content.map((f) => f.label), ['Name', 'Name', 'Name'])
})

test('a property the contract does not know is a warning', () => {
  const field = {
    type: 'INSTANCE', id: '2:1', name: 'TextField', componentId: 'tf',
    componentProperties: { 'fieldId#1:1': { type: 'TEXT', value: 'email' }, 'colour#1:2': { type: 'TEXT', value: 'red' } },
    children: [],
  }
  const { files, warnings } = converter().convert(screen([field], { tf: { name: 'Mateu/Field/TextField' } }))
  assert.ok(warnings.some((w) => w.includes('property "colour" is not a param')), warnings.join('\n'))
  assert.equal(files[0].value.content[0].id, 'email')
})

test('a layer type the converter does not know is reported, not dropped silently; shapes stay quiet', () => {
  const { warnings } = converter().convert(screen([
    text('Heading', 'Hello'),
    { type: 'RECTANGLE', id: '3:1', name: 'bg' },
    { type: 'WIDGET', id: '3:2', name: 'Poll' },
  ], {}))
  assert.equal(warnings.length, 1, warnings.join('\n'))
  assert.ok(warnings[0].includes('a WIDGET layer is not read'))
})

test('a SLOT outside an instance (a detached copy) reads as a layout', () => {
  const { files } = converter().convert(screen([{ type: 'SLOT', id: '4:1', name: 'stuff', layoutMode: 'VERTICAL', children: [text('A', 'Hi')] }], {}))
  assert.equal(files[0].value.content[0].type, 'VerticalLayout')
})
