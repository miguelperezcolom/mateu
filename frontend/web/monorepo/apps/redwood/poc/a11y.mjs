import { chromeText } from './i18n.mjs'
// Accessibility of the VB renderer — the part the oj-* components do NOT bring.
//
// Measured before writing anything (axe-core over the served app): the oj-sp-* composition
// comes out practically clean, just as happened with Vaadin, because those components bring their
// own accessibility. The real gaps are those of a SPA, which axe cannot evaluate:
// changing route does not change the page, so a screen reader has NOTHING to
// announce and focus stays where it was — usually on the menu link just
// clicked, forcing a tab through the whole shell to reach the requested content.
//
// It lives in poc/ (single source) so make-amd.mjs packages it into the bridge and the app
// uses it from the chains, like the rest of the core.

// ── live region ──────────────────────────────────────────────────────────────────────────

const REGION_STYLE = [
  'position:absolute', 'width:1px', 'height:1px', 'margin:-1px', 'padding:0',
  'overflow:hidden',
  // clip, NOT display:none or visibility:hidden: those two take the node out of the
  // accessibility tree, which is exactly the opposite of what is needed here.
  'clip:rect(0 0 0 0)', 'clip-path:inset(50%)', 'white-space:nowrap', 'border:0',
].join(';')

const regions = {}
/** The repeat each region is waiting to put back (see announce). */
const pendingRepeats = new Map()

function regionFor(politeness) {
  if (typeof document === 'undefined' || !document.body) return null
  const existing = regions[politeness]
  if (existing && existing.isConnected) return existing
  const region = document.createElement('div')
  region.setAttribute('aria-live', politeness)
  region.setAttribute('aria-atomic', 'true')
  region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
  region.setAttribute('data-mateu-live-region', politeness)
  region.style.cssText = REGION_STYLE
  document.body.appendChild(region)
  regions[politeness] = region
  return region
}

/**
 * Creates the regions in advance.
 *
 * It is not optional: a region created and filled in the same tick is often NOT announced,
 * because assistive technology watches mutations of regions it already knew.
 */
export function installAnnouncer() {
  if (typeof document === 'undefined') return
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', installAnnouncer, { once: true })
    return
  }
  regionFor('polite')
  regionFor('assertive')
}

/**
 * Says `message` to assistive technology. Paints nothing.
 *
 * `assertive` interrupts and is for what the user cannot miss (a save that
 * failed); `polite` waits for a pause and is for routine things (where they just landed). Using
 * assertive for everything makes the app unusable, so it is opt-in.
 */
export function announce(message, options = {}) {
  const text = (message == null ? '' : String(message)).trim()
  if (!text) return
  const region = regionFor(options.politeness || 'polite')
  if (!region) return
  // A repeat still waiting to be put back is outdated by whatever is said now: left running, it
  // wrote the OLD message over the new one 60 ms later (the newer message was never heard).
  clearTimeout(pendingRepeats.get(region))
  pendingRepeats.delete(region)
  if (region.textContent === text) {
    // Repeating the same message is a real case (two failed saves in a row) and a
    // region whose text does not change announces nothing: it is cleared and set again.
    region.textContent = ''
    pendingRepeats.set(region, setTimeout(() => {
      pendingRepeats.delete(region)
      region.textContent = text
    }, 60))
    return
  }
  region.textContent = text
}

// ── focus after navigating ────────────────────────────────────────────────────────────────────

/**
 * Moves focus to the freshly loaded content.
 *
 * It looks for the first heading of the content area; if there is none, the container itself, which
 * is given `tabindex="-1"` so it can receive focus programmatically without adding a
 * tab stop of its own.
 */
