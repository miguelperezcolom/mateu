/* Header action (Phase 6): with `route` (YAML) it navigates in the app; otherwise it is dispatched APP-LEVEL — route '' + the App's serverSideType
 * (that is how Mateu exempts it from menu resolution) with the context's appState; the toasts
 * come out through the shell's own oj-sp-messages-toast. */

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

  class runMateuHeaderAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {string} [params.route]  a YAML header action's route (AppHeaderActionDto.route)
     */
    async run(context, { actionId, route }) {
      const { $application, $page } = context;

      // a header action (or a dropdown child — its oj-option value is actionId || route) that
      // declares a ROUTE navigates in-app instead of dispatching (bridge.headerActionRouteOf)
      const target = bridge.headerActionRouteOf($application.variables.mateuHeaderActions,
        actionId || route) || route || '';
      if (target) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: target } } },
        });
        return;
      }
      if (!actionId) {
        return;
      }
      const base = bridge.mateuBase($application.constants.mateuBaseUrl);
      const increment = await bridge.callMateu(base, {
        route: '',
        actionId,
        componentState: {},
        serverSideType: $application.variables.mateuShellSST || undefined,
        appState: $application.variables.mateuAppState || {},
      });
      const reg = bridge.reduceContexts($application.variables.mateuRegistry, increment);
      bridge.applyDomEffects(reg.effects, reg);
      $application.variables.mateuRegistry = reg;

      for (const toast of reg.effects.toasts) {
        $page.variables.messageToast = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#messageToast',
          method: 'open',
        });
      }
      if (reg.effects.navigate && reg.effects.navigate.route) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: reg.effects.navigate.route } } },
        });
      }
    }
  }

  return runMateuHeaderAction;
});
