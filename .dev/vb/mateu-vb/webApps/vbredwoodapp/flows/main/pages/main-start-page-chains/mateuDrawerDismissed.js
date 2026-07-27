/* Cierre del drawer SIN guardar (✕/Esc/backdrop): descarta el overlay del registro por puro
 * estado — no emite ningún evento (el camino "dismissed without saving" del contrato). */

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

  class mateuDrawerDismissed extends ActionChain {

    async run(context) {
      const { $application, $page } = context;

      $application.variables.mateuRegistry = bridge.dismissOverlay($application.variables.mateuRegistry);
      $application.variables.mateuDrawerOpen = false;
      $application.variables.mateuDrawer = { title: '', fields: [], actions: [], blocks: [], state: {} };
      $page.variables.mateuDrawerDraft = {};
    }
  }

  return mateuDrawerDismissed;
});
