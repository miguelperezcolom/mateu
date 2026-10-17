/* Listing ROW action (ColumnActionGroup): dispatches action-on-row-<method> with the
 * row — its id and the whole row in `_clickedRow`, as Vaadin does — and Listing.handleActionOnRow
 * invokes the method on the server; the refresh arrives through the bus (dispatchEvent + @Trigger
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
     * @param {string} params.methodName  method announced in the ColumnAction
     * @param {string} params.rowId       id of the row
     * @param {string} params.rowKey      key of the row in the table (_rowNumber)
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
