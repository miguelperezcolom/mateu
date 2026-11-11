// Layout, containers, buttons and form looks the Mateu Explorer found wrong on Redwood (the W3a
// review stream): rows that stacked, boxes without their style, grids hoisted out of their card,
// buttons without colour / size / icons, headings without levels, forms without their declared
// look. Each test pins the projection (and, where the markup decides, the generated page).
// Run: node test-explorer-layout.mjs (npm test runs it with the other suites).
import './test-locale.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  islandContentOf, hostContentOf, flatAtoms, buttonLookOf, ojIconOf, ojIconOrGenericOf, styledColumnPercentsOf,
  layoutFieldOf, CELL_ATOM_FLAGS, HEADING_CLASSES, badgeChipClassOf, noticeIconOf, withFormActions, withSubresources,
} from './reduceContexts.mjs'
import { pageLayoutOf } from './pageProjection.mjs'
import { withCellAtoms } from './make-html.mjs'

const here = dirname(fileURLToPath(import.meta.url))
let passed = 0
const test = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name) }
const node = (metadata, children = [], style, id = '') => ({ type: 'ClientSide', id, metadata, children, ...(style ? { style } : {}) })
const island = (tree, state = {}) => islandContentOf({ tree, state, data: {}, kind: 'island' }) || []
const itemsOf = (tree) => island(tree).flatMap((b) => b.items)
const page = () => readFileSync(join(here, '..', 'webApps', 'vbredwoodapp', 'flows', 'main', 'pages', 'main-start-page.html'), 'utf8')
const card = (...kids) => node({ type: 'Card', title: 'Example' }, kids)

test('a HorizontalLayout of non-inline pieces is ONE row box (it stacked), flexGrows give each its share', () => {
  const row = node({ type: 'HorizontalLayout', spacing: true, flexGrows: [2, 1], verticalAlignment: 'CENTER' }, [
    node({ type: 'Container' }, [node({ type: 'Text', text: 'Main' })], 'background: #f3f3f3; padding: 1rem; flex-grow: 2;'),
    node({ type: 'Container' }, [node({ type: 'Text', text: 'Side' })], 'background: #e8f0fe; padding: 1rem;'),
  ])
  const [box] = itemsOf(card(row)).filter((a) => a.isCells)
  assert.ok(box, 'a layout box')
  assert.equal(box.style.alignItems, 'center')
  assert.equal(box.style.gap, '0.75rem')
  assert.deepEqual(box.cells.map((c) => c.items[0].text), ['Main', 'Side'])
  // the Container lends its style to its cell; flexGrows → flex-grow
  assert.equal(box.cells[0].style.background, '#f3f3f3')
  assert.equal(box.cells[0].style.flexGrow, '2')
  assert.equal(box.cells[1].style.flexGrow, '1')
})

test('a styled Container / a Scroller / an END-aligned VerticalLayout are boxes of one cell; a Div\'s plain string is drawn', () => {
  const items = itemsOf(card(
    node({ type: 'Scroller' }, [node({ type: 'BulletedList', items: ['101', '102'] })], 'height: 9rem; border: 1px solid #ddd;'),
    node({ type: 'VerticalLayout', horizontalAlignment: 'END', padding: true }, [node({ type: 'Text', text: 'Total' })]),
    node({ type: 'Div', content: 'A Div holding plain text' }, [], 'border-left: 4px solid #1676f3;'),
  ))
  const [scroller, totals, div] = items.filter((a) => a.isCells)
  assert.equal(scroller.cells[0].style.height, '9rem')
  assert.equal(scroller.cells[0].style.overflow, 'auto')
  assert.equal(totals.cells[0].style.alignItems, 'flex-end')
  assert.equal(div.cells[0].items[0].text, 'A Div holding plain text')
  // a Div with no style still draws its text
  assert.ok(itemsOf(card(node({ type: 'Div', content: 'loose' }))).some((a) => a.text === 'loose'))
})

