package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RouteSegmentUtils.addParameterValues;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedPath;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.infra.reflection.ClassLoaders.forName;
import static io.mateu.core.infra.reflection.ReflectionUiIncrementMapper.removeQueryParamsFromRoute;

import io.mateu.core.application.ResolvedRoute;
import io.mateu.core.application.RoutedClassResolver;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
final class DirectClassResolver {

  static Mono<?> resolve(
      String rawRoute,
      RunActionCommand command,
      RoutedClassResolver routedClassResolver,
      InstanceFactoryProvider instanceFactoryProvider,
      List<RouteResolver> routeResolvers) {
    // A missing class (forName → ClassNotFoundException) or a failing RouteResolver becomes a
    // reactive error signal, so it surfaces as itself instead of the NoClassDefFoundError:
    // lombok/Lombok that @SneakyThrows produced when lombok is off the runtime classpath.
    try {
      return resolveInner(
          rawRoute, command, routedClassResolver, instanceFactoryProvider, routeResolvers);
    } catch (Exception e) {
      return Mono.error(e);
    }
  }

  private static Mono<?> resolveInner(
      String rawRoute,
      RunActionCommand command,
      RoutedClassResolver routedClassResolver,
      InstanceFactoryProvider instanceFactoryProvider,
      List<RouteResolver> routeResolvers)
      throws ClassNotFoundException {
    if ("".equals(rawRoute)) {
      rawRoute = command.baseUrl();
    }
    var route = removeQueryParamsFromRoute(rawRoute);

    // Exact @Route annotation match
    var routedClass = routedClassResolver.resolveAbsolute(route, command);
    if (routedClass.isPresent()) {
      var instanceTypeName = routedClass.get().resolvedClass().getName();
      if (!isApp(forName(instanceTypeName), route)) {
        setResolvedRoute(command.httpRequest(), route);
        setResolvedPath(command.httpRequest(), route);
        log.debug("direct class (absolute) {} → {}", route, instanceTypeName);
        return createInstance(
            command, instanceTypeName, instanceFactoryProvider, route, routedClass);
      }
    }

    // Generic resolve restricted to non-app classes
    routedClass = routedClassResolver.resolve(route, command);
    if (routedClass.isPresent()) {
      var instanceTypeName = routedClass.get().resolvedClass().getName();
      if (!isApp(forName(instanceTypeName), route)) {
        setResolvedRoute(command.httpRequest(), route);
        setResolvedPath(command.httpRequest(), route);
        log.debug("direct class (resolve) {} → {}", route, instanceTypeName);
        return createInstance(
            command, instanceTypeName, instanceFactoryProvider, route, routedClass);
      }
    }

    // Global RouteResolvers (the pre-compiled mount resolvers of the WebFlux/Quarkus/Helidon APs).
    // Their patterns are the mounts' ABSOLUTE paths (/e2-demo/routed-page), while a route inside a
    // mount is RELATIVE to it (/routed-page sent to the /e2-demo controller): try the route as it
    // came, then read it under the mount it was sent to — the same composition the annotation
    // matcher applies for the RoutedClassProvider adapters (MVC, Micronaut), so a @UI nested under
    // another @UI's path resolves through either kind of provider.
    if (routeResolvers != null) {
      for (var candidate : candidateRoutes(route, command.baseUrl())) {
        for (var parentRoute : List.of(RouteConstants.NO_PARENT_ROUTE, command.consumedRoute())) {
          var found =
              routeResolvers.stream()
                  .filter(r -> r.supportsRoute(candidate, parentRoute))
                  .findFirst();
          if (found.isPresent()) {
            var resolvedClass =
                found.get().resolveRoute(candidate, parentRoute, command.httpRequest());
            if (resolvedClass != null) {
              setResolvedRoute(command.httpRequest(), route);
              var instanceTypeName = resolvedClass.getName();
              log.debug("direct class (routeResolver) {} → {}", candidate, instanceTypeName);
              return createInstance(
                  command,
                  instanceTypeName,
                  instanceFactoryProvider,
                  candidate,
                  Optional.of(
                      new ResolvedRoute(
                          candidate,
                          found
                              .get()
                              .matchingPattern(candidate, parentRoute)
                              .get()
                              .routeRegex()
                              .pattern(),
                          resolvedClass)));
            }
          }
        }
      }
    }

    log.debug("no direct class matched {}", route);
    return Mono.empty();
  }

  /**
   * The route as it came and, when the request was sent to a non-root mount and the route does not
   * already carry it, the same route under that mount ({@code /routed-page} → {@code
   * /e2-demo/routed-page}).
   */
  static List<String> candidateRoutes(String route, String baseUrl) {
    if (route == null
        || baseUrl == null
        || baseUrl.contains("://")
        || !route.startsWith("/")
        || route.startsWith("//")) {
      return List.of(route);
    }
    var mount = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    if (mount.length() <= 1
        || !mount.startsWith("/")
        || route.equals(mount)
        || route.startsWith(mount + "/")) {
      return List.of(route);
    }
    return List.of(route, mount + route);
  }

  private static Mono<Object> createInstance(
      RunActionCommand command,
      String instanceTypeName,
      InstanceFactoryProvider instanceFactoryProvider,
      String route,
      Optional<ResolvedRoute> routedClass) {
    return (Mono<Object>)
        instanceFactoryProvider
            .get(instanceTypeName)
            .createInstance(
                instanceTypeName,
                addParameterValues(
                    command.componentState(), route, routedClass.get(), command.httpRequest()),
                command.httpRequest());
  }

  private DirectClassResolver() {}
}
