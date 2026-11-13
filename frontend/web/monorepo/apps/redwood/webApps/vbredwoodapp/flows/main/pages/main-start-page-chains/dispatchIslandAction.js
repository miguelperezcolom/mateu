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
     * @param {string} params.surfaceId  the surface (MicroFrontend / inline island) the atom belongs to
     */
    async run(context, { actionId, parameters, fromNested, route, surfaceId }) {
      const click = bridge.blockClickOf({ actionId, parameters, route, state: bridge.routeStateOf(context.$application.variables.mateuRegistry, context.$page?.variables.mateuDraft) });
      if (click.navigate) {
        await Actions.fireEvent(context, { name: 'application:mateuNavigate', payload: { route: click.navigate, force: true } });
        return;
      }
      // nobody on screen claims it (a YAML Button with a label and no action): inert, as on Vaadin
      if (!bridge.contentActionIsClaimed(context.$application.variables.mateuRegistry, actionId)) return;
      // an atom of a surface of its own goes back to that surface
      if (surfaceId && (context.$application.variables.mateuRegistry.contexts || {})[surfaceId]) {
        await Actions.callChain(context, { chain: 'runMateuSurfaceAction', params: { surfaceId, actionId, parameters } });
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