test('rows of buttons keep a bar EACH, start-aligned like the web (three rows were merged into one, right-aligned)', () => {
  const rowOf = (...labels) => node({ type: 'HorizontalLayout' }, labels.map((l) => node({ type: 'Button', label: l, actionId: l })))
  const bars = itemsOf(card(rowOf('a', 'b'), rowOf('c'), node({ type: 'HorizontalLayout', justification: 'END' }, [node({ type: 'Button', label: 'd', actionId: 'd' })])))
    .filter((a) => a.isButtons)
  assert.deepEqual(bars.map((b) => b.buttons.map((x) => x.label).join()), ['a,b', 'c', 'd'])
  assert.deepEqual(bars.map((b) => b.barClass), ['oj-sm-justify-content-flex-start', 'oj-sm-justify-content-flex-start', 'oj-sm-justify-content-flex-end'])
})

test('a Button\'s colour, size and icons reach oj-button', () => {
  assert.deepEqual(buttonLookOf({ buttonStyle: 'primary', color: 'success' }), { chroming: 'callToAction', buttonClass: 'mateu-btn-success' })
  assert.equal(buttonLookOf({ buttonStyle: 'primary', color: 'error' }).chroming, 'danger')
  assert.deepEqual(buttonLookOf({ color: 'warning', size: 'small' }), { chroming: 'outlined', buttonClass: 'mateu-btn-warning oj-button-sm' })
  assert.equal(buttonLookOf({ buttonStyle: 'tertiary', size: 'large' }).buttonClass, 'oj-button-lg')
  const look = buttonLookOf({ iconOnLeft: 'vaadin:star', iconOnRight: 'vaadin:arrow-right' })
  assert.deepEqual([look.iconLeftClass, look.iconRightClass], ['oj-ux-ico-star', 'oj-ux-ico-arrow-right'])
  const html = page()
  assert.match(html, /<span slot="startIcon" :class="\[\[ \$current\.data\.iconLeftClass \]\]">/)
  assert.match(html, /:class="\[\[ \$current\.data\.buttonClass \]\]"/)
})

test('Vaadin icon names map onto the Redwood gallery font (they fell back to an arrow-circle)', () => {
  for (const [vaadin, oj] of [['vaadin:phone', 'oj-ux-ico-phone'], ['vaadin:car', 'oj-ux-ico-car'], ['vaadin:coffee', 'oj-ux-ico-coffee'],
    ['vaadin:plus', 'oj-ux-ico-plus'], ['vaadin:suitcase', 'oj-ux-ico-briefcase'], ['vaadin:airplane', 'oj-ux-ico-airport'], ['vaadin:user', 'oj-ux-ico-contact']]) {
    assert.equal(ojIconOf(vaadin), oj, vaadin)
  }
  assert.equal(ojIconOrGenericOf('vaadin:no-such-icon'), 'oj-ux-ico-arrow-circle-right')
})

test('a Card in a row is a CARD CELL with its slots: media, title, subtitle, header suffix, body, footer, variants, width', () => {
  const t = (text) => node({ type: 'Text', text })
  const c = node({ type: 'Card', variants: ['outlined'], media: node({ type: 'Image', src: '/bay.svg' }), title: t('Deluxe sea view'),
    subtitle: t('32 m²'), headerSuffix: node({ type: 'Badge', text: '€ 380', color: 'success' }), content: t('Our most booked room'),
    footer: node({ type: 'Button', label: 'See availability', actionId: 'see' }) }, [], 'width: 18rem;')
  const [box] = itemsOf(card(node({ type: 'HorizontalLayout' }, [c, c]))).filter((a) => a.isCells)
  const cell = box.cells[0]
  assert.match(cell.cellClass, /mateu-card-outlined/)
  assert.equal(cell.style.width, '18rem')
  const kinds = cell.items.map((a) => (a.isImage ? 'image' : a.isBadge ? 'badge' : a.isButtons ? 'buttons' : a.text))
  assert.deepEqual(kinds, ['image', 'Deluxe sea view', 'badge', '32 m²', 'Our most booked room', 'buttons'])
})

