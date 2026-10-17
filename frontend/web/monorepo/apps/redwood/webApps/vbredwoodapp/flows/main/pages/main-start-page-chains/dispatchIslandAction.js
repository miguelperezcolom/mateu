/* Dispatcher of the display blocks' actions: the atoms of the parent island dispatch
 * against its context (runMateuIslandAction) and those merged from the NESTED island
 * (marked fromNested in the projection) against the nested context. A button with a RouteLink
 * (route) NAVIGATES (bridge.blockClickOf). */

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
