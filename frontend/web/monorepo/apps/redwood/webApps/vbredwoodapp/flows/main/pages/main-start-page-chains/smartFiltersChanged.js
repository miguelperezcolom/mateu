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
      // la URL dice los filtros aplicados (como en Vaadin): un chip quitado sale de la query, uno
      // puesto entra. replaceState: filtrar no es una pantalla nueva en el historial.
      const full = bridge.listingUrlOf($application.variables.mateuSelectedRoute || '',
        state.values, state.searchText);
      window.__mateuLoadedFull = full;
      if (window.__mateuUrlPathMode) {
        // sólo si la URL es la de este listado (un prefijo de contexto, un maestro con pestañas:
        // mejor no tocarla que escribir una ruta que no es)
        if (window.location.pathname === full.split('?')[0]
            && window.location.pathname + (window.location.search || '') !== full) {
          window.history.replaceState(window.history.state, '', full);
        }
      } else if (window.location.hash !== '#' + full) {
        window.history.replaceState(window.history.state, '', '#' + full);
      }
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: state.searchText },
      });
    }
  }

  return smartFiltersChanged;
});
