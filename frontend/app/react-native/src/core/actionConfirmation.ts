/**
 * What an action's confirmation asks (`@Action(confirmationRequired)` + `confirmationTexts`) — the
 * port of libs/mateu's `confirmationTexts.ts`: each declared text wins on its OWN, the rest fall
 * back on the generic wording, and a delete names its outcome instead of a bare "Yes / No". Pure.
 */

export interface ConfirmationDialogTexts {
  header: string;
  message: string;
  confirmationText: string;
  denialText: string;
  /** the action destroys data: the confirm button is painted as such */
  destructive: boolean;
}

type ActionLike = { id?: unknown; confirmationRequired?: unknown; confirmationTexts?: unknown } | null | undefined;

export const isDeleteAction = (actionId: unknown): boolean =>
  actionId === 'delete' || actionId === 'action-on-row-delete' || actionId === 'deleteSelected';

const GENERIC: ConfirmationDialogTexts = {
  header: 'One moment, please',
  message: 'Are you sure?',
  confirmationText: 'Yes',
  denialText: 'No',
  destructive: false,
};

const GENERIC_DELETE: ConfirmationDialogTexts = {
  header: 'Delete the selected items?',
  message: 'This cannot be undone.',
  confirmationText: 'Delete',
  denialText: 'Cancel',
  destructive: true,
};

/** The dialog texts when the action asks for confirmation, null when it runs straight away. */
export function confirmationOf(action: ActionLike): ConfirmationDialogTexts | null {
  if (!action || action.confirmationRequired !== true) return null;
  const fallback = isDeleteAction(action.id) ? GENERIC_DELETE : GENERIC;
  const texts = (action.confirmationTexts ?? {}) as Record<string, unknown>;
  const declared = (key: string, fb: string) => {
    const t = texts[key];
    return typeof t === 'string' && t.trim().length > 0 ? t : fb;
  };
  return {
    header: declared('title', fallback.header),
    message: declared('message', fallback.message),
    confirmationText: declared('confirmationText', fallback.confirmationText),
    denialText: declared('denialText', fallback.denialText),
    destructive: fallback.destructive,
  };
}
