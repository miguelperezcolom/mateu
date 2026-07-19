package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.ComponentStateHelper.getAppRoute;
import static io.mateu.core.domain.out.componentmapper.HomeRouteResolver.getSelectedOption;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.infra.reflection.ReflectionUiIncrementMapper.removeQueryParamsFromRoute;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/** Resolves AppShell/menu actionables and remote menus from a route. */
@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class AppMenuResolver {

  private final BeanProvider beanProvider;
  private final InstanceFactoryProvider instanceFactoryProvider;
  private final RemoteMenuHandler remoteMenuHandler;
  private final List<RouteResolver> routeResolvers;

  // ── Public static: used by RunActionUseCase ──────────────────────────────

  public static Actionable resolveMenu(
      String appRoute,
      List<Actionable> actionables,
      String route,
      String completeRoute,
      HttpRequest httpRequest) {
    if (route.endsWith("_page") || "".equals(route) || route.endsWith("_no_home_route")) {
      return null;
    }
    var selectedOption = getSelectedOption(appRoute, route, actionables, httpRequest);
    if (selectedOption != null && selectedOption.isPresent()) {
      return selectedOption.get();
    }
    return null;
  }

  // ── resolveMenuIfApp ──────────────────────────────────────────────────────

  Mono<?> resolveMenuIfApp(
      RunActionCommand command,
      Object instance,
      Function<RunActionCommand, Mono<?>> findRouteResolverFn) {
    var rawRoute = command.route();
    var route = removeQueryParamsFromRoute(rawRoute);

    if (instance instanceof AppShell app) {
      return resolveInApp(command, route, app, instance, true, findRouteResolverFn);
    }
    if (instance instanceof AppSupplier appSupplier) {
      var app =
          appSupplier
              .getApp(command.httpRequest())
              .withServerSideType(instance.getClass().getName());
      return resolveInApp(command, route, app, instance, false, findRouteResolverFn);
    }
    if (isApp(instance.getClass(), route)) {
      var app =
          mapToAppComponent(
              instance,
              command.baseUrl(),
              route,
              command.consumedRoute(),
              command.initiatorComponentId(),
              command.httpRequest());
      return resolveInApp(command, route, app, instance, false, findRouteResolverFn);
    }
    return Mono.just(instance);
  }

  // ── resolveInApp ─────────────────────────────────────────────────────────

  Mono<?> resolveInApp(
      RunActionCommand command,
      String route,
      Object potentialApp,
      Object instance,
      boolean emptyIfRoute,
      Function<RunActionCommand, Mono<?>> findRouteResolverFn) {
    var consumedRoute = command.consumedRoute();
    var data = command.componentState();
    var httpRequest = command.httpRequest();

    var app =
        toApp(
            potentialApp,
            command.baseUrl(),
            consumedRoute,
            command.initiatorComponentId(),
            httpRequest);
    if (app == null) {
      return Mono.empty();
    }

    var resolvedRoute =
        httpRequest.getAttribute("resolvedRoute") != null
            ? (String) httpRequest.getAttribute("resolvedRoute")
            : app.route();
    var actionable = AppMenuActionableFinder.find(app, route, consumedRoute, httpRequest);

    if (actionable instanceof RemoteMenu remoteMenu) {
      return remoteMenuHandler.handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    if ("_empty".equals(consumedRoute) || "/_page".equals(route) || "_page".equals(route)) {
      return Mono.just(potentialApp);
    }

    var resolved =
        AbsoluteRouteDispatcher.tryResolve(
            routeResolvers,
            route,
            resolvedRoute,
            instance,
            data,
            instanceFactoryProvider,
            httpRequest);
    if (resolved != null) {
      return resolved;
    }

    if (actionable == null) {
      return Mono.empty();
    }
    return ActionableDispatcher.dispatch(
        actionable,
        command,
        route,
        emptyIfRoute,
        findRouteResolverFn,
        instanceFactoryProvider,
        beanProvider);
  }

  Mono<?> resolveRemoteMenuForRoute(
      RunActionCommand command, Object potentialApp, HttpRequest httpRequest) {
    var app =
        toApp(
            potentialApp,
            command.baseUrl(),
            command.consumedRoute(),
            command.initiatorComponentId(),
            httpRequest);
    if (app == null) {
      return Mono.just(potentialApp);
    }

    var actionable =
        AppMenuActionableFinder.find(app, command.route(), command.consumedRoute(), httpRequest);

    if (actionable instanceof RemoteMenu remoteMenu) {
      return remoteMenuHandler.handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    // Deep links: no local menu matches the route — give the remote menus a chance; the
    // first remote app that owns it gets mounted (e.g. a bookmarked /venta).
    if (actionable == null
        && command.route() != null
        && !command.route().isBlank()
        && !command.route().endsWith("_page")
        && !command.route().endsWith("_no_home_route")) {
      return tryRemoteMenusForRoute(app, command, httpRequest)
          .switchIfEmpty((Mono) Mono.just(potentialApp));
    }

    return Mono.just(potentialApp);
  }

  private Mono<?> tryRemoteMenusForRoute(
      AppShell app, RunActionCommand command, HttpRequest httpRequest) {
    return reactor.core.publisher.Flux.fromIterable(app.menu())
        .filter(item -> item instanceof RemoteMenu)
        .cast(RemoteMenu.class)
        .concatMap(
            remoteMenu ->
                remoteMenuHandler.tryResolveRoute(
                    remoteMenu, command.route(), httpRequest, command))
        .next();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  @SneakyThrows
  AppShell toApp(
      Object potentialApp,
      String baseUrl,
      String consumedRoute,
      String initialComponentId,
      HttpRequest httpRequest) {
    if (potentialApp instanceof AppShell app) {
      return app;
    }
    return mapToAppComponent(
        potentialApp,
        baseUrl,
        getAppRoute(potentialApp),
        consumedRoute,
        initialComponentId,
        httpRequest);
  }
}
