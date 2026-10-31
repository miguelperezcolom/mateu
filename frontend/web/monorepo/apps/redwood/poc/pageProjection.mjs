import {
  wizardForwardOf, welcomeOf, welcomeKeyOf, welcomeLookOf, generalOverviewOf, itemOverviewOf, dashboardOf, todoListOf, fieldListOf,
  formSectionsOf, actionsOf, islandContentOf, mergeNestedContent, entityHeaderOf, hostContentOf,
  primaryToolbarButton, backToolbarButton, pageSubtitleOf, pageKpisOf, pageStyleOf, findByType, ojIconOrGenericOf,
  pageSwitcherOf, pageHeaderNodeOf, pageHeaderExtrasOf, headerTimestampOf, contextualInfoOf, factActionsJsonOf,
  drawerOverlayOf, dialogOverlayOf, dataManagementPageOf, collectionDetailPageOf, itemOverviewPageHeaderOf,
  templatedCollectionDetailOf, templatedMultimediaOf, templatedGuidedProcessOf, templatedHeroSearchOf, withFormActions,
} from './reduceContexts.mjs'
import { parentCrumb } from './breadcrumbs.mjs'
import { chromeText } from './i18n.mjs'
import { withoutOverlays } from './shellFlows.mjs'

// THE PAGE PROJECTION — what the two big page chains (shell onMateuNavigate: a navigation;
// content runMateuAction: an action's answer) assign to the VB variables once the registry is
// reduced. Both chains used to carry their own inline copy of it (~300 lines each, already
// drifting apart); the pure parts live here now, tested in Node, and the chains are thin adapters
// that do the I/O (loads, component refreshes, toasts) and assign what these return. Every function
// takes plain values and returns the values to assign — no VB, no DOM.

// ── assigning only what changed ──────────────────────────────────────────────────────────────
//
// The chains assign every page variable after every answer, and VB repaints whatever is assigned a new
// object — even with the same content. A status poll (the process page's `refresh`, every 2 s) re-stamped
// the whole page each round, ~700 DOM nodes, with nothing changed: it flickered and lost the scroll and
// the focus. The web renderer only re-renders what changed; here a value equal to the one there is not
// assigned at all.

const isPlain = (v) => {
  if (v === null || typeof v !== 'object') return false
  if (Array.isArray(v)) return true
  const proto = Object.getPrototypeOf(v)
  return proto === Object.prototype || proto === null
}

/** Whether `b`, a projected value, is the same data as `a`, what the variable holds: primitives by value,
 *  arrays and plain objects deeply; anything else (a data provider, a converter, a function) only if it is
 *  the same one. A key only `a` has, set to false (Spectra's header writes `disabled: false` into the
 *  actions it is given), or a key set to undefined, is no difference. */
export function sameProjectedValue(a, b) {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') return Number.isNaN(a) && Number.isNaN(b)
  if (!isPlain(a) || !isPlain(b)) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!sameProjectedValue(a[i], b[i])) return false
    return true
  }
  const has = Object.prototype.hasOwnProperty
  for (const k of Object.keys(a)) {
    if (has.call(b, k) ? !sameProjectedValue(a[k], b[k]) : (a[k] !== false && a[k] !== undefined)) return false
  }
  for (const k of Object.keys(b)) if (!has.call(a, k) && b[k] !== undefined) return false
  return true
}

/** `target` (the VB variables) for a projection: an assignment of a value equal to the one there
 *  is skipped, so nothing bound to it repaints. Reads go straight through. */
export function changedOnly(target) {
  return new Proxy(target, {
    set(t, key, value) {
      if (!sameProjectedValue(t[key], value)) t[key] = value
      return true
    },
  })
}

/** The projection of a whole page, assigned ONCE: the chain sets a variable more than once on its way (the
 *  form's sections from the summary, then none when rich blocks paint the body) and each pass repainted.
 *  `vars` keeps what is set and reads it back; `commit()` assigns to `target` what differs from it, and
 *  returns the names it assigned. */
