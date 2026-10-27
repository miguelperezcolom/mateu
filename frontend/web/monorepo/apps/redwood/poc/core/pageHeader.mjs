import { autoTrail } from '../breadcrumbs.mjs'
import { HOST_ID, actionsOf, dynFormMetadataOf, fieldListOf, formSectionsOf } from './tree.mjs'
import { interpolate } from './content.mjs'
import { findByType } from './listing.mjs'
import { evaluateTemplate } from '../rules.mjs'
import { ojIconOrGenericOf } from './shellNav.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the page header: entity header, KPIs, subtitle, toolbar, back/primary buttons, triggers.

/** The host's EntityHeader (e.g. the guest of the Reservation 360) projected onto the screen
 *  HEADER: title = the name, subtitle = subtitle + badges, facts (+metric) →
 *  contextualInfo of the oj-sp-header-general-overview. */
// Panels whose content belongs to ONE element of a collection (the detail of a console): an
// EntityHeader in there is the chosen one's record, not the PAGE entity — lifting it to the
// header emptied the detail panel and put the guest's name as the screen title.
export const PANE_TYPES = { MasterDetailLayout: true, SplitLayout: true }
// …nor what a page shows OVER itself (a docked or side drawer, a dialog): its own surface.
const OVERLAY_TYPES = { Drawer: true, Dialog: true }
/** The PAGE's EntityHeader: the one that HEADS the page — the first piece of content in it (outside
 *  a console's panels and its overlays). One that comes after other content (a collection's detail
 *  next to its list, a planning's task card under the chart) belongs to that part of the page and
 *  stays there: lifting the first EntityHeader found anywhere emptied that part and retitled the
 *  page with the selected item's name. */
export function pageEntityHeaderNode(tree) {
  const first = firstContentOutside(tree, { ...PANE_TYPES, ...OVERLAY_TYPES })
  return first && first.metadata.type === 'EntityHeader' ? first : null
}
/** The first node, in document order, that holds no other node (a field, a text, a chart, an
 *  EntityHeader…), without descending into the `stops` types. */
function firstContentOutside(tree, stops) {
  let found = null
  const walk = (n) => {
    if (found || !n || typeof n !== 'object') return
    const t = n.metadata && n.metadata.type
    if (t && stops[t]) return
    const inner = n.metadata && n.metadata.content
    const kids = (n.children || []).concat(Array.isArray(inner) ? inner : inner && typeof inner === 'object' ? [inner] : [])
    if (t && !kids.length) { found = n; return }
    kids.forEach(walk)
  }
  walk(tree)
  return found
}
/** findByType, but without entering a console's panels (MasterDetailLayout/SplitLayout): what
 *  is inside is a panel's content, not a piece of the PAGE (its header, its tail). */
export function findOutsidePanes(tree, type) {
  return findOutside(tree, type, PANE_TYPES)
}

/** findByType without descending into the `stops` types. */
export function findOutside(tree, type, stops) {
  let found = null
  const walk = (n) => {
    if (found || !n || typeof n !== 'object') return
    const t = n.metadata && n.metadata.type
    if (t === type) { found = n; return }
    if (t && stops[t]) return
    for (const c of n.children || []) walk(c)
    const inner = n.metadata && n.metadata.content
    if (Array.isArray(inner)) inner.forEach(walk)
    else if (inner && typeof inner === 'object') walk(inner)
  }
  walk(tree)
  return found
}

/** The icon of a fact's action button when the wire names none (the servers already default it). */
export const DEFAULT_FACT_ACTION_ICON = 'vaadin:pencil'

/**
 * A wire fact of an EntityHeader → its projection: `{label, value}`, and — when it names an action
 * (the pencil next to "EMPRESA") — the icon-only button drawn right after the value: `hasAction`,
 * `actionId` + `parameters` (dispatched exactly like a Button's), `actionLabel` (its accessible
 * name and tooltip: its own, else the fact's label) and `iconClass` (the Redwood icon font).
 */
export function factProjectionOf(fact, value) {
  const out = { label: fact.label, value }
  if (!fact.actionId) return out
  return Object.assign(out, {
    hasAction: true,
    actionId: fact.actionId,
    parameters: fact.parameters,
    actionLabel: (fact.actionLabel && String(fact.actionLabel).trim()) || fact.label || '',
    iconClass: ojIconOrGenericOf(fact.icon || DEFAULT_FACT_ACTION_ICON),
  })
}

