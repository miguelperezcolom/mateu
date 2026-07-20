package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RouteSegmentUtils.addParameterValues;
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
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
final class DirectClassResolver {

  @SneakyThrows
  static Mono<?> resolve(
      String rawRoute,
      RunActionCommand command,
      RoutedClassResolver routedClassResolver,
      InstanceFactoryProvider instanceFactoryProvider,
      List<RouteResolver> routeResolvers) {
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
        log.info("direct class (absolute) {} → {}", route, instanceTypeName);
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
        log.info("direct class (resolve) {} → {}", route, instanceTypeName);
        return createInstance(
            command, instanceTypeName, instanceFactoryProvider, route, routedClass);
      }
    }

    // Global RouteResolvers
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
                instanceFactoryProvider,
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
