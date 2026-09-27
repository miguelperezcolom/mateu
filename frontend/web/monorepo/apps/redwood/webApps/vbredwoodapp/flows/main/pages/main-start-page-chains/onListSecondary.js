/* Header de colección: acción secundaria (＋ Walk-in, Delete…). El header devuelve el item
 * por su id — el actionId que le estampamos en mateuListSecondary — (o el item entero / su
 * label, según la variante): se resuelve contra la toolbar del crud por actionId y, si no,
 * por rótulo (bridge.secondaryActionOf), y se despacha su actionId. */

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

  class onListSecondary extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSecondaryAction ({detail: {secondaryItem}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const listing = $application.variables.mateuListing;
      if (!listing) {
        return;
      }
      const match = bridge.secondaryActionOf((event && event.detail) || {}, listing.toolbar);
      if (!match) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: match.actionId },
      });
    }
  }

  return onListSecondary;
});
