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
 */
class DirtyGuard {
    private _dirty = false
    private _installed = false

    /** Message shown in the confirmation dialog. Assign to localise it. */
    message = 'You have unsaved changes. Are you sure you want to leave this page?'

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

    private _onDirty = () => {
        this._dirty = true
    }

    private _onClean = () => {
        this._dirty = false
    }

    private _onBeforeUnload = (e: BeforeUnloadEvent) => {
        if (this._dirty) {
            // Triggers the browser's native "Leave site?" prompt on reload/close.
            e.preventDefault()
            e.returnValue = ''
        }
    }

    get dirty(): boolean {
        return this._dirty
    }

    markDirty(): void {
        this._dirty = true
    }

    markClean(): void {
        this._dirty = false
    }

    /**
     * Single decision point for user-initiated navigation away from a form.
     * Returns true when navigation may proceed. If the form is dirty it asks the
     * user to confirm; confirming clears the dirty state so a follow-up guarded
     * navigation in the same gesture does not prompt twice.
     */
    confirmLeave(): boolean {
        if (!this._dirty) return true
        const proceed = window.confirm(this.message)
        if (proceed) this._dirty = false
        return proceed
    }
}

export const dirtyGuard = new DirtyGuard()
