/* AddOnPicker in HOST content (e.g. the Extras step of the standalone wizard): same
 * contract as the web renderer — actionId with {_item, _added, _total} where _total is the
 * client-side sum after the toggle. The picker is looked up in the wizard's or the host's content. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class hostAddonToggled extends ActionChain {

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
        return;
      }
      // CAREFUL: [] is truthy — choose by LENGTH (in the 360 the wizardContent is empty)
      const wizardBlocks = $application.variables.mateuWizardContent || [];
      const blocks = wizardBlocks.length
        ? wizardBlocks
        : ($application.variables.mateuHostContent || []);
      let picker = null;
      for (const block of blocks) {
        picker = (block.items || []).find((a) => a.isAddOns) || picker;
      }
      if (!picker || itemId == null) {
        return;
      }
      const added = !!detail.value;
      const total = (picker.items || []).reduce((sum, it) => {
        const nowAdded = it.id === itemId ? added : it.added;
        return sum + (nowAdded ? (it.price || 0) : 0);
      }, 0);
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: {
          actionId: picker.actionId,
          parameters: { _item: itemId, _added: added, _total: total },
        },
      });
    }
  }

  return hostAddonToggled;
});
