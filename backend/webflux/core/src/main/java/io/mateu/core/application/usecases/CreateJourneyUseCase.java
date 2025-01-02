package io.mateu.core.application.usecases;

import io.mateu.core.domain.commands.startJourney.StartJourneyCommand;
import io.mateu.core.domain.commands.startJourney.StartJourneyCommandHandler;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.UIIncrementDto;
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

  public Mono<UIIncrementDto> createJourney(
      String uiId,
      String baseUrl,
      String journeyTypeId,
      String journeyId,
      JourneyCreationRqDto rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return startJourneyCommandHandler.handle(
        StartJourneyCommand.builder()
            .uiId(uiId)
            .baseUrl(baseUrl)
            .journeyId(journeyId)
            .journeyTypeId(journeyTypeId)
            .journeyCreationRq(rq)
            .serverHttpRequest(serverHttpRequest)
            .build());
  }
}
