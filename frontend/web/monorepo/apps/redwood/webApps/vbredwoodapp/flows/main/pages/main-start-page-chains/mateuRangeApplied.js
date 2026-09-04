/* Aplica un filtro de rango (fechas, números) desde su editor: los dos extremos van a
 * <campo>_from y <campo>_to, que es como los lee FilterCriteriaBuilder en el servidor.
 * Cualquiera de los dos puede quedarse vacío — un rango abierto por un lado es un rango. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class mateuRangeApplied extends ActionChain {

    /** @param {Object} params  {fromKey, toKey} del filtro abierto */
    async run(context, { fromKey, toKey }) {
      const { $application } = context;
      const draft = $application.variables.mateuFilterDraft || {};
      const values = Object.assign({}, $application.variables.mateuFilterValues || {});
      const set = (key, raw) => {
        const text = (raw == null ? '' : String(raw)).trim();
        if (text === '') delete values[key]; else values[key] = text;
      };
      set(fromKey, draft.from);
      set(toKey, draft.to);
      $application.variables.mateuFilterValues = values;
      $application.variables.mateuFilterEditing = null;
      $application.variables.mateuFilterDraft = {};
      await Actions.callChain(context, {
        chain: 'runMateuSearch',
        params: { searchText: $application.variables.mateuLastSearchText || '' },
      });
    }
  }

  return mateuRangeApplied;
});
