/* Collection header: secondary action (＋ Walk-in, Delete…). The header returns the item
 * by its id — the actionId we stamp on it in mateuListSecondary — (or the whole item / its
 * label, depending on the variant): it is resolved against the crud's toolbar by actionId and, failing that,
 * by caption (bridge.secondaryActionOf), and its actionId is dispatched. */

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
