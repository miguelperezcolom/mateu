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
      // el grupo puede estar a CUALQUIER profundidad: una shell federada trae tres niveles
      // (grupo de la shell → grupo del pod → sus pantallas)
      const isGroup = (nodes) => (nodes || []).some((entry) => (
        (entry.id === route && entry.hasChildren) || isGroup(entry.children)));
      if (isGroup($application.variables.mateuMenuTree || [])) {
        return; // el clic en el grupo solo expande/colapsa
      }
      // el navigator es PERSISTENTE: navegar no lo cierra
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { currentId: route } } },
      });
    }
  }

  return onMateuNavDrawerSelect;
});
