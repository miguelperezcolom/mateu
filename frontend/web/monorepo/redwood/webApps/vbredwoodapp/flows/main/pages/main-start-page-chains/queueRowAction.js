/* Opción de LÍNEA de una card del TaskQueue (p.ej. "Check-out" en las reservas in house):
 * despacha el actionId del ITEM con {_item} contra el HOST. Deja marca temporal para que
 * el clic de card que el mismo gesto provoca (el botón vive dentro de la oj-action-card)
 * se reconozca como eco y no dispare además el openGuest. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class queueRowAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { actionId, parameters }) {
      if (!actionId) {
        return;
      }
      window.__mateuQueueRowActionAt = Date.now();
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId, parameters },
      });
    }
  }

  return queueRowAction;
});
