/* MessageInput: Send (or Enter in its field) sends the component's action with {message}, as the
 * web renderer does, and empties the field. The text is read from the field itself — it is not
 * form state, so it must not travel in componentState (nor trigger the page's auto-save). */

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

  class messageInputSend extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.inputId   the oj-input-text's id
     * @param {string} params.actionId
     * @param {string} params.key       the key pressed (keydown) — absent for the Send button
     * @param {string} params.variant   'host' | 'island'
     */
    async run(context, { inputId, actionId, key, variant }) {
      if (key !== undefined && key !== 'Enter') return;
      const input = inputId ? document.getElementById(inputId) : null;
      if (!input) return;
      const send = bridge.messageSendOf(input.rawValue != null ? input.rawValue : input.value, actionId);
      if (!send) return;
      input.value = '';
      await Actions.callChain(context, {
        chain: variant === 'island' ? 'dispatchIslandAction' : 'dispatchHostBlockAction',
        params: send,
      });
    }
  }

  return messageInputSend;
});
