/* Phase 8: the oj-sp-guided-process's Continue (spBeforeNext) fires the wizard wire's ADVANCE
 * action (next, or confirm on the penultimate step — the projection split it out). */

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

      // the OVERVIEW and its Start button are handled by the component ITSELF (internal
      // writeback of currentStep, no event) — only the step advance arrives here
      const forwardId = $application.variables.mateuWizardForwardId;
      if (!forwardId) {
        return; // result screen: there is no advance
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: forwardId },
      });
    }
  }

  return wizardNext;
});
