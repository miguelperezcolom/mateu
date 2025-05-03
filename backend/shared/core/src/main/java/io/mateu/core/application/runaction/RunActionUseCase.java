package io.mateu.core.application.runaction;

import io.mateu.core.domain.ActionRunnerProvider;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.UiIncrementMapper;
import io.mateu.dtos.UIIncrementDto;
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
  private final UiIncrementMapper uiIncrementMapper;

  public Mono<UIIncrementDto> handle(RunActionCommand command) {
    log.info("run action for {}", command);
    var instanceFactory = instanceFactoryProvider.get(command.componentType());
    return Mono.just(command)
        .flatMap(
            rq -> instanceFactory.createInstance(rq.componentType(), rq.data(), rq.httpRequest()))
        .flatMap(
            instance ->
                actionRunnerProvider
                    .get(instance, command.actionId())
                    .run(instance, command.actionId(), command.data(), command.httpRequest()))
        .flatMap(ui -> uiIncrementMapper.map(ui, command.baseUrl(), command.httpRequest()));
  }
}
