/* Clic en una opción del landing de submenú: navega por el evento de aplicación
 * mateuNavigate (lo atiende la shell, dueña del registro y del menú). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuSubmenuNavigate extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed del navigation-list ({detail: {value}})
     */
    async run(context, { event }) {
      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const route = detail.value;
      if (!route) {
        return;
      }
      await Actions.fireEvent(context, {
        name: 'application:mateuNavigate',
        payload: { route },
      });
    }
  }

  return mateuSubmenuNavigate;
});
