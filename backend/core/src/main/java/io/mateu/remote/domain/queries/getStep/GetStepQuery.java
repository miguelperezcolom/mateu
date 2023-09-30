package io.mateu.remote.domain.queries.getStep;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Builder
@Getter
public class GetStepQuery {

  private String journeyTypeId;

  private String journeyId;

  private String stepId;

  private ServerHttpRequest serverHttpRequest;
}
