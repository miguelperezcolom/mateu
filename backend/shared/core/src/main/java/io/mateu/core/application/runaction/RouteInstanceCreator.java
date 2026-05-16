package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.mappers.ReflectionUiIncrementMapper.removeQueryParamsFromRoute;

import io.mateu.core.application.ResolvedRoute;
import io.mateu.core.application.RoutedClassResolver;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/** Resolves a route to a concrete instance by scanning route segments. */
@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class RouteInstanceCreator {

  private final RoutedClassResolver routedClassResolver;
  private final InstanceFactoryProvider instanceFactoryProvider;
  private final List<RouteResolver> routeResolvers;
  private final AppMenuResolver appMenuResolver;

  /**
   * Path 1: no serverSideType yet. Search route segments for a matching App/RouteResolver
   * (shortest-first so the broadest enclosing app wins), then fall back to direct class matches
   * (longest-first so the most-specific route wins).
   */
  @SneakyThrows
  public Mono<?> findRouteResolver(RunActionCommand command) {
    List<String> segments = createRoutes(command);
    log.info("findRouteResolver segments={}", segments);
    log.info(
        "route: {}, consumedRoute: {}, serverSideType: {}",
        command.route(),
        command.consumedRoute(),
        command.serverSideType());
    // Shortest-first: Apps / RouteResolvers (they need the shortest matching prefix)
    return Mono.defer(
            () ->
                Flux.fromIterable(segments).concatMap(route -> resolveAsApp(route, command)).next())
        // Longest-first: terminal direct classes (most-specific match wins)
        .switchIfEmpty(
            (Mono)
                Mono.defer(
                    () ->
                        Flux.fromIterable(segments.reversed())
                            .concatMap(route -> resolveAsDirectClass(route, command))
                            .next()));
  }

  /**
   * Resolves a route segment to an App / RouteResolver class (shortest-first favoured by {@link
   * #findRouteResolver}). Returns the instantiated app after remote-menu resolution so the UI can
   * use it as the next serverSideType.
   */
  @SneakyThrows
  private Mono<?> resolveAsApp(String rawRoute, RunActionCommand command) {
    var route = removeQueryParamsFromRoute(rawRoute);
    var routedClass = routedClassResolver.resolve(route, command);
    if (routedClass.isPresent()) {
      var instanceTypeName = routedClass.get().resolvedClass().getName();
      if (isApp(Class.forName(instanceTypeName), route)) {
        setResolvedRoute(command.httpRequest(), route);
        var instance =
            createInstance(
                    command,
                    instanceTypeName,
                    instanceFactoryProvider.get(instanceTypeName),
                    route,
                    routedClass)
                .doOnNext(app -> command.httpRequest().setAttribute("resolvedApp", app))
                .map(
                    app ->
                        (app instanceof AppSupplier appSupplier)
                            ? appSupplier.getApp(command.httpRequest())
                            : app);
        log.info("app {} → {}", route, instanceTypeName);
        return instance.flatMap(
            app -> appMenuResolver.resolveRemoteMenuForRoute(command, app, command.httpRequest()));
      }
    }
    log.info("no app matches {}", route);
    return Mono.empty();
  }

  /**
   * Resolves a route segment to a non-app (terminal) class. Checks exact @Route matches first, then
   * generic resolve, then global RouteResolvers — all restricted to non-app types.
   */
  @SneakyThrows
  private Mono<?> resolveAsDirectClass(String rawRoute, RunActionCommand command) {
    if ("".equals(rawRoute)) {
      rawRoute = command.baseUrl();
    }
    var route = removeQueryParamsFromRoute(rawRoute);

    // Exact @Route annotation match (no parent context needed)
    var routedClass = routedClassResolver.resolveAbsolute(route, command);
    if (routedClass.isPresent()) {
      var instanceTypeName = routedClass.get().resolvedClass().getName();
      if (!isApp(Class.forName(instanceTypeName), route)) {
        setResolvedRoute(command.httpRequest(), route);
        log.info("direct class (absolute) {} → {}", route, instanceTypeName);
        return createInstance(
            command,
            instanceTypeName,
            instanceFactoryProvider.get(instanceTypeName),
            route,
            routedClass);
      }
    }

    // Generic resolve restricted to non-app classes
    routedClass = routedClassResolver.resolve(route, command);
    if (routedClass.isPresent()) {
      var instanceTypeName = routedClass.get().resolvedClass().getName();
      if (!isApp(Class.forName(instanceTypeName), route)) {
        setResolvedRoute(command.httpRequest(), route);
        log.info("direct class (resolve) {} → {}", route, instanceTypeName);
        return createInstance(
            command,
            instanceTypeName,
            instanceFactoryProvider.get(instanceTypeName),
            route,
            routedClass);
      }
    }

    // Global RouteResolvers — try without parent context first, then with consumedRoute
    if (routeResolvers != null) {
      for (var parentRoute : List.of(RouteConstants.NO_PARENT_ROUTE, command.consumedRoute())) {
        var found =
            routeResolvers.stream().filter(r -> r.supportsRoute(route, parentRoute)).findFirst();
        if (found.isPresent()) {
          var resolvedClass = found.get().resolveRoute(route, parentRoute, command.httpRequest());
          if (resolvedClass != null) {
            setResolvedRoute(command.httpRequest(), route);
            var instanceTypeName = resolvedClass.getName();
            log.info("direct class (routeResolver) {} → {}", route, instanceTypeName);
            return createInstance(
                command,
                instanceTypeName,
                instanceFactoryProvider.get(instanceTypeName),
                route,
                Optional.of(
                    new ResolvedRoute(
                        route,
                        found
                            .get()
                            .matchingPattern(route, parentRoute)
                            .get()
                            .routeRegex()
                            .pattern(),
                        resolvedClass)));
          }
        }
      }
    }

    log.info("no direct class matched {}", route);
    return Mono.empty();
  }

  private Mono<Object> createInstance(
      RunActionCommand command,
      String instanceTypeName,
      io.mateu.core.domain.ports.InstanceFactory instanceFactory,
      String route,
      Optional<ResolvedRoute> routedClass) {
    return (Mono<Object>)
        instanceFactory.createInstance(
            instanceTypeName,
            addParameterValues(
                command.componentState(), route, routedClass.get(), command.httpRequest()),
            command.httpRequest());
  }

  private Map<String, Object> addParameterValues(
      Map<String, Object> data,
      String route,
      ResolvedRoute matchingRoute,
      HttpRequest httpRequest) {
    var newData = new HashMap<>(data != null ? data : Map.of());
    var tokens = matchingRoute.pattern().split("/");
    var slugs = route.split("/");
    for (int i = 0; i < tokens.length && i < slugs.length; i++) {
      var token = tokens[i];
      var slug = slugs[i];
      if (token.startsWith(":")) {
        var fieldName = token.substring(1);
        try {
          if (!newData.containsKey(fieldName)) {
            newData.put(fieldName, slug);
          }
        } catch (Exception ignored) {
        }
      }
    }
    if (httpRequest != null) {
      httpRequest
          .getParameterNames()
          .forEach(
              fieldName -> {
                try {
                  if (!newData.containsKey(fieldName)) {
                    newData.put(fieldName, httpRequest.getParameterValue(fieldName));
                  }
                } catch (Exception ignored) {
                }
              });
    }
    return newData;
  }

  List<String> createRoutes(RunActionCommand command) {
    List<String> routes = new ArrayList<>();
    StringBuilder currentRoute = new StringBuilder();
    var completeRoute = command.route();
    if ("/".equals(completeRoute)) {
      return List.of("");
    }
    for (String token : completeRoute.split("/")) {
      var nextRoute = currentRoute + token;
      if ("_empty".equals(command.consumedRoute())
          || (!nextRoute.isEmpty() && nextRoute.length() >= command.consumedRoute().length())) {
        if (!command.baseUrl().equals(command.consumedRoute()) || !"".equals(nextRoute)) {
          if (!nextRoute.equals(command.consumedRoute())) {
            routes.add(nextRoute);
          }
        }
      }
      currentRoute.append(token).append("/");
    }
    return routes;
  }
}
