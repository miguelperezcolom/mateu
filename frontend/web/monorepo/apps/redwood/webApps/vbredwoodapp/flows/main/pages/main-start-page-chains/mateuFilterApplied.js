/* Aplica (o quita) un filtro y vuelve a buscar.
 *
 * `keys` llega desde el chip porque un rango ocupa DOS claves de estado: quitarlo a medias
 * dejaría el listado filtrado por algo que ya no se ve en ningún chip. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class mateuFilterApplied extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string}   params.fieldId
     * @param {*}        [params.value]   valor a aplicar; ausente/'' = quitar el filtro
     * @param {string[]} [params.keys]    claves de estado a borrar al quitarlo
     * @param {boolean}  [params.toggle]  multi-select: añade o quita el valor de la lista
     * @param {boolean}  [params.keepOpen] deja el editor abierto (multi-select)
     */
    async run(context, { fieldId, value, keys, toggle, keepOpen }) {
      const { $application } = context;
      if (!fieldId) {
        return;
      }
      const values = Object.assign({}, $application.variables.mateuFilterValues || {});

      if (toggle) {
        const selected = bridge.multiValuesOf(values[fieldId]);
        const at = selected.indexOf(String(value));
        if (at >= 0) selected.splice(at, 1); else selected.push(String(value));
        if (selected.length) values[fieldId] = selected; else delete values[fieldId];
      } else if (value === undefined || value === null || value === '') {
        for (const key of (keys && keys.length ? keys : [fieldId])) {
          delete values[key];
        }
      } else {
        values[fieldId] = value;
      }

      $application.variables.mateuFilterValues = values;
      if (!keepOpen) {
        $application.variables.mateuFilterEditing = null;
        $application.variables.mateuFilterDraft = {};
      }
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: $application.variables.mateuLastSearchText || '' },
      });
    }
  }

  return mateuFilterApplied;
});
