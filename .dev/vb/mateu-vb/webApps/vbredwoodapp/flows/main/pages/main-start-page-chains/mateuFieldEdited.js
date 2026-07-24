/* Two-way (Fases 3–5): cada value-changed acumula {fieldId: valor} en el borrador — el del
 * DRAWER si hay uno abierto, el del form del host si no. Solo ediciones del usuario
 * (updatedFrom internal): el set inicial del binding también dispara value-changed. */

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
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      if (!fieldId) {
        return;
      }
      if ($application.variables.mateuDrawerOpen) {
        const draft = Object.assign({}, $page.variables.mateuDrawerDraft);
        draft[fieldId] = detail.value;
        $page.variables.mateuDrawerDraft = draft;
      } else {
        const draft = Object.assign({}, $page.variables.mateuDraft);
        draft[fieldId] = detail.value;
        $page.variables.mateuDraft = draft;
      }
    }
  }

  return mateuFieldEdited;
});
