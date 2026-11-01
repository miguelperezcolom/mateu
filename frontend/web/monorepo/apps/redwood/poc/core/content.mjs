import { calendarAtomOf, calendarPageToolbarOf } from '../calendar.mjs'
import { recordMergeAtomOf } from '../recordMerge.mjs'
import { readTileOrder, orderedTileIndices, tileKeyOf, tileScopeOf } from '../prefs.mjs'
import { elementModuleUrl, elementAttributeValue } from '../elements.mjs'
import { collectTexts, isSectionNode, sectionHeadOf, sectionAffordancesOf, withoutSectionAffordances } from './tree.mjs'
import { RICH_TEXT_STEREOTYPES, actionPanelAtomOf, avatarOf, chartAtomOf, dragMimeOf, gridColClasses, gridTrackWeights, isRichAtom, mapAtomOf, matrixAtomOf, metricOf, panelColClass, scoreboardAtomOf, richHtmlOf } from './atoms.mjs'
import { findAllByType, tabIdOf, tabStripKeyOf } from './overviews.mjs'
import { ojIconOrGenericOf } from './shellNav.mjs'
import { findOutsidePanes, factProjectionOf } from './pageHeader.mjs'
import { nestedListingAtomOf, templateNestsListings, findByType, findFirst, statusBadgeRows, labelCellRows, labelColumn, leafColumnsOf, LABEL_CELL_SUFFIX } from './listing.mjs'
import { EMPTY_VALUE, isModalRowEditor, layoutFieldOf, plainValueOf, shownReadOnlyValueOf } from './rowEditor.mjs'
import { ganttAtomOf, planningAtomOf } from './boards.mjs'
import { wizardOf } from './archetypes.mjs'
import { iconNameLike, VISITOR_PASS_THROUGH, AUTO_FIT_DEFAULT, autoFitColClass, pagerButtonsOf, heroAtomOf, emptyStateAtomOf, progressBarAtomOf, customComponentAtomOf, customComponentRegistered, microFrontendOf, tagSurfaceActions, componentHtmlOf, flattenTreeRows, gridPageOf, bpmnAtomOf, breadcrumbsAtomOf, calloutAtomOf, carouselPagerAtomOf, chatAtomOf, checklistAtomOf, commentsAtomOf, comparisonAtomOf, confirmDialogAtomOf, contextMenuAtomOf, cookieConsentAtomOf, directoryAtomOf, featureGridAtomOf, fileListAtomOf, formEditorFieldsOf, funnelAtomOf, heatmapAtomOf, iconAtomOf, kanbanAtomOf, menuBarAtomOf, messageInputAtomOf, messageListAtomOf, notificationAtomOf, orgChartAtomOf, pricingAtomOf, processMonitorAtomOf, resultAtomOf, skeletonAtomOf, testimonialsAtomOf, timelineAtomOf, unsupportedAtomOf, workflowAtomOf } from './display.mjs'
import { chromeText, moneyNumberText } from '../i18n.mjs'
import { styleObjectOf } from '../richtext.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the content visitor (islandContentOf → blocks of atoms), host content, subresources.

/** The action ids a tree advertises at any level (`actions: [{id | actionId}]`). */
function advertisedIdsOf(tree) {
  const ids = []
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    if (Array.isArray(n.actions)) for (const a of n.actions) { const id = a && (a.id ?? a.actionId ?? (typeof a === 'string' ? a : null)); if (id) ids.push(id) }
    for (const k of Object.keys(n)) if (k !== 'actions' && n[k] && typeof n[k] === 'object') walk(n[k])
  }
  walk(tree)
  return ids
}

/** Wire Chip colors → JET badge classes (system, Redwood). PRECOMPUTED (CSP). */
export const BADGE_CLASSES = {
  error: 'oj-badge oj-badge-danger oj-badge-subtle',
  danger: 'oj-badge oj-badge-danger oj-badge-subtle',
  warning: 'oj-badge oj-badge-warning oj-badge-subtle',
  success: 'oj-badge oj-badge-success oj-badge-subtle',
  contrast: 'oj-badge oj-badge-neutral oj-badge-subtle',
  // the plain chip — Vaadin paints it in the primary tone; entityHeaderOf already reads it as info
  normal: 'oj-badge oj-badge-info oj-badge-subtle',
  info: 'oj-badge oj-badge-info oj-badge-subtle',
}

/** Projection of the TaskQueue (front-office work queue): groups of cards with
 *  badges; the click dispatches metadata.actionId with parameters._item = the item's id
 *  (contract of the shared web renderer: mateu-task-queue.ts). The data travels
 *  INLINE in the metadata — there is no data axis and no triggers. */
export function taskQueueOf(tree) {
  // a queue INSIDE a console panel is that console's list (the dispatcher's isQueue
  // atom), not the full-page «work queue + island» mode
  const node = findOutsidePanes(tree, 'TaskQueue')
  // …nor the list of a template with slots (CollectionDetail: TaskQueue@list next to its @detail):
  // it is content, and the detail that arrives on picking is painted beside it
  if (!node || node.slot) return null
  // …nor the TodoList archetype's (its cards ACT, `openTodoItem`): that page is Spectra's task
  // organizer (overviews.mjs todoListOf), not the queue + detail page
  if (node.metadata && node.metadata.actionId === 'openTodoItem') return null
  // …nor a queue that is ONE more piece of a page with other content: queue mode paints the
  // queue + the detail and NOTHING else, so a page with a TaskQueue among charts, boards,
  // calendars… lost everything else (only the queue and a «Nothing here» remained)
  if (holdsOtherContent(tree, true)) return null
  return queueProjectionOf(node.metadata)
}

/** Whether the page (not counting the detail island, a nested ServerSide) has a component that is
 *  not part of a work-queue page. */
function holdsOtherContent(n, root) {
  if (!n || typeof n !== 'object') return false
  if (!root && n.type === 'ServerSide') return false
  const t = n.metadata && n.metadata.type
  if (t && !QUEUE_PAGE_TYPES.has(t)) return true
  const inner = n.metadata && n.metadata.content
  return (n.children || []).some((c) => holdsOtherContent(c, false))
    || (Array.isArray(inner) ? inner.some((c) => holdsOtherContent(c, false)) : holdsOtherContent(inner, false))
}

/** What a work-queue PAGE is made of (the front-office check-in queue): the queue, the detail
 *  placeholder or island, the layouts and fields that hold them. Anything else is other content. */
const QUEUE_PAGE_TYPES = new Set(['TaskQueue', 'EmptyState', 'Page', 'VerticalLayout', 'HorizontalLayout',
  'FormLayout', 'FormRow', 'FormItem', 'FormField', 'FormSection', 'FormSubSection', 'CustomField', 'Card',
  'Text', 'Button', 'Div', 'Container', 'Scroller', 'FullWidth', 'Separator', 'Badge'])

/** The card groups of a TaskQueue, ready to paint (page mode and the isQueue atom). */
export function queueProjectionOf(md) {
  return {
    actionId: md.actionId,
    groups: (md.groups || []).map((group) => ({
      label: group.label,
      items: (group.items || []).map((item) => ({
        id: item.id,
        title: item.title,
        caption: item.caption || '',
        selected: !!item.selected,
        cardClass: item.selected ? 'oj-sm-margin-2x-bottom oj-bg-neutral-20' : 'oj-sm-margin-2x-bottom',
        badges: (item.badges || []).map((badge) => ({
          label: badge.label,
          badgeClass: BADGE_CLASSES[badge.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
        })),
        // LINE option (e.g. "Check-out" only on in-house bookings): a button on the card
        // that dispatches its own actionId with {_item} — same contract as the web renderer
        hasAction: !!(item.actionLabel && item.actionId),
        actionLabel: item.actionLabel || '',
        actionId: item.actionId || '',
        parameters: { _item: item.id },
      })),
    })),
  }
}

/** Projection of the standalone EmptyState (placeholder of the detail panel, or welcome
 *  page). Once an item is selected the server replaces it with the island → null. */
/** The PAGE's empty state: the first EmptyState that is not in a slot of a template (a slotted
 *  one — the @detail placeholder of a CollectionDetail — is content). */
export const pageEmptyStateNode = (tree) => {
  // a listing's PRE-SEARCH content (Crud.metadata.preSearch) is not the page's empty state: it
  // stands in for the results until the first search (listingPreSearchBlocksOf) — taken for the
  // page's it was painted at the bottom, under the table's own «No data.»
  const pre = new Set()
  const mark = (n) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(mark); return }
    pre.add(n)
    for (const v of Object.values(n)) if (v && typeof v === 'object') mark(v)
  }
  findFirst(tree, (n) => { if (n && n.metadata && n.metadata.type === 'Crud' && Array.isArray(n.metadata.preSearch)) mark(n.metadata.preSearch); return false })
  // …nor one with a call to action: the page band (oj-sp-empty-state) has no button, so its CTA
  // was lost — such an empty state is content, painted with its action
  return findFirst(tree, (n) => !!(n && n.metadata && n.metadata.type === 'EmptyState' && !n.slot && !pre.has(n)
    && !n.metadata.actionId))
}
export function emptyStateOf(tree) {
  const node = pageEmptyStateNode(tree)
  if (!node) return null
  const md = node.metadata
  return {
    // an icon NAME is no text (it read «vaadin:list-select Select an item»); an emoji leads the title
    title: (md.icon && !iconNameLike(md.icon) ? md.icon + ' ' : '') + (md.title || ''),
    description: md.description || '',
  }
}

export const NOT_FOUND_TEXTS = {
  es: { title: 'No encontrado', message: 'Puede que se haya borrado o que el enlace no sea correcto.', back: 'Volver' },
  en: { title: 'Not found', message: 'It may have been deleted, or the link is wrong.', back: 'Go back' },
}

/** Projection of the NOT FOUND page: what the server answers when the route names a record
 *  or a screen that does not exist (a deleted booking, a badly copied link) — instead of an
 *  error toast over an empty page. It is painted with Redwood's idiom for this, the
 *  full-page oj-sp-empty-state (its background illustration + primary/secondary text + the
 *  navigationAction as the way back), inside the shell. The texts come from the server (the
 *  exception message as the headline); if missing, the generic ones in the page's language.
 *  null if the host is not a not-found. */
export function notFoundOf(tree, lang) {
  const node = findByType(tree, 'NotFound')
  if (!node) return null
  const md = node.metadata || {}
  const texts = String(lang || '').toLowerCase().startsWith('es') ? NOT_FOUND_TEXTS.es : NOT_FOUND_TEXTS.en
  const backRoute = md.backRoute || ''
  return {
    title: md.title || texts.title,
    message: md.message || texts.message,
    backRoute,
    // the way back is the empty-state's navigationAction (a link); without a route, none
    navigationAction: backRoute ? { label: md.backLabel || texts.back, display: 'on' } : null,
  }
}

/** Wire interpolation (labels with templates): ${state.clave} → value from the state. */
/** The route a row opens (`/customers/${row.id}`), or '' if the template does not fully resolve. */
export function rowRouteOf(template, row) {
  if (!template) return ''
  let unresolved = false
  // a template that is ONE placeholder takes the value whole (`${row.imageLarge}` → a URL): encoding
  // it as a path segment turned https:// into https%3A%2F%2F. A value inside a path is a segment.
  const whole = /^\s*\$\{\s*row\.[A-Za-z0-9_]+\s*\}\s*$/.test(String(template))
  const route = String(template).replace(/\$\{\s*row\.([A-Za-z0-9_]+)\s*\}/g, (all, field) => {
    const value = row ? row[field] : undefined
    if (value == null || value === '') { unresolved = true; return '' }
    const text = typeof value === 'object' ? String(value.value ?? value.message ?? '') : String(value)
    return whole ? text.trim() : encodeURIComponent(text)
  })
  return unresolved || route.includes('${') ? '' : route
}

/**
 * Whether a route leaves the app: it carries a scheme (`https://…`, `mailto:`, a refused
 * `javascript:`) or is protocol-relative (`//host`). The web's isExternalRoute (libs/mateu
 * rowRoute.ts) is the same rule.
 */
export function isExternalRoute(route) {
  const r = String(route == null ? '' : route).trim()
  return /^[a-z][a-z0-9+.-]*:/i.test(r) || r.startsWith('//')
}

export function interpolate(text, state) {
  // `${i18n.clave}` is resolved by the server (or the bundle) before it gets here; if it still
  // arrives, there is no catalogue behind it: the KEY is shown, never the raw expression.
  if (text != null && String(text).includes('i18n.')) {
    text = String(text).replace(/\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*\}/g, (all, key) => key)
  }
  // `${state.x}` and also `${state['x']}` / `${state["x"]}` (the row editor's position
  // arrives as ${state['_position']})
  // and nested paths: `${state.status.message}` (the badge of a header @Status)
  // `\${` / `\\` are the literal escapes the server writes around DATA (Templates.literal): they
  // show as `${` / `\`, never as an expression — a record titled «${state.id}» is not evaluated
  const source = String(text == null ? '' : text)
  if (!source.includes('${')) return source
  return source.replace(
    /\\(\\|\$\{)|\$\{state(?:\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)|\[\s*['"]([^'"\]]+)['"]\s*\])\}/g,
    (all, escaped, dotted, quoted) => {
      if (escaped) return escaped === '\\' ? '\\' : '${'
      if (quoted) return state && state[quoted] != null ? String(state[quoted]) : ''
      let value = state
      for (const part of dotted.split('.')) {
        value = value != null && typeof value === 'object' ? value[part] : undefined
      }
      return value != null && typeof value !== 'object' ? String(value) : ''
    },
  )
}

