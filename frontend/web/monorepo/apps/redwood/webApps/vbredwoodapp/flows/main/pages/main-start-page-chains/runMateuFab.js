/* A floating action button (@Fab, bridge.fabsOf): a page FAB runs its action on the host, like
 * any button of the page; an app FAB is an app-level action (bridge.runAppLevelAction), whose
 * toasts and navigation are applied here. */

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

  class runMateuFab extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {boolean} params.appLevel
     */
    async run(context, { actionId, appLevel }) {
      const { $application, $page } = context;
      if (!actionId) return;
      if (!appLevel) {
        await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId } });
        return;
      }
      const increment = await bridge.runAppLevelAction(bridge.mateuBase($application.constants.mateuBaseUrl),
        $application.variables.mateuShellSST, $application.variables.mateuAppState || {}, actionId);
      const reg = bridge.reduceContexts($application.variables.mateuRegistry, increment);
      bridge.applyDomEffects(reg.effects, reg);
      $application.variables.mateuRegistry = reg;
      for (const toast of reg.effects.toasts || []) {
        const notification = bridge.bannerNotificationOf(toast);
        if (notification) { await Actions.fireNotificationEvent(context, notification); continue; }
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
      }
      if (reg.effects.navigate && reg.effects.navigate.route) {
        document.dispatchEvent(new CustomEvent('navigation-requested', {
          detail: { route: reg.effects.navigate.route }, bubbles: true, composed: true,
        }));
      }
    }
  }

  return runMateuFab;
});
