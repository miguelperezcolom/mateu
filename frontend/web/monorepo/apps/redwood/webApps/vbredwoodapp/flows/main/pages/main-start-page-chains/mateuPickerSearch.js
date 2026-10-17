/* Search and pagination of a @Searchable's SELECTOR: its listing's `search`, against ITS
 * ServerSide (the overlay), with searchText/page/size in the overlay's draft. */

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
     * @param {string} params.searchText  the searched text (undefined: the one already there)
     * @param {Object} params.event       the page button pressed (data-page: prev | next)
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
