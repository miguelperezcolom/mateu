/* Fila del Ask Oracle: cierra la paleta y navega; una "vista rápida" deja además el
 * filtro del listado PENDIENTE — onMateuNavigate lo aplica en la búsqueda OnLoad en
 * lugar de resetearlo (el chip aparece aplicado al aterrizar). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class askOracleGo extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.item  destino ({route, quickField?, quickValue?})
     */
    async run(context, { item }) {
      const { $application } = context;
      if (item && !item.route && item.actionId) {
        // an app shortcut that runs an app-level action (@AppShortcut(actionId))
        await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'close' });
        await Actions.callChain(context, { chain: 'runMateuHeaderAction', params: { actionId: item.actionId } });
        return;
      }
      if (!item || !item.route) {
        return;
      }
      await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'close' });
      if (item.quickField && item.quickValue) {
        const seeded = {};
        seeded[item.quickField] = item.quickValue;
        $application.variables.mateuFilterValues = seeded;
        $application.variables.mateuFiltersPending = true;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { route: item.route } }, force: true },
      });
    }
  }

  return askOracleGo;
});