/** A template the renderer shows WITHOUT evaluating it (the window title): the server's literal
 *  escapes resolved (`\${` → `${`, `\\` → `\`), so the tab, the trail and the header agree. */
export function literalText(text) {
  const source = String(text == null ? '' : text)
  if (!source.includes('${')) return source
  return source.replace(/\\(\\|\$\{)/g, (all, escaped) => (escaped === '\\' ? '\\' : '${'))
}

/** A button's route with its `${state.x}` resolved, or null when any of them is missing or blank
 *  (the button is then drawn disabled: we never navigate to a route with a hole in it). */
export function buttonRouteOf(template, state) {
  const text = String(template == null ? '' : template)
  for (const expression of text.match(/\$\{[^}]*\}/g) || []) {
    const value = interpolate(expression, state)
    if (!value || !value.trim() || value.includes('${')) return null
  }
  const route = interpolate(text, state)
  return route && !route.includes('${') ? route : null
}

/**
 * A Text's classes and inline style from its wire `style` (filtered by styleObjectOf). Redwood's
 * oj-typography-* classes set size and weight with !important, so an inline font-weight or
 * font-size alone would never show: a weight becomes JET's weight class, and a declared size
 * drops the typography class (the inline size then applies).
 */
export function styledTextOf(cls, wireStyle) {
  const style = styleObjectOf(wireStyle)
  let out = cls
  if (style.fontSize) out = out.split(' ').filter((c) => !/^oj-typography-(heading|subheading|body)-/.test(c)).join(' ')
  const weight = String(style.fontWeight || '').trim().toLowerCase()
  const n = weight === 'bold' || weight === 'bolder' ? 700 : weight === 'normal' || weight === 'lighter' ? 400 : Number(weight)
  if (n >= 700) out += ' oj-typography-bold'
  else if (n >= 500) out += ' oj-typography-semi-bold'
  return { cls: out.trim(), style }
}

/** What a HorizontalLayout may hold to be painted as ONE inline row (isRow). */
export const INLINE_ROW_TYPES = new Set(['Text', 'Button', 'Badge', 'Anchor', 'Icon'])

export const TEXT_CLASSES = {
  xl: 'oj-typography-heading-md',
  l: 'oj-typography-subheading-md',
  s: 'oj-typography-body-sm',
  xs: 'oj-typography-body-xs oj-text-color-secondary',
}
export const NOTICE_CLASSES = {
  success: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30',
  warning: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-warning-30',
  danger: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-danger-30',
  info: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-info-30',
}

/** GENERIC projection of an island's display content (e.g. the front-office's embedded
 *  CheckInWizard): BLOCKS (plain | card) of atoms precomputed for VB's
 *  CSP (is* flags, classes, texts interpolated against the state). NESTED islands
 *  (a mediator App inside the island, e.g. the document) are skipped — later
 *  phase. null if the tree contributes nothing display (a pure form island). */
/** Factory of JET data providers, injected by the app (in Node there is none: the atom
 *  travels with the rows and without a provider, which is what the tests check). */
export let dataProviderFactory = null
export function setDataProviderFactory(factory) { dataProviderFactory = typeof factory === 'function' ? sameRowsSameProvider(factory) : factory }

/** The same rows get the same provider back: a table re-projected with unchanged rows (a status poll)
 *  keeps its provider, so the page has nothing to repaint — a new one re-stamped the whole table. The
 *  last few providers are kept, by their rows' content. */
export function sameRowsSameProvider(factory, keep = 32) {
  const byRows = new Map()
  return (rows, ...rest) => {
    let key
    try { key = JSON.stringify([rows, rest]) } catch (e) { return factory(rows, ...rest) }
    if (byRows.has(key)) return byRows.get(key)
    const provider = factory(rows, ...rest)
    byRows.set(key, provider)
    if (byRows.size > keep) byRows.delete(byRows.keys().next().value)
    return provider
  }
}

/** Factory of JET converters (the oj-input-number of an amount): JET 18 no longer accepts the
 *  converter as JSON, it wants an IntlNumberConverter instance. In Node the
 *  specification stays, which is what the tests check. */
/** Who reads the column preferences of the listing on screen (the app: localStorage per
 *  route). In Node, nobody: the columns come out as they are. */
export let columnPrefsReader = null
export function setColumnPrefsReader(fn) { columnPrefsReader = typeof fn === 'function' ? fn : null }

/** Collapsible panels opened/closed by the user (key → bool); anything untouched follows
 *  the wire (AccordionPanel.active, Details.opened). Client state, like the active tab. */
export const panelState = {}
export function setPanelExpanded(key, expanded) { panelState[key] = !!expanded }
export function panelExpanded(key, fallback) { return key in panelState ? panelState[key] : !!fallback }
// Other CLIENT-side view state of the content (the slide a carousel shows, the page a Grid shows,
// the open rows of a tree Grid): a value per key; changing it re-projects (uiValueChanged chain).
export const uiState = {}
export function setUiValue(key, value) { uiState[key] = value }
export function uiValueOf(key, fallback) { return key in uiState ? uiState[key] : fallback }

// ── node ids for the visual editor (editor / preview mode ONLY) ──
// The IDE's visual editor paints a definition in this app (an iframe) and has to map a click back
// to the node of the definition: its preview stamps a synthetic `ve-<path>` id on every node, and
// with this flag on, every projected object (an atom, a card, a form field, a button) carries the
// id of the wire node it came from as `nodeId` — poc/editorPreview.mjs copies it onto the painted
// element as data-node-id. OFF by default: a production page never carries editor ids.
export let editorNodeIds = false
export function setEditorNodeIds(on) { editorNodeIds = !!on }
/** Editor mode only: `o` tagged with the id of the wire node it was projected from. */
export function withNodeId(o, node) {
  if (editorNodeIds && o && typeof o === 'object' && node && node.id) o.nodeId = String(node.id)
  return o
}

export let converterFactory = null
export function setConverterFactory(factory) { converterFactory = factory }
export function converterOf(spec) {
  return converterFactory ? converterFactory(spec) : spec
}

