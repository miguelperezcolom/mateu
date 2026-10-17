/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root) */

// The user closes a notice of the shell's message band.
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
