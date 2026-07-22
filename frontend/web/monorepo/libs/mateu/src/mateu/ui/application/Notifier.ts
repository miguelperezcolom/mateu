/**
 * Notifier — the toast/notification PORT.
 *
 * The application layer only knows how to describe a toast ({@link ToastMessage}); it must not
 * depend on any design system. A concrete {@link Notifier} adapter is registered by the
 * composition root ({@link setNotifier}):
 *   - the DS-neutral default (infra/notify/neutralNotifier) is installed by mateu-ui at load,
 *     so every renderer gets working toasts out of the box;
 *   - a design-system renderer (e.g. the Vaadin app) may override it with its own widget.
 *
 * This keeps `ui/application` free of `@vaadin` (or any other renderer) imports.
 */

export interface ToastMessage {
    text: string
    /** camelCase position id from the wire, e.g. 'bottomEnd', 'topStretch'. */
    position?: string
    /** severity/theme id from the wire, e.g. 'success', 'error'. */
    variant?: string
    /** auto-dismiss duration in ms. */
    duration?: number
    /** Undoable toast (Message.undoable): label + action dispatched on the initiator. */
    undoLabel?: string
    undoActionId?: string
    undoParameters?: Record<string, unknown>
}

export interface Notifier {
    /**
     * Show a toast. When {@link ToastMessage.undoActionId} is set, the toast carries an Undo
     * control that dispatches an `action-requested` event on `initiator` with that action id.
     */
    show(message: ToastMessage, initiator: HTMLElement): void
}

/** No-op default so importing the services without a composition root never crashes. */
const noopNotifier: Notifier = {
    show: (message) => console.debug('[mateu] no notifier registered, dropping toast:', message.text),
}

let current: Notifier = noopNotifier

/** Register the concrete adapter. Called by the composition root (mateu-ui / the DS app). */
export function setNotifier(notifier: Notifier): void {
    current = notifier
}

/** Show a toast through the currently registered adapter. */
export function notify(message: ToastMessage, initiator: HTMLElement): void {
    current.show(message, initiator)
}
