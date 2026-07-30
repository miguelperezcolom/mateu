/* Abre/cierra el drawer lateral de CONTEXTO (@AppContext) desde el icono del header. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class toggleMateuContextDrawer extends ActionChain {

    async run(context) {
      const { $page } = context;
      $page.variables.mateuContextDrawerOpen = !$page.variables.mateuContextDrawerOpen;
    }
  }

  return toggleMateuContextDrawer;
});
