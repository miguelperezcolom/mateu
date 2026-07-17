package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedPath;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;

import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class ActionInstanceCreator {

  private final InstanceFactoryProvider instanceFactoryProvider;
  private final CrudNavigationAdjuster crudNavigationAdjuster;
  private final RouteInstanceCreator routeInstanceCreator;
  private final AppMenuResolver appMenuResolver;
  private final YamlUidlLoader yamlUidlLoader;

  @SneakyThrows
  Mono<?> createInstance(RunActionCommand command) {
    log.info("createInstance {}", command);

    try {
      var adjusted = crudNavigationAdjuster.adjust(command);
      command = adjusted.command();

      if (adjusted.routeFirst()) {
        RunActionCommand finalCommand = command;
        return routeInstanceCreator
            .findRouteResolver(command)
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

    } catch (Throwable e) {
      log.info(e.getClass().getSimpleName() + ": " + e.getMessage());
      return Mono.just(UIIncrementDto.builder().build());
    }

    if (command.serverSideType() != null && !command.serverSideType().isEmpty()) {
      return instantiateWithKnownType(command);
    }

    RunActionCommand finalCommand = command;
    return routeInstanceCreator
        .findRouteResolver(command)
        .switchIfEmpty((Mono) Mono.defer(() -> yamlUidlLoader.load(finalCommand)));
  }

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
    if (isTerminalRoute(command.route()) || isAppLevelAction(command)) {
      return mono;
    }
    RunActionCommand finalCommand = command;
    return mono.flatMap(
        app ->
            appMenuResolver
                .resolveMenuIfApp(finalCommand, app, routeInstanceCreator::findRouteResolver)
                .switchIfEmpty((Mono) routeInstanceCreator.findRouteResolver(finalCommand)));
  }

  private boolean isTerminalRoute(String route) {
    return route.endsWith("_page") || route.endsWith("_no_home_route");
  }

  /**
   * An action addressed to the APP INSTANCE itself (e.g. the header context selectors' {@code
   * _appcontext-search-<field>}) must skip menu/home resolution: on a ROOT app (route "") there is
   * no menu actionable for the empty route, so resolving would come back empty and the action would
   * answer "Not found." instead of dispatching to its runner.
   */
  private boolean isAppLevelAction(RunActionCommand command) {
    var actionId = command.actionId();
    if (actionId == null) {
      return false;
    }
    if (actionId.startsWith(io.mateu.core.domain.act.AppContextSearchActionRunner.ACTION_PREFIX)) {
      return true;
    }
    // The notification inbox's list/read actions are app-level too (the bell lives on the shell).
    if (actionId.startsWith(io.mateu.core.domain.act.NotificationsActionRunner.ACTION_PREFIX)) {
      return true;
    }
    // Header actions declared by the app's AppActionsSupplier dispatch to the app
    // instance too — same reasoning as the context selectors' remote search.
    if (command.serverSideType() == null) {
      return false;
    }
    try {
      var appClass = Class.forName(command.serverSideType());
      if (!io.mateu.uidl.interfaces.AppActionsSupplier.class.isAssignableFrom(appClass)) {
        return false;
      }
      var supplier =
          (io.mateu.uidl.interfaces.AppActionsSupplier)
              io.mateu.uidl.di.MateuBeanProvider.getBean(
                      io.mateu.uidl.interfaces.InstanceFactory.class)
                  .newInstance(appClass, java.util.Map.of(), command.httpRequest());
      var actions = supplier.appActions(command.httpRequest());
      // dropdown header actions dispatch their CHILDREN's ids — flatten before matching
      return actions != null
          && actions.stream()
              .flatMap(
                  a ->
                      a.children() == null
                          ? java.util.stream.Stream.of(a)
                          : java.util.stream.Stream.concat(
                              java.util.stream.Stream.of(a), a.children().stream()))
              .anyMatch(a -> actionId.equals(a.actionId()));
    } catch (ReflectiveOperationException | RuntimeException e) {
      return false;
    }
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

  private Mono<?> createInstance(String className, RunActionCommand command) {
    var instanceFactory = instanceFactoryProvider.get(className);
    return instanceFactory.createInstance(
        className, command.componentState(), command.httpRequest());
  }
}
