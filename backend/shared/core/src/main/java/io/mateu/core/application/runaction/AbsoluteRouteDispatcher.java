package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;

import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
final class AbsoluteRouteDispatcher {

  static Mono<?> tryResolve(
      List<RouteResolver> routeResolvers,
      String route,
      String resolvedRoute,
      Object instance,
      Map<String, Object> data,
      InstanceFactoryProvider instanceFactoryProvider,
      HttpRequest httpRequest) {
    if (routeResolvers == null) {
      return null;
    }
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
    return null;
  }

  private AbsoluteRouteDispatcher() {}
}
