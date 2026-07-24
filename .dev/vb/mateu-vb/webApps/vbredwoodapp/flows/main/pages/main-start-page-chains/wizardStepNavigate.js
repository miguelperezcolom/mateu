/* Fase 8: clic en un paso del RAIL del guided-process (spBeforeStepNavigate,
 * triggeredFrom 'step') — hacia ATRÁS ejecuta los 'back' necesarios contra Mateu (que
 * valida por pasos); hacia delante no navega (se avanza con Continue) y se restaura el
 * paso mostrado (el evento es cancelable pero el chain corre async: preventDefault llega
 * tarde — el componente ya movió su currentStep localmente). */

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
        return; // el camino del Continue lo lleva spBeforeNext
      }
      const wizard = $application.variables.mateuWizard;
      if (!wizard) {
        return;
      }
      const ids = wizard.steps.map((s) => s.id);
      const fromIndex = ids.indexOf(wizard.currentStep);
      const toIndex = ids.indexOf(detail.nextStep);
      if (fromIndex < 0 || toIndex < 0 || toIndex >= fromIndex) {
        // adelante por el rail no navega — restaurar el paso mostrado
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
