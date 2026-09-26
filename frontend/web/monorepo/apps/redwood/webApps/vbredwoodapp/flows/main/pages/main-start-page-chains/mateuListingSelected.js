/* Selección de filas del listing (Listing.rowsSelectionEnabled): guarda lo marcado como CLAVES,
 * no como filas — las filas se resuelven contra las actuales al lanzar la acción, así un
 * refresco del listado no deja mandar filas que ya no están. Un "seleccionar todo" se guarda
 * como tal (todas menos las desmarcadas). No navega ni pide nada: la selección solo viaja con
 * la siguiente acción del host (crud_selected_items, ver runMateuAction). */

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
     * @param {Object} params.event  selectedChanged de oj-table ({detail: {value: {row: KeySet}}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const value = (event && event.detail && event.detail.value) || {};
      $application.variables.mateuListingSelection = bridge.selectionOfKeySet(value.row);
    }
  }

  return mateuListingSelected;
});
