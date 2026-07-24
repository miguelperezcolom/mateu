/* Acción de cabecera (Fase 6): se despacha APP-LEVEL — route '' + serverSideType del App
 * (así lo exime Mateu de la resolución de menú) con el appState del contexto; los toasts
 * salen por el oj-sp-messages-toast de la propia shell. */

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
     */
    async run(context, { actionId }) {
      const { $application, $page } = context;

      if (!actionId) {
        return;
      }
      const base = $application.constants.mateuBaseUrl;
      const increment = await bridge.callMateu(base, {
        route: '',
        actionId,
        componentState: {},
        serverSideType: $application.variables.mateuShellSST || undefined,
        appState: $application.variables.mateuAppState || {},
      });
      const reg = bridge.reduceContexts($application.variables.mateuRegistry, increment);
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
