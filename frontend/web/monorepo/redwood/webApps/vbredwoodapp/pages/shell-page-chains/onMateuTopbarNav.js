/* Clic en una opción de primer nivel del topbar (variante MENU_ON_TOP): la ruta viaja en
 * el data-route del botón. */

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
     * @param {Object} params.event  ojAction del oj-button
     */
    async run(context, { event }) {
      const route = event && event.target && event.target.dataset && event.target.dataset.route;
      if (!route) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { currentId: route } } },
      });
    }
  }

  return onMateuTopbarNav;
});
