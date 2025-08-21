package io.mateu.dtos;

/** A button */
public record OnEnterTriggerDto(String actionId, String condition) implements TriggerDto {}
