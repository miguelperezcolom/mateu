import { actionsOf, collectFields, collectTexts } from './tree.mjs'
import { interpolate, islandContentOf, hostContentOf, editorNodeIds } from './content.mjs'
import { findByType, findFirst } from './listing.mjs'
import { pageHeaderNodeOf, factProjectionOf, contextualInfoOf, factActionsJsonOf, badgeStatusOf } from './pageHeader.mjs'
import { gridColClasses, metricAriaLabel, panelColClass } from './atoms.mjs'
import { chromeText } from '../i18n.mjs'
import { oracleCdnUrl } from '../oracleCdn.mjs'
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

/** The framework wrapper every served definition-only (YAML) page arrives in: a type, but not the
 *  PAGE's identity — every YAML welcome would share it. */
const GENERIC_PAGE_TYPE = /(^|\.)SeededYamlPage$/

/**
 * Which welcome is being painted: its OWN class when it has one (a Java/C#/Python welcome is the
 * same page whatever route reached it); else the route it was loaded from (ctx.outbound.route —
 * a YAML page, served or from a static bundle, has no class, or only the generic SeededYamlPage
 * wrapper, and its tree has no id of its own); else the tree id. '' when nothing is known.
 */
export function welcomeKeyOf(ctx) {
  const tree = ctx && ctx.tree
  const type = tree && tree.serverSideType
  if (type && !GENERIC_PAGE_TYPE.test(type)) return type
  const route = String((ctx && ctx.outbound && ctx.outbound.route) || '').split(/[?#]/)[0].replace(/^\/+|\/+$/g, '')
  if (route) return 'route:' + route
  return (tree && (tree.id || type)) || ''
}

/** FNV-1a (32-bit) of a string: a stable, well-spread hash (no crypto needed — it picks a colour). */
export function stableHashOf(s) {
  let h = 0x811c9dc5
  const str = String(s == null ? '' : s)
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

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
    illuBg: pair ? oracleCdnUrl(WELCOME_GALLERY + 'illust-welcome-banner-bg-' + pair[1] + '.png') : '',
    illu: pair ? oracleCdnUrl(WELCOME_GALLERY + 'illust-welcome-banner-fg-' + pair[1] + '.png') : '',
    // the guide makes the banner's image panel REQUIRED: a tone with no gallery pair takes Spectra's
    // own themed image instead of none
    themedImage: pair ? 'none' : 'pebbles',
  }
}

/**
 * The hero's look (background tone + illustration pair): a DECLARED tone wins; without one, the
 * look is picked by a stable hash of the welcome's identity (welcomeKeyOf), so a given page always
 * shows the same hero — on every visit, every reload, and while it is reprojected with the answer
 * of an action launched from it (a CTA that navigates: the hero no longer changes color on the
 * way out) — while different welcomes still spread across the looks. It used to be random on
 * every visit.
 *
 * @param key   welcomeKeyOf of the context being projected
 * @param tone  HeroSection.tone (the server's HeroTone), or null
 */
export function welcomeLookOf(key, tone = null) {
  // a DECLARED tone (Welcome.heroTone / @WelcomeBanner(tone)) wins over the hashed look, every time
  const toned = welcomeToneLookOf(key, tone)
  if (toned) return toned
  const [theme, n] = WELCOME_LOOKS[stableHashOf(key) % WELCOME_LOOKS.length]
  return {
    key,
    theme,
    illuBg: oracleCdnUrl(WELCOME_GALLERY + 'illust-welcome-banner-bg-' + n + '.png'),
    illu: oracleCdnUrl(WELCOME_GALLERY + 'illust-welcome-banner-fg-' + n + '.png'),
    themedImage: 'none',
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

/** A page-relative URL made absolute against the page ('' for none; unchanged without a document). */
export function absoluteUrlOf(url) {
  if (!url) return ''
  try {
    return typeof document !== 'undefined' && document.baseURI ? new URL(url, document.baseURI).href : url
  } catch (e) {
    return url
  }
}

export function welcomeOf(ctx) {
  const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
  if (!hero) return null
  // the welcome page is a hero over its tiles and nothing else: a page that merely CONTAINS a hero
  // (among cards, charts, notices…) is not one — taken for it, everything but the tiles vanished
  // a page that DECLARES the template (YAML `template: WelcomePage`) is claimed by its marker; any
  // other page only when its shape is a welcome's
  if (!declaresTemplate(ctx, 'WelcomePage') && holdsMoreThanAWelcome(ctx.tree, true)) return null
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
    ctaNodeIds: editorNodeIds ? ctas.map((c) => c.nodeId || '').join(' ') : '',
    // …and the band of tiles is the DashboardLayout's
    tilesNodeId: editorNodeIds ? String((findByType(ctx.tree, 'DashboardLayout') || {}).id || '') : '',
    trend,
    // HeroSectionDto.tone: null = the page's own hashed look (welcomeLookOf)
    tone: md.tone || null,
    // HeroSectionDto.overline → the template's overline-text (the line above the page title)
    overline: md.overline || '',
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
    // EVERY CTA after the first: oj-sp-welcome-page's `secondaryActions` (two as outlined buttons, the
    // rest in its overflow menu). Only two were painted, so a third Button field was lost. The
    // template's spSecondaryAction says WHICH by its id (`cta<n>`), which `secondaryById` resolves.
    secondaryCtas: ctas.slice(1).map((c, i) => ({ id: 'cta' + (i + 1), label: c.label })),
    secondaryById: Object.fromEntries(ctas.slice(1).map((c, i) => ['cta' + (i + 1), { actionId: c.actionId || '', route: c.route || '' }])),
    // HeroSection.image (Welcome.heroImage()): the banner's texture, in place of the gallery pair.
    // Absolute: Spectra puts it in a CSS url() of its own stylesheet, served from Oracle's CDN, so a
    // "/images/x.png" resolved there and never loaded
    image: absoluteUrlOf(md.image),
    tiles,
  }
}

// ── DASHBOARD archetype → Spectra's oj-sp-dashboard-landing-page ─────────────────────────────
const DASHBOARD_PIECES = new Set(['Scoreboard', 'MetricCard', 'DashboardPanel'])

/** Whether the tree has something besides a dashboard (a scoreboard + panels in layouts). */
function holdsMoreThanADashboard(n, root) {
  if (!n || typeof n !== 'object') return false
  if (!root && n.type === 'ServerSide') return true
  const t = n.metadata && n.metadata.type
  if (t && DASHBOARD_PIECES.has(t)) return false
  if (t && !WELCOME_FRAME.has(t)) return true
  return (n.children || []).some((c) => holdsMoreThanADashboard(c, false))
}

/** The panels Spectra's oj-sp-dashboard-grid lays out itself (its predefined layouts: one to five). */
export const DASHBOARD_GRID_MAX = 5

/**
 * Whether the dashboard DECLARES its own geometry — a panel with a colSpan / rowSpan other than the
 * default (1), or a fixed column count (`Dashboard.columns()` ≠ 0: the grid's tracks on the wire, or
 * a DashboardLayout's `columns`). oj-sp-dashboard-grid lays the panels out in its own predefined
 * layouts and ignores all three, so a dashboard that declares any of them keeps our grid (the oj-flex
 * row: each panel its colSpan of the declared columns) instead of losing what it asked for.
 */
export function dashboardDeclaresLayout(tree, panels) {
  const spans = (panels || []).some((p) => {
    const pm = (p && p.metadata) || {}
    return Number(pm.colSpan || 1) > 1 || Number(pm.rowSpan || 1) > 1
  })
  if (spans) return true
  const grids = findAllByType(tree, 'ResponsiveGrid')
    .filter((g) => (g.children || []).some((k) => k && k.metadata && k.metadata.type === 'DashboardPanel'))
  if (grids.some((g) => String((g.metadata && g.metadata.gridTemplateColumns) || '').trim())) return true
  return findAllByType(tree, 'DashboardLayout').some((l) => l.metadata && Number(l.metadata.columns) > 0)
}

/**
 * The DASHBOARD archetype (Dashboard / InferredDashboard: a Scoreboard of MetricCards + @Panel
 * tiles, nothing else) as Spectra's DASHBOARD LANDING PAGE: its `kpi` slot holds the scoreboard
 * (the oj-sp-scoreboard atom, drill-in included) and its default slot the panels, each an
 * oj-sp-dashboard-panel (panelTitle / panelSubtitle) whose body is VB-painted atoms. The panels go
 * on oj-sp-dashboard-grid — Spectra's own layouts — when it can take them (≤ 5, not reorderable by
 * the viewer: the grid moves the panels into slots of its own, which our drag cannot follow) AND the
 * dashboard declares no geometry of its own (no colSpan/rowSpan ≠ 1, no fixed columns() — the grid
 * ignores them: dashboardDeclaresLayout); otherwise on the oj-flex row with each panel's colSpan. null when the page is not
 * one (a hero makes it a welcome; anything else in the tree, the generic content).
 */
export function dashboardOf(ctx) {
  const tree = ctx && ctx.tree
  if (!tree) return null
  const panels = findAllByType(tree, 'DashboardPanel')
  const boards = findAllByType(tree, 'Scoreboard')
  if (!panels.length && !boards.length) return null
  if (!declaresTemplate(ctx, 'DashboardLandingPage') && (findByType(tree, 'HeroSection') || holdsMoreThanADashboard(tree, true))) return null
  // a dashboard declaring header pieces (@Subtitle, @KPI…) comes inside a Page: its title is the
  // landing page's header (mateuPageHeader), not a block of the content
  const page = pageHeaderNodeOf(tree)
  const pageTitle = page && page.metadata ? String(page.metadata.title || '') : ''
  const isPageTitle = (b) => !!pageTitle && (b.items || []).length === 1 && b.items[0].isText && b.items[0].text === pageTitle
  const blocks = (islandContentOf(ctx) || []).filter((b) => !isPageTitle(b))
  const kpis = []
  const rest = []
  for (const b of blocks) {
    const items = b.items || []
    if (items.length && items.every((a) => a.isScoreboard)) kpis.push(...items)
    else rest.push(b)
  }
  // one block per panel, in order: anything else and the page is not what this branch can paint
  if (rest.length !== panels.length) return null
  const reorderable = rest.some((b) => b.tileKey)
  const tiles = panels.map((panel, i) => {
    const pm = panel.metadata || {}
    const title = pm.title || ''
    const subtitle = pm.subtitle || ''
    let items = rest[i].items || []
    // the panel's own title/subtitle texts (content.mjs paints them as the card's first lines) are
    // the oj-sp-dashboard-panel's panelTitle / panelSubtitle now — not repeated in its body
    if (title && items[0] && items[0].isText && items[0].text === title) items = items.slice(1)
    if (subtitle && items[0] && items[0].isText && items[0].text === subtitle) items = items.slice(1)
    // blockClass: the panel's width on our grid (the oj-flex row the template paints when Spectra's grid
    // is not used) — its colClass of the declared columns/colSpan; without it every panel was one
    // narrow cell whatever it declared
    const blockClass = rest[i].blockClass || rest[i].colClass || 'oj-flex-item oj-sm-12'
    return { ...rest[i], ...(editorNodeIds && panel.id ? { nodeId: String(panel.id) } : {}), title, subtitle, items, blockClass }
  })
  return {
    kpis,
    hasKpis: kpis.length > 0,
    panels: tiles,
    useGrid: tiles.length > 0 && tiles.length <= DASHBOARD_GRID_MAX && !reorderable
      && !dashboardDeclaresLayout(tree, panels),
  }
}

// ── TODO LIST archetype → Spectra's oj-sp-task-organizer-page ────────────────────────────────
/** The action the TodoList archetype's TaskQueue runs on a card (TodoList.java: `openTodoItem`). */
export const TODO_ITEM_ACTION = 'openTodoItem'

/**
 * The TODO LIST archetype (TodoList<Row>: a TaskQueue of counted buckets whose cards ACT) as
 * Spectra's TASK ORGANIZER page: its header (the page title, the toolbar's primary action) and its
 * default slot holding the page's own content — the queue atom as the generic content paints it.
 * null when the page is not one, or when its content is not the plain/card blocks this branch paints
 * (then the generic content keeps it).
 */
export function todoListOf(ctx) {
  const tree = ctx && ctx.tree
  const queue = tree ? findByType(tree, 'TaskQueue') : null
  if (!queue || !queue.metadata || queue.metadata.actionId !== TODO_ITEM_ACTION) return null
  const page = findByType(tree, 'Page')
  const title = (page && page.metadata && page.metadata.title) || ''
  const blocks = hostContentOf(ctx, null, { title }) || []
  if (!blocks.length || blocks.some((b) => !b.isCard && !b.isPlain)) return null
  return { title, blocks }
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

/** The layouts the overview's main slot wraps its pieces in (not pieces themselves). */
const OVERVIEW_WRAPPERS = { VerticalLayout: true, Div: true, Container: true, FullWidth: true, Scroller: true }
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
  const atomsOf = (nodes) => (islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_overviewCard', metadata: { type: 'VerticalLayout' },
    children: nodes } }) || []).flatMap((b) => b.items || [])
  // the card content as ATOMS (not just its texts): a StatusList, a table… were painted empty
  // because only the text was collected
  const cardFrom = (node) => {
    const content = (node.metadata && node.metadata.content) || []
    return { ...cardOf(node), items: atomsOf(Array.isArray(content) ? content : [content]) }
  }
  // the MAIN slot (GeneralOverview.overview()): each of its pieces is a card — a Card with its title,
  // anything else (a chart, a Markdown, an untitled Card…) untitled, in order. Only titled Cards
  // were taken, so whatever else the overview drew was lost. The header EntityHeader is the header.
  const mainNode = findFirstSlotted(ctx.tree, 'main')
  let cards
  if (mainNode) {
    const m0 = mainNode.node.metadata || {}
    const pieces = OVERVIEW_WRAPPERS[m0.type] ? overviewPiecesOf(mainNode.node) : [mainNode.node]
    cards = pieces.filter((n) => n && n !== header)
      .map((n) => (n.metadata && n.metadata.type === 'Card' ? cardFrom(n) : { title: '', texts: [], items: atomsOf([n]) }))
      .filter((card) => card.title || card.items.length)
  } else {
    cards = findAllByType(ctx.tree, 'Card')
      .filter((node) => !infoNode || node !== infoNode.node)
      .map(cardFrom)
      .filter((card) => card.title) // Cards without a title are section/structure wrappers
  }
  // the overview's COLUMNS: main and info side by side at the widths of its grid (infoWidth: the
  // `gridTemplateColumns` «1fr 18rem»), each stacking its cards; without an info slot, one column
  // whose cards go two by two
  let columns
  if (infoNode && infoCard) {
    const grid = findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'ResponsiveGrid'
      && (n.children || []).some((k) => k && k.slot === 'info'))
    const widths = gridColClasses(grid && grid.metadata.gridTemplateColumns, [], 2)
    const span = (cls) => Number(((cls || '').match(/oj-md-(\d+)/) || [])[1]) || 0
    // the template names the tracks in the order the slots TRAVEL (info first when promoted)
    const infoCols = widths ? span(widths[infoNode.first ? 0 : 1]) : 4
    const infoCol = { colClass: 'oj-flex-item oj-sm-12 oj-md-' + (cards.length ? infoCols : 6), cards: [{ ...infoCard, colClass: 'oj-flex-item oj-sm-12' }] }
    const mainCol = { colClass: 'oj-flex-item oj-sm-12 oj-md-' + (12 - infoCols), cards: cards.map((c) => ({ ...c, colClass: 'oj-flex-item oj-sm-12' })) }
    columns = !cards.length ? [infoCol] : infoNode.first ? [infoCol, mainCol] : [mainCol, infoCol]
    // a side column next to other cards; alone, as wide as a card
    if (!cards.length) infoCard.colClass = 'oj-flex-item oj-sm-12 oj-md-6'
    if (infoNode.first) cards.unshift(infoCard)
    else cards.push(infoCard)
  } else {
    columns = [{ colClass: 'oj-flex-item oj-sm-12', cards }]
  }
  // oj-sp-general-overview-page: its MAIN slot (the cards — two by two alone, stacked beside an info
  // column) and its INFO slot (the GeneralOverview `info`, on the template's own neutral column;
  // promoteInfoSlot when the archetype put it first)
  const mainCards = (infoCard ? cards.filter((c) => c !== infoCard) : cards)
    .map((c) => ({ ...c, colClass: infoCard ? 'oj-flex-item oj-sm-12' : 'oj-flex-item oj-sm-12 oj-md-6' }))
  const infoCards = infoCard ? [{ ...infoCard, colClass: 'oj-flex-item oj-sm-12' }] : []
  // the template's header has ONE status badge beside the title: the first EntityHeader badge takes
  // it, the rest follow the subtitle (as on the page header, pageHeaderOf)
  const [firstBadge, ...moreBadges] = md.badges || []
  return {
    title: md.title || '',
    subtitle: (md.subtitle || '') + (badgeText ? ' · ' + badgeText : ''),
    pageSubtitle: [md.subtitle || ''].concat(moreBadges.map((b) => b.label)).filter((t) => t).join(' · '),
    badge: firstBadge ? { text: firstBadge.label, status: badgeStatusOf(firstBadge.color) } : null,
    mainCards,
    infoCards,
    hasInfo: infoCards.length > 0,
    promoteInfo: !!(infoNode && infoNode.first),
    facts: contextualInfoOf(facts),
    factActions: factActionsJsonOf(facts),
    switcherField: switcher ? switcher.fieldId : '',
    switcherOptions: switcher
      ? switcher.options.map((o) => ({ value: o.value, label: o.label }))
      : [],
    switcherValue: switcher ? state[switcher.fieldId] : null,
    cards,
    columns,
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

/** A node by its id anywhere in a wire tree — children and a Card's `metadata.content` included. */
function nodeById(node, id) {
  if (!node || typeof node !== 'object') return null
  if (node.id === id) return node
  const content = node.metadata && node.metadata.content
  const nested = (node.children || []).concat(Array.isArray(content) ? content : content ? [content] : [])
  for (const child of nested) {
    const found = nodeById(child, id)
    if (found) return found
  }
  return null
}

/** The page template a page DECLARES it fills (a YAML `template:`, FormDto.template), or null. */
/** Whether the page DECLARES this page template (YAML `template: <type>`): such a page is claimed by
 *  its marker, never guessed from its shape — a Form root alone fails the shape rules. */
export function declaresTemplate(ctx, type) {
  return ((pageTemplateOf(ctx) || {}).type) === type
}

export function pageTemplateOf(ctx) {
  // a served YAML page arrives wrapped in its server-side component (SeededYamlPage)
  let node = ctx && ctx.tree
  while (node && node.type === 'ServerSide' && (node.children || []).length === 1) node = node.children[0]
  const md = node && node.metadata
  return md && md.type === 'Form' && md.template && md.template.type ? md.template : null
}

/** The Form of a page that fills a template (unwrapped like pageTemplateOf). */
function templateFormOf(ctx) {
  let node = ctx && ctx.tree
  while (node && node.type === 'ServerSide' && (node.children || []).length === 1) node = node.children[0]
  return node
}

/** The tabs of a tab bar, as the item overview paints them (only the OUTER bar's tabs: those of a
 *  nested bar are content of their tab, not siblings in the list). */
function itemTabsOf(tabLayout, atomsOfNodes) {
  return (tabLayout.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab').map((tab, i) => ({
    id: 'itab-' + i,
    ...(editorNodeIds && tab.id ? { nodeId: String(tab.id) } : {}),
    label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
    texts: collectTexts(tab),
    items: atomsOfNodes(tab.children || []),
  }))
}

