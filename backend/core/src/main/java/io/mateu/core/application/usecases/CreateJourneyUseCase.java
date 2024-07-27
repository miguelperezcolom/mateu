package io.mateu.core.application.usecases;

import io.mateu.core.domain.commands.startJourney.StartJourneyCommand;
import io.mateu.core.domain.commands.startJourney.StartJourneyCommandHandler;
import io.mateu.dtos.JourneyCreationRq;
import io.mateu.dtos.StepWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class CreateJourneyUseCase {

  private final StartJourneyCommandHandler startJourneyCommandHandler;

  public CreateJourneyUseCase(StartJourneyCommandHandler startJourneyCommandHandler) {
    this.startJourneyCommandHandler = startJourneyCommandHandler;
  }

  public Mono<StepWrapper> createJourney(
      String uiId,
      String journeyTypeId,
      String journeyId,
      JourneyCreationRq rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return startJourneyCommandHandler.handle(
        StartJourneyCommand.builder()
            .uiId(uiId)
            .journeyId(journeyId)
            .journeyTypeId(journeyTypeId)
            .journeyCreationRq(rq)
            .serverHttpRequest(serverHttpRequest)
            .build());
  }
}
