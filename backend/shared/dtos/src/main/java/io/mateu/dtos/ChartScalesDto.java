package io.mateu.dtos;

import lombok.Builder;

@Builder
public record ChartScalesDto(ChartAxisScaleDto y, ChartAxisScaleDto z) {}
