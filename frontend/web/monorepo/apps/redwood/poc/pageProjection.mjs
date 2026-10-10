import {
  wizardForwardOf, welcomeOf, welcomeKeyOf, welcomeLookOf, generalOverviewOf, itemOverviewOf, fieldListOf,
  formSectionsOf, actionsOf, islandContentOf, mergeNestedContent, entityHeaderOf, hostContentOf,
  primaryToolbarButton, backToolbarButton, pageSubtitleOf, pageKpisOf, pageStyleOf, findByType, ojIconOrGenericOf,
  pageSwitcherOf,
} from './reduceContexts.mjs'
import { parentCrumb } from './breadcrumbs.mjs'

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
  const on = !itemOverviewOn && !!(hostEntity && (hostBlocks || []).length === 2 && zoned.length === 2)
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
  const header = {
    // with an EntityHeader (a record's card) the band stays FIXED on scroll and compacts
    bandClass: hostEntity ? 'oj-bg-neutral-30 oj-sm-padding-10x-bottom mateu-sticky-header' : 'oj-bg-neutral-30 oj-sm-padding-10x-bottom',
    title: hostEntity ? hostEntity.title : (summary.title || ''),
    subtitle: hostEntity ? hostEntity.subtitle : pageSubtitleOf(host),
    // without an EntityHeader, the Page's @KPIs are its facts
    facts: switcher.fact ? [switcher.fact].concat(baseFacts || []) : baseFacts,
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
  const page = host && host.tree ? findByType(host.tree, 'Page') : null
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
