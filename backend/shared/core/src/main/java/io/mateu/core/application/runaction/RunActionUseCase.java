package io.mateu.core.application.runaction;

import static io.mateu.core.domain.act.FieldCrudActionRunner.getViewModelClass;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.getSelectedOption;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.*;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapValidations;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DataComponentToDtoMapper.mapPojo;
import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;
import static io.mateu.core.infra.reflection.mappers.ReflectionUiIncrementMapper.removeQueryParamsFromRoute;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.application.ResolvedRoute;
import io.mateu.core.application.RoutedClassResolver;
import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.RouteConstants;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.*;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.ReactiveRouteHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.StateSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
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
  private final RoutedClassResolver routedClassResolver;
  private final MateuHttpClient mateuHttpClient;
  private final List<RouteResolver> routeResolvers;

  public Flux<UIIncrementDto> handle(RunActionCommand command) {
    log.info("run action {}", command.actionId());
    return (Mono.just(command)
            .flatMap(ignored -> createInstance(command))
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

  public static void setResolvedRoute(HttpRequest httpRequest, String route) {
    setResolvedRoute(httpRequest, route, true);
  }

  public static void setResolvedRoute(HttpRequest httpRequest, String route, boolean force) {
    if (force || httpRequest.getAttribute("resolvedRoute") == null) {
      httpRequest.setAttribute("resolvedRoute", route);
    }
  }

  public static void setResolvedPath(HttpRequest httpRequest, String path) {
    httpRequest.setAttribute("resolvedPath", path);
  }

  private static Mono<?> routeIfNeeded(RunActionCommand command, Object instance) {
    if (instance instanceof Mono<?> mono) {
      return mono.map(i -> routeIfNeeded(command, i));
    }
    if (instance instanceof RouteHandler handlesRoute) {
      return Mono.just(handlesRoute.handleRoute(command.route(), command.httpRequest()));
    }
    if (instance instanceof ReactiveRouteHandler handlesRoute) {
      return handlesRoute.handleRoute(command.route(), command.httpRequest());
    }
    return Mono.just(instance);
  }

  private Mono<?> resolveMenuIfApp(RunActionCommand command, Object instance) {
    var rawRoute = command.route();
    var route = removeQueryParamsFromRoute(rawRoute);
    if (instance instanceof App app) {
      return resolveInApp(
          route,
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
          route,
          command.consumedRoute(),
          command.componentState(),
          command.httpRequest(),
          app,
          instance,
          command.baseUrl(),
          command.initiatorComponentId(),
          command.actionId(),
          command,
          false);
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
      return resolveInApp(
          route,
          command.consumedRoute(),
          command.componentState(),
          command.httpRequest(),
          app,
          instance,
          command.baseUrl(),
          command.initiatorComponentId(),
          command.actionId(),
          command,
          false);
    }

    return Mono.just(instance);
  }

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

  @SneakyThrows
  private Mono<?> createInstance(RunActionCommand command) {
    log.info("createInstance {}", command);

    var adjusted = adjustCommandForCrudNavigation(command);
    command = adjusted.command();

    if (adjusted.routeFirst()) {
      // CRUD navigation: try the adjusted route first; on miss, fall back to the known type
      RunActionCommand finalCommand = command;
      return findRouteResolver(command)
          .switchIfEmpty(
              (Mono)
                  Mono.defer(
                      () -> {
                        finalCommand.httpRequest().setAttribute("updateUrl", "_no_update");
                        var restoredCommand =
                            finalCommand.withRoute(
                                (String) finalCommand.httpRequest().getAttribute("oldRoute"));
                        return instantiateWithKnownType(restoredCommand);
                      }));
    }

    if (command.serverSideType() != null && !command.serverSideType().isEmpty()) {
      return instantiateWithKnownType(command);
    }

    return findRouteResolver(command);
  }

  /**
   * Path 2: we already know the serverSideType. Instantiate it and, unless the route is terminal,
   * try to resolve deeper navigation (menu/route) from the resulting instance.
   */
  private Mono<?> instantiateWithKnownType(RunActionCommand command) {
    if (command.serverSideType() == null || command.serverSideType().isEmpty()) {
      return Mono.empty();
    }
    setResolvedRoute(command.httpRequest(), command.consumedRoute());
    if (command.httpRequest().getAttribute("resolvedPath") == null) {
      setResolvedPath(command.httpRequest(), command.route());
    }
    var mono =
        createInstanceAndPostHydrate(command.serverSideType(), command)
            .doOnNext(app -> command.httpRequest().setAttribute("resolvedApp", app));
    if (isTerminalRoute(command.route())) {
      return mono;
    }
    RunActionCommand finalCommand = command;
    return mono.flatMap(
        app ->
            resolveMenuIfApp(finalCommand, app)
                .switchIfEmpty((Mono) findRouteResolver(finalCommand)));
  }

  private boolean isTerminalRoute(String route) {
    return route.endsWith("_page") || route.endsWith("_no_home_route");
  }

  private Mono<Object> createInstanceAndPostHydrate(String className, RunActionCommand command) {
    return createInstance(className, command).map(object -> postHydrate(command, object));
  }

  private static Object postHydrate(RunActionCommand command, Object object) {
    if (object instanceof PostHydrationHandler postHydrationHandler) {
      postHydrationHandler.onHydrated(command.httpRequest());
    }
    return object;
  }

  /**
   * Path 1: no serverSideType yet. Search route segments for a matching App/RouteResolver
   * (shortest-first so the broadest enclosing app wins), then fall back to direct class matches
   * (longest-first so the most-specific route wins).
   */
  @SneakyThrows
  private Mono<?> findRouteResolver(RunActionCommand command) {
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

  private Mono<Object> createInstance(
      RunActionCommand command,
      String instanceTypeName,
      InstanceFactory instanceFactory,
      String route,
      Optional<ResolvedRoute> routedClass) {
    return (Mono<Object>)
        createInstance(
            instanceTypeName,
            instanceFactory,
            addParameterValues(
                command.componentState(), route, routedClass.get(), command.httpRequest()),
            command.httpRequest());
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
            app -> resolveRemoteMenuForRoute(command, app, command.httpRequest()));
      }
    }
    log.info("no app matches {}", route);
    return Mono.empty();
  }

  private Mono<?> resolveRemoteMenuForRoute(
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
      return handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    return Mono.just(potentialApp);
  }

  private List<String> createRoutes(RunActionCommand command) {
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

  private Mono<?> createInstance(String className, RunActionCommand command) {
    var instanceFactory = instanceFactoryProvider.get(className);
    return createInstance(
        className, instanceFactory, command.componentState(), command.httpRequest());
  }

  private Mono<?> createInstance(
      String instanceTypeName,
      InstanceFactory instanceFactory,
      Map<String, Object> data,
      HttpRequest httpRequest) {
    return instanceFactory.createInstance(instanceTypeName, data, httpRequest);
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
    return resolveInApp(
        route,
        consumedRoute,
        data,
        httpRequest,
        potentialApp,
        instance,
        baseUrl,
        initialComponentId,
        actionId,
        command,
        true);
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
      RunActionCommand command,
      boolean emptyIfRoute) {
    var app = toApp(potentialApp, baseUrl, consumedRoute, initialComponentId, httpRequest);

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
      return handleRemoteMenuActionable(remoteMenu, app, httpRequest, command);
    }

    if (("_empty".equals(consumedRoute) || "/_page".equals(route) || "_page".equals(route))) {
      return Mono.just(potentialApp);
    }

    if (routeResolvers != null) {
      var found =
          routeResolvers.stream()
              .filter(resolver -> resolver.supportsRoute(route, resolvedRoute))
              .findFirst();
      if (found.isPresent()) {
        var resolvedClass = found.get().resolveRoute(route, resolvedRoute, command.httpRequest());
        if (resolvedClass != null) {
          setResolvedRoute(command.httpRequest(), route);
          var instanceTypeName = resolvedClass.getName();
          var instanceFactory = instanceFactoryProvider.get(instanceTypeName);
          var instancex =
              createInstance(
                  command,
                  instanceTypeName,
                  instanceFactory,
                  route,
                  Optional.of(
                      new ResolvedRoute(
                          route,
                          found
                              .get()
                              .matchingPattern(route, resolvedRoute)
                              .get()
                              .routeRegex()
                              .pattern(),
                          resolvedClass)));
          log.info("absolute {} resolved to {}", route, instance);
          return instancex;
        }
      }
    }

    if (actionable == null) {
      return Mono.empty();
    }
    if (actionable instanceof RouteLink routeLink) {
      if (emptyIfRoute) {
        return Mono.empty();
      }
      return findRouteResolver(command.withConsumedRoute(route));
    }
    if (actionable instanceof ContentLink contentLink) {
      return Mono.just(contentLink.componentSupplier().component(httpRequest));
    }
    if (actionable instanceof FieldLink fieldLink) {
      setResolvedRoute(command.httpRequest(), route);
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
      setResolvedRoute(command.httpRequest(), route);
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

    return Mono.empty();
  }

  /** Converts a potential app object to an {@link App} instance. */
  private App toApp(
      Object potentialApp,
      String baseUrl,
      String consumedRoute,
      String initialComponentId,
      HttpRequest httpRequest) {
    if (potentialApp instanceof App app) {
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

  /** Resolves a {@link RemoteMenu} actionable and maps the result to a {@link MicroFrontend}. */
  private Mono<?> handleRemoteMenuActionable(
      RemoteMenu remoteMenu, App app, HttpRequest httpRequest, RunActionCommand command) {
    return resolveRemoteMenu(remoteMenu, httpRequest, command)
        .map(
            result -> {
              if (result instanceof MicroFrontend microFrontend) {
                return app.withHomeRoute(microFrontend.route())
                    .withHomeBaseUrl(microFrontend.baseUrl())
                    .withHomeServerSideType(microFrontend.serverSideType())
                    .withHomeConsumedRoute(microFrontend.consumedRoute())
                    .withHomeUriPrefix("");
              }
              return result;
            })
        .switchIfEmpty((Mono) Mono.just(Text.builder().text("Remote menu not resolved").build()));
  }

  private Mono<?> resolveRemoteMenu(
      RemoteMenu remoteMenu, HttpRequest httpRequest, RunActionCommand command) {
    RunActionRqDto request =
        RunActionRqDto.builder()
            .actionId("")
            .consumedRoute(remoteMenu.consumedRoute())
            .route(remoteMenu.route())
            .serverSideType(remoteMenu.serverSideType())
            .initiatorComponentId(httpRequest.runActionRq().initiatorComponentId())
            .build();

    var baseUrl = remoteMenu.baseUrl();
    if (!baseUrl.startsWith("http")) {
      baseUrl = httpRequest.getHeaderValue("origin") + baseUrl;
    }

    var remoteBaseUrl = remoteMenu.baseUrl();
    if (remoteBaseUrl.startsWith("http")) {
      remoteBaseUrl = remoteBaseUrl.substring(remoteBaseUrl.indexOf("/") + 1);
      remoteBaseUrl = remoteBaseUrl.substring(remoteBaseUrl.indexOf("/") + 1);
      remoteBaseUrl = remoteBaseUrl.substring(remoteBaseUrl.indexOf("/"));
    }

    return Mono.fromFuture(mateuHttpClient.send(baseUrl, request))
        .flatMap(
            uiIncrementDto ->
                Mono.justOrEmpty(
                        uiIncrementDto.fragments().stream()
                            .filter(fragment -> fragment.component() != null)
                            .map(UIFragmentDto::component)
                            .filter(componentDto -> componentDto instanceof ClientSideComponentDto)
                            .map(componentDto -> (ClientSideComponentDto) componentDto)
                            .map(ClientSideComponentDto::metadata)
                            .filter(metadata -> metadata instanceof AppDto)
                            .map(metadata -> (AppDto) metadata)
                            .findFirst())
                    .map(app -> (AppDto) app)
                    .map(
                        app ->
                            MicroFrontend.builder()
                                .route(command.route())
                                .consumedRoute(app.homeConsumedRoute())
                                .actionId("")
                                .baseUrl(remoteMenu.baseUrl())
                                .serverSideType(app.homeServerSideType())
                                .build()));
  }

  public static ServerSideComponentDto wrap(
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

  public static ServerSideComponentDto wrap(
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
        consumedRoute,
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
        getState(modelView, httpRequest),
        "width: 100%;",
        "",
        mapActions(modelView),
        mapTriggers(modelView, httpRequest),
        mapRules(modelView),
        mapValidations(modelView, route),
        null,
        null);
  }

  public static Object getState(Object modelView, HttpRequest httpRequest) {
    if (modelView == null) {
      return null;
    }
    var state =
        (modelView instanceof StateSupplier stateSupplier)
            ? stateSupplier.state(httpRequest)
            : modelView;
    if (!(state instanceof Map<?, ?>)) {
      var newState = mapPojo(state);
      getAllFields(getViewModelClass(modelView, httpRequest)).stream()
          .filter(field -> field.isAnnotationPresent(GeneratedValue.class))
          .forEach(
              field -> {
                var generator =
                    MateuBeanProvider.getBean(field.getAnnotation(GeneratedValue.class).value());
                var value = generator.generate();
                newState.put(field.getName(), value);
              });
      addRowNumber(modelView.getClass(), newState);
      return newState;
    }
    return state;
  }

  @SneakyThrows
  private Object invoke(Method method, Object instance) {
    return method.invoke(instance);
  }

  private String getAppRoute(Object potentialApp) {
    if (potentialApp.getClass().isAnnotationPresent(UI.class)) {
      return potentialApp.getClass().getAnnotation(UI.class).value();
    }
    if (potentialApp.getClass().isAnnotationPresent(Route.class)) {
      return potentialApp.getClass().getAnnotation(Route.class).value();
    }
    return "";
  }

  private record AdjustedCommand(RunActionCommand command, boolean routeFirst) {}

  /**
   * When a CrudOrchestrator handles a "view" or "edit" action, the target entity id must be
   * appended to the route so that the correct sub-route is resolved. This concern is extracted here
   * to keep createInstance focused on route resolution.
   */
  @SneakyThrows
  private AdjustedCommand adjustCommandForCrudNavigation(RunActionCommand command) {
    if (command.serverSideType() == null || command.serverSideType().isEmpty()) {
      return new AdjustedCommand(command, false);
    }
    var type = Class.forName(command.serverSideType());
    if (!CrudOrchestrator.class.isAssignableFrom(type)) {
      return new AdjustedCommand(command, false);
    }
    if ("view".equals(command.actionId())) {
      var idField = command.componentState().get("idFieldForRow");
      if (idField != null && command.httpRequest().runActionRq().parameters() != null) {
        var id = command.httpRequest().runActionRq().parameters().get(idField);
        if (id != null) {
          command.httpRequest().setAttribute("oldRoute", command.route());
          command = command.withRoute(command.route() + "/" + id);
          command.httpRequest().setAttribute("updateUrl", command.route());
          return new AdjustedCommand(command, true);
        }
      }
    }
    if ("edit".equals(command.actionId())) {
      var idField = command.componentState().get("idFieldForRow");
      if (idField != null && command.httpRequest().runActionRq().parameters() != null) {
        var id = command.httpRequest().runActionRq().componentState().get(idField);
        if (id != null) {
          // Strip trailing id segment if the route already contains it (e.g. when editing from
          // view)
          var baseRoute = command.route();
          if (baseRoute.endsWith("/" + id)) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/" + id));
          }
          command.httpRequest().setAttribute("oldRoute", baseRoute);
          command = command.withRoute(baseRoute + "/" + id + "/edit");
          command.httpRequest().setAttribute("updateUrl", command.route());
          return new AdjustedCommand(command, true);
        }
      }
    }
    if ("new".equals(command.actionId())) {
      var baseRoute = command.route();
      var idFieldName =
          command.componentState() != null
              ? (String) command.componentState().get("idFieldForRow")
              : null;
      if (idFieldName != null) {
        var id = command.componentState().get(idFieldName);
        if (id != null) {
          // Strip /edit suffix if present (coming from the edit form)
          if (baseRoute.endsWith("/edit")) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/edit"));
          }
          // Strip the trailing id segment (coming from view or edit)
          if (baseRoute.endsWith("/" + id)) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/" + id));
          }
        }
      }
      command.httpRequest().setAttribute("oldRoute", baseRoute);
      // Set resolvedPath so getCrudRoute strips "/new" and returns the correct base route,
      // regardless of whether findRouteResolver or instantiateWithKnownType is used.
      command.httpRequest().setAttribute("resolvedPath", baseRoute + "/new");
      command = command.withRoute(baseRoute + "/new");
      return new AdjustedCommand(command, true);
    }
    if ("cancel-view".equals(command.actionId())) {
      // Pre-strip the entity id from the route so resolvedPath is set to the list route.
      // This ensures getCrudRoute returns the correct base route regardless of whether
      // savedId is available from the component state.
      var baseRoute = command.route();
      var idFieldName = (String) command.componentState().get("idFieldForRow");
      if (idFieldName != null) {
        var id = command.componentState().get(idFieldName);
        if (id != null) {
          // Strip /edit suffix if present
          if (baseRoute.endsWith("/edit")) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/edit"));
          }
          // Strip the trailing id segment (e.g. /products/entity-1 → /products)
          if (baseRoute.endsWith("/" + id)) {
            baseRoute = baseRoute.substring(0, baseRoute.lastIndexOf("/" + id));
          }
        }
      }
      command = command.withRoute(baseRoute);
    }
    return new AdjustedCommand(command, false);
  }
}
