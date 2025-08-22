package io.mateu.dtos;

public record OnErrorTriggerDto(String actionId, String calledActionId, String condition)
    implements TriggerDto {}
