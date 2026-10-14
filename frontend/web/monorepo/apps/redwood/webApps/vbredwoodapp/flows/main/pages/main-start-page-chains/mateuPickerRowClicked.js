/* Clic en una fila del SELECTOR de un @Searchable: la elige (action-on-row-select, la fila en
 * _clickedRow) — en un campo de varios valores, la añade. La respuesta (value-changed /
 * data-changed / close-modal-requested) la aplica runMateuAction al formulario y cierra.
 * En un LISTADO incrustado en un overlay (pickWithRow) es el `view` del listado con la fila. */

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
      // la casilla de selección no elige: marca
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
