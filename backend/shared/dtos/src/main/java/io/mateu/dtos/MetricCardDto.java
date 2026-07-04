package io.mateu.dtos;

import lombok.Builder;

/** KPI tile metadata for dashboards */
@Builder
public record MetricCardDto(
    String title,
    String value,
    String unit,
    MetricTrendDto trend,
    String trendLabel,
    String icon,
    String description,
    String actionId)
    implements ComponentMetadataDto {}