export function focusContent() {
  if (typeof document === 'undefined') return false
  const root = document.querySelector('#vbRouterContent') || document.querySelector('.oj-web-applayout-content-nopad')
  if (!root) return false

  // Candidates in order of preference. The heading has to carry TEXT: the shell paints
  // an empty <h1> until the title arrives, and an empty heading is not focusable (nor would it be
  // useful to announce it) — the attempt failed silently and focus stayed where it was.
  const headings = [...root.querySelectorAll('h1, h2, [role="heading"]')]
    .filter((h) => (h.textContent || '').trim().length > 0)
  const candidates = [...headings, root]

  for (const target of candidates) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    try { target.focus({ preventScroll: true }) } catch (e) { target.focus() }
    // Check that it TOOK: focus() on an element without a box does nothing and does not warn.
    if (document.activeElement === target || (document.activeElement && target.contains(document.activeElement))) {
      return true
    }
  }
  return false
}

let hasNavigated = false

/**
 * Announces arrival on a screen and leaves focus on it.
 *
 * Two deliberate limits, and both matter:
 *
 *  - Only on REAL navigations. A re-render must not touch focus: it would yank it from the
 *    user out of the field they are editing.
 *  - NEVER on the first load. There the document already starts at the top, and moving focus to the
 *    content leaves the skip link BEHIND the starting point: the user's first Tab
 *    no longer reaches it and the menu is reachable only by Shift+Tab. The
 *    title is announced anyway, which is what adds value on that first screen.
 */
export function announceNavigation(title) {
  announce(title)
  const active = typeof document === 'undefined' ? null : document.activeElement
  if (hasNavigated && !focusIsInChat(active) && !overlayIsOpen(typeof document === 'undefined' ? null : document)) focusContentSoon()
  hasNavigated = true
}

/**
 * Whether the focus is in the AI chat panel. A screen the assistant opened (its answer navigates)
 * must not take the focus from the chat: the person is still talking to it, and moving the focus to
 * the new screen's heading left them clicking back into the message box after every answer. The
 * title is still announced.
 */
export function focusIsInChat(activeElement) {
  return !!(activeElement && typeof activeElement.closest === 'function' && activeElement.closest('#mateuChatPanel'))
}

/**
 * Whether an overlay (a drawer, a dialog) is open — the context drawer, whose picker re-loads the
 * screen behind it. Moving the focus to the new content's heading took it OUT of the still-open
 * drawer: Escape no longer closed it, and a keyboard user was left behind a modal scrim. The title
 * is still announced.
 */
export function overlayIsOpen(doc) {
  if (!doc || typeof doc.querySelectorAll !== 'function') return false
  return Array.from(doc.querySelectorAll('oj-drawer-popup, oj-dialog')).some((el) => el.opened === true)
}

/**
 * Tries to move focus to the content over a few frames.
 *
 * VB updates bindings asynchronously: at the moment the navigation chain
 * finishes, the new content is NOT YET in the DOM. Focusing then lands on the old
 * content and is lost as soon as it is replaced — which is exactly what was happening. It retries
 * until it takes, or gives up: better not to move focus than to leave it somewhere odd.
 */
export function focusContentSoon(framesLeft = 12) {
  if (typeof requestAnimationFrame === 'undefined') { focusContent(); return }
  requestAnimationFrame(() => {
    if (focusContent()) return
    if (framesLeft > 0) focusContentSoon(framesLeft - 1)
  })
}

/** Test seam: forgets that a navigation already happened. */
export function resetNavigationState() { hasNavigated = false }

// ── skip to content ───────────────────────────────────────────────────────────────────

/**
 * Mounts the "skip to content" link as the FIRST element of the body (WCAG 2.4.1).
 *
 * Every screen starts with the same menu. Without a way to skip it, whoever navigates by
 * keyboard pays for that whole menu on every screen before reaching what they came to do.
 *
 * Hidden by transform and not by display:none, because an element with display:none cannot
 * receive focus — and then the link would be unreachable, which is exactly the opposite.
 */
export function mountSkipLink(label = chromeText('skipToContent')) {
  if (typeof document === 'undefined') return
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () => mountSkipLink(label), { once: true })
    return
  }
  if (document.querySelector('.mateu-skip-link')) return
  const link = document.createElement('button')
  link.className = 'mateu-skip-link'
  link.textContent = label
  link.addEventListener('click', focusContent)
  document.body.insertBefore(link, document.body.firstChild)
}

