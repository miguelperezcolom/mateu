package io.mateu.dtos;

import lombok.Builder;

@Builder
public record OnLoadTriggerDto(String actionId, int timeoutMillis, int times, String condition)
    implements TriggerDto {}
