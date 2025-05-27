package io.mateu.core.application.runaction;

import io.mateu.core.domain.ActionRunnerProvider;
import io.mateu.core.domain.BeanProvider;
import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.UiIncrementMapperProvider;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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
    var instanceTypeName = getInstanceTypeName(command);
    var instanceFactory = instanceFactoryProvider.get(instanceTypeName);
    return Mono.just(command)
        .flatMap(
            ignored ->
                resolveRoute(
                    instanceTypeName,
                    instanceFactory,
                    command.route(),
                    command.consumedRoute(),
                    command.data(),
                    command.httpRequest()))
        .flatMap(
            instance ->
                actionRunnerProvider
                    .get(instance, command.actionId())
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
    var instanceTypeName = command.componentType();
    for (RouteResolver bean :
        beanProvider.getBeans(RouteResolver.class).stream()
            .filter(
                resolver ->
                    resolver.supportsRoute(command.route())
                        && !resolver.supportsRoute(command.consumedRoute()))
            .sorted(Comparator.comparingInt(a -> a.weight(command.route())))
            .toList()) {
      return bean.resolveRoute(command.route(), command.httpRequest()).getName();
    }
    if (instanceTypeName == null || instanceTypeName.isEmpty()) {
      instanceTypeName = command.uiId();
    }
    return instanceTypeName;
  }
}
