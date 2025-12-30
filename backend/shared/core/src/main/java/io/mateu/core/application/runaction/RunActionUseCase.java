package io.mateu.core.application.runaction;

import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.*;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapValidations;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.BaseRoute;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.ReactiveRouteHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.RouteSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.regex.Pattern;
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
            .doOnNext(
                instance ->
                    log.info(
                        "for {}#{}, resolved '{}' to {}",
                        command.route(),
                        command.consumedRoute(),
                        command.httpRequest().getAttribute("resolvedRoute"),
                        instance.getClass().getSimpleName()))
            // if the target instance is an app, resolve the menu to get the real target instance
//            .flatMapMany(instance -> resolveMenuIfApp(command, instance))
            // here I have the target instance
            .flatMap(instance -> routeIfNeeded(command, instance))
            .doOnNext(instance -> updateResolvedRoute(command, instance))
            // .map(instance -> setRouteIfApp(command, instance))
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
        .doOnNext(instance -> updateResolvedRoute(command, instance))
        // here I have the result / object to be mapped
        .flatMap(
            result ->
                uiIncrementMapperProvider
                    .get(result)
                    .map(
                        result,
                        command.baseUrl(),
                        command.route(),
                        command.consumedRoute(),
                        command.initiatorComponentId(),
                        command.httpRequest()))
        // .map(uiIncrement -> setConsumedRoute(uiIncrement, command.route()))
        // in case I was not able to find a target instance
        .doOnError(Throwable::printStackTrace)
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
                                    command.consumedRoute(),
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
                                command.consumedRoute(),
                                command.initiatorComponentId(),
                                command.httpRequest())));
  }

  private void updateResolvedRoute(RunActionCommand command, Object instance) {
    if (instance instanceof RouteSupplier routeSupplier) {
      command.httpRequest().setAttribute("resolvedRoute", routeSupplier.route());
      System.out.println(
          ""
              + instance.getClass().getSimpleName()
              + " --> rq.resolvedRoute: "
              + command.httpRequest().getAttribute("resolvedRoute"));
      return;
    }
    if (instance.getClass().isAnnotationPresent(BaseRoute.class)) {
      command
          .httpRequest()
          .setAttribute(
              "resolvedRoute",
              getLongestMatcher(
                  Pattern.compile(instance.getClass().getAnnotation(BaseRoute.class).value()),
                  command.route()));
      System.out.println(
          ""
              + instance.getClass().getSimpleName()
              + " --> rq.resolvedRoute: "
              + command.httpRequest().getAttribute("resolvedRoute"));
      return;
    }
    if (instance.getClass().isAnnotationPresent(Route.class)) {
      command
          .httpRequest()
          .setAttribute(
              "resolvedRoute",
              getLongestMatcher(
                  Pattern.compile(instance.getClass().getAnnotation(Route.class).value()),
                  command.route()));
      System.out.println(
          ""
              + instance.getClass().getSimpleName()
              + " --> rq.resolvedRoute: "
              + command.httpRequest().getAttribute("resolvedRoute"));
    }
  }

  private String getLongestMatcher(Pattern patten, String route) {
    while (!route.isEmpty() && !patten.matcher(route).find()) {
      route = route.substring(0, route.length() - 1);
    }
    return route;
  }

  private static Mono<?> routeIfNeeded(RunActionCommand command, Object instance) {
    if ("".equals(command.actionId()) && !"/_page".equals(command.route())) {
      if (instance instanceof RouteHandler handlesRoute) {
        return Mono.just(handlesRoute.handleRoute(command.route(), command.httpRequest()));
      }
      if (instance instanceof ReactiveRouteHandler handlesRoute) {
        return handlesRoute.handleRoute(command.route(), command.httpRequest());
      }
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
          instance,
          command.baseUrl(),
          command.initiatorComponentId(),
          command.actionId(),
          command);
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
          instance,
          command.baseUrl(),
          command.initiatorComponentId(),
          command.actionId(),
          command);
    }
    if (isApp(instance, command.route())) {
      var app =
          mapToAppComponent(
              instance,
              command.baseUrl(),
              command.route(),
              command.consumedRoute(),
              command.initiatorComponentId(),
              command.httpRequest());
      return resolveInApp(
          command.route(),
          command.consumedRoute(),
          command.componentState(),
          command.httpRequest(),
          app,
          instance,
          command.baseUrl(),
          command.initiatorComponentId(),
          command.actionId(),
          command);
    }

    return Mono.empty();
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

    log.info("createInstance {}", command);

    if (command.serverSiteType() != null && !command.serverSiteType().isEmpty()) {
      return createInstanceAndPostHydrate(command.serverSiteType(), command);
    }

    if (command.appServerSideType() != null && !command.appServerSideType().isEmpty()) {
      if ("/_page".equals(command.route())) {
        return createInstanceAndPostHydrate(command.appServerSideType(), command);
      }
      return createInstanceAndPostHydrate(command.appServerSideType(), command)
              .flatMap(app -> resolveMenuIfApp(command, app))
              .switchIfEmpty((Mono) resolveRoute(command));
    }

    // si hay una ruta --> esa clase
    return resolveRoute(command);
  }

  private Mono<Object> createInstanceAndPostHydrate(String className, RunActionCommand command) {
    return createInstance(className, command)
            .map(object -> postHydrate(command, object));
  }

  private static Object postHydrate(RunActionCommand command, Object object) {
    if (object instanceof PostHydrationHandler postHydrationHandler) {
      postHydrationHandler.onHydrated(command.httpRequest());
    }
    return object;
  }

  @SneakyThrows
  private Mono<?> resolveRoute(RunActionCommand command) {
    List<String> routes = createRoutes(command).reversed();
    return Flux.fromIterable(routes)
            .flatMap(route -> resolveAppRoute(route, command))
            .next()
            .switchIfEmpty((Mono) Flux.fromIterable(routes).flatMap(route -> resolveNonAppRoute(route, command)).next());
    /*
    for (String route : routes) {
      var instanceCreationPipe = resolveAppRoute(route, command);
      if (instanceCreationPipe.em) {

        return instanceCreationPipe;
      }
    }
    for (String route : routes) {
      var instanceCreationPipe = resolveNonAppRoute(route, command);
      if (instanceCreationPipe != null) {
        return instanceCreationPipe;
      }
    }
    return Mono.empty();

     */
  }

  @SneakyThrows
  private Mono<?> resolveNonAppRoute(String route, RunActionCommand command) {
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .sorted(Comparator.comparingInt(a -> a.weight(route, command.consumedRoute())))
            .toList()
            .reversed()) {
      if (resolver.supportsRoute(route, command.consumedRoute())) {
        var instanceTypeName =
            resolver
                .resolveRoute(command.route(), command.consumedRoute(), command.httpRequest())
                .getName();
        var type = Class.forName(instanceTypeName);
        var isApp = false;
        if (App.class.isAssignableFrom(type)
            || AppSupplier.class.isAssignableFrom(type)
            || getAllFields(type).stream()
                .anyMatch(
                    field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class))) {
          isApp = true;
        }
        if (!isApp) {
          command.httpRequest().setAttribute("resolvedRoute", route);
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

  @SneakyThrows
  private Mono<?> resolveAppRoute(String route, RunActionCommand command) {
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .sorted(Comparator.comparingInt(a -> a.weight(route, command.consumedRoute())))
            .toList()) {
      if (resolver.supportsRoute(route, command.consumedRoute())) {
        var instanceTypeName =
            resolver.resolveRoute(route, command.consumedRoute(), command.httpRequest()).getName();
        var type = Class.forName(instanceTypeName);
        if (type.isAnnotationPresent(BaseRoute.class)) {
          if (!Pattern.compile(type.getAnnotation(BaseRoute.class).value())
              .matcher(route)
              .matches()) {
            continue;
          }
        }
        if (resolver.getClass().getSimpleName().endsWith("UIRouteResolver")) {
          if (!type.getAnnotation(MateuUI.class).value().equals(command.baseUrl())) {
            continue;
          }
        }
        var isApp = false;
        if (App.class.isAssignableFrom(type)
            || AppSupplier.class.isAssignableFrom(type)
            || getAllFields(type).stream()
                .anyMatch(
                    field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class))) {
          isApp = true;
        }
        if (isApp) {
          command.httpRequest().setAttribute("resolvedRoute", route);
          command.httpRequest().setAttribute("resolvedTo", instanceTypeName);
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
    return Mono.empty();
  }

  private List<String> createRoutes(RunActionCommand command) {
    List<String> routes = new ArrayList<>();
    StringBuilder currentRoute = new StringBuilder();
    for (String token : command.route().split("/")) {
      var nextRoute = currentRoute + token;
      if ("_empty".equals(command.consumedRoute())
          || (!nextRoute.isEmpty() && nextRoute.length() >= command.consumedRoute().length()))
        routes.add(nextRoute);
      currentRoute.append(token).append("/");
    }
    return routes;
  }

  @SneakyThrows
  private Mono<?> resolveRoute(RunActionCommand command, boolean appsOnly) {
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .sorted(
                Comparator.comparingInt(a -> a.weight(command.route(), command.consumedRoute())))
            .toList()) {
      if (resolver.supportsRoute(command.route(), command.consumedRoute())) {
        var instanceTypeName =
            resolver
                .resolveRoute(command.route(), command.consumedRoute(), command.httpRequest())
                .getName();
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
            .sorted(Comparator.comparingInt(a -> a.weight(cleanRoute, consumedRoute)))
            .filter(routeResolver -> routeResolver.supportsRoute(cleanRoute, consumedRoute))
            .filter(
                resolver -> {
                  var resolved = resolver.resolveRoute(cleanRoute, consumedRoute, httpRequest);
                  return AppSupplier.class.isAssignableFrom(resolved)
                      || App.class.isAssignableFrom(resolved)
                      || io.mateu.uidl.interfaces.App.class.isAssignableFrom(resolved)
                      || (resolved.isAnnotationPresent(MateuUI.class)
                          && resolved.getAnnotation(MateuUI.class).value().equals(baseUrl));
                })
            .toList()) {
      if (resolver.supportsRoute(route, consumedRoute)
          && ("".equals(consumedRoute) || !resolver.supportsRoute(consumedRoute, consumedRoute))) {
        return resolver.resolveRoute(route, consumedRoute, httpRequest).getName();
      }
    }
    for (RouteResolver resolver :
        beanProvider.getBeans(RouteResolver.class).stream()
            .filter(routeResolver -> routeResolver.supportsRoute(cleanRoute, consumedRoute))
            .filter(
                resolver -> {
                  var resolved = resolver.resolveRoute(cleanRoute, consumedRoute, httpRequest);
                  return !(AppSupplier.class.isAssignableFrom(resolved)
                      || App.class.isAssignableFrom(resolved)
                      || io.mateu.uidl.interfaces.App.class.isAssignableFrom(resolved)
                      || resolved.isAnnotationPresent(MateuUI.class));
                })
            .sorted(Comparator.comparingInt(a -> a.weight(cleanRoute, consumedRoute)))
            .toList()
            .reversed()) {
      if (resolver.supportsRoute(route, consumedRoute)) {
        return resolver.resolveRoute(route, consumedRoute, httpRequest).getName();
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
      Object instance,
      String baseUrl,
      String initialComponentId,
      String actionId,
      RunActionCommand command) {
    if (("_empty".equals(consumedRoute) || "/_page".equals(route))) {
      return Mono.just(potentialApp);
    }
    App app = null;
    if (potentialApp instanceof App) {
      app = (App) potentialApp;
    } else {
      app =
          mapToAppComponent(
              potentialApp,
              baseUrl,
              getAppRoute(potentialApp),
              consumedRoute,
              initialComponentId,
              httpRequest);
    }

    if (app != null) {
      var actionable = resolveMenu(app.menu(), route.startsWith(consumedRoute)?route.substring(consumedRoute.length()):route);
      if (actionable == null) {
        return Mono.empty();
      }
      if (actionable instanceof RouteLink routeLink) {
        return Mono.empty();
        /*
        if (route.equals(consumedRoute)) {
          return Mono.empty();
        }
        return Mono.just(app.withRoute(route).withHomeRoute(routeLink.route()));
        
         */
      }
      if (actionable instanceof ContentLink contentLink) {
        return Mono.just(contentLink.componentSupplier().component(httpRequest));
      }
      if (actionable instanceof FieldLink fieldLink) {
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
      if (actionable instanceof Menu menu) {
        return Mono.just(new Text("Es un menu"));
      }
    }
    return Mono.empty();
  }

  private Mono<?> resolveMenuInDeclarativeApp(Object instance, String actionId) {
    return Mono.just(instance)
            .map(app -> findContainer(app, actionId))
            .map(optional -> optional.orElse(Mono.empty()));
  }

  private Optional<Object> findContainer(Object app, String route) {
    var fieldInClass = getFieldByName(app.getClass(), route);
    if (fieldInClass != null) {
      return Optional.of(getValueOrNewInstance(fieldInClass, app));
    }
    for (Field field :
        getAllFields(app.getClass()).stream()
            .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class))
            .toList()) {
      if (isDeclarativeApp(field.getType())) {
        var optionInMenu = findContainer(getValueOrNewInstance(field, app), route);
        if (optionInMenu.isPresent()) {
          return optionInMenu;
        }
      }
    }
    return Optional.empty();
  }

  public static boolean isDeclarativeApp(Class type) {
    return getAllFields(type).stream()
        .anyMatch(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class));
  }

  public static Object wrap(
      Component component,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return wrap(
        List.of(component),
        modelView,
        baseUrl,
        route,
        consumedRoute,
        initiatorComponentId,
        httpRequest);
  }

  public static Object wrap(
      List<Component> components,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ServerSideComponentDto(
        UUID.randomUUID().toString(),
        modelView.getClass().getName(),
        components.stream()
            .map(
                component ->
                    mapComponentToDto(
                        null,
                        component,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest))
            .toList(),
        getData(modelView),
        "",
        "",
        mapActions(modelView),
        mapTriggers(modelView),
        mapRules(modelView),
        mapValidations(modelView),
        null);
  }

  private static Object getData(Object modelView) {
    if (modelView instanceof DataSupplier dataSupplier) {
      return dataSupplier.data();
    }
    return modelView;
  }

  @SneakyThrows
  private Object invoke(Method method, Object instance) {
    return method.invoke(instance);
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
