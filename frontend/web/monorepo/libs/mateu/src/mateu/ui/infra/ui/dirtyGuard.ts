import { chromeText } from '@infra/ui/chromeTexts.ts'
/**
 * Centralised dirty-state guard.
 *
 * Single source of truth for "the user has unsaved changes in the current form".
 * Every navigation entry point — in-app menu navigation (mateu-app.selectRoute),
 * browser back/forward (mateu-ui popstate) and page reload/close (beforeunload) —
 * consults this guard before letting the user leave a dirty form.
 *
 * Dirty state is fed by the `dirty` / `clean` DOM events that bubble up to
 * `document` from:
 *   - mateu-component, when a field value actually changes on a form annotated
 *     with @ConfirmOnNavigationIfDirty, and
 *   - ConnectedElement, when the backend returns a MarkAsDirty / MarkAsClean command.
 * The guard wires those listeners once, so the state lives in exactly one place
 * instead of being mirrored inside mateu-app.
 *
 * An open dialog or drawer is a scope of its own (the event's composed path says which one it
 * came from): closing it by hand — ✕, Esc, the backdrop, a Cancel inside it — asks through
 * confirmDiscard(overlay) about ITS form only, so a crud create/edit drawer no longer drops what
 * was typed without a word, and a clean drawer over a dirty page closes without asking.
 */
class DirtyGuard {
    /** Unsaved changes on the PAGE itself (anything outside an open dialog/drawer). */
    private _dirty = false
    /**
     * Unsaved changes held by an open overlay (mateu-drawer / mateu-dialog), one entry per
     * overlay. An overlay's form is a scope of its own: closing it asks about ITS edits only, and
     * discarding them leaves the page's own state alone (the page behind may be dirty too).
     */
    private _overlays = new Map<EventTarget, { dirty: boolean, hold: boolean }>()
    private _installed = false

    /** Message shown in the confirmation dialog. Assign to localise it. */
    message = chromeText('unsavedChanges')

    /** Message shown when closing an overlay (dialog/drawer) that holds unsaved changes. */
    discardMessage = chromeText('unsavedChangesInOverlay')

    /**
     * Idempotent. Wires the document-level `dirty` / `clean` listeners and the
     * `beforeunload` guard. Safe to call from more than one component — only the
     * first call takes effect.
     */
    install(): void {
        if (this._installed) return
        this._installed = true
        document.addEventListener('dirty', this._onDirty)
        document.addEventListener('clean', this._onClean)
        window.addEventListener('beforeunload', this._onBeforeUnload)
    }

    private _onDirty = (e: Event) => {
        const overlay = overlayOfEvent(e)
        if (overlay) this._scope(overlay).dirty = true
        else this._dirty = true
    }

    /**
     * Two kinds of `clean`: a tracked form (re)LOADING (`detail.reason === 'load'`, sent by
     * mateu-component) cleans only the scope it lives in; a MarkAsClean COMMAND from the server
     * (no reason) is authoritative — sent from outside any overlay (the crud host after a save)
     * it cleans everything, sent from inside one it cleans that overlay.
     */
    private _onClean = (e: Event) => {
        const overlay = overlayOfEvent(e)
        const isLoad = (e as CustomEvent)?.detail?.reason === 'load'
        if (overlay) {
            const scope = this._overlays.get(overlay)
            if (!scope) return
            if (isLoad && scope.hold) {
                // the server re-sent the overlay in place (a refused save with its error banner):
                // the form reloads with the values the user typed, which are still unsaved
                scope.hold = false
                return
            }
            this._overlays.delete(overlay)
            return
        }
        this._dirty = false
        if (!isLoad) this._overlays.clear()
    }

    private _onBeforeUnload = (e: BeforeUnloadEvent) => {
        if (this.dirty) {
            // Triggers the browser's native "Leave site?" prompt on reload/close.
            e.preventDefault()
            e.returnValue = ''
        }
    }

    private _scope(overlay: EventTarget) {
        let scope = this._overlays.get(overlay)
        if (!scope) {
            scope = { dirty: false, hold: false }
            this._overlays.set(overlay, scope)
        }
        return scope
    }

    /** Anything on screen — the page or an open overlay — holds unsaved changes. */
    get dirty(): boolean {
        if (this._dirty) return true
        for (const scope of this._overlays.values()) if (scope.dirty) return true
        return false
    }

    markDirty(): void {
        this._dirty = true
    }

    markClean(): void {
        this._dirty = false
        this._overlays.clear()
    }

    /**
     * Single decision point for user-initiated navigation away from a form.
     * Returns true when navigation may proceed. If the form is dirty it asks the
     * user to confirm; confirming clears the dirty state so a follow-up guarded
     * navigation in the same gesture does not prompt twice.
     */
    confirmLeave(): boolean {
        if (!this.dirty) return true
        const proceed = window.confirm(this.message)
        if (proceed) this.markClean()
        return proceed
    }

    /** Does THIS overlay (dialog/drawer) hold unsaved changes? */
    overlayDirty(overlay: EventTarget): boolean {
        return !!this._overlays.get(overlay)?.dirty
    }

    /**
     * The user closes an overlay (✕, Esc, the backdrop, a Cancel inside it): when ITS form holds
     * unsaved changes, ask first. True = it may close (nothing to lose, or the user chose to
     * discard — the overlay's scope is dropped); false = keep it open with what was typed.
     * A close the SERVER commands (CloseModal after a save) never comes through here.
     */
    confirmDiscard(overlay: EventTarget): boolean {
        if (!this.overlayDirty(overlay)) return true
        const proceed = window.confirm(this.discardMessage)
        if (proceed) this._overlays.delete(overlay)
        return proceed
    }

    /**
     * The server re-sent an open overlay in place: if it holds unsaved changes they survive the
     * reload its form is about to do (the next load-`clean` from inside it is not a save).
     */
    holdThroughReload(overlay: EventTarget): void {
        const scope = this._overlays.get(overlay)
        if (scope?.dirty) scope.hold = true
    }

    /** The overlay is gone (closed or torn down): its unsaved changes go with it. */
    release(overlay: EventTarget): void {
        this._overlays.delete(overlay)
    }
}

const OVERLAY_TAGS = new Set(['mateu-drawer', 'mateu-dialog'])

/** The innermost open overlay an event was dispatched from, if any. */
function overlayOfEvent(e: Event): Element | undefined {
    const path = typeof e?.composedPath === 'function' ? e.composedPath() : []
    for (const node of path) {
        if ((node as Element)?.localName && OVERLAY_TAGS.has((node as Element).localName)) {
            return node as Element
        }
    }
    return undefined
}

/**
 * The innermost dialog/drawer that contains `el` (or is `el`), crossing shadow roots — the scope
 * a leave action pressed inside an overlay belongs to.
 */
export function enclosingOverlay(el: Node | null | undefined): Element | undefined {
    let node: Node | null | undefined = el
    while (node) {
        if ((node as Element).localName && OVERLAY_TAGS.has((node as Element).localName)) {
            return node as Element
        }
        node = node.parentNode ?? ((node as ShadowRoot).host as Node | undefined) ?? null
    }
    return undefined
}

export const dirtyGuard = new DirtyGuard()
