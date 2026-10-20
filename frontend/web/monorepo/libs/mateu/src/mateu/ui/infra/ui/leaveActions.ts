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
 * A wizard's `back` is NOT one: it steps to the previous step of the same screen, keeping what was
 * typed (isWizardStepAction). The wizard's Cancel still is.
 *
 * Ported to the Redwood renderer as `isLeaveAction` in `apps/redwood/poc/shellFlows.mjs` — keep
 * both in step.
 */
export function isLeaveAction(actionId: string | undefined | null,
                              ownerActionIds: readonly string[] = []): boolean {
    if (!actionId) return false
    if (isWizardStepAction(actionId, ownerActionIds)) return false
    return actionId === 'cancel'
        || actionId.startsWith('cancel-')
        || actionId === 'back'
        || actionId === 'backToList'
}

/** The ids a wizard steps with (WizardActionDispatcher): they move inside the screen, never out of it. */
export const WIZARD_STEP_ACTIONS: ReadonlySet<string> = new Set(['next', 'back', 'skip', 'goToStep'])

/**
 * Is `actionId` a step of a wizard? It is when its owner — the component that runs it — is a wizard,
 * which always advertises `next` (the same test the Redwood renderer uses to recognise one).
 */
export function isWizardStepAction(actionId: string, ownerActionIds: readonly string[]): boolean {
    return WIZARD_STEP_ACTIONS.has(actionId) && ownerActionIds.includes('next')
}
