// Contract tests for YAML page templates on Redwood, with real wire captured from the demos that
// exposed each defect (poc/fixtures/demos/*.json: demo-space and demo-museum, Mateu 3.0-beta.25):
//   - a Listing nested in a templated page is CONTENT of its slot, not the page's listing (it was
//     hoisted: a general overview drawn twice, a multimedia gallery on top with its search bar and the
//     page's photo / rich text lost to the generic form, a welcome's and a collection detail's not drawn)
//   - a section's first heading is content unless it IS the section title (a `Text` h2 was dropped)
//   - a `dateRange` form field is drawn (it was not), its two ends folding back into {from, to}
//   - an Image honours its style and cssClasses
//   - the tab bar's module is one JET has (ojs/ojtabbar answered 404 on every page)
// Usage: node test-templates.mjs   (npm test runs it)

import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { reduceContexts, HOST_ID, listingOf, onLoadTriggers, islandContentOf, hostContentOf, layoutFieldOf,
  templatedGeneralOverviewOf, templatedCollectionDetailOf, rangeEditOf, sectionBodyOf } from './reduceContexts.mjs'
import { archetypeVarsOf, hostContentPlanOf } from './pageProjection.mjs'
import { restAnswerOf, setRestSourceCatalogue } from './restSources.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = (name) => JSON.parse(readFileSync(join(here, 'fixtures', 'demos', name + '.json'), 'utf8'))
const webApp = (rel) => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', rel), 'utf8')
let pass = 0
const tests = []
const test = (name, fn) => tests.push([name, fn])

/** The host context of a captured load, with the record the page's `__restdata__` brings. */
const hostOf = (name, record = {}) => {
  const reg = reduceContexts({ contexts: {}, stack: [], shell: null }, fixture(name))
  const host = reg.contexts[HOST_ID]
  return { reg, host: { ...host, state: { ...host.state, ...record } } }
}

/** Runs the host's nested-listing OnLoads against a stub REST API; the rows land in host.data. */
async function withNestedRows(name, record, json) {
  let { reg, host } = hostOf(name, record)
  reg = { ...reg, contexts: { ...reg.contexts, [HOST_ID]: host } }
  const urls = []
  const fetchImpl = async (url) => { urls.push(url); return { ok: true, status: 200, json: async () => json } }
  for (const id of onLoadTriggers(host).filter((t) => t.startsWith('__nestedlisting__:'))) {
    reg = reduceContexts(reg, await restAnswerOf(reg.contexts[HOST_ID], id, {}, { fetchImpl }))
  }
  return { host: reg.contexts[HOST_ID], urls }
}

const atomsOf = (blocks) => (blocks || []).flatMap((b) => (b.items || []).concat(b.sectionItems || []))
const nestedIn = (blocks) => atomsOf(blocks).filter((a) => a && a.isNestedListing)

test('GeneralOverviewPage: its nested listing stays in its main-slot section — no page listing, the page drawn once', async () => {
  const { host } = hostOf('space-launch-site', { id: 4, name: 'LC-39A' })
  // not the page's listing: the listing branch (search bar, table on top) stands aside
  assert.equal(listingOf(host), null)
  assert.ok(!onLoadTriggers(host).includes('search'))
  const launches = [{ missionName: 'Apollo 11', missionId: 6, launchDate: '1969-07-16', vehicle: 'Saturn V', outcome: 'SUCCESS' }]
  const { host: loaded, urls } = await withNestedRows('space-launch-site', { id: 4 }, { content: launches })
  // its rows from its own source, the record's id interpolated
  assert.deepEqual(urls, ['http://localhost:8122/api/launches?siteId=4&size=10&page=0'])
  const gop = templatedGeneralOverviewOf(loaded)
  const [listing] = nestedIn(gop.main.blocks)
  assert.ok(listing, 'the listing is in the main slot')
  assert.equal(listing.asTable, true)
  assert.deepEqual(listing.rows.map((r) => r.missionName), ['Apollo 11'])
  // the title column links to the row's route
  assert.ok(listing.rows[0].__href.endsWith('/missions/6'))
  assert.equal(listing.columns.find((c) => c.id === 'missionName').template, 'cellNestedLink')
  // the section header right above it, in the same block
  const block = gop.main.blocks.find((b) => (b.items || []).some((a) => a.isNestedListing))
  assert.equal(block.items[0].isSpSectionHeader, true)
})

