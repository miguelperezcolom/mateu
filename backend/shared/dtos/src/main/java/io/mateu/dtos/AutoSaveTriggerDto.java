package io.mateu.dtos;

import lombok.Builder;

@Builder
public record AutoSaveTriggerDto(String actionId, int debounceMillis) implements TriggerDto {}
