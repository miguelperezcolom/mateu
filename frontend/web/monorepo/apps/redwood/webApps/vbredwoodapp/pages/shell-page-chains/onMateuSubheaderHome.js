/* Clic en el título de la subcabecera. MENU_ON_TOP: vuelve a la home del App, como el título de la
 * banda 2 del renderer web. HAMBURGER_SECTIONS: el título es el de la sección en pantalla, y lleva a
 * la home de la sección (su primera pantalla). Es un <button> con aspecto de título y no un enlace: la
 * chain corre asíncrona y no llegaría a cancelar la navegación por defecto de un href. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class onMateuSubheaderHome extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $application } = context;
      if ($application.variables.mateuMenuSections) {
        const section = bridge.sectionOf($application.variables.mateuMenuTree, $application.variables.mateuSelectedNavId);
        if (section && section.home) {
          await Actions.callChain(context, {
            chain: 'onMateuNavigate',
            params: { event: { detail: { currentId: section.home } } },
          });
        }
        return;
      }
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
