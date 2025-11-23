package io.mateu.core.application.runaction;

import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
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
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.ReactiveRouteHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
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
            // .flatMap(instance -> resolveMenuIfApp(instance, command))
            // here I have the target instance
            .flatMap(instance -> resolveMenuIfApp(command, instance))
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

  private static Mono<?> routeIfNeeded(RunActionCommand command, Object instance) {
    if (instance instanceof RouteHandler handlesRoute) {
      return Mono.just(handlesRoute.handleRoute(command.route(), command.httpRequest()));
    }
    if (instance instanceof ReactiveRouteHandler handlesRoute) {
      return handlesRoute.handleRoute(command.route(), command.httpRequest());
    }
    return Mono.just(instance);
  }

  private Mono<?> resolveMenuIfApp(RunActionCommand command, Object instance) {
    if (instance instanceof App app) {
      return resolveInApp(
          command.route(),
          command.consumedRoute(),
          command.componentState(),
          command.httpRequest(),
          app,
          command.baseUrl(),
          command.initiatorComponentId());
    }
    if (instance instanceof AppSupplier appSupplier) {
      var app =
          appSupplier
              .getApp(command.httpRequest())
              .withServerSideType(instance.getClass().getName());
      return resolveInApp(
          command.route(),
          command.consumedRoute(),
          command.componentState(),
          command.httpRequest(),
          app,
          command.baseUrl(),
          command.initiatorComponentId());
    }
    if (isApp(instance, command.route())) {
      var app =
          mapToAppComponent(
              instance,
              command.baseUrl(),
              command.route(),
              command.initiatorComponentId(),
              command.httpRequest());
      return resolveInApp(
          command.route(),
          command.consumedRoute(),
          command.componentState(),
          command.httpRequest(),
          app,
          command.baseUrl(),
          command.initiatorComponentId());
    }
    return Mono.just(instance);
  }

  public static Actionable resolveMenu(List<Actionable> actionables, String route) {
    if ("/_page".equals(route) || "".equals(route)) {
      return null;
    }
    String searchableRoute = route;
    while (!searchableRoute.isEmpty()) {
      for (Actionable actionable : actionables) {
        if (searchableRoute.equals(actionable.path())) {
          return actionable;
        }
        if (actionable instanceof Menu menu) {
          var found = resolveMenu(menu.submenu(), searchableRoute);
          if (found != null) {
            return found;
          }
        }
      }
      searchableRoute =
          searchableRoute.contains("/")
              ? searchableRoute.substring(0, searchableRoute.lastIndexOf("/"))
              : "";
    }
    return null;
  }

  private Mono<?> createInstance(RunActionCommand command) {
    // si className --> ok
    if (command.serverSiteType() != null && !command.serverSiteType().isEmpty()) {
      return createInstance(command.serverSiteType(), command);
    }
    // si apClassName
    if (command.appServerSideType() != null && !command.appServerSideType().isEmpty()) {
      // si hay una ruta --> esa clase
      Mono<?> instanceCreationPipe = resolveRoute(command, false);
      if (instanceCreationPipe != null) return instanceCreationPipe;
      // si no --> la app
      return createInstance(command.appServerSideType(), command);
    }
    // si hay una ruta que lleve a una app --> esa clase
    Mono<?> instanceCreationPipe = resolveRoute(command, true);
    if (instanceCreationPipe != null) return instanceCreationPipe;
    // si hay una ruta --> esa clase
    instanceCreationPipe = resolveRoute(command, false);
    if (instanceCreationPipe != null) return instanceCreationPipe;
    // --> ui
    return createInstance(command.uiId(), command);
  }

  @SneakyThrows
  private Mono<?> resolveRoute(RunActionCommand command, boolean appsOnly) {
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .sorted(Comparator.comparingInt(a -> a.weight(command.route())))
            .toList()) {
      if (resolver.supportsRoute(command.route())
          && ("".equals(command.consumedRoute())
              || ("/".equals(command.consumedRoute())
                  && !""
                      .equals(
                          resolver
                              .matchingPattern(command.route())
                              .get()
                              .pattern()
                              .replaceAll("\\.\\*", "")))
              || command.consumedRoute().length()
                  < resolver
                      .matchingPattern(command.route())
                      .get()
                      .pattern()
                      .replaceAll("\\.\\*", "")
                      .length())
      // || !resolver.supportsRoute(command.consumedRoute()))
      ) {
        var instanceTypeName =
            resolver.resolveRoute(command.route(), command.httpRequest()).getName();
        if (command.appServerSideType() != null
            && !command.appServerSideType().isEmpty()
            && command.appServerSideType().equals(instanceTypeName)) {
          continue;
        }
        var type = Class.forName(instanceTypeName);
        if (resolver.getClass().getSimpleName().endsWith("UIRouteResolver")) {
          if (!type.getAnnotation(MateuUI.class).value().equals(command.baseUrl())) {
            continue;
          }
        }
        var ok = !appsOnly;
        if (appsOnly) {
          if (App.class.isAssignableFrom(type)
              || AppSupplier.class.isAssignableFrom(type)
              || getAllFields(type).stream()
                  .anyMatch(
                      field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class))) {
            ok = true;
          }
        }
        if (ok) {
          var instanceFactory = instanceFactoryProvider.get(instanceTypeName);
          return createInstance(
              instanceTypeName,
              instanceFactory,
              command.baseUrl(),
              command.route(),
              command.initiatorComponentId(),
              command.consumedRoute(),
              command.componentState(),
              command.httpRequest());
        }
      }
    }
    return null;
  }

  private Mono<?> createInstance(String className, RunActionCommand command) {
    var instanceFactory = instanceFactoryProvider.get(className);
    return createInstance(
        className,
        instanceFactory,
        command.baseUrl(),
        command.route(),
        command.initiatorComponentId(),
        command.consumedRoute(),
        command.componentState(),
        command.httpRequest());
  }

  private Mono<?> createInstance(
      String instanceTypeName,
      InstanceFactory instanceFactory,
      String baseUrl,
      String route,
      String initiatorComponentId,
      String consumedRoute,
      Map<String, Object> data,
      HttpRequest httpRequest) {
    return instanceFactory.createInstance(instanceTypeName, data, httpRequest);
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
                      || (resolved.isAnnotationPresent(MateuUI.class)
                          && resolved.getAnnotation(MateuUI.class).value().equals(baseUrl));
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
    if ("".equals(command.route())) {
      return command.uiId();
    }
    if ("/_page".equals(command.route())) {
      if (command.appServerSideType() != null && !command.appServerSideType().isEmpty()) {
        return command.appServerSideType();
      }
    }
    var fromRoute =
        getInstanceNameUsingResolvers(
            command.baseUrl(), command.route(), command.consumedRoute(), command.httpRequest());
    if (fromRoute == null && ("".equals(command.route()) || "/_page".equals(command.route()))) {
      return command.uiId();
    }
    return fromRoute;
  }

  public Mono<?> resolveInApp(
      String route,
      String consumedRoute,
      Map<String, Object> data,
      HttpRequest httpRequest,
      Object potentialApp,
      String baseUrl,
      String initialComponentId) {
    if ("".equals(consumedRoute)) {
      return Mono.just(potentialApp);
    }
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
      if (actionable == null) {
        if (!consumedRoute.equals(route)) {
          return Mono.just(app.withRoute(route));
        }
        return Mono.empty();
      }
      if (actionable instanceof RouteLink routeLink) {
        if (route.equals(consumedRoute)) {
          return Mono.empty();
        }
        return Mono.just(app.withRoute(route).withHomeRoute(routeLink.route()));
      }
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
                })
            .map(
                object -> {
                  if (object instanceof PostHydrationHandler postHydrationHandler) {
                    postHydrationHandler.onHydrated(httpRequest);
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
}