export function islandContentOf(ctx, opts = {}) {
  if (!ctx || !ctx.tree) return null
  // The active tab is PER STRIP: a map {strip key: tab id} (opts.activeTabs).
  // opts.activeTab (a single id) still works for the top-level strip.
  const activeTabs = { ...(opts.activeTab ? { '': opts.activeTab } : {}), ...(opts.activeTabs || {}) }
  // NESTED strips (a TabLayout inside a tab): each strip has its key, derived from
  // the tab that contains it (tabScope) and its ordinal among siblings — see tabStripKeyOf.
  let tabScope = ''
  const stripsPerScope = {}
  let tabBars = 0
  const state = ctx.state || {}
  const interp = (t) => interpolate(t, state)
  const badgeOf = (b) => ({
    label: b.label,
    badgeClass: BADGE_CLASSES[b.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
  })
  const buttonOf = (m) => {
    // a Button whose actionable is a RouteLink NAVIGATES (the server's ButtonMapper puts the link's
    // route on it): the click goes to that route instead of running actionId on the server, which
    // has nothing behind it — a YAML hero's "Browse products" did nothing. Its `${state.x}` are
    // resolved against the state; one that is missing or blank leaves the button DISABLED
    // (`/p/${state.id}` with no id is not "/p/"), as on the web (libs/mateu buttonRenderer).
    const route = m.route ? buttonRouteOf(m.route, state) : null
    return {
      actionId: m.actionId,
      label: m.label || m.actionId,
      disabled: !!m.disabled || (!!m.route && route == null),
      chroming: m.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      parameters: m.parameters || {},
      ...(route ? { route } : {}),
    }
  }
  // the symbol before the amount, two decimals in the UI's locale (libs/mateu uxShared.formatMoney)
  const money = (value, currency) => (currency || '€') + ' ' + moneyNumberText(Number(value || 0))
  const STATUS_TEXT = {
    success: 'oj-text-color-success',
    warning: 'oj-text-color-warning',
    danger: 'oj-text-color-danger',
    error: 'oj-text-color-danger',
    // JET has no info text colour class: Redwood's info tone (app.css). An `info` status was grey
    info: 'mateu-text-info',
    normal: 'mateu-text-info',
  }
  const blocks = []
  let plain = null
  let elementOrdinal = 0
  // the wire node being projected (editor mode only): what an atom or a block made now came from
  let editorNode = ''
  const stampNode = (o) => {
    if (editorNode && o && typeof o === 'object' && o.nodeId === undefined) o.nodeId = editorNode
  }
  if (editorNodeIds) {
    // a card, a column, a panel made while visiting a node is that node's — but not the implicit
    // run of loose atoms (isPlain), which belongs to nobody
    const push = blocks.push.bind(blocks)
    blocks.push = (...made) => {
      made.forEach((b) => { if (b && !b.isPlain) stampNode(b) })
      return push(...made)
    }
  }
  // inside a component-holder field (a CustomField whose content is a component, not fields): its
  // atoms are marked, the generic form cannot draw them (hostContentShown)
  let inHolder = 0
  // a block CUT by a hoisted grid (a column grid nested in a card: see the ResponsiveGrid branch)
  // → the block that carries on after it; what the card still had to say goes there, in order
  const continued = new Map()
  const continuations = new Set()
  const live = (block) => {
    let b = block
    while (b && continued.has(b)) b = continued.get(b)
    return b
  }
  const atom = (a, container) => {
    stampNode(a)
    if (inHolder && a && typeof a === 'object') a.fromHolder = true
    if (container) { live(container).items.push(a); return }
    if (!plain) { plain = { isPlain: true, items: [] }; blocks.push(plain) }
    plain.items.push(a)
  }
  // a node's children travel in children AND/OR in metadata.content (CustomField, Notice…)
  const kidsOf = (node) => {
    const out = [...(node.children || [])]
    const inner = node.metadata && node.metadata.content
    if (Array.isArray(inner)) out.push(...inner)
    else if (inner && typeof inner === 'object') out.push(inner)
    return out
  }
  const collectButtons = (node, out) => {
    if (!node || typeof node !== 'object') return out
    if (node.metadata && node.metadata.type === 'Button') {
      const button = buttonOf(node.metadata)
      if (editorNodeIds && node.id) button.nodeId = String(node.id)
      out.push(button)
      return out
    }
    for (const child of kidsOf(node)) collectButtons(child, out)
    return out
  }
  // the inline row of a HorizontalLayout (see the visitor): null when it is not one
  const inlineRowOf = (node) => {
    const kids = kidsOf(node).filter(Boolean)
    const typeOf = (k) => k && k.metadata && k.metadata.type
    if (!kids.length || !kids.every((k) => INLINE_ROW_TYPES.has(typeOf(k)))) return null
    if (kids.every((k) => typeOf(k) === 'Button')) return null
    const scratch = { items: [] }
    const before = blocks.length
    for (const kid of kids) visit(kid, scratch)
    if (blocks.length !== before) { blocks.splice(before); return null }
    const items = []
    for (const a of scratch.items) {
      if (a.isButtons) a.buttons.forEach((b) => items.push({ ...b, isButton: true }))
      else items.push(a)
    }
    if (!items.length) return null
    return {
      isRow: true,
      style: styleObjectOf(node.style || (node.metadata && node.metadata.style)),
      // the row's own flags (rowText…): the template's inner pieces are not the block atoms
      items: items.map((a, i) => ({
        ...a,
        key: String(i),
        style: a.style || {},
        rowText: !!a.isText && !a.isHeading,
        rowHeading: !!a.isHeading,
        rowButton: !!a.isButton,
        rowBadge: !!a.isBadge,
        rowAnchor: !!a.isAnchor,
        rowIcon: !!a.isIcon,
      })),
    }
  }
  // Projects children as COLUMN-BLOCKS of the oj-flex grid (colClass oj-md-(NN→twelfths)): the
  // zones of @Zones and the two panels of a master-detail. If a column generates several blocks
  // they are MERGED into one (a flex cannot stack two items in the same row cell).
  const projectColumns = (children, percents, extraClass) => {
    children.forEach((child, i) => {
      const col = Math.min(11, Math.max(1, Math.round(percents[i] * 12 / 100)))
      // the wire cssClasses of the COLUMN travel to the block (e.g. the neutral
      // band of the general overview's secondary info: oj-panel + oj-bg-*)
      const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
        + (extraClass ? ' ' + extraClass : '')
        + (child.cssClasses ? ' ' + child.cssClasses : '')
      const before = blocks.length
      plain = null
      visit(child, null)
      plain = null
      const created = blocks.splice(before)
      if (created.length === 1) {
        created[0].colClass = colClass
        blocks.push(created[0])
      } else if (created.length > 1) {
        blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
      }
    })
  }
  // children with their column class ALREADY computed (grids: ResponsiveGrid, DashboardLayout)
  // Returns false (and leaves nothing) if some column generates blocks that cannot be merged into
  // one cell: a nested island (hoisting turns its whole block into the island) or a special
  // block without atoms — then the caller stacks the children as before.
  const projectSized = (children, colClasses, tags = null) => {
    const start = blocks.length
    const out = []
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const before = blocks.length
      plain = null
      if (child && child.metadata && child.metadata.type === 'DashboardPanel') visitDashboardPanel(child, null)
      else visit(child, null)
      plain = null
      const created = blocks.splice(before)
      const tag = tags ? tags[i] : null
      if (created.length === 1) out.push({ ...created[0], colClass: colClasses[i], ...tag })
      else if (created.length > 1) {
        if (created.some((b) => !Array.isArray(b.items) || b.items.some((a) => a && a.isNested))) {
          blocks.splice(start)
          return false
        }
        // the blocks are merged into one (a column cell cannot stack blocks): a Spectra section keeps
        // its header — oj-sp-section with no body: its title, accent marker and affordances — and its
        // body follows (an @Aside form's sections: its main column holds them all)
        out.push({ isPlain: true, colClass: colClasses[i], ...tag,
          items: created.flatMap((b) => (b.spSection
            ? [{ isSpSectionHeader: true, sectionTitle: b.sectionTitle, sectionActions: b.sectionActions }].concat(b.sectionItems || [])
            : b.items)) })
      }
    }
    blocks.push(...out)
    return true
  }
  // a DashboardPanel = a card-block (title + subtitle + its content) with its width
  const visitDashboardPanel = (panel, colClass) => {
    // editor mode: the card (and its title atoms) is the PANEL's node, not the layout's
    if (editorNodeIds && panel && panel.id) {
      const outer = editorNode
      editorNode = String(panel.id)
      try { projectDashboardPanel(panel, colClass) } finally { editorNode = outer }
      return
    }
    projectDashboardPanel(panel, colClass)
  }
  const projectDashboardPanel = (panel, colClass) => {
    const pm = panel.metadata || {}
    const card = { isCard: true, items: [], ...(colClass ? { colClass } : {}) }
    blocks.push(card)
    plain = null
    if (pm.title) card.items.push({ isText: true, text: interp(pm.title), cls: 'oj-typography-subheading-xs' })
    if (pm.subtitle) card.items.push({ isText: true, text: interp(pm.subtitle), cls: 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-bottom' })
    for (const child of kidsOf(panel)) visit(child, card)
    plain = null
  }
  const visit = (node, container) => {
    if (!editorNodeIds || !node || typeof node !== 'object' || !node.id) { visitNode(node, container); return }
    const outer = editorNode
    editorNode = String(node.id)
    try { visitNode(node, container) } finally { editorNode = outer }
  }
  // the root is the surface itself, never another surface. By POSITION, not by identity: in the VB
  // app the registry is read through proxies and `node !== ctx.tree` was true for the root too — the
  // page's own ServerSide was taken for an inline island, one hole and nothing else painted
  let rootSeen = false
  const visitNode = (node, container) => {
    if (!node || typeof node !== 'object') return
    const isRoot = !rootSeen
    rootSeen = true
    // @Subresource: the embedded listing is ANOTHER surface (its ServerSide). Leaves a slot that
    // withSubresources fills with its table once loaded — descending into its mediator App
    // took it for the check-in's nested island (isNested), and the merge emptied the whole block:
    // with the Orders or Billing tab active not even the tab strip remained
    if (!isRoot) {
      const sub = subresourceIslandOf(node)
      if (sub) { atom({ isSubresource: true, islandId: sub.id, subresource: sub }, container); return }
      // an INLINE island (a component field holding a ServerSide of its own: a ComponentTreeSupplier,
      // an adapted object): another surface, painted in its hole from the tree it arrived with
      const inline = inlineIslandOf(node)
      if (inline) { atom({ isSubresource: true, isInlineIsland: true, islandId: inline.id, subresource: inline }, container); return }
    }
    const m = node.metadata
    const t = m && m.type
    // ZONED ROW (@Zones): HorizontalLayout whose children are columns with
    // flex: 1 1 calc(NN% …) — each zone is projected as a column-block (colClass
    // oj-md-(NN→twelfths)); if a zone generates several blocks they are MERGED into one
    // (a flex cannot stack two items in the same row cell)
    if (t === 'HorizontalLayout' && !container) {
      const zoneMatches = (node.children || []).map(
        (ch) => String(ch.style || '').match(/flex:\s*1 1 calc\((\d+(?:\.\d+)?)%/))
      if (zoneMatches.length >= 2 && zoneMatches.every(Boolean)) {
        const before = blocks.length
        projectColumns(node.children, node.children.map((_, i) => parseFloat(zoneMatches[i][1])))
        for (const block of blocks.slice(before)) block.fromColumns = true
        return
      }
    }
    // A ROW of inline pieces (HorizontalLayout of texts, buttons, badges, links, icons: a panel's
    // title and its close button, a label and its badge, a toolbar that mixes them) → ONE isRow
    // atom the template paints as a wrapping flex row, each piece with its own (filtered) style.
    // The atoms of a block stack, so the row used to come out as a column. A row of buttons only
    // keeps the button bar (isButtons); any other child (a grid, a form, a card…) keeps the
    // stacked projection — the templates cannot nest a whole block inside an atom.
    // CALENDAR PAGE: its toolbar row (‹ Today › views + Create) right above the Calendar is
    // folded into Spectra's calendar, whose own toolbar runs those actions — not drawn twice
    if (t === 'VerticalLayout') {
      const kids = kidsOf(node).filter(Boolean)
      const at = kids.findIndex((k) => k.metadata && k.metadata.type === 'Calendar')
      const nav = at > 0 ? calendarPageToolbarOf(kids[at - 1], advertisedIdsOf(ctx.tree)) : null
      if (nav) {
        kids.forEach((kid, i) => {
          if (i === at - 1) return
          if (i === at) atom(calendarAtomOf(kid.metadata, kid.id, undefined, nav), container)
          else visit(kid, container)
        })
        return
      }
    }
    if (t === 'HorizontalLayout') {
      const row = inlineRowOf(node)
      if (row) { atom(row, container); return }
    }
    // CONSOLE / MASTER-DETAIL (MasterDetailLayout, SplitLayout): children = [master, detail].
    // Same projection as the zones: two column-blocks of the oj-flex grid (list on the
    // left, detail on the right, 5/12 + 7/12), which stack below md — like OPERA's
    // Console view. Vertical (SplitLayout orientation vertical) → one below the other. Inside
    // another block there are no columns to share out: it is projected in place, in order.
    if ((t === 'MasterDetailLayout' || t === 'SplitLayout') && !container) {
      const kids = (node.children || []).filter(Boolean)
      if (kids.length >= 2 && String(m.orientation || '').toLowerCase() !== 'vertical') {
        projectColumns(kids.slice(0, 2), [41.7, 58.3], 'mateu-split-pane')
        return
      }
      for (const kid of kids) visit(kid, container)
      return
    }
    if (t === 'App') {
      // NESTED island (e.g. the check-in's document): a placeholder — the
      // content lives in its own context and mateuNested paints it in that slot
      atom({ isNested: true, islandId: node.id }, container)
      return
    }
    // FORM (FormLayout: its FormRows of FormFields, with maxColumns and each field's
    // colspan) → ONE isFormLayout atom that the template paints with JET's oj-form-layout
    // (max-columns / direction=row / colspan on each child): the column layout is JET's,
    // not a grid of our own. Each field carries its real widget (text, number, date,
    // boolean, select) and its readonly — a crud's detail view sends all its fields
    // readOnly and they have to look like that, not like editable inputs. Whatever is not a
    // scalar field (a grid, a property row, another component) cuts the group and is projected
    // as always, in its place.
    if (t === 'FormLayout') {
      const columns = Math.min(4, Math.max(1, m.maxColumns || m.columns || 1))
      const layouts = []
      let layout = null
      const walkLayout = (n) => {
        if (!n || typeof n !== 'object') return
        const md = n.metadata
        if (md && md.type === 'FormRow') { kidsOf(n).forEach(walkLayout); return }
        const field = md && md.type === 'FormField' ? layoutFieldOf(md, state, ctx.data, columns) : null
        if (field) {
          if (editorNodeIds && n.id) field.nodeId = String(n.id)
          if (!layout) {
            layout = { isFormLayout: true, columns, fields: [] }
            layouts.push(layout)
            atom(layout, container)
          }
          layout.fields.push(field)
          return
        }
        layout = null
        visit(n, container)
      }
      kidsOf(node).forEach(walkLayout)
      // all read-only (the detail view): the form layout itself goes readonly and JET
      // paints each field as a value, without an input box
      for (const l of layouts) l.readonly = l.fields.every((f) => f.readonly)
      return
    }
    if (t === 'FormField') {
      const fieldId = m.fieldId || m.id
      // GRID embedded in a form (a list with columns: the Steps/Messages of a
      // process). It is not a crud's listing —that one has its own branch and its search
      // header—, it is one more table of the content.
      if ((m.columns || []).length) {
        // the field's column groups flattened, the group label prefixing its columns' (leafColumnsOf)
        const leafCols = leafColumnsOf(m.columns, interp)
        const rows = Array.isArray(state[fieldId]) ? state[fieldId] : []
        // EDITABLE list with the row editor in a dialog (@DetailFormCustomisation
        // position = modal): "+" below and, per row, Edit / Remove in its last column
        const rowEditable = isModalRowEditor(m)
        const columns = leafCols
          .map((col) => col.metadata || col)
          // the wire's `_select` button column ("Edit") is replaced by the row-actions one
          .filter((c) => !(c.id === '_select' && c.stereotype === 'button'))
          .map((c) => {
            const def = { headerText: c.label || c.id, field: c.id }
            if (c.dataType === 'status') def.template = 'cellStatusBadge'
            // an enum is read by its label («In house»): the cell reads <id>__labelCell
            if (!def.template && labelColumn(c)) def.field = c.id + LABEL_CELL_SUFFIX
            return def
          })
        if (rowEditable) {
          columns.push({ headerText: '', field: '__rowActions', template: 'cellListRowActions', sortable: 'disabled' })
        }
        // in an editable list, a cell that has no value yet (the line and the total of a
        // just-added room: the server sets them on create) says «—», not a gap
        const dashEmpty = (row) => {
          const out = { ...row }
          for (const col of columns) {
            if (col.field !== '__rowActions' && (out[col.field] == null || out[col.field] === '')) out[col.field] = EMPTY_VALUE
          }
          return out
        }
        const shown = labelCellRows(statusBadgeRows(rows, leafCols), leafCols).map((row, i) => (rowEditable
          ? {
            ...dashEmpty(row),
            _rowNumber: row._rowNumber == null ? i : row._rowNumber,
            __rowKey: String(row._rowNumber == null ? i : row._rowNumber),
            __editActionId: fieldId + '_select',
            __removeActionId: fieldId + '_remove',
          }
          : row))
        atom({
          isGrid: true,
          fieldId,
          label: m.label || '',
          columns,
          rows: shown,
          // the data provider is built by the app (JET); in Node there is none, and the atom travels anyway
          adp: dataProviderFactory ? dataProviderFactory(shown) : null,
          isEmpty: rows.length === 0,
          rowEditable,
          addActionId: rowEditable ? fieldId + '_add' : '',
          addLabel: 'Add',
        }, container)
        return
      }
      if (RICH_TEXT_STEREOTYPES[m.stereotype] && m.readOnly) {
        // READ-ONLY richText / html / markdown: with its formatting (editable: an oj-text-area
        // in the form layout — JET ships no rich text editor)
        const raw = state[fieldId] != null ? state[fieldId] : (ctx.data || {})[fieldId]
        atom({ isRichText: true, label: interp(m.label || ''), html: richHtmlOf(m.stereotype, plainValueOf(raw)) }, container)
        return
      }
      if (m.stereotype === 'bulletedList') {
        // @BulletedList on a List<String>: its label and its values as the usual bulleted
        // list (the BulletedList component was already an atom; the field fell into the void)
        const raw = state[fieldId] != null ? state[fieldId] : (ctx.data || {})[fieldId]
        const items = (Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw]).map((v) => String(plainValueOf(v)))
        if (m.label) atom({ isText: true, text: interp(m.label), cls: 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-1x-bottom' }, container)
        atom({ isBullets: true, items }, container)
        return
      }
      if (m.propertyRow) {
        // a read-only lookup travels as the field '<campo>-label', with its LABEL in
        // data['<campo>-label'] (not in the state); a normal field may bring its label the same way
        const data = ctx.data || {}
        const fromData = (key) => (data[key] != null && typeof data[key] !== 'object' ? data[key] : null)
        const raw = state[fieldId] != null ? state[fieldId]
          : fromData(fieldId) != null ? fromData(fieldId) : (m.value != null ? m.value : '')
        const lookupLabel = fromData(fieldId + '-label')
        const shown = shownReadOnlyValueOf(m, lookupLabel != null && lookupLabel !== '' ? lookupLabel : raw)
        atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(shown)) }, container)
        return
      }
      // editable FLUENT FormField (e.g. the charge search box of the check-out mode):
      // input bound by fieldId to the context state (draft + auto-save)
      if (m.dataType === 'string' || m.dataType === 'integer' || m.dataType === 'number') {
        atom({
          isInput: true,
          fieldId,
          label: m.label || '',
          value: state[fieldId] == null ? '' : String(state[fieldId]),
        }, container)
      }
      return
    }
    if (t === 'TabLayout') {
      // Tabs are FLATTENED: the strip's atom + the active tab's content
      // as normal atoms of the same container. Nesting atoms inside atoms would force
      // duplicating the whole template inside the tab and fighting VB's nested $current;
      // this way the existing vocabulary paints the content without noticing.
      const tabs = (node.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab')
      if (!tabs.length) return
      // a single visible tab is not a choice: its content without a strip (it keeps its route
      // key, so nothing moves when a flag shows the others again)
      if (tabs.length === 1) {
        for (const child of tabs[0].children || []) visit(child, container)
        return
      }
      // each strip with ITS key and ITS ids (the top-level one keeps 'tab-N'): with shared ids
      // and active tab, clicking tab 2 of an inner strip also changed
      // the outer one
      const ordinal = stripsPerScope[tabScope] || 0
      stripsPerScope[tabScope] = ordinal + 1
      const stripKey = tabStripKeyOf(tabScope, ordinal)
      const ids = tabs.map((tab, i) => tabIdOf(stripKey, i))
      const wanted = ids.indexOf(activeTabs[stripKey] || '')
      const selected = wanted >= 0 ? wanted : tabs.findIndex((tab) => tab.metadata.active)
      const current = selected >= 0 ? selected : 0
      atom({
        isTabs: true,
        // the first strip keeps the usual id (the chains refresh it by selector)
        barId: tabBars++ ? 'mateuContentTabs-' + (tabBars - 1) : 'mateuContentTabs',
        stripKey,
        selectedId: ids[current],
        tabs: tabs.map((tab, i) => ({
          id: ids[i],
          // the count of its EAGER @Subresource travels with the tab («Subnets (12)»)
          label: interp(tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1))
            + (tab.metadata.badge ? ' (' + tab.metadata.badge + ')' : ''),
          // @Tab(key): selecting it pushes its URL (see contentTabSelected)
          routeKey: tab.metadata.routeKey || '',
          // @Tab(shortcut): selects it by keyboard (keys.mjs)
          shortcut: String(tab.metadata.shortcut || '').toLowerCase(),
        })),
      }, container)
      const outerScope = tabScope
      tabScope = ids[current]
      try {
        for (const child of tabs[current].children || []) visit(child, container)
      } finally {
        tabScope = outerScope
      }
      return
    }
    if (t === 'CustomField') {
      // wrapper: what matters is what it carries inside — in metadata.content or, for a
      // field holding a component (an Anchor, a Chart… declared as a form field),
      // in children: looking only at content those fields vanished without a trace
      // A HOLDER (no FormField inside, no island — a `Callable<Component>`'s Text, a Button…) marks
      // what it brings: the generic form, which drew a plain form, dropped it (walk-behaviour)
      const kids = kidsOf(node)
      const holder = !kids.some((k) => hasFormField(k) || k.type === 'ServerSide')
      if (holder) inHolder++
      try { for (const child of kids) visit(child, container) } finally { if (holder) inHolder-- }
      return
    }
    if (t === 'Element') {
      // Third-party WEB component (a process's graph). The attributes are its only data
      // channel and travel in the METADATA, which a State does not resend: written as `${state.x}`
      // they are VALUES and are re-evaluated on every render — same idiom as any label. The
      // module of the `import` attribute is loaded by the app the first time the tag is used.
      const attributes = {}
      for (const key of Object.keys(m.attributes || {})) {
        // a data-bound attribute never becomes code: no srcdoc, no handler, only safe urls (M-S7)
        const value = elementAttributeValue(m.name, key, m.attributes[key], interp(m.attributes[key]))
        if (value !== undefined) attributes[key] = value
      }
      atom({
        isElement: true,
        // the server sends a filler id ("fieldId") to ALL Elements (a record without an id):
        // two on the same screen (one floor plan per floor, two tables in a foldout) shared
        // a slot and clobbered each other. Without an id of its own, name + ordinal: stable as long
        // as the screen's structure does not change
        elementId: node.id && node.id !== 'fieldId' ? node.id : m.name + '#' + (elementOrdinal++),
        name: m.name,
        importUrl: (m.attributes || {}).import || '',
        // the backend the owning screen came from: a root-relative `import` of a REMOTE screen
        // (RemoteMenu pod, MicroFrontend) is loaded from that remote's origin (elements.mjs)
        screenBase: (ctx.outbound && ctx.outbound.baseUrl) || '',
        attributes,
        style: node.style || '',
        cssClasses: node.cssClasses || '',
        content: interp(m.content || ''),
        asHtml: !!m.html,
        // the content carried `${…}` → DATA has entered the markup: it is sanitized when mounting
        dataInContent: String(m.content || '').indexOf('${') >= 0,
        on: m.on || null,
      }, container)
      return
    }
    // ── DASHBOARD on any page: grid of panels (each DashboardPanel, a card with its
    // width in columns), KPI band (Scoreboard/MetricCard) and charts (oj-chart) ──
    // ResponsiveGrid (the general grid): its tracks (grid-template-columns) and each child's
    // colSpans → oj-flex column-blocks of their width. Inside a card, stacked.
    // a COLUMN grid nested in a block (a CollectionDetail's list/detail inside its form's card, a
    // grid in a field): a block cannot hold columns, so the grid is HOISTED — the block is cut, the
    // grid's columns follow it at the page's level and a continuation block takes the rest. Only a
    // full-width block is cut (one that is already a column keeps its grid stacked inside).
    if (t === 'ResponsiveGrid' && container && !live(container).colClass && blocks.includes(live(container))
        && (gridTrackWeights(m.gridTemplateColumns).length >= 2
          || (m.gridTemplateAreas && String(m.gridTemplateAreas).trim() && !m.gridTemplateColumns))) {
      const cut = live(container)
      plain = null
      const before = blocks.length
      visitNode(node, null)
      plain = null
      if (blocks.length > before) {
        const rest = { ...(cut.isCard ? { isCard: true } : { isPlain: true }), items: [] }
        continued.set(cut, rest)
        continuations.add(rest)
        blocks.push(rest)
      }
      return
    }
    if (t === 'ResponsiveGrid' && !container) {
      // each child's span: the wire's (colSpans) or the one the child carries itself — a
      // DashboardPanel its colSpan, the KPI band (Scoreboard) the whole row
      // a slot TEMPLATE places its children by NAME (slot `main` → area `main`), not by list order:
      // the GeneralOverview's promoted info slot travels FIRST in the list (so a stacking web grid
      // puts it on top) and must still take the `info` column on a wide page
      const serverKids = (m.colSpans && m.colSpans.length) ? kidsOf(node) : kidsInAreaOrder(kidsOf(node), m.gridTemplateAreas)
      const serverSpans = serverKids.map((k, i) => (m.colSpans && m.colSpans[i])
        || (k && k.metadata && k.metadata.type === 'DashboardPanel' ? k.metadata.colSpan
          : k && k.metadata && k.metadata.type === 'Scoreboard' ? 999 : 1))
      // REORDERABLE (ResponsiveGrid.reorderable): the tiles in the user's saved order, each
      // block marked with its key and its scope — installTileReorder drags and re-projects them
      let order = serverKids.map((_, i) => i)
      let tags = null
      if (m.reorderable) {
        const scope = tileScopeOf(node.id)
        const keys = serverKids.map((k, i) => tileKeyOf(k, i))
        order = orderedTileIndices(keys, readTileOrder(scope))
        tags = order.map((i) => ({ tileKey: keys[i], tileScope: scope }))
      }
      const kids = order.map((i) => serverKids[i])
      const spans = order.map((i) => serverSpans[i])
      // auto-fill / auto-fit tracks (repeat(auto-fit, minmax(16rem, 1fr))): as many tiles per row
      // as fit at each breakpoint — responsive oj-flex classes instead of stacking them
      // (no columns and no areas: the web's default, a responsive auto-fit of 16rem tiles)
      const autoTemplate = m.gridTemplateColumns
        || (m.gridTemplateAreas && String(m.gridTemplateAreas).trim() ? '' : AUTO_FIT_DEFAULT)
      const autoFit = autoFitColClass(autoTemplate)
      const tracked = gridColClasses(m.gridTemplateColumns, spans, kids.length)
      // auto-fit tiles keep each child's own width: a panel's colSpan, the KPI band the whole row (a
      // Dashboard with columns() = 0 squeezed its KPI band and every panel into one narrow cell)
      const classes = tracked || (autoFit ? kids.map((_, i) => (spans[i] > 1 ? autoFitColClass(autoTemplate, spans[i]) : autoFit)) : null)
      // a slot TEMPLATE (gridTemplateAreas: @Aside, a CollectionDetail…) is the page's layout: its
      // blocks carry the mark, and the content wins over the generic form (hostContentShown).
      // So do the COLUMNS of explicit tracks (the @Zones of a crud's detail: «35% 65%»): the
      // generic form has one column, it painted every section stacked in a single card
      const templated = !!(m.gridTemplateAreas && String(m.gridTemplateAreas).trim())
      const mark = templated ? { fromTemplate: true } : tracked ? { fromColumns: true } : null
      const allTags = mark ? kids.map((_, i) => ({ ...((tags && tags[i]) || {}), ...mark })) : tags
      if (classes && projectSized(kids, classes, allTags)) return
    }
    if (t === 'DashboardLayout') {
      const columns = m.columns > 0 ? m.columns : 3
      const kids = kidsOf(node)
      if (projectSized(kids, kids.map((k) => panelColClass(k && k.metadata && k.metadata.colSpan, columns)))) return
      for (const child of kids) visit(child, container)
      return
    }
    if (t === 'DashboardPanel') {
      visitDashboardPanel(node, null)
      return
    }
    if (t === 'Scoreboard') {
      const metrics = findAllByType(node, 'MetricCard').map((n) => withNodeId(metricOf(n.metadata, interp), n))
      if (metrics.length) atom({ isScoreboard: true, metrics, ...scoreboardAtomOf(metrics) }, container)
      return
    }
    if (t === 'MetricCard') {
      // consecutive ones join in the same band (like the buttons)
      const target = live(container) || plain
      const last = target && target.items.length ? target.items[target.items.length - 1] : null
      if (last && last.isScoreboard) {
        last.metrics.push(withNodeId(metricOf(m, interp), node))
        Object.assign(last, scoreboardAtomOf(last.metrics))
      } else {
        const metrics = [withNodeId(metricOf(m, interp), node)]
        atom({ isScoreboard: true, metrics, ...scoreboardAtomOf(metrics) }, container)
      }
      return
    }
    if (t === 'Chart' || t === 'TrendChart') {
      atom(chartAtomOf(m, t, interp), container)
      return
    }
    if (t === 'Card') {
      const card = { isCard: true, items: [] }
      // a @Section card says which section it is (data-mateu-section): the sections index (toc.mjs)
      // finds the painted sections by it, in order
      if (isSectionNode(node)) {
        const sectionTitle = String(sectionHeadOf(node).title || '').trim()
        if (sectionTitle) card.sectionTitle = sectionTitle
      }
      blocks.push(card)
      plain = null
      // a fluent Card's title is a COMPONENT (a Text): its texts, as in cardOf
      const title = m.title && (typeof m.title === 'string' ? m.title : (m.title.text || collectTexts(m.title)[0] || ''))
      // a section's heading IS that title (oj-sp-section draws it): not twice
      if (title && !(card.sectionTitle && String(title).trim() === card.sectionTitle)) {
        card.items.push({ isText: true, text: interp(title), cls: 'oj-typography-subheading-xs oj-sm-margin-2x-bottom' })
      }
      for (const child of node.children || []) visit(child, card)
      const cardInner = m.content
      if (Array.isArray(cardInner)) cardInner.forEach((c) => visit(c, card))
      else if (cardInner && typeof cardInner === 'object' && cardInner.metadata) visit(cardInner, card)
      // a titled @Section is painted by Spectra's own section, oj-sp-section: it draws the title
      // (with its accent marker) itself, so its body is the card's atoms without that heading
      if (card.sectionTitle) {
        card.spSection = true
        // its affordances (@Section(addAction, editAction, viewMoreAction)) are the section's own
        // buttons — add as its primary action, edit, view more — and leave the body
        card.sectionActions = sectionAffordancesOf(node)
        card.sectionItems = withoutSectionAffordances(sectionBodyOf(card.items, interp(card.sectionTitle)), card.sectionActions)
      }
      plain = null
      return
    }
    if (t === 'Page') {
      // the island's title + its TOOLBAR (the server's @Toolbar travel in metadata.toolbar)
      const pageTitle = interp(m.title || '')
      if (pageTitle) atom({ isText: true, text: pageTitle, cls: 'oj-typography-subheading-sm' }, container)
      const toolbar = (m.toolbar || []).filter((b) => b && b.actionId)
      if (toolbar.length) atom({ isButtons: true, fromPageToolbar: true, buttons: toolbar.map(buttonOf) }, container)
      for (const child of kidsOf(node)) visit(child, container)
      return
    }
    if (t === 'CustomComponent' && customComponentRegistered(m.name)) {
      // the app registered a view for it (registerCustomComponent): its slot, then its children
      atom(customComponentAtomOf(m, node.id), container)
      for (const child of kidsOf(node)) visit(child, container)
      return
    }
    if (t === 'CustomComponent') {
      // Escape hatch (#14): VB has no renderer for the type → visible placeholder + the slotted
      // children anyway (parity with the web's <mateu-unsupported>).
      atom({
        isNotice: true,
        text: 'Custom component "' + (m.name || '') + '" — no VB renderer',
        noticeClass: NOTICE_CLASSES.warning,
        buttons: [],
      }, container)
      for (const child of kidsOf(node)) visit(child, container)
      return
    }
    if (t === 'Text') {
      const text = interp(m.text)
      if (text) {
        // container h1..h6 → content HEADING: a real h3 (the next step after the section's
        // h2), with group rhythm (margin-top) when it does not open the block
        const heading = /^h[1-6]$/.test(m.container || '')
        if (heading) {
          const target = live(container) || plain
          const notFirst = !!(target && target.items.length)
          atom({
            isText: true,
            isHeading: true,
            // an h2 at the head of a zone is the fold's TITLE (the gop promotes it to
            // a slot header with the foldout's underline)
            isH2: m.container === 'h2',
            text,
            // Text.style, filtered like an Element's HTML style (styleObjectOf): presentation only
            ...styledTextOf('oj-typography-subheading-xs' + (notFirst ? ' oj-sm-margin-10x-top' : ''), node.style || m.style),
          }, container)
        } else {
          atom({ isText: true, text, ...styledTextOf(TEXT_CLASSES[m.size] || 'oj-typography-body-md', node.style || m.style) }, container)
        }
      }
      return
    }
    // LINK (Anchor): a real <a> — the Redwood theme paints it as a link, the global
    // handler in links.mjs navigates INSIDE the shell if it is an app route, and target=_blank
    // (an external URL, a PDF) opens another tab without going through the server
    if (t === 'Anchor') {
      const href = interp(m.url)
      if (href) {
        const target = m.target ? String(m.target) : ''
        atom({
          isAnchor: true,
          text: interp(m.text) || href,
          href,
          target: target || '_self',
          rel: target === '_blank' ? 'noopener noreferrer' : '',
        }, container)
      }
      return
    }
    // FOLDOUT INSIDE A TAB (the page one is painted by oj-sp-foldout-layout, foldoutOf): the
    // overview in its place and each panel as a collapsible panel — its title and, when open, its
    // content; the panels open by default (open) are respected
    if (t === 'FoldoutLayout' && tabScope) {
      const bySlot = {}
      for (const child of node.children || []) bySlot[child.slot || ''] = child
      if (bySlot.overview) visit(bySlot.overview, container)
      ;(m.panels || []).forEach((panel, i) => {
        const key = 'fold:' + (node.id || 'foldout') + ':' + i
        const expanded = panelExpanded(key, panel.open !== false)
        atom({ isCollapsible: true, collapsibleKey: key, title: interp(panel.title || ''), expanded, disabled: false }, container)
        const content = bySlot['panel-' + i]
        if (expanded && content) visit(content, container)
        // a FOLDED panel shows its summary (FoldoutPanel.summary, slotted summary-N) instead
        else if (!expanded && bySlot['summary-' + i]) visit(bySlot['summary-' + i], container)
      })
      return
    }
    // any other foldout drawn from the generic visit (inside an island): its panels' summaries are
    // the FOLDED view of content that is painted in full here — not content of their own
    if (t === 'FoldoutLayout') {
      for (const child of kidsOf(node)) if (!/^summary-/.test(child && child.slot ? child.slot : '')) visit(child, container)
      return
    }
    // COLLAPSIBLE PANELS (AccordionLayout of AccordionPanel, Details): like the tabs, they are
    // FLATTENED — the header is an isCollapsible atom (a JET oj-collapsible) and the panel's
    // content goes after it, as normal atoms, only if it is open. Open/closed is CLIENT
    // state (panelExpanded, by key): collapsing re-projects without asking the server.
    if (t === 'AccordionLayout') {
      kidsOf(node).forEach((panel, i) => {
        const pm = panel.metadata || {}
        const key = 'acc:' + (node.id || 'accordion') + ':' + i
        const expanded = panelExpanded(key, !!pm.active)
        atom({ isCollapsible: true, collapsibleKey: key, title: interp(pm.label || ''), expanded, disabled: !!pm.disabled }, container)
        if (expanded) for (const child of kidsOf(panel)) visit(child, container)
      })
      return
    }
    // a DRAWER placed IN the page (not returned by an action: a GanttPage's bottom panel, a docked
    // side panel) had no view — its content came out loose, without its title and not collapsible.
    // Inline it is a panel: its title as the header, its content after it; a collapsible one folds
    // like a Details (open unless it says otherwise). The root Drawer is an overlay: not here.
    if (t === 'Drawer' && !isRoot) {
      const title = interp(m.headerTitle || m.title || '')
      const pieces = kidsOf(node)
      if (m.collapsible) {
        const key = 'drw:' + (m.id || (node.id && node.id !== 'fieldId' ? node.id : title || 'drawer'))
        const expanded = panelExpanded(key, m.opened !== false)
        atom({ isCollapsible: true, collapsibleKey: key, title, expanded, disabled: false }, container)
        if (expanded) for (const child of pieces) visit(child, container)
        return
      }
      if (title) atom({ isText: true, isHeading: true, text: title, cls: 'oj-typography-subheading-xs' }, container)
      for (const child of pieces) visit(child, container)
      return
    }
    if (t === 'Details') {
      const summaryTexts = m.summary ? collectTexts(m.summary) : []
      const key = 'det:' + (node.id && node.id !== 'fieldId' ? node.id : (summaryTexts[0] || 'details'))
      const expanded = panelExpanded(key, !!m.opened)
      atom({ isCollapsible: true, collapsibleKey: key, title: interp(summaryTexts.join(' ')), expanded, disabled: false }, container)
      if (expanded && m.content) visit(m.content, container)
      return
    }
    // TAPE CHART (PlanningBoard → JET's oj-gantt): rows = resources (with their attribute
    // columns in the label), tasks = blocks. Projection in planningAtomOf (pure, tested);
    // JET's events (ojMove, ojResize, double click, range) are translated by planningActionOf.
    if (t === 'PlanningBoard') {
      atom(planningAtomOf(m, node.id), container)
      return
    }
    // QUEUE as a piece of content (the list of a master-detail console): the same
    // oj-action-card cards as queue mode; each carries its action (the queue's, with {_item}) so
    // the generic block dispatcher runs it, and the line option goes BELOW the
    // card (inside, its click would also be the card's)
    if (t === 'TaskQueue') {
      const q = queueProjectionOf(m)
      atom({
        isQueue: true,
        groups: q.groups.map((g) => ({
          label: g.label,
          items: g.items.map((it) => ({
            ...it,
            actionId: q.actionId,
            parameters: { _item: it.id },
            lineActions: it.hasAction ? [{ actionId: it.actionId, label: it.actionLabel, parameters: it.parameters }] : [],
          })),
        })),
      }, container)
      return
    }
    if (t === 'ProgressSteps') {
      const steps = (m.steps || []).map((step) => ({ id: step.id, label: step.title || step.label || step.id }))
      const current = (m.steps || []).find((step) => step.status === 'current')
      atom({ isProgress: true, steps, selectedId: current ? current.id : (steps[0] && steps[0].id) }, container)
      return
    }
    if (t === 'EntityHeader') {
      atom({
        isEntityHeader: true,
        title: interp(m.title),
        subtitle: interp(m.subtitle || ''),
        badges: (m.badges || []).map(badgeOf),
        // a fact naming an action: its icon button right after the value (factProjectionOf)
        facts: (m.facts || []).map((f) => factProjectionOf(f, interp(f.value))),
        metricLabel: interp(m.metricLabel || ''),
        metricValue: interp(m.metricValue || ''),
      }, container)
      return
    }
    if (t === 'Notice') {
      // As on the web: a notice without text (a @Notice whose field is null or blank) and without
      // content is not painted — the field's value is its own visibility switch.
      const noticeText = interp(m.text)
      const kids = kidsOf(node)
      if (!noticeText.trim() && !kids.length) return
      const holdsButtons = (k) => collectButtons(k, []).length > 0
      // its own right-aligned action (actionLabel + actionId) first, then the Buttons of its
      // content (the band's actions); content WITHOUT buttons (any component) follows the band —
      // the own action and that content used to be dropped: only the buttons survived
      const own = m.actionId ? [buttonOf({ actionId: m.actionId, label: m.actionLabel || m.actionId })] : []
      atom({
        isNotice: true,
        text: noticeText,
        noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
        buttons: [...own, ...collectButtons({ children: kids }, [])],
      }, container)
      for (const child of kids) if (!holdsButtons(child)) visit(child, container)
      return
    }
    if (t === 'Markdown') {
      // Markdown WITH formatting (headings, lists, quotes, code, bold, links…): sanitized HTML
      // that installRichText dumps into its container (VB does not stamp HTML from a binding)
      const html = richHtmlOf('markdown', interp(m.markdown || m.text || ''))
      if (html) atom({ isRichText: true, label: '', html }, container)
      return
    }
    if (t === 'Grid') {
      // a fluent Grid (columns in content, rows in page.content): the same embedded table as
      // a list-typed field — oj-table in list mode; column groups are flattened (oj-table has
      // no grouped headers): the group's label prefixes its columns' — leafColumnsOf
      const leafColumns = leafColumnsOf(m.content, interp).filter((c) => c.type === 'GridColumn' || c.id)
      const gridKey = 'grid:' + (node.id && node.id !== 'fieldId' ? node.id : 'grid')
      const raw = (m.page && m.page.content) || []
      // TREE (Grid.tree, rows with a `children` list): flattened with each row's depth; the first
      // column carries the disclosure (open rows are client state, like a collapsible)
      const tree = !!m.tree && raw.some((r) => Array.isArray(r && r.children) && r.children.length)
      const flat = tree
        ? flattenTreeRows(raw, (key) => !!uiValueOf(gridKey + ':open:' + key, false)).map((r) => ({
          ...r,
          __indentStyle: { paddingInlineStart: (r.__depth * 1.5) + 'rem' },
          __toggleIcon: r.__hasChildren ? (r.__expanded ? 'oj-ux-ico-chevron-down' : 'oj-ux-ico-chevron-right') : '',
          __toggleLabel: r.__expanded ? 'Collapse' : 'Expand',
          __uiKey: gridKey + ':open:' + r.__treeKey,
          __uiValue: !r.__expanded,
        }))
        : raw
      // PAGING: Grid.size rows per page (client side, the rows travel inline)
      const paging = gridPageOf(flat, tree ? 0 : (m.size || 0), uiValueOf(gridKey + ':page', 0))
      const rows = paging.rows.map((r, i) => ({ ...r, _rowNumber: r._rowNumber == null ? i : r._rowNumber }))
      const columns = leafColumns.map((c, i) => {
        const def = { headerText: interp(c.label || c.id), field: c.id }
        if (tree && i === 0) def.template = 'cellTreeToggle'
        return def
      })
      atom({
        isGrid: true,
        fieldId: node.id || 'grid',
        label: '',
        columns,
        rows,
        adp: dataProviderFactory ? dataProviderFactory(rows) : null,
        isEmpty: rows.length === 0,
        rowEditable: false,
        addActionId: '',
        addLabel: 'Add',
        paged: paging.paged,
        pageText: paging.rangeText,
        pager: pagerButtonsOf(gridKey + ':page', paging.page - 1, paging.page + 1, paging.prevDisabled, paging.nextDisabled),
      }, container)
      return
    }
    if (t === 'Gantt') {
      atom(ganttAtomOf(m, node.id), container)
      return
    }
    if (t === 'DropZone') {
      // a destination to drop dragged rows on (@DragRows): title, subtitle and its content as
      // text lines; dnd.mjs highlights it while its type is dragged and fires its action on drop
      const lines = kidsOf(node).flatMap((k) => collectTexts(k)).map(interp).filter(Boolean)
      atom({
        isDropZone: true,
        title: interp(m.title || ''),
        subtitle: interp(m.subtitle || ''),
        lines,
        accept: dragMimeOf(m.accept || ''),
        actionId: m.actionId || '',
        params: JSON.stringify(m.parameters || {}),
        ariaLabel: (m.title || '') + (m.subtitle ? ', ' + m.subtitle : '') + ' — drop target',
      }, container)
      return
    }
    if (t === 'Popover') {
      // the wrapped part is painted as a trigger with its text; the content, as lines in the
      // shared floating window (hover.mjs) — on hover/focus (hover) or on press (click)
      const wrappedTexts = m.wrapped ? collectTexts(m.wrapped).map(interp).filter(Boolean) : []
      const label = wrappedTexts.join(' ') || (m.wrapped && m.wrapped.metadata && m.wrapped.metadata.label) || 'Details'
      const lines = m.content ? collectTexts(m.content).map(interp).filter(Boolean) : []
      // the content WITH its structure (headings, lists, links, badges…) as sanitised HTML: the
      // popup shows that, the text lines stay as its accessible fallback
      const html = m.content ? componentHtmlOf(m.content, interp) : ''
      const text = lines.join('\n') || (html ? ' ' : '')
      atom({
        isPopover: true,
        label: interp(label),
        hoverText: m.trigger === 'hover' ? text : '',
        clickText: m.trigger === 'hover' ? '' : text,
        html,
      }, container)
      return
    }
    if (t === 'Calendar') {
      atom(calendarAtomOf(m, node.id), container)
      return
    }
    if (t === 'MatrixGrid') {
      atom(matrixAtomOf(m, node.id, interp), container)
      return
    }
    if (t === 'Map') {
      atom(mapAtomOf(m, node.id, node.style), container)
      return
    }
    if (t === 'ActionPanel') {
      atom(actionPanelAtomOf(m, node.id, interp), container)
      return
    }
    if (t === 'RecordMerge') {
      atom(recordMergeAtomOf(m, node.id, interp), container)
      return
    }
    if (t === 'BulletedList') {
      atom({ isBullets: true, items: (m.items || []).map(interp) }, container)
      return
    }
    if (t === 'Image') {
      // JET has no image component: an <img> capped at its container's width
      // a RELATIVE path is served by the backend (like an Element's module), not by the VB app
      // …with the component's own style (filtered like a Text's: presentation only) and cssClasses —
      // without them a `max-width: 220px` portrait was drawn as wide as its column
      if (m.src) {
        atom({ isImage: true, src: elementModuleUrl(interp(m.src)), alt: interp(m.alt || ''),
          style: styleObjectOf(node.style || m.style), cls: String(node.cssClasses || m.cssClasses || '').trim() }, container)
      }
      return
    }
    if (t === 'Avatar') {
      // its name/image may be templates (${state.image}); a lone avatar is the record's picture: large
      atom({ isAvatar: true, avatars: [avatarOf({ ...m, name: interp(m.name || ''), image: interp(m.image || '') })], overflow: '', size: 'lg' }, container)
      return
    }
    if (t === 'AvatarGroup') {
      // an oj-avatar per person up to maxItemsVisible, and «+N» for the ones that do not fit
      const all = (m.avatars || []).map(avatarOf)
      const max = m.maxItemsVisible > 0 ? m.maxItemsVisible : all.length
      atom({ isAvatar: true, avatars: all.slice(0, max), overflow: all.length > max ? '+' + (all.length - max) : '' }, container)
      return
    }
    if (t === 'CarouselLayout') {
      // a GALLERY (all the slides are images) → JET's oj-film-strip, with its arrows
      // and its pagination; a carousel of arbitrary content still stacks its slides
      const slides = kidsOf(node)
      const images = slides.map((n) => (n && n.metadata && n.metadata.type === 'Image' && n.metadata.src ? n.metadata : null))
      if (slides.length && images.every(Boolean)) {
        atom({ isGallery: true, id: node.id || 'gallery',
          images: images.map((im, i) => ({ key: String(i), src: elementModuleUrl(interp(im.src)), alt: interp(im.alt || '') })),
          looping: m.loop ? 'page' : 'off' }, container)
        return
      }
    }

    if (t === 'Separator') {
      atom({ isSeparator: true }, container)
      return
    }
    if (t === 'Badge') {
      atom({ isBadge: true, label: interp(m.text), badgeClass: BADGE_CLASSES[m.color] || 'oj-badge oj-badge-neutral oj-badge-subtle' }, container)
      return
    }
    if (t === 'ResourceGrid') {
      const columns = m.columns && m.columns > 0 && m.columns <= 12 ? m.columns : 4
      const colClass = 'oj-flex-item oj-sm-' + Math.max(1, Math.floor(12 / columns))
      atom({
        isResourceGrid: true,
        items: (m.items || []).map((it) => ({
          id: it.id,
          title: it.title,
          subtitle: it.subtitle || '',
          statusLabel: it.statusLabel || '',
          statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
          note: it.note || '',
          recommendedLabel: it.recommended ? (m.recommendedLabel || '') : '',
          enabled: !it.disabled,
          disabled: !!it.disabled,
          actionId: m.actionId,
          parameters: { _item: it.id },
          colClass,
          cardClass: it.selected ? 'oj-bg-neutral-20' : '',
        })),
      }, container)
      return
    }
    if (t === 'OfferCard') {
      atom({
        isOffer: true,
        tag: interp(m.tag || ''),
        title: interp(m.title || ''),
        subtitle: interp(m.subtitle || ''),
        features: (m.features || []).map(interp).join(' · '),
        currentLabel: m.current ? (m.currentLabel || '') : '',
        addedLabel: m.added ? (m.addedLabel || '') : '',
        priceLabel: interp(m.priceLabel || ''),
        actionLabel: m.actionId ? (m.actionLabel || '') : '',
        actionId: m.actionId || '',
        parameters: {},
      }, container)
      return
    }
    if (t === 'AddOnPicker') {
      atom({
        isAddOns: true,
        actionId: m.actionId,
        currency: m.currency || '€',
        totalLabel: m.totalLabel || 'Total',
        items: (m.items || []).map((it) => ({
          id: it.id,
          icon: it.icon || '',
          title: interp(it.title),
          description: interp(it.description || ''),
          price: it.price || 0,
          priceText: money(it.price, m.currency) + (it.unit ? ' / ' + it.unit : ''),
          includedLabel: it.includedLabel || '',
          selectable: !it.includedLabel,
          added: !!it.added,
        })),
      }, container)
      return
    }
    if (t === 'StatusList') {
      // columns > 1 → responsive grid of N columns: the wrapper becomes oj-flex (wrap) and
      // each item is painted as a CARD (oj-panel: its own border, status badge inside)
      // — borderless cells left it ambiguous which task each chip belonged to and the whole
      // did not read as a task listing. The outer cell is itself oj-flex so that
      // the inner panel stretches to the row's height (align-items stretch).
      // All precomputed per item — VB's CSP does not divide or compare.
      const cols = m.columns && m.columns > 1 && m.columns <= 12 ? m.columns : 0
      const rowClass = 'oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom'
      // ONLY columns>1 forces cards: a one-column list with actions (the
      // guests) is painted with the STACKED branch of the markup — name as h3 (the level
      // after the section's h2), without avatar, .mateu-list-item rhythm
      const asCards = cols > 0
      // the cockpit grid: FIXED-SIZE cells (.mateu-grid-cell, 22rem) with the
      // space between cards as the grid's gap (.mateu-grid) — see app.css
      const cellClass = cols
        ? 'oj-flex-item mateu-grid-cell oj-flex oj-sm-margin-4x-bottom'
        : (asCards ? 'oj-flex-item oj-sm-12 oj-flex oj-sm-margin-4x-bottom' : '')
      atom({
        isStatusList: true,
        wrapClass: cols > 0 ? 'oj-flex mateu-grid' : (asCards ? 'oj-flex' : ''),
        items: (m.items || []).map((it) => {
          // up to TWO actions per row (e.g. Scan / By hand per pax) — precomputed
          // array; a row WITH actions is painted STACKED (title+chip /
          // description / buttons) so it does not break up in narrow lanes
          // up to THREE actions per row; with actionIcon* the button is painted ICON-ONLY
          // (label as tooltip/aria) — iconClass precomputed via ojIconOf
          const rowActions = []
          if (it.actionLabel && it.actionId) {
            rowActions.push({ label: it.actionLabel, actionId: it.actionId, parameters: { _item: it.id },
              iconClass: ojIconOrGenericOf(it.actionIcon) || '' })
          }
          if (it.actionLabel2 && it.actionId2) {
            rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
              iconClass: ojIconOrGenericOf(it.actionIcon2) || '' })
          }
          if (it.actionLabel3 && it.actionId3) {
            rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
              iconClass: ojIconOrGenericOf(it.actionIcon3) || '' })
          }
          return {
            rowClass,
            gridCell: asCards,
            cellClass,
            statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
            avatar: it.avatar || '',
            icon: it.icon || '',
            title: interp(it.title),
            description: interp(it.description || ''),
            status: interp(it.status || ''),
            statusClass: STATUS_TEXT[it.statusColor] || 'oj-text-color-secondary',
            actions: rowActions,
            hasActions: rowActions.length > 0,
            // heading level of the stacked title: h4 under a group with its own h3
            isH4: m.itemHeadingLevel === 4,
            // timeline under the title (e.g. the entries of an incident)
            lines: (it.lines || []).map(interp),
            hasLines: !!(it.lines && it.lines.length),
            actionLabel: it.actionLabel || '',
            actionId: it.actionId || m.rowActionId || '',
            parameters: { _item: it.id },
            // rowActionId WITHOUT its own button = the WHOLE ROW is actionable (contract of the
            // web renderer: row click → rowActionId with {_item})
            rowClickable: !!(m.rowActionId && !it.actionLabel),
          }
        }),
      }, container)
      return
    }
    if (t === 'Ledger') {
      atom({
        isLedger: true,
        lines: (m.lines || []).map((line) => ({
          concept: interp(line.concept),
          amountText: line.included ? (line.includedLabel || '') : money(line.amount, m.currency),
          amountClass: (line.amount || 0) < 0 ? 'oj-text-color-success' : '',
        })),
        totalLabel: m.totalLabel || 'Total',
        totalText: money(m.total, m.currency),
      }, container)
      return
    }
    if (t === 'PaymentPicker') {
      atom({
        isPayment: true,
        contextLabel: m.contextLabel || '',
        contextValue: interp(m.contextValue || ''),
        methods: (m.methods || []).map((method) => ({
          label: method.label,
          chroming: method.id === m.selected ? 'callToAction' : 'outlined',
          actionId: m.methodActionId,
          parameters: { _method: method.id },
        })),
        confirmLabel: m.confirmLabel || chromeText('confirm'),
        confirmActionId: m.actionId,
        confirmParameters: { _method: m.selected },
      }, container)
      return
    }
    if (t === 'Meter') {
      atom(meterAtomOf(m, interp, money), container)
      return
    }
    if (t === 'TaskProgress') {
      // N-of-M subtasks banner (operations checklist): complete → success panel and
      // no button (the component's contract); all precomputed (VB's CSP does not compare)
      const total = m.total || 0
      const done = m.done || 0
      const complete = total > 0 && done >= total
      atom({
        isTaskProgress: true,
        label: interp(m.label || ''),
        value: done,
        max: total,
        valueText: chromeText('progressOf', { done, total }),
        panelClass: complete
          ? 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30'
          : 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-neutral-20',
        actionLabel: !complete && m.actionId ? (m.actionLabel || '') : '',
        actionId: m.actionId || '',
        parameters: {},
      }, container)
      return
    }
    if (t === 'Stat') {
      atom({
        isStat: true,
        label: interp(m.label || ''),
        value: (m.value == null ? '' : String(interp(String(m.value)))) + (m.unit ? ' ' + interp(m.unit) : ''),
      }, container)
      // a Stat with an action drills in (as a MetricCard's «View»): it used to be inert here
      if (m.actionId) atom({ isButtons: true, buttons: [buttonOf({ actionId: m.actionId, label: chromeText('view') })] }, container)
      return
    }
    if (t === 'Button') {
      const target = container || plain
      const last = target && target.items.length ? target.items[target.items.length - 1] : null
      const button = buttonOf(m)
      if (editorNodeIds && node.id) button.nodeId = String(node.id)
      if (last && last.isButtons) last.buttons.push(button)
      else atom({ isButtons: true, buttons: [button] }, container)
      return
    }
    // ── display components with their own projection (core/display.mjs) ──
    if (t === 'Kanban') { atom(kanbanAtomOf(m, interp), container); return }
    if (t === 'Timeline') { atom(timelineAtomOf(m, interp), container); return }
    if (t === 'PricingTable') { atom(pricingAtomOf(m, interp), container); return }
    if (t === 'OrgChart') { atom(orgChartAtomOf(m, interp), container); return }
    if (t === 'Heatmap') { atom(heatmapAtomOf(m), container); return }
    if (t === 'Funnel') { atom(funnelAtomOf(m, interp), container); return }
    if (t === 'FeatureGrid') { atom(featureGridAtomOf(m, interp), container); return }
    if (t === 'Testimonials') { atom(testimonialsAtomOf(m, interp), container); return }
    if (t === 'CalloutCard') { atom(calloutAtomOf(m, interp), container); return }
    if (t === 'CommentThread') { atom(commentsAtomOf(m, interp), container); return }
    if (t === 'FileList') { atom(fileListAtomOf(m, interp), container); return }
    if (t === 'Checklist') { atom(checklistAtomOf(m, interp), container); return }
    if (t === 'ComparisonCard') { atom(comparisonAtomOf(m, interp), container); return }
    if (t === 'ProcessMonitor') { atom(processMonitorAtomOf(m, interp), container); return }
    if (t === 'Skeleton') { atom(skeletonAtomOf(m), container); return }
    if (t === 'Icon') { atom(iconAtomOf(m), container); return }
    if (t === 'MenuBar') { atom(menuBarAtomOf(m, interp), container); return }
    if (t === 'Directory') { atom(directoryAtomOf(m, interp), container); return }
    if (t === 'MessageList') { atom(messageListAtomOf(m, interp), container); return }
    if (t === 'MessageInput') { atom(messageInputAtomOf(m, node.id), container); return }
    if (t === 'Chat') { atom(chatAtomOf(m, node.id), container); return }
    if (t === 'Bpmn') { atom(bpmnAtomOf(m, node.id), container); return }
    if (t === 'Workflow') { atom(workflowAtomOf(m), container); return }
    if (t === 'Result') { atom(resultAtomOf(m, interp), container); return }
    if (t === 'CookieConsent') { atom(cookieConsentAtomOf(m, interp), container); return }
    if (t === 'Breadcrumbs') { atom(breadcrumbsAtomOf(m, interp), container); return }
    if (t === 'Notification') { atom(notificationAtomOf(m, interp), container); return }
    // a LISTING inside a templated page's content (a general overview's slot, a multimedia section, a
    // collection detail's detail…) is part of that content, drawn where it sits: not the page's own
    // listing, which the listing branch paints (hoisted, it left its slot for the top of the page)
    if (t === 'Crud' && m.rowsSource && (ctx.templateSlot || templateNestsListings(ctx.tree))) {
      atom(nestedListingAtomOf(node, ctx), container)
      return
    }
    if (t === 'MicroFrontend') {
      // a surface of its own, loaded from its baseUrl like a @Subresource (withSubresources paints it)
      const sub = microFrontendOf(m)
      atom({ isSubresource: true, islandId: sub.id, subresource: sub }, container)
      return
    }
    // a Multimedia content page's banner / a Hero search page's hero are the template's own header
    if (t === 'HeroSection' && (node.id === 'multimedia-banner' || node.id === 'hero-search')) return
    if (t === 'HeroSection') {
      // a hero in the content (the Welcome archetype paints its own with oj-sp-header-welcome-banner)
      atom(heroAtomOf(m, interp), container)
      for (const child of kidsOf(node)) visit(child, container)
      return
    }
    // an EmptyState inside the content (the host's FIRST one is the page-level oj-sp-empty-state
    // of emptyStateOf — painted there, not twice)
    // the page's own empty state is painted full-page, not here — but one inside a page template's
    // slot (ctx.templateSlot: a collection detail's noSelection) is that slot's content
    if (t === 'EmptyState' && !(ctx.kind === 'host' && !ctx.templateSlot && pageEmptyStateNode(ctx.tree) === node)) {
      atom(emptyStateAtomOf(m, interp), container)
      return
    }
    // a ProgressBar in the content (a wizard's own progress is its guided process, wizardOf)
    if (t === 'ProgressBar' && !wizardOf(ctx)) {
      atom(progressBarAtomOf(m, state, interp), container)
      return
    }
    if (t === 'ConfirmDialog') {
      // its message is its children; only open while openedCondition holds over the state
      const lines = kidsOf(node).flatMap((k) => collectTexts(k))
      atom(confirmDialogAtomOf(m, node.id, state, interp, lines), container)
      return
    }
    if (t === 'Faq') {
      // like an accordion: a collapsible header per question, the answer after it when open
      ;(m.items || []).forEach((item, i) => {
        const key = 'faq:' + (node.id && node.id !== 'fieldId' ? node.id : 'faq') + ':' + i
        const expanded = panelExpanded(key, !!item.open)
        atom({ isCollapsible: true, collapsibleKey: key, title: interp(item.question || ''), expanded, disabled: false }, container)
        if (expanded) atom({ isRichText: true, label: '', html: richHtmlOf('markdown', interp(item.answer || '')) }, container)
      })
      return
    }
    if (t === 'Tooltip') {
      // the wrapped component keeps its own view; the tooltip text opens in the shared popup
      // (hover.mjs) on hover/focus — on the button itself, or on an info marker next to it
      const text = interp(m.text || '')
      const wrapped = m.wrapped
      const wm = wrapped && wrapped.metadata
      if (wm && wm.type === 'Button') {
        atom({ isButtons: true, buttons: [{ ...buttonOf(wm), tooltip: text }] }, container)
        return
      }
      const inline = wm && (wm.type === 'Text' || wm.type === 'Badge' || wm.type === 'Icon' || wm.type === 'Anchor')
      if (inline) {
        const label = collectTexts(wrapped).map(interp).join(' ') || interp(wm.text || wm.icon || '')
        atom({ isTooltip: true, label, text }, container)
        return
      }
      if (wrapped) visit(wrapped, container)
      atom({ isTooltip: true, label: '', text, infoOnly: true }, container)
      return
    }
    if (t === 'ContextMenu') {
      if (m.wrapped) visit(m.wrapped, container)
      for (const child of kidsOf(node)) visit(child, container)
      atom(contextMenuAtomOf(m, interp), container)
      return
    }
    if (t === 'VirtualList') {
      // every item through the same visitor (a component), or as a line of text (plain data)
      const items = (m.page && m.page.content) || []
      for (const item of items) {
        if (item && typeof item === 'object' && (item.metadata || item.type)) visit(item.metadata ? item : { metadata: item }, container)
        else if (item && typeof item === 'object') {
          atom({ isPropertyRow: true, label: String(item.title || item.name || item.label || item.id || ''), value: Object.entries(item).filter(([k, v]) => v != null && typeof v !== 'object' && !/^(title|name|label|id)$/.test(k)).map(([k, v]) => k + ': ' + v).join(' · ') }, container)
        } else if (item != null) atom({ isText: true, text: String(item), cls: 'oj-typography-body-md' }, container)
      }
      return
    }
    if (t === 'Stepper') {
      // a numbered step per child (the wire record carries no fields of its own)
      kidsOf(node).forEach((child, i) => {
        const label = (child.metadata && (child.metadata.title || child.metadata.label)) || ''
        atom({ isStepHeader: true, number: String(i + 1), label: interp(label) }, container)
        visit(child, container)
      })
      return
    }
    if (t === 'FormEditor') {
      // the form the definition describes, painted with the form layout's real widgets (a preview)
      const def = formEditorFieldsOf(m)
      if (!def) { atom(unsupportedAtomOf('FormEditor', node.id), container); return }
      atom({ isText: true, isHeading: true, isH2: false, text: def.name, cls: 'oj-typography-subheading-xs' }, container)
      if (def.description) atom({ isText: true, text: def.description, cls: 'oj-typography-body-sm oj-text-color-secondary' }, container)
      const fields = def.fields.map((md) => layoutFieldOf(md, state, ctx.data, 2)).filter(Boolean)
      if (fields.length) atom({ isFormLayout: true, columns: 2, fields, readonly: false }, container)
      return
    }
    if (t === 'CarouselLayout') {
      // a carousel of arbitrary content (a gallery took the oj-film-strip branch above): one slide
      // at a time with its pager — the slide shown is client state (uiValueChanged)
      const slides = kidsOf(node)
      if (slides.length > 1) {
        const key = 'carousel:' + (node.id && node.id !== 'fieldId' ? node.id : 'carousel')
        const current = Math.max(0, Math.min(slides.length - 1, Number(uiValueOf(key, 0)) || 0))
        atom(carouselPagerAtomOf(key, current, slides.length, !!m.loop), container)
        visit(slides[current], container)
        return
      }
    }
    // a type nobody paints: a visible placeholder (like the web renderers), its children still render
    if (t && !VISITOR_PASS_THROUGH[t]) atom(unsupportedAtomOf(t, node.id), container)
    for (const child of kidsOf(node)) visit(child, container)
  }
  visit(ctx.tree, null)
  // a continuation nobody wrote into (the grid was the cut block's last child) is no block
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (continuations.has(blocks[i]) && !blocks[i].items.length) blocks.splice(i, 1)
  }
  // HOISTING of the nested island: a block whose content is the island (card "Documento")
  // becomes an isNestedBlock block — the markup paints it at BLOCK level because
  // at greater depth VB's CSP evaluator stops resolving the template's bindings
  const hoisted = blocks.map((block) => (
    block.items.some((a) => a.isNested)
      ? { ...block, isNestedBlock: true, items: block.items.filter((a) => !a.isNested) }
      : block
  ))
  const hasDisplay = hoisted.some((b) => b.items.some((a) => !a.isButtons) || b.isNestedBlock)
  // Only buttons: the generic form paints them under its fields — but a tree with NO field has no
  // generic form, and its buttons (a page that is a lone call to action, a tooltip on a button)
  // were painted by nobody. Then they are the content.
  const onlyButtons = !hasDisplay && hoisted.some((b) => b.items.some((a) => a.isButtons)) && !hasFormField(ctx.tree)
  return hasDisplay || onlyButtons ? hoisted : null
}

