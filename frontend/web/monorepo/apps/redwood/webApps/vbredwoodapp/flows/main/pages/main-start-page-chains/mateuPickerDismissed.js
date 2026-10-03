/* Cierre del SELECTOR de un @Searchable (✕ / Esc / Cancel, o el close programático tras elegir):
 * si el overlay superior sigue siendo el selector, se descarta sin elegir nada; tras una elección
 * ya no está y no se toca nada. */

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

  class mateuPickerDismissed extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.cancel  el botón Cancel (cierra el diálogo, que vuelve aquí)
     */
    async run(context, { cancel }) {
      const { $application, $page } = context;
      if (cancel) {
        await Actions.callComponentMethod(context, { selector: '#mateuPicker', method: 'close' });
        return;
      }
      if (bridge.searchPickerOf($application.variables.mateuRegistry)) {
        $application.variables.mateuRegistry = bridge.dismissOverlay($application.variables.mateuRegistry);
      }
      $page.variables.mateuPickerOpen = false;
      $page.variables.mateuDrawerDraft = {};
    }
  }

  return mateuPickerDismissed;
});
