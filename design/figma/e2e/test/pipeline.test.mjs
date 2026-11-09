// The Figma half of the end-to-end check, without a browser or a JVM: every fixture converts into
// the six pages with no converter warning, each page the kind the screen was designed as, and the
// synthetic fixture is the plugin's current sample-screens plan.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { loadContract } from '../../to-yaml/src/load.mjs'
import { syntheticFile } from '../src/synthetic.mjs'
import { SCREENS, SYNTHETIC, convertFixture, fixtures } from '../src/pipeline.mjs'
import { parseFileKey } from '../bin/refresh.mjs'

test('the synthetic fixture is the current sample-screens plan (npm run fixture rewrites it)', () => {
  const committed = JSON.parse(readFileSync(SYNTHETIC, 'utf8'))
  assert.deepEqual(committed, JSON.parse(JSON.stringify(syntheticFile(loadContract()))))
})

for (const fixture of fixtures()) {
  const name = basename(fixture)
  test(`${name}: six pages, no converter warning`, () => {
    const { files, warnings } = convertFixture(fixture)
    assert.deepEqual(warnings, [])
    assert.deepEqual(files.map((f) => f.path.replace(/\.yaml$/, '')).sort(), [...SCREENS].sort())
  })

  test(`${name}: each page is the kind it was designed as`, () => {
    const pages = Object.fromEntries(convertFixture(fixture).files.map((f) => [f.path.replace(/\.yaml$/, ''), f.value]))
    assert.equal(pages.contact.type, 'Form')
    assert.equal(pages.contact.template, undefined)
    const save = pages.contact.toolbar.find((b) => b.actionId === 'save')
    assert.equal(save?.buttonStyle, 'primary')
    const fields = JSON.stringify(pages.contact.content)
    for (const id of ['name', 'email', 'country', 'birthDate', 'balance', 'newsletter']) assert.match(fields, new RegExp(`"id":"${id}"`))
    const formFields = []
    JSON.parse(fields, (k, v) => { if (v?.type === 'FormField') formFields.push(v); return v })
    const byId = Object.fromEntries(formFields.map((f) => [f.id, f]))
    assert.equal(byId.email.required, true)
    assert.equal(byId.name.required, true)
    assert.equal(byId.balance.dataType, 'money')
    assert.equal(byId.birthDate.dataType, 'date')
    // the Select's `options` property, typed in Figma's properties panel as plain labels
    assert.equal(byId.country.stereotype, 'select')
    assert.deepEqual(byId.country.options, [
      { value: 'spain', label: 'Spain' }, { value: 'france', label: 'France' },
      { value: 'portugal', label: 'Portugal' }, { value: 'united-kingdom', label: 'United Kingdom' },
    ])
    assert.equal(pages.artwork.template.type, 'ItemOverviewPage')
    assert.equal(pages.artwork.content[0].type, 'TabLayout')
    const listing = pages.artworks.content[0]
    assert.equal(listing.type, 'Listing')
    assert.equal(listing.rowRoute, 'artworks/${row.id}')
    assert.deepEqual(listing.rowsSource, { ref: 'artworks' })
    assert.equal(pages.dashboard.template.type, 'DashboardLandingPage')
    assert.equal(pages.dashboard.template.kpi.length, 3)
    assert.equal(pages.onboarding.template.type, 'GuidedProcessPage')
    assert.deepEqual(pages.onboarding.template.steps.map((s) => s.id), ['account', 'preferences', 'confirm'])
    assert.equal(pages.welcome.template.type, 'WelcomePage')
    assert.equal(pages.welcome.toolbar.length, 3)
  })
}

test('the refresh takes a file key or any Figma file URL', () => {
  assert.equal(parseFileKey('AbC123xyz'), 'AbC123xyz')
  assert.equal(parseFileKey('https://www.figma.com/design/AbC123xyz/Mateu-screens?node-id=1-2'), 'AbC123xyz')
  assert.equal(parseFileKey('https://www.figma.com/file/AbC123xyz/x'), 'AbC123xyz')
  assert.throws(() => parseFileKey('https://example.com/'))
})
