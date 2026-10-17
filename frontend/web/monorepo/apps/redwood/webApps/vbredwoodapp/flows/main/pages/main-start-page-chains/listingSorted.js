/* Listing sort: oj-table's header (ojSort) sorts ON THE SERVER — the table only has
 * the current page, and sorting it locally would lie about the others. The sort is stored (the
 * following pages keep it) and it goes back to the first page. */

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

  class listingSorted extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojSort ({detail: {header, direction}})
     */
    async run(context, { event }) {
      const { $application } = context;
      const sort = bridge.listingSortOf(event && event.detail,
        ($application.variables.mateuListing || {}).sortFields);
      if (!sort.length) {
        return;
      }
      $application.variables.mateuListingSort = sort;
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: $application.variables.mateuLastSearchText || '', page: 0 },
      });
    }
  }

  return listingSorted;
});
