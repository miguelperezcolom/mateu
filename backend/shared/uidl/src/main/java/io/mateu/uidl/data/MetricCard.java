package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A KPI tile for dashboards: a title, a prominent value, an optional trend indicator and an
 * optional drill-in action. Use inside a {@link Scoreboard} or a {@link DashboardLayout}.
 */
@Builder
public record MetricCard(
    String id,
    String title,
    String value,
    String unit,
    MetricTrend trend,
    String trendLabel,
    String icon,
    String description,
    String actionId,
    String style,
    String cssClasses)
    implements Component {}
