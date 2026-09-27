/* Acción SECUNDARIA del header genérico de banda: el detail trae el item por su id (los
 * actionId que estampamos) o, en variantes viejas, por label — se resuelve contra el toolbar
 * de Page proyectado (bridge.secondaryActionOf: actionId primero, rótulo después) y se
 * despacha contra el HOST. */

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

  class headerSecondaryAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSecondaryAction ({detail: {secondaryItem}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const toolbar = ($application.variables.mateuPageHeader || {}).toolbar || [];
      const match = bridge.secondaryActionOf((event && event.detail) || {}, toolbar);
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