/** Does the surface hold any FormField (without crossing into an island)? */
function hasFormField(node, isRoot = true) {
  if (!node || typeof node !== 'object') return false
  if (!isRoot && node.type === 'ServerSide') return false
  if (node.metadata && node.metadata.type === 'FormField') return true
  for (const v of Object.values(node)) {
    if (Array.isArray(v) ? v.some((x) => hasFormField(x, false)) : (v && typeof v === 'object' && hasFormField(v, false))) return true
  }
  return false
}

/** Does the screen's content serve as the page body? (if not, the generic form paints it)
 *
 *  Yes when it brings something RICH (isRichAtom, a tab strip, a table, a web component, a
 *  @Subresource listing): its fields are already visible there. And yes when the generic form has NOTHING
 *  to paint: a read-only page arrives as loose texts — its @ReadOnly fields are
 *  Text on the wire, not FormFields — and without this rule it came out empty (CustomerHistory). */
/**
 * The rich host blocks plus the form's own action row (the page's @Button / footer buttons) that
 * the generic form would have drawn. When the blocks win (a form with a grid field, a capture
 * field…), noGenericFormVars clears that row — and the page lost its buttons: a form with an
 * editable grid had no way to submit. Actions a block already draws are not repeated, and the
 * buttons of a @Tab belong to that tab (`tree`: the page's tree): the blocks hold the ACTIVE
 * tab only, and the other tabs' buttons were gathered into a row under it.
 */
