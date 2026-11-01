import {
  HOST_ID, overlayOf, withListingSelection, validationOf, formRefusalOf, listActionRequestOf, ROW_VALIDATING_VERBS,
  validateRow, rowEditorOf, overlayTransportOf, actionTransportOf,
} from './reduceContexts.mjs'
import { interpolate } from './core/content.mjs'

// WHAT AN ACTION SENDS, decided before anything leaves (runMateuAction used to decide it inline):
// the state it carries (the drawer's with its draft, or the host's with the form draft and the
// listing's selection), whether it may leave at all (rows required, required fields empty, a row
// editor with empty required fields), and to which ServerSide it goes (the list container, a form
// embedded in the overlay, the component that declares it, or the mediator). Pure — tested in Node.

/**
 * @param {object} reg     the registry before the action
 * @param {string} id      the action id
 * @param {object} inputs  { draft, drawerDraft, rowDraft, parameters, listing, listingRows,
 *                           listingSelection, formSections }
 * @returns {object} either a stop — { stop: 'selectionRequired' } | { stop: 'fieldErrors', missing }
 *   | { stop: 'rowErrors', rowErrors, rowEditor } — or what to send: { componentState, parameters,
 *   transportCtx, transportExtra, listReq, overlay, host }
 */
export function outboundActionOf(reg, id, inputs = {}) {
  const { draft = {}, drawerDraft = {}, rowDraft = {}, listing, listingRows, listingSelection, formSections } = inputs
  let parameters = inputs.parameters
  const host = reg.contexts[HOST_ID]
  const overlay = overlayOf(reg)
  let componentState = overlay
    ? Object.assign({}, overlay.state, drawerDraft)
    : Object.assign({}, host && host.state, draft)

  // a host action on a listing with selection carries the marked rows (crud_selected_items), as
  // in Vaadin; the drawer's do not (they act on ITS record)
  if (!overlay && listing && listing.rowsSelectionEnabled) {
    componentState = withListingSelection(componentState, listing, listingRows, listingSelection)
    if ((listing.selectionRequired || []).indexOf(id) >= 0 && !componentState.crud_selected_items.length) {
      return { stop: 'selectionRequired' }
    }
  }
  // validationRequired (a wizard's next, a form's save): empty required fields and the wire
  // validations that fail (a bound, a pattern) are marked on their field and the action does not
  // leave — what Vaadin does in the browser; the server checks again
  const validation = !overlay && validationOf(host, id)
  if (validation) {
    const refusal = formRefusalOf(formSections, host && host.state, draft,
      host && host.tree && host.tree.validations, validation.fields)
    if (refusal.missing.length) return fieldErrorsStop(refusal, false)
  }
  // ...and the same for a form that is a component of its own INSIDE the overlay (the crud's
  // create/edit drawer, an EmbeddedView): its create/save is declared validated by ITS ServerSide.
  // Its draft was sent unchecked — an empty required field reached the server, which refused it.
  const surface = overlay && overlaySurfaceOf(reg)
  const overlayValidation = surface && validationOf({ tree: surface }, id)
  if (overlayValidation) {
    const refusal = formRefusalOf(overlay.sections, overlay.state, drawerDraft, surface.validations,
      overlayValidation.fields)
    if (refusal.missing.length) return fieldErrorsStop(refusal, true)
  }
  // LIST ACTIONS (the "+" / Edit / Remove of a form's list and its modal editor's buttons) go to
  // the CONTAINER's ServerSide with ITS state, the dialog's row in parameters.initiatorState
  const listReq = !overlay && listActionRequestOf(reg, id, { hostDraft: draft, rowDraft, parameters: parameters || {} })
  let transportCtx = host
  if (listReq) {
    // Save / Create validate the row IN the dialog
    if (ROW_VALIDATING_VERBS[listReq.verb]) {
      const rowCtx = reg.contexts[listReq.fieldId + '-container']
      const rowErrors = validateRow(rowCtx, rowDraft)
      if (Object.keys(rowErrors).length) {
        return { stop: 'rowErrors', rowErrors, rowEditor: rowEditorOf(reg, { rowDraft, errors: rowErrors }) }
      }
    }
    componentState = listReq.componentState
    parameters = listReq.parameters
    transportCtx = listReq.ctx
  }
  // TO WHICH ServerSide: a form embedded in the overlay (an EmbeddedView) gets it with its state
  // and no route; the component of the host that declares it gets it; the rest go to the mediator
  let transportExtra = {}
  const overlayTransport = overlay && !listReq ? overlayTransportOf(reg, id) : null
  if (overlayTransport) {
    transportCtx = overlayTransport
    transportExtra = { route: '', consumedRoute: '' }
  } else if (!listReq && !overlay) {
    transportCtx = actionTransportOf(host, id)
  }
  return { componentState, parameters, transportCtx, transportExtra, listReq, overlay, host }
}

