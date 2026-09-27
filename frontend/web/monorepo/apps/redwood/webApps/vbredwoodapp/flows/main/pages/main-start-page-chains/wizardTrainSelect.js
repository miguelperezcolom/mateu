/* Wizard HORIZONTAL (@WizardProgress STEPS): clic en un paso del TREN de arriba. Sólo los
 * pasos ya hechos están habilitados (los que faltan se alcanzan con el botón del paso, que
 * valida): ir a uno anterior ejecuta los 'back' necesarios contra Mateu, que re-pinta el
 * paso y re-liga el selected-step del tren. Cualquier otro cambio (el re-pintado mismo, o
 * un paso no anterior) no navega. */

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
     * @param {Object} params.event  selectedStepChanged del oj-train ({detail: {value, previousValue, updatedFrom}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const detail = (event && event.detail) || {};
      if (detail.updatedFrom !== 'internal') {
        return; // el re-pintado desde el servidor, no un clic
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
