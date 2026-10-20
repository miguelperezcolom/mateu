import { actionsOf, collectFields, collectTexts } from './tree.mjs'
import { interpolate, islandContentOf, editorNodeIds } from './content.mjs'
import { findByType } from './listing.mjs'
import { pageHeaderNodeOf, factProjectionOf, contextualInfoOf, factActionsJsonOf } from './pageHeader.mjs'
import { metricAriaLabel, panelColClass } from './atoms.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): welcome, general/item overview, content tab strips, banners, page style.

/** RENDER helper: every node of a type (without crossing island boundaries). */
export function findAllByType(tree, type) {
  const out = []
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (!isRoot && n.type === 'ServerSide') return
    if (n.metadata && n.metadata.type === type) out.push(n)
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach((x) => walk(x, false))
      else if (v && typeof v === 'object') walk(v, false)
    }
  }
  walk(tree, true)
  return out
}

/** The Text components under `node`, as {text, nodeId} — the node id only in editor mode. */
export function textNodesOf(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
    out.push(editorNodeIds && node.id ? { text: node.metadata.text, nodeId: String(node.id) } : { text: node.metadata.text })
  }
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => textNodesOf(x, out))
    else if (v && typeof v === 'object') textNodesOf(v, out)
  }
  return out
}

/** Card → {title, texts} (the Card's title is a nested Text component). */
export function cardOf(node) {
  const md = (node && node.metadata) || {}
  return { title: collectTexts(md.title)[0] || '', texts: collectTexts(md.content) }
}

/** WELCOME archetype: hero (title/subtitle + CTAs) + DashboardLayout tiles. */
/** The color + illustration pairs of the welcome hero: the 5 bg+fg pairs from the OFFICIAL gallery
 *  (fnd/gallery illust-welcome-banner-*-01..05), each with its tone from the dark RDS palette. */
export const WELCOME_LOOKS = [
  ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
  ['dark-sienna', '04'], ['dark-teal', '05'],
]
export const WELCOME_GALLERY = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/'

/** Which welcome is being painted: its server class (or, without one, the tree id). */
export function welcomeKeyOf(ctx) {
  const tree = ctx && ctx.tree
  return tree ? (tree.serverSideType || tree.id || '') : ''
}

/**
 * The hero's look: a random one on ENTERING a welcome, and the same one while staying on it.
 *
 * It rotated on every projection, and a welcome is reprojected with the response of every action
 * launched from it — including that of a CTA returning a route ("Ir a Reservas"): the hero changed
 * color right before navigating, for as long as the next page took to arrive.
 * Now it only rotates on a new visit: no welcome was painted (`previous` null) or it was another one.
 *
 * @param key       welcomeKeyOf of the context being projected
 * @param previous  the painted look ({key, theme, illuBg, illu}) if there was already a welcome, or null
 */
/** HeroSection.tone (the server's HeroTone) → the banner's background-color. oj-sp's welcome banner
 *  ships a dark-* tone for each of the nine (dark-ocean … dark-sienna); the five that have an
 *  illustration pair in the gallery keep it, the other four go without one. */
export const WELCOME_TONES = ['ocean', 'pine', 'lilac', 'teal', 'rose', 'pebble', 'slate', 'plum', 'sienna']
export function welcomeToneLookOf(key, tone) {
  const t = String(tone || '').toLowerCase()
  if (WELCOME_TONES.indexOf(t) < 0) return null
  const theme = 'dark-' + t
  const pair = WELCOME_LOOKS.find(([th]) => th === theme)
  return {
    key,
    tone: t,
    theme,
    illuBg: pair ? WELCOME_GALLERY + 'illust-welcome-banner-bg-' + pair[1] + '.png' : '',
    illu: pair ? WELCOME_GALLERY + 'illust-welcome-banner-fg-' + pair[1] + '.png' : '',
  }
}

export function welcomeLookOf(key, previous, random = Math.random, tone = null) {
  // a DECLARED tone (Welcome.heroTone / @WelcomeBanner(tone)) wins over the rotation, every time
  const toned = welcomeToneLookOf(key, tone)
  if (toned) return toned
  if (previous && previous.theme && previous.key === key) return previous
  const [theme, n] = WELCOME_LOOKS[Math.floor(random() * WELCOME_LOOKS.length) % WELCOME_LOOKS.length]
  return {
    key,
    theme,
    illuBg: WELCOME_GALLERY + 'illust-welcome-banner-bg-' + n + '.png',
    illu: WELCOME_GALLERY + 'illust-welcome-banner-fg-' + n + '.png',
  }
}

