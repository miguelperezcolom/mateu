/* Lo tecleado en el editor de un filtro, antes de aplicarlo. Va a una variable y no al
 * DOM porque las plantillas de VB corren bajo CSP: el valor tiene que existir en el modelo
 * para que el botón Aplicar pueda leerlo. */

define([
  'vb/action/actionChain',
], (
  ActionChain,
) => {
  'use strict';

  class mateuFilterDraftChanged extends ActionChain {

    /**
     * @param {Object} params
     * @param {string} params.part   'text' | 'from' | 'to'
     * @param {*}      params.value
     */
    async run(context, { part, value }) {
      const { $application } = context;
      const draft = Object.assign({}, $application.variables.mateuFilterDraft || {});
      draft[part] = value == null ? '' : value;
      $application.variables.mateuFilterDraft = draft;
    }
  }

  return mateuFilterDraftChanged;
});
