/* Abre/cierra el popup de un widget de cabecera (el del área de perfil — email, Logout — o el de
 * cualquier otro Popover del App), anclado al botón que lo dispara. */

define([
  'vb/action/actionChain',
], (
  ActionChain,
) => {
  'use strict';

  class toggleMateuWidgetPopup extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.popupId  id del oj-popup
     * @param {string} params.anchorId id del botón al que se ancla
     */
    async run(context, { popupId, anchorId }) {
      const popup = popupId && document.getElementById(popupId);
      if (!popup || typeof popup.open !== 'function') return;
      // auto-dismiss=focusLoss cierra el popup en el mismo clic que llega al botón: sin esto, ese
      // clic lo volvería a abrir y el botón no sabría cerrarlo
      if (!popup.__mateuCloseWired) {
        popup.__mateuCloseWired = true;
        popup.addEventListener('ojClose', () => { popup.__mateuClosedAt = Date.now(); });
      }
      if (popup.isOpen()) {
        popup.close();
      } else if (!popup.__mateuClosedAt || Date.now() - popup.__mateuClosedAt > 300) {
        popup.open('#' + anchorId);
      }
    }
  }

  return toggleMateuWidgetPopup;
});
