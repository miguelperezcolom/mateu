/* Phase 9: value-changed of an ISLAND field → the island's own draft (separate from the
 * host's and the drawer's). Only user edits (updatedFrom internal). */

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

  class islandFieldEdited extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId
     * @param {Object} params.event
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
      // unsaved changes only where the island asks before it is left (Vaadin's rule, shellFlows.mjs)
      if (bridge.fieldEditLeavesUnsavedChanges($application.variables.mateuRegistry,
        { islandId: $application.variables.mateuIslandId })) {
        $application.variables.mateuDirty = true;
      }
      const draft = Object.assign({}, $page.variables.mateuIslandDraft);
      // one END of a date range (`<field>#from|to`) edits the whole {from, to}
      const islandCtx = ($application.variables.mateuRegistry.contexts || {})[$application.variables.mateuIslandId] || {};
      const range = bridge.rangeEditOf(fieldId, draft, islandCtx.state, detail.value);
      if (range) draft[range.fieldId] = range.value;
      else draft[fieldId] = detail.value;
      $page.variables.mateuIslandDraft = draft;
    }
  }

  return islandFieldEdited;
});
