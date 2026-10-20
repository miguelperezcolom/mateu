/* The selection checkbox of a listing CARD (gridLayout = cards with Listing.rowsSelectionEnabled):
 * adds or removes that row's key in the listing selection — the same KEYS the table's selection
 * stores (mateuListingSelected), so the host's next action sends them as crud_selected_items.
 * Only a user change counts: the binding (re)stamping the card's value is not a selection. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class mateuCardSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.rowKey  the card's row key (_rowNumber, from data-row-key)
     * @param {Array} params.value  the checkboxset's value (['selected'] when checked)
     * @param {string} params.updatedFrom  'internal' for a user change
     */
    async run(context, { rowKey, value, updatedFrom }) {
      const { $application } = context;
      if (updatedFrom && updatedFrom !== 'internal') {
        return;
      }
      const rows = $application.variables.mateuListingRows || [];
      const row = rows.find((r) => String(r._rowNumber) === String(rowKey));
      if (!row) {
        return;
      }
      $application.variables.mateuListingSelection = bridge.toggleSelectionKey(
        $application.variables.mateuListingSelection, row._rowNumber, Array.isArray(value) && value.length > 0);
    }
  }

  return mateuCardSelected;
});
