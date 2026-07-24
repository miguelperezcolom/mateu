/* Fase 3: two-way — cada value-changed de un campo acumula {fieldId: valor} en el borrador
 * de página (mateuDraft). Solo ediciones del usuario (updatedFrom internal): el set inicial
 * del binding también dispara value-changed y no debe ensuciar el borrador. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuFieldEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId
     * @param {Object} params.event  value-changed ({detail: {value, updatedFrom}})
     */
    async run(context, { fieldId, event }) {
      const { $page } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      if (!fieldId) {
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      draft[fieldId] = detail.value;
      $page.variables.mateuDraft = draft;
    }
  }

  return mateuFieldEdited;
});
