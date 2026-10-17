/* Phase 8: click on a step of the guided-process RAIL (spBeforeStepNavigate,
 * triggeredFrom 'step') — BACKWARDS it runs the needed 'back's against Mateu (which
 * validates step by step); forwards it does not navigate (you advance with Continue) and the
 * shown step is restored (the event is cancelable but the chain runs async: preventDefault arrives
 * late — the component already moved its currentStep locally). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class wizardStepNavigate extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spBeforeStepNavigate ({detail: {currentStep, nextStep, triggeredFrom}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.triggeredFrom !== 'step') {
        return; // the Continue path is handled by spBeforeNext
      }
      const wizard = $application.variables.mateuWizard;
      if (!wizard) {
        return;
      }
      const ids = wizard.steps.map((s) => s.id);
      const fromIndex = ids.indexOf(wizard.currentStep);
      const toIndex = ids.indexOf(detail.nextStep);
      if (fromIndex < 0 || toIndex < 0 || toIndex >= fromIndex) {
        // forwards along the rail does not navigate — restore the shown step
        const el = document.getElementById('mateuWizardEl');
        if (el) {
          el.currentStep = $application.variables.mateuWizardShownStep;
        }
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

  return wizardStepNavigate;
});
