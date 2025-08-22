package io.mateu.dtos;

public record OnSuccessTriggerDto(String actionId, String calledActionId, String condition)
    implements TriggerDto {}