test('a horizontal Card outside a row puts its media beside the rest', () => {
  const blocks = island(node({ type: 'VerticalLayout' }, [node({ type: 'Card', variants: ['horizontal'], media: node({ type: 'Image', src: '/g.svg' }), title: node({ type: 'Text', text: 'H' }), content: node({ type: 'Text', text: 'body' }) })]))
  const box = blocks.flatMap((b) => b.items).find((a) => a.isCells)
  assert.ok(box.cells[0].items[0].isImage)
  assert.deepEqual(box.cells[1].items.map((a) => a.text), ['H', 'body'])
})

test('a DashboardLayout is a CSS grid box with its columns, colSpan and rowSpan — in place, inside its card', () => {
  const panel = (title, extra) => node({ type: 'DashboardPanel', title, ...extra }, [node({ type: 'Text', text: title + ' body' })])
  const blocks = island(card(node({ type: 'DashboardLayout', columns: 3 }, [panel('Revenue', { colSpan: 2 }), panel('Housekeeping', { rowSpan: 2 }), panel('Rating')])))
  assert.equal(blocks.length, 1, 'not hoisted out of the card')
  const grid = blocks[0].items.find((a) => a.isCells)
  assert.equal(grid.style.gridTemplateColumns, 'repeat(3, minmax(0, 1fr))')
  assert.deepEqual(grid.cells.map((c) => [c.style.gridColumn || '', c.style.gridRow || '']), [['span 2', ''], ['', 'span 2'], ['', '']])
  assert.match(grid.cells[0].cellClass, /oj-panel/)
})

test('a ResponsiveGrid in a card keeps its tracks and named areas; a BoardLayout\'s rows share by boardCols; a SplitLayout is two panes', () => {
  const slotted = (slot, text) => ({ ...node({ type: 'Text', text }), slot })
  const items = itemsOf(card(
    node({ type: 'ResponsiveGrid', gridTemplateColumns: '1fr 16rem', gridTemplateAreas: '"main aside"' }, [slotted('aside', 'Aside'), slotted('main', 'Main')]),
    node({ type: 'BoardLayout' }, [node({ type: 'BoardLayoutRow' }, [
      node({ type: 'BoardLayoutItem', boardCols: 2 }, [node({ type: 'Notice', text: 'a' })]), node({ type: 'BoardLayoutItem' }, [node({ type: 'Notice', text: 'b' })])])]),
    node({ type: 'SplitLayout' }, [node({ type: 'Text', text: 'master' }), node({ type: 'Text', text: 'detail' })], 'height: 12rem;'),
  ))
  const [grid, board, split] = items.filter((a) => a.isCells)
  assert.equal(grid.style.gridTemplateAreas, '"main aside"')
  assert.deepEqual(grid.cells.map((c) => c.style.gridArea), ['aside', 'main'])
  assert.deepEqual(board.cells.map((c) => c.style.flex), ['2 1 0', '1 1 0'])
  assert.match(split.boxClass, /mateu-split/)
  assert.equal(split.style.height, '12rem')
  assert.deepEqual(split.cells.map((c) => c.items[0].text), ['master', 'detail'])
})

test('a ContextMenu wraps its component in one box (it was a loose kebab, the Card moved out); left click when asked', () => {
  const items = itemsOf(card(node({ type: 'ContextMenu', activateOnLeftClick: true, wrapped: node({ type: 'Card', title: node({ type: 'Text', text: 'The Starry Night' }) }),
    menu: [{ label: 'Open', route: '/x' }, { separator: true }, { label: 'Map', route: '/m' }] })))
  const box = items.find((a) => a.isCells)
  assert.equal(box.cells[0].items[0].text, 'The Starry Night')
  const menu = box.cells[1].items[0]
  assert.deepEqual([menu.isContextMenu, menu.rightClick, menu.leftClick], [true, true, true])
  assert.ok(menu.menuItems.some((i) => i.isSeparator), 'the MenuSeparator is a divider')
  assert.match(page(), /data-mateu-context-left/)
})

