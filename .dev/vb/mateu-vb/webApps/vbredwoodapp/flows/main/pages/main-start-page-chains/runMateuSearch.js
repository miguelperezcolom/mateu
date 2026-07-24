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

      const base = $application.constants.mateuBaseUrl;
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
      const route = $application.variables.mateuSelectedRoute;
      const increment = await bridge.runMateuAction(base, host, route, 'search', componentState);
      const reg = bridge.reduceContexts(before, increment);
      $application.variables.mateuRegistry = reg;

      const refreshed = bridge.listingOf(reg.contexts[bridge.HOST_ID]);
      $application.variables.mateuListing = refreshed;
      $application.variables.mateuListingRows = refreshed ? refreshed.rows : [];
    }
  }

  return runMateuSearch;
});
