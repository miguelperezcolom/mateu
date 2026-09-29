/* Respuesta del diálogo de CONFIRMACIÓN de una acción (confirmationRequired): el botón que
 * confirma, el que la deja estar, o el ✕ / Esc (ojBeforeClose). Resuelve la espera de la
 * chain que lanzó la acción (bridge.awaitConfirmation) y cierra el diálogo. */

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

  class mateuConfirmAnswered extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.confirmed  true = confirmar la acción
     * @param {boolean} params.closing    el diálogo ya se está cerrando (✕ / Esc)
     */
    async run(context, { confirmed, closing }) {
      bridge.answerConfirmation(!!confirmed);
      if (!closing) {
        // el close dispara ojBeforeClose, que llega aquí como un «no»: ya contestado, no hace nada
        await Actions.callComponentMethod(context, { selector: '#mateuConfirm', method: 'close' });
      }
    }
  }

  return mateuConfirmAnswered;
});