// ── busy state on the pressed control ──────────────────────────────────────────────

/**
 * Marks the control the user pressed as busy while its action is in flight.
 *
 * The global bar answers "is the app busy?", but the question someone on a slow
 * connection asks is "did it notice my click?". Without this they press Save, nothing
 * changes, and they press again.
 *
 * It animates the element's own OPACITY and does not draw a spinner in ::after: on a shadow
 * host the pseudo-element is not painted (verified in the web renderers with an
 * `inset:0;background:red` on a live vaadin-button), and there is no guarantee that the
 * JET components are not shadow hosts.
 */
export function markPending(element) {
  if (!element || !element.setAttribute) return
  if (element.hasAttribute('data-mateu-pending')) return
  element.setAttribute('data-mateu-pending', '')
  element.setAttribute('aria-busy', 'true')
}

export function clearPending(element) {
  if (!element || !element.removeAttribute) return
  element.removeAttribute('data-mateu-pending')
  element.removeAttribute('aria-busy')
}

/**
 * The control actually pressed, from the event, or null if there is none.
 *
 * Only a CLOSED list of button-like things is decorated: dimming a container (a
 * table, a whole form) would be worse than showing nothing, and an action can be fired
 * from anywhere — a trigger, a shortcut, a row click.
 */
const INTERACTIVE = 'oj-button, oj-menu-button, oj-c-button, button, [role="button"], a[href]'

export function pressedControl(event) {
  const target = event && (event.target || event.currentTarget)
  if (!target || !target.closest) return null
  return target.closest(INTERACTIVE)
}

/**
 * Tracks the pressed control at DOCUMENT level and marks it while there is work in flight.
 *
 * Threading the event through each chain does not work: the app's buttons go through different
 * chains (toolbar, listing, wizard, island…) and any new one would forget to do it. On the
 * other hand the click always goes through the document, and the transport always reports when it
 * starts and ends — so pairing the two signals covers every path, including those
 * that do not exist yet.
 *
 * The grace window avoids marking a control for work it did not trigger (an OnLoad
 * trigger, an autosave): it only counts if the request goes out right after the click.
 */
const PRESS_GRACE_MS = 400
let lastPress = { control: null, at: 0 }
let markedControl = null

export function trackPressedControls() {
  if (typeof document === 'undefined') return
  document.addEventListener('click', (e) => {
    const path = typeof e.composedPath === 'function' ? e.composedPath() : []
    const origin = path[0] || e.target
    const control = origin && origin.closest ? origin.closest(INTERACTIVE) : null
    lastPress = { control, at: Date.now() }
  }, true)
}

/** Call from the transport's onStart hook. */
export function markPressedControlBusy() {
  if (!lastPress.control) return
  if (Date.now() - lastPress.at > PRESS_GRACE_MS) return
  markedControl = lastPress.control
  markPending(markedControl)
}

/** Call from the onSettle hook. */
export function clearPressedControlBusy() {
  clearPending(markedControl)
  markedControl = null
}

// ── retry at chain level ───────────────────────────────────────────────────────────

/**
 * What has to be redone after a failure.
 *
 * A DESCRIPTOR is stored, not a closure. A closure captures the VB `context` of the execution
 * that failed, and that context is no longer valid when the user presses Retry a second later:
 * the call does nothing and fails silently (it happened to me). With a descriptor, whoever retries
 * uses THEIR context, which is alive.
 *
 * Resending only the request would not work either: a response nobody processes changes nothing on
 * screen — the same lesson as in the web renderers. That is why what is redone is the WHOLE action
 * or navigation.
 */
let lastRetry = null

/** `{ kind: 'navigate', route }` or `{ kind: 'action', actionId, parameters }`. */
export function setLastRetry(descriptor) {
  lastRetry = descriptor && descriptor.kind ? descriptor : null
}

