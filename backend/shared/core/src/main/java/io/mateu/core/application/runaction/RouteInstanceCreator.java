package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RouteSegmentUtils.addParameterValues;
import static io.mateu.core.application.runaction.RouteSegmentUtils.createRoutes;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.infra.reflection.ClassLoaders.forName;
import static io.mateu.core.infra.reflection.ReflectionUiIncrementMapper.removeQueryParamsFromRoute;

import io.mateu.core.application.ResolvedRoute;
import io.mateu.core.application.RoutedClassResolver;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
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
  public Mono<?> findRouteResolver(RunActionCommand command) {
    List<String> segments = createRoutes(command);
    log.debug("findRouteResolver segments={}", segments);
    log.debug(
        "route: {}, consumedRoute: {}, serverSideType: {}",
        command.route(),
        command.consumedRoute(),
        command.serverSideType());
    // Shortest-first: Apps / RouteResolvers (they need the shortest matching prefix)
    return Mono.defer(
            () ->
                Flux.fromIterable(segments).concatMap(route -> resolveAsApp(route, command)).next())
        // Longest-first: terminal direct classes (most-specific match wins) — unless routes.yaml
        // authors the route itself as a definition-only page: then no class answers for it, and a
        // shorter prefix's class (the root @UI("") view) must not either, or it hijacked the page.
        .switchIfEmpty(
            (Mono)
                Mono.defer(
                    () ->
                        command.route() != null
                                && routedClassResolver.authoredWithoutClass(
                                    removeQueryParamsFromRoute(command.route()))
                            ? Mono.empty()
                            : Flux.fromIterable(segments.reversed())
                                .concatMap(route -> resolveAsDirectClass(route, command))
                                .next()));
  }

  /**
   * Only the App half of {@link #findRouteResolver}: the enclosing app (shortest-first) that wraps
   * a route in its chrome, and nothing else. For a route the registry authors as a definition-only
   * page: a non-app class at a SHORTER prefix (a plain {@code @UI("")} root view) must not answer
   * it the way it answers routes it owns — the page is the definition.
   */
  public Mono<?> findApp(RunActionCommand command) {
    List<String> segments = createRoutes(command);
    return Mono.defer(
        () -> Flux.fromIterable(segments).concatMap(route -> resolveAsApp(route, command)).next());
  }

  /**
   * The class of the root mount ({@code @UI("")}): through the routed-class providers (the MVC and
   * Micronaut processors), else through the pre-compiled mount resolvers (WebFlux, Quarkus,
   * Helidon), which the providers do not know about. Null when there is no root class.
   */
  public Class<?> rootClass(RunActionCommand command) {
    var viaProviders = routedClassResolver.resolve("", command).orElse(null);
    if (viaProviders != null && viaProviders.resolvedClass() != null) {
      return viaProviders.resolvedClass();
    }
    if (routeResolvers != null) {
      for (var candidate : List.of("", "/")) {
        for (var resolver : routeResolvers) {
          if (resolver.supportsRoute(candidate, io.mateu.uidl.RouteConstants.NO_PARENT_ROUTE)) {
            var resolved =
                resolver.resolveRoute(
                    candidate, io.mateu.uidl.RouteConstants.NO_PARENT_ROUTE, command.httpRequest());
            if (resolved != null) {
              return resolved;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Resolves a route segment to an App / RouteResolver class (shortest-first favoured by {@link
   * #findRouteResolver}). Returns the instantiated app after remote-menu resolution so the UI can
   * use it as the next serverSideType.
   */
  private Mono<?> resolveAsApp(String rawRoute, RunActionCommand command) {
    // A missing class (forName → ClassNotFoundException) becomes a reactive error signal, so it
    // surfaces as itself instead of the NoClassDefFoundError: lombok/Lombok that @SneakyThrows
    // produced when lombok is off the runtime classpath.
    try {
      return resolveAsAppInner(rawRoute, command);
    } catch (Exception e) {
      return Mono.error(e);
    }
  }

  private Mono<?> resolveAsAppInner(String rawRoute, RunActionCommand command)
      throws ClassNotFoundException {
    var route = removeQueryParamsFromRoute(rawRoute);
    var routedClass = routedClassResolver.resolve(route, command);
    if (routedClass.isPresent()) {
      var instanceTypeName = routedClass.get().resolvedClass().getName();
      if (isApp(forName(instanceTypeName), route)) {
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
                            ? appSupplier
                                .getApp(command.httpRequest())
                                .withServerSideType(instanceTypeName)
                            : app);
        log.debug("app {} → {}", route, instanceTypeName);
        return instance.flatMap(
            app -> appMenuResolver.resolveRemoteMenuForRoute(command, app, command.httpRequest()));
      }
    }
    log.debug("no app matches {}", route);
    return Mono.empty();
  }

  private Mono<?> resolveAsDirectClass(String rawRoute, RunActionCommand command) {
    return DirectClassResolver.resolve(
        rawRoute, command, routedClassResolver, instanceFactoryProvider, routeResolvers);
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
}