const WELCOME_FRAME = new Set(['Page', 'VerticalLayout', 'HorizontalLayout', 'ResponsiveGrid', 'DashboardLayout',
  'Div', 'Container', 'Scroller', 'FullWidth'])
const WELCOME_PIECES = new Set(['HeroSection', 'DashboardPanel'])

/** Whether the tree has something besides the welcome composition (a hero + its tiles in layouts). */
function holdsMoreThanAWelcome(n, root) {
  if (!n || typeof n !== 'object') return false
  if (!root && n.type === 'ServerSide') return false
  const t = n.metadata && n.metadata.type
  if (t && WELCOME_PIECES.has(t)) return false
  if (t && !WELCOME_FRAME.has(t)) return true
  return (n.children || []).some((c) => holdsMoreThanAWelcome(c, false))
}

export function welcomeOf(ctx) {
  const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
  if (!hero) return null
  // the welcome page is a hero over its tiles and nothing else: a page that merely CONTAINS a hero
  // (among cards, charts, notices…) is not one — taken for it, everything but the tiles vanished
  if (holdsMoreThanAWelcome(ctx.tree, true)) return null
  const md = hero.metadata
  const ctas = actionsOf(hero)
  const panels = findAllByType(ctx.tree, 'DashboardPanel')
  // the tiles' grid: a DashboardLayout's columns (3 by default) — each panel takes its colSpan of them
  const layout = findByType(ctx.tree, 'DashboardLayout')
  const columns = layout && layout.metadata && layout.metadata.columns > 0 ? layout.metadata.columns : 3
  const atomsOfPanel = (panel) => (islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_welcomeTile',
    metadata: { type: 'VerticalLayout' }, children: overviewPiecesOf(panel) } }) || []).flatMap((b) => b.items || [])
  // EVERY panel is a tile, in order, with what it holds as atoms (a FeatureGrid, a Checklist, a chart
  // — a TrendChart as the area/line chart it is —, texts…): only the text, the first metric or the first
  // chart of each was taken, the chart moved to the end, and the rest came out as an empty card
  const tiles = panels.map((panel) => {
    const pm = panel.metadata || {}
    // a panel that is ONE metric → the KPI tile (big value + label + caption, clickable)
    const pieces = overviewPiecesOf(panel)
    const only = pieces.length === 1 ? pieces[0] : null
    const metric = only && only.metadata && (only.metadata.type === 'MetricCard' || only.metadata.type === 'Stat') ? only : null
    const mm = metric ? metric.metadata : null
    return {
      ...(editorNodeIds && panel.id ? { nodeId: String(panel.id) } : {}),
      title: pm.title || '',
      subtitle: pm.subtitle || '',
      colClass: panelColClass(pm.colSpan, columns),
      texts: collectTexts(panel),
      textNodes: textNodesOf(panel),
      items: mm ? [] : atomsOfPanel(panel),
      isKpi: !!mm,
      kpiTitle: mm ? (mm.title || mm.label || '') : '',
      kpiValue: mm ? String(mm.value == null ? '' : mm.value) : '',
      kpiCaption: mm ? (mm.description || mm.caption || '') : '',
      kpiTimeframe: mm ? String(mm.timeframe || '').trim() : '',
      kpiAriaLabel: mm ? metricAriaLabel({ title: mm.title || mm.label || '', value: mm.value == null ? '' : String(mm.value), unit: mm.unit || '', timeframe: mm.timeframe || '', trendLabel: mm.trendLabel || '', description: mm.description || mm.caption || '' }) : '',
      kpiActionId: mm ? (mm.actionId || '') : '',
    }
  })
  // the charts are drawn in their tiles now (the full-width chart under the tiles is gone)
  const trend = null
  return {
    // editor mode: the banner is the hero's node, its CTAs (painted inside the banner, in order)
    // their Buttons' — the page binds both onto the banner (data-node-id / data-node-buttons)
    nodeId: editorNodeIds && hero.id ? String(hero.id) : '',
    ctaNodeIds: editorNodeIds ? ctas.slice(0, 2).map((c) => c.nodeId || '').join(' ') : '',
    // …and the band of tiles is the DashboardLayout's
    tilesNodeId: editorNodeIds ? String((findByType(ctx.tree, 'DashboardLayout') || {}).id || '') : '',
    trend,
    // HeroSectionDto.tone: null = the rotating look (welcomeLookOf)
    tone: md.tone || null,
    title: md.title || '',
    subtitle: md.subtitle || '',
    ctas,
    primaryCta: ctas.length ? { label: ctas[0].label } : { label: '' },
    primaryCtaId: ctas.length ? ctas[0].actionId : '',
    // a CTA whose actionable is a RouteLink NAVIGATES there (the welcome listeners hand it to
    // dispatchHostBlockAction → bridge.blockClickOf) — a YAML hero has no action behind its button
    primaryCtaRoute: ctas.length ? ctas[0].route || '' : '',
    secondaryCta: ctas.length > 1 ? { label: ctas[1].label } : null,
    secondaryCtaId: ctas.length > 1 ? ctas[1].actionId : '',
    secondaryCtaRoute: ctas.length > 1 ? ctas[1].route || '' : '',
    tiles,
  }
}

