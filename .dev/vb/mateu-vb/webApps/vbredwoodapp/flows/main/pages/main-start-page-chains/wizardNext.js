/* Fase 8: el Continue del oj-sp-guided-process (spBeforeNext) dispara la acción de AVANCE
 * del wire del wizard (next, o confirm en el penúltimo paso — la separó la proyección). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class wizardNext extends ActionChain {

    async run(context) {
      const { $application } = context;

      const forwardId = $application.variables.mateuWizardForwardId;
      if (!forwardId) {
        return; // pantalla de resultado: no hay avance
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: forwardId },
      });
    }
  }

  return wizardNext;
});
