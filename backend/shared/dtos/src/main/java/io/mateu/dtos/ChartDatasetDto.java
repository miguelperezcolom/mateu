package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record ChartDatasetDto(String label, List<Double> data) {}
