/* La campana de la bandeja (NotificationsSupplier del App): abrir el popup (refrescando la lista),
 * abrir una entrada (la marca leída y navega a su ruta) y marcar todas leídas. Las tres hablan con
 * las acciones app-level _notifications-list / _notifications-read (notify.mjs). */

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

  class mateuBell extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.op   toggle | open | readAll
     * @param {Object} params.item la entrada activada (op = open)
     */
    async run(context, { op, item }) {
      const { $application } = context;
      const base = bridge.mateuBase($application.constants.mateuBaseUrl);
      const sst = $application.variables.mateuShellSST;
      const appState = $application.variables.mateuAppState || {};
      const popup = document.getElementById('mateuBellPopup');

      if (op === 'toggle') {
        if (!popup || typeof popup.open !== 'function') return;
        // auto-dismiss=focusLoss cierra el popup en el mismo clic que llega al botón
        if (!popup.__mateuCloseWired) {
          popup.__mateuCloseWired = true;
          popup.addEventListener('ojClose', () => { popup.__mateuClosedAt = Date.now(); });
        }
        if (popup.isOpen()) { popup.close(); return; }
        if (popup.__mateuClosedAt && Date.now() - popup.__mateuClosedAt < 300) return;
        $application.variables.mateuNotifications = await bridge.fetchNotifications(base, sst, appState);
        popup.open('#mateuBellButton');
        return;
      }
      if (op === 'readAll') {
        $application.variables.mateuNotifications = await bridge.fetchNotifications(base, sst, appState, 'all');
        return;
      }
      if (op === 'open' && item) {
        $application.variables.mateuNotifications = await bridge.fetchNotifications(base, sst, appState, [item.id]);
        if (popup && popup.isOpen && popup.isOpen()) popup.close();
        if (item.route) {
          await Actions.callChain(context, {
            chain: 'onMateuNavigate',
            params: { event: { detail: { currentId: item.route } } },
          });
        }
      }
    }
  }

  return mateuBell;
});