export function stagedVariables(target) {
  const staged = new Map()
  const vars = new Proxy(target, {
    get: (t, key) => (staged.has(key) ? staged.get(key) : t[key]),
    set: (t, key, value) => { staged.set(key, value); return true },
  })
  const commit = () => {
    const assigned = new Set()
    for (const [key, value] of staged) {
      if (!sameProjectedValue(target[key], value)) { target[key] = value; assigned.add(key) }
    }
    staged.clear()
    return assigned
  }
  return { vars, commit }
}

/** The generic form steps aside (an archetype, rich content or the not-found page paints the body). */
export const noGenericFormVars = () => ({ mateuFormMetadata: null, mateuFormFieldsList: [], mateuFormSections: [], mateuFormActions: [] })

/** The collection header of a listing: its toolbar's first button is the primary action, the
 *  rest its secondary actions. */
/** What an empty overlay variable looks like (the templates read its fields unconditionally). */
export const EMPTY_OVERLAY = { title: '', fields: [], sections: [], actions: [], blocks: [], texts: [], state: {},
  // the drawer panel's Spectra template (tree.mjs spectraDrawerOf): none while nothing is open
  sp: { template: '', edge: 'end', modality: 'modal', autoDismiss: 'focus-loss', footerActions: [] } }

/**
 * The overlay variables after an increment: the DRAWER panel shows the top-most drawer of the stack
 * and the MODAL the dialog on top of it — two variables, so a Dialog opened over a Drawer leaves the
 * drawer where it is (it used to close, and nothing reopened it after the dialog's CloseModal).
 * `picker` (searchPickerOf): a @Searchable selector has its own dialog, and a listing shown INSIDE
 * the drawer (picker.inDrawer) keeps the drawer open.
 */
export function overlayVarsOf(reg, picker = null) {
  const drawer = drawerOverlayOf(reg)
  const dialog = dialogOverlayOf(reg)
  return {
    drawer: drawer || EMPTY_OVERLAY,
    dialog: dialog || EMPTY_OVERLAY,
    drawerOpen: !!drawer && !(picker && !picker.inDrawer),
    modal: !!dialog && !picker,
  }
}

/**
 * The application variables of a navigation that closes every open overlay (onMateuNavigate): the
 * registry without them, the drawer panel shut and both overlay projections empty.
 */
export function overlaysClosedVarsOf(reg) {
  const next = withoutOverlays(reg)
  const vars = overlayVarsOf(next, null)
  return { mateuRegistry: next, mateuDrawerOpen: false, mateuDrawer: vars.drawer, mateuDialog: vars.dialog }
}

export function listHeaderVarsOf(listingSummary, selection = null) {
  const toolbar = listingSummary ? listingSummary.toolbar : []
  const required = (listingSummary && listingSummary.selectionRequired) || []
  const primaryToolbar = toolbar.length ? toolbar[0] : null
  // a DISABLED button (CrudDisplay New/Delete: Toggle.disabled) is shown but inert: oj-sp's
  // display 'disabled'. An action that needs rows (Delete, a @ListToolbarButton…) is ALSO disabled
  // while nothing is checked — as Spectra's collection actions are — and comes on with the first
  // checked row (listSecondaryForSelection, from the selection chain)
  return {
    mateuListPrimary: primaryToolbar ? { label: primaryToolbar.label, ...(primaryToolbar.disabled ? { display: 'disabled' } : {}) } : { label: '', display: 'off' },
    mateuListPrimaryId: primaryToolbar ? primaryToolbar.actionId : '',
    // a primary that NAVIGATES (a RouteLink button): listPrimary goes there instead of running the id
    mateuListPrimaryRoute: primaryToolbar && primaryToolbar.route ? primaryToolbar.route : '',
    mateuListSecondary: listSecondaryForSelection(toolbar.slice(1).map((b) => ({
      id: b.actionId, value: b.actionId, label: b.label,
      ...(b.disabled ? { inert: true } : {}),
      ...((b.rowsSelectedRequired || required.indexOf(b.actionId) >= 0) ? { needsSelection: true } : {}),
    })), selection),
  }
}

