/* Fase 9: value-changed de un campo de la ISLA → borrador propio de la isla (separado del
 * host y del drawer). Solo ediciones del usuario (updatedFrom internal). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class islandFieldEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId
     * @param {Object} params.event
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
      context.$application.variables.mateuDirty = true;
      const draft = Object.assign({}, $page.variables.mateuIslandDraft);
      draft[fieldId] = detail.value;
      $page.variables.mateuIslandDraft = draft;
    }
  }

  return islandFieldEdited;
});
