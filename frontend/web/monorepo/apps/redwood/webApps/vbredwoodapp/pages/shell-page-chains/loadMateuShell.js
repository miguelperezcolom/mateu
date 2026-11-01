/* Shell bootstrap (Phases 2/6): the Mateu App configures the menu (with groups),
 * @AppContext selectors and header actions; it navigates to the first non-group option. */

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
    * Names the expand/collapse icons of the menu groups.
    *
    * oj-navigation-list generates them internally as EMPTY `<a role="button">`: a screen
    * reader announces them as "button", without saying of what. It is not our markup and we cannot
    * change how JET emits them, but we can name them afterwards, taking the text of the group they
    * belong to — which is what the user needs to hear.
   */
  const nameCollapseIcons = () => {
    const list = document.querySelector('#mateuNavList');
    if (!list) return;
    list.querySelectorAll('.oj-navigationlist-collapse-icon').forEach((icon) => {
      const item = icon.closest('li');
      const label = item ? (item.textContent || '').trim().split('\n')[0].trim() : '';
      icon.setAttribute('aria-label', label ? `Desplegar ${label}` : 'Desplegar grupo');
    });
  };

  /**
    * Brand and name of the shell's "ask" FAB (Ask Oracle, or the @App's brand).
    *
    * oj-sp-simple-ui-shell stamps it with its digital assistant's speech bubble
    * (oj-ux-ico-oracle-chat), with no href or role: it cannot be reached with Tab and only says "Ask".
    * Here it opens the Ask Oracle search, and the agent's chat has its own FAB with another
    * bubble, so each one has to say which it is. It is not our markup: it is branded afterwards,
    * once the shell has painted it (bridge.brandAskFab).
   */
  const brandAskFabSoon = (spec, attempt = 0) => {
    const fab = document.querySelector('oj-sp-simple-ui-shell .oj-sp-rw-chat-icon-cont');
    if (bridge.brandAskFab(fab, spec)) return;
    if (attempt < 20) setTimeout(() => brandAskFabSoon(spec, attempt + 1), 500);
  };

  class loadMateuShell extends ActionChain {

    async run(context) {
      const { $application } = context;

      // the @UI's mount (<mateu-ui baseUrl>) before anything else: the API hangs off it
      bridge.initMount(document);
      const base = bridge.mateuBase($application.constants.mateuBaseUrl);
      // Element (web components): its relative `import` module is served by the BACKEND (another origin in
      // vb-serve / hosted VB), and its events (Element.on) run actions of the content
      // page, so they travel as an application event (the Retry path). Before
      // the first navigation: the initial content may already carry Elements.
      // images, logo, web-component modules and the sseUrl: from the backend's ROOT (not from the
      // @UI's mount), as in the Vaadin renderer
      const assetBase = bridge.mateuAssetBase($application.constants.mateuBaseUrl);
      bridge.setElementModuleBase(assetBase);
      const runPageAction = (actionId, parameters, atom) => {
        Actions.fireEvent(window.__mateuShellContext || context, {
          name: 'application:mateuElementEvent',
          // surfaceId: the atom belongs to a surface of its own (an inline island, a MicroFrontend)
          payload: { actionId, parameters, fromNested: !!(atom && atom.fromNested), surfaceId: (atom && atom.surfaceId) || '' },
        });
      };
      bridge.setElementEventSink(runPageAction);
      // client rules (@Hidden/@Disabled with an expression, RuleSupplier): they listen to field changes
      // across the whole document; a rule's RunAction goes out the same way
      bridge.installRules();
      bridge.setRuleActionSink(runPageAction);
      // tape chart: dragging across empty cells → rangeSelectActionId (oj-gantt does not provide it)
      bridge.installPlanningRange();
      // «I want to…» (ActionPanel): open with its shortcut, show more, hide empty ones, close on pick
      bridge.installActionPanels();
      // dashboard with reorderable tiles (ResponsiveGrid.reorderable): drag or Alt+←/→; the
      // order is saved and the content page re-projects the host
      bridge.setTileReorderSink((scope) => Actions.fireEvent(window.__mateuShellContext || context, {
        name: 'application:mateuTilesReordered', payload: { scope: scope || '' },
      }));
      bridge.installTileReorder();
      // rich text (Markdown, read-only richText/html/markdown fields): the already
      // sanitized HTML of each [data-mateu-html] is poured into its container
      bridge.installRichText();
      // MatrixGrid (oj-data-grid): fold sections, edit editable rows, cells that link
      bridge.installMatrixGrids();
      // Calendar: switch views in the DOM, events and dates that launch their action
      bridge.installCalendars();
      bridge.setCalendarActionSink(runPageAction);
      // @Toc: the sticky sections index — click / Ctrl+Alt+N jump, the section in view highlighted
      bridge.installToc();
      bridge.setMatrixActionSink(runPageAction);
      // Map: JET has no street map → Leaflet (cdnjs) + OSM tiles; a marker launches its action
      bridge.installMaps();
      bridge.setMapActionSink(runPageAction);
      // row tones (@RowStatus) and group rows (@GroupBy) of the listing's oj-table
      bridge.installRowTones();
      // a record's page: its header stays pinned and compacts on scroll
      bridge.installStickyHeader();
      bridge.setPlanningRangeSink(runPageAction);
      // toasts with «Undo» (Message.undoable): the action goes back to the content page
      bridge.setUndoSink(runPageAction);
      // periodic refresh (OnLoad with a delay + OnSuccess): the rounds go out the same way
      bridge.setPollingRunner(runPageAction);
      // keyboard shortcuts (@Action/@Tab shortcut) and access keys (@App(accessKeys))
      bridge.installKeys();
      // floating windows on hover (cells with @Tooltip, Popover)
      bridge.installHover();
      // display components whose view needs the DOM: the BPMN diagram (SVG from its BPMN-DI), the
      // cookie consent band, a ContextMenu's right click, and the Chat component's conversation
      bridge.installBpmn();
      bridge.installCookieConsent();
      bridge.installContextMenus();
      bridge.installChatComponents();
      bridge.installCustomComponents();
      // the action of an EntityHeader fact hoisted into the page header (oj-sp's contextualInfo has
      // no room for it): its icon button after the value, run like a Button's
      bridge.installFactActions();
      bridge.setFactActionSink(runPageAction);
      // the KPI band is oj-sp-scoreboard: each card's icon, and its drill-in (MetricCard.actionId)
      bridge.installScoreboards();
      bridge.setScoreboardActionSink(runPageAction);
      // a FileList's oj-sp-attachment-chip downloads its file's URL (local data, no Oracle REST)
      bridge.installAttachmentChips();
      // dragging rows (@DragRows) onto a DropZone: its action with origin and destination
      bridge.installDragAndDrop();
      bridge.setDropSink(runPageAction);
      // kanban cards: drag between/within columns or the ⋯ select → the content page's kanbanCardMoved
      bridge.setKanbanMoveSink(({ key, move }) => Actions.fireEvent(window.__mateuShellContext || context, {
        name: 'application:mateuKanbanMove', payload: { key, move },
      }));
      bridge.installKanbans();
      bridge.setKeysActionSink(runPageAction);
      // compare & merge (RecordMerge): picks are DOM state; the merge goes out as a page action
      bridge.installRecordMerges();
      bridge.setRecordMergeSink(runPageAction);
      // app shortcuts + «?» + quick launch, live header values, the idle warning (appExtras.mjs)
      bridge.installAppExtras();

      // The IDE's visual editor paints with this app (its preview page sets the flag): the
      // increment comes from the editor through postMessage, the app answers its own /mateu calls
      // with it, and the painted atoms carry the definition's node ids (bridge editorPreview.mjs).
      // Before the bootstrap: it must already be answered locally.
      let editorPreview = null;
      if (bridge.isEditorPreview(window)) {
        bridge.setEditorNodeIds(true);
        editorPreview = bridge.installEditorPreview(window, {
          rerender: () => Actions.callChain(window.__mateuShellContext || context, {
            chain: 'onMateuNavigate',
            params: { event: { detail: { route: bridge.PREVIEW_ROUTE } }, force: true },
          }),
          dataOf: await bridge.editorDataResolver(),
        });
      }

      // Static bundle (no-backend mode): if a mateuBundleUrl is configured, loading the manifest
      // starts HERE, before the bootstrap. bootstrapShell/loadRoute wait for the in-flight fetch
      // (awaitBundle) and answer from the bundle when the route is there — so loads go without
      // a backend and, if the backend is not there, even the shell falls back to the bundled root route.
      // the bundle's index.html names it on <mateu-ui bundleUrl> (a static Redwood bundle); the
      // app constant stays for a hand-configured VB deployment
      const bundleUrl = bridge.bundleUrlOf(document) || $application.constants.mateuBundleUrl;
      if (bundleUrl) bridge.loadBundleManifest(bundleUrl);

      // Transport resilience (same contract as the web renderers, see poc/resilience.mjs).
      // It is wired BEFORE the first bootstrapShell so that even the initial load counts: if the
      // backend is down at startup, the user sees a message instead of a dead screen.
      bridge.connectivity.start();
      // The errors the user sees (and uncaught JS ones) end up in the server log:
      // POST <base>/mateu/v3/client-log with the same token as the rest (see poc/clientLog.mjs).
      bridge.installClientErrorReporting(base, { headers: bridge.authHeadersOf });
      // The live regions have to EXIST before anything writes to them: one created
      // and filled in the same tick is often not announced.
      bridge.installAnnouncer();
      // Esc / a click outside a create/edit drawer with unsaved edits asks first (drawers.mjs)
      bridge.installDrawerGuard();
      bridge.mountSkipLink();
      // Ctrl+P leaves the chrome out, like UICommand.print
      bridge.installPrintSupport();
      // Reloading or closing the tab with unsaved changes: the browser's own prompt (a navigation
      // inside the app asks in onMateuNavigate). Reads the LIVE context, as the popstate listener.
      bridge.installUnsavedChangesGuard(window,
        () => bridge.hasUnsavedChanges((window.__mateuShellContext || context).$application.variables));
      // The pressed control is tracked at document level: the app's buttons go through
      // different chains and threading the event through all of them would be forgotten in the next one.
      bridge.trackPressedControls();
      bridge.setTransportHooks({
        onStart: () => { $application.variables.mateuBusy = true; bridge.markPressedControlBusy(); },
        onSettle: ({ failure }) => {
          $application.variables.mateuBusy = false;
          bridge.clearPressedControlBusy();
          // 'cancelled' is our own decision (navigation, abort): it is never news.
          if (failure && failure.kind !== 'cancelled') {
            $application.variables.mateuLastError = failure.message;
            // a Mateu refusal from another build: the screen is stale, the band offers Reload
            $application.variables.mateuReloadOffered = !!failure.reload;
            // The band is a visual signal; a screen-reader user would not notice it.
            bridge.announce(failure.message, { politeness: 'assertive' });
          }
        },
      });
      // Losing the connection is a STATE, not an event: while it lasts a band is held,
      // instead of a per-click notice the user sees go by for five seconds each time.
      // Another wire MAJOR: a clear notice (once) in the error band, not a broken screen.
      bridge.setWireMismatchListener((message) => {
        $application.variables.mateuLastError = message;
        $application.variables.mateuReloadOffered = false;
        bridge.announce(message, { politeness: 'assertive' });
      });
      // The backend was redeployed since this page loaded (X-Mateu-Build changed): a sticky notice,
      // once per backend, whose button reloads the page (versionSkew.mjs).
      // A mirror of Oracle's CDN (oracleCdn.mjs, mateu.oracle-cdn.url): the welcome banner's default
      // illustrations come from it too (unchanged without one).
      $application.variables.mateuWelcomeIllu = bridge.oracleCdnUrl($application.variables.mateuWelcomeIllu);
      $application.variables.mateuWelcomeIlluBg = bridge.oracleCdnUrl($application.variables.mateuWelcomeIlluBg);
      bridge.setAppUpdatedListener((message) => {
        $application.variables.mateuLastError = message;
        $application.variables.mateuReloadOffered = true;
        bridge.announce(message, { politeness: 'polite' });
      });
      bridge.connectivity.subscribe((online) => {
        $application.variables.mateuOffline = !online;
      });
      const boot = await bridge.bootstrapShell(base);
      // a @UI that is NOT an App (a page, a crud): no menu or route of its own — its home is the
      // mount's «fresh» load (bridge.bootstrapHasApp / setMountWithoutApp)
      const withoutApp = !bridge.bootstrapHasApp(boot);
      bridge.setMountWithoutApp(withoutApp);
      const reg = bridge.reduceContexts({ contexts: {}, stack: [], shell: null }, boot);
      $application.variables.mateuRegistry = reg;

      // The sections served by another pod arrive marked and without children: they have to be
      // fetched before building the nav, or the bar comes out with labels and nothing below.
      // A pod that does not answer leaves its label and does not prevent startup.
      if (reg.shell && reg.shell.menu) {
        // HAMBURGER_SECTIONS: each pod mounted at the first level is a section (asSection)
        reg.shell.menu = await bridge.expandRemoteMenus(reg.shell.menu, { sections: reg.shell.variant === 'HAMBURGER_SECTIONS' });
        // The chat needs the menu ALREADY expanded (each pod's screens, with their listing
        // descriptor) for the agent's menuContext. mateuRegistry was assigned before expanding and VB
        // keeps a copy, so the expanded menu does not reach the variable: it is left here.
        window.__mateuShellMenu = reg.shell.menu;
      }

      // App-context selectors backed by a REST source (YAML contextSelectors[].optionsSource): their
      // options are fetched BEFORE the nav is built — a direct source in the browser, a proxied one
      // through the app-level `_appsource` action. A source that fails leaves the picker empty.
      if (reg.shell && Array.isArray(reg.shell.appContext) && reg.shell.appContext.some((s) => s && s.optionsSource)) {
        const ctxAppState = $application.variables.mateuAppState || {};
        reg.shell.appContext = await bridge.loadContextSelectorOptions(reg.shell.appContext, {
          appState: ctxAppState,
          server: (parameters) => bridge.runAppLevelAction(base, reg.shell.serverSideType, ctxAppState, '_appsource', parameters),
        });
      }

      const nav = bridge.shellNavOf(reg);
      const appState = $application.variables.mateuAppState || {};
      $application.variables.mateuNavItems = nav.items;
      $application.variables.mateuMenuTabs = nav.mode === 'tabs';
      $application.variables.mateuMenuTopbar = nav.mode === 'topbar';
      // MENU_ON_TOP: band 2 under the header — the console's title and its menu
      // HAMBURGER_SECTIONS: the same band, with the second level of the section on screen
      $application.variables.mateuMenuSubheader = nav.mode === 'subheader' || nav.mode === 'sections';
      $application.variables.mateuMenuSections = nav.mode === 'sections';
      $application.variables.mateuSectionList = nav.sections;
      $application.variables.mateuShellTitle = nav.title;
      $application.variables.mateuMenuDrawerMode = nav.mode === 'drawer';
      $application.variables.mateuNavDrawerOpen = nav.mode === 'drawer'; // open from the start
      $application.variables.mateuMenuTree = nav.menuTree;
      $application.variables.mateuContextSelectors = nav.selectors.map((selector) => Object.assign({}, selector, {
        value: appState[selector.fieldName] != null ? appState[selector.fieldName] : null,
      }));
      $application.variables.mateuHeaderActions = nav.headerActions;

      // The App's header widgets (WidgetSupplier): the user one to the profile area, the rest to
      // the actions zone. The bridge puts the HTML into the hole the template stamps; a
      // MicroFrontend loads from ITS pod and stays alive with its triggers (the badge: every 10 s).
      const widgets = bridge.headerWidgetsOf(reg);
      $application.variables.mateuUserWidget = widgets.user;
      $application.variables.mateuHeaderWidgets = widgets.items;
      bridge.stopRemoteWidgets();
      for (const item of widgets.items) {
        if (item.isHtml) {
          bridge.mountHeaderHtmlSoon(item.id, item.html);
        } else if (item.isRemote) {
          bridge.startRemoteWidget(item, (html) => bridge.mountHeaderHtmlSoon(item.id, html), {
            appState: () => $application.variables.mateuAppState || {},
          });
        }
      }
      $application.variables.mateuShellSST = nav.serverSideType || '';
      bridge.setAccessKeysEnabled(!!(reg.shell && reg.shell.accessKeys));
      // E2: the shell's app shortcuts, live header values (and their stream) and idle warning; the
      // context of the chain goes stale, so navigation and app actions always use the latest one
      bridge.syncAppExtras(reg.shell, {
        base,
        navigate: (route) => Actions.callChain(window.__mateuShellContext || context, {
          chain: 'onMateuNavigate', params: { event: { detail: { route: bridge.routeUnderMount(route) || route } } },
        }),
        runAppAction: (actionId) => Actions.callChain(window.__mateuShellContext || context, {
          chain: 'runMateuHeaderAction', params: { actionId },
        }),
        keepAlive: (actionId) => bridge.runAppLevelAction(base, $application.variables.mateuShellSST,
          $application.variables.mateuAppState || {}, actionId).catch(() => undefined),
      });
      // the bell (the App's NotificationsSupplier): the list is requested at startup and when opening it
      // GlobalSearchSupplier: the Ask palette also searches the app's entities (askOracleTyped)
      $application.variables.mateuGlobalSearch = !!(reg.shell && (reg.shell.globalSearchEnabled || reg.shell.globalSearchSource));
      // a data-authored shell (type: AppShell) feeds the bell and the palette from REST sources:
      // direct ones fetched here, proxied ones through `_appsource` (bridge: globalSearch.mjs)
      bridge.adoptShellSources(reg.shell);
      // @App(mobileQr): "Open on mobile" — the QR of the mateu.io/add link (openMateuMobileQr)
      $application.variables.mateuMobileQr = !!(reg.shell && reg.shell.mobileQr);
      // Redwood is LIGHT ONLY: @App(themeToggle) is ignored (no switch), and neither a stored dark
      // choice nor the OS preference applies (poc/theme.mjs)
      bridge.applyLightTheme();
      if (reg.shell && (reg.shell.notificationsEnabled || reg.shell.notificationsSource)) {
        bridge.fetchNotifications(base, $application.variables.mateuShellSST, $application.variables.mateuAppState || {})
          .then((model) => { $application.variables.mateuNotifications = model; })
          .catch(() => { /* no inbox: the header stays without a bell */ });
      }
      // the @App's logo (URL relative to the Mateu backend) → brand image in the header
      $application.variables.mateuShellLogo = reg.shell && reg.shell.logo
        ? assetBase + reg.shell.logo : '';
      // AI chat (@AI → App.sseUrl): the agent's endpoint, same-origin as the Mateu backend.
      // With this set, the chat button shows in the header (its drawer on the left).
      // And, like the web chat: the panel title (the @App(askLabel) brand), attachments
      // (@AI(upload)) and the mcpUrl (@AI(mcp)) — bridge.chatConfigOf
      const chat = bridge.chatConfigOf(reg.shell, assetBase);
      $application.variables.mateuChatSseUrl = chat.sseUrl;
      $application.variables.mateuChatTitle = chat.title;
      $application.variables.mateuChatUploadUrl = chat.uploadUrl;
      $application.variables.mateuChatMcpUrl = chat.mcpUrl;
      // the "ask" FAB: Ask Oracle with its glyph, or the @App(askLabel, askIcon) label/icon
      const askFab = bridge.askFabOf(reg.shell, assetBase);
      $application.variables.mateuAskLabel = askFab.label;
      brandAskFabSoon(askFab);
      if (reg.shell && reg.shell.title) {
        document.title = reg.shell.title;
      }

      if (nav.mode === 'drawer') {
        // the navigation-list parses its <ul> on init; the stamped li arrive later
        try {
          await Actions.callComponentMethod(context, { selector: '#mateuNavList', method: 'refresh' });
          nameCollapseIcons();
        } catch (ignored) { /* not mounted yet: the toggle's refresh will cover it */ }
      }

      const firstLeaf = nav.menuTree.find((entry) => !entry.hasChildren);
      const firstGroup = nav.menuTree.find((entry) => entry.hasChildren);
      const first = firstLeaf || (firstGroup && firstGroup.children[0]);
      // the app's HOME (@HomeRoute, e.g. the welcome page) wins over the first
      // menu option
      // (the homeRoute of a mounted App arrives whole, '/appdemo/screen': the route is relative to the mount)
      const homeRoute = bridge.routeUnderMount(nav.homeRoute) || (first ? first.id : '') || (withoutApp ? '/' : '');
      $application.variables.mateuHomeRoute = homeRoute;

      // 1.5: the shell's URL — PATH mode (/route) when the app is served by the Mateu backend
      // (renderer jar: the generated controller injects a hidden <mateu-ui>, the signal),
      // HASH mode (#/route) in static serving (local vb-serve / VB hosted on Oracle,
      // where the server cannot rewrite arbitrary paths to the index)
      // The <mateu-ui> also carries the @UI's MOUNT (baseUrl="/console"): the API hangs off it
      // and routes are relative to it (bridge.initMount; '' at the root).
      const pathMode = bridge.initMount(document) != null;
      window.__mateuUrlPathMode = pathMode;
      // with its query: `?integration=MRU01` are the filters a listing opens with (Vaadin
      // applies them; here they were lost at startup and the listing came out unfiltered)
      const urlRoute = () => bridge.currentRouteOf(window.location);

      // deep link — if the URL carries a route, boot THAT route. With the query the
      // page was opened with (index.html saves it on load: VB's router strips it from the URL at startup)
      const initialSearch = window.__mateuInitialSearch || '';
      window.__mateuInitialSearch = '';
      let deepLink = urlRoute();
      if (pathMode && deepLink && deepLink.indexOf('?') < 0 && initialSearch) {
        deepLink += initialSearch;
      }
      const startRoute = deepLink || homeRoute;
      if (startRoute) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { detail: { currentId: startRoute } }, fromUrl: !!deepLink },
        });
      }
      if (editorPreview) {
        window.__mateuShellContext = context;
        editorPreview.booted();
      }

      // navigation-requested: emitted by a widget's HTML (the link of the inbox badge) and
      // bubbles up to the document — the same event the web renderer listens to. It carries its pod
      // (baseUrl + serverSideType): if the menu does not know the route, it is registered before navigating.
      // The listeners below are wired ONCE, but the chain's context expires: if VB
      // re-enters the page (its router reacts to certain URL changes), the captured context
      // ends up «disposed» and a later back/forward did nothing (VB discards it with
      // a WARN): the screen was left blank with the previous tab marked. Always the latest one.
      window.__mateuShellContext = context;
      const liveContext = () => window.__mateuShellContext || context;
      if (!window.__mateuNavRequestWired) {
        window.__mateuNavRequestWired = true;
        document.addEventListener('navigation-requested', (event) => {
          const detail = (event && event.detail) || {};
          if (detail.route == null) return;
          event.stopPropagation();
          bridge.registerRemoteRoute(detail.route, detail);
          Actions.callChain(liveContext(), {
            chain: 'onMateuNavigate',
            // all the menu-click fields it carries, not only the route (consumedRoute/serverSideType/actionId)
            params: { event: { detail: { route: detail.route, navigation: bridge.chatNavigationOf(detail) } } },
          });
        });
      }

      // The AI chat's UI events (poc/chat.mjs dispatchChatEvent — the shell panel's chatSend and the
      // inline Chat component share it): what the shell does for each, against the LIVE context.
      //  - navigation-requested → onMateuNavigate with every menu-click field (its pod registered first);
      //  - close-requested → the chat panel closes;
      //  - a subscriber of the event on screen (OnCustomEvent / @SubscribeTo) → its action, on its surface,
      //    run by the CONTENT page (the Element-event route: host → runMateuAction, island → its surface);
      //  - a render-screen nobody takes → the `__preview__` answer, painted by the content page as an
      //    ordinary increment (application:mateuChatPreview). In the content it is TRANSIENT: the menu
      //    selection is cleared and onMateuNavigate knows a generated screen is shown, so any
      //    navigation — even to the same entry — loads the real screen again.
      bridge.setChatEventHost({
        registry: () => liveContext().$application.variables.mateuRegistry,
        currentRoute: () => liveContext().$application.variables.mateuSelectedRoute || '',
        base: () => bridge.baseOf(liveContext().$application.variables.mateuRegistry) || base,
        navigate: (navigation) => {
          bridge.registerRemoteRoute(navigation.route, navigation);
          return Actions.callChain(liveContext(), {
            chain: 'onMateuNavigate',
            params: { event: { route: navigation.route, navigation } },
          });
        },
        closeChat: () => Actions.callChain(liveContext(), { chain: 'toggleMateuChat', params: { open: false } }),
        runAction: (actionId, parameters, ctxId) => Actions.fireEvent(liveContext(), {
          name: 'application:mateuElementEvent',
          payload: { actionId, parameters, fromNested: false, surfaceId: ctxId === bridge.HOST_ID ? '' : ctxId },
        }),
        paintPreview: (increment, request) => {
          if (request.target === 'content') {
            // it replaces the screen on show: unsaved changes there are asked about first, like
            // any navigation away (onMateuNavigate's dirtyGuard); kept → not painted
            const app = liveContext().$application.variables;
            if (!bridge.confirmNavigationAway(app)) return undefined;
            window.__mateuChatPreviewShown = true;
            liveContext().$application.variables.mateuSelectedNavId = '';
          }
          return Actions.fireEvent(liveContext(), {
            name: 'application:mateuChatPreview',
            payload: { increment },
          });
        },
        onError: (e) => { console.warn('[mateu-chat] agent event', e); },
      });

      // LIVE UI PUSH (AppDto.agentPush, poc/agentPush.mjs): this TAB is a UI session an MCP agent
      // can send UI to once the user pairs it ("Connect AI" in the header → a one-time code). The
      // tab's own channel (`_agent-channel`, one per tab) delivers each message, applied exactly
      // like the chat's event of the same name — through the chat event host set just above.
      bridge.installAgentPush();
      $application.variables.mateuAgentPush = !!(reg.shell && reg.shell.agentPush);
      bridge.syncAgentPush(reg.shell, {
        base,
        route: () => liveContext().$application.variables.mateuSelectedRoute || '',
      }).catch((e) => { console.warn('[mateu] live UI push', e); });

      // An ordinary HTML link in the content (`<a href="/journey/bookings/ZUAAKJ">`, one from an
      // app's Text/Html) navigates INSIDE the shell, as in Vaadin (Flow's RouterLinkHandler):
      // without this the browser loaded the whole page and the shell booted again, 20–40 s
      // blank. The rules (plain click, same origin, no target/download, nothing under /_xxx, API
      // or files) are in bridge.inAppRouteOfLink. Only the page's content (#pageContent):
      // the header (user menu, links to other consoles) works as always. It listens in the
      // bubble phase: whoever already handled the click (the chat, a widget's badge) marked it with
      // preventDefault and it is not touched. Enter on a link also arrives as a click. The URL is
      // pushed to the history in onMateuNavigate (back returns to the link's screen).
      if (!window.__mateuInAppLinksWired) {
        window.__mateuInAppLinksWired = true;
        document.addEventListener('click', (event) => {
          const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
          const content = document.getElementById('pageContent');
          if (!content || !path.includes(content)) return;
          const anchor = path.find((node) => node && node.tagName === 'A');
          if (!anchor) return;
          let route = bridge.inAppRouteOfLink(anchor, event, window.location, !window.__mateuUrlPathMode,
            bridge.currentMount());
          if (route === '/') route = liveContext().$application.variables.mateuHomeRoute || '';
          if (!route) return;
          event.preventDefault();
          Actions.callChain(liveContext(), {
            chain: 'onMateuNavigate',
            params: { event: { detail: { route } } },
          });
        });
      }

      // LIVE RELOAD (only if the index carries <meta name="mateu-dev">: a backend with mateu.dev=true).
      // A page change repaints the on-screen route keeping what was typed (liveState); an
      // app change (routes, mounts, the shell) re-mounts the app at the same URL.
      if (!window.__mateuLiveReloadWired) {
        window.__mateuLiveReloadWired = true;
        bridge.installDevLiveReload(document, window, (action) => {
          if (action === 'app') {
            window.location.reload();
            return;
          }
          const ctx = liveContext();
          const reg = ctx.$application.variables.mateuRegistry;
          const host = reg && reg.contexts ? reg.contexts[bridge.HOST_ID] : null;
          const route = window.__mateuLoadedFull || urlRoute() || ctx.$application.variables.mateuHomeRoute || '';
          if (!route) {
            window.location.reload();
            return;
          }
          Actions.callChain(ctx, {
            chain: 'onMateuNavigate',
            params: {
              event: { detail: { route } },
              fromUrl: true,
              force: true,
              liveState: Object.assign({}, (host && host.state) || {}, bridge.liveDraftFor(window.__mateuLoadedFull) || {}),
            },
          });
        });
      }

      // In path mode the history is Mateu's ONLY, and VB's router cannot see it. It takes as
      // «application URL» the route the page started with (/customers → /customers/) and reads
      // any URL below it as one of its pages (/customers/5 → the page «5»): on
      // a back it leaves the shell (vbExit), leaves the chains' context «disposed» and does not
      // re-enter, so the screen was not repainted. It happened when entering the master from a listing
      // row; not with a direct link, because the tabs are not BELOW the startup route
      // (/customers/3/orders → /customers/3/addresses). VB listens with
      // window.onpopstate, which runs before any listener added later (also in
      // capture), so it is removed: it is a single VB page, it has no navigation of its own.
      if (pathMode) {
        window.onpopstate = null;
      }

      // 1.5: back/forward — the listener reuses the chain's context (VB's scopes
      // are still alive after vbEnter); popstate in path mode, hashchange in hash mode
      if (!window.__mateuHashWired) {
        window.__mateuHashWired = true;
        window.addEventListener(pathMode ? 'popstate' : 'hashchange', () => {
          // in path mode, going back to '/' is going back to the home
          const route = urlRoute() || (pathMode ? ($application.variables.mateuHomeRoute || '') : '');
          if (route) {
            Actions.callChain(liveContext(), {
              chain: 'onMateuNavigate',
              params: { event: { detail: { currentId: route } }, fromUrl: true },
            });
          }
        });
      }
    }
  }

  return loadMateuShell;
});
