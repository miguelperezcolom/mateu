/* Removing a chip of a @Searchable: the remaining value (precomputed in the chip: `remaining`)
 * goes to the form's draft (it travels with the next action) and to the host's state, and the
 * chips are rebuilt in the projections that paint them — without going to the server, as in Vaadin. */

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
     * @param {string} params.fieldId    the @Searchable field
     * @param {Array}  params.remaining  the remaining ids (null: the single-id field, empty)
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
