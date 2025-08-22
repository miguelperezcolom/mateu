package io.mateu.dtos;

public record OnValueChangeTriggerDto(String actionId, String propertyName, String condition)
    implements TriggerDto {}
