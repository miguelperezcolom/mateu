// The pure half of "Mateu Sample Screens" (src/samples.ts): the screens are made only of library
// components, with properties, variants and slots the generator gives them. Figma is not needed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SAMPLE_SCREENS, checkSamples, componentsUsed, propertyValues } from '../src/samples.ts'

const here = dirname(fileURLToPath(import.meta.url))
const contract = JSON.parse(readFileSync(join(here, '../../contract.json'), 'utf8'))

test('the six sample screens, in order', () => {
  assert.deepEqual(SAMPLE_SCREENS.map((s) => s.name), ['contact', 'artwork', 'artworks', 'dashboard', 'onboarding', 'welcome'])
})

test('every instance, property, variant value and slot exists in the library', () => {
  assert.deepEqual(checkSamples(contract), [])
})

test('the check catches what the library does not have', () => {
  const bad = [{
    name: 'x', description: '', instances: [
      { component: 'Mateu/Nope' },
      { component: 'Mateu/Actions/Button', variants: { style: 'loud', shape: 'round' }, properties: { label: 'Go', colour: 'red', actionId: true } },
      { component: 'Mateu/Layout/Section', slots: { sidebar: [{ component: 'Mateu/Field/TextField', properties: { required: 'yes' } }] } },
    ],
  }]
  assert.deepEqual(checkSamples(contract, bad), [
    'x > Mateu/Nope: not a component of the library',
    'x > Mateu/Actions/Button: style=loud is not one of primary, secondary, tertiary',
    'x > Mateu/Actions/Button: no variant axis "shape"',
    'x > Mateu/Actions/Button: no property "colour" (it has actionId, route, label)',
    'x > Mateu/Actions/Button: "actionId" is a TEXT property',
    'x > Mateu/Layout/Section: no slot "sidebar" (it has content)',
    'x > Mateu/Layout/Section > sidebar > Mateu/Field/TextField: "required" is a BOOLEAN property',
  ])
})

test('the screens use page templates, fields, actions and a listing, and only Mateu/ components', () => {
  const used = componentsUsed()
  for (const c of used) assert.match(c, /^Mateu\//)
  for (const c of ['Mateu/Page Templates/ItemOverviewPage', 'Mateu/Page Templates/DashboardLandingPage',
    'Mateu/Page Templates/GuidedProcessPage', 'Mateu/Page Templates/WelcomePage', 'Mateu/Crud/Listing',
    'Mateu/Field/TextField', 'Mateu/Actions/Button', 'Mateu/Page/Header']) {
    assert.ok(used.includes(c), c)
  }
})

test('property values are keyed by the instance\'s own "name#id" keys', () => {
  const r = propertyValues(['label#1:2', 'actionId#1:3', 'style'], { component: 'Mateu/Actions/Button', properties: { label: 'Save', actionId: 'save', route: 'x' } })
  assert.deepEqual(r.values, { 'label#1:2': 'Save', 'actionId#1:3': 'save' })
  assert.deepEqual(r.missing, ['route'])
})
