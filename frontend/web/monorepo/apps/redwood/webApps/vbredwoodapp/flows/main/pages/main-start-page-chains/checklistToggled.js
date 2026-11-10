/* A Checklist item ticked or unticked (its oj-checkboxset): the item's action with {_item, _done},
 * as the web checklist sends it. The echo of a re-projection (updatedFrom ≠ internal) is not a click. */

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

  class checklistToggled extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters   {_item, _done} precomputed by checklistAtomOf
     * @param {string} params.updatedFrom
     * @param {string} params.variant      'host' | 'island'
     * @param {string} params.surfaceId    the surface the checklist belongs to (an inline island…)
     * @param {Object} params.event        the oj-checkboxset's valueChanged (its surface, from the DOM)
     */
    async run(context, { actionId, parameters, updatedFrom, variant, surfaceId, event }) {
      if (!actionId || (updatedFrom && updatedFrom !== 'internal')) return;
      await Actions.callChain(context, {
        chain: variant === 'island' ? 'dispatchIslandAction' : 'dispatchHostBlockAction',
        params: { actionId, parameters, surfaceId: surfaceId || bridge.surfaceOfEvent(event) },
      });
    }
  }

  return checklistToggled;
});