/** The stop of an action refused in the browser: the fields to mark, the messages the wire
 *  validations gave (the required ones take their JET text), and whether they are in the overlay. */
function fieldErrorsStop(refusal, inOverlay) {
  const stop = { stop: 'fieldErrors', missing: refusal.missing }
  if (Object.keys(refusal.messages).length) stop.messages = refusal.messages
  if (inOverlay) stop.inOverlay = true
  return stop
}

/** The ServerSide form of the top overlay (its `surface`), or null when it has none. */
function overlaySurfaceOf(reg) {
  const id = reg && reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
  const top = id && reg.contexts ? reg.contexts[id] : null
  return (top && top.surface) || null
}

/**
 * The fields the SERVER refused in the answer to an action (a data fragment carrying `errors`:
 * fieldId → messages — what a crud drawer's refused save sends for its form): → { missing,
 * messages, inOverlay } to mark exactly as a browser-side refusal, or null.
 */
export function refusedFieldsOf(increment, reg) {
  for (const fr of (increment && increment.fragments) || []) {
    const errors = fr && fr.data && fr.data.errors
    if (!errors || typeof errors !== 'object') continue
    const messages = {}
    for (const fieldId of Object.keys(errors)) {
      const list = Array.isArray(errors[fieldId]) ? errors[fieldId] : [errors[fieldId]]
      const text = list.filter((m) => m != null && String(m).trim()).map(String).join(' ')
      if (text && fieldId !== '_component') messages[fieldId] = text
    }
    if (!Object.keys(messages).length) continue
    const target = fr.targetComponentId
    const contexts = (reg && reg.contexts) || {}
    const inOverlay = ((reg && reg.stack) || []).some((ctxId) => {
      const ctx = contexts[ctxId]
      return ctx && (ctxId === target || (ctx.surface && ctx.surface.id === target) || (ctx.tree && ctx.tree.id === target))
    })
    return { missing: Object.keys(messages), messages, inOverlay }
  }
  return null
}

/**
 * Did the action's answer RE-RENDER the host (a new component with another id)? Then, as the web
 * does (applyFragment → triggerOnLoad), what just arrived asks for its OnLoad load — without it a
 * listing repainted by an action came back empty.
 */
export function hostReRendered(lastIncrement, hostBefore, hostNow) {
  return !!(lastIncrement && (lastIncrement.fragments || []).some((f) => f.component && f.action !== 'Add'))
    && !!(hostNow && hostNow.tree && hostBefore && hostBefore.tree && hostNow.tree.id !== hostBefore.tree.id)
}

/** Did an increment touch the host (any fragment that is not an overlay Add)? */
export const touchesHost = (inc) => ((inc && inc.fragments) || []).some((f) => f.action !== 'Add')

/** An answer that ONLY brings messages (a wizard refusing to leave its step) does not change the
 *  screen: re-projecting it would repaint the form with the server's state and lose what was typed. */
export function onlyMessagesAnswer({ hostRepainted, flipRoute, events, overlayBefore, overlayNow, lastIncrement }) {
  return !hostRepainted && !flipRoute && !(events || []).length && !overlayBefore && !overlayNow
    && !!lastIncrement && !(lastIncrement.fragments || []).length && !(lastIncrement.commands || []).length
}

/**
 * WHAT A CLICK ON A DISPLAY-BLOCK BUTTON DOES: a Button whose actionable is a RouteLink carries the
 * link's `route` (the server's ButtonMapper puts it there; the projection keeps it) and NAVIGATES
 * to it — there is nothing behind its actionId on the server (a YAML page has no view model), so
 * running it did nothing. Any other button runs its action. Pure — tested in Node.
 * @param {{ actionId?: string, parameters?: object, route?: string }} button
 * @returns {{ navigate: string } | { actionId: string, parameters: object }}
 */
/** The state a navigating button's route is read against: the screen's, with what is typed over it. */
export function routeStateOf(reg, draft) {
  const host = reg && reg.contexts && reg.contexts[HOST_ID]
  return { ...((host && host.state) || {}), ...(draft || {}) }
}

export function blockClickOf({ actionId, parameters, route, state } = {}) {
  // a RouteLink's route is a template over the screen's state (`missions/${state.id}/edit`): it went
  // out with the literal placeholder wherever the projection had not interpolated it already
  if (typeof route === 'string' && route.includes('${')) route = interpolate(route, state || {})
  if (typeof route === 'string' && route.trim() !== '') return { navigate: route.trim() }
  return { actionId: actionId || '', parameters: parameters || {} }
}
