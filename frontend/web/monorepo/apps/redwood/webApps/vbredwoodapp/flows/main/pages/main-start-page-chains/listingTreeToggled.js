/* A row of a tree listing (gridLayout: tree) opened or closed. The value is stored in the bridge and
 * the listing is re-projected from the registry in memory — no round trip to the server. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class listingTreeToggled extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.key    the row's client-state key (listing-tree:…)
     * @param {*}      params.value  its new value
     */
    async run(context, { key, value }) {
      const { $application } = context;
      if (!key) return;
      bridge.setUiValue(key, value);
      const listing = bridge.listingOf($application.variables.mateuRegistry.contexts[bridge.HOST_ID]);
      $application.variables.mateuListing = listing;
      $application.variables.mateuListingRows = listing ? listing.rows : [];
    }
  }

  return listingTreeToggled;
});
