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
     */
    async run(context, { key, move }) {
      const { $application } = context;
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || bridge.mateuBase($application.constants.mateuBaseUrl);
      const route = $application.variables.mateuSelectedRoute;
      const appState = $application.variables.mateuAppState || {};
      const host = $application.variables.mateuRegistry.contexts[bridge.HOST_ID];
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

      bridge.setPendingKanbanMove(key, move);
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
        reg = bridge.reduceContexts(reg, increment);
        bridge.applyDomEffects(reg.effects, reg);
        $application.variables.mateuRegistry = reg;
      }
      if (bridge.kanbanMoveFailed(increment)) {
        bridge.setPendingKanbanMove(key, null);
        paint();
        bridge.announce(bridge.chromeText('kanbanMoveFailed'), { politeness: 'assertive' });
        return;
      }
      if (plan.reloadActionId) {
        const hostNow = reg.contexts[bridge.HOST_ID];
        try {
          const loaded = await bridge.runMateuAction(base, hostNow, route, plan.reloadActionId, hostNow.state || {}, { appState });
          reg = bridge.reduceContexts(reg, loaded);
          $application.variables.mateuRegistry = reg;
        } catch (e) {
          // the move went through: the board keeps it painted until the next load
        }
      }
      bridge.setPendingKanbanMove(key, null);
      paint();
    }
  }

  return kanbanCardMoved;
});
