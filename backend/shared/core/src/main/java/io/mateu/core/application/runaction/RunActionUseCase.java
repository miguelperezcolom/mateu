package io.mateu.core.application.runaction;

import io.mateu.core.domain.ActionRunnerProvider;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.UiIncrementMapperProvider;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@RequiredArgsConstructor
public class RunActionUseCase {

  private final InstanceFactoryProvider instanceFactoryProvider;
  private final ActionRunnerProvider actionRunnerProvider;
  private final UiIncrementMapperProvider uiIncrementMapperProvider;

  public Mono<UIIncrementDto> handle(RunActionCommand command) {
    log.info("run action for {}", command);
    // todo: use route somehow
    var instanceTypeName = getInstanceTypeName(command);
    var instanceFactory = instanceFactoryProvider.get(instanceTypeName);
    return Mono.just(command)
        .flatMap(
            rq -> instanceFactory.createInstance(instanceTypeName, rq.data(), rq.httpRequest()))
        .flatMap(instance -> resolveRoute(instance, command.route(), command.httpRequest()))
        .flatMap(
            instance ->
                actionRunnerProvider
                    .get(instance, command.actionId())
                    .run(instance, command.actionId(), command.data(), command.httpRequest()))
        .flatMap(
            result ->
                uiIncrementMapperProvider
                    .get(result)
                    .map(result, command.baseUrl(), command.httpRequest()));
  }

  private Mono<?> resolveRoute(Object instance, String route, HttpRequest httpRequest) {
    if (instance instanceof HandlesRoute handlesRoute) {
      return handlesRoute.handleRoute(route, httpRequest);
    }
    return Mono.just(instance);
  }

  private String getInstanceTypeName(RunActionCommand command) {
    var instanceTypeName = command.componentType();
    if (instanceTypeName == null || instanceTypeName.isEmpty()) {
      instanceTypeName = command.uiId();
    }
    return instanceTypeName;
  }
}
