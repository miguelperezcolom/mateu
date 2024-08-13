package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;
import lombok.*;

public record RunActionRq(
    Map<String, Object> data, Map<String, Object> journey, Map<String, Object> contextData) {

  public RunActionRq {
    data = data != null?Collections.unmodifiableMap(data):Map.of();
    journey = journey != null?Collections.unmodifiableMap(journey):Map.of();
    contextData = contextData != null?Collections.unmodifiableMap(contextData):Map.of();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  @Override
  public Map<String, Object> journey() {
    return Collections.unmodifiableMap(journey);
  }

  @Override
  public Map<String, Object> contextData() {
    return Collections.unmodifiableMap(contextData);
  }
}
