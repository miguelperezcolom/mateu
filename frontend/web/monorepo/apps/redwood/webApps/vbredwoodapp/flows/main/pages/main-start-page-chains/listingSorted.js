/* Orden del listing: la cabecera de oj-table (ojSort) ordena EN EL SERVER — la tabla sólo tiene
 * la página actual, y ordenarla en local mentiría sobre las demás. El orden se guarda (lo
 * conservan las páginas siguientes) y se vuelve a la primera página. */

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
      const sort = bridge.listingSortOf(event && event.detail);
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