/** Whether a listing selection (selectionOfKeySet) holds at least one row. */
export function hasSelectedRows(selection) {
  return !!selection && (selection.all || (selection.keys || []).length > 0)
}

/** The listing header's secondary actions with their `display` for a selection: an inert one is
 *  always disabled, one that needs rows is disabled until a row is checked. */
export function listSecondaryForSelection(items, selection) {
  const any = hasSelectedRows(selection)
  return (items || []).map((item) => {
    const { display, ...rest } = item
    return (item.inert || (item.needsSelection && !any)) ? { ...rest, display: 'disabled' } : rest
  })
}

/**
 * The guided process' footer: the forward button (the wizard's own, else the first action that is
 * not "back"), its primary label, and the step shown. A wizard's form actions are none (back = a
 * click on the rail, forward = Continue). `shownStep`: the navigation enters through the overview
 * (''), an action answer keeps the wizard's current step.
 */
export function wizardVarsOf(host, wizardProjection, summaryActions, { keepStep = false } = {}) {
  if (!wizardProjection) {
    return { mateuWizardForwardId: '', mateuWizardPrimary: { label: '', disabled: true }, mateuWizardShownStep: '' }
  }
  const forward = wizardForwardOf(host) || (summaryActions || []).find((a) => a.actionId !== 'back')
  return {
    mateuWizardForwardId: forward ? forward.actionId : '',
    mateuFormActions: [],
    // never null: the component reads primaryAction.label unconditionally
    mateuWizardPrimary: forward ? { label: forward.label, disabled: false } : { label: 'Done', disabled: true },
    mateuWizardShownStep: keepStep ? (wizardProjection.currentStep || '') : '',
  }
}

/**
 * The composed archetypes (welcome / general overview / item overview). The welcome hero's look
 * is the page's own (welcomeLookOf: its declared tone, else a stable hash of its identity), so it
 * is the same on every visit and while one stays on it.
 */
export function archetypeVarsOf(host) {
  const gp = templatedGuidedProcessOf(host)
  const welcome = welcomeOf(host)
  const overview = generalOverviewOf(host)
  const item = itemOverviewOf(host)
  // the Dashboard archetype → oj-sp-dashboard-landing-page (its own header, kpi slot, panels)
  const dashboard = welcome || overview || item ? null : dashboardOf(host)
  // the TodoList archetype → oj-sp-task-organizer-page (its header + the queue in its slot)
  const todo = welcome || overview || item || dashboard ? null : todoListOf(host)
  // Spectra page templates with slots (core/spPages.mjs): DataManagement / GanttPage →
  // oj-sp-data-management-page, CollectionDetail → oj-sp-collection-detail-page
  const dm = welcome || overview || item || dashboard || todo ? null : dataManagementPageOf(host)
  const cd = welcome || overview || item || dashboard || todo || dm ? null
    : (templatedCollectionDetailOf(host) || collectionDetailPageOf(host, { title: pageTitleOf(host) }))
  const vars = {
    mateuDashboard: dashboard,
    mateuTodo: todo,
    mateuDm: dm,
    mateuCd: cd,
    // the ItemOverview archetype on oj-sp-item-overview-page: its oj-sp-item-overview's title/badge
    mateuItemOvHeader: item ? itemOverviewPageHeaderOf(host, item) : null,
    mateuWelcomeTrendItems: welcome && welcome.trend ? welcome.trend.items : [],
    mateuWelcome: welcome,
    mateuOverview: overview,
    mateuOverviewOptions: overview ? overview.switcherOptions : [],
    mateuItemOv: item,
    // the Multimedia content page's banner (oj-sp-header-welcome-banner over the host content)
    mateuMmc: templatedMultimediaOf(host),
    // a YAML Hero search page (oj-sp-hero-search-page: its hero, the listing in its slots)
    mateuHs: templatedHeroSearchOf(host),
    // a YAML Guided process (oj-sp-guided-process) and its first step
    mateuGp: gp,
    mateuGpCurrent: gp && gp.steps.length ? gp.steps[0].id : '',
    // the ATOMS of the selected tab (not only its texts): the first, or the one marked open
    // (a template page whose main slot is not one tab bar: that slot's atoms)
    mateuItemTabTexts: item && item.tabs.length ? (item.tabs.find((t) => t.id === item.selectedTab) || item.tabs[0]).items : ((item && item.mainItems) || []),
  }
  if (welcome) {
    const look = welcomeLookOf(welcomeKeyOf(host), welcome.tone)
    vars.mateuWelcomeKey = look.key
    vars.mateuWelcomeTheme = look.theme
    vars.mateuWelcomeIlluBg = look.illuBg
    vars.mateuWelcomeIllu = look.illu
    vars.mateuWelcomeThemedImage = look.themedImage || 'none'
  }
  // spPage: a page template that brings its own header and owns the page (the chains suppress the VB
  // header and the generic form for it, like the dashboard/todo branches)
  return { vars, welcome, overview, item, dashboard, todo, dm, cd, spPage: !!(dm || cd || item) }
}

