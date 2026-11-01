/* The rows marked on a listing NESTED in a page's content (oj-table selection on a listing with row
 * selection — a record's documents with "Delete selected"). They are kept by the bridge, by the
 * listing's key (the table's data-nested-key), and an action on that listing's toolbar carries
 * them as crud_selected_items (poc/core/listing.mjs withNestedSelection).
 */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class nestedListingSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Event} params.event  the oj-table's selectedChanged
     */
    async run(context, { event }) {
      const table = event && event.target;
      const key = table && table.dataset ? table.dataset.nestedKey : '';
      const row = event && event.detail && event.detail.value && event.detail.value.row;
      bridge.setNestedSelection(key, row);
    }
  }

  return nestedListingSelected;
});
