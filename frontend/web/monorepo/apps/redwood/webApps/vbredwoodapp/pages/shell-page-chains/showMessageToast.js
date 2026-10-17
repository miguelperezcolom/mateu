/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root) */

// A shell toast: the event's message to the page's oj-sp-messages-toast.
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';

  class showMessageToast extends ActionChain {
    /** @param {{event: {message: string}}} params */
    async run(context, { event }) {
      context.$page.variables.messageToast = event.message;
      await Actions.callComponentMethod(context, { selector: '#messageToast', method: 'open' });
    }
  }

  return showMessageToast;
});
