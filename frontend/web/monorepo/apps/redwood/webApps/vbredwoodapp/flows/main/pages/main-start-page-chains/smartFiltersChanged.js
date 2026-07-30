/* Smart Search de vb (header de colección): el usuario teclea y Enter añade un chip
 * {filter:'keyword', value} a smartFilters.value (quitarlo lo elimina) — se concatenan
 * los keywords y se relanza el search del listado con ese texto. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class smartFiltersChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  smartFiltersChanged ({detail: {value, updatedFrom}})
     */
    async run(context, { event }) {
      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // cambio programático (seed del binding), no una búsqueda del usuario
      }
      const filters = (detail.value && detail.value.value) || [];
      const searchText = filters
        .filter((f) => f.filter === 'keyword')
        .map((f) => f.value)
        .join(' ');
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText },
      });
    }
  }

  return smartFiltersChanged;
});
