/* Casillas del SELECTOR de un @Searchable de varios valores: se guardan como CLAVES y se
 * resuelven contra las filas actuales al pulsar «Add selected» (como la selección del listado). */

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
     * @param {Object} params.event  selectedChanged de oj-table ({detail: {value: {row: KeySet}}})
     */
    async run(context, { event }) {
      const { $page } = context;
      const value = (event && event.detail && event.detail.value) || {};
      $page.variables.mateuPickerSelection = bridge.selectionOfKeySet(value.row);
    }
  }

  return mateuPickerSelected;
});
