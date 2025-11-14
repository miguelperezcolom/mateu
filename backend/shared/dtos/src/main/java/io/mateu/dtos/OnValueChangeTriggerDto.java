package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnValueChangeTriggerDto(String actionId, String propertyName, String condition)
    implements TriggerDto {}
