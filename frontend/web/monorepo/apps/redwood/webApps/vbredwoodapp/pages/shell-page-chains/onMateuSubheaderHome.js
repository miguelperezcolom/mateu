/* Clic en el título de la consola de la subcabecera (MENU_ON_TOP): vuelve a la home del App, como
 * el título de la banda 2 del renderer web. Es un <button> con aspecto de título y no un enlace: la
 * chain corre asíncrona y no llegaría a cancelar la navegación por defecto de un href. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class onMateuSubheaderHome extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $application } = context;
      const route = $application.variables.mateuHomeRoute;
      if (!route) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { route } } },
      });
    }
  }

  return onMateuSubheaderHome;
});
