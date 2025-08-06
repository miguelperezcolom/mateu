package io.mateu.dtos;

import lombok.Builder;

/** Card metadata */
@Builder
public record ChartDto(ChartTypeDto chartType, ChartDataDto chartData, ChartOptionsDto chartOptions)
    implements ComponentMetadataDto {}
