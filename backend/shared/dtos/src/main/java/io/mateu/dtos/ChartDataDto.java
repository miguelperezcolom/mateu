package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record ChartDataDto(List<String> labels, List<ChartDatasetDto> datasets) {}
