/* Closing the drawer WITHOUT saving (✕/Esc/backdrop): discards the overlay from the registry purely by
 * state — it emits no event (the contract's "dismissed without saving" path). */

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

      // ojBeforeClose fires for a PROGRAMMATIC close too (the chain set mateuDrawerOpen=false after
      // a CloseModal already popped the drawer): then there is nothing of the user's to discard —
      // popping blindly took whatever was on top of the stack (a dialog) with it
      if ($application.variables.mateuDrawerOpen) {
        const drawer = bridge.drawerOverlayOf($application.variables.mateuRegistry);
        if (drawer) $application.variables.mateuRegistry = bridge.dismissOverlayById($application.variables.mateuRegistry, drawer.id);
      }
      $application.variables.mateuDrawerOpen = false;
      $application.variables.mateuDrawer = bridge.EMPTY_OVERLAY;
      $page.variables.mateuDrawerDraft = {};
      $page.variables.mateuDrawerLeaving = null;
      $page.variables.mateuDrawerState = 'auto';
      bridge.noteDrawerUnsaved(false);
    }
  }

  return mateuDrawerDismissed;
});