/** Whether a YAML page template paints the page header itself (a multimedia content page's banner,
 *  a guided process, a hero search): the VB header stands aside, as for the composed archetypes. */
export function templateOwnsHeader(archetypes) {
  const v = (archetypes && archetypes.vars) || {}
  return !!(v.mateuMmc || v.mateuGp || v.mateuHs)
}

/**
 * The host content to paint for a page, given its archetypes: none for a guided process (it paints
 * its steps itself), the bare blocks for a multimedia content page (its actions are the banner's calls
 * to action: no form action row), else the blocks with the form's action row (withFormActions).
 * Shared by onMateuNavigate and runMateuAction, so a re-render after an action paints the same.
 */
export function templateHostContentOf(archetypes, hostBlocks, actions, tree) {
  const v = (archetypes && archetypes.vars) || {}
  if (v.mateuGp) return []
  if (v.mateuMmc) return hostBlocks || []
  return withFormActions(hostBlocks, actions, { tree }) || []
}

/** The Page node's title ('' without one). */
function pageTitleOf(host) {
  const page = host && host.tree ? findByType(host.tree, 'Page') : null
  return (page && page.metadata && page.metadata.title) || ''
}

/** The island (an embedded mediator) projected: its fields, sections, actions and content; null
 *  without one. The nested island's atoms are MERGED into its content (they flow through
 *  $current — reading application variables in deep templates does not re-bind). */
export function islandVarsOf(islandCtx, nestedBlocks) {
  if (!islandCtx) return null
  const island = {
    fields: fieldListOf(islandCtx.tree, islandCtx.state, islandCtx.data),
    sections: formSectionsOf(islandCtx.tree, islandCtx.state, islandCtx.data),
    actions: actionsOf(islandCtx.tree),
    content: islandContentOf(islandCtx),
  }
  return nestedBlocks ? { ...island, content: mergeNestedContent(island.content, nestedBlocks) } : island
}
/** The nested island's own variable: its atoms flattened, or null. */
export function nestedVarOf(nestedBlocks) {
  return nestedBlocks ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) } : null
}

/**
 * Which branch paints the host's body: `hostBlocks` (the generic content, null when another
 * branch — a listing, an archetype, the queue, a foldout, a wizard — owns the page) and the
 * EntityHeader the screen header takes (kept on a foldout: the 360 keeps its guest in the band).
 */
