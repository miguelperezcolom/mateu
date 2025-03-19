package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Collections;
import java.util.Map;

public record JourneyCreationRqDto(
    @JsonProperty("context-data") Map<String, Object> contextData, String hash) {

  public JourneyCreationRqDto {
    contextData = contextData != null ? Collections.unmodifiableMap(contextData) : Map.of();
  }

  @Override
  public Map<String, Object> contextData() {
    return Collections.unmodifiableMap(contextData);
  }
}
