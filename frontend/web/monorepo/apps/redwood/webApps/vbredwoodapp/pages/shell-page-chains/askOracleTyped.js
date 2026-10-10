/* Tecleo en el buscador del Ask Oracle: re-filtra los destinos en vivo y, si el App tiene un
 * GlobalSearchSupplier, busca también sus entidades (debounce 250ms; la respuesta de un tecleo
 * viejo no pisa la del último) — bridge.fetchGlobalSearch / paletteRowsOfHits (poc/globalSearch.mjs). */

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
