import { islandContentOf, hostContentOf, interpolate } from './content.mjs'
import { findByType, findFirst } from './listing.mjs'
import { entityHeaderOf, badgeStatusOf } from './pageHeader.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): page archetypes painted with
// Spectra's PAGE TEMPLATES whose regions are SLOTS the composed wire maps onto — the Data management
// page (DataManagement / GanttPage: inner end & bottom drawers), the Collection detail page
// (CollectionDetail: list + server-built detail) and the Item overview page (ItemOverview: key panel
// + main). Pure: wire tree → the variable its page branch binds.

/** The ids the archetypes give their composed trees (DataManagement.java / GanttPage.java). */
export const DATA_MANAGEMENT_ID = 'data-management'
export const GANTT_PAGE_ID = 'gantt-page'
const isNode = (n, id) => !!n && (n.id === id || (n.metadata && n.metadata.id === id))
const typeOf = (n) => (n && n.metadata && n.metadata.type) || ''
const FULL = 'oj-flex-item oj-sm-12'

/** The content blocks of a list of nodes (a slot holds a column of them: full width each). */
function blocksOfNodes(ctx, nodes, id) {
  const tree = { type: 'ClientSide', id, metadata: { type: 'VerticalLayout' }, children: nodes.filter(Boolean) }
  return (islandContentOf({ ...ctx, tree }) || []).map((b) => ({ ...b, blockClass: FULL }))
}

/**
 * A DockedPanel as DataManagement composes it (a VerticalLayout: a header row — its title Text and
 * the ✕ Button that toggles it — over its content) → the drawer template's own header (title + close)
 * and its body. The row is dropped: the template draws both.
 */
export function dockedPanelOf(ctx, node, id) {
  const kids = (node && node.children) || []
  const head = kids[0]
  const headKids = (head && head.children) || []
  const titleNode = headKids.find((c) => typeOf(c) === 'Text')
  const close = headKids.find((c) => typeOf(c) === 'Button')
  // a header is the title row; its ✕ (the panel's toggle action) is optional — a YAML
  // DataManagementPage's panel has no server action to toggle with
  const isHeader = typeOf(head) === 'HorizontalLayout' && !!titleNode && headKids.length <= 2
  return {
    on: true,
    title: isHeader ? String(titleNode.metadata.text || '') : '',
    closeActionId: isHeader && close ? String(close.metadata.actionId || '') : '',
    blocks: blocksOfNodes(ctx, isHeader ? kids.slice(1) : kids, id),
  }
}

const NO_PANEL = { on: false, title: '', closeActionId: '', blocks: [] }

/**
 * DataManagement / GanttPage → oj-sp-data-management-page: its transactional header (the page
 * title), its main content (the toolbar + the grid/gantt view, or the gantt + the detail card), the
 * docked END panel in `innerEnd` (oj-sp-general-drawer-template: title + ✕ → the panel's toggle
 * action) and the docked BOTTOM panel in `innerBottom` (oj-sp-bottom-drawer-template: closable → its
 * toggle action; GanttPage's persistent collapsible drawer → `fixed`, the handle minimizes it).
 * null when the page is not one of them.
 */
export function dataManagementPageOf(ctx) {
  const tree = ctx && ctx.tree
  if (!tree) return null
  const root = findFirst(tree, (n) => isNode(n, DATA_MANAGEMENT_ID) || isNode(n, GANTT_PAGE_ID))
  if (!root) return null
  const gantt = isNode(root, GANTT_PAGE_ID)
  const kids = root.children || []
  const titleNode = kids.find((c) => typeOf(c) === 'Text' && /-title$/.test(String(c.id || (c.metadata && c.metadata.id) || '')))
  const rest = kids.filter((c) => c !== titleNode)
  let main = []
  let end = NO_PANEL
  let bottom = NO_PANEL
  let bottomMode = 'closable'
  if (gantt) {
    const drawer = rest.find((c) => typeOf(c) === 'Drawer')
    main = rest.filter((c) => c !== drawer)
    if (drawer) {
      const md = drawer.metadata || {}
      bottom = {
        on: true,
        title: String(md.headerTitle || ''),
        closeActionId: '',
        blocks: blocksOfNodes(ctx, [md.content].concat(drawer.children || []), GANTT_PAGE_ID + '-bottom'),
      }
      // a collapsible drawer the page composes is PERSISTENT: Spectra's fixed mode (a handle, no ✕)
      bottomMode = md.collapsible ? 'fixed' : 'closable'
    }
  } else {
    const toolbar = rest.find((c) => isNode(c, DATA_MANAGEMENT_ID + '-toolbar'))
    const after = rest.slice(rest.indexOf(toolbar) + 1)
    const body = after[0]
    if (isNode(body, DATA_MANAGEMENT_ID + '-body')) {
      const [view, panel] = body.children || []
      main = [toolbar, view]
      if (panel) end = dockedPanelOf(ctx, panel, DATA_MANAGEMENT_ID + '-end')
    } else {
      main = [toolbar, body]
    }
    if (after[1]) bottom = dockedPanelOf(ctx, after[1], DATA_MANAGEMENT_ID + '-bottom')
  }
  return {
    kind: gantt ? 'gantt' : 'dataManagement',
    title: titleNode ? String(titleNode.metadata.text || '') : '',
    main: blocksOfNodes(ctx, main, root.id || DATA_MANAGEMENT_ID),
    end,
    bottom,
    endOpened: end.on ? 'inner' : 'none',
    bottomOpened: bottom.on ? 'inner' : 'none',
    bottomOptions: { drawerMode: bottomMode, title: 'on', maximize: 'off' },
  }
}