test('headings take their level\'s size (h2 / h3 looked like h4); a declared size wins', () => {
  const items = itemsOf(card(node({ type: 'Text', text: 'H2', container: 'h2' }), node({ type: 'Text', text: 'H4', container: 'h4' }), node({ type: 'Text', text: 'XL', container: 'h3', size: 'xl' })))
  const by = (t) => items.find((a) => a.text === t)
  assert.match(by('H2').cls, new RegExp(HEADING_CLASSES.h2))
  assert.match(by('H4').cls, /oj-typography-subheading-xs/)
  assert.match(by('XL').cls, /oj-typography-heading-md/)
})

test('a HeroSection carries its tone and its CTAs inside the band; an EntityHeader its metric', () => {
  const items = itemsOf(card(
    node({ type: 'HeroSection', title: 'Stay three nights', tone: 'ocean', centered: true }, [node({ type: 'Button', label: 'See the offer', actionId: 'see', buttonStyle: 'primary' })]),
    node({ type: 'EntityHeader', title: 'Lucía', metricLabel: 'Balance', metricValue: '€ 1,034.00', metricCaption: 'Due at check-out' }),
  ))
  const hero = items.find((a) => a.isHero)
  assert.match(hero.heroClass, /mateu-hero-tone-ocean/)
  assert.match(hero.heroClass, /mateu-hero-centered/)
  assert.deepEqual(hero.buttons.map((b) => b.label), ['See the offer'])
  assert.ok(!items.some((a) => a.isButtons), 'the CTA is not repeated below the band')
  const eh = items.find((a) => a.isEntityHeader)
  assert.deepEqual([eh.metricLabel, eh.metricValue, eh.metricCaption], ['Balance', '€ 1,034.00', 'Due at check-out'])
  assert.match(page(), /mateu-entity-header-metric/)
})

test('chips: Badge primary / small / pill; a Notice\'s severity icon; a Tab\'s badge; the AvatarGroup overlaps', () => {
  assert.equal(badgeChipClassOf({ color: 'success', primary: true }), 'oj-badge oj-badge-success')
  assert.match(badgeChipClassOf({ small: true, pill: true }), /mateu-badge-small mateu-badge-pill/)
  assert.equal(noticeIconOf({ theme: 'warning' }).noticeIconClass, 'oj-ux-ico-warning')
  assert.equal(noticeIconOf({ icon: '👥' }).noticeGlyph, '👥')
  const items = itemsOf(card(
    node({ type: 'TabLayout', variant: 'bordered' }, [node({ type: 'Tab', label: 'Amenities', badge: '6' }, [node({ type: 'Text', text: 'a' })]), node({ type: 'Tab', label: 'B' }, [])]),
    node({ type: 'AvatarGroup', avatars: [{ name: 'A B' }, { name: 'C D' }] }),
  ))
  const tabs = items.find((a) => a.isTabs)
  assert.deepEqual([tabs.tabs[0].label, tabs.tabs[0].badge, tabs.variantClass], ['Amenities', '6', 'mateu-tabs-bordered'])
  assert.ok(items.find((a) => a.isAvatar).group)
})

test('two id-less accordions on two surfaces do not share their open panels', () => {
  const acc = (id) => ({ type: 'ServerSide', id, children: [node({ type: 'AccordionLayout' }, [node({ type: 'AccordionPanel', label: 'Parking' }, [])])] })
  // each surface projects with its own key scope (W2: opts.keyScope, the surface's id)
  const keyOf = (id) => islandContentOf({ tree: acc(id), state: {}, data: {} }, { keyScope: id }).flatMap((b) => b.items).find((a) => a.isCollapsible).collapsibleKey
  assert.notEqual(keyOf('yaml'), keyOf('java'))
})

