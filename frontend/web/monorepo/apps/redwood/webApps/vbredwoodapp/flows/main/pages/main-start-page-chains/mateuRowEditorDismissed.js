/* Closing of the ROW EDITOR by the user (✕ / Esc) = Cancel: `<field>_cancel` is sent to the
 * container, which closes the detail without touching the list. A programmatic close (the response to
 * Save/Cancel already closed the detail) arrives with mateuRowEditorOpen already false and does nothing. */

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

  class mateuRowEditorDismissed extends ActionChain {

    async run(context) {
      const { $application, $page } = context;

      if (!$page.variables.mateuRowEditorOpen) {
        return;
      }
      $page.variables.mateuRowEditorOpen = false;
      const editor = bridge.rowEditorOf($application.variables.mateuRegistry);
      if (!editor) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: editor.fieldId + '_cancel' },
      });
    }
  }

  return mateuRowEditorDismissed;
});