/** The first child slotted `slot` of a ResponsiveGrid in the tree, and whether it leads its
 *  siblings: { node, first } or null. */
export function findFirstSlotted(tree, slot) {
  let found = null
  const walk = (n) => {
    if (found || !n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    if (n.metadata && n.metadata.type === 'ResponsiveGrid') {
      const kids = n.children || []
      const i = kids.findIndex((k) => k && k.slot === slot)
      if (i >= 0) { found = { node: kids[i], first: i === 0 }; return }
    }
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
  }
  walk(tree)
  return found
}

/** The overview's `info` slot as a card: a Card brings its title and content, anything else is
 *  the content itself. */
export function overviewInfoCardOf(ctx, node) {
  const isCard = !!(node && node.metadata && node.metadata.type === 'Card')
  const content = isCard ? (node.metadata.content || []) : [node]
  const blocks = islandContentOf({ ...ctx, kind: 'island', tree: { type: 'ClientSide', id: '_overviewInfo', metadata: { type: 'VerticalLayout' },
    children: Array.isArray(content) ? content : [content] } }) || []
  return {
    title: isCard ? cardOf(node).title : '',
    texts: [],
    items: blocks.flatMap((b) => b.items || []),
    isInfo: true,
    colClass: 'oj-flex-item oj-sm-12 oj-md-4',
  }
}

/** A node's children: in children and/or metadata.content. */
function overviewPiecesOf(node) {
  const out = [...(node.children || [])]
  const inner = node.metadata && node.metadata.content
  if (Array.isArray(inner)) out.push(...inner)
  else if (inner && typeof inner === 'object') out.push(inner)
  return out
}

/** GENERAL OVERVIEW archetype: record switcher + EntityHeader + cards. */
export function generalOverviewOf(ctx) {
  const header = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
  if (!header) return null
  const md = header.metadata
  const switcher = collectFields(ctx.tree).find((f) => f.options && f.options.length)
  // the archetype REQUIRES the record switcher: a standalone EntityHeader (e.g. the in-house
  // 360 or the check-out folio as a page) is NOT a General Overview
  if (!switcher) return null
  const state = ctx.state || {}
  const badgeText = (md.badges || []).map((b) => b.label).join(' · ')
  const facts = (md.facts || []).map((f) => factProjectionOf(f, f.value))
  if (md.metricLabel) facts.push({ label: md.metricLabel, value: md.metricValue })
  // the GeneralOverview `info` slot (GeneralOverview.info(): a child slotted `info` of the
  // ResponsiveGrid `general-overview`): drawn as its own, narrower card — untitled, it was taken for
  // a structural wrapper and dropped. First when it travels first (promoteInfoSlot).
  const infoNode = findFirstSlotted(ctx.tree, 'info')
  const infoCard = infoNode ? overviewInfoCardOf(ctx, infoNode.node) : null
  const cards = findAllByType(ctx.tree, 'Card')
    .filter((node) => !infoNode || node !== infoNode.node)
    .map((node) => {
      const card = cardOf(node)
      // the card content as ATOMS (not just its texts): a StatusList, a table…
      // were painted empty because only the text was collected
      const content = (node.metadata && node.metadata.content) || []
      const blocks = islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_overviewCard', metadata: { type: 'VerticalLayout' },
        children: Array.isArray(content) ? content : [content] } }) || []
      return { ...card, items: blocks.flatMap((b) => b.items || []) }
    })
    .filter((card) => card.title) // Cards without a title are section/structure wrappers
  if (infoCard) {
    // a side column next to other cards; alone, as wide as a card
    if (!cards.length) infoCard.colClass = 'oj-flex-item oj-sm-12 oj-md-6'
    if (infoNode.first) cards.unshift(infoCard)
    else cards.push(infoCard)
  }
  return {
    title: md.title || '',
    subtitle: (md.subtitle || '') + (badgeText ? ' · ' + badgeText : ''),
    facts: contextualInfoOf(facts),
    factActions: factActionsJsonOf(facts),
    switcherField: switcher ? switcher.fieldId : '',
    switcherOptions: switcher
      ? switcher.options.map((o) => ({ value: o.value, label: o.label }))
      : [],
    switcherValue: switcher ? state[switcher.fieldId] : null,
    cards,
  }
}