/** The tab shown on entry — the one the wire marks active (@Tab(open)), else the first — and the
 *  SAME one selected in the bar (the content once showed the first tab while the bar had none). */
function selectedTabOf(tabLayout, tabs) {
  const active = (tabLayout.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab')
    .findIndex((tab) => tab.metadata.active)
  return tabs.length ? tabs[Math.max(0, active)].id : ''
}

/**
 * A page that DECLARES Redwood's Item overview page template (`template: ItemOverviewPage`): no
 * guessing from the layout — the server (and the browser expander) laid each slot out in a
 * container named after it, so the panel's body/footer and the main slot are read by id. A main
 * slot that is one tab bar becomes the template's tabs; anything else is painted as it is.
 */
function templatedItemOverviewOf(ctx, atomsOfNodes) {
  const template = pageTemplateOf(ctx)
  if (!template || template.type !== 'ItemOverviewPage') return null
  const slot = (id) => nodeById(ctx.tree, id)
  const body = slot('item-overview-body')
  const footer = slot('item-overview-footer')
  const main = slot('item-overview-main')
  const mainNodes = (main && main.children) || []
  const tabLayout = mainNodes.length === 1 && mainNodes[0].metadata && mainNodes[0].metadata.type === 'TabLayout'
    ? mainNodes[0] : null
  const tabs = tabLayout ? itemTabsOf(tabLayout, atomsOfNodes) : []
  return {
    key: { title: '', texts: [], items: atomsOfNodes(((body && body.children) || []).concat((footer && footer.children) || [])) },
    tabs,
    selectedTab: tabLayout ? selectedTabOf(tabLayout, tabs) : '',
    // a main slot that is not one tab bar, as atoms
    mainItems: tabLayout ? [] : atomsOfNodes(mainNodes),
    template,
    // the Form whose title/subtitle/badges are the item's (oj-sp-item-overview's header)
    form: (templateFormOf(ctx) || {}).metadata || {},
    keyNodeId: '',
    tabsNodeId: '',
  }
}

/**
 * A page that DECLARES the General overview page template (`template: GeneralOverviewPage`) → the
 * oj-sp-general-overview-page projection (mateuGop): its `main` and `info` slots read by id, each
 * as full-width blocks; a titled section keeps Spectra's own header (oj-sp-section) with its body
 * below. null for any other page (the shape rule, generalOverviewPageOf, still serves the rest).
 */
export function templatedGeneralOverviewOf(ctx) {
  if (!declaresTemplate(ctx, 'GeneralOverviewPage')) return null
  const blocksOf = (node) => (islandContentOf({ ...ctx, templateSlot: true, tree: { type: 'ClientSide', id: '_gop',
    metadata: { type: 'VerticalLayout' }, children: (node && node.children) || [] } }) || [])
    .map((b) => (b.spSection
      ? { isPlain: true, blockClass: 'oj-flex-item oj-sm-12',
        items: [{ isSpSectionHeader: true, sectionTitle: b.sectionTitle, sectionActions: b.sectionActions }].concat(b.sectionItems || []) }
      : { ...b, blockClass: 'oj-flex-item oj-sm-12' }))
  return {
    on: true,
    main: { title: '', blocks: blocksOf(nodeById(ctx.tree, 'general-overview-main')) },
    info: { title: '', blocks: blocksOf(nodeById(ctx.tree, 'general-overview-info')) },
  }
}

/**
 * A page that DECLARES the Collection detail page template (`template: CollectionDetailPage`) → the
 * oj-sp-collection-detail-page projection (mateuCd, as collectionDetailPageOf shapes it): the `list`
 * slot is the collection, the detail (the form's content) or the `noSelection` slot read by id. A page
 * with a detail HAS a selection (its record's id), one without shows noSelection.
 */
export function templatedCollectionDetailOf(ctx) {
  if (!declaresTemplate(ctx, 'CollectionDetailPage')) return null
  const FULL = 'oj-flex-item oj-sm-12'
  const blocksOf = (node) => (islandContentOf({ ...ctx, templateSlot: true, tree: { type: 'ClientSide', id: '_cd',
    metadata: { type: 'VerticalLayout' }, children: (node && node.children) || [] } }) || [])
    .map((b) => (b.spSection
      ? { isPlain: true, blockClass: FULL,
        items: [{ isSpSectionHeader: true, sectionTitle: b.sectionTitle, sectionActions: b.sectionActions }].concat(b.sectionItems || []) }
      : { ...b, blockClass: FULL }))
  const detailNode = nodeById(ctx.tree, 'collection-detail-detail')
  const state = (ctx && ctx.state) || {}
  const form = templateFormOf(ctx)
  return {
    title: interpolate(String((form && form.metadata && form.metadata.title) || ''), state),
    collection: blocksOf(nodeById(ctx.tree, 'collection-detail-list')),
    selectedItems: detailNode ? [{ id: String(state.id != null ? state.id : 'selected') }] : [],
    detail: detailNode ? blocksOf(detailNode) : [],
    noSelection: detailNode ? [] : blocksOf(nodeById(ctx.tree, 'collection-detail-no-selection')),
    // the template's header has no primary action: every toolbar button is one of its actions (the
    // primary first), resolved by headerSecondary against the page toolbar
    actions: ((form && form.metadata && form.metadata.toolbar) || [])
      .filter((b) => b && !/^(back|backToList|cancel-view)$/.test(b.actionId || ''))
      .sort((a, b) => (b.buttonStyle === 'primary') - (a.buttonStyle === 'primary'))
      .map((b) => ({ id: b.actionId || b.label, label: interpolate(String(b.label || b.actionId || ''), state) })),
  }
}

/**
 * A page that DECLARES the Multimedia content page template → its banner (mateuMmc): Spectra ships no
 * oj-sp-multimedia-content-page in this pack, so the page is composed from its pieces —
 * oj-sp-header-welcome-banner (the same banner API as the welcome page) over the sections, with the
 * vertical anchor navigator (toc.mjs forces it on). The banner reads like a welcome's (welcomeOf on the
 * banner hero alone) and takes the welcome look (tone, illustration or themed image).
 */
export function templatedMultimediaOf(ctx) {
  if (!declaresTemplate(ctx, 'MultimediaContentPage')) return null
  const hero = nodeById(ctx.tree, 'multimedia-banner')
  const banner = hero ? welcomeOf({ ...ctx, tree: hero }) : null
  if (!banner) return null
  const look = welcomeLookOf(welcomeKeyOf(ctx), banner.tone)
  // the banner shows ONE record: its texts are templates over the page state
  const text = (t) => interpolate(String(t || ''), (ctx && ctx.state) || {})
  return { ...banner, overline: text(banner.overline), title: text(banner.title), subtitle: text(banner.subtitle),
    theme: look.theme, illuBg: look.illuBg, illu: look.illu, themedImage: look.themedImage || 'none' }
}

/**
 * A page that DECLARES the Guided process template → oj-sp-guided-process (mateuGp): its steps are the
 * `guided-process` tab bar's tabs (one per step of the ONE form, so moving between them keeps what was
 * typed), each with its atoms; the template moves between steps on its own (currentStep writes back).
 * The form's toolbar gives the process its primary action and its cancel.
 */
export function templatedGuidedProcessOf(ctx) {
  if (!declaresTemplate(ctx, 'GuidedProcessPage')) return null
  const bar = nodeById(ctx.tree, 'guided-process')
  if (!bar) return null
  const state = (ctx && ctx.state) || {}
  const atomsOf = (nodes) => (islandContentOf({ ...ctx, templateSlot: true, tree: { type: 'ClientSide', id: '_gp',
    metadata: { type: 'VerticalLayout' }, children: nodes } }) || []).flatMap((b) => (b.spSection
    ? [{ isSpSectionHeader: true, sectionTitle: b.sectionTitle, sectionActions: b.sectionActions }].concat(b.sectionItems || [])
    : b.items || []))
  const steps = (bar.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab').map((tab, i) => ({
    id: 'step-' + (i + 1),
    title: interpolate(String(tab.metadata.label || ''), state),
    items: atomsOf(tab.children || []),
  }))
  const form = templateFormOf(ctx)
  const md = (form && form.metadata) || {}
  const toolbar = md.toolbar || []
  const primary = toolbar.find((b) => b && b.buttonStyle === 'primary')
  const cancel = toolbar.find((b) => b && /^cancel(-(edit|new|create))?$/.test(b.actionId || ''))
  return {
    title: interpolate(String(md.title || ''), state),
    subtitle: interpolate(String(md.subtitle || ''), state),
    // Spectra's step objects: { id, title } (the atoms ride along for our own stamp)
    steps,
    primaryAction: primary ? { label: interpolate(String(primary.label || ''), state) } : null,
    primaryId: primary ? (primary.actionId || '') : '',
    primaryRoute: primary ? (primary.route || '') : '',
    cancelId: cancel ? (cancel.actionId || '') : '',
    cancelRoute: cancel ? (cancel.route || '') : '',
  }
}

