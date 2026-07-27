/* Tecleo en el buscador del Ask Oracle: re-filtra los destinos en vivo. */

define([
  'vb/action/actionChain',
  './askOracleOpen',
], (
  ActionChain,
  askOracleOpen,
) => {
  'use strict';

  class askOracleTyped extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  rawValueChanged ({detail: {value}})
     */
    async run(context, { event }) {
      const { $application, $page } = context;
      const text = event && event.detail ? event.detail.value : '';
      $page.variables.mateuAskResults = askOracleOpen.buildResults($application, text);
    }
  }

  return askOracleTyped;
});
