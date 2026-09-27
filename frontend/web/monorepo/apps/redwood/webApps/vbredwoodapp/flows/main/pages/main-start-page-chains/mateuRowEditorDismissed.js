/* Cierre del EDITOR DE FILA por el usuario (✕ / Esc) = Cancel: se manda `<campo>_cancel` al
 * contenedor, que cierra el detalle sin tocar la lista. Un cierre programático (la respuesta a
 * Save/Cancel ya cerró el detalle) llega con mateuRowEditorOpen ya a false y no hace nada. */

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
