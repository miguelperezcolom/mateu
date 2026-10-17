/* Phase 9: ISLAND action (Edit/Save/toolbar of the embedded mediator) — it is posted against
 * the island's context (outbound stamped when it was loaded) and in general ONLY the island is
 * re-projected. If the response brings bus EVENTS (e.g. the "Check-out" of the 360
 * toolbar emits checkout-solicitado), the OnCustomEvent triggers subscribed in the
 * HOST are fired and everything is re-projected — including the possible REPLACEMENT of the
 * island (the host decides to show another detail screen). */

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
      // same as in runMateuAction: the island lives in its host's backend
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || bridge.mateuBase($application.constants.mateuBaseUrl);
      const appState = $application.variables.mateuAppState || {};
      // the island's SEED (the wrapper's initialData: stayId/paxIndex…) must travel on EVERY
      // action — the server does not echo it and the loaded model's state does not carry it (same
      // gotcha as the nested island); a null in the state does NOT overwrite the seed
      let islandSeed = {};
      try { islandSeed = JSON.parse($application.variables.mateuIslandSeed || '{}'); } catch (e) { islandSeed = {}; }
      const componentState = Object.assign(
        {}, islandContext.state, $page.variables.mateuIslandDraft);
      for (const seedKey of Object.keys(islandSeed)) {
        if (componentState[seedKey] == null) {
          componentState[seedKey] = islandSeed[seedKey];
        }
      }
      const outbound = islandContext.outbound || {};

      let reg = before;
      const allEvents = [];
      const allToasts = [];
      const apply = (increment) => {
        reg = bridge.reduceContexts(reg, increment);
        bridge.applyDomEffects(reg.effects, reg);
        allEvents.push.apply(allEvents, reg.effects.events || []);
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };

      // actions advertised Action.sse(true) (LongTask, e.g. scanning) → /sse endpoint
      const isSse = (islandContext.sseActionIds || []).indexOf(actionId) >= 0;
      let lastIncrement = null;
      if (isSse) {
        // LongTask: live progress dialog (same treatment as runMateuAction)
        const progressWatcher = bridge.longTaskWatcher();
        let progressOpen = false;
        const increments = await bridge.runMateuActionSse(
          base, islandContext, outbound.route || '',
          actionId, componentState, {
            appState, parameters: parameters || {},
            onIncrement: async (inc) => {
              const ev = progressWatcher.consume(inc);
              if (!ev) return false;
              if (ev.title != null) $page.variables.mateuProgressTitle = ev.title;
              if (ev.text != null) $page.variables.mateuProgressText = ev.text;
              if (ev.value != null) $page.variables.mateuProgressValue = Math.round(ev.value * 100);
              if (ev.kind === 'open' && !progressOpen) {
                progressOpen = true;
                await Actions.callComponentMethod(context, {
                  selector: '#mateuProgressDialog', method: 'open',
                });
              }
              if (ev.rest.commands.length || ev.rest.messages.length) {
                apply(ev.rest);
              }
              return true;
            },
          });
        increments.forEach((inc) => { lastIncrement = inc; apply(inc); });
        if (progressOpen) {
          await new Promise((resolve) => setTimeout(
            resolve, progressWatcher.closeAfter != null ? progressWatcher.closeAfter : 600));
          await Actions.callComponentMethod(context, {
            selector: '#mateuProgressDialog', method: 'close',
          });
        }
      } else {
        lastIncrement = await bridge.runMateuAction(
          base, islandContext, outbound.route || '',
          actionId, componentState, { appState, parameters: parameters || {} });
        apply(lastIncrement);
      }

      // ROUTE-FLIP of the embedded mediator: a state-only response with a new _route
      // means "reload my inner route" (e.g. edit → /edit, save → /view).
      // CAREFUL: no comparing by IDENTITY (VB proxies) — semantic criterion.
      let after = reg.contexts[islandId];
      const flippedRoute = after && after.state ? after.state._route : null;
      const previousRoute = islandContext.state ? islandContext.state._route : null;
      const stateOnly = lastIncrement && (lastIncrement.fragments || []).length > 0
        && (lastIncrement.fragments || []).every((f) => !f.component);
      if (after && stateOnly && flippedRoute != null && flippedRoute !== previousRoute) {
        const innerRoute = bridge.composeInnerRoute(outbound.route || '', flippedRoute);
        // the flip's reload also carries the seed (the new state is hydrated from it)
        const flipState = Object.assign({}, islandSeed, after.state);
        for (const seedKey of Object.keys(islandSeed)) {
          if (flipState[seedKey] == null) {
            flipState[seedKey] = islandSeed[seedKey];
          }
        }
        apply(await bridge.loadRoute(base, innerRoute, islandId, {
          consumedRoute: outbound.consumedRoute || outbound.route || '',
          serverSideType: outbound.serverSideType,
          appState,
          componentState: flipState,
        }));
      }

      // bus events → triggers subscribed in the HOST (e.g. checkout-solicitado →
      // checkoutGuest in ReservasQueue); the host re-renders
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

      // which island to project: if the host changed, it may have REPLACED the island
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
        $application.variables.mateuIslandSeed = islandAfter
          ? JSON.stringify(islandAfter.initialData || {}) : '';
        $application.variables.mateuQueue = bridge.taskQueueOf(hostAfter.tree);
        $application.variables.mateuHostEmpty = bridge.emptyStateOf(hostAfter.tree);
      }

      const islandNow = effectiveIslandId ? reg.contexts[effectiveIslandId] : null;

      // NESTED island inside the island (App with seeded initialData): load with the
      // seed as componentState; RELOAD if the seed changed. NO consumedRoute/
      // serverSideType shortcut: the 2-step dance captures the wrapper's ACTIONS (sse flag)
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
      // the nested one's atoms are MERGED into the island's content (they flow through
      // $current — reading $application.variables in deep templates does not re-bind)
      $application.variables.mateuIsland = islandNow
        ? { fields: bridge.fieldListOf(islandNow.tree, islandNow.state, islandNow.data),
            sections: bridge.formSectionsOf(islandNow.tree, islandNow.state, islandNow.data),
            actions: bridge.actionsOf(islandNow.tree),
            content: bridge.mergeNestedContent(bridge.islandContentOf(islandNow), nestedBlocks) }
        : null;

      // display content of the HOST / of the standalone wizard: re-merge with the island
      const hostFinal = reg.contexts[bridge.HOST_ID];
      const islandRawBlocksNow = islandNow ? bridge.islandContentOf(islandNow) : null;
      if ($application.variables.mateuWizard) {
        if (hostChanged) {
          $application.variables.mateuWizard = bridge.wizardOf(hostFinal);
        }
        const stepNow = bridge.wizardStepViewOf(hostFinal, islandRawBlocksNow,
          { title: $application.variables.mateuHostTitle, sections: $application.variables.mateuFormSections });
        if (stepNow && stepNow.wizard.horizontal) {
          // train on top: the step's content lives in the host content's branch
          $application.variables.mateuHostContent = stepNow.content;
        } else {
          $application.variables.mateuWizardContent = (stepNow && stepNow.content) || [];
        }
      } else if (($application.variables.mateuHostContent || []).length) {
        // same opts as runMateuAction: without them the page title and the EntityHeader
        // reappeared DUPLICATED in the content after an island action
        const hostEntityNow = bridge.entityHeaderOf(hostFinal);
        $application.variables.mateuHostContent = bridge.hostContentOf(hostFinal, islandRawBlocksNow,
          { title: $application.variables.mateuHostTitle, dropEntityHeader: !!hostEntityNow }) || [];
      }

      // the Elements (web components, server HTML) of the host, the wizard step and the
      // island are mounted again: after an island action their slots are repainted empty
      bridge.mountElementsSoon([].concat(
        bridge.elementAtomsOf($application.variables.mateuHostContent),
        bridge.elementAtomsOf($application.variables.mateuWizardContent),
        bridge.elementAtomsOf(($application.variables.mateuIsland || {}).content)));

      $page.variables.mateuIslandDraft = {};
      $application.variables.mateuDirty = false;

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

  return runMateuIslandAction;
});
