/* Acción de FILA del listado (ColumnActionGroup): despacha action-on-row-<método> con el
 * id de la fila — Listing.handleActionOnRow invoca el método en el server; el refresco
 * llega por el bus (dispatchEvent + @Trigger OnCustomEvent → search). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class listingRowAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.methodName  método anunciado en el ColumnAction
     * @param {string} params.rowId       id de la fila
     */
    async run(context, { methodName, rowId }) {
      if (!methodName) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: {
          actionId: 'action-on-row-' + methodName,
          parameters: { id: rowId },
        },
      });
    }
  }

  return listingRowAction;
});
