package io.mateu.core.application.createjourney;

import static org.junit.jupiter.api.Assertions.*;

import io.mateu.core.domain.DefaultRouteMatcher;
import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.ReflectionUiIncrementMapper;
import io.mateu.core.domain.fragmentmapper.ReflectionFragmentMapper;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class CreateJourneyUseCaseTest {

  @Test
  void createsJourney() {
    var dto = new UIIncrementDto(List.of(), List.of(), List.of(), null);
    var ui =
        new HandlesRoute() {

          @Override
          public Mono<?> handle(String route, HttpRequest httpRequest) {
            return Mono.fromSupplier(() -> dto);
          }
        };
    var useCase =
        new CreateJourneyUseCase(
            className ->
                new InstanceFactory() {
                  @Override
                  public boolean supports(String className) {
                    return true;
                  }

                  @Override
                  public Mono<? extends Object> createInstance(
                      String className, Map<String, Object> data, HttpRequest httpRequest) {
                    return Mono.just(ui);
                  }
                },
            new ReflectionUiIncrementMapper(new ReflectionFragmentMapper()),
            new DefaultRouteMatcher());
    var result =
        useCase
            .handle(
                new CreateJourneyCommand(
                    "ui_id", "journey_type", "journey_id", "base_url", new FakeHttpRequest()))
            .block();
    assertNotNull(result);
    assertEquals(dto, result);
  }
}
