import { collectTexts } from './tree.mjs'
import { BADGE_CLASSES, interpolate, islandContentOf, buttonRouteOf } from './content.mjs'
import { declaresTemplate, templateFormOf } from './overviews.mjs'
import { PANE_TYPES, findOutside, pageHeaderNodeOf } from './pageHeader.mjs'
import { STATUS_BADGE, findByType, findFirst } from './listing.mjs'
import { iconClassOf } from './display.mjs'
import { chromeText } from '../i18n.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): page archetypes projected from the tree: foldout, wizard.

/** What the foldout's panels read (mateuFoldoutContent): its overview, panels and header. */
export function foldoutContentOf(proj) {
  return proj
    ? { overview: proj.overview, panels: proj.panels, header: proj.header }
    : { overview: { blocks: [] }, panels: [], header: {} }
}

/** Same structure → the chain updates the content in place; otherwise it remounts the foldout.
 *  The number of panels and the orientation (the overview a column / the top band) are structure. */
export function sameFoldoutStructure(before, now) {
  return !!(before && now
    && (before.panels || []).length === (now.panels || []).length
    && before.orientation === now.orientation)
}

/** FOLDOUT projection (Phase 7): overview + panels with their headers (metadata.panels)
 *  and their slotted content (overview / panel-N). null if the context is not a foldout.
 *  Each slot also projects its RICH blocks (same pipeline as the host: StatusList
 *  cards, buttons, inputs, notices…) — the markup paints blocks and keeps texts only
 *  as the legacy form for tests/fixtures. */
export function foldoutOf(ctx) {
  // the PAGE foldout: one placed in a tab (or in a console panel) is content of that
  // tab — visit() paints it there, with its collapsible panels — and does not take over the screen
  const node = ctx && ctx.tree ? findOutside(ctx.tree, 'FoldoutLayout', { ...PANE_TYPES, TabLayout: true }) : null
  if (!node) return null
  const md = node.metadata
  const children = node.children || []
  const bySlot = {}
  for (const child of children) bySlot[child.slot || ''] = child
  const blocksOf = (slotNode) => {
    const blocks = slotNode
      ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {}, data: (ctx && ctx.data) || {}, outbound: ctx && ctx.outbound })
      : null
    // same visual contract as hostContentOf: column blocks with their colClass,
    // the rest full-row
    return (blocks || []).map((block) => ({
      ...block,
      blockClass: block.colClass || 'oj-flex-item oj-sm-12',
    }))
  }
  // The PAGE badges (the header @Status: «Confirmed») head the overview:
  // the web paints them next to the title, and the VB header has no room for them. Same
  // JET badge classes as the @Status cells; an unresolved template is not painted.
  const page = ctx && ctx.tree ? pageHeaderNodeOf(ctx.tree) : null
  const state = (ctx && ctx.state) || {}
  const pageBadges = ((page && page.metadata && page.metadata.badges) || [])
    .map((b) => {
      const label = interpolate(b.text || '', state)
      const color = interpolate(b.color || '', state)
      return {
        isBadge: true,
        label,
        badgeClass: STATUS_BADGE[color] || BADGE_CLASSES[String(color).toLowerCase()] || STATUS_BADGE.NONE,
        blockClass: 'oj-flex-item oj-sm-12',
      }
    })
    .filter((b) => b.label && b.label.trim() && !b.label.includes('${'))
    // …and the foldout's own badges (FoldoutLayout.badges: a List<Badge> field of the Foldout,
    // sent as their texts) — neutral, the wire carries no colour for them
    .concat((md.badges || []).map((b) => (b && typeof b === 'object' ? b.text || b.label : b))
      .filter((t) => t != null && String(t).trim())
      .map((t) => ({ isBadge: true, label: String(t), badgeClass: STATUS_BADGE.NONE, blockClass: 'oj-flex-item oj-sm-12' })))
  return {
    headerTitle: interpolate(String(md.headerTitle || ''), (ctx && ctx.state) || {}),
    // FoldoutLayout.orientation: 'vertical' (default) = the overview is the first column, left of
    // the panels; 'horizontal' = the overview runs across the top, the panels below it
    orientation: md.orientation === 'horizontal' ? 'horizontal' : 'vertical',
    overviewOnTop: md.orientation === 'horizontal',
    // the navigation header, the overview's Edit and the badges: what may change between two
    // records of the same foldout (re-bound in place, like the panels' content)
    header: declaresTemplate(ctx, 'FoldoutPage') ? foldoutPageHeaderOf(foldoutHeaderOf(md), templateFormOf(ctx), state) : foldoutHeaderOf(md),
    // a declared FoldoutPage owns the page header (Toolkit 26C: the layout's own header and the
    // overview panel carry the navigation and the actions — there is no page header above it)
    ownsHeader: declaresTemplate(ctx, 'FoldoutPage'),
    badges: pageBadges,
    overview: {
      texts: collectTexts(bySlot['overview']),
      // a PLAIN block that carries them as atoms: the overview template only paints isCard/isPlain
      // blocks and isBadge is an atom of their items — a standalone isBadge block was not shown
      blocks: (pageBadges.length
        ? [{ isPlain: true, isCard: false, blockClass: 'oj-flex-item oj-sm-12', items: pageBadges }]
        : []).concat(blocksOf(bySlot['overview'])),
    },
    panels: (md.panels || []).map((panel, i) => ({
      title: panel.title || '',
      subtitle: panel.subtitle || '',
      // composed panel title: "Operaciones · 1 de 7" — the counter lives in the
      // HEADER (read from the live content by index, refreshes without re-stamping)
      headerLabel: (panel.title || '') + (panel.subtitle ? ' · ' + panel.subtitle : ''),
      open: panel.open !== false,
      // EXPLICIT width from the wire (FoldoutPanel.width): the markup pins the panel to that
      // size — without it, the foldout's responsive engine distributes as it likes and the
      // cockpit cards overlap
      width: panel.width || '',
      // FoldoutPanel.icon ("user", "vaadin:user", an oj-ux class) as a Redwood icon class
      iconClass: foldoutIconClassOf(panel.icon),
      texts: collectTexts(bySlot['panel-' + i]),
      blocks: blocksOf(bySlot['panel-' + i]),
      // FoldoutPanel.summary (child slotted summary-N): oj-sp-foldout-panel's own `summary` slot,
      // the compact line under the panel title
      ...foldoutSummaryOf(bySlot['summary-' + i], (ctx && ctx.state) || {}),
    })),
  }
}