/** Key of a content tab bar: '' for the first top-level one (the usual one, so a page with a
 *  single bar does not change); inside a tab, that tab's id; the following sibling bars
 *  carry '/tabs-N'. */
export function tabStripKeyOf(scope, ordinal) {
  return [scope || '', ordinal ? 'tabs-' + ordinal : ''].filter(Boolean).join('/')
}

/** Id of tab i of a bar: 'tab-i' in the top-level one, '<key>/tab-i' in the rest. */
export function tabIdOf(stripKey, index) {
  return (stripKey ? stripKey + '/' : '') + 'tab-' + index
}

/** The bar a tab belongs to (inverse of tabIdOf). */
export function tabStripOf(tabId) {
  const s = String(tabId || '')
  const cut = s.lastIndexOf('/')
  return cut < 0 ? '' : s.slice(0, cut)
}

/** Records the chosen tab in the active map (one per bar), without touching the other bars. */
export function withActiveTab(activeTabs, tabId) {
  return { ...(activeTabs || {}), [tabStripOf(tabId)]: tabId }
}

/** Ids of the tab bars (isTabs atoms) of some blocks: the chains refresh them. */
export function tabBarIdsOf(blocks) {
  const ids = []
  const walk = (items) => (items || []).forEach((a) => {
    if (a && a.isTabs && a.barId) ids.push(a.barId)
    if (a && a.items) walk(a.items)
  })
  ;(blocks || []).forEach((b) => walk(b.items))
  return ids
}

/** The node whose children include `target` (null at the root or when absent). */
function parentOfNode(node, target) {
  if (!node || typeof node !== 'object') return null
  for (const child of node.children || []) {
    if (child === target) return node
    const found = parentOfNode(child, target)
    if (found) return found
  }
  return null
}

