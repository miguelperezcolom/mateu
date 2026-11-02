/* Action of a form LIST with a modal editor: the "+" under the table, Edit / Remove
 * on each row and the dialog's buttons (Save, Save and add another, Cancel, Prev/Next). The
 * button carries its action in data-action-id and, in the table, the row in data-row-key (the text of
 * its _rowNumber: the bridge turns it back into its real type). The request —the container's state, the
 * row in initiatorState— is built by runMateuAction with bridge.listActionRequestOf. The add / remove /
 * up / down of a NESTED list inside the row editor (data-nested-op) never leave the client. */

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

  class mateuListAction extends ActionChain {

    /**
     * A button of a NESTED list in the row editor (data-nested-op add / remove / up / down): the
     * list is edited on the client — the row's draft gets the new rows and the dialog is re-drawn;
     * nothing goes to the server until the row is saved.
     */
    nestedOp(context, dataset) {
      const { $application, $page } = context;
      const reg = $application.variables.mateuRegistry;
      const draft = Object.assign({}, $page.variables.mateuRowDraft);
      const edit = bridge.rowNestedOpOf(reg, dataset.fieldId, dataset.nestedOp, dataset.rowIndex, draft);
      if (!edit) {
        return;
      }
      draft[edit.fieldId] = edit.value;
      $page.variables.mateuRowDraft = draft;
      const editor = bridge.rowEditorOf(reg, { rowDraft: draft, errors: $page.variables.mateuRowErrors || {} });
      if (editor) {
        $page.variables.mateuRowEditor = editor;
      }
    }

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojAction of the oj-button
     */
    async run(context, { event }) {
      const target = event && (event.currentTarget || event.target);
      const dataset = (target && target.dataset) || {};
      if (dataset.nestedOp) {
        this.nestedOp(context, dataset);
        return;
      }
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
