package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnErrorTriggerDto(String actionId, String calledActionId, String condition)
    implements TriggerDto {}
