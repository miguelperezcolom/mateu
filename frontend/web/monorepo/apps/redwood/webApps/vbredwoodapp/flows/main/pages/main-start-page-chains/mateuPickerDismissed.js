/* Closing of a @Searchable's SELECTOR (✕ / Esc / Cancel, or the programmatic close after choosing):
 * if the top overlay is still the selector, it is discarded without choosing anything; after a choice
 * it is no longer there and nothing is touched. */

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
     * @param {boolean} params.cancel  the Cancel button (closes the dialog, which comes back here)
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