/** What oj-sp's contextualInfo takes: only `{label, value}` per fact. */
export function contextualInfoOf(facts) {
  return (facts || []).map((f) => ({ label: f.label, value: f.value }))
}

/**
 * The actions of the facts an oj-sp header shows as contextualInfo — which has no room for a
 * button — as the JSON the header element carries in `data-mateu-fact-actions`: the DOM side
 * (displayDom.installFactActions) puts each button right after its value. '' = none.
 */
export function factActionsJsonOf(facts) {
  const actions = []
  ;(facts || []).forEach((f, index) => {
    if (f && f.hasAction) {
      actions.push({ index, actionId: f.actionId, parameters: f.parameters || null, label: f.actionLabel, iconClass: f.iconClass })
    }
  })
  return actions.length ? JSON.stringify(actions) : ''
}

export function entityHeaderOf(ctx) {
  const node = ctx && ctx.tree ? pageEntityHeaderNode(ctx.tree) : null
  if (!node) return null
  const m = node.metadata
  const state = ctx.state || {}
  const badgeText = (m.badges || []).map((b) => b.label).join(' · ')
  const facts = (m.facts || []).map((f) => factProjectionOf(f, interpolate(f.value, state)))
  if (m.metricLabel) facts.push({ label: m.metricLabel, value: interpolate(m.metricValue || '', state) })
  // Mateu's Chip colors → oj-sp badge status
  const BADGE_STATUS = { success: 'success', error: 'danger', warning: 'warning', contrast: 'neutral', normal: 'info' }
  return {
    title: interpolate(m.title, state),
    subtitle: interpolate(m.subtitle || '', state) + (badgeText ? ' · ' + badgeText : ''),
    // the subtitle WITHOUT the concatenated badges (for templates that paint the badge separately)
    subtitlePlain: interpolate(m.subtitle || '', state),
    badges: (m.badges || []).map((b) => ({ label: b.label, status: BADGE_STATUS[b.color] || 'neutral' })),
    facts,
  }
}

/**
 * The node that carries the page-header extras (kpis, subtitle, switcher, badges, banners, fabs…):
 * a reflected Java page's `Page`, else — a YAML page, whose header is authored on its `type: Form`
 * — the `Form`, which the server stamps with the SAME field names (FormDto). A tree with a Page is
 * read exactly as before. `fromForm` tells the callers to interpolate the `${state.x}` the YAML
 * author wrote (a reflected Page arrives resolved).
 */
export function pageHeaderNodeOf(tree) {
  if (!tree) return null
  const page = findByType(tree, 'Page')
  if (page) return page
  const form = findByType(tree, 'Form')
  return form ? Object.assign({}, form, { fromForm: true }) : null
}

/** The Page KPIs (@KPI: Page.metadata.kpis = [{title, text}]) → screen header facts
 *  ({label, value}), like the EntityHeader's: a reservation's totals at the top, next to
 *  the title, and not lost inside a panel. `text` may carry ${state.x}. */
export function pageKpisOf(ctx) {
  const page = ctx && ctx.tree ? pageHeaderNodeOf(ctx.tree) : null
  if (!page) return []
  const state = ctx.state || {}
  return ((page.metadata || {}).kpis || [])
    .filter((k) => k && (k.title || k.text))
    .map((k) => ({
      label: page.fromForm ? interpolate(k.title || '', state) : (k.title || ''),
      value: interpolate(k.text == null ? '' : String(k.text), state),
    }))
}

/** A header badge colour of the wire (Lumo chip themes, or a @Status tone) → the oj-sp badge status. */
export function badgeStatusOf(color) {
  const c = String(color == null ? '' : color).trim().toLowerCase()
  if (c === 'success') return 'success'
  if (c === 'error' || c === 'danger') return 'danger'
  if (c === 'warning') return 'warning'
  if (c === 'normal' || c === 'info' || c === 'primary') return 'info'
  return 'neutral'
}