/** A foldout panel's icon → a Redwood icon class: a bare name is a Vaadin one ("user" →
 *  vaadin:user), as the web renderer reads it; '' without one. */
export function foldoutIconClassOf(icon) {
  const name = icon == null ? '' : String(icon).trim()
  if (!name) return ''
  return iconClassOf(name.indexOf(':') >= 0 || name.indexOf('oj-ux-') === 0 ? name : 'vaadin:' + name)
}

/**
 * The foldout's HEADER, in oj-sp-foldout-layout's own terms (its oj-sp-header-navigation):
 * FoldoutLayout.navigation → the go-to-parent link (labelled with parentLabel) and the
 * previous / next buttons, each carrying the action id it runs; overviewEditActionId → the overview
 * panel's header action (the pencil, oj-sp-foldout-panel secondaryActions). Ids absent → no control.
 */
export function foldoutHeaderOf(md) {
  const nav = (md && md.navigation) || {}
  const parentActionId = nav.parentActionId || ''
  const previousActionId = nav.previousActionId || ''
  const nextActionId = nav.nextActionId || ''
  const editActionId = (md && md.overviewEditActionId) || ''
  return {
    hasNavigation: !!(parentActionId || previousActionId || nextActionId),
    title: nav.title || '',
    goToParent: !!parentActionId,
    parentLabel: nav.parentLabel || chromeText('goBack'),
    parentActionId,
    // bidirectional: the layout draws both arrows (one disabled when its step is null)
    bidirectional: !!previousActionId,
    previousStep: previousActionId ? { id: previousActionId, label: chromeText('previousItem') } : null,
    nextStep: nextActionId ? { id: nextActionId, label: chromeText('nextItem') } : null,
    previousActionId,
    nextActionId,
    overviewActions: editActionId ? [{ id: editActionId, label: chromeText('edit'), icon: 'oj-ux-ico-edit', display: 'on' }] : [],
    // id → { actionId, route } of a control whose button NAVIGATES (a RouteLink): the listeners hand
    // it to dispatchHostBlockAction (ctaId/ctas), so a YAML page with no action behind it still works
    ctas: {},
  }
}

