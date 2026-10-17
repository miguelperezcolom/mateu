/* Listing pagination: a button in the table footer (data-page = first|prev|next|last) →
 * the target page over the current paging (the one the server sent) → runMateuSearch with the
 * same text, the same filters and the same sort. */

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

  class listingPaged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.which  first | prev | next | last
     */
    async run(context, { which }) {
      const { $application } = context;
      const listing = $application.variables.mateuListing;
      const target = bridge.targetPageOf(listing && listing.paging, which);
      if (target == null) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: $application.variables.mateuLastSearchText || '', page: target },
      });
    }
  }

  return listingPaged;
});
