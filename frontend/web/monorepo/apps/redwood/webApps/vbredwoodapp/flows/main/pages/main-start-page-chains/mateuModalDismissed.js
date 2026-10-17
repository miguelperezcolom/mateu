/* Closing the MODAL (✕ / programmatic): if the top overlay is still the Dialog, it is
 * discarded from the registry ("dismissed" path); a close after navigation/CloseModal no longer
 * finds a Dialog on top and touches nothing. */

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

      // same guard as the drawer's: a close the chain asked for (the dialog is already off the stack)
      // discards nothing; the user's ✕/Esc pops the dialog — and the drawer under it stays
      const top = bridge.overlayOf($application.variables.mateuRegistry);
      if ($page.variables.mateuModalOpen && top && top.isDialog) {
        $application.variables.mateuRegistry = bridge.dismissOverlay($application.variables.mateuRegistry);
      }
      $page.variables.mateuModalOpen = false;
      $application.variables.mateuDialog = bridge.EMPTY_OVERLAY;
    }
  }

  return mateuModalDismissed;
});
