/* Phase 4: listing search — the text travels in componentState.searchText (that is how
 * SearchActionHandler reads it); the response is a data-only fragment that merges the rows into
 * ctx.data.crud.page, and the table is re-projected here. */

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
     * @param {number} [params.page]  the requested page (the table footer); without it, the first one
     */
    async run(context, { searchText, page }) {
      const { $application } = context;

      // same as in runMateuAction: the listing is searched on the backend it was loaded from
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || bridge.mateuBase($application.constants.mateuBaseUrl);
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const listing = bridge.listingOf(host);
      if (!listing) {
        return;
      }

      // applied filters (the smart search chips) and the header's sort → travel in the
      // componentState, which is where SearchActionHandler reads them; a range takes two keys.
      // Paging keeps text, filters and sort; searching or filtering goes back to the first page.
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

      // the URL states the listing's state — filters, text, PAGE and SORT — as in Vaadin and in
      // the static bundle: coming back from a record, reloading or sharing the link keeps it.
      // pushState: a page, a sort or a search the user asked for is a history entry — Back returns
      // to the previous one (onMateuNavigate reloads it from the URL), as the listing doc promises
      const full = bridge.listingUrlOf(route || '', $application.variables.mateuFilterValues || {},
        $application.variables.mateuLastSearchText || '',
        { page: page || 0, sort: $application.variables.mateuListingSort || [] });
      window.__mateuLoadedFull = full;
      if (window.__mateuUrlPathMode) {
        if (bridge.currentRoutePathOf(window.location) === full.split('?')[0]
            && bridge.currentRouteOf(window.location) !== full) {
          window.history.pushState(window.history.state, '', bridge.urlOfRoute(full));
        }
      } else if (window.location.hash !== '#' + full) {
        window.history.pushState(window.history.state, '', '#' + full);
      }

      const refreshed = bridge.listingOf(reg.contexts[bridge.HOST_ID]);
      $application.variables.mateuListing = refreshed;
      $application.variables.mateuListingRows = refreshed ? refreshed.rows : [];
      // another page, other rows: the selection (the page's _rowNumber keys) is not inherited
      if (page) {
        $application.variables.mateuListingSelection = { all: false, keys: [], except: [] };
      }
      // the filter chips are NOT re-projected here: smart-filters itself carries them, being
      // the one that launched this search (reassigning its config would close the open popup)
    }
  }

  return runMateuSearch;
});
