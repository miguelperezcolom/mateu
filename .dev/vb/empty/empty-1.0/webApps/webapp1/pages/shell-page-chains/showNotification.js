define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class showNotification extends ActionChain {

    /**
     * Displays notifications sent by the Fire Notification action using the oj-messages component on this page.
     * @param {Object} context
     * @param {Object} params
     * @param {messageType} params.eventPayload 
     */
    async run(context, { eventPayload = {} }) {
      const { $application, $flow, $page } = context;

      await Actions.fireDataProviderEvent(context, {
        target: $page.variables.messagesADP,
        add: {
          data: [eventPayload],
        },
      });
    }
  }

  return showNotification;
});
