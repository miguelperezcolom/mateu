package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnSuccessTriggerDto(
    String actionId, String calledActionId, String condition, int timeoutMillis, boolean background)
    implements TriggerDto {

  public OnSuccessTriggerDto(
      String actionId, String calledActionId, String condition, int timeoutMillis) {
    this(actionId, calledActionId, condition, timeoutMillis, false);
  }
}
