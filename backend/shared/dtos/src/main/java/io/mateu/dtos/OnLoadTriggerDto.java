package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnLoadTriggerDto(
    String actionId, int timeoutMillis, int times, String condition, boolean background)
    implements TriggerDto {

  public OnLoadTriggerDto(String actionId, int timeoutMillis, int times, String condition) {
    this(actionId, timeoutMillis, times, condition, false);
  }
}
