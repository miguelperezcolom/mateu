/* An action of a surface of its own inside the content — a MicroFrontend, loaded from ITS backend,
 * or an INLINE island (a form's component field holding a ServerSide: bridge.runSurfaceAction posts
 * it with the island's class, reduces the answer, delivers the bus events it emitted to the page and
 * the other islands by @SubscribeTo scope, and registers the islands a host re-render brought) —
 * then the content is projected again (poc/reproject.mjs) and its messages shown. */

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

  class runMateuSurfaceAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.surfaceId
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { surfaceId, actionId, parameters }) {
      const { $application, $page } = context;
      let reg;
      try {
        reg = await bridge.runSurfaceAction($application.variables.mateuRegistry, surfaceId, actionId, parameters,
          { appState: $application.variables.mateuAppState || {} });
      } catch (e) {
        if (bridge.isStaleResponse(e)) return;
        throw e;
      }
      bridge.applyDomEffects(reg.effects || {}, reg);
      $application.variables.mateuRegistry = reg;
      const next = bridge.reprojectedContentOf($application.variables);
      if (next.hostContent) {
        $application.variables.mateuHostContent = next.hostContent;
        bridge.mountElementsSoon(bridge.elementAtomsOf(next.hostContent));
      }
      for (const toast of (reg.effects && reg.effects.toasts) || []) {
        const notification = bridge.bannerNotificationOf(toast);
        if (notification) { await Actions.fireNotificationEvent(context, notification); continue; }
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
      }
    }
  }

  return runMateuSurfaceAction;
});
