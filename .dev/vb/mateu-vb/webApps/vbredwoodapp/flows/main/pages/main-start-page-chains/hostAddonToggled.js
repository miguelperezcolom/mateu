/* AddOnPicker en contenido del HOST (p.ej. el paso Extras del wizard standalone): mismo
 * contrato que el renderer web — actionId con {_item, _added, _total} donde _total es la
 * suma cliente tras el toggle. El picker se busca en el contenido del wizard o del host. */

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
     * @param {Object} params.event   value-changed del oj-switch de la fila
     * @param {string} params.itemId  id del extra
     */
    async run(context, { event, itemId }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      // OJO: [] es truthy — elegir por LONGITUD (en la 360 el wizardContent está vacío)
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
