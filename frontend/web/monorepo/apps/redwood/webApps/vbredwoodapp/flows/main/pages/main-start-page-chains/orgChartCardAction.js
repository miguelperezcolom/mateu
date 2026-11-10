/* A card's name was clicked in the hierarchy viewer (spNavigationAction): its node's action
 * (OrgNode.actionId, with the node — without its children — as _clickedNode), dispatched like any
 * action of a host block. Cards whose node has no action show no link. */

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

  class orgChartCardAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  the card's spNavigationAction
     */
    async run(context, { event }) {
      const card = event && (event.currentTarget || event.target);
      const call = bridge.orgCardActionOf(card ? card.context : null);
      if (!call) return;
      await Actions.callChain(context, {
        chain: 'dispatchHostBlockAction',
        // the chart's surface (an inline island's OrgChart goes back to the island)
        params: { actionId: call.actionId, parameters: call.parameters, surfaceId: bridge.surfaceOfNode(card) },
      });
    }
  }

  return orgChartCardAction;
});
