/* Click on a top-level option of the topbar (MENU_ON_TOP variant): the route travels in
 * the button's data-route. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuTopbarNav extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojAction of the oj-button
     */
    async run(context, { event }) {
      const route = event && event.target && event.target.dataset && event.target.dataset.route;
      if (!route) {
        return;
      }
      // a card of a card menu: its popup closes on navigating
      for (const popup of document.querySelectorAll('oj-popup.mateu-card-popup')) {
        if (popup.isOpen && popup.isOpen()) popup.close();
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { currentId: route } } },
      });
    }
  }

  return onMateuTopbarNav;
});
