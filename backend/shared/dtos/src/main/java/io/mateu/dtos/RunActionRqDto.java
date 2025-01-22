package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

public record RunActionRqDto(
    String componentType, Map<String, Object> data, Map<String, Object> contextData) {

  public RunActionRqDto {
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
