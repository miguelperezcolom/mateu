package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

public record RunActionRqDto(
    String componentType,
    Map<String, Object> data,
    Map<String, Object> appState,
    String initiatorComponentId) {

  public RunActionRqDto {
    data = data != null ? Collections.unmodifiableMap(data) : Map.of();
    appState = appState != null ? Collections.unmodifiableMap(appState) : Map.of();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  public Map<String, Object> appState() {
    return Collections.unmodifiableMap(appState);
  }
}
