package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnCustomEventTriggerDto(String actionId, String eventName, String condition)
    implements TriggerDto {}
