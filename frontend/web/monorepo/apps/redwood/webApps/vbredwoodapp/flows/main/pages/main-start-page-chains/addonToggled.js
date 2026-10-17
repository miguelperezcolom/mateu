/* AddOnPicker: toggle of an extra — contract of the shared web renderer
 * (mateu-addon-picker.ts): actionId with parameters {_item, _added, _total}, where _total
 * is the client-side sum of the extras added AFTER the toggle. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class addonToggled extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event   value-changed of the row's oj-switch
     * @param {string} params.itemId  id of the extra
     */
    async run(context, { event, itemId }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return; // template re-stamp, not a user toggle
      }
      const island = $application.variables.mateuIsland;
      const blocks = (island && island.content) || [];
      let picker = null;
      for (const block of blocks) {
        picker = (block.items || []).find((a) => a.isAddOns) || picker;
      }
      if (!picker || itemId == null) {
        return;
      }
      const added = !!detail.value;
      const total = (picker.items || []).reduce((sum, it) => {
        const isThis = it.id === itemId;
        const nowAdded = isThis ? added : it.added;
        return sum + (nowAdded ? (it.price || 0) : 0);
      }, 0);
      await Actions.callChain(context, {
        chain: 'runMateuIslandAction',
        params: {
          actionId: picker.actionId,
          parameters: { _item: itemId, _added: added, _total: total },
        },
      });
    }
  }

  return addonToggled;
});
