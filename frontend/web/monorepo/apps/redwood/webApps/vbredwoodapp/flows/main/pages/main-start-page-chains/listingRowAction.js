/* Acción de FILA del listado (ColumnActionGroup): despacha action-on-row-<método> con la
 * fila — su id y la fila entera en `_clickedRow`, como Vaadin — y Listing.handleActionOnRow
 * invoca el método en el server; el refresco llega por el bus (dispatchEvent + @Trigger
 * OnCustomEvent → search). */

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
     * @param {string} params.rowKey      clave de la fila en la tabla (_rowNumber)
     */
    async run(context, { methodName, rowId, rowKey }) {
      if (!methodName) {
        return;
      }
      const rows = context.$application.variables.mateuListingRows || [];
      const row = rows.find((r) => String(r._rowNumber) === String(rowKey))
        || rows.find((r) => r.id != null && String(r.id) === String(rowId));
      const parameters = { id: rowId };
      if (row) {
        parameters._clickedRow = row;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: {
          actionId: 'action-on-row-' + methodName,
          parameters,
        },
      });
    }
  }

  return listingRowAction;
});