/**
 * A page that DECLARES the Hero search template → oj-sp-hero-search-page (mateuHs): its title and
 * description are the hero's (the form's title and subtitle, interpolated); its search box and its
 * results — the page's listing — are painted by the template's slots (the hero node itself is not
 * painted as content).
 */
export function templatedHeroSearchOf(ctx) {
  if (!declaresTemplate(ctx, 'HeroSearchPage')) return null
  const hero = nodeById(ctx.tree, 'hero-search')
  const md = (hero && hero.metadata) || {}
  const state = (ctx && ctx.state) || {}
  // collection: Spectra's collectionView — 'off' (the landing hero) until the first search
  return { title: interpolate(String(md.title || ''), state), description: interpolate(String(md.subtitle || ''), state), collection: 'off' }
}

/** ITEM OVERVIEW archetype: key-data panel + tabs. */
export function itemOverviewOf(ctx) {
  // the content as ATOMS (a Markdown, a Chart, a StatusList…): before, only its loose texts
  const atomsOfNodes = (nodes) => (islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_itemOverview',
    metadata: { type: 'VerticalLayout' }, children: nodes } }) || []).flatMap((b) => (b.spSection
    // a titled @Section keeps Spectra's own section header (oj-sp-section: title, accent marker,
    // affordances) with its body below — flattened to its items it was a bold line among the fields
    ? [{ isSpSectionHeader: true, sectionTitle: b.sectionTitle, sectionActions: b.sectionActions }].concat(b.sectionItems || [])
    : b.items || []))
  const templated = templatedItemOverviewOf(ctx, atomsOfNodes)
  if (templated) return templated
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
  const tabs = itemTabsOf(tabLayout, atomsOfNodes)
  const keyContent = keyCard ? ((keyCard.metadata && keyCard.metadata.content) || []) : []
  return {
    key: keyCard ? { ...cardOf(keyCard), items: atomsOfNodes(Array.isArray(keyContent) ? keyContent : [keyContent]) } : { title: '', texts: [], items: [] },
    tabs,
    selectedTab: selectedTabOf(tabLayout, tabs),
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
