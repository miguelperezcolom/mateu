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
     */
    async run(context, { event, actionId, parameters }) {
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId, parameters: bridge.paymentParametersOf(event && event.target, parameters) },
      });
    }
  }

  return paymentConfirmed;
});
