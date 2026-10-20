/**
 * The actions that LEAVE the screen without saving: the editor's Cancel, a crud's back to the
 * listing, a page's Back. Running one on a form with unsaved changes drops them, so it asks first
 * — the same question (dirtyGuard.confirmLeave) as a menu click or the browser's back button.
 *
 * The ids are the ones the server treats as "leave" actions: `FormMapper.resolveStyle` gives them
 * the tertiary look (`cancel*`, `back`, `backToList`), and the crud/editable view name theirs
 * `cancel-create` / `cancel-new` / `cancel-edit` / `cancel-view`. Of the `cancel` family only
 * `cancel` itself and `cancel-…` count: a business action called `cancelBooking` does not leave
 * the screen, and asking "leave this screen?" before it would be wrong.
 *
 * Ported to the Redwood renderer as `isLeaveAction` in `apps/redwood/poc/shellFlows.mjs` — keep
 * both in step.
 */
export function isLeaveAction(actionId: string | undefined | null): boolean {
    if (!actionId) return false
    return actionId === 'cancel'
        || actionId.startsWith('cancel-')
        || actionId === 'back'
        || actionId === 'backToList'
}