const FOLDOUT_BACK_IDS = /^(back|backToList|cancel-view|cancel)$/

/**
 * A declared FoldoutPage (YAML `template: FoldoutPage`): the FORM's toolbar becomes the layout's own
 * controls, as Toolkit 26C draws the template — its back button the go-to-parent link (labelled like
 * the button), every other button an action of the overview panel's header (the primary one, an
 * «Edit», as the pencil). A button with a route navigates there; one without runs its action id.
 */
export function foldoutPageHeaderOf(header, form, state = {}) {
  const toolbar = ((form && form.metadata && form.metadata.toolbar) || []).filter((b) => b && typeof b === 'object')
  const text = (t) => interpolate(String(t == null ? '' : t), state)
  const target = (b) => ({ actionId: b.actionId || '', route: b.route ? (buttonRouteOf(b.route, state) || '') : '' })
  const back = toolbar.find((b) => FOLDOUT_BACK_IDS.test(b.actionId || ''))
  const rest = toolbar.filter((b) => b !== back)
    .sort((a, b) => (b.buttonStyle === 'primary') - (a.buttonStyle === 'primary'))
  const ctas = { ...(header.ctas || {}) }
  const out = { ...header, ctas }
  if (back) {
    ctas.parent = target(back)
    Object.assign(out, { hasNavigation: true, goToParent: true, parentLabel: text(back.label) || chromeText('goBack'),
      parentActionId: back.actionId || 'parent' })
  }
  if (rest.length) {
    out.overviewActions = rest.map((b, i) => {
      const id = 'toolbar-' + i
      ctas[id] = target(b)
      const label = text(b.label)
      return { id, label, display: 'on', ...(i === 0 && b.buttonStyle === 'primary' && /^edit\b/i.test(label) ? { icon: 'oj-ux-ico-edit' } : {}) }
    })
  }
  return out
}

/** A foldout panel's summary (the `summary-N` child): `hasSummary` + its texts as one line. */
export function foldoutSummaryOf(slotNode, state = {}) {
  const parts = []
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    const m = n.metadata || {}
    // the short pieces a summary is made of: texts, and the label of a badge/chip
    if (m.type === 'Text' && m.text != null) parts.push(String(m.text))
    else if ((m.type === 'Badge' || m.type === 'Chip') && (m.label || m.text)) parts.push(String(m.label || m.text))
    else if (m.type === 'Notice' && m.text) parts.push(String(m.text))
    for (const c of n.children || []) walk(c)
    if (m.content) walk(m.content)
  }
  walk(slotNode)
  const text = parts.map((t) => interpolate(t, state).trim()).filter(Boolean).join(' · ')
  return { hasSummary: !!text, summary: text }
}

/** WIZARD projection (Phase 8): the wire's ProgressSteps → steps ({id,label} + currentStep
 *  by id). null if the page is not a wizard. On the result screen every step is
 *  'done' → currentStep = the last one.
 *
 *  ORIENTATION: decided by the wizard itself with @WizardProgress — RAIL sends a VERTICAL
 *  ProgressSteps (the side rail: the genuine oj-sp-guided-process, with its column of steps on
 *  the right); STEPS sends a HORIZONTAL one, and that is a train of steps ON TOP (horizontal:
 *  true → oj-train above the content, and on narrow screens the step list vertical, since a
 *  train of 4-5 labels does not fit on a phone). */
/** Whether some component of the tree advertises (or a button runs) the wizard's `next`. */
function advertisesNext(tree) {
  return !!findFirst(tree, (n) => (Array.isArray(n.actions) && n.actions.some((a) => a && a.id === 'next'))
    || (n.metadata && n.metadata.type === 'Button' && n.metadata.actionId === 'next'))
}

