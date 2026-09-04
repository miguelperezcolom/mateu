/* Un chip SIN aplicar abre el editor de SU filtro (un chip aplicado se quita por la ✕).
 * Sólo hay un editor abierto a la vez: la fila de chips es la lista de filtros, y el editor
 * es el detalle del que se está tocando. */

define([
  'vb/action/actionChain',
], (
  ActionChain,
) => {
  'use strict';

  class mateuFilterOpened extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId  el filtro cuyo chip se pulsó
     */
    async run(context, { fieldId }) {
      const { $application } = context;
      const open = $application.variables.mateuFilterEditing || {};
      if (!fieldId || open.fieldId === fieldId) {
        // volver a pulsar el mismo chip cierra el editor
        $application.variables.mateuFilterEditing = null;
        $application.variables.mateuFilterDraft = {};
        return;
      }
      const filters = (($application.variables.mateuListing || {}).filters) || [];
      const found = filters.filter((f) => f.fieldId === fieldId)[0] || null;
      $application.variables.mateuFilterEditing = found;
      // el editor arranca con lo que ya hubiera aplicado, no en blanco
      const values = $application.variables.mateuFilterValues || {};
      $application.variables.mateuFilterDraft = found && found.isRange
        ? { from: values[found.fromKey] || '', to: values[found.toKey] || '' }
        : { text: found ? (values[found.fieldId] || '') : '' };
    }
  }

  return mateuFilterOpened;
});
