/* Fase 9: acción de la ISLA (Edit/Save/toolbar del mediador embebido) — se postea contra
 * el contexto de la isla (outbound estampado al cargarla) y en general SOLO la isla se
 * re-proyecta. Si la respuesta trae EVENTOS de bus (p.ej. el "Check-out" del toolbar del
 * 360 emite checkout-solicitado), se disparan los triggers OnCustomEvent suscritos en el
 * HOST y se re-proyecta todo — incluida la posible SUSTITUCIÓN de la isla (el host decide
 * mostrar otra pantalla de detalle). */

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
     * @param {Object} params.parameters
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
      const appState = $application.variables.mateuAppState || {};
      const componentState = Object.assign(
        {}, islandContext.state, $page.variables.mateuIslandDraft);
      const outbound = islandContext.outbound || {};

      let reg = before;
      const allEvents = [];
      const allToasts = [];
      const apply = (increment) => {
        reg = bridge.reduceContexts(reg, increment);
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };

      // acciones anunciadas Action.sse(true) (LongTask, p.ej. escanear) → endpoint /sse
      const isSse = (islandContext.sseActionIds || []).indexOf(actionId) >= 0;
      let lastIncrement = null;
      if (isSse) {
        const increments = await bridge.runMateuActionSse(
          base, islandContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} });
        increments.forEach((inc) => { lastIncrement = inc; apply(inc); });
      } else {
        lastIncrement = await bridge.runMateuAction(
          base, islandContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} });
        apply(lastIncrement);
      }

      // ROUTE-FLIP del mediador embebido: una respuesta state-only con _route nuevo
      // significa "recarga mi ruta interna" (p.ej. edit → /edit, save → /view).
      // OJO: nada de comparar por IDENTIDAD (proxies de VB) — criterio semántico.
      let after = reg.contexts[islandId];
      const flippedRoute = after && after.state ? after.state._route : null;
      const previousRoute = islandContext.state ? islandContext.state._route : null;
      const stateOnly = lastIncrement && (lastIncrement.fragments || []).length > 0
        && (lastIncrement.fragments || []).every((f) => !f.component);
      if (after && stateOnly && flippedRoute != null && flippedRoute !== previousRoute) {
        const innerRoute = bridge.composeInnerRoute(outbound.route || '', flippedRoute);
        apply(await bridge.loadRoute(base, innerRoute, islandId, {
          consumedRoute: outbound.consumedRoute || outbound.route || '',
          serverSideType: outbound.serverSideType,
          appState,
        }));
      }

      // eventos de bus → triggers suscritos en el HOST (p.ej. checkout-solicitado →
      // checkoutGuest en ReservasQueue); el host se re-renderiza
      let hostChanged = false;
      for (const busEvent of allEvents.splice(0)) {
        const hostNow = reg.contexts[bridge.HOST_ID];
        if (!hostNow) continue;
        for (const triggerActionId of bridge.eventTriggersOf(hostNow, busEvent.name)) {
          apply(await bridge.runMateuAction(
            base, hostNow, '', triggerActionId,
            Object.assign({}, hostNow.state, busEvent.detail || {}),
            { appState, parameters: busEvent.detail || {} }));
          hostChanged = true;
        }
      }

      // qué isla toca proyectar: si el host cambió, puede haber SUSTITUIDO la isla
      let effectiveIslandId = islandId;
      if (hostChanged) {
        const hostAfter = reg.contexts[bridge.HOST_ID];
        const islandsAfter = bridge.collectIslands(hostAfter.tree);
        const islandAfter = islandsAfter.length ? islandsAfter[0] : null;
        if (islandAfter && !reg.contexts[islandAfter.id]) {
          reg = await bridge.loadRouteInto(base, reg, islandAfter.route, islandAfter.id, {
            appState,
            componentState: islandAfter.initialData || {},
          });
        }
        effectiveIslandId = islandAfter ? islandAfter.id : '';
        $application.variables.mateuIslandId = effectiveIslandId;
        $application.variables.mateuQueue = bridge.taskQueueOf(hostAfter.tree);
        $application.variables.mateuHostEmpty = bridge.emptyStateOf(hostAfter.tree);
      }

      const islandNow = effectiveIslandId ? reg.contexts[effectiveIslandId] : null;

      // isla ANIDADA dentro de la isla (App con initialData sembrado): cargar con el
      // seed como componentState; RECARGAR si el seed cambió. SIN atajo consumedRoute/
      // serverSideType: el baile de 2 pasos captura las ACTIONS del wrapper (flag sse)
      const nestedList = islandNow ? bridge.collectIslands(islandNow.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        reg = await bridge.loadRouteInto(base, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
      }
      $application.variables.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      $application.variables.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      $application.variables.mateuNested = nestedBlocks
        ? { atoms: nestedBlocks.reduce((out, b) => out.concat(b.items), []) }
        : null;

      $application.variables.mateuRegistry = reg;
      // los átomos de la anidada se FUSIONAN en el contenido de la isla (fluyen por
      // $current — leer $application.variables en templates profundos no re-liga)
      $application.variables.mateuIsland = islandNow
        ? { fields: bridge.fieldListOf(islandNow.tree, islandNow.state),
            actions: bridge.actionsOf(islandNow.tree),
            content: bridge.mergeNestedContent(bridge.islandContentOf(islandNow), nestedBlocks) }
        : null;

      // contenido display del HOST / del wizard standalone: re-fusionar con la isla
      const hostFinal = reg.contexts[bridge.HOST_ID];
      const islandRawBlocksNow = islandNow ? bridge.islandContentOf(islandNow) : null;
      if ($application.variables.mateuWizard) {
        if (hostChanged) {
          $application.variables.mateuWizard = bridge.wizardOf(hostFinal);
        }
        $application.variables.mateuWizardContent = bridge.hostContentOf(
          hostFinal, islandRawBlocksNow,
          { forWizard: true, title: $application.variables.mateuHostTitle });
      } else if ($application.variables.mateuHostContent) {
        $application.variables.mateuHostContent = bridge.hostContentOf(hostFinal, islandRawBlocksNow);
      }

      $page.variables.mateuIslandDraft = {};
      $application.variables.mateuDirty = false;

      for (const toast of allToasts) {
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