/** Id of the virtual step the guided process shows once the wizard has finished. */
export const WIZARD_DONE_STEP = '_completed'

export function wizardOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
  if (!node) return null
  // A ProgressSteps is also a plain DISPLAY component (an order tracker): a page with one is a
  // wizard only when something on it can step it — a Wizard always advertises `next`. Without
  // this every page showing progress steps got the guided-process chrome and lost its ProgressBar.
  if (!advertisesNext(ctx.tree)) return null
  const md = node.metadata
  const wire = md.steps || []
  const current = wire.find((s) => s.status === 'current')
  const currentId = current ? current.id : (wire.length ? wire[wire.length - 1].id : null)
  const currentIndex = Math.max(0, wire.findIndex((s) => s.id === currentId))
  const statusOf = (s, i) => s.status || (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming')
  // display:'on' MANDATORY: the rail marks every step without display='on' as oj-disabled. The
  // status is the TEMPLATE's (success | error | none), not Mateu's: a done step is
  // 'success' — the overview paints «Completado» at the foot of its column and the rail its mark
  const steps = wire.map((s, i) => ({
    id: s.id,
    label: s.title || s.id,
    title: s.title || s.id,
    display: 'on',
    status: statusOf(s, i) === 'done' ? 'success' : 'none',
  }))
  // RESULT: with every step done (the wire does not bring the result step, which is not a
  // step of the process) the guided process stayed on the last step — its title and its
  // Cancel/Done footer. A final step is added, done and current, titled like the wizard's result
  // step (the wire's resultTitle, its @Label; a translated «Completed» when an older server sends
  // none): the title names the outcome and the footer is hidden (completed → class
  // mateu-wizard-completed on the page, which also hides the template's «n | total» counter,
  // since that screen is no step of the process)
  const completed = wire.length > 0 && wire.every((s, i) => statusOf(s, i) === 'done')
  const resultTitle = md.resultTitle ? String(md.resultTitle) : chromeText('wizardCompleted')
  if (completed) {
    steps.push({ id: WIZARD_DONE_STEP, label: resultTitle, title: resultTitle, display: 'on', status: 'success' })
  }
  const currentStep = completed ? WIZARD_DONE_STEP : currentId
  // the process title (the wizard's h2) and its subtitle (@Subtitle): the guided process
  // overview paints them top-left, above the step columns
  const heading = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
    && n.metadata.container === 'h2' && !!n.metadata.text) : null
  const subtitleNode = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
    && /(^|\s)mateu-wizard-subtitle(\s|$)/.test(n.cssClasses || '')) : null
  return {
    title: heading ? String(heading.metadata.text) : '',
    subtitle: subtitleNode ? String(subtitleNode.metadata.text || '') : '',
    // Overview Start: the first step; with the wizard already started, «Reanudar» on its own
    resumeStepId: !completed && currentIndex > 0 && currentId ? currentId : '',
    steps,
    currentStep,
    completed,
    horizontal: !md.vertical,
    // the counter counts the steps of the PROCESS: the result screen is none of them
    currentIndex: completed ? wire.length - 1 : currentIndex,
    currentLabel: completed ? resultTitle : (steps.length ? steps[currentIndex].label : ''),
    total: wire.length,
    // the train (oj-train): done steps can be VISITED (go back), the remaining ones cannot —
    // you advance with the step's button, which validates
    trainSteps: wire.map((s, i) => {
      const status = statusOf(s, i)
      return {
        id: s.id,
        label: s.title || s.id,
        visited: status === 'done',
        disabled: status === 'upcoming',
      }
    }),
    // the same list, for the vertical variant (narrow screens): number or ✓ + label
    listSteps: wire.map((s, i) => {
      const status = statusOf(s, i)
      return {
        id: s.id,
        label: s.title || s.id,
        marker: status === 'done' ? '✓' : String(i + 1),
        cls: 'mateu-wizard-step mateu-wizard-step-' + status,
      }
    }),
  }
}
