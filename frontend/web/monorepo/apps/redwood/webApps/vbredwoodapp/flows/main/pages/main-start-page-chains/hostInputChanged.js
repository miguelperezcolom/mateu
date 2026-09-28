/* Input de un bloque display del HOST (FormField fluido, p.ej. el buscador de cargos del
 * modo check-out, o un campo del form layout de un crud): el valor va al draft
 * (runMateuAction lo fusiona en componentState) y, SI el host declara @AutoSave, se relanza
 * su acción — value-changed de oj-input dispara en blur/Enter, que hace de debounce natural.
 * Antes relanzaba siempre "buscarCargos" (la del check-out del front office): cualquier otro
 * formulario posteaba esa acción en cada cambio de campo. */

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

  class hostInputChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event
     * @param {string} params.fieldId
     */
    async run(context, { event, fieldId, fromNested }) {
      const { $application, $page } = context;

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
      const host = ($application.variables.mateuRegistry.contexts || {})[bridge.HOST_ID];
      const auto = bridge.autoSaveOf(host);
      if (!auto) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: auto.actionId },
      });
    }
  }

  return hostInputChanged;
});