export function hostContentPlanOf(host, { islandRawBlocks, title, activeTabs, wizard, listing, welcome, overview, item, queue, foldout }) {
  // the dashboard branch (oj-sp-dashboard-landing-page) owns the page like the other archetypes
  const dashboard = !wizard && !listing && !welcome && !overview && !item && !queue && !foldout ? dashboardOf(host) : null
  // …and so does the TodoList's task organizer
  const todo = !wizard && !listing && !welcome && !overview && !item && !queue && !foldout && !dashboard ? todoListOf(host) : null
  // …and the Spectra slot templates (data management / gantt page, collection detail)
  const spPage = !wizard && !listing && !welcome && !overview && !item && !queue && !foldout && !dashboard && !todo
    ? (dataManagementPageOf(host) || templatedCollectionDetailOf(host) || collectionDetailPageOf(host, { title: pageTitleOf(host) })) : null
  const noOtherBranch = !listing && !welcome && !overview && !item && !queue && !foldout && !dashboard && !todo && !spPage
  const hostEntity = (!wizard && (noOtherBranch || foldout)) ? entityHeaderOf(host) : null
  const opts = { title, dropEntityHeader: !!hostEntity }
  if (activeTabs !== undefined) opts.activeTabs = activeTabs
  const hostBlocks = (!wizard && noOtherBranch) ? hostContentOf(host, islandRawBlocks, opts) : null
  return { hostBlocks, hostEntity, noOtherBranch }
}

/** The native GENERAL OVERVIEW page: an entity page with TWO column blocks (the wide one first)
 *  → oj-sp-general-overview-page (main/info slots, integrated header). */
