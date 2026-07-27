/* Cierre del MODAL (✕ / programático): si el overlay superior sigue siendo el Dialog, se
 * descarta del registro (camino "dismissed"); un close tras navegación/CloseModal ya no
 * encuentra Dialog arriba y no toca nada. */

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

  class mateuModalDismissed extends ActionChain {

    async run(context) {
      const { $application, $page } = context;

      const top = bridge.overlayOf($application.variables.mateuRegistry);
      if (top && top.isDialog) {
        $application.variables.mateuRegistry = bridge.dismissOverlay($application.variables.mateuRegistry);
      }
      $page.variables.mateuModalOpen = false;
    }
  }

  return mateuModalDismissed;
});