test('forms: FormSection titles, colspan, labels aside, @PlainText as text, listBox, @Help always shown, step buttons', () => {
  const ff = (extra) => node({ type: 'FormField', fieldId: 'x', label: 'X', dataType: 'string', ...extra })
  const items = itemsOf(card(node({ type: 'FormSection', title: 'Guest' }, [node({ type: 'FormLayout', maxColumns: 3, labelsAside: true }, [ff({ colspan: 2 })])])))
  assert.ok(items.some((a) => a.isHeading && a.text === 'Guest'))
  const layout = items.find((a) => a.isFormLayout)
  assert.deepEqual([layout.labelEdge, layout.labelWidth, layout.fields[0].colspanAttr], ['start', '10rem', '2of3'])
  const plain = layoutFieldOf({ fieldId: 'p', label: 'P', dataType: 'money', stereotype: 'plainText' }, { p: 1180 })
  assert.deepEqual([plain.isText, plain.readonly, plain.fieldClass], [true, true, 'mateu-plain-ellipsis'])
  assert.match(plain.value, /1,180\.00/)
  assert.equal(layoutFieldOf({ fieldId: 'm', label: 'M', dataType: 'string', stereotype: 'plainText', multiline: true }, {}).fieldClass, 'mateu-plain-multiline')
  const listBox = layoutFieldOf({ fieldId: 'b', label: 'B', dataType: 'string', stereotype: 'listBox', options: [{ value: 'a', label: 'A' }] }, {})
  assert.deepEqual([listBox.isRadio, listBox.fieldClass], [true, 'mateu-listbox'])
  const help = layoutFieldOf({ fieldId: 'h', label: 'H', dataType: 'string', description: 'Shown below' }, {})
  assert.deepEqual(help.messagesCustom, [{ severity: 'info', summary: 'Shown below', detail: 'Shown below' }])
  assert.equal(layoutFieldOf({ fieldId: 'n', label: 'N', dataType: 'integer', stepButtonsVisible: true }, {}).numberStep, 1)
  assert.equal(layoutFieldOf({ fieldId: 'n', label: 'N', dataType: 'integer' }, {}).numberStep, 0)
})

test('@Compact on an island gives its form layouts the density class', () => {
  const tree = { type: 'ServerSide', id: 's', style: '--mateu-compact:1; max-width: 900px', children: [node({ type: 'FormLayout' }, [node({ type: 'FormField', fieldId: 'x', label: 'X', dataType: 'string' })])] }
  const layout = islandContentOf({ tree, state: {}, data: {}, kind: 'island' }).flatMap((b) => b.items).find((a) => a.isFormLayout)
  assert.equal(layout.densityClass, 'mateu-density-compact')
})

test('wizard: ProgressSteps(vertical) is a vertical list with done marks; a form beside a 15rem rail is two columns', () => {
  const steps = itemsOf(card(node({ type: 'ProgressSteps', vertical: true, steps: [{ id: 'a', title: 'Where', status: 'done' }, { id: 'b', title: 'When', status: 'current' }] }))).find((a) => a.isProgress)
  // (W3b's own step list: vertical, done marks)
  assert.equal(steps.stepsClass, 'mateu-steps mateu-steps-vertical')
  assert.deepEqual(steps.stepItems.map((s) => [s.number, s.cls]), [['✓', 'mateu-step mateu-step-done'], ['2', 'mateu-step mateu-step-current']])
  assert.deepEqual(styledColumnPercentsOf([{ style: 'flex: 1; min-width: 0;' }, { style: 'flex: 0 0 15rem;' }]), [80, 20])
  assert.equal(styledColumnPercentsOf([{ style: 'width: 100%' }, { style: 'flex: 1' }]), null)
})

test('page width: full / edge pages drop the inner gutters; header badges after the first are chips', () => {
  const layout = (pageWidth) => pageLayoutOf({ host: { pageWidth, tree: { type: 'ServerSide' } }, drawerNav: false }).vars
  assert.match(layout('edgeToEdge').mateuPageHostClass, /mateu-page-edge/)
  assert.match(layout('fullWidth').mateuPageHostClass, /mateu-page-full/)
  assert.equal(layout('fixed').mateuPageHostClass, '')
  assert.match(page(), /mateuPageHeader\.moreBadges/)
})

