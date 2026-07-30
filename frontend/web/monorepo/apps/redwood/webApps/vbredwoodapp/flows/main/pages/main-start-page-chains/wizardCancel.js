/* Fase 8: Cancel del guided-process (spCancel) = abandonar el proceso — navega a la
 * home de la app; al reentrar, el wizard arranca de cero (instancia fresca por request). */

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
