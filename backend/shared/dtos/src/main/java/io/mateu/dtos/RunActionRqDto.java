package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

public record RunActionRqDto(
    Map<String, Object> componentState,
    Map<String, Object> appState,
    Map<String, Object> parameters,
    String initiatorComponentId,
    String consumedRoute,
    String actionId,
    String route,
    String serverSideType) {

  public RunActionRqDto {
    componentState =
        componentState != null ? Collections.unmodifiableMap(componentState) : Map.of();
    appState = appState != null ? Collections.unmodifiableMap(appState) : Map.of();
  }

  public Map<String, Object> componentState() {
    return Collections.unmodifiableMap(componentState);
  }

  public Map<String, Object> appState() {
    return Collections.unmodifiableMap(appState);
  }
}
