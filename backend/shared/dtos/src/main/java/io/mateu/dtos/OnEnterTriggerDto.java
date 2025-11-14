package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnEnterTriggerDto(String actionId, String condition) implements TriggerDto {}
