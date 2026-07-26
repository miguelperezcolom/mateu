/* Input de un bloque display del HOST (FormField fluido, p.ej. el buscador de cargos del
 * modo check-out): el valor va al draft (runMateuAction lo fusiona en componentState) y se
 * relanza el auto-save del server (@AutoSave → buscarCargos) — value-changed de oj-input
 * dispara en blur/Enter, que hace de debounce natural. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class hostInputChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event
     * @param {string} params.fieldId
     */
    async run(context, { event, fieldId, fromNested }) {
      const { $page } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      if (!fieldId) {
        return;
      }
      // input de la ISLA fusionada (fromNested, p.ej. el editor del documento): su valor
      // va al draft de la isla (runMateuIslandAction lo fusiona en su componentState) y
      // NO relanza el auto-save del host
      if (fromNested) {
        const islandDraft = Object.assign({}, $page.variables.mateuIslandDraft);
        islandDraft[fieldId] = detail.value;
        $page.variables.mateuIslandDraft = islandDraft;
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      draft[fieldId] = detail.value;
      $page.variables.mateuDraft = draft;
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: 'buscarCargos' },
      });
    }
  }

  return hostInputChanged;
});
