/* Copyright (c) 2026, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class closeMessageBanner extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context, { event }) {
      const { $page } = context;

      await Actions.fireDataProviderEvent(context, {
        target: $page.variables.messagesBannerADP,
        remove: {
          keys: [event.detail.messageId],
        },
      });

    }
  }

  return closeMessageBanner;
});
