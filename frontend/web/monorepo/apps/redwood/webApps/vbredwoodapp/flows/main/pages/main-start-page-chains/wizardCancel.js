/* Phase 8: the guided-process's Cancel (spCancel) = abandon the process — navigates to the
 * app's home; on re-entering, the wizard starts from scratch (fresh instance per request). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class wizardCancel extends ActionChain {

    async run(context) {
      const { $application } = context;

      const home = $application.variables.mateuHomeRoute;
      if (!home) {
        return;
      }
      await Actions.fireEvent(context, {
        name: 'application:mateuNavigate',
        payload: { route: home },
      });
    }
  }

  return wizardCancel;
});
