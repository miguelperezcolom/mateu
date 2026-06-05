package io.mateu.dtos;

import lombok.Builder;

@Builder
public record CustomEventDto(String eventName, Object detail) {}