/** ITEM OVERVIEW archetype: key-data panel + tabs. */
export function itemOverviewOf(ctx) {
  const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
  if (!tabLayout) return null
  // the key panel is the tab bar's SIBLING (the archetype lays them side by side). Any card
  // anywhere used to do: a sectioned form with tabs inside one section (its other sections are
  // cards) was taken for an item overview and drawn as its first section + the tab bar — every
  // other section, and the form's buttons, were gone
  const parent = parentOfNode(ctx.tree, tabLayout)
  const keyCard = ((parent && parent.children) || [])
    .find((c) => c && c.metadata && c.metadata.type === 'Card' && !findByType(c, 'TabLayout'))
  // The archetype is key-data panel + tabs: without a panel this is not an item overview,
  // it is a FORM that happens to carry tabs inside. Claiming it anyway left the page
  // without its fields (there is no key card to paint) and the tabs reduced to their labels
  // (only loose texts are taken from their content). It happened to a process detail.
  if (!keyCard) return null
  // only the tabs of the OUTER bar: those of a nested bar are content of their
  // tab (their texts go in its texts), not siblings in the list
  // the content as ATOMS (a Markdown, a Chart, a StatusList…): before, only its loose texts
  const atomsOfNodes = (nodes) => (islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_itemOverview',
    metadata: { type: 'VerticalLayout' }, children: nodes } }) || []).flatMap((b) => b.items || [])
  const tabs = (tabLayout.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab').map((tab, i) => ({
    id: 'itab-' + i,
    ...(editorNodeIds && tab.id ? { nodeId: String(tab.id) } : {}),
    label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
    texts: collectTexts(tab),
    items: atomsOfNodes(tab.children || []),
  }))
  const keyContent = keyCard ? ((keyCard.metadata && keyCard.metadata.content) || []) : []
  return {
    key: keyCard ? { ...cardOf(keyCard), items: atomsOfNodes(Array.isArray(keyContent) ? keyContent : [keyContent]) } : { title: '', texts: [], items: [] },
    tabs,
    // editor mode: the key panel is its Card's node, the tab bar its TabLayout's (bound by the page)
    keyNodeId: editorNodeIds && keyCard && keyCard.id ? String(keyCard.id) : '',
    tabsNodeId: editorNodeIds && tabLayout.id ? String(tabLayout.id) : '',
  }
}

/** Gate 1.3: page banners (Page.metadata.banners) → items of the
 *  starter's oj-sp-messages-banner (MessagesBannerType). */
export function bannersOf(ctx) {
  // a YAML page authors them on its `type: Form` (same wire field): its ${state.x} resolved here
  const page = ctx && ctx.tree ? pageHeaderNodeOf(ctx.tree) : null
  const interp = (t) => (page && page.fromForm ? interpolate(t || '', (ctx && ctx.state) || {}) : (t || ''))
  // the oj-sp-messages-banner messageTypes carry a general-* prefix (starter pattern)
  const THEMES = { INFO: 'general-info', SUCCESS: 'general-success', WARNING: 'general-warning', DANGER: 'general-error' }
  return (((page || {}).metadata || {}).banners || []).map((banner, i) => ({
    id: 'mateu-banner-' + i,
    messageType: THEMES[banner.theme] || 'general-info',
    primaryText: interp(banner.title),
    secondaryText: interp(banner.description),
  }))
}

/** Gate 1.6: RDS anatomy of the page width (Toolkit 24C measurement) — the content
 *  wrapper applies contexts[host].pageWidth: fixed = 1408px cap with 24px gutters;
 *  fullWidth = fluid with 24px gutters; edgeToEdge = 0 margins. In FIXED the RIGHT
 *  edge is anchored to the SAME formula oj-sp-simple-ui-shell uses to place its
 *  floating chrome (chat FAB: right = (100vw - 1536px)/2, measured) — the shell computes
 *  its box over the FULL viewport and ignores the navigator drawer, so centering
 *  the content in the remaining area misaligned it from the FAB on wide viewports;
 *  left auto (absorbs the drawer), cap 1408 — and never less than 24px on the left: the cap
 *  subtracts both gutters, or a narrow area ended up stuck to the left with a gap only on the
 *  right. */
export function pageStyleOf(ctx) {
  const width = (ctx && ctx.pageWidth) || 'fixed'
  if (width === 'edgeToEdge') return { maxWidth: 'none', margin: '0', padding: '0' }
  if (width === 'fullWidth') return { maxWidth: 'none', margin: '0', padding: '24px' }
  // the right gutter (aligned with the shell's floating chrome, see above) …
  const right = 'max(24px, calc((100vw - 1536px) / 2 + 64px))'
  return {
    // … and a cap that always leaves 24px on the LEFT too: with `max-width: 1408px` alone, any area
    // narrower than 1408 + 2·24 (a laptop, the visual editor's canvas) filled itself up to the right
    // gutter and `margin-left: auto` resolved to 0 — the page hugged the left edge with a blank 24px
    // strip on the right only. Same 1408 cap and the same right edge wherever there is room.
    maxWidth: `min(1408px, calc(100% - 24px - ${right}))`,
    margin: `0 ${right} 0 auto`,
    padding: '24px',
  }
}