/**
 * The Redwood header TEXT and NAVIGATION elements a page declares beside its title — the same wire
 * fields for a reflected Java page (PageDto) and a YAML `type: Form` (FormDto):
 *  - `overline`: the quiet line above the title (a category, the parent context);
 *  - `titlePlaceholder`: what stands in while the title is still EMPTY — a placeholder, never a
 *    default (the projection only uses it when the title is blank);
 *  - `timestamp`: the "last updated" text;
 *  - `badges`: the header chips ({label, status}); one whose label is blank or still an unresolved
 *    template is dropped, so a YAML `${state.status}` with no status hides its chip;
 *  - `peerNav`: lateral navigation across peer records — `prevRoute`/`nextRoute` (a null route
 *    disables that side; both null = no arrows), `${state.x}` resolved.
 * Every text may be a template — a YAML page's `${state.x}`, and a reflected page's badges too
 * (`@BadgeInHeader` travels as `${state.status}` / `${state.vip ? 'VIP' : ''}`) — resolved against
 * the page state with the CSP-safe evaluator of rules.mjs; one that stays unresolved is blank.
 */
/**
 * A header timestamp → what oj-sp's own timestamp element can take. That element only takes a DATE
 * (it writes its own "Last updated …" with a relative time, and a non-date value breaks its
 * binding), while the wire carries TEXT (`@Timestamp("Last updated")` = label + the field's value).
 * So: `iso` when the text is an ISO-8601 date-time with no label, or a "last updated"-like one —
 * oj-sp says the same thing, translated —; otherwise the text stays text (`iso` empty) and the page
 * draws it itself where oj-sp would.
 */
const ISO_IN_TEXT = /(\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?)/
const UPDATED_LABEL = /^(last\s+)?(updated|modified|saved|edited)|^(última\s+)?(actualizaci|modificaci)|^(actualizad|modificad|guardad)/i
export function headerTimestampOf(text) {
  const s = String(text == null ? '' : text).trim()
  const m = s.match(ISO_IN_TEXT)
  if (!m) return { iso: '', text: s }
  const label = s.replace(m[1], '').replace(/[\s:,.-]+$/, '').trim()
  const iso = m[1].replace(' ', 'T')
  if (Number.isNaN(Date.parse(iso))) return { iso: '', text: s }
  return label === '' || UPDATED_LABEL.test(label) ? { iso, text: '' } : { iso: '', text: s }
}

export function pageHeaderExtrasOf(ctx) {
  const page = ctx && ctx.tree ? pageHeaderNodeOf(ctx.tree) : null
  const md = (page && page.metadata) || {}
  const state = (ctx && ctx.state) || {}
  const scope = { state, data: (ctx && ctx.data) || {} }
  const text = (v) => {
    if (v == null) return ''
    let s = String(v)
    if (s.includes('${')) s = interpolate(s, state)
    if (s.includes('${')) {
      const value = evaluateTemplate(s, scope)
      s = value == null || value === false ? '' : String(value)
    }
    return s.includes('${') ? '' : s.trim()
  }
  const badges = (md.badges || [])
    .map((b) => ({ label: text(b && (b.text != null ? b.text : b.label)), status: badgeStatusOf(text(b && b.color)) }))
    .filter((b) => b.label)
  const pn = md.peerNav || null
  const prevRoute = pn ? text(pn.prevRoute) : ''
  const nextRoute = pn ? text(pn.nextRoute) : ''
  return {
    overline: text(md.overline),
    titlePlaceholder: text(md.titlePlaceholder),
    timestamp: text(md.timestamp),
    badges,
    peerNav: prevRoute || nextRoute
      ? { prevRoute, nextRoute, prevLabel: text(pn.prevLabel), nextLabel: text(pn.nextLabel) }
      : null,
  }
}

/** The Page subtitle (SubtitleSupplier/@Subtitle: e.g. a reservation's amounts) for
 *  the screen header when there is no EntityHeader. Interpolated like the title. */
export function pageSubtitleOf(ctx) {
  const page = ctx && ctx.tree ? pageHeaderNodeOf(ctx.tree) : null
  let subtitle = page && page.metadata ? page.metadata.subtitle : ''
  // a SmartSearchPage (all three backends) composes its intro line as a Text with this id: the
  // listing page shows only the table, so the line was lost — it is the page's subtitle
  if (!subtitle && ctx && ctx.tree) subtitle = textWithId(ctx.tree, 'page-subtitle')
  return subtitle ? interpolate(String(subtitle), ctx.state || {}) : ''
}