export function hasLastRetry() { return !!lastRetry }

/** Returns the descriptor and forgets it: a retry is offered once. */
export function takeLastRetry() {
  const descriptor = lastRetry
  lastRetry = null
  return descriptor
}

// ── required fields ───────────────────────────────────────────────────────────────────

const OVERLAY_CONTAINERS = 'oj-dialog, oj-drawer-popup, oj-sp-general-drawer-template, oj-sp-create-edit-drawer-template'

/** The elements of a field: the page's, or — `inOverlay` — the open drawer's / dialog's. */
function fieldElementsOf(fieldId, inOverlay) {
  if (typeof document === 'undefined') return []
  // comparing the attribute, without building a selector with the id: nothing to escape
  return [...document.querySelectorAll('[data-field-id]')]
    .filter((el) => el.getAttribute('data-field-id') === String(fieldId))
    .filter((el) => !!el.closest(OVERLAY_CONTAINERS) === !!inOverlay)
}

/**
 * Marks the empty required fields as a Redwood form does and moves focus to the first one.
 *
 * The message is the component's own: `validate()` runs its required validator (the
 * `required` that already paints «Obligatorio» under the field) and shows its text — «Introduzca un
 * valor.», in JET's language —, just as when leaving an empty field. If a component does not
 * consider itself invalid (its value has not reached the widget yet), the message goes through `messagesCustom`.
 * Returns how many fields it marked.
 */
export async function showFieldErrors(fieldIds, fallbackMessage, opts = {}) {
  // opts.messages: fieldId → the message of the wire validation (a bound, a pattern) or of the
  // server's refusal that failed it; opts.inOverlay: the fields are the open drawer's / dialog's
  const messages = opts.messages || {}
  let first = null
  let marked = 0
  for (const fieldId of fieldIds || []) {
    const own = messages[fieldId]
    for (const el of fieldElementsOf(fieldId, opts.inOverlay)) {
      let invalid = false
      // a field refused for something its own validator does not know (a pattern, the server's
      // @Email) carries THAT message; an empty required one lets JET say «Enter a value.»
      if (!own && typeof el.validate === 'function') {
        try { invalid = (await el.validate()) === 'invalid' } catch (ignored) { invalid = false }
      }
      if (!invalid) {
        const text = own || fallbackMessage || 'Enter a value.'
        if ('messagesCustom' in el || typeof el.validate === 'function') {
          try {
            // Redwood draws the DETAIL under the field (a summary alone is just the icon)
            el.messagesCustom = [{ severity: 'error', summary: text, detail: text }]
          } catch (ignored) { /* not a JET component */ }
        } else {
          // a field that is not a JET component (the chips of a @Searchable): its CSS paints
          // the message (.mateu-field-error + data-error) until it is touched again
          el.setAttribute('data-error', text)
          el.classList.add('mateu-field-error')
        }
      }
      marked++
      if (!first) first = el
    }
  }
  if (first) {
    try { first.scrollIntoView({ block: 'center' }) } catch (ignored) { /* jsdom */ }
    const input = first.querySelector && first.querySelector('input, textarea, [tabindex="0"]')
    try { (input || first).focus() } catch (ignored) { /* no box */ }
  }
  return marked
}

/**
 * showFieldErrors once what the answer re-drew is on screen: VB binds asynchronously, so marks set
 * right away land on the old elements and are lost when they are replaced. Waits a few frames,
 * then marks; tries again while no field is found yet.
 */
export async function showFieldErrorsSoon(fieldIds, fallbackMessage, opts = {}) {
  const frame = () => new Promise((resolve) => (typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(() => resolve()) : setTimeout(resolve, 16)))
  for (let attempt = 0; attempt < 12; attempt++) {
    for (let i = 0; i < 4; i++) await frame()
    const marked = await showFieldErrors(fieldIds, fallbackMessage, opts)
    if (marked) return marked
  }
  return 0
}

