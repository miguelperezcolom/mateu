/* Abre/cierra el navigator-drawer izquierdo (variante HAMBURGUER_MENU). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class toggleMateuNavDrawer extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.open  sin valor = alternar (la hamburguesa pliega/despliega)
     */
    async run(context, { open }) {
      const { $application } = context;
      const next = open == null ? !$application.variables.mateuNavDrawerOpen : !!open;
      $application.variables.mateuNavDrawerOpen = next;
      if (next) {
        // el navigation-list parsea su <ul> en el init; los li estampados por
        // oj-bind-for-each llegan después → refresh para que los decore
        try {
          await Actions.callComponentMethod(context, {
            selector: '#mateuNavList',
            method: 'refresh',
          });
        } catch (ignored) {
          // el primer open puede llegar antes de que el elemento exista — el
          // segundo refresh (tras el stamping) es el que decora
        }
      }
    }
  }

  return toggleMateuNavDrawer;
});