export function withFormActions(blocks, actions, { tree } = {}) {
  if (!blocks || !blocks.length) return blocks
  const drawn = {}
  for (const block of blocks) {
    for (const atom of block.items || []) {
      if (atom && atom.isButtons) for (const b of atom.buttons || []) drawn[b.actionId] = true
    }
  }
  const inTabs = tabOnlyActionIdsOf(tree)
  const missing = (actions || []).filter((a) => a && a.actionId && !drawn[a.actionId] && !inTabs[a.actionId])
  if (!missing.length) return blocks
  const buttons = missing.map((a) => ({
    actionId: a.actionId,
    label: a.label || a.actionId,
    disabled: !!a.disabled,
    chroming: a.chroming || 'outlined',
    parameters: a.parameters || {},
    ...(a.route ? { route: a.route } : {}),
  }))
  return [...blocks, { isPlain: true, blockClass: 'oj-flex-item oj-sm-12', fromFormActions: true, items: [{ isButtons: true, fromFormActions: true, buttons }] }]
}

/** The action ids a tree draws ONLY inside a Tab (a @Tab's Button, a component of the tab with
 *  its buttons): they are shown with their tab, never in the form's action row. Same surface walk
 *  and same "is a button" test as collectActions. */
export function tabOnlyActionIdsOf(tree) {
  const inside = {}
  const outside = {}
  const walk = (n, isRoot, inTab) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach((x) => walk(x, false, inTab)); return }
    if (!isRoot && n.type === 'ServerSide') return // another surface
    const tab = inTab || !!(n.metadata && n.metadata.type === 'Tab')
    if (n.actionId && n.label && !n.fieldId) (tab ? inside : outside)[n.actionId] = true
    for (const [k, v] of Object.entries(n)) {
      if (k === 'switcher' && (n.type === 'Page' || n.type === 'Form')) continue
      if (k === 'fabs' && n.type === 'Form') continue
      if (v && typeof v === 'object') walk(v, false, tab)
    }
  }
  walk(tree, true, false)
  for (const id of Object.keys(outside)) delete inside[id]
  return inside
}

