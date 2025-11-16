package io.mateu.core.application.runaction;

import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.FileNotFoundException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;
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

  private final BeanProvider beanProvider;
  private final InstanceFactoryProvider instanceFactoryProvider;
  private final ActionRunnerProvider actionRunnerProvider;
  private final UiIncrementMapperProvider uiIncrementMapperProvider;

  public Flux<UIIncrementDto> handle(RunActionCommand command) {
    log.info("run action {} for {}", command.actionId(), command);
    // todo: use path somehow
    return (Mono.just(command)
            // get the target instance
            .flatMap(ignored -> createInstance(command))
            // if the target instance is an app, resolve the menu to get the real target instance
            //            .flatMap(instance -> resolveMenuIfApp(instance, command))
            // here I have the target instance
            .flatMapMany(
                instance ->
                    actionRunnerProvider
                        .get(
                            instance,
                            command.actionId(),
                            command.consumedRoute(),
                            command.route(),
                            command.httpRequest())
                        .run(
                            instance,
                            command.actionId(),
                            command.componentState(),
                            command.httpRequest())))
        // here I have the result / object to be mapped
        .flatMap(
            result ->
                uiIncrementMapperProvider
                    .get(result)
                    .map(
                        result,
                        command.baseUrl(),
                        command.route(),
                        command.initiatorComponentId(),
                        command.httpRequest()))
        // in case I was not able to find a target instance
        .doOnError(error -> error.printStackTrace())
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
                                command.initiatorComponentId(),
                                command.httpRequest())));
  }

  @SneakyThrows
  private Mono<?> resolveMenuIfApp(Object instance, RunActionCommand command) {
    var app = getApp(instance, command);
    if (app != null) {
      Actionable actionable = resolveMenu(app.menu(), command.route());
      if (actionable instanceof ContentLink contentLink) {
        return Mono.just(contentLink.componentSupplier().component(command.httpRequest()));
      }
      var appRoute = getRoute(instance, app, command.httpRequest(), command.route());
      if (appRoute.equals(command.consumedRoute())) {
        throw new FileNotFoundException(
            "No route found for " + command.route() + " in " + app.getClass().getSimpleName());
      }
    }
    return Mono.just(instance);
  }

  private App getApp(Object instance, RunActionCommand command) {
    if (instance instanceof AppSupplier appSupplier) {
      var appRoute = getRoute(instance, instance, command.httpRequest(), command.route());
      return appSupplier.getApp(command.httpRequest()).withRoute(appRoute);
    }
    if (instance instanceof App app) { // componente
      return app;
    }
    if (instance instanceof io.mateu.uidl.interfaces.App app) { // componente
      return mapToAppComponent(
          app,
          command.baseUrl(),
          command.route(),
          command.initiatorComponentId(),
          command.httpRequest());
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
      return createInstance(
          instanceTypeName,
          instanceFactory,
          command.route(),
          command.consumedRoute(),
          command.componentState(),
          command.httpRequest());
    }
    return tryWithApp(
        command.uiId(),
        command.route(),
        command.baseUrl(),
        command.initiatorComponentId(),
        command.componentState(),
        command.httpRequest());
  }

  private Mono<?> createInstance(
      String instanceTypeName,
      InstanceFactory instanceFactory,
      String route,
      String consumedRoute,
      Map<String, Object> data,
      HttpRequest httpRequest) {
    return instanceFactory
        .createInstance(instanceTypeName, data, httpRequest)
        .flatMap(
            instance -> {
              if (instance instanceof RouteHandler handlesRoute) {
                return handlesRoute.handleRoute(route, httpRequest);
              }
              return Mono.just(instance);
            })
        .map(
            instance -> {
              if (instance instanceof AppSupplier appSupplier) {
                if (!"/_page".equals(route)) {
                  var appRoute = getRoute(instance, instance, httpRequest, route);
                  return appSupplier.getApp(httpRequest).withRoute(appRoute);
                }
              }
              return instance;
            });
  }

  private Mono<?> tryWithApp(
      String uiId,
      String route,
      String baseUrl,
      String initiatorComponentId,
      Map<String, Object> data,
      HttpRequest httpRequest) {
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
              .map(
                  instance -> {
                    if (instance instanceof AppSupplier appSupplier) {
                      var appRoute = getRoute(instance, instance, httpRequest, route);
                      return appSupplier.getApp(httpRequest).withRoute(appRoute);
                    }
                    if (instance instanceof io.mateu.uidl.interfaces.App app) {
                      var appRoute = getMinimalAppRoute(resolver, route);
                      return mapToAppComponent(
                          app, baseUrl, appRoute, initiatorComponentId, httpRequest);
                    }
                    return instance;
                  })
              .filter(instance -> instance instanceof App)
              .flatMap(
                  app ->
                      resolveInApp(route, data, httpRequest, app, baseUrl, initiatorComponentId));
        }
      }
    }
    return instanceFactoryProvider
        .get(uiId)
        .createInstance(uiId, data, httpRequest)
        .flatMap(app -> resolveInApp(route, data, httpRequest, app, baseUrl, initiatorComponentId));
  }

  private Mono<?> resolveInApp(
      String route,
      Map<String, Object> data,
      HttpRequest httpRequest,
      Object potentialApp,
      String baseUrl,
      String initialComponentId) {
    App app = null;
    if (potentialApp instanceof App) {
      app = (App) potentialApp;
    } else {
      app =
          mapToAppComponent(
              potentialApp, baseUrl, getAppRoute(potentialApp), initialComponentId, httpRequest);
    }

    if (app != null) {
      var actionable = resolveMenu(app.menu(), route);
      if (actionable instanceof ContentLink contentLink) {
        return Mono.just(contentLink.componentSupplier().component(httpRequest));
      }
      if (actionable instanceof FieldLink fieldLink) {
        return instanceFactoryProvider
            .get(fieldLink.serverSideType())
            .createInstance(fieldLink.serverSideType(), data, httpRequest)
            .flatMap(
                instance -> {
                  var field = getFieldByName(instance.getClass(), fieldLink.fieldName());
                  return Mono.just(getValueOrNewInstance(beanProvider, field, instance));
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
                });
      }
      if (actionable instanceof Menu menu) {
        return Mono.just(new Text("Es un menu"));
      }
    }
    return Mono.empty();
  }

  private String getAppRoute(Object potentialApp) {
    if (potentialApp.getClass().isAnnotationPresent(MateuUI.class)) {
      return potentialApp.getClass().getAnnotation(MateuUI.class).value();
    }
    if (potentialApp.getClass().isAnnotationPresent(Route.class)) {
      return potentialApp.getClass().getAnnotation(Route.class).value();
    }
    return "";
  }

  public static String getMinimalAppRoute(RouteResolver appRouteResolver, String route) {
    var minimalRoute = route;
    var nextRoute = minimalRoute;
    while (!nextRoute.isEmpty() && appRouteResolver.supportsRoute(nextRoute)) {
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
      String baseUrl, String route, String consumedRoute, HttpRequest httpRequest) {
    var cleanRoute = "/_page".equals(route) ? "" : route;
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .sorted(Comparator.comparingInt(a -> a.weight(cleanRoute)))
            .filter(routeResolver -> routeResolver.supportsRoute(cleanRoute))
            .filter(
                resolver -> {
                  var resolved = resolver.resolveRoute(cleanRoute, httpRequest);
                  return AppSupplier.class.isAssignableFrom(resolved)
                      || App.class.isAssignableFrom(resolved)
                      || io.mateu.uidl.interfaces.App.class.isAssignableFrom(resolved)
                      || (resolved.isAnnotationPresent(MateuUI.class) && resolved.getAnnotation(MateuUI.class).value().equals(baseUrl));
                })
            .toList()) {
      if (resolver.supportsRoute(route)
          && ("".equals(consumedRoute) || !resolver.supportsRoute(consumedRoute))) {
        return resolver.resolveRoute(route, httpRequest).getName();
      }
    }
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .filter(routeResolver -> routeResolver.supportsRoute(cleanRoute))
            .filter(
                resolver -> {
                  var resolved = resolver.resolveRoute(cleanRoute, httpRequest);
                  return !(AppSupplier.class.isAssignableFrom(resolved)
                      || App.class.isAssignableFrom(resolved)
                      || io.mateu.uidl.interfaces.App.class.isAssignableFrom(resolved)
                      || resolved.isAnnotationPresent(MateuUI.class));
                })
            .sorted(Comparator.comparingInt(a -> a.weight(cleanRoute)))
            .toList()
            .reversed()) {
      if (resolver.supportsRoute(route)
          && ("".equals(consumedRoute) || !resolver.supportsRoute(consumedRoute))) {
        return resolver.resolveRoute(route, httpRequest).getName();
      }
    }
    return null;
  }

  private String getInstanceTypeName(RunActionCommand command) {
    if (command.serverSiteType() != null && !command.serverSiteType().isEmpty()) {
      return command.serverSiteType();
    }
    var fromRoute =
        getInstanceNameUsingResolvers(
            command.baseUrl(), command.route(), command.consumedRoute(), command.httpRequest());
    if (fromRoute == null && ("".equals(command.route()) || "/_page".equals(command.route()))) {
      return command.uiId();
    }
    return fromRoute;
  }
}
