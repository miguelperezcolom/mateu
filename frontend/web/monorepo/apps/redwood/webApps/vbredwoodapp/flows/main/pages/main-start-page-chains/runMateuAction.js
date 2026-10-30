/* Outbound action (Phases 3–5). Sends the state you already have: if a drawer is open, its
 * state + its draft (the crud drawer's actions go against the HOST — the drawer has no
 * ServerSide of its own); otherwise, the host's state + the form draft. The increment that
 * comes back is reduced and its effects applied: Add → project the drawer; CloseModal →
 * close it and fire the OnCustomEvent triggers subscribed to the emitted event (the listing
 * refresh travels ON the wire); toasts; NavigateTo → application event mateuNavigate. */

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

  class runMateuAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.actionId    id of the Mateu action (from the button's $current)
     * @param {Object} params.parameters  extra parameters (e.g. the row on the view click)
     * @param {Object} params.event       ojAction event (fallback: data-action-id)
     * @param {Object} params.increment   a READY answer (the chat's generated screen: the shell ran `__preview__`)
     */
    async run(context, { actionId, parameters, event, increment }) {
      const { $application, $page } = context;

      // Marking the pressed control is done by the transport hooks at document level
      // (bridge.trackPressedControls): that way it covers ALL the chains, not just this one.
      try {
        return await this.dispatch(context, { actionId, parameters, event, increment });
      } catch (e) {
        // its screen is gone (navigated away while in flight): die silently
        if (bridge.isStaleResponse(e)) return undefined;
        // "Retry" has to re-run the whole ACTION, not just the request: a response nobody
        // processes changes nothing on screen.
        bridge.setLastRetry({ kind: 'action', actionId: actionId || (event && event.target && event.target.dataset && event.target.dataset.actionId), parameters });
        throw e;
      }
    }

    async dispatch(context, { actionId, parameters, event, increment }) {
      const { $application, $page } = context;

      let id = actionId;
      if (!id && event && event.target && event.target.dataset) {
        id = event.target.dataset.actionId;
      }
      if (!id) {
        return;
      }
      // a LEAVE action (Cancel…) with unsaved changes asks as the menu does; «stay» sends nothing
      if (!bridge.confirmLeaveAction(id, $application.variables, undefined, parameters)) return;
      // «go to parent» without a back button: the automatic trail put it there, and it is a
      // navigation — the same as the menu's (navigation-requested, which the shell listens to)
      // the way back from the NOT FOUND page (navigationAction of the oj-sp-empty-state): navigate
      // to the route the server sends (the parent of the record that does not exist, or home)
      if (id === '__notFoundBack') {
        const backRoute = ($application.variables.mateuNotFound || {}).backRoute;
        if (backRoute) {
          document.dispatchEvent(new CustomEvent('navigation-requested', {
            detail: { route: backRoute }, bubbles: true, composed: true,
          }));
        }
        return;
      }
      if (id === '__goToParent') {
        const parentRoute = ($application.variables.mateuPageHeader || {}).parentRoute;
        if (parentRoute) {
          document.dispatchEvent(new CustomEvent('navigation-requested', {
            detail: { route: parentRoute }, bubbles: true, composed: true,
          }));
        }
        return;
      }
      // the header's PEER arrows (PeerNavigationSupplier / a YAML `peerNav:`): they navigate like
      // a breadcrumb — a side without a route is drawn disabled, so it never gets here
      if (id === '__peerPrev' || id === '__peerNext') {
        const header = $application.variables.mateuPageHeader || {};
        const peerRoute = id === '__peerPrev' ? header.prevRoute : header.nextRoute;
        if (peerRoute) {
          document.dispatchEvent(new CustomEvent('navigation-requested', {
            detail: { route: peerRoute }, bubbles: true, composed: true,
          }));
        }
        return;
      }

      // The screen may come from another pod (federated menu): its loads and actions keep
      // talking to THAT backend, not to the shell's.
      const base = bridge.baseOf($application.variables.mateuRegistry)
        || bridge.mateuBase($application.constants.mateuBaseUrl);
      const before = $application.variables.mateuRegistry;
      const host = before.contexts[bridge.HOST_ID];
      const route = $application.variables.mateuSelectedRoute;
      // WHAT the action sends and WHERE (poc/actionPlan.mjs, tested): its state (the drawer's, or
      // the host's with the form draft and the listing's selection), the list container or the
      // ServerSide that declares it — or why it must not leave yet
      const plan = bridge.outboundActionOf(before, id, {
        draft: $page.variables.mateuDraft,
        drawerDraft: $page.variables.mateuDrawerDraft,
        rowDraft: $page.variables.mateuRowDraft,
        parameters,
        listing: $application.variables.mateuListing,
        listingRows: $application.variables.mateuListingRows,
        listingSelection: $application.variables.mateuListingSelection,
        formSections: $application.variables.mateuFormSections,
      });
      // the chat's generated screen arrives answered: none of the outbound checks apply to it
      const preset = id === bridge.CHAT_PREVIEW_PAINT_ACTION ? (increment || { fragments: [] }) : null;
      if (!preset && plan.stop === 'selectionRequired') {
        $page.variables.mateuToastText = bridge.chromeText('selectRowsFirst');
        await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
        return;
      }
      if (!preset && plan.stop === 'fieldErrors') {
        // the required fields are marked as a Redwood form does (a failed bound or pattern with
        // its wire message), the focus goes to the first — the page's, or the open drawer's
        await bridge.showFieldErrors(plan.missing, null, { messages: plan.messages, inOverlay: plan.inOverlay });
        return;
      }
      if (!preset && plan.stop === 'rowErrors') {
        $page.variables.mateuRowErrors = plan.rowErrors;
        if (plan.rowEditor) {
          $page.variables.mateuRowEditor = plan.rowEditor;
        }
        return;
      }
      const overlayBefore = plan.overlay;
      const listReq = plan.listReq;
      const componentState = plan.componentState;
      const transportCtx = plan.transportCtx;
      const transportExtra = plan.transportExtra;
      parameters = plan.parameters;

      // confirmationRequired: the confirmation dialog BEFORE it leaves (with the action's
      // texts); «No», ✕ or Esc leave it unsent. Vaadin does it in the browser; here it was
      // skipped and the action went out without asking.
      const confirmation = preset ? null : bridge.confirmationOf(transportCtx, id);
      if (confirmation) {
        $page.variables.mateuConfirm = confirmation;
        const answer = bridge.awaitConfirmation();
        await Actions.callComponentMethod(context, { selector: '#mateuConfirm', method: 'open' });
        if (!(await answer)) {
          return;
        }
      }

      const appState = $application.variables.mateuAppState || {};
      // the HOST's actions advertised Action.sse(true) (e.g. opFirma → tablet) go through the
      // /sse endpoint: ALL the stream's increments are applied and the events/toasts of each
      // one are ACCUMULATED (each reduce replaces effects)
      const isSse = bridge.isSseAction(host, id);
      let reg = before;
      const allEvents = [];
      const allToasts = [];
      // did any increment REPAINT the host? (any non-Add fragment: Replace/State/data;
      // Adds are overlays — opening a drawer does not touch the host). Signal for the foldout
      // remount: comparing references/uuids does not work (VB proxies, stable uuids).
      let hostRepainted = false;
      const touchesHost = bridge.touchesHost;
      let lastIncrement = null; const returnedConfirms = []; // ConfirmDialogs RETURNED: asked below
      // the fields the SERVER refused (a refused drawer save names them): marked at the end
      let refusedFields = null;
      const applyInc = (inc) => {
        lastIncrement = inc;
        returnedConfirms.push(...bridge.returnedConfirmDialogsOf(inc));
        reg = bridge.reduceContexts(reg, inc);
        refusedFields = bridge.refusedFieldsOf(inc, reg) || refusedFields;
        bridge.applyDomEffects(reg.effects, reg);
        if (touchesHost(inc)) hostRepainted = true;
        allEvents.push.apply(allEvents, bridge.followUpsOf(reg.effects)); // its bus events and RunActions
        allToasts.push.apply(allToasts, reg.effects.toasts || []);
      };
      // OWNER FIRST, then the app's ACTION catalogue: a flow the page declares — or, when the page
      // does not declare the id, the catalogue's — runs HERE with no server round trip, reduced
      // like any increment (NavigateTo / DispatchEvent / CloseModal / MarkAsClean …).
      const clientFlow = preset ? null : bridge.pageFlowOf(before, id);
      if (preset) {
        applyInc(preset);
      } else if (clientFlow) {
        applyInc({ commands: clientFlow, fragments: [], messages: [] });
      } else if (isSse) {
        // LongTask: the progress dialog is painted LIVE as the stream arrives; its
        // increments (the Dialog's Add + the progress state-only ones) are CONSUMED here and
        // not reduced — the commands/messages of the last one (e.g. the refresh's
        // dispatchEvent) are, via rest
        const progressWatcher = bridge.longTaskWatcher();
        let progressOpen = false;
        const increments = await bridge.runMateuActionSse(
          base, transportCtx, route, id, componentState, {
            ...transportExtra,
            parameters: parameters || {}, appState,
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
                applyInc(ev.rest);
              }
              return true;
            },
          });
        increments.forEach(applyInc);
        if (progressOpen) {
          await new Promise((resolve) => setTimeout(
            resolve, progressWatcher.closeAfter != null ? progressWatcher.closeAfter : 600));
          await Actions.callComponentMethod(context, {
            selector: '#mateuProgressDialog', method: 'close',
          });
        }
      } else {
        applyInc(await bridge.runMateuAction(
          base, transportCtx, route, id, componentState,
          { ...transportExtra, parameters: parameters || {}, appState }));
      }
      // RE-RENDER of the host by the action (it returned the page: a new component, with another
      // id): as on the web (applyFragment → triggerOnLoad), what just arrived asks for its OnLoad
      // load — without this a listing that repaints (e.g. after dropping rows on a DropZone)
      // came back EMPTY, with its columns and not a single row. Reduced separately: lastIncrement
      // is the action's, which the route-flip below reads.
      {
        const hostNow = reg.contexts[bridge.HOST_ID];
        const reRendered = bridge.hostReRendered(lastIncrement, host, hostNow);
        if (reRendered) {
          for (const triggerActionId of bridge.onLoadTriggers(hostNow)) {
            const listingNow = bridge.listingOf(hostNow);
            const loaded = await bridge.runMateuAction(base, hostNow, route, triggerActionId,
              Object.assign({}, hostNow.state, { page: 0, size: (listingNow && listingNow.pageSize) || 20 }),
              { appState });
            reg = bridge.reduceContexts(reg, loaded);
            bridge.applyDomEffects(reg.effects, reg);
            hostRepainted = true;
          }
        }
      }
      // ROUTE-FLIP of the HOST's mediator: a PAGE crud does not answer the detail, it answers
      // a state-only fragment whose `_route` points at it (row click → /2CSXZN, New →
      // /new, back → /list). Without following it NOTHING happens on click: the request goes
      // out, the server answers 200 and the listing stays the same. The island already followed
      // it; the host did not.
      //
      // The wire separates TWO things that look alike and are not the same: `_route` is the
      // INTERNAL route to reload (`/list`) and the `PushStateToHistory` is the URL, relative
      // to the mediator (`''` for the listing). Using the first as the URL leaves addresses that
      // do not exist — /booking/bookings/list instead of /booking/bookings.
      const urlPush = reg.effects ? reg.effects.urlPush : undefined;
      const flipRoute = bridge.routeFlipOf(
        host && host.state, reg.contexts[bridge.HOST_ID], lastIncrement, route);
      if (flipRoute) {
        const flipOutbound = (reg.contexts[bridge.HOST_ID] || {}).outbound || {};
        const mediatorRoute = bridge.mediatorBaseOf(flipOutbound, route);
        // the URL goes with the content: the detail is addressable and the back button returns to
        // the listing (the shell's popstate reloads the previous route). It is pushed BEFORE
        // loading the detail, like a link: pushed at the end, a "back" pressed during the load did
        // not find this entry and skipped the listing's.
        if (urlPush != null) {
          const urlRoute = bridge.composeInnerRoute(mediatorRoute, urlPush);
          $application.variables.mateuSelectedRoute = urlRoute;
          $application.variables.mateuSelectedNavId = urlRoute;
          try {
            window.history.pushState(
              null, '', bridge.urlOfRoute(urlRoute));
          } catch (ignored) { /* no history in some contexts */ }
        }
        applyInc(await bridge.loadRoute(base, flipRoute, '', {
          consumedRoute: flipOutbound.consumedRoute || mediatorRoute,
          serverSideType: flipOutbound.serverSideType,
          appState,
          componentState: reg.contexts[bridge.HOST_ID].state,
        }));
        // another screen: arm its periodic refresh and forget the previous one's, as onMateuNavigate
        // does (else back on the listing the detail's `refresh` went on going out, to the crud)
        bridge.startPolling(reg.contexts[bridge.HOST_ID]);
        // what just arrived may ask for its OnLoad load (the listing asks for `search`; without
        // this you come back from the detail to an empty table, with its columns and no rows)
        const reloaded = reg.contexts[bridge.HOST_ID];
        for (const triggerActionId of bridge.onLoadTriggers(reloaded)) {
          const reloadedListing = bridge.listingOf(reloaded);
          applyInc(await bridge.runMateuAction(
            base, reloaded, flipRoute, triggerActionId,
            Object.assign({}, reloaded.state,
              { page: 0, size: (reloadedListing && reloadedListing.pageSize) || 20 }),
            { appState }));
        }
      }

      const effects = reg.effects;

      // bus events (CloseModal/DispatchEvent) → subscribed OnCustomEvent triggers; a RunAction → its action
      for (const busEvent of allEvents) {
        const hostNow = reg.contexts[bridge.HOST_ID];
        for (const triggerActionId of bridge.followUpActionsOf(hostNow, busEvent)) {
          const refresh = await bridge.runMateuAction(base, hostNow, route, triggerActionId, // a listing: its own query, same page
            bridge.followUpStateOf(hostNow, triggerActionId, busEvent.detail, { searchText: $application.variables.mateuLastSearchText,
              filters: $application.variables.mateuFilterValues, sort: $application.variables.mateuListingSort }),
            { appState, parameters: busEvent.detail || {} },
          );
          reg = bridge.reduceContexts(reg, refresh);
          bridge.applyDomEffects(reg.effects, reg);
          if (touchesHost(refresh)) hostRepainted = true;
          allToasts.push.apply(allToasts, reg.effects.toasts || []);
        }
      }

      // …and the ISLANDS subscribed to them (an inline island's @SubscribeTo: COMPONENT/DOCUMENT
      // scope) — the loop above only served the host (bridge.deliverBusEvents, skipHost)
      if (allEvents.length) {
        const delivered = await bridge.deliverBusEvents(reg, allEvents, { base, appState, skipHost: true });
        if (delivered !== reg) {
          reg = delivered;
          bridge.applyDomEffects(reg.effects, reg);
          allToasts.push.apply(allToasts, reg.effects.toasts || []);
        }
      }

      // remote lookups of what just arrived (the form of a new step, a creation)
      try {
        reg = await bridge.loadLookups(base, reg, bridge.HOST_ID, { appState, route, draft: $page.variables.mateuDraft });
      } catch (ignored) { /* without options they stay as they were */ }

      // The SELECTOR of a @Searchable that has just opened: what was typed in the form is merged
      // into its state — the draft is emptied when the dialog closes, and the pick returns to the state
      const pickerOpened = !!bridge.searchPickerOf(reg) && !bridge.searchPickerOf(before);
      if (pickerOpened) {
        reg = bridge.withContextState(reg, bridge.HOST_ID, $page.variables.mateuDraft);
        bridge.clearFieldErrorMarks(id.indexOf('codesearch-') === 0 ? id.substring('codesearch-'.length) : null);
      }

      $application.variables.mateuRegistry = reg;

      if (returnedConfirms.length && !hostRepainted) { // a RETURNED ConfirmDialog: ask, run the pick
        const ask = $page.variables.mateuConfirm = returnedConfirms[returnedConfirms.length - 1];
        const answer = bridge.awaitConfirmation();
        await Actions.callComponentMethod(context, { selector: '#mateuConfirm', method: 'open' });
        const chosen = (await answer) ? ask.confirmActionId : ask.denyActionId; if (chosen) await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: chosen } });
        return;
      }

      // A response that ONLY brings messages (e.g. the «rate missing» with which a wizard
      // will not let you leave the step) does not change the screen: re-projecting it repainted
      // the form with the server's state and took away what the user had typed.
      const onlyMessages = bridge.onlyMessagesAnswer({
        hostRepainted, flipRoute, events: allEvents, overlayBefore, overlayNow: bridge.overlayOf(reg), lastIncrement,
      });
      if (onlyMessages) {
        for (const toast of allToasts) {
          // an error or warning goes to the shell's message banner (the Redwood toast only confirms)
          const notification = bridge.bannerNotificationOf(toast);
          if (notification) { await Actions.fireNotificationEvent(context, notification); continue; }
          $page.variables.mateuToastText = toast.text;
          await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
        }
        return;
      }

      // projections: drawer, listing, form
      const overlayNow = bridge.overlayOf(reg);
      // a Dialog overlay goes to the MODAL (oj-dialog, a one-off decision); the rest to the drawer —
      // except a @Searchable's selector, which has its own dialog (#mateuPicker). Two variables
      // (bridge.overlayVarsOf): a Dialog opened OVER a Drawer leaves the drawer where it is
      const pickerNow = bridge.searchPickerOf(reg);
      const overlayVars = bridge.overlayVarsOf(reg, pickerNow);
      // a crud drawer's Spectra arrows walk the listing rows on screen (tree.mjs withListingPeers)
      const changed = bridge.changedOnly($application.variables); // only what changed: a poll repaints nothing
      changed.mateuDrawer = bridge.withListingPeers(overlayVars.drawer, $application.variables.mateuListingRows);
      changed.mateuDialog = overlayVars.dialog;
      const esModal = overlayVars.modal;
      // a listing in a Drawer is drawn inside the drawer (pickerNow.inDrawer), not in the selector's dialog
      $application.variables.mateuDrawerOpen = overlayVars.drawerOpen;
      if (esModal && !$page.variables.mateuModalOpen) {
        $page.variables.mateuModalOpen = true;
        await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'open' });
      } else if (!esModal && $page.variables.mateuModalOpen) {
        $page.variables.mateuModalOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
      }
      if (!overlayNow || !overlayBefore || overlayNow.id !== overlayBefore.id) {
        $page.variables.mateuDrawerDraft = {};
        // another drawer (or none): its Spectra template starts at its size, nothing pending
        $page.variables.mateuDrawerState = 'auto';
        $page.variables.mateuDrawerLeaving = null;
        bridge.noteDrawerUnsaved(false);
      }
      if (pickerNow) {
        $page.variables.mateuPicker = pickerNow;
        $page.variables.mateuPickerRows = pickerNow.rows;
      } else if ($page.variables.mateuPickerOpen) {
        // picked (or closed by the server): the flag drops BEFORE the close — its ojBeforeClose
        // is not a user dismissal
        $page.variables.mateuPickerOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuPicker', method: 'close' });
      }

      const hostAfter = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(hostAfter);
      changed.mateuListing = listingSummary;
      changed.mateuListingRows = listingSummary ? listingSummary.rows : [];

      // foldout REMOUNT: the bindings inside oj-sp-foldout-panel do not re-bind
      // the application variables (CSP evaluator gotcha) — null → tick → new projection
      // makes the oj-bind-if recreate the subtree with the fresh blocks.
      // ONLY if some increment REPAINTED the host (hostRepainted) — opening a drawer (Add)
      // does not touch it, and remounting here reset the foldout's folding/animation.
      // What this chain assigns is read from the constants, not back from the variable: a VB
      // `any` variable that held an object and is set to null reads INSIDE the same chain
      // as a truthy proxy (the bindings do see the null) — see onMateuNavigate.
      let foldoutNow = $application.variables.mateuFoldout;
      if (hostRepainted) {
        const foldoutProjection = bridge.foldoutOf(hostAfter);
        foldoutNow = foldoutProjection;
        const foldoutBefore = $application.variables.mateuFoldout;
        if (bridge.sameFoldoutStructure(foldoutBefore, foldoutProjection)) {
          // IN-PLACE update: the panels are stamped ONCE (their for-each loses its
          // anchors if re-stamped — the foldout's DOM surgery); the content lives in
          // mateuFoldoutContent, whose bindings DO re-evaluate inside the panel
          $application.variables.mateuFoldoutContent = bridge.foldoutContentOf(foldoutProjection);
        } else {
          // different structure (number of panels) or entering/leaving foldout mode:
          // full null→tick remount
          if (foldoutBefore && foldoutProjection) {
            $application.variables.mateuFoldout = null;
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          // content BEFORE structure (the panels read it when stamped)
          $application.variables.mateuFoldoutContent = bridge.foldoutContentOf(foldoutProjection);
          $application.variables.mateuFoldout = foldoutProjection;
        }
        bridge.mountElementsSoon(bridge.foldoutElementAtomsOf($application.variables.mateuFoldoutContent), 60);
        bridge.applyFoldoutFoldsSoon(foldoutProjection); // same page: unfolded panels stay unfolded
      }
      // ── the page projection (poc/pageProjection.mjs, tested): what to assign from the registry ──
      const staged = bridge.stagedVariables($application.variables); // assigned once, what changed (commit below)
      const vars = staged.vars;
      const assign = (values) => { for (const key of Object.keys(values)) vars[key] = values[key]; };
      const wizardProjection = bridge.wizardOf(hostAfter);
      vars.mateuWizard = wizardProjection;
      if (wizardProjection) bridge.guardGuidedProcess();

      // collection header: the crud's toolbar → primaryAction/secondaryActions
      assign(bridge.listHeaderVarsOf(listingSummary));
      // the floating action buttons (@Fab) of the page and of the app
      vars.mateuFabs = bridge.fabsOf(reg.shell, hostAfter);
      // the sticky sections index (@Toc) follows the host (a section can appear with an action)
      vars.mateuToc = bridge.tocOf(hostAfter);
      // inside a master (P1) the header carries the MASTER's title (the record) and the
      // tab's own label moves to the subtitle (withinAppLevels)
      const summary = bridge.withinAppLevels(bridge.summarizeHost(reg, route), reg.appLevels);
      vars.mateuHostTitle = summary.title;
      vars.mateuHostText = summary.text;
      vars.mateuFormMetadata = summary.formMetadata;
      vars.mateuFormFieldsList = summary.fields;
      vars.mateuFormSections = summary.sections;
      vars.mateuFormValue = summary.formValue;
      vars.mateuFormActions = summary.actions;
      // the wizard: the forward button, its label and the on-screen step (an action keeps it)
      assign(bridge.wizardVarsOf(hostAfter, wizardProjection, summary.actions, { keepStep: true }));

      if (!overlayNow) {
        $page.variables.mateuDraft = {};
      }
      // island that appeared with the action (e.g. the TaskQueue detail after openGuest):
      // its content is loaded if its context does not exist yet, and it is (re)projected
      const islandsAfter = bridge.collectIslands(hostAfter.tree);
      const islandAfter = islandsAfter.length ? islandsAfter[0] : null;
      const islandSeed = islandAfter ? JSON.stringify(islandAfter.initialData || {}) : '';
      if (islandAfter && (!reg.contexts[islandAfter.id]
          || vars.mateuIslandSeed !== islandSeed)) {
        // NO shortcut: the 2-step dance captures the wrapper's ACTIONS (sse flag).
        // Also RELOADS if the SEED changed (e.g. seleccionarPax re-seeds paxIndex)
        reg = await bridge.loadRouteInto(base, reg, islandAfter.route, islandAfter.id, {
          appState,
          componentState: islandAfter.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      vars.mateuIslandId = islandAfter ? islandAfter.id : '';
      vars.mateuIslandSeed = islandSeed;
      const islandCtxAfter = islandAfter ? reg.contexts[islandAfter.id] : null;
      // island NESTED inside the island (App with seeded initialData, e.g. the document):
      // load with the initialData as componentState; RELOAD if the seed changed (selectPax)
      const nestedList = islandCtxAfter ? bridge.collectIslands(islandCtxAfter.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || vars.mateuNestedSeed !== nestedSeed)) {
        // NO consumedRoute/serverSideType shortcut: the mediator's 2-step dance
        // captures the wrapper's ACTIONS (the sse flag only travels there → sseActionIds)
        reg = await bridge.loadRouteInto(base, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      vars.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      vars.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      vars.mateuNested = bridge.nestedVarOf(nestedBlocks);
      // the nested island's atoms are MERGED into the island's content
      vars.mateuIsland = bridge.islandVarsOf(islandCtxAfter, nestedBlocks);

      // front-office work queue (TaskQueue) + detail placeholder
      const queueNow = bridge.taskQueueOf(hostAfter.tree);
      vars.mateuQueue = queueNow;
      vars.mateuHostEmpty = bridge.emptyStateOf(hostAfter.tree);
      // the constant, not the variable: an `any` set to null reads as a truthy proxy in the chain
      const notFoundAfter = bridge.notFoundOf(hostAfter.tree, document.documentElement.lang || navigator.language);
      vars.mateuNotFound = notFoundAfter;
      // composed archetypes (welcome / general overview / item overview); the hero's look is
      // the page's own (a stable hash of its identity), so it does not change while you stay on it
      const archetypes = bridge.archetypeVarsOf(hostAfter);
      assign(archetypes.vars);
      const welcome = archetypes.welcome;
      const overviewProjection = archetypes.overview;
      const itemProjection = archetypes.item;
      if (welcome || overviewProjection || itemProjection || archetypes.dashboard || archetypes.todo || archetypes.spPage) {
        // their fields/buttons are painted by the archetype's branches (or the foldout's panels:
        // a crud's @FoldoutDetail view), not by the generic form
        assign(bridge.noGenericFormVars());
      }
      // display content of the HOST / of the wizard steps (standalone detail)
      const islandRawBlocks2 = islandCtxAfter ? bridge.islandContentOf(islandCtxAfter) : null;
      const esWizard2 = !!wizardProjection;
      // foldout with EntityHeader (the 360): the screen header is kept
      const contentPlan = bridge.hostContentPlanOf(hostAfter, {
        islandRawBlocks: islandRawBlocks2, title: summary.title, activeTabs: vars.mateuActiveTabs,
        wizard: esWizard2, listing: listingSummary, welcome, overview: overviewProjection, item: itemProjection,
        queue: queueNow, foldout: foldoutNow,
      });
      const hostEntity2 = contentPlan.hostEntity;
      let hostBlocks2 = contentPlan.hostBlocks;
      // the @Subresources in view: the already loaded ones keep their table, the new ones are loaded
      if (hostBlocks2) {
        reg = await bridge.loadSubresources(base, reg, hostBlocks2, { appState });
        $application.variables.mateuRegistry = reg;
        hostBlocks2 = bridge.withSubresources(hostBlocks2, reg.contexts);
      }
      // the blocks WIN when they are rich (EntityHeader/Meter/Ledger, tabs, tables…): the
      // generic form and the plain text are suppressed — same rule as the archetypes. Also
      // when the form has nothing to paint (a read-only page is just texts)
      const hostBlocksRicos2 = bridge.hostContentShown(hostBlocks2, summary);
      // the Page's toolbar actions (computed before the header in case some entity page
      // template relocates them)
      const hostToolbarA = bridge.pageToolbarOf(hostAfter);
      // native GENERAL OVERVIEW: entity page with TWO column blocks → the
      // oj-sp-general-overview-page template (main/info slots, integrated header)
      const gop2 = bridge.templatedGeneralOverviewOf(hostAfter) || bridge.generalOverviewPageOf(hostEntity2, hostBlocks2);
      vars.mateuGop = gop2;
      const gopOn2 = gop2.on;
      // the generic form is suppressed: its buttons (the form's @Button) go with the blocks
      // kept here too: the header's pass below works on the projection, not on the variable's proxies
      let hostContent2 = (!gopOn2 && hostBlocksRicos2 ? bridge.templateHostContentOf(archetypes, hostBlocks2, summary.actions, hostAfter.tree) : null) || [];
      vars.mateuHostContent = hostContent2;
      bridge.mountElementsSoon(bridge.elementAtomsOf(vars.mateuHostContent));
      if (hostBlocksRicos2) {
        assign(bridge.noGenericFormVars());
        vars.mateuHostText = '';
      }
      // the wizard STEP (same split as onMateuNavigate): each field ONCE, the Back/Next
      // footer to the footer bar with the train on top, RICH content → no generic form
      const wizardStep2 = esWizard2 ? bridge.wizardStepViewOf(hostAfter, islandRawBlocks2,
        { title: summary.title, sections: vars.mateuFormSections }) : null;
      const wizardH2 = !!(wizardStep2 && wizardStep2.wizard.horizontal);
      vars.mateuWizardContent = (wizardStep2 && !wizardH2 ? wizardStep2.content : null) || [];
      vars.mateuWizardStep = wizardH2
        ? { on: true, title: wizardStep2.title, stepLabel: wizardStep2.wizard.currentLabel, nav: wizardStep2.nav }
        : { on: false, title: '', stepLabel: '', nav: [] };
      if (wizardStep2) {
        vars.mateuFormSections = wizardStep2.sections;
        if (!wizardStep2.sections.length) vars.mateuFormFieldsList = [];
      }
      if (wizardH2) {
        hostContent2 = wizardStep2.content;
        vars.mateuHostContent = hostContent2;
        bridge.mountElementsSoon(bridge.elementAtomsOf(wizardStep2.content));
      }

      // general rule: the page header is ALWAYS painted by a vb header; only the
      // templates that already integrate their own (guided process / general overview / welcome /
      // the listing's smart-filter-search) suppress it
      const integratedHeader = !!(wizardProjection || welcome || archetypes.dashboard || archetypes.todo || archetypes.spPage
        || overviewProjection || listingSummary || bridge.templateOwnsHeader(archetypes)
        || (foldoutNow && !hostEntity2 && !hostToolbarA.length));
      const showHeaderA = !integratedHeader && !notFoundAfter;
      const pwAfter = bridge.pageWidthOf({ host: hostAfter, drawerNav: vars.mateuMenuDrawerMode });
      // the Page's toolbar actions go to the HEADER (the band's primary/secondary); going back
      // is NOT just another action: it is the RDS header's goToParent affordance
      const pageHeader = bridge.pageHeaderOf({
        host: hostAfter, hostEntity: hostEntity2, summary, hostToolbar: hostToolbarA,
        showHeader: showHeaderA, pageWidth: pwAfter, gopOn: gopOn2, listing: (archetypes.cd || archetypes.dm) ? null : listingSummary,
      });
      vars.mateuPageHeader = pageHeader.header;
      vars.mateuPageHeaderTranslations = pageHeader.translations;
      // The Page's toolbar is painted ONLY once: the header wins when it is painted
      vars.mateuFormActions = bridge.formActionsBesideHeader(vars.mateuFormActions, pageHeader.header, hostToolbarA);
      // …nor in the form's action row under rich content (withFormActions)
      const contentBesideHeader = bridge.hostContentBesideHeader(hostContent2, pageHeader.header, hostToolbarA);
      if (contentBesideHeader !== hostContent2) {
        vars.mateuHostContent = contentBesideHeader;
        // the repaint empties the element holes: mount their web components again
        bridge.mountElementsSoon(bridge.elementAtomsOf(contentBesideHeader));
      }
      // the content margins are RECOMPUTED after an action too (an action
      // can change the page branch/format: e.g. en-casa → check-out) — same
      // logic as onMateuNavigate (without recomputing, the previous state's -40px band
      // overlap was carried over to the next screen)
      assign(bridge.pageLayoutOf({
        host: hostAfter, drawerNav: vars.mateuMenuDrawerMode,
        bleedingHeader: !!(welcome || overviewProjection || wizardProjection || listingSummary || vars.mateuPageHeader),
        band: pageHeader.showBand || pageHeader.showListBand,
      }).vars);
      vars.mateuDirty = false;
      const committed = staged.commit();
      // the oj-tab-bar parses its <ul> on initialization and the for-each's <li>s arrive later: without
      // a refresh it keeps the unstyled list (the navigator's trap); after the commit, which paints them
      for (const barId of committed.has('mateuHostContent') ? bridge.tabBarIdsOf($application.variables.mateuHostContent) : []) {
        try {
          await Actions.callComponentMethod(context, { selector: '#' + barId, method: 'refresh' });
        } catch (ignored) { /* not mounted yet */ }
      }

      // ROW EDITOR (oj-dialog): open while the container has `_show_detail[campo]`
      // and the row's form has arrived at `<campo>-container`. Its lookups are loaded when it
      // opens (and with each new row: "Save and add another" brings another ServerSide) against
      // the ROW's ServerSide, with the row's state.
      reg = $application.variables.mateuRegistry;
      if (listReq) {
        $page.variables.mateuRowDraft = {};
        $page.variables.mateuRowErrors = {};
      }
      let rowEditorNow = bridge.rowEditorOf(reg);
      if (rowEditorNow) {
        const pendingLookups = bridge.pendingLookupsOf(reg.contexts[rowEditorNow.id]);
        if (pendingLookups.length) {
          const editorId = rowEditorNow.id;
          const found = await Promise.all(pendingLookups.map((lookup) => {
            const rq = bridge.lookupRequestOf(reg, editorId, lookup.fieldId);
            return rq
              ? bridge.runMateuAction(base, rq.ctx, route, rq.actionId, rq.componentState,
                { parameters: rq.parameters, appState, idempotent: true }).catch(() => null)
              : null;
          }));
          for (const inc of found) {
            if (inc) { reg = bridge.reduceContexts(reg, inc); bridge.applyDomEffects(reg.effects, reg); }
          }
          $application.variables.mateuRegistry = reg;
          rowEditorNow = bridge.rowEditorOf(reg);
        }
      }
      $page.variables.mateuRowEditor = rowEditorNow
        || { id: '', fieldId: '', title: '', subtitle: '', toolbar: [], buttons: [], fields: [] };
      if (rowEditorNow && !$page.variables.mateuRowEditorOpen) {
        $page.variables.mateuRowEditorOpen = true;
        // focus goes to the first EDITABLE field: oj-dialog leaves it, once it finishes opening
        // (ojOpen), on the first focusable one, and a read-only one («Line», set by
        // the server) kept the focus ring around an empty value
        const dialog = document.getElementById('mateuRowEditor');
        const focusFirstEditable = () => {
          const form = document.getElementById('mateuRowEditorForm');
          const editable = form && Array.from(form.querySelectorAll('[data-field-id]'))
            .find((el) => el.tagName.indexOf('OJ-') === 0 && el.readonly !== true && !el.disabled);
          const target = editable && (editable.querySelector('input, textarea') || editable);
          if (target && typeof target.focus === 'function') target.focus();
        };
        if (dialog) dialog.addEventListener('ojOpen', () => setTimeout(focusFirstEditable, 0), { once: true });
        await Actions.callComponentMethod(context, { selector: '#mateuRowEditor', method: 'open' });
        setTimeout(focusFirstEditable, 600);
      } else if (!rowEditorNow && $page.variables.mateuRowEditorOpen) {
        // the flag drops BEFORE the close: the ojBeforeClose it fires is not a user dismissal
        $page.variables.mateuRowEditorOpen = false;
        await Actions.callComponentMethod(context, { selector: '#mateuRowEditor', method: 'close' });
      }

      // toast with the starter's pattern: variable + open() of the local oj-sp-messages-toast
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
      if (refusedFields) {
        // after the drawer / form has been re-drawn with the answer (VB binds asynchronously)
        await bridge.showFieldErrorsSoon(refusedFields.missing, null,
          { messages: refusedFields.messages, inOverlay: refusedFields.inOverlay });
      }
      if (effects.docTitle) {
        // the host page owns its title when embedded (bridge.setDocTitle → the mateuTitle event)
        bridge.setDocTitle(effects.docTitle);
      }
      // the just-opened selector: the dialog and the first page of its listing (its `search`,
      // against ITS ServerSide — what the listing does on mount in Vaadin)
      // a listing in a drawer: its first page when the drawer opens (only then — a failed search is
      // not asked again and again)
      if (pickerNow && pickerNow.inDrawer) {
        if (!pickerNow.loaded && (!overlayBefore || overlayBefore.id !== pickerNow.id)) {
          $page.variables.mateuDrawerDraft = bridge.pickerSearchStateOf(pickerNow);
          await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: 'search' } });
        }
      } else if (pickerNow && !$page.variables.mateuPickerOpen) {
        $page.variables.mateuPickerOpen = true;
        $page.variables.mateuPickerSelection = { all: false, keys: [], except: [] };
        await Actions.callComponentMethod(context, { selector: '#mateuPicker', method: 'open' });
        $page.variables.mateuDrawerDraft = bridge.pickerSearchStateOf(pickerNow);
        await Actions.callChain(context, { chain: 'runMateuAction', params: { actionId: 'search' } });
      }
      if (effects.navigate && (effects.navigate.route || effects.navigate.url)) {
        if ($page.variables.mateuModalOpen) {
          $page.variables.mateuModalOpen = false;
          await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
        }
        if (effects.navigate.url) {
          // an absolute URL (another console's) opens in its own tab, as in Vaadin
          window.open(effects.navigate.url, '_blank', 'noopener');
        } else if (!bridge.leftMountFor(effects.navigate, $application.variables.mateuRegistry)) { // another @UI's path loads in the browser
          // `force`: the action says go to a route, even the one already shown — «+ 10 reservas
          // demo» goes back to the listing to show the new ones, «Cancel booking» to the booking
          // to show it cancelled. Without forcing, the shell took the route for the echo of its
          // own URL and reloaded nothing.
          await Actions.fireEvent(context, {
            name: 'application:mateuNavigate',
            payload: { route: effects.navigate.route, force: true },
          });
        }
      }
    }
  }

  return runMateuAction;
});
