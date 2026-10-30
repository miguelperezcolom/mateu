/* Navigation (Phases 2–6): a menu GROUP does not touch the server (it paints its submenu landing
 * in the content); a normal route loads into the host (mediator + OnLoad triggers included)
 * and projects title/text/form/listing. The @AppContext travels as appState on every request.
 * force=true (context change) reloads even if the route does not change. */

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

  /**
    * The URL reflects the route — path (/route) when served by the Mateu backend, hash (#/route) in
    * static serving (the mode is set by loadMateuShell at bootstrap). Only pushes if it changes.
   */
  function pushRouteToUrl($application, route) {
    // embedded in a host VB page (<mateu-ui>): the URL is the HOST's — never touched
    if (bridge.isEmbedded()) {
      return;
    }
    if (window.__mateuUrlPathMode) {
      // the home (including the server's _no_home_route sentinel) is '/', not a path
      const home = $application.variables.mateuHomeRoute || '';
      // the route may carry a ?query (a listing's view): the URL keeps it, so that
      // back/forward return with its filters — or with none
      const target = bridge.urlOfRoute((!route || route === home) ? '' : route);
      if (window.location.pathname + (window.location.search || '') !== target) {
        window.history.pushState(null, '', target);
      }
    } else if (window.location.hash !== '#' + route) {
      window.history.pushState(null, '', '#' + route);
    }
  }

  // The navigation in progress: if another starts before this one finishes, it is the last one that
  // switches mateuNavigating off, not the first to finish.
  let navigationSeq = 0;

  class onMateuNavigate extends ActionChain {

    /**
      * Wraps the navigation so that mateuNavigating is always switched off, also when the load
      * fails or is cut short: an old screen hidden forever would be worse than the failure.
     */
    async run(context, params) {
      const { $application } = context;
      const seq = ++navigationSeq;
      try {
        return await this.navigate(context, params || {}, () => {
          $application.variables.mateuNavigating = true;
          bridge.scrollToTopOnNavigate(params || {}); // another screen starts at its top
        });
      } catch (e) {
        // a response that arrived when we had already navigated to another screen: dies silently
        // (the transport discarded it: it is neither painted nor raises an error band)
        if (bridge.isStaleResponse(e)) return undefined;
        throw e;
      } finally {
        if (seq === navigationSeq) {
          $application.variables.mateuNavigating = false;
        }
      }
    }

    /**
     * @param {Object} context
     * @param {Object} params
      * @param {Object} params.event  spSelectionChanged ({currentId}) or mateuNavigate ({route})
      * @param {boolean} params.force reload even if it is the same route (context change)
      * @param {Object} params.liveState live reload (dev mode): the state of the current screen,
      *     which travels with the load and is restored over the response (poc/liveReload.mjs)
      * @param {Function} startsLoading called when another screen is really going to load —
      *     past the writeback echo and the unsaved-changes confirmation
     */
    async navigate(context, { event, force, fromUrl, liveState }, startsLoading) {
      const { $application, $page } = context;

      const detail = (event && (event.detail || event)) || {};
      let route = detail.currentId != null ? detail.currentId
        : detail.selectedValue != null ? detail.selectedValue
        : detail.value != null ? detail.value : detail.route;
      // 'null': the TABS menu (oj-sp-in-app-navigation) reports its selection being CLEARED (the
      // shell binds '' as null — a screen an agent generated is on show) as the string "null"
      if (route == null || route === '' || (detail.currentId === 'null' && route === 'null')) {
        return;
      }
      // A menu leaf that RUNS rules (RuleLink) instead of naming a route: every menu surface
      // (subheader, drawer, topbar, cards) lands here, so this is the one place it is handled.
      if (bridge.isMenuRuleId(route)) {
        await Actions.callChain(context, { chain: 'runMateuMenuRules', params: { ruleId: route } });
        return;
      }
      // Any transport failure during this navigation leaves a retry registered
      // that repeats it whole (the error band offers it).
      const registerRetry = () => bridge.setLastRetry({ kind: 'navigate', route });
      // ?field=value in the route (e.g. /reservas?vista=LLEGADAS_HOY, the home's
      // KPIs): the quick filter travels in the URL — it is consumed here as a
      // PENDING filter (same mechanism as Ask Oracle) and the route is left clean
      // All the parameters, not just the first; and also on a deep link (the URL the console
      // is opened with: the inbox notice leads to /mapping/dictionary?integration=MRU01).
      // The FULL route (with its query) is what identifies the navigation: the menu entry
      // «Llegadas» is /reservas?vista=LLEGADAS_HOY and «Reservas» is /reservas — the same screen
      // with OTHER filters. Comparing only the path, going from one to the other looked like the echo
      // of the selection writeback and did not reload: the previous view's chip stayed on.
      // Is it the screen already there? For the echo of the menu selection writeback we compare
      // against the selected entry; for a REQUESTED navigation (the chat, a link, a widget:
      // detail.route) against what is really loaded — the route and filters there are now, which the
      // user may have changed by removing chips. Otherwise the agent asking again for
      // «/booking/bookings?status=Cancelled» after the chip was removed achieved nothing.
      const requested = detail.currentId == null && detail.selectedValue == null && detail.value == null;
      const current = (requested && window.__mateuLoadedFull != null)
        ? window.__mateuLoadedFull
        : ($application.variables.mateuSelectedNavId || $application.variables.mateuSelectedRoute);
      const target = bridge.navTargetOf(route, current);
      route = target.route;
      // free text (?searchText= or ?q=) goes to the search box as a keyword chip, not as a filter
      const fromQuery = bridge.splitListingQuery(target.filters);
      // …and the page and sort (?page=2&sort=name:descending): back from a record, a reload
      // or a shared link return to THAT page with THAT sort
      const pagingFromQuery = bridge.listingUrlPagingOf(target.full.split('?')[1] || '');
      let pendingSearchText = null;
      if (Object.keys(fromQuery.values).length || fromQuery.searchText) {
        $application.variables.mateuFilterValues = fromQuery.values;
        $application.variables.mateuFiltersPending = true;
        pendingSearchText = fromQuery.searchText;
      }
      // the echo of the selection writeback after each navigation — do not reload. Unless the
      // content shows a screen the AI chat generated (transient): then even the same route
      // loads the real screen again
      if (!force && target.same && !window.__mateuChatPreviewShown) {
        return;
      }
      // unsaved on the page OR an open overlay → ONE confirm (shellFlows.mjs); stay = URL restored —
      // PUSHED after a back/forward, as on the web (replacing it, the next Back would leave the app)
      if (!force && !bridge.confirmNavigationAway($application.variables)) {
        return bridge.restoreUrlAfterStaying($application.variables.mateuSelectedRoute, fromUrl);
      }
      // Another screen: every overlay closes, not left orphaned over the new page (the content page
      // drops its drafts and dialogs on mateuOverlaysClosed; the drawer guard must not hold the close)
      if (bridge.hasOpenOverlays($application.variables.mateuRegistry) || $application.variables.mateuDrawerOpen) {
        bridge.noteDrawerUnsaved(false);
        Object.assign($application.variables, bridge.overlaysClosedVarsOf($application.variables.mateuRegistry));
        await Actions.fireEvent(context, { name: 'application:mateuOverlaysClosed' });
      }

      // The URL changes WHEN the navigation STARTS, not when loading finishes: that is what a
      // browser does with a link. Pushing it at the end, a "back" pressed while the screen
      // was loading did not find the destination's entry and skipped the origin's (from a
      // booking's detail it went back to the home, not to the listing); and while loading, the address
      // was still the previous screen's. The one below, at the end, compares before pushing: no duplicates.
      if (!fromUrl) {
        pushRouteToUrl($application, target.full);
      }
      startsLoading();
      window.__mateuChatPreviewShown = false;
      // Another screen: whatever is still in flight from the previous one (its search, an action, a
      // navigation slower than this one) is no longer painted when it answers (resilience.beginView).
      const view = bridge.beginView();

      const base = bridge.mateuBase($application.constants.mateuBaseUrl);
      const appState = $application.variables.mateuAppState || {};
      // An entry brought from another pod can ONLY be loaded by calling that pod. The bridge
      // recorded where each one goes when expanding the menu; without this lookup the request would go
      // to the shell's base, which does not know that route, and the screen would stay empty.
      const remote = bridge.remoteRouteOf(route);
      const callBase = (remote && remote.baseUrl) ? remote.baseUrl : base;
      // a REQUESTED navigation may carry the fields a menu entry carries (the agent's
      // navigation-requested, a widget's link): consumedRoute/serverSideType/actionId load the route
      // the way a click on that entry would (its baseUrl was registered as a remote route already)
      const asked = bridge.navigationLoadExtraOf(detail.navigation);
      const extra = remote
        ? { appState, consumedRoute: remote.consumedRoute, serverSideType: remote.serverSideType,
          ...(asked.actionId ? { actionId: asked.actionId } : {}) }
        // the state an embedding host seeds its first screen with (<mateu-ui initial-state>): {} otherwise
        : { appState, ...bridge.takeEmbeddedSeed(), ...asked };
      if (liveState) extra.liveState = liveState;
      let reg;
      try {
        // a route of the local MENU belongs to the app declaring it: it loads with its serverSideType (without
        // it the server answers «Not found.»), and a group RouteLink falls through to its terminal route
        reg = remote
          ? await bridge.loadRouteInto(callBase, $application.variables.mateuRegistry, route, '', extra)
          : await bridge.loadMenuRouteInto(callBase, $application.variables.mateuRegistry, route, '', extra);
        // the load reduces inside the transport: here its DOM effects are applied and the
        // client rules' context is set (without this, a freshly opened screen did not have them)
        bridge.applyDomEffects(null, reg);
      } catch (e) {
        // superseded by another navigation while loading: nothing to retry or to paint
        if (bridge.isStaleResponse(e)) return;
        // The transport (onSettle) already raised the error band; here we only leave the
        // manual retry, and stop: without a registry there is nothing to project.
        registerRetry();
        return;
      }

      // new screen: arm its periodic refresh (the OnLoads with a delay) and forget the previous one —
      // BEFORE its immediate OnLoads: otherwise the success of a listing's first 'search' was
      // compared with the PREVIOUS screen and its OnSuccess (the refresh loop) never started
      bridge.startPolling(reg.contexts[bridge.HOST_ID]);

      // host OnLoad triggers (e.g. the listing asks for 'search' on load → the rows arrive)
      const loaded = reg.contexts[bridge.HOST_ID];
      // an Ask Oracle quick view leaves the filter PENDING: the OnLoad search
      // lands already filtered (and the chip appears applied)
      const quickNav = $application.variables.mateuFiltersPending
        ? ($application.variables.mateuFilterValues || {}) : {};
      for (const triggerActionId of bridge.onLoadTriggers(loaded)) {
        const listing = bridge.listingOf(loaded);
        const componentState = Object.assign(
          {}, loaded.state, { page: pagingFromQuery.page, size: (listing && listing.pageSize) || 20 });
        if (pagingFromQuery.sort.length) componentState.sort = pagingFromQuery.sort;
        for (const key of Object.keys(quickNav)) {
          componentState[key] = quickNav[key];
        }
        if (pendingSearchText) componentState.searchText = pendingSearchText;
        const increment = await bridge.runMateuAction(
          callBase, loaded, route, triggerActionId, componentState, { appState });
        reg = bridge.reduceContexts(reg, increment);
        bridge.applyDomEffects(reg.effects, reg);
      }


      // embedded islands: each ServerSide boundary of the host is loaded as its own
      // surface (initiator = the boundary's id → its fragments go to ITS context)
      let hostForIslands = reg.contexts[bridge.HOST_ID];
      const islands = hostForIslands ? bridge.collectIslands(hostForIslands.tree) : [];
      const firstIsland = islands.length ? islands[0] : null;
      if (firstIsland) {
        // NO shortcut: the 2-step dance captures the wrapper's ACTIONS (sse flag)
        reg = await bridge.loadRouteInto(callBase, reg, firstIsland.route, firstIsland.id, {
          appState,
          componentState: firstIsland.initialData || {},
        });
      }
      $application.variables.mateuIslandId = firstIsland ? firstIsland.id : '';
      $application.variables.mateuIslandSeed = firstIsland
        ? JSON.stringify(firstIsland.initialData || {}) : '';

      // the options of remote lookups: the form's (a create form brought them empty,
      // as text) and the listing's @Lookup filters (their editor came out with no options)
      try {
        reg = await bridge.loadLookups(callBase, reg, bridge.HOST_ID, { appState, route });
      } catch (ignored) { /* without options they stay as they were: the field remains editable */ }

      // A newer navigation started while this one was loading: what was loaded here is not painted.
      if (bridge.currentView() !== view) return;

      $application.variables.mateuRegistry = reg;
      // P1: the app levels (the master of a record with tabs that are pages)
      $application.variables.mateuAppLevels = reg.appLevels || [];
      // a master requested bare (/customers/4) opened its default tab: the screen IS that
      // tab (/customers/4/orders) — the URL names it and the rest of the projection uses it
      if (reg.loadedRoute && reg.loadedRoute !== route && reg.loadedRoute.startsWith(route + '/')) {
        // the URL stays the master's (as in Vaadin): rewriting it with replaceState made
        // VB's router re-create the page and the following back/forwards did nothing
        route = reg.loadedRoute;
      }
      $application.variables.mateuSelectedRoute = route;
      // the menu selection carries the FULL route (entries with a ?query are different ones)
      $application.variables.mateuSelectedNavId = target.full;
      // what is loaded NOW (route + filters): the next requested navigation is compared against this,
      // and it is what the URL must say
      window.__mateuLoadedFull = target.full;
      // a deep link with filters (/booking/bookings?status=Cancelled): VB's router strips the
      // query from the URL on startup; it is put back, so the address says what is shown (and a
      // reload or a copied link keep it). Only the query: the path is the same.
      if (fromUrl && window.__mateuUrlPathMode && target.full.indexOf('?') >= 0
          && bridge.currentRoutePathOf(window.location) === target.route
          && bridge.currentRouteOf(window.location) !== target.full) {
        window.history.replaceState(window.history.state, '', bridge.urlOfRoute(target.full));
      }

      const host = reg.contexts[bridge.HOST_ID];
      const listingSummary = bridge.listingOf(host);
      $application.variables.mateuListing = listingSummary;
      $application.variables.mateuListingRows = listingSummary ? listingSummary.rows : [];
      // DEFAULT VIEW (★ in the views menu): a listing opened with no filters in the URL
      // opens with it — via the same route with its query, the URL-filters path
      if (listingSummary && String(route).indexOf('?') < 0) {
        const preferred = bridge.defaultView(bridge.listingScope());
        if (preferred) {
          await Actions.fireEvent(context, {
            name: 'application:mateuNavigate',
            payload: { route: bridge.viewRouteOf(bridge.listingScope(), preferred.values), force: true },
          });
          return;
        }
      }
      // another screen, another table: the previous one's selection is not inherited
      $application.variables.mateuListingSelection = { all: false, keys: [], except: [] };
      // nor the sort requested in its header — except the one the URL carries (the load already came with it)
      $application.variables.mateuListingSort = pagingFromQuery.sort;

      // same remount as in runMateuAction: if we come from ANOTHER foldout, re-create the
      // subtree so the inner bindings do not keep the old blocks
      const foldoutProjection = bridge.foldoutOf(host);
      if ($application.variables.mateuFoldout && foldoutProjection) {
        $application.variables.mateuFoldout = null;
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      // the CONTENT is seeded BEFORE stamping the structure: the panels read
      // mateuFoldoutContent.panels[i] when they mount
      $application.variables.mateuFoldoutContent = foldoutProjection
        ? { overview: foldoutProjection.overview, panels: foldoutProjection.panels, header: foldoutProjection.header }
        : { overview: { blocks: [] }, panels: [], header: {} };
      $application.variables.mateuFoldout = foldoutProjection;
      // What THIS chain has just assigned is read from the constants, not back from the variable:
      // a VB `any` variable that held an object and is set to null (or any falsy) reads
      // WITHIN the same chain as a truthy proxy over the primitive value (the bindings do see
      // the null). From a booking's detail (foldout) to the tour, `!mateuFoldout` stayed false
      // and the host content was not projected: the screen was left with its header and blank.
      const foldoutNow = foldoutProjection;
      // its panels' Elements are mounted by hand (VB cannot paint an arbitrary tag, as for the host's)
      bridge.mountElementsSoon(bridge.foldoutElementAtomsOf($application.variables.mateuFoldoutContent), 60);
      bridge.applyFoldoutFoldsSoon(foldoutProjection, { fresh: true }); // open=false panels start folded
      $application.variables.mateuSelectPlaceholder = bridge.selectPlaceholder(
        document.documentElement.lang || navigator.language);
      const wizardProjection = bridge.wizardOf(host);
      $application.variables.mateuWizard = wizardProjection;
      // the guided process does not advance on its own: Mateu decides the step (see the bridge)
      if (wizardProjection) bridge.guardGuidedProcess();
      // the page projection (poc/pageProjection.mjs, tested): what to assign from the registry
      const vars = $application.variables;
      const assign = (values) => { for (const key of Object.keys(values)) vars[key] = values[key]; };
      const islandContext = firstIsland ? reg.contexts[firstIsland.id] : null;
      // NESTED island inside the island (App with seeded initialData, e.g. the document):
      // load with the initialData as componentState; RELOAD if the seed changed (selectPax)
      const nestedList = islandContext ? bridge.collectIslands(islandContext.tree) : [];
      const nestedInfo = nestedList.length ? nestedList[0] : null;
      const nestedSeed = nestedInfo ? JSON.stringify(nestedInfo.initialData || {}) : '';
      if (nestedInfo && (!reg.contexts[nestedInfo.id]
          || $application.variables.mateuNestedSeed !== nestedSeed)) {
        // NO consumedRoute/serverSideType shortcut: the mediator's 2-step dance
        // captures the wrapper's ACTIONS (the sse flag only travels there → sseActionIds)
        reg = await bridge.loadRouteInto(callBase, reg, nestedInfo.route, nestedInfo.id, {
          appState,
          componentState: nestedInfo.initialData || {},
        });
        $application.variables.mateuRegistry = reg;
      }
      $application.variables.mateuNestedId = nestedInfo ? nestedInfo.id : '';
      $application.variables.mateuNestedSeed = nestedSeed;
      const nestedCtx = nestedInfo ? reg.contexts[nestedInfo.id] : null;
      const nestedBlocks = nestedCtx ? bridge.islandContentOf(nestedCtx) : null;
      vars.mateuNested = bridge.nestedVarOf(nestedBlocks);
      // the nested island's atoms are MERGED into the island's content (they flow through
      // $current — reading $application.variables in deep templates does not rebind)
      vars.mateuIsland = bridge.islandVarsOf(islandContext, nestedBlocks);

      // collection header: the crud toolbar → primaryAction/secondaryActions
      assign(bridge.listHeaderVarsOf(listingSummary));
      // the floating action buttons (@Fab) of the page and of the app
      vars.mateuFabs = bridge.fabsOf(reg.shell, host); vars.mateuToc = bridge.tocOf(host); bridge.resetToc(); // + the @Toc index, unlocked
      // If the load failed, the retry re-enters THIS chain with the same route.
      bridge.setLastRetry(null);
      // inside a master (P1) the header carries the MASTER's title (the record) and the
      // tab's own label moves to the subtitle; the tab bar goes above
      const summary = bridge.withinAppLevels(bridge.summarizeHost(reg, route), reg.appLevels);
      $application.variables.mateuHostTitle = summary.title;
      // Navigating in a SPA does not change the page, so there is nothing a screen reader
      // announces by itself, and focus stays on the menu link just pressed. Only here, on
      // a REAL navigation: on a re-render it would steal focus from the field being edited.
      const notFoundTitle = (bridge.notFoundOf(host.tree) || {}).title;
      bridge.announceNavigation(notFoundTitle || summary.title || route);
      $application.variables.mateuOverviewTranslations = { goToParent: summary.title };
      $application.variables.mateuHostText = summary.text;
      $application.variables.mateuFormMetadata = summary.formMetadata;
      $application.variables.mateuFormFieldsList = summary.fields;
      $application.variables.mateuFormSections = summary.sections;
      $application.variables.mateuFormValue = summary.formValue;
      $application.variables.mateuFormActions = summary.actions;
      // the wizard: forward button and its label; fresh entry → starts at the guided process's
      // OVERVIEW (the component's Start moves to step 1 via internal writeback)
      assign(bridge.wizardVarsOf(host, wizardProjection, summary.actions, { keepStep: false }));


      // front-office work queue (TaskQueue) + the detail placeholder
      const queueNow = bridge.taskQueueOf(host.tree);
      $application.variables.mateuQueue = queueNow;
      $application.variables.mateuHostEmpty = bridge.emptyStateOf(host.tree);
      // the route names something that does not exist (a deleted record, a badly copied link): the server
      // answers the NOT FOUND page instead of the content, and IT is painted alone, with no header
      const notFoundNow = bridge.notFoundOf(host.tree, document.documentElement.lang || navigator.language);
      $application.variables.mateuNotFound = notFoundNow;
      // composed archetypes (welcome / general overview / item overview)
      // the hero's look is the page's own: its declared tone, else a stable hash of its
      // identity — the same on every visit (welcomeLookOf)
      const archetypes = bridge.archetypeVarsOf(host);
      assign(archetypes.vars);
      const welcome = archetypes.welcome;
      const overviewProjection = archetypes.overview;
      const itemProjection = archetypes.item;
      if (itemProjection) {
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuItemTabs', method: 'refresh' });
        } catch (ignored) { /* not mounted yet */ }
      }
      if (welcome || overviewProjection || itemProjection || archetypes.dashboard || archetypes.todo || archetypes.spPage || foldoutNow) {
        // their fields/buttons are painted by the archetype's branches (or by the foldout's panels:
        // a crud's @FoldoutDetail view), not by the generic form
        assign(bridge.noGenericFormVars());
      }
      // display content of the HOST (standalone detail) / of the wizard steps:
      // the islandContentOf blocks with the host's island (document) merged
      const islandRawBlocks = islandContext ? bridge.islandContentOf(islandContext) : null;
      const esWizard = !!wizardProjection;
      // a foldout with an EntityHeader (e.g. the Reserva 360) KEEPS the screen header:
      // the guest + the CTA go in the band, the foldout is only the body
      const contentPlan = bridge.hostContentPlanOf(host, {
        islandRawBlocks, title: summary.title, wizard: esWizard, listing: listingSummary,
        welcome, overview: overviewProjection, item: itemProjection, queue: queueNow, foldout: foldoutNow,
      });
      const hostEntity = contentPlan.hostEntity;
      // new screen, new tab: the active one is CLIENT state and does not survive a
      // navigation (tab 3 of the previous screen means nothing on this one)
      vars.mateuActiveTabs = {};
      let hostBlocks = contentPlan.hostBlocks;
      // the @Subresources in view (those of the active tab) are loaded and become its table
      if (hostBlocks) {
        reg = await bridge.loadSubresources(callBase, reg, hostBlocks, { appState });
        $application.variables.mateuRegistry = reg;
        hostBlocks = bridge.withSubresources(hostBlocks, reg.contexts);
      }
      // the blocks RULE when they are rich (EntityHeader/Meter/Ledger, tabs, tables…): the
      // generic form and the plain text are suppressed — same rule as the archetypes. Also
      // when the form has nothing to paint (a read-only page is texts)
      const hostBlocksRicos = bridge.hostContentShown(hostBlocks, summary);
      // the Page's toolbar actions (computed here because the entity-page templates
      // relocate them: iop → goToParent/secondaryActions of the panel)
      const hostToolbar = bridge.pageToolbarOf(host);
      // the legacy mateuIop projection stays off (its template was reverted, DESIGN-NOTES 2026-07-27);
      // the ITEM OVERVIEW page is oj-sp-item-overview-page fed by mateuItemOv (archetypeVarsOf).
      // iopOn says the template OWNS the page: edge to edge (its header band and zones sit on the
      // page itself, as in Redwood's examples), no VB header, no general overview, no generic form
      const iop = null;
      const iopOn = !!itemProjection;
      $application.variables.mateuIop = iop || {
        on: false,
        overview: { title: '', subtitle: '', badge: null, facts: [], blocks: [] },
        main: { blocks: [] },
        back: { show: false, actionId: '' },
        secondary: [],
      };
      // native GENERAL OVERVIEW: entity page with TWO column blocks (the wide one
      // first) → the oj-sp-general-overview-page template (main/info slots, integrated header)
      const gop = bridge.generalOverviewPageOf(hostEntity, hostBlocks, { itemOverviewOn: iopOn });
      vars.mateuGop = gop;
      const gopOn = gop.on;
      // the generic form is suppressed: its buttons (the form's @Button) go with the blocks
      let hostContent = $application.variables.mateuHostContent = (!gopOn && !iopOn && hostBlocksRicos ? bridge.withFormActions(hostBlocks, summary.actions, { tree: host.tree }) : null) || [];
      // the content's web components (a process graph) are created by the bridge in their
      // hole: VB cannot write a tag whose name arrives in the data
      bridge.mountElementsSoon(bridge.elementAtomsOf($application.variables.mateuHostContent));
      // the oj-tab-bar parses its <ul> when it initializes and the for-each's <li> arrive
      // later: without a refresh it is left with the unstyled list (same trap as the
      // navigator's oj-navigation-list)
      for (const barId of bridge.tabBarIdsOf($application.variables.mateuHostContent)) {
        try {
          await Actions.callComponentMethod(context, { selector: '#' + barId, method: 'refresh' });
        } catch (ignored) { /* not mounted yet */ }
      }
      if (notFoundNow) {
        // the not-found page is ALL the content: neither loose text nor host blocks
        $application.variables.mateuHostContent = hostContent = [];
        $application.variables.mateuHostText = '';
      }
      if (hostBlocksRicos || notFoundNow) {
        assign(bridge.noGenericFormVars());
        vars.mateuHostText = '';
      }
      // the wizard STEP: display content + fields (each ONCE: those the form paints
      // are taken out of the content) + the Back/Next footer. With the rail (@WizardProgress RAIL) it goes to the
      // guided process; with the train on top (STEPS) to the host content branch + the footer
      // bar. RICH content → no generic form (same rule as in the host)
      const wizardStep = esWizard ? bridge.wizardStepViewOf(host, islandRawBlocks,
        { title: summary.title, sections: $application.variables.mateuFormSections }) : null;
      const wizardH = !!(wizardStep && wizardStep.wizard.horizontal);
      $application.variables.mateuWizardContent = (wizardStep && !wizardH ? wizardStep.content : null) || [];
      $application.variables.mateuWizardStep = wizardH
        ? { on: true, title: wizardStep.title, stepLabel: wizardStep.wizard.currentLabel, nav: wizardStep.nav }
        : { on: false, title: '', stepLabel: '', nav: [] };
      if (wizardStep) {
        $application.variables.mateuFormSections = wizardStep.sections;
        if (!wizardStep.sections.length) $application.variables.mateuFormFieldsList = [];
      }
      if (wizardH) {
        $application.variables.mateuHostContent = hostContent = wizardStep.content;
        bridge.mountElementsSoon(bridge.elementAtomsOf(wizardStep.content));
      }

      // general rule: the page header is ALWAYS painted by a vb header; only the
      // templates that already integrate their own (guided process / general overview / welcome /
      // the listing's smart-filter-search) suppress it
      // a foldout with page actions (a crud's @FoldoutDetail view: Edit, Cancel…)
      // keeps the vb header, which is where those actions go
      const integratedHeader = !!(wizardProjection || welcome || archetypes.dashboard || archetypes.todo || archetypes.spPage
        || overviewProjection || listingSummary
        || (foldoutNow && !hostEntity && !hostToolbar.length));
      // the not-found page brings its own heading (the oj-sp-empty-state): no vb header
      const showHeader = !integratedHeader && !notFoundNow;
      // 1.3: page banners → the starter's oj-sp-messages-banner (shell).
      // The ADP is mutated with fireDataProviderEvent (assigning .data does not refresh)
      // the listing's quick selector does not survive navigation — unless
      // Ask Oracle left it pending for THIS load
      if ($application.variables.mateuFiltersPending) {
        $application.variables.mateuFiltersPending = false;
        if (pendingSearchText != null) $application.variables.mateuLastSearchText = pendingSearchText;
      } else {
        $application.variables.mateuFilterValues = {};
        $application.variables.mateuLastSearchText = '';
      }
      // the filters go INSIDE the search box header (smart-filters): the config is a
      // projection of (declared filters × applied values × text), and a navigation
      // changes all three. Only here: the searches launched by the component itself do not
      // reassign it, which would close the popup of the filter being edited
      $application.variables.mateuSmartFilters = await bridge.smartFiltersOf(
        (($application.variables.mateuListing || {}).filters) || [],
        $application.variables.mateuFilterValues || {},
        $application.variables.mateuLastSearchText || '');
      const banners = bridge.bannersOf(host);
      const staleKeys = $application.variables.mateuBannerKeys || [];
      if (staleKeys.length) {
        await Actions.fireDataProviderEvent(context, {
          target: $page.variables.messagesBannerADP,
          remove: { keys: staleKeys },
        });
      }
      for (const banner of banners) {
        await Actions.fireDataProviderEvent(context, {
          target: $page.variables.messagesBannerADP,
          add: { data: banner },
        });
      }
      $application.variables.mateuBannerKeys = banners.map((banner) => banner.id);
      // 1.6: pageWidth anatomy of the host context
      // with a persistent navigator on the left, the format becomes edge-to-edge
      // automatically: centering a fixed one in the remaining area looks odd (the drawer already
      // takes the side); the content gutter is set by the branches (12x/6x)
      const drawerNav = vars.mateuMenuDrawerMode;
      // with the iop template active the FORMAT is set by the template (neither fixed nor fullWidth:
      // its zones sit directly on the page background) → full-bleed wrapper; the shell adapts
      // its chrome (e.g. the chat FAB) to the page format
      const pw = bridge.pageWidthOf({ host, drawerNav, iopOn });
      // full-bleed Redwood header: each content branch recovers the gutter
      const bleedingHeader = !!(welcome || overviewProjection || wizardProjection || listingSummary
        || vars.mateuPageHeader);
      // RDS header anatomy (feedback 2026-07-26): in fixed/fullWidth the header sits
      // on a full-bleed BAND (white background from viewport edge to edge) with its content
      // capped to the box; the content card OVERLAPS the band (-40px margin) so that
      // the band peeks out behind its start — like the canvas's general background
      // the Page's toolbar actions go to the HEADER (primary/secondary of the band); going back
      // is NOT just another action: it is the RDS header's goToParent affordance (Redwood has no
      // breadcrumbs: without a back button, the parent of the automatic trail)
      const pageHeader = bridge.pageHeaderOf({
        host, hostEntity, summary, hostToolbar, showHeader, pageWidth: pw, gopOn, iopOn, listing: listingSummary,
      });
      vars.mateuPageHeader = pageHeader.header;
      vars.mateuPageHeaderTranslations = pageHeader.translations;
      // The Page's toolbar is painted ONLY ONCE: the header rules when it is painted
      vars.mateuFormActions = bridge.formActionsBesideHeader(vars.mateuFormActions, pageHeader.header, hostToolbar);
      // …nor in the form's action row (withFormActions): on the projection, not the variable's proxies
      const contentBesideHeader = bridge.hostContentBesideHeader(hostContent, pageHeader.header, hostToolbar);
      if (contentBesideHeader !== hostContent) {
        vars.mateuHostContent = contentBesideHeader;
        bridge.mountElementsSoon(bridge.elementAtomsOf(contentBesideHeader)); // the repaint empties their holes
      }
      // RDS anatomy (feedback 2026-07-26): in fixed/fullWidth the header sits on a full-bleed
      // BAND and the content card OVERLAPS it (-40px); the overlap does not apply with the iop
      // template (its inner stickies compute against the flow)
      assign(bridge.pageLayoutOf({
        host, drawerNav, iopOn, bleedingHeader,
        band: (pageHeader.showBand && !iopOn) || pageHeader.showListBand,
      }).vars);
      // 1.5: the URL reflects the route — path (/route) when served by the Mateu backend, hash
      // (#/route) in static serving (the mode is set by loadMateuShell at bootstrap)
      if (!fromUrl) {
        pushRouteToUrl($application, target.full);
      }
      $application.variables.mateuDirty = false;

      if (reg.effects && reg.effects.docTitle) {
        bridge.setDocTitle(reg.effects.docTitle);
      }
    }
  }

  return onMateuNavigate;
});
