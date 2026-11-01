/* A field of the ROW EDITOR (the oj-dialog of a modal list): its value goes to the row's
 * draft, which runMateuAction sends in parameters.initiatorState on save. If the field
 * was flagged as required-but-empty, the flag is removed when it is filled in. A field the
 * row's visibility depends on fires the row's OnValueChange trigger (`<campo>_refresh-detail`):
 * the server re-builds the editor with the fields the new value calls for. */

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

  class mateuRowFieldEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId
     * @param {Object} params.event  value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { fieldId, event }) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      if (!fieldId || !$page.variables.mateuRowEditorOpen) {
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuRowDraft);
      draft[fieldId] = detail.value;
      $page.variables.mateuRowDraft = draft;
      // the row's OnValueChange trigger: the draft (with the new value) travels in
      // initiatorState and the dialog is re-drawn with the editor the server re-built
      const vcAction = bridge.rowValueChangeActionOf($application.variables.mateuRegistry, fieldId, draft);
      if (vcAction) {
        await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: vcAction } });
        return;
      }
      const errors = $page.variables.mateuRowErrors || {};
      if (errors[fieldId]) {
        const rest = Object.assign({}, errors);
        delete rest[fieldId];
        $page.variables.mateuRowErrors = rest;
        const editor = bridge.rowEditorOf($application.variables.mateuRegistry, { rowDraft: draft, errors: rest });
        if (editor) {
          $page.variables.mateuRowEditor = editor;
        }
      }
    }
  }

  return mateuRowFieldEdited;
});
