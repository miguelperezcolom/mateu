package io.mateu.core.domain.queries.getJourney;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Builder
@Getter
public class GetJourneyQuery {

  private String journeyTypeId;

  private String journeyId;

  private ServerHttpRequest serverHttpRequest;
}
