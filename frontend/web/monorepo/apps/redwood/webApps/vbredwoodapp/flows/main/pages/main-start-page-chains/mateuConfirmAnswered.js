/* Answer to an action's CONFIRMATION dialog (confirmationRequired): the button that
 * confirms, the one that lets it be, or the ✕ / Esc (ojBeforeClose). Resolves the wait of the
 * chain that launched the action (bridge.awaitConfirmation) and closes the dialog. */

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

  class mateuConfirmAnswered extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.confirmed  true = confirm the action
     * @param {boolean} params.closing    the dialog is already closing (✕ / Esc)
     */
    async run(context, { confirmed, closing }) {
      bridge.answerConfirmation(!!confirmed);
      if (!closing) {
        // the close fires ojBeforeClose, which arrives here as a «no»: already answered, it does nothing
        await Actions.callComponentMethod(context, { selector: '#mateuConfirm', method: 'close' });
      }
    }
  }

  return mateuConfirmAnswered;
});
