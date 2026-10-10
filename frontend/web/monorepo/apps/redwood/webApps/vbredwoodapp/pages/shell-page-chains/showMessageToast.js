/* Mateu — Apache License 2.0 (LICENSE.txt en la raíz del repositorio) */

// Un toast del shell: el mensaje del evento al oj-sp-messages-toast de la página.
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
