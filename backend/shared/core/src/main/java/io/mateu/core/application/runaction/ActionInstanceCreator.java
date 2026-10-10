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
      var app =
          yamlAppLoader.load(
              routeRegistry.rootDefinitionFor(command.route()),
              routeRegistry.mountHomeFor(command.route()));
      return appMenuResolver
          .resolveMenuIfApp(finalCommand, app, routeInstanceCreator::findRouteResolver)
          .switchIfEmpty((Mono) Mono.just(app));
    }
    return routeInstanceCreator
        .findRouteResolver(command)
        .switchIfEmpty((Mono) Mono.defer(() -> loadYaml(finalCommand)));
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
    var appDefinition = routeRegistry.rootDefinitionFor(command.route());
    var app = yamlAppLoader.load(appDefinition, routeRegistry.mountHomeFor(command.route()));
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
   * A YAML page for the route (no app shell involved). A bare layout renders as-is (static); a page
   * that declares a {@code modelView:} instantiates that class as the ModelView (state + actions),
   * and the reflective mapper re-applies the YAML layout to it (by route). Empty when there is no
   * spec.
   */
  private Mono<?> loadYamlPage(RunActionCommand command) {
    var spec = yamlUidlLoader.loadSpec(command.route());
    if (spec == null) {
      return Mono.empty();
    }
    if (spec.modelView() == null || spec.modelView().isBlank()) {
      return Mono.justOrEmpty(
          seedBareLayout(spec.layout(), spec.actions(), spec.triggers(), command));
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
      RunActionCommand command) {
    if (layout == null) {
      return null;
    }
    var declaredActions = withCatalogue(layout, actions);
    var declaredTriggers =
        triggers == null ? java.util.List.<io.mateu.uidl.fluent.Trigger>of() : triggers;
    var pathOnly = stripQuery(command.route());
    var match = routeRegistry.match(pathOnly).orElse(null);
    if (match == null || match.entry() == null) {
      // No registry entry (e.g. a convention-only page): nothing to seed, but declared actions and
      // triggers still have to travel.
      return declaredActions.isEmpty() && declaredTriggers.isEmpty()
          ? layout
          : new SeededYamlPage(
              layout,
              command.componentState(),
              declaredActions,
              declaredTriggers,
              restSourceRegistry.catalog());
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
    if (!seeds && declaredActions.isEmpty() && declaredTriggers.isEmpty()) {
      return layout; // a static page: keep the bare-layout shape (unchanged wire)
    }
    var resolved =
        new io.mateu.core.application.ResolvedRoute(pathOnly, entry.route(), Void.class, entry);
    var state =
        RouteSegmentUtils.addParameterValues(
            command.componentState(), pathOnly, resolved, httpRequest);
    return new SeededYamlPage(
        layout, state, declaredActions, declaredTriggers, restSourceRegistry.catalog());
  }

  /**
   * The page's own actions plus the catalogue entries its layout (or its own flows) names but does
   * not declare — OWNER FIRST: a declared id is never replaced. Carrying them on the page is what
   * makes a button naming a catalogue id work on every renderer with no lookup of its own (a
   * component only claims the actions it advertises).
   */
  private java.util.List<io.mateu.uidl.fluent.Action> withCatalogue(
      io.mateu.uidl.fluent.Component layout, java.util.List<io.mateu.uidl.fluent.Action> actions) {
    var own = actions == null ? java.util.List.<io.mateu.uidl.fluent.Action>of() : actions;
    var owned = new java.util.HashSet<String>();
    own.forEach(a -> owned.add(a.id()));
    var fromCatalogue = actionRegistry.referencedBy(layout, own, owned);
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
      if (!io.mateu.uidl.interfaces.AppActionsSupplier.class.isAssignableFrom(appClass)) {
        return false;
      }
      var supplier =
          (io.mateu.uidl.interfaces.AppActionsSupplier)
              io.mateu.uidl.di.MateuBeanProvider.getBean(
                      io.mateu.uidl.interfaces.InstanceFactory.class)
                  .newInstance(appClass, java.util.Map.of(), command.httpRequest());
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