/** The action the CollectionDetail archetype's TaskQueue runs on a card (CollectionDetail.java). */
export const COLLECTION_ITEM_ACTION = 'selectCollectionItem'
export const COLLECTION_DETAIL_ID = 'collection-detail'

/**
 * CollectionDetail → oj-sp-collection-detail-page: its header (the page title), its COLLECTION area
 * (the search form + the TaskQueue cards, as the generic content paints them) and its DETAIL — the
 * template's `detailTemplate` is a client-side template it stamps per selected item, while Mateu's
 * detail is built by the server per selection: the selected item handed to the template is only
 * `{ id }`, and the template paints the server's detail blocks from this projection. No selection →
 * the `noSelection` slot (the archetype's emptyDetail()). Selecting stays the `selectCollectionItem`
 * round trip; the search keeps its debounced auto-save. null when the page is not one.
 */
export function collectionDetailPageOf(ctx, { title = '' } = {}) {
  const tree = ctx && ctx.tree
  if (!tree) return null
  const queue = findByType(tree, 'TaskQueue')
  if (!queue || !queue.metadata || queue.metadata.actionId !== COLLECTION_ITEM_ACTION) return null
  if (!findFirst(tree, (n) => isNode(n, COLLECTION_DETAIL_ID))) return null
  const blocks = hostContentOf(ctx, null, { title }) || []
  const isList = (b) => (b.items || []).some((a) => a && a.isQueue)
  const list = blocks.find(isList)
  // the detail is the template column that is not the list (ResponsiveGrid "list detail")
  const detail = blocks.find((b) => b !== list && b.fromTemplate)
  if (!list || !detail) return null
  const rest = blocks.filter((b) => b !== list && b !== detail)
    // the page title (a text block of its own) is the template header's
    .filter((b) => !((b.items || []).length === 1 && b.items[0].isText && b.items[0].text === title))
  const items = (list.items || []).flatMap((a) => (a && a.isQueue ? a.groups || [] : [])).flatMap((g) => g.items || [])
  const selected = items.find((i) => i && i.selected)
  const full = (b) => ({ ...b, blockClass: FULL })
  const detailBlocks = [full(detail)]
  return {
    title,
    collection: rest.map(full).concat([full(list)]),
    selectedItems: selected ? [{ id: String(selected.id) }] : [],
    detail: selected ? detailBlocks : [],
    noSelection: selected ? [] : detailBlocks,
  }
}

/** A leading <h1>–<h4> of a rich-text html: { text, rest } or null. */
function leadingHeadingOf(html) {
  const m = String(html || '').match(/^\s*<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/i)
  if (!m) return null
  const text = decodeHeadingEntities(headingTextOf(m[2])).trim()
  return text ? { text, rest: String(html).slice(m[0].length) } : null
}

/** The text of an html fragment: everything between a `<` and its `>` dropped, scanned one character
 *  at a time (no regex pass a nested `<scr<b>ipt>` could survive), a stray `>` dropped too. The result
 *  is TEXT (a title), never written back as html. */
function headingTextOf(html) {
  let out = ''
  let inTag = false
  for (const c of String(html)) {
    if (c === '<') inTag = true
    else if (c === '>') inTag = false
    else if (!inTag) out += c
  }
  return out
}

