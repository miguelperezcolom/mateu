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
      // selector rápido activo (chips junto al smart search) → viaja como filtro
      const quick = $application.variables.mateuQuickFilter || {};
      if (quick.fieldId && quick.value) {
        componentState[quick.fieldId] = quick.value;
      }
      $application.variables.mateuLastSearchText = searchText == null ? '' : searchText;
      const route = $application.variables.mateuSelectedRoute;
      const increment = await bridge.runMateuAction(base, host, route, 'search', componentState, { appState: $application.variables.mateuAppState || {} });
      const reg = bridge.reduceContexts(before, increment);
      $application.variables.mateuRegistry = reg;

      const refreshed = bridge.listingOf(reg.contexts[bridge.HOST_ID]);
      $application.variables.mateuListing = refreshed;
      $application.variables.mateuListingRows = refreshed ? refreshed.rows : [];
    }
  }

  return runMateuSearch;
});