/** The form's action row of some blocks (withFormActions), to carry over when the blocks are
 *  re-projected without it (a tab switch): the row does not depend on the active tab. */
export function withFormActionsRowOf(blocks, previous) {
  const row = (previous || []).find((block) => block && block.fromFormActions)
  if (!row || (blocks || []).some((block) => block && block.fromFormActions)) return blocks
  // a plain copy: `previous` is the VB variable (proxies)
  return [...(blocks || []), JSON.parse(JSON.stringify(row))]
}

/**
 * A Meter (consumption vs a limit) → its atom, with the web renderer's contract (mateu-meter): the
 * value with its unit after a space (`98 %`; money as money against its limit; no unit, `value / max`),
 * the caption or else the fill percent, and the fill's tone past the optional thresholds — warning at
 * `warnAt`, error at `dangerAt`, success below them (both were ignored, and so was the unit).
 */
export function meterAtomOf(m, interp = (x) => x, money = (v) => String(v)) {
  const value = Number(m.value) || 0
  const max = Number(m.max) || 100
  const percent = Math.round(Math.min(Math.max(max > 0 ? value / max : 0, 0), 1) * 100)
  const num = (v) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(v) || 0)
  const unit = m.unit || ''
  const valueText = unit === '€' ? money(m.value, '€') + ' / ' + money(m.max, '€')
    : unit ? num(value) + ' ' + unit : String(m.value == null ? '' : m.value) + ' / ' + String(max)
  const thresholds = m.warnAt != null || m.dangerAt != null
  const tone = m.dangerAt != null && value >= m.dangerAt ? 'error'
    : m.warnAt != null && value >= m.warnAt ? 'warning' : 'success'
  return {
    isMeter: true,
    label: m.label || '',
    value,
    max,
    valueText,
    caption: m.caption ? interp(m.caption) : percent + ' %',
    // with thresholds the bar is drawn by hand (its fill takes the tone); without, JET's progress bar
    hasThresholds: thresholds,
    fillClass: 'mateu-meter-fill mateu-meter-' + tone,
    fillWidth: percent + '%',
  }
}

