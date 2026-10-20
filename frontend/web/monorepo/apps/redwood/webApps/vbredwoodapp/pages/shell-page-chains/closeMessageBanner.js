/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root) */

// The user closes a notice of the shell's message band. oj-sp-messages-banner's spClose carries
// { messageId } (the key of its inner oj-message-banner's ojClose, which carries { key }).
define(['vb/action/actionChain', 'vb/action/actions'], (ActionChain, Actions) => {
  'use strict';

  class closeMessageBanner extends ActionChain {
    async run(context, { event }) {
      const detail = (event && event.detail) || {};
      const key = detail.messageId != null ? detail.messageId : detail.key;
      if (key == null) return;
      // the band's ids are text (MessagesBannerType.id, showNotificationMessage)
      await Actions.fireDataProviderEvent(context, {
        target: context.$page.variables.messagesBannerADP,
        remove: { keys: [String(key)] },
      });
    }
  }

  return closeMessageBanner;
});
