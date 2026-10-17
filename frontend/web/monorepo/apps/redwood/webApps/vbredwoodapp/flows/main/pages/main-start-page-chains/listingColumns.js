/* COLUMN CHOOSER of the listing (prefs.mjs): opening the dialog with the columns in their order and
 * visibility, switching on/off and moving, applying (saved per route in localStorage —same
 * format as the web renderer— and the table is re-projected), resetting or cancelling. */

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
        // re-project the listing: listingOf applies the just-saved preferences
        $application.variables.mateuListing = bridge.listingOf($application.variables.mateuRegistry.contexts[bridge.HOST_ID]);
        dialog().close();
        return;
      }
      if (op === 'cancel' && dialog() && dialog().isOpen && dialog().isOpen()) dialog().close();
    }
  }

  return listingColumns;
});
