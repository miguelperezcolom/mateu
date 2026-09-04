/* Fase 4: búsqueda del listing — el texto viaja en componentState.searchText (así lo lee
 * SearchActionHandler); la respuesta es un fragmento data-only que mergea las filas en
 * ctx.data.crud.page y aquí se re-proyecta la tabla. */

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

  class runMateuSearch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.searchText
     */
    async run(context, { searchText }) {
      const { $application } = context;

      // idem que en runMateuAction: el listado se busca en el backend del que se cargó
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || $application.constants.mateuBaseUrl;
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const listing = bridge.listingOf(host);
      if (!listing) {
        return;
      }

      const componentState = Object.assign({}, host.state, {
        searchText: searchText == null ? '' : searchText,
        page: 0,
        size: listing.pageSize,
      });
      // filtros aplicados (los chips bajo el smart search) → viajan en el componentState,
      // que es donde SearchActionHandler los lee; un rango ocupa dos claves
      const applied = $application.variables.mateuFilterValues || {};
      for (const key of Object.keys(applied)) {
        componentState[key] = applied[key];
      }
      $application.variables.mateuLastSearchText = searchText == null ? '' : searchText;
      const route = $application.variables.mateuSelectedRoute;
      const increment = await bridge.runMateuAction(base, host, route, 'search', componentState, { appState: $application.variables.mateuAppState || {} });
      const reg = bridge.reduceContexts(before, increment);
      $application.variables.mateuRegistry = reg;

      const refreshed = bridge.listingOf(reg.contexts[bridge.HOST_ID]);
      $application.variables.mateuListing = refreshed;
      $application.variables.mateuListingRows = refreshed ? refreshed.rows : [];
      // los filtros declarados viajan en cada respuesta del listado: re-proyectar los chips
      // aquí es lo que hace que el estado aplicado y lo que se ve no se separen nunca
      $application.variables.mateuFilterChips = bridge.filterChipsOf(
        (refreshed && refreshed.filters) || [], applied);
      $application.variables.mateuHasAppliedFilters =
        $application.variables.mateuFilterChips.filter((c) => c.applied).length > 0;
    }
  }

  return runMateuSearch;
});
