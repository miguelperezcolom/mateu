/* Item Overview: selección de tab (oj-tab-bar) → mostrar el contenido de ese tab
 * (client-side: los tabs viajan enteros en el árbol). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onItemTabSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed ({detail: {value: 'itab-N'}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const item = $application.variables.mateuItemOv;
      if (!item || !detail.value) {
        return;
      }
      const selected = item.tabs.find((tab) => tab.id === detail.value);
      if (selected) {
        $application.variables.mateuItemTabTexts = selected.texts;
      }
    }
  }

  return onItemTabSelected;
});