function textWithId(n, id) {
  if (!n || typeof n !== 'object') return ''
  if (n.id === id && n.metadata && n.metadata.type === 'Text') return n.metadata.text || ''
  for (const c of n.children || []) {
    const found = textWithId(c, id)
    if (found) return found
  }
  return ''
}

/** Native ITEM OVERVIEW (oj-sp-item-overview-page): entity page with two
 *  column blocks whose FIRST zone is the NARROW one — the template's RDS anatomy
 *  (key-data panel on the left + wide main on the right), as opposed to the general
 *  overview (wide main first + narrow info after). The host's EntityHeader becomes
 *  the oj-sp-item-overview of the overview slot (itemTitle/subtitle/badge +
 *  facts as key rows in the body); a "Volver…" toolbar button becomes the template's
 *  navigation header goToParent arrow and the rest go to secondaryActions. */
export function itemOverviewPageOf(entity, blocks, toolbar) {
  if (!entity) return null
  const zoned = (blocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
  if ((blocks || []).length !== 2 || zoned.length !== 2) return null
  const col = (b) => parseInt((b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '0', 10)
  if (col(zoned[0]) >= col(zoned[1])) return null // the wide one first → general overview
  const full = (b) => Object.assign({}, b, { blockClass: 'oj-flex-item oj-sm-12' })
  const back = (toolbar || []).find((b) => /^volver\b/i.test(b.label || ''))
  const badge = (entity.badges || [])[0] || null
  return {
    on: true,
    overview: {
      title: entity.title || '',
      subtitle: entity.subtitlePlain != null ? entity.subtitlePlain : (entity.subtitle || ''),
      badge: badge ? { text: badge.label, status: badge.status, style: 'subtle', position: 'trailing' } : null,
      facts: entity.facts || [],
      blocks: [full(zoned[0])],
    },
    main: { blocks: [full(zoned[1])] },
    back: { show: !!back, actionId: back ? back.actionId : '', label: back ? back.label : '' },
    secondary: (toolbar || []).filter((b) => b !== back)
      .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
  }
}

/**
 * The record/context SWITCHER of the page header (RecordSwitcherSupplier → Page.metadata.switcher;
 * the Redwood selectObject/selectContext element). oj-sp's header draws it natively: an
 * oj-sp-data-switcher (the title becomes the switcher for `object`; the context switcher sits beside
 * it for `context`), searchable through displayOptions.switcherSearch. Picking an entry dispatches
 * `actionId` with `{_record: value}`.
 *
 * Always an object (the VB bindings read its fields unconditionally): `on` false without one. The
 * options of the type that is NOT in use stay empty — an empty DataProvider is how oj-sp's header
 * knows not to draw that switcher. A DISABLED switcher draws no switcher at all (the data switcher
 * has no read-only mode): the current entry becomes a contextual fact, labelled with the hint.
 */
export const RECORD_SWITCHER_ACTION = '_switchRecord'
export const RECORD_SWITCHER_PARAMETER = '_record'
export const RECORD_SWITCHER_OPTIONS = '_switcher'
export function pageSwitcherOf(ctx) {
  const page = ctx && ctx.tree ? pageHeaderNodeOf(ctx.tree) : null
  const sw = page && page.metadata ? page.metadata.switcher : null
  const none = { on: false, type: 'object', value: null, label: '', searchable: false, disabled: false,
    actionId: RECORD_SWITCHER_ACTION, route: '', objectOptions: [], contextOptions: [], fact: null }
  if (!sw) return none
  const state = (ctx && ctx.state) || {}
  const interp = (t) => (page.fromForm ? interpolate(t, state) : String(t))
  // the declared options, else (a YAML `optionsSource`) the ones loadRestOptions fetched into
  // ctx.data._switcher — the same slot a select's REST options land in
  const loaded = ((ctx && ctx.data && ctx.data[RECORD_SWITCHER_OPTIONS]) || {}).content
  const declared = Array.isArray(sw.options) && sw.options.length ? sw.options
    : (sw.optionsSource && Array.isArray(loaded) ? loaded : [])
  if (!declared.length) return none
  const options = declared
    .filter((o) => o && o.value != null)
    .map((o) => ({ value: String(o.value), label: o.label == null ? String(o.value) : interp(o.label), description: o.description ? interp(o.description) : '' }))
  const type = sw.type === 'context' ? 'context' : 'object'
  const value = sw.value == null ? null : interp(sw.value)
  const current = options.find((o) => o.value === value)
  const disabled = !!sw.disabled
  return {
    on: true,
    type,
    value,
    label: sw.label ? interp(sw.label) : '',
    searchable: !!sw.searchable,
    disabled,
    actionId: sw.actionId || RECORD_SWITCHER_ACTION,
    // a YAML switcher may NAVIGATE instead (`route: customers/${state._record}`): resolved per pick
    // (the page's other ${state.x} resolved now, `${state._record}` kept for switcherPickOf)
    route: sw.route ? interpolate(sw.route, { ...state, [RECORD_SWITCHER_PARAMETER]: '${state.' + RECORD_SWITCHER_PARAMETER + '}' }) : '',
    objectOptions: !disabled && type === 'object' ? options : [],
    contextOptions: !disabled && type === 'context' ? options : [],
    fact: disabled && current ? { label: sw.label ? interp(sw.label) : '', value: current.label } : null,
  }
}

/** The action a pick of the header switcher runs, or null when nothing changed (the data switcher
 *  also writes back the value it was given, and an echo must not re-run the page). A switcher that
 *  declares a `route` (YAML) also carries `route`: that route with `${state._record}` = the picked
 *  value — the consumer navigates to it instead of dispatching the action. */
export function switcherPickOf(switcher, picked) {
  if (!switcher || !switcher.on || switcher.disabled || picked == null) return null
  const value = typeof picked === 'object' ? (picked.value != null ? picked.value : picked.key) : picked
  if (value == null || String(value) === String(switcher.value)) return null
  const pick = { actionId: switcher.actionId || RECORD_SWITCHER_ACTION, parameters: { [RECORD_SWITCHER_PARAMETER]: String(value) } }
  if (switcher.route) pick.route = interpolate(switcher.route, { [RECORD_SWITCHER_PARAMETER]: String(value) })
  return pick
}

/** The host Page's TOOLBAR (for the band header's actions):
 *  [{actionId, label, chroming}]. The primary-styled one goes to the header's primaryAction. */
export function pageToolbarOf(ctx) {
  if (!ctx || !ctx.tree) return []
  // a fluent/YAML `Form` carries its toolbar exactly like a reflected Page does
  const page = findByType(ctx.tree, 'Page') || findByType(ctx.tree, 'Form')
  if (!page) return []
  return (page.metadata.toolbar || [])
    // a ButtonGroup (a toolbar's dropdown: on the wire a Button with `children`, no action of its
    // own) brings its buttons — the header's actions list them
    .flatMap((b) => (b && !b.actionId && Array.isArray(b.children || b.buttons) ? (b.children || b.buttons) : [b]))
    .filter((b) => b && b.actionId)
    .map((b) => ({
      actionId: b.actionId,
      label: b.label || b.actionId,
      chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      disabled: !!b.disabled,
    }))
}

/**
 * Which of the toolbar buttons takes the header's PRIMARY action slot.
 *
 * `oj-sp-header-general-overview` gives ONE visible slot for the primary and paints the first
 * secondary as a button; the rest goes to the `···` overflow. With what the wire sends today —
 * no button marked `primary` in a crud's view — everything fell into secondaries and the real
 * action (Edit) ended up hidden behind the ellipsis.
 *
 * The wire rules when it says something (`buttonStyle: primary`). If it says nothing, the LAST
 * one that is not a back action is taken: in Mateu toolbars the order is "leave, …, advance" — Cancel→Save,
 * Back to list→Add another→Edit —, so the last non-back is the one you came to do.
 * Explicit heuristic, to be replaced the day the wire brings the button's role.
 */
export const BACK_ACTIONS = { back: true, 'back-to-list': true, close: true, cancel: true }
// `cancel` and the crud's `cancel-<mode>` (cancel-view, cancel-edit, cancel-new) are the way back;
// a domain action that STARTS with cancel is not: a reservation's «Cancel booking»
// (`cancelBooking`) ended up turned into the header's back link.
export const isBackButton = (button) => !!button && (
  BACK_ACTIONS[button.actionId] || /^cancel-/.test(String(button.actionId || '')))

/** The toolbar's BACK button, if any: in RDS that is not one more action, it is the
 *  header's `goToParent` affordance — putting it among the secondaries hides it in the
 *  overflow precisely when it is the most pressed. */
export function backToolbarButton(toolbar) {
  return (toolbar || []).find(isBackButton) || null
}

export function primaryToolbarButton(toolbar) {
  const buttons = toolbar || []
  const declared = buttons.find((b) => b.chroming === 'callToAction')
  if (declared) return declared
  for (let i = buttons.length - 1; i >= 0; i -= 1) {
    if (!isBackButton(buttons[i])) return buttons[i]
  }
  return null
}

/**
 * The toolbar button chosen by a SECONDARY ACTION of an oj-sp header (spSecondaryAction),
 * or null. The items we pass are { id: actionId, value: actionId, label }, and the header
 * returns the item by its id (e.g. 'walkIn') — or, depending on the variant, the whole object or its
 * label —, so it is resolved FIRST by actionId and only then by the label. Looking it up
 * only by label left a listing's secondaries dead: the id is never the label.
 */
export function secondaryActionOf(detail, toolbar) {
  const d = detail || {}
  const item = d.secondaryItem != null ? d.secondaryItem : (d.item != null ? d.item : d.value)
  const keys = []
  const add = (k) => { if (k != null && k !== '' && typeof k !== 'object') keys.push(String(k)) }
  if (item && typeof item === 'object') {
    add(item.id); add(item.value); add(item.actionId); add(item.key); add(item.label)
  } else {
    add(item)
  }
  add(d.id)
  if (!keys.length) return null
  const buttons = (toolbar || []).filter((b) => b && b.actionId)
  for (const k of keys) {
    const byId = buttons.find((b) => String(b.actionId) === k)
    if (byId) return byId
  }
  for (const k of keys) {
    const byLabel = buttons.find((b) => b.label === k)
    if (byLabel) return byLabel
  }
  return null
}

/** Dismiss the top overlay WITHOUT saving (✕/Esc/backdrop — emits no event at all). */
export function dismissOverlay(reg) {
  if (!reg.stack || !reg.stack.length) return reg
  const id = reg.stack[reg.stack.length - 1]
  const contexts = { ...reg.contexts }
  delete contexts[id]
  return { ...reg, contexts, stack: reg.stack.slice(0, -1) }
}

/** Actions subscribed to a bus event (@SubscribeTo): e.g. the listing refreshes with
 *  'search' when the drawer's CloseModal emits mateu-crud:saved-in-drawer. */
export function eventTriggersOf(ctx, eventName) {
  return ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .filter((t) => t.type === 'OnCustomEvent' && t.eventName === eventName && t.actionId)
    .map((t) => t.actionId)
}

/** What an answer asks to run after it, in order: its bus events (for the OnCustomEvent triggers
 *  subscribed to them) and its RunAction commands — the server's «run `search` now», with which a crud
 *  refreshes its listing after an action (UICommand.runAction / CrudActionResult.withActionToRun).
 *  The RunActions were collected and never run: the listing stayed as it was. */
export function followUpsOf(effects) {
  return [...((effects && effects.events) || []),
    ...((effects && effects.runActions) || []).filter((r) => r && r.actionId).map((r) => ({ runAction: r.actionId }))]
}

/** The actions one follow-up runs on `ctx`: the RunAction's own, or the triggers subscribed to the event. */
export function followUpActionsOf(ctx, followUp) {
  if (followUp && followUp.runAction) return [followUp.runAction]
  return eventTriggersOf(ctx, followUp && followUp.name)
}

/** The host's @AutoSave/AutoSaveTrigger trigger (search-as-you-type, autosave):
 *  {actionId, debounceMillis} or null. The renderer honors it by re-launching the action
 *  debounced on every keystroke (raw-value of the host's inputs). */
export function autoSaveOf(ctx) {
  const trigger = ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .find((t) => t.type === 'AutoSave' && t.actionId)
  return trigger
    ? { actionId: trigger.actionId, debounceMillis: trigger.debounceMillis || 400 }
    : null
}

/** HOST projection for the content surface (title, text, form, actions). */
/** The menu option of a route, at any depth. */
export function menuOptionAt(options, route) {
  for (const option of options || []) {
    if ((option.route || option.path) === route) return option
    const found = menuOptionAt(option.submenus || option.submenu, route)
    if (found) return found
  }
  return null
}

/** The title the host's Crud declares, if any. */
export function crudTitleOf(host) {
  const crud = host && host.tree ? findByType(host.tree, 'Crud') : null
  return crud && crud.metadata ? crud.metadata.title : ''
}

/** The form's action row minus the buttons its sections already draw (sectionButtonsOf). */
export function withoutSectionButtons(actions, sections) {
  const drawn = {}
  for (const sec of sections || []) {
    for (const b of (sec.titleButtons || []).concat(sec.footerButtons || [])) drawn[b.actionId] = true
    // the @Section affordances the oj-sp-section draws itself (add / edit / view more)
    for (const id of (sec.sectionActions && sec.sectionActions.drawn) || []) drawn[id] = true
  }
  return (actions || []).filter((a) => !drawn[a.actionId])
}

/**
 * Inside a nested app LEVEL (reducer.mjs appLevelOf: a record master whose tabs are pages) the
 * header names the MASTER — the record ("Customer 7") — and the tab's own title, when it declares
 * one, follows as the subtitle (`levelSubtitle`, read by pageHeaderOf). Before, the master's
 * title only showed while the tab had NO title of its own, so a tab with a @Title hid the record
 * it belongs to (Vaadin shows both: the master's heading over the tab bar, the tab's below).
 */
export function withinAppLevels(summary, levels) {
  const level = levels && levels.length ? levels[levels.length - 1] : null
  if (!level || !level.title) return summary
  const own = (summary && summary.title) || ''
  return { ...summary, title: level.title, levelSubtitle: own && own !== level.title ? own : '' }
}

export function summarizeHost(reg, route) {
  const host = reg.contexts[HOST_ID] || {}
  const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
  const menu = (reg.shell && reg.shell.menu) || []
  // at ANY depth: in a federated shell the screen being viewed hangs from the
  // pod's group, two levels below, and searching only the first left the title empty
  const option = menuOptionAt(menu, route)
  // a listing (pageType collection) also carries FormFields (columns) — it is NOT a form
  const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
  const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
  const state = host.state || {}
  const fields = formMetadata ? fieldListOf(host.tree, state, host.data) : []
  const sections = formMetadata ? formSectionsOf(host.tree, state, host.data) : []
  // a YAML page's title is a template (`title: ${state.name}`); a page declaring a
  // titlePlaceholder keeps an EMPTY title empty — the header shows the placeholder instead of
  // borrowing the crud's or the menu's label (pageHeaderOf)
  const declaredTitle = pageMetadata.title ? interpolate(String(pageMetadata.title), state).trim() : ''
  const placeholder = !declaredTitle && pageHeaderExtrasOf(host).titlePlaceholder
  return {
    // a listing's Page carries no title: it travels in the Crud metadata, and if it is not
    // there either, in the menu label
    // …and a COMPOSED page (a Dashboard, a SmartSearchPage…: no Page, no Crud title) names itself
    // only through its window title: without it the header read «…»
    // …and a COMPOSED page names itself only through its window title (@Title): that one is the
    // page's own, so it goes BEFORE the menu's label (the menu says where it is, not what it is)
    title: placeholder ? '' : (declaredTitle || crudTitleOf(host) || host.windowTitle
      || (option && (option.caption || option.label))
      || (reg.effects && typeof reg.effects.docTitle === 'string' ? reg.effects.docTitle : '') || ''),
    // the automatic trail (breadcrumbs.mjs): the header takes its «go to parent» from it. Turned off with
    // @NoBreadcrumbs on the page or on the shell
    trail: pageMetadata.noBreadcrumbs || (reg.shell && reg.shell.noBreadcrumbs)
      ? []
      : autoTrail(menu, route, { title: declaredTitle || crudTitleOf(host) }),
    text: formMetadata ? '' : String(state.message == null ? '' : state.message),
    formMetadata,
    fields,
    sections,
    formValue: formMetadata ? { ...state } : null,
    // the buttons a section draws itself (title row / under its content) leave the form's row
    actions: host.tree ? withoutSectionButtons(actionsOf(host.tree), sections) : [],
  }
}
