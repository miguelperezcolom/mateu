/* ROW option of a TaskQueue card (e.g. "Check-out" on the in-house bookings):
 * dispatches the ITEM's actionId with {_item} against the HOST. Leaves a temporary mark so
 * the card click the same gesture causes (the button lives inside the oj-action-card)
 * is recognized as an echo and does not also fire the openGuest. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class queueRowAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { actionId, parameters }) {
      if (!actionId) {
        return;
      }
      window.__mateuQueueRowActionAt = Date.now();
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId, parameters },
      });
    }
  }

  return queueRowAction;
});