const HEADING_ENTITIES = { amp: '&', nbsp: ' ', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }
/** The few named entities a rich-text heading carries, decoded in ONE pass (so `&amp;lt;` stays `&lt;`). */
const decodeHeadingEntities = (text) => text.replace(/&(amp|nbsp|lt|gt|quot|apos|#39);/g, (_, name) => HEADING_ENTITIES[name])

/** Property rows drawn stacked (label above the value), nested ones too. */
function stackedPropertyRows(items) {
  return (items || []).map((i) => {
    if (!i || typeof i !== 'object') return i
    if (i.isPropertyRow) return { ...i, stacked: true }
    return Array.isArray(i.items) ? { ...i, items: stackedPropertyRows(i.items) } : i
  })
}

/**
 * A page that DECLARES the Item overview page template: every value of oj-sp-item-overview is the
 * page's own, named as Spectra names it — itemTitle/itemSubtitle the form's title/subtitle, the badge
 * its first header badge, avatar/photo the template's — interpolated against the page state. The
 * look (sizes, surfaces, the avatar's shape) is the component's, never ours.
 */
function templatedItemOverviewHeaderOf(ctx, item) {
  const md = item.form || {}
  const state = (ctx && ctx.state) || {}
  const text = (t) => (t == null ? '' : interpolate(String(t), state))
  const image = (img) => {
    if (!img) return null
    const src = text(img.src)
    const initials = text(img.initials)
    return src || initials ? { ...(src ? { src } : {}), ...(initials ? { initials } : {}) } : null
  }
  const first = (md.badges || []).map((b) => ({ text: text(b && (b.text != null ? b.text : b.label)), color: b && b.color }))
    .find((b) => b.text)
  const avatar = image(item.template.avatar)
  return {
    itemTitle: text(md.title),
    itemSubtitle: text(md.subtitle),
    badge: first ? { text: first.text, status: badgeStatusOf(first.color), style: 'subtle', position: 'trailing' } : null,
    avatar,
    // Spectra shows the avatar when there is one, else the photo
    photo: avatar ? null : image(item.template.photo),
    // the body slot is a read-only FORM LAYOUT in Spectra (label above the value), so the panel's
    // property rows are drawn stacked there (deep: a row can sit inside a layout atom)
    keyItems: stackedPropertyRows(item.key.items),
  }
}

/**
 * ItemOverview → oj-sp-item-overview-page: its OVERVIEW slot is oj-sp-item-overview — the item's
 * TITLE over the key panel's atoms as its body — and its MAIN slot the tab bar with the chosen tab's
 * atoms. The page template has no title of its own: Spectra puts the page's title in the overview's
 * `itemTitle` («the focus of the overview, such as the name of a product»), at the top of the page.
 * So the title is the PAGE's — an EntityHeader's, else the window title (@Title, what Vaadin draws
 * above the panels) — and only without one the key card's title or the key panel's LEADING heading
 * (a heading atom, or the first heading of a rich text). A leading heading that says the title is
 * taken out of the body (the panel would say it twice); one that says something else stays, and so
 * does a key card title that is not the title (as the body's first heading). `entity` (an
 * EntityHeader on the page) gives the subtitle and badge.
 */
export function itemOverviewPageHeaderOf(ctx, item) {
  if (item && item.template) return templatedItemOverviewHeaderOf(ctx, item)
  const entity = ctx ? entityHeaderOf(ctx) : null
  const badge = entity && (entity.badges || [])[0]
  const key = (item && item.key) || { title: '', items: [] }
  let items = key.items || []
  const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()
  const pageTitle = (entity && entity.title) || (ctx && ctx.windowTitle) || ''
  let title = pageTitle || key.title || ''
  const first = items[0]
  const heading = first && first.isRichText ? leadingHeadingOf(first.html) : null
  const leading = first && first.isHeading && first.text ? String(first.text) : heading ? heading.text : ''
  if (leading && (!title || same(leading, title))) {
    title = title || leading
    items = first.isHeading ? items.slice(1)
      : heading.rest.trim() ? [{ ...first, html: heading.rest }].concat(items.slice(1)) : items.slice(1)
  }
  if (pageTitle && key.title && !same(key.title, pageTitle)) {
    items = [{ isText: true, isHeading: true, text: key.title }].concat(items)
  }
  return {
    itemTitle: title,
    itemSubtitle: entity ? (entity.subtitlePlain != null ? entity.subtitlePlain : (entity.subtitle || '')) : '',
    badge: badge ? { text: badge.label, status: badge.status, style: 'subtle', position: 'trailing' } : null,
    keyItems: items,
  }
}
