/* vb's Smart Search (collection header): the free text and the listing's FILTERS live in
 * smartFilters.value — Enter adds a chip {filter:'keyword', value}; a filter is applied from
 * its suggestion under the search box and edited in the component's popup; the ✕ removes it. Here
 * it is translated to Mateu's terms (concatenated text + filter values in the componentState) and
 * the listing's search is relaunched. */

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
        return; // programmatic change (the config the navigation projects), not the user's
      }
      const chips = (detail.value && detail.value.value) || [];
      const filters = (($application.variables.mateuListing || {}).filters) || [];
      const state = bridge.filterStateOfSmartFilters(filters, chips);
      // a chip just taken from the suggestions has no value yet: if nothing changes, no
      // search is run (its editor's popup is still open)
      const before = JSON.stringify($application.variables.mateuFilterValues || {});
      if (before === JSON.stringify(state.values)
        && state.searchText === ($application.variables.mateuLastSearchText || '')) {
        return;
      }
      $application.variables.mateuFilterValues = state.values;
      // the URL states the applied filters (as in Vaadin): a removed chip leaves the query, an added
      // one enters it. pushState: each filter change is a history entry Back returns to.
      const full = bridge.listingUrlOf($application.variables.mateuSelectedRoute || '',
        state.values, state.searchText);
      window.__mateuLoadedFull = full;
      if (window.__mateuUrlPathMode) {
        // only if the URL is this listing's (a context prefix, a master with tabs:
        // better not to touch it than to write a route that is not it)
        if (bridge.currentRoutePathOf(window.location) === full.split('?')[0]
            && bridge.currentRouteOf(window.location) !== full) {
          window.history.pushState(window.history.state, '', bridge.urlOfRoute(full));
        }
      } else if (window.location.hash !== '#' + full) {
        window.history.pushState(window.history.state, '', '#' + full);
      }
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: state.searchText },
      });
    }
  }

  return smartFiltersChanged;
});
