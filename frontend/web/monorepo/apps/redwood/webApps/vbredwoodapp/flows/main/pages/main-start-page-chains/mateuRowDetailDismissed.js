/* Closing the row DETAIL (✕/Esc/backdrop): read-only, there is nothing to discard on the
 * server — the panel is closed and emptied. */

define([
  'vb/action/actionChain',
], (
  ActionChain,
) => {
  'use strict';

  class mateuRowDetailDismissed extends ActionChain {

    async run(context) {
      const { $application } = context;

      $application.variables.mateuRowDetailOpen = false;
      $application.variables.mateuRowDetail = { title: '', text: '' };
    }
  }

  return mateuRowDetailDismissed;
});
