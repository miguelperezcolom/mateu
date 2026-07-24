/* Bootstrap de la shell (Fases 2/6): el App de Mateu configura menú (con grupos),
 * selectores @AppContext y acciones de cabecera; se navega a la primera opción no-grupo. */

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

      const nav = bridge.shellNavOf(reg);
      const appState = $application.variables.mateuAppState || {};
      $application.variables.mateuNavItems = nav.items;
      $application.variables.mateuNavGroups = nav.groups;
      $application.variables.mateuContextSelectors = nav.selectors.map((selector) => Object.assign({}, selector, {
        value: appState[selector.fieldName] != null ? appState[selector.fieldName] : null,
      }));
      $application.variables.mateuHeaderActions = nav.headerActions;
      $application.variables.mateuShellSST = nav.serverSideType || '';
      if (reg.shell && reg.shell.title) {
        document.title = reg.shell.title;
      }

      const first = nav.items.find((item) => !nav.groups[item.id]) || nav.items[0];
      if (first) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: first.id } } },
        });
      }
    }
  }

  return loadMateuShell;
});
