/* Cierre del DETALLE de fila (✕/Esc/backdrop): solo lectura, no hay nada que descartar en el
 * servidor — se cierra el panel y se vacía. */

define([
  'vb/action/actionChain',
], (
  ActionChain,
) => {
  'use strict';

  class mateuRowDetailDismissed extends ActionChain {

    async run(context) {
      const { $application } = context;

      $application.variables.mateuRowDetailOpen = false;
      $application.variables.mateuRowDetail = { title: '', text: '' };
    }
  }

  return mateuRowDetailDismissed;
});