export function generalOverviewPageOf(hostEntity, hostBlocks, { itemOverviewOn = false } = {}) {
  const zoned = (hostBlocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
  // the NARROW zone first is the item overview's anatomy, not this one: its main slot would take
  // the narrow key-data column (the host content paints it in its own columns instead)
  const col = (b) => parseInt(((b.blockClass || '').match(/oj-md-(\d+)/) || [])[1] || '0', 10)
  const narrowFirst = zoned.length === 2 && col(zoned[0]) < col(zoned[1])
  const on = !itemOverviewOn && !narrowFirst && !!(hostEntity && (hostBlocks || []).length === 2 && zoned.length === 2)
  const fold = (block) => {
    const items = block.items || []
    const titled = items.length && items[0].isHeading && items[0].isH2
    return {
      title: titled ? items[0].text : '',
      blocks: [{ ...block, blockClass: 'oj-flex-item oj-sm-12', items: titled ? items.slice(1) : items }],
    }
  }
  return on
    ? { on: true, main: fold(zoned[0]), info: fold(zoned[1]) }
    : { on: false, main: { title: '', blocks: [] }, info: { title: '', blocks: [] } }
}

/**
 * The page HEADER (Redwood rule: a VB header always paints it, except the templates that bring
 * their own) and its toolbar: the primary action, the back affordance (goToParent — Redwood has no
 * breadcrumbs: a back button, else the automatic trail's parent), the secondary actions.
 */
export function pageHeaderOf({ host, hostEntity, summary, hostToolbar, showHeader, pageWidth, gopOn, iopOn = false, listing }) {
  const showBand = showHeader && pageWidth !== 'edgeToEdge'
  const showListBand = !!listing && pageWidth !== 'edgeToEdge'
  const primaryBtn = primaryToolbarButton(hostToolbar)
  const backBtn = backToolbarButton(hostToolbar)
  const parentCrumbNav = backBtn ? undefined : parentCrumb(summary.trail)
  const switcher = pageSwitcherOf(host)
  const baseFacts = hostEntity ? hostEntity.facts : pageKpisOf(host)
  const headerFacts = switcher.fact ? [switcher.fact].concat(baseFacts || []) : (baseFacts || [])
  const extras = pageHeaderExtrasOf(host)
  const declaredTitle = hostEntity ? hostEntity.title : (summary.title || '')
  // a titlePlaceholder stands in only while the title is EMPTY (and is dimmed: it must never read
  // as a real title — the mateu-title-placeholder class)
  const titleIsPlaceholder = !declaredTitle && !!extras.titlePlaceholder
  // oj-sp's header has ONE badge (Redwood's status badge beside the title): the first page badge
  // takes it, the rest follow the subtitle — the same way the EntityHeader's badges do
  const [firstBadge, ...moreBadges] = extras.badges
  // inside a nested app level the tab's own title follows the master's (withinAppLevels)
  const baseSubtitle = hostEntity ? hostEntity.subtitle : (pageSubtitleOf(host) || summary.levelSubtitle || '')
  const peer = extras.peerNav
  // oj-sp's timestamp element only takes a DATE (headerTimestampOf); a timestamp that is TEXT ends
  // the subtitle line instead — on the header's own row, scrolling and sticking with it
  const stamp = headerTimestampOf(extras.timestamp)
  const subtitle = [baseSubtitle].concat(moreBadges.map((b) => b.label), [stamp.text]).filter((t) => t).join(' · ')
  const header = {
    // with an EntityHeader (a record's card) the band stays FIXED on scroll and compacts
    bandClass: hostEntity ? 'oj-bg-neutral-30 oj-sm-padding-10x-bottom mateu-sticky-header' : 'oj-bg-neutral-30 oj-sm-padding-10x-bottom',
    title: titleIsPlaceholder ? extras.titlePlaceholder : declaredTitle,
    titleIsPlaceholder,
    // oj-sp-header-create-edit draws the placeholder itself (pageTitlePlaceholder): the real title
    // and the placeholder travel apart for it
    declaredTitle,
    titlePlaceholder: extras.titlePlaceholder || '',
    headerClass: titleIsPlaceholder ? 'mateu-title-placeholder' : '',
    subtitle,
    // the quiet line ABOVE the title (drawn by the page over the oj-sp header: it has no overline)
    overline: extras.overline,
    // "last updated": oj-sp's own timestamp element, only ever with a date (else '' — and the
    // text went to the subtitle)
    timestamp: stamp.iso,
    // oj-sp's status badge (null = none)
    badge: firstBadge ? { text: firstBadge.label, status: firstBadge.status } : null,
    // PEER navigation: oj-sp's lateral previous/next item actions. A side without a route is
    // disabled; without a peerNav both stay 'disabled' and the header draws no arrows
    previousItem: peer
      ? { label: peer.prevLabel || chromeText('previousItem'), display: peer.prevRoute ? 'on' : 'disabled' }
      : { label: '', display: 'disabled' },
    nextItem: peer
      ? { label: peer.nextLabel || chromeText('nextItem'), display: peer.nextRoute ? 'on' : 'disabled' }
      : { label: '', display: 'disabled' },
    prevRoute: peer ? peer.prevRoute : '',
    nextRoute: peer ? peer.nextRoute : '',
    // without an EntityHeader, the Page's @KPIs are its facts; oj-sp's contextualInfo takes only
    // {label, value} — a fact's action button rides beside it (factActions, put in by the DOM side)
    facts: contextualInfoOf(headerFacts),
    factActions: factActionsJsonOf(headerFacts),
    // the record/context switcher (pageSwitcherOf): select-object / select-context of the header
    switcher,
    // a CREATE / EDIT page (the toolbar's back affordance is a CANCEL, beside a primary action — a
    // crud's editor or creation form, any form that saves or cancels; not a record's VIEW, whose
    // `cancel-view` is the way back to the list): Spectra's transactional header,
    // oj-sp-header-create-edit — its own Cancel (spCancel → backId) and primary (spPrimaryAction →
    // primaryId) instead of general-overview's «‹ Cancel» link
    createEdit: !!backBtn && !!primaryBtn && /^cancel(-(edit|new|create))?$/.test(String(backBtn.actionId || '')),
    showBand: showBand && !gopOn && !iopOn,
    showInline: showHeader && !showBand && !gopOn && !iopOn,
    showListBand,
    showListInline: !!listing && !showListBand,
    primary: primaryBtn ? { label: primaryBtn.label, display: primaryBtn.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
    primaryId: primaryBtn ? primaryBtn.actionId : '',
    // a primary / back that NAVIGATES (RouteLink button): headerPrimary / headerGoToParent go there
    primaryRoute: primaryBtn && primaryBtn.route ? primaryBtn.route : '',
    backRoute: backBtn && backBtn.route ? backBtn.route : '',
    secondary: hostToolbar.filter((b) => b !== primaryBtn && b !== backBtn)
      .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label, ...(b.disabled ? { display: 'disabled' } : {}) })),
    // oj-sp-item-overview has no primary action of its own: its EDIT action (spEdit) is the page's
    // primary when that primary edits; any other primary joins its secondary actions
    itemEdit: primaryBtn && isEditButton(primaryBtn) ? (primaryBtn.disabled ? 'disabled' : 'on') : 'off',
    itemSecondary: hostToolbar.filter((b) => b !== backBtn && !(b === primaryBtn && isEditButton(b)))
      .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label, ...(b.disabled ? { display: 'disabled' } : {}) })),
    goToParent: !!backBtn || !!parentCrumbNav,
    backId: backBtn ? backBtn.actionId : (parentCrumbNav ? '__goToParent' : ''),
    parentRoute: !backBtn && parentCrumbNav ? parentCrumbNav.route : '',
    backLabel: backBtn ? backBtn.label : (parentCrumbNav ? parentCrumbNav.text : ''),
    toolbar: hostToolbar,
  }
  // the goToParent's label is "Parent page" by default; the back button names it
  const translations = backBtn ? { goToParent: backBtn.label } : (parentCrumbNav ? { goToParent: parentCrumbNav.text } : {})
  return { header, translations, showBand, showListBand }
}

