/* Header de colección: acción secundaria (Delete…) — el detail trae el ITEM (por label);
 * se resuelve contra la toolbar del crud y se despacha su actionId. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
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

      const detail = (event && event.detail) || {};
      const label = detail.secondaryItem && detail.secondaryItem.label
        ? detail.secondaryItem.label : detail.secondaryItem;
      const listing = $application.variables.mateuListing;
      if (!listing || label == null) {
        return;
      }
      const match = (listing.toolbar || []).find((b) => b.label === label);
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
