import {
  HOST_ID, overlayOf, withListingSelection, validationOf, formErrorsOf, listActionRequestOf, ROW_VALIDATING_VERBS,
  validateRow, rowEditorOf, overlayTransportOf, actionTransportOf,
} from './reduceContexts.mjs'

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
  // validationRequired (a wizard's next, a form's save): empty required fields are marked on their
  // field and the action does not leave — what Vaadin does in the browser; the server checks again
  const validation = !overlay && validationOf(host, id)
  if (validation) {
    const missing = formErrorsOf(formSections, draft, validation.fields)
    if (missing.length) return { stop: 'fieldErrors', missing }
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
