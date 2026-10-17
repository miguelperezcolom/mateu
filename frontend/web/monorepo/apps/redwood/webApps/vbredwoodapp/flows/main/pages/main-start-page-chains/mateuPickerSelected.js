/* Checkboxes of a multi-valued @Searchable's SELECTOR: stored as KEYS and
 * resolved against the current rows when «Add selected» is pressed (like the listing's selection). */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class mateuPickerSelected extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  oj-table's selectedChanged ({detail: {value: {row: KeySet}}})
     */
    async run(context, { event }) {
      const { $page } = context;
      const value = (event && event.detail && event.detail.value) || {};
      $page.variables.mateuPickerSelection = bridge.selectionOfKeySet(value.row);
    }
  }

  return mateuPickerSelected;
});
