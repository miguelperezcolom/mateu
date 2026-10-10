/* Mateu — Apache License 2.0 (LICENSE.txt en la raíz del repositorio) */

// Un aviso en la banda de mensajes del shell (Actions.fireNotificationEvent). Los transitorios se
// retiran solos a los 5 segundos; el resto, cuando el usuario los cierra (closeMessageBanner).
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';

  const TRANSIENT_MILLIS = 5000;

  class showNotificationMessage extends ActionChain {
    /** @param {{event: {summary: string, message: string, displayMode: string, type: string}}} params */
    async run(context, { event }) {
      const { $page } = context;
      const id = $page.variables.messageId;
      $page.variables.messageId = id + 1;
      const banner = $page.variables.messagesBannerADP;
      await Actions.fireDataProviderEvent(context, {
        target: banner,
        add: {
          data: {
            id,
            // la banda distingue general-success / general-error / general-warning / general-info
            messageType: 'general-' + (event.type === 'confirmation' ? 'success' : event.type),
            primaryText: event.summary,
            secondaryText: event.message,
          },
        },
      });
      if (event.displayMode === 'transient') {
        setTimeout(() => Actions.fireDataProviderEvent(context, { target: banner, remove: { keys: [id] } }), TRANSIENT_MILLIS);
      }
    }
  }

  return showNotificationMessage;
});
