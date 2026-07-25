/* Fase 9: acción de la ISLA (Edit/Save/Cancel del mediador embebido) — se postea contra el
 * contexto de la isla (outbound estampado al cargarla); la respuesta vuelve dirigida a su
 * contextId y SOLO la isla se re-proyecta: el host no se toca (structural sharing). */

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

  class runMateuIslandAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId
     */
    async run(context, { actionId, parameters }) {
      const { $application, $page } = context;

      const islandId = $application.variables.mateuIslandId;
      if (!actionId || !islandId) {
        return;
      }
      const before = $application.variables.mateuRegistry;
      const islandContext = before.contexts[islandId];
      if (!islandContext) {
        return;
      }
      const base = $application.constants.mateuBaseUrl;
      const componentState = Object.assign(
        {}, islandContext.state, $page.variables.mateuIslandDraft);
      const appState = $application.variables.mateuAppState || {};
      const outbound = islandContext.outbound || {};
      const increment = await bridge.runMateuAction(
        base, islandContext, outbound.route || '',
        actionId, componentState, { appState, parameters: parameters || {} });
      let reg = bridge.reduceContexts(before, increment);

      // ROUTE-FLIP del mediador embebido: una respuesta state-only con _route nuevo
      // significa "recarga mi ruta interna" (p.ej. edit → /edit, save → /view)
      let after = reg.contexts[islandId];
      const flippedRoute = after && after.state ? after.state._route : null;
      const previousRoute = islandContext.state ? islandContext.state._route : null;
      // OJO: nada de comparar por IDENTIDAD (after.tree === before.tree): las variables
      // de VB van tras proxies y cada lectura puede devolver un wrapper distinto —
      // el criterio es semántico: el increment fue STATE-ONLY (ningún fragment con árbol)
      const stateOnly = (increment.fragments || []).length > 0
        && (increment.fragments || []).every((f) => !f.component);
      if (after && stateOnly && flippedRoute != null && flippedRoute !== previousRoute) {
        const innerRoute = bridge.composeInnerRoute(outbound.route || '', flippedRoute);
        const reload = await bridge.loadRoute(base, innerRoute, islandId, {
          consumedRoute: outbound.consumedRoute || outbound.route || '',
          serverSideType: outbound.serverSideType,
          appState,
        });
        reg = bridge.reduceContexts(reg, reload);
        after = reg.contexts[islandId];
      }
      $application.variables.mateuRegistry = reg;
      $application.variables.mateuIsland = after
        ? { fields: bridge.fieldListOf(after.tree, after.state),
            actions: bridge.actionsOf(after.tree),
            content: bridge.islandContentOf(after) }
        : null;
      // isla ANIDADA dentro de la isla (App con initialData sembrado, p.ej. el documento):
      // cargar con el initialData como componentState; RECARGAR si el seed cambió (selectPax)
      const nestedList = after ? bridge.collectIslands(after.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        // SIN atajo consumedRoute/serverSideType: el baile de 2 pasos del mediador
        // captura las ACTIONS del wrapper (el flag sse solo viaja ahí → sseActionIds)
        reg = await bridge.loadRouteInto(base, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      $application.variables.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;
      // los átomos de la anidada se FUSIONAN en el contenido de la isla (fluyen por
      // $current — leer $application.variables en templates profundos no re-liga)
      if ($application.variables.mateuIsland && nestedBlocks) {
        $application.variables.mateuIsland = Object.assign({}, $application.variables.mateuIsland, {
          content: bridge.mergeNestedContent($application.variables.mateuIsland.content, nestedBlocks),
        });
      }


      $page.variables.mateuIslandDraft = {};
      $application.variables.mateuDirty = false;

      for (const toast of reg.effects.toasts) {
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, {
          selector: '#mateuToast',
          method: 'open',
        });
      }
    }
  }

  return runMateuIslandAction;
});
