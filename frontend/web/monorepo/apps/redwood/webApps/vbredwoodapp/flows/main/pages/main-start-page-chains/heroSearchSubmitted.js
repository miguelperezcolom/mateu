/* Hero search (YAML HeroSearchPage): the first search turns the template from its landing hero into its
 * collection view (results under a compact header, Spectra's collectionView) and runs the listing's
 * search. A navigation re-projects mateuHs, so the page opens as the hero again. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class heroSearchSubmitted extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.searchText
     */
    async run(context, { searchText }) {
      const { $application } = context;

      if ($application.variables.mateuHs) {
        $application.variables.mateuHs = Object.assign({}, $application.variables.mateuHs, { collection: 'on' });
      }
      await Actions.callChain(context, { chain: 'runMateuSearch', params: { searchText } });
    }
  }

  return heroSearchSubmitted;
});
