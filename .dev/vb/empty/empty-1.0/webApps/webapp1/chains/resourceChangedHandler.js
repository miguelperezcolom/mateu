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

  class resourceChangedHandler extends ActionChain {

    /**
      * Displays a notification message when application has been updated and needs to be refreshed.
      * @param {Object} context
      * @param {Object} params
      * @param {{error: {detail: string}}} params.event
      */
    async run(context, { event = {} }) {
      const { $application } = context;

      await Actions.fireNotificationEvent(context, {
        summary: event.error.detail,
      });
    }
  }

  return resourceChangedHandler;
});