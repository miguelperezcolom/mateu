package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnSuccessTriggerDto(String actionId, String calledActionId, String condition)
    implements TriggerDto {}
