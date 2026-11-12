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
    /**
     * An inline control handled entirely on the client — "Retry" on a failed request, where
     * there is no server action to dispatch, only a closure that re-runs the call. Takes
     * precedence over the undo control when both are set.
     */
    actionLabel?: string
    onAction?: () => void
    /** the message's title (shown before the text when present) */
    title?: string
    /** toast | sticky | inbox (design/progress-and-notifications.md) */
    persistence?: string | null
    /**
     * The actions the message offers, ready to run (labels resolved). When present they replace
     * the single undo control: a newer server sends the undo as one of them.
     */
    actions?: ToastAction[]
    /** a toast with the same key replaces the one on screen */
    key?: string | null
}

/** One action of a toast, ready to render. */
export interface ToastAction {
    label: string
    style?: string | null
    run: () => void
}

/**
 * How long a toast stays, in ms (0 = until dismissed). An ERROR stays until the user dismisses it,
 * whatever duration it arrived with — in every renderer and backend (owner, 2026-10-12): read in
 * three seconds and gone, the reason a save failed was often never seen. A STICKY message stays too.
 */
export const toastDuration = (message: ToastMessage, fallback: number): number =>
    message.variant === 'error' || message.persistence === 'sticky' ? 0 : (message.duration ?? fallback)

/**
 * The shortest time a toast with a control (Undo, Retry, an action) stays on screen, in ms. WCAG
 * 2.2.1: a declared shorter duration would take the control away before a keyboard or
 * screen-reader user can reach it, so it is raised to this floor.
 */
export const ACTIONABLE_TOAST_MIN_MS = 10000

/**
 * How long a toast stays (0 = until dismissed), knowing whether it offers a control: the
 * {@link toastDuration} rule, with {@link ACTIONABLE_TOAST_MIN_MS} as the floor of an actionable one.
 */
export const toastLifetime = (message: ToastMessage, hasControls: boolean): number => {
    const duration = toastDuration(message, hasControls ? ACTIONABLE_TOAST_MIN_MS : 5000)
    return duration > 0 && hasControls ? Math.max(duration, ACTIONABLE_TOAST_MIN_MS) : duration
}

/**
 * Toasts on screen by key, so one with the same key replaces it (a progress-ish "Syncing… → Synced",
 * a repeated warning). Each notifier registers how to close the toast it drew.
 */
const keyed = new Map<string, () => void>()

/** Closes the toast on screen with `key` (if any) and remembers how to close the new one. */
export const replaceKeyedToast = (key: string | null | undefined, close: () => void): void => {
    if (!key) return
    const previous = keyed.get(key)
    if (previous && previous !== close) {
        try { previous() } catch { /* already gone */ }
    }
    keyed.set(key, close)
}

/** Forgets a keyed toast once it closed on its own. */
export const forgetKeyedToast = (key: string | null | undefined, close: () => void): void => {
    if (key && keyed.get(key) === close) keyed.delete(key)
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