test('MultimediaContentPage: the gallery stays in its section, and the photo and the rich text are drawn (no generic form)', async () => {
  const record = { id: 6, name: 'Apollo 11', image: 'https://img/as11.jpg', imageTitle: 'Aldrin', imageCredit: 'NASA',
    objectives: '<ul><li>Land on the Moon</li></ul>' }
  const { host } = await withNestedRows('space-mission', record,
    { id: 6, gallery: [{ image: 'https://img/g1.jpg', imageTitle: 'Footpad', imageCredit: 'NASA (JSC)' }] })
  assert.equal(listingOf(host), null)
  const archetypes = archetypeVarsOf(host)
  assert.ok(archetypes.vars.mateuMmc)
  // the template's sections are the HOST content (with a page listing, there was none: the generic
  // form drew the fields — the rich text as raw markup in a text area, the Image not at all)
  const plan = hostContentPlanOf(host, { title: '', listing: listingOf(host), welcome: archetypes.welcome,
    overview: archetypes.overview, item: archetypes.item })
  const section = (title) => plan.hostBlocks.find((b) => b.sectionTitle === title)
  assert.ok(section('Photograph').sectionItems.some((a) => a.isImage && a.src === 'https://img/as11.jpg'))
  const rich = section('Objectives').sectionItems.flatMap((a) => (a.isFormLayout ? a.fields : [a])).find((a) => a.isRichText)
  assert.ok(rich && rich.html.includes('<li>'), 'the read-only html field is drawn as rich text')
  const [gallery] = section('Gallery').sectionItems.filter((a) => a.isNestedListing)
  assert.equal(gallery.asCards, true)
  assert.deepEqual(gallery.cards.map((c) => [c.image, c.title]), [['https://img/g1.jpg', 'Footpad']])
})

test('WelcomePage: the featured-missions listing is drawn, as a full-width tile before the area tiles', async () => {
  // its source is the app catalogue's (by ref)
  setRestSourceCatalogue([{ name: 'space-featured-missions', source: { url: 'http://api/missions?featured=true', itemsPath: 'content' } }])
  const { host } = await withNestedRows('space-welcome', {},
    { content: [{ id: 6, image: 'https://img/a11.jpg', name: 'Apollo 11', program: 'Apollo', launchDate: '1969-07-16' }] })
  assert.equal(listingOf(host), null)
  const welcome = archetypeVarsOf(host).welcome
  const first = welcome.tiles[0]
  assert.equal(first.title, 'Featured missions')
  assert.equal(first.colClass, 'oj-flex-item oj-sm-12')
  const [listing] = first.items
  assert.equal(listing.isNestedListing, true)
  assert.deepEqual(listing.cards.map((c) => [c.title, c.route]), [['Apollo 11', 'missions/6']])
  assert.equal(welcome.tiles.length, 7)
})

test('CollectionDetailPage: the list slot keeps the page listing; the detail draws its own nested listing', async () => {
  const { host } = await withNestedRows('museum-artist', { id: 1, name: 'Hans Baldung' },
    { content: [{ id: 1, imageSmall: 'https://img/w.jpg', title: 'Saint John on Patmos', objectDate: 'ca. 1511', museumName: 'The Met' }] })
  // the collection's listing is still the page's (painted by the listing body in the collection slot)
  assert.deepEqual(listingOf(host).columns.map((c) => c.id), ['name'])
  const cd = templatedCollectionDetailOf(host)
  assert.equal(nestedIn(cd.collection).length, 0)
  const [works] = nestedIn(cd.detail)
  assert.equal(works.title, 'Works')
  assert.deepEqual(works.cards.map((c) => [c.title, c.route, c.lines.map((l) => l.value)]),
    [['Saint John on Patmos', 'artworks/1', ['ca. 1511', 'The Met']]])
  // and the detail's leading h2 (not a section) is drawn
  assert.equal(atomsOf(cd.detail)[0].text, 'Hans Baldung')
})

test('the nested-listing atom and its date-range / image bindings are in every atoms copy of the page', () => {
  const html = webApp('flows/main/pages/main-start-page.html')
  const copies = (html.match(/<!-- @atoms (host|island) /g) || []).length
  assert.equal((html.match(/\$current\.data\.isNestedListing \]\]/g) || []).length, copies)
  assert.ok((html.match(/\$current\.data\.isDateRange \]\]/g) || []).length >= copies)
  assert.ok(html.includes(`<img class="mateu-atom-image" :class="[[ $current.data.cls || '' ]]" :style="[[ $current.data.style || {} ]]"`))
})

