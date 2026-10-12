package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedPath;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ActionInstanceCreator {

  private final InstanceFactoryProvider instanceFactoryProvider;
  private final CrudNavigationAdjuster crudNavigationAdjuster;
  private final RouteInstanceCreator routeInstanceCreator;
  private final AppMenuResolver appMenuResolver;
  private final YamlUidlLoader yamlUidlLoader;
  private final YamlAppLoader yamlAppLoader;
  private final RouteRegistry routeRegistry;
  private final RestSourceRegistry restSourceRegistry;
  private final ActionRegistry actionRegistry;
  private final io.mateu.core.application.RoutedClassResolver routedClassResolver;

  Mono<?> createInstance(RunActionCommand command) {
    log.debug("createInstance {}", command);
    command = homeContentOfConsumedMountRoot(command);

    try {
      var adjusted = crudNavigationAdjuster.adjust(command);
      command = adjusted.command();

      if (adjusted.routeFirst()) {
        RunActionCommand finalCommand = command;
        return routeInstanceCreator
            .findRouteResolver(command)
            .switchIfEmpty(
                (Mono)
                    Mono.defer(
                        () -> {
                          finalCommand.httpRequest().setAttribute("updateUrl", "_no_update");
                          var restoredCommand =
                              finalCommand.withRoute(
                                  (String) finalCommand.httpRequest().getAttribute("oldRoute"));
                          return instantiateWithKnownType(restoredCommand);
                        }));
      }

    } catch (Exception e) {
      // Propagated, not swallowed: an empty increment here rendered as a blank screen with nothing
      // logged above INFO. The use case's error boundary logs it at ERROR with a reference id and
      // tells the user (or answers 403 / not-found for those).
      return Mono.error(e);
    }

    // A definition-only page has no class to re-instantiate: what it IS lives in its YAML, and the
    // wire's serverSideType is only the wrapper's name. Rebuilding it by type would produce a
    // record
    // with null components — no declared actions, no catalogue — so the round trip that a write
    // needs
    // (the client asks the server to make the proxied call) would answer for a page that no longer
    // knows anything about itself. Re-resolve it from the route instead, which is where the truth
    // is.
    if (command.serverSideType() != null
        && !command.serverSideType().isEmpty()
        && !SeededYamlPage.class.getName().equals(command.serverSideType())) {
      return instantiateWithKnownType(command);
    }

    RunActionCommand finalCommand = command;
    // A FRESH deep-link (consumedRoute "_empty") to a route under a mount whose root is a
    // data-driven
    // app shell renders the SHELL — the chrome — and the client then loads the content route inside
    // it. This wraps ANY route-bound view uniformly: a class MEDIATOR (a CRUD/wizard), a plain
    // class
    // view, or a definition page. Without it a route bound to a class viewModel would resolve
    // straight
    // to that class and render WITHOUT the app chrome — the shell is a definition, not an @App
    // class,
    // so the class-prefix app lookup (resolveAsApp) never finds it. The content load (consumedRoute
    // set) still goes through findRouteResolver, so a class mediator keeps serving its own
    // sub-routes.
    if (wrapsInAppShell(command)) {
      var app = shellFor(command);
      return appMenuResolver
          .resolveMenuIfApp(finalCommand, app, routeInstanceCreator::findRouteResolver)
          .switchIfEmpty((Mono) Mono.just(app))
          // A deep link no entry of the shell claims may still belong to one of its REMOTES (a
          // bookmarked page of a federated domain): give them the chance a class-declared shell
          // gives them, instead of mounting the route on the shell, which answers "Not found".
          .flatMap(
              resolved ->
                  resolved == app && !isAuthoredHere(finalCommand.route())
                      ? appMenuResolver.resolveRemoteMenuForRoute(
                          finalCommand, app, finalCommand.httpRequest())
                      : Mono.just(resolved));
    }
    // A route routes.yaml binds to a DEFINITION only (no view model): on a fresh deep link the
    // mount's root CLASS (a plain @UI("") page) claimed it by prefix and answered itself — the
    // browser showed the root page instead of the definition. An app on a prefix still answers
    // first (it draws the chrome and loads the content inside); otherwise the definition does.
    if (isAuthoredDefinitionOnly(command.route())) {
      return routeInstanceCreator
          .findApp(command)
          .switchIfEmpty((Mono) Mono.defer(() -> loadYaml(finalCommand)))
          .switchIfEmpty(
              (Mono) Mono.defer(() -> routeInstanceCreator.findRouteResolver(finalCommand)));
    }
    return routeInstanceCreator
        .findRouteResolver(command)
        .switchIfEmpty((Mono) Mono.defer(() -> loadYaml(finalCommand)))
        .switchIfEmpty((Mono) Mono.defer(() -> rootAppMenuContent(finalCommand)));
  }

  /**
   * A CONTENT load (consumedRoute set, no serverSideType) of a route no class or definition claims
   * — the route of a {@code @Menu} entry of the root {@code @UI("")} app, whose target class has no
   * {@code @UI} of its own. A renderer that loads content by route alone (the Redwood shell) asks
   * exactly that; it resolves the way the same load naming the app's type does (what the Vaadin
   * shell sends): through the app's menu. Only reached when everything else found nothing, so it
   * never changes what an existing route answers.
   */
  private Mono<?> rootAppMenuContent(RunActionCommand command) {
    if (command.consumedRoute() == null
        || "_empty".equals(command.consumedRoute())
        || command.route() == null
        || stripQuery(command.route()).replaceAll("^/+", "").isEmpty()
        || isTerminalRoute(command.route())
        || (command.actionId() != null && !command.actionId().isEmpty())) {
      return Mono.empty();
    }
    try {
      var root = routedClassResolver.resolve("", command).orElse(null);
      if (root == null
          || root.resolvedClass() == null
          || !isApp(root.resolvedClass(), command.route())) {
        return Mono.empty();
      }
      return instantiateWithKnownType(command.withServerSideType(root.resolvedClass().getName()));
    } catch (Throwable t) {
      log.debug("rootAppMenuContent {}: {}", command.route(), t.toString());
      return Mono.empty();
    }
  }

  /**
   * Route with no Java class. When the route's mount has a data-authored app shell — the definition
   * bound to the mount's root route is a {@code type: AppShell} — wrap the route in it, exactly as
   * {@link #instantiateWithKnownType} does for an {@code @App} class: {@link
   * AppMenuResolver#resolveMenuIfApp} resolves the in-app route (or the home) and produces the
   * chrome + content. When there is no shell, or the in-app resolution finds nothing, fall through
   * to a bare YAML page. At the mount's root the shell renders on its own — its {@code AppDto}
   * carries the home route and the frontend navigates there.
   */
  private Mono<?> loadYaml(RunActionCommand command) {
    var app = shellFor(command);
    if (app == null || isTerminalRoute(command.route()) || isAppLevelAction(command)) {
      return loadYamlPage(command);
    }
    RunActionCommand finalCommand = command;
    return appMenuResolver
        .resolveMenuIfApp(command, app, routeInstanceCreator::findRouteResolver)
        .switchIfEmpty((Mono) Mono.defer(() -> loadYamlPage(finalCommand)))
        .switchIfEmpty(
            (Mono)
                Mono.defer(
                    () ->
                        routeRegistry.isMountRoot(finalCommand.route())
                            ? Mono.just(app)
                            : Mono.empty()));
  }

  /**
   * Whether this deployment authors the route itself (routes.yaml / code suppliers): such a route
   * is never offered to a remote, even when no menu entry claims it.
   */
  private boolean isAuthoredDefinitionOnly(String route) {
    if (route == null || stripQuery(route).replaceAll("^/+", "").isEmpty()) {
      return false;
    }
    return routeRegistry
        .authored()
        .match(stripQuery(route))
        .map(match -> match.entry().viewModel() == null || match.entry().viewModel().isBlank())
        .orElse(false);
  }

  private boolean isAuthoredHere(String route) {
    return route != null && routeRegistry.match(stripQuery(route)).isPresent();
  }

  /**
   * The data-authored app shell of the route's mount AS THIS REQUEST SEES IT (menu items it may not
   * reach and {@code ${i18n.…}} resolved — see {@link YamlAppLoader#load(String, String,
   * io.mateu.uidl.interfaces.HttpRequest, java.util.function.Predicate)}), or null.
   */
  private io.mateu.uidl.fluent.AppShell shellFor(RunActionCommand command) {
    var httpRequest = command.httpRequest();
    return yamlAppLoader.load(
        routeRegistry.rootDefinitionFor(command.route()),
        routeRegistry.mountHomeFor(command.route()),
        httpRequest,
        path -> routeRegistry.isReachable(path, httpRequest));
  }

  /**
   * The data-authored app shell ({@code type: AppShell}) of the route's mount, as declared — or
   * null when the mount has none. What the shell's {@code _appsource} proxy may call is decided by
   * what THIS declares, never by the request.
   */
  public io.mateu.uidl.fluent.AppShell declaredShellFor(String route) {
    var path = route == null ? "" : route;
    // mountHomeFor first: it makes sure the mounts have been scanned (rootDefinitionFor does not),
    // so a header asking before any page load of this server still finds its shell
    var home = routeRegistry.mountHomeFor(path);
    return yamlAppLoader.load(routeRegistry.rootDefinitionFor(path), home);
  }

  /**
   * A YAML page for the route (no app shell involved). A bare layout renders as-is (static); a page
   * that declares a {@code modelView:} instantiates that class as the ModelView (state + actions),
   * and the reflective mapper re-applies the YAML layout to it (by route). Empty when there is no
   * spec.
   */
  private Mono<?> loadYamlPage(RunActionCommand command) {
    var spec = yamlUidlLoader.loadSpec(command.route(), command.httpRequest());
    if (spec == null) {
      return Mono.empty();
    }
    if (spec.modelView() == null || spec.modelView().isBlank()) {
      return Mono.justOrEmpty(
          seedBareLayout(spec.layout(), spec.actions(), spec.triggers(), spec.pageType(), command));
    }
    return createInstanceAndPostHydrate(spec.modelView(), command);
  }

  /**
   * A definition-only page has no view model to hold state, so a route that SEEDS it — a {@code
   * data:}/{@code appData:} source, {@code state:}/{@code appState:} literals, or query/path params
   * the page reads as {@code ${state.x}} — needs those applied here, exactly as the class path does
   * via {@link RouteSegmentUtils#addParameterValues}. When the route seeds something we fold it
   * into the state and wrap the layout as a {@link SeededYamlPage} so the mapping emits that state
   * and the {@code __restdata__} OnLoad the resolver stashed on the request; otherwise the bare
   * layout is returned unchanged (a plain static page).
   *
   * <p>Declared {@code actions:} are a second reason to wrap: they have to reach the wire, and a
   * bare layout carries none. A page that declares one is therefore never "plain static", even when
   * its route seeds nothing.
   */
  private Object seedBareLayout(
      io.mateu.uidl.fluent.Component layout,
      java.util.List<io.mateu.uidl.fluent.Action> actions,
      java.util.List<io.mateu.uidl.fluent.Trigger> triggers,
      String pageType,
      RunActionCommand command) {
    if (layout == null) {
      return null;
    }
    var declaredActions = withCatalogue(layout, actions, command.httpRequest());
    var declaredTriggers =
        triggers == null ? java.util.List.<io.mateu.uidl.fluent.Trigger>of() : triggers;
    var pathOnly = stripQuery(command.route());
    var match = routeRegistry.match(pathOnly).orElse(null);
    if (match == null || match.entry() == null) {
      // No registry entry (e.g. a convention-only page): nothing to seed, but declared actions and
      // triggers still have to travel.
      return declaredActions.isEmpty() && declaredTriggers.isEmpty() && pageType == null
          ? layout
          : new SeededYamlPage(
              layout,
              command.componentState(),
              declaredActions,
              declaredTriggers,
              restSourceRegistry.catalog(),
              pageType);
    }
    var entry = match.entry();
    var httpRequest = command.httpRequest();
    var hasQueryParams =
        httpRequest != null && httpRequest.getParameterNames().iterator().hasNext();
    var seeds =
        entry.data() != null
            || entry.appData() != null
            || !entry.appState().isEmpty()
            || !entry.state().isEmpty()
            || !entry.defaultParams().isEmpty()
            || !entry.fixedParams().isEmpty()
            || hasQueryParams;
    // A declared `pageType:` has to reach the wire too, and a bare layout carries no page type —
    // so, like declared actions, it is a reason to wrap.
    if (!seeds && declaredActions.isEmpty() && declaredTriggers.isEmpty() && pageType == null) {
      return layout; // a static page: keep the bare-layout shape (unchanged wire)
    }
    var resolved =
        new io.mateu.core.application.ResolvedRoute(pathOnly, entry.route(), Void.class, entry);
    var state =
        RouteSegmentUtils.addParameterValues(
            command.componentState(), pathOnly, resolved, httpRequest);
    return new SeededYamlPage(
        layout, state, declaredActions, declaredTriggers, restSourceRegistry.catalog(), pageType);
  }

  /**
   * The page's own actions plus the catalogue entries its layout (or its own flows) names but does
   * not declare — OWNER FIRST: a declared id is never replaced. Carrying them on the page is what
   * makes a button naming a catalogue id work on every renderer with no lookup of its own (a
   * component only claims the actions it advertises).
   */
  private java.util.List<io.mateu.uidl.fluent.Action> withCatalogue(
      io.mateu.uidl.fluent.Component layout,
      java.util.List<io.mateu.uidl.fluent.Action> actions,
      io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var own = actions == null ? java.util.List.<io.mateu.uidl.fluent.Action>of() : actions;
    var owned = new java.util.HashSet<String>();
    own.forEach(a -> owned.add(a.id()));
    var fromCatalogue = actionRegistry.referencedBy(layout, own, owned, httpRequest);
    if (fromCatalogue.isEmpty()) {
      return own;
    }
    var all = new java.util.ArrayList<>(own);
    all.addAll(fromCatalogue);
    return java.util.List.copyOf(all);
  }

  private static String stripQuery(String route) {
    if (route == null) {
      return "";
    }
    var q = route.indexOf('?');
    var path = q >= 0 ? route.substring(0, q) : route;
    return path.startsWith("/") ? path.substring(1) : path;
  }

  private Mono<?> instantiateWithKnownType(RunActionCommand command) {
    if (command.serverSideType() == null || command.serverSideType().isEmpty()) {
      return Mono.empty();
    }
    setResolvedRoute(command.httpRequest(), command.consumedRoute());
    // The client already knows the class, but the ROUTE still says where it is mounted and what
    // its path parameters are. Those have to be applied on every request, not only on the first
    // resolution: a tab of a record master (/customers/7/orders, sst = the orders listing) is
    // loaded straight by its type, and without this it ran with no customerId at all.
    var mount = mountOf(command);
    // An APP the client names by type but that is not on screen yet — the record master a deep
    // link to one of its tabs is homed on — renders ITSELF: its chrome (title, tabs) with the rest
    // of the path as its home. Resolving its menu here would answer the tab alone, and resolving
    // the route from scratch would answer the enclosing app all over again.
    var appNotOnScreen =
        mount != null
            && isApp(mount.resolvedClass(), mount.route())
            && longerThanConsumed(mount.route(), command.consumedRoute());
    if (appNotOnScreen) {
      setResolvedRoute(command.httpRequest(), mount.route());
    }
    if (mount != null) {
      command.httpRequest().setAttribute(KNOWN_TYPE_MOUNT, mount.route());
      command =
          command.withComponentState(
              RouteSegmentUtils.addParameterValues(
                  command.componentState(), mount.route(), mount, command.httpRequest()));
      if (command.httpRequest().getAttribute("resolvedPath") == null) {
        setResolvedPath(command.httpRequest(), mount.route());
      }
    }
    if (command.httpRequest().getAttribute("resolvedPath") == null) {
      setResolvedPath(command.httpRequest(), command.route());
    }
    var request = command.httpRequest();
    var mono =
        createInstanceAndPostHydrate(command.serverSideType(), command)
            .doOnNext(app -> request.setAttribute("resolvedApp", app));
    if (isTerminalRoute(command.route()) || isAppLevelAction(command) || appNotOnScreen) {
      return mono;
    }
    RunActionCommand finalCommand = command;
    return mono.flatMap(
        app ->
            appMenuResolver
                .resolveMenuIfApp(finalCommand, app, routeInstanceCreator::findRouteResolver)
                .switchIfEmpty((Mono) routeInstanceCreator.findRouteResolver(finalCommand)));
  }

  /**
   * Where the known server-side type is mounted inside the request route: the SHORTEST prefix of
   * the route that resolves to that very class, with the pattern it matched (shortest, because a
   * crud also answers its own sub-routes — {@code /items/1/edit} — and those are not its mount).
   * {@code null} when no prefix does (an action on a component reached by another channel — a
   * field, a method link).
   */
  private io.mateu.core.application.ResolvedRoute mountOf(RunActionCommand command) {
    var route = command.route();
    if (route == null || route.isBlank() || isTerminalRoute(route)) {
      return null;
    }
    var path = stripQuery(route);
    if (path.isEmpty()) {
      return null;
    }
    var segments = path.replaceAll("^/+", "").split("/");
    for (int n = 1; n <= segments.length; n++) {
      var prefix = "/" + String.join("/", java.util.Arrays.copyOf(segments, n));
      try {
        var resolved = routedClassResolver.resolve(prefix, command).orElse(null);
        if (resolved != null
            && resolved.resolvedClass() != null
            && resolved.resolvedClass().getName().equals(command.serverSideType())) {
          var own = n < segments.length ? ownAuthoredRoute(path, resolved, command) : null;
          if (own != null) {
            return own;
          }
          return new io.mateu.core.application.ResolvedRoute(
              prefix, resolved.pattern(), resolved.resolvedClass(), resolved.entry());
        }
      } catch (Throwable t) {
        log.debug("mountOf {}: {}", prefix, t.toString());
      }
    }
    return null;
  }

  /**
   * The routes.yaml entry answering the WHOLE {@code path} with the same class as the shorter route
   * {@code shorter} — two authored entries sharing a view model with different parameters pinned
   * ({@code orders/pending} pins status, {@code orders} only defaults it). The longer one is the
   * screen's own route: taking the shorter made a reload of orders/pending (a load by type) answer
   * the defaults of orders. Null in every other case (a crud's sub-route, a child tab…).
   */
  private io.mateu.core.application.ResolvedRoute ownAuthoredRoute(
      String path, io.mateu.core.application.ResolvedRoute shorter, RunActionCommand command) {
    if (shorter.entry() == null) {
      return null;
    }
    try {
      var exact = routedClassResolver.resolve(path, command).orElse(null);
      if (exact != null
          && exact.entry() != null
          && exact.entry() != shorter.entry()
          && !exact.entry().hasParent()
          && shorter.resolvedClass().equals(exact.resolvedClass())) {
        return new io.mateu.core.application.ResolvedRoute(
            path, exact.pattern(), exact.resolvedClass(), exact.entry());
      }
    } catch (Throwable t) {
      log.debug("mountOf {}: {}", path, t.toString());
    }
    return null;
  }

  /**
   * Request attribute: where the server-side type the client named is mounted in the request route
   * (see {@link #mountOf}), when some prefix of the route resolves to it.
   */
  public static final String KNOWN_TYPE_MOUNT = "_knownTypeMount";

  public static boolean longerThanConsumed(String path, String consumedRoute) {
    var p = stripQuery(path);
    var c =
        consumedRoute == null || "_empty".equals(consumedRoute) ? "" : stripQuery(consumedRoute);
    return p.length() > c.length();
  }

  private boolean isTerminalRoute(String route) {
    return route.endsWith("_page") || route.endsWith("_no_home_route");
  }

  /**
   * A FRESH deep-link ({@code consumedRoute == "_empty"}) to a route under a mount whose root
   * definition is a {@code type: AppShell} — the case that should render the shell (chrome) and let
   * the client load the content inside. False for the annotation world (no data-driven mount, so
   * {@code rootDefinitionFor} is null), for content loads (a non-{@code _empty} consumedRoute), and
   * for terminal / app-level actions.
   */
  /**
   * A load of a nested mount's ROOT that has already CONSUMED that root (route and consumed route
   * both {@code /orders}): what a federated shell asks a remote for on a deep link to the remote's
   * menu path — its home CONTENT, not its app shell again. A data-defined mount answers it with the
   * route of its declared {@code home:}; without this it answered its shell, which the shell's
   * content slot then reloaded forever. Anything else is returned unchanged.
   */
  private RunActionCommand homeContentOfConsumedMountRoot(RunActionCommand command) {
    if (command == null
        || command.route() == null
        || command.consumedRoute() == null
        || (command.actionId() != null && !command.actionId().isEmpty())) {
      return command;
    }
    var route = io.mateu.core.infra.Slashes.trim(command.route());
    if (route.isEmpty()
        || !route.equals(io.mateu.core.infra.Slashes.trim(command.consumedRoute()))
        || !routeRegistry.isMountRoot(route)) {
      return command;
    }
    var home = routeRegistry.mountHomeFor(route);
    if (home == null || home.isBlank()) {
      return command;
    }
    return command.withRoute("/" + route + "/" + io.mateu.core.infra.Slashes.trim(home));
  }

  private boolean wrapsInAppShell(RunActionCommand command) {
    if (!"_empty".equals(command.consumedRoute())
        || isTerminalRoute(command.route())
        || isAppLevelAction(command)) {
      return false;
    }
    return yamlAppLoader.isAppShell(routeRegistry.rootDefinitionFor(command.route()));
  }

  /**
   * An action addressed to the APP INSTANCE itself (e.g. the header context selectors' {@code
   * _appcontext-search-<field>}) must skip menu/home resolution: on a ROOT app (route "") there is
   * no menu actionable for the empty route, so resolving would come back empty and the action would
   * answer "Not found." instead of dispatching to its runner.
   */
  /**
   * Whether {@code actionId} is the action of one of the app's {@code @AppShortcut}s. A blank id
   * never is: a route load has actionId "" and most shortcuts have no action either — matching the
   * two blanks answered every page load of such an app with the shell (blank screens on Redwood).
   */
  static boolean isAppShortcutAction(Class<?> appClass, String actionId) {
    if (actionId == null || actionId.isBlank()) {
      return false;
    }
    return java.util.Arrays.stream(
            appClass.getAnnotationsByType(io.mateu.uidl.annotations.AppShortcut.class))
        .anyMatch(shortcut -> actionId.equals(shortcut.actionId()));
  }

  private boolean isAppLevelAction(RunActionCommand command) {
    var actionId = command.actionId();
    if (actionId == null) {
      return false;
    }
    if (actionId.startsWith(io.mateu.core.domain.act.AppContextSearchActionRunner.ACTION_PREFIX)) {
      return true;
    }
    // The visual-builder contract request addresses the ModelView instance directly (skip
    // menu/route resolution), same as the context selectors' remote search.
    if (RunActionUseCase.CONTRACT_ACTION.equals(actionId)) {
      return true;
    }
    // The notification inbox's list/read actions are app-level too (the bell lives on the shell).
    if (actionId.startsWith(io.mateu.core.domain.act.NotificationsActionRunner.ACTION_PREFIX)) {
      return true;
    }
    // So is the command palette's entity search.
    if (io.mateu.core.domain.act.GlobalSearchActionRunner.ACTION_ID.equals(actionId)) {
      return true;
    }
    // The idle warning's keep-alive and the live-updates event stream belong to the shell too.
    if (io.mateu.core.domain.act.KeepAliveActionRunner.ACTION_ID.equals(actionId)
        || io.mateu.core.domain.act.LiveUpdatesActionRunner.ACTION_ID.equals(actionId)) {
      return true;
    }
    // Header actions declared by the app's AppActionsSupplier dispatch to the app
    // instance too — same reasoning as the context selectors' remote search.
    if (command.serverSideType() == null) {
      return false;
    }
    try {
      var appClass = forName(command.serverSideType());
      // an app-level @Fab (a method of the app class) is dispatched to the app instance too: the
      // floating button lives on the shell, whatever screen is below it
      if (java.util.Arrays.stream(appClass.getMethods())
          .anyMatch(
              m ->
                  actionId.equals(m.getName())
                      && io.mateu.core.infra.reflection.MetaAnnotations.isPresent(
                          m, io.mateu.uidl.annotations.Fab.class))) {
        return true;
      }
      // an app-wide shortcut's action (@AppShortcut(actionId)) runs on the app, whatever screen
      if (isAppShortcutAction(appClass, actionId)) {
        return true;
      }
      // a menu RULE leaf's RunAction (@Menu Rule / List<Rule>) runs on the app too: the menu lives
      // on the shell, whatever screen is below it (the header-action rail, like the FAB above)
      if (isMenuRuleAction(appClass, actionId, command)) {
        return true;
      }
      // a menu rule leaf's action (@Menu Rule … RunAction) is the app's too: the menu is on the
      // shell — only worth an instance when the app has a method of that name to run
      var hasMethod =
          java.util.Arrays.stream(appClass.getMethods())
              .anyMatch(m -> actionId.equals(m.getName()));
      if (!hasMethod
          && !io.mateu.uidl.interfaces.AppActionsSupplier.class.isAssignableFrom(appClass)) {
        return false;
      }
      var app =
          io.mateu.uidl.di.MateuBeanProvider.getBean(io.mateu.uidl.interfaces.InstanceFactory.class)
              .newInstance(appClass, java.util.Map.of(), command.httpRequest());
      if (hasMethod
          && io.mateu.core.domain.out.componentmapper.MenuRuleActions.runs(
              app, actionId, command.route(), command.httpRequest())) {
        return true;
      }
      if (!(app instanceof io.mateu.uidl.interfaces.AppActionsSupplier supplier)) {
        return false;
      }
      var actions = supplier.appActions(command.httpRequest());
      // dropdown header actions dispatch their CHILDREN's ids — flatten before matching
      return actions != null
          && actions.stream()
              .flatMap(
                  a ->
                      a.children() == null
                          ? java.util.stream.Stream.of(a)
                          : java.util.stream.Stream.concat(
                              java.util.stream.Stream.of(a), a.children().stream()))
              .anyMatch(a -> actionId.equals(a.actionId()));
    } catch (Exception e) {
      return false;
    }
  }

  private static boolean isMenuRuleAction(
      Class<?> appClass, String actionId, RunActionCommand command) {
    var menuFields =
        io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields(appClass).stream()
            .filter(
                field ->
                    io.mateu.core.infra.reflection.MetaAnnotations.isPresent(
                            field, io.mateu.uidl.annotations.Menu.class)
                        && (io.mateu.uidl.data.Rule.class.equals(field.getType())
                            || java.util.List.class.isAssignableFrom(field.getType())))
            .toList();
    if (menuFields.isEmpty()) {
      return false;
    }
    var app =
        io.mateu.uidl.di.MateuBeanProvider.getBean(io.mateu.uidl.interfaces.InstanceFactory.class)
            .newInstance(appClass, java.util.Map.of(), command.httpRequest());
    for (var field : menuFields) {
      var value = io.mateu.core.infra.reflection.read.ValueProvider.getValue(field, app);
      var rules =
          value instanceof java.util.List<?> list
              ? list
              : java.util.List.of(value == null ? "" : value);
      for (var item : rules) {
        if (item instanceof io.mateu.uidl.data.Rule rule
            && rule.action() == io.mateu.uidl.data.RuleAction.RunAction
            && actionId.equals(rule.actionId())) {
          return true;
        }
      }
    }
    return false;
  }

  private Mono<Object> createInstanceAndPostHydrate(String className, RunActionCommand command) {
    return createInstance(className, command).map(object -> postHydrate(command, object));
  }

  private static Object postHydrate(RunActionCommand command, Object object) {
    if (object instanceof PostHydrationHandler postHydrationHandler) {
      postHydrationHandler.onHydrated(command.httpRequest());
    }
    return object;
  }

  private Mono<?> createInstance(String className, RunActionCommand command) {
    var instanceFactory = instanceFactoryProvider.get(className);
    return instanceFactory.createInstance(
        className, command.componentState(), command.httpRequest());
  }
}
