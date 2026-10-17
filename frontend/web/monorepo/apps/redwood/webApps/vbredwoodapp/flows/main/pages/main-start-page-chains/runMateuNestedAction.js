/* Action of the NESTED island (an App inside the island, e.g. the check-in document).
 * It is posted against the nested context with its state + the host's SEED (stayId,
 * paxIndex… — the server does not echo it in its responses). Actions advertised
 * Action.sse(true) (e.g. scanning, a LongTask) go through the /sse endpoint and return a
 * STREAM of increments that are reduced in order. The resulting bus EVENTS (e.g.
 * documento-escaneado) fire the OnCustomEvent triggers subscribed in the nested one
 * itself, the parent island and the host — handling the semantic route-flip after each. */

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

  class runMateuNestedAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { actionId, parameters }) {
      const { $application, $page } = context;

      const nestedId = $application.variables.mateuNestedId;
      const islandId = $application.variables.mateuIslandId;
      if (!actionId || !nestedId) {
        return;
      }
      let reg = $application.variables.mateuRegistry;
      const nestedContext = reg.contexts[nestedId];
      if (!nestedContext) {
        return;
      }
      // same as in runMateuAction: the nested island lives in its host's backend
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || bridge.mateuBase($application.constants.mateuBaseUrl);
      const appState = $application.variables.mateuAppState || {};
      let seed = {};
      try { seed = JSON.parse($application.variables.mateuNestedSeed || '{}'); } catch (ignored) { /* no seed */ }

      const allEvents = [];
      const allToasts = [];
      const apply = (increment) => {
        reg = bridge.reduceContexts(reg, increment);
        bridge.applyDomEffects(reg.effects, reg);
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };
      // semantic route-flip: a state-only response with a new _route asks to reload the
      // context's inner route (re-checked after EACH batch of increments)
      const maybeFlip = async (ctxId, previousRoute) => {
        const ctx = reg.contexts[ctxId];
        const flipped = ctx && ctx.state ? ctx.state._route : null;
        if (ctx && flipped != null && flipped !== previousRoute) {
          const outboundNow = ctx.outbound || {};
          const innerRoute = bridge.composeInnerRoute(outboundNow.route || '', flipped);
          const reload = await bridge.loadRoute(base, innerRoute, ctxId, {
            consumedRoute: outboundNow.consumedRoute || outboundNow.route || '',
            serverSideType: outboundNow.serverSideType,
            appState,
            componentState: Object.assign({}, seed, ctx.state),
          });
          apply(reload);
        }
      };

      const outbound = nestedContext.outbound || {};
      const previousRoute = nestedContext.state ? nestedContext.state._route : null;
      const componentState = Object.assign({}, seed, nestedContext.state);
      const isSse = (nestedContext.sseActionIds || []).indexOf(actionId) >= 0;
      if (isSse) {
        const increments = await bridge.runMateuActionSse(
          base, nestedContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} });
        increments.forEach(apply);
      } else {
        apply(await bridge.runMateuAction(
          base, nestedContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} }));
      }
      await maybeFlip(nestedId, previousRoute);

      // bus events → subscribed triggers (the nested one first: e.g. documento-escaneado
      // → reloadDocumento, which answers with a flip)
      for (const busEvent of allEvents.splice(0)) {
        for (const target of [nestedId, islandId, bridge.HOST_ID]) {
          const ctx = target ? reg.contexts[target] : null;
          if (!ctx) continue;
          for (const triggerActionId of bridge.eventTriggersOf(ctx, busEvent.name)) {
            const prev = ctx.state ? ctx.state._route : null;
            const trigState = target === nestedId
              ? Object.assign({}, seed, ctx.state) : Object.assign({}, ctx.state);
            apply(await bridge.runMateuAction(
              base, ctx, (ctx.outbound || {}).route || '',
              triggerActionId, trigState, { appState }));
            await maybeFlip(target, prev);
          }
        }
      }

      $application.variables.mateuRegistry = reg;

      // re-projection: nested + parent island (merging the nested one into its content)
      const nestedNow = reg.contexts[nestedId];
      const nestedBlocks = nestedNow ? bridge.islandContentOf(nestedNow) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;
      const islandNow = islandId ? reg.contexts[islandId] : null;
      $application.variables.mateuIsland = islandNow
        ? { fields: bridge.fieldListOf(islandNow.tree, islandNow.state, islandNow.data),
            sections: bridge.formSectionsOf(islandNow.tree, islandNow.state, islandNow.data),
            actions: bridge.actionsOf(islandNow.tree),
            content: bridge.mergeNestedContent(bridge.islandContentOf(islandNow), nestedBlocks) }
        : null;

      // the Elements (web components, server HTML) of the host, the wizard step and the
      // island are mounted again: after an island action their slots are repainted empty
      bridge.mountElementsSoon([].concat(
        bridge.elementAtomsOf($application.variables.mateuHostContent),
        bridge.elementAtomsOf($application.variables.mateuWizardContent),
        bridge.elementAtomsOf(($application.variables.mateuIsland || {}).content)));

      for (const toast of allToasts) {
        // an error or warning goes to the shell's message banner (the Redwood toast only confirms)
        const notification = bridge.bannerNotificationOf(toast);
        if (notification) { await Actions.fireNotificationEvent(context, notification); continue; }
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#mateuToast',
          method: 'open',
        });
      }
    }
  }

  return runMateuNestedAction;
});
