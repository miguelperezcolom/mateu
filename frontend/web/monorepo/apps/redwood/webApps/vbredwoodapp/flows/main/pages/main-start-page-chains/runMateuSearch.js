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
     * @param {number} [params.page]  la página pedida (el pie de la tabla); sin ella, la primera
     */
    async run(context, { searchText, page }) {
      const { $application } = context;

      // idem que en runMateuAction: el listado se busca en el backend del que se cargó
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || bridge.mateuBase($application.constants.mateuBaseUrl);
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const listing = bridge.listingOf(host);
      if (!listing) {
        return;
      }

      // filtros aplicados (los chips del smart search) y el orden de la cabecera → viajan en el
      // componentState, que es donde SearchActionHandler los lee; un rango ocupa dos claves.
      // Paginar conserva texto, filtros y orden; buscar o filtrar vuelve a la primera página.
      const componentState = bridge.listingSearchStateOf(host.state, {
        searchText,
        page: page || 0,
        size: listing.pageSize,
        filters: $application.variables.mateuFilterValues || {},
        sort: $application.variables.mateuListingSort || [],
      });
      $application.variables.mateuLastSearchText = searchText == null ? '' : searchText;
      const route = $application.variables.mateuSelectedRoute;
      const increment = await bridge.runMateuAction(base, host, route, 'search', componentState, { appState: $application.variables.mateuAppState || {} });
      const reg = bridge.reduceContexts(before, increment);
      bridge.applyDomEffects(reg.effects, reg);
      $application.variables.mateuRegistry = reg;

      const refreshed = bridge.listingOf(reg.contexts[bridge.HOST_ID]);
      $application.variables.mateuListing = refreshed;
      $application.variables.mateuListingRows = refreshed ? refreshed.rows : [];
      // otra página, otras filas: la selección (claves _rowNumber de la página) no se hereda
      if (page) {
        $application.variables.mateuListingSelection = { all: false, keys: [], except: [] };
      }
      // los chips de filtro NO se re-proyectan aquí: los lleva el propio smart-filters, que es
      // quien ha lanzado esta búsqueda (reasignarle la config le cerraría el popup abierto)
    }
  }

  return runMateuSearch;
});
