/* Selección en el oj-navigation-list del navigator-drawer: un GRUPO solo se expande
 * (colapsable — no navega: su ruta compuesta no resuelve); una hoja navega y cierra
 * el drawer. Guarda updatedFrom internal contra el eco del set inicial. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuNavDrawerSelect extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  selection-changed ({detail: {value}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && (event.detail || event)) || {};
      if (detail.updatedFrom && detail.updatedFrom !== 'internal') {
        return;
      }
      const route = detail.value;
      if (!route) {
        return;
      }
      const tree = $application.variables.mateuMenuTree || [];
      const group = tree.find((entry) => entry.id === route && entry.hasChildren);
      if (group) {
        return; // el clic en el grupo solo expande/colapsa
      }
      $application.variables.mateuNavDrawerOpen = false;
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { currentId: route } } },
      });
    }
  }

  return onMateuNavDrawerSelect;
});
