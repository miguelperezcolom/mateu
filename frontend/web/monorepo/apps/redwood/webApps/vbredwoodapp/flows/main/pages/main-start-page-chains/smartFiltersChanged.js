/* Smart Search de vb (header de colección): el texto libre y los FILTROS del listado viven en
 * smartFilters.value — Enter añade un chip {filter:'keyword', value}; un filtro se aplica desde
 * su sugerencia bajo el buscador y se edita en el popup del componente; la ✕ lo quita. Aquí se
 * traduce a lo de Mateu (texto concatenado + valores de filtro del componentState) y se
 * relanza el search del listado. */

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

  class smartFiltersChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  smartFiltersChanged ({detail: {value, updatedFrom}})
     */
    async run(context, { event }) {
      const { $application } = context;
      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // cambio programático (la config que proyecta la navegación), no del usuario
      }
      const chips = (detail.value && detail.value.value) || [];
      const filters = (($application.variables.mateuListing || {}).filters) || [];
      const state = bridge.filterStateOfSmartFilters(filters, chips);
      // un chip recién sacado de las sugerencias aún no tiene valor: si nada cambia, no se
      // busca (el popup de su editor sigue abierto)
      const before = JSON.stringify($application.variables.mateuFilterValues || {});
      if (before === JSON.stringify(state.values)
        && state.searchText === ($application.variables.mateuLastSearchText || '')) {
        return;
      }
      $application.variables.mateuFilterValues = state.values;
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: state.searchText },
      });
    }
  }

  return smartFiltersChanged;
});