export function hostContentShown(blocks, summary) {
  if (!blocks || !blocks.length) return false
  // (fromHolder: what a component-holder field — a `Callable<Component>` — brought: the generic form
  // has no place for it, so the content, whose FormLayout atoms carry the fields, is the body)
  // (fromSurface: what a filled @Subresource / inline-island hole brought — withSubresources)
  const rich = (a) => isRichAtom(a) || !!(a && (a.isTabs || a.isGrid || a.isElement || a.isSubresource || a.fromHolder || a.fromSurface))
  if (blocks.some((block) => (block.items || []).some(rich))) return true
  // the page is laid out by a slot template (a form with its @Aside…) or in columns (@Zones): its
  // fields are painted in it
  if (blocks.some((block) => block.fromTemplate || block.fromColumns)) return true
  const s = summary || {}
  return !s.formMetadata && !(s.fields || []).length && !(s.sections || []).length && !s.text
}

// ── @Subresource: listings embedded in the content (P1) ───────────────────────────────────────
//
// A @Subresource field arrives as an INNER ServerSide (its island) with a mediator App whose
// homeRoute carries `_hideTitle=1` (and `_scope`, and `_lazy` if ON_OPEN): the server marks only
// sub-resources that way. It is loaded when it comes into view — the active tab —, with the state
// the parent seeds into it (initialData: the master's id) and its OnLoad search, and is painted as a
// table in its place in the content.

