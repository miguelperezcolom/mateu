package io.mateu.core.application.runaction;

import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.ReactiveRouteHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@Singleton
@RequiredArgsConstructor
public class RunActionUseCase {

  private final InstanceFactoryProvider instanceFactoryProvider;
  private final ActionRunnerProvider actionRunnerProvider;
  private final UiIncrementMapperProvider uiIncrementMapperProvider;
  private final CrudNavigationAdjuster crudNavigationAdjuster;
  private final RouteInstanceCreator routeInstanceCreator;
  private final AppMenuResolver appMenuResolver;

  // ── Public static helpers (used by other classes in the framework) ────────

  public static void setResolvedRoute(HttpRequest httpRequest, String route) {
    setResolvedRoute(httpRequest, route, true);
  }

  public static void setResolvedRoute(HttpRequest httpRequest, String route, boolean force) {
    if (force || httpRequest.getAttribute("resolvedRoute") == null) {
      httpRequest.setAttribute("resolvedRoute", route);
    }
  }

  public static void setResolvedPath(HttpRequest httpRequest, String path) {
    httpRequest.setAttribute("resolvedPath", path);
  }

  // Keep static wrap/getState here as a forwarding facade so existing callers compile unchanged.
  // The actual implementation lives in ComponentStateHelper.
  public static io.mateu.dtos.ServerSideComponentDto wrap(
      Component component,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return ComponentStateHelper.wrap(
        component, modelView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }

  public static io.mateu.dtos.ServerSideComponentDto wrap(
      List<Component> components,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return ComponentStateHelper.wrap(
        components, modelView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }

  public static Object getState(Object modelView, HttpRequest httpRequest) {
    return ComponentStateHelper.getState(modelView, httpRequest);
  }

  // ── Main entry point ──────────────────────────────────────────────────────

  public Flux<UIIncrementDto> handle(RunActionCommand command) {
    log.info("run action {}", command.actionId());
    return (Mono.just(command)
            .flatMap(ignored -> createInstance(command))
            .flatMap(instance -> routeIfNeeded(command, instance))
            .flatMapMany(
                instance ->
                    actionRunnerProvider
                        .get(
                            instance,
                            command.actionId(),
                            command.consumedRoute(),
                            command.route(),
                            command.httpRequest())
                        .run(instance, command)))
        .flatMap(
            result ->
                uiIncrementMapperProvider
                    .get(result)
                    .map(
                        result,
                        command.baseUrl(),
                        command.route(),
                        command.consumedRoute(),
                        command.initiatorComponentId(),
                        command.httpRequest()))
        .doOnError(Throwable::printStackTrace)
        .onErrorResume(
            error ->
                Mono.just(
                        Message.builder()
                            .variant(NotificationVariant.error)
                            .title(error.getClass().getSimpleName())
                            .text(error.getClass().getSimpleName() + ": " + error.getMessage())
                            .build())
                    .flatMap(
                        result ->
                            uiIncrementMapperProvider
                                .get(result)
                                .map(
                                    result,
                                    command.baseUrl(),
                                    command.route(),
                                    command.consumedRoute(),
                                    command.initiatorComponentId(),
                                    command.httpRequest())))
        .switchIfEmpty(
            Mono.just(Text.builder().text("Not found.").style("color: red;").build())
                .flatMap(
                    result ->
                        uiIncrementMapperProvider
                            .get(result)
                            .map(
                                result,
                                command.baseUrl(),
                                command.route(),
                                command.consumedRoute(),
                                command.initiatorComponentId(),
                                command.httpRequest())));
  }

  // ── Instance creation ─────────────────────────────────────────────────────

  @SneakyThrows
  private Mono<?> createInstance(RunActionCommand command) {
    log.info("createInstance {}", command);

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

    if (command.serverSideType() != null && !command.serverSideType().isEmpty()) {
      return instantiateWithKnownType(command);
    }

    return routeInstanceCreator.findRouteResolver(command);
  }

  /**
   * Path 2: we already know the serverSideType. Instantiate it and, unless the route is terminal,
   * try to resolve deeper navigation (menu/route) from the resulting instance.
   */
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
    if (isTerminalRoute(command.route())) {
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

  // ── Routing ───────────────────────────────────────────────────────────────

  private static Mono<?> routeIfNeeded(RunActionCommand command, Object instance) {
    if (instance instanceof Mono<?> mono) {
      return mono.map(i -> routeIfNeeded(command, i));
    }
    if (instance instanceof RouteHandler handlesRoute) {
      return Mono.just(handlesRoute.handleRoute(command.route(), command.httpRequest()));
    }
    if (instance instanceof ReactiveRouteHandler handlesRoute) {
      return handlesRoute.handleRoute(command.route(), command.httpRequest());
    }
    return Mono.just(instance);
  }
}
