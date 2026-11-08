// The `Mateu · Self-test` page the plugin's "Mateu Library Self-test" command draws in the LIBRARY
// file: every instance on it must convert, on its own, to a component with no warning.
//
// The synthetic page below pins the reader. When the real page is downloaded from the library file
// (`curl … /v1/files/<library key> > test/fixtures/self-test.figma.json`), the second test runs it
// too and pins its results against test/golden-self-test/results.json
// (`npm run self-test -- test/fixtures/self-test.figma.json --report test/golden-self-test/results.json`).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml, SELF_TEST_PAGE } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/load.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const converter = () => new FigmaToYaml({ contract: loadContract(), schema: loadSchema() })

const text = (name, characters, ref) => ({ type: 'TEXT', name, characters, ...(ref ? { componentPropertyReferences: { characters: ref } } : {}) })
const cell = (label, instance) => ({ type: 'FRAME', name: `cell ${label}`, children: [text('#label', label), instance] })
const button = (id, label) => ({
  type: 'INSTANCE', id, name: 'Button', componentId: 'btn',
  componentProperties: { style: { type: 'VARIANT', value: 'primary' }, size: { type: 'VARIANT', value: 'm' }, 'label#1:1': { type: 'TEXT', value: label }, 'actionId#1:2': { type: 'TEXT', value: '' } },
  children: [text('Label', label, 'label#1:1')],
})
const field = (id) => ({ type: 'INSTANCE', id, name: 'TextField', componentId: 'tf', componentProperties: { 'label#2:1': { type: 'TEXT', value: 'selftest-label' } }, children: [text('Label', 'selftest-label', 'label#2:1')] })

const file = {
  components: {
    btn: { name: 'style=primary, size=m', componentSetId: 'btn-set' },
    tf: { name: 'Mateu/Field/TextField' },
    sec: { name: 'propertyList=false, frameless=false, sticky=false', componentSetId: 'sec-set' },
    dash: { name: 'pageWidth=fixed', componentSetId: 'dash-set' },
    other: { name: 'Some/Other' },
  },
  componentSets: {
    'btn-set': { name: 'Mateu/Actions/Button' },
    'sec-set': { name: 'Mateu/Layout/Section' },
    'dash-set': { name: 'Mateu/Page Templates/Dashboard' },
  },
  document: { children: [
    { type: 'CANVAS', name: 'Mateu · Actions', children: [] },
    { type: 'CANVAS', name: SELF_TEST_PAGE, children: [
      { type: 'FRAME', name: '_Self-test results', children: [text('#title', 'Mateu library self-test')] },
      { type: 'FRAME', name: 'Self-test instances', children: [
        cell('Mateu/Actions/Button  ·  style=primary, size=m', button('3:1', 'selftest-label')),
        cell('Mateu/Field/TextField', field('3:2')),
        cell('Mateu/Layout/Section  ·  propertyList=false', {
          type: 'INSTANCE', id: '3:3', name: 'Section', componentId: 'sec',
          componentProperties: { propertyList: { type: 'VARIANT', value: 'false' }, 'title#4:1': { type: 'TEXT', value: 'selftest-title' } },
          children: [text('Title', 'selftest-title', 'title#4:1'), { type: 'SLOT', name: 'slot:content', children: [field('3:4')] }],
        }),
        cell('Mateu/Page Templates/Dashboard  ·  pageWidth=fixed', { type: 'INSTANCE', id: '3:5', name: 'Dashboard', componentId: 'dash', children: [] }),
      ] },
    ] },
  ] },
}

test('every instance of the self-test page is converted on its own; Java archetypes are listed, not failed', () => {
  const { page, results } = converter().selfTest(file)
  assert.equal(page, SELF_TEST_PAGE)
  assert.deepEqual(results.map((r) => [r.name, r.status]), [
    ['Mateu/Actions/Button', 'ok'],
    ['Mateu/Field/TextField', 'ok'],
    ['Mateu/Layout/Section', 'ok'],
    ['Mateu/Page Templates/Dashboard', 'noYaml'],
  ])
  assert.equal(results[0].value.label, 'selftest-label')
  assert.equal(results[0].cell, 'Mateu/Actions/Button  ·  style=primary, size=m')
  assert.equal(results[2].value.content.content[0].label, 'selftest-label', 'the TextField dropped into the slot')
})

test('a broken instance fails with its warnings', () => {
  const broken = structuredClone(file)
  const grid = broken.document.children[1].children[1]
  grid.children[0].children[1].componentProperties['colour#9:9'] = { type: 'TEXT', value: 'red' }
  grid.children.push(cell('not Mateu', { type: 'INSTANCE', id: '5:1', name: 'X', componentId: 'other', children: [] }))
  const { results } = converter().selfTest(broken)
  const failed = results.filter((r) => r.status === 'failed')
  assert.equal(failed.length, 2)
  assert.match(failed[0].warnings[0], /property "colour" is not a param/)
  assert.match(failed[1].warnings[0], /not a Mateu component/)
})

test('a file without the page says so (the ordinary conversion still skips it)', () => {
  assert.equal(converter().selfTest({ document: { children: [] } }).page, null)
  assert.deepEqual(converter().convert(file).files, [])
})

const real = join(here, 'fixtures/self-test.figma.json')
const RETIRED = ['Mateu/Layout/ContentLayout']

test('the REAL self-test page downloaded from the library file (when committed)', { skip: !existsSync(real) && 'no fixtures/self-test.figma.json yet' }, () => {
  // the fixture was downloaded from a kit that still had components Mateu has since removed
  const current = (r) => !RETIRED.includes(r.name)
  const results = converter().selfTest(JSON.parse(readFileSync(real, 'utf8'))).results.filter(current)
  const failed = results.filter((r) => r.status === 'failed')
  assert.deepEqual(failed.map((r) => `${r.name} [${r.cell}]: ${r.warnings.join('; ')}`), [])
  const golden = join(here, 'golden-self-test/results.json')
  if (existsSync(golden)) {
    const expected = JSON.parse(readFileSync(golden, 'utf8')).filter(current)
    assert.deepEqual(results.map(({ name, cell, status, value, warnings }) => ({ name, cell, status, warnings, value })), expected)
  }
})