/** A toolbar button that EDITS the record (its id, label or route says so). */
function isEditButton(b) {
  return /(^|[^a-z])edit/i.test([b.actionId, b.label, b.route].filter(Boolean).join(' '))
}

/** The page toolbar is painted ONCE: when the header paints it, the form's button row drops the
 *  same actions (both projections come from the same metadata.toolbar). */
export function formActionsBesideHeader(formActions, header, hostToolbar) {
  if (!((header.showBand || header.showInline) && hostToolbar.length)) return formActions
  const inHeader = {}
  for (const b of hostToolbar) inHeader[b.actionId] = true
  return (formActions || []).filter((a) => !inHeader[a.actionId])
}

/** Same for the form's action row the rich host content carries (withFormActions): the toolbar
 *  the header paints is not drawn again under the content. A row left empty is dropped. The SAME
 *  array comes back when there is nothing to drop (the chains then leave the variable alone).
 *  Only the row is rebuilt: every other block goes through as it came, because a grid's atom
 *  carries a live data provider (`adp`) that a JSON copy turns into a plain object — oj-table
 *  then throws «Invalid data type» and the table stays empty. The chains pass in the content
 *  they projected, not the VB variable's proxies. */
export function hostContentBesideHeader(blocks, header, hostToolbar) {
  if (!((header.showBand || header.showInline) && hostToolbar.length)) return blocks
  const inHeader = {}
  for (const b of hostToolbar) inHeader[b.actionId] = true
  const rowOf = (block) => block && block.fromFormActions
  const dropsSome = (blocks || []).some((block) => rowOf(block) && (block.items || [])
    .some((atom) => atom && atom.isButtons && (atom.buttons || []).some((b) => inHeader[b.actionId])))
  if (!dropsSome) return blocks
  const out = []
  for (const block of blocks) {
    if (!rowOf(block)) { out.push(block); continue }
    const items = (block.items || []).map((atom) => (atom && atom.isButtons
      ? { ...atom, buttons: (atom.buttons || []).filter((b) => !inHeader[b.actionId]) } : atom))
      .filter((atom) => !(atom && atom.isButtons && !atom.buttons.length))
    if (items.length) out.push({ ...block, items })
  }
  return out
}

/**
 * The page's width anatomy (RDS 1.6): the shell layout, the content box (max width, margins,
 * padding) and the header band's box. With the persistent navigator drawer the page goes edge to
 * edge. The item overview template keeps the page's width (Toolkit 26C: centred, ~96px margins at
 * ≥1536) — it only takes the content container's card surface away. Pages whose header bleeds (welcome, overview, wizard,
 * listing, any VB header) have no padding: each branch brings its gutter. With a header BAND the
 * content overlaps it by 40px (the band peeks out from behind its start).
 */
