package io.mateu.dtos;

public record OnCustomEventTriggerDto(String actionId, String eventName, String condition)
    implements TriggerDto {}
