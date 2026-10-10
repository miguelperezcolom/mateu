/* Mateu — Apache License 2.0 (LICENSE.txt en la raíz del repositorio) */

// El usuario cierra un aviso de la banda de mensajes del shell.
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';

  class closeMessageBanner extends ActionChain {
    async run(context, { event }) {
      await Actions.fireDataProviderEvent(context, {
        target: context.$page.variables.messagesBannerADP,
        remove: { keys: [event.detail.messageId] },
      });
    }
  }

  return closeMessageBanner;
});
