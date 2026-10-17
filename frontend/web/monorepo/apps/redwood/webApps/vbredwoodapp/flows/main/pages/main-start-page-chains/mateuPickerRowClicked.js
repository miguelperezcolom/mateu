/* Click on a row of a @Searchable's SELECTOR: chooses it (action-on-row-select, the row in
 * _clickedRow) — in a multi-valued field, adds it. The response (value-changed /
 * data-changed / close-modal-requested) is applied to the form by runMateuAction, which closes it.
 * In a LISTING embedded in an overlay (pickWithRow) it is the listing's `view` with the row. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class mateuPickerRowClicked extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojRowAction ({detail: {context: {key, item…}}})
     */
    async run(context, { event }) {
      const { $page } = context;
      const detail = (event && event.detail) || {};
      // the selection checkbox does not choose: it checks
      const origin = detail.originalEvent && detail.originalEvent.target;
      if (origin && origin.closest && origin.closest('.oj-table-checkbox-cell, oj-selector, input[type="checkbox"]')) {
        return;
      }
      const rowContext = detail.context || {};
      let row = rowContext.item && rowContext.item.data;
      if (!row && rowContext.key != null) {
        row = ($page.variables.mateuPickerRows || []).find((r) => r._rowNumber === rowContext.key);
      }
      const picker = $page.variables.mateuPicker || {};
      if (!row || !picker.pickActionId) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        // a listing's row click is its `view` with the row as it arrived (as on a page); a
        // selector's pick carries the clicked row
        params: { actionId: picker.pickActionId, parameters: picker.pickWithRow
          ? bridge.rowAsArrived(JSON.parse(JSON.stringify(row)))
          : { _clickedRow: JSON.parse(JSON.stringify(row)) } },
      });
    }
  }

  return mateuPickerRowClicked;
});
