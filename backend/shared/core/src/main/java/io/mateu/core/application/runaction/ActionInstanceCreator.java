package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedPath;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;
import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.dtos.UIIncrementDto;
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

  Mono<?> createInstance(RunActionCommand command) {
    log.info("createInstance {}", command);

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

    } catch (Throwable e) {
      log.info(e.getClass().getSimpleName() + ": " + e.getMessage());
      return Mono.just(UIIncrementDto.builder().build());
    }

    if (command.serverSideType() != null && !command.serverSideType().isEmpty()) {
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
      var app = yamlAppLoader.load(routeRegistry.rootDefinitionFor(command.route()));
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
    var app = yamlAppLoader.load(appDefinition);
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
      return Mono.justOrEmpty(spec.layout());
    }
    return createInstanceAndPostHydrate(spec.modelView(), command);
  }

  private Mono<?> instantiateWithKnownType(RunActionCommand command) {
    if (command.serverSideType() == null || command.serverSideType().isEmpty()) {
      return Mono.empty();
    }
    setResolvedRoute(command.httpRequest(), command.consumedRoute());
    if (command.httpRequest().getAttribute("resolvedPath") == null) {
      setResolvedPath(command.httpRequest(), command.route());
    }
    var mono =
        createInstanceAndPostHydrate(command.serverSideType(), command)
            .doOnNext(app -> command.httpRequest().setAttribute("resolvedApp", app));
    if (isTerminalRoute(command.route()) || isAppLevelAction(command)) {
      return mono;
    }
    RunActionCommand finalCommand = command;
    return mono.flatMap(
        app ->
            appMenuResolver
                .resolveMenuIfApp(finalCommand, app, routeInstanceCreator::findRouteResolver)
                .switchIfEmpty((Mono) routeInstanceCreator.findRouteResolver(finalCommand)));
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
