package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Collections;
import java.util.Map;

/**
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
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
