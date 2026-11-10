/* PaymentPicker's confirm: sends the method the user PICKED (kept on the client by
 * bridge.installPaymentPickers, like the web's picker), not the server's `selected` — which is
 * what it sent before, whatever was clicked. */

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

  class paymentConfirmed extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event       the confirm button's ojAction
     * @param {string} params.actionId    the picker's actionId
     * @param {Object} params.parameters  { _method: the server's selected method }
     * @param {string} params.surfaceId   the surface (an island) the picker belongs to, if any
     */
    async run(context, { event, actionId, parameters, surfaceId }) {
      // through the block dispatcher: a picker of an island sends its confirm to that island
      await Actions.callChain(context, {
        chain: 'dispatchHostBlockAction',
        params: { actionId, parameters: bridge.paymentParametersOf(event && event.target, parameters), surfaceId: surfaceId || '' },
      });
    }
  }

  return paymentConfirmed;
});
