package io.mateu.core.application.runaction;

import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;

import io.mateu.core.domain.ActionRunnerProvider;
import io.mateu.core.domain.BeanProvider;
import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.UiIncrementMapperProvider;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@RequiredArgsConstructor
public class RunActionUseCase {

  private final BeanProvider beanProvider;
  private final InstanceFactoryProvider instanceFactoryProvider;
  private final ActionRunnerProvider actionRunnerProvider;
  private final UiIncrementMapperProvider uiIncrementMapperProvider;

  public Mono<UIIncrementDto> handle(RunActionCommand command) {
    log.info("run action for {}", command);
    // todo: use path somehow
    return Mono.just(command)
        .flatMap(ignored -> createInstance(command))
        .flatMap(instance -> resolveMenuIfApp(instance, command))
        .flatMap(
            instance ->
                actionRunnerProvider
                    .get(
                        instance,
                        command.actionId(),
                        command.consumedRoute(),
                        command.route(),
                        command.httpRequest())
                    .run(instance, command.actionId(), command.data(), command.httpRequest()))
        .flatMap(
            result ->
                uiIncrementMapperProvider
                    .get(result)
                    .map(
                        result,
                        command.baseUrl(),
                        command.route(),
                        command.initiatorComponentId(),
                        command.httpRequest()));
  }

  @SneakyThrows
  private Mono<?> resolveMenuIfApp(Object instance, RunActionCommand command) {
    var app = getApp(instance, command);
    if (app != null) {
      Actionable actionable = resolveMenu(app.menu(), command.route());
      if (actionable instanceof ContentLink contentLink) {
        return Mono.just(contentLink.componentSupplier().getComponent(command.httpRequest()));
      }
      var appRoute = getRoute(instance, app, command.httpRequest(), command.route());
      if (appRoute.equals(command.consumedRoute())) {
        throw new NoSuchMethodException(
            "No route found for " + command.route() + " in " + app + " for " + command);
      }
    }
    return Mono.just(instance);
  }

  private App getApp(Object instance, RunActionCommand command) {
    if (instance instanceof AppSupplier appSupplier) {
      return appSupplier.getApp(command.httpRequest());
    }
    if (instance instanceof App app) {
      return app;
    }
    return null;
  }

  private Actionable resolveMenu(List<Actionable> actionables, String route) {
    for (Actionable actionable : actionables) {
      if (route.equals(actionable.path())) {
        return actionable;
      }
      if (actionable instanceof Menu menu) {
        var found = resolveMenu(menu.submenu(), route);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private Mono<?> createInstance(RunActionCommand command) {
    // si command.componentType entonces prevalece
    // si hay una ruta, entonces la utilizamos
    // si hay una app, entonces miramos si tiene una opciónd e menu que coincide
    var instanceTypeName = getInstanceTypeName(command);
    if (instanceTypeName != null) {
      var instanceFactory = instanceFactoryProvider.get(instanceTypeName);
      return resolveRoute(
          instanceTypeName,
          instanceFactory,
          command.route(),
          command.consumedRoute(),
          command.data(),
          command.httpRequest());
    }
    return tryWithApp(command.route(), command.data(), command.httpRequest());
  }

  private Mono<?> resolveRoute(
      String instanceTypeName,
      InstanceFactory instanceFactory,
      String route,
      String consumedRoute,
      Map<String, Object> data,
      HttpRequest httpRequest) {
    return instanceFactory
        .createInstance(
            getInstanceNameUsingResolvers(instanceTypeName, route, consumedRoute, httpRequest),
            data,
            httpRequest)
        .flatMap(
            instance -> {
              if (instance instanceof HandlesRoute handlesRoute) {
                return handlesRoute.handleRoute(route, httpRequest);
              }
              return Mono.just(instance);
            });
  }

  private Mono<?> tryWithApp(String route, Map<String, Object> data, HttpRequest httpRequest) {
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .sorted(Comparator.comparingInt(a -> a.weight(route)))
            .toList()) {
      if (resolver.supportsRoute(route)) {
        var instanceTypeName = resolver.resolveRoute(route, httpRequest).getName();
        if (instanceTypeName != null) {
          var instanceFactory = instanceFactoryProvider.get(instanceTypeName);
          return instanceFactory
              .createInstance(instanceTypeName, data, httpRequest)
              .flatMap(
                  instance -> {
                    if (instance instanceof AppSupplier appSupplier) {
                      var appRoute = getMinimalAppRoute(resolver, route);
                      var app = appSupplier.getApp(httpRequest);
                      for (Actionable actionable : app.menu()) {
                        if (getPathInApp(appRoute, actionable).equals(route)) {
                          if (actionable instanceof ContentLink contentLink) {
                            return Mono.just(
                                contentLink.componentSupplier().getComponent(httpRequest));
                          }
                          if (actionable instanceof Menu menu) {
                            return Mono.just(new Text("Es un menu"));
                          }
                        }
                      }
                    }
                    return Mono.empty();
                  });
        }
      }
    }
    return Mono.empty();
  }

  private String getMinimalAppRoute(RouteResolver resolver, String route) {
    var minimalRoute = route;
    var nextRoute = minimalRoute;
    while (!nextRoute.isEmpty() && resolver.supportsRoute(nextRoute)) {
      minimalRoute = nextRoute;
      nextRoute = nextRoute.contains("/") ? nextRoute.substring(0, nextRoute.lastIndexOf("/")) : "";
    }
    return minimalRoute;
  }

  private static String getPathInApp(String appRoute, Actionable option) {
    if (option.path() == null) {
      return appRoute + "/" + camelcasize(option.label());
    }
    return option.path();
  }

  private String getInstanceNameUsingResolvers(
      String instanceTypeName, String route, String consumedRoute, HttpRequest httpRequest) {
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .sorted(Comparator.comparingInt(a -> a.weight(route)))
            .toList()) {
      if (resolver.supportsRoute(route) && !resolver.supportsRoute(consumedRoute)) {
        return resolver.resolveRoute(route, httpRequest).getName();
      }
    }
    return instanceTypeName;
  }

  private String getInstanceTypeName(RunActionCommand command) {
    if (command.componentType() != null && !command.componentType().isEmpty()) {
      return command.componentType();
    }
    var routeResolverBeans = beanProvider.getBeans(RouteResolver.class);
    for (RouteResolver bean :
        routeResolverBeans.stream()
            .filter(
                resolver ->
                    resolver.supportsRoute(command.route())
                        && !resolver.supportsRoute(command.consumedRoute()))
            .sorted(Comparator.comparingInt(a -> a.weight(command.route())))
            .toList()) {
      return bean.resolveRoute(command.route(), command.httpRequest()).getName();
    }
    for (RouteResolver bean :
        routeResolverBeans.stream()
            .filter(resolver -> resolver.supportsRoute(command.route()))
            .sorted(Comparator.comparingInt(a -> a.weight(command.route())))
            .toList()) {
      return bean.resolveRoute(command.route(), command.httpRequest()).getName();
    }
    return command.uiId();
  }
}
