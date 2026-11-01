/* Dispatcher of the HOST display blocks (standalone detail / wizard steps):
 * the normal atoms dispatch against the HOST (runMateuAction) and those merged from
 * the host's island (fromNested — e.g. the check-in document) against their island
 * context (runMateuIslandAction). A button with a RouteLink (route) NAVIGATES (bridge.blockClickOf). */

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

  class dispatchHostBlockAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     * @param {boolean} params.fromNested
     * @param {string} params.surfaceId  the surface a MicroFrontend atom belongs to
     * @param {string} params.route  the RouteLink of a navigating button
     * @param {string} params.ctaId  a component that paints buttons from props (oj-sp-welcome-page's
     *   secondaryActions) says WHICH by an id of its own…
     * @param {Object} params.ctas  …that this map resolves to its { actionId, route }
     */
    async run(context, { actionId, parameters, fromNested, surfaceId, route, ctaId, ctas }) {
      if (ctaId && ctas && ctas[ctaId]) ({ actionId, route } = ctas[ctaId]);
      const click = bridge.blockClickOf({ actionId, parameters, route , state: bridge.routeStateOf(context.$application.variables.mateuRegistry, context.$page && context.$page.variables.mateuDraft)});
      if (click.navigate) {
        await Actions.fireEvent(context, { name: 'application:mateuNavigate', payload: { route: click.navigate, force: true } });
        return;
      }
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
