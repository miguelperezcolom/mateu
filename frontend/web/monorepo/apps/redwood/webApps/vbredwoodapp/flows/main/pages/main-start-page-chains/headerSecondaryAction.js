/* SECONDARY action of the generic band header: the detail brings the item by its id (the
 * actionIds we stamp) or, in old variants, by label — it is resolved against the projected Page
 * toolbar (bridge.secondaryActionOf: actionId first, caption after) and
 * dispatched against the HOST. */

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

  class headerSecondaryAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  spSecondaryAction ({detail: {secondaryItem}})
     */
    async run(context, { event }) {
      const { $application } = context;

      const toolbar = ($application.variables.mateuPageHeader || {}).toolbar || [];
      const match = bridge.secondaryActionOf((event && event.detail) || {}, toolbar);
      if (!match) {
        return;
      }
      // a RouteLink button navigates (bridge.blockClickOf), any other runs its action
      await Actions.callChain(context, {
        chain: 'dispatchHostBlockAction',
        params: { actionId: match.actionId, route: match.route || '' },
      });
    }
  }

  return headerSecondaryAction;
});
