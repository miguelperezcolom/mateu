package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

public record GetUIRqDto(Map<String, Object> config, String path) {

  public GetUIRqDto {
    config = config != null ? Collections.unmodifiableMap(config) : Map.of();
  }

  @Override
  public Map<String, Object> config() {
    return Collections.unmodifiableMap(config);
  }
}
