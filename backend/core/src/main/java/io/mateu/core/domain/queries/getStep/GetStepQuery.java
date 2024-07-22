package io.mateu.core.domain.queries.getStep;

import io.mateu.core.domain.model.store.JourneyContainer;
import lombok.Builder;
import lombok.Getter;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Builder
@Getter
public class GetStepQuery {

  private JourneyContainer journeyContainer;

  private String stepId;

  private ServerHttpRequest serverHttpRequest;
}
