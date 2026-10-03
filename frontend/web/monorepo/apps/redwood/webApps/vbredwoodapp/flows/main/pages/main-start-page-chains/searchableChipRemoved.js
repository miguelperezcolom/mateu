/* Quitar un chip de un @Searchable: el valor que queda (precomputado en el chip: `remaining`)
 * va al borrador del formulario (viaja con la siguiente acción) y al estado del host, y los
 * chips se rehacen en las proyecciones que los pintan — sin ir al servidor, como en Vaadin. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  const clone = (value) => (value == null ? value : JSON.parse(JSON.stringify(value)));

  class searchableChipRemoved extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.fieldId    el campo @Searchable
     * @param {Array}  params.remaining  los ids que quedan (null: el campo de un solo id, vacío)
     */
    async run(context, { fieldId, remaining }) {
      const { $application, $page } = context;
      if (!fieldId) {
        return;
      }
      const value = remaining == null ? null : Array.from(remaining);
      bridge.clearFieldErrorMarks(fieldId);
      $page.variables.mateuDraft = Object.assign({}, $page.variables.mateuDraft, { [fieldId]: value });
      $application.variables.mateuRegistry = bridge.withContextState(
        $application.variables.mateuRegistry, bridge.HOST_ID, { [fieldId]: value });
      $application.variables.mateuFormSections =
        bridge.withSearchableIds(clone($application.variables.mateuFormSections || []), fieldId, value);
      $application.variables.mateuHostContent =
        bridge.withSearchableIds(clone($application.variables.mateuHostContent || []), fieldId, value);
      $application.variables.mateuWizardContent =
        bridge.withSearchableIds(clone($application.variables.mateuWizardContent || []), fieldId, value);
    }
  }

  return searchableChipRemoved;
});
