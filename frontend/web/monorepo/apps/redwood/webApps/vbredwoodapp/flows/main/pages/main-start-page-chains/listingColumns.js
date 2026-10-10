/* SELECTOR DE COLUMNAS del listado (prefs.mjs): abrir el diálogo con las columnas en su orden y
 * visibilidad, encender/apagar y mover, aplicar (se guarda por ruta en localStorage —mismo
 * formato que el renderer web— y la tabla se re-proyecta), restablecer o cancelar. */

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

  class listingColumns extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.op  open | toggle | move | apply | reset | cancel
     */
    async run(context, { op, id, value, delta, updatedFrom }) {
      const { $application, $page } = context;
      const listing = $application.variables.mateuListing;
      if (!listing) return;
      const scope = bridge.listingScope();
      const dialog = () => document.getElementById('mateuColumnsDialog');
      if (op === 'open') {
        $page.variables.mateuColumnsModel = bridge.columnChooserOf(listing.allColumns || listing.columns, bridge.readColumnPrefs(scope));
        dialog().open();
        return;
      }
      if (op === 'toggle') {
        if (updatedFrom && updatedFrom !== 'internal') return;
        $page.variables.mateuColumnsModel = ($page.variables.mateuColumnsModel || []).map((c) => (c.id === id ? { ...c, visible: !!value } : c));
        return;
      }
      if (op === 'move') {
        $page.variables.mateuColumnsModel = bridge.moveChooserItem($page.variables.mateuColumnsModel || [], id, Number(delta));
        return;
      }
      if (op === 'apply' || op === 'reset') {
        bridge.writeColumnPrefs(scope, op === 'reset' ? null : bridge.prefsFromChooser($page.variables.mateuColumnsModel || []));
        // re-proyectar el listado: listingOf aplica las preferencias recién guardadas
        $application.variables.mateuListing = bridge.listingOf($application.variables.mateuRegistry.contexts[bridge.HOST_ID]);
        dialog().close();
        return;
      }
      if (op === 'cancel' && dialog() && dialog().isOpen && dialog().isOpen()) dialog().close();
    }
  }

  return listingColumns;
});
