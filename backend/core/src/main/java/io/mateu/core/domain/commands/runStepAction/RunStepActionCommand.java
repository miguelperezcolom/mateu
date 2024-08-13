package io.mateu.core.domain.commands.runStepAction;

import io.mateu.dtos.JourneyContainer;
import java.util.Collections;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public record RunStepActionCommand(
    String journeyTypeId,
    String journeyId,
    String stepId,
    String actionId,
    Map<String, Object> data,
    JourneyContainer journeyContainer,
    ServerHttpRequest serverHttpRequest) {

  public RunStepActionCommand {
    data = data != null ? Collections.unmodifiableMap(data) : Map.of();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }
}
