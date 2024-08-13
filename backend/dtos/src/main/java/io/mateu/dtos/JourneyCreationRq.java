package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

public record JourneyCreationRq(Map<String, Object> contextData) {

  public JourneyCreationRq {
    contextData = contextData != null ? Collections.unmodifiableMap(contextData) : Map.of();
  }

  @Override
  public Map<String, Object> contextData() {
    return Collections.unmodifiableMap(contextData);
  }
}
