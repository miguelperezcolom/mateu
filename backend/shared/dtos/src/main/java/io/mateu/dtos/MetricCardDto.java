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
    String actionId,
    /** The period the value covers ("Last 7 days"), shown under the value; optional. */
    String timeframe)
    implements ComponentMetadataDto {}
