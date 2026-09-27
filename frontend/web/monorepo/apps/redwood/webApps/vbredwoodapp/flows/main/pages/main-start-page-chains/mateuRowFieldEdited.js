/* Un campo del EDITOR DE FILA (el oj-dialog de una lista modal): su valor va al borrador de
 * la fila, que runMateuAction manda en parameters.initiatorState al guardar. Si el campo
 * estaba marcado como obligatorio vacío, la marca se quita al rellenarlo. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
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
