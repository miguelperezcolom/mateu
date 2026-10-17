/* HORIZONTAL wizard (@WizardProgress STEPS): click on a step of the TRAIN at the top. Only the
 * steps already done are enabled (the missing ones are reached with the step's button, which
 * validates): going to an earlier one runs the needed 'back's against Mateu, which repaints the
 * step and re-binds the train's selected-step. Any other change (the repaint itself, or
 * a step that is not earlier) does not navigate. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class wizardTrainSelect extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  oj-train's selectedStepChanged ({detail: {value, previousValue, updatedFrom}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom !== 'internal') {
        return; // the repaint from the server, not a click
      }
      const wizard = $application.variables.mateuWizard;
      if (!wizard || !wizard.horizontal) {
        return;
      }
      const ids = wizard.steps.map((s) => s.id);
      const fromIndex = ids.indexOf(wizard.currentStep);
      const toIndex = ids.indexOf(detail.value);
      if (fromIndex < 0 || toIndex < 0 || toIndex >= fromIndex) {
        return;
      }
      for (let i = 0; i < fromIndex - toIndex; i++) {
        await Actions.callChain(context, {
          chain: 'runMateuAction',
          params: { actionId: 'back' },
        });
      }
    }
  }

  return wizardTrainSelect;
});
