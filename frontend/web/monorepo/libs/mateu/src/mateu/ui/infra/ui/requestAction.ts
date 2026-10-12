/**
 * Requests an action ON a component — the one that made the request this answers (an undoable
 * toast's Undo, run on the component whose action returned it).
 *
 * A `mateu-component` listens for `action-requested` on an element INSIDE its shadow root, where
 * its children's clicks arrive; an event dispatched on the host itself only bubbles UP, past every
 * listener that could claim it, and is lost ("no component on the page handles it"). So a component
 * is handed the request directly, as its own RunAction command does; anything else gets the event.
 */
export function requestActionOn(target: EventTarget, detail: Record<string, unknown>) {
    const event = new CustomEvent('action-requested', { detail, bubbles: true, composed: true })
    const component = target as { manageActionRequestedEvent?: (e: CustomEvent) => void }
    if (typeof component.manageActionRequestedEvent === 'function') {
        component.manageActionRequestedEvent(event)
    } else {
        target.dispatchEvent(event)
    }
}
