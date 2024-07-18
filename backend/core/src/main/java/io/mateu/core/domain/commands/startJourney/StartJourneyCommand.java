package io.mateu.core.domain.commands.startJourney;

import io.mateu.dtos.JourneyCreationRq;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Builder
@Slf4j
@Getter
public class StartJourneyCommand {

  private String journeyTypeId;

  private String journeyId;

  private JourneyCreationRq journeyCreationRq;

  private ServerHttpRequest serverHttpRequest;
}
