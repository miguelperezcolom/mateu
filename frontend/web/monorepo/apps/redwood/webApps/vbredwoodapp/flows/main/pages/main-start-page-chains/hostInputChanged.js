/* Input of a HOST display block (fluent FormField, e.g. the charge search box of the
 * check-out mode, or a field of a crud's form layout): the value goes to the draft
 * (runMateuAction merges it into componentState) and, IF the host declares @AutoSave, its
 * action is relaunched — oj-input's value-changed fires on blur/Enter, which acts as a natural debounce.
 * It used to always relaunch "buscarCargos" (the front office check-out's): any other
 * form posted that action on every field change. */

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
      // input of the merged ISLAND (fromNested, e.g. the document editor): its value
      // goes to the island's draft (runMateuIslandAction merges it into its componentState) and
      // does NOT relaunch the host's auto-save
      if (fromNested) {
        const islandDraft = Object.assign({}, $page.variables.mateuIslandDraft);
        islandDraft[fieldId] = detail.value;
        $page.variables.mateuIslandDraft = islandDraft;
        return;
      }
      const draft = Object.assign({}, $page.variables.mateuDraft);
      draft[fieldId] = detail.value;
      $page.variables.mateuDraft = draft;
      // a form that asks before it is left (@ConfirmOnNavigationIfDirty, a crud's edit view) now
      // has unsaved changes: the menu, back, reload and its Cancel ask (mateuFieldEdited's rule)
      if (bridge.tracksUnsavedChanges(($application.variables.mateuRegistry.contexts || {})[bridge.HOST_ID])) {
        $application.variables.mateuDirty = true;
      }
      // @Trigger(OnValueChange): the changed field fires its action (the draft already carries the new
      // value, so the server recalculates with it —arrival + nights → departure— without saving)
      const vcHost = ($application.variables.mateuRegistry.contexts || {})[bridge.HOST_ID];
      const vcAction = bridge.valueChangeActionOf(vcHost, fieldId,
        Object.assign({}, (vcHost && vcHost.state) || {}, $page.variables.mateuDraft));
      if (vcAction) {
        await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: vcAction } });
        return;
      }
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
