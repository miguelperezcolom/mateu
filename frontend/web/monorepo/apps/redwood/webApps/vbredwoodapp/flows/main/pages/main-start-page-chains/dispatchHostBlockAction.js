/* Dispatcher de los bloques display del HOST (detalle standalone / pasos del wizard):
 * los átomos normales despachan contra el HOST (runMateuAction) y los fusionados desde
 * la isla del host (fromNested — p.ej. el documento del check-in) contra su contexto de
 * isla (runMateuIslandAction). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class dispatchHostBlockAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     * @param {boolean} params.fromNested
     * @param {string} params.surfaceId  the surface a MicroFrontend atom belongs to
     */
    async run(context, { actionId, parameters, fromNested, surfaceId }) {
      // an atom of a surface of its own (a MicroFrontend) goes back to that surface
      if (surfaceId) {
        await Actions.callChain(context, { chain: 'runMateuSurfaceAction', params: { surfaceId, actionId, parameters } });
        return;
      }
      await Actions.callChain(context, {
        chain: fromNested ? 'runMateuIslandAction' : 'runMateuAction',
        params: { actionId, parameters },
      });
    }
  }

  return dispatchHostBlockAction;
});
