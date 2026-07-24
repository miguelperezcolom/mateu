/* Fase 2: bootstrap de la shell — el App de Mateu configura el menú (shell slice) y se
 * navega a la primera opción. El registro vive en $application.variables.mateuRegistry. */

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

  class loadMateuShell extends ActionChain {

    async run(context) {
      const { $application } = context;

      const base = $application.constants.mateuBaseUrl;
      const reg = bridge.reduceContexts(
        { contexts: {}, stack: [], shell: null },
        await bridge.bootstrapShell(base),
      );
      $application.variables.mateuRegistry = reg;

      const menu = (reg.shell && reg.shell.menu) || [];
      $application.variables.mateuNavItems = menu.map((option) => ({
        id: option.route,
        label: option.caption || option.label || option.route,
        icon: option.icon || undefined,
      }));
      if (reg.shell && reg.shell.title) {
        document.title = reg.shell.title;
      }

      if (menu.length) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: menu[0].route } } },
        });
      }
    }
  }

  return loadMateuShell;
});
