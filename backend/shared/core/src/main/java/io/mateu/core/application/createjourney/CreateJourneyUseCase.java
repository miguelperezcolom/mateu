package io.mateu.core.application.createjourney;

import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.RouteMatcher;
import io.mateu.core.domain.UiIncrementMapperProvider;
import io.mateu.dtos.UIIncrementDto;
import jakarta.inject.Named;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@RequiredArgsConstructor
public class CreateJourneyUseCase {

  private final InstanceFactoryProvider instanceFactoryProvider;
  private final UiIncrementMapperProvider uiIncrementMapperProvider;
  private final RouteMatcher routeMatcher;

  public Mono<UIIncrementDto> handle(CreateJourneyCommand command) {
    log.info("create journey for {}", command);
    var instanceFactory = instanceFactoryProvider.get(command.uiId());
    return Mono.just(command)
        .flatMap(
            unused ->
                instanceFactory.createInstance(command.uiId(), Map.of(), command.httpRequest()))
        .flatMap(ui -> routeMatcher.map(ui, command.httpRequest()))
        .flatMap(
            journey ->
                uiIncrementMapperProvider
                    .get(journey)
                    .map(journey, command.baseUrl(), command.httpRequest()));
  }
}
