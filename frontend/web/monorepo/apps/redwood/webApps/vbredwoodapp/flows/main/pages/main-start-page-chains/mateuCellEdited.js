/* Inline editing (@InlineEditing): commit PER CELL — when a value is confirmed (blur/Enter)
 * the whole edited row is sent via the crud's update-row action with
 * parameters._editedRow (contract: fixtures/real/update-row.json — it answers ONLY a success
 * toast, no fragments: the edited value is already on the client). Guards: only user
 * edits (updatedFrom 'internal') and only real changes (the oj-* re-emit
 * value-changed when re-stamping the template after a listing refresh). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuCellEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event        value-changed of the cell editor
     * @param {Object} params.row          $current.row (row of the oj-table template)
     * @param {Object} params.item         $current.item (item.data variant)
     * @param {number} params.columnIndex  $current.columnIndex
     */
    async run(context, { event, row, item, columnIndex }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // programmatic change (binding/re-stamp), not a user edit
      }
      const listing = $application.variables.mateuListing;
      if (!listing || !listing.editable || columnIndex == null) {
        return;
      }
      const col = listing.columns[columnIndex];
      if (!col || !col.template) {
        return; // column without an editor (e.g. @ReadOnly)
      }
      const rowData = (row && row.data !== undefined) ? row.data
        : ((item && item.data) || row);
      if (!rowData) {
        return;
      }
      const value = detail.value;
      if (rowData[col.field] === value) {
        return; // no-op: same value
      }
      const edited = Object.assign({}, rowData);
      edited[col.field] = value;
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'update-row', parameters: { _editedRow: edited } },
      });
    }
  }

  return mateuCellEdited;
});
