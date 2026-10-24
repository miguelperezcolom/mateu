/* A navigation closed every overlay (onMateuNavigate: the registry has none any more and the drawer
 * panel is shut): the content page drops ITS overlay state — the drawer's draft, its pending
 * unsaved-changes banner, its template size — and closes its dialogs (the decision modal, the
 * @Searchable selector). Their ojBeforeClose chains find nothing left to dismiss. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class mateuOverlaysClosed extends ActionChain {

    async run(context) {
      const { $page } = context;
      bridge.noteDrawerUnsaved(false);
      $page.variables.mateuDrawerDraft = {};
      $page.variables.mateuDrawerLeaving = null;
      $page.variables.mateuDrawerState = 'auto';
      if ($page.variables.mateuModalOpen) {
        // the flag drops BEFORE the close: its ojBeforeClose is not a user dismissal
        $page.variables.mateuModalOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
      }
      if ($page.variables.mateuPickerOpen) {
        $page.variables.mateuPickerOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuPicker', method: 'close' });
      }
    }
  }

  return mateuOverlaysClosed;
});
