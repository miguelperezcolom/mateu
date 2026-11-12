/**
 * The auto-dismiss timer of a toast, PAUSABLE (WCAG 2.2.1 Timing Adjustable).
 *
 * A toast that disappears on a fixed clock takes its Undo/Retry with it before a keyboard,
 * magnifier or screen-reader user reaches it. This timer stops while the pointer is over the toast,
 * while the focus is inside it, and while the page is hidden (another tab); when the reason goes
 * away it resumes with what was left — never less than {@link RESUME_MIN_MS}, so a user who just
 * moved away still has time to read it.
 *
 * Pure DOM + timers, design-system neutral: the neutral notifier and the Vaadin notifier both use it.
 */

/** The least time a resumed toast gets before it closes, in ms. */
export const RESUME_MIN_MS = 2000

export interface DismissTimer {
    /** Stops the timer for good (the toast was closed another way). */
    cancel(): void
    /** true while hovered, focused or the page is hidden. */
    readonly paused: boolean
}

/**
 * Calls `close` after `duration` ms of the toast being on screen and NOT hovered, focused or hidden.
 * `duration <= 0` never closes (a sticky toast). `target` is the toast's own element (the one that
 * receives the pointer and holds the controls).
 */
export function pausableDismiss(
    target: HTMLElement,
    duration: number,
    close: () => void,
    doc: Document = target.ownerDocument ?? document,
): DismissTimer {
    let remaining = duration
    let startedAt = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let hovered = false
    let focused = false
    let done = duration <= 0

    const hidden = () => doc.visibilityState === 'hidden'
    const shouldPause = () => hovered || focused || hidden()

    const stop = () => {
        if (timer === undefined) return
        clearTimeout(timer)
        timer = undefined
        remaining -= Date.now() - startedAt
    }
    const start = (atLeast = 0) => {
        if (done || timer !== undefined || shouldPause()) return
        remaining = Math.max(remaining, atLeast)
        startedAt = Date.now()
        timer = setTimeout(() => {
            timer = undefined
            cancel()
            close()
        }, Math.max(0, remaining))
    }
    const resume = () => start(RESUME_MIN_MS)

    const onEnter = () => { hovered = true; stop() }
    const onLeave = () => { hovered = false; resume() }
    const onFocusIn = () => { focused = true; stop() }
    const onFocusOut = (e: FocusEvent) => {
        const next = e.relatedTarget as Node | null
        if (next && target.contains(next)) return
        focused = false
        resume()
    }
    const onVisibility = () => { if (hidden()) stop(); else resume() }

    target.addEventListener('mouseenter', onEnter)
    target.addEventListener('mouseleave', onLeave)
    target.addEventListener('focusin', onFocusIn)
    target.addEventListener('focusout', onFocusOut as EventListener)
    doc.addEventListener('visibilitychange', onVisibility)

    function cancel() {
        done = true
        if (timer !== undefined) clearTimeout(timer)
        timer = undefined
        detach()
    }
    function detach() {
        target.removeEventListener('mouseenter', onEnter)
        target.removeEventListener('mouseleave', onLeave)
        target.removeEventListener('focusin', onFocusIn)
        target.removeEventListener('focusout', onFocusOut as EventListener)
        doc.removeEventListener('visibilitychange', onVisibility)
    }

    if (done) detach()
    else start()
    return {
        cancel,
        get paused() { return !done && shouldPause() },
    }
}
