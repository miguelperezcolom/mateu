/* Opens/closes the popup of a header widget (the profile area's — email, Logout — or that of
 * any other Popover of the App), anchored to the button that triggers it. */

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
     * @param {string} params.popupId  id of the oj-popup
     * @param {string} params.anchorId id of the button it is anchored to
     */
    async run(context, { popupId, anchorId }) {
      const popup = popupId && document.getElementById(popupId);
      if (!popup || typeof popup.open !== 'function') return;
      // auto-dismiss=focusLoss closes the popup on the same click that reaches the button: without this, that
      // click would open it again and the button would not be able to close it
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
