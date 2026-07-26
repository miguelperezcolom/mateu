/* Dispatcher de acciones de los bloques display: los átomos de la isla madre despachan
 * contra su contexto (runMateuIslandAction) y los fusionados desde la isla ANIDADA
 * (marcados fromNested en la proyección) contra el contexto anidado. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class dispatchIslandAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     * @param {boolean} params.fromNested
     */
    async run(context, { actionId, parameters, fromNested }) {
      await Actions.callChain(context, {
        chain: fromNested ? 'runMateuNestedAction' : 'runMateuIslandAction',
        params: { actionId, parameters },
      });
    }
  }

  return dispatchIslandAction;
});
