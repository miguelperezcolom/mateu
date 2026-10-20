import {
  wizardForwardOf, welcomeOf, welcomeKeyOf, welcomeLookOf, generalOverviewOf, itemOverviewOf, fieldListOf,
  formSectionsOf, actionsOf, islandContentOf, mergeNestedContent, entityHeaderOf, hostContentOf,
  primaryToolbarButton, backToolbarButton, pageSubtitleOf, pageKpisOf, pageStyleOf, findByType, ojIconOrGenericOf,
  pageSwitcherOf, pageHeaderNodeOf, pageHeaderExtrasOf, headerTimestampOf, contextualInfoOf, factActionsJsonOf,
  drawerOverlayOf, dialogOverlayOf,
} from './reduceContexts.mjs'
import { parentCrumb } from './breadcrumbs.mjs'
import { chromeText } from './i18n.mjs'

// THE PAGE PROJECTION — what the two big page chains (shell onMateuNavigate: a navigation;
// content runMateuAction: an action's answer) assign to the VB variables once the registry is
// reduced. Both chains used to carry their own inline copy of it (~300 lines each, already
// drifting apart); the pure parts live here now, tested in Node, and the chains are thin adapters
// that do the I/O (loads, component refreshes, toasts) and assign what these return. Every function
// takes plain values and returns the values to assign — no VB, no DOM.

/** The generic form steps aside (an archetype, rich content or the not-found page paints the body). */
export const noGenericFormVars = () => ({ mateuFormMetadata: null, mateuFormFieldsList: [], mateuFormSections: [], mateuFormActions: [] })

/** The collection header of a listing: its toolbar's first button is the primary action, the
 *  rest its secondary actions. */
/** What an empty overlay variable looks like (the templates read its fields unconditionally). */
export const EMPTY_OVERLAY = { title: '', fields: [], sections: [], actions: [], blocks: [], texts: [], state: {} }

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

export function listHeaderVarsOf(listingSummary) {
  const toolbar = listingSummary ? listingSummary.toolbar : []
  const primaryToolbar = toolbar.length ? toolbar[0] : null
  // a DISABLED button (CrudDisplay New/Delete: Toggle.disabled) is shown but inert: oj-sp's
  // display 'disabled'
  return {
    mateuListPrimary: primaryToolbar ? { label: primaryToolbar.label, ...(primaryToolbar.disabled ? { display: 'disabled' } : {}) } : { label: '', display: 'off' },
    mateuListPrimaryId: primaryToolbar ? primaryToolbar.actionId : '',
    mateuListSecondary: toolbar.slice(1).map((b) => ({ id: b.actionId, value: b.actionId, label: b.label, ...(b.disabled ? { display: 'disabled' } : {}) })),
  }
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
 * rotates when the welcome is ENTERED and is kept while one stays on it (`previousLook`: the look
 * on screen, or null when no welcome was shown).
 */
export function archetypeVarsOf(host, previousLook) {
  const welcome = welcomeOf(host)
  const overview = generalOverviewOf(host)
  const item = itemOverviewOf(host)
  const vars = {
    mateuWelcomeTrendItems: welcome && welcome.trend ? welcome.trend.items : [],
    mateuWelcome: welcome,
    mateuOverview: overview,
    mateuOverviewOptions: overview ? overview.switcherOptions : [],
    mateuItemOv: item,
    // the ATOMS of the first tab (not only its texts)
    mateuItemTabTexts: item && item.tabs.length ? item.tabs[0].items : [],
  }
  if (welcome) {
    const look = welcomeLookOf(welcomeKeyOf(host), previousLook, Math.random, welcome.tone)
    vars.mateuWelcomeKey = look.key
    vars.mateuWelcomeTheme = look.theme
    vars.mateuWelcomeIlluBg = look.illuBg
    vars.mateuWelcomeIllu = look.illu
  }
  return { vars, welcome, overview, item }
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
  const noOtherBranch = !listing && !welcome && !overview && !item && !queue && !foldout
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
    showBand: showBand && !gopOn && !iopOn,
    showInline: showHeader && !showBand && !gopOn && !iopOn,
    showListBand,
    showListInline: !!listing && !showListBand,
    primary: primaryBtn ? { label: primaryBtn.label, display: primaryBtn.disabled ? 'disabled' : 'on' } : { label: '', display: 'off' },
    primaryId: primaryBtn ? primaryBtn.actionId : '',
    secondary: hostToolbar.filter((b) => b !== primaryBtn && b !== backBtn)
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
 * padding) and the header band's box. With the persistent navigator drawer (or the item overview
 * template) the page goes edge to edge. Pages whose header bleeds (welcome, overview, wizard,
 * listing, any VB header) have no padding: each branch brings its gutter. With a header BAND the
 * content overlaps it by 40px (the band peeks out from behind its start).
 */
export function pageWidthOf({ host, drawerNav, iopOn = false }) {
  return (drawerNav || iopOn) ? 'edgeToEdge' : ((host && host.pageWidth) || 'fixed')
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
  const edge = drawerNav || iopOn
  const pageStyle = edge ? pageStyleOf({ pageWidth: 'edgeToEdge' }) : pageStyleOf(host)
  const pw = pageWidthOf({ host, drawerNav, iopOn })
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
