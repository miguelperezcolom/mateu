/* A Checklist item ticked or unticked (its oj-checkboxset): the item's action with {_item, _done},
 * as the web checklist sends it. The echo of a re-projection (updatedFrom ≠ internal) is not a click. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
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
     */
    async run(context, { actionId, parameters, updatedFrom, variant }) {
      if (!actionId || (updatedFrom && updatedFrom !== 'internal')) return;
      await Actions.callChain(context, {
        chain: variant === 'island' ? 'dispatchIslandAction' : 'dispatchHostBlockAction',
        params: { actionId, parameters },
      });
    }
  }

  return checklistToggled;
});
