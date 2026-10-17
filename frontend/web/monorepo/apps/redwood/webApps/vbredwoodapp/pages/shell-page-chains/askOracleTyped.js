/* Typing in the Ask Oracle search box: re-filters the destinations live and, if the App has a
 * GlobalSearchSupplier, also searches its entities (debounce 250ms; the response to an old
 * keystroke does not overwrite the latest one's) — bridge.fetchGlobalSearch / paletteRowsOfHits (poc/globalSearch.mjs). */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
  './askOracleOpen',
], (
  ActionChain,
  bridge,
  askOracleOpen,
) => {
  'use strict';

  let typedSeq = 0;

  class askOracleTyped extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  rawValueChanged ({detail: {value}})
     */
    async run(context, { event }) {
      const { $application, $page } = context;
      const text = event && event.detail ? event.detail.value : '';
      const local = askOracleOpen.buildResults($application, text);
      $page.variables.mateuAskResults = local;
      if (!$application.variables.mateuGlobalSearch || !String(text || '').trim()) return;
      const seq = ++typedSeq;
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (seq !== typedSeq) return;
      let hits = [];
      try {
        hits = await bridge.fetchGlobalSearch(bridge.mateuBase($application.constants.mateuBaseUrl),
          $application.variables.mateuShellSST, $application.variables.mateuAppState || {}, text);
      } catch (ignored) { /* the destinations stay */ }
      if (seq !== typedSeq) return;
      $page.variables.mateuAskResults = local.concat(bridge.paletteRowsOfHits(hits));
    }
  }

  return askOracleTyped;
});
