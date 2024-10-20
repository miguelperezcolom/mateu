package io.mateu.core.domain.commands.runStepAction;

import java.util.Collections;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public record RunStepActionCommand(
    String journeyTypeId,
    String journeyId,
    String stepId,
    String componentId,
    String actionId,
    String componentType,
    Map<String, Object> data,
    Map<String, Object> contextData,
    ServerHttpRequest serverHttpRequest) {

  public RunStepActionCommand {
    data = data != null ? Collections.unmodifiableMap(data) : Map.of();
    contextData = contextData != null ? Collections.unmodifiableMap(contextData) : Map.of();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  @Override
  public Map<String, Object> contextData() {
    return Collections.unmodifiableMap(contextData);
  }
}