/** If the node is the boundary of a @Subresource, how to load it; otherwise null. */
export function subresourceIslandOf(node) {
  if (!node || typeof node !== 'object' || node.type !== 'ServerSide' || !node.id) return null
  const app = (node.children || [])[0]
  const md = app && app.metadata
  if (!md || md.type !== 'App' || md.variant !== 'MEDIATOR' || !md.homeRoute) return null
  const [path, query] = String(md.homeRoute).split('?')
  const params = {}
  for (const pair of String(query || '').split('&')) {
    if (!pair) continue
    const at = pair.indexOf('=')
    params[decodeURIComponent(at < 0 ? pair : pair.slice(0, at))] = at < 0 ? '' : decodeURIComponent(pair.slice(at + 1))
  }
  if (params._hideTitle !== '1') return null
  return {
    id: node.id,
    route: md.homeRoute,
    consumedRoute: md.homeConsumedRoute || path,
    serverSideType: md.homeServerSideType || node.serverSideType,
    // the route's mark also travels in the state (_scope: what the parent pins), as in Vaadin
    componentState: { ...params, ...(node.initialData || {}) },
    lazy: params._lazy === '1',
  }
}

/**
 * An INLINE island: a ServerSide inside the page that is neither the embedded mediator the island
 * dance loads in two steps (its first child is an App MEDIATOR — collectIslands) nor a @Subresource
 * (subresourceIslandOf), e.g. a form's component field holding a ComponentTreeSupplier (the events
 * lab's emitters and listener). It arrives WITH its tree, state (initialData), actions and
 * triggers, so nothing is loaded: its context is registered from the node (transport
 * registerInlineIsland) and it is painted in its hole like a @Subresource (withSubresources), its
 * actions tagged with its id (runMateuSurfaceAction). Returns the surface descriptor, or null.
 */
export function inlineIslandOf(node) {
  if (!node || typeof node !== 'object' || node.type !== 'ServerSide' || !node.id) return null
  if (subresourceIslandOf(node)) return null
  const first = (node.children || [])[0]
  const md = first && first.metadata
  if (md && md.type === 'App' && md.variant === 'MEDIATOR') return null
  return {
    id: node.id,
    inline: node,
    serverSideType: node.serverSideType || undefined,
    componentState: node.initialData && typeof node.initialData === 'object' ? { ...node.initialData } : {},
    surface: true,
    lazy: false,
  }
}

/** The @Subresource slots of the content that do not have their surface loaded yet. */
export function pendingSubresourcesOf(blocks, contexts) {
  const out = []
  for (const block of blocks || []) {
    for (const a of block.items || []) {
      if (a && a.isSubresource && !(contexts && contexts[a.islandId] && contexts[a.islandId].tree)) out.push(a.subresource)
    }
  }
  return out
}

/** The content with each loaded @Subresource slot turned into its table (or, if it is not a
 *  listing, into its content). The ones not loaded yet stay as a slot (they paint nothing). */
export function withSubresources(blocks, contexts) {
  if (!blocks) return blocks
  return blocks.map((block) => ({
    ...block,
    items: (block.items || []).flatMap((a) => {
      if (!a || !a.isSubresource) return [a]
      const ctx = contexts && contexts[a.islandId]
      if (!ctx || !ctx.tree) return [a]
      const crud = findByType(ctx.tree, 'Crud')
      if (!crud) {
        const inner = islandContentOf(ctx)
        // marked as the surface's: the generic form cannot draw them (hostContentShown reads the
        // FILLED blocks — once the hole is gone, nothing else said the content had another surface in it)
        const items = inner ? inner.flatMap((b) => b.items).map((item) => (item && typeof item === 'object' ? { ...item, fromSurface: true } : item)) : []
        // a MicroFrontend's / an inline island's surface: its actions go back to IT (dispatchHostBlockAction → surface)
        return a.subresource && a.subresource.surface ? tagSurfaceActions(items, a.islandId) : items
      }
      const md = crud.metadata || {}
      const wire = leafColumnsOf(md.columns)
        // the per-row actions have no place in the query-only table
        .filter((c) => c.dataType !== 'actionGroup' && !(c.id === '_select' && c.stereotype === 'button'))
      const page = (((ctx.data || {}).crud || {}).page) || {}
      const rows = labelCellRows(statusBadgeRows(page.content || [], wire), wire)
      return [{
        isGrid: true,
        isSubresourceGrid: true,
        fieldId: a.islandId,
        label: md.title || '',
        columns: wire.map((c) => (c.dataType === 'status'
          ? { headerText: c.label || c.id, field: c.id, template: 'cellStatusBadge' }
          : { headerText: c.label || c.id, field: labelColumn(c) ? c.id + LABEL_CELL_SUFFIX : c.id })),
        rows,
        adp: dataProviderFactory ? dataProviderFactory(rows) : null,
        isEmpty: rows.length === 0,
        total: page.totalElements == null ? rows.length : page.totalElements,
        rowEditable: false,
        addActionId: '',
        addLabel: '',
      }]
    }),
  }))
}

/** Merges the content of the NESTED island into the blocks of the parent island:
 *  the isNestedBlock block (the card that only contained the island) becomes a normal
 *  card whose items are the nested one's atoms, MARKED fromNested (its buttons
 *  too) so the dispatcher routes their actions to the nested context. Reason:
 *  reading $application.variables INSIDE a nested template does not re-bind the inner
 *  contexts in VB's CSP evaluator — the data must flow through $current. */
export function mergeNestedContent(islandBlocks, nestedBlocks) {
  if (!islandBlocks) return islandBlocks
  const nestedAtoms = (nestedBlocks || []).reduce((out, block) => out.concat(block.items), [])
    .map((a) => {
      const marked = { ...a, fromNested: true }
      if (a.buttons) marked.buttons = a.buttons.map((btn) => ({ ...btn, fromNested: true }))
      if (a.fields) marked.fields = a.fields.map((f) => ({ ...f, fromNested: true }))
      // an EntityHeader's fact actions dispatch like its buttons: to the nested context
      if (a.facts) marked.facts = a.facts.map((f) => (f.hasAction ? { ...f, fromNested: true } : f))
      return marked
    })
  return islandBlocks.map((block) => (
    block.isNestedBlock
      ? { ...block, isNestedBlock: false, isCard: true, isPlain: false, items: nestedAtoms }
      : block
  ))
}

/** Display content of the HOST (standalone detail pages: /encasa/:id, /checkout/:id,
 *  and the wizard steps /checkin/:id): the same blocks as an island, with the FIRST
 *  island of the host (e.g. the document) merged into its slot (fromNested atoms → dispatch
 *  to the island's context). In wizard mode the page title, the ProgressSteps
 *  and the back/next buttons are filtered out: the guided process already provides rail, title and Continue. */
/** Did the card carry a title? visit() puts it as the first text atom with the
 *  subheading class — which is exactly what tells a real card apart from the page frame. */
export function cardHasTitle(block) {
  const first = (block.items || [])[0]
  return !!(first && first.isText && String(first.cls || '').indexOf('oj-typography-subheading') >= 0)
}

/** The children of a slot-template grid ordered as the template's first row names their areas;
 *  the list as it came when any child carries no slot, or a slot the template does not name. */
export function kidsInAreaOrder(kids, areas) {
  const row = String(areas || '').split(/["'\n]/).map((r) => r.trim()).filter(Boolean)[0]
  if (!row) return kids
  const names = [...new Set(row.split(/\s+/))]
  const at = (k) => (k && k.slot ? names.indexOf(k.slot) : -1)
  if (!kids.length || kids.some((k) => at(k) < 0)) return kids
  return kids.map((k, i) => ({ k, i })).sort((a, b) => (at(a.k) - at(b.k)) || (a.i - b.i)).map((x) => x.k)
}

export function hostContentOf(ctx, islandBlocks, opts = {}) {
  const blocks = islandContentOf(ctx, opts)
  if (!blocks) return null
  let merged = mergeNestedContent(blocks, islandBlocks || null)
  const title = opts.title || ''
  let titleDropped = false
  let entityDropped = false
  // a wizard step's forward button (Next, or the completion on the last step) rides the guided
  // process footer (Continue): when the row also carries a Draftable's Save / Save and close, the
  // row stayed whole and the step showed Next AND Continue (Check in twice on the last step).
  // The row keeps Back and those side actions; the forward one leaves it.
  const isSide = (b) => b.actionId === 'back' || WIZARD_SIDE_ACTIONS[b.actionId]
  const withoutWizardNav = (atom) => (opts.forWizard && !opts.keepWizardNav && atom && atom.isButtons
    && (atom.buttons || []).some((b) => b.actionId === 'back' || b.actionId === 'next')
    && (atom.buttons || []).some((b) => b.actionId !== 'back' && WIZARD_SIDE_ACTIONS[b.actionId])
    ? { ...atom, wizardSideRow: true, buttons: atom.buttons.filter(isSide) }
    : atom)
  merged = merged
    .map((block) => ({
      ...block,
      items: block.items.map(withoutWizardNav).filter((atom) => {
        // the Page title is redundant: the header band (or the guided process) already paints it
        if (!titleDropped && atom.isText && title && atom.text === title) {
          titleDropped = true
          return false
        }
        // the Page TOOLBAR does not go into the content either: it is projected to the header's
        // actions (pageToolbarOf → primary/secondary of the band) — EXCEPT the one of the merged
        // ISLAND (fromNested, e.g. Cancel/Save of the document editor): that one
        // belongs to the island and is painted in its block
        if (atom.fromPageToolbar && !atom.fromNested) return false
        // and neither the EntityHeader when the screen header shows it (guest's title/
        // subtitle/facts in the band, instead of the generic title)
        if (opts.dropEntityHeader && atom.isEntityHeader && !entityDropped) {
          entityDropped = true
          return false
        }
        if (opts.forWizard) {
          if (atom.isProgress) return false
          // the RAIL's «2 | 3» counter (@WizardProgress(RAIL)): the guided process's oj-sp
          // already paints its own in its rail, one more in the content is a duplicate
          if (atom.isText && /^\d+ \| \d+$/.test(String(atom.text || '').trim())) return false
          if (!opts.keepWizardNav && atom.isButtons && atom.buttons.length
              && atom.buttons.every((b) => b.actionId === 'next' || b.actionId === 'back')) return false
          // the footer of the LAST step: Back + the completion action (@WizardCompletionAction) — the
          // guided process's footer already paints them (wizardForwardOf), here they came out duplicated
          if (!opts.keepWizardNav && atom.isButtons && !atom.wizardSideRow && atom.buttons.length === 2
              && atom.buttons.some((b) => b.actionId === 'back')
              && !atom.buttons.some((b) => b.actionId === 'next')) return false
        }
        return true
      }),
    }))
    .filter((block) => block.items.length)
    // the host loop paints the blocks inside an oj-flex: the column-blocks of a
    // zoned row carry their colClass; the rest take the whole row (oj-sm-12)
    .map((block) => ({ ...block, blockClass: block.colClass || 'oj-flex-item oj-sm-12' }))
  // A SINGLE UNTITLED card wrapping all the content is not a card: it is the page's
  // frame, and that one is already painted by the content container. Painting it also as an oj-panel leaves
  // a box inside another, which is how any screen with tabs or with a
  // table inside looked — whereas a normal record (the form branch) has none. With a
  // title it is a real card and is respected, same as when there are several.
  if (merged.length === 1 && merged[0].isCard && !cardHasTitle(merged[0])) {
    merged = [{ ...merged[0], isCard: false, isPlain: true }]
  }
  return merged.length ? merged : null
}

/** Wizard FORWARD action (Continue/Complete): derived from the real FOOTER of the tree — the
 *  button block that goes with 'back' (rich wizards also have page
 *  actions like selectPax that are NOT the forward; picking "first non-back action" failed). */
const WIZARD_SIDE_ACTIONS = { back: true, saveDraft: true, saveAndClose: true, skip: true }

export function wizardForwardOf(ctx) {
  const blocks = islandContentOf(ctx)
  if (!blocks) return null
  let forward = null
  for (const block of blocks) {
    for (const atomItem of block.items) {
      if (!atomItem.isButtons) continue
      const hasBack = atomItem.buttons.some((b) => b.actionId === 'back')
      // Next when the row has it; else the completion — never a Draftable's Save / Save and
      // close or Skip, which sit in the same row (Continue saved the draft instead of advancing)
      const candidate = atomItem.buttons.find((b) => b.actionId === 'next')
        || atomItem.buttons.find((b) => !WIZARD_SIDE_ACTIONS[b.actionId])
      if (candidate && (hasBack || candidate.actionId === 'next')) {
        forward = { actionId: candidate.actionId, label: candidate.label }
      }
    }
  }
  return forward
}

/**
 * A section card's body for oj-sp-section, which draws the section's title itself: its atoms
 * without the leading heading — or, when the heading shares a title row with the section's buttons
 * (@Section(editAction…), an @Inline type's @Toolbar), that row without its heading.
 * `title` (the section's, as drawn): only a heading that IS the title is dropped — a section whose
 * title is its Card's own (`title:`) does not repeat it in its body, so its first heading is CONTENT
 * (a `Text` with `container: h2` opening the section was taken for the title and lost).
 */
export function sectionBodyOf(items, title) {
  const list = items || []
  const first = list[0]
  const isTitle = (text) => title == null || String(text == null ? '' : text).trim() === String(title).trim()
  if (first && first.isHeading && isTitle(first.text)) return list.slice(1)
  if (first && first.isRow && (first.items || []).some((i) => i && i.rowHeading && isTitle(i.text))) {
    const rest = first.items.filter((i) => !(i && i.rowHeading && isTitle(i.text)))
    return rest.length ? [{ ...first, items: rest }].concat(list.slice(1)) : list.slice(1)
  }
  return list
}
