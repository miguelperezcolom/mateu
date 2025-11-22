package io.mateu.core.application.runaction;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.MateuUI;
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
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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

  public static Actionable resolveMenu(List<Actionable> actionables, String route) {
    if ("/_page".equals(route) || "".equals(route)) {
      return null;
    }
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
              || !resolver.supportsRoute(command.consumedRoute()))) {
        var instanceTypeName =
            resolver.resolveRoute(command.route(), command.httpRequest()).getName();
        if (command.appServerSideType() != null
            && !command.appServerSideType().isEmpty()
            && command.appServerSideType().equals(instanceTypeName)) {
          continue;
        }
        var type = Class.forName(instanceTypeName);
        if (type.isAnnotationPresent(MateuUI.class)) {
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
    return instanceFactory
        .createInstance(instanceTypeName, data, httpRequest)
        .flatMap(
            instance -> {
              if (instance instanceof RouteHandler handlesRoute) {
                return handlesRoute.handleRoute(route, httpRequest);
              }
              return Mono.just(instance);
            });
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
}
