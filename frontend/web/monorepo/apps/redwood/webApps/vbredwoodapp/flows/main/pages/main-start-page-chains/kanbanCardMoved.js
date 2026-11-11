/* A card of a movable kanban board was dropped in another place, or moved from its ⋯ select
 * (installKanbans, dnd.mjs). The move is painted at once (a pending move, core/kanban.mjs), the
 * board's moveActionId runs with the card's item + _cardId/_fromColumnId/_toColumnId/_toIndex (a
 * REST action or the server: runMateuAction answers both), and then: failed → the card is back where it
 * was; succeeded → a live board (rowsSource) reads its items again. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class kanbanCardMoved extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.key   the board (kanbanKeyOf)
     * @param {Object} params.move  { cardId, fromColumnId, toColumnId, toIndex }
     * @param {string} params.surfaceId  the board's surface (an inline island's), '' = the host's
     */
    async run(context, { key, move, surfaceId }) {
      const { $application } = context;
      // the board's owner: the host, or the SURFACE it is painted in (posted with its own outbound)
      const contexts = $application.variables.mateuRegistry.contexts || {};
      const owner = surfaceId && contexts[surfaceId] ? surfaceId : bridge.HOST_ID;
      const outbound = owner === bridge.HOST_ID ? null : (contexts[owner].outbound || {});
      const base = outbound ? outbound.baseUrl : (bridge.baseOf($application.variables.mateuRegistry)
        || bridge.mateuBase($application.constants.mateuBaseUrl));
      const route = outbound ? (outbound.route || '') : $application.variables.mateuSelectedRoute;
      const appState = $application.variables.mateuAppState || {};
      const reduceOpts = outbound ? { initiator: owner } : undefined;
      const host = contexts[owner];
      const plan = bridge.kanbanMovePlanOf(host, key, move);
      if (!plan) return;

      const paint = () => {
        const next = bridge.reprojectedContentOf($application.variables);
        if (next.hostContent) {
          $application.variables.mateuHostContent = next.hostContent;
          bridge.mountElementsSoon(bridge.elementAtomsOf(next.hostContent));
        }
        if (next.island) $application.variables.mateuIsland = next.island;
      };

      bridge.addPendingKanbanMove(key, move);
      paint();

      let increment = null;
      try {
        increment = await bridge.runMateuAction(base, host, route, plan.actionId, host.state || {},
          { appState, parameters: plan.parameters });
      } catch (e) {
        increment = null;
      }
      let reg = $application.variables.mateuRegistry;
      if (increment) {
        reg = bridge.reduceContexts(reg, increment, reduceOpts);
        bridge.applyDomEffects(reg.effects, reg);
        $application.variables.mateuRegistry = reg;
      }
      if (bridge.kanbanMoveFailed(increment)) {
        bridge.dropPendingKanbanMove(key, move);
        paint();
        bridge.announce(bridge.chromeText('kanbanMoveFailed'), { politeness: 'assertive' });
        return;
      }
      if (plan.reloadActionId) {
        const hostNow = reg.contexts[owner];
        try {
          const loaded = await bridge.runMateuAction(base, hostNow, route, plan.reloadActionId, hostNow.state || {}, { appState });
          reg = bridge.reduceContexts(reg, loaded, reduceOpts);
          $application.variables.mateuRegistry = reg;
        } catch (e) {
          // the move went through: the board keeps it painted until the next load
        }
      }
      bridge.dropPendingKanbanMove(key, move);
      paint();
    }
  }

  return kanbanCardMoved;
});