/** Removes the error marks of fields that are not JET components (see showFieldErrors). */
export function clearFieldErrorMarks(fieldId) {
  if (typeof document === 'undefined') return
  for (const el of document.querySelectorAll('.mateu-field-error')) {
    if (fieldId == null || el.getAttribute('data-field-id') === String(fieldId)) {
      el.classList.remove('mateu-field-error')
      el.removeAttribute('data-error')
    }
  }
}

/** When a marked field is edited, its own message goes away (the validator's is managed by JET). */
export function clearFieldError(element) {
  if (element && Array.isArray(element.messagesCustom) && element.messagesCustom.length) {
    element.messagesCustom = []
  }
}

let guidedProcessGuarded = false

/**
 * The guided process (oj-sp-guided-process) advances ON ITS OWN when Continue or a rail step is pressed,
 * before knowing whether Mateu lets it leave the step: its spBeforeNext/spBeforeStepNavigate events
 * can be cancelled, but only at that moment, and VB chains run afterwards. Here they are always
 * cancelled, in capture (they do not bubble: capture sees them anyway), and the step shown is decided by
 * the server (current-step ← the wire's step after each action): if the step does not validate, the
 * process does not move. The chains still receive the event and launch the action.
 */
export function guardGuidedProcess() {
  if (guidedProcessGuarded || typeof document === 'undefined') return
  guidedProcessGuarded = true
  const cancel = (event) => {
    const target = event.target
    if (target && target.id === 'mateuWizardEl') event.preventDefault()
  }
  document.addEventListener('spBeforeNext', cancel, true)
  document.addEventListener('spBeforeStepNavigate', cancel, true)
  relaxGuidedProcessOverview()
}

/**
 * The query oj-sp-guided-process uses to decide whether its OVERVIEW (the cover with one panel per
 * step) goes in a column: «(max-width: 767px), (max-height: 767px)». Designed for a full-screen guided process,
 * it stacks the panels as soon as the window is narrow OR short — a laptop with the
 * window under 768px tall already sees the steps one below another. With app.css the panels
 * share the content width (one row; another only if they really do not fit), so the column
 * is reserved for the phone (RDS: < 600px). Any other query passes through untouched.
 */
export const GUIDED_PROCESS_VERTICAL_QUERY = '(max-width: 767px), (max-height: 767px)'
export const GUIDED_PROCESS_PHONE_QUERY = '(max-width: 599px)'

export function guidedProcessMediaQuery(query) {
  const normalized = String(query == null ? '' : query).replace(/\s+/g, ' ').trim()
  return normalized === GUIDED_PROCESS_VERTICAL_QUERY ? GUIDED_PROCESS_PHONE_QUERY : query
}

/**
 * The mouse wheel over the overview: the component ALWAYS turns it into horizontal scroll
 * (preventDefault), because in its design the panels overflow horizontally. Spread across the width they no
 * longer overflow, and stealing the wheel from the page would only prevent scrolling down (e.g. to the 2nd row). The
 * gesture is left to the component only if its steps container still overflows horizontally.
 */
export function guidedProcessWheelIsNative(stepContainer) {
  if (!stepContainer) return false
  return stepContainer.scrollWidth <= stepContainer.clientWidth + 1
}

let guidedProcessOverviewRelaxed = false

export function relaxGuidedProcessOverview() {
  if (guidedProcessOverviewRelaxed || typeof window === 'undefined' || typeof document === 'undefined') return
  guidedProcessOverviewRelaxed = true
  if (typeof window.matchMedia === 'function') {
    const original = window.matchMedia.bind(window)
    window.matchMedia = (query) => original(guidedProcessMediaQuery(query))
  }
  document.addEventListener('wheel', (event) => {
    const target = event.target
    const wizard = target && target.closest ? target.closest('#mateuWizardEl') : null
    if (!wizard) return
    const steps = wizard.querySelector('.oj-sp-guided-process-step-container')
    if (steps && steps.contains(target) && guidedProcessWheelIsNative(steps)) event.stopPropagation()
  }, { capture: true, passive: true })
}
