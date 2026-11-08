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

test('a Badge draws its iconOnLeft / iconOnRight inside the chip', () => {
  const badges = atomsOf(node({ type: 'VerticalLayout' }, [
    node({ type: 'Badge', text: 'Paid', color: 'success', iconOnLeft: 'vaadin:check' }),
    node({ type: 'Badge', text: 'Details', iconOnRight: 'vaadin:arrow-right' }),
    node({ type: 'Badge', text: 'Pending' }),
  ])).filter((a) => a.isBadge)
  assert.match(badges[0].iconLeftClass, /oj-ux-ico-check/)
  assert.equal(badges[0].iconRightClass, '')
  assert.match(badges[1].iconRightClass, /oj-ux-ico-arrow-right/)
  assert.deepEqual([badges[2].iconLeftClass, badges[2].iconRightClass], ['', ''])
  // every badge chip in the markup binds both icons (the content atom, a row's badge, the listing's)
  for (const markup of [template(), page()]) {
    const chips = markup.match(/:class="\[\[ \$current\.data\.badgeClass \]\]"><oj-bind-if test="\[\[ \$current\.data\.iconLeftClass/g) || []
    assert.ok(chips.length >= 2, 'badge chips with icons')
  }
})

test('a ProgressBar\'s theme tints its fill (the class was stamped and nothing painted with it)', () => {
  const bars = atomsOf(node({ type: 'VerticalLayout' }, [
    node({ type: 'ProgressBar', value: 0.8, theme: 'success' }),
    node({ type: 'ProgressBar', value: 0.9, theme: 'error' }),
    node({ type: 'ProgressBar', value: 0.5 }),
  ])).filter((a) => a.isProgressBar)
  assert.match(bars[0].barClass, /mateu-tone-success/)
  assert.match(bars[1].barClass, /mateu-tone-danger/)
  assert.doesNotMatch(bars[2].barClass, /mateu-tone-/)
  const css = readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'resources', 'css', 'app.css'), 'utf8')
  assert.match(css, /oj-progress-bar\[class\*="mateu-tone-"\] \.oj-progress-bar-value \{ background-color: var\(--mateu-tone\)/)
  // every tone the projection stamps has its colour
  for (const tone of ['success', 'danger', 'warning', 'info']) assert.match(css, new RegExp('\\.mateu-tone-' + tone + ' \\{ --mateu-tone:'))
})

test('a StatusList draws its rows\' icon / avatar in every layout, and columns: N is at most N per line', () => {
  const list = (metadata) => atomsOf(node({ type: 'VerticalLayout' }, [node({ type: 'StatusList', ...metadata })])).find((a) => a.isStatusList)
  const plain = list({ items: [{ id: 'a', icon: '🔧', title: 'Room 305' }, { id: 'b', icon: 'vaadin:check', title: 'Done' }, { id: 'c', avatar: 'MR', title: 'Marta' }] })
  assert.deepEqual(plain.items.map((i) => [i.icon, i.iconClass, i.avatar]), [['🔧', '', ''], ['', 'oj-ux-ico-check', ''], ['', '', 'MR']])
  // every StatusList branch of the markup (plain row, grid cell, stacked item) draws the icon
  for (const markup of [template(), page()]) {
    const block = markup.split('<oj-bind-if test="[[ $current.data.isStatusList ]]">')[1].split('<oj-bind-if test="[[ $current.data.isOffer ]]">')[0]
    assert.equal((block.match(/<oj-bind-if test="\[\[ !\$current\.data\.avatar && !!\$current\.data\.icon \]\]">/g) || []).length, 3)
    assert.equal((block.match(/initials="\[\[ \$current\.data\.avatar \]\]"/g) || []).length, 3)
    assert.match(block, /:style="\[\[ \$current\.data\.wrapStyle \]\]"/)
  }
  assert.deepEqual(list({ columns: 2, items: [{ id: 'r1', title: '101' }] }).wrapStyle, { maxWidth: 'calc(2 * 22rem + 1 * 40px)' })
  assert.deepEqual(list({ items: [{ id: 'r1', title: '101' }] }).wrapStyle, {})
})

console.log(`\n${passed} explorer-findings tests OK`)
