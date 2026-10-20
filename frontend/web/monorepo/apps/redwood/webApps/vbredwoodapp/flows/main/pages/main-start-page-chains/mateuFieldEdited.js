/* Two-way (Phases 3–5): each value-changed accumulates {fieldId: value} in the draft — the
 * DRAWER's if one is open, the host form's otherwise. Only user edits
 * (updatedFrom internal): the binding's initial set also fires value-changed. */

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
      // a field flagged as required-but-empty stops being so as soon as something is typed in it
      if (event && event.target) {
        bridge.clearFieldError(event.target);
      }
      // unsaved changes only where the field's owner asks before it is left (Vaadin's rule, shellFlows.mjs)
      if (bridge.fieldEditLeavesUnsavedChanges($application.variables.mateuRegistry,
        { overlay: !!($application.variables.mateuDrawerOpen || $page.variables.mateuModalOpen) })) {
        context.$application.variables.mateuDirty = true;
      }
      // a dialog's form (the modal of a Dialog overlay) writes to the overlay's draft,
      // like the drawer's: it is the state that travels with its actions
      if ($application.variables.mateuDrawerOpen || $page.variables.mateuModalOpen) {
        const draft = Object.assign({}, $page.variables.mateuDrawerDraft);
        // an Amount keeps its currency: the money input edits only the number
        draft[fieldId] = bridge.committedValueOf(draft[fieldId], detail.value);
        $page.variables.mateuDrawerDraft = draft;
      } else {
        const draft = Object.assign({}, $page.variables.mateuDraft);
        const hostState = (($application.variables.mateuRegistry.contexts || {})[bridge.HOST_ID] || {}).state || {};
        // an Amount keeps its currency: the money input edits only the number
        draft[fieldId] = bridge.committedValueOf(fieldId in draft ? draft[fieldId] : hostState[fieldId], detail.value);
        $page.variables.mateuDraft = draft;
        // live reload (dev mode): the shell restores what was typed when repainting this screen
        bridge.noteLiveDraft(window.__mateuLoadedFull, draft);
        // @Trigger(OnValueChange): the changed field fires its action (the draft already carries the new
        // value, so the server recalculates with it —arrival + nights → departure— without saving)
        const vcHost = ($application.variables.mateuRegistry.contexts || {})[bridge.HOST_ID];
        const vcAction = bridge.valueChangeActionOf(vcHost, fieldId,
          Object.assign({}, (vcHost && vcHost.state) || {}, $page.variables.mateuDraft));
        if (vcAction) {
          await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: vcAction } });
          return;
        }
        // @AutoSave on a page whose fields are the generic form: only display-block inputs
        // (hostInputChanged) honored it — a settings form never saved. value-changed fires on
        // blur/Enter, which is the debounce
        const auto = bridge.autoSaveOf(vcHost);
        if (auto) {
          await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: auto.actionId } });
        }
      }
    }
  }

  return mateuFieldEdited;
});
