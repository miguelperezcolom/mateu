package io.mateu.dtos;

import lombok.Builder;

@Builder
public record FunnelStageDto(String label, double value, String color) {}
