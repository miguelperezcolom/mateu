// The drawer panel's Spectra templates, the DOM side (the projection is tree.mjs spectraDrawerOf).
//
// oj-sp-create-edit-drawer-template's contract for unsaved changes: the APP decides when they exist
// and sets `unsavedChanges`, the template shows Spectra's banner and answers Discard / Cancel. Its
// own buttons (Cancel, the arrows) reach the chains, which can hold them; but Esc and a click
// outside close the oj-drawer-popup itself, and its ojBeforeClose is cancelable only SYNCHRONOUSLY —
// a VB chain runs too late. installDrawerGuard listens in the capture phase, holds that close while
// the open create/edit drawer has unsaved edits and hands it to the page as a `mateuDrawerLeave`
// event (on-mateu-drawer-leave), which asks through the banner.

let drawerUnsaved = false

/** The chains say whether the open create/edit drawer has unsaved edits (false on open/close). */
export function noteDrawerUnsaved(flag) {
  drawerUnsaved = !!flag
}

export function isDrawerUnsaved() {
  return drawerUnsaved
}

const sameValue = (a, b) => {
  const blank = (v) => v === undefined || v === null || v === ''
  if (blank(a) && blank(b)) return true
  if (a === b) return true
  if (typeof a === 'object' || typeof b === 'object') {
    try { return JSON.stringify(a) === JSON.stringify(b) } catch (_) { return false }
  }
  return String(a) === String(b)
}

/** Does the drawer's draft (what was typed: fieldId → value) differ from the values it opened with? */
export function drawerHasUnsavedChanges(drawer, draft) {
  if (!drawer || !draft) return false
  const state = drawer.state || {}
  return Object.keys(draft).some((k) => !sameValue(draft[k], state[k]))
}

/** Holds the user's close (Esc, a click outside) of a create/edit drawer with unsaved edits. */
export function installDrawerGuard(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc || doc.__mateuDrawerGuard) return
  doc.__mateuDrawerGuard = true
  doc.addEventListener('ojBeforeClose', (event) => {
    const panel = event.target
    if (!panel || panel.id !== 'mateuDrawerPanel' || !drawerUnsaved) return
    event.preventDefault()
    // …and the page's own ojBeforeClose listener (mateuDrawerDismissed) must not hear it: it would
    // drop the overlay the popup is keeping open
    event.stopPropagation()
    panel.dispatchEvent(new CustomEvent('mateuDrawerLeave', { bubbles: false }))
  }, true)
}
