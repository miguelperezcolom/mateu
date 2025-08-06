package io.mateu.dtos;

import lombok.Builder;

@Builder
public record ChartOptionsDto(boolean maintainAspectRatio, ChartScalesDto scales) {}
