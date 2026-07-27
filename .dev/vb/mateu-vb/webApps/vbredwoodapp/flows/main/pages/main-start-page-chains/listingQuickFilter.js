/* Chip del selector RÁPIDO del listado (filtro enum junto al smart search): toggle del
 * valor (clic en el activo lo quita) y re-búsqueda conservando el texto del smart search.
 * El valor viaja en componentState[fieldId] (runMateuSearch lo mergea). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class listingQuickFilter extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId  id del campo filtro (p.ej. "vista")
     * @param {string} params.value    valor del chip pulsado
     */
    async run(context, { fieldId, value }) {
      const { $application } = context;

      if (!fieldId || !value) {
        return;
      }
      const current = $application.variables.mateuQuickFilter || {};
      $application.variables.mateuQuickFilter =
        (current.fieldId === fieldId && current.value === value)
          ? {} // clic en el chip activo → quitar el filtro
          : { fieldId: fieldId, value: value };
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: $application.variables.mateuLastSearchText || '' },
      });
    }
  }

  return listingQuickFilter;
});