test('a section whose first piece is a heading of its own (a Text h2) keeps it: only the section title is dropped', () => {
  const card = { type: 'ClientSide', id: 'c', cssClasses: 'mateu-section', children: [],
    metadata: { type: 'Card', title: { type: 'ClientSide', metadata: { type: 'Text', container: 'h3', text: 'About' } },
      content: { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [
        { type: 'ClientSide', metadata: { type: 'Text', container: 'h2', text: '${state.name}' }, children: [] },
        { type: 'ClientSide', metadata: { type: 'Text', text: 'Bio' }, children: [] },
      ] } } }
  const tree = { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [card] }
  const [block] = islandContentOf({ id: HOST_ID, kind: 'host', state: { name: 'Dürer' }, data: {}, tree })
  assert.equal(block.sectionTitle, 'About')
  assert.deepEqual(block.sectionItems.map((a) => a.text), ['Dürer', 'Bio'])
  // the section title itself, when it does lead the body, is still not repeated
  assert.deepEqual(sectionBodyOf([{ isHeading: true, text: 'About' }, { isText: true, text: 'x' }], 'About'), [{ isText: true, text: 'x' }])
  assert.deepEqual(sectionBodyOf([{ isHeading: true, text: 'Other' }, { isText: true, text: 'x' }], 'About').length, 2)
})

test('a dateRange form field is drawn as its two ends, and an edit of one end keeps the other', () => {
  const { host } = hostOf('space-mission-edit', { launchWindow: { from: '1969-07-16', to: '1969-07-18' } })
  const fields = atomsOf(hostContentOf(host)).flatMap((a) => (a.isFormLayout ? a.fields : [a]))
  const range = fields.find((f) => f.fieldId === 'launchWindow')
  assert.ok(range, 'the field is drawn')
  assert.equal(range.isDateRange, true)
  assert.equal(range.isText, false)
  assert.deepEqual(range.rangeParts.map((p) => [p.fieldId, p.value]),
    [['launchWindow#from', '1969-07-16'], ['launchWindow#to', '1969-07-18']])
  assert.deepEqual(rangeEditOf('launchWindow#to', {}, host.state, '1969-07-24'),
    { fieldId: 'launchWindow', value: { from: '1969-07-16', to: '1969-07-24' } })
  assert.deepEqual(rangeEditOf('launchWindow#from', { launchWindow: { from: null, to: '1969-07-24' } }, host.state, '1969-07-20'),
    { fieldId: 'launchWindow', value: { from: '1969-07-20', to: '1969-07-24' } })
  assert.equal(rangeEditOf('name', {}, {}, 'x'), null)
  // an empty range is drawn too (its ends blank)
  const empty = layoutFieldOf({ fieldId: 'w', dataType: 'dateRange', stereotype: 'dateRange', label: 'Window' }, {}, {})
  assert.deepEqual(empty.rangeParts.map((p) => p.value), [null, null])
  // the chains fold an end's edit back into the field
  for (const chain of ['hostInputChanged', 'mateuFieldEdited', 'islandFieldEdited']) {
    assert.match(webApp(`flows/main/pages/main-start-page-chains/${chain}.js`), /bridge\.rangeEditOf\(/, chain)
  }
})

test('an Image keeps its style and cssClasses', () => {
  const tree = { type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children: [
    { type: 'ClientSide', id: 'i', style: 'max-width: 220px; border-radius: 8px;', cssClasses: 'portrait',
      metadata: { type: 'Image', src: '${state.image}', alt: 'x' }, children: [] }] }
  const image = atomsOf(islandContentOf({ id: HOST_ID, kind: 'host', state: { image: 'https://img/p.jpg' }, data: {}, tree }))
    .find((a) => a.isImage)
  assert.deepEqual(image.style, { maxWidth: '220px', borderRadius: '8px' })
  assert.equal(image.cls, 'portrait')
})

test('the tab bar loads from a module JET ships (ojs/ojtabbar answered 404 from the CDN on every page)', () => {
  const json = JSON.parse(webApp('flows/main/pages/main-start-page.json'))
  assert.equal(json.imports.components['oj-tab-bar'].path, 'ojs/ojnavigationlist')
  assert.ok(!JSON.stringify(json).includes('ojs/ojtabbar'))
})

for (const [name, fn] of tests) { await fn(); console.log(`  ✓ ${name}`); pass++ }
console.log(`${pass} template tests OK`)
