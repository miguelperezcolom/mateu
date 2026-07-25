/* Edición inline (@InlineEditing): commit POR CELDA — al confirmar un valor (blur/Enter)
 * se envía la fila entera editada vía la acción update-row del crud con
 * parameters._editedRow (contrato: fixtures/real/update-row.json — responde SOLO un toast
 * success, sin fragments: el valor editado ya está en el cliente). Guardas: solo ediciones
 * del usuario (updatedFrom 'internal') y solo cambios reales (los oj-* re-emiten
 * value-changed al re-stampar la plantilla tras un refresco del listado). */

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
     * @param {Object} params.event        value-changed del editor de la celda
     * @param {Object} params.row          $current.row (fila del template de oj-table)
     * @param {Object} params.item         $current.item (variante item.data)
     * @param {number} params.columnIndex  $current.columnIndex
     */
    async run(context, { event, row, item, columnIndex }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // cambio programático (binding/re-stamp), no una edición del usuario
      }
      const listing = $application.variables.mateuListing;
      if (!listing || !listing.editable || columnIndex == null) {
        return;
      }
      const col = listing.columns[columnIndex];
      if (!col || !col.template) {
        return; // columna sin editor (p.ej. @ReadOnly)
      }
      const rowData = (row && row.data !== undefined) ? row.data
        : ((item && item.data) || row);
      if (!rowData) {
        return;
      }
      const value = detail.value;
      if (rowData[col.field] === value) {
        return; // no-op: mismo valor
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
