/* Clic en una card del TaskQueue: despacha la acción de la cola (metadata.actionId,
 * p.ej. openGuest) con parameters._item = id del item — el MISMO contrato que el
 * renderer web compartido (mateu-task-queue.ts). El server responde el re-render del
 * host con la card marcada selected y el detalle en el panel derecho. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class queueItemClicked extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.itemId  id del item de la cola ($current de la card)
     */
    async run(context, { itemId }) {
      const { $application } = context;

      const queue = $application.variables.mateuQueue;
      if (!queue || !queue.actionId || itemId == null) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: queue.actionId, parameters: { _item: itemId } },
      });
    }
  }

  return queueItemClicked;
});
