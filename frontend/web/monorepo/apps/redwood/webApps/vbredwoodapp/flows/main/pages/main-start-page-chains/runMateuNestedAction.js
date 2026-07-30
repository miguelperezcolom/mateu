/* Acción de la isla ANIDADA (App dentro de la isla, p.ej. el documento del check-in).
 * Se postea contra el contexto anidado con su estado + el SEED del host (stayId,
 * paxIndex… — el server no lo eca en sus respuestas). Las acciones anunciadas
 * Action.sse(true) (p.ej. escanear, un LongTask) van por el endpoint /sse y devuelven un
 * STREAM de increments que se reducen en orden. Los EVENTOS de bus resultantes (p.ej.
 * documento-escaneado) disparan los triggers OnCustomEvent suscritos en la propia
 * anidada, la isla madre y el host — con manejo del route-flip semántico tras cada uno. */

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
      const base = $application.constants.mateuBaseUrl;
      const appState = $application.variables.mateuAppState || {};
      let seed = {};
      try { seed = JSON.parse($application.variables.mateuNestedSeed || '{}'); } catch (ignored) { /* sin seed */ }

      const allEvents = [];
      const allToasts = [];
      const apply = (increment) => {
        reg = bridge.reduceContexts(reg, increment);
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };
      // route-flip semántico: una respuesta state-only con _route nuevo pide recargar la
      // ruta interna del contexto (se re-consulta tras CADA tanda de increments)
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

      // eventos de bus → triggers suscritos (la anidada primero: p.ej. documento-escaneado
      // → reloadDocumento, que responde un flip)
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

      // re-proyección: anidada + isla madre (fusionando la anidada en su contenido)
      const nestedNow = reg.contexts[nestedId];
      const nestedBlocks = nestedNow ? bridge.islandContentOf(nestedNow) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;
      const islandNow = islandId ? reg.contexts[islandId] : null;
      $application.variables.mateuIsland = islandNow
        ? { fields: bridge.fieldListOf(islandNow.tree, islandNow.state),
            actions: bridge.actionsOf(islandNow.tree),
            content: bridge.mergeNestedContent(bridge.islandContentOf(islandNow), nestedBlocks) }
        : null;

      for (const toast of allToasts) {
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
