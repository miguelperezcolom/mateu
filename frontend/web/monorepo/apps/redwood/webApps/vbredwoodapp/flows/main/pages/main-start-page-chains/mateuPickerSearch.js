/* Búsqueda y paginación del SELECTOR de un @Searchable: el `search` de su listado, contra SU
 * ServerSide (el overlay), con searchText/page/size en el borrador del overlay. */

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

  class mateuPickerSearch extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.searchText  el texto buscado (undefined: el que ya había)
     * @param {Object} params.event       el botón de página pulsado (data-page: prev | next)
     */
    async run(context, { searchText, event }) {
      const { $page } = context;
      const picker = $page.variables.mateuPicker;
      if (!picker) {
        return;
      }
      let page = 0;
      const step = event && event.target && event.target.closest
        && (event.target.closest('[data-page]') || {}).dataset;
      if (step && step.page && picker.paging) {
        page = Math.max(0, picker.paging.pageNumber + (step.page === 'next' ? 1 : -1));
      }
      $page.variables.mateuDrawerDraft = Object.assign({}, $page.variables.mateuDrawerDraft,
        bridge.pickerSearchStateOf(picker, { searchText, page }));
      await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: 'search' } });
    }
  }

  return mateuPickerSearch;
});
