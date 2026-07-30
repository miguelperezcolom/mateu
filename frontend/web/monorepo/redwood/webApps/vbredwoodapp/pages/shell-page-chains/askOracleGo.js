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
      if (!item || !item.route) {
        return;
      }
      await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'close' });
      if (item.quickField && item.quickValue) {
        $application.variables.mateuQuickFilter = { fieldId: item.quickField, value: item.quickValue };
        $application.variables.mateuQuickFilterPending = true;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { route: item.route } }, force: true },
      });
    }
  }

  return askOracleGo;
});
