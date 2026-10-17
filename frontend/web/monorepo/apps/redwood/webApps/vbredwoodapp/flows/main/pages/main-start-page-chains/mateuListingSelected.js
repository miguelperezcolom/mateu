/* Listing row selection (Listing.rowsSelectionEnabled): stores what is checked as KEYS,
 * not as rows — the rows are resolved against the current ones when the action is launched, so a
 * listing refresh cannot send rows that are no longer there. A "select all" is stored
 * as such (all but the unchecked ones). It neither navigates nor requests anything: the selection only travels with
 * the host's next action (crud_selected_items, see runMateuAction). */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class mateuListingSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  oj-table's selectedChanged ({detail: {value: {row: KeySet}}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const value = (event && event.detail && event.detail.value) || {};
      $application.variables.mateuListingSelection = bridge.selectionOfKeySet(value.row);
    }
  }

  return mateuListingSelected;
});
