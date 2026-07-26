/* Acción SECUNDARIA del header genérico de banda: el detail trae el item (por label) —
 * se resuelve contra el toolbar de Page proyectado y se despacha contra el HOST. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class headerSecondaryAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSecondaryAction ({detail: {secondaryItem}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      const label = detail.secondaryItem && detail.secondaryItem.label
        ? detail.secondaryItem.label : detail.secondaryItem;
      const toolbar = ($application.variables.mateuPageHeader || {}).toolbar || [];
      const match = toolbar.find((b) => b.label === label);
      if (!match) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: match.actionId },
      });
    }
  }

  return headerSecondaryAction;
});
