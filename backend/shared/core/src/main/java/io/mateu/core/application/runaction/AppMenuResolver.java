package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.ComponentStateHelper.getAppRoute;
import static io.mateu.core.application.runaction.ComponentStateHelper.invoke;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;
import static io.mateu.core.domain.out.componentmapper.HomeRouteResolver.getSelectedOption;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.mappers.ReflectionUiIncrementMapper.removeQueryParamsFromRoute;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;
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

    var cleanRoute = route;
    if (route.startsWith(consumedRoute)) {
      cleanRoute = route.substring(consumedRoute.length());
    }
    var actionable =
        resolveMenu(
            resolvedRoute,
            app.menu(),
            cleanRoute,
            ("_empty".equals(consumedRoute) ? app.route() : "") + route,
            httpRequest);

    if (actionable instanceof RemoteMenu remoteMenu) {
      return remoteMenuHandler.handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    if ("_empty".equals(consumedRoute) || "/_page".equals(route) || "_page".equals(route)) {
      return Mono.just(potentialApp);
    }

    if (routeResolvers != null) {
      var found =
          routeResolvers.stream()
              .filter(resolver -> resolver.supportsRoute(route, resolvedRoute))
              .findFirst();
      if (found.isPresent()) {
        var resolvedClass = found.get().resolveRoute(route, resolvedRoute, httpRequest);
        if (resolvedClass != null) {
          setResolvedRoute(httpRequest, route);
          var instanceTypeName = resolvedClass.getName();
          log.info("absolute {} resolved to {}", route, instance);
          return instanceFactoryProvider
              .get(instanceTypeName)
              .createInstance(instanceTypeName, data, httpRequest);
        }
      }
    }

    if (actionable == null) {
      return Mono.empty();
    }
    if (actionable instanceof RouteLink) {
      if (emptyIfRoute) {
        return Mono.empty();
      }
      return findRouteResolverFn.apply(command.withConsumedRoute(route));
    }
    if (actionable instanceof ContentLink contentLink) {
      return Mono.just(contentLink.componentSupplier().component(httpRequest));
    }
    if (actionable instanceof FieldLink fieldLink) {
      setResolvedRoute(httpRequest, route);
      return instanceFactoryProvider
          .get(fieldLink.serverSideType())
          .createInstance(fieldLink.serverSideType(), data, httpRequest)
          .flatMap(
              object -> {
                var field = getFieldByName(object.getClass(), fieldLink.fieldName());
                return Mono.just(getValueOrNewInstance(beanProvider, field, object));
              })
          .map(
              object -> {
                if (object instanceof Runnable runnable) {
                  runnable.run();
                  return "Done";
                }
                if (object instanceof Supplier<?> supplier) {
                  return supplier.get();
                }
                if (object instanceof Callable<?> callable) {
                  try {
                    return callable.call();
                  } catch (Exception e) {
                    throw new RuntimeException(e);
                  }
                }
                if (object instanceof Function function) {
                  try {
                    return function.apply(httpRequest);
                  } catch (Exception e) {
                    throw new RuntimeException(e);
                  }
                }
                return object;
              })
          .map(
              object -> {
                if (object instanceof PostHydrationHandler postHydrationHandler) {
                  postHydrationHandler.onHydrated(httpRequest);
                }
                return object;
              });
    }
    if (actionable instanceof MethodLink methodLink) {
      setResolvedRoute(httpRequest, route);
      return instanceFactoryProvider
          .get(methodLink.serverSideType())
          .createInstance(methodLink.serverSideType(), data, httpRequest)
          .flatMap(
              object -> {
                var method = getMethod(object.getClass(), methodLink.methodName());
                return Mono.fromCallable(() -> invoke(method, object));
              })
          .map(
              object -> {
                if (object instanceof PostHydrationHandler postHydrationHandler) {
                  postHydrationHandler.onHydrated(httpRequest);
                }
                return object;
              });
    }
    if (actionable instanceof Menu) {
      return Mono.just(new Text("Es un menu"));
    }

    return Mono.empty();
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

    var resolvedRoute =
        httpRequest.getAttribute("resolvedRoute") != null
            ? (String) httpRequest.getAttribute("resolvedRoute")
            : app.route();

    var cleanRoute = command.route();
    if (command.route().startsWith(command.consumedRoute())) {
      cleanRoute = command.route().substring(command.consumedRoute().length());
    }
    var actionable =
        resolveMenu(
            resolvedRoute,
            app.menu(),
            cleanRoute,
            ("_empty".equals(command.consumedRoute()) ? app.route() : "") + command.route(),
            httpRequest);

    if (actionable instanceof RemoteMenu remoteMenu) {
      return remoteMenuHandler.handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    return Mono.just(potentialApp);
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
