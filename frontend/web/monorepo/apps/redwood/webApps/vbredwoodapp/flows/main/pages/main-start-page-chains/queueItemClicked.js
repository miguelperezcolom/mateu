/* Click on a TaskQueue card: dispatches the queue's action (metadata.actionId,
 * e.g. openGuest) with parameters._item = the item's id — the SAME contract as the
 * shared web renderer (mateu-task-queue.ts). The server answers with the host re-render
 * with the card marked selected and the detail in the right panel. */

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
     * @param {string} params.itemId  id of the queue item (the card's $current)
     */
    async run(context, { itemId }) {
      const { $application } = context;

      // the ROW OPTION button lives inside the card: its click also fires the
      // oj-action-card's ojAction — if a row action has just run, this card
      // click is its echo and is ignored
      if (window.__mateuQueueRowActionAt && Date.now() - window.__mateuQueueRowActionAt < 800) {
        return;
      }
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
