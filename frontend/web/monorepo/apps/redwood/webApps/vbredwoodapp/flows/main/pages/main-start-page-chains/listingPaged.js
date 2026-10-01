/* Paginación del listing: un botón del pie de la tabla (data-page = first|prev|next|last) →
 * la página destino sobre el paging actual (el que mandó el server) → runMateuSearch con el
 * mismo texto, los mismos filtros y el mismo orden. */

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