test('a button drawn inside a row, a box, a hero or a popover is not repeated in the form\'s action row', () => {
  const blocks = [{ isPlain: true, items: [{ isRow: true, items: [{ isButton: true, actionId: 'showMap' }] }, { isHero: true, buttons: [{ actionId: 'offer' }] },
    { isCells: true, cells: [{ items: [{ isButtons: true, buttons: [{ actionId: 'inCell' }] }] }] }] }]
  assert.equal(withFormActions(blocks, [{ actionId: 'showMap' }, { actionId: 'offer' }, { actionId: 'inCell' }]), blocks)
})

test('the cell template is the SAME atoms.html, cut to CELL_ATOM_FLAGS (one source, no recursion)', () => {
  const cells = withCellAtoms(readFileSync(join(here, 'templates', 'atoms.html'), 'utf8'))
  const start = cells.indexOf('<oj-bind-if test="[[ $current.data.isCells ]]">')
  const inner = cells.slice(start, cells.indexOf('\n                    </oj-bind-if>\n', start))
  for (const flag of ['isText', 'isBadge', 'isButtons', 'isChart', 'isNotice']) assert.ok(inner.includes('$current.data.' + flag), flag)
  assert.ok(!inner.slice(60).includes('$current.data.isCells ]]'), 'a cell never holds another box')
  assert.ok(!inner.includes('$current.data.isFormLayout'), 'nor a form')
  assert.ok(CELL_ATOM_FLAGS.every((f) => cells.includes('$current.data.' + f)))
})

test('an island laid out in COLUMNS is not flattened into the host card: the card becomes a row of blocks', () => {
  const field = (id) => node({ type: 'FormLayout' }, [node({ type: 'FormField', fieldId: id, label: id, dataType: 'string' })])
  const tree = { type: 'ServerSide', id: 'rail', serverSideType: 'x.RailTrip', children: [node({ type: 'HorizontalLayout' }, [
    node({ type: 'VerticalLayout' }, [field('destination')], 'flex: 1; min-width: 0;'),
    node({ type: 'VerticalLayout' }, [node({ type: 'Text', text: '1 | 3' })], 'flex: 0 0 15rem; padding-left: 1.5rem;'),
  ])] }
  const host = [{ isCard: true, blockClass: 'oj-flex-item oj-sm-12', items: [{ isText: true, text: 'RAIL' },
    { isSubresource: true, islandId: 'rail', subresource: { id: 'rail', surface: true } }] }]
  const [row] = withSubresources(host, { rail: { tree, state: {}, data: {} } })
  assert.equal(row.isBlockRow, true)
  assert.match(row.frameClass, /oj-panel/, 'the card frame is kept')
  assert.deepEqual(row.subBlocks.map((b) => (b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '12'), ['12', '10', '2'])
  assert.equal(row.subBlocks[0].items[0].text, 'RAIL')
  assert.ok(row.subBlocks[1].items.some((a) => a.isFormLayout && a.surfaceId === 'rail'), 'the form, tagged with its surface')
  assert.ok(row.items.some((a) => a.isFormLayout), 'the flat items stay for the content readers')
  assert.match(page(), /\$current\.data\.isBlockRow/)
})

// the host page does it too (not only islands)
test('the host projects the same row boxes', () => {
  const blocks = hostContentOf({ tree: { type: 'ServerSide', id: 'h', children: [node({ type: 'HorizontalLayout' }, [node({ type: 'Badge', text: 'a' }), node({ type: 'Stat', label: 'x', value: '1' })])] }, state: {}, data: {} }, null, {})
  assert.ok(blocks.flatMap((b) => b.items).some((a) => a.isCells))
})

console.log(`${passed} explorer-layout tests OK`)
