/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root) */

// A notice in the shell's message band (Actions.fireNotificationEvent). The transient ones
// go away by themselves after 5 seconds; the rest, when the user closes them (closeMessageBanner).
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
            // the band distinguishes general-success / general-error / general-warning / general-info
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
