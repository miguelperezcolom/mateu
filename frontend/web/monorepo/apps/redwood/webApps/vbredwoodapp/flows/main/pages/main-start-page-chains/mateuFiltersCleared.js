/* Quita todos los filtros de golpe y vuelve a buscar. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuFiltersCleared extends ActionChain {

    async run(context) {
      const { $application } = context;
      $application.variables.mateuFilterValues = {};
      $application.variables.mateuFilterEditing = null;
      $application.variables.mateuFilterDraft = {};
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: $application.variables.mateuLastSearchText || '' },
      });
    }
  }

  return mateuFiltersCleared;
});