export function pageWidthOf({ host, drawerNav }) {
  return drawerNav ? 'edgeToEdge' : ((host && host.pageWidth) || 'fixed')
}
/** The marker the server stamps into a @Compact page's style (StyleConstants.COMPACT). */
export const COMPACT_STYLE_MARKER = '--mateu-compact:1'

/**
 * Whether the page asks for HIGH DENSITY (@Compact): its style carries the compact marker (a
 * page, a form, a crud's detail), or its listing says so (CrudlDto.compact — a @Compact crud or
 * listing). Nested islands are their own pages and are not looked into.
 */
export function pageDensityOf(host) {
  let compact = false
  const isCompactStyle = (style) => typeof style === 'string' && style.replace(/\s+/g, '').indexOf(COMPACT_STYLE_MARKER) >= 0
  const walk = (node, depth) => {
    if (compact || !node || typeof node !== 'object' || depth > 6) return
    const md = node.metadata || {}
    if (isCompactStyle(node.style) || isCompactStyle(md.style) || (md.type === 'Crud' && md.compact === true)) {
      compact = true
      return
    }
    for (const child of node.children || []) {
      if (child && child.type === 'ServerSide') continue
      walk(child, depth + 1)
    }
  }
  walk(host && host.tree, 0)
  if (!compact && host && isCompactStyle(host.style)) compact = true
  return compact ? 'compact' : 'standard'
}

export function pageLayoutOf({ host, drawerNav, iopOn = false, bleedingHeader, band }) {
  const pageStyle = drawerNav ? pageStyleOf({ pageWidth: 'edgeToEdge' }) : pageStyleOf(host)
  const pw = pageWidthOf({ host, drawerNav })
  const out = {
    mateuShellPageLayout: pw === 'fixed' ? 'fixedWidth' : pw,
    mateuPageMaxWidth: pageStyle.maxWidth,
    mateuPageMargin: pageStyle.margin,
    mateuPagePadding: bleedingHeader ? '0' : pageStyle.padding,
    mateuBandBoxMargin: '0 auto',
    // @Compact: the content container takes the Redwood high-density class (app.css maps it onto
    // Redwood's own tokens — the small control height, the 1x form-layout spacing); PRECOMPUTED,
    // the VB expression evaluator has no ternaries
    mateuPageDensityClass: pageDensityOf(host) === 'compact' ? 'mateu-density-compact' : '',
    // the item overview template OWNS the page: its header band and zones sit on the page itself, as
    // in Redwood's examples — the content container's card surface would frame it (app.css)
    mateuPageHostClass: iopOn ? 'mateu-iop-host' : '',
  }
  if (band) {
    out.mateuBandBoxMargin = pageStyle.margin
    const parts = (pageStyle.margin || '0').split(' ')
    parts[0] = '-40px'
    if (parts.length === 1) parts.push('auto')
    out.mateuPageMargin = parts.join(' ')
  }
  return { vars: out, pageWidth: pw }
}

/**
 * The floating action buttons on screen (@Fab): the page's (a method of the page class — its action
 * goes to the host) and the app's (a method of the @UI app — an app-level action), stacked above
 * the shell's own FAB. Primary-styled ones are the call to action.
 */
export function fabsOf(shell, host) {
  // a YAML page declares its FABs on its `type: Form` (FabDto, the same wire field)
  const page = host && host.tree ? pageHeaderNodeOf(host.tree) : null
  const row = (f, appLevel) => ({
    key: (appLevel ? 'app:' : 'page:') + (f.id || f.actionId),
    label: f.label || f.actionId || '',
    iconClass: ojIconOrGenericOf(f.icon) || 'oj-ux-ico-plus',
    actionId: f.actionId || '',
    parameters: {},
    appLevel,
    chroming: f.buttonStyle === 'primary' || !f.buttonStyle ? 'callToAction' : 'outlined',
  })
  return [
    ...((page && page.metadata && page.metadata.fabs) || []).filter((f) => f && f.actionId).map((f) => row(f, false)),
    ...((shell && shell.fabs) || []).filter((f) => f && f.actionId).map((f) => row(f, true)),
  ]
}
