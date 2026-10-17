/* Action of a form LIST with a modal editor: the "+" under the table, Edit / Remove
 * on each row and the dialog's buttons (Save, Save and add another, Cancel, Prev/Next). The
 * button carries its action in data-action-id and, in the table, the row in data-row-key (the text of
 * its _rowNumber: the bridge turns it back into its real type). The request —the container's state, the
 * row in initiatorState— is built by runMateuAction with bridge.listActionRequestOf. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuListAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojAction of the oj-button
     */
    async run(context, { event }) {
      const target = event && (event.currentTarget || event.target);
      const dataset = (target && target.dataset) || {};
      const actionId = dataset.actionId;
      if (!actionId) {
        return;
      }
      const parameters = dataset.rowKey != null && dataset.rowKey !== ''
        ? { _rowNumber: dataset.rowKey } : {};
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId, parameters },
      });
    }
  }

  return mateuListAction;
});
