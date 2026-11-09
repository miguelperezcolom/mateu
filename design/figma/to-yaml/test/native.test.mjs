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
import { FigmaToYaml, parseOptions } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/load.mjs'

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

test('slot content: a SLOT named after its frame, one renamed (read by its property), and a plain slot frame', () => {
  const page = converter().convert(fixture).files[0].value
  const titles = page.content.map((c) => c.title.text)
  assert.deepEqual(titles, ['Lines', 'Delivery', 'Notes'])
  assert.deepEqual(page.content[0].content.content.map((f) => f.id), ['product', 'quantity', 'unit'])
  assert.deepEqual(page.content[1].content.content.map((f) => f.id), ['address'])
  assert.ok(page.content[1].content.content[0].propertyRow)
  // the Notes section's content is a plain `slot:content` frame (the plugin's fallback)
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

test('a field says its stereotype and where its options come from', () => {
  const instance = (id, component, props) => ({
    type: 'INSTANCE', id, name: component, componentId: component,
    componentProperties: Object.fromEntries(Object.entries(props).map(([k, value]) => [`${k}#1:1`, { type: 'TEXT', value }])),
  })
  const file = screen(
    [
      instance('1:2', 'text', { fieldId: 'email', stereotype: 'email', 'label': 'Email' }),
      instance('1:3', 'number', { fieldId: 'amount', stereotype: 'money' }),
      instance('1:4', 'select', { fieldId: 'country', 'optionsSource.ref': 'countries' }),
      instance('1:5', 'plain', { fieldId: 'name', stereotype: 'stereotype' }),
      instance('1:6', 'number', { fieldId: 'bad', stereotype: 'nonsense' }),
    ],
    { text: { name: 'Mateu/Field/TextField' }, number: { name: 'Mateu/Field/Number' }, select: { name: 'Mateu/Field/Select' }, plain: { name: 'Mateu/Field/TextField' } },
  )
  const { files, warnings } = converter().convert(file)
  const [email, amount, country, plain, bad] = files[0].value.content
  assert.equal(email.stereotype, 'email')
  assert.equal(amount.stereotype, 'money')
  assert.deepEqual(country.optionsSource, { ref: 'countries' })
  assert.ok(!('stereotype' in plain), 'a property still showing its own name is unset')
  assert.ok(!('stereotype' in bad))
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /stereotype: "nonsense" is not one of/)
})

test("a Select's options property becomes its options (the native fixture: explicit values, `;` keeps a comma)", () => {
  const page = converter().convert(fixture).files[0].value
  const unit = page.content[0].content.content.find((f) => f.id === 'unit')
  assert.equal(unit.stereotype, 'select')
  assert.deepEqual(unit.options, [{ value: 'pcs', label: 'Pieces' }, { value: 'box', label: 'Boxes of 12, sealed' }])
  assert.ok(!('placeholder' in unit), 'the drawn "Value" is decoration')
})

test('the options syntax: labels (value slugified), value=Label pairs, mixed, and what is refused', () => {
  assert.deepEqual(parseOptions('Opción A, Opción B').options, [{ value: 'opcion-a', label: 'Opción A' }, { value: 'opcion-b', label: 'Opción B' }])
  assert.deepEqual(parseOptions('es=Spain, fr=France').options, [{ value: 'es', label: 'Spain' }, { value: 'fr', label: 'France' }])
  assert.deepEqual(parseOptions(' es = Spain ; Other country ;; ').options, [{ value: 'es', label: 'Spain' }, { value: 'other-country', label: 'Other country' }])
  const bad = parseOptions('a=, =B, ★, Spain, spain')
  assert.deepEqual(bad.options, [{ value: 'spain', label: 'Spain' }])
  assert.deepEqual(bad.problems, [
    '"a=" needs a value and a label (value=Label)',
    '"=B" needs a value and a label (value=Label)',
    '"★" makes no value: write it as value=Label',
    'the value "spain" is given twice ("spain" left out)',
  ])
  assert.deepEqual(parseOptions(' , ').problems, ['" , " lists no option'])
})

test('options on a RadioGroup and a multiSelect; untouched = unset; malformed = a warning, the rest kept', () => {
  const field = (id, componentId, fieldId, options) => ({
    type: 'INSTANCE', id, name: 'f', componentId,
    componentProperties: {
      ...(componentId === 'ms' ? { stereotype: { type: 'VARIANT', value: 'multiSelect' } } : {}),
      'fieldId#1:1': { type: 'TEXT', value: fieldId },
      'options#1:2': { type: 'TEXT', value: options },
    },
    children: [],
  })
  const file = screen([
    field('2:1', 'rg', 'size', 'Small, Medium, Large'),
    field('2:2', 'ms', 'tags', 'new=New; sale=On sale'),
    field('2:3', 'rg', 'untouched', 'options'),
    field('2:4', 'rg', 'broken', 'a=, b=Bee'),
  ], { rg: { name: 'Mateu/Field/RadioGroup' }, ms: { name: 'stereotype=multiSelect', componentSetId: 'ms-set' } })
  file.componentSets = { 'ms-set': { name: 'Mateu/Field/Select' } }
  const { files, warnings } = converter().convert(file)
  const [size, tags, untouched, broken] = files[0].value.content
  assert.equal(size.stereotype, 'radio')
  assert.deepEqual(size.options.map((o) => o.value), ['small', 'medium', 'large'])
  assert.equal(tags.stereotype, 'multiSelect')
  assert.deepEqual(tags.options, [{ value: 'new', label: 'New' }, { value: 'sale', label: 'On sale' }])
  assert.ok(!('options' in untouched), "the property's own name is its default: unset")
  assert.deepEqual(broken.options, [{ value: 'b', label: 'Bee' }])
  assert.deepEqual(warnings, ['f (2:4): options: "a=" needs a value and a label (value=Label)'])
})
