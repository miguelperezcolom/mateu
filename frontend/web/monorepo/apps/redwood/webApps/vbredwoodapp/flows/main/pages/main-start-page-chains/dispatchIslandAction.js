/* Dispatcher de acciones de los bloques display: los átomos de la isla madre despachan
 * contra su contexto (runMateuIslandAction) y los fusionados desde la isla ANIDADA
 * (marcados fromNested en la proyección) contra el contexto anidado. Un botón con RouteLink
 * (route) NAVEGA (bridge.blockClickOf). */

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

  class dispatchIslandAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     * @param {boolean} params.fromNested
     * @param {string} params.route  the RouteLink of a navigating button
     */
    async run(context, { actionId, parameters, fromNested, route }) {
      const click = bridge.blockClickOf({ actionId, parameters, route });
      if (click.navigate) {
        await Actions.fireEvent(context, { name: 'application:mateuNavigate', payload: { route: click.navigate, force: true } });
        return;
      }
      await Actions.callChain(context, {
        chain: fromNested ? 'runMateuNestedAction' : 'runMateuIslandAction',
        params: { actionId, parameters },
      });
    }
  }

  return dispatchIslandAction;
});
