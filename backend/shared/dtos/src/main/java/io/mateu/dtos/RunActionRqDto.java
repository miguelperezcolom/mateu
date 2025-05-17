package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

public record RunActionRqDto(
    String componentType,
    Map<String, Object> data,
    Map<String, Object> config,
    String initiatorComponentId) {

  public RunActionRqDto {
    data = data != null ? Collections.unmodifiableMap(data) : Map.of();
    config = config != null ? Collections.unmodifiableMap(config) : Map.of();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  @Override
  public Map<String, Object> config() {
    return Collections.unmodifiableMap(config);
  }
}
