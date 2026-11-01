/**
 * The actions that LEAVE the screen without saving — the same rule as the web renderer's
 * libs/mateu `leaveActions.ts` and Redwood's `isLeaveAction` (keep the three in step): `cancel`,
 * any `cancel-…` (the crud's cancel-new / cancel-create / cancel-edit / cancel-view), `back` and
 * `backToList`. A business action called `cancelBooking` does not leave; a wizard's `back` (its
 * owner advertises `next`) steps inside the same screen and keeps what was typed.
 *
 * RN used to guard only cancel-edit / cancel-view / cancel: a crud's New form lost what was typed
 * on Cancel (cancel-new) or Back without asking.
 */
export const WIZARD_STEP_ACTIONS: ReadonlySet<string> = new Set(['next', 'back', 'skip', 'goToStep']);

export function isWizardStepAction(actionId: string, ownerActionIds: readonly string[]): boolean {
  return WIZARD_STEP_ACTIONS.has(actionId) && ownerActionIds.includes('next');
}

export function isLeaveAction(actionId: string | undefined | null, ownerActionIds: readonly string[] = []): boolean {
  if (!actionId) return false;
  if (isWizardStepAction(actionId, ownerActionIds)) return false;
  return actionId === 'cancel' || actionId.startsWith('cancel-') || actionId === 'back' || actionId === 'backToList';
}
